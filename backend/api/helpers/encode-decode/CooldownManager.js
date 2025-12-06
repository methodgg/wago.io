const blizzEncoding = require('../blizzEncoding')

module.exports = {
    typeMatch: /^COOLDOWN-MANAGER$/i,
    domain: ENUM.DOMAIN.WOW,
  
    decode: async (encodedString) => {
      // test that string matches expected regex
      const parsed = encodedString.match(/(\d+)\|([a-zA-Z0-9+=\/]+)/)
      if (parseInt(parsed?.[1]) === 1) {
        try {
            return blizzEncoding.standardDecode(parsed[2])
        }
        catch (e) {
            // console.log(e)
        }
      }
      return null
    },
  
    encodeRaw: async (json) => {
      return `1|${await blizzEncoding.standardEncode(json)}`
    },
  
    processMeta: (obj) => {
      if (!obj) {
        return false
      }
      const meta = {
        type: 'COOLDOWN-MANAGER'
      }
      if (!Array.isArray(obj) || !Array.isArray(obj[1])) {
        return false
      }
      try {
        meta.name = Object.values(obj[3]).filter(Boolean)[0]
        if (typeof meta.name !== 'string' || !meta.name) {
            return false
        }
      }
      catch {
        return false
      }
  
      return meta
    },
  }
  