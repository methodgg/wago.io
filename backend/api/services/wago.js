const semver = require('semver')
const mkdirp = require('mkdirp-promise')
const s3 = require('../helpers/s3Client')
const Magic = require('promise-mmmagic')
const magic = new Magic(Magic.MAGIC_MIME_TYPE)
const videoParser = require('js-video-url-parser')
const tmpDir = __dirname + '/../../run-tmp/'

module.exports = function (fastify, opts, next) {
  // sets favorite for a wago
  fastify.post('/star', async (req, res, next) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    const wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago) {
      return res.code(404).send({error: "no_wago"})
    }

    if (req.body.addStar) {
      WagoFavorites.addStar(wago, req.user._id)
      res.send({updated: true, count: wago.popularity.favorite_count+1 })
    }
    else {
      WagoFavorites.removeStar(wago, req.user._id)
      res.send({updated: true, count: wago.popularity.favorite_count-1 })
    }
  })


  // update wago name
  fastify.post('/update/name', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }
    else if (!req.body.name) {
      return res.code(401).send({error: "invalid input"})
    }
    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    wago.name = req.body.name
    await wago.save()
    res.send({success: true})
  })


  // update game mode
  // this will not work: needs update to fastify when turned on for next expansion
  // server.post('/update/gameMode', (req, res) => {
  //   if (!req.user || !req.body.wagoID) {
  //     return res.code(403).send({error: "forbidden"})
  //   }

  //   if (req.body.mode === '' || req.body.mode === 'beta-bfa') {
  //     WagoItem.findById(req.body.wagoID).then((wago) => {
  //       if (!wago || !wago._userId.equals(req.user._id)) {
  //         return res.send(404, {error: "no_wago"})
  //       }

  //       if (req.body.mode === '') {
  //         var i = wago.categories.indexOf('beta-bfa')
  //         if (i >= 0) {
  //           wago.categories.splice(i, 1)
  //         }
  //       }
  //       else if (req.body.mode === 'beta-bfa') {
  //         var i = wago.categories.indexOf('beta-bfa')
  //         if (i === -1) {
  //           wago.categories.push('beta-bfa')
  //         }
  //       }
  //       wago.save().then(() => {
  //         res.send({success: true})
  //       })
  //     })
  //   }
  //   else {
  //     res.send({success: false})
  //   }
  // })

  // update wago slug
  fastify.post('/update/slug', async (req, res) => {
    if (!req.user || !req.user.access.custom_slug || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }
    else if (!req.body.slug || req.body.slug.match(/[\s%#/\\<>]/) || (req.body.slug.length < 7 && !req.body.slug.match(/[^\u0000-\u007F]/))) {
      return res.code(401).send({error: "invalid input"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    // if removing a custom slug
    if (!req.body.slug) {
      wago.custom_slug = null
      await wago.save()
      res.send({success: true})
    }
    else {
      // make sure slug is unique
      var exists = await WagoItem.lookup(req.body.slug)
      if (!exists || exists._id === wago._id) {
        wago.custom_slug = req.body.slug
        await wago.save()
        res.send({success: true})
      }
      else {
        res.send({exists: true})
      }
    }
  })

  // update wago description
  fastify.post('/update/desc', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    wago.description = req.body.desc || ''
    wago.description_format = req.body.format || 'bbcode'
    await wago.save()
    res.send({success: true})
  })

  // update wago version
  fastify.post('/update/version', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.versionString) {
      return res.code(403).send({error: "forbidden"})
    }
    var versionString = semver.valid(semver.coerce(req.body.versionString))
    if (!versionString || !req.body.version) {
      return res.code(403).send({error: "bad input"})
    }

    const wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var code = await WagoCode.lookup(wago._id, req.body.version)
    if (!code) {
      return res.code(404).send({error: "no_code"})
    }
    code.versionString = versionString
    code.changelog.text = req.body.changelog
    code.changelog.format = req.body.changelogFormat
    await code.save()

    var docs = await WagoCode.find({auraID: wago._id}).sort('version').exec()
    var previous
    for (let i = 0; i < docs.length; i++) {
      if (!previous) {
        previous = semver.valid(semver.coerce(docs[i].versionString))
        continue
      }
      let next = semver.valid(semver.coerce(docs[i].versionString))
      if (semver.gte(previous, next)) {
        next = semver.inc(previous, 'patch')
        docs[i].versionString = next
        await docs[i].save()
      }
      previous = next
    }
    res.send({success: true})
  })

  // update wago visibility
  fastify.post('/update/visibility', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    wago.hidden = false
    wago.private = false
    wago.restricted = false
    wago.restrictedUsers = []
    wago.restrictedGuilds = []
    wago.restrictedTwitchSubs = []
    if (req.body.visibility === 'Hidden') {
      wago.hidden = true
    }
    else if (req.body.visibility === 'Restricted') {
      wago.restricted = true
    }
    else if (req.body.visibility === 'Private') {
      wago.private = true
    }

    await wago.save()
    res.send({success: true, hidden: wago.hidden, private: wago.private, restricted: wago.restricted})
  })

   // update wago restriction access
   fastify.post('/update/restrictions', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.access) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago.restricted || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    wago.restrictedUsers = []
    wago.restrictedGuilds = []
    wago.restrictedTwitchSubs = []
    for (let i = 0; i < req.body.access.length; i++) {
      if (req.body.access[i].type === 'user' && req.body.access[i].value) {
        var lookup = await User.findOne({'search.username': req.body.access[i].value.toLowerCase()})
        if (lookup) {
          wago.restrictedUsers.push(lookup._id.toString())
        }
      }
      else if (req.body.access[i].type === 'guild' && req.user.access.restrictGuild && req.body.access[i].value && req.user.battlenet.guilds.indexOf(req.body.access[i].value) >= 0) {
        wago.restrictedGuilds.push(req.body.access[i].value)
      }
    }
    await wago.save()
    res.send({success: true, hidden: wago.hidden, private: wago.private, restricted: wago.restricted})
  })

  // update wago categories
  fastify.post('/update/categories', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    // retain system tags
    var systemTags = Categories.filterSystemTags(wago.categories)

    if (!req.body.cats) {
      wago.categories = []
    }
    else {
      wago.categories = Categories.validateCategories(req.body.cats.split(','))
    }
    wago.relevancy = Categories.relevanceScores(wago.categories)

    // re-add system tags
    wago.categories = wago.categories.concat(systemTags)

    // check if this import should have any system tags applied
    await wago.save()
    res.send({success: true})
  })

  // add image by base64 format

  fastify.post('/upload/image/base64', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var img = req.body.image || req.body.file || ''
    var match = img.match(/^data:image\/(png|jpg|gif|jpeg);base64,/i)
    if (!img || !match) {
      return res.code(400).send({error: "bad input"})
    }
    if (match[1] === 'jpeg') {
      match[1] = 'jpg'
    }
    // prepare image
    var data = img.replace(/^data:image\/\w+;base64,/, "")
    var buffer = Buffer.from(data, 'base64')
    // TODO: convert to webp when possible
    // TODO: convert gifs to mp4?

    // setup database entry
    var screen = new Screenshot({auraID: wago._id.toString()})
    screen.localFile = screen._id.toString() + '.' + match[1] // filename

    // save tmp location TODO: make an s3.uploadBuffer func
    await fs.writeFile(tmpDir + screen.localFile, buffer)

    // upload to s3
    try {
      await s3.uploadFile({
        localFile: tmpDir + screen.localFile,
        s3Params: {
          Bucket: 'wago-media',
          Key: `screenshots/${wago._id}/${screen.localFile}`
        }
      })
      fs.unlink(tmpDir + screen.localFile)
      await screen.save()
      res.send({success: true, _id: screen._id.toString(), src: screen.url})
    }
    catch (e) {
      fs.unlink(tmpDir + screen.localFile)
      res.send({success: false})
    }
  })

  // add image/video by URL
  fastify.post('/upload/image/url', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var isVideo = videoParser.parse(req.body.url)
    // if youtube video detected
    if (isVideo) {
      var video = new Video()
      video.wagoID = wago._id
      video.source = isVideo.provider
      video.videoID = isVideo.id
      video.videoType = isVideo.mediaType

      // if we need to check API for thumbnail
      // TODO: twitch now requires a client ID for lookups
      // if (video.source === 'twitch' && video.videoID) {
      //   // get thumbnail twitch API
      //   console.log('https://api.twitch.tv/kraken/videos/'+video.videoID)
      //   var content = await axios.get('https://api.twitch.tv/kraken/videos/'+video.videoID)
      //   if (!content) {
      //     return res.code(400).send({error: "invalid_twitch"})
      //   }
      //   try {
      //     var json = JSON.parse(content)
      //     if (json && json.preview) {
      //       var video = new Video()
      //       video.thumb = json.preview
      //       await video.save()
      //       res.send({success: true, _id: video._id.toString(), embed: video.embed, thumb: video.thumbnail, url: video.url, type: 'video'})
      //     }
      //     else {
      //       return res.code(400).send({error: "invalid_twitch"})
      //     }
      //   }
      //   catch(e) {
      //     return res.code(400).send({error: "invalid_twitch"})
      //   }
      // }

      if (video.source === 'vimeo') {
        var content = await axios.get('https://vimeo.com/api/oembed.json?url=https://vimeo.com/'+video.videoID)
        if (!content) {
          return res.code(400).send({error: "invalid_vimeo"})
        }
        try {
          var json = JSON.parse(content.data)
          if (json && json.thumbnail_url) {
            video.thumb = json.thumbnail_url.replace(/\.webp/, '.png')
            await video.save()
            res.send({success: true, _id: video._id.toString(), embed: video.embed, thumb: video.thumbnail, url: video.url, type: 'video'})
          }
          else {
            return res.code(400).send({error: "invalid_vimeo"})
          }
        }
        catch(e) {
          logger.error({label: 'Error fetching from vimeo API', error: e})
          return res.code(400).send({error: "invalid_vimeo"})
        }
      }
      // else thumbnail can be generated from existing data
      else {
        await video.save()
        res.send({success: true, _id: video._id.toString(), embed: video.embed, thumb: video.thumbnail, url: video.url, type: 'video'})
      }
    }

    // not a video, check if it's an image
    else {
      // TODO: add additional support for imgur, giphy, others?
      var arraybuffer = await axios.request({
        responseType: 'arraybuffer',
        url: req.body.url,
        method: 'get'
      })
      var buffer = Buffer.from(arraybuffer.data, 'binary')

      try {
        const mime = await magic.detect(buffer)
        const match = mime.match(/^image\/(png|jpg|gif|jpeg)/)
        if (!match) {
          return res.code(400).send({error: "invalid_image"})
        }
        // if image type detected then save file
        if (match[1] === 'jpeg') {
          match[1] = 'jpg'
        }
        // setup database entry
        var screen = new Screenshot()
        screen.auraID = wago._id
        screen.localFile = screen._id.toString() + '.' + match[1] // filename

        // save tmp location TODO: make an s3.uploadBuffer func
        await fs.writeFile(tmpDir + screen.localFile, buffer)

        // upload to s3
        await s3.uploadFile({
          localFile: tmpDir + screen.localFile,
          s3Params: {
            Bucket: 'wago-media',
            Key: `screenshots/${wago._id}/${screen.localFile}`
          }
        })
        fs.unlink(tmpDir + screen.localFile)
        await screen.save()
        res.send({success: true, _id: screen._id.toString(), src: screen.url})
      }
      catch (e) {
        fs.unlink(tmpDir + screen.localFile)
        console.log(e)
        return res.code(400).send({error: "invalid_image"})
      }
    }
  })

  // delete screenshot
  fastify.post('/update/delete/screenshot', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var screen = await Screenshot.findById(req.body.screen).exec()
    if (screen) {
      await screen.remove()
    }
    res.send({success: true})
  })

  // delete video
  fastify.post('/update/delete/video', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var video = await Video.findById(req.body.video).exec()
    if (video) {
      await video.remove()
    }
    res.send({success: true})
  })

  // sort screenshots
  fastify.post('/update/sort/screenshots', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.screens) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    req.body.screens = req.body.screens.split(',')
    var screenIDs = req.body.screens.map((s) => {
      return mongoose.Types.ObjectId(s)
    })
    var screens = await Screenshot.find({_id: {$in: screenIDs}})
    for (let i = 0; i < screens.length; i++) {
      if (screens[i].auraID === wago._id) {
        screens[i].sort = req.body.screens.indexOf(screens[i]._id.toString())
        screens[i].save()
      }
    }
    res.send({success: true})
  })

  // sort videos
  fastify.post('/update/sort/videos', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.videos) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    req.body.videos = req.body.videos.split(',')
    var screenIDs = req.body.videos.map((s) => {
      return mongoose.Types.ObjectId(s)
    })
    var videos = await Video.find({_id: {$in: screenIDs}})
    for (let i = 0; i < videos.length; i++) {
      if (videos[i].auraID === wago._id) {
        videos[i].sort = req.body.videos.indexOf(videos[i]._id.toString())
        videos[i].save()
      }
    }
    res.send({success: true})
  })

  // delete wago import
  fastify.post('/update/delete/confirm', async (req, res) => {
    if (!req.user || !req.body.wagoID) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago || !wago._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    wago.deleted = true
    var today = new Date()
    var expires = new Date(today.getFullYear(), today.getMonth(), today.getDate()+14)
    wago.expires_at = expires

    await wago.save()
    wago.unIndex()
    res.send({success: true})
  })


  // Add to collection
  fastify.post('/collection/add', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.collectionID) {
      return res.code(403).send({error: "forbidden"})
    }

    var collection = await WagoItem.findById(req.body.collectionID).exec()
    if (!collection || !collection._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago) {
      return res.code(404).send({error: "not found"})
    }

    if (collection.collect.length === 0 || collection.collect.indexOf(req.body.wagoID) === -1) {
      collection.collect.push(req.body.wagoID)
      await collection.save()
    }
    res.send({success: true, added: true, name: collection.name, slug: collection.slug})
  })

  // Remove from collection
  fastify.post('/collection/remove', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.collectionID) {
      return res.code(403).send({error: "forbidden"})
    }

    var collection = await WagoItem.findById(req.body.collectionID).exec()
    if (!collection || !collection._userId.equals(req.user._id)) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago) {
      return res.code(404).send({error: "not found"})
    }

    if (collection.collect.length > 0) {
      var i = collection.collect.indexOf(req.body.wagoID)
      if (i > -1) {
        collection.collect.splice(i, 1)
        await collection.save()
      }
    }
    res.send({success: true, removed: true})
  })

  // create new collection
  fastify.post('/collection/new', async (req, res) => {
    if (!req.user || !req.body.wagoID || !req.body.name) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).exec()
    if (!wago) {
      return res.code(404).send({error: "not found"})
    }

    var collection = new WagoItem({type:'COLLECTION', name: req.body.name, _userId: req.user._id})
    collection.collect.push(req.body.wagoID)
    await collection.save()
    res.send({success: true, name: collection.name, collectionID: collection._id})
  })

  next()
}