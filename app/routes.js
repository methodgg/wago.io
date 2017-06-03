// app/routes.js
module.exports = function(app) {
    app.use(require('./wago_lib').collectVars);

    var multer       = require('multer')
    var upload       = multer({ dest: '/tmp/' })

    app.get('/favicon.ico', function(req, res) {
        res.redirect('/assets/img/favicon.ico')
    })

    // =====================================
    // WEAKAURA DATA API ===================
    // =====================================
    app.get('/apidoc', function(req, res) {
        if (req.user && req.user.api.public_key=='') {
            var shortid = require('shortid')
            var User = require('./models/user')
            var generated = shortid.generate()+shortid.generate()
            req.user.api.public_key = generated

            User.findById(req.user._id, function(err, user) {
                user.api.public_key = generated
                user.save()
            })
        }
        res.render('apidoc.ejs');
    })
    require('./api/api-routes.js')(app)

    // Webhooks
    require('./routes-webhooks.js')(app);


    // =====================================
    // ACCOUNT PAGE =====================
    // =====================================
    app.get('/account', isLoggedIn, function(req, res) {
        if (req.user.api.public_key=='') {
            var shortid = require('shortid')
            var User = require('./models/user')
            var generated = shortid.generate()+shortid.generate()
            req.user.api.public_key = generated

            User.findById(req.user._id, function(err, user) {
                user.api.public_key = generated
                user.save()
            })
        }

        res.locals.body.id = "page-account"
        res.render('account.ejs', {
            profileMsg: req.flash('profileMsg'),
            accountMsg: req.flash('accountMsg'),
        });
    });

    app.get('/account/reset/:key', function(req, res) {
        var User = require('./models/user')
        if (req.params.key=="") res.end()
        User.findOne({"account.reset": req.params.key}, function(err, user) {
            if (user) {
                res.render('reset-password.ejs', {user: user, key: req.params.key, accountMsg: req.flash('accountMsg')})
            }
            else {
                res.redirect('/')
            }
        })
    })

    app.post('/account/reset/password', function(req, res) {
        var User = require('./models/user');
        if (req.body.password != req.body.password2) {
            req.flash('accountMsg', 'Passwords do not match. Please try again.');
            res.redirect('/account/reset/'+req.body.key)
            return
        }

        // minimum password length
        else if (req.body.password.length<6) {
            req.flash('accountMsg', 'Password is too short. Please use at least six characters.');
            res.redirect('/account/reset/'+req.body.key)
            return
        }

        User.findOne({"account.reset": req.body.key}, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account/reset/'+req.body.key)
                return
            }
            user.account.password = user.generateHash(req.body.password)
            user.account.reset = ""
            // save the user
            user.save(function(err) {
                if (err)
                    throw err;

                req.flash('indexMsg', 'Your password has been reset.');
                res.redirect('/')
            });
        })
    })

    app.post('/account/set/theme', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            // validate themes
            if (req.body.theme=='dark')
                user.config.theme = req.body.theme
            else
                user.config.theme = ''

            user.save(function(err) {
                if (err)
                    throw err;

                res.send({"success": true})
            });
        })
    })



    // =====================================
    // DEV TOOLS ===========================
    // =====================================
    /*app.get('/devtools/table2wa', function(req, res) {
        res.render('devtools/table2wa.ejs');
    });
    app.post('/devtools/table2wa', function(req, res) {
        table = req.body.table.trim()
        if (table.length>112000) {
            var fs = require('fs')
            var file = "/tmp/wagoexport_"+Date.now()
            fs.writeFile(file, table, function(err) {
                if(err) {
                    req.flash('indexMsg', "Could not save file.")
                    res.redirect('/')
                }
                require('child_process').exec('luajit ./table2wa.lua "'+file+'"'
                 , {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                    res.send(EncodedString)
                })
            })
        }
        else {
            require('child_process').exec('luajit ./table2wa.lua "'+table+'"'
             , {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                res.send(EncodedString)
            })
        }
    });  */


    // =====================================
    // LEGAL PAGES =========================
    // =====================================
    app.get('/terms-of-service', function(req, res) {
        res.render('legal_tos.ejs');
    });
    app.get('/privacy-policy', function(req, res) {
        res.render('legal_privacy.ejs');
    });


    // =====================================
    // DEV LOG =============================
    // =====================================
    app.get('/devlog*', function(req, res) {
        var path = req.url
        path = path.replace(/\./g, '').replace(/\/$/, '').replace(/^\/devlog/, '')+'/index.html'

        var fs = require('fs')
        fs.readFile(__dirname + '/../hexo/public'+path, function(err, blog) {
            blog = blog.toString().replace(/\/devlog\/devlog/g, "/devlog")
            var pageinfo = res.locals.pageinfo


            // get page title
            var titleMatch
            if ((titleMatch = /<h1 class="article-title" itemprop="name">\s*([^<]+)/.exec(blog)) !== null) {
                pageinfo.title = titleMatch[1].trim()
            }

            var descMatch
            if ((descMatch = /<div class="article-entry" itemprop="articleBody">\s*<p>\s*([^<]+)/.exec(blog)) !== null) {
                pageinfo.description = descMatch[1].trim().substring(0, 155)
            }

            var imgMatch
            if ((imgMatch = /<img src="([^"]+)/.exec(blog)) !== null) {
                pageinfo.image = imgMatch[1].trim()
                pageinfo.type = "article"
            }


            if (err) res.send(err)
            else res.render('devlog.ejs', { blogcontent: blog });
        })
    });
    app.get('/stats', function(req, res) {
        res.render('stats-view.ejs');
    });

    // =====================================
    // HOME PAGE ===========================
    // =====================================
    app.get('/', function(req, res) {
        var addons = require('./models/addon-release');

        var async = require('async')
        var fs = require('fs')
        var lists = {}

        lists.newest = JSON.parse(fs.readFileSync('./static/newest.json', 'utf8'));
        lists.updates = JSON.parse(fs.readFileSync('./static/updated.json', 'utf8'));
        lists.stars = JSON.parse(fs.readFileSync('./static/popular.json', 'utf8'));
        sitenews = fs.readFileSync('./hexo/public/index.html', 'utf8').replace("/devlog/devlog", "/devlog")

        res.locals.body.id = "page-index"
        var flashMsg = req.flash('indexMsg')[0]

        addons.find({active: true}).sort({addon:-1, phase: -1}).exec(function(err, addons) {
            res.render('index.ejs', { flashMsg: flashMsg, lists: lists, sitenews: sitenews, addons: addons, moment: require('moment') });
        })
    });

    app.get('/test', hasAlphaAccess, function(req, res) {
        var addons = require('./models/addon-release');

        var async = require('async')
        var fs = require('fs')
        var lists = {}

        lists.newest = JSON.parse(fs.readFileSync('./static/newest.json', 'utf8'));
        lists.updates = JSON.parse(fs.readFileSync('./static/updated.json', 'utf8'));
        lists.stars = JSON.parse(fs.readFileSync('./static/popular.json', 'utf8'));
        sitenews = fs.readFileSync('./hexo/public/index.html', 'utf8').replace("/devlog/devlog", "/devlog")

        res.locals.body.id = "page-index"
        var flashMsg = req.flash('indexMsg')[0]

        addons.find({active: true}).sort({addon:-1, phase: -1}).exec(function(err, addons) {
            res.render('test-search.ejs', { flashMsg: flashMsg, lists: lists, sitenews: sitenews, addons: addons, moment: require('moment') });
        })
    });

    // =====================================
    // CATEGORIES ==========================
    // =====================================
    app.get('/categories', function(req, res) {
        res.redirect('/')
    })

    app.get('/weakauras/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        if (selected_category=='all') {
            search_categories.push({'type': 'WEAKAURAS2'})
            var page_name = "All"
        }
        else {
            for (i=categories.length-1;i>=0;i--) {
                if (categories[i].slug.indexOf(selected_category)>-1) {
                    search_categories.push({'categories': categories[i].id})
                    var page_name = categories[i].text
                }
            }
        }

        var pageinfo = res.locals.pageinfo
        pageinfo.name = page_name
        pageinfo.searchtype = 'WeakAuras'

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        if (req.query.anon)
            pageinfo.anon = true
        else
            pageinfo.anon = false


        require("./search3")({type: 'WEAKAURAS2', 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page, sort: pageinfo.sort, anonymous: pageinfo.anon }, req, res, function(err, results) {
            if (results.total > 14)
                results.more = { lookup: "/weakauras/"+selected_category, page: 1, sort: pageinfo.sort.toLowerCase(), anonymous: pageinfo.anon }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { pageinfo: pageinfo, auralist: results });
        })
    })

    app.get('/elvui/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        if (selected_category=='all') {
            search_categories.push({'type': 'ELVUI'})
            var page_name = "All"
        }
        else {
            for (i=0;i<categories.length;i++) {
                if (categories[i].slug.indexOf(selected_category)>-1) {
                    search_categories.push({'categories': categories[i].id})
                    var page_name = categories[i].text
                }
            }
        }

        var pageinfo = res.locals.pageinfo
        pageinfo.name = page_name
        pageinfo.searchtype = 'ElvUI'

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        if (req.query.anon)
            pageinfo.anon = true
        else
            pageinfo.anon = false

        require("./search3")({type: 'ELVUI', 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page, sort: pageinfo.sort, anonymous: pageinfo.anon }, req, res, function(err, results) {
            if (results.total > 14)
                results.more = { lookup: "/elvui/"+selected_category, page: 1, sort: pageinfo.sort.toLowerCase(), anonymous: pageinfo.anon }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { pageinfo: pageinfo, auralist: results });
        })
    })

    app.get('/vuhdo/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        if (selected_category=='all') {
            search_categories.push({'type': 'VUHDO'})
            var page_name = "All"
        }
        else {
            for (i=0;i<categories.length;i++) {
                if (categories[i].slug.indexOf(selected_category)>-1) {
                    search_categories.push({'categories': categories[i].id})
                    var page_name = categories[i].text
                }
            }
        }

        var pageinfo = res.locals.pageinfo
        pageinfo.name = page_name
        pageinfo.searchtype = 'VUHDO'

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        if (req.query.anon)
            pageinfo.anon = true
        else
            pageinfo.anon = false

        require("./search3")({type: 'VUHDO', 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page, sort: pageinfo.sort }, req, res, function(err, results) {
            if (results.total > 14)
                results.more = { lookup: "/vuhdo/"+selected_category, page: 1, ort: pageinfo.sort.toLowerCase() }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { pageinfo: pageinfo, auralist: results });
        })
    })

    app.get('/collections/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        if (selected_category=='all') {
            search_categories.push({'type': 'COLLECTION'})
            var page_name = "All"
        }
        else {
            for (i=0;i<categories.length;i++) {
                if (categories[i].slug.indexOf(selected_category)>-1) {
                    search_categories.push({'categories': categories[i].id})
                    var page_name = categories[i].text
                }
            }
        }

        var pageinfo = res.locals.pageinfo
        pageinfo.name = page_name
        pageinfo.searchtype = 'Collection'

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        require("./search3")({type: 'COLLECTION', 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page, sort: pageinfo.sort }, req, res, function(err, results) {
            if (results.total > 14)
                results.more = { lookup: "/collections/"+selected_category, page: 1, ort: pageinfo.sort.toLowerCase() }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { pageinfo: pageinfo, auralist: results });
        })
    })

    app.get('/snippets/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        if (selected_category=='all') {
            search_categories.push({'type': 'SNIPPET'})
            var page_name = "All"
        }
        else {
            for (i=0;i<categories.length;i++) {
                if (categories[i].slug.indexOf(selected_category)>-1) {
                    search_categories.push({'categories': categories[i].id})
                    var page_name = categories[i].text
                }
            }
        }

        var pageinfo = res.locals.pageinfo
        pageinfo.name = page_name
        pageinfo.searchtype = 'Snippet'

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        require("./search3")({type: 'SNIPPET', 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page, sort: pageinfo.sort }, req, res, function(err, results) {
            if (results.total > 14)
                results.more = { lookup: "/collections/"+selected_category, page: 1, ort: pageinfo.sort.toLowerCase() }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { pageinfo: pageinfo, auralist: results });
        })
    })

    app.get('/categories/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        res.redirect('/weakauras/'+selected_category)
    })


    // =====================================
    // COLLECTIONS =============================
    // =====================================
    app.post('/collection/new', isLoggedIn, function(req, res) {
        var name = req.body.name.trim()
        var description = req.body.description
        var wagoID = req.body.wagoID

        var wago = require('./models/wagoitem')
        var Collection = new wago()

        Collection._userId = req.user._id
        Collection.name = name
        Collection.description = description
        Collection.type = "COLLECTION"
        Collection.collect.push(wagoID)
        Collection.collectHistory.push({action: 'add', wagoID: wagoID})

        if (req.user && req.user.account.default_aura_visibility=="Hidden")
            Collection.hidden = true
        else
            Collection.hidden = false

        if (req.user && req.user.account.default_aura_visibility=="Private")
            Collection.private = true
        else
            Collection.private = false



        Collection.save(function() {
            res.redirect('/'+Collection._id)
        })
    })

    app.post('/collection/add', isLoggedIn, function(req, res) {
        var collectionID = req.body.collectionID
        var wagoID = req.body.wagoID

        var Collection = require('./models/wagoitem')

        Collection.findById(collectionID, function(err, collection) {
            if (!req.user._id.equals(collection._userId)) {
                res.send('{"error":"NoAccess"}')
                return
            }

            collection.collect.pull(wagoID)
            collection.collect.push(wagoID)
            collection.modified = new Date
            collection.collectHistory.push({action: 'add', wagoID: wagoID})
            collection.save(function() {
                res.send('{"saved":1}')
            })
        })
    })

    app.post('/collection/remove', isLoggedIn, function(req, res) {
        var collectionID = req.body.collectionID
        var wagoID = req.body.wagoID

        var Collection = require('./models/wagoitem')

        Collection.findById(collectionID, function(err, collection) {
            if (!req.user._id.equals(collection._userId)) {
                res.send('{"error":"NoAccess"}')
                return
            }

            collection.collect.pull(wagoID)
            collection.modified = new Date
            collection.collectHistory.push({action: 'remove', wagoID: wagoID})
            collection.save(function() {
                res.send('{"saved":1}')
            })
        })
    })

    app.post('/collection/:collectionID/delete', isLoggedIn, function(req, res) {
        collectionID = req.params.collectionID
        var Collection = require('./models/wagoitem');
        Collection.findOne({ '_id' : collectionID, type: "COLLECTION" }, function(err, collect) {
            if (req.user && req.user._id.equals(collect._userId)) {
                Collection.remove( {"_id": collectionID }, function(err, collect) {
                    res.setHeader('Content-Type', 'application/json')
                    res.send('{"wago":true}')
                })
            }
        })
    })

    app.post('/collection/:collectionID/modify', isLoggedIn, function(req, res) {
        var collectionID = req.params.collectionID
        var Collection = require('./models/wagoitem')

        Collection.findById(collectionID, function(err, collection) {
            if (!req.user._id.equals(collection._userId)) {
                res.send('{"error":"NoAccess"}')
                return
            }

            collection.name = req.body.name.trim()
            collection.description = req.body.description
            if (req.body.collectionvisibility=='Hidden') {
                collection.hidden = true
                collection.private = false
            }
            else if (req.body.collectionvisibility=='Private') {
                collection.hidden = false
                collection.private = true
            }
            else {
                collection.hidden = false
                collection.private = false
            }

            collection.save(function() {
                res.redirect('/'+collectionID)
            })
        })
    })


    // =====================================
    // SEARCH ==============================
    // =====================================
    function advancedSearch(search, req, res) {
        if (!search || !search.q || search.q=="") {
            res.render('search.ejs', { options: {}, auralist: {count:0}, pageinfo: {title: 'Search', sort: 'Date' } });
            return
        }

        var searchString = search.q.trim().replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") // prevent regex attacks
        if (!search.searchPartials)
            searchString = "\\b"+searchString+"\\b"

        if (search.caseSensitive)
            var queryRegExp = new RegExp(searchString)
        else
            var queryRegExp = new RegExp(searchString, 'i')

        var queryFields = []
        if (search.searchName)
            queryFields.push({"name": queryRegExp})
        if (search.searchDesc)
            queryFields.push({"description": queryRegExp})
        if (search.searchTable)
            queryFields.push({"code.json": queryRegExp})
        else if (search.searchFunc) {
            var searchFuncString = '(custom[a-zA-Z]*|[a-zA-Z]*Func)":[\w]*"((\\"|[^"])*('+searchString+'))' // search json any values belonging to keys named custom* or *Func
            if (search.caseSensitive)
                var queryFuncRegExp = new RegExp(searchFuncString)
            else
                var queryFuncRegExp = new RegExp(searchFuncString, 'i')

            queryFields.push({"type": "WEAKAURAS2", "code.json": queryFuncRegExp})
        }

        var queryTypes = []
        if (search.searchWA2)
            queryTypes.push({"type": "WEAKAURAS2"})
        if (search.searchElv)
            queryTypes.push({"type": "ELVUI"})
        if (search.searchVuhdo)
            queryTypes.push({"type": "VUHDO"})
        if (search.searchCollections)
            queryTypes.push({"type": "COLLECTION"})
        if (search.searchSnippets)
            queryTypes.push({"type": "SNIPPET"})
        if (search.searchImages)
            queryTypes.push({"type": "IMAGE"})
        if (search.searchFonts)
            queryTypes.push({"type": "FONT"})
        if (search.searchAudio)
            queryTypes.push({"type": "AUDIO"})

        var queryCategories = []
        if (search.searchCategories && search.searchCategories.length>0) {
            for (var c=0; c<search.searchCategories.length; c++) {
                queryCategories.push({"categories": search.searchCategories[c] })
            }
        }

        var criteria = {}
        if (queryCategories.length>0 || queryTypes.length>0 || queryFields.length>0) {
            criteria["$and"] = []
            if (queryCategories.length>0)
                criteria["$and"].push({"$or": queryCategories})
            if (queryTypes.length>0)
                criteria["$and"].push({"$or": queryTypes})
            if (queryFields.length>0)
                criteria["$and"].push({"$or": queryFields})
        }

        if (req.query.anon) {
            criteria.anonymous = true
        }

        criteria.page = search.page || 0
        criteria.searchProperties = search

        if (req.query.sort=='stars') {
            criteria.sort='Stars'
        }
        else if (req.query.sort=='views') {
            criteria.sort='Views'
        }
        else if (req.query.sort=='comments') {
            criteria.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            criteria.sort='Comment Date'
        }
        else { // date
            criteria.sort='Date'
        }


        var pageinfo = res.locals.pageinfo
        pageinfo.title = 'Search'
        pageinfo.sort = criteria.sort
        pageinfo.anon = criteria.anonymous

        require("./search3")(criteria, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/search?q="+search.q, page: 1, sort: criteria.sort, anonymous: criteria.anonymous }

            if (search.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('search.ejs', { options: search, auralist: results, pageinfo: pageinfo });
        })
    }

    app.get('/search', function(req, res) {
        if (req.query.v=='2') {
            return require('./wago_lib').searchWago(req, res, function(results) {
                if (results.total>15) {
                    results.more = results.query
                    results.more.page++
                    results.more.lookup = '/search?v=2'
                }

                if (req.query.fetch=="more") {
                    if (results.results.length==0)
                        res.send("")
                    else
                        res.render('static/aura-list.ejs', { auralist: results });
                }
                else {
                    var pageinfo = res.locals.pageinfo
                    pageinfo.name = 'Search'
                    pageinfo.type = ''

                    if (req.query.sort=='stars') {
                        pageinfo.sort='Stars'
                    }
                    else if (req.query.sort=='views') {
                        pageinfo.sort='Views'
                    }
                    else if (req.query.sort=='comments') {
                        pageinfo.sort='Comments'
                    }
                    else if (req.query.sort=='commentdate') {
                        pageinfo.sort='Comment Date'
                    }
                    else { // date
                        pageinfo.sort='Date'
                    }
                    res.render('searchv3.ejs', { auralist: results, pageinfo: pageinfo });
                }
            })
        }
        var search = req.query
        if (!req.params.advanced) {
            // search default values
            search.searchName=1
            search.searchDesc=1
            search.searchWA2=1
            search.searchElv=1
            search.searchCollections=1
            search.searchSnippets=1
            search.searchImages=1
            search.searchFonts=1
            search.searchAudio=1
            search.searchCategories=[]
            search.anonymous=req.query.anon
        }
        return advancedSearch(search, req, res)
    })
    app.post('/search', function(req, res) {
        var search = req.body
        if (!req.params.advanced) {
            // search default values
            search.searchName=1
            search.searchDesc=1
            search.searchWA2=1
            search.searchElv=1
            search.searchCollections=1
            search.searchSnippets=1
            search.searchImages=1
            search.searchFonts=1
            search.searchAudio=1
            search.searchCategories=[]
        }
        return advancedSearch(search, req, res)
    })

    app.get('/media/browse', function(req, res) {
        pageinfo = {}
        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        var search = { type: "IMAGE", page: req.query.page, sort: pageinfo.sort }

        require("./search3")(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/media/browse", page: 1, sort: pageinfo.sort.toLowerCase() }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else {
                pageinfo.name = 'Media'
                pageinfo.type = ''
                res.render('searchv3.ejs', { auralist: results, pageinfo: pageinfo });
            }
        })
    })


    /*app.get('/search/stars', function(req, res) {
        var search = { sort: {'stars':-1, 'popularity.views':-1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/search/stars", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Popular favorites", auralist: results });
        })
    })

    app.get('/search/updates', function(req, res) {
        var search = { 'private': false, 'hidden': false, sort: {'modified': -1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/search/updates", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Latest updates", auralist: results });
        })
    })

    app.get('/search/newest', function(req, res) {
        var search = { 'private': false, 'hidden': false, sort: {'created':-1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/search/newest", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Latest updates", auralist: results });
        })
    }) */

    // =====================================
    // FAVORITES ===========================
    // =====================================
    app.get('/my/stars', isLoggedIn, function(req, res) {
        pageinfo = {}
        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else { // date
            pageinfo.sort='Date'
        }

        var search = { "popularity.favorites": req.user._id, page: req.query.page, sort: pageinfo.sort }

        require("./search3")(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/my-stars", page: 1, ort: pageinfo.sort.toLowerCase() }

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else {
                pageinfo.name = 'My stars'
                pageinfo.type = ''
                res.render('searchv3.ejs', { auralist: results, pageinfo: pageinfo });
            }
        })
    })


    // =====================================
    // MEDIA ===============================
    // =====================================
    app.get('/media', function(req, res) {
        // ./nconvert/nconvert -out png /home/mark/wago.io/public/test/*.blp

        res.locals.body.id = "page-media"

        var Media = require('./models/wagoitem')
        Media.find({ 'hidden' : false, 'private': false, $or: [{type: 'IMAGE'}] }).limit(24).sort('-created').exec(function(err, media) {
            if (err)
                throw err;

            var sizeOf = require('image-size');
            var async = require('async')
            async.forEachOf(media, function(item, key, cb) {
                var img = item.image[item.image.length-1]
                if (img.dimensions.width>0 && img.dimensions.height>0)
                    return cb()

                var imagefile = __dirname + '/../mywago/media/'+ (img.files.png || img.files.jpg || img.files.gif)
                var dimensions = sizeOf(imagefile);
                media[key].image[item.image.length-1].dimensions.width = dimensions.width
                media[key].image[item.image.length-1].dimensions.height = dimensions.height
                media[key].save()
                cb()

            }, function() {
                res.render('media.ejs', { message: req.flash('mediaMsg'), latest: media });
            })
        })
    })

    app.post('/media/:wagoID/modify', isLoggedIn, function(req, res) {
        wagoID = req.params.wagoID
        var Wago = require('./models/wagoitem');
                // file upload https://github.com/expressjs/multer
        Wago.findOne({ '_id' :  wagoID, '_userId' : req.user._id }, function(err, media) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no media is found, return the message
            if (!media || media==null) {
                res.send('Nothing to modify.');
                return
            }
            else {
                if (req.body.name!="")
                    media.name = req.body.name.trim()

                media.description = req.body.description
                // TODO: filter/verify categories input
                media.categories = req.body.categories || []

                media.subtype = req.body.imagetype

                if (req.body.mediavisibility=="Hidden")
                    media.hidden = true
                else
                    media.hidden = false

                if (req.body.mediavisibility=="Private")
                    media.private = true
                else
                    media.private = false

                if (media.subtype=='Sprite Sheet') {
                    var sprite = { rows: parseInt(req.body.spriterows), columns: parseInt(req.body.spritecols), framecount: parseInt(req.body.spriteframes) }

                    var imagefile = __dirname + '/../mywago/media/'+ (media.image[media.image.length-1].files.jpg || media.image[media.image.length-1].files.png)
                    var sizeOf = require('image-size');
                    var dimensions = sizeOf(imagefile);
                    sprite.height = dimensions.height/sprite.rows
                    sprite.width = dimensions.width/sprite.columns

                    media.image[media.image.length-1].sprite = sprite
                }
                // remove dupes
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                media.categories = media.categories.filter(onlyUnique)

                media.save(function() {
                    req.flash('mediaMsg', "Your media has been updated.")
                    res.redirect('/'+wagoID)
                })
            }
        })
    })


    app.post('/media/:mediaID/delete', isLoggedIn, function(req, res) {
        mediaID = req.params.mediaID
        var Media = require('./models/wagoitem');
        Media.findOne({ '_id' : mediaID }, function(err, media) {
            if (req.user && req.user._id.equals(media._userId)) {
                Media.remove( {"_id": mediaID }, function(err, media) {
                    res.setHeader('Content-Type', 'application/json')
                    res.send('{"wago":true}')
                })
            }
        })
    })

    app.post('/media/upload', upload.single('mediafile'), function(req, res) {
        if (!req.file || !req.file.originalname) {
            res.send('No file uploaded')
        }
        var _Media = require('./models/wagoitem')
        var Media = new _Media()

        var file = req.file
        file.originalname = file.originalname.replace(/ /g, '_')
        var fs = require('fs')

        var root_dir = __dirname + '/../mywago/media/'
        var media_dir = Media._id+'/'
        var media_dir1 = media_dir + (new Date).getTime()+'/'
        var file_paths = {}
        var sprite = {}

        Media.subtype = req.body.imagetype

        var extension = file.originalname.match(/\.([0-9a-z]+)$/i)
        if (extension && extension[1]) extension = extension[1].toLowerCase()

        var async = require('async')
        async.series([
            // create media directory
            function(cb) {
                fs.mkdir(root_dir+media_dir, cb)
            },

            // create media version directory
            function(cb) {
                fs.mkdir(root_dir+media_dir1, cb)
            },

            // the meat: detect upload file type and convert as necessary
            function(cb) {
                Media.name = req.body.name.trim()
                if (Media.name=="")
                    Media.name = file.originalname.trim()

                if (req.body.mediavisibility=="Hidden")
                    Media.hidden = true
                else
                    Media.hidden = false

                if (req.user) {
                    Media._userId = req.user._id
                    if (req.body.mediavisibility=="Private")
                        Media.private = true

                    if (req.body.anon=="Anonymous guest") {
                        Media.private = false
                        Media.hidden = false
                        Media._userId = null
                    }
                }


                if (extension=='blp') {
                    Media.type="IMAGE"
                    fs.rename(file.path, root_dir+media_dir1+file.originalname, function() {
                        file_paths.blp = media_dir1+file.originalname
                        async.parallel([
                            // convert to png format
                            function(cb2) {
                                require('./convert-media')('png', root_dir+media_dir1+file.originalname, function(err, pngfile) {
                                    if (err) { res.send(err); cb(err) }
                                    file_paths.png = pngfile
                                    cb2()
                                })
                            },

                            // convert to tga format
                            function(cb2) {
                                require('./convert-media')('tga', root_dir+media_dir1+file.originalname, function(err, tgafile) {
                                    if (err) { res.send(err); cb(err) }
                                    file_paths.tga = tgafile
                                    cb2()
                                })
                            }
                        ], function(err, name) {
                            cb(err)
                        })
                    })
                }
                else if (extension=='tga') {
                    Media.type="IMAGE"
                    fs.rename(file.path, root_dir+media_dir1+file.originalname, function() {
                        file_paths.tga = media_dir1+file.originalname
                        async.parallel([
                            // convert to png format
                            function(cb2) {
                                require('./convert-media')('png', root_dir+media_dir1+file.originalname, function(err, pngfile) {
                                    if (err) { res.send(err); cb(err) }
                                    file_paths.png = pngfile
                                    cb2()
                                })
                            }
                        ], function(err, name) {
                            if (err) return err
                            cb()
                        })
                    })
                }
                else if (extension=='png') {
                    Media.type="IMAGE"
                    fs.rename(file.path, root_dir+media_dir1+file.originalname, function() {
                        file_paths.png = media_dir1+file.originalname
                        async.parallel([
                            // convert to tga format
                            function(cb2) {
                                require('./convert-media')('tga', root_dir+media_dir1+file.originalname, function(err, tgafile) {
                                    if (err) { res.send(err); cb(err) }
                                    file_paths.tga = tgafile
                                    cb2()
                                })
                            },
                        ], function(err, name) {
                            cb(err)
                        })
                    })
                }

                else if (extension=='jpg') {
                    Media.type="IMAGE"
                    fs.rename(file.path, root_dir+media_dir1+file.originalname, function() {
                        file_paths.jpg = media_dir1+file.originalname
                        async.parallel([
                            // convert to tga format
                            function(cb2) {
                                require('./convert-media')('tga', root_dir+media_dir1+file.originalname, function(err, tgafile) {
                                    if (err) { res.send(err); cb(err) }
                                    file_paths.tga = tgafile
                                    cb2()
                                })
                            },
                        ], function(err, name) {
                            cb(err)
                        })
                    })
                }
                else {
                    cb()
                }
            },

            // if a sprite sheet, get dimensions
            function(cb) {
                if (Media.subtype=='Sprite Sheet') {
                    sprite = { rows: parseInt(req.body.spriterows), columns: parseInt(req.body.spritecols), framecount: parseInt(req.body.spriteframes) }

                    var imagefile = __dirname + '/../mywago/media/'+ (file_paths.jpg || file_paths.png)
                    var sizeOf = require('image-size');
                    var dimensions = sizeOf(imagefile);
                    sprite.height = dimensions.height/sprite.rows
                    sprite.width = dimensions.width/sprite.columns
                }
                cb()
            }
        ], function(err) {
            if (err) return false
            version = {files: file_paths, original: extension, sprite: sprite}
            Media.image.push(version)
            Media.save(function() {
                res.redirect('/'+Media._id)
            })
        })
    })

    app.get('/media/:mediaID/:extension(blp|tga|png|jpg|original)/:version?', function(req, res) {
        var mediaID = req.params.mediaID

        // what version, do some verification
        var mediaVersion = parseInt(req.params.version)
        if (!Number.isInteger(mediaVersion)) {
            mediaVersion=-1
        }
        var Wago = require('./models/wagoitem')
        var ent = require('ent')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        var extension = req.params.extension

        Wago.findOneAndUpdate({ '_id' :  mediaID, $or:[{"private": false}, {"_userId": private_user_id}] }, { $inc: { 'popularity.downloads': 1 } }, function(err, media) {
            if (mediaVersion>0 && media.image[mediaVersion-1])
                media.file = media.image[mediaVersion-1].files
            else
                media.file = media.image[media.image.length-1].files
            if (media.file[extension]) {
                var path = require('path')
                var fs = require('fs')

                var file = __dirname + '/../mywago/media/'+media.file[extension]
                var filename = path.basename(file)

                res.setHeader('Content-disposition', 'attachment; filename="' + media.name+'.'+extension+'"')
                var filestream = fs.createReadStream(file)
                filestream.pipe(res)
            }

            else if (extension=='original') { // use original file name
                extension = media.image[media.image.length-1].original
                var path = require('path')
                var fs = require('fs')

                var file = __dirname + '/../mywago/media/'+media.file[extension]
                var filename = path.basename(file)

                res.setHeader('Content-disposition', 'attachment; filename="' + filename+'"')
                var filestream = fs.createReadStream(file)
                filestream.pipe(res)
            }
        })
    })

    app.get('/media/:mediaID/:version?', function(req, res) {
        // prep site vars
        var site = {}

        // what aura to view
        var mediaID = req.params.mediaID

        // what version, do some verification
        var mediaVersion = parseInt(req.params.version)
        if (!Number.isInteger(mediaVersion)) {
            mediaVersion=-1
        }


        if (mediaVersion>1)
            res.redirect('/'+mediaID+'/'+mediaVersion)
        else
            res.redirect('/'+mediaID)
    });


    // =====================================
    // BUILDER =============================
    // =====================================
    app.get('/build', hasBetaAccess, function(req, res) {
        var fs = require('fs')
        // save local tables and functions https://www.regex101.com/r/Zoafwk/1
        // replace local vars https://www.regex101.com/r/1aSj6p/1
        weakauralua = fs.readFileSync('./public/lua/WeakAurasWago.lua', 'utf8')
        res.render('builder.ejs', {lua: weakauralua})
    })


    // =====================================
    // MY WAGO =============================
    // =====================================
    app.get('/mywago', isLoggedIn, function(req, res) {
        var Wago = require('./models/wagoitem');
        Wago.count({ $or: [{ "_userId": req.user._id}, {"popularity.favorites": req.user._id}], type: 'IMAGE', deleted: false}, function(err, num) {
            res.render('mywago.ejs', { mywagofiles: num });
        })
    })

    app.get('/mywago/download', isLoggedIn, function(req, res) {
        var search = { $or: [{ "_userId": req.user._id}, {"popularity.favorites": req.user._id}], type: 'IMAGE', deleted: false}

        require('./search3')(search, req, res, function(err, _media) {
            if (_media.count==0) return res.send("Error: No files found. MyWago Download will only download media files you have uploaded yourself plus any others that you have starred.")

            var async = require('async')
            var fs = require('fs')
            var JSZip = require("jszip")
            var path = require('path')
            var zip = new JSZip()

            var auratextures = zip.folder('MyWago/textures')
            var backgrounds = zip.folder('MyWago/backgrounds')
            var borders = zip.folder('MyWago/borders')
            var progressbars = zip.folder('MyWago/progressbars')
            var sprites = zip.folder('MyWago/sprites')

            var included_files = {}
            included_files.auratextures = []
            included_files.backgrounds = []
            included_files.borders = []
            included_files.progressbars = []
            included_files.sprites = []

            require("fs").readFile(__dirname + '/../mywago/MyWagoBase.zip', function (err, data) {
                if (err) throw err;
                zip.loadAsync(data).then(
                    async.forEachOf(_media.results, function(media, key, cb) {
                        if (media.type=='IMAGE') {
                            var image = media.image[media.image.length-1]
                            if (image.files.blp) {
                                var doFile = image.files.blp
                                var saveFile = media._id+'.blp'
                            }
                            else if (image.files.tga) {
                                var doFile = image.files.tga
                                var saveFile = media._id+'.tga'
                            }
                            else cb()
                        }

                        fs.readFile(__dirname + '/../mywago/media/'+doFile, function(err, data) {
                            if (err) throw err;
                            if (media.subtype=="Aura Texture") {
                                auratextures.file(saveFile, data)
                                included_files.auratextures.push({zippedName: saveFile, title: media.name})
                            }
                            else if (media.subtype=="Background") {
                                backgrounds.file(saveFile, data)
                                included_files.backgrounds.push({zippedName: saveFile, title: media.name})
                            }
                            else if (media.subtype=="Border") {
                                borders.file(saveFile, data)
                                included_files.borders.push({zippedName: saveFile, title: media.name})
                            }
                            else if (media.subtype=="Progress Bar") {
                                progressbars.file(saveFile, data)
                                included_files.progressbars.push({zippedName: saveFile, title: media.name})
                            }
                            else if (media.subtype=="Sprite Sheet") {
                                sprites.file(saveFile, data)
                                included_files.sprites.push({zippedName: saveFile, title: media.name, spriteData: media.image[0].sprite})
                            }
                            else
                                console.error("UNKNOWN SUBTYPE", media.subtype, media)
                            cb()
                        });

                    }, function() {
                        var ejs = require('ejs')
                        ejs.renderFile(__dirname + '/../mywago/MyWagoLua.ejs', {media: included_files}, function(err, lua_file){
                            zip.file('MyWago/MyWago.lua', lua_file)
                            zip.generateAsync({type:"nodebuffer"}).then(function(content) {
                                res.setHeader('Content-disposition', 'attachment; filename="MyWago.zip"')
                                res.send(content)
                            });
                        })
                    })
                ) // end zip promise
            })
        })
    })


    // =====================================
    // PROFILE =============================
    // =====================================
    app.get('/profile', isLoggedIn, function(req, res) {
        var User = require('./models/user');
        User.findById(req.user._id, function(err, user) {
            if (err || !user) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }
            res.redirect('/profile/'+user.account.username);
        })
    })

    app.get('/profile/:user', function(req, res) {
         res.redirect('/p/'+req.params.user);
    })

    app.get('/p/:user', function(req, res) {
        var pageinfo = res.locals.pageinfo
        var profile = {}
        var User = require('./models/user');

        User.findOne({'account.username': new RegExp('^'+req.params.user+'$', "i")}, function(err, lookup) {
            if (err || !lookup) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }

            profile.name = lookup.account.username
            profile.userclass = lookup.roleclass

            if (lookup.account.hidden && req.user && lookup._id.equals(req.user._id))
                profile.visible = 'my-private'
            else if (lookup.account.hidden) {
                profile.visible = 'private'
                profile.auras = {}
                res.render('profile.ejs', { profile: profile, auralist: {} });
                return
            }
            else
                profile.visible = 'show'

            pageinfo.title = profile.name
            pageinfo.description = "Profile page for "+profile.name

            if (req.query.sort=='stars') {
                pageinfo.sort='Stars'
            }
            else if (req.query.sort=='views') {
                pageinfo.sort='Views'
            }
            else if (req.query.sort=='comments') {
                pageinfo.sort='Comments'
            }
            else if (req.query.sort=='commentdate') {
                pageinfo.sort='Comment Date'
            }
            else { // date
                pageinfo.sort='Date'
            }

            require("./search3")({ _userId: lookup._id, page: req.query.page, sort: pageinfo.sort }, req, res, function(err, results) {
                if (results.total>=14)
                    results.more = { lookup: "/p/"+profile.name, page: 1, sort: pageinfo.sort.toLowerCase() }

                // if viewing own profile, do additional checks
                if (req.user && lookup._id.equals(req.user._id)) {
                    var async = require('async')

                    // check each wago and look for patch 7.1 breakage
                    var brokenSevenOne = /(GetPlayerMapPosition|UnitCameraFacing|UnitDistanceSquared|UnitFacing|UnitPosition|SetNamePlateOtherSize|GetNamePlateOtherSize)/
                    var Code = require('./models/aura-code')
                    async.forEachOf(results.results, function(wago, key, cb) {
                        Code.findOne({auraID: wago._id}).sort({updated: -1}).select({json: 1}).exec(function(err, code) {
                            if (code && code.json && (m = brokenSevenOne.exec(code.json)) !== null) {
                                results.results[key].brokenSevenOne = true
                            }
                            cb()
                        })

                    }, function() {
                        if (req.query.fetch=="more")
                            res.render('static/aura-list.ejs', { auralist: results });
                        else
                            res.render('profile.ejs', { profile: profile, auralist: results, pageinfo: pageinfo });
                    })
                }

                // viewing someone elses profile
                else {
                    if (req.query.fetch=="more")
                        res.render('static/aura-list.ejs', { auralist: results });
                    else
                        res.render('profile.ejs', { profile: profile, auralist: results, pageinfo: pageinfo });
                }
            })
        })
    })

    // =====================================
    // AURA SCREENSHOT UPLOAD ==============
    // =====================================
    app.post('/:auraID/uploadreq', isLoggedIn, function(req, res) {
        // if this isn't an image then don't authorize; S3 will verify that content matches what client is telling us
        if (req.body.file_type.indexOf('image/')!==0) {
            res.write("{}")
            res.end()
        }
        var auraID = req.params.auraID
        var Aura = require('./models/wagoitem');
        Aura.findOne({ '_id' :  auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                // AWS setup
                var AWS = require('aws-sdk')
                var AWS_Config = require('../config/aws.js')
                AWS.config.update({accessKeyId: AWS_Config.accessKeyId, secretAccessKey: AWS_Config.secretAccessKey, region: AWS_Config.S3.region})

                // S3 setup
                var file_key = auraID+'/'+(Date.now())+'/'+req.body.file_name
                var s3 = new AWS.S3()
                var s3_params = {
                    Bucket: AWS_Config.S3.bucket,
                    Key: file_key,
                    Expires: 60,
                    ContentType: req.body.file_type,
                    ACL: 'public-read'
                }
                s3.getSignedUrl('putObject', s3_params, function(err, data){
                    if(err){
                        console.log(err)
                    }
                    else{
                        var return_data = {
                            signed_request: data,
                            url: 'https://'+s3_params.Bucket+'/'+file_key
                        }

                        var SSRequest = require('./models/screenshot-request')
                        SSReq = new SSRequest()
                        SSReq.auraID = auraID
                        SSReq.s3Key = file_key
                        SSReq.bucket = AWS_Config.S3.bucket
                        m = /&Signature=([\w]+)/.exec(data)
                        if (m && m[1]) {
                            SSReq._id = m[1]
                            SSReq.save(function() {
                                res.write(JSON.stringify(return_data))
                                res.end()
                            })
                        }
                        else {
                            console.error('error with AWS upload request', data, m)
                            res.send('ERR')
                        }
                    }
                })
            }
        })
    })

    // =====================================
    // VERIFY AURA SCREENSHOT UPLOAD =======
    // =====================================
    app.post('/:auraID/verifyupload', isLoggedIn, function(req, res) {
        var auraID = req.params.auraID
        var Wago = require('./models/wagoitem');
        Wago.findOne({ '_id' :  auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                var SSRequest = require('./models/screenshot-request')

                SSRequest.findOne({ '_id' :  req.body.verify, auraID : auraID }, function(err, SSReq) {
                    var AWS_Config = require('../config/aws.js')

                    var _ScreenShot = require('./models/aura-screenshot');
                    var ScreenShot = new _ScreenShot()
                    ScreenShot.auraID = auraID
                    ScreenShot.s3Key = SSReq.s3Key
                    ScreenShot.save(function(err){
                        res.write('{"screenshot": "'+SSReq._id+'"}')
                        res.end()
                    })
                })
            }
        })
    })

    // =====================================
    // SET SCREENSHOT CAPTION ==============
    // =====================================
    app.post('/:auraID/setcaption', isLoggedIn, function(req, res) {
        var auraID = req.params.auraID
        var Wago = require('./models/wagoitem');
        Wago.findOne({ '_id' :  auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                var ScreenShot = require('./models/aura-screenshot');
                var caption = req.body.caption

                ScreenShot.findOne({ '_id' :  req.body.screenshot, auraID : auraID }, function(err, screen) {
                    if (screen) {
                        screen.caption = caption
                        screen.save(function(err){
                            res.write('{"screenshot": "saved"}')
                            res.end()
                        })
                    }
                    else
                     res.send('nofound')
                })
            }
        })
    })



    // =====================================
    // ADD VIDEO ===========================
    // =====================================
    app.post('/:wagoID/addvideo', isLoggedIn, function(req, res) {
        var wagoID = req.params.wagoID
        var Wago = require('./models/wagoitem');
        Wago.findOne({ '_id' :  wagoID }, function(err, wago) {
            if (req.user && req.user._id.equals(wago._userId)) {
                var Video = require('./models/wago-video');
                var video = new Video()

                video.wagoID = wagoID
                video.source = req.body.source
                video.videoID = req.body.videoID

                if (video.source=='twitch') {
                    var request = require('request')
                    request.get('https://api.twitch.tv/kraken/videos/v'+video.videoID, function(error, response, content) {
                        try {
                            json = JSON.parse(content)
                            if (json.preview) {
                                video.thumb = json.preview
                            }
                        }
                        catch(e) {
                            console.log('error fetching from twitch api', e)
                        }
                        video.save(function(err, doc) {  // assume it saves correctly; faster
                            if (err) return console.error('Could not save video', wagoID, err)

                            res.setHeader('Content-Type', 'application/json')
                            res.send(JSON.stringify({embed: video.embed, thumbnail: video.thumbnail, _id: video._id}))
                        })
                    })
                }
                else {
                    video.save(function(err, doc) {  // assume it saves correctly; faster
                        if (err) return console.error('Could not save video', wagoID, err)

                        res.setHeader('Content-Type', 'application/json')
                        res.send(JSON.stringify({embed: video.embed, thumbnail: video.thumbnail, _id: video._id}))
                    })
                }
            }
        })
    })

    app.post('/:wagoID/delvideo', isLoggedIn, function(req, res) {
        var wagoID = req.params.wagoID
        var Wago = require('./models/wagoitem');
        Wago.findOne({ '_id' :  wagoID }, function(err, wago) {
            if (req.user && req.user._id.equals(wago._userId)) {
                var Video = require('./models/wago-video');
                Video.find({wagoID: wagoID, _id: req.body.video}).remove().exec()
                res.send('1')
            }
        })
    })

    // =====================================
    // AURA IMPORT =========================
    // =====================================
    app.post('/import', function(req, res) {
        var input = req.body.importwa.trim()
        var Snippet = input.match(/\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table|SetAttribute|SetAllPoints|CreateFrame|unit|player|target)\b/g)

        // if pastebin link is imported
        if ((m = /http[s]?:\/\/pastebin.com\/([\w]+)/.exec(input)) !== null) {
            var request = require('request')
            request.get('http://pastebin.com/raw/'+m[1], function(error, response, content) {
                if (!error && response.statusCode == 200) {
                    importWago = {string: content.replace(/[\s]/g, '')}
                    if (/[^a-zA-Z0-9\(\)]/.exec(importWago.string)) {  // if not weakaura encoding
                        if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui or vuhdo encoding
                            console.error('Unable to detect encoding type')
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        }
                        else {
                            // elvui or vuhdo string detected
                            importWago.type = 'ELVUI_OR_VUHDO'
                            return require('./wago_lib').processImport(req, res, importWago, 'CREATE')
                        }
                    }
                    else {
                        // weakaura string detected
                        importWago.type = 'WEAKAURAS2'
                        return require('./wago_lib').processImport(req, res, importWago, 'CREATE')
                    }
                }
                else {
                    res.write('Error: reading http://pastebin.com/raw/'+m[1])
                    res.end()
                }
            })
        }


        // if code Snippet detected
        else if (Snippet && Snippet.length>3) {
            var _Wago = require('./models/wagoitem');
            var _Code = require('./models/aura-code');

            var Snippet = new _Wago();

            Snippet.type = "SNIPPET"
            Snippet.name = req.body.name.trim()
            if (req.body.auravisibility=="Hidden")
                Snippet.hidden = true
            else
                Snippet.hidden = false

            if (req.user) {
                Snippet._userId = req.user._id
                if (req.body.auravisibility=="Private")
                    Snippet.private = true

                if (req.body.anon=="Anonymous guest") {
                    Snippet.private = false
                    Snippet.hidden = false
                    Snippet._userId = null
                }
            }

            Snippet.categories.push('snip0')
            Snippet.save(function(err) {
                if (err)
                    throw err;

                // stuff going into database
                var Code = new _Code();
                Code.auraID = Snippet._id
                Code.lua = input
                Code.save(function(err, Snippet) {
                    res.redirect('/'+Code.auraID)
                })
            })
        }

        else {
            var importWago = {string: input}
            if (/[^a-zA-Z0-9\(\)]/.exec(importWago.string)) {  // if not weakaura encoding
                if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui or vuhdo encoding
                    console.error('Unable to detect encoding type')
                    req.flash('indexMsg', "Invalid string entered.")
                    res.redirect('/')
                    return
                }
                else {
                    // elvui or vuhdo string detected
                    importWago.type = 'ELVUI_OR_VUHDO'
                    return require('./wago_lib').processImport(req, res, importWago, 'CREATE')
                }
            }
            else {
                // weakaura string detected
                importWago.type = 'WEAKAURAS2'
                return require('./wago_lib').processImport(req, res, importWago, 'CREATE')
            }
        }
    })

    // =====================================
    // AURA CLONE/FORK =====================
    // =====================================
    app.post('/aura/fork', function(req, res) {
        var wagoID = req.body.wagoID
        var Wago = require('./models/wagoitem')
        var json = ""

        if (req.body.json) {
            json = JSON.parse(req.body.json)
            if (!json || json.length==0) {
                res.send('{"err": "Invalid data entered."}')
                return
            }
            var strJSON = JSON.stringify(json).replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()
        }

        Wago.findOne({ '_id' :  wagoID }, function(err, wago) {
            if (!wago || !wago.type) {
                console.error('Error forking:', req, res)
                res.send('Error could not fork.')
                return false
            }
            if (wago.type=='WEAKAURAS2' || wago.type=='ELVUI' || wago.type=='VUHDO') {
                if (wago.type=='WEAKAURAS2')
                    var luaEncode = 'json2wa.lua'
                else if (wago.type=='ELVUI')
                    var luaEncode = 'json2elv.lua'
                else if (wago.type=='VUHDO')
                    var luaEncode = 'json2vuhdo.lua'

                // convert json to WA export string, then process like normal.
                if (strJSON.length>112000) {
                    var fs = require('fs')
                    var file = "/tmp/wagoexport_"+Date.now()
                    fs.writeFile(file, strJSON, function(err) {
                        if(err) {
                            req.flash('indexMsg', "Could not save file.")
                            res.redirect('/')
                        }
                        require('child_process').exec('luajit ./'+luaEncode+' "'+file+'"'
                         , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                            var importWago = {string: EncodedString, type: wago.type}
                            return require('./wago_lib').processImport(req, res, importWago, 'CLONE')
                        })
                    })
                }
                else {
                    require('child_process').exec('luajit ./'+luaEncode+' "'+strJSON+'"'
                     , {cwd: __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                        var importWago = {string: EncodedString, type: wago.type}
                        return require('./wago_lib').processImport(req, res, importWago, 'CLONE')
                    })
                }
            }

            else if (wago.type=='SNIPPET' && req.body.lua) {
                var _Code = require('./models/aura-code');
                var Snippet = new Wago();

                Snippet.type = "SNIPPET"
                Snippet.name = req.body.name.trim()
                if (req.user && req.user.account.default_aura_visibility=="Hidden")
                    Snippet.hidden = true
                else
                    Snippet.hidden = false

                if (req.user && req.user.account.default_aura_visibility=="Private")
                    Snippet.private = true
                else
                    Snippet.private = false

                Snippet.categories.push('snip0')

                if (req.user)
                    Snippet._userId = req.user._id

                Snippet.save(function(err) {
                    if (err)
                        throw err;

                    // stuff going into database
                    var Code = new _Code();
                    Code.auraID = Snippet._id
                    Code.lua = req.body.lua
                    Code.save(function(err, Snippet) {
                        res.setHeader('Content-Type', 'application/json')
                        res.send('{"wago":"'+Code.auraID+'"}')
                    })
                })
            }
        })
    })

    // =====================================
    // AURA SAVE ===========================
    // =====================================
    app.post('/aura/save', isLoggedIn, function(req, res) {
        var Aura = require('./models/wagoitem');

        Aura.findOne({ '_id' :  req.body.auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                // if saving a WA
                if (aura.type=='WEAKAURAS2' || aura.type=='ELVUI' || aura.type=='VUHDO') {
                    var json = JSON.parse(req.body.json)
                    if (!json) {
                        res.send('{"err": "Invalid data entered."}')
                        return
                    }
                    json.url = 'https://wago.io/'+aura.slug

                    if (aura.wow_beta && !require('./static_vars').beta_option) {
                        aura.wow_beta = false
                        aura.save()
                    }


                    var strJSON = JSON.stringify(json).replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()

                    if (aura.type=='WEAKAURAS2')
                        var luaEncode = 'json2wa.lua'
                    else if (aura.type=='ELVUI')
                        var luaEncode = 'json2elv.lua'
                    else if (aura.type=='VUHDO')
                        var luaEncode = 'json2vuhdo.lua'


                    // convert json to WA export string, then process like normal.
                    if (strJSON.length>112000) {
                        var fs = require('fs')
                        var file = "/tmp/wagoexport_"+Date.now()
                        fs.writeFile(file, strJSON, function(err) {
                            if(err) {
                                req.flash('indexMsg', "Could not save file.")
                                res.redirect('/')
                            }
                            require('child_process').exec('luajit ./'+luaEncode+' "'+file+'"'
                             , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                                var importWago = {string: EncodedString, type: aura.type}
                                return require('./wago_lib').processImport(req, res, importWago, 'SAVE', req.body.auraID)
                            })
                        })
                    }
                    else {
                        require('child_process').exec('luajit ./'+luaEncode+' "'+strJSON+'"'
                         , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                            var importWago = {string: EncodedString, type: aura.type}
                            return require('./wago_lib').processImport(req, res, importWago, 'SAVE', req.body.auraID)
                        })
                    }
                }

                // if saving a snippet
                else if (aura.type=="SNIPPET") {
                    _Snippet = require('./models/aura-code');
                    var snippet = new _Snippet();

                    snippet.lua = req.body.json // not actually json
                    snippet.auraID = req.body.auraID
                    snippet.save(function(err, aura) {
                        if (err)
                            throw err;

                        res.setHeader('Content-Type', 'application/json')
                        res.send('{"wago":"'+snippet.auraID+'"}')
                    })
                }

                // unknown data type
                else {
                    res.send('{"err": "Unknown data type."}')
                }
            }
            else {
                res.send('{"err": "No permission."}')
            }
        })
    })

    // =====================================
    // AURA IMPORT REPLACE =================
    // =====================================
    app.post('/:auraID/replace', isLoggedIn, function(req, res) {
        var importString = req.body.importwa.replace(/[\s]/g, '')
        var auraID = req.params.auraID
        var importType = ""

        if (/[^a-zA-Z0-9\(\)]/.exec(importString)) {  // if not weakaura encoding
            if (/[^a-zA-Z0-9=\+\/]/.exec(importString)) { // if not elvui or vuhdo encoding
                console.error('Unable to detect encoding type')
                req.flash('indexMsg', "Invalid string entered.")
                res.redirect('/')
                return
            }
            else {
                // elvui or vuhdo string detected
                importType = 'ELVUI_OR_VUHDO'
            }
        }
        else {
            importType = 'WEAKAURAS2'
        }

        var Aura = require('./models/wagoitem');
        Aura.findOne({ '_id' :  auraID }, function(err, aura) {
            if (!err && req.user && aura && req.user._id.equals(aura._userId)) {
                if (aura.wow_beta && !require('./static_vars').beta_option) {
                    aura.wow_beta = false
                    aura.save()
                }
                var importWago = {string: importString, type: aura.type}
                return require('./wago_lib').processImport(req, res, importWago, 'REPLACE', auraID)
            }
            else if (err) {
                console.error('Error importing', err)
            }
            else {
                res.send('Error updating.')
            }
        })
    })

    // =====================================
    // AURA EXPORT CODE ====================
    // =====================================
    app.post('/aura/export', function(req, res) {
        res.send('E160')
        res.end()
        return
        // FIXME: is this still even used?
        try {
            var valid = JSON.parse(req.body.json)
            if (!valid) {
                res.send('Error parsing Table Data')
                return
            }
        }
        catch (e) {
            res.send('Error parsing Data')
            return
        }

        // convert json to WA export string, then process like normal. So lazy!
        require('child_process').exec('luajit ./json2wa.lua "'+JSON.stringify(valid).replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"', {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 15}, function(err, importWA) {
            res.send(importWA)
        });
    })

    // =====================================
    // AURA DELETE =========================
    // =====================================
    app.post('/:auraID/delete', isLoggedIn, function(req, res) {
        auraID = req.params.auraID
        var Aura = require('./models/wagoitem');
        Aura.findOne({ '_id' : auraID }, function(err, aura) {
            if (req.user && aura._userId && req.user._id.equals(aura._userId)) {
                var Screenshots = require('./models/aura-screenshot');
                var AWS = require('aws-sdk')
                var AWS_Config = require('../config/aws.js')
                AWS.config.update({accessKeyId: AWS_Config.accessKeyId, secretAccessKey: AWS_Config.secretAccessKey, region: AWS_Config.S3.region})
                var s3 = new AWS.S3()

                Screenshots.find({'auraID': auraID}).stream().on("data", function(screen) {
                     // delete images from S3
                    s3.deleteObject({Bucket: screen.original_bucket, Key: screen.s3Key}, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                        //else     console.log(data);           // successful response
                    })
                    s3.deleteObject({Bucket: screen.thumb_bucket, Key: screen.s3Key}, function(err, data) {
                      if (err) console.log(err, err.stack); // an error occurred
                      //else     console.log(data);           // successful response
                    })
                    screen.remove()
                })

                var AuraCode = require('./models/aura-code');
                AuraCode.remove(  {"auraID": auraID } )
                Aura.remove( {"_id": auraID }, function(err, aura) {
                    res.setHeader('Content-Type', 'application/json')
                    res.send('{"wago":true}')
                })
            }
        })
    })

    // =====================================
    // AURA SCREENSHOT DELETE ==============
    // =====================================
    app.post('/:auraID/ss-delete', isLoggedIn, function(req, res) {
        auraID = req.params.auraID
        screenID = req.body.ss
        var Aura = require('./models/wagoitem');
        Aura.findOne({ '_id' : auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                var Screenshots = require('./models/aura-screenshot');
                Screenshots.findById(screenID, function(err, screen) {
                    if (!screen || screen.auraID!=auraID) return false
                    var AWS = require('aws-sdk')
                    var AWS_Config = require('../config/aws.js')
                    AWS.config.update({accessKeyId: AWS_Config.accessKeyId, secretAccessKey: AWS_Config.secretAccessKey, region: AWS_Config.S3.region})
                    var s3 = new AWS.S3()

                    // delete images from S3
                    s3.deleteObject({Bucket: screen.original_bucket, Key: screen.s3Key}, function(err, data) {
                    if (err) console.log(err, err.stack); // an error occurred
                        //else     console.log(data);           // successful response
                    })
                    s3.deleteObject({Bucket: screen.thumb_bucket, Key: screen.s3Key}, function(err, data) {
                      if (err) console.log(err, err.stack); // an error occurred
                      //else     console.log(data);           // successful response
                    })
                    Screenshots.findById(screenID).remove().exec()
                    res.setHeader('Content-Type', 'application/json')
                    res.send('{"deleted":true}')
                })
            }
        })
    })


    // =====================================
    // TOGGLE STAR =========================
    // =====================================
    app.post('/star', isLoggedIn, function(req, res) {
        var wagoID = req.body.wagoID

        if (wagoID) {
            var Aura = require('./models/wagoitem')

            Aura.findOne({ '_id' : wagoID }, function(err, aura) {
                aura.popularity.favorites.pull(req.user._id)

                if (req.body.star=="1")
                    aura.popularity.favorites.push(req.user._id)

                aura.popularity.favorite_count = aura.popularity.favorites.length

                aura.save()
                res.setHeader('Content-Type', 'application/json')
                res.send('{"updated":true}')
            })
        }
    })

    // =====================================
    // POST COMMENT ===================
    // =====================================
    app.post('/postcomment', isLoggedIn, function(req, res) {
        var wagoID = req.body.wagoID

        var commentText = req.body.commentText
        if (commentText.length<3) { res.send("NoLength"); return false }
        var inReplyTo = req.body.inReplyTo

        if (wagoID) {
            var Wago = require('./models/wagoitem')

            Wago.findOne({ '_id' : wagoID }, function(err, wago) {
                if (!wago) { res.send("NoWago"); return false }
                var _Comment = require('./models/comment');
                var Comment = new _Comment()


                // update the total comment count on this wago
                wago.popularity.comments_count++
                wago.last_comment = Date.now()
                wago.save()

                Comment.wagoID = wagoID
                Comment.authorID = req.user._id
                Comment.commentText = commentText
                Comment.inReplyTo = inReplyTo
                if (wago._userId && wago._userId!=req.user._id) {
                    Comment.usersTagged.push({userID: wago._userId})
                    require('./wago_lib').SendWagoBotMessageFromUserId(wago._userId, 'messageOnComment', req.user.account.username+" has posted a comment on your Wago **"+wago.name+"**.\n"+wago.url+"\n\n"+commentText)
                }

                var re = /@([^.,\/@#!$%\^&\*;:{}=`~()\s]+)/g
                user_matches = []
                while ((m = re.exec(commentText)) !== null) {
                    user_matches.push(m[1])
                }

                if (user_matches.length>0) {
                    var async = require('async')
                    var User = require('./models/user')
                    var ObjectId = require('mongoose').Types.ObjectId

                    async.forEachOf(user_matches, function (taggedUsername, key, cb) {
                        var taggedUserID
                        if ((m = /User-(.{24})/.exec(taggedUsername)) !== null) {
                            try {
                                taggedUserID = new ObjectId(m[1])
                            }
                            catch (e) {
                                console.error('invalid tagged user ID', m[1])
                            }
                        }
                        User.findOne({ $or: [ {'account.username': taggedUsername} , {_id: taggedUserID } ] }).exec(function(err, foundUser) {
                            if (foundUser) {
                                Comment.usersTagged.pull({userID: foundUser._id})
                                Comment.usersTagged.push({userID: foundUser._id})
                                Comment.commentText = Comment.commentText.replace("@"+taggedUsername, "[taggeduser]@"+taggedUsername+"[/taggeduser]")
                                if (foundUser._id!=wago._userid) {
                                    require('./wago_lib').SendWagoBotMessageFromUserId(foundUser._id, 'messageOnComment', req.user.account.username+" has tagged you in a posted comment for Wago **"+wago.name+"**.\n"+wago.url+"\n\n"+commentText)
                                }
                            }
                            cb()
                        })
                    }, function() {
                        Comment.save()
                        res.redirect("/"+wagoID+"#comments")
                    })
                }
                else {
                    Comment.save()
                    res.redirect("/"+wagoID+"#comments")
                }
            })
        }
    })


    // =====================================
    // AURA DELETE COMMENT =================
    // =====================================
    app.post('/:wagoID/deletecomment', isLoggedIn, function(req, res) {
        var wagoID = req.params.wagoID
        var commentID = req.body.comment

        if (wagoID) {
            var Wago = require('./models/wagoitem')

            Wago.findOne({ '_id' : wagoID }, function(err, wago) {
                if (!wago) { res.send("NoWago"); return false }
                var Comment = require('./models/comment');

                if (req.user._id.equals(wago.userId)) {
                    res.send('{"error": "NoAccess"}')
                    return false
                }

                wago.popularity.comments_count--

                Comment.find({"_id": commentID, wagoID: wagoID}).remove().exec(function() {
                    Comment.findOne({wagoID: wagoID}).sort({"postDate": -1}).exec(function(err, comment) {
                        if (comment) wago.last_comment = comment.postDate
                        else wago.last_comment = null
                        wago.save()
                    })
                })
                res.send('{"result": "Deleted"}')
            })
        }
    })

    // =====================================
    // COMMENTS AT ME ======================
    // =====================================
    app.get('/my/mentions', isLoggedIn, function(req, res) {
        var wagoIds=[]
        for (i=0; i<res.locals.mentions.length; i++) {
            wagoIds.push(res.locals.mentions[i].wagoID)
        }

        var pageinfo = res.locals.pageinfo

        if (req.query.sort=='stars') {
            pageinfo.sort='Stars'
        }
        else if (req.query.sort=='views') {
            pageinfo.sort='Views'
        }
        else if (req.query.sort=='comments') {
            pageinfo.sort='Comments'
        }
        else if (req.query.sort=='commentdate') {
            pageinfo.sort='Comment Date'
        }
        else if (req.query.sort=='date') {
            pageinfo.sort='Date'
        }
        else { // date
            pageinfo.sort='Comment Date'
        }

        var search = { "_id": { $in: wagoIds}, page: req.query.page, sort: pageinfo.sort}

        require('./search3')(search, req, res, function(err, results) {
            if (results.total>=14)
                results.more = { lookup: "/my/mentions", page: 1, ort: pageinfo.sort.toLowerCase() }

            pageinfo.name = "My Mentions"
            pageinfo.type = ""

            if (req.query.fetch=="more")
                res.render('static/aura-list.ejs', { auralist: results });
            else
                res.render('searchv3.ejs', { auralist: results, pageinfo: pageinfo });
        })
    })

    // =====================================
    // QUICK LOOKUP TOOLS  =================
    // =====================================
    app.get('/lookup/exists/:wagoID', function(req, res) {
        var Wago = require('./models/wagoitem')

        require('./wago_lib').checkCustomSlug(req.params.wagoID, function(valid) {
            if (!valid) {
                res.send({query: "INUSE"})
            }
            else if (valid=="CLEAR") {
                res.send({query: "CLEAR"})
            }
            else {
                res.send({query: "OK"})
            }
        })
    })

    // =====================================
    // WeakAuras.lua Tools  ================
    // =====================================
    app.get('/wa-save', hasBetaAccess, function(req, res) {
        res.render("wa-save-form.ejs")
    })

    app.post('/wa-save/upload', hasBetaAccess, upload.single('luafile'), function(req, res) {
        if (!req.file || req.file.originalname.toLowerCase()!='weakauras.lua') {
            res.send('Invalid file uploaded')
            return
        }

        var file = req.file
        var luaUpload = {}
        luaUpload.file = file.path
        luaUpload.type = "WeakAuras.lua"

        return require('./wago_lib').processImport(req, res, luaUpload, 'CREATE')
    })


    // =====================================
    // WAGO IN THESE COLLECTIONS  ==========
    // =====================================
    app.get('/:wagoID/collections', function(req, res) {
        var Wago = require('./models/wagoitem')
        var wagoID = req.params.wagoID

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        var pageinfo = res.locals.pageinfo

        Wago.findOneAndUpdate({ $and: [{$or:[{"_id": wagoID}, {"custom_slug": wagoID}]}, {$or:[{"private": false}, {"_userId": private_user_id}] }] }, { "last_accessed": Date.now() }, function(err, wago) {
            if (!wago || wago==null) {
                req.flash('indexMsg', "Could not find that wago *"+wagoID+"*")
                res.redirect('/')
                return
            }
            if (req.query.sort=='stars') {
                pageinfo.sort='Stars'
            }
            else if (req.query.sort=='views') {
                pageinfo.sort='Views'
            }
            else if (req.query.sort=='comments') {
                pageinfo.sort='Comments'
            }
            else if (req.query.sort=='commentdate') {
                pageinfo.sort='Comment Date'
            }
            else { // date
                pageinfo.sort='Date'
            }

            require("./search3")({ collect: wago._id, page: req.query.page, sort: pageinfo.sort }, req, res, function(err, results) {
                if (results.total>=14)
                    results.more = { lookup: "/"+wagoID+"/collections", page: 1, ort: pageinfo.sort.toLowerCase() }

                if (req.query.fetch=="more")
                    res.render('static/aura-list.ejs', { auralist: results });
                else
                    res.render('wago-in-collections.ejs', { pageinfo: wago, auralist: results });
            })
        })
    })


    // =====================================
    // EMBED WEAKAURA ======================
    // =====================================
    app.get('/:wagoID/embed.js', function(req, res) {
        var Wago = require('./models/wagoitem')

        // what aura to embed
        var wagoID = req.params.wagoID

        Wago.findOneAndUpdate({ "_id" :  wagoID, "private": false, type:"WEAKAURAS2" }, { $inc: { 'popularity.embeds': 1 }, "last_accessed": Date.now() }, function(err, aura) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no aura is found, return the message
            if (!aura || aura==null) {
                res.send("Could not find that weak aura *"+wagoID+"*")
                return
            }

            var async = require('async')

            var AuraCode = require('./models/aura-code');
            var opts = { "limit": 1, "sort": "-updated" }

            async.parallel([
                function(cb) {
                    AuraCode.findOne({'auraID': wagoID}, "auraID encoded json updated", opts, function(err, auraCode) {
                        if (err)
                            throw err

                        if (!auraCode) {
                            res.send('Error loading aura code')
                            res.end()
                        }
                        aura.code=auraCode

                        data = JSON.parse(aura.code.json)
                        delete data.lua_table

                        aura.code.json = JSON.stringify(data)

                        var moment = require("moment")
                        var ddate = moment(aura.code.updated)
                        aura.display_date = ddate.format("MMM Do YYYY")
                        aura.wow_patch = require('./wow_patch_by_date')(ddate, aura.wow_beta)

                        var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                        while ((m = blocked_fn.exec(aura.code.json)) !== null) {
                            res.send("Aura contains blacklisted code; disallowing embed.")
                            return
                        }
                        cb()


                    })
                },
            function(cb) {
                if (aura._userId!=null) {
                    var User = require('./models/user');
                    User.findById(aura._userId, function(err, user) {
                    // if there are any errors, return the error
                        if (err)
                            return cb(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            aura.creator = "by "+user.account.username
                        }
                        else {
                            aura.creator = ""
                        }
                        cb()
                    })
                }
                else {
                    aura.creator = ""
                    cb(null, true)
                }
            }],
            // parallel callback
            function() {
                res.setHeader('Content-Type', 'application/x-javascript')
                res.render('aura-embed.ejs', { aura: aura });
            })
        })
    })

    // WAGO JSON
    app.get('/:wagoID/raw', function(req, res) {
        var Wago = require('./models/wagoitem')

        // what wago
        var wagoID = req.params.wagoID

        if (req.user) {
            var privacyFilter = { $or: [{ '_userId': req.user._id }, { 'private': false, 'hidden': false }, { 'private': false, "popularity.favorites": req.user._id }] }
        }
        else {
            var privacyFilter = { 'private': false, 'hidden': false }
        }
        res.setHeader('Content-Type', 'text/plain')

        Wago.findOneAndUpdate({ $and: [ { "_id" : wagoID, deleted: false }, privacyFilter ]}, { "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                res.send("Error: Could not load that wago")
                res.end()
                return done(err);
            }

            // if no wago is found, return the message
            if (!wago || wago==null) {
                res.send("Error: Could not find that wago")
                res.end()
                return
            }

            var async = require('async')

            var AuraCode = require('./models/aura-code');
            var opts = { "limit": 1, "sort": "-updated" }

            AuraCode.findOne({'auraID': wagoID}, "auraID encoded", opts, function(err, auraCode) {
                if (err)
                    throw err

                if (!auraCode) {
                    res.send("Error: Could not find that wago")
                    res.end()
                    return
                }

                var json = JSON.stringify(auraCode)

                var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                while ((m = blocked_fn.exec(json)) !== null) {
                    res.send("Error: Blacklisted code found. Quick-Copy disabled. Please view this Wago for details.")
                    res.end()
                    return
                }

                res.send(auraCode.encoded)
                return
            })
        })
    })

    app.get('/:wagoID/lua', function(req, res) {
        var Wago = require('./models/wagoitem')

        // what wago
        var wagoID = req.params.wagoID

        if (req.user) {
            var privacyFilter = { $or: [{ '_userId': req.user._id }, { 'private': false, 'hidden': false }, { 'private': false, "popularity.favorites": req.user._id }] }
        }
        else {
            var privacyFilter = { 'private': false, 'hidden': false }
        }

        Wago.findOneAndUpdate({ $and: [ { "_id" : wagoID, deleted: false }, privacyFilter ]}, { "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                res.send("Error: Could not load that wago")
                res.end()
                return done(err);
            }

            // if no wago is found, return the message
            if (!wago || wago==null) {
                res.send("Error: Could not find that wago")
                res.end()
                return
            }

            var async = require('async')

            var AuraCode = require('./models/aura-code');
            var opts = { "limit": 1, "sort": "-updated" }

            AuraCode.findOne({'auraID': wagoID}, "json encoded", opts, function(err, auraCode) {
                if (err)
                    throw err

                if (!auraCode) {
                    res.send("Error: Could not find that wago")
                    res.end()
                    return
                }

                var json = auraCode.json

                var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                while ((m = blocked_fn.exec(json)) !== null) {
                    res.send("Error: Blacklisted code found. Lua Export disabled. Please view this Wago for details.")
                    res.end()
                    return
                }

                var table_var = ""
                var download_file
                if (wago.type=="WeakAuras.lua") {
                    download_file = "WeakAuras.lua"
                    table_var = "WeakAurasSaved = "
                }


                if (json.length>112000) {
                    var fs = require('fs')
                    var file = "/tmp/wagoimport_"+Date.now()
                    fs.writeFile(file, json.trim(), function(err) {
                        if(err) {
                            req.flash('indexMsg', "Could not save file.")
                            res.redirect('/')
                        }
                        require('child_process').exec('luajit json2table.lua "'+file+'"', {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, luaOutput) {
                            if (download_file)
                                res.set({"Content-Disposition":"attachment; filename="+download_file})
                            res.send(table_var+luaOutput)
                            return
                        })
                    })
                }
                else {
                    require('child_process').exec('luajit json2table.lua "'+json+'"', {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, luaOutput) {
                        if (download_file)
                            res.set({"Content-Disposition":"attachment; filename="+download_file})
                        res.send(table_var+luaOutput)
                        return
                    })
                }
            })
        })
    })


    app.get('/:wagoID/import-nowa', function(req, res) {
        var wagoID = req.params.wagoID
        var Wago = require('./models/wagoitem')
        var fs = require('fs')

       // res.setHeader('Content-Type', 'text/plain')
        Wago.findOneAndUpdate({ "$or": [{'_id' :  wagoID}, {custom_slug: wagoID}]}, { $inc: { 'popularity.views': 1 }, "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.error('selected wago error', err)
                res.send('Error could not generate code.')
                res.end()
                return
            }

            // if no wago is found, return the message
            else if (!wago || wago==null || (wago.private && (!req.user || !req.user._id || !req.user._id.equals(wago._userId)))) {
                res.send('Error restricted access to this wago.')
                res.end()
                return
            }

            var AuraCode = require('./models/aura-code');
            var opts = { "limit": 1, "sort": "-updated" }

            AuraCode.findOne({'auraID': wagoID}, "json encoded", opts, function(err, auraCode) {
                if (err)
                    throw err

                if (!auraCode) {
                    res.send('Error could not generate code.')
                    res.end()
                    return
                }

                var json = JSON.parse(auraCode.json)
                var strJSON = JSON.stringify(json.d)

                var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                while ((m = blocked_fn.exec(strJSON)) !== null) {
                    res.send("Error blacklisted code found. No-WA import disallowed.")
                    res.end()
                    return
                }

                addon = fs.readFileSync('./public/lua/WeakAurasCombined.lua', 'utf8')

                res.render('generate/import-nowa.ejs', { encoded: auraCode.encoded, addon: addon });
            })

        })
    })

    // =====================================
    // SELECTED GROUPED WEAKAURA ===========
    // =====================================
    app.get('/:wagoID/g/:subname/:version([0-9]*)?', function(req, res) {
        // prep page vars
        var pageinfo = res.locals.pageinfo

        // what wago to view
        var wagoID = req.params.wagoID
        var subWago = req.params.subname

        // what version, do some verification
        var loadVersion = parseInt(req.params.version)
        if (!Number.isInteger(loadVersion)) {
            loadVersion=-1
        }

        loadVersion = parseInt(loadVersion)
        var Wago = require('./models/wagoitem')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        Wago.findOneAndUpdate({ "$or": [{'_id' :  wagoID}, {custom_slug: wagoID}]}, { $inc: { 'popularity.views': 1 }, "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.error('selected wago error', err)
                res.end()
            }

            // if no wago is found, return the message
            else if (!wago || wago==null || (wago.private && (!req.user || !req.user._id || !req.user._id.equals(wago._userId)))) {
                req.flash('indexMsg', "Could not find that wago *"+wagoID+"*")
                res.redirect('/')
                return
            }

            var User = require('./models/user');
            var async = require('async')
            var ent = require('ent')
            var fs = require("fs")
            var moment = require("moment")

            var custom_func = []

            var ddate = moment(wago.modified || wago.created)
            wago.display_date = ddate.format("MMM Do YYYY")
            wago.display_date_ago = ddate.fromNow()
            wago.wow_patch = require('./wow_patch_by_date')(ddate, wago.wow_beta)

            var selectizeCategories = []

            async.parallel({
                versions: function(cb) {
                    wago.versions = []
                    wago.latest_version = null
                    var AuraCode = require('./models/aura-code');
                    AuraCode.find({'auraID': wagoID}, "json lua updated", {sort: '-updated', limit: 8}).stream().on("data", function(ver) {
                        wago.versions.push(ver)
                        if (!wago.latest_version) wago.latest_version = ver.updated
                    }).on("end", function() {
                        cb(null, true)
                    })
                },
                categories: function(cb) {
                    var Categories = require('./models/categories')
                    var realcats = {}

                    for(k=0;k<Categories.length;k++) {

                        if ((Categories[k]['WeakAuras2'] && wago.type=='WEAKAURAS2')
                         || (Categories[k]['ElvUI'] && wago.type=='ELVUI')
                         || (Categories[k]['Vuhdo'] && wago.type=='VUHDO')
                         || (Categories[k]['WeakAuras2'] && wago.type=='COLLECTION')
                         || (Categories[k]['Snippet'] && wago.type=='SNIPPET')
                         || (Categories[k]['Media'] && wago.type=='IMAGE'))
                            selectizeCategories.push(Categories[k])

                        for(j=0;j<wago.categories.length;j++) {
                            if (wago.categories[j]==Categories[k].id) {
                                realcats[Categories[k].id] = Categories[k]
                                if (Categories[k].parent)
                                    delete realcats[Categories[k].parent]
                            }
                        }
                    }
                    wago.categoryData = realcats
                    cb()
                },
                code: function(cb){
                    if (wago.type!="WEAKAURAS2" && wago.type!='SNIPPET' && wago.type!='ELVUI' && wago.type!='VUHDO') return cb()

                    var AuraCode = require('./models/aura-code');
                    var opts = { "limit": 1 }
                    if (loadVersion>0) {
                        opts.skip = loadVersion-1
                        opts.sort = "updated"
                    }
                    else
                        opts.sort = "-updated"

                    AuraCode.findOne({'auraID': wagoID}, "auraID encoded json updated lua", opts, function(err, auraCode) {
                        if (err)
                            throw err

                        if (!auraCode) {
                            res.send('Error loading wago code')
                            res.end()
                        }
                        wago.code=auraCode
                        var data_subgroup

                        if (wago.type=="WEAKAURAS2") {
                            data = JSON.parse(wago.code.json)
                            delete data.lua_table

                            wago.code.json = JSON.stringify(data)

                            if (data.c && data.c.length>1) {
                                wago.code.groups = []
                                for (var i=0;i<data.c.length;i++) {
                                    if (subWago==data.c[i].id) {
                                        wago.code.json = JSON.stringify(data.c[i])
                                        wago.subgroup = subWago
                                        data_subgroup = data
                                    }
                                    wago.code.groups.push(data.c[i].id)
                                }
                            }

                            if (data_subgroup) data = data_subgroup

                            wago.customfunc = false
                            wago.preview = "<div class='alert alert-danger' role='alert'>Generated preview function coming.</div>"

                            if (wago.description == "" && data.c) {
                                wago.generated=1
                                wago.description = "This is a collection of "+(data.c.length)+" auras:\n\n"
                                for(var k in data.c){
                                    caura = data.c[k]
                                    if (caura.id && caura.regionType)
                                        wago.description = wago.description + ent.encode(caura.id)+" ("+ent.encode(caura.regionType)+")\n"
                                }
                            }
                            else if (wago.description == "" && data.d) {
                                wago.generated=1
                                wago.description = "This is "+a_or_an(data.d.regionType)+" "+ent.encode(data.d.regionType)+" type aura."
                                if (data.d.desc)
                                    wago.description = wago.description + "\n\n" + ent.encode(data.d.desc)
                            }

                            if (/function[\\s]*\(/.test(wago.code.lua)) {
                                wago.customfunc = true
                            }

                            if (wago.customfunc) {
                                wago.preview = "<div class='alert alert-danger' role='alert'><strong>This WA includes custom functions.</strong><br>Generated preview is not available.</div>"
                            }
                            else if (data.i) {
                                //icon = data.i.match(/Interface\\Icons\\(\w*)/)
                                //if (icon && icon[1])
                                //    wago.preview = "<img src='/assets/img/wow-icons/"+ent.encode(icon[1].toLowerCase())+".png' />"
                            }





                            var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                            while ((m = blocked_fn.exec(wago.code.json)) !== null) {
                                if (!wago.blacklist) wago.blacklist = []
                                wago.blacklist.push(m[1])
                            }

                            var brokenSevenOne = /(GetPlayerMapPosition|UnitCameraFacing|UnitDistanceSquared|UnitFacing|UnitPosition|SetNamePlateOtherSize|GetNamePlateOtherSize)/;
                            if ((m = brokenSevenOne.exec(wago.code.json)) !== null) {
                                wago.brokenSevenOne = true
                            }
                            // find custom functions
                            find_custom_functions(data, function(fn) {
                                custom_func = fn
                                cb(null, true)
                            })
                        }
                        else if (wago.type=="SNIPPET") {
                            if (wago.description == "") {
                                wago.description = "Lua Code Snippet"
                            }
                            cb(null, true)
                        }
                        else if (wago.type=="ELVUI") {
                            if (wago.description == "") {
                                wago.description = "ElvUI Profile"
                            }
                            cb(null, true)
                        }
                        else if (wago.type=="VUHDO") {
                            if (wago.description == "") {
                                wago.description = "Vuhdo Bouquet"
                            }
                            cb(null, true)
                        }
                    })
                },
                getComments: function(cb){
                    var Comments = require('./models/comment')
                    Comments.find({'wagoID': wagoID}).sort('-postDate').exec(function(err, comments) {
                        async.forEachOf(comments, function (comment, commentkey, cb2) {
                            User.findById(comment.authorID, function(err, user) {
                                if (user.account.username)
                                    comments[commentkey].authorName = user.account.username
                                else
                                    comments[commentkey].authorName = 'User-'+user._id.toString()

                                comments[commentkey].authorVerifiedHuman = user.account.verified_human
                                var ddate = moment(comments[commentkey].postDate)
                                comments[commentkey].timeago = ddate.fromNow()

                                if (req.user) {
                                    for (j=0; j<comments[commentkey].usersTagged.length; j++) {
                                        if (req.user._id == comments[commentkey].usersTagged[j].userID && !comments[commentkey].usersTagged[j].read) {
                                            comments[commentkey].attn = true
                                            wago.attnComments = true
                                            Comments.findOneAndUpdate({'_id': comments[commentkey]._id, 'usersTagged.userID': comments[commentkey].usersTagged[j].userID, 'usersTagged.read': false }, {$set: {'usersTagged.$': {"userID": comments[commentkey].usersTagged[j].userID, "read": true  }}},
                                                function(e, d) { }) // this doesn't seem to work without the callback?
                                        }
                                    }
                                }
                                cb2()
                            })
                        }, function() {
                            wago.comments = comments
                            cb()
                        })
                    })
                },
                favorite: function(cb){
                    wago.popularity.myfave = false
                    if (!req.user) {
                        return cb(null, true)
                    }

                    for (var i=0; i<wago.popularity.favorites.length; i++) {
                        if (wago.popularity.favorites[i].equals(req.user._id)) {
                            wago.popularity.myfave = true
                            return cb(null, true)
                        }
                    }
                    cb(null, true)
                },
                foundInCollections: function(cb) {
                    Wago.count({ 'collect' : wagoID, 'hidden' : false, 'private': false }, function(err, count) {
                        wago.collectCount = count
                        cb()
                    })
                },
                screenshot: function(cb){
                    var Screenshots = require('./models/aura-screenshot');
                    Screenshots.find({'auraID': wagoID}, function(err, screens) {
                        wago.screens = screens
                        if (screens && screens[0] && screens[0].localFile) {
                            pageinfo.image = "https://wago.io/screenshots/"+wagoID+"/"+screens[0].localFile
            			    pageinfo.type = "article"
            			}
                        cb()
                    })
                },
                video: function(cb){
                    var Videos = require('./models/wago-video');
                    Videos.find({'wagoID': wagoID}, function(err, videos) {
                        wago.videos = videos
                        cb()
                    })
                },
                image: function(cb) {
                    if (wago.type!='IMAGE') return cb()

                    if (loadVersion>0 && wago.image[loadVersion-1])
                        wago.load = wago.image[loadVersion-1]
                    else
                        wago.load = wago.image[wago.image.length-1]

                    var imagefile = __dirname + '/../mywago/media/'+ (wago.load.files.jpg || wago.load.files.png)
                    var sizeOf = require('image-size');
                    var dimensions = sizeOf(imagefile);
                    var height = dimensions.height
                    var width = dimensions.width

                    if (height>8192 || width > 8192)
                        wago.invalid_img = true
                    else if (height!=2 && height!=4 && height!=8 && height!=16 && height!=32 && height!=64 && height!=128 && height!=256 && height!=512 && height!=1024 && height!=2048 && height!=4096 && height!=8192)
                        wago.invalid_img = true
                    else if (width!=2 && width!=4 && width!=8 && width!=16 && width!=32 && width!=64 && width!=128 && width!=256 && width!=512 && width!=1024 && width!=2048 && width!=4096 && width!=8192)
                        wago.invalid_img = true
                    else
                        wago.invalid_img = false

                    var fstats = fs.statSync(__dirname + '/../mywago/media/'+ (wago.load.files.tga || wago.load.files.blp))
                    wago.fileSize = (""+(fstats["size"] / 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") // kilobytes

                    cb()
                },
                user: function(cb){
                    if (req.user && req.user._id.equals(wago._userId)) {
                        wago.can_edit = true
                    }
                    else {
                        wago.can_edit = false
                    }

                    if (wago._userId!=null) {
                        User.findById(wago._userId, function(err, user) {
                        // if there are any errors, return the error
                            if (err)
                                return cb(err);

                            if (user && user.account.username) {
                                wago.username = user.account.username
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            }
                            else if (user) {
                                wago.username = 'User-'+user._id
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            } else {
                                wago.username = "a guest"
                                wago.userclass = ""
                                wago.userlink = false
                                wago.authorHuman = false
                            }
                            cb(null, true)
                        })
                    }
                    else {
                        wago.username = "a guest"
                        cb(null, true)
                    }
                }
            }, function(err, x) {
                if (err && err.redirect) {
                    res.redirect(err.redirect)
                    return
                }
                if (err) return done(err)

                if (wago.type=='WEAKAURAS2') wago.type = 'WEAKAURA'

                pageinfo.title = wago.name
                pageinfo.description = bb2markdown(wago.description).substring(0, 155)
                res.locals.body.id = "page-wago"

                // wago found, display it
                if (wago.type=="COLLECTION") {
                    if (req.query.sort=='stars') {
                        pageinfo.sort='Stars'
                    }
                    else if (req.query.sort=='views') {
                        pageinfo.sort='Views'
                    }
                    else if (req.query.sort=='comments') {
                        pageinfo.sort='Comments'
                    }
                    else if (req.query.sort=='commentdate') {
                        pageinfo.sort='Comment Date'
                    }
                    else { // date
                        pageinfo.sort='Date'
                    }
                    require("./search3")({ _id: { $in: wago.collect} }, req, res, function(err, results) {
                        if (results.total>=14)
                            results.more = { lookup: "/collection/"+wago._id, page: 1, ort: pageinfo.sort.toLowerCase() }

                        if (req.query.fetch=="more")
                            res.render('static/aura-list.ejs', { auralist: results });
                        else
                            res.render('wago-view.ejs', {wago: wago, auralist: results, pageinfo: pageinfo, moment: require('moment'), custom_func: false, pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                    })
                }
                else if (wago.type=="IMAGE") {
                    res.locals.body.id = "page-media"
                    res.render('media-view.ejs', { wago: wago, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories  });
                }

                else {
                    res.render('wago-view.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                }

            })
        });
    });

    // =====================================
    // EXTRACT WEAKAURA FROM .lua FILE =====
    // =====================================
    app.get('/:wagoID/extract/:extract', function(req, res) {
        // prep page vars
        var pageinfo = res.locals.pageinfo

        // what wago to view
        var wagoID = req.params.wagoID
        var extract = req.params.extract

        // what version, do some verification
        var loadVersion = parseInt(req.params.version)
        if (!Number.isInteger(loadVersion)) {
            loadVersion=-1
        }

        loadVersion = parseInt(loadVersion)
        var Wago = require('./models/wagoitem')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        Wago.findOneAndUpdate({ "$or": [{'_id' :  wagoID}, {custom_slug: wagoID}], "type": "WeakAuras.lua"}, { $inc: { 'popularity.views': 1 }, "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.error('selected wago error', err)
                res.end()
            }

            // if no wago is found, return the message
            else if (!wago || wago==null || (wago.private && (!req.user || !req.user._id || !req.user._id.equals(wago._userId)))) {
                req.flash('indexMsg', "Could not find that wago *"+wagoID+"*")
                res.redirect('/')
                return
            }

            else if (wago.slug!=wagoID) {
                res.redirect("/"+wago.slug+"/"+extract )
                return
            }

            var User = require('./models/user');
            var async = require('async')
            var ent = require('ent')
            var fs = require("fs")
            var moment = require("moment")

            var custom_func = []

            var ddate = moment(wago.modified || wago.created)
            wago.display_date = ddate.format("MMM Do YYYY")
            wago.display_date_ago = ddate.fromNow()
            wago.wow_patch = require('./wow_patch_by_date')(ddate, wago.wow_beta)

            var selectizeCategories = []

            wago.versions = []
            wago.latest_version = null

            async.parallel({
                code: function(cb){
                    var AuraCode = require('./models/aura-code');
                    var opts = { "limit": 1 }
                    if (loadVersion>0) {
                        opts.skip = loadVersion-1
                        opts.sort = "updated"
                    }
                    else
                        opts.sort = "-updated"

                    AuraCode.findOne({'auraID': wago._id}, "auraID encoded json updated lua", opts, function(err, auraCode) {
                        if (err)
                            throw err

                        if (!auraCode) {
                            res.send('Error loading wago code')
                            res.end()
                        }
                        wago.code=auraCode
                        var data = JSON.parse(wago.code.json)

                        if (data.displays && data.displays[extract]) {
                            wago.type = 'WEAKAURA'

                            data = data.displays[extract]
                            var table = {}
                            table.d = data
                            table.m = "d"
                            table.v = 1421
                            wago.code.data = data

                            wago.customfunc = false
                            if (data.c) {
                                wago.generated=1
                                wago.description = "This is a collection of "+(data.c.length)+" auras:\n\n"
                                for(var k in data.c){
                                    caura = data.c[k]
                                    if (caura.id && caura.regionType)
                                        wago.description = wago.description + ent.encode(caura.id)+" ("+ent.encode(caura.regionType)+")\n"
                                }
                            }
                            else if (data.d) {
                                wago.generated=1
                                wago.description = "This is "+a_or_an(data.d.regionType)+" "+ent.encode(data.d.regionType)+" type aura."
                                if (data.d.desc)
                                    wago.description = wago.description + "\n\n" + ent.encode(data.d.desc)
                            }

                            if (/function[\\s]*\(/.test(wago.code.lua)) {
                                wago.customfunc = true
                            }

                            if (wago.customfunc) {
                                wago.preview = "<div class='alert alert-danger' role='alert'><strong>This WA includes custom functions.</strong><br>Generated preview is not available.</div>"
                            }

                            if (data.c && data.c.length>1) {
                                wago.code.groups = []
                                for (var i=0;i<data.c.length;i++) {
                                    wago.code.groups.push(data.c[i].id)
                                }
                            }

                            wago.code.json = JSON.stringify(data)

                            var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                            while ((m = blocked_fn.exec(wago.code.json)) !== null) {
                                if (!wago.blacklist) wago.blacklist = []
                                wago.blacklist.push(m[1])
                            }

                            var brokenSevenOne = /(GetPlayerMapPosition|UnitCameraFacing|UnitDistanceSquared|UnitFacing|UnitPosition|SetNamePlateOtherSize|GetNamePlateOtherSize)/;
                            if ((m = brokenSevenOne.exec(wago.code.json)) !== null) {
                                wago.brokenSevenOne = true
                            }
                            // find custom functions
                            find_custom_functions(data, function(fn) {
                                custom_func = fn

                                // encode table to WA string
                                var strJSON = JSON.stringify(table)
                                var fs = require('fs')
                                var file = "/tmp/wagoexport_"+Date.now()
                                fs.writeFile(file, strJSON, function(err) {
                                    if(err) {
                                        req.flash('indexMsg', "Could not save file.")
                                        res.redirect('/')
                                    }
                                    require('child_process').exec('luajit ./json2wa.lua "'+file+'"'
                                     , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                                        wago.code.encoded = EncodedString
                                        cb(null, true)
                                    })
                                })
                            })
                        }
                    })
                },
                getComments: function(cb){
                    var Comments = require('./models/comment')
                    Comments.find({'wagoID': wago._id}).sort('-postDate').exec(function(err, comments) {
                        async.forEachOf(comments, function (comment, commentkey, cb2) {
                            User.findById(comment.authorID, function(err, user) {
                                if (user.account.username)
                                    comments[commentkey].authorName = user.account.username
                                else
                                    comments[commentkey].authorName = 'User-'+user._id.toString()

                                comments[commentkey].authorVerifiedHuman = user.account.verified_human
                                var ddate = moment(comments[commentkey].postDate)
                                comments[commentkey].timeago = ddate.fromNow()

                                if (req.user) {
                                    for (j=0; j<comments[commentkey].usersTagged.length; j++) {
                                        if (req.user._id == comments[commentkey].usersTagged[j].userID && !comments[commentkey].usersTagged[j].read) {
                                            comments[commentkey].attn = true
                                            wago.attnComments = true
                                            Comments.findOneAndUpdate({'_id': comments[commentkey]._id, 'usersTagged.userID': comments[commentkey].usersTagged[j].userID, 'usersTagged.read': false }, {$set: {'usersTagged.$': {"userID": comments[commentkey].usersTagged[j].userID, "read": true  }}},
                                                function(e, d) { }) // this doesn't seem to work without the callback?
                                        }
                                    }
                                }
                                cb2()
                            })
                        }, function() {
                            wago.comments = comments
                            cb()
                        })
                    })
                },
                favorite: function(cb){
                    wago.popularity.myfave = false
                    if (!req.user) {
                        return cb(null, true)
                    }

                    for (var i=0; i<wago.popularity.favorites.length; i++) {
                        if (wago.popularity.favorites[i].equals(req.user._id)) {
                            wago.popularity.myfave = true
                            return cb(null, true)
                        }
                    }
                    cb(null, true)
                },
                foundInCollections: function(cb) {
                    Wago.count({ 'collect' : wago._id, 'hidden' : false, 'private': false }, function(err, count) {
                        wago.collectCount = count
                        cb()
                    })
                },
                user: function(cb){
                    wago.can_edit = false

                    if (wago._userId!=null) {
                        User.findById(wago._userId, function(err, user) {
                        // if there are any errors, return the error
                            if (err)
                                return cb(err);

                            // check to see if theres already a user with that email
                            if (user && user.account.username) {
                                wago.username = user.account.username
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            }
                            else if (user) {
                                wago.username = 'User-'+user._id
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            } else {
                                wago.username = "a guest"
                                wago.userclass = ""
                                wago.userlink = false
                                wago.authorHuman = false
                            }
                            cb(null, true)
                        })
                    }
                    else {
                        wago.username = "a guest"
                        cb(null, true)
                    }
                }
            }, function(err, x) {
                if (err && err.redirect) {
                    res.redirect(err.redirect)
                    return
                }
                if (err) return done(err)

                if (wago.type=='WEAKAURAS2') wago.type = 'WEAKAURA'

                pageinfo.title = wago.name
                pageinfo.description = bb2markdown(wago.description).substring(0, 155)
                res.locals.body.id = "page-wago"

                // wago found, display it
                if (wago.type=="COLLECTION") {
                    if (req.query.sort=='stars') {
                        pageinfo.sort='Stars'
                    }
                    else if (req.query.sort=='views') {
                        pageinfo.sort='Views'
                    }
                    else if (req.query.sort=='comments') {
                        pageinfo.sort='Comments'
                    }
                    else if (req.query.sort=='commentdate') {
                        pageinfo.sort='Comment Date'
                    }
                    else { // date
                        pageinfo.sort='Date'
                    }
                    require("./search3")({ _id: { $in: wago.collect} }, req, res, function(err, results) {
                        if (results.total>=14)
                            results.more = { lookup: "/"+wago._id, page: 1, sort: pageinfo.sort.toLowerCase() }

                        if (req.query.fetch=="more")
                            res.render('static/aura-list.ejs', { auralist: results });
                        else
                            res.render('wago-view.ejs', {wago: wago, auralist: results, pageinfo: pageinfo, moment: require('moment'), custom_func: false, pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                    })
                }
                else if (wago.type=="IMAGE") {
                    res.locals.body.id = "page-media"
                    res.render('media-view.ejs', { wago: wago, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories  });
                }
                else if (wago.type=="WAFFLE") {
                    res.locals.body.id = "page-waffle"
                    res.render('aprilfools/waffle-view.ejs', { wago: wago, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories  });
                }

                else {
                    res.render('wago-view.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                }

            })
        })
    })

    // =====================================
    // SELECTED WEAKAURA ===================
    // =====================================
    app.get('/:wagoID/:version([0-9]*)?', function(req, res) {
        // prep page vars
        var pageinfo = res.locals.pageinfo

        // what wago to view
        var wagoID = req.params.wagoID

        // what version, do some verification
        var loadVersion = parseInt(req.params.version)
        if (!Number.isInteger(loadVersion)) {
            loadVersion=-1
        }

        loadVersion = parseInt(loadVersion)
        var Wago = require('./models/wagoitem')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        Wago.findOneAndUpdate({ "$or": [{'_id' :  wagoID}, {custom_slug: wagoID}]}, { $inc: { 'popularity.views': 1 }, "last_accessed": Date.now() }, function(err, wago) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.error('selected wago error', err)
                res.end()
            }

            // if no wago is found, return the message
            else if (!wago || wago==null || (wago.private && (!req.user || !req.user._id || !req.user._id.equals(wago._userId)))) {
                req.flash('indexMsg', "Could not find that wago *"+wagoID+"*")
                res.redirect('/')
                return
            }

            else if (wago.slug!=wagoID) {
                res.redirect("/"+wago.slug )
                return
            }

            var User = require('./models/user');
            var async = require('async')
            var ent = require('ent')
            var fs = require("fs")
            var moment = require("moment")

            var custom_func = []

            var ddate = moment(wago.modified || wago.created)
            wago.display_date = ddate.format("MMM Do YYYY")
            wago.display_date_ago = ddate.fromNow()
            wago.wow_patch = require('./wow_patch_by_date')(ddate, wago.wow_beta)

            var selectizeCategories = []

            async.parallel({
                collectionDate: function(cb) {
                    if (wago.type=='COLLECTION') {
                        require("./search3")({ _id: { $in: wago.collect}, sort: { "modified": 1 } }, req, res, function(err, doc) {
                            if (doc && doc.results && doc.results.length>0) {
                                ddate = moment(doc.results[0].modified || doc.results[0].created)
                                wago.display_date = ddate.format("MMM Do YYYY")
                                wago.display_date_ago = ddate.fromNow()
                                wago.wow_patch = require('./wow_patch_by_date')(ddate, wago.wow_beta)
                                cb()
                            }
                            else
                                cb()
                        })
                    }
                    else {
                        cb()
                    }
                },
                versions: function(cb) {
                    if (wago.type!="WEAKAURAS2" && wago.type!='SNIPPET' && wago.type!='ELVUI' && wago.type!='VUHDO') return cb()

                    wago.versions = []
                    wago.latest_version = null
                    var AuraCode = require('./models/aura-code');
                    AuraCode.find({'auraID': wago._id}, "json lua updated", {sort: '-updated'}).stream().on("data", function(ver) {
                        wago.versions.push(ver)
                        if (!wago.latest_version) wago.latest_version = ver.updated
                    }).on("end", function() {
                        cb(null, true)
                    })
                },
                categories: function(cb) {
                    var Categories = require('./models/categories')
                    var realcats = {}

                    for(k=0;k<Categories.length;k++) {

                        if ((Categories[k]['WeakAuras2'] && wago.type=='WEAKAURAS2')
                         || (Categories[k]['ElvUI'] && wago.type=='ELVUI')
                         || (Categories[k]['Vuhdo'] && wago.type=='VUHDO')
                         || (Categories[k]['WeakAuras2'] && wago.type=='COLLECTION')
                         || (Categories[k]['Snippet'] && wago.type=='SNIPPET')
                         || (Categories[k]['Media'] && wago.type=='IMAGE'))
                            selectizeCategories.push(Categories[k])

                        for(j=0;j<wago.categories.length;j++) {
                            if (wago.categories[j]==Categories[k].id) {
                                realcats[Categories[k].id] = Categories[k]
                                if (Categories[k].parent)
                                    delete realcats[Categories[k].parent]
                            }
                        }
                    }
                    wago.categoryData = realcats
                    cb()
                },
                code: function(cb){
                    if (wago.type!="WEAKAURAS2" && wago.type!='SNIPPET' && wago.type!='ELVUI' && wago.type!='VUHDO' && wago.type!='WeakAuras.lua') return cb()

                    var AuraCode = require('./models/aura-code');
                    var opts = { "limit": 1 }
                    if (loadVersion>0) {
                        opts.skip = loadVersion-1
                        opts.sort = "updated"
                    }
                    else
                        opts.sort = "-updated"

                    AuraCode.findOne({'auraID': wago._id}, "auraID encoded json updated lua", opts, function(err, auraCode) {
                        if (err)
                            throw err

                        if (!auraCode) {
                            res.send('Error loading wago code')
                            res.end()
                        }
                        wago.code=auraCode

                        if (wago.type=="WEAKAURAS2") {
                            data = JSON.parse(wago.code.json)
                            delete data.lua_table
                            wago.code.data = data

                            // if we need to add url to code data (only add to latest version)
                            if (data.d && data.d.url!=wago.url && loadVersion<=0) {
                                data.d.url = wago.url
                                data.wagoID = wago._id
                                strJSON = JSON.stringify(data)
                                if (strJSON.length>1) {
                                    var fs = require('fs')
                                    var file = "/tmp/wagoexport_"+Date.now()
                                    fs.writeFile(file, strJSON, function(err) {
                                        if(err) {
                                            req.flash('indexMsg', "Could not save file.")
                                            res.redirect('/')
                                        }
                                        require('child_process').exec('luajit ./json2wa.lua "'+file+'"'
                                         , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                                            var importWago = {string: EncodedString, type: wago.type}
                                            return require('./wago_lib').processImport(req, res, importWago, 'ADDURL', wago._id)
                                        })
                                    })
                                }
                                else {
                                    require('child_process').exec('luajit ./json2wa.lua "'+strJSON+'"'
                                     , {cwd:  __dirname+'/../lua', maxBuffer: 1024 * 1024 * 5}, function(err, EncodedString) {
                                        var importWago = {string: EncodedString, type: wago.type}
                                        return require('./wago_lib').processImport(req, res, importWago, 'ADDURL', wago._id)
                                    })
                                }
                                return cb('add url')
                            }

                            wago.customfunc = false
                            wago.preview = "<div class='alert alert-danger' role='alert'>Generated preview function coming.</div>"

                            if (wago.description == "" && data.c) {
                                wago.generated=1
                                wago.description = "This is a collection of "+(data.c.length)+" auras:\n\n"
                                for(var k in data.c){
                                    caura = data.c[k]
                                    if (caura.id && caura.regionType)
                                        wago.description = wago.description + ent.encode(""+caura.id)+" ("+ent.encode(""+caura.regionType)+")\n"
                                }
                            }
                            else if (wago.description == "" && data.d) {
                                wago.generated=1
                                wago.description = "This is "+a_or_an(data.d.regionType)+" "+ent.encode(data.d.regionType)+" type aura."
                                if (data.d.desc)
                                    wago.description = wago.description + "\n\n" + ent.encode(data.d.desc)
                            }

                            if (/function[\\s]*\(/.test(wago.code.lua)) {
                                wago.customfunc = true
                            }

                            if (wago.customfunc) {
                                wago.preview = "<div class='alert alert-danger' role='alert'><strong>This WA includes custom functions.</strong><br>Generated preview is not available.</div>"
                            }
                            else if (data.i) {
                                //icon = data.i.match(/Interface\\Icons\\(\w*)/)
                                //if (icon && icon[1])
                                //    wago.preview = "<img src='/assets/img/wow-icons/"+ent.encode(icon[1].toLowerCase())+".png' />"
                            }

                            if (data.c && data.c.length>1) {
                                wago.code.groups = []
                                for (var i=0;i<data.c.length;i++) {
                                    wago.code.groups.push(data.c[i].id)
                                }
                            }

                            wago.code.json = JSON.stringify(data)

                            var blocked_fn = /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro)([\s]*\([^\)]*\))?)/g;
                            while ((m = blocked_fn.exec(wago.code.json)) !== null) {
                                if (!wago.blacklist) wago.blacklist = []
                                wago.blacklist.push(m[1])
                            }

                            var brokenSevenOne = /(GetPlayerMapPosition|UnitCameraFacing|UnitDistanceSquared|UnitFacing|UnitPosition|SetNamePlateOtherSize|GetNamePlateOtherSize)/;
                            if ((m = brokenSevenOne.exec(wago.code.json)) !== null) {
                                wago.brokenSevenOne = true
                            }
                            // find custom functions
                            find_custom_functions(data, function(fn) {
                                custom_func = fn
                                cb(null, true)
                            })
                        }
                        else if (wago.type=="SNIPPET") {
                            if (wago.description == "") {
                                wago.description = "Lua Code Snippet"
                            }
                            cb(null, true)
                        }
                        else if (wago.type=="ELVUI") {
                            if (wago.description == "") {
                                wago.description = "ElvUI Profile"
                            }
                            cb(null, true)
                        }
                        else if (wago.type=="VUHDO") {
                            data = JSON.parse(wago.code.json)
                            if (wago.description == "") {
                                if (data.bouquetName) {
                                    wago.description = "Vuhdo Bouquet"
                                }
                                else if (data.keyLayout) {
                                    wago.description = "Vuhdo Key Layout"
                                }
                                else {
                                    wago.description = "Vuhdo Profile"
                                }
                            }
                            cb(null, true)
                        }
                        else if (wago.type=="WeakAuras.lua") {
                            data = JSON.parse(wago.code.json)
                            wago.extractable = []
                            Object.keys(data.displays).forEach(function(key) {
                                if (!data.displays[key].parent)
                                    wago.extractable.push(key)
                            })
                            cb(null, true)
                        }
                    })
                },
                getComments: function(cb){
                    var Comments = require('./models/comment')
                    Comments.find({'wagoID': wago._id}).sort('-postDate').exec(function(err, comments) {
                        async.forEachOf(comments, function (comment, commentkey, cb2) {
                            User.findById(comment.authorID, function(err, user) {
                                if (user.account.username) {
                                    comments[commentkey].authorName = user.account.username
                                }
                                else {
                                    comments[commentkey].authorName = 'User-'+user._id.toString()
                                }

                                comments[commentkey].authorVerifiedHuman = user.account.verified_human
                                var ddate = moment(comments[commentkey].postDate)
                                comments[commentkey].timeago = ddate.fromNow()

                                if (req.user) {
                                    for (j=0; j<comments[commentkey].usersTagged.length; j++) {
                                        if (req.user._id == comments[commentkey].usersTagged[j].userID && !comments[commentkey].usersTagged[j].read) {
                                            comments[commentkey].attn = true
                                            wago.attnComments = true
                                            Comments.findOneAndUpdate({'_id': comments[commentkey]._id, 'usersTagged.userID': comments[commentkey].usersTagged[j].userID, 'usersTagged.read': false }, {$set: {'usersTagged.$': {"userID": comments[commentkey].usersTagged[j].userID, "read": true  }}},
                                                function(e, d) { }) // this doesn't seem to work without the callback?
                                        }
                                    }
                                }
                                cb2()
                            })
                        }, function() {
                            wago.comments = comments
                            cb()
                        })
                    })
                },
                favorite: function(cb){
                    wago.popularity.myfave = false
                    if (!req.user) {
                        return cb(null, true)
                    }

                    for (var i=0; i<wago.popularity.favorites.length; i++) {
                        if (wago.popularity.favorites[i].equals(req.user._id)) {
                            wago.popularity.myfave = true
                            return cb(null, true)
                        }
                    }
                    cb(null, true)
                },
                foundInCollections: function(cb) {
                    Wago.count({ 'collect' : wago._id, 'hidden' : false, 'private': false }, function(err, count) {
                        wago.collectCount = count
                        cb()
                    })
                },
                screenshot: function(cb){
                    var Screenshots = require('./models/aura-screenshot');
                    Screenshots.find({'auraID': wago._id}, function(err, screens) {
                        wago.screens = screens
                        if (screens && screens[0] && screens[0].localFile) {
                            pageinfo.image = "https://wago.io/screenshots/"+wago._id+"/"+screens[0].localFile
            			    pageinfo.type = "article"
            			}
                        cb()
                    })
                },
                video: function(cb){
                    var Videos = require('./models/wago-video');
                    Videos.find({'wagoID': wago._id}, function(err, videos) {
                        wago.videos = videos
                        cb()
                    })
                },
                image: function(cb) {
                    if (wago.type!='IMAGE' && wago.type!='WAFFLE') return cb()

                    if (loadVersion>0 && wago.image[loadVersion-1])
                        wago.load = wago.image[loadVersion-1]
                    else
                        wago.load = wago.image[wago.image.length-1]

                    var imagefile = __dirname + '/../mywago/media/'+ (wago.load.files.jpg || wago.load.files.png)
                    pageinfo.image = "https://wago.io/mywago/media/" + (wago.load.files.jpg || wago.load.files.png)
		    pageinfo.type = "article"
                    var sizeOf = require('image-size');
                    var dimensions = sizeOf(imagefile);
                    var height = dimensions.height
                    var width = dimensions.width

                    if (height>8192 || width > 8192)
                        wago.invalid_img = true
                    else if (height!=2 && height!=4 && height!=8 && height!=16 && height!=32 && height!=64 && height!=128 && height!=256 && height!=512 && height!=1024 && height!=2048 && height!=4096 && height!=8192)
                        wago.invalid_img = true
                    else if (width!=2 && width!=4 && width!=8 && width!=16 && width!=32 && width!=64 && width!=128 && width!=256 && width!=512 && width!=1024 && width!=2048 && width!=4096 && width!=8192)
                        wago.invalid_img = true
                    else
                        wago.invalid_img = false

                    var fstats = fs.statSync(__dirname + '/../mywago/media/'+ (wago.load.files.tga || wago.load.files.blp))
                    wago.fileSize = (""+(fstats["size"] / 1000)).replace(/\B(?=(\d{3})+(?!\d))/g, ",") // kilobytes

                    cb()
                },
                user: function(cb){
                    if (req.user && req.user._id.equals(wago._userId))
                        wago.can_edit = true
                    else
                        wago.can_edit = false

                    if (wago._userId!=null) {
                        User.findById(wago._userId, function(err, user) {
                        // if there are any errors, return the error
                            if (err)
                                return cb(err);

                            // check to see if theres already a user with that email
                            if (user && user.account.username) {
                                wago.username = user.account.username
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            }
                            else if (user) {
                                wago.username = 'User-'+user._id
                                wago.userclass = user.roleclass
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            } else {
                                wago.username = "a guest"
                                wago.userclass = ""
                                wago.userlink = false
                                wago.authorHuman = false
                            }
                            cb(null, true)
                        })
                    }
                    else {
                        wago.username = "a guest"
                        cb(null, true)
                    }
                }
            }, function(err, x) {
                if (err && err.redirect) {
                    res.redirect(err.redirect)
                    return
                }
                if (err) return

                if (wago.type=='WEAKAURAS2') wago.type = 'WEAKAURA'

                pageinfo.title = wago.name
                pageinfo.description = bb2markdown(wago.description).substring(0, 155)
                res.locals.body.id = "page-wago"

                // wago found, display it
                if (wago.type=="COLLECTION") {
                    if (req.query.sort=='stars') {
                        pageinfo.sort='Stars'
                    }
                    else if (req.query.sort=='views') {
                        pageinfo.sort='Views'
                    }
                    else if (req.query.sort=='comments') {
                        pageinfo.sort='Comments'
                    }
                    else if (req.query.sort=='commentdate') {
                        pageinfo.sort='Comment Date'
                    }
                    else { // date
                        pageinfo.sort='Date'
                    }
                    require("./search3")({ _id: { $in: wago.collect} }, req, res, function(err, results) {
                        if (results.total>=14)
                            results.more = { lookup: "/"+wago._id, page: 1, sort: pageinfo.sort.toLowerCase() }

                        if (req.query.fetch=="more")
                            res.render('static/aura-list.ejs', { auralist: results });
                        else
                            res.render('wago-view.ejs', {wago: wago, auralist: results, pageinfo: pageinfo, moment: require('moment'), custom_func: false, pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                    })
                }
                else if (wago.type=="IMAGE") {
                    res.locals.body.id = "page-media"
                    res.render('media-view.ejs', { wago: wago, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                }
                else if (wago.type=="WAFFLE") {
                    res.locals.body.id = "page-waffle"
                    res.render('aprilfools/waffle-view.ejs', { wago: wago, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                }

                else {
                    if (req.query.test)
                        res.render('test.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                    else
                        res.render('wago-view.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), pageinfo: pageinfo, categories: selectizeCategories, versionMsg: req.flash('versionMsg')  });
                }

            })
        });
    });

    // =====================================
    // MODIFY WEAKAURA =====================
    // =====================================

    app.post('/:wagoID/modify', isLoggedIn, function(req, res) {
        wagoID = req.params.wagoID
        var Wago = require('./models/wagoitem');
                // file upload https://github.com/expressjs/multer
        Wago.findOne({ '_id' :  wagoID, '_userId' : req.user._id }, function(err, aura) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no aura is found, return the message
            if (!aura || aura==null) {
                res.send('Nothing to modify.');
                return
            }
            else {
                if (req.body.name!="")
                    aura.name = req.body.name.trim()

                aura.description = req.body.description
                // TODO: filter/verify categories input
                var current_categories = aura.categories || []
                aura.categories = req.body.categories || []

                if (req.body.auravisibility=="Hidden")
                    aura.hidden = true
                else
                    aura.hidden = false

                if (req.body.auravisibility=="Private")
                    aura.private = true
                else
                    aura.private = false

                if (req.body.beta!="Live" && require('./static_vars').beta_option) {
                    aura.wow_beta = true
                    aura.categories.push(require('./static_vars').beta_option.key)
                }
                else
                    aura.wow_beta = false

                // check vuhdo subcategories
                if (aura.type=="VUHDO") {
                    if (current_categories.indexOf("vuhdo1")>=0)
                        aura.categories.push("vuhdo1")
                    if (current_categories.indexOf("vuhdo2")>=0)
                        aura.categories.push("vuhdo2")
                    if (current_categories.indexOf("vuhdo3")>=0)
                        aura.categories.push("vuhdo3")
                }

                // if snippet, keep snippet category
                else if (aura.type=="SNIPPET")
                    aura.categories.push('snip0')

                // remove dupes
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                aura.categories = aura.categories.filter(onlyUnique)

                if (req.user.access.custom_slug && aura.slug!=req.body.customurl) {
                    // submitting custom url, confirm that it is unique before saving
                    require('./wago_lib').checkCustomSlug(req.body.customurl, function(slug) {
                        if (!slug) {
                            aura.save(function() {
                                req.flash('auraMsg', "Unable to use that custom URL. Your other changes have been updated.")
                                res.redirect('/'+wagoID)
                                return
                            })
                        }
                        else {

                            if (slug=="" || slug==aura._id.toString() || slug=="CLEAR")
                                aura.custom_slug = null
                            else {
                                aura.custom_slug = slug
                            }

                            aura.save(function() {
                                req.flash('auraMsg', "Your aura has been updated.")
                                res.redirect('/'+wagoID)
                            })
                        }
                    })
                }
                else {
                    aura.save(function() {
                        req.flash('auraMsg', "Your aura has been updated.")
                        res.redirect('/'+wagoID)
                    })
                }
            }
        })
    })
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

function hasBetaAccess(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.access.beta)
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}

function hasAlphaAccess(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated() && req.user.access.alpha)
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}


function a_or_an(noun) {
    if (!noun || noun.length==0) return '';
    first = noun.charAt(0).toLowerCase()
    if (first=='a' || first=='e' || first=='i' || first=='o' || first=='u')
        return 'an'
    else
        return 'a'
}

function find_custom_functions(data, callback) {
    fn = []

    // if group of auras
    if (!data.c) {
        single_aura = true
        data.c = [data.d]
    }
    else
        single_aura = false

    for(var k in data.c) {
        if (!data.c[k]) continue
        // onInit
        if (data.c[k].actions && data.c[k].actions.init && data.c[k].actions.init.do_custom)
            fn.push({name: data.c[k].id+': onInit', func: data.c[k].actions.init.custom, path: 'c['+k+'].actions.init.custom' })

        // onStart
        if (data.c[k].actions && data.c[k].actions.start && data.c[k].actions.start.do_custom)
            fn.push({ name: data.c[k].id+': onStart', func: data.c[k].actions.start.custom, path: 'c['+k+'].actions.start.custom' })

        // onFinish
        if (data.c[k].actions && data.c[k].actions.finish && data.c[k].actions.finish.do_custom)
            fn.push({name: data.c[k].id+': onFinish', func: data.c[k].actions.finish.custom, path: 'c['+k+'].actions.finish.custom' })

        // displayText
        if ((typeof(data.c[k].displayText)=="string" && data.c[k].displayText.indexOf('%c')>-1)
        || (typeof(data.c[k].text1)=="string" && data.c[k].text1.indexOf('%c')>-1)
        || (typeof(data.c[k].text2)=="string" && data.c[k].text2.indexOf('%c')>-1))
            fn.push({ name: data.c[k].id+': DisplayText', func: data.c[k].customText, path: 'c['+k+'].customText' })

        if (typeof(data.c[k].displayStacks)=="string" && data.c[k].displayStacks.indexOf('%c')>-1)
            fn.push({ name: data.c[k].id+': DisplayStacks', func: data.c[k].customText, path: 'c['+k+'].customText' })   

        // main trigger
        if (data.c[k].trigger && data.c[k].trigger.type=='custom' && data.c[k].trigger.custom) {
            fn.push({ name: data.c[k].id+': Trigger1', func: data.c[k].trigger.custom, path: 'c['+k+'].trigger.custom' })

            // main untrigger
            if (data.c[k].untrigger && data.c[k].untrigger.custom && data.c[k].untrigger.custom.length>0)
                fn.push({ name: data.c[k].id+': UnTrigger1', func: data.c[k].untrigger.custom, path: 'c['+k+'].untrigger.custom' })

            // icon
            if (data.c[k].trigger && data.c[k].trigger.customIcon && data.c[k].trigger.customIcon.length>0)
                fn.push({ name: data.c[k].id+': Icon', func: data.c[k].trigger.customIcon, path: 'c['+k+'].trigger.customIcon' })

            // texture
            if (data.c[k].trigger && data.c[k].trigger.customTexture && data.c[k].trigger.customTexture.length>0)
                fn.push({ name: data.c[k].id+': Texture', func: data.c[k].trigger.customTexture, path: 'c['+k+'].trigger.customTexture' })

            // duration
            if (data.c[k].trigger && data.c[k].trigger.customDuration && data.c[k].trigger.customDuration.length>0)
                fn.push({ name: data.c[k].id+': Duration', func: data.c[k].trigger.customDuration, path: 'c['+k+'].trigger.customDuration' })
        }

        // additional triggers
        if (data.c[k].additional_triggers && data.c[k].additional_triggers.length>0) {
            for (var j in data.c[k].additional_triggers) {
                if (data.c[k].additional_triggers[j].trigger.type=='custom' && data.c[k].additional_triggers[j].trigger.custom)
                    fn.push({ name: data.c[k].id+': Trigger'+(parseInt(j)+2), func: data.c[k].additional_triggers[j].trigger.custom, path: 'c['+k+'].additional_triggers['+j+'].trigger.custom' })

                if (data.c[k].additional_triggers[j].untrigger.custom && data.c[k].additional_triggers[j].untrigger.custom.length>0)
                    fn.push({ name: data.c[k].id+': UnTrigger'+(parseInt(j)+2), func: data.c[k].additional_triggers[j].untrigger.custom, path: 'c['+k+'].additional_triggers['+j+'].untrigger.custom' })

                // icon
                if (data.c[k].additional_triggers[j].trigger && data.c[k].additional_triggers[j].trigger.customIcon && data.c[k].additional_triggers[j].trigger.customIcon.length>0)
                    fn.push({ name: data.c[k].id+': Icon', func: data.c[k].additional_triggers[j].trigger.customIcon, path: 'c['+k+'].additional_triggers['+j+'].trigger.customIcon' })

                // texture
                if (data.c[k].additional_triggers[j].trigger && data.c[k].additional_triggers[j].trigger.customTexture && data.c[k].additional_triggers[j].trigger.customTexture.length>0)
                    fn.push({ name: data.c[k].id+': Texture', func: data.c[k].additional_triggers[j].trigger.customTexture, path: 'c['+k+'].additional_triggers['+j+'].trigger.customIcon' })

                // duration
                if (data.c[k].additional_triggers[j].trigger && data.c[k].additional_triggers[j].trigger.customDuration && data.c[k].additional_triggers[j].trigger.customDuration.length>0)
                    fn.push({ name: data.c[k].id+': Duration', func: data.c[k].additional_triggers[j].trigger.customDuration, path: 'c['+k+'].additional_triggers['+j+'].trigger.customDuration' })
            }
        }

        if (data.c[k].disjunctive=='custom' && data.c[k].customTriggerLogic && data.c[k].customTriggerLogic.length>0)
            fn.push({ name: data.c[k].id+': Trigger Logic', func: data.c[k].customTriggerLogic, path: 'c['+k+'].customTriggerLogic' })

        // start animation color
        if (data.c[k].animation && data.c[k].animation.start && data.c[k].animation.start.colorType=='custom' && data.c[k].animation.start.colorFunc)
            fn.push({ name: data.c[k].id+': Animation/Start Color', func: data.c[k].animation.start.colorFunc, path: 'c['+k+'].animation.start.colorFunc' })

        // start animation alpha
        if (data.c[k].animation && data.c[k].animation.start && data.c[k].animation.start.alphaType=='custom' && data.c[k].animation.start.alphaFunc)
            fn.push({ name: data.c[k].id+': Animation/Start Alpha', func: data.c[k].animation.start.alphaFunc, path: 'c['+k+'].animation.start.alphaFunc' })

        // start animation scale
        if (data.c[k].animation && data.c[k].animation.start && data.c[k].animation.start.scaleType=='custom' && data.c[k].animation.start.scaleFunc)
            fn.push({ name: data.c[k].id+': Animation/Start Scale', func: data.c[k].animation.start.scaleFunc, path: 'c['+k+'].animation.start.scaleFunc' })

        // start animation translate
        if (data.c[k].animation && data.c[k].animation.start && data.c[k].animation.start.translateType=='custom' && data.c[k].animation.start.translateFunc)
            fn.push({ name: data.c[k].id+': Animation/Start Translate', func: data.c[k].animation.start.translateFunc, path: 'c['+k+'].animation.start.translateFunc' })

        // main animation color
        if (data.c[k].animation && data.c[k].animation.main && data.c[k].animation.main.colorType=='custom' && data.c[k].animation.main.colorFunc)
            fn.push({ name: data.c[k].id+': Animation/Main Color', func: data.c[k].animation.main.colorFunc, path: 'c['+k+'].animation.main.colorFunc' })

        // main animation alpha
        if (data.c[k].animation && data.c[k].animation.main && data.c[k].animation.main.alphaType=='custom' && data.c[k].animation.main.alphaFunc)
            fn.push({ name: data.c[k].id+': Animation/Main Alpha', func: data.c[k].animation.main.alphaFunc, path: 'c['+k+'].animation.main.alphaFunc' })

        // main animation scale
        if (data.c[k].animation && data.c[k].animation.main && data.c[k].animation.main.scaleType=='custom' && data.c[k].animation.main.scaleFunc)
            fn.push({ name: data.c[k].id+': Animation/Main Scale', func: data.c[k].animation.main.scaleFunc, path: 'c['+k+'].animation.main.scaleFunc' })

        // main animation translate
        if (data.c[k].animation && data.c[k].animation.main && data.c[k].animation.main.translateType=='custom' && data.c[k].animation.main.translateFunc)
            fn.push({ name: data.c[k].id+': Animation/Main Translate', func: data.c[k].animation.main.translateFunc, path: 'c['+k+'].animation.main.translateFunc' })
    }

    if (single_aura) {
        for (i=0; i<fn.length; i++) {
            fn[i].path = fn[i].path.replace('c[0].', 'd.')
            fn[i].name = fn[i].name.replace(data.c[k].id+': ', '').trim()
        }
    }

    callback(fn)
}


function bb2markdown(str) {
    //general BBcode conversion
    return str
        .replace(/\[b\]((?:.|\n)+?)\[\/b\]/gmi, '**$1**') //bold; replace [b] $1 [/b] with ** $1 **
        .replace(/\[\u\]((?:.|\n)+?)\[\/\u\]/gmi, '*$1*')  //underline; replace [u] $1 [/u] with * $1 *
        .replace(/\[s\]((?:.|\n)+?)\[\/s\]/gmi, '~~ $1~~') //strikethrough; replace [s] $1 [/s] with ~~ $1 ~~
        .replace(/\[color\=.+?\]((?:.|\n)+?)\[\/color\]/gmi, '$1') //remove [color] tags
        .replace(/\[list\=1\]((?:.|\n)+?)\[\/list\]/gmi, function (match, p1, offset, string) {return p1.replace(/\[\*\]/gmi, '1. ');})
        .replace(/(\n)\[\*\]/gmi, '$1* ') //lists; replcae lists with + unordered lists.
        .replace(/\[\/*list\]/gmi, '')
        .replace(/\[img\]((?:.|\n)+?)\[\/img\]/gmi,'![]($1)')
        .replace(/\[url=(.+?)\]((?:.|\n)+?)\[\/url\]/gmi,'[$2]($1)')
        .replace(/\[code\](.*?)\[\/code\]/gmi, '`$1`')
        .replace(/\[code\]((?:.|\n)+?)\[\/code\]/gmi, function (match, p1, offset, string) {return p1.replace(/^/gmi, '    ');});

}