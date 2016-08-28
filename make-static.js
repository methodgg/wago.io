#!/usr/bin/env node

// this runs via crontab every minute

var mongoose = require('mongoose');
var configDB = require(__dirname+'/config/database.js');
mongoose.connect(configDB.url); // connect to our database

var Wago = require(__dirname+'/app/models/wagoitem');
var async = require('async')
var fs = require('fs')

async.series([
    function(cb) {
        Wago.find({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}], modified: null }).limit(9).sort('-created').exec(function(err, auras) {
            fs.writeFile(__dirname+"/static/newest.json", JSON.stringify(auras), function() { cb() })
        })
    }, function(cb) {

        Wago.find({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}], modified: { $ne: null } }).limit(9).sort('-modified').exec(function(err, auras) {
            fs.writeFile(__dirname+"/static/updated.json", JSON.stringify(auras), function() { cb() })
        })
    }, function(cb) {

        Wago.aggregate().match({ 'hidden' : false, 'private': false, $or: [{type: "WEAKAURAS2"}, {type: 'ELVUI'}] }).project({ '_id': 1, 'name': 1, 'popularity.views': 1, 'stars': { '$size': '$popularity.favorites'}}).sort({'stars':-1, 'popularity.views':-1}).limit(9).exec(function(err, auras) {
            fs.writeFile(__dirname+"/static/popular.json", JSON.stringify(auras), function() { cb() })
        })
    }, function(cb) {
        categories = require('./app/models/categories')
        async.forEachOf(categories, function (item, key, cb2) {
            Wago.count({ 'categories' : item.id, 'private':0, 'hidden':0 }, function(err, count) {
                if (err) return callback(err);
                categories[key].count = count
                cb2()
            })
        }, function(err) { // forEachOf(categories) callback
            fs.writeFile(__dirname+"/static/categories.json", JSON.stringify(categories), function() { cb() })
        })
    }], function() {
        process.exit(0)
    }
)