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

  // returns basic data of requested weakauras; WA Companion uses to check for updates
  fastify.get('/check/weakauras', async (req, res) => {
    if (!req.query.ids) {
      return res.code(404).send({error: "page_not_found"})
    }

    var ids = req.query.ids.split(',').slice(0, 200)
    var cached = []
    var lookup = []
    for (let i = 0; i < ids.length; i++) {
      var doc = await redis.get(ids[i])
      if (!doc) {
        doc = await redis.get(`API:WA:${ids[i]}`)
      }
      if (doc && typeof doc === 'object') {
        if ((doc.visibility && (doc.visibility.private || doc.visibility.restricted)) && (!req.user || !req.user._id.equals(doc._userId._id))) {
          continue
        }
  
        if (doc.restricted && !req.user._id.equals(doc._userId)) {
          if (doc.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(doc.restrictedGuilds, req.user.battlenet.guilds) && doc.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1) {
            continue
          }
        }
        cached.push(doc)
      }
      else {
        lookup.push(ids[i])
      }
    }
    var wagos = []
    var docs = await WagoItem.find({'$and': [{'$or' : [{_id: lookup}, {custom_slug: lookup}]}, {'$or': [{type: 'WEAKAURAS2'}, {type:'CLASSIC-WEAKAURA'}]}], deleted: false}).populate({path: '_userId', select: {restrictedGuilds: 1, restrictedTwitchUsers: 1, restrictedUsers: 1, account: 1}})
    await Promise.all(docs.concat(cached).map(async (doc) => {
      if ((doc.private || doc.restricted) && (!req.user || !req.user._id.equals(doc._userId._id))) {
        return
      }

      if (doc.restricted && !req.user._id.equals(doc._userId)) {
        if (doc.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(doc.restrictedGuilds, req.user.battlenet.guilds) && doc.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1) {
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

      // if requested by WA Companion App, update installed count
      if (req.headers['identifier'] && req.headers['user-agent'].match(/Electron/)) {
        const ipAddress = req.raw.ip
        WagoFavorites.addInstall(doc._id, 'WA-Updater-' + req.headers['identifier'], ipAddress)
      }

      if (doc.versions && doc.versions.versions && doc.versions.versions.length) {
        wago.version = doc.versions.versions[0].version
        wago.versionString = doc.versions.versions[0].versionString
        if (typeof doc.versions.versions[0].changelog === 'string') {
          doc.versions.versions[0].changelog = JSON.parse(doc.versions.versions[0].changelog)
        }
        wago.changelog = doc.versions.versions[0].changelog
        wago.regionType = doc.regionType
        wagos.push(wago)
        redis.set(`API:WA:${wago.slug}`, wago, 4000)
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
        redis.set(`API:WA:${wago.slug}`, wago, 4000)
        return
      }

      var code = await WagoCode.lookup(wago._id)
      const json = JSON.parse(code.json)
      doc.regionType = json.d.regionType
      wago.regionType = doc.regionType

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
    if (!wago) {
      return res.code(404).send({error: "page_not_found"})
    }
    else if (wago.private && (!req.user || !req.user._id.equals(wago._userId))) {
      return res.code(401).send({error: "import_is_private"})
    }
    else if (wago.restricted) {
      if (!req.user) {
        return res.code(401).send({error: "import_is_private"})
      }
      if (!req.user._id.equals(wago._userId) && wago.restrictedUsers.indexOf(req.user._id.toString()) === -1 && !arrayMatch(wago.restrictedGuilds, req.user.battlenet.guilds) && wago.restrictedTwitchUsers.indexOf(req.user.twitch.id) === -1) {
        return res.code(401).send({error: "import_is_private"})
      }
    }

    var code = await WagoCode.lookup(wago._id, req.query.version)
    if (!code || !code.encoded) {
      return res.code(404).send({error: "page_not_found"})
    }
    if (wago.type === 'WEAKAURA' && code.json && code.json.match(commonRegex.WeakAuraBlacklist)) {
      return res.code(409).send({error: "malicious_code_found"})
    }
    if (code.versionString !== req.query.version) {
      return res.code(302).redirect(`/api/raw/encoded?id=${req.query.id}&version=${code.versionString}&key=${req.query.key || ''}`)
    }
    res.header('Content-Type', 'text/plain')
    if (wago.type === 'WEAKAURA' && !code.encoded.match(/^!/)) {
      code.encoded = await lua.JSON2WeakAura(code.json)
      if (code.encoded) {
        code.save()
      }
    }
    return res.cache(86400).send(code.encoded)
  })

  next()
}