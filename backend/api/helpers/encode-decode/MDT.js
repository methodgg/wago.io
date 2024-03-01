const getCode = require('../code-detection/get-code')
const patchDates = require('../patchDates')
const categories = require('../../../../frontend/src/components/libs/categories2')

module.exports = {
  typeMatch: /^MDT$/i,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^!?[a-zA-Z0-9\(\)]*$/)) {
      return false
    }
    const lua = `
        local str = "${encodedString}"
        local encoded, usesDeflate = str:gsub("^%!", "")

        local decoded
        if usesDeflate == 1 then
            decoded = LibDeflate:DecodeForPrint(encoded)
        else
            decoded = decodeB64(encoded)
        end

        local decompressed, errorMsg = nil, "unknown compression method"
        if usesDeflate == 1 then
            decompressed = LibDeflate:DecompressDeflate(decoded)
        else
            decompressed, errorMsg = Compresser:Decompress(decoded)
        end

        if not(decompressed) then
            return "Error decompressing: " .. errorMsg
        end

        local success, deserialized = Serializer:Deserialize(decompressed)
        if not(success) then
            return "Error deserializing "..deserialized
        end
        return JSON:encode(deserialized)
    `
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (json, exec) => {
    const lua = `
    local t = JSON:decode("${json}")
    if not t or not t.value or not t.value.currentDungeonIdx then return "" end

    -- convert number enemy indexes to actual numbers from table <-> JSON conversion
    local fixedPulls = {}
    for pullIndex, pull in ipairs(t.value.pulls) do
      fixedPulls[pullIndex] = {}
      for key, value in pairs(pull) do
        if type(key) == "string" and tonumber(key) then
            fixedPulls[pullIndex][tonumber(key)] = value
        else
            fixedPulls[pullIndex][key] = value
        end
      end
    end
    t.value.pulls = fixedPulls

    local serialized = Serializer:Serialize(t)
    local compressed = Compresser:CompressHuffman(serialized)
    local encoded = encodeB64(compressed)
    return encoded`
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
        console.log(e)
      return false
    }
  },

  processMeta: (obj) => {
    if (!obj || !obj.value || !obj.value.currentDungeonIdx) {
        console.log(Object.keys(obj))
      return false
    }

    return {
        name: obj.text && obj.text !== 'Default' ? obj.text : 'MDT Route',
        type: 'MDT',
        categories: [categories.findByMDT_ID(obj.value.currentDungeonIdx) || `MDT-${obj.value.currentDungeonIdx}`]
    }
  },

  addWagoData: async (code, wago) => {
    if (!code.json || !wago) {
      return
    }
    let json = JSON.parse(code.json)
    json.wagoID = wago._id
    json = sortJSON(json)
    code.json = JSON.stringify(json)

    wago.game = 'df'
    const version = await GameVersion.findVersion(10, wago.modified, 0)
    wago.patch_name = version.name
    wago.categories = ['df-mdt-s3', categories.findByMDT_ID(json.value.currentDungeonIdx) || `mdt-${json.value.currentDungeonIdx}`]
    
    return { code, wago }
  }
}

function sortJSON(obj) {
  // if a regular array then its already sorted but still sort any child objects
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] == 'object') {
        obj[i] = sortJSON(obj[i])
      }
    }
    return obj
  }

  // sort object as expected
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