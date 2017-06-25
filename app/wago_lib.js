wagofn = {
    // collect user and global variables
    collectVars: function(req, res, next) {
        var async = require('async');
        var fs = require('fs');

        res.locals.user = req.user;

        async.parallel([
            function(cb) {  // find unread comments
                res.locals.unreadComments = []
                res.locals.unreadCommentCount = 0
                if (req.user) {
                    var Comment = require('./models/comment');
                    Comment.find({usersTagged: {$elemMatch: {userID: req.user._id}}}).exec(function(err, comments) {
                        res.locals.mentions = comments
                        async.forEachOf(comments, function(comment, key, cb2) {
                            for (i=0; i<comment.usersTagged.length; i++) {
                                if (req.user._id==comment.usersTagged[i].userID && !comment.usersTagged[i].read) {
                                    //res.locals.unreadComments.push(comment)
                                    res.locals.unreadComments++
                                }
                            }
                            cb2()

                        }, function() { // foreachof callback
                            cb()
                        })
                    })
                }
                else cb()
            },
            function(cb) { // find user collections
                if (req.user) {
                    var Collection = require('./models/wagoitem');
                    Collection.find({'_userId': req.user._id, type: "COLLECTION"}).exec(function(err, collections) {
                        req.user.collections = collections
                        cb()
                    })
                }
                else cb()
            },
            function(cb) { // setup helpers
                res.locals.body = {id: "", theme: ""}

                if (req.user && req.user.config && req.user.config.theme)
                    res.locals.body.theme = req.user.config.theme

                if (req.user && req.user.account && !req.user.account.username)
                    req.user.account.username = ""

                res.locals.site = {title: "Wago.io", description: "Database of WeakAuras"}
                res.locals.pageinfo = res.locals.site
                res.locals.pageinfo.image = "https://wago.io/assets/img/logo/logo-card.png"
                res.locals.pageinfo.type  = 'website'

                if (req.url=="/") {
                    res.locals.pageinfo.url  = 'https://wago.io/'
                }
                else {
                    res.locals.pageinfo.url = 'https://wago.io'+req.url
                }

                // bb code parser
                res.locals.xbb = require('./xbbcode')

                res.locals.aura = {}
                res.locals.cache = {}
                var md5File = require('md5-file')

                async.parallel([
                    function(parallel_cb) {
                        res.locals["static"] = require('./static_vars');
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        try {
                            res.locals.category_menu = JSON.parse(fs.readFileSync('./static/categories.json', 'utf8'));
                        }
                        catch(e) {
                            res.locals.category_menu = JSON.parse(fs.readFileSync('./static/categories-previous.json', 'utf8'));
                        }
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        try {
                            res.locals.WagoOfTheMoment = JSON.parse(fs.readFileSync('./static/WagoOfTheMoment.json', 'utf8'));
                        }
                        catch(e) {
                            res.locals.WagoOfTheMoment = JSON.parse(fs.readFileSync('./static/WagoOfTheMoment-previous.json', 'utf8'));
                        }
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.cache.js = md5File.sync('./public/wago.js')
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.cache.css = md5File.sync('./public/wago.css')
                        parallel_cb()
                    },
                    function(parallel_cb) {
                        res.locals.cache.wa_lua = md5File.sync('./public/lua/WeakAurasWago.lua')
                        parallel_cb()
                    }
                ],

                // parallel_cb()
                function(err) {
                    cb()
                })

            }

        ], function() {
            next()
        })
    },

    SendWagoBotMessage: function(discordUserID, message) {
        var request = require('request')
        console.error('sending message to bot...', discordUserID, message)
        request.post('http://localhost:3001/sendtext').form({profileID: discordUserID, message: message})
    },

    SendWagoBotMessageFromUserId: function(userId, msgOption, message) {
        var request = require('request')
        var User = require('./models/user')
        User.findById(userId, function(err, user) {
            if (user && user.discord.id && user.discord.options[msgOption]) {
                console.error('sending message to bot...', user.discord.id, message)
                request.post('http://localhost:3001/sendtext').form({profileID: user.discord.id, message: message})
            }
        })
    },

    processImport: function(req, res, importWago, action, auraID) {
        var async = require('async')

        if (importWago.string && importWago.string.length>112000 && !importWago.file) {
            console.log('making import file')
            var fs = require('fs')
            var file = "/tmp/wagoimport_"+Date.now()
            fs.writeFile(file, importWago.string.trim(), function(err) {
                if(err) {
                    req.flash('indexMsg', "Could not save file.")
                    res.redirect('/')
                }
                importWago.file = file

                return require('./wago_lib').processImport(req, res, importWago, action, auraID)
            })
        }
        else {
            var luafile, importString
            if (importWago.type=='WEAKAURAS2')
                luafile = './wa2json.lua'
            else if (importWago.type=='ELVUI' || importWago.type=='ELVUI_OR_VUHDO')
                luafile = './elv2json.lua'
            else if (importWago.type=='VUHDO')
                luafile = './vuhdo2json.lua'
            else if (importWago.type=='WeakAuras.lua')
                luafile = './table2json.lua'
            else {
                console.error("INVALID IMPORT UNKNOWN ENCODING TYPE", importWago)
                req.flash('indexMsg', "Invalid string entered.")
                res.redirect('/')
            }

            if (importWago.file) {
                importString = importWago.file
            }
            else {
                importString = importWago.string.trim()
            }

            require('child_process').exec('luajit '+luafile+' "'+importString+'"', {cwd: __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, strJSON) {
                strJSON = strJSON.replace(/(^"|"$)/g, '')

                if (err) {
                    console.error("INVALID IMPORT STRING1", err)
                    req.flash('indexMsg', "Invalid string entered.")
                    res.redirect('/')
                }
                else {
                    if (strJSON=='' || strJSON.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || strJSON.indexOf("Unknown compression method")>-1) {
                        console.error("INVALID IMPORT STRING2", 'luajit '+luafile+' "'+importString+'"', strJSON)
                        req.flash('indexMsg', "Invalid string entered.")
                        res.redirect('/')
                    }
                    else {
                        // parse json
                        try {
                            objWago = JSON.parse(strJSON)
                        }
                        catch(e) {
                            if (importWago.type=='ELVUI_OR_VUHDO') {
                                // not ElvUI, try Vuhdo
                                importWago.type = 'VUHDO'
                                return require('./wago_lib').processImport(req, res, importWago, action, auraID)
                            }
                            var error = strJSON.replace(/(\.\/[^:]+):/, '')
                            console.error("INVALID IMPORT STRING3", e, error, strJSON)
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        }

                        var _AuraCode = require('./models/aura-code');
                        var _WagoItem = require('./models/wagoitem');

                        // stuff going into database
                        var AuraCode = new _AuraCode();
                        AuraCode.encoded = importWago.string
                        AuraCode.json = strJSON

                        if ((action=='SAVE' || action=='REPLACE') && auraID) {
                            AuraCode.auraID = auraID
                            AuraCode.save(function(err, aura) {
                                if (err)
                                    throw err;

                                _WagoItem.findOneAndUpdate({ '_id': auraID }, { $set: {modified: Date.now(), "aura.code": AuraCode._id  }}, function(err, doc){
                                    WagoDiscord(req, res, action, doc)
                                    if(err){ console.log("Something wrong when updating data!", err) }
                                })
                                if (action=='SAVE') {
                                    res.setHeader('Content-Type', 'application/json')
                                    res.send('{"wago":"'+AuraCode.auraID+'"}')
                                }
                                else
                                    res.redirect('/'+AuraCode.auraID)
                            })
                        }
                        else if (action=='ADDURL' && auraID) {
                            _AuraCode.findOneAndUpdate({ 'auraID': auraID}, { $set: {json: strJSON, encoded: importWago.string  } }, { sort: { updated: -1 }}, function(err, doc) {
                                if (err)
                                    throw err;

                                res.redirect('/'+auraID)
                            })
                        }
                        else {
                            // verify data type
                            if (importWago.type=='WEAKAURAS2' && !objWago.v) {
                                console.error("INVALID WEAKAURAS2 IMPORT", objWago)
                                req.flash('indexMsg', "Invalid string entered.")
                                res.redirect('/')
                                return
                            }

                            var Wago = new _WagoItem();
                            Wago.aura.code = AuraCode._id

                            if (importWago.type=="ELVUI_OR_VUHDO") {
                                importWago.type = 'ELVUI'
                            }

                            if (importWago.type=='WEAKAURAS2') {
                                Wago.name = objWago.d.id.trim()

                                if (!Wago.categories.length) {
                                    var autocats = require('./auto-categories')(objWago.d.load)
                                    if (autocats.length>0) {
                                        Wago.categories_auto = true
                                        Wago.categories = autocats
                                    }
                                }
                            }
                            else if (importWago.type=='VUHDO') {
                                if (objWago.bouquetName) {
                                    Wago.name = objWago.bouquetName
                                    Wago.categories = ["vuhdo2"]
                                }
                                else if (objWago.keyLayout) {
                                    Wago.name = "Vuhdo Key Layout Import"
                                    Wago.categories = ["vuhdo3"]
                                }
                                else {
                                    Wago.name = "Vuhdo Profile Import"
                                    Wago.categories = ["vuhdo1"]
                                }
                            }
                            else if (importWago.type=='WeakAuras.lua') {
                                Wago.name = "WeakAuras.lua SavedVariables file"
                                // hack to make "displays" the first object property
                                luaObj = {}
                                luaObj.displays = objWago.displays
                                delete objWago.displays
                                for (var key in objWago) {
                                    if (objWago.hasOwnProperty(key)) {
                                        luaObj[key] = objWago[key]
                                    }
                                }
                                AuraCode.json = JSON.stringify(luaObj)
                            }
                            else
                                Wago.name = "ElvUI Import"

                            Wago.type = importWago.type
                            if (req.body.auravisibility=="Hidden")
                                Wago.hidden = true
                            else
                                Wago.hidden = false

                            if (req.user) {
                                Wago._userId = req.user._id
                                if (req.body.auravisibility=="Private")
                                    Wago.private = true

                                if (req.body.anon=="Anonymous guest") {
                                    Wago.private = false
                                    Wago.hidden = false
                                    Wago._userId = null
                                }
                            }

                            if (req.body.beta!="Live" && require('./static_vars').beta_option) {
                                Wago.aura.wow_beta = true
                                Wago.categories = [require('./static_vars').beta_option.key]
                            }
                            else
                                Wago.aura.wow_beta = false

                            if (action=='CLONE' && auraID)
                                Wago.clone_of = auraID

                            if (req.body.expires && req.body.expires!="never") {
                                var expires = new Date()
                                switch (req.body.expires) {
                                    case '15 minutes':
                                        expires.setTime(expires.getTime()+15*60*1000)
                                        break
                                    case '3 hours':
                                        expires.setTime(expires.getTime()+3*60*60*1000)
                                        break
                                    case '1 week':
                                        expires.setTime(expires.getTime()+7*24*60*60*1000)
                                        break
                                    case '1 month':
                                        expires.setTime(expires.getTime()+30*24*60*60*1000)
                                        break
                                    case '3 months':
                                        expires.setTime(expires.getTime()+6*30*24*60*60*1000)
                                        break
                                    default:
                                        expires = null
                                }
                                console.error('expires', req.body.expires, expires)
                                Wago.expires_at = expires
                            }

                            Wago.save(function(err) {
                                console.log('wago saved', Wago._id)
                                if (err)
                                    throw err;
                                AuraCode.auraID = Wago._id
                                AuraCode.save(function(err, aura) {
                                    if (err)
                                        throw err;

                                    WagoDiscord(req, res, action, Wago)
                                    if (action=='CLONE' || action=='APICREATE') {
                                        res.setHeader('Content-Type', 'application/json')
                                        res.send('{"wago":"'+AuraCode.auraID+'"}')
                                    }

                                    else if (importWago.type=='WEAKAURAS2' && action=='CREATE' && objWago.s && objWago.s!='@project-version@' && req.user && req.user.access.beta) {
                                        // check version
                                        var addons = require('./models/addon-release')
                                        var VersionCompare = require('compare-versions')
                                        addons.find({addon:"WeakAuras-2", active: true}).sort({"date":-1}).exec(function(err, WA) {
                                            var status = {}
                                            // make semver friendly version numbers (some versions have 4 patch versions (2.3.0.0) which semver doesn't like)
                                            // replace first two .s with @@, then replace all remaining . with -, then replace @@ back to .
                                            userVersion = objWago.s.replace(/\./, '@@').replace(/\./, '@@').replace(/\./g, '-').replace(/@@/g, '.')
                                            for (var i=0; i<WA.length; i++) {
                                                thisVersion = (WA[i].gameVersion || WA[i].version).replace(/\./, '@@').replace(/\./, '@@').replace(/\./g, '-').replace(/@@/g, '.')

                                                try {
                                                    // newer version of main release trumps all other version checks
                                                    if (WA[i].phase=='Release' && VersionCompare(userVersion, thisVersion)<0) {
                                                        req.flash('versionMsg', '<strong>Attention!</strong> Your import was from addon version <em>'+objWago.s+'</em> but a newer release, version <em>'+(WA[i].gameVersion || WA[i].version)+'</em> is available.<br><a href="'+WA[i].url+'">Click to download the latest release.</a>')
                                                        res.redirect('/'+AuraCode.auraID)
                                                        return
                                                    }

                                                    // if users version is greater than current main release (then they are using alpha)
                                                    else if (WA[i].phase=='Release' && VersionCompare(userVersion, thisVersion)>=0) {
                                                        status.using_alpha = true
                                                    }

                                                    // if users version is older than current alpha release
                                                    else if (WA[i].phase!='Release' && VersionCompare(userVersion, thisVersion)<0) {
                                                        status.newer_alpha = WA[i].gameVersion || WA[i].version
                                                        status.newer_alpha_url = WA[i].url
                                                    }
                                                }
                                                catch(e) { console.error('version check error', userVersion, thisVersion) }
                                            }

                                            if (status.using_alpha && status.newer_alpha)
                                                req.flash('versionMsg', '<strong>Attention!</strong> Your import was from alpha version <em>'+objWago.s+'</em> but a newer alpha release, version <em>'+status.newer_alpha+'</em> is available.<br><a href="'+status.newer_alpha_url+'">Click to download the latest alpha.</a>')

                                            res.redirect('/'+AuraCode.auraID)
                                        })
                                    }

                                    else {
                                        res.redirect('/'+AuraCode.auraID)
                                    }
                                })
                            })
                        }
                    }
                }
            })
        }
    },

    checkCustomSlug: function(slug, callback) {
        var Wago = require('./models/wagoitem')
        slug = slug.replace(/[^a-zA-Z0-9_-]*/g, '')

        if (slug.length<7 || slug.length>64)
            return callback(false)
        else if (slug=="")
            return callback("CLEAR") // remove slug

        Wago.findOne({ "$or": [{'_id' :  slug}, {custom_slug: slug}]}, function(err, doc) {
            if (err || doc)
                return callback(false)  // error, do not change slug
            else
                return callback(slug)
        })
    },

    searchWago: function(req, res, callback) {
        var Categories = require('./models/categories')
        var Comments = require('./models/comment')
        var Screenshots = require('./models/aura-screenshot')
        var Wago = require('./models/wagoitem')
        var User = require('./models/user')

        var async = require('async')
        var moment = require("moment")

        var lookup = {}
        var results_per_page = 15

        var query = req.query.q || req.body.q || ""
        var sort = req.query.sort || req.body.sort || "-modified"
        var page = parseInt(req.query.page || req.body.page || 0)

        // return object
        var SEARCH = {}
        SEARCH.query = {}
        SEARCH.query.q = query
        SEARCH.query.sort = sort
        SEARCH.query.page = page

        if (req.user)
            lookup = { $or: [{ '_userId': req.user._id }, { 'private': false, 'hidden': false }] }
        else
            lookup = { 'private': false, 'hidden': false }

        async.series([
            // user search
            function(cb) {
                const regex = /\buser:\s*([\w\-]+)/g
                var userSearch = query.match(regex)
                if (!userSearch || userSearch.length==0) return cb()

                var User = require('./models/user')
                async.each(userSearch, function(userQuery, cb2) {
                    var userMatch
                    if ((userMatch = regex.exec(userSearch)) !== null) {
                        query = query.replace(userMatch[0], '')
                        User.findOne({ "search.username": userMatch[1].toLowerCase() }).exec(function(err, user) {
                            if (user && lookup._userId) {
                                lookup._userId["$in"].push(user._id)
                            }
                            else if (user) {
                                lookup._userId = {"$in": [user._id]}
                            }

                            return cb2()
                        })
                    }
                    else {
                        return cb2()
                    }
                }, function() {
                    cb()
                })
            },

            // user search in quotes
            function(cb) {
                const regex = /\buser:\s*"([^"]+)"\s?/g
                var userSearch = query.match(regex)
                if (!userSearch || userSearch.length==0) return cb()

                var User = require('./models/user')
                async.each(userSearch, function(userQuery, cb2) {
                    var userMatch
                    if ((userMatch = regex.exec(userSearch)) !== null) {
                        query = query.replace(userMatch[0], '')
                        User.findOne({ "search.username": userMatch[1].toLowerCase() }).exec(function(err, user) {
                            if (user && lookup._userId) {
                                lookup._userId["$in"].push(user._id)
                            }
                            else if (user) {
                                lookup._userId = {"$in": [user._id]}
                            }

                            return cb2()
                        })
                    }
                    else {
                        return cb2()
                    }
                }, function() {
                    cb()
                })
            },

            // anonymous imports
            function(cb) {
                if (lookup._userId) return cb()

                const regex = /\banon:\s*(1|0|true|false)\b/g
                var anonSearch
                if ((anonSearch = regex.exec(query)) !== null) {
                    query = query.replace(anonSearch[0], '')
                    if (anonSearch[1]=='1' || anonSearch[1]=='true') {
                        // do not exclude anonymous
                    }
                    else {
                        lookup._userId = { "$exists": true }
                    }

                    return cb()
                }
                else {
                    lookup._userId = { "$exists": true }
                    return cb()
                }
            },

            // class search
            /*function(cb) {
                const regex = /\bclass:\s*([\w\-]+)/g
                var userSearch
                if ((userSearch = regex.exec(query)) !== null) {
                    query = query.replace(userSearch[0], '')
                    var User = require('./models/user')
                    User.findOne({ "search.username": userSearch[1].toLowerCase() }).exec(function(err, user) {
                        if (user)
                            lookup._userId = user._id

                        return cb()
                    })
                }
                else {
                    return cb()
                }
            }, */

            // any remaining text, run a standard text search
            function(cb) {
                // trim out excess spaces left from removing above search triggers
                query = query.replace(/\s{2,}/g, ' ').trim()
                // prevent regex attacks
                query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")

                if (query) {
                    lookup["$and"] = []

                    var queryArray = query.split(" ")

                    for (var i=0; i<queryArray.length; i++) {
                        var word = queryArray[i]
                        if (!word) continue

                        // create regex
                        var wordRegex = new RegExp('\\b'+word+'\\b', 'i')
                        // setup $or array
                        var textSearch = []
                        textSearch.push({"name": wordRegex})
                        textSearch.push({"description": wordRegex})
                        lookup["$and"].push({"$or": textSearch})
                        // results in { "$and": [ { "$or": [ {"name": "word"}, {"description": "word"} ] } ] }
                    }
                }

                return cb()
            },

            // find total wago's with this query
            function(cb) {
                if (req.query.fetch=='more') return cb()

                Wago.count(lookup).exec(function(err, count) {
                    SEARCH.total = count
                    return cb()
                })
            }],
            // finished processing query, send lookup to mongo and then return results to callback
            function(err) {
                if (err) return callback({"error": err})

                Wago.find(lookup).sort(sort).skip(results_per_page*page).limit(results_per_page).exec(function(err, results) {
                    if (!results)
                        return callback([])

                    async.forEachOf(results, function (wago, async_key, cb) {
                        async.parallel([
                            // count comments
                            function(parallel_cb) {
                                Comments.count({wagoID: results[async_key]._id}, function(err, count) {
                                    results[async_key].commentCount = count
                                    parallel_cb()
                                })
                            },

                            // get screenshot
                            function(parallel_cb) {
                                Screenshots.findOne({auraID: results[async_key]._id}, function(err, screen) {
                                    if (err || !screen) return parallel_cb()

                                    results[async_key].thumb = screen.url.thumbnail
                                    parallel_cb()
                                })
                            },

                            // get username
                            function(parallel_cb) {
                                // set defaults
                                results[async_key].username = "a Guest"
                                results[async_key].userlink  = false
                                results[async_key].userclass = ""

                                if (!results[async_key]._userId) return parallel_cb()

                                User.findById(results[async_key]._userId, function(err, user) {
                                    if (err || !user) return parallel_cb()

                                    results[async_key].username = user.account.username
                                    results[async_key].userlink = !user.account.hidden
                                    results[async_key].userclass = user.roleclass
                                    return parallel_cb()
                                })
                            },

                            // data processing
                            function(parallel_cb) {
                                // format date
                                var ddate = moment(results[async_key].modified || results[async_key].created)
                                results[async_key].ddate = results[async_key].modified
                                results[async_key].date = ddate.format("MMM Do YYYY")

                                // get categories
                                if (results[async_key].categories) {
                                    var parseCategories = results[async_key].categories
                                    results[async_key].categories = {}
                                    for(k=0;k<Categories.length;k++) {
                                        for(j=0;j<parseCategories.length;j++) {
                                            if (parseCategories[j]==Categories[k].id) {
                                                results[async_key].categories[Categories[k].id] = Categories[k]
                                                if (Categories[k].parent)
                                                    delete results[async_key].categories[Categories[k].parent]
                                            }
                                        }
                                    }
                                }

                                // relationship of this wago to logged in user
                                if (req.user && results[async_key].type!='USER') {
                                    // favorite
                                    for (var i=0; i<wago.popularity.favorites.length; i++) {
                                        if (results[async_key].popularity.favorites[i].equals(req.user._id)) {
                                            results[async_key].myfave = true
                                            break
                                        }
                                    }

                                    // unread comments
                                    var unreadCount=0
                                    if (res.locals.unreadComments) {
                                        for (i=0; i<res.locals.unreadComments.length; i++) {
                                            if (res.locals.unreadComments[i].auraID==wago._id)
                                                unreadCount++
                                        }
                                    }
                                    results[async_key].unreadComments = unreadCount
                                }

                                // description
                                if (results[async_key].description && results[async_key].description && results[async_key].description!="") {
                                    var xbb = require('./xbbcode')
                                    results[async_key].description = xbb.process({text: results[async_key].description}).html
                                }

                                // type-specific filters
                                if (results[async_key].type=='WEAKAURAS2' || results[async_key].type=='WEAKAURA2') {
                                    results[async_key].type = 'WEAKAURA';
                                }

                                return parallel_cb()
                            }
                        ],
                        function() {
                            cb()
                        })
                    },
                    function() {
                        SEARCH.results = results
                        return callback(SEARCH)
                    }
                )
            })
        })
    }
}


module.exports = wagofn

function WagoDiscord(req, res, action, Wago) {
    if (!req.user) return false

    console.error('wago discord!!!!')

    var async = require('async')
    var discord_description = ''
    var discord_thumbnail = "https://wago.io/assets/favicon/favicon-96x96.png"

    async.series([
        function(done) {
            // prepare discord content
            if (action=='CREATE' || action=='CLONE' || action=='APICREATE') {
                discord_description = req.user.account.username+" has imported a new Wago!"
                return done()
            }
            else if (action=='REPLACE' || action=='SAVE') {
                discord_description = req.user.account.username+" has updated "+Wago.name
                var Screenshots = require('./models/aura-screenshot');
                Screenshots.find({'auraID': Wago._id}, function(err, screens) {
                    if (screens && screens[0] && screens[0].localFile && screens[0].localFile.indexOf('.gif')==-1) {
                        discord_thumbnail = "https://wago.io/screenshots/"+Wago._id.toString()+"/"+screens[0].localFile
        			}
                    return done()
                })
            }
            else {
                return done()
            }
        },

        // now that are content is prepared, lets send to whomever needs it
        function(done) {
            // check user's webhook
            if (req.user && req.user.access.beta && req.user.discord.webhooks.onCreate && !Wago.private && !Wago.hidden && discord_description) {
                console.error('sending webhook')
                var hookdata = { "embeds": [{
                                     "title": "New "+Wago.type+": "+Wago.name,
                                     "url": Wago.url,
                                     "description": discord_description,
                                     "type": "rich",
                                     "thumbnail": {"url": discord_thumbnail}
                                 }]
                               }
                var request = require('request')
                console.error('sending discord webhook', req.user.discord.webhooks.onCreate, hookdata)
                request({url: req.user.discord.webhooks.onCreate,
                         method: "POST",
                         json: hookdata}, function(e, r, b) {
                             console.error('return from discord webhook', 'discord error--------------',e, 'discord response------------------', r, 'discord body----------------',b)
                         })
            }

            // if we're updating a wago, check if any people that have starred it have discord setup to message them
            if ((action=='REPLACE' || action=='SAVE') && !Wago.private && Wago.popularity.favorites.length>0) {
                var User = require('./models/user');
                console.error(Wago.popularity.favorites)
                async.each(Wago.popularity.favorites, function(userID, callback) {
                    User.findById(userID, function(err, user) {
                        if (!user) return callback()
                        if (user && user.discord.options.messageOnFaveUpdate) {
                            console.error('sending discord DM '+user.account.username)
                            wagofn.SendWagoBotMessage(user.discord.id, discord_description+"\n"+Wago.url)
                        }
                        return callback()
                    })
                }, function() {
                    done()
                })
            }
        }]
    )
}