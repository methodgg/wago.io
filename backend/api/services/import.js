// load our libs and functions on app startup
const lua = require('../helpers/lua')
const discord = require('../helpers/discord')
const battlenet = require('../helpers/battlenet')
const semver = require('semver')

module.exports = function (fastify, opts, next) {
/**
 * Scans an import string and validates the input.
 * Returns a scan ID which is used for faster processing when ready to save to WagoItems.
 */
  fastify.post('/scan', ScanImport)
  async function ScanImport (req, res) {
    // validate the input
    if (!req.body || !req.body.importString || req.body.importString.length < 10) {
      return res.code(400).send({error: 'invalid_import'})
    }

    var test = {}

    if (req.body.type) {
      test[req.body.type.toUpperCase()] = true
      switch (req.body.type.toUpperCase()) {
        case 'WEAKAURA':
        case 'PLATER':
        case 'TOTALRP3':
          test.DEFLATE = true
      }
    }
    else {
      if (req.body.importString.match(commonRegex.RegexPasteBinLink)) {
        let pasteBinMatch = commonRegex.RegexPasteBinLink.exec(req.body.importString)
        let raw = await axios.get('http://pastebin.com/raw/'+pasteBinMatch[1])
        req.body.importString = raw.data
        return ScanImport(req, res)
      }
      if (req.body.importString.match(commonRegex.looksLikeElvUI)) {
        test.ELVUI = true
      }
      if (req.body.importString.match(commonRegex.looksLikeMDT)) {
        test.MDT = true
      }
      if (req.body.importString.match(commonRegex.looksLikePlater)) {
        test.PLATER = true
        test.DEFLATE = true
      }
      if (req.body.importString.match(commonRegex.looksLikeTotalRP3)) {
        test.TOTALRP3 = true
        if (req.body.importString.match(/^!/)) {
          test.DEFLATE = true
        }
      }
      if (req.body.importString.match(commonRegex.looksLikeVuhDo)) {
        test.VUHDO = true
      }
      if (req.body.importString.match(commonRegex.looksLikeWeakAura)) {
        test.WEAKAURA = true
        if (req.body.importString.match(/^!/)) {
          test.DEFLATE = true
        }
      }
    }
    console.log(test)
    
    var decoded = null
    if (test.DEFLATE) {
      // several addons use Deflate - some prepend ! to identify deflate vs older format
      decoded = await lua.DecodeDeflate(req.body.importString.replace(/^!/, ''))
    }
    if (!decoded && (test.WEAKAURA || test.MDT)) {
      // MDT and old-format WA uses the same encoding
      decoded = await lua.DecodeWeakAura(req.body.importString)
    }
    if (!decoded && test.ELVUI) {
      decoded = await lua.DecodeElvUI(req.body.importString)
    }
    if (!decoded && test.VUHDO) {
      decoded = await lua.DecodeVuhDo(req.body.importString)
    }
    
    var scan = new ImportScan()
    if (decoded && decoded.obj.wagoID) {
      scan.fork = decoded.obj.wagoID
    }
    else if (req.body.forkOf) {
      scan.fork = req.body.forkOf
    }
    scan.input = req.body.importString
    if (decoded) {
      scan.decoded = decoded.str
    }

    // if decoded data looks like a valid WEAKAURA
    if (test.WEAKAURA && decoded && decoded.obj.d && decoded.obj.d.id) {
      scan.type = 'WEAKAURAS2'
      const scanDoc = await scan.save()

      let categories = []      
      // check load conditions to set default categories
      if (decoded.obj.d.load) {
        let class_id

        // if load only out of combat
        if (decoded.obj.d.load.hasOwnProperty('use_combat') && !decoded.obj.d.load.use_combat) {
          categories.push('gen6')
        }

        // load requirements for class or specs
        // if any specs are selected without a class, or with multiple classes, we're just going to ignore them
        // ---
        // if single class is selected
        if (decoded.obj.d.load['class'] && decoded.obj.d.load['class'].single) {
          class_id = guessCategory(decoded.obj.d.load['class'].single)
          if (class_id) {
            categories.push(class_id)
            if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].single)
              categories.push(class_id+'-'+decoded.obj.d.load['spec'].single)
            else if (decoded.obj.d.load.use_spec && load['spec'] && decoded.obj.d.load['spec'].multi.length>0) {
              for (let i=0; i<decoded.obj.d.load['spec'].multi.length; i++) {
                if (decoded.obj.d.load['spec'].multi[i]) {
                  categories.push(class_id+'-'+i)
                }
              }
            }
          }
        }

        // if multi-select class is used
        else if (decoded.obj.d.load.use_class && decoded.obj.d.load['class'] && decoded.obj.d.load['class'].multi) {
          let list = []
          for (let classKey in decoded.obj.d.load['class'].multi) {
            if (!decoded.obj.d.load['class'].multi.hasOwnProperty(classKey)) {
              continue
            }

            if (decoded.obj.d.load['class'].multi[classKey]) {
                class_id = guessCategory(classKey)
                if (class_id) {
                    categories.push(class_id)
                    list.push(class_id)
                }
            }
          }
          // if only one class is selected we can still check for specs
          if (list.length==1) {
            if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].single)
              categories.push(class_id+'-'+decoded.obj.d.load['spec'].single)
            else if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].multi.length>0) {
              for (let i=0; i<decoded.obj.d.load['spec'].multi.length; i++) {
                if (decoded.obj.d.load['spec'].multi[i]) {
                  categories.push(class_id+'-'+i)
                }
              }
            }
          }
        }

        // load requirements for encounter id
        if (decoded.obj.d.load.use_encounterid && decoded.obj.d.load.encounterid>0) {
          let raid = guessCategory(parseInt(decoded.obj.d.load.encounterid))
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
          else if (raid && raid.indexOf('raiduldir')==0)
            categories.push('raiduldir')
          else if (raid && raid.indexOf('raidzuldazar')==0)
            categories.push('raidzuldazar')
          else if (raid && raid.indexOf('raidcrucible')==0)
            categories.push('raidcrucible')

          if (raid) {
            categories.push(raid)
          }
        }
      }
      return res.send({scan: scanDoc._id.toString(), type: 'WeakAura', name: decoded.obj.d.id, categories: categories})
    }

    // if decoded data looks like a valid MDT  
    if (test.MDT && decoded && decoded.obj.value && decoded.obj.value.currentDungeonIdx) {
      scan.type = 'MDT'
      const scanDoc = await scan.save()

      let categories = []      
      // assign dungeon category and name the import
      let dungeon = Categories.getCategory('mdtdun' + decoded.obj.value.currentDungeonIdx)
      if (dungeon && dungeon[0]) {
        categories.push(dungeon[0].id)
        if (decoded.obj.text === 'Default') {
          decoded.obj.text = dungeon[0].text
        }                
      }
      return res.send({scan: scanDoc._id.toString(), type: 'MDT', name: decoded.obj.text, categories: categories})
    }

    if (test.TOTALRP3 && (decoded || !test.DEFLATE)) {
      // check if we are using the old serialized format
      let TotalRP3Decoded = decoded
      if (!TotalRP3Decoded) {
        TotalRP3Decoded = await lua.DecodeTotalRP3(req.body.importString)
      }
      if (TotalRP3Decoded && TotalRP3Decoded.obj[2] && TotalRP3Decoded.obj[2].MD && TotalRP3Decoded.obj[2].MD.CD && TotalRP3Decoded.obj[2].MD.CD.match(/\d+\/\d+\/\d+\s\d+:\d+\d+/)) {
        if (decoded.obj.wagoID) {
          scan.fork = decoded.obj.wagoID
        }
        scan.type = 'TOTALRP3'
        scan.decoded = TotalRP3Decoded.str
        const scanDoc = await scan.save()

        // determine name and category
        var name = ''
        var categories = []
        switch (TotalRP3Decoded.obj[2].TY) {
          case 'CA': 
            name = 'Campaign'
            categories.push('totalrp1')
            break
          case 'IT': 
            name = 'Item'
            categories.push('totalrp4')
            break
        }
        if (TotalRP3Decoded.obj[2].BA.NA) {
          if (name !== '') {
            name = name + ': ' + TotalRP3Decoded.obj[2].BA.NA
          }
          else {
            name = TotalRP3Decoded.obj[2].BA.NA
          }
        }
        if (name === '') {
          name = 'Total RP3 Import'
        }
        return res.send({scan: scanDoc._id.toString(), type: 'TOTALRP3', name: name, categories: categories})
      }
    }

    if (test.PLATER && decoded) {
      // check if valid and what type of import
      // general profile
      if (decoded && !Array.isArray(decoded.obj) && decoded.obj.OptionsPanelDB && decoded.obj.OptionsPanelDB.PlaterOptionsPanelFrame) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Profile', categories: []})
      }
      // animation
      else if (decoded && !Array.isArray(decoded.obj) && decoded.obj[1] && decoded.obj[1].animation_type) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        var name = 'Plater Animation'
        if (decoded.obj.info && decoded.obj.info.spellid) {
          // get name by matching spell ID
          const spell = await battlenet.lookupSpell(decoded.obj.info.spellid)
          if (spell && spell.name) {
            name = name + ': ' + spell.name
          }
        }       
        return res.send({scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Animation', categories: []})
      }
      // if Plater Hook is found
      else if (Array.isArray(decoded.obj) && typeof decoded.obj[8] === 'object' && typeof decoded.obj[0] === 'string') {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj[0], categories: []})
      }
      // if Plater Script is found
      else if (Array.isArray(decoded.obj) && typeof decoded.obj[8] === 'number' && typeof decoded.obj[1] === 'string') {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj[1], categories: []})
      }
    }

    if (test.ELVUI && decoded && (decoded.obj.movers || decoded.obj.general)) {
      if (decoded.obj.wagoID) {
        scan.fork = decoded.obj.wagoID
      }
      scan.type = 'ELVUI'
      const scanDoc = await scan.save()
      return res.send({scan: scanDoc._id.toString(), type: 'ElvUI', name: 'ElvUI Profile'})
    }

    if (test.VUHDO && decoded.obj && (decoded.obj.bouquetName || decoded.obj.keyLayout || decoded.obj.profile)) {
      if (decoded.obj.wagoID) {
        scan.fork = decoded.obj.wagoID
      }
      scan.type = 'VUHDO'
      var name = decoded.obj.bouquetName && 'Vuhdo Bouquet' || decoded.obj.keyLayout && 'Vuhdo Key Layout' || 'Vuhdo Profile'
      const scanDoc = await scan.save()
      return res.send({scan: scanDoc._id.toString(), type: 'Vuhdo', name: name})
    }

    if (req.body.importString.match(commonRegex.LuaKeyWord)) {
      scan.type = 'SNIPPET'
      const scanDoc = await scan.save()
      return res.send({scan: scanDoc._id.toString(), type: 'Lua Snippet', name: 'Code Snippet'})
    }
    
    // this is just a bad string that doesn't match anything!
    return res.code(400).send({error: 'invalid_import'})
  }

  // submit a scan ID to save import to DB
  fastify.post('/submit', async function(req, res) {
    if (!req.body || !req.body.scanID) {
      return res.code(400).send({error: 'invalid_import'})
    }
    const scan = await ImportScan.findById(req.body.scanID).exec()
    if (!scan) {
      return res.code(400).send({error: 'scan_expired'})
    }

    var json = {}
    if (scan.decoded) {
      json = JSON.parse(scan.decoded)
    }
    
    var wago = new WagoItem({type: scan.type})
    // detect description
    if (wago.type === 'WEAKAURAS2' && json.d.desc) {
      wago.description = json.d.desc
      wago.regionType = json.d.regionType
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
      
    // set expiry option
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
      case 'never':
        wago.expires_at = null
        break
      default:
        // "export as fork" doesn't have this input so default to never or 3 months
        if (req.user) {
          wago.expires_at = null
        }
        else {
          wago.expires_at = new Date().setTime(new Date().getTime()+3*30*24*60*60*1000)
        }
    }

    if (req.body.name) {
      wago.name = req.body.name
    }

    if (req.body.importAs !== 'Guest' && req.user) {
      wago._userId = req.user._id
    }

    if (req.body.categories && req.body.categories.length > 2) {
      wago.categories = JSON.parse(req.body.categories).map((c) => {
        return c.id // TODO: needs validation
      })
    }
    else {
      wago.categories = []
    }

    if (req.body.visibility === 'Hidden' || (!req.body.visibility && req.user && req.user.account.default_aura_visibility === 'Hidden')) {
      wago.hidden = true
    }
    if (req.user && (req.body.visibility === 'Private' || (!req.body.visibility && req.user.account.default_aura_visibility === 'Private'))) {
      wago.private = true
    }

    // if forking then some fields will be copied from forked wago
    if (scan.fork) {  
      const fork = await WagoItem.findById(wago.fork_of).exec()
      if (fork) {
        wago.fork_of = scan.fork
        wago.description = fork.description
        if (!wago.name) {
          wago.name = fork.name
        }
        if (!wago.categories || !wago.categories.length) {
          wago.categories = fork.categories
        }
      }
    }
    // otherwise check for system tags by import type
    else if (wago.type === 'VUHDO') {
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

      const affixWeeks = await SiteData.findById('mdtAffixWeeks').exec()
      if (json.week && affixWeeks && affixWeeks.value[json.week - 1]) {
        affixWeeks.value[json.week - 1].forEach((affixID) => {
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
    // if (req.body.gameMode === 'beta-bfa') {
    //   wago.categories.push(req.body.gameMode)
    // }

    if (wago.categories.length > 0) {
      wago.categories = Categories.validateCategories(wago.categories)
      wago.relevancy = Categories.relevanceScores(wago.categories)
    }

    // time to save!
    var doc = await wago.save()
    var code = new WagoCode({auraID: doc._id})
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
      code.encoded = await lua.JSON2WeakAura(json)
      code.json = JSON.stringify(json)
    }
    
    await code.save()
    if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
      discord.webhookOnCreate(req.user, wago)
    }
    res.send({success: true, wagoID: doc._id})
  })

  // submit a scan ID for an existing import to update
  fastify.post('/update', async function (req, res) {
    if (!req.user || !req.body.scanID || !req.body.wagoID) {
      return res.code(400).send({error: 'invalid_import'})
    }
    const scan = await ImportScan.findById(req.body.scanID).exec()
    if (!scan || !scan.decoded) {
      return res.code(400).send({error: 'invalid_import'})
    }

    req.body.json = scan.decoded
    var wago = await WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).exec()
    if (!wago) {
      return res.code(403).send({error: 'Invalid Wago ID'})
    }
    // verify version number
    var newVersion = semver.valid(req.body.newVersion)
    var currentVersion
    var currentIteration
    if (wago.latestVersion.versionString) {
      currentVersion = semver.valid(wago.latestVersion.versionString)
      currentIteration = wago.latestVersion.iteration
    }
    if (!currentVersion) {
      const latest = await WagoCode.lookup(req.body.wagoID)
      currentVersion = semver.valid(latest.versionString)
      currentIteration = latest.version
    }
    wago.latestVersion.iteration = currentIteration + 1
    if (!newVersion || !semver.gt(newVersion, currentVersion)) {
      wago.latestVersion.versionString = semver.inc(currentVersion, 'patch')
    }
    else {
      wago.latestVersion.versionString = newVersion
    }

    var code = new WagoCode({
      auraID: wago._id, 
      version: wago.latestVersion.iteration, 
      versionString: wago.latestVersion.versionString,
      changelog: {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      }
    })
    if (scan.type === 'WEAKAURAS2') {
      var versionString = wago.latestVersion.versionString
      if (versionString !== '1.0.' + (wago.latestVersion.iteration - 1) && versionString !== '0.0.' + wago.latestVersion.iteration) {
        versionString = versionString + '-' + wago.latestVersion.iteration
      }
      var json = JSON.parse(scan.decoded)
      req.scanWA = scan

      wago.regionType = json.d.regionType
      json.d.url = wago.url + '/' + wago.latestVersion.iteration
      json.d.version = wago.latestVersion.iteration
      json.d.semver = versionString
      json.wagoID = wago._id
      delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
      delete json.d.skipWagoUpdate
      if (json.c) {
        for (var i = 0; i < json.c.length; i++) {
          json.c[i].url = wago.url + '/' + wago.latestVersion.iteration
          json.c[i].version = wago.latestVersion.iteration
          json.c[i].semver = versionString
          delete json.c[i].ignoreWagoUpdate
          delete json.c[i].skipWagoUpdate
        }
      }
      code.encoded = await lua.JSON2WeakAura(json)
      code.json = JSON.stringify(json)
    }
    else {
      code.encoded = scan.input
      code.json = scan.decoded
    }
    code.version = wago.latestVersion.iteration
    code.versionString = wago.latestVersion.versionString
    await code.save()
    await wago.save()
    res.send({success: true, wagoID: wago._id})
  })
  
  // if saving JSON table data
  fastify.post('/json/save', async function (req, res) {
    if (!req.user || !req.body.wagoID) {
      return res.code(400).send({error: 'invalid_import'})
    }
    var wago = await WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).exec()
    if (!wago) {
      return res.code(403).send({error: 'invalid_import'})
    }
    try {
      var json = JSON.parse(req.body.json)
    }
    catch (e) {
      return res.code(403).send({error: 'invalid_import'}) 
    }
    // verify version number
    var newVersion = semver.valid(req.body.newVersion)
    var currentVersion
    var currentIteration
    if (wago.latestVersion.versionString) {
      currentVersion = semver.valid(wago.latestVersion.versionString)
      currentIteration = wago.latestVersion.iteration
    }
    if (!currentVersion) {
      const latest = await WagoCode.lookup(wago._id)
      currentVersion = semver.valid(latest.versionString)
      currentIteration = latest.version
    }
    wago.latestVersion.iteration = currentIteration + 1
    if (!newVersion || !semver.gt(newVersion, currentVersion)) {
      wago.latestVersion.versionString = semver.inc(currentVersion, 'patch')
    }
    else {
      wago.latestVersion.versionString = newVersion
    }
    await wago.save()

    var code = new WagoCode({
      auraID: wago._id, 
      version: wago.latestVersion.iteration, 
      versionString: wago.latestVersion.versionString,
      changelog: {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      }
    })
    switch (wago.type) {
      case 'ELVUI':
        code.encoded = await lua.JSON2ElvUI(json)
      break

      case 'MDT':
        code.encoded = await lua.JSON2MDT(json)
      break

      case 'PLATER':
        code.encoded = await lua.JSON2Plater(json)
      break

      case 'TOTALRP3':
        code.encoded = await lua.JSON2TotalRP3(json)
      break

      case 'VUHDO':
        code.encoded = await lua.JSON2VuhDo(json)
      break

      case 'WEAKAURAS2':
        var versionString = wago.latestVersion.versionString
        if (versionString !== '1.0.' + (wago.latestVersion.iteration - 1) && versionString !== '0.0.' + wago.latestVersion.iteration) {
          versionString = versionString + '-' + wago.latestVersion.iteration
        }      
        
        json.d.url = wago.url + '/' + wago.latestVersion.iteration
        json.d.version = wago.latestVersion.iteration
        json.d.semver = versionString
        json.wagoID = wago._id
        delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
        delete json.d.skipWagoUpdate
        if (json.c) {
          for (var i = 0; i < json.c.length; i++) {
            json.c[i].url = wago.url + '/' + wago.latestVersion.iteration
            json.c[i].version = wago.latestVersion.iteration
            json.c[i].semver = versionString
            delete json.c[i].ignoreWagoUpdate
            delete json.c[i].skipWagoUpdate
          }
        }
        code.encoded = await lua.JSON2WeakAura(json)
      break

      default:
        // this shouldn't be possible
        return res.code(400).send({error: 'invalid_import'})
    }

    code.json = JSON.stringify(json)
    await code.save()
    res.send({success: true, wagoID: wago._id})
  })


  fastify.post('/create', async (req, res) => {
    // MDT or Encounter Notes from scratch
    if (req.body.type === 'MDT' && req.body.json) {
      try {
        var json = JSON.parse(req.body.json)
      }
      catch (e) {
        return res.code(400).send({error: "Invalid data"})
      }
      const encoded = await lua.JSON2MDT(json)
      if (!encoded) {
        return res.code(400).send({error: "Invalid data"})
      }
      var wago = new WagoItem()
      if (req.user) {
        wago.expires_at = null
        wago._userId = req.user._id
        wago.hidden = (req.user.account.default_aura_visibility === 'Hidden')
        wago.private = (req.user.account.default_aura_visibility === 'Private')
      }
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

      const affixWeeks = await SiteData.findById('mdtAffixWeeks').exec()
      if (json.week && affixWeeks && affixWeeks.value[json.week - 1]) {
        affixWeeks.value[json.week - 1].forEach((affixID) => {
          wago.categories.push('mdtaffix' + affixID)
        })
      }
      var doc = await wago.save()
      var code = new WagoCode()
      code.auraID = doc._id
      code.encoded = encoded
      code.json = req.body.json
      code.version = 1
      code.versionString = '1.0.0'
      await code.save()
      // broadcast to discord webhook?
      if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && req.user.discord && req.user.discord.webhooks.onCreate) {
        discord.webhookOnCreate(req.user, wago)
      }
      res.send({success: true, wagoID: doc._id})
    }
    else {
      return res.code(400).send({error: "Invalid data"})
    }
  })

  // imports json and creates a scan id
  fastify.post('/json/scan', async function (req, res) {
    if (!req.body.json) {
      return res.code(400).send({error: "Invalid data"})
    }
    try {
      var json = JSON.parse(req.body.json)
    }
    catch (e) {
      return res.code(400).send({error: "Invalid data"})
    }
    var encoded
    switch (req.body.type.toUpperCase()) {
      case 'ELVUI':
        encoded = await lua.JSON2ElvUI(json)
      break

      case 'MDT':
        encoded = await lua.JSON2MDT(json)
      break

      case 'PLATER':
        encoded = await lua.JSON2Plater(json)
      break

      case 'TOTALRP3':
        encoded = await lua.JSON2TotalRP3(json)
      break

      case 'VUHDO':
        encoded = await lua.JSON2VuhDo(json)
      break

      case 'WEAKAURAS2':
      case 'WEAKAURA':
        req.body.type = 'WEAKAURAS2'
        encoded = await lua.JSON2WeakAura(json)
      break
    }
    if (!encoded) {
      return res.code(400).send({error: "Invalid data"})
    }

    const scan = await new ImportScan({type: req.body.type.toUpperCase(), input: encoded, decoded: req.body.json, fork: req.body.forkOf}).save()
    res.send({encoded: encoded, scan: scan._id.toString(), type: scan.type})
  })

  fastify.post('/lua/save', async function (req, res) {
    if (!req.user || !req.body.wagoID) {
      return res.code(400).send({error: 'invalid_import'})
    }
    var wago = await WagoItem.findOne({_id: req.body.wagoID, _userId: req.user._id}).exec()
    if (!wago) {
      return res.code(403).send({error: 'invalid_import'})
    }
    // verify version number
    var newVersion = semver.valid(req.body.newVersion)
    var currentVersion
    var currentIteration
    if (wago.latestVersion.versionString) {
      currentVersion = semver.valid(wago.latestVersion.versionString)
      currentIteration = wago.latestVersion.iteration
    }
    if (!currentVersion) {
      const latest = await WagoCode.lookup(wago._id)
      currentVersion = semver.valid(latest.versionString)
      currentIteration = latest.version
    }
    wago.latestVersion.iteration = currentIteration + 1
    if (!newVersion || !semver.gt(newVersion, currentVersion)) {
      wago.latestVersion.versionString = semver.inc(currentVersion, 'patch')
    }
    else {
      wago.latestVersion.versionString = newVersion
    }
    await wago.save()
    var code = new WagoCode({
      auraID: wago._id, 
      version: wago.latestVersion.iteration, 
      versionString: wago.latestVersion.versionString,
      changelog: {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      },
      lua: req.body.lua
    })
    await code.save()
    res.send({success: true, wagoID: wago._id})
  })


  fastify.post('/lua/fork', async function (req, res) {
    if (!req.body.lua || !req.body.forkOf) {
      return res.code(400).send({error: 'invalid_import'})
    }
    const fork = await WagoItem.findById(req.body.forkOf)
    if (!fork) {
      return res.code(400).send({error: 'invalid_import'})
    }

    var wago = new WagoItem()
    wago.name = fork.name
    wago.type = 'SNIPPET'
    wago.categories = fork.categories
    wago.fork_of = fork._id
    
    if (req.user) {
      wago.expires_at = null
      wago._userId = req.user._id
      wago.hidden = (req.user.account.default_aura_visibility === 'Hidden')
      wago.private = (req.user.account.default_aura_visibility === 'Private')
    }
    else {
      wago.expires_at = new Date().setTime(new Date().getTime()+3*30*24*60*60*1000)
      wago.hidden = false
      wago.private = false
    }

    var doc = await wago.save()
    var code = new WagoCode({auraID: doc._id})
    code.lua = req.body.lua
    code.version = 1
    code.versionString = '1.0.0'
    await code.save()
    res.send({success: true, wagoID: doc._id})
  })


  next()
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

    case 2265: return 'raidzuldazar1' // Champions
    case 2284: return 'raidzuldazar2' // Grong
    case 2263: return 'raidzuldazar2b'
    case 2285: return 'raidzuldazar3' // Jadefire Masters
    case 2266: return 'raidzuldazar3b'
    case 2276: return 'raidzuldazar4' // Mekkatorque
    case 2272: return 'raidzuldazar4b' // Rastakhan
    case 2280: return 'raidzuldazar5' // Blockade
    case 2268: return 'raidzuldazar6' // Conclave
    case 2271: return 'raidzuldazar7' // Opulance
    case 2281: return 'raidzuldazar8' // Jaina
    
    // case 1111: return 'raidcrucible1' // Cabal
    // case 1111: return 'raidcrucible2' // Uunat
  }
  return false
}
