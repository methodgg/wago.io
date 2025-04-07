const config = require('../../config')
const locale = require("locale")
const image = require('../helpers/image')


// build localeArray
var localeArray = []
config.supportedLocales.forEach(function (loc) {
  localeArray.push(loc.code)
})
var supportedLocales = new locale.Locales(localeArray)

module.exports = (fastify, opts, next) => {

  fastify.get('/status', async (req, res) => {
    // header checks
    res.send({})
  })

  fastify.post('/close-embed', async (req, res) => {
    await redis2.set(`stream:__CLOSED__:${req.raw.ip}`, 1, 'EX', 70)
    await redis2.set(`currentstream:${req.raw.ip}`, '__CLOSED__', 'EX', 70)
    res.send({})
  })

  // returns data on currently logged in user
  fastify.get('/whoami', async (req, res) => {
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

    data.wotm = JSON.parse(await redis.get('static:WagoOfTheMoment'))

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
      who.avatar = await user.avatarURL
      who.css = user.roleClass

      if (user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length) {
        user.battlenet.guilds.sort()
      }
      who.battlenet = user.battlenet || false
      who.discord = user.discord || false

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
      who.access.sub = user.roles.subscriber || user.roles.legacy_subscriber || user.roles.gold_subscriber || user.roles.legacy_gold_subscriber
      who.access.goldSub = user.roles.gold_subscriber || user.roles.legacy_gold_subscriber
      who.access.guild_subscriber = user.roles.guild_subscriber
      who.access.ambassador = user.roles.ambassador
      who.access.methodRaider = user.roles.methodRaider
      who.access.methodStreamer = user.roles.methodStreamer
      who.access.developer = user.roles.developer
      who.access.community_leader = user.roles.community_leader
      who.access.contestWinner = user.roles.artContestWinnerAug2018
      who.access.premium = user.access.premium

      if (user.roles.isAdmin.access) {
        who.access.admin = user.roles.isAdmin
      }

      who.hideAds = user.access.hideAds
      who.config = user.config
      who.companionHideAlert = user.account.companionHideAlert

      who.webhookOnImport = user.webhookOnImport

      const unreadComments = Comments.findUnread(user._id)
      const myCollections = WagoItem.find({ _userId: user._id, type: 'COLLECTION', deleted: false }).select('_id name').sort('name').exec()
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
    res.send({ setLocale: locale })
  })

  // change username
  fastify.post('/update/username', async (req, res) => {
    if (!req.user || !req.body.name) {
      return res.code(403).send({ error: "forbidden" })
    }
    else if (req.body.name.match(/[%/\\<>]/)) {
      return res.code(401).send({ error: "invalid input" })
    }

    // make sure username is unique
    const exists = await User.findByUsername(req.body.name)
    if (!exists) {
      req.user.account.username = req.body.name
      req.user.search.username = req.body.name.toLowerCase()
      await req.user.save()
      return res.send({ success: true })
    }
    else {
      return res.send({ exists: true })
    }
  })

  // upload image
  fastify.post('/upload/avatar', async (req, res) => {
    if (!req.user || !req.body.file) {
      return res.code(403).send({ error: "forbidden" })
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
      res.send({ success: true, avatar: img })
    }
    else {
      res.send({ error: 'not image' })
    }
  })

  // select avatar option
  fastify.post('/update/avatar', async (req, res) => {
    if (!req.user || !req.body.avatar) {
      return res.code(403).send({ error: "forbidden" })
    }

    // import by selected option
    switch (req.body.avatar) {
      // generate new from adorable.io - now self hosted with original api opensource and offline
      case 'adorable':
        const img = await image.avatarFromURL('https://api.dicebear.com/7.x/big-ears-neutral/svg?seed=' + this._id.toString() + Date.now(), req.user._id.toString(), req.body.avatar)
        req.user.profile.avatar = img
        req.user.save()
        res.send({ success: true, avatar: img })
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
          res.send({ success: true, avatar: req.user.profile.avatar })
        }
        break
    }
  })

  // set profile visibility
  fastify.post('/update/profile-visibility', (req, res) => {
    if (!req.user) {
      return res.code(403).send({ error: "forbidden" })
    }

    if (req.body.value === 'Private') {
      req.user.account.hidden = true
    }
    else {
      req.user.account.hidden = false
    }

    req.user.save()
    res.send({ success: true })
  })

  // set default import visibility
  fastify.post('/update/import-default-visibility', async (req, res) => {
    if (!req.user) {
      return res.code(403).send({ error: "forbidden" })
    }

    if (req.body.value === 'Private' || req.body.value === 'Hidden') {
      req.user.account.default_aura_visibility = req.body.value
    }
    else {
      req.user.account.default_aura_visibility = 'Public'
    }

    req.user.save()
    res.send({ success: true })
  })

  fastify.post('/update/theme', (req, res) => {
    if (!req.user || !req.body.theme || !req.body.editor || !req.body.theme.match(/^(classic|dark)$/)) {
      return res.code(403).send({ error: "forbidden" })
    }

    req.user.config.theme = req.body.theme
    req.user.config.editor = req.body.editor
    req.user.save()
    res.send({ success: true })
  })

  fastify.post('/update/editorSyntax', (req, res) => {
    if (!req.user || !req.body.syntax || req.body.syntax.length > 32) {
      return res.code(403).send({ error: "forbidden" })
    }

    req.user.config.textSyntax = req.body.syntax
    req.user.save()
    res.send({ success: true })
  })

  fastify.post('/disableCompanionAlert', (req, res) => {
    if (!req.user) {
      return res.code(403).send({ error: "forbidden" })
    }

    req.user.account.companionHideAlert = true
    req.user.save()
    res.send({ success: true })
  })

  /**
   * Set Discord options
   */
  fastify.post('/discord/options', (req, res) => {
    if (!req.user || !req.user.discord || !req.user.discord.id) {
      return res.code(403).send({ error: "forbidden" })
    }
    req.user.discord.options.messageOnFaveUpdate = req.body.msgOnFaveUpdate && true || false
    req.user.discord.options.messageOnComment = req.body.msgOnComment && true || false

    req.user.save()
    res.send({ success: true })
  })

  fastify.post('/webhook', async (req, res) => {
    if (!req.user) {
        return res.code(403).send({ error: "forbidden" })
    }

    if (typeof req.body.webhookURL !== 'string' || req.body.webhookURL === '') {
        req.user.webhookOnImport.url = ''
        if (req.user.discord?.webhooks?.onCreate) {
            req.user.discord.webhooks.onCreate = null
        }
        await req.user.save()
        return res.send({success: true})
    }
    else if (req.body.webhookURL.match(/^https:\/\/\w+\.\w+/)) {
        req.user.webhookOnImport.url = req.body.webhookURL
        if (req.user.discord?.webhooks?.onCreate) {
            req.user.discord.webhooks.onCreate = null
        }
        await req.user.save()
        return res.send({success: true})
    }
    
    res.send({error: 'Invalid webhook URL'})
  })

  fastify.post('/api-key', async (req, res) => {
    if (!req.user || !req.user.access.api) {
      return res.code(403).send({ error: "forbidden" })
    }

    if (!req.user.account.api_key || req.body.new) {
      var key = await req.user.createAPIKey()
      res.send({ key: key })
    }
    else {
      res.send({ key: req.user.account.api_key })
    }
  })

  fastify.post('/support-key', async (req, res) => {
    if (!req.user) {
      return res.code(403).send({ error: "forbidden" })
    }

    if (!req.user.account.support_key || req.body.new) {
      var key = await req.user.createAPIKey('support_key')
      res.send({ key: key })
    }
    else {
      res.send({ key: req.user.account.support_key })
    }
  })

  next()
}