const i18next = require('i18next')
const i18nextBackend = require('i18next-fs-backend')

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
    const cats = Categories.categories(t)
    const categories = {}
    cats.forEach(c => {
      categories[c.id] = {name: c.text, slug: c.slug}
    })
    res.send(categories)
  })

  // returns basic data of requested weakauras; WA Companion uses to check for updates
  fastify.get('/check/:importType', async (req, res) => {
    if (!req.query.ids) {
      return res.code(404).send({error: "page_not_found"})
    }
    var findType
    if (req.params.importType === 'weakauras') {
      findType = {'$or': [{type:'CLASSIC-WEAKAURA'}, {type:'TBC-WEAKAURA'}, {type:'WEAKAURA'}]}
    }
    else if (req.params.importType === 'plater') {
      findType = {type: 'PLATER'}
    }
    else {
      return res.code(404).send({error: "page_not_found"})
    }

    var ids = req.query.ids.split(',').slice(0, 200)
    var cached = []
    var lookup = []
    for (let i = 0; i < ids.length; i++) {
      var doc = await redis.getJSON(`API:${ids[i]}`)
      if (doc && typeof doc === 'object') {
        cached.push(doc)
      }
      else {
        lookup.push(ids[i])
      }
    }
    var wagos = []
    var docs = []
    if (lookup.length) {
      docs = await WagoItem.find({'$and': [{'$or' : [{_id: lookup}, {custom_slug: lookup}]}, findType], deleted: false, blocked: false, moderated: false}).populate({path: '_userId', select: {restrictedGuilds: 1, restrictedTwitchUsers: 1, restrictedUsers: 1, account: 1}})
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

      var wago = {}
      wago._id = doc._id
      wago.name = doc.name
      wago.slug = doc.slug || doc.custom_slug || doc._id
      wago.url = doc.url
      wago.created = doc.created || doc.date && doc.date.created
      wago.modified = doc.modified || doc.date && doc.date.modified
      wago.forkOf = doc.fork_of
      wago.game = doc.game
      if (doc.username) {
        wago.username = doc.username
      }
      else  if (doc.user && doc.user.name) {
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
        wago.regionType = doc.regionType
        wagos.push(wago)
        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600*48)
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
        wago.regionType = doc.regionType
        wagos.push(wago)
        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600*48)
        }
        return
      }

      var code = await WagoCode.lookup(wago._id)
      if (!doc.encrypted && !doc.regionType && req.params.importType === 'weakauras') {
        const json = JSON.parse(code.json)
        doc.regionType = json.d.regionType
        wago.regionType = doc.regionType

        if (!doc.restricted && !doc.private) {
          redis.setJSON(`API:${wago.slug}`, wago, 'EX', 3600*48)
        }
      }

      wago.version = code.version
      var versionString = code.versionString
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
  })

  // returns raw encoded string for requested import
  fastify.get('/raw/encoded', async (req, res) => {
    if (!req.query.id) {
      return res.code(404).send({error: "page_not_found"})
    }

    var wago = await WagoItem.lookup(req.query.id)
    if (!wago || wago.deleted || wago.blocked || wago.moderated) {
      return res.code(404).send({error: "page_not_found"})
    }
    else if (wago.private && (!req.user || !req.user._id.equals(wago._userId))) {
      return res.code(401).send({error: "import_is_private"})
    }
    else if (wago.restricted) {
      if (!req.user) {
        return res.code(401).send({error: "import_is_private"})
      }
      if (!req.user._id.equals(wago._userId) && (wago.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(wago.restrictedGuilds, req.user.battlenet.guilds) && wago.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1)) {
        return res.code(401).send({error: "import_is_private"})
      }
    }

    var code = await WagoCode.lookup(wago._id, req.query.version)
    if (!code || !code.encoded) {
      return res.code(404).send({error: "page_not_found"})
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

  next()
}