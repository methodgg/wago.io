const blizzEncoding = require('./blizzEncoding')
const luaEncoding = require('./luaEncoding')
const getCode = require('./code-detection/get-code')
const patchDates = require('./patchDates')

const addons = [{
    type: 'BETTER-BLIZZ-FRAMES',
    slug: 'better-blizz-frames',
    stringPrefix: '!BBF',
    stringSuffix: '!BBF',
    buildMeta: (obj) => {
        const meta = {categories:[]}
        if (obj.dataType === 'fullProfile') {
            meta.name = 'Better Blizz Frames Profile'
            meta.categories.push('bbf1')
        }
        else if (obj.dataType === 'auraWhitelist') {
            meta.name = 'Better Blizz Frames Aura Whitelist'
            meta.categories.push('bbf2')
        }
        else if (obj.dataType === 'auraBlacklist') {
            meta.name = 'Better Blizz Frames Aura Blacklist'
            meta.categories.push('bbf3')
        }
        else {
            meta.name = 'Better Blizz Frames Unknown Import'
        }
        return meta
    },
    useLuaEncoding: true,
}, {
    type: 'BETTER-BLIZZ-PLATES',
    slug: 'better-blizz-plates',
    stringPrefix: '!BBP',
    stringSuffix: '!BBP',
    buildMeta: (obj) => {
        const meta = {categories:[]}
        if (obj.dataType === 'fullProfile') {
            meta.name = 'Better Blizz Plates Profile'
            meta.categories.push('bbp1')
        }
        else if (obj.dataType === 'auraWhitelist') {
            meta.name = 'Better Blizz Plates Aura Whitelist'
            meta.categories.push('bbp2')
        }
        else if (obj.dataType === 'auraBlacklist') {
            meta.name = 'Better Blizz Plates Aura Blacklist'
            meta.categories.push('bbp3')
        }
        else if (obj.dataType === 'totemIndicatorNpcList') {
            meta.name = 'Better Blizz Plates Totem Indicator List'
            meta.categories.push('bbp4')
        }
        else if (obj.dataType === 'fadeOutNPCsList') {
            meta.name = 'Better Blizz Plates Fade NPC List'
            meta.categories.push('bbp5')
        }
        else if (obj.dataType === 'hideNPCsList') {
            meta.name = 'Better Blizz Plates Hide NPC Blacklist'
            meta.categories.push('bbp6')
        }
        else if (obj.dataType === 'hideNPCsWhitelist') {
            meta.name = 'Better Blizz Plates Hide NPC Whitelist'
            meta.categories.push('bbp7')
        }
        else if (obj.dataType === 'castEmphasisList') {
            meta.name = 'Better Blizz Plates Cast Emphasis List'
            meta.categories.push('bbp8')
        }
        else if (obj.dataType === 'hideCastbarList') {
            meta.name = 'Better Blizz Plates Hide Castbar Blacklist'
            meta.categories.push('bbp9')
        }
        else if (obj.dataType === 'hideCastbarWhitelist') {
            meta.name = 'Better Blizz Plates Hide Castbar Whitelist'
            meta.categories.push('bbp10')
        }
        else if (obj.dataType === 'colorNpcList') {
            meta.name = 'Better Blizz Plates Color NPC List'
            meta.categories.push('bbp11')
        }
        else if (obj.dataType === 'auraColorList') {
            meta.name = 'Better Blizz Plates Color by Aura List'
            meta.categories.push('bbp12')
        }
        else {
            meta.name = 'Better Blizz Plates Unknown Import ' + obj.dataType
        }
        return meta
    },
    useLuaEncoding: true,
}, {
    type: 'BETTER-COOLDOWN-MANAGER',
    slug: 'better-cdm',
    stringPrefix: '!BCDM_',
    buildMeta: (obj) => {
        return {name: 'Better Cooldown Manager Profile'}
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer'
}, {
    type: 'BIGWIGS',
    slug: 'bigwigs',
    stringRegex: /^(?:BW2|BWIS1):(.+)$/,
    buildMeta: (obj) => {
        const meta = {}

        if (obj.zone) {
            meta.name = 'BigWigs Instance Settings'
        }
        else {
            meta.name = 'BigWigs Profile'
        }

        return meta
    },
    customEncode: async (obj) => {
        const encodedStr = await blizzEncoding.encode(obj)
        const prefix = obj.zone ? 'BWIS1:' : 'BW2:'
        return prefix + encodedStr
    },
    addWagoData: (wago, code, obj) => {
        if (obj.zone < 0) {
            wago.categories_other = [`warcraft:UiMap.${obj.zone * -1}`]
        }
        else if (obj.zone > 0) {
            wago.categories_other = [`warcraft:Map.${obj.zone}`]
        }
    }
}, {
    type: 'COOLDOWN-MANAGER',
    slug: 'blizz-cooldown-manager',
    stringPrefix: '1|',
    buildMeta: (obj) => {
        const meta = {}
        if (!Array.isArray(obj) || !Array.isArray(obj[1])) {
            return false
        }
        meta.name = Object.values(obj[3]).filter(Boolean)[0]
        if (meta.name && typeof meta.name === 'string') {
            return meta
        }
        return false
    },
}, {
    type: 'COOLDOWN-MANAGER-CENTERED',
    slug: 'cooldown-manager-centered',
    stringPrefix: 'CMC1:',
    buildMeta: (obj) => {
        const meta = {categories:[]}
        meta.name = 'Cooldown Manager Centered Profile'
        return meta
    },
    useLuaEncoding: true,
}, {
    type: 'DANDERS-FRAMES',
    slug: 'danders-frames',
    stringRegex: /^!DF(?:P1|C1)!([a-zA-Z0-9\(\)]+)$/,
    buildMeta: (obj) => {
        const meta = {categories:[]}
        if (obj?.profile?.bindings) {
            meta.name = 'Danders Click Casting: ' + obj.profileName
            meta.categories.push('danders2')
            const classCategory = autoCategory(obj.class)
            if (classCategory) meta.categories.push(classCategory)
        }
        else if (obj.profileName) {
            meta.name = 'Danders Profile: ' + obj.profileName
            meta.categories.push('danders1')
        }

        return meta
    },
    customEncode: async (obj) => {
        const encodedStr = await luaEncoding.encode(obj)
        const prefix = obj.profile?.bindings ? '!DFC1!' : '!DFP1!'
        return prefix + encodedStr
    },
    useLuaEncoding: true,
}, {
    type: 'GSE',
    slug: 'gse',
    stringPrefix: '!GSE3!',
    buildMeta: (obj) => {
        const meta = { categories: [] }
        if (Array.isArray(obj) && obj[1]?.MetaData?.Name && obj[1]?.MetaData?.GSEVersion) {
            meta.name = 'GSE Sequence: ' +obj[1].MetaData.Name
            meta.categories.push('gse1')
        }
        else if (obj && obj.name && obj.objectType === 'MACRO') {
            meta.name = 'GSE Macro: ' + obj.name
            meta.categories.push('gse2')
        }
        else if (obj && obj.name && obj.objectType === 'VARIABLE') {
            meta.name = 'GSE Variable: ' +obj.name
            meta.categories.push('gse3')
        }
        else if (obj && obj.payload && obj.type === 'COLLECTION') {
            meta.name = 'GSE Collection'
            meta.categories.push('gse4')
        }
        else {
            return false
        }
        return meta
    },
}, {
    type: 'MIDNIGHT-SIMPLE-UNIT-FRAMES',
    slug: 'msuf',
    stringPrefix: 'MSUF3:',
    buildMeta: (obj) => {
        if (obj.addon !== 'MSUF') {
            return false
        }
        const meta = {}

        if (obj.kind === 'all') {
            meta.name = `MSUF Profile`
        }
        else {
            meta.name = `MSUF ${obj.kind.charAt(0).toUpperCase() + obj.kind.slice(1)}`
        }

        return meta
    },
}, {
    type: 'PLATER',
    slug: 'plater',
    stringPrefix: '!PLATER:2!',
    buildMeta: (obj) => {
        const meta = { 
            categories: ['plater0'],
            game: patchDates.gameVersion(obj.tocversion)
        }
        if (obj.url) {
            let m = obj.url.match(/https:\/\/wago.io\/([^\/]+)\//)
            if (m && m[1]) {
                meta.fork = m[1]
            }
        }
        if (obj.OptionsPanelDB?.PlaterOptionsPanelFrame) {
            meta.name = 'Plater Profile'
            meta.categories.push('plater1')
        }
        else if (obj.NpcColor && obj['1'] && obj['1'][0] && typeof obj['1'][0] === 'number' && obj['1'][2] && typeof obj['1'][2] === 'string') {
            meta.name = 'Plater NPC Colors'
            meta.categories.push('plater5')
        }
        else if (typeof obj['1']?.animation_type && obj['1']?.duration && obj['2']?.animation_type && obj['2']?.duration) {
            meta.name = 'Plater Animation'
            meta.categories.push('plater4')
        }
        else if (obj.CastSounds) {
            meta.name = 'Plater Cast Sounds'
            meta.categories.push('plater1')
        }
        else if (obj.CastColor) {
            meta.name = 'Plater Cast Colors'
            meta.categories.push('plater7')
        }
        else if (obj.type === 'script') {
            meta.name = obj['2']
            meta.description = obj['6']
            meta.categories.push('plater2')
        }
        else if (obj.type === 'hook') {
            meta.name = obj['1']
            meta.description = obj['3']
            meta.categories.push('plater3')
        }
        else {
            return false
        }

        meta.description = meta.description || obj.info?.desc
            
        return meta
    },
    addWagoData: (wago, code, obj) => {
        if (!obj.tocversion) {
            obj.tocversion = patchDates.dateToToc(wago.modified)
        }
        obj.url = wago.url + '/' + code.version
        obj.version = code.version
        obj.semver = code.versionString
    
        code.json = JSON.stringify(obj)
        code.customCode = getCode(json, wago.type)
    }
}, {
    type: 'SARENA-RELOADED',
    slug: 'sarena-reloaded',
    stringPrefix: '!sArena:',
    stringSuffix: ':sArena!',
    buildMeta: (obj) => {
        const meta = {categories:[]}
        if (obj.dataType === 'sArenaProfile') {
            meta.name = 'sArena Profile'
        }
        else {
            meta.name = 'sArena Unknown Import'
        }
        return meta
    },
    useLuaEncoding: true,
}, {
    type: 'UNHALTED-UNIT-FRAMES',
    slug: 'unhalted-uf',
    stringPrefix: '!UUF_',
    buildMeta: (obj) => {
        return {name: 'Unhalted Unit Frames Profile'}
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer'
}, {
    type: 'SENSEI-CLASS-RESOURCE-BAR',
    slug: 'sensei-class-resource-bar',
    stringPrefix: 'SenseiClassResourceBar:1:',
    buildMeta: (obj) => {
        return {name: 'Resource Bar Settings'}
    },
    useLuaEncoding: true,
}, {
    type: 'WATCHTOWER',
    slug: 'watchtower',
    stringPrefix: 'WT1:',
    buildMeta: (obj) => {
        const meta = {
            name: `Watchtower ${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)}`
        }
        if (obj.type === 'flag') {
            meta.name += `: ${obj.data.title}`
        }

        return meta
    },
    customDecode: async (importStr) => {
        const match = importStr.match(/^WT1:(\w+):([a-zA-Z0-9+=\/]+)$/)
        const payload = await blizzEncoding.decode(match[2])
        if (payload) {
            return {
                type: match[1],
                data: payload
            }
        }
        return false
    },
    customEncode: async (obj) => {
        const prefix = `WT1:${obj.type}:`
        return prefix + await blizzEncoding.encode(obj.data)
    },
    addWagoData: async (wago, code, obj) => {
        const customCode = []
        if (Array.isArray(obj.data.flags)) {
            obj.data.flags = obj.data.flags.map((flag, i) => {
                if (flag.trigger) {
                    customCode.push({name: flag.title, keypath: `data.flags[${i}].trigger`, lua: flag.trigger})
                }
                return {
                    ...flag,
                    url: wago.url + '/' + code.version,
                    version: code.version,
                    semver: code.versionString
                }
            })
        }
        else {
            obj.data.url = wago.url + '/' + code.version
            obj.data.version = code.version
            obj.data.semver = code.versionString
            customCode.push({name: obj.data.title, keypath: `data.trigger`, lua: obj.data.trigger})
        }
        code.json = JSON.stringify(obj)
        code.customCode = customCode
    }
},

// strings with no unique string identifier get checked last, each will need to check a bunch of fields
{
    type: 'MPLUS-TIMER',
    slug: 'mplus-timer',
    stringRegex: /^([a-zA-Z0-9\(\)]+)$/,
    buildMeta: (obj) => {
        // string does not have a unique identifier so check a bunch of expected fields
        if (obj?.PercentCount && obj.ChestTimer1 && obj.AffixIcons && obj.CurrentPullBar && obj.BossTimer && obj.ForcesCompletion) {
            return {name: 'MPlus Timer Settings'}
        }
        return false
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer'
}, {
    type: 'ENHANCE-QOL',
    slug: 'enhance-qol',
    stringRegex: /^([a-zA-Z0-9\(\)]+)$/,
    buildMeta: (obj) => {
        const meta = {categories: []}
        if (obj?.meta?.addon === 'EnhanceQoL' && obj?.meta?.kind === 'EQOL_PROFILE') {
            meta.name = obj.meta.profile + ' Profile'
            meta.categories.push('enhanceqol1')
        }
        else if (obj?.kind === 'EQOL_RESOURCE_BAR_PROFILE' && typeof obj?.enableResourceFrame === 'boolean') {
            meta.name = 'Resource Bar Settings'
            meta.categories.push('enhanceqol2')
            const classCategory = autoCategory(obj.class)
            if (classCategory) meta.categories.push(classCategory)
        }
        else if (obj.kind === 'EQOL_UF_PROFILE' && typeof obj.frames === 'object') {
            meta.name = 'Unit Frame Settings'
            meta.categories.push('enhanceqol3')
        }
        else {
            return false
        }

        return meta
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer'
}, 
{
    type: 'TARGETED-SPELLS',
    slug: 'targeted-spells',
    // no prefix
    stringRegex: /^([a-zA-Z0-9+=\/]+)$/,
    compression: 'none',
    buildMeta: (obj) => {
        // string does not have a unique identifier so check a bunch of expected fields
        const valid = obj?.Self?.LoadConditionContentType?.length && typeof obj?.Self?.GlowImportant === 'boolean' && typeof obj?.Self?.ShowBorder === 'boolean' &&
                      obj?.Party?.LoadConditionContentType?.length && typeof obj?.Party?.GlowImportant === 'boolean' && typeof obj?.Party?.ShowBorder === 'boolean'
        
        if (valid) {
            return {name: 'Targeted Spells Settings'}
        }
        return false
    },
},]

async function toDecodedObject(scan) {
    let importStr = ''
    const originalStr = scan.input
    for (const addon of addons) {
        importStr = scan.input
        if (addon.stringRegex) {
            let m = importStr.match(addon.stringRegex)
            if (m) {
                importStr = m[1]
            }
            else {
                continue
            }
        }

        if (addon.stringPrefix) {
            if (importStr.startsWith(addon.stringPrefix)) {
                importStr = importStr.substring(addon.stringPrefix.length)
            }
            else {
                continue
            }
        }

        if (addon.stringSuffix) {
            if (importStr.endsWith(addon.stringSuffix)) {
                importStr = importStr.slice(0, -addon.stringSuffix.length)
            }
            else {
                continue
            }
        }
        try {
            console.log('modern decoding', addon.type)
            let obj
            if (addon.customDecode) {
                obj = await addon.customDecode(originalStr)
            }
            else if (addon.useLuaEncoding) {
                obj = await luaEncoding.decode(importStr, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
            }
            else {
                obj = await blizzEncoding.decode(importStr, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
            }

            if (!obj) {
                continue
            }

            const meta = addon.buildMeta(obj)
            if (!meta) {
                continue
            }

            scan.decoded = JSON.stringify(obj)
            scan.type = addon.type
            scan.name = meta.name || addon.type
            scan.game = meta.game
            scan.categories = meta.categories || []
            return
        }
        catch (e) {
            console.log(e)
            continue
        }
    }
}

async function toEncodedString(obj, type) {
    const addon = addons.find(a => a.type === type.toUpperCase())
    if (!addon) return false

    try {
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        let encoded = ''
        if (addon.customEncode) {
            return addon.customEncode(obj)            
        }        
        else if (addon.useLuaEncoding) {
            encoded = await luaEncoding.encode(obj, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
        }
        else {
            encoded = await blizzEncoding.encode(obj, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
        }

        if (encoded) {
            return (addon.stringPrefix ?? '') + encoded + (addon.stringSuffix ?? '')
        }
    }
    catch (e) {
        console.log(e)
    }
    return false
}

async function addWagoData(wago, code) {
    try {
        let obj = code.json
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }
        const addon = addons.find(a => a.type === wago?.type?.toUpperCase())
        if (!addon?.addWagoData) {
            return false
        }

        await addon.addWagoData(wago, code, obj)
        return true
    }
    catch (e) {console.log(e)}
    return false
}

module.exports = {
    addons,
    toDecodedObject,
    toEncodedString,
    addWagoData
}

function autoCategory(item) {
    switch (item) {
        case 'DEATHKNIGHT': return 'cl6'
        case 'DEMONHUNTER': return 'cl12'
        case 'DRUID': return 'cl11'
        case 'EVOKER': return 'cl13'
        case 'HUNTER': return 'cl3'
        case 'MAGE': return 'cl8'
        case 'MONK': return 'cl10'
        case 'PALADIN': return 'cl2'
        case 'PRIEST': return 'cl5'
        case 'ROGUE': return 'cl4'
        case 'SHAMAN': return 'cl7'
        case 'WARLOCK': return 'cl9'
        case 'WARRIOR': return 'cl1'
    }
}

function sortJSON(obj) {
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] == 'object') {
        obj[i] = sortJSON(obj[i])
      }
    }
    return obj
  }

  var sorted = {}
  var keys
  keys = Object.keys(obj)
  keys.sort(function (key1, key2) {
    if (key1 < key2) return -1
    if (key1 > key2) return 1
    return 0
  })

  for (var i in keys) {
    var key = keys[i]
    if (obj[key] && typeof obj[key] == 'object') {
      sorted[key] = sortJSON(obj[key])
    } else {
      sorted[key] = obj[key]
    }
  }

  return sorted
}