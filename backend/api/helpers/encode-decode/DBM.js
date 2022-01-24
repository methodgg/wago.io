module.exports = {
  typeMatch: /^DBM$/i,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^[a-zA-Z0-9\(\)]*$/)) {
      return false
    }
    const lua = `
      local encoded = "${encodedString}"
      local success, deserialized = LibSerialize:Deserialize(LibDeflate:DecompressDeflate(LibDeflate:DecodeForPrint(encoded)))
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
    return LibDeflate:EncodeForPrint(LibDeflate:CompressDeflate(LibSerialize:Serialize(t), {level = 9}))`
    try {
      let encodedString = await exec(lua)
      console.log('encoded')
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    if (!obj || !obj.DBM || !obj.DBT) {
      return false
    }
    let meta = {}

    meta.name = 'DBM Profile'
    meta.type = 'DBM'

    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      return
    }
    let json = JSON.parse(code.json)

    json.DBM.MoviesSeen = []

    code.json = JSON.stringify(json)

    return {code}
  }
}
