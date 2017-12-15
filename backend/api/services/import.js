// load our libs and functions on app startup
const lua = require('../helpers/lua')
const discord = require('../helpers/discord')

const RegexLuaSnippet = /\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table|SetAttribute|SetAllPoints|CreateFrame|unit|player|target)\b/g
const RegexPasteBinLink = /^https?:\/\/pastebin.com\/([\w]+)$/
const RegexWeakAura = /^[a-zA-Z0-9\(\)]*$/
const RegexElv = /^[a-zA-Z0-9=\+\/]*$/
const RegexGrid = /^\[=== (.*) profile ===\]\n[ABCDEF0-9\n]+\n\[===/m

/**
 * Scans an import string and validates the input.
 * Returns a scan ID which is used for faster processing when ready to save to WagoItems.
 */
server.post('/import/scan', ScanImport)
function ScanImport (req, res, next, test) {

  // validate the input
  if (!req.body || !req.body.importString || req.body.importString.length < 10) {
    return res.send({error: 'invalid_import'})
  }

  if (!test) {
    test = {}
  }
  
  // if only looking for a specific type
  if (req.body.type) {
    switch (req.body.type.toUpperCase()) {
      case 'WEAKAURA':
        test.notElvUI = true
        test.notVuhdo = true
        test.notGrid2 = true
        break
      case 'ELVUI':
        test.notWeakAura = true
        test.notVuhdo = true
        test.notGrid2 = true
        break
      case 'VUHDO':
        test.notWeakAura = true
        test.notElvUI = true
        test.notGrid2 = true
        break      
      case 'GRID':
        test.notWeakAura = true
        test.notElvUI = true
        test.notVuhdo = true
        break    
    }
  }
  
  var match

  // if input is a pastebin URL
  var pastebinMatch = req.body.importString.match(RegexPasteBinLink)
  if (pastebinMatch) {
    // if matched, get intended string from pastebin API and then restart scan
    axios.get('http://pastebin.com/raw/'+pastebinMatch[1]).then((r) => {
      res.body.importString = r
      return ScanImport(req, res, next)
    }).catch((err) => {
      return res.send({error: 'invalid_url'})
    })
  }

  // if input contains lua code
  else if (req.body.importString.match(RegexLuaSnippet)) {
    var scan = new ImportScan()
    scan.type = 'SNIPPET'
    scan.input = req.body.importString
    scan.save().then((doc) => {
      return res.send({scan: doc._id.toString(), type: 'Lua Snippet', name: 'Code Snippet'})
    })
  }

  // if input looks like grid2 string (grid regex is first because it is most restrictive)
  else if (!test.notGrid2 && req.body.importString.match(RegexGrid)) {
    var m = RegexGrid.exec(req.body.importString)
    var profileName = m[1] + ' profile'
    var profileLine = "[=== " + profileName + " ===]"
    var encoded = req.body.importString.replace(profileLine, '').replace(profileLine, '').trim()
    lua.Grid2JSON(encoded.replace(/\n/g, "\\n"), (error, result) => {
      if (error) {
        return res.send({error: error})
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        scan.type = 'GRID2'
        scan.input = req.body.importString
        scan.decoded = result.stdout
        scan.save().then((doc) => {
          return res.send({scan: doc._id.toString(), type: 'Grid2', name: profileName})
        })
      }
      catch(e) {
        console.log(e)
        return res.send({error: 'invalid_import'})
      }
    })
  }

  // if input looks like a WeakAura string
  else if (!test.notWeakAura && req.body.importString.match(RegexWeakAura)) {
    // run lua and decode string into JSON
    lua.WeakAura2JSON(req.body.importString, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='' || result.stdout.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || result.stdout.indexOf("Unknown compression method")>-1) {
        // if this import string managed to match both WA and ElvUI encoding, then try ElvUI next
        if (req.body.importString.match(RegexElv)) {
          return ScanImport(req, res, next, { notWeakAura: true })
        }
        // otherwise, return error
        return res.send({error: 'invalid_import2'})
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        // make sure decoded data is a WeakAura
        if (data && data.d && data.d.id) {
          if (data.wagoID) {
            scan.fork = data.wagoID
          }
          scan.type = 'WEAKAURAS2'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          scan.save().then((doc) => {
            console.log('scanned', doc._id)
            // check load conditions to set default categories
            var categories = []
            
            if (data.d.load) {
              // setup vars
              var class_id

              // if set to load only out of combat
              if (data.d.load.hasOwnProperty('use_combat') && !data.d.load.use_combat)
                categories.push('gen6')

              // check load requirements by class/spec
              // if any specs are selected without a class, or with multiple classes, we're just going to ignore them

              // if single class is selected
              if (data.d.load['class'] && data.d.load['class'].single) {
                class_id = guessCategory(data.d.load['class'].single)
                if (class_id) {
                  categories.push(class_id)
                  if (data.d.load.use_spec && data.d.load['spec'] && data.d.load['spec'].single)
                    categories.push(class_id+'-'+data.d.load['spec'].single)
                  else if (data.d.load.use_spec && load['spec'] && data.d.load['spec'].multi.length>0) {
                    for (var i=0; i<data.d.load['spec'].multi.length; i++) {
                      if (data.d.load['spec'].multi[i]) {
                        categories.push(class_id+'-'+i)
                      }
                    }
                  }
                }
              }

              // if multi-select class is used
              else if (data.d.load.use_class && data.d.load['class'] && data.d.load['class'].multi) {
                var list = []
                for (var classKey in data.d.load['class'].multi) {
                  if (!data.d.load['class'].multi.hasOwnProperty(classKey)) continue

                  if (data.d.load['class'].multi[classKey]) {
                      class_id = guessCategory(classKey)
                      if (class_id) {
                          categories.push(class_id)
                          list.push(class_id)
                      }
                  }
                }
                // if only one class is selected we can still check for specs
                if (list.length==1) {
                  if (data.d.load.use_spec && data.d.load['spec'] && data.d.load['spec'].single)
                    categories.push(class_id+'-'+data.d.load['spec'].single)
                  else if (data.d.load.use_spec && data.d.load['spec'] && data.d.load['spec'].multi.length>0) {
                    for (var i=0; i<data.d.load['spec'].multi.length; i++) {
                      if (data.d.load['spec'].multi[i]) {
                        categories.push(class_id+'-'+i)
                      }
                    }
                  }
                }
              }

              // look for encounters
              if (data.d.load.use_encounterid && data.d.load.encounterid>0) {
                var raid = guessCategory(data.d.load.encounterid)
                if (raid && raid.indexOf('raiden')==0)
                  categories.push('raiden')
                else if (raid && raid.indexOf('raidnh')==0)
                  categories.push('raidnh')
                else if (raid && raid.indexOf('raidtov')==0)
                  categories.push('raidtov')
                else if (raid && raid.indexOf('raidtomb')==0)
                  categories.push('raidtomb')
                else if (raid && raid.indexOf('raidantorus')==0)
                  categories.push('raidantorus')

                if (raid)
                  categories.push(raid)
              }
            }
            res.send({scan: doc._id.toString(), type: 'WeakAura', name: data.d.id, categories: categories})
          })
        }
        else {
          // unknown import with weakaura encoding
          return res.send({error: 'invalid_import_wa'})
        }
      }
      catch (e) {
        console.error('Error reading WA JSON', e)
        return res.send({error: 'invalid_import'})
      }      
    })
  }

  // if input looks like an ElvUI or Vuhdo string
  else if (req.body.importString.match(RegexElv) && !test.notElvUI) {
    // run lua and decode string into JSON
    lua.ElvUI2JSON(req.body.importString, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='' || result.stdout.indexOf("Error deserializing")>-1 || result.stdout.indexOf("Unknown compression method")>-1) {
        // invalid ElvUI but could be vuhdo
        if (!test.notVuhdo) {
          test.notElvUI = true
          return ScanImport (req, res, next, test)
        }
        else {
          return res.send({error: 'invalid_import'})
        }
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        // if elvui fields found
        if (data && (data.movers || data.general)) {
          if (data.wagoID) {
            scan.fork = data.wagoID
          }
          scan.type = 'ELVUI'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'ElvUI', name: 'ElvUI Profile'})
          })
        }
        // if vuhdo fields found
        else if (data && (data.bouquetName || data.keyLayout || data.profile)) {
          if (data.wagoID) {
            scan.fork = data.wagoID
          }
          scan.type = 'VUHDO'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          var name = data.bouquetName && 'Vuhdo Bouquet' || data.keyLayout && 'Vuhdo Key Layout' || 'Vuhdo Profile'
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'Vuhdo', name: name})
          })
        }
        else {
          // unknown import with elvui/vuhdo encoding
          return res.send({error: 'invalid_import'})
        }
      }
      catch (e) {
        console.error('Error reading ElvUI JSON', e, result.stdout)
        return res.send({error: result.stdout})
      }      
    })
  }

  // if input looks like an ElvUI or Vuhdo string
  else if (req.body.importString.match(RegexElv) && !test.notVuhdo) {
    // run lua and decode string into JSON
    lua.Vuhdo2JSON(req.body.importString, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='' || result.stdout.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || result.stdout.indexOf("Unknown compression method")>-1) {
        return res.send({error: 'invalid_import'})
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        // if elvui fields found
        if (data && (data.bouquetName || data.keyLayout || data.profile)) {
          if (data.wagoID) {
            scan.fork = data.wagoID
          }
          scan.type = 'VUHDO'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          var name = data.bouquetName && 'Vuhdo Bouquet' || data.keyLayout && 'Vuhdo Key Layout' || 'Vuhdo Profile'
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'Vuhdo', name: name})
          })
        }
        else {
          // unknown import with elvui/vuhdo encoding
          return res.send({error: 'invalid_import'})
        }
      }
      catch (e) {
        console.error('Error reading ElvUI JSON', e)
        return res.send({error: 'invalid_import'})
      }      
    })
  }
  // this doesn't match anything!
  else {
    return res.send({error: 'invalid_import'})
  }
}

server.post('/import/submit', function(req, res) {
  var scanID = req.body.scanID

  ImportScan.findById(scanID).then((scan) => {
    if (!scan) {
      return res.send(401, {error: 'scan_expired'})
    }

    var ImportPromise = new Promise((importResolve, importReject) => {
      var wago = new WagoItem()
      wago.type = scan.type
      
      switch (req.body.expireAfter) {
        case '15m':
          wago.expires_at = new Date().setTime(new Date().getTime()+15*60*1000)
          break
        case '3hr':
          wago.expires_at = new Date().setTime(new Date().getTime()+3*60*60*1000)
          break
        case '1wk':
          wago.expires_at = new Date().setTime(new Date().getTime()+7*24*60*60*1000)
          break
        case '1mo':
          wago.expires_at = new Date().setTime(new Date().getTime()+30*24*60*60*1000)
          break
        case '3mo':
          wago.expires_at = new Date().setTime(new Date().getTime()+3*30*24*60*60*1000)
          break
        default:
          wago.expires_at = null
      }

      // if forking then some fields will be copied from forked wago
      if (scan.fork) {
        // if we're importing from main page 
        if (req.body.name) {
          if (req.body.importAs === 'User' && req.user) {
            wago._userId = req.user._id
          }
          wago.name = req.body.name
          if (req.body.categories && req.body.categories.length > 2) {
            wago.categories = JSON.parse(req.body.categories).map((c) => {
              return c.id // TODO: needs validation
            })
            wago.relevancy = Categories.relevanceScores(wago.categories)
          }
          else {
            wago.categories = []
          }
          wago.hidden = (req.body.visibility === 'Hidden')
          wago.private = (req.body.visibility === 'Private')
        }
        // else if we're importing from fork options, setup fork defaults
        else if (req.user) {
          wago.expires_at = null
          wago._userId = req.user._id
          wago.hidden = (req.user.account.default_aura_visibility === 'Hidden')
          wago.private = (req.user.account.default_aura_visibility === 'Private')
        }
        // if forking anonymously save for 3 months
        else {
          wago.expires_at = new Date().setTime(new Date().getTime()+3*30*24*60*60*1000)
          wago.hidden = false
          wago.private = false
        }
        
        wago.fork_of = scan.fork

        WagoItem.findById(wago.fork_of).then((fork) => {
          if (!fork) {
            wago.fork_of = null
            return importResolve(wago) // original no longer exists
          }
          if (!wago.name) {
            wago.name = fork.name
            wago.categories = fork.categories
          }
          wago.description = fork.description
          return importResolve(wago)
        })
      }
      // use input values
      else {
        if (req.body.importAs === 'User' && req.user) {
          wago._userId = req.user._id
        }

        wago.name = req.body.name
        wago.type = scan.type
        if (req.body.categories && req.body.categories.length > 2) {
          wago.categories = JSON.parse(req.body.categories).map((c) => {
            return c.id
          })
          wago.categories = Categories.validateCategories(wago.categories)
          wago.relevancy = Categories.relevanceScores(wago.categories)

          // add system tags as necessary
          if (wago.type === 'VUHDO') {
            var vuhdo = JSON.parse(scan.decoded)
            wago.categories.push('vuhdo0')
          
            if (vuhdo.bouquetName) {
              wago.categories.push('vuhdo2')
            }
            else if (vuhdo.keyLayout) {
              wago.categories.push('vuhdo3')
            }
            else { // vuhdo profile
              wago.categories.push('vuhdo1') 
            }
          }
        }
        else {
          wago.categories = []
        }
        wago.hidden = (req.body.visibility === 'Hidden')
        wago.private = (req.body.visibility === 'Private')
        wago.expires = new Date()

        if (req.body.expireAfter) {
          switch (req.body.expireAfter) {
            case '15m':
              wago.expires.setTime(wago.expires.getTime()+15*60*1000)
              break
            case '3hr':
              wago.expires.setTime(wago.expires.getTime()+3*60*60*1000)
              break
            case '1wk':
              wago.expires.setTime(wago.expires.getTime()+7*24*60*60*1000)
              break
            case '1mo':
              wago.expires.setTime(wago.expires.getTime()+30*24*60*60*1000)
              break
            case '3mo':
              wago.expires.setTime(wago.expires.getTime()+6*30*24*60*60*1000)
              break
            default:
              wago.expires = null
          }
        }
        return importResolve(wago)
      }
    })    

    // when everything is ready, save wago
    ImportPromise.then((wago) => {
      wago.save().then((doc) => {
        var code = new WagoCode()
        code.auraID = doc._id
        if (wago.type === 'SNIPPET') {
          code.lua = scan.input
        }
        else {
          code.encoded = scan.input
          code.json = scan.decoded
        }        
        code.version = 1
        code.save().then((codeDoc) => {
          // broadcast to discord webhook?
          if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks.onCreate) {
            discord.webhookOnCreate(req.user, wago)
          }
          res.send({success: true, wagoID: doc._id})
        })
      }, (err) => {
        res.send(err)
      })
    }).catch((e) => {
      console.log('error', e)
    })
  })
})

server.post('/import/update', function (req, res) {
  if (req.body.scanID) {
    ImportScan.findById(req.body.scanID).then((scan) => {
      if (scan && scan.decoded) {
        req.body.json = scan.decoded
        req.body.encoded = scan.input
        SaveWagoVersion(req, res, 'update')
      }
      else {
        res.send({error: 'Invalid scan'})
      }
    })
  }
  else {
    res.send({error: 'Invalid scan ID'})
  }
})
server.post('/import/json/save', function (req, res) {
  SaveWagoVersion(req, res, 'update')
})
server.post('/import/json/fork', function (req, res) {
  SaveWagoVersion(req, res, 'fork')
})
server.post('/import/json/scan', function (req, res) {
  SaveWagoVersion(req, res, 'scan')
})
server.post('/import/json/extract', function (req, res) {
  SaveWagoVersion(req, res, 'extract')
})

server.post('/import/lua/save', function (req, res) {
  if (!req.body || !req.body.lua || req.body.lua.length < 10) {
    return res.send({error: 'invalid_import'})
  }
  req.body.json = "{}"
  SaveWagoVersion(req, res, 'update')
})
server.post('/import/lua/fork', function (req, res) {
  if (!req.body || !req.body.lua || req.body.lua.length < 10) {
    return res.send({error: 'invalid_import'})
  }
  req.body.json = "{}"
  SaveWagoVersion(req, res, 'fork')
})
server.post('/import/lua/extract', function (req, res) {
  if (!req.body || !req.body.lua || req.body.lua.length < 10) {
    return res.send({error: 'invalid_import'})
  }
  req.body.json = "{}"
  SaveWagoVersion(req, res, 'extract')
})

function SaveWagoVersion (req, res, mode) {
  if (!req.user && (mode === 'update' || mode === 'save')) {
    return res.send({error: 'invalid_user'})
  }

  try {
    var wagoID = req.body.wagoID
    var type = req.body.type.toUpperCase()
    var json = JSON.parse(req.body.json)
    var encoded = req.body.encoded
  }
  catch(e) {
    console.log(e)
    return res.send({error: 'invalid_data'})
  }

  if ((type=='WEAKAURA' || type=='WEAKAURAS2') && json && json.d && json.d.id) {
    lua.JSON2WeakAura(json, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='') {
        return res.send({error: 'invalid_wa'})
      }

      var promise
      if (mode === 'scan') {
        var scan = new ImportScan()
        scan.fork = req.body.forkOf
        scan.type = 'WEAKAURAS2'
        scan.input = result.stdout
        scan.decoded = req.body.json
        scan.save().then((doc) => {
          return res.send({scan: doc._id.toString(), type: doc.type, encoded: scan.input})
        })
      }
      else if (mode === 'update') {
        promise = WagoItem.findOne({_id: wagoID, type: 'WEAKAURAS2', _userId: req.user._id}).exec()
      }
      else if (mode === 'fork') {
        var wago = new WagoItem()
        wago.type = 'WEAKAURAS2'
        wago.name = json.d.id
        wago.fork_of = wagoID
        if (req.user) {
          wago._userId = req.user._id
          wago.hidden = (req.user.default_aura_visibility === 'Hidden')
          wago.private = (req.user.default_aura_visibility === 'Private')
          promise = wago.save()
        }
      }
      else if (mode === 'extract') {
        // not actually saving anything here
        res.send({success: true, extracted: result.stdout})
        return
      }

      if (!promise) {
        return
      }

      promise.then((wago) => {      
        if (!wago) {
          return res.send({error: 'not_found'})
        }

        // good to save
        var code = new WagoCode()
        code.auraID = wago._id
        code.json = JSON.stringify(json)
        code.encoded = result.stdout
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
            })
          }
          res.send({success: true})
        })
      })
    })
  }
  else if ((type=='ELVUI' || type=='VUHDO' || type=='GRID2') && json) {
    lua.JSON2ElvUI(json, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='') {
        return res.send({error: 'invalid_' + type})
      }
      
      var promise
      if (mode === 'scan') {
        var scan = new ImportScan()
        scan.fork = req.body.forkOf
        scan.type = type
        scan.input = result.stdout
        scan.decoded = req.body.json
        scan.save().then((doc) => {
          return res.send({scan: doc._id.toString(), type: doc.type, encoded: scan.input})
        })
      }
      else if (mode === 'update') {
        promise = WagoItem.findOne({_id: wagoID, type: type, _userId: req.user._id}).exec()
      }
      else if (mode === 'fork') {
        var wago = new WagoItem()
        wago.type = type
        wago.name = 'FORKED ' + type
        wago.fork_of = wagoID
        if (req.user) {
          wago._userId = req.user._id
          wago.hidden = (req.user.default_aura_visibility === 'Hidden')
          wago.private = (req.user.default_aura_visibility === 'Private')
          promise = wago.save()
        }
      }

      promise.then((wago) => {  
        if (!wago) {
          return res.send({error: 'not_found'})
        }

        // good to save
        var code = new WagoCode()
        code.auraID = wago._id
        code.json = JSON.stringify(json)
        if (encoded) {
          code.encoded = encoded
        }
        else {
          code.encoded = result.stdout
        }
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
            })
          }
          res.send({success: true})
        })
      })
    })
  }
  else if (type === 'SNIPPET' && req.body.lua) {
    var promise
    if (mode === 'update') {
      promise = WagoItem.findOne({_id: wagoID, type: type, _userId: req.user._id}).exec()
    }
    else if (mode === 'fork') {
      var wago = new WagoItem()
      wago.type = type
      wago.name = 'Lua Snippet'
      wago.fork_of = req.body.forkOf
      if (req.user) {
        wago._userId = req.user._id
        wago.hidden = (req.user.default_aura_visibility === 'Hidden')
        wago.private = (req.user.default_aura_visibility === 'Private')
        promise = wago.save()
      }
    }

    promise.then((wago) => {  
      if (!wago) {
        return res.send({error: 'not_found'})
      }

      // good to save
      var code = new WagoCode()
      code.auraID = wago._id
      code.lua = req.body.lua
      
      code.save().then(() => {
        if (mode === 'update') {
          // look for any discord actions

        }
        res.send({success: true, wagoID: wago._id})
      })
    })
  }
  else {
    return res.send({error: 'invalid_type'})
  }
}

function guessCategory(key) {
  switch (key) {
    // Classes
    case 'DEATHKNIGHT': return 'cl6'
    case 'DEMONHUNTER': return 'cl12'
    case 'DRUID': return 'cl11'
    case 'HUNTER': return 'cl3'
    case 'MAGE': return 'cl8'
    case 'MONK': return 'cl10'
    case 'PALADIN': return 'cl2'
    case 'PRIEST': return 'cl5'
    case 'ROGUE': return 'cl4'
    case 'SHAMAN': return 'cl7'
    case 'WARLOCK': return 'cl9'
    case 'WARRIOR': return 'cl1'

    // Encounters
    case 1853: return 'raiden1' // Nythendra
    case 1876: return 'raiden4' // Elerethe
    case 1873: return 'raiden2' // Ilgynoth
    case 1841: return 'raiden5' // Ursoc
    case 1854: return 'raiden6' // Dragons
    case 1877: return 'raiden7' // Cenarius
    case 1864: return 'raiden8' // Xavius

    case 1849: return 'raidnh1' // Skorpyron
    case 1865: return 'raidnh2' // Chronomatic Anomaly
    case 1867: return 'raidnh3' // Trilliax
    case 1871: return 'raidnh4' // Spellblade Aluriel
    case 1862: return 'raidnh5' // Tichondrius
    case 1842: return 'raidnh6' // Krosus
    case 1886: return 'raidnh7' // High Botanist
    case 1863: return 'raidnh8' // Star Augur
    case 1872: return 'raidnh9' // Elisande
    case 1866: return 'raidnh10' // Guldan

    case 1958: return 'raidtov1' // Odyn
    case 1962: return 'raidtov2' // Guarm
    case 2008: return 'raidtov3' // Helya

    case 2032: return 'raidtomb1' // Goroth
    case 2048: return 'raidtomb2' // Demonic Inquisition
    case 2036: return 'raidtomb3' // Harjatan
    case 2037: return 'raidtomb4' // Mistress Sasszine
    case 2050: return 'raidtomb5' // Sisters of the Moon
    case 2054: return 'raidtomb6' // Desolate Host
    case 2052: return 'raidtomb7' // Maiden of Vigilance
    case 2038: return 'raidtomb8' // Fallen Avatar
    case 2051: return 'raidtomb9' // Kiljaeden

    case 2063: return 'raidantorus1' // Aggramar
    case 2064: return 'raidantorus2' // Hasabel
    case 2069: return 'raidantorus3' // Varimathras
    case 2070: return 'raidantorus4' // War Council
    case 2073: return 'raidantorus5' // Coven of Shivarra
    case 2074: return 'raidantorus6' // Hounds
    case 2075: return 'raidantorus7' // Eonar the Lifebender
    case 2076: return 'raidantorus8' // Garothi Worldbreaker
    case 2082: return 'raidantorus9' // Imonar the Soulhunter
    case 2088: return 'raidantorus10' // Kin'garoth
    case 2092: return 'raidantorus11' // Argus the Unmaker
  }
  return false
}
