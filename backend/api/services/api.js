const i18next = require('i18next')
const i18nextBackend = require('i18next-fs-backend')
const bcrypt = require('bcrypt')

const langs = ['de-DE', 'en-GB', 'en-US', 'es-ES', 'es-MX', 'fr-FR', 'it-IT', 'ko-KR', 'pl-PL', 'pt-BR', 'pt-PT', 'ru-RU', 'zh-CN']
i18next.use(i18nextBackend).init({
  initImmediate: true,
  lng: 'en-US',
  fallbackLng: 'en-US',
  ns: ['warcraft'],
  defaultNS: 'warcraft',
  supportedLngs: langs,
  preload: langs,
  returnEmptyString: false,
  backend: {
    loadPath: __dirname + '/../../../frontend/static/i18n/[-lng-]/[-ns-].json',
  },
  interpolation: {
    prefix: '[-',
    suffix: '-]'
  }
})

/**
 * API requests for WA Updater app or other uses
 */

const arrayMatch = function (arr1, arr2) {
  if (!arr1.length || !arr2.length) {
    return false
  }
  for (let i = 0; i < arr1.length; i++) {
    for (let k = 0; k < arr2.length; k++) {
      if (arr1[i] === arr2[k]) {
        return true
      }
    }
  }
  return false
}

module.exports = function (fastify, opts, next) {
  // returns array of latest versions details of supported addons
  fastify.get('/addons', (req, res) => {
    res.cache(300).send(global.LatestAddons)
  })

  fastify.get('/languages', async (req, res) => {
    await i18next.reloadResources()
    res.cache(3600).send(langs)
  })

  // returns categories for queried language
  fastify.get('/categories', (req, res) => {
    const t = i18next.getFixedT(req.query.lang || 'en-US')
    const categories = {}
    for (const [id, cat] of Object.entries(Categories.translate(t))) {
        if (cat.text) {
            categories[id] = {
                name: cat.text, 
                slug: cat.slug ?? null, 
                color: Categories.getAttr(cat, 'color') ?? null, 
                image: Categories.getAttr(cat, 'image') ?? null,
                games: cat.games,
                types: cat.types
            }
        }
    }
    res.send(categories)
  })

  // returns basic data of requested weakauras; WA Companion uses to check for updates
  async function checkImports(req, res) {
    let ids
    if (typeof req.body.ids === 'string') {
      ids = req.body.ids.split(',').slice(0, 200)
    }
    else if (Array.isArray(req.body.ids)) {
      ids = req.body.ids.slice(0, 200)
    }
    else if (req.query.ids) {
      ids = req.query.ids.split(',').slice(0, 200)
    }
    if (!ids) {
      return res.code(400).send({ error: "bad_request", data: "Missing 'ids' field" })
    }
    let findType = {}
    if (req.params.importType === 'weakauras') {
      findType = { '$or': [{ type: 'CLASSIC-WEAKAURA' }, { type: 'TBC-WEAKAURA' }, { type: 'WOTLK-WEAKAURA' }, { type: 'CATA-WEAKAURA' }, { type: 'MOP-WEAKAURA' }, { type: 'WEAKAURA' }] }
    }
    else if (req.params.importType === 'plater') {
      findType = { type: 'PLATER' }
    }
    else if (req.params.importType) {
      return res.code(400).send({ error: "bad_request", data: 'Invalid import type' })
    }

    let cached = []
    let lookup = []
    for (let i = 0; i < ids.length; i++) {
      var doc = await redis.getJSON(`API:${ids[i]}`)
      if (doc && typeof doc === 'object') {
        cached.push(doc)
      }
      else {
        lookup.push(ids[i])
      }
    }
    let wagos = []
    let docs = []
    if (lookup.length) {
      docs = await WagoItem.find({ '$and': [{ '$or': [{ _id: lookup }, { custom_slug: lookup }] }, findType], deleted: false, blocked: false, moderated: false }).populate({ path: '_userId', select: { restrictedGuilds: 1, restrictedTwitchUsers: 1, restrictedUsers: 1, account: 1 } })
    }
    await Promise.all(docs.concat(cached).map(async (doc) => {
      if ((doc.private && (!req.user || !req.user._id.equals(doc._userId._id))) || (!req.query.encrypted && doc.encrypted)) {
        return
      }

      if (doc.restricted && (!req.user || !req.user._id.equals(doc._userId._id))) {
        if (!req.user || (doc.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(doc.restrictedGuilds, req.user.battlenet.guilds) && doc.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1)) {
          return
        }
      }

      const wago = {}
      wago._id = doc._id
      wago.name = doc.name
      wago.slug = doc.slug || doc.custom_slug || doc._id
      wago.url = doc.url
      wago.created = doc.created || doc.date && doc.date.created
      wago.modified = doc.modified || doc.date && doc.date.modified
      wago.forkOf = doc.forkOf || doc.fork_of
      wago.type = (doc.type || '').match(/WEAKAURA/) && 'WEAKAURA' || doc.type
      wago.game = doc.game
      wago.thumbnail = doc.thumbnail || doc.previewStatic || doc.previewImage || null
      if (doc.username) {
        wago.username = doc.username
      }
      else if (doc.user && doc.user.name) {
        wago.username = doc.user.name
      }
      else if (doc._userId) {
        wago.username = doc._userId.account.username
      }
      if (doc.encrypted) {
        wago.encrypted = true
      }
      // if requested by WA Companion App, update installed count
      if (req.headers['identifier'] && req.headers['user-agent'].match(/Electron/)) {
        const ipAddress = req.raw.ip
        WagoFavorites.addInstall(doc._id, 'WA-Updater-' + req.headers['identifier'], ipAddress)
      }

      if (doc.versions && doc.versions.versions && doc.versions.versions.length && doc.regionType) {
        wago.version = doc.versions.versions[0].version
        wago.versionString = doc.versions.versions[0].versionString
        if (typeof doc.versions.versions[0].changelog === 'string') {
          doc.versions.versions[0].changelog = JSON.parse(doc.versions.versions[0].changelog)
        }
        wago.changelog = doc.versions.versions[0].changelog
        if (!wago.changelog.text) {
            wago.changelog = {
                text: "",
                format: ""
            }
        }
        wago.regionType = doc.regionType
        wagos.push(wago)
        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600 * 48)
        }
        return
      }
      else if (doc.latestVersion && doc.latestVersion.iteration && doc.regionType) {
        wago.version = doc.latestVersion.iteration
        wago.versionString = doc.latestVersion.versionString
        if (typeof doc.latestVersion.changelog === 'string') {
          doc.latestVersion.changelog = JSON.parse(doc.latestVersion.changelog)
        }
        wago.changelog = doc.latestVersion.changelog
        if (!wago.changelog.text) {
            wago.changelog = {
                text: "",
                format: ""
            }
        }
        wago.regionType = doc.regionType
        wagos.push(wago)
        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600 * 48)
        }
        return
      }

      const code = await WagoCode.lookup(wago._id)
      if (!doc.encrypted && !doc.regionType && req.params.importType === 'weakauras') {
        const json = JSON.parse(code.json)
        doc.regionType = json.d.regionType
        wago.regionType = doc.regionType

        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600 * 48)
        }
      }

      if (doc.type.match(/WEAKAURA/) && (!doc.tocversion || !doc.patch_name)) {
        taskQueue.add('ProcessCode', { id: doc._id, version: code.versionString }, { priority: req.user && req.user.access.queueSkip && 2 || 5, jobId: `${doc._id}:${code.version}:${code.versionString}` })
      }

      wago.version = code.version
      let versionString = code.versionString
      if (versionString !== '1.0.' + (code.version + 1) && versionString !== '0.0.' + code.version) {
        versionString = versionString + '-' + code.version
      }
      wago.versionString = versionString
      wago.changelog = code.changelog
      wagos.push(wago)

      if (!doc.latestVersion) {
        doc.latestVersion = {}
      }
      doc.latestVersion.iteration = code.version
      doc.latestVersion.versionString = versionString
      doc.latestVersion.changelog = code.changelog
      if (doc.save) { // in case something got mis-saved to redis (normally can't get to this point with redis cache)
        doc.save()
      }
      return
    }))
    res.send(wagos)
  }
  fastify.get('/check', checkImports)
  fastify.post('/check', checkImports)
  fastify.get('/check/:importType', checkImports)
  fastify.post('/check/:importType', checkImports)

  // returns raw encoded string for requested import
  fastify.get('/raw/encoded', async (req, res) => {
    if (!req.query.id) {
      return res.code(404).send({ error: "page_not_found" })
    }

    var wago = await WagoItem.lookup(req.query.id)
    if (!wago || wago.deleted || wago.blocked || wago.moderated) {
      return res.code(404).send({ error: "page_not_found" })
    }
    else if (wago.private && (!req.user || !req.user._id.equals(wago._userId))) {
      return res.code(401).send({ error: "import_is_private" })
    }
    else if (wago.restricted) {
      if (!req.user) {
        return res.code(401).send({ error: "import_is_private" })
      }
      if (!req.user._id.equals(wago._userId) && (wago.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(wago.restrictedGuilds, req.user.battlenet.guilds) && wago.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1)) {
        return res.code(401).send({ error: "import_is_private" })
      }
    }

    var code = await WagoCode.lookup(wago._id, req.query.version)
    if (!code || !code.encoded) {
      return res.code(404).send({ error: "page_not_found" })
    }
    if ((!req.query.p || code.versionString !== req.query.version) && (wago.restricted || wago.private)) {
      return res.code(302).redirect(`/api/raw/encoded?id=${encodeURIComponent(req.query.id)}&version=${code.versionString}&key=${req.query.key || ''}&p=1`)
    }
    else if (code.versionString !== req.query.version && !(wago.restricted || wago.private)) {
      return res.code(302).redirect(`/api/raw/encoded?id=${encodeURIComponent(req.query.id)}&version=${code.versionString}`)
    }
    res.header('Content-Type', 'text/plain')
    if (wago.type === 'WEAKAURA' && !code.encoded.match(/^!/) && !wago.encrypted) {
      code.encoded = await lua.JSON2WeakAura(code.json)
      if (code.encoded) {
        code.save()
      }
    }
    if (wago.restricted || wago.private) {
      return res.send(code.encoded)
    }
    return res.cache(86400).send(code.encoded)
  })

  fastify.get('/user/me', async (req, res) => {
    if (!req.user) {
      return res.code(401).send({ error: "no_user" })
    }
    let user = {}
    user.user_id = req.user._id
    user.username = req.user.account.username
    user.avatar = req.user.profile.avatar
    user.hideAds = req.user.access.hideAds
    user.hideAddonAds = req.user.access.hideAddonAds
    user.imports = (await WagoItem.find({_userId: req.user._id}).select({_id:1}).exec()).map(x => x._id)
    res.send(user)
  })


    fastify.post('/user/auth/:type', async (req, res) => {
        if (!req.internalAuthRequest) {
            return res.code(401).send({ error: "invalid_request" })
        }
        let user
        if (req.params.type === 'password') {
            if (!req.body.username || !req.body.password) {
                return res.code(401).send({ error: "invalid_login" })
            }
            user = await User.findByUsername(req.body.username)
            if (!user) {
                return res.code(403).send({ error: "unknown_user" })
            }
            else if (!user.account.password) {
                return res.code(403).send({ error: "invalid_login" })
            }
            const auth = await bcrypt.compare(req.body.password, user.account.password)
            if (!auth) {
                return res.code(403).send({ error: "invalid_login" })
            }
        }
        else if (req.params.type.match(/^google|battlenet|patreon|discord$/)) {
            user = await User.findOne({ [`${req.params.type}.id`]: req.body.id })
            if (!user) {
                return res.code(403).send({ error: "unknown_user" })
            }
        }
        else if (req.params.type === 'lookup') {
            user = await User.findByUsername(req.body.username)
            if (!user) {
                return res.code(404).send({ error: "unknown_user" })
            }
        }
        else {
            return res.code(400).send({ error: "unknown_auth_type", type: req.params.type })
        }
        return res.send({
            user_id: user._id,
            username: user.account.username ?? `user${user._id}`,
            avatar: user.profile.avatar ?? {},
            api_key: user.account.api_key ?? null,
            created: user.account.created,
            socials: {
                google: user.google?.id ?? null,
                battlenet: user.battlenet?.id ?? null,
                patreon: user.patreon?.id ?? null,
                discord: user.discord?.id ?? null
            },
            wowChars: user.battlenet?.characters ?? []
        })
    })

    next()
}