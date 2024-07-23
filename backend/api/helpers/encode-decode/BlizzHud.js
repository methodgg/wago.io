module.exports = {
    typeMatch: /^BLIZZHUD$/,
    domain: ENUM.DOMAIN.WOW,
    decode: async (encodedString) => {
      if (!encodedString.match(/^(\d+ \d+) (\d+ -?\d+ \d+ \d+ \d+ \w+ -?\d+\.?\d* -?\d+\.?\d* -?\d+\.?\d* [\S]+\s?)+$/)) {
        return false
      }
      const v = encodedString.match(/^(\d+ \d+)\s/)
      encodedString = encodedString.substring(v.length)
      const data = [v[1], ...encodedString.match(/(\d+ -?\d+ \d+ \d+ \d+ \w+ -?\d+\.?\d* -?\d+\.?\d* -?\d+\.?\d* [\S]+)/g)]
      return data

    },
  
    encodeRaw: async (str) => {
        return str
    },
  
    processMeta: (obj) => {
      var meta = {type: 'BLIZZHUD', game: 'df', name: 'Blizz HUD Config', categories: []}
  
      return meta
    }
  }
