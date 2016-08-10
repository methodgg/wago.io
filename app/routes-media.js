var MEDIA_TYPE_IMAGE=0
var MEDIA_TYPE_FONT=1
var MEDIA_TYPE_AUDIO=2

// app/routes.js
module.exports = function(app) {
    app.use(require('./wago_lib').collectVars);

    app.get('/media', function(req, res) {
        // ./nconvert/nconvert -out png /home/mark/wago.io/public/test/*.blp

        var Media = require('./models/media')
        Media.find({ 'meta.hidden' : false, 'meta.private': false }).limit(9).sort('-meta.created').exec(function(err, media) {
            if (err)
                throw err;
            res.render('media.ejs', { message: req.flash('mediaMsg'), latest: media });
        })
    })

    app.post('/media/:mediaID/modify', isLoggedIn, function(req, res) {
        mediaID = req.params.mediaID
        var Media = require('./models/media');
                // file upload https://github.com/expressjs/multer
        Media.findOne({ '_id' :  mediaID, '_userId' : req.user._id }, function(err, media) {
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
                    media.meta.name = req.body.name

                media.meta.description = req.body.description
                // TODO: filter/verify categories input
                media.meta.categories = req.body.categories || []

                media.meta.subtype = req.body.imagetype

                if (req.body.mediavisibility=="Hidden")
                    media.meta.hidden = true
                else
                    media.meta.hidden = false

                if (req.body.mediavisibility=="Private")
                    media.meta.private = true
                else
                    media.meta.private = false

                var sprite = { rows: parseInt(req.body.spriterows), columns: parseInt(req.body.spritecols), framecount: parseInt(req.body.spriteframes) }

                var imagefile = __dirname + '/../mywago/media/'+ (media.files[media.files.length-1].paths.jpg || media.files[media.files.length-1].paths.png)
                var sizeOf = require('image-size');
                var dimensions = sizeOf(imagefile);
                sprite.height = dimensions.height/sprite.rows
                sprite.width = dimensions.width/sprite.columns

                media.files[media.files.length-1].sprite = sprite

                // remove dupes
                function onlyUnique(value, index, self) {
                    return self.indexOf(value) === index;
                }
                media.meta.categories = media.meta.categories.filter(onlyUnique)

                media.save(function() {
                    req.flash('mediaMsg', "Your media has been updated.")
                    res.redirect('/media/'+mediaID)
                })
            }
        })
    })


    app.post('/media/:mediaID/delete', isLoggedIn, function(req, res) {
        mediaID = req.params.mediaID
        var Media = require('./models/media');
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
        var _Media = require('./models/media')
        var Media = new _Media()

        var file = req.file
        file.originalname = file.originalname.replace(/ /g, '_')
        var fs = require('fs')

        var root_dir = __dirname + '/../mywago/media/'
        var media_dir = Media._id+'/'
        var media_dir1 = media_dir + (new Date).getTime()+'/'
        var file_paths = {}
        var sprite = {}

        Media.meta.subtype = req.body.imagetype

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
                Media.meta.name = req.body.name
                if (Media.meta.name=="")
                    Media.meta.name = file.originalname

                if (req.body.mediavisibility=="Hidden")
                    Media.meta.hidden = true
                else
                    Media.meta.hidden = false

                if (req.user) {
                    Media._userId = req.user._id
                    if (req.body.mediavisibility=="Private")
                        Media.meta.private = true

                    if (req.body.anon=="Anonymous guest") {
                        Media.meta.private = false
                        Media.meta.hidden = false
                        Media._userId = null
                    }
                }


                if (extension=='blp') {
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
                if (Media.meta.subtype=='Sprite Sheet') {
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
            version = {paths: file_paths, original: extension, sprite: sprite}
            Media.files.push(version)
            Media.save(function() {
                res.redirect('/media/'+Media._id)
            })
        })
    })

    app.get('/media/:mediaID/:extension(blp|tga|png|jpg)/:version?', function(req, res) {
        var mediaID = req.params.mediaID

        // what version, do some verification
        var mediaVersion = parseInt(req.params.version)
        if (!Number.isInteger(mediaVersion)) {
            mediaVersion=-1
        }
        var Media = require('./models/media')
        var ent = require('ent')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        var extension = req.params.extension

        Media.findOneAndUpdate({ '_id' :  mediaID, $or:[{"meta.private": false}, {"_userId": private_user_id}] }, { $inc: { 'popularity.downloads': 1 } }, function(err, media) {
            if (mediaVersion>0 && media.files[mediaVersion-1])
                media.file = media.files[mediaVersion-1].paths
            else
                media.file = media.files[media.files.length-1].paths
            if (media.file[extension]) {
                var path = require('path')
                var fs = require('fs')

                var file = __dirname + '/../mywago/media/'+media.file[extension]
                var filename = path.basename(file)

                res.setHeader('Content-disposition', 'attachment; filename="' + media.meta.name+'.'+extension+'"')
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

        mediaVersion = parseInt(mediaVersion)
        var Media = require('./models/media')
        var ent = require('ent')

        if (req.user && req.user._id)
            var private_user_id = req.user._id
        else
            var private_user_id = null

        Media.findOneAndUpdate({ '_id' :  mediaID, $or:[{"meta.private": false}, {"_userId": private_user_id}] }, { $inc: { 'popularity.views': 1 } }, function(err, media) {
            // if there are any errors, return the error before anything else
            if (err) {
                console.error('selected media', err)
                res.end()
            }

            // if no aura is found, return the message
            if (!media || media==null) {
                req.flash('mediaMsg', "Could not find that media *"+mediaID+"*")
                res.redirect('/media')
                return
            }

            var User = require('./models/user');
            var async = require('async')
            var moment = require("moment")

            if (mediaVersion>0 && media.files[mediaVersion-1])
                media.file = media.files[mediaVersion-1]
            else
                media.file = media.files[media.files.length-1]

            var ddate = moment(media.file.uploaded)
            media.meta.display_date = ddate.format("MMM Do YYYY HH:mm")
            media.meta.display_date_ago = ddate.fromNow()

            async.parallel({
                /*categories: function(cb) {
                    var Categories = require('./models/categories')
                    var realcats = {}

                    if (aura.meta && aura.meta.categories) {
                        for(k=0;k<Categories.length;k++) {
                            for(j=0;j<aura.meta.categories.length;j++) {
                                if (aura.meta.categories[j]==Categories[k].id) {
                                    realcats[Categories[k].id] = Categories[k]
                                    if (Categories[k].parent)
                                        delete realcats[Categories[k].parent]
                                }
                            }
                        }

                        aura.meta.categoryData = realcats
                    }

                    cb()
                },*/
                getComments: function(cb){
                    var Comments = require('./models/comment')
                    Comments.find({'mediaID': mediaID}).sort('-postDate').exec(function(err, comments) {
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
                                            media.attnComments = true
                                            Comments.findOneAndUpdate({'_id': comments[commentkey]._id, 'usersTagged.userID': comments[commentkey].usersTagged[j].userID, 'usersTagged.read': false }, {$set: {'usersTagged.$': {"userID": comments[commentkey].usersTagged[j].userID, "read": true  }}},
                                                function(e, d) { }) // this doesn't seem to work without the callback?
                                        }
                                    }
                                }
                                cb2()
                            })
                        }, function() {
                            media.comments = comments
                            cb()
                        })
                    })
                },
                favorite: function(cb){
                    media.popularity.myfave = false
                    if (!req.user) {
                        return cb(null, true)
                    }

                    for (var i=0; i<media.popularity.favorites.length; i++) {
                        if (media.popularity.favorites[i].equals(req.user._id)) {
                            media.popularity.myfave = true
                            return cb(null, true)
                        }
                    }
                    cb(null, true)
                },
                user: function(cb){
                    if (req.user && req.user._id.equals(media._userId))
                        media.meta.can_edit = true
                    else
                        media.meta.can_edit = false

                    if (media._userId!=null) {
                        User.findById(media._userId, function(err, user) {
                        // if there are any errors, return the error
                            if (err)
                                return cb(err);

                            // check to see if theres already a user with that email
                            if (user) {
                                media.meta.username = user.account.username
                                media.meta.userlink = !user.account.hidden
                                media.meta.authorHuman = user.account.verified_human
                            } else {
                                media.meta.username = "a guest"
                                media.meta.userlink = false
                                media.meta.authorHuman = false
                            }
                            cb(null, true)
                        })
                    }
                    else {
                        media.meta.username = "a guest"
                        cb(null, true)
                    }
                },
                validDimensions: function(cb) {
                    var imagefile = __dirname + '/../mywago/media/'+ (media.file.paths.jpg || media.file.paths.png)
                    var sizeOf = require('image-size');
                    var dimensions = sizeOf(imagefile);
                    var height = dimensions.height
                    var width = dimensions.width

                    if (height>1024 || width > 1024)
                        media.file.invalid = true
                    else if (height!=2 && height!=4 && height!=8 && height!=16 && height!=32 && height!=64 && height!=128 && height!=256 && height!=512 && height!=1024)
                        media.file.invalid = true
                    else if (width!=2 && width!=4 && width!=8 && width!=16 && width!=32 && width!=64 && width!=128 && width!=256 && width!=512 && width!=1024)
                        media.file.invalid = true
                    else
                        media.file.invalid = false

                    cb()
                }
            }, function(err, x) {
                if (err && err.redirect) {
                    res.redirect(err.redirect)
                    return
                }
                if (err) return done(err)


                site.title = media.meta.name
                site.description = media.meta.description.replace(/<(?:.|\n)*?>/gm, '').substring(0, 240)

                // aura found, display it
                res.render('media-view.ejs', { media: media, moment: require('moment'), site: site, categories: require('./models/categories')  });
            })
        });
    });


    // =====================================
    // MY WAGO =============================
    // =====================================
    app.get('/mywago', isLoggedIn, function(req, res) {
        var search = { $or: [{ "_userId": req.user._id}, {$and: [{"popularity.favorites": req.user._id, "meta.private": false}] }], mywagozip: true }

        require('./search_media')(search, req, res, function(err, media) {
            res.render('mywago.ejs', { mywagofiles: media.length });
        })
    })

    app.get('/mywago/download', isLoggedIn, function(req, res) {
        var search = { $or: [{ "_userId": req.user._id}, {$and: [{"popularity.favorites": req.user._id, "meta.private": false}] }], mywagozip: true }

        require('./search_media')(search, req, res, function(err, media) {
            if (media.length==0) return res.send("NO FILES")

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

                    async.forEachOf(media, function(file, key, cb) {
                        if (file.type==MEDIA_TYPE_IMAGE) {
                            if (file.paths.blp) {
                                var doFile = file.paths.blp
                                var saveFile = file.id+'.blp'
                            }
                            else if (file.paths.tga) {
                                var doFile = file.paths.tga
                                var saveFile = file.id+'.tga'
                            }
                            else cb()
                        }

                        fs.readFile(__dirname + '/../mywago/media/'+doFile, function(err, data) {
                            if (err) throw err;
                            if (file.subtype=="Aura Texture") {
                                auratextures.file(saveFile, data)
                                included_files.auratextures.push({zippedName: saveFile, title: file.name})
                            }
                            else if (file.subtype=="Background") {
                                backgrounds.file(saveFile, data)
                                included_files.backgrounds.push({zippedName: saveFile, title: file.name})
                            }
                            else if (file.subtype=="Border") {
                                borders.file(saveFile, data)
                                included_files.borders.push({zippedName: saveFile, title: file.name})
                            }
                            else if (file.subtype=="Progress Bar") {
                                progressbars.file(saveFile, data)
                                included_files.progressbars.push({zippedName: saveFile, title: file.name})
                            }
                            else if (file.subtype=="Sprite Sheet") {
                                sprites.file(saveFile, data)
                                included_files.sprites.push({zippedName: saveFile, title: file.name, spriteData: file.sprite})
                            }
                            else
                                console.error("UNKNOWN SUBTYPE", file.subtype)
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
}