/**
 * API requests for WA Updater app or other uses
 */

 /**
  * Get latest versions
  */
server.get('api/addons', (req, res, next) => {
  res.send(global.addonUpdates)
})
  

/**
  * Wago multi WA lookup
  */
 server.get('/api/check/weakauras', (req, res, next) => {
  if (!req.query.ids) {
    return res.send(404, {error: "page_not_found"})
  }
  
  var ids = req.query.ids.split(',').slice(0, 200)
  var wagos = []
  WagoItem.find({'$or' : [{_id: ids}, {custom_slug: ids}], deleted: false, type: ['WEAKAURAS', 'WEAKAURAS2']})
  .populate('_userId')
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
      wago.forkOf = doc.fork_of
      wago.username = doc._userId.account.username

      // if requested by WA Companion App, update installed count
      if (req.headers['identifier'] && req.headers['user-agent'].match(/Electron/)) {
        const ipAddress = req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress || 
          req.socket.remoteAddress ||
          (req.connection.socket ? req.connection.socket.remoteAddress : null)
        WagoFavorites.addInstall(doc, 'WA-Updater-' + req.headers['identifier'], ipAddress)
      }

      if (doc.latestVersion.iteration) {
        wago.version = doc.latestVersion.iteration
        wago.versionString = doc.latestVersion.versionString
        if (typeof doc.latestVersion.changelog === 'string') {
          doc.latestVersion.changelog = JSON.parse(doc.latestVersion.changelog)
        }
        wago.changelog = doc.latestVersion.changelog
        wagos.push(wago)
        return done()
      }

      WagoCode.lookup(wago._id).then((code) => {
        wago.version = code.version
        var versionString = code.versionString
        if (versionString !== '1.0.' + (code.version + 1) && versionString !== '0.0.' + code.version) {
          versionString = versionString + '-' + code.version
        }
        wago.versionString = versionString
        if (typeof code.changelog === 'string') {
          code.changelog = JSON.parse(code.changelog)
        }
        wago.changelog = code.changelog
        wagos.push(wago)
        
        doc.latestVersion.iteration = code.version
        doc.latestVersion.versionString = versionString
        doc.latestVersion.changelog = code.changelog
        doc.save()
        done()
      })
    }, function() {
      res.send(wagos)
    })     
  })
})


/*
 * Get raw data
 */
server.get('/api/raw/encoded', (req, res) => {
  if (!req.params.id) {
    return res.send(404, {error: "page_not_found"})
  }

  WagoItem.lookup(req.params.id).then((wago) => {
    if (!wago) {
      return res.send(404, {error: "page_not_found"})
    }
    else if (wago.private && (!req.user || !req.user._id.equals(wago._userId))) {
      return res.send(401, {error: "import_is_private"})
    }
    WagoCode.lookup(wago._id, req.params.version).then((code) => {
      if (!code || !code.encoded) {
        return res.send(404, {error: "page_not_found"})
      }
      res.set('Content-Type', 'text/plain')
      
      if (wago.type === 'WEAKAURA' && code.json && code.json.match(commonRegex.WeakAuraBlacklist)) {
        return res.send(403, '')
      }
      if (wago.type === 'WEAKAURA' && !code.encoded.match(/^!/)) {
        lua.JSON2WeakAura(code.json, (error, result) => {
          code.encoded = result.stdout
          res.send(code.encoded)
        })
      }
      else {
        res.send(code.encoded)
      }
    })
  })
})

/**
 * Some companion stats?
 */
server.get('/api/wa-companion-stats', (req, res) => {
  WagoFavorites.find().distinct('appID').then((num) => {
    res.send({Installs: num.length - 1}) // don't count null appID
  })
})