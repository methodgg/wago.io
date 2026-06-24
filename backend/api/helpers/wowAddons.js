const blizzEncoding = require('./blizzEncoding')
const luaEncoding = require('./luaEncoding')
const getCode = require('./code-detection/get-code')
const patchDates = require('./patchDates')
const categories = require('../../../frontend/src/components/libs/categories2')

const addons = [{
    type: 'AYIJE-CDM',
    slug: 'ayije-cdm',
    stringPrefix: '!ACDM:',
    buildMeta: (obj) => {
        if (obj.addon !== 'Ayije_CDM') {
            return false
        }
        return {name: 'Ayije Cooldown Manager Profile'}
    },
}, {
    type: 'BAGANATOR',
    slug: 'baganator',
    stringPrefix: 'BGR!1!',
    useLegacyEncoding: Date.now() < 1787230800000, // until Aug 20 2026
    buildMeta: (obj) => {
        if (obj.addon !== 'Baganator') {
            return false
        }
        const meta = {categories:[]}
        meta.name = 'Baganator Categories'
        return meta
    },
}, {
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
    type: 'BUFF-REMINDERS',
    slug: 'buff-reminders',
    stringPrefix: '!BR_',
    buildMeta: (obj) => {
        return {name: 'Buff Reminders Profile'}
    },
    compression: 'none'
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
    type: 'CLASS-UI-ENHANCED',
    slug: 'class-ui-enhanced',
    stringPrefix: '!CUE!',
    buildMeta: (obj) => {
        const meta = {categories:[]}
        meta.name = 'Class UI Enhanced Profile'
        meta.game = patchDates.gameVersion(obj.toc_version)
        return meta
    },
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
    type: 'ELLESMEREUI',
    slug: 'ellesmere-ui',
    stringPrefix: '!EUI_',
    buildMeta: (obj) => {
        const meta = {
            name: 'EllesmereUI Profile',
            categories:[]
        }
        
        return meta
    },
    customDecode: async (importStr) => {
        return luaEncoding.decode(importStr.substring(5), {serialization: 'custom', customSerialize: `
            local function DeserializeValue(str, pos)
                local tag = str:sub(pos, pos)
                if tag == "s" then
                    -- Find the colon after the length
                    local colonPos = str:find(":", pos + 1, true)
                    if not colonPos then return nil, pos end
                    local len = tonumber(str:sub(pos + 1, colonPos - 1))
                    if not len then return nil, pos end
                    local val = str:sub(colonPos + 1, colonPos + len)
                    return val, colonPos + len + 1
                elseif tag == "n" then
                    local semi = str:find(";", pos + 1, true)
                    if not semi then return nil, pos end
                    return tonumber(str:sub(pos + 1, semi - 1)), semi + 1
                elseif tag == "T" then
                    return true, pos + 1
                elseif tag == "F" then
                    return false, pos + 1
                elseif tag == "N" then
                    return nil, pos + 1
                elseif tag == "{" then
                    local tbl = {}
                    local idx = 1
                    local p = pos + 1
                    while p <= #str do
                        local c = str:sub(p, p)
                        if c == "}" then
                            return tbl, p + 1
                        elseif c == "K" then
                            -- Key-value pair
                            local key, val
                            key, p = DeserializeValue(str, p + 1)
                            val, p = DeserializeValue(str, p)
                            if key ~= nil then
                                tbl[key] = val
                            end
                        else
                            -- Array element
                            local val
                            val, p = DeserializeValue(str, p)
                            tbl[idx] = val
                            idx = idx + 1
                        end
                    end
                    return tbl, p
                end
                return nil, pos + 1
            end

            local function Deserialize(str)
                if not str or #str == 0 then return nil end
                local val, _ = DeserializeValue(str, 1)
                return val
            end
            data = Deserialize(data)
        `})
    },
    customEncode: async (obj) => {
        return `!EUI_${await luaEncoding.encode(obj, {serialization: 'custom', customSerialize: `
            local function SerializeValue(v, parts)
            local t = type(v)
            if t == "string" then
                parts[#parts + 1] = "s"
                -- Length-prefixed to avoid delimiter issues
                parts[#parts + 1] = #v
                parts[#parts + 1] = ":"
                parts[#parts + 1] = v
            elseif t == "number" then
                parts[#parts + 1] = "n"
                parts[#parts + 1] = tostring(v)
                parts[#parts + 1] = ";"
            elseif t == "boolean" then
                parts[#parts + 1] = v and "T" or "F"
            elseif t == "nil" then
                parts[#parts + 1] = "N"
            elseif t == "table" then
                parts[#parts + 1] = "{"
                -- Serialize array part first (integer keys 1..n)
                local n = #v
                for i = 1, n do
                    SerializeValue(v[i], parts)
                end
                -- Then hash part (non-integer keys, or integer keys > n)
                for k, val in pairs(v) do
                    local kt = type(k)
                    if kt == "number" and k >= 1 and k <= n and k == math.floor(k) then
                        -- Already serialized in array part
                    else
                        parts[#parts + 1] = "K"
                        SerializeValue(k, parts)
                        SerializeValue(val, parts)
                    end
                end
                parts[#parts + 1] = "}"
            end
        end

        local function Serialize(tbl)
            local parts = {}
            SerializeValue(tbl, parts)
            return table.concat(parts)
        end
        data = Serialize(data)
        `})}`
    },
    useLuaEncoding: true,
}, {
    type: 'EXBOSS',
    slug: 'exboss',
    stringPrefix: 'EXBXC:',
    useLuaEncoding: true,
    buildMeta: (obj) => {
        const meta = {categories:[]}
        meta.name = 'EXBOSS Profile'
        return meta
    },
}, {
    type: 'GRID2',
    slug: 'grid2',
    stringRegex: /^(\[=== (.*?) ===\])\n([A-F0-9\n]+)\n\1$/,
    customDecode: async (importStr) => {
        const match = importStr.match(/^(\[=== (.*?) ===\])\n([A-F0-9\n]+)\n\1$/)
        const payload = obj = await luaEncoding.decode(match[3].replace(/\s/g, ''), {serialization: 'AceSerializer', compression: 'LibCompress', encoding: 'hex'})
        if (payload) {
            return {
                name: match[2],
                data: payload
            }
        }
        return false
    },
    customEncode: async (obj) => {
        const profileIdent = `[=== ${obj.name.replace(/\s*profile\s*$/i, '')} profile ===]`
        return`${profileIdent}${await luaEncoding.encode(obj.data, {serialization: 'AceSerializer', compression: 'LibCompress', encoding: 'hex'})}\n${profileIdent}`
    },
    buildMeta: (obj) => {
        if (!obj.data.Grid2Layout) {
            return false
        }
        const meta = {
            name: obj.name || 'Grid2 Profile'
        }

        return meta
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
    type: 'HENNI-AURAS',
    slug: 'henni-auras',
    stringPrefix: 'HA:1:',
    serialization: 'JSON',
    compression: 'deflate',
    buildMeta: (obj) => {
        const meta = {
            name: obj.node.name || 'HenniAura'
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
    type: 'PLATYNATOR',
    slug: 'platynator',
    stringPrefix: 'PLATY!1!',
    useLegacyEncoding: Date.now() < 1787230800000, // until Aug 20 2026
    buildMeta: (obj) => {
        if (obj.addon !== 'Platynator') {
            return false
        }
        const meta = {categories:[]}
        meta.name = 'Platynator Design'
        return meta
    },
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
    type: 'SKIRONCOOLDOWNMANAGER',
    slug: 'skiron-cooldown-manager',
    stringPrefix: '!SCM:1:',
    buildMeta: (obj) => {
        const meta = {
            name: `Skiron Profile`
        }

        if (parseInt(obj.exportType)) {
            const classes = categories.classCategories()
            const specs = []
            classes.forEach(c => {
                specs.push(...c.specs)
            })
            const spec = specs.find(x => x.i18n === `warcraft:specs.${obj.exportType}`)
            if (spec) {
                meta.categories = [spec.parent, spec.id]
            }
        }

        return meta
    },
    customDecode: async (importStr) => {
        const match = importStr.match(/^!SCM:1:(\d+)!([a-zA-Z0-9+=\/]+)$/)
        const payload = await blizzEncoding.decode(match[2])
        if (payload) {
            return {
                exportType: parseInt(match[1]),
                data: payload
            }
        }
        return false
    },
    customEncode: async (obj) => {
        const prefix = `!SCM:1:${obj.exportType}!`
        return prefix + await blizzEncoding.encode(obj.data)
    },
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
    type: 'TWINTOPS-RESOURCE-BAR',
    slug: 'twintops-resource-bar',
    stringPrefix: '!TRBv2!',
    serialization: 'JSON',
    buildMeta: (obj) => {
        // const classes = Object.keys(obj)
        const meta = {
            name: 'Resource Bar',
            // categories: [autoCategory(classname)]
        }

        return meta
    },
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
        else if (obj.type !== 'group') {
            return false
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
    type: 'HOUSING-BLUEPRINTS',
    slug: 'housing-blueprints',
    compression: 'deflate',
    stringRegex: /^([-A-Za-z0-9+/]*={0,3})$/,
    serialization: 'hex',
    compression: 'none',
    customDecode: async (importStr) => {
        const payload = await blizzEncoding.decode(importStr, {serialization: 'hex', compression: 'none', encoding: 'base64'})
        if (payload?.length === 38 && payload.match(/^.....[1-4]/)) {
            return {
                meta: payload.substring(0, 6),
                key: payload.substring(6)
            }
        }
        return false
    },
    customEncode: async (obj) => {
        return blizzEncoding.encode(obj.meta + obj.key, {serialization: 'hex', compression: 'none', encoding: 'base64'})
    },
    buildMeta: (obj) => {
        if (obj) {
            const importType = parseInt(obj.meta.substring(5))
            const categories = ['blueprint0', `blueprint${importType}`]
            let name
            if (importType === 1) {
                name = 'Full Layout Blueprint'
            }
            else if (importType === 2) {
                name = 'Room Blueprint'
            }
            else if (importType === 3) {
                name = 'Interior Blueprint'
            }
            else if (importType === 4) {
                name = 'Exterior Blueprint'
            }
            return { name, categories }
        }
        return false
    },
}, {
    type: 'MPLUS-TIMER',
    slug: 'mplus-timer',
    stringRegex: /^([a-zA-Z0-9\(\)]+)$/,
    buildMeta: (obj) => {
        if (obj?.PercentCount && obj.ChestTimer1 && obj.AffixIcons && obj.CurrentPullBar && obj.BossTimer && obj.ForcesCompletion) {
            return {name: 'MPlus Timer Settings'}
        }
        return false
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer'
}, {
    type: 'COOLDOWN-COMPANION',
    slug: 'cooldown-companion',
    stringRegex: /^([a-zA-Z0-9\(\)]+)$/,
    buildMeta: (obj) => {
        if (obj._cdcExportFormat && obj._cdcImportCheckpoint) {
            return {name: obj.container?.name || 'Cooldown Companion'}
        }
        return false
    },
    useLuaEncoding: true,
    serialization: 'AceSerializer',
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
    if (!addon || addon.useLegacyEncoding) return false

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
    switch ((''+item).toUpperCase()) {
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

function titleCase(str) {
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
} 