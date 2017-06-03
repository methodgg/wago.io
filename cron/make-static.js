#!/usr/bin/env node

// this runs via crontab every minute

var app_root = __dirname+'/..'

var mongoose = require('mongoose');
var configDB = require(app_root+'/config/database.js');
mongoose.connect(configDB.url); // connect to our database

var Wago = require(app_root+'/app/models/wagoitem');
var Screenshots = require(app_root+'/app/models/aura-screenshot');
var async = require('async')
var fs = require('fs')
var path = require('path')
var request = require('request')

async.series([
    // copy previous static files
    function(cb) { copyFile(app_root+"/static/newest.json", app_root+"/static/newest-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/updated.json", app_root+"/static/updated-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/popular.json", app_root+"/static/popular-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/categories.json", app_root+"/static/categories-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/categories-WA2.json", app_root+"/static/categories-WA2-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/categories-ElvUI.json", app_root+"/static/categories-ElvUI-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/categories-Vuhdo.json", app_root+"/static/categories-Vuhdo-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/categories-Snippet.json", app_root+"/static/categories-Snippet-previous.json", cb) },
    function(cb) { copyFile(app_root+"/static/WagoOfTheMoment.json", app_root+"/static/WagoOfTheMoment-previous.json", cb) },

    // update list of newest wago's json file
    function(cb) {
        Wago.find({ 'hidden' : false, 'private': false, 'deleted':false,  $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}, {type: 'VUHDO'}], $where: "this.modified <= this.created" }).limit(9).sort('-created').exec(function(err, auras) {
            fs.writeFile(app_root+"/static/newest.json", JSON.stringify(auras), function() { cb() })
        })

    // update list of latest updated wago's json file
    }, function(cb) {
        Wago.find({ 'hidden' : false, 'private': false, 'deleted':false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}, {type: 'VUHDO'}], $where: "this.modified > this.created" }).limit(9).sort('-modified').exec(function(err, auras) {
            fs.writeFile(app_root+"/static/updated.json", JSON.stringify(auras), function() { cb() })
        })

    // update list of most popular wago's json file
    }, function(cb) {
        Wago.aggregate().match({ 'hidden' : false, 'private': false, 'deleted':false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}, {type: 'VUHDO'}] }).project({ '_id': 1, 'name': 1, 'custom_slug':1, 'popularity.views': 1, 'stars': { '$size': '$popularity.favorites'}}).sort({'stars':-1, 'popularity.views':-1}).limit(9).exec(function(err, auras) {
            fs.writeFile(app_root+"/static/popular.json", JSON.stringify(auras), function() { cb() })
        })

    // update categories lsit with counts
    }, function(cb) {
        var categories = require(app_root+'/app/models/categories')
        var WeakAuras2 = []
        var ElvUI = []
        var Vuhdo = []
        var Snippet = []

        async.forEachOf(categories, function (item, key, cb2) {
            async.parallel([
                // count totals
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count = count
                        parallel_cb()
                    })
                },

                // count weakauras
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'WEAKAURAS2', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_WA = count
                        parallel_cb()
                    })
                },

                // count elvui
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'ELVUI', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_elvui = count
                        parallel_cb()
                    })
                },

                // count vuhdo
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'VUHDO', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_vuhdo = count
                        parallel_cb()
                    })
                },

                // count collections
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'COLLECTION', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_collection = count
                        parallel_cb()
                    })
                },

                // count media
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'MEDIA', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_media = count
                        parallel_cb()
                    })
                },

                // count snippets
                function(parallel_cb) {
                    Wago.count({ 'categories' : item.id, type:'SNIPPET', "_userId":{"$exists":true}, 'private':false, 'hidden':false, 'deleted':false }, function(err, count) {
                        if (err) return parallel_cb(err);
                        categories[key].count_snippet = count
                        parallel_cb()
                    })
                }

            // parallel callback
            ], function(err) {
                cb2(err)
            })   
        }, function(err) { // forEachOf(categories) callback
            // write to each type json file
            if (err) console.error('error on make-static', err)

            fs.writeFile(app_root+"/static/categories.json", JSON.stringify(categories))
            fs.writeFile(app_root+"/static/categories-WA2.json", JSON.stringify(WeakAuras2))
            fs.writeFile(app_root+"/static/categories-ElvUI.json", JSON.stringify(ElvUI))
            fs.writeFile(app_root+"/static/categories-Vuhdo.json", JSON.stringify(Vuhdo))
            fs.writeFile(app_root+"/static/categories-Snippet.json", JSON.stringify(Snippet))

            cb()
        })

    // download images from S3
    }, function(cb) {
        Screenshots.find({ 'localFile' : null}).limit(10).sort('-uploaded').exec(function(err, screens) {
            async.forEachOf(screens, function (item, key, cb2) {
                try {
                    fs.mkdirSync(app_root+'/screenshots/'+item.auraID)
                } catch (e) {

                }
                if (!item.s3Key) return cb2()

                var imageURL = item.url.original.replace(/%2F/g, '/')
                var localFile = item.s3Key.replace(item.auraID+'/', '').replace(/\//g, '-')
    			var ws = fs.createWriteStream(app_root+'/screenshots/'+item.auraID+'/'+localFile)
                request(imageURL).pipe(ws)
    			ws.on('finish', function() {
    				screens[key].localFile = localFile
                    screens[key].save()
                    cb2()
        		})
    			ws.on('error', function() {
    			    console.error("Unable to save file from S3 "+imageURL+ ' -> '+localFile)
                    cb2()
        		})
            }, function(err) { // forEachOf(categories) callback
                cb()
            })
        })


    // generate random wago file
    }, function(cb) {
        var randomWago = null
        async.whilst(function() {return randomWago==null}, function(cb2) {
            Wago.random(function(err, wago) {
                Screenshots.findOne({auraID: wago._id}, function(err, screen) {
                    if (err || !screen) return cb2()
                    wago.thumb = screen.url.thumbnail
                    randomWago = {name: wago.name, screenshot: screen.url.thumbnail, type: wago.type, _id: wago._id}
                    cb2()
                })
            })

        }, function() { // someSeries callback
                fs.writeFile(app_root+"/static/WagoOfTheMoment.json", JSON.stringify(randomWago), function(err) {
                cb()
            })
        })

    }
    ], function() {
        process.exit(0)
    }
)


function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}
