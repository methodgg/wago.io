#!/usr/bin/env node

// this runs via crontab evry 15 min

var app_root = __dirname+'/..'


var mongoose = require('mongoose');
var configDB = require(app_root+'/config/database.js');
mongoose.connect(configDB.url); // connect to our database

var async = require('async')
var decompress = require('decompress')
var fs = require('fs')
var cheerio = require('cheerio')
var mkdirp = require('mkdirp')
var path = require('path')
var request = require('request')

var addons = require(app_root+'/app/models/addon-release');


async.series([
    // get weakauras latest releases
    function(cb) {
        var listedURLs = []
        var ThisAddon = 'WeakAuras-2'
        request('https://www.wowace.com/projects/weakauras-2', function (err, resp, body) {
            if (err) cb(err)
            if (resp && resp.statusCode!=200) cb(err)

            var scrape = cheerio.load(body)
            async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), function(file, key, cb2) {
                var release = {}
                release.addon = ThisAddon
                release.active = true

                var phase = scrape(file).find('.e-project-file-phase-wrapper .e-project-file-phase')
                release.phase = phase.attr('title')

                var version = scrape(file).find('.project-file-name-container a')
                release.url = "https://www.wowace.com"+version.attr('href')
                release.version = version.text()

                var date = scrape(file).find('abbr.standard-datetime')
                release.date = new Date(date.attr('title'))

                addons.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true, "new": false}).exec(function(err, doc) {
                    listedURLs.push(release.url) // use the url because its unique and easier than looking up both phase and version
                    if (err) console.error(err)

                    if (!doc) { // if doc exists then this is not a new release
                        // if it is a new release, download and get the full game version string
                        var tmpfile = '/tmp/'+ThisAddon+'.zip'
                        var versionDir = app_root+'/lua/addons/'+ThisAddon+'/'+release.version
                        mkdirp.sync(versionDir)
                        request(release.url+'/download').pipe(fs.createWriteStream(tmpfile)).on('close', function() {
                            decompress(tmpfile, versionDir).then(function() {
                                var toc = fs.readFileSync(versionDir+'/WeakAuras/WeakAuras.toc', 'utf8')
                                var matches = toc.match(/## Version:\s*(.*)/)
                                if (matches && matches[1]) {
                                    release.gameVersion = matches[1]
                                    // update again
                                    addons.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert":true}).exec(function(err) {
                                        if (err) console.log(err)
                                        cb2()
                                    })
                                }
                                else {
                                    console.log('could not find .toc file')
                                    cb2()
                                }

                            })
                        })
                    }
                    else {
                        console.log('not a new version', doc)
                        cb2()
                    }
                })
            }, function() {
                console.log(listedURLs)
                addons.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).exec(function(err) {
                    if (err) console.error(err)
                    cb()
                })
            })
        })
    },

    // get vuhdo latest releases
    function(cb) {
        var listedURLs = []
        var ThisAddon = 'Vuhdo'
        request('https://wow.curseforge.com/projects/vuhdo', function (err, resp, body) {
            if (err) cb(err)
            if (resp && resp.statusCode!=200) cb(err)

            var scrape = cheerio.load(body)
            async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), function(file, key, cb2) {
                var release = {}
                release.addon = ThisAddon
                release.active = true

                var phase = scrape(file).find('.e-project-file-phase-wrapper .e-project-file-phase')
                release.phase = phase.attr('title')

                var version = scrape(file).find('.project-file-name-container a')
                release.url = "https://wow.curseforge.com"+version.attr('href')
                release.version = version.text()

                var date = scrape(file).find('abbr.standard-datetime')
                release.date = new Date(date.attr('title'))

                addons.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true}).exec(function(err, doc) {
                    listedURLs.push(release.url)
                    cb2()
                })
            }, function() {
                addons.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).exec(function(err) {
                    if (err) console.error(err)
                    cb()
                })
            })
        })
    },

    // get elvui latest release
    function(cb) {
        var listedURLs = []
        var ThisAddon = 'ElvUI'
        request('http://www.tukui.org/dl.php', function (err, resp, body) {
            if (err) cb(err)
            if (resp && resp.statusCode!=200) cb(err)

            var scrape = cheerio.load(body)
            var release = {}
            var version = scrape('img[src="/images/logo_elvui.png"]').siblings('.VIP').text()

            if (version && version.length>0) {
                addons.findOne({addon: ThisAddon, version: version}).exec(function(err, doc) {
                    if (doc) return cb()

                    var release = new addons()
                    release.addon = ThisAddon
                    release.active = true
                    release.phase = "Release"
                    release.url = "http://www.tukui.org/dl.php"
                    release.version = version
                    release.date = Date.now()
                    release.save()

                    addons.update({"addon": ThisAddon, "version": { "$ne": version } }, { "$set": { active: false }}, {multi: true}).exec(function(err, doc) {
                        cb()
                    })
                })
            }
            else {
                cb()
            }
        })
    }
    ], function(err) {
        if (err) console.error(err)
        process.exit(0)
    }
)
