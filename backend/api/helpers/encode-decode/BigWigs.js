module.exports = {
    typeMatch: /^BIGWIGS$/i,
    domain: ENUM.DOMAIN.WOW,
  
    decode: async (encodedString, exec) => {
      // test that string matches expected regex
      if (!encodedString.match(/^BW1:[a-zA-Z0-9\(\)]*$/)) {
        return false
      }
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
        console.log(json)
        return JSON.parse(json)
      }
      catch {
        return false
      }
    },
  
    encode: async (json, exec) => {
        const lua = `
        local sharingVersion = "BW1"
        local t = JSON:decode("${json}")
        
        local serialized = LibSerialize:Serialize(exportOptions)
        local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
        local compressedForPrint = LibDeflate:EncodeForPrint(compressed)
        return sharingVersion..":"..compressedForPrint`
      try {
        let encodedString = await exec(lua)
        return encodedString
      }
      catch (e) {
        return false
      }
    },
  
    processMeta: (obj) => {
      if (!obj || typeof obj.version !== 'string'  || !obj.version.match(/^BW\d+$/)) {
        return false
      }
      let meta = {}
  
      meta.name = 'BigWigs Profile'
      meta.type = 'BIGWIGS'
  
      return meta
    }
  }
  