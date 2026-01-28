const blizzEncoding = require('../blizzEncoding')

module.exports = {
    typeMatch: /^BIGWIGS$/i,
    domain: ENUM.DOMAIN.WOW,
  
    decode: async (encodedString, exec) => {
      // test that string matches expected regex
      const content = encodedString.match(/^(BW2|BWIS1):([a-zA-Z0-9+=\/]+)$/)
      if (content?.[2]) {
          try {
              const obj = await blizzEncoding.standardDecode(content[2])
              return obj
          }
          catch (e){console.log(e)}
      }

      if (encodedString.match(/^BW1:[a-zA-Z0-9\(\)]*$/)) {
        const lua = `
          local sharingVersion = "BW1"
          local encoded = "${encodedString}"

          local versionPlain, importData = encoded:match("^(%w+):(.+)$")
          if versionPlain ~= sharingVersion then return end
          local decodedForPrint = LibDeflate:DecodeForPrint(importData)
          if not decodedForPrint then return end
          local decompressed = LibDeflate:DecompressDeflate(decodedForPrint)
          if not decompressed then return end
          local success, data = LibSerialize:Deserialize(decompressed)
          if not success or not data.version or data.version ~= sharingVersion then return end
          return JSON:encode(data)
        `
        try {
          let json = await exec(lua)
          return JSON.parse(json)
        }
        catch(e) {
          return false
        }
      }

      return false
    },
  
    encodeRaw: async (json, exec) => {
      try {
          const obj = JSON.parse(json)
          const prefix = obj.zone ? 'BWIS1:' : 'BW2:'
          return prefix + await blizzEncoding.standardEncode(obj)
      }
      catch (e) {
        return false
      }
    },
  
    processMeta: (obj, encString) => {
      const meta = {}
      meta.type = 'BIGWIGS'

      if (encString.startsWith('BW2:')) {
        meta.name = 'BigWigs Profile'
      }
      else if (encString.startsWith('BWIS1:')) {
        meta.name = 'BigWigs Instance Settings'
        // obj.zone field - can be either 2 numbers, positive for an instance ID, negative for a mapArtID (the world map)
        // https://wago.tools/db2/Map (positive) 
        // https://wago.tools/db2/UiMap (negative)
      }

      return meta
    }
}
