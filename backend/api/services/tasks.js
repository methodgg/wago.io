/**
 * Using restify to run cron tasks directly on data service. 
 * Restrict all /tasks requests to localhost.
 */
server.get('/tasks/:task', (req, res, next) => {
  if (req.connection.remoteAddress !== '::ffff:127.0.0.1' && config.env !== 'development') {
    return res.send(403, {error: 'invalid_access'})
  }
  
  RunTask(req.params.task, req, res)
})

/**
 * Runs the requested task 
 */
function RunTask (task, req, res) {
  switch (task) {
    case 'random': return MakeWagoOfTheMoment(req, res)
    case 'top10': return MakeTopTenLists(req, res)
    case 'addons': return GetLatestAddonReleases(req, res)
    case 'popularity': return computeViewsThisWeek(req, res)
    case 'news': return GetLatestNews(req, res)
  }
}

/**
 * Updates wago of the moment
 */
function MakeWagoOfTheMoment (req, res) {
  var data = global.WagoOfTheMoment || {}
  WagoItem.randomOfTheMoment((wago) => {
    data = wago
    SiteData.findByIdAndUpdate('WagoOfTheMoment', {value: data}, {upsert: true}).exec()
    global['WagoOfTheMoment'] = data
    if (res) {
      res.send({done: true})
    }
  })
}

/**
 * Builds top 10 lists for home page.
 */
function MakeTopTenLists (req, res) {
  var data = global.TopTenLists || {}
  async.parallel({
    favorites: (done) => {
      WagoItem.find({hidden: false, private: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(10).then((faves) => {
        data.faves = faves
        done()
      })
    },
    newest: (done) => {
      WagoItem.find({hidden: false, private: false, $where: "this.created.getTime() == this.modified.getTime()"}).sort({"created": -1}).select('_id name created').limit(10).then((newest) => {
        data.newest = newest
        done()
      })
    },
    updates: (done) => {
      WagoItem.find({hidden: false, private: false, $where: "this.created.getTime() != this.modified.getTime()"}).sort({"modified": -1}).select('_id name modified').limit(10).then((updates) => {
        data.updates = updates
        done()
      })
    },
    viewsThisWeek: (done) => {
      WagoItem.find({hidden: false, private: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(10).then((popular) => {
        data.popular = popular
        done()
      })
    },
  }, () => {
    global['TopTenLists'] = data
    if (res) {
      res.send({done: true})
    }
  })
}

/**
 * Gets latest version of supported addons.
 */
function GetLatestAddonReleases (req, res) {
  const cheerio = require('cheerio')
  const decompress = require('decompress')
  const mkdirp = require('mkdirp')
  const request = require('request')
  const lua = require('../helpers/lua')

  const addonDir = __dirname + '/../lua/addons/'

  // TODO: sub-fuctionalize this stuff to avoid repeating code. Curseforge and wowace use the same HTML source
  
  // for each addon we are looking for
  async.series([
    // get weakauras latest releases
    function(cb) {
      var listedURLs = []
      var ThisAddon = 'WeakAuras-2'
      request('https://www.wowace.com/projects/weakauras-2', (err, resp, body) => {
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        // html loaded correctly, now parse it
        var scrape = cheerio.load(body)
        async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
          // for each release found...
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

          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true, "new": false}).then((doc) => {
            listedURLs.push(release.url) // use the url because its unique and easier than looking up both phase and version

            if (!doc) { // if not found then this is a new release
              // download zip and get the full game version string
              var tmpfile = '/tmp/'+ThisAddon+'.zip'
              var versionDir = addonDir + ThisAddon + '/' + release.version
              mkdirp.sync(versionDir)
              request(release.url + '/download').pipe(fs.createWriteStream(tmpfile)).on('close', function() {
                decompress(tmpfile, versionDir).then(function() {
                  var toc = fs.readFileSync(versionDir+'/WeakAuras/WeakAuras.toc', 'utf8')
                  var matches = toc.match(/## Version:\s*(.*)/)
                  if (matches && matches[1]) {
                    release.gameVersion = matches[1]
                    // update again
                    AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert":true}).exec(() => {
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
              cb2()
            }
          })
        }, function() {
          AddonRelease.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).then(() => {
            cb()
          })
        })
      })
    },

    // get vuhdo latest releases
    function(cb) {
      var listedURLs = []
      var ThisAddon = 'Vuhdo'
      request('https://wow.curseforge.com/projects/vuhdo', (err, resp, body) => {
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        var scrape = cheerio.load(body)
        async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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

          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true}).then((doc) => {
            listedURLs.push(release.url)
            cb2()
          })
        }, () => {
          AddonRelease.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).then(() => {
            cb()
          })
        })
      })
    },
    
    // get grid2 latest releases
    function(cb) {
      var listedURLs = []
      var ThisAddon = 'Grid2'
      request('https://wow.curseforge.com/projects/grid2', (err, resp, body) => {
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        var scrape = cheerio.load(body)
        async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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

          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true}).then((doc) => {
            listedURLs.push(release.url)
            cb2()
          })
        }, () => {
          AddonRelease.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).then(() => {
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
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        var scrape = cheerio.load(body)
        var release = {}
        var version = scrape('img[src="/images/logo_elvui.png"]').siblings('.VIP').text()

        if (version && version.length>0) {
          AddonRelease.findOne({addon: ThisAddon, version: version}).then((doc) => {
            if (doc) return cb()

            var release = new AddonRelease()
            release.addon = ThisAddon
            release.active = true
            release.phase = "Release"
            release.url = "http://www.tukui.org/dl.php"
            release.version = version
            release.date = Date.now()
            release.save()

            AddonRelease.update({"addon": ThisAddon, "version": { "$ne": version } }, { "$set": { active: false }}, {multi: true}).exec(function(err, doc) {
              cb()
            })
          })
        }
        else {
          cb()
        }
      })
    },

    // get MDT latest releases
    function(cb) {
      var listedURLs = []
      var ThisAddon = 'MDT'
      request('https://wow.curseforge.com/projects/method-dungeon-tools', (err, resp, body) => {
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        // html loaded correctly, now parse it
        var scrape = cheerio.load(body)
        async.forEachOf(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
          // for each release found...
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

          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true, "new": false}).then((doc) => {
            listedURLs.push(release.url) // use the url because its unique and easier than looking up both phase and version

            if (!doc) { // if not found then this is a new release
              // download zip and get the full game version string
              var tmpfile = '/tmp/'+ThisAddon+'.zip'
              var versionDir = addonDir + ThisAddon + '/' + release.version
              mkdirp.sync(versionDir)
              request(release.url + '/download').pipe(fs.createWriteStream(tmpfile)).on('close', function() {
                decompress(tmpfile, versionDir).then(function() {
                  var toc = fs.readFileSync(versionDir+'/MethodDungeonTools/MethodDungeonTools.toc', 'utf8')
                  var matches = toc.match(/## Version:\s*(.*)/)

                  // generate dungeon table
                  lua.BuildMDT_DungeonTable(versionDir+'/MethodDungeonTools/BattleForAzeroth', (err, result) => {
                    if (err) {
                      console.error('MDT build table error', err)
                    }
                    else if (result && result.stdout) {
                      var json = JSON.parse(result.stdout)
                      SiteData.findByIdAndUpdate('mdtDungeonTable', {value: json}, {upsert: true}).exec()
                    }
                  })
                  
                  // update version number
                  if (matches && matches[1]) {
                    release.gameVersion = matches[1]
                    // save to DB
                    AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert":true}).exec(() => {
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
              cb2()
            }
          })
        }, function() {
          AddonRelease.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).then(() => {
            cb()
          })
        })
      })
    },
  ], function(err) {
    if (err) console.error(err)
    // now rebuild global addons table
    AddonRelease.find({active: true}).sort('-addon -phase').then((docs) => {
      global.addonUpdates = docs
      if (res) {
        res.send({done: true})
      }
    })
  })
}

/**
 * Updates views this week for each wago.
 * They are auto incremented on-the-fly but expired views from a week ago need to be pruned.
*/
function computeViewsThisWeek(req, res) {
  ViewsThisWeek.aggregate({$group: { _id: '$wagoID', views: { $sum: 1 }}}).exec().then((pop) => {
    updateViewsThisWeek(pop, () => {
      if (res) {
        res.send({done: true})
      }
    })
  })
}
// recursively update views found in aggregate query
function updateViewsThisWeek(pop, done) {
  if (pop.length > 0) {
    var items = pop.splice(0, 500)
    var ops = []
    items.forEach((wago) => {
      ops.push({
        updateOne: {
          filter: { _id: wago._id },
          update: { 'popularity.viewsThisWeek': wago.views }
        }
      })
    })
    WagoItem.bulkWrite(ops).then(() => {
      updateViewsThisWeek(pop, done)
    }).catch(err => {
      console.error(err)
    })
  }
  else {
    done()
  }
}

/**
 * Gets most recent news articles for front page
 */
function GetLatestNews(req, res) {
  Blog.find({publishStatus: 'publish'}).sort('-date').limit(2).populate('_userId').then((docs) => {
    var news = []
    docs.forEach((item) => {
      var post = {
        content: item.content,
        date: item.date,
        format: item.format,
        title: item.title,
        _id: item._id,
        user: {
          username: item._userId.account.username,
          css: item._userId.roleclass
        }
      }
      news.push(post)
    })
    global.newsPosts = news
    if (res) {
      res.send({done: true})
    }
  })
}

/**
 * Allow tasks to be run on-demand.
 */
module.exports = function (task) {
  RunTask(task)
}