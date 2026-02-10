const blizzEncoding = require('./blizzEncoding')
// const luaEncoding = require('./luaEncoding')
const getCode = require('./code-detection/get-code')
const patchDates = require('./patchDates')

const addons = [{
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
    addWagoData: (obj, wago) => {
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
    addWagoData: (obj, wago, code) => {
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
//     type: 'UNHALTED-UNIT-FRAMES',
//     slug: 'unhalted-uf',
//     stringPrefix: '!UUF_',
//     buildMeta: (obj) => {
//         const meta = {
//             name: `Unhalted Unit Frame`
//         }

//         return meta
//     },
//     useLuaEncoding: true,
//     serialization: 'AceSerializer'
// }, {
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
    }
},

// strings with no unique string identifier get checked last
{
    type: 'TARGETED-SPELLS',
    slug: 'targeted-spells',
    // no prefix
    stringRegex: /^([a-zA-Z0-9+=\/]+)$/,
    compression: 'none',
    buildMeta: (obj) => {
        // no unique way to identify this import type so check for a bunch of fields
        const valid = obj?.Self?.LoadConditionContentType?.length && typeof obj?.Self?.GlowImportant === 'boolean' && typeof obj?.Self?.ShowBorder === 'boolean' &&
                      obj?.Party?.LoadConditionContentType?.length && typeof obj?.Party?.GlowImportant === 'boolean' && typeof obj?.Party?.ShowBorder === 'boolean'
        
        if (valid) {
            return {name: 'Targeted Spells Settings'}
        }
        return false
    },
}]

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
                // obj = await luaEncoding.decode(importStr, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
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

        if (addon.customEncode) {
            return addon.customEncode(obj)            
        }
        
        let encoded = ''
        if (addon.useLuaEncoding) {
            // encoded = await luaEncoding.decode(importStr, {serialization: addon.serialization, compression: addon.compression, encoding: addon.encoding})
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
        return false
    }
}

async function addWagoData(wago, code) {
    const addon = addons.find(a => a.type === wago?.type?.toUpperCase())
    if (!addon?.addWagoData) return false

    try {
        let obj = code.json
        if (typeof obj === 'string') {
            obj = JSON.parse(obj)
        }

        addon.addWagoData(obj, wago, code)
    }
    catch (e) {console.log(e)}
}

module.exports = {
    addons,
    toDecodedObject,
    toEncodedString,
    addWagoData
}