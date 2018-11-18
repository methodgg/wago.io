/**
 * Standard lookup requests
 */
const lua = require('../helpers/lua')
var wowPatches = require('../helpers/wowPatches')

function doNothing () {}

 server.get('/lookup/codereview', (req, res) => {
  WagoCode.lookup(req.query.wagoID).then((code) => {
    if (code && code.json) {
      const lua = require('../helpers/lua')
      var WeakAura = JSON.parse(code.json)

      lua.CodeReview(WeakAura, (error, result) => {
        if (error) {
          logger.debug({label: 'Code review', error: error})
          return res.send({error: "An error has occurred. Could not profile code."})
        }
        res.send(result)
      })
    }
    else {
      res.send({error: 'could not load'})
    }
  })
})

 /**
  * Wago lookup
  */
 server.get('/lookup/wago', (req, res, next) => {
  if (!req.params.id) {
    return res.send(404, {error: "page_not_found"})
  }
  var timing = {}
  var start = Date.now()
  WagoItem.lookup(req.params.id).then((doc) => {
    timing.WagoLookup = Date.now() - start
    if (!doc || doc.deleted) {
      return res.send(404, {error: "page_not_found"})
    }

    if (doc.private && (!req.user || !req.user._id.equals(doc._userId))) {
      return res.send(404, {error: "page_not_found"})
    }
 
    doc.popularity.views++
    doc.popularity.viewsThisWeek++

    var ipAddress = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress || 
      req.socket.remoteAddress ||
      (req.connection.socket ? req.connection.socket.remoteAddress : null);

    ViewsThisWeek.find({viewed: { $gt: new Date().getTime() - 1000 * 60 * 20 }, source: ipAddress, wagoID: doc._id}).then((recent) => {
      if (!recent || recent.length === 0) {
        doc.save()
        
        var pop = new ViewsThisWeek()
        pop.wagoID = doc._id
        pop.source = ipAddress
        pop.save()
      }
    })

    var wago = {}
    wago._id = doc._id
    if (doc.type === 'WEAKAURAS2') {
      wago.type = 'WEAKAURA'
    }
    else {
      wago.type = doc.type
    }
    wago.name = doc.name
    wago.slug = doc.slug
    wago.url = doc.url
    wago.visibility = { private: doc.private, hidden: doc.hidden, deleted: doc.deleted }
    wago.date = { created: doc.created, modified: doc.modified }
    wago.expires = doc.expires_at
    wago.patch = wowPatches.patchByDate(doc.modified || doc.created)
    wago.description = { text: doc.description, format: 'bbcode' }
    wago.categories = doc.categories
    
    wago.viewCount = doc.popularity.views
    wago.viewsThisWeek = doc.popularity.viewsThisWeek
    wago.commentCount = doc.popularity.comment_count
    wago.downloadCount = doc.popularity.downloads
    wago.embedCount = doc.popularity.embeds
    wago.favoriteCount = doc.popularity.favorite_count
    if (req.user) {
      doc.popularity.favorites.forEach((userID) => {
        if (req.user._id.equals(userID)) {
          wago.myfave = true
        }
      })
    }

    timing.startingParallel = Date.now() - start
    wago.UID = doc._userId
    async.parallel({
      userLookup: (cb) => {
        if (!wago.UID) {
          return cb(null, {            
            name: null,
            searchable: false,
            roleClass: 'user-anon',
            avatar: '/media/avatars/anon.png'
          })
        }

        User.findById(wago.UID).then((user) => {
          if (!user) { // should always find a match
            return cb(null, {            
              name: null,
              searchable: false,
              roleClass: 'user-anon',
              avatar: '/media/avatars/anon.png'
            })
          }
          timing.findUser = Date.now() - start
          var u = {}
          u.name = user.account.username
          u.searchable = !user.account.hidden
          u.roleClass = user.roleclass
          u.avatar = user.avatarURL
          if (user.account.verified_human) {
            wago.description.enableLinks = true
          }
          cb(null, u)
        })
      },
      screenshotLookup: (cb) => {
        Screenshot.findForWago(wago._id).then((screens) => {
          timing.findScreenshots = Date.now() - start
          if (!screens) {
            return cb(null)
          }
          var ss = []
          screens.forEach((screen) => {
            ss.push({_id: screen._id.toString(), src: screen.url, title: screen.caption })
          })
          cb(null, ss)
        })
      },
      videoLookup: (cb) => {
        Video.findForWago(wago._id).then((videos) => {
          timing.findVideos = Date.now() - start
          if (!videos) {
            return cb(null)
          }
          var vids = []
          videos.forEach((video) => {
            vids.push({_id: video._id.toString(), url: video.url, thumb: video.thumbnail, embed: video.embed })
          })
          cb(null, vids)
        })
      },
      mediaLookup: (cb) => {
        if (doc.type === 'IMAGE') {
          wago.image = doc.image[0]
          for (file in wago.image.files) {
            if (!wago.image.files.hasOwnProperty(file)) {
              continue
            }
            if (wago.image.files[file].indexOf(/https?:\/\//) < 0) {
              wago.image.files[file] = 'https://media.wago.io/images/'  + wago.image.files[file]
            }
          }
        }
        cb(null)
      },
      collectionLookup: (cb) => {
        if (doc.type === 'COLLECTION') {
          return cb()
        }
        if (req.user) {
          var search = WagoItem.find({"type": "COLLECTION", "collect": wago._id.toString(), "$or": [{ '_userId': req.user._id || null }, { private: false, hidden: false }]})
        }
        else {
          var search = WagoItem.find({"type": "COLLECTION", "collect": wago._id.toString(), private: false, hidden: false})
        }
        
        search.sort('-modified').limit(10).populate('_userId').then((coll) => {
          timing.findCollections = Date.now() - start
          if (!coll) {
            return cb(null)
          }
          var collections = []
          coll.forEach((c) => {
            collections.push({name: c.name, _id: c._id, slug: c.slug, modified: c.modified, user: {name: c._userId.profile.name, class: c._userId.roleclass, avatar: c._userId.avatarURL, profile: c._userId.profile.url}})
          })
          cb(null, collections)
        })
      },
      collectionCount: (cb) => {
        if (doc.type === 'COLLECTION') {
          return cb()
        }
        if (req.user) {
          var search = WagoItem.count({"type": "COLLECTION", "collect": wago._id.toString(), "$or": [{ '_userId': req.user._id || null }, { private: false, hidden: false }]})
        }
        else {
          var search = WagoItem.count({"type": "COLLECTION", "collect": wago._id.toString(), private: false, hidden: false})
        }
        search.then((count) => {
          timing.countCollections = Date.now() - start
          return cb(null, count)
        })
      },
      myCollections: (cb) => {
        if (doc.type === 'COLLECTION') {
          return cb()
        }
        if (!req.user || req.user.collections.length === 0) {
          return cb(null, [])
        }
        
        WagoItem.find({"type": "COLLECTION", "collect": wago._id, "_userId": req.user._id}).select('_id').then((coll) => {
          var arr = []
          coll.forEach((c) => {
            arr.push(c._id)
          })
          cb(null, arr)
        })
      },
      codeLookup: (cb) => {
        if (doc.type === 'COLLECTION') {
          return cb()
        }
        WagoCode.lookup(wago._id, req.params.version).then((code) => {
          timing.findCode = Date.now() - start
          if (!code) {
            return cb()
          }
          if (doc.type === 'SNIPPET') {
            cb(null, {lua: code.lua})
          }
          else if (wago.type === 'WEAKAURA' && !code.encoded.match(/^!/)) {
            lua.JSON2WeakAura(code.json, (error, result) => {
              code.encoded = result.stdout
              code.save()           
              cb(null, {json: code.json, encoded: code.encoded})
            })
          }
          // for now we'll convert all RP3 strings to the old format
          else if (wago.type === 'TOTALRP3' && code.encoded.match(/^!/)) {
            lua.JSON2TotalRP3(code.json, (error, result) => {
              code.encoded = result.stdout
              code.save()           
              cb(null, {json: code.json, encoded: code.encoded})
            })
          }
          else {
            cb(null, {json: code.json, encoded: code.encoded})
          }     
        })
      },
      versionsLookup: (cb) => {
        if (doc.type === 'COLLECTION') {
          return cb()
        }
        WagoCode.find({auraID: wago._id}).select('json lua version updated').limit(10).sort({updated: -1}).then((versions) => {
          timing.findVersions = Date.now() - start
          if (!versions) {
            return cb()
          }
          WagoCode.count({auraID: wago._id}).then((count) => {
            timing.countVersions = Date.now() - start
            var v = []
            for (var i=0; i<versions.length; i++) {
              v.push({version: count - i, size: (versions[i].json && versions[i].json.length || versions[i].lua && versions[i].lua.length || versions[i].encoded && versions[i].encoded.length || 0), date: versions[i].updated})
            }
            cb(null, {total: count, versions: v})
          })
        })
      },
      commentLookup: (cb) => {
        Comments.find({wagoID: wago._id}).sort({postDate: -1}).limit(10).populate('authorID').then((comments) => {
          timing.findComments = Date.now() - start
          if (!comments) {
            return cb()
          }
          var c = []
          for (var i=0; i<comments.length; i++) {
            c.push({
              cid: comments[i]._id.toString(),
              date: comments[i].postDate, 
              text: comments[i].commentText, 
              format: 'bbcode',
              canMod: (req.user && ((req.user.admin && (req.user.admin.moderator || req.user.admin.super)) || req.user._id.equals(comments[i].authorID._id) || req.user._id.equals(wago.UID))),
              author: { 
                name: comments[i].authorID.account.username || 'User-' + comments[i].authorID._id.toString(),
                avatar: comments[i].authorID.avatarURL,
                class: comments[i].authorID.roleclass,
                profile: comments[i].authorID.profile.url,
                enableLinks: comments[i].authorID.account.verified_human
              }
            })
          }
          cb(null, c)
        })
      },
      commentCount: (cb) => {
        Comments.count({wagoID: wago._id}).then((count) => {
          timing.countComments = Date.now() - start
          cb(null, count)
        })
      },
      forkLookup: (cb) => {
        if (!doc.fork_of || wago.type === 'COLLECTION') {
          return cb()
        }
        WagoItem.findById(doc.fork_of).then((doc) => {
          if (!doc || doc.hidden || doc.private) {
            return cb()
          }
          var fork = {}
          fork._id = doc._id
          fork.name = doc.name
          cb(null, fork)
        })
      }
    }, function (err, data) {
      timing.doneParallel = Date.now() - start
      // parallel finished
      wago.alerts = {}
      wago.code = data.codeLookup
      wago.versions = data.versionsLookup
      wago.collectionCount = data.collectionCount
      wago.collections = data.collectionLookup
      wago.myCollections = data.myCollections
      wago.user = data.userLookup
      wago.screens = data.screenshotLookup
      wago.videos = data.videoLookup
      wago.commentCount = data.commentCount
      wago.comments = data.commentLookup
      wago.fork = data.forkLookup

      // check for alerts
      // functions blocked by WeakAuras
      if (wago.code && wago.code.json) {
        while ((m = commonRegex.WeakAuraBlacklist.exec(wago.code.json)) !== null) {
          if (!wago.alerts.blacklist) {
            wago.alerts.blacklist = []
          }
          wago.alerts.blacklist.push(m[1].replace(/\\"/g, '"'))
        }
        
        // check for functions that could be used for malintent
        while ((m = commonRegex.MaliciousCode.exec(wago.code.json)) !== null) {
          if (!wago.alerts.malicious) {
            wago.alerts.malicious = []
          }
          wago.alerts.malicious.push(m[1])
        }
      }

      if (req.params.timing) {
        timing.done = Date.now() - start
        return res.send(timing)
      }
      res.send(wago)
    })
  })
})

 /**
  * Wago multi WA lookup
  */
server.get('/lookup/weakauras', (req, res, next) => {
  if (!req.params.ids) {
    return res.send(404, {error: "page_not_found"})
  }

  var ids = req.params.ids.split(',').slice(0, 50)
  var wagos = []
  WagoItem.find({'$or' : [{_id: ids}, {custom_slug: ids}], deleted: false, type: ['WEAKAURAS', 'WEAKAURAS2']})
  .select({name:1, custom_slug:1, created:1, modified:1, _userId:1})
  .then((docs) => {
    async.forEachOf(docs, (doc, k, done) => {
      if (doc.private && (!req.user || !req.user._id.equals(doc._userId))) {
        return done()
      }
      var wago = {}
      wago._id = doc._id
      wago.name = doc.name      
      wago.slug = doc.custom_slug || doc._id
      wago.url = doc.url
      wago.created = doc.created
      wago.modified = doc.modified
      async.parallel({
        user: (cb) => {
          if (doc._userId) {
            User.findById(doc._userId).then((user) => {
              wago.username = user.account.username
              cb()
            })
          }
          else {
            cb()
          }
        },
        version: (cb) => {
          WagoCode.count({auraID: doc._id}).then((count) => {
            wago.version = count
            cb()
          })
        }}, () => {
          wagos.push(wago)
          done()
        })
      }, function() {
        res.send(wagos)
      })     
    }
  )
})

server.get('/lookup/wago/versions', (req, res, next) => {
  if (!req.params.id) {
    return res.send(404, {error: "page_not_found"})
  }
  WagoItem.lookup(req.params.id).then((doc) => {
    if (!doc) {
      return res.send(404, {error: "page_not_found"})
    }

    WagoCode.find({auraID: req.params.id}).select('json version updated').skip(10).sort({updated: -1}).then((versions) => {
      if (!versions) {
        return cb()
      }
      WagoCode.count({auraID: req.params.id}).then((count) => {
        var v = []
        for (var i=0; i<versions.length; i++) {
          v.push({version: count - i - 10, size: versions[i].json.length, date: versions[i].updated})
        }
        return res.send(v)
      })
    })
  })
})

server.get('/lookup/wago/collections', (req, res, next) => {
  if (!req.params.id) {
    return res.send(404, {error: "page_not_found"})
  }
   WagoItem.find({"type": "COLLECTION", "collect": req.params.id, "deleted": false, "private": false, "hidden": false})
    .sort('-modified').skip(10).populate('_userId').then((coll) => {
      if (!coll) {
        return res.send([])
      }
      var collections = []
      coll.forEach((c) => {
        collections.push({name: c.name, slug: c.slug, modified: c.modified, user: {name: c._userId.profile.name, class: c._userId.roleclass, avatar: c._userId.avatarURL, profile: c._userId.profile.url}})
      })
      return res.send(collections)
  })
})

server.get('/lookup/wago/comments', (req, res, next) => {
  if (!req.params.id || !req.params.page) {
    return res.send(404, {error: "page_not_found"})
  }
  Comments.find({wagoID: req.params.id}).sort({postDate: -1}).limit(10).skip(10 * parseInt(req.params.page)).populate('authorID').then((comments) => {
    if (!comments) {
      return res.send([])
    }
    var c = []
    for (var i=0; i<comments.length; i++) {
      c.push({
        cid: comments[i]._id.toString(),
        date: comments[i].postDate, 
        text: comments[i].commentText, 
        format: 'bbcode',
        author: { 
          name: comments[i].authorID.account.username || 'User-' + comments[i].authorID._id.toString(),
          avatar: comments[i].authorID.avatarURL,
          class: comments[i].authorID.roleclass,
          profile: comments[i].authorID.profile.url,
          enableLinks: comments[i].authorID.account.verified_human
        }
      })
    }
    return res.send(c)
  })
})

server.get('/lookup/profile', (req, res, next) => {
  if (!req.params.user) {
    return res.send(404, {error: "page_not_found"})
  }

  User.findByUsername(req.params.user).then((user) => {
    if (!user) {
      return res.send({})
    }
    var profile = {}
    profile.public = !(user.account.hidden)
    profile.name = user.account.username
    profile.roleClass = user.roleClass
    profile.description = user.profile.description
    profile.avatar = user.avatarURL
    if (req.user && req.user._id.equals(user._id)) {
      profile.mine = true
    }
    res.send(profile)
  })
})

/**
 * Get a single blog post
 */
server.get('/lookup/blog', (req, res) => {
  if (!req.query.id) {
    return res.send(404, {error: "page_not_found"})
  }

  var query
  if (req.user && req.user.admin) {
    // allow fetching drafts for admins
    query = {_id: req.query.id}
  }
  else {
    query = {_id: req.query.id, publishStatus: 'publish'}
  }

  Blog.findOne(query).populate('_userId').then((doc) => {
    if (doc) {
      res.send({
        content: doc.content,
        date: doc.date,
        format: doc.format,
        title: doc.title,
        _id: doc._id,
        publishStatus: doc.publishStatus,
        user: {
          username: doc._userId.account.username,
          css: doc._userId.roleclass
        }
      })
    }
    else {
      return res.send(404, {error: "page_not_found"})
    }
  })
})

/**
 * Get a page of blog posts.
 * Also includes the first and last ID of overall blog posts.
 */
server.get('/lookup/blogs', (req, res) => {
  if (!req.query.page) {
    return res.send(404, {error: "page_not_found"})
  }

  var pageNum = parseInt(req.query.page)
  if (pageNum <= 0) {
    return res.send(404, {error: "page_not_found"})
  }
  // reduce to zero-index
  pageNum--

  var data = {}
  async.parallel([
    (done) => {
      Blog.find({publishStatus: 'publish'}).populate('_userId').sort('-date').limit(3).skip(pageNum * 3).then((docs) => {
        if (docs && docs.length > 0) {
          var news = []
          docs.forEach((doc) => {
            news.push({
              content: doc.content,
              date: doc.date,
              format: doc.format,
              title: doc.title,
              _id: doc._id,
              publishStatus: doc.publishStatus,
              user: {
                username: doc._userId.account.username,
                css: doc._userId.roleclass
              }
            })
          })
          data.news = news
          done()
        }
        else {
          data.error = 'no_news_found'
          done()
        }
      })
    },
    (done) => {
      Blog.findOne({publishStatus: 'publish'}).sort('date').select('_id').then((doc) => {
        data.oldest = doc._id
        done()
      })
    },
    (done) => {
      Blog.findOne({publishStatus: 'publish'}).sort('-date').select('_id').then((doc) => {
        data.latest = doc._id
        done()
      })
    }
  ], () => {
    res.send(data)
  })  
})

/**
 * Fetch static contents used on index page
 */
server.get('/lookup/index', (req, res) => {
  res.send({top10: global.TopTenLists, news: global.newsPosts, addons: global.addonUpdates})
})

/**
 * Fetch site data
 */
server.get('/data/:key', (req, res) => {
  SiteData.findOne({_id: req.params.key}).then((data) => {
    if (data)
      res.send(data)
    else
      return res.send(404, {error: "value_not_found"})
  })
})