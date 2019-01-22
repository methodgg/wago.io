const config = require('../../config')
const async = require('async')
const axios = require('axios')
const image = require('../helpers/image')
const battlenet = require('../helpers/battlenet')
const cloudflare = require('cloudflare')({email: config.cloudflare.email, key: config.cloudflare.apiKey})

/**
 * Using restify to run cron tasks directly on data service. 
 * Restrict all /tasks requests to localhost.
 */
server.get('/tasks/:task', (req, res, next) => {
  if (req.connection.remoteAddress !== '::ffff:127.0.0.1' && config.env !== 'development') {
    return res.send(403, {error: 'invalid_access'})
  }

  // allowed tasks for GET
  switch (req.params.task) {
    case 'random':
    case 'top10':
    case 'addons':
    case 'popularity':
    case 'news':
    case 'patreon':
    case 'mdtweek':
    case 'stats':
      return RunTask(req.params.task, req, res)
      break

    case 'debug':
  }
})

/**
 * Same as above but allowing GitHub webhooks to post
 */
server.post('/tasks/:task', (req, res, next) => {
  if (!req.headers['user-agent'].match(/^GitHub-Hookshot\//) ) {
    return res.send(403, {error: 'invalid_access'})
  }
  
  // allowed tasks for POST
  switch (req.params.task) {
    case 'addons': 
      return RunTask(req.params.task, req, res)
  }
})

function RunTask(task, req, res) {
  logger.info('run task ' + task)
  switch (task) {
    case 'random': return MakeWagoOfTheMoment(res)
    case 'top10': return MakeTopTenLists(res)
    case 'addons': return GetLatestAddonReleases(res)
    case 'popularity': return computeViewsThisWeek(res)
    case 'news': return GetLatestNews(res)
    case 'patreon': return updatePatreon(res)
    case 'mdtweek': return updateWeeklyMDT(res)
    case 'stats': return generateStats(res)
  }
}

/**
 * Updates wago of the moment
 */
function MakeWagoOfTheMoment (res) {
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
function MakeTopTenLists (res) {
  var data = global.TopTenLists || {}
  async.parallel({
    favorites: (done) => {
      WagoItem.find({hidden: false, private: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(10).then((faves) => {
        data.faves = faves
        done()
      })
    },
    installed: (done) => {
      WagoItem.find({hidden: false, private: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(10).then((installs) => {
        data.installs = installs
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
function GetLatestAddonReleases (res) {
  const cheerio = require('cheerio')
  const request = require('request')
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
        async.eachOfSeries(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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

            if (!doc || !doc.gameVersion) { // if not found then this is a new release
              downloadAddon('WeakAuras', release, cb2)
            }
            else {
              cb2()
            }
          })
        }, function() {
          // set old versions to inactive
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
        async.eachOfSeries(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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
            if (!doc || !doc.gameVersion) { // if not found then this is a new release
              downloadAddon('VuhDo', release, cb2)
            }
            else {
              cb2()
            }
          })
        }, () => {
          // set old versions to inactive
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
      request('https://www.wowace.com/projects/grid2', (err, resp, body) => {
        if (err) return cb(err)
        if (resp && resp.statusCode!=200) return cb(err)

        var scrape = cheerio.load(body)
        async.eachOfSeries(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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

          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert": true}).then((doc) => {
            listedURLs.push(release.url)
            if (!doc || !doc.gameVersion) { // if not found then this is a new release
              downloadAddon('Grid2', release, cb2)            
            }
            else {
              cb2()
            }
          })
        }, () => {
          // set old versions to inactive
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

            // set old versions to inactive
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
        async.eachOfSeries(scrape('ul.cf-recentfiles li.file-tag'), (file, key, cb2) => {
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

            if (!doc || !doc.gameVersion) { // if not found then this is a new release
              downloadAddon('MethodDungeonTools', release, cb2)              
            }
            else {
              cb2()
            }
          })
        }, function() {
          // set old versions to inactive
          AddonRelease.update({ addon: ThisAddon, url: { "$nin": listedURLs } }, { "$set": { active: false }}, {multi: true} ).then(() => {
            cb()
          })
        })
      })
    },
  ], function(err) {
    if (err) logger.error({label: 'Update addons error', error: err})
    // now rebuild global addons table
    AddonRelease.find({active: true}).sort('-addon -phase').then((docs) => {
      global.addonUpdates = docs
      if (res) {
        res.send({done: true})
      }
    })
  })
}

// download zip and get the full game version string
function downloadAddon(addon, release, done) {
  const addonDir = __dirname + '/../lua/addons/'
  const decompress = require('decompress')
  const lua = require('../helpers/lua')
  const mkdirp = require('mkdirp')
  const request = require('request')

  const tmpfile = '/tmp/' + addon + '.zip'
  const versionDir = addonDir + addon + '/' + release.version
  try {
    request(release.url + '/download').pipe(fs.createWriteStream(tmpfile)).on('close', function() {
      decompress(tmpfile, versionDir).then(function() {
        var toc = fs.readFileSync(versionDir + '/' + addon + '/' + addon + '.toc', 'utf8')
        var matches = toc.match(/## Interface:\s*(.*)/)
        if (matches && parseInt(matches[1])) {
          release.gameVersion = parseInt(matches[1])
          // update again
          AddonRelease.findOneAndUpdate({addon: release.addon, url: release.url}, release, {"upsert":true}).then((doc) => {
            done()
          })

          switch (addon) {
            case 'MethodDungeonTools':
              // generate dungeon table
              lua.BuildMDT_DungeonTable(versionDir+'/MethodDungeonTools/BattleForAzeroth', (err, result) => {
                if (err) {
                  logger.error({label: 'Could not build MDT dungeon table', addon: release})
                }
                else if (result && result.stdout) {
                  var json = JSON.parse(result.stdout)
                  json.dungeonDimensions = []
                  json.dungeonEnemies.forEach((enemies, mapID) => {
                    json.dungeonDimensions.push({maxX: -9999999, minX: 9999999, maxY: -9999999, minY: 9999999})
                    if (!enemies) return
                    enemies.forEach((creature) => {
                      if (!creature || !creature.clones) return
                      creature.clones.forEach((clone) => {
                        json.dungeonDimensions[mapID].maxX = Math.max(json.dungeonDimensions[mapID].maxX, clone.x)
                        json.dungeonDimensions[mapID].minX = Math.min(json.dungeonDimensions[mapID].minX, clone.x)
                        json.dungeonDimensions[mapID].maxY = Math.max(json.dungeonDimensions[mapID].maxY, clone.y)
                        json.dungeonDimensions[mapID].minY = Math.min(json.dungeonDimensions[mapID].minY, clone.y)
                      })
                    })
                  })
                  SiteData.findByIdAndUpdate('mdtDungeonTable', {value: json}, {upsert: true}).exec()
                  cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable']})
                  async.eachOfSeries(json.dungeonEnemies, (dungeon, mapID, callback) => {
                    let Obj = {
                      affixWeeks: json.affixWeeks,
                      dungeonEnemies: dungeon,
                      mapPOIs: json.mapPOIs[mapID],
                      dungeonTotalCount: json.dungeonTotalCount[mapID],
                      scaleMultiplier: json.scaleMultiplier[mapID],
                      dungeonSubLevels: json.dungeonSubLevels[mapID],
                      dungeonMaps: json.dungeonMaps[mapID],
                      dungeonDimensions: json.dungeonDimensions[mapID],
                    }
                    if (mapID === 15) {
                      Obj.freeholdCrews = json.freeholdCrews
                    }
                    SiteData.findByIdAndUpdate('mdtDungeonTable-' + mapID, {value: Obj}, {upsert: true}).exec()
                    cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable-' + mapID]})
                    callback()
                  })
                  // now generate portrait maps
                  if (config.host === 'data-01' || config.env === 'development') {
                    async.eachOfSeries(json.dungeonEnemies, (dungeon, mapID, callback) => {
                      if (!dungeon) return callback()
                      async.timesSeries((Object.keys(json.dungeonMaps[mapID]).length) * 2 - 1, (subMapID, callback2) => {
                        if (!subMapID) return callback2()
                        if (mapID === 18 && subMapID < Object.keys(json.dungeonMaps[mapID]).length) {
                          buildStaticMDTPortraits(json, mapID, subMapID, false, 1)
                          buildStaticMDTPortraits(json, mapID, subMapID, false, 2, callback2)
                        }
                        else if (subMapID < Object.keys(json.dungeonMaps[mapID]).length) {
                          buildStaticMDTPortraits(json, mapID, subMapID, false, false, callback2)
                        }
                        else if (mapID === 18) {
                          buildStaticMDTPortraits(json, mapID, subMapID - Object.keys(json.dungeonMaps[mapID]).length + 1, true, 1)
                          buildStaticMDTPortraits(json, mapID, subMapID - Object.keys(json.dungeonMaps[mapID]).length + 1, true, 2, callback2)
                        }
                        else {
                          buildStaticMDTPortraits(json, mapID, subMapID - Object.keys(json.dungeonMaps[mapID]).length + 1, true, false, callback2)
                        }       
                      }, () => {
                        callback()
                      })           
                    }, () => {
                    })         
                  }         
                }
              })
            break
          }
        }
        else {
          logger.error({label: 'Could not find game version', addon: release})
          done()
        }
      }).catch((e) => {
        logger.error({label: 'Could not unzip addon', addon: release})
        done()
      })
    }).on('error', (e) => {
      logger.error({label: 'Could not reach URL', addon: release, error: e})
    })
  }
  catch (e) {
    logger.error({label: 'Downloading addon failed.', addon: release, error: e}) 
  }
}

function buildStaticMDTPortraits(json, mapID, subMapID, teeming, faction, done) {
  var mdtScale = 539 / 450
  if (teeming) teeming = '-Teeming'
  else teeming = ''

  var imgName = `portraitMap-${mapID}-${subMapID}${teeming}`
  
  if (faction) {
    imgName = imgName + '-Faction' + faction
  }

  console.log('processing', imgName)

  html = `<!DOCTYPE html>
  <html>
  <head>
    <script src="https://unpkg.com/konva@2.4.2/konva.min.js"></script>
    <meta charset="utf-8">
    <title>Konva Circle Demo</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #F0F0F0;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script>
      var multiplier = 5
      
      var stage = new Konva.Stage({
        container: 'container',
        width: 1024 * multiplier,
        height: 768 * multiplier
      });
  
      var layer = new Konva.Layer();
      var enemyPortraits = new Image()
      enemyPortraits.src = 'https://media.wago.io/mdt/portraits-${mapID}.png'
      enemyPortraits.crossOrigin = 'anonymous'
      enemyPortraits.onload = () => {`
        async.eachOfSeries(json.dungeonEnemies[mapID], (creature, i, creatureDone) => {
          if (!creature || !creature.clones) return creatureDone()

          creature.clones.forEach((clone, j) => {
            if ((!clone.sublevel || clone.sublevel === subMapID) && (!clone.teeming || (clone.teeming && teeming)) && (!clone.faction || (clone.faction === faction))) {
              html = html + `
              var circle${i}_${j} = new Konva.Circle({
                x: ${clone.x * mdtScale} * multiplier,
                y: ${clone.y * -mdtScale} * multiplier,
                radius: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1) * (json.scaleMultiplier[mapID] || 1)) / mdtScale} * multiplier,
                fillPatternX: ${(-Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1))) / mdtScale} * multiplier,
                fillPatternY: ${(-Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1))) / mdtScale} * multiplier,
                fillPatternImage: enemyPortraits,
                fillPatternOffset: ${getEnemyPortraitOffset(json.dungeonEnemies[mapID].length, i, 115)},
                fillPatternRepeat: 'no-repeat',
                fillPatternScaleX: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64} * multiplier,
                fillPatternScaleY: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64} * multiplier,
                stroke: '${creature.isBoss ? 'gold' : 'black'}',
                strokeWidth: .5 * multiplier
              })

              // add the shape to the layer
              layer.add(circle${i}_${j});`
            }
          })
          creatureDone()
        }, () => {
          html = html + `
        stage.add(layer);

        setTimeout(() => {
          var img = document.createElement('img')
          img.src = stage.toDataURL()
          img.id = 'img'
          document.body.appendChild(img)
          document.getElementById('container').remove()
        }, 1000)
      }
      </script>
    </body>
    </html>`

    const puppeteer = require('puppeteer')

    let _browser
    let _page
    let _img
    // fs.writeFileSync('./test.html', html, 'utf8')

    puppeteer
      .launch()
      .then(browser => (_browser = browser))
      .then(browser => (_page = browser.newPage()))
      .then(page => page.setContent(html))
      .then(() => _page)
      .then(page => page.waitForSelector('img', {timeout: 120000}))
      .then(() => _page)
      .then(page => {
        return page.evaluate(() => {
          let img = document.getElementById('img')
          return img.src
        })
      })
      .then(img => (_img = img))
      .then(() => _browser.close())
      .then(() => {
        _img = _img.replace(/^data:image\/\w+;base64,/, "")
        var buffer = new Buffer(_img, 'base64')
        image.saveMdtPortraitMap(buffer, imgName, (img) => {
          if (done) {
            done()
          }
        })
      })
      .catch((e) => {
        logger.error({label: 'Error creating MDT map', file: imgName, error: e.message})
      })
  })
}

function getEnemyPortraitOffset (numCreatures, creatureIndex, size) {
  var row = 0
  size = size || 36
  if (creatureIndex >= Math.ceil(numCreatures / 2)) {
    row++
  }
  var o = {x: ((creatureIndex) - (Math.ceil(numCreatures / 2) * row)) * size, y: row * size}
  return `{x: ${o.x}, y: ${o.y}}`
}

/**
 * Updates views this week for each wago.
 * They are auto incremented on-the-fly but expired views from a week ago need to be pruned.
*/
function computeViewsThisWeek(res) {
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
      logger.error({label: 'Error updating views this week count', err})
    })
  }
  else {
    done()
  }
}

/**
 * Gets most recent news articles for front page
 */
function GetLatestNews(res) {
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
 * Updates all patrons with current patreon data
 */
function updatePatreon(res, url) {
  if (!url) {
    url = 'https://www.patreon.com/api/oauth2/api/campaigns/562591/pledges?include=patron.null'
  }
  axios.get(url, {
    headers: {
      Authorization: 'Bearer ' + config.auth.patreon.creatorAccessToken
    }
  }).then((patreon) => {
    patreon = patreon.data
    try {
      async.eachSeries(patreon.data, (patron, done) => {
        if (!patron || !patron.relationships || !patron.relationships.patron || !patron.relationships.patron.data || !patron.relationships.patron.data.id) {
          return done()
        }
        User.findOne({"patreon.id": patron.relationships.patron.data.id}).then((user) => {
          if (!user) {
            return done()
          }
          user.roles.subscriber = (!patron.attributes.declined_since && patron.attributes.amount_cents >= 100)
          user.roles.gold_subscriber = (!patron.attributes.declined_since && patron.attributes.amount_cents >= 400)
          user.roles.guild_subscriber = (!patron.attributes.declined_since && patron.attributes.amount_cents >= 1500)
          user.save()
          done()
        })
      }, () => {
        if (patreon.links && patreon.links.next) {
          updatePatreon(res, patreon.links.next)
        }
        else {
          res.send({done: true})
        }
      })
    }
    catch (e) {
      logger.error({label: 'Unable to update Patreon', error: e.message})
    }
  })
}

function updateWeeklyMDT(res) {
  battlenet.updateMDTWeek().then(() => {
    res.send({done: true})
  }).catch((e) => {
    logger.error(e.message)
    res.send({done: false})
  })
}

function generateStats(res) {
  const startDate = new Date(1463788800000) // May 21 2016
  async.series({
    WeakAuras: (done) => {
      Stats.findOne({name: 'Total WeakAuras'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "WEAKAURAS2", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total WeakAuras', date: dDate}, {name: 'Total WeakAuras', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    ElvUI: (done) => {
      Stats.findOne({name: 'Total ElvUI'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "ELVUI", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total ElvUI', date: dDate}, {name: 'Total ElvUI', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    MDT: (done) => {
      Stats.findOne({name: 'Total MDT Routes'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "MDT", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total MDT Routes', date: dDate}, {name: 'Total MDT Routes', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    TotalRP: (done) => {
      Stats.findOne({name: 'Total TotalRP'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "TOTALRP3", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total TotalRP', date: dDate}, {name: 'Total TotalRP', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    VuhDo: (done) => {
      Stats.findOne({name: 'Total VuhDo'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "VUHDO", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total VuhDo', date: dDate}, {name: 'Total VuhDo', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    Companion: (done) => {
      let date = startDate
      let today = new Date
      while (date < today) {
        let dDate = new Date(date)
        WagoFavorites.distinct('appID', {type: 'Install', timestamp: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((IDs) => {
          var num = IDs.length
          Stats.findOneAndUpdate({name: 'WeakAura Companion Installs', date: dDate}, {name: 'WeakAura Companion Installs', date: dDate, value: num}, {upsert: true}).exec()
        })
        date = date.nextWeek()
      }
      done()
    },
    WACode: (done) => {
      Stats.findOne({name: 'WeakAura Region group'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        async.whilst(
          () => {
            return date < today
          },
          (cb) => {
            let dDate = new Date(date)
            let countAuthorOptions = 0
            let countBuffTrigger2 = 0
            let countTriggers = 0
            let countTriggerCustomCode = 0
            let countTriggerCustomCodeEveryFrame = 0
            let countRegionTypes = {group:0, dynamicgroup:0, aurabar:0, icon:0, text:0, model:0, model:0, texture:0, progresstexture:0, stopmotion:0}
            WagoCode.find({updated: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((wa) => {
              async.forEach(wa, (code, next) => {
                // confirm import is a weakaura
                WagoItem.findOne({_id: code.auraID, type: 'WEAKAURAS2'}).then((aura) => {
                  if (aura) {
                    var json = JSON.parse(code.json)
                    if (!json.d) {
                      return next()
                    }
                    if (!json.c) {
                      json.c = [json.d]
                    }
                    else {                      
                      countRegionTypes[json.d.regionType]++
                    }
                    for (let i = 0; i < json.c.length; i++) {
                      if (!json.c[i]) continue
                      countRegionTypes[json.c[i].regionType]++

                      // author options feature
                      if (json.c[i].authorOptions && json.c[i].authorOptions.length) {
                        countAuthorOptions++
                      }
                      // bufftrigger2 feature
                      if (json.c[i].triggers && json.c[i].triggers['1']) {
                        countBuffTrigger2++
                      }
                      // count triggers with custom code
                      if (json.c[i].trigger) {
                        countTriggers++
                        if (json.c[i].trigger.type === 'custom' &&  json.c[i].trigger.custom) {
                          countTriggerCustomCode++
                          if (json.c[i].trigger.check === 'update') {
                            countTriggerCustomCodeEveryFrame++
                          }
                        }
                      }
                      if (json.c[i].additional_triggers && json.c[i].additional_triggers.length) {
                        for (let k = 0; k < json.c[i].additional_triggers.length; k++) {
                          countTriggers++
                          if (json.c[i].additional_triggers[k].type === 'custom' &&  json.c[i].additional_triggers[k].custom) {
                            countTriggerCustomCode++
                            if (json.c[i].trigger.check === 'update') {
                              countTriggerCustomCodeEveryFrame++
                            }
                          }
                        }
                      }
                      if (json.c[i].triggers) {
                        for (var k in json.c[i].triggers) {
                          if (parseInt(k) && json.c[i].triggers[k].trigger) {
                            countTriggers++
                            if (json.c[i].triggers[k].trigger.type === 'custom' &&  json.c[i].triggers[k].trigger.custom) {
                              countTriggerCustomCode++
                              if (json.c[i].triggers[k].trigger.check === 'update') {
                                countTriggerCustomCodeEveryFrame++
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  next()
                })
              }, () => {
                Stats.findOneAndUpdate({name: 'WeakAura Imports with Author Options Feature', date: dDate}, {name: 'WeakAura Imports with Author Options Feature', date: dDate, value: countAuthorOptions}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Imports with BuffTrigger2 Feature', date: dDate}, {name: 'WeakAura Imports with BuffTrigger2 Feature', date: dDate, value: countBuffTrigger2}, {upsert: true}).exec()
                // Stats.findOneAndUpdate({name: 'WeakAura Triggers', date: dDate}, {name: 'WeakAura Triggers', date: dDate, value: countTriggers}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Triggers with Custom Code', date: dDate}, {name: 'WeakAura Triggers with Custom Code', date: dDate, value: countTriggerCustomCode}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Triggers with Custom Code Updating Every Frame', date: dDate}, {name: 'WeakAura Triggers with Custom Code Updating Every Frame', date: dDate, value: countTriggerCustomCodeEveryFrame}, {upsert: true}).exec()
                Object.keys(countRegionTypes).forEach((region) => {
                  if (region && region !== 'undefined') {
                    console.log(region, countRegionTypes[region])
                    Stats.findOneAndUpdate({name: 'WeakAura Region ' + region, date: dDate}, {name: 'WeakAura Region ' + region, date: dDate, value: countRegionTypes[region]}, {upsert: true}).exec()
                  }
                })

                date = date.nextWeek()
                cb()
              })            
            })
          }, () => {
            done()
          })
      })
    }
  }, () => {
    res.send({done: true})
  })
}
Date.prototype.nextWeek = function() {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + 7)
  return date
}

/**
 * Allow tasks to be run on-demand.
 */
module.exports = function (task) {
  RunTask(task)
}

