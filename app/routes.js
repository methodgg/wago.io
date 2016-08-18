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
    require('./api/api-routes.js')(app);


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
        res.render('account.ejs', {
            profileMsg: req.flash('profileMsg'),
            accountMsg: req.flash('accountMsg'),
        });
    });



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
        var Wago = require('./models/wagoitem');

        var async = require('async')
        var lists = {}

        async.parallel([
            // newest auras
            function(cb) {
                Wago.find({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}], modified: null }).limit(9).sort('-created').exec(function(err, auras) {
                    if (err)
                        throw err;
                    lists.newest = auras
                    cb()
                })
            },

            // latest updates
            function(cb) {
                Wago.find({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}], modified: { $ne: null } }).limit(9).sort('-modified').exec(function(err, auras) {
                    if (err)
                        throw err;
                    lists.updates = auras
                    cb()

                })
            },

            // most stars
            function(cb) {
                Wago.aggregate().match({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}] }).project({ '_id': 1, 'name': 1, 'popularity.views': 1, 'stars': { '$size': '$popularity.favorites'}})
                  .sort({'stars':-1, 'popularity.views':-1}).limit(9).exec(function(err, auras) {
                    if (err)
                        throw err;
                    lists.stars = auras
                    cb()
                })
            }
        ], function() {
            var flashMsg = req.flash('indexMsg')[0]
            res.render('index.ejs', { flashMsg: flashMsg, lists: lists, moment: require('moment') });
        })
    });


    // =====================================
    // CATEGORIES ==========================
    // =====================================
    app.get('/categories', function(req, res) {
        var categories = require('./models/categories')
        var Wago = require('./models/wagoitem');
        var async = require('async');

        async.forEachOf(categories, function (item, key, cb) {
            async.parallel([
                function(cb2) {
                    Wago.count({ 'categories' : item.id, 'hidden' : false, 'private': false }, function(err, count) {
                        if (err) return callback(err);
                        categories[key].count = count
                        cb2()
                    })
                }
            ], function(err, results) {
                cb()
            })

        }, function(err) {
            console.log("ERROR", err)
            res.render('categories.ejs', {categories: categories})
        })
    })

    app.get('/categories/:category?/:subcategory?/:subsubcategory?', function(req, res) {
        var categories = require('./models/categories')

        var selected_category = req.params.category
        if (req.params.subcategory)
            selected_category = selected_category + "/" + req.params.subcategory
        if (req.params.subsubcategory)
            selected_category = selected_category + "/" + req.params.subsubcategory

        var search_categories = []
        for (i=0;i<categories.length;i++) {
            if (categories[i].slug.indexOf(selected_category)>-1) {
                search_categories.push({'categories': categories[i].id})
            }
        }

        for (i=0;i<categories.length;i++) {
            if (categories[i].slug==selected_category) {
                var pageinfo = { name: categories[i].text }
                require("./search2")({ 'hidden' : false, 'private': false, $or: search_categories, page: req.query.page }, req, res, function(err, results) {
                    if (results.count>=14)
                        results.more = { lookup: "/categories/"+selected_category, page: 1 }

                    if (req.query.fetch=="more")
                        res.render('static/aura-list-more.ejs', { auralist: results });
                    else
                        res.render('viewcategory.ejs', { pageinfo: pageinfo, auralist: results });
                })
            }
        }
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
        if (!search.q || search.q=="") {
            res.render('search.ejs', { options: {}, auralist: {count:0} });
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
        if (queryCategories.length>0 && search.searchAllCategories)
            criteria["$and"] = [{$or : queryFields}, {$or : queryTypes}, {$and : queryCategories}]
        else if (queryCategories.length>0)
            criteria["$and"] = [{$or : queryFields}, {$or : queryTypes}, {$or : queryCategories}]
        else
            criteria["$and"] = [{$or : queryFields}, {$or : queryTypes}]

        if (search.searchAnonymous)
            criteria.anonymous = true

        var sortBy = 'orderByDate' // orderByDate uses update date, or create date if there is no update date
        if (search.sortBy=='created')
            sortBy = 'created'
        else if (search.sortBy=='name')
            sortBy = 'name'
        else if (search.sortBy=='stars')
            sortBy = 'stars'


        criteria.sort = {}
        if (search.sortDirection=='ASC')
            criteria.sort[sortBy] = 1
        else
            criteria.sort[sortBy] = -1

        criteria.page = search.page || 0

        require("./search2")(criteria, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/search?q="+search.q, page: 1 }

            if (search.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('search.ejs', { options: search, auralist: results });
        })
    }

    app.get('/search', function(req, res) {
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
        }
        return advancedSearch(search, req, res)
    })
    app.post('/search', function(req, res) {
        return advancedSearch(req.body, req, res)
    })


    app.get('/search/stars', function(req, res) {
        var search = { sort: {'stars':-1, 'popularity.views':-1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/search/stars", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Popular favorites", auralist: results });
        })
    })

    app.get('/search/updates', function(req, res) {
        var search = { 'private': false, 'hidden': false, sort: {'modified': -1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/search/updates", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Latest updates", auralist: results });
        })
    })

    app.get('/search/newest', function(req, res) {
        var search = { 'private': false, 'hidden': false, sort: {'created':-1}, page: req.query.page, max: 200 }

        require("./search2")(search, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/search/newest", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('search-standard.ejs', { type:"Latest updates", auralist: results });
        })
    })

    // =====================================
    // FAVORITES ===========================
    // =====================================
    app.get('/my-stars', isLoggedIn, function(req, res) {
        var search = { "popularity.favorites": req.user._id, $or:[{"private": false}, {"_userId": req.user._id}], page: req.query.page }

        require("./search2")(search, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/my-stars", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('favorites.ejs', { auralist: results });
        })
    })


    // =====================================
    // MEDIA ===============================
    // =====================================
    app.get('/media', function(req, res) {
        // ./nconvert/nconvert -out png /home/mark/wago.io/public/test/*.blp

        var Media = require('./models/wagoitem')
        Media.find({ 'hidden' : false, 'private': false, $or: [{type: 'IMAGE'}, {type: 'FONT'}, {type: 'AUDIO'}] }).limit(9).sort('-created').exec(function(err, media) {
            if (err)
                throw err;
            res.render('media.ejs', { message: req.flash('mediaMsg'), latest: media });
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
        if (!req.file) {
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
    // MY WAGO =============================
    // =====================================
    app.get('/mywago', isLoggedIn, function(req, res) {
        var search = { $or: [{ "_userId": req.user._id}, {$and: [{"popularity.favorites": req.user._id, "private": false}] }], mywago: "count" }

        require('./search2')(search, req, res, function(err, media) {
            res.render('mywago.ejs', { mywagofiles: media.list.length });
        })
    })

    app.get('/mywago/download', isLoggedIn, function(req, res) {
        var search = { $or: [{ "_userId": req.user._id}, {$and: [{"popularity.favorites": req.user._id, "private": false}] }], mywago: "zip" }

        require('./search2')(search, req, res, function(err, _media) {
            if (_media.list.length==0) return res.send("NO FILES")

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
                    async.forEachOf(_media.list, function(media, key, cb) {
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
        var site = {}
        var profile = {}
        var User = require('./models/user');

        User.findOne({'account.username': new RegExp('^'+req.params.user+'$', "i")}, function(err, lookup) {
            if (err || !lookup) {
                req.flash('profileMsg', "Yikes! An error occurred.")
                res.redirect('/account')
                return
            }

            profile.name = lookup.account.username

            if (lookup.account.hidden && req.user && lookup._id.equals(req.user._id))
                profile.visible = 'my-private'
            else if (lookup.account.hidden) {
                profile.visible = 'private'
                profile.auras = {}
                res.render('profile.ejs', { profile: profile });
                return
            }
            else
                profile.visible = 'show'

            if (req.user && lookup._id.equals(req.user._id))
                var search = { 'owner._id': lookup._id, page: req.query.page }
            else
                var search = { 'owner._id': lookup._id, 'private': false, 'hidden': false, page: req.query.page }

            site.title = profile.name
            site.description = "Profile page for "+profile.name

            require("./search2")(search, req, res, function(err, results) {
                if (results.count>=14)
                    results.more = { lookup: "/p/"+profile.name, page: 1 }
                if (req.query.fetch=="more")
                    res.render('static/aura-list-more.ejs', { auralist: results });
                else
                    res.render('profile.ejs', { profile: profile, auralist: results, site: site });
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
                            console.error('twitch', json, 'https://api.twitch.tv/kraken/videos/v'+video.videoID)
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
                        if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui encoding
                            console.error('Unable to detect encoding type')
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        }

                        // elvui string detected
                        importWago.type = 'ELVUI'
                        return processImport(req, res, importWago, 'CREATE')
                    }

                    // weakaura string detected
                    importWago.type = 'WEAKAURAS2'
                    return processImport(req, res, importWago, 'CREATE')
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
                if (/[^a-zA-Z0-9=\+\/]/.exec(importWago.string)) { // if not elvui encoding
                    console.error('Unable to detect encoding type')
                    req.flash('indexMsg', "Invalid string entered.")
                    res.redirect('/')
                    return
                }

                // elvui string detected
                importWago.type = 'ELVUI'
                return processImport(req, res, importWago, 'CREATE')
            }

            // weakaura string detected
            importWago.type = 'WEAKAURAS2'
            return processImport(req, res, importWago, 'CREATE')
        }
    })

    // =====================================
    // AURA CLONE/FORK =====================
    // =====================================
    app.post('/aura/fork', function(req, res) {
        var wagoID = req.body.wagoID
        var Wago = require('./models/wagoitem');

        if (req.body.json) {
            var json = JSON.parse(req.body.json)
            if (!json) {
                res.send('{"err": "Invalid data entered."}')
                return
            }
        }

        Wago.findOne({ '_id' :  wagoID }, function(err, wago) {
            if (!wago.type) {
                console.error('Error forking:', req, res)
                res.send('Error could not fork.')
                return false
            }
            if (wago.type=='WEAKAURAS2') {
                // convert json to WA export string, then process like normal.
                require('child_process').exec('luajit ./json2wa.lua "'+JSON.stringify(json).replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"'
                 , {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, WeakAuraString) {
                    var importWago = {string: WeakAuraString, type: 'WEAKAURAS2'}
                    return processImport(req, res, importWago, 'CLONE')
                })
            }

            else if (wago.type=='ELVUI') {
                // convert json to WA export string, then process like normal.
                require('child_process').exec('luajit ./json2elv.lua "'+JSON.stringify(json).replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"'
                 , {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, WeakAuraString) {
                    var importWago = {string: WeakAuraString, type: 'WEAKAURAS2'}
                    return processImport(req, res, importWago, 'CLONE')
                })
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

        if (req.body.json) {
            var json = JSON.parse(req.body.json)
            if (!json) {
                res.send('{"err": "Invalid data entered."}')
                return
            }
        }

        Aura.findOne({ '_id' :  req.body.auraID }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                // if saving a WA
                if (aura.type=="WEAKAURAS2") {
                    if (aura.wow_beta && !require('./static_vars').beta_option) {
                        aura.wow_beta = false
                        aura.save()
                    }

                    var JSON_str = JSON.stringify(json)

                    require('child_process').exec('luajit ./json2wa.lua "'+JSON_str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"',
                     {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, importString) {
                        var importWago = {string: importString, type: aura.type}
                        return processImport(req, res, importWago, 'SAVE', req.body.auraID)
                    });
                }
                else if (aura.type=="ELVUI") {
                    if (aura.wow_beta && !require('./static_vars').beta_option) {
                        aura.wow_beta = false
                        aura.save()
                    }

                    var JSON_str = JSON.stringify(json)
                    console.error(json.auras)
                    console.error('LUA: ', 'luajit ./json2elv.lua "'+JSON_str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"')

                    require('child_process').exec('luajit ./json2elv.lua "'+JSON_str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"',
                     {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, importString) {
                        console.error(importString)
                        var importWago = {string: importString, type: aura.type}
                        return processImport(req, res, importWago, 'SAVE', req.body.auraID)
                    });
                }

                // if saving a snippet
                else if (aura.type=="SNIPPET") {
                    _Snippet = require('./models/aura-code');
                    var snippet = new _Snippet();

                    snippet.lua = req.body.lua
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
            if (/[^a-zA-Z0-9=\+\/]/.exec(importString)) { // if not elvui encoding
                console.error('Unable to detect encoding type')
                req.flash('indexMsg', "Invalid string entered.")
                res.redirect('/')
                return
            }
                                                            
            // elvui string detected
            importType = 'ELVUI'
        }
        else {
            importType = 'WEAKAURAS2'
        }

        var Aura = require('./models/wagoitem');
        Aura.findOne({ '_id' :  auraID, type: importType }, function(err, aura) {
            if (req.user && req.user._id.equals(aura._userId)) {
                if (aura.wow_beta && !require('./static_vars').beta_option) {
                    aura.wow_beta = false
                    aura.save()
                }
                var importWago = {string: importString, type: aura.type}
                return processImport(req, res, importWago, 'REPLACE', auraID)
            }
        })
    })

    // =====================================
    // AURA EXPORT CODE ====================
    // =====================================
    app.post('/aura/export', function(req, res) {
        // FIXME: is this still even used?
        var valid = JSON.parse(req.body.json)
        if (!valid) {
            res.send('Error parsing Table Data')
            return
        }

        // convert json to WA export string, then process like normal. So lazy!
        require('child_process').exec('luajit ./json2wa.lua "'+JSON.stringify(valid).replace(/\\/g, '\\\\').replace(/"/g, '\\"')+'"', {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 15}, function(err, importWA) {
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

                Comment.wagoID = wagoID
                Comment.authorID = req.user._id
                Comment.commentText = commentText
                Comment.inReplyTo = inReplyTo
                if (wago._userId)
                    Comment.usersTagged.push({userID: wago._userId})

                var re = /@([^.,\/@#!$%\^&\*;:{}=`~()\s]+)/g
                user_matches = []
                while ((m = re.exec(commentText)) !== null) {
                    user_matches.push(m[1])
                }

                if (user_matches.length>0) {
                    var async = require('async')
                    var User = require('./models/user')
                    async.forEachOf(user_matches, function (taggedUsername, key, cb) {
                        User.findOne({'account.username': taggedUsername}).exec(function(err, foundUser) {
                            if (foundUser) {
                                Comment.usersTagged.pull({userID: foundUser._id})
                                Comment.usersTagged.push({userID: foundUser._id})
                                Comment.commentText = Comment.commentText.replace("@"+taggedUsername, "[taggeduser]@"+taggedUsername+"[/taggeduser]")
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

                Comment.find({"_id": commentID, wagoID: wagoID}).remove().exec()
                res.send('{"result": "Deleted"}')
            })
        }
    })

    // =====================================
    // COMMENTS AT ME ======================
    // =====================================
    app.get('/comments-at-me', isLoggedIn, function(req, res) {
        var wagoIds=[]
        for (i=0; i<res.locals.unreadComments.length; i++) {
            wagoIds.push(res.locals.unreadComments[i].wagoID)
        }

        var search = { "_id": { $in: wagoIds}, "private": false, page: req.query.page}

        require('./search2')(search, req, res, function(err, results) {
            if (results.count>=14)
                results.more = { lookup: "/comments-at-me", page: 1 }

            if (req.query.fetch=="more")
                res.render('static/aura-list-more.ejs', { auralist: results });
            else
                res.render('comments-at-me.ejs', { auralist: results });
        })
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

        Wago.findOneAndUpdate({ '_id' :  wagoID, $or:[{"private": false}, {"_userId": private_user_id}] }, { "last_accessed": Date.now() }, function(err, wago) {
            if (!wago || wago==null) {
                req.flash('indexMsg', "Could not find that wago *"+wagoID+"*")
                res.redirect('/')
                return
            }

            require("./search2")({ 'hidden' : false, 'private': false, collect: wagoID, page: req.query.page }, req, res, function(err, results) {
                if (results.count>=14)
                    results.more = { lookup: "/"+wagoID+"/collections", page: 1 }

                if (req.query.fetch=="more")
                    res.render('static/aura-list-more.ejs', { auralist: results });
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

    // =====================================
    // SELECTED WEAKAURA ===================
    // =====================================
    app.get('/:wagoID/:version([0-9]*)?', function(req, res) {
        // prep site vars
        var site = {}

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

        Wago.findOneAndUpdate({ '_id' :  wagoID}, { $inc: { 'popularity.views': 1 }, "last_accessed": Date.now() }, function(err, wago) {
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

                    if (wago.categories) {
                        for(k=0;k<Categories.length;k++) {
                            for(j=0;j<wago.categories.length;j++) {
                                if (wago.categories[j]==Categories[k].id) {
                                    realcats[Categories[k].id] = Categories[k]
                                    if (Categories[k].parent)
                                        delete realcats[Categories[k].parent]
                                }
                            }
                        }
                    }
                    wago.categoryData = realcats
                    cb()
                },
                code: function(cb){
                    if (wago.type!="WEAKAURAS2" && wago.type!='SNIPPET' && wago.type!='ELVUI') return cb()

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

                        if (wago.type=="WEAKAURAS2") {
                            data = JSON.parse(wago.code.json)
                            delete data.lua_table

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
                    })
                },
                getComments: function(cb){
                    var Comments = require('./models/comment')
                    Comments.find({'wagoID': wagoID}).sort('-postDate').exec(function(err, comments) {
                        async.forEachOf(comments, function (comment, commentkey, cb2) {
                            User.findById(comment.authorID, function(err, user) {
                                comments[commentkey].authorName = user.account.username
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
                            if (user) {
                                wago.username = user.account.username
                                wago.userlink = !user.account.hidden
                                wago.authorHuman = user.account.verified_human
                            } else {
                                wago.username = "a guest"
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


                site.title = wago.name
                site.description = wago.description.replace(/<(?:.|\n)*?>/gm, '').substring(0, 240)

                // wago found, display it
                if (wago.type=="COLLECTION") {
                    require("./search2")({ _id: { $in: wago.collect} }, req, res, function(err, results) {
                        if (results.count>=14)
                            results.more = { lookup: "/collection/"+wago._id, page: 1 }

                        if (req.query.fetch=="more")
                            res.render('static/aura-list-more.ejs', { auralist: results });
                        else
                            res.render('wago-view.ejs', {wago: wago, auralist: results, moment: require('moment'), custom_func: false, site: site, categories: require('./models/categories')  });
                    })
                }
                else if (wago.type=="IMAGE")
                    res.render('media-view.ejs', { media: wago, moment: require('moment'), site: site, categories: require('./models/categories')  });

                //else if (wago._id=="EJVb2hWQW")
                //    res.render('test-view.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), site: site, categories: require('./models/categories')  });
                else
                    res.render('wago-view.ejs', { wago: wago, auralist: false, custom_func: custom_func, moment: require('moment'), site: site, categories: require('./models/categories')  });

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
                aura.categories = req.body.categories || []

                if (req.body.wagovisibility=="Hidden")
                    aura.hidden = true
                else
                    aura.hidden = false

                if (req.body.wagovisibility=="Private")
                    aura.private = true
                else
                    aura.private = false

                if (aura.type=='WEAKAURAS2' && req.body.beta!="Live" && require('./static_vars').beta_option) {
                    aura.wow_beta = true
                    aura.categories.push(require('./static_vars').beta_option.key)
                }
                else
                    aura.wow_beta = false

                if (aura.type=="SNIPPET")
                    aura.categories.push('snip0')

                // remove dupes
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                aura.categories = aura.categories.filter(onlyUnique)

                aura.save(function() {
                    req.flash('auraMsg', "Your aura has been updated.")
                    res.redirect('/'+wagoID)
                })
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
        if ((data.c[k].displayText && data.c[k].displayText.indexOf('%c')>-1) || data.c[k].displayStacks && data.c[k].displayStacks.indexOf('%c')>-1)
            fn.push({ name: data.c[k].id+': DisplayText', func: data.c[k].customText, path: 'c['+k+'].customText' })

        // main trigger
        if (data.c[k].trigger && data.c[k].trigger.type=='custom' && data.c[k].trigger.custom) {
            fn.push({ name: data.c[k].id+': Trigger1', func: data.c[k].trigger.custom, path: 'c['+k+'].trigger.custom' })

            // main untrigger
            if (data.c[k].untrigger && data.c[k].untrigger.custom && data.c[k].untrigger.custom.length>0)
                fn.push({ name: data.c[k].id+': UnTrigger1', func: data.c[k].untrigger.custom, path: 'c['+k+'].untrigger.custom' })

            // icon
            if (data.c[k].trigger && data.c[k].trigger.customIcon && data.c[k].trigger.customIcon.length>0)
                fn.push({ name: data.c[k].id+': Icon', func: data.c[k].trigger.customIcon, path: 'c['+k+'].trigger.customIcon' })

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

function processImport(req, res, importWago, action, auraID) {
    if (importWago.string.length>112000 && !importWago.file) {
        var fs = require('fs')
        var file = "/tmp/wagoimport_"+Date.now()
        fs.writeFile(file, importWago.string.trim(), function(err) {
            if(err) {
                req.flash('indexMsg', "Could not save file.")
                res.redirect('/')
            }
            importWago.file = file

            return processImport(req, res, importWago, action, auraID)
        })
    }
    else {
        var luafile, importString
        if (importWago.type=='WEAKAURAS2')
            luafile = './wa2json.lua'
        else if (importWago.type=='ELVUI')
            luafile = './elv2json.lua'
        else {
            console.error("INVALID IMPORT UNKNOWN ENCODING TYPE", importWago)
            req.flash('indexMsg', "Invalid string entered.")
            res.redirect('/')
        }

        if (importWago.file)
            importString = importWago.file
        else
            importString = importWago.string.trim()

        require('child_process').exec('luajit '+luafile+' "'+importString+'"', {cwd: '/home/mark/wago.io/lua', maxBuffer: 1024 * 1024 * 5}, function(err, strJSON) {
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
                        var error = strJSON.replace(/(\.\/[^:]+):/, '')
                        console.error("INVALID IMPORT STRING3", error, strJSON)
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
                    else {
                        // verify data type
                        if (importWago.type=='WEAKAURAS2' && !objWago.v) {
                            console.error("INVALID WEAKAURAS2 IMPORT", objWago)
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        }

                        /*if (importWago.type=='ELVUI' && !objWago.v) {
                            console.error("INVALID WEAKAURAS2 IMPORT", objWago)
                            req.flash('indexMsg', "Invalid string entered.")
                            res.redirect('/')
                            return
                        } */

                        var Wago = new _WagoItem();
                        Wago.aura.code = AuraCode._id

                        if (importWago.type=='WEAKAURAS2')
                            Wago.name = objWago.d.id.trim()
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
                            Wago.wow_beta = true
                            Wago.categories = [require('./static_vars').beta_option.key]
                        }
                        else
                            Wago.wow_beta = false

                        if (action=='CLONE' && auraID)
                            Wago.clone_of = auraID

                        Wago.save(function(err) {
                            if (err)
                                throw err;
                            AuraCode.auraID = Wago._id
                            AuraCode.save(function(err, aura) {
                                if (err)
                                    throw err;
                                if (action=='CLONE' || action=='APICREATE') {
                                    res.setHeader('Content-Type', 'application/json')
                                    res.send('{"wago":"'+AuraCode.auraID+'"}')
                                }
                                else
                                    res.redirect('/'+AuraCode.auraID)
                            })
                        })
                    }
                }
            }
        })
    }
}

