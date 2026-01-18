module.exports = {
    typeMatch: /^BAGANATOR$/i,
    domain: ENUM.DOMAIN.WOW,
    plainText: true,
  
    decode: async (encodedString, exec) => {
      // test that string matches expected regex
      if (!encodedString.match(/^\{"\w/)) {
        return false
      }
      try {
        return JSON.parse(encodedString)
      }
      catch {
        return false
      }
    },
  
    encodeRaw: async (str) => {
        return str
    },
  
    processMeta: (obj) => {
      if (!obj || !Array.isArray(obj.categories) || !Array.isArray(obj.modifications) || !obj.version) {
        return false
      }
      let meta = {}
  
      meta.name = 'Baganator Categories'
      meta.type = 'BAGANATOR'
  
      return meta
    }
  }
  