module.exports = {
    typeMatch: /^PLATYNATOR$/i,
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
  
    encodeRaw: async (json) => {
        return JSON.stringify(JSON.parse(json))
    },
  
    processMeta: (obj) => {
      if (obj?.addon !== 'Platynator') {
        return false
      }
      let meta = {}
  
      meta.name = 'Platynator Design'
      meta.type = 'PLATYNATOR'
  
      return meta
    }
  }
  