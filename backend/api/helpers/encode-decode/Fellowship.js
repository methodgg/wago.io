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
        const shifted = [...Buffer.from(decompressed)].map(b => {
          if (b >= 0x1f) return String.fromCharCode(b+1);
          return `$0x${b.toString(16).padStart(2,'0')}$`;
        }).join('');

        const jsonStr = shifted.toString("latin1")
        
        const obj = losslessJSON.parse(jsonStr)

        obj.vheader = header.toString("base64")
        return obj
      }
      catch (e) {
        console.log(e)
        return false
      }
    },
  
    encodeRaw: async (jsonStr) => {
      const obj = losslessJSON.parse(jsonStr)
      const header = Buffer.from(obj.vheader, "base64")
      delete obj.vheader
      
      const updatedStr = losslessJSON.stringify(obj).replace(/\$0x([0-9A-F]{2})\$/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      const jsonBuffer = Buffer.from(updatedStr, 'latin1');
      const shifted = Buffer.from(jsonBuffer.map(b => {
        if (b >= 0x20) return b - 1
        // console.log('invalid value back', b)
        return b
      }))
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
  