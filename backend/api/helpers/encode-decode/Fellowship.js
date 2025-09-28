const zlib = require('zlib')
const losslessJSON = require("lossless-json")



module.exports = {
    typeMatch: /^FELLOWSHIP-UI$/i,
    domain: ENUM.DOMAIN.FELLOWSHIP,
  
    decode: async (encodedString) => {
      // test that string matches expected regex
      if (!encodedString.match(/^[-A-Za-z0-9+/]*={0,3}$/)) {
        return false
      }
      try {
        const raw = Buffer.from(encodedString, "base64")
        const header = raw.slice(0, 16)
        const payload = raw.slice(16)
        
        const decompressed = zlib.inflateSync(payload)
        const shifted = Buffer.from(decompressed.map(b => b + 1))
        const jsonStr = shifted.toString("utf8")
        const obj = losslessJSON.parse(jsonStr)

        obj.vheader = header.toString("base64")
        return obj
      }
      catch (e) {
        return false
      }
    },
  
    encodeRaw: async (jsonStr) => {
      const obj = losslessJSON.parse(jsonStr)
      const header = Buffer.from(obj.vheader, "base64")
      delete obj.vheader
      
      const updatedStr = losslessJSON.stringify(obj)    
      const jsonBuffer = Buffer.from(updatedStr, "utf8");
      const shifted = Buffer.from(jsonBuffer.map(b => b - 1));
      const recompressed = zlib.deflateSync(shifted);
      const raw = Buffer.concat([header, recompressed]);
      return raw.toString("base64");
    },
  
    processMeta: (obj) => {
      if (!obj?.elementCanvasPositions || !obj?.elementCanvasAnchors) {
        return false
      }
      const meta = {}
  
      meta.name = 'Fellowship Profile'
      meta.type = 'FELLOWSHIP-UI'
      meta.game = 'fellowship'
  
      return meta
    },
  
    // addWagoData: (code, wago) => {
    //   if (!code.json) {
    //     return
    //   }
  
    //   return {code}
    // }
  }
  