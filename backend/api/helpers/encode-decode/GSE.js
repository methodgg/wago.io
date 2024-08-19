module.exports = {
    typeMatch: /^GSE$/i,
    domain: ENUM.DOMAIN.WOW,
  
    decode: async (rawString, exec) => {
      // test that string matches expected regex
      let str = rawString.match(/```\s?([a-zA-Z0-9\(\)]+)\s```/)
      let encodedString
      if (str && str[1]) {
        encodedString = str[1]
      }
      else {
        str = rawString.match(/^[a-zA-Z0-9\(\)]+$/)
        if (str) {
            encodedString = str[0]
        }
      }
      if (!encodedString) {
        return false
      }
      const lua = createLuaDecode(encodedString)
      try {
        const obj = JSON.parse(await exec(lua))
        if (obj.type === 'COLLECTION') {
            for (const type of ['Sequences', 'Macros', 'Variables']) {
                for (const [key, value] of Object.entries(obj.payload[type])) {
                    if (typeof value === 'string' && value.match(/^[a-zA-Z0-9\(\)]+$/)) {
                        obj.payload[type][key] = JSON.parse(await exec(createLuaDecode(value)))                        
                    }
                }
            }
        }
        return obj
      }
      catch (e){
        console.log(e)
        return false
      }
    },
  
    encode: async (json, exec) => {
      const lua = `
      ${gseLua}
      local t = JSON:decode("${json}")
      return gse_encodeB64(LibCompress:Compress(Serializer:Serialize(t), {level = 9}))`
      try {
        let encodedString = await exec(lua)
        return encodedString
      }
      catch (e) {
        return false
      }
    },
  
    processMeta: (obj, importString) => {
        const meta = { type: 'GSE', categories: [] }
        if (Array.isArray(obj) && obj[1]?.MetaData?.Name && obj[1]?.MetaData?.GSEVersion) {
            meta.name = 'GSE Sequence: ' +obj[1].MetaData.Name
            meta.categories.push('gse1')
        }
        else if (obj && obj.name && obj.objectType === 'MACRO') {
            meta.name = 'GSE Macro: ' + obj.name
            meta.categories.push('gse2')
        }
        else if (obj && obj.name && obj.objectType === 'VARIABLE') {
            meta.name = 'GSE Variable: ' +obj.name
            meta.categories.push('gse3')
        }
        else if (obj && obj.payload && obj.type === 'COLLECTION') {
            meta.name = 'GSE Collection'
            meta.categories.push('gse4')
        }
        else {
            return false
        }
        return meta
      },
  
    addWagoData: (code, wago) => {
        if (!code.json) {
            return
        }
        const obj = JSON.parse(code.json)
        let sysCat
    
        if (obj.objectType === 'MACRO') {
            sysCat = 'gse2' 
        }
        else if (obj.objectType === 'VARIABLE') {
            sysCat = 'gse3'
        }
        else if (obj.objectType === 'COLLECTION') {
            sysCat = 'gse4'
        }
        else if (Array.isArray(obj)) {
            sysCat = 'gse1'
        }
    
        if (sysCat && wago.categories.indexOf(sysCat) < 0) {
            wago.categories.push(sysCat)
        }
      
        return { wago }
    }
}
  

const gseLua = `
function gse_decodeB64(str)
    local bit8 = decodeB64Table
    local decoded_size = 0
    local ch
    local i = 1
    local bitfield_len = 0
    local bitfield = 0
    local l = #str
    while true do
        if bitfield_len >= 8 then
            decoded_size = decoded_size + 1
            bit8[decoded_size] = string.char(bit.band(bitfield, 255))
            bitfield = bit.rshift(bitfield, 8)
            bitfield_len = bitfield_len - 8
        end
        ch = B64tobyte[str:sub(i, i)]
        bitfield = bitfield + bit.lshift(ch or 0, bitfield_len)
        bitfield_len = bitfield_len + 6
        if i > l then
            break
        end
        i = i + 1
    end
    return table.concat(bit8, "", 1, decoded_size)
end

function gse_encodeB64(str)
    local B64 = encodeB64Table
    local remainder = 0
    local remainder_length = 0
    local encoded_size = 0
    local l = #str
    local code
    for i = 1, l do
        code = string.byte(str, i)
        remainder = remainder + bit.lshift(code, remainder_length)
        remainder_length = remainder_length + 8
        while (remainder_length) >= 6 do
            encoded_size = encoded_size + 1
            B64[encoded_size] = bytetoB64[bit.band(remainder, 63)]
            remainder = bit.rshift(remainder, 6)
            remainder_length = remainder_length - 6
        end
    end
    if remainder_length > 0 then
        encoded_size = encoded_size + 1
        B64[encoded_size] = bytetoB64[remainder]
    end
    return table.concat(B64, "", 1, encoded_size)
end

`

function createLuaDecode (encodedString) {
    return `
        ${gseLua}
        local encoded = "${encodedString}"
        local success, deserialized = Serializer:Deserialize(LibCompress:Decompress(gse_decodeB64(encoded)))
        return JSON:encode(deserialized)
      `
}

