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
  
  var ids = req.query.ids.split(',').slice(0, 50)
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

      // if requested by Buds' WA Updater app, update installed count
      if (req.headers['identifier'] && req.headers['user-agent'].match(/Electron/)) { 
        WagoFavorites.addInstall(wago, 'WA-Updater-' + req.headers['identifier'])
      }

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


/*
 * Get raw data
 */
server.get('/api/raw/encoded', (req, res) => {
  if (!req.params.id) {
    return res.send(404, {error: "page_not_found"})
  }

  WagoItem.lookup(req.params.id).then((wago) => {
    if (!wago || (wago.private && (!req.user || !req.user._id.equals(wago._userId)))) {
      return res.send(404, {error: "page_not_found"})
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