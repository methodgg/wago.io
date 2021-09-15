module.exports = {
  typeMatch: /^TOTALRP3$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    if (!encodedString.match(/^\^.+\^\^$|^![a-zA-Z0-9\(\)]*$/)) {
      return false
    }
    const lua = `
      local str = "${encodedString}"
      local encoded, usesLibDeflate = str:gsub("^%!", "");
      local compressed, serialized
      if usesLibDeflate == 1 then
        compressed = LibDeflate:DecodeForPrint(encoded)
        serialized = LibDeflate:DecompressDeflate(compressed)
      else
        return ''
      end
      local success, deserialized = Serializer:Deserialize(serialized);
      if success then
        return JSON:encode(deserialized)
      end
      return ''
    `
    try {
      let json = await exec(lua)
      // If successful, json is now a JSON string, so parse into an object and return it.
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (json, exec) => {
    const lua = `
    local t = JSON:decode("${json}")
    if not t then return "" end

    local serialized = Serializer:Serialize(t)
    local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
    local encoded = "!" .. LibDeflate:EncodeForPrint(compressed)
    return encoded`
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    if (!obj || !Array.isArray(obj) || !obj[2] || !obj[2].TY) {
      return false
    }
    var meta = {type: 'TOTALRP3', categories: []}

    try {
      if (obj[2].TY === 'CA') {
        meta.name = 'Campaign'
        meta.categories.push('totalrp1')
      }
      else if (obj[2].TY === 'IT') {
        meta.name = 'Item'
        meta.categories.push('totalrp4')
      }
      else {
        return false
      }
      if (obj[2].BA.NA) {
        meta.name = meta.name + ': ' + obj[2].BA.NA
      }
    }
    catch (e) {
      return false
    }

    return meta
  }
}