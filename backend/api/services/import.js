// load our libs and functions on app startup
const lua = require('../helpers/lua')
const discord = require('../helpers/discord')
const battlenet = require('../helpers/battlenet')
const semver = require('semver')

const RegexLuaSnippet = /\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table|SetAttribute|SetAllPoints|CreateFrame|unit|player|target)\b/g
const RegexPasteBinLink = /^https?:\/\/pastebin.com\/([\w]+)$/
const RegexWeakAura = /^!?[a-zA-Z0-9\(\)]*$/
const RegexPlater = /^[a-zA-Z0-9\(\)]*$/
const RegexElv = /^[a-zA-Z0-9=\+\/]*$/
const RegexGrid = /^\[=== (.*) profile ===\]\n[ABCDEF0-9\n]+\n\[===/m
const RegexTotalRP3 = /^\^.+\^\^$/
const RegexTotalRP3Deflate = /^![a-zA-Z0-9\(\)]*$/

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
        test.notRP3 = true
        break
      case 'ELVUI':
        test.notWeakAura = true
        test.notVuhdo = true
        test.notGrid2 = true
        test.notRP3 = true
        break
      case 'VUHDO':
        test.notWeakAura = true
        test.notElvUI = true
        test.notGrid2 = true
        test.notRP3 = true
        break      
      case 'GRID':
        test.notWeakAura = true
        test.notElvUI = true
        test.notVuhdo = true
        test.notRP3 = true
      case 'TOTALRP3':
        test.notWeakAura = true
        test.notElvUI = true
        test.notVuhdo = true
        test.notGrid2 = true
      break 
    }
  }

  console.log('scanning')
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
        // if this import string matches a different import format...
        if (req.body.importString.match(RegexTotalRP3Deflate) || req.body.importString.match(RegexElv) || req.body.importString.match(RegexPlater)) {
          test.notWeakAura = true
          return ScanImport(req, res, next, test)
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
        // check for MDT data
        else if (data && data.value && data.value.currentDungeonIdx) {
          try {
            scan.type = 'MDT'
            scan.input = req.body.importString
            scan.decoded = result.stdout
            scan.save().then((doc) => {
              var categories = []

              if (data.text === 'Default') {
                var tmp = global.Categories.getCategory('mdtdun' + data.value.currentDungeonIdx)
                if (tmp && tmp[0] && tmp[0].slug) {
                  // cheating because we dont have i8n here and we're not localizing import titles anyway
                  tmp = tmp[0].slug.replace(/dungeons\//, '').replace(/pve\//, '').replace(/-/g, ' ').replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                  })
                  data.text = tmp
                }                
              }

              res.send({scan: doc._id.toString(), type: 'MDT', name: data.text, categories: categories})
            })
          }
          catch (e) {
            logger.error({label:'MDT import error', error: e})
            return res.send({error: 'invalid_import'})
          }
        }
        else if (req.body.importString.match(RegexTotalRP3Deflate)) {
          test.notWeakAura = true
          return ScanImport(req, res, next, test)
        }
        else {
          // unknown import with weakaura encoding
          return res.send({error: 'invalid_import_wa'})
        }
      }
      catch (e) {
        logger.error({label:'Error reading WA JSON', error: e})
        return res.send({error: 'invalid_import'})
      }      
    })
  }

  // if input looks like an ElvUI or Vuhdo string
  else if (req.body.importString.match(RegexElv) && !test.notElvUI) {
    // run lua and decode string into JSON
    console.log('try elv')
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
          return res.send({error: 'invalid_import', e: result.stdout})
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
          return res.send({error: 'invalid_import', data: result.stdout})
        }
      }
      catch (e) {
        test.notElvUI = true
        return ScanImport (req, res, next, test)
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
        logger.error({label:'Error reading ElvUI JSON', error:e})
        return res.send({error: 'invalid_import'})
      }      
    })
  }

  // if input looks like a TotalRP3 string
  else if ((req.body.importString.match(RegexTotalRP3) || req.body.importString.match(RegexTotalRP3Deflate)) && !test.notRP3) {
    lua.TotalRP32JSON(req.body.importString, (error, result) => {
      logger.error(error, result.stderr)
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='' || result.stdout.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || result.stdout.indexOf("Unknown compression method")>-1) {
        return res.send({error: 'invalid_import'})
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        // if totalRP fields found
        if (data && data[2] && data[2].MD && data[2].MD.CD && data[2].MD.CD.match(/\d+\/\d+\/\d+\s\d+:\d+\d+/)) {
          if (data.wagoID) {
            scan.fork = data.wagoID
          }
          scan.type = 'TOTALRP3'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          var name = ''
          var categories = []
          switch (data[2].TY) {
            case 'CA': 
              name = 'Campaign'
              categories.push('totalrp1')
              break
            case 'IT': 
              name = 'Item'
              categories.push('totalrp4')
              break
          }
          if (data[2].BA.NA) {
            if (name !== '') {
              name = name + ': ' + data[2].BA.NA
            }
            else {
              name = data[2].BA.NA
            }
          }
          if (name === '') {
            name = 'Total RP3 Import'
          }
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'TOTALRP3', name: name, categories: categories})
          })
        }
        else {
          // unknown import with elvui/vuhdo encoding
          return res.send({error: 'invalid_import'})
        }
      }
      catch (e) {
        logger.error({label:'Error reading ElvUI JSON', error: e})
        return res.send({error: 'invalid_import'})
      }     ``
    })
  }

  // if input looks like a Plater string
  else if (req.body.importString.match(RegexPlater) && !test.notPlater && req.user && req.user.access.beta) {
    lua.Plater2JSON(req.body.importString, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='' || result.stdout.indexOf("Error deserializing Supplied data is not AceSerializer data")>-1 || result.stdout.indexOf("Unknown compression method")>-1) {
        return res.send({error: 'invalid_import'})
      }

      var scan = new ImportScan()
      try {
        var data = JSON.parse(result.stdout)
        // if Plater Profile fields found
        if (!Array.isArray(data) && data && data.OptionsPanelDB && data.OptionsPanelDB.PlaterOptionsPanelFrame) {
          scan.type = 'PLATER'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'PLATER', name: 'Plater Profile', categories: []})
          })
        }
        else if (!Array.isArray(data) && data && data[1] && data[1].animation_type) {
          scan.type = 'PLATER'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          if (data.info && data.info.spellid) {
            battlenet.lookupSpell(data.info.spellid).then((spell) => {
              var name = 'Plater Animation'
              if (spell && spell.name) {
                name = name + ': ' + spell.name
              }
              scan.save().then((doc) => {
                return res.send({scan: doc._id.toString(), type: 'PLATER', name: name, categories: []})
              })
            }).catch((e) => {
              logger.error(e.message)       
              scan.save().then((doc) => {
                return res.send({scan: doc._id.toString(), type: 'PLATER', name: 'Plater Animation', categories: []})
              })
            })
          }
          else {            
            scan.save().then((doc) => {
              return res.send({scan: doc._id.toString(), type: 'PLATER', name: 'Plater Animation', categories: []})
            })
          }
        }
        // if Plater Hook is found
        else if (Array.isArray(data) && typeof data[8] === 'object' && typeof data[0] === 'string') {
          scan.type = 'PLATER'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'PLATER', name: data[0], categories: []})
          })
        }
        // if Plater Script is found
        else if (Array.isArray(data) && typeof data[8] === 'number' && typeof data[1] === 'string') {
          scan.type = 'PLATER'
          scan.input = req.body.importString
          scan.decoded = result.stdout
          scan.save().then((doc) => {
            return res.send({scan: doc._id.toString(), type: 'PLATER', name: data[1], categories: []})
          })
        }
        else {
          // unknown import with deflate encoding
          return res.send({error: 'invalid_import'})
        }
      }
      catch (e) {
        logger.error({label:'Error reading Plater JSON', error: e})
        return res.send({error: 'invalid_import'})
      }
    })
  }

  // if input contains lua code and does not match anything above then it's probably a snippet
  else if (req.body.importString.replace(/\)/g, '').match(RegexLuaSnippet)) {
    var scan = new ImportScan()
    scan.type = 'SNIPPET'
    scan.input = req.body.importString
    scan.save().then((doc) => {
      return res.send({scan: doc._id.toString(), type: 'Lua Snippet', name: 'Code Snippet'})
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

    if (scan.decoded) {
      var json = JSON.parse(scan.decoded)
    }
    var ImportPromise = new Promise((importResolve, importReject) => {
      var wago = new WagoItem()
      wago.type = scan.type      

      if ((wago.type === 'WEAKAURA' || wago.type === 'WEAKAURAS2') && json.d.desc) {
        wago.description = json.d.desc
      }
      else if (wago.type === 'TOTALRP3' && json[2] && json[2].NT) {
        wago.description = json[2].NT
      }
      else if (wago.type === 'PLATER' && Array.isArray(json) && typeof json[8] === 'number') {
        wago.description = json[5]
      }
      else if (wago.type === 'PLATER' && Array.isArray(json) && typeof json[8] === 'object') {
        wago.description = json[2]
      }
      else if (wago.type === 'PLATER' && !Array.isArray(json) && json.info && json.info.desc) {
        wago.description = json.info.desc
      }
      
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

          wago.name = fork.name
          wago.categories = fork.categories
          wago.relevancy = Categories.relevanceScores(wago.categories)
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
        wago.categories = []
        if (req.body.categories && req.body.categories.length > 0) {
          wago.categories = JSON.parse(req.body.categories).map((c) => {
            return c.id
          })
        }
        
        // add system tags as necessary
        if (wago.type === 'VUHDO') {
          wago.categories.push('vuhdo0')
        
          if (json.bouquetName) {
            wago.categories.push('vuhdo2')
          }
          else if (json.keyLayout) {
            wago.categories.push('vuhdo3')
          }
          else { // vuhdo profile
            wago.categories.push('vuhdo1') 
          }
        }
        else if (wago.type === 'TOTALRP3') {
          if (json[2].TY === 'CA') {
            wago.categories.push('totalrp1')
          }
          else if (json[2].TY === 'IT') {
            wago.categories.push('totalrp4')
          }
        }
        else if (wago.type === 'MDT') {
          if (json.value.currentDungeonIdx && parseInt(json.value.currentDungeonIdx) > 0 && global.Categories.getCategory('mdtdun' + json.value.currentDungeonIdx)) {
            wago.categories.push('mdtdun' + json.value.currentDungeonIdx)
          }

          if (json.week && global.mdtDungeonTable.affixWeeks[json.week - 1]) {
            global.mdtDungeonTable.affixWeeks[json.week - 1].forEach((affixID) => {
              wago.categories.push('mdtaffix' + affixID)
            })
          }
        }
        else if (wago.type === 'PLATER') {
          wago.categories.push('plater0')
          if (!Array.isArray(json) && json[1] && json[1].animation_type) {    
            // plater profile        
            wago.categories.push('plater4')
          }
          else if (!Array.isArray(json)) {    
            // plater profile        
            wago.categories.push('plater1')
          }
          else if (Array.isArray(json) && typeof json[8] === 'number') {
            // plater script
            wago.categories.push('plater2')
          }
          else if (Array.isArray(json) && typeof json[8] === 'object') {
            // plater hook
            wago.categories.push('plater3')
          }
        }

        // import for non-standard game
        if (req.body.gameMode === 'beta-bfa') {
          wago.categories.push(req.body.gameMode)
        }

        if (wago.categories.length > 0) {
          wago.categories = Categories.validateCategories(wago.categories)
          wago.relevancy = Categories.relevanceScores(wago.categories)
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
        code.versionString = '1.0.0'

        // add additional fields to WA
        if (wago.type === 'WEAKAURAS2') {
          json.wagoID = doc._id
          json.d.url = doc.url + '/1'
          json.d.version = 1
          delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
          delete json.d.skipWagoUpdate
          if (json.c) {
            for (var i = 0; i < json.c.length; i++) {
              json.c[i].url = doc.url + '/1'
              json.c[i].version = 1
              delete json.c[i].ignoreWagoUpdate
              delete json.c[i].skipWagoUpdate
            }
          }

          code.save().then((codeDoc) => {
            // broadcast to discord webhook?
            if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
              discord.webhookOnCreate(req.user, wago)
            }

            lua.JSON2WeakAura(json, (error, result) => {
              code.encoded = result.stdout
              code.json = JSON.stringify(json)
              code.save().then((codeDoc) => {
                // update with re-encoded data once ready
              })
            })

            // tell browser that things are ready, the re-encoded string will update in a moment
            res.send({success: true, wagoID: doc._id})
          })          
        }
        else {
          code.save().then((codeDoc) => {
            // broadcast to discord webhook?
            if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks.onCreate) {
              discord.webhookOnCreate(req.user, wago)
            }
            res.send({success: true, wagoID: doc._id})
          })
        }
      }, (err) => {
        res.send(err)
      })
    })
    ImportPromise.catch((e) => {
      logger.error({label:'Import error', error: e})
    })
  })
})

server.post('/import/update', function (req, res) {
  if (req.body.scanID && req.user && req.body.wagoID) {
    ImportScan.findById(req.body.scanID).then((scan) => {
      if (scan && scan.decoded) {
        req.body.json = scan.decoded
        WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).then((doc) => {
          if (!doc) {
            return res.send({error: 'Invalid scan ID'})
          }
          WagoCode.lookup(req.body.wagoID).then((latest) => {
            try {
              var newVersion = semver.valid(req.body.newVersion)
              var latestVersion = semver.valid(latest.versionString)
              if (!newVersion || !semver.gt(newVersion, latestVersion)) {
                req.body.newVersionString = semver.inc(latestVersion, 'patch')
              }
              else {
                req.body.newVersionString = newVersion
              }
            }
            catch (e) {
              logger.error(e.message)
            }
            req.body.newVersionNum = latest.version + 1

            if (scan.type.toUpperCase() === 'WEAKAURAS2') {
              var versionString = req.body.newVersionString
              if (versionString !== '1.0.' + (latest.version - 1) && versionString !== '0.0.' + latest.version) {
                versionString = versionString + '-' + latest.version
              }
              try {
                var json = JSON.parse(scan.decoded)
                req.scanWA = scan

                var version = latest.version + 1
                json.d.url = doc.url + '/' + version
                json.d.version = version
                json.d.semver = versionString
                json.wagoID = doc._id
                delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
                delete json.d.skipWagoUpdate
                if (json.c) {
                  for (var i = 0; i < json.c.length; i++) {
                    json.c[i].url = doc.url + '/' + version
                    json.c[i].version = version
                    json.c[i].semver = versionString
                    delete json.c[i].ignoreWagoUpdate
                    delete json.c[i].skipWagoUpdate
                  }
                }
                req.body.json = JSON.stringify(json)
              }
              catch (e) {
                return res.send({error: 'invalid_wa', e: e.message})
              }
            }
            else {
              req.body.encoded = scan.input
            }
            
            return SaveWagoVersion(req, res, 'update')
          })
        })
      }
      else {
        return res.send({error: 'Invalid scan'})
      }
    })
  }
  else {
    res.send({error: 'Invalid scan ID'})
  }
})

server.post('/import/json/save', function (req, res) {
  if (req.user && req.body.wagoID) {
    WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).then((doc) => {
      if (!doc) {
        return res.send({error: "No access to this import"})
      }
      WagoCode.lookup(req.body.wagoID).then((latest) => {
        try {
          var newVersion = semver.valid(semver.coerce(req.body.newVersion))
          var latestVersion = semver.valid(semver.coerce(latest.versionString))
          if (!newVersion || !semver.gt(newVersion, latestVersion)) {
            req.body.newVersionString = semver.inc(latestVersion, 'patch')
          }
          else {
            req.body.newVersionString = newVersion
          }
        }
        catch (e) {
          logger.error(e.message)
        }
        req.body.newVersionNum = latest.version + 1

        if (doc.type === 'WEAKAURAS2' || doc.type === 'WEAKAURA') {
          var versionString = req.body.newVersionString
          if (versionString !== '1.0.' + (latest.version - 1) && versionString !== '0.0.' + latest.version) {
            versionString = versionString + '-' + latest.version
          }
          try {
            var json = JSON.parse(req.body.json)

            var version = latest.version + 1
            json.d.url = doc.url + '/' + version
            json.d.version = version
            json.d.semver = versionString
            json.wagoID = doc._id
            delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
            delete json.d.skipWagoUpdate
            if (json.c) {
              for (var i = 0; i < json.c.length; i++) {
                json.c[i].url = doc.url + '/' + version
                json.c[i].version = version
                json.c[i].semver = versionString
                delete json.c[i].ignoreWagoUpdate
                delete json.c[i].skipWagoUpdate
              }
            }

            req.body.json = JSON.stringify(json)
          }
          catch (e) {
            return res.send({error: 'invalid_wa', e: e.message})
          }
        }
        
        return SaveWagoVersion(req, res, 'update')
      })
    })
  }
  else if (req.body.create && req.body.type === 'MDT') {
    try {
      var json = JSON.parse(req.body.json)
    }
    catch (e) {
      return res.send({error: "Invalid data"})
    }
    lua.JSON2MDT(json, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='') {
        return res.send({error: 'invalid_' + type})
      }
      var encoded = result.stdout
      var wago = new WagoItem()
      if (req.user) {
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
      wago.name = json.text
      wago.type = 'MDT'
      wago.categories = []
      if (json.value.currentDungeonIdx && parseInt(json.value.currentDungeonIdx) > 0 && global.Categories.getCategory('mdtdun' + json.value.currentDungeonIdx)) {
        wago.categories.push('mdtdun' + json.value.currentDungeonIdx)
      }

      if (json.week && global.mdtDungeonTable.affixWeeks[json.week - 1]) {
        global.mdtDungeonTable.affixWeeks[json.week - 1].forEach((affixID) => {
          wago.categories.push('mdtaffix' + affixID)
        })
      }

      wago.save().then((doc) => {
        var code = new WagoCode()
        code.auraID = doc._id
        code.encoded = encoded
        code.json = req.body.json
        code.version = 1
        code.versionString = '1.0.0'
        code.save().then((codeDoc) => {
          // broadcast to discord webhook?
          if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks.onCreate) {
            discord.webhookOnCreate(req.user, wago)
          }
          res.send({success: true, wagoID: doc._id})
        })
      })
    })
  }
  else {
    return res.send({error: "Must be logged in"})
  }
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
  WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).then((doc) => {
    if (!doc) {
      return res.send({error: "No access to this import"})
    }
    WagoCode.lookup(req.body.wagoID).then((latest) => {
      try {
        var newVersion = semver.valid(req.body.newVersion)
        var latestVersion = semver.valid(latest.versionString)
        if (!newVersion || !semver.gt(newVersion, latestVersion)) {
          req.body.newVersionString = semver.inc(latestVersion, 'patch')
        }
        else {
          req.body.newVersionString = newVersion
        }
      }
      catch (e) {
        logger.error(e.message)
      }
      req.body.newVersionNum = latest.version + 1
      req.body.json = "{}"
      SaveWagoVersion(req, res, 'update')
    })
  })
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
    logger.error({label:'Update import error', error: e})
    return res.send({error: 'invalid_data'})
  }

  // if updating a WA
  if ((type=='WEAKAURA' || type=='WEAKAURAS2') && mode === 'update' && req.scanWA) {
    WagoItem.findOne({_id: wagoID, type: 'WEAKAURAS2', _userId: req.user._id}).then((wago) => {
      if (!wago) {
        return res.send({error: 'not_found'})
      }

      // good to save
      var code = new WagoCode()
      code.auraID = wago._id
      code.json = req.scanWA.decoded
      code.encoded = req.scanWA.input
      code.versionString = req.body.newVersionString || '1.0.0'
      code.version = req.body.newVersionNum || 1
      code.changelog = {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      }

      wago.latestVersion.iteration = code.version
      wago.latestVersion.versionString = code.versionString
      wago.latestVersion.changelog = code.changelog
      console.log(wago.latestVersion)
      
      code.save().then(() => {
        wago.modified = new Date()
        wago.save().then(() => {
          // look for any discord actions
          discord.onUpdate(req.user, wago)
          if (!wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
            Screenshot.findForWago(wago._id).then((screens) => {
              if (!screens.length) {
                return discord.webhookOnUpdate(req.user, wago)
              }
              wago.thumb = screens[0].url
              discord.webhookOnUpdate(req.user, wago)
            })
          }
        })

        lua.JSON2WeakAura(json, (error, result) => {
          code.encoded = result.stdout
          code.json = JSON.stringify(json)
          code.save().then((codeDoc) => {
            // update with re-encoded data once ready
          })
        })
        
        res.send({success: true, latestVersion: code.versionString})
      })
    }).catch(e => {
      console.log(e.message)
      return res.send({error: 'not_found'})
    })
  }
  // if importing or editing a WA
  else if ((type=='WEAKAURA' || type=='WEAKAURAS2') && json && json.d && json.d.id) {
    var promise
    if (mode === 'update' && req.scanWA) {
      promise = WagoItem.findOne({_id: wagoID, type: 'WEAKAURAS2', _userId: req.user._id}).exec()
    }
    lua.JSON2WeakAura(json, (error, result) => {
      if (error) {
        return res.send({error: error})
      }
      else if (result.stderr || result.stdout=='') {
        return res.send({error: 'invalid_wa', res: result.stderr})
      }
      
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
        code.versionString = req.body.newVersionString || '1.0.0'
        code.version = req.body.newVersionNum || 1
        code.changelog = {
          text: req.body.changelog,
          format: req.body.changelogFormat || 'bbcode'
        }

        wago.latestVersion.iteration = code.version
        wago.latestVersion.versionString = code.versionString
        wago.latestVersion.changelog = code.changelog
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
            })
          }
          res.send({success: true, encoded: code.encoded, latestVersion: code.versionString})
        })
      }).catch(e => {
        return res.send({error: 'not_found'})
      })
    })
  }
  else if ((type=='ELVUI' || type=='VUHDO' || type=='MDT') && json) {
    var encodeFunc
    if (type=='VUHDO') {
      encodeFunc = lua.JSON2Vuhdo
    }
    else if (type=='ELVUI') {
      encodeFunc = lua.JSON2ElvUI
    }
    else if (type=='MDT') {
      encodeFunc = lua.JSON2MDT
    }
    else {
      logger.error({label: 'Unknown import type', type: type})
      return
    }
    encodeFunc(json, (error, result) => {
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

        if (wago.type === 'MDT' && json.week && global.mdtDungeonTable.affixWeeks[json.week - 1]) {
          wago.categories = wago.categories.filter((v) => {
            return !!!v.match(/^mdtaffix/)          
          })
          global.mdtDungeonTable.affixWeeks[json.week - 1].forEach((affixID) => {
            wago.categories.push('mdtaffix' + affixID)
          })
          if (json.value && json.value.currentDungeonIdx === 16 && json.freeholdCrewSelected) {
            // freehold, get crew
            var crew = json.week % 3
            if (!crew) {
              crew = 3
            }
            wago.categories.push('mdtdun16-crew' + crew)
            wago.categories = wago.categories.filter((v) => {
              var test = v.match(/-crew(\d)/)
              return (!test || test[1] === '' + crew)
            })
          }
          else if (json.value && json.value.currentDungeonIdx === 19 && (json.faction === 1 || json.faction === 2)) {
            // siege of boralus, get faction
            wago.categories.push('mdtdun19-faction' + json.faction)
            wago.categories = wago.categories.filter((v) => {
              var test = v.match(/-faction(\d)/)
              return (!test || test[1] === '' + json.faction)
            })
          }
          wago.categories = Categories.validateCategories(wago.categories)
          wago.relevancy = Categories.relevanceScores(wago.categories)
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
        code.versionString = req.body.newVersionString || '1.0.0'
        code.version = req.body.newVersionNum || 1
        code.changelog = {
          text: req.body.changelog,
          format: req.body.changelogFormat || 'bbcode'
        }

        wago.latestVersion.iteration = code.version
        wago.latestVersion.versionString = code.versionString
        wago.latestVersion.changelog = code.changelog
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
              if (!wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
                Screenshot.findForWago(wago._id).then((screens) => {
                  if (!screens.length) {
                    return discord.webhookOnUpdate(req.user, wago)
                  }
                  wago.thumb = screens[0].url
                  discord.webhookOnUpdate(req.user, wago)
                })
              }
            })
          }
          res.send({success: true, encoded: code.encoded, latestVersion: code.versionString})
        })
      }).catch(e => {
        logger.error(e.message)
        return res.send({error: 'not_found'})
      })
    })
  }
  else if ((type=='TOTALRP3') && json) {
    lua.JSON2TotalRP3(json, (error, result) => {
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
        code.versionString = req.body.newVersionString || '1.0.0'
        code.version = req.body.newVersionNum || 1
        code.changelog = {
          text: req.body.changelog,
          format: req.body.changelogFormat || 'bbcode'
        }

        wago.latestVersion.iteration = code.version
        wago.latestVersion.versionString = code.versionString
        wago.latestVersion.changelog = code.changelog
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
              if (!wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
                Screenshot.findForWago(wago._id).then((screens) => {
                  if (!screens.length) {
                    return discord.webhookOnUpdate(req.user, wago)
                  }
                  wago.thumb = screens[0].url
                  discord.webhookOnUpdate(req.user, wago)
                })
              }
            })
          }
          res.send({success: true, encoded: code.encoded, latestVersion: code.versionString})
        })
      }).catch(e => {
        return res.send({error: 'not_found'})
      })
    })
  }
  else if (type=='PLATER' && json && req.user && req.user.access.beta) {
    lua.JSON2Plater(json, (error, result) => {
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
        code.versionString = req.body.newVersionString || '1.0.0'
        code.version = req.body.newVersionNum || 1
        code.changelog = {
          text: req.body.changelog,
          format: req.body.changelogFormat || 'bbcode'
        }

        wago.latestVersion.iteration = code.version
        wago.latestVersion.versionString = code.versionString
        wago.latestVersion.changelog = code.changelog
        
        code.save().then(() => {
          if (mode === 'update') {
            wago.modified = new Date()
            wago.save().then(() => {
              // look for any discord actions
              discord.onUpdate(req.user, wago)
              if (!wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
                Screenshot.findForWago(wago._id).then((screens) => {
                  if (!screens.length) {
                    return discord.webhookOnUpdate(req.user, wago)
                  }
                  wago.thumb = screens[0].url
                  discord.webhookOnUpdate(req.user, wago)
                })
              }
            })
          }
          res.send({success: true, encoded: code.encoded, latestVersion: code.versionString})
        })
      }).catch(e => {
        return res.send({error: 'not_found'})
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
      code.versionString = req.body.newVersionString || '1.0.0'
      code.version = req.body.newVersionNum || 1
      code.changelog = {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      }

      wago.latestVersion.iteration = code.version
      wago.latestVersion.versionString = code.versionString
      wago.latestVersion.changelog = code.changelog
      wago.save()
      
      code.save().then(() => {
        if (mode === 'update') {
          // look for any discord action 

        }
        res.send({success: true, wagoID: wago._id, latestVersion: code.versionString})
      })
    }).catch(e => {
      return res.send({error: 'not_found'})
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

    case 2144: return 'raiduldir1' // Taloc
    case 2141: return 'raiduldir2' // MOTHER
    case 2128: return 'raiduldir3' // Fetid
    case 2136: return 'raiduldir4' // Zek'voz
    case 2145: return 'raiduldir5' // Zul, Reborn
    case 2135: return 'raiduldir6' // Mythrax
    case 2134: return 'raiduldir7' // Vectis
    case 2122: return 'raiduldir8' // G'huun
  }
  return false
}
