const config = require('../../config')
const locale = require("locale")
const image = require('../helpers/image')
const JSZip = require('jszip')
const profileFeatures = require('../helpers/profileFeatures')

// build localeArray
var localeArray = []
config.supportedLocales.forEach(function(loc) {
  localeArray.push(loc.code)
})
var supportedLocales = new locale.Locales(localeArray)

module.exports = (fastify, opts, next) => {

  // returns data on currently logged in user
  fastify.get('/whoami', async (req, res, next) => {
    var data = {}
    // if user has locale preference saved
    if (req.user && req.user.locale && localeArray.indexOf(user.locale) !== -1) {
      data.locale = req.user.locale
    }

    // if we are requesting a locale detection
    else if (req.query.getLocale) {
      // otherwise match by browser accept language
      var detectedLocales = new locale.Locales(req.headers["accept-language"])
      var match = detectedLocales.best(supportedLocales).toString()

      // nothing? default to en-US
      if (!match || localeArray.indexOf(match) === -1) {
        match = 'en-US'
      }

      // set locale
      data.locale = match
    }

    if (global['mdtWeek' + req.wowRegion]) {
      data.mdtWeek = global['mdtWeek' + req.wowRegion]
    }

    data.wotm = global.WagoOfTheMoment

    // if user is logged in
    if (req.user) {
      if (req.user.battlenet && req.user.battlenet.updateStatus === 'pending-API' && (new Date(req.user.battlenet.updateDate)).getTime() + 10000 < Date.now()) {
        req.user.battlenet.updateStatus = 'timeout'
        await req.user.save()
      }

      var user = req.user
      var who = {}
      who.UID = user._id
      who.name = user.account.username || 'User-' + user._id.toString()
      who.avatar = user.avatarURL
      who.css = user.roleClass

      if (user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length) {
        user.battlenet.guilds.sort()
      }
      who.battlenet = user.battlenet || false
      who.discord = user.discord || false
      who.google = user.google || false
      who.patreon = user.patreon || false
      who.twitch = user.twitch || false
      who.twitch.refreshToken = undefined
      who.twitter = user.twitter || false
      if (user.account.password) {
        who.localAcct = true
      }

      who.defaultImportVisibility = user.account.default_aura_visibility
      who.defaultEditorSyntax = user.config.textSyntax
      who.profileVisibility = user.profile.visibility

      who.access = {}
      who.access.human = user.account.verified_human
      who.access.customSlug = user.access.custom_slug
      who.access.beta = user.access.beta
      who.access.animatedAvatar = user.access.animatedAvatar
      who.access.restrictGuild = user.access.restrictGuild
      who.access.restrictSubs = user.access.restrictSubs
      if (user.access.api) {
        who.access.api = true
        who.apiKey = user.account.api_key
      }
      who.access.sub = user.roles.subscriber
      who.access.goldSub = user.roles.gold_subscriber
      who.access.guild_subscriber = user.roles.guild_subscriber
      who.access.ambassador = user.roles.ambassador
      who.access.developer = user.roles.developer
      who.access.community_leader = user.roles.community_leader
      who.access.contestWinner = user.roles.artContestWinnerAug2018

      if (user.roles.isAdmin.access) {
        who.access.admin = user.roles.isAdmin
      }

      who.hideAds = user.access.hideAds
      who.config = user.config
      who.companionHideAlert = user.account.companionHideAlert

      const unreadComments = Comments.findUnread(user._id)
      const myCollections = WagoItem.find({_userId: user._id, type: 'COLLECTION', deleted: false}).select('_id name').sort('name').exec()
      who.unreadMentions = await unreadComments
      who.collections = await myCollections
      data.user = who
      res.send(data)
    }
    else {
      data.guest = true
      // return user info
      res.send(data)
    }
  })

  // change user locale
  // TODO: track locales that are being used
  fastify.post('/setlocale', (req, res, next) => {
    // validate user input against supported locales
    var input = new locale.Locales(req.body.locale)
    var locale = input.best(supportedLocales)
    res.send({setLocale: locale})
  })

  // change username
  fastify.post('/update/username', async (req, res) => {
    if (!req.user || !req.body.name) {
      return res.code(403).send({error: "forbidden"})
    }
    else if (req.body.name.match(/[%/\\<>]/)) {
      return res.code(401).send({error: "invalid input"})
    }

    // make sure username is unique
    const exists = await User.findByUsername(req.body.name)
    if (!exists) {
      req.user.account.username = req.body.name
      req.user.search.username = req.body.name.toLowerCase()
      await req.user.save()
      return res.send({success: true})
    }
    else {
      return res.send({exists: true})
    }
  })

  // upload image
  fastify.post('/upload/avatar', async (req, res) => {
    if (!req.user || !req.body.file) {
      return res.code(403).send({error: "forbidden"})
    }

    var base64 = req.body.file
    var match = base64.match(/^data:image\/(png|jpg|gif|jpeg);base64,/i)
    if (base64 && match) {
      if (match[1] === 'jpeg') {
        match[1] = 'jpg'
      }
      // prepare image
      var data = base64.replace(/^data:image\/\w+;base64,/, "")
      var buffer = Buffer.from(data, 'base64')
      var avatarFormat = 'custom'
      if (match[1] === 'gif' && req.user.access.animatedAvatar) {
        avatarFormat = 'animated'
      }

      const img = await image.avatarFromBuffer(buffer, req.user._id.toString(), avatarFormat)
      if (img.error) {
        return res.send(img)
      }
      req.user.profile.avatar = img
      req.user.save()
      res.send({success: true, avatar: img})
    }
    else {
      res.send({error: 'not image'})
    }
  })

  // select avatar option
  fastify.post('/update/avatar', async (req, res) => {
    if (!req.user || !req.body.avatar) {
      return res.code(403).send({error: "forbidden"})
    }

    // import by selected option
    switch (req.body.avatar) {
      // generate new from adorable.io - now self hosted with original api opensource and offline
      case 'adorable':
        var img = await image.avatarFromURL('https://api.hello-avatar.com/adorables/64/' + req.user._id.toString() + Date.now() + '.png', req.user._id.toString(), req.body.avatar)
        req.user.profile.avatar = img
        req.user.save()
        res.send({success: true, avatar: img})
        break

      // copying from oauth provider
      case 'battlenet':
      case 'discord':
      case 'google':
      case 'patreon':
      case 'twitter':
        if (req.user[req.body.avatar] && req.user[req.body.avatar].avatar) {
          req.user.profile.avatar = req.user[req.body.avatar].avatar
          req.user.save()
          res.send({success: true, avatar: req.user.profile.avatar})
        }
        break
    }
  })

  // set profile visibility
  fastify.post('/update/profile-visibility', (req, res) => {
    if (!req.user) {
      return res.code(403).send({error: "forbidden"})
    }

    if (req.body.value === 'Private') {
      req.user.account.hidden = true
    }
    else {
      req.user.account.hidden = false
    }

    req.user.save()
    res.send({succes: true})
  })

  // set default import visibility
  fastify.post('/update/import-default-visibility', async (req, res) => {
    if (!req.user) {
      return res.code(403).send({error: "forbidden"})
    }

    if (req.body.value === 'Private' || req.body.value === 'Hidden') {
      req.user.account.default_aura_visibility = req.body.value
    }
    else {
      req.user.account.default_aura_visibility = 'Public'
    }

    req.user.save()
    res.send({succes: true})
  })

  fastify.post('/update/theme', (req, res) => {
    if (!req.user || !req.body.theme || !req.body.editor || !req.body.theme.match(/^(classic|dark)$/)) {
      return res.code(403).send({error: "forbidden"})
    }

    req.user.config.theme = req.body.theme
    req.user.config.editor = req.body.editor
    req.user.save()
    res.send({succes: true})
  })

  fastify.post('/update/editorSyntax', (req, res) => {
    if (!req.user || !req.body.syntax || req.body.syntax.length > 32) {
      return res.code(403).send({error: "forbidden"})
    }

    req.user.config.textSyntax = req.body.syntax
    req.user.save()
    res.send({succes: true})
  })

  fastify.post('/disableCompanionAlert', (req, res) => {
    if (!req.user) {
      return res.code(403).send({error: "forbidden"})
    }

    req.user.account.companionHideAlert = true
    req.user.save()
    res.send({succes: true})
  })

  /**
   * Profile update
   */
  fastify.post('/profile', async (req, res) => {
    if (!req.user) {
      return res.code(403).send({error: "forbidden"})
    }
    try {
      req.user.profile.social.discord = req.body.social.discord
      req.user.profile.social.twitch = req.body.social.twitch
      req.user.profile.social.twitter = req.body.social.twitter
      req.user.profile.social.github = req.body.social.github
      req.user.profile.social.youtube = req.body.social.youtube
      req.user.profile.social.facebook = req.body.social.facebook
      req.user.profile.description.text = req.body.description.text
      req.user.profile.description.format = req.body.description.format
      await req.user.save()
      return res.send({success: true})
    }
    catch (e) {
      return res.code(400).send({error: "bad input"})
    }
  })

  // for viewing feature in edit mode
  fastify.post('/profile/feature', async (req, res, next) => {
    if (!req.user || !req.user.access.beta) {
      return res.code(404).send({error: "page_not_found"})
    }
    try {
      var json = JSON.parse(req.body.feature)

      if (json.key !== 0 && json.key !== 1 && json.key !== 2) {
        return res.code(400).send({error: "bad input"})
      }
      
      if (req.user.profile.featured[json.key]) {
        let feature = Object.assign(req.user.profile.featured[json.key].toObject(), json)
        feature.config = Object.assign(req.user.profile.featured[json.key].config.toObject() || {}, json.config)
        return res.send(await profileFeatures.get(req.user._id, [feature], true))
      }
      else {
        return res.send(await profileFeatures.get(req.user._id, [json], true))
      }
    }
    catch (e) {
      console.log(e)
      return res.code(400).send({error: "bad input"})
    }
  })
  
  fastify.post('/profile/feature/save', async (req, res) => {
    if (!req.user || !req.user.access.beta) {
      return res.code(403).send({error: "forbidden"})
    }
    try {
      while (req.user.profile.featured.length < 3) {
        req.user.profile.featured.push({})
      }
      const feature = JSON.parse(req.body.feature)
      const key = parseInt(req.body.key)
      if (key !== 0 && key !== 1 && key !== 2) {
        return res.code(400).send({error: "bad input"})
      }
      switch (feature.type) {
        case '':
          req.user.profile.featured.splice(key, 1)
          await req.user.save()
          break
        case 'wago':
          if (!feature.subtype || !feature.subtype.match(/^(imports|collection)$/)) {
            return res.code(400).send({error: "bad input"})
          }
          if (!feature.imports || !feature.imports.match(/^(popular|stars|views|updates|manual)$/)) {
            return res.code(400).send({error: "bad input"})
          }
          req.user.profile.featured[key].type = 'wago'
          req.user.profile.featured[key].subtype = feature.subtype
          req.user.profile.featured[key].imports = feature.imports
          if (feature.subtype === 'collection' && feature.config) {
            req.user.profile.featured[key].config.item = feature.config.item
          }
          if (feature.imports === 'manual' && feature.config && feature.config.select) {
            req.user.profile.featured[key].config.select = []
            for (id of feature.config.select) {
              if (!id) {
                req.user.profile.featured[key].config.select.push('')
              }
              else {
                let valid = WagoItem.find({_id: id, _userId: req.user._id})
                if (valid) {
                  req.user.profile.featured[key].config.select.push(id)
                }
                else {
                  req.user.profile.featured[key].config.select.push('')
                }
              }
            }
          }
          await req.user.save()
          break
      }
      return res.send({success: true})
    }
    catch (e) {
      console.log(e)
      return res.code(400).send({error: "bad input"})
    }
  })

  /**
   * right of access - request all user data
   */

  fastify.post('/right-of-access', async (req, res) => {
    if (!req.user) {
      return res.code(403).send({error: "forbidden"})
    }
    const zip = new JSZip()

    const user = req.user.toJSON()
    delete user.roles.isAdmin
    for (r in user.roles) {
      if (user.roles.hasOwnProperty(r)) {
        if (!user.roles[r]) {
          delete user.roles[r]
        }
      }
    }

    if (user.account.password) {
      user.account.password = 'HASHED'
    }

    user.sessions = await UserSessions.find({UID: req.user._id}).lean().exec()
    zip.file("user.txt", JSON.stringify(user, null, 4))

    const comments = await Comments.find({authorID: req.user._id}).select('-usersTagged').exec()
    zip.file("comments.txt", JSON.stringify(comments, null, 4))

    const faves = await WagoFavorites.find({userID: req.user._id}).exec()
    zip.file("faves.txt", JSON.stringify(faves, null, 4))

    const imports = await WagoItem.find({_userId: req.user._id}).lean().exec()
    for (let i = 0; i < imports.length; i++) {
      delete imports[i].popularity.favorites
      delete imports[i].popularity.buds_installed
      imports[i].screenshots = await Screenshot.find({auraID: imports[i]._id}).exec()
      imports[i].videos = await Video.find({auraID: imports[i]._id}).exec()
      imports[i].code = await WagoCode.find({auraID: imports[i]._id}).sort({version: -1}).exec()
      zip.file(`imports/${imports[i]._id}.txt`, JSON.stringify(imports[i], null, 4))
    }

    zip.generateAsync({type: 'nodebuffer', compression: "DEFLATE", compressionOptions: {level: 9}}).then((buff) => {
      res.type('application/zip')
      res.send(buff)
    })
  })

  /**
   * Set Discord options
   */
  fastify.post('/discord/options', (req, res) => {
    if (!req.user || !req.user.discord || !req.user.discord.id) {
      return res.code(403).send({error: "forbidden"})
    }
    req.user.discord.options.messageOnFaveUpdate = req.body.msgOnFaveUpdate && true || false
    req.user.discord.options.messageOnComment  = req.body.msgOnComment && true || false
    if (req.body.createWebhook && req.body.createWebhook.match(/^https:\/\/(ptb.)?discord(app)?.com\/api\/webhooks\/[^\s]+/)) {
      req.user.discord.webhooks.onCreate = req.body.createWebhook
    }
    else if (req.body.createWebhook ) {
      return res.code(400).send({error: "invalid web hook"})
    }
    else {
      req.user.discord.webhooks.onCreate = null
    }

    req.user.save()
    res.send({succes: true})
  })

  fastify.post('/api-key', async (req, res) => {
    if (!req.user || !req.user.access.api) {
      return res.code(403).send({error: "forbidden"})
    }

    if (!req.user.account.api_key || req.body.new) {
      var key = await req.user.createAPIKey()
      res.send({key: key})
    }
    else {
      res.send({key: req.user.account.api_key})
    }
  })

  next()
}