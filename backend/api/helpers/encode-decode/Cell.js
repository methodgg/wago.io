const getCode = require('../code-detection/get-code')
const patchDates = require('../patchDates')
const regexCell = /^!CELL:\d+:(ALL|LAYOUT:(.+)|INDICATOR:\d+|CLICKCASTING:(.+)|DEBUFF:(\d+):(\w+)|QUICKASSIST)![a-zA-Z0-9\(\)]*$/
const cellExportVersion = 236

module.exports = {
  typeMatch: /^CELL$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(regexCell)) {
      return false
    }
    const lua = `
      local encoded = "${encodedString}"
      local version, success, key, key2
      version, data = string.match(encoded, "^!CELL:(%d+):ALL!(.+)$")
      if not data then
        version, key, data = string.match(encoded, "^!CELL:(%d+):LAYOUT:(.+)!(.+)$")
      end
      if not data then
        version, key, data = string.match(encoded, "^!CELL:(%d+):INDICATOR:(%d+)!(.+)$")
      end
      if not data then
        version, key, data = string.match(encoded, "^!CELL:(%d+):CLICKCASTING:(.+)!(.+)$")
      end
      if not data then
        version, key, key2, data = string.match(encoded, "^!CELL:(%d+):DEBUFF:(%d+):(.+)!(.+)$")
      end
      if not data then
        version, data = string.match(encoded, "^!CELL:(%d+):QUICKASSIST!(.+)$")
      end
      if not data then
        return false
      end

      data = LibDeflate:DecodeForPrint(data)
      data = LibDeflate:DecompressDeflate(data)
      success, data = LibSerialize:Deserialize(data)

      if success and data then
        return JSON:encode(data, {forceTableToObject = {quickAssist = 1}})
      end
      return data`
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (json, exec, wago) => {
    const lua = `
    local t = JSON:decode("${json}")
    if not t then return "" end

    function fixNumericIndexes(tbl)
      local fixed = {}
      for k, v in pairs(tbl) do
        if tonumber(k) and tonumber(k) > 0 then
          fixed[tonumber(k)] = v
        else
          fixed[k] = v
        end
      end
      return fixed
    end

    if t and t.quickAssist then
      t.quickAssist = fixNumericIndexes(t.quickAssist)
    end

    local serialized = LibSerialize:Serialize(t)
    local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
    local encoded = LibDeflate:EncodeForPrint(compressed)
    return encoded`
    try {
      const encodedString = await exec(lua)
      return `!CELL:${cellExportVersion}:${wago.embeddedStrData}!${encodedString}`
    }
    catch (e) {
        console.log(e)
      return false
    }
  },

  processMeta: (obj, importString) => {
    var meta = { categories: [] }
    if (!obj) {
      return false
    }

    meta.type = 'CELL'
    const strMeta = regexCell.exec(importString)
    meta.embeddedStrData = strMeta[1]

    if (strMeta[1].startsWith('ALL') && obj.general && obj.appearance) {
        meta.name = `Cell Complete Profile`
    }
    else if (strMeta[1].startsWith('LAYOUT') && obj.main && obj.indicators) {
        meta.name = `Cell Layout: ${strMeta[2]}`
    }
    else if (strMeta[1].startsWith('INDICATOR') && obj.related && obj.indicators) {
        meta.name = `Cell Indicators`
    }
    else if (strMeta[1].startsWith('CLICKCASTING') && Array.isArray(obj) && Array.isArray(obj[0])) {
        meta.name = `Cell Click-Castings: ${strMeta[3]}`
        if (strMeta[3] === 'DEATHKNIGHT') meta.categories = ['cl6']
        else if (strMeta[3] === 'DEMONHUNTER') meta.categories = ['cl12']
        else if (strMeta[3] === 'DRUID') meta.categories = ['cl11']
        else if (strMeta[3] === 'EVOKER') meta.categories = ['cl13']
        else if (strMeta[3] === 'HUNTER') meta.categories = ['cl3']
        else if (strMeta[3] === 'MAGE') meta.categories = ['cl8']
        else if (strMeta[3] === 'MONK') meta.categories = ['cl10']
        else if (strMeta[3] === 'PALADIN') meta.categories = ['cl2']
        else if (strMeta[3] === 'PRIEST') meta.categories = ['cl5']
        else if (strMeta[3] === 'ROGUE') meta.categories = ['cl4']
        else if (strMeta[3] === 'SHAMAN') meta.categories = ['cl7']
        else if (strMeta[3] === 'WARLOCK') meta.categories = ['cl9']
        else if (strMeta[3] === 'WARRIOR') meta.categories = ['cl1']
    }
    else if (strMeta[1].startsWith('DEBUFF') && parseInt(Object.keys(obj)[0]) > 100) {
        meta.name = `Cell Debuffs`
    }
    else if (strMeta[1].startsWith('QUICKASSIST') && obj.spells && obj.filters) {
        meta.name = `Cell Quick Assist`
    }
    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      return
    }
    const obj = JSON.parse(code.json)
    let sysCat

    if (obj.general && obj.appearance) {
        sysCat = 'cell1' 
    }
    else if (obj.main && obj.indicators) {
        sysCat = 'cell2'
    }
    else if (obj.related && obj.indicators) {
        sysCat = 'cell3'
    }
    else if (Array.isArray(obj) && Array.isArray(obj[0])) {
        sysCat = 'cell4'
    }
    else if (parseInt(Object.keys(obj)[0]) > 100) {
        sysCat = 'cell5'
    }
    else if (obj.spells && obj.filters) {
        sysCat = 'cell6'
    }

    if (sysCat && wago.categories.indexOf(sysCat) < 0) {
        wago.categories.push(sysCat)
    }

    return { wago }
  }
}
