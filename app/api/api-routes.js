// V1 API
// documentation created with apiDoc:
// apidoc -i ./app/api -o ./public/apidocs

module.exports = function(app) {
   /**
    * @api {get} /aura/:apikey/:id Aura information
    * @apiSampleRequest https://wago.io/api/v1/aura
    * @apiName Aura Information
    * @apiGroup Lookups
    * @apiVersion 1.0.0
    * @apiDescription Retrieves information for an aura given an ID.
    *
    * @apiParam {String} apikey Your API key.
    * @apiParam {String} id Aura's ID.
    *
    * @apiSuccess {String} auraID Aura's ID.
    * @apiSuccess {String} name Name of aura.
    * @apiSuccess {String} description Description of aura.
    * @apiSuccess {Boolean} hidden True if this aura is hidden by the creator; not searchable. Note that private auras are not acessible through the API.
    * @apiSuccess {Array} categories Array of category IDs this aura belongs to. See /data/categories.
    * @apiSuccess {String} user Username of aura creator; blank if imported as guest.
    * @apiSuccess {Number} stars Number of users that have starred this aura.
    * @apiSuccess {Date} lastUpdate Date of last modification to aura code.
    * @apiSuccess {String} importString encoded import/export string.
    * @apiSuccess {String} lua Lua table of the aura.
    * @apiSuccess {String} data JSON representation of the lua table.
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *      "id": "Ey33GEoNZ",
    *      "name": "API Example",
    *      "description": "This is a model type aura.",
    *      "hidden": true,
    *      "categories": [
    *        "gen3"
    *      ],
    *      "user": "Ora",
    *      "stars": 12,
    *      "lastUpdate": "2016-06-16T06:13:47.192Z",
    *      "importString": "dSIUbaqlK [truncated...]",
    *      "lua": "lua_table = {\n   [\"m\"] = \"d\";\n [truncated...] "
    *      "data": { "m": "d", "d": "[truncated...]" }
    *     }
    *
    * @apiError NoAuraFound No aura found.
    * @apiError NoAuth Invalid API Key provided.
    *
    */
    app.get('/api/v1/aura/:apikey?/:auraID?', is_apikey_valid, function(req, res) {
        var apikey = req.params.apikey || req.query.apikey
        var auraID = req.params.auraID || req.query.id
        var Aura = require('../models/wagoitem')
        Aura.findOne({ '_id' :  auraID, 'private': false, type:'WEAKAURAS2' }, function(err, aura) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no aura is found, return the message
            if (!aura || aura==null) {
                res.status(404)
                res.send({ error: "NoAuraFound", description: "No aura found." });
                return
            }
            else {
                var output = {id: aura._id, name: aura.name, description: aura.description, hidden: aura.hidden,
                              categories: null, user:null, stars:0, lastUpdate: null, importString: "", lua: "", data: {}  }
                var async = require('async')

                async.parallel([
                    // find user/creator
                    function(cb) {
                        var User = require('../models/user')
                        User.findById(aura._userId, function(err, user) {
                            if (!err && user)
                                output.user = user.account.username
                            cb()
                        })
                    },
                    // find date of latest version
                    function(cb) {
                        var AuraCode = require('../models/aura-code')
                        AuraCode.find({'auraID': aura._id}).sort("-updated").limit(1).exec(function(err, ver) {
                            if (!err && ver) {
                                output.lastUpdate = ver[0].updated
                                output.importString = ver[0].encoded.replace(/\s/g,'')
                                output.data = JSON.parse(ver[0].json)
                                require('child_process').exec('luajit ./wa2table.lua "'+ver[0].encoded+'"', {cwd: '/home/mark/wago.io/lua'}, function(err, lua) {
                                    output.lua = lua
                                    cb()
                                })
                            }
                            else {
                                cb()
                            }
                        })
                    },
                    // find other categories this belongs to
                    function(cb) {
                        var categories = require('../models/categories')
                        output.categories = []
                        for(k=0;k<categories.length;k++) {
                            for(j=0;j<aura.categories.length;j++) {
                                if (aura.categories[j]==categories[k].id)
                                    output.categories.push(categories[k].id)
                            }
                        }
                        cb()

                }], function() { // parallel callback
                    res.setHeader('Content-Type', 'application/json')
                    res.send(output)
                })
            }
        })
    })

    /**
    * @api {get} /user/:apikey/:username User information
    * @apiSampleRequest https://wago.io/api/v1/user
    * @apiName User Information
    * @apiGroup Lookups
    * @apiVersion 1.0.0
    * @apiDescription Retrieves information for a user given their username. Hidden and private auras not included.
    *
    * @apiParam {String} apikey Your API key.
    * @apiParam {String} username The user's name.
    *
    * @apiSuccess {String} name Name of user.

    * @apiSuccess {Object[]} auras Array of auras belonging to this user.
    * @apiSuccess {String} auras.id ID of the aura.
    * @apiSuccess {String} auras.name Name of the aura.
    * @apiSuccess {Date} auras.lastUpdate Date of last modification to aura code.
    *
    * @apiSuccessExample Success-Response:
    *     HTTP/1.1 200 OK
    *     {
    *      "user": "Ora",
    *      "auras": [{
    *          "id": "Ey33GEoNZ",
    *          "name": "API Example",
    *          "lastUpdate": "2016-06-16T06:13:47.192Z"
    *          }
    *       ]
    *     }
    *
    * @apiError NoUserFound No user found.
    * @apiError NoAuth Invalid API Key provided.
    *
    */
    app.get('/api/v1/user/:apikey?/:username?', is_apikey_valid, function(req, res) {
        var apikey = req.params.apikey || req.query.apikey
        var username = req.params.username || req.query.username

        var User = require('../models/user')
        User.findOne({'account.username': new RegExp('^'+username+'$', "i")}, function(err, lookup) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no aura is found, return the message
            if (!lookup || lookup==null) {
                res.status(404)
                res.send({ error: "NoUserFound", description: "No user found." });
                return
            }
            else {
                var output = {user: lookup.account.username, auras: [] }

                var Aura = require('../models/wagoitem')
                Aura.find({ '_userId': lookup._id, 'private': false, 'hidden': false }).exec(function(err, auras) {
                    var async = require('async')
                    var AuraCode = require('../models/aura-code')
                    async.forEachOf(auras, function (aura, async_key, cb) {
                        AuraCode.find({'auraID': aura._id}).sort("-modified").limit(1).exec(function(err, ver) {
                            output.auras.push({ id: aura._id, name: aura.name, lastUpdate: ver[0].updated })
                            cb()
                        })
                    }, function() {
                        res.setHeader('Content-Type', 'application/json')
                        res.send(output)
                    })
                })
            }
        })
    })



    app.post('/api/v1/import', is_apikey_valid, function(req, res) {
        var apikey = req.body.apikey
        var input = req.body.importString.trim()
        var Snippet = input.match(/\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table|SetAttribute|SetAllPoints|CreateFrame|unit|player|target)\b/g)

        // if pastebin link is imported
        if ((m = /http[s]?:\/\/pastebin.com\/([\w]+)/.exec(input)) !== null) {
            var request = require('request')
            request.get('http://pastebin.com/raw/'+m[1], function(error, response, content) {
                if (!error && response.statusCode == 200) {
                    importWago = {string: content.replace(/[\s]/g, '')}
                    if (/[^a-zA-Z0-9\(\)]/.exec(importWago.string)) {  // if not weakaura encoding
                        if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui encoding
                            res.send({error: 'InvalidImport'})
                            return
                        }

                        // elvui string detected
                        importWago.type = 'ELVUI'
                        return require('../wago_lib').processImport(req, res, importWago, 'APICREATE')
                    }

                    // weakaura string detected
                    importWago.type = 'WEAKAURAS2'
                    return require('../wago_lib').processImport(req, res, importWago, 'APICREATE')
                }
                else {
                    res.send({error: 'InvalidImport'})
                    res.end()
                }
            })
        }

        else {
            var importWago = {string: input}
            if (/[^a-zA-Z0-9\(\)]/.exec(importWago.string)) {  // if not weakaura encoding
                if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui encoding
                    res.send({error: 'InvalidImport'})
                    return
                }

                // elvui string detected
                importWago.type = 'ELVUI'
                return require('../wago_lib').processImport(req, res, importWago, 'APICREATE')
            }

            // weakaura string detected
            importWago.type = 'WEAKAURAS2'
            return require('../wago_lib').processImport(req, res, importWago, 'APICREATE')
        }
    })


    /**
    * @api {get} /data/categories/:apikey Categories
    * @apiSampleRequest https://wago.io/api/v1/data/categories
    * @apiName Categories
    * @apiGroup Data
    * @apiVersion 1.0.0
    * @apiDescription Retrieves data on categories used by WAGO.
    *
    * @apiParam {String} apikey Your API key.
    *
    * @apiSuccess {String} id Unique ID for the category.
    * @apiSuccess {String} name Name of the category.
    * @apiSuccess {String} url path of the category on WAGO.
    *
    * @apiError NoAuth Invalid API Key provided.
    */
    app.get('/api/v1/data/categories/:apikey?', is_apikey_valid, function(req, res) {
        var apikey = req.params.apikey || req.query.apikey
        var categories = require('../models/categories')
        var async = require('async')
        var output = []
        for(k=0;k<categories.length;k++) {
            if (categories[k].parent)
                output.push({id: categories[k].id, name: categories[k].text, url: '/categories/'+categories[k].slug})
        }

        res.setHeader('Content-Type', 'application/json')
        res.send(JSON.stringify(output))
    })
}


// route middleware to make sure a user is logged in
function is_apikey_valid(req, res, next) {
    var apikey = req.params.apikey || req.query.apikey || req.body.apikey
    apikey = apikey.split('-')
    var userID = apikey.shift()
    apikey = apikey.join('-')

    var User = require('../models/user')

    // look for key
    User.findOneAndUpdate({"_id": userID, "api.public_key": apikey}, { $inc: { 'api.requests': 1 } }, function(err, user) {
        // if key is valid and user is found, carry on
        if (user) {
            req.user = user
            return next();
        }

        // if they aren't redirect them to the login page
        res.status(403)
        res.setHeader('Content-Type', 'application/json')
        res.send('{"error":"NoAuth", "description": "Invalid API Key provided"}')

    })
}