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
      if (str.startsWith('["')) {
        const a = JSON.parse(str)
        return a.join(' ')
      }
      return str
    },
  
    processMeta: (obj) => {
      if (!Array.isArray(obj) || obj.length !== obj.filter(s => typeof s === 'string' && s.match(/^\d+ /)).length) {
        return false
      }
  
      return {type: 'BLIZZHUD', game: 'tww', name: 'Blizz HUD Config', categories: []}
    }
  }
