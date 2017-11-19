const config = require('../../config')
const osLocale = require("os-locale")
const locale = require("locale")
const image = require('../helpers/image')

// make locale-array
var localeArray = []
config.supportedLocales.forEach(function(loc) {
  localeArray.push(loc.code)
})
var supportedLocales = new locale.Locales(localeArray)

/**
 * Gets user information or detects locale if not logged in
 */
server.get('/account/whoami', (req, res, next) => {
  data = {}
  // if user has locale preference saved
  if (req.user && req.user.locale && localeArray.indexOf(user.locale) !== -1) {
    data.locale = req.user.locale
  }

  // if we are requesting a locale detection
  else if (req.query.getLocale) {
    var detected = osLocale.sync()
    var detectedLocales, match

    // attempt to detect by system locale
    if (detected) {
      detectedLocales = new locale.Locales(detected)
      match = detectedLocales.best(supportedLocales).toString()
    }

    // otherwise match by browser accept language
    if (!match || localeArray.indexOf(match) === -1) {
      detectedLocales = new locale.Locales(req.headers["accept-language"])
      match = detectedLocales.best(supportedLocales).toString()
    }

    // still nothing? default to en-US
    if (!match || localeArray.indexOf(match) === -1) {
      match = 'en-US'
    }

    // set locale
    data.locale = match
  }

  data.wotm = global.WagoOfTheMoment

  // if user is logged in
  if (req.user) {
    var user = req.user
    var who = {}
    who.UID = user._id
    who.name = user.account.username || 'User-' + user._id.toString()
    who.avatar = user.avatarURL
    who.css = user.roleClass
    who.patron = user.patreon && user.patreon.amount_cents >= 100
    who.gold_patron = user.patreon && user.patreon.amount_cents >= 400

    who.battlenet = user.battlenet || false
    who.facebook = user.facebook || false
    who.discord = user.discord || false
    who.google = user.google || false
    who.patreon = user.patreon || false
    who.twitter = user.twitter || false
    if (user.account.password) {
      who.localAcct = true
    }

    who.defaultImportVisibility = user.account.default_aura_visibility
    who.profileVisibility = user.profile.visibility

    who.access = {}
    who.access.human = user.account.verified_human
    who.access.customSlug = user.access.custom_slug
    who.access.beta = user.access.beta
    who.access.animatedAvatar = user.access.animatedAvatar
    who.access.admin = user.roles.admin || user.roles.super_admin
    
    who.config = user.config

    async.parallel({
      comments: (cb) => {
        Comments.findUnread(user._id).then((mentions) => {
          who.unreadMentions = mentions
          cb()
        })
      },

      collections: (cb) => {
        WagoItem.find({_userId: user._id, type: 'COLLECTION'}).select('_id name').sort('name').then((collections) => {
          who.collections = collections
          cb()
        })
      }
    }, () => {
      // return user info when finished
      data.user = who
      return res.send(200, data)
    })
  }
  else {
    data.guest = true
    // return user info
    return res.send(200, data)
  }

})

/**
 * Sets locale for user
 */
server.post('/account/setlocale', (req, res, next) => {
  // validate user input against supported locales
  var input = new locale.Locales(req.body.locale)
  var locale = input.best(supportedLocales)

  // check if logged in to update database

  // set cookie and return data
  // res.setCookie('locale', locale, {domain: config.webServer.replace(/https?:\/\//, '')})
  res.send({setLocale: locale})
})

server.post('/account/update/username', (req, res) => {
  if (!req.user || !req.body.name) {
    return res.send(403, {error: "forbidden"})
  }
  else if (req.body.name.match(/[%#/\\<>]/)) {
    return res.send(401, {error: "invalid input"})
  }
  
  User.findById(req.user._id).then((user) => {
    if (!user) {
      return res.send(404, {error: "no_user"})
    }

    // make sure username is unique
    User.findByUsername(req.body.name).then((doc) => {
      if (!doc || doc._id === req.user._id) {
        user.account.username = req.body.name
        user.search.username = req.body.name.toLowerCase()
        user.save().then(() => {
          res.send({success: true})
        })
      }
      else {
        res.send({exists: true})
      }
    })
      Vue.http.post('/account/update/theme', {
        theme: state.theme,
        editor: state.editorTheme
      })
  })
})

// upload image
server.post('/account/upload/avatar', (req, res) => {
  if (!req.user || !req.body.file) {
    return res.send(403, {error: "forbidden"})
  }

  var img = req.body.file || ''
  var match = img.match(/^data:image\/(png|jpg|gif|jpeg);base64,/i)
  if (img && match) {
    if (match[1] === 'jpeg') {
      match[1] = 'jpg'
    }
    // prepare image
    var data = img.replace(/^data:image\/\w+;base64,/, "")
    var buffer = new Buffer(data, 'base64')
    var avatarFormat = 'custom'
    if (match[1] === 'gif' && req.user.access.animatedAvatar) {
      avatarFormat = 'animated'
    }

    image.avatarFromBuffer(buffer, req.user._id.toString(), avatarFormat, (img) => {
      if (img.error) {
        return res.send(img)
      }
      req.user.profile.avatar = img
      req.user.save().then((user) => {
        // no need to wait here
      })
      res.send({success: true, avatar: img})
    })
  }
  else {
    res.send({error: 'not image'})
  }
})

// select avatar option
server.post('/account/update/avatar', (req, res) => {
  if (!req.user || !req.body.avatar) {
    return res.send(403, {error: "forbidden"})
  }

  // import by selected option
  switch (req.body.avatar) {
    // generate new from adorable.io
    case 'adorable':
      image.avatarFromURL('https://api.adorable.io/avatars/64/' + req.user._id.toString() + Date.now() + '.png', req.user._id.toString(), req.body.avatar, (img) => {
        if (img.error) {
          return res.send(img)
        }
        req.user.profile.avatar = img
        req.user.save().then((user) => {
          // no need to wait here
        })
        res.send({success: true, avatar: img})
      })
      break

    // copying from oauth provider
    case 'battlenet':
    case 'discord':
    case 'facebook':
    case 'google':
    case 'patreon':
    case 'twitter':
      if (req.user[req.body.avatar] && req.user[req.body.avatar].avatar) {
        req.user.profile.avatar = req.user[req.body.avatar].avatar
        req.user.save().then((user) => {
          // no need to wait here
        })
        res.send({success: true, avatar: req.user.profile.avatar})        
      }
      break
  }
})

// set profile visibility
server.post('/account/update/profile-visibility', (req, res) => {
  if (!req.user) {
    return res.send(403, {error: "forbidden"})
  }

  if (req.body.value === 'Private') {
    req.user.account.hidden = true
  }
  else {
    req.user.account.hidden = false
  }

  req.user.save().then(() => {
    res.send({succes: true})
  })
})

// set default import visibility
server.post('/account/update/import-default-visibility', (req, res) => {
  if (!req.user) {
    return res.send(403, {error: "forbidden"})
  }

  if (req.body.value === 'Private' || req.body.value === 'Hidden') {
    req.user.account.default_aura_visibility = req.body.value
  }
  else {
    req.user.account.default_aura_visibility = 'Public'
  }

  req.user.save().then(() => {
    res.send({succes: true})
  })
})

server.post('/account/update/theme', (req, res) => {
  if (!req.user || !req.body.theme || !req.body.editor) {
    return res.send(403, {error: "forbidden"})
  }

  // TODO: add theme validation
  req.user.config.theme = req.body.theme
  req.user.config.editor = req.body.editor
  req.user.save().then((doc) => {
    res.send({success: true})
  })
})

/**
 * Set Discord options
 */
server.post('/account/discord/options', (req, res) => {
  if (!req.user || !req.user.discord || !req.user.discord.id) {
    res.send(403, {error: 'forbidden'})
  }
  req.user.discord.options.messageOnFaveUpdate = req.body.msgOnFaveUpdate && true || false
  req.user.discord.options.messageOnComment  = req.body.msgOnComment && true || false
  if (req.body.createWebhook && req.body.createWebhook.match(/^https:\/\/ptb.discordapp.com\/api\/webhooks\/[^\s]+/)) {
    req.user.discord.webhooks.onCreate = req.body.createWebhook
  }
  else if (req.body.createWebhook ) {
    res.send({error: 'invalid web hook'})
    return
  }
  else {
    req.user.discord.webhooks.onCreate = null
  }

  console.log(req.user.discord)

  req.user.save().then((doc) => {
    res.send({success: true})
  })
})