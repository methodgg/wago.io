// load our libs and functions on app startup
const cloudflare = require('cloudflare')({ token: config.cloudflare.dnsToken })
const lua = require('../helpers/lua')
const webhooks = require('../helpers/webhooks')
const battlenet = require('../helpers/battlenet')
const semver = require('semver')
const crypto = require("crypto-js")
const patchDates = require('../helpers/patchDates')

module.exports = function (fastify, opts, next) {
  /**
   * Scans an import string and validates the input.
   * Returns a scan ID which is used for faster processing when ready to save to WagoItems.
   */
  fastify.post('/scan', ScanImport)
  async function ScanImport(req, res) {
    // validate the input
    if (!req.body || !req.body.importString || req.body.importString.length < 10) {
      return res.code(400).send({ error: 'invalid_import' })
    }

    var test = {}
    var scan = new ImportScan({ input: req.body.importString })

    var decodedObj
    for (const addonFile in Addons) {
      const addon = Addons[addonFile]
      if (scan.decoded) {
        continue
      }
      else if (typeof decodedObj !== 'object' && (!req.body.type || req.body.type.match(addon.typeMatch) || (req.body.wagolib && addonFile === 'WagoLib'))) {
        decodedObj = await addon.decode(req.body.importString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
      }
      if (!decodedObj) {
        continue
      }
      else if (req.body.wagolib && addonFile === 'WagoLib') {
        // wagolib's string format won't be replicated so allow regardless of type
      }
      else if (req.body.type && !req.body.type.match(addon.typeMatch)) {
        // if string was decoded but for a different addon (keep the decoded obj but search for the correct addon)
        continue
      }
      let meta = addon.processMeta(decodedObj)
      if (decodedObj && meta) {
        scan.decoded = JSON.stringify(decodedObj)
        scan.type = meta.type
        scan.name = meta.name || meta.type
        scan.game = meta.game || patchDates.gameVersion()
        scan.domain = addon.domain
        scan.categories = meta.categories || []
        scan.fork = meta.fork || req.body.forkOf
        scan.addon = addonFile
        await scan.save()
        scan.scan = scan._id
        if (meta.wagolibAddon) {
          scan.type = meta.wagolibAddon // after save; only for display
        }
      }
    }

    if (scan.type) {
      return res.send({ scan: scan._id, type: scan.type, name: scan.name, categories: scan.categories, game: scan.game, domain: scan.domain })
    }

    // legacy import code follows
    if (req.body.type) {
      test[req.body.type.toUpperCase()] = true
      switch (req.body.type.toUpperCase()) {
        case 'WEAKAURA':
        case 'CLASSIC-WEAKAURA':
        case 'TBC-WEAKAURA':
        case 'WOTLK-WEAKAURA':
          test.WEAKAURA = true
          break
        case 'PLATER':
        case 'MDT':
        case 'TOTALRP3':
          test.DEFLATE = true
      }
    }
    else {
      if (req.body.importString.match(commonRegex.RegexPasteBinLink)) {
        let pasteBinMatch = commonRegex.RegexPasteBinLink.exec(req.body.importString)
        let raw = await axios.get('http://pastebin.com/raw/' + pasteBinMatch[1])
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
      if (req.body.importString.match(commonRegex.looksLikeOPie)) {
        test.OPIE = true
      }
      if (req.body.importString.match(commonRegex.looksLikeBugSack)) {
        req.body.importString = req.body.importString.replace(/^!BugSack!/, '')
        test.BUGSACK = true
        test.DEFLATE = true
      }
    }

    var decoded = null
    if (!decoded && test.DEFLATE) {
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
    if (!decoded && test.OPIE) {
      decoded = await lua.DecodeOPie(req.body.importString)
    }

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
    if ((test.WEAKAURA || test['CLASSIC-WEAKAURA'] || test['TBC-WEAKAURA'] || test['WOTLK-WEAKAURA']) && decoded && decoded.obj.d && decoded.obj.d.id) {
      scan.type = 'WEAKAURA'

      // check for classic import
      if (decoded.obj.d.tocversion) {
        scan.game = patchDates.gameVersion(decoded.obj.d.tocversion)
        if (scan.game === 'classic') scan.type = 'CLASSIC-WEAKAURA'
        else if (scan.game === 'tbc') scan.type = 'TBC-WEAKAURA'
        else if (scan.game === 'wotlk') scan.type = 'WOTLK-WEAKAURA'
      }
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
        if (decoded.obj.d.load['class'] && decoded.obj.d.load['class'].single && decoded.obj.d.load.use_class) {
          class_id = guessCategory(decoded.obj.d.load['class'].single)
          if (class_id) {
            categories.push(class_id)
            if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].single)
              categories.push(class_id + '-' + decoded.obj.d.load['spec'].single)
            else if (decoded.obj.d.load.use_spec && load['spec'] && decoded.obj.d.load['spec'].multi.length > 0) {
              for (let i = 0; i < decoded.obj.d.load['spec'].multi.length; i++) {
                if (decoded.obj.d.load['spec'].multi[i]) {
                  categories.push(class_id + '-' + i)
                }
              }
            }
          }
        }

        // if multi-select class is used
        else if (decoded.obj.d.load.use_class && decoded.obj.d.load['class'] && decoded.obj.d.load['class'].multi && decoded.obj.d.load.use_class === false) {
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
          if (list.length == 1) {
            if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].single)
              categories.push(class_id + '-' + decoded.obj.d.load['spec'].single)
            else if (decoded.obj.d.load.use_spec && decoded.obj.d.load['spec'] && decoded.obj.d.load['spec'].multi.length > 0) {
              for (let i = 0; i < decoded.obj.d.load['spec'].multi.length; i++) {
                if (decoded.obj.d.load['spec'].multi[i]) {
                  categories.push(class_id + '-' + i)
                }
              }
            }
          }
        }

        // load requirements for encounter id
        if (decoded.obj.d.load.use_encounterid && decoded.obj.d.load.encounterid > 0) {
          let raid = guessCategory(parseInt(decoded.obj.d.load.encounterid))
          if (raid && raid.indexOf('raiden') == 0)
            categories.push('raiden')
          else if (raid && raid.indexOf('raidnh') == 0)
            categories.push('raidnh')
          else if (raid && raid.indexOf('raidtov') == 0)
            categories.push('raidtov')
          else if (raid && raid.indexOf('raidtomb') == 0)
            categories.push('raidtomb')
          else if (raid && raid.indexOf('raidantorus') == 0)
            categories.push('raidantorus')
          else if (raid && raid.indexOf('raiduldir') == 0)
            categories.push('raiduldir')
          else if (raid && raid.indexOf('raidzuldazar') == 0)
            categories.push('raidzuldazar')
          else if (raid && raid.indexOf('raidcrucible') == 0)
            categories.push('raidcrucible')

          if (raid) {
            categories.push(raid)
          }
        }
      }
      return res.send({ scan: scanDoc._id.toString(), type: scan.type, name: decoded.obj.d.id, categories: categories, game: scan.game })
    }

    // if decoded data looks like a valid MDT
    if (test.MDT && decoded && decoded.obj.value && decoded.obj.value.currentDungeonIdx) {
      scan.type = 'MDT'
      const scanDoc = await scan.save()

      let categories = []
      // assign dungeon category and name the import
      let dungeon = Categories.match('mdt-sldun' + decoded.obj.value.currentDungeonIdx)
      if (!dungeon) {
        dungeon = Categories.match('mdtdun' + decoded.obj.value.currentDungeonIdx)
      }
      if (dungeon && dungeon[0]) {
        categories.push(dungeon[0].id)
        if (decoded.obj.text === 'Default') {
          if (!global.translations) {
            global.translations = {}
          }
          if (!global.translations['en_US']) {
            global.translations['en-US'] = JSON.parse(await fs.readFile(__dirname + '/../../../frontend/static/i18n/en-US/warcraft.json'))
          }
          decoded.obj.text = global.translations['en-US'].zones[dungeon[0].text.replace(/^.*\./, '')]
        }
      }
      return res.send({ scan: scanDoc._id.toString(), type: 'MDT', name: decoded.obj.text, categories: categories })
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
        return res.send({ scan: scanDoc._id.toString(), type: 'TOTALRP3', name: name, categories: categories })
      }
    }

    if (test.PLATER && decoded && decoded.obj) {
      // check if valid and what type of import
      // general profile
      if (decoded.obj.OptionsPanelDB && decoded.obj.OptionsPanelDB.PlaterOptionsPanelFrame) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Profile', categories: [] })
      }
      // npc color
      else if (decoded.obj.NpcColor) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater NPC Colors', categories: [] })
      }
      else if (decoded.obj.CastSounds) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Cast Sounds', categories: [] })
      }
      else if (decoded.obj.CastColor) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Cast Colors', categories: [] })
      }
      // animation
      else if ((decoded.obj[1] && decoded.obj[1].animation_type) || (decoded.obj['2'] && decoded.obj['2'].animation_type)) {
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
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: 'Plater Animation', categories: [] })
      }
      // if Plater Hook is found - new data type
      else if (decoded.obj.type === 'hook') {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj['1'], categories: [] })
      }
      // if Plater Hook is found - old data type
      else if ((typeof decoded.obj[8] === 'object' || typeof decoded.obj['9'] === 'object') && (typeof decoded.obj[0] === 'string' || typeof decoded.obj['1'] === 'string')) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj[0] || decoded.obj['1'], categories: [] })
      }
      // if Plater Script is found - new data type
      else if (decoded.obj.type === 'script') {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj['2'], categories: [] })
      }
      // if Plater Script is found - old data type
      else if ((typeof decoded.obj[8] === 'number' || typeof decoded.obj['9'] === 'number') && (typeof decoded.obj[1] === 'string' || typeof decoded.obj['2'] === 'string')) {
        scan.type = 'PLATER'
        const scanDoc = await scan.save()
        return res.send({ scan: scanDoc._id.toString(), type: 'PLATER', name: decoded.obj[1] || decoded.obj['2'], categories: [] })
      }
    }

    if (test.ELVUI && decoded && (decoded.obj.movers || decoded.obj.general)) {
      if (decoded.obj.wagoID) {
        scan.fork = decoded.obj.wagoID
      }
      scan.type = 'ELVUI'
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'ElvUI', name: 'ElvUI Profile' })
    }

    if (test.VUHDO && decoded.obj && (decoded.obj.bouquetName || decoded.obj.keyLayout || decoded.obj.profile)) {
      if (decoded.obj.wagoID) {
        scan.fork = decoded.obj.wagoID
      }
      scan.type = 'VUHDO'
      var name = decoded.obj.bouquetName && 'Vuhdo Bouquet' || decoded.obj.keyLayout && 'Vuhdo Key Layout' || 'Vuhdo Profile'
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'Vuhdo', name: name })
    }

    if (test.OPIE && decoded.obj && decoded.obj.name) {
      scan.type = 'OPIE'
      var name = decoded.obj.name
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'Opie', name: name })
    }

    if (test.BUGSACK && decoded.obj && Array.isArray(decoded.obj)) {
      scan.type = 'ERROR'
      if (decoded.obj.length > 25) {
        // if more than 25 then just take the most recent 25
        scan.decoded = JSON.stringify(decoded.obj.splice(-25))
      }
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'Lua Error', name: 'Error Reports' })
    }

    if (req.body.importString.match(commonRegex.LuaError)) {
      scan.type = 'ERROR'
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'Lua Error', name: 'Error Report' })
    }

    if (req.body.importString.match(commonRegex.LuaKeyWord)) {
      scan.type = 'SNIPPET'
      const scanDoc = await scan.save()
      return res.send({ scan: scanDoc._id.toString(), type: 'Lua Snippet', name: 'Code Snippet' })
    }

    // this is just a bad string that doesn't match anything!
    return res.code(400).send({ error: 'invalid_import' })
  }

  // submit a scan ID to save import to DB
  fastify.post('/submit', async function (req, res) {
    if (!req.body || !req.body.scanID) {
      return res.code(400).send({ error: 'invalid_import' })
    }
    const scan = await ImportScan.findById(req.body.scanID).exec()
    if (!scan) {
      return res.code(400).send({ error: 'scan_expired' })
    }

    var wago = new WagoItem({ type: scan.type })
    var json = {}
    if (scan.decoded) {
      json = JSON.parse(scan.decoded)
    }

    wago.domain = scan.domain
    wago.categories = scan.categories.filter(c => c.system)

    if (scan.game) {
      wago.description = scan.description
      wago.game = scan.game || patchDates.gameVersion()
      wago.name = req.body.name
    }
    else {
      // legacy scan
      // detect description
      if (wago.type === 'WEAKAURA' && json.d.desc) {
        wago.description = json.d.desc
        wago.regionType = json.d.regionType
      }
      else if (wago.type === 'TOTALRP3' && json[2] && json[2].NT) {
        wago.description = json[2].NT
      }
      else if (wago.type === 'PLATER' && json.type === 'script') {
        wago.description = json['6']
      }
      else if (wago.type === 'PLATER' && Array.isArray(json) && typeof json[8] === 'number') {
        wago.description = json[5]
      }
      else if (wago.type === 'PLATER' && json.type === 'hook') {
        wago.description = json['3']
      }
      else if (wago.type === 'PLATER' && Array.isArray(json) && typeof json[8] === 'object') {
        wago.description = json[2]
      }
      else if (wago.type === 'PLATER' && !Array.isArray(json) && json.info && json.info.desc) {
        wago.description = json.info.desc
      }

      // detect game
      if (wago.type.match(/WEAKAURA/) && json.d.tocversion) {
        wago.game = patchDates.gameVersion(json.d.tocversion)
      }
      else if (wago.type.match(/PLATER/) && json.tocversion) {
        wago.game = patchDates.gameVersion(json.tocversion)
      }

      // set expiry option
      switch (req.body.expireAfter) {
        case '15m':
          wago.expires_at = new Date().setTime(new Date().getTime() + 15 * 60 * 1000)
          break
        case '3hr':
          wago.expires_at = new Date().setTime(new Date().getTime() + 3 * 60 * 60 * 1000)
          break
        case '1wk':
          wago.expires_at = new Date().setTime(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
          break
        case '1mo':
          wago.expires_at = new Date().setTime(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
          break
        case '3mo':
          wago.expires_at = new Date().setTime(new Date().getTime() + 3 * 30 * 24 * 60 * 60 * 1000)
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
            wago.expires_at = new Date().setTime(new Date().getTime() + 3 * 30 * 24 * 60 * 60 * 1000)
          }
      }

      if (req.body.name) {
        wago.name = req.body.name
      }
    }

    if (req.body.importAs !== 'Guest' && req.user) {
      wago._userId = req.user._id
    }

    if (req.body.categories && req.body.categories.length > 2) {
      wago.categories = wago.categories.concat(JSON.parse(req.body.categories).map((c) => {
        return c.id // TODO: needs validation
      }))
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

    if (req.body.visibility === 'Encrypted') {
      wago.encrypted = true
    }

    wago.restrictedUsers = []
    wago.restrictedGuilds = []
    wago.restrictedTwitchSubs = []
    if (req.user && req.body.visibility === 'Restricted') {
      wago.restricted = true
      const restrictions = JSON.parse(req.body.restrictions)
      for (let i = 0; i < restrictions.length; i++) {
        if (restrictions[i].type === 'user' && restrictions[i].value) {
          var lookup = await User.findOne({ 'search.username': restrictions[i].value.toLowerCase() })
          if (lookup) {
            wago.restrictedUsers.push(lookup._id.toString())
          }
        }
        else if (restrictions[i].type === 'guild' && req.user.access.restrictGuild && restrictions[i].value && req.user.battlenet.guilds.indexOf(restrictions[i].value) >= 0) {
          wago.restrictedGuilds.push(restrictions[i].value + '@' + (restrictions[i].rank || '9'))
        }
      }
    }

    // if forking then some fields will be copied from forked wago
    if (scan.fork) {
      const fork = await WagoItem.findById(scan.fork).exec()
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
    // else if (wago.type === 'VUHDO') {
    //   wago.categories.push('vuhdo0')

    //   if (json.bouquetName) {
    //     wago.categories.push('vuhdo2')
    //   }
    //   else if (json.keyLayout) {
    //     wago.categories.push('vuhdo3')
    //   }
    //   else { // vuhdo profile
    //     wago.categories.push('vuhdo1')
    //   }
    // }
    // else if (wago.type === 'TOTALRP3') {
    //   if (json[2].TY === 'CA') {
    //     wago.categories.push('totalrp1')
    //   }
    //   else if (json[2].TY === 'IT') {
    //     wago.categories.push('totalrp4')
    //   }
    // }
    else if (wago.type === 'MDT') {
      if (json.value.currentDungeonIdx && parseInt(json.value.currentDungeonIdx) > 0 && global.Categories.match('mdt-sldun' + json.value.currentDungeonIdx)) {
        wago.categories.push('mdt-sldun' + json.value.currentDungeonIdx)
      }
      else if (json.value.currentDungeonIdx && parseInt(json.value.currentDungeonIdx) > 0 && global.Categories.match('mdtdun' + json.value.currentDungeonIdx)) {
        wago.categories.push('mdtdun' + json.value.currentDungeonIdx)
      }

      const affixWeeks = await redis.get('static:mdtAffixWeeks')
      if (json.week && affixWeeks && affixWeeks.value[json.week - 1]) {
        affixWeeks.value[json.week - 1].forEach((affixID) => {
          wago.categories.push('mdtaffix' + affixID)
        })
      }
    }
    // else if (wago.type === 'PLATER') {
    //   wago.categories.push('plater0')
    //   if (!Array.isArray(json) && json[1] && json[1].animation_type) {
    //     // plater profile
    //     wago.categories.push('plater4')
    //   }
    //   else if (!Array.isArray(json) && json.NpcColor) {
    //     // plater npc color
    //     wago.categories.push('plater5')
    //   }
    //   else if (json.type === 'script' || (Array.isArray(json) && typeof json[8] === 'number') || typeof json['9'] === 'number') {
    //     // plater script
    //     wago.categories.push('plater2')
    //   }
    //   else if (json.type === 'hook' || (Array.isArray(json) && typeof json[8] === 'object') || typeof json['9'] === 'object') {
    //     // plater hook
    //     wago.categories.push('plater3')
    //   }
    //   else if (!Array.isArray(json)) {
    //     // plater profile
    //     wago.categories.push('plater1')
    //   }
    // }

    if (wago.categories.length > 0) {
      wago.categories = Categories.validateCategories(wago.categories)
      wago.relevancy = Categories.relevanceScores(wago.categories)
    }

    // time to save!
    var doc = await wago.save()
    var code = new WagoCode({ auraID: doc._id })
    if (wago.type === 'SNIPPET') {
      code.lua = scan.input
    }
    else if (wago.type === 'ERROR') {
      if (scan.decoded) {
        code.json = scan.decoded
      }
      else {
        code.text = scan.input
      }
    }
    else {
      code.encoded = scan.input
      code.json = scan.decoded
    }
    code.version = 1
    code.versionString = '1.0.0'

    if (wago.encrypted && req.body.cipherKey) {
      code.encoded = crypto.AES.encrypt(code.encoded, req.body.cipherKey)
      code.json = crypto.AES.encrypt(code.json, req.body.cipherKey)
      code.text = crypto.AES.encrypt(code.text, req.body.cipherKey)
      code.lua = crypto.AES.encrypt(code.lua, req.body.cipherKey)
    }

    await code.save()
    await taskQueue.add('ProcessCode', { id: doc._id, version: code.versionString, addon: scan.addon, encode: true }, { priority: req.user && req.user.access.queueSkip && 2 || 5, jobId: `${doc._id}:${code.version}:${code.versionString}` })
    if (req.body.importAs === 'User' && req.user && !wago.hidden && !wago.private && !wago.encrypted && !wago.restricted && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
      webhooks.discord.onCreate(req.user, wago)
    }
    res.send({ success: true, wagoID: doc._id })
  })

  // submit a scan ID for an existing import to update
  fastify.post('/update', async function (req, res) {
    if (!req.user || !req.body.scanID || !req.body.wagoID) {
      return res.code(400).send({ error: 'invalid_import' })
    }
    const scan = await ImportScan.findById(req.body.scanID).exec()
    if (!scan || !scan.decoded) {
      return res.code(400).send({ error: 'invalid_import' })
    }

    req.body.json = scan.decoded
    var wago = await WagoItem.findOne({ _id: req.body.wagoID, _userId: req.user._id }).exec()
    if (!wago) {
      return res.code(403).send({ error: 'Invalid Wago ID' })
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

    wago.latestVersion.changelog = {
      text: req.body.changelog,
      format: req.body.changelogFormat || 'bbcode'
    }

    var code = new WagoCode({
      auraID: wago._id,
      json: scan.decoded,
      version: wago.latestVersion.iteration,
      versionString: wago.latestVersion.versionString,
      changelog: {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      }
    })
    var versionString = wago.latestVersion.versionString
    if (versionString !== '1.0.' + (wago.latestVersion.iteration - 1) && versionString !== '0.0.' + wago.latestVersion.iteration) {
      versionString = versionString + '-' + wago.latestVersion.iteration
    }

    for (const addon of Object.values(Addons)) {
      if (wago.type.match(addon.typeMatch) && wago.domain === addon.domain) {
        if (addon.addWagoData) {
          let data = await addon.addWagoData(code, wago)
          if (data.invalid) {
            return res.code(403).send({ error: data.invalid })
          }
          if (data && data.code) {
            code = data.code
          }
          if (data && data.wago) {
            wago = data.wago
          }
        }
        if (addon.encode) {
          code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        }
        else if (addon.encodeRaw) {
          code.encoded = await addon.encodeRaw(code.json)
        }
      }
    }

    wago.categories = [...new Set(wago.categories)]
    wago.modified = Date.now()
    await wago.save()

    if (wago.encrypted && req.body.cipherKey) {
      code.encoded = crypto.AES.encrypt(code.encoded, req.body.cipherKey)
      code.json = crypto.AES.encrypt(code.json, req.body.cipherKey)
      code.text = crypto.AES.encrypt(code.text, req.body.cipherKey)
      code.lua = crypto.AES.encrypt(code.lua, req.body.cipherKey)
      code.customCodeEncrypted = crypto.AES.encrypt(JSON.stringify(code.customCode), req.body.cipherKey)
      delete code.customCode
    }
    else {
      await taskQueue.add('ProcessCode', { id: wago._id, version: code.versionString, addon: scan.addon }, { priority: req.user && req.user.access.queueSkip && 2 || 5, jobId: `${wago._id}:${code.version}:${code.versionString}` })
    }

    code.version = wago.latestVersion.iteration
    code.versionString = wago.latestVersion.versionString

    await code.save()

    // send message to starred users    
    taskQueueDiscordBot.add('DiscordMessage', { type: 'update', author: req.user._id, wago: wago._id, message: req.body.text })

    // send update to webhook
    if (req.user && !wago.hidden && !wago.private && !wago.restricted && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
      webhooks.discord.onUpdate(req.user, wago)
    }
    redis.clear(wago)
    res.send({ success: true, wagoID: wago._id })
  })

  // if saving JSON table data
  fastify.post('/json/save', async function (req, res) {
    if (!req.user || !req.body.wagoID) {
      return res.code(400).send({ error: 'invalid_import' })
    }
    var wago = await WagoItem.findOne({ _id: req.body.wagoID, _userId: req.user._id }).exec()
    if (!wago) {
      return res.code(403).send({ error: 'invalid_import' })
    }
    var jsonString = ''
    try {
      // this both validates the json and removes line breaks/etc
      var json = JSON.parse(req.body.json)
      jsonString = JSON.stringify(json)
    }
    catch (e) {
      return res.code(403).send({ error: 'invalid_import' })
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
    wago.modified = Date.now()

    var code = new WagoCode({
      auraID: wago._id,
      version: wago.latestVersion.iteration,
      versionString: wago.latestVersion.versionString,
      changelog: {
        text: req.body.changelog,
        format: req.body.changelogFormat || 'bbcode'
      },
      json: jsonString
    })
    var versionString = wago.latestVersion.versionString
    if (versionString !== '1.0.' + (wago.latestVersion.iteration - 1) && versionString !== '0.0.' + wago.latestVersion.iteration) {
      versionString = versionString + '-' + wago.latestVersion.iteration
    }

    for (const addon of Object.values(Addons)) {
      if (wago.type.match(addon.typeMatch)) {
        if (addon.addWagoData) {
          let data = await addon.addWagoData(code, wago)
          if (data.invalid) {
            return res.code(403).send({ error: data.invalid })
          }
          if (data && data.code) {
            code = data.code
          }
          if (data && data.wago) {
            wago = data.wago
          }
        }
        if (addon.encode) {
          code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        }
        else if (addon.encodeRaw) {
          code.encoded = await addon.encodeRaw(code.json)
        }
      }
    }
    wago.categories = [...new Set(wago.categories)]
    switch (wago.type) {
      case 'ELVUI':
        code.encoded = await lua.JSON2ElvUI(json)
        break

      case 'MDT':
        code.encoded = await lua.JSON2MDT(json)
        break

      // case 'PLATER':
      //   if (Array.isArray(json)) {
      //     var tbl = {}
      //     json.forEach((v, k) => {
      //       tbl[''+(k+1)] = v
      //     })
      //     json = tbl
      //   }
      //   json.url = wago.url + '/' + wago.latestVersion.iteration
      //   json.version = wago.latestVersion.iteration
      //   json.semver = versionString
      //   code.json = JSON.stringify(json)
      //   code.encoded = await lua.JSON2Plater(json)
      // break

      case 'TOTALRP3':
        code.encoded = await lua.JSON2TotalRP3(json)
        break

      // case 'VUHDO':
      //   code.encoded = await lua.JSON2VuhDo(json)
      // break

      // case 'OPIE':
      //   code.encoded = await lua.JSON2OPie(json)
      // break

      // case 'WEAKAURA':
      // case 'CLASSIC-WEAKAURA':

      //   json.d.url = wago.url + '/' + wago.latestVersion.iteration
      //   json.d.version = wago.latestVersion.iteration
      //   json.d.semver = versionString
      //   json.wagoID = wago._id
      //   delete json.d.ignoreWagoUpdate // remove as this is a client-level setting for the WA companion app
      //   delete json.d.skipWagoUpdate

      //   var keyTerms = []
      //   if (json.d.language) {
      //     var locales = Object.keys(json.d.language)
      //     for (let i = 0; i < locales.length; i++) {
      //       var terms = Object.entries(json.d.language[locales[i]])
      //       for (let k = 0; k < terms.length; k++) {
      //         await WagoTranslation.setTranslation(wago._id, locales[i], terms[k][0], terms[k][1])
      //         keyTerms.push(terms[k][0])
      //       }
      //     }
      //   }

      //   if (json.c) {
      //     for (var i = 0; i < json.c.length; i++) {
      //       json.c[i].url = wago.url + '/' + wago.latestVersion.iteration
      //       json.c[i].version = wago.latestVersion.iteration
      //       json.c[i].semver = versionString
      //       delete json.c[i].ignoreWagoUpdate
      //       delete json.c[i].skipWagoUpdate

      //       if (json.c[i].language) {
      //         var locales = Object.keys(json.c[i].language)
      //         for (let i = 0; i < locales.length; i++) {
      //           var terms = Object.entries(json.c[i].language[locales[i]])
      //           for (let k = 0; k < terms.length; k++) {
      //             await WagoTranslation.setTranslation(wago._id, locales[i], terms[k][0], terms[k][1])
      //             keyTerms.push(terms[k][0])
      //           }
      //         }
      //       }
      //     }
      //   }
      //   await WagoTranslation.updateMany({wagoID: wago._id, key: {$nin: keyTerms}}, {active: false})

      // code.encoded = await lua.JSON2WeakAura(json)
      // break
    }

    if (req.user && !wago.hidden && !wago.private && !wago.restricted && req.user.discord && req.user.discord.webhooks && req.user.discord.webhooks.onCreate) {
      webhooks.discord.onUpdate(req.user, wago)
    }

    if (wago.encrypted && req.body.cipherKey) {
      code.encoded = crypto.AES.encrypt(code.encoded, req.body.cipherKey)
      code.json = crypto.AES.encrypt(code.json, req.body.cipherKey)
      code.text = crypto.AES.encrypt(code.text, req.body.cipherKey)
      code.lua = crypto.AES.encrypt(code.lua, req.body.cipherKey)
    }

    await wago.save()
    await code.save()

    if (!wago.encrypted) {
      await taskQueue.add('ProcessCode', { id: wago._id, version: code.versionString, type: wago.addon }, { priority: req.user && req.user.access.queueSkip && 2 || 5, jobId: `${wago._id}:${code.version}:${code.versionString}` })
    }

    redis.clear(wago)
    res.send({ success: true, wagoID: wago._id })
  })


  fastify.post('/create', async (req, res) => {
    // MDT or Encounter Notes from scratch
    if (req.body.type === 'MDT' && req.body.json) {
      try {
        var json = JSON.parse(req.body.json)
      }
      catch (e) {
        return res.code(400).send({ error: "Invalid data" })
      }
      const encoded = await lua.JSON2MDT(json)
      if (!encoded) {
        return res.code(400).send({ error: "Invalid data" })
      }
      var wago = new WagoItem()
      if (req.user) {
        wago.expires_at = null
        wago._userId = req.user._id
        wago.hidden = (req.user.account.default_aura_visibility === 'Hidden')
        wago.private = (req.user.account.default_aura_visibility === 'Private')
      }
      else {
        wago.expires_at = new Date().setTime(new Date().getTime() + 3 * 30 * 24 * 60 * 60 * 1000)
        wago.hidden = false
        wago.private = false
      }
      wago.name = json.text
      wago.type = 'MDT'
      wago.categories = []
      if (json.value.currentDungeonIdx && parseInt(json.value.currentDungeonIdx) > 0 && global.Categories.match('mdtdun' + json.value.currentDungeonIdx)) {
        wago.categories.push('mdtdun' + json.value.currentDungeonIdx)
      }

      if (req.body.affixes) {
        (req.body.affixes.split(',')).forEach((affixID) => {
          wago.categories.push('mdtaffix' + affixID)
        })
      }
      else {
        const affixWeeks = await redis.get('static:mdtAffixWeeks')
        if (json.week && affixWeeks && affixWeeks.value[json.week - 1]) {
          affixWeeks.value[json.week - 1].forEach((affixID) => {
            wago.categories.push('mdtaffix' + affixID)
          })
        }
      }
      wago.categories = Categories.validateCategories(wago.categories)
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
        webhooks.discord.onCreate(req.user, wago)
      }
      res.send({ success: true, wagoID: doc._id })
    }
    else {
      return res.code(400).send({ error: "Invalid data" })
    }
  })

  // imports json and creates a scan id
  fastify.post('/json/scan', async function (req, res) {
    if (!req.body.json) {
      return res.code(400).send({ error: "Invalid data" })
    }
    try {
      var json = JSON.parse(req.body.json)
      var jsonString = JSON.stringify(json)
    }
    catch (e) {
      console.log(e)
      return res.code(400).send({ error: "Invalid data" })
    }
    var encoded
    for (const addonFile in Addons) {
      const addon = Addons[addonFile]
      if ((req.body.type && req.body.type.match(addon.typeMatch)) || (req.body.wagolib && addonFile === 'WagoLib')) {
        if (addon.encode) {
          encoded = await addon.encode(jsonString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        }
        else if (addon.encodeRaw) {
          encoded = await addon.encodeRaw(jsonString)
        }

        let meta = addon.processMeta(json)
        if (encoded && meta) {
          const scan = await new ImportScan({ type: req.body.type.toUpperCase(), input: encoded, decoded: req.body.json, fork: req.body.forkOf })
          scan.decoded = jsonString
          scan.type = meta.type
          scan.name = meta.name || meta.type
          scan.game = meta.game || patchDates.gameVersion()
          scan.categories = meta.categories || []
          scan.addon = addonFile
          await scan.save()
          return res.send({ scan: scan._id, type: scan.type, name: scan.name, categories: scan.categories, game: scan.game, encoded: encoded })
        }
      }
    }
    switch (req.body.type.toUpperCase()) {
      // case 'ELVUI':
      //   encoded = await lua.JSON2ElvUI(json)
      // break

      case 'MDT':
        encoded = await lua.JSON2MDT(json)
        break

      // case 'PLATER':
      //   encoded = await lua.JSON2Plater(json)
      // break

      // case 'TOTALRP3':
      //   encoded = await lua.JSON2TotalRP3(json)
      // break

      // case 'VUHDO':
      //   encoded = await lua.JSON2VuhDo(json)
      // break

      // case 'WEAKAURA':
      // case 'CLASSIC-WEAKAURA':
      //   encoded = await lua.JSON2WeakAura(json)
      // break
    }
    if (!encoded) {
      return res.code(400).send({ error: "Invalid data" })
    }

    const scan = await new ImportScan({ type: req.body.type.toUpperCase(), input: encoded, decoded: req.body.json, fork: req.body.forkOf }).save()
    res.send({ encoded: encoded, scan: scan._id.toString(), type: scan.type })
  })

  fastify.post('/lua/save', async function (req, res) {
    if (!req.user || !req.body.wagoID) {
      return res.code(400).send({ error: 'invalid_import' })
    }
    var wago = await WagoItem.findOne({ _id: req.body.wagoID, _userId: req.user._id }).exec()
    if (!wago) {
      return res.code(403).send({ error: 'invalid_import' })
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
    wago.modified = Date.now()
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
    webhooks.discord.onUpdate(req.user, wago)

    if (wago.encrypted && req.body.cipherKey) {
      code.encoded = crypto.AES.encrypt(code.encoded, req.body.cipherKey)
      code.json = crypto.AES.encrypt(code.json, req.body.cipherKey)
      code.text = crypto.AES.encrypt(code.text, req.body.cipherKey)
      code.lua = crypto.AES.encrypt(code.lua, req.body.cipherKey)
    }
    await code.save()
    redis.clear(wago)
    res.send({ success: true, wagoID: wago._id })
  })


  fastify.post('/lua/fork', async function (req, res) {
    if (!req.body.lua || !req.body.forkOf) {
      return res.code(400).send({ error: 'invalid_import' })
    }
    const fork = await WagoItem.findById(req.body.forkOf)
    if (!fork) {
      return res.code(400).send({ error: 'invalid_import' })
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
      wago.expires_at = new Date().setTime(new Date().getTime() + 3 * 30 * 24 * 60 * 60 * 1000)
      wago.hidden = false
      wago.private = false
    }

    var doc = await wago.save()
    var code = new WagoCode({ auraID: doc._id })
    code.lua = req.body.lua
    code.version = 1
    code.versionString = '1.0.0'
    await code.save()
    res.send({ success: true, wagoID: doc._id })
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
