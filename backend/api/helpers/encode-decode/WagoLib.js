module.exports = {
  typeMatch: /^WAGOLIB$/, // simple regex that should match your meta.type (see processMeta below)
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, execLua) => {
    if (!encodedString.match(/^Wago\.io;[\w.\-:+=^!\/*?&<>()\[\]{}@%$#]+\.\d+$/)) {
      return false
    }
    const lua = `
      local str = "${encodedString}" -- encodedString is already escaped for \\ and \"
      local _, _, encoded, stringVersion = str:find('^Wago%.io;(.+)%.(%d+)$')
      if not encoded or not stringVersion then return '' end
      stringVersion = tonumber(stringVersion)
      local encodeVersion, compressVersion, serializeVersion = 1, 1, 1
      local decoded, decompressed, deserialized

      if encodeVersion == 1 then
        decoded = decodeB85(encoded)
        if not decoded then
          return ''
        end
      end

      if compressVersion == 1 then
        decompressed = LibDeflate:DecompressDeflate(decoded)
        if not(decompressed) then
          return ''
        end
      end

      if serializeVersion == 1 then
        local success
        success, deserialized = LibSerialize:Deserialize(decompressed)
        if not success then
          return ''
        end
        if deserialized then
          return JSON:encode(deserialized)
        else
          return ''
        end
      end
    `
    try {
      let json = await execLua(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (jsonString, execLua) => {
    const lua = `
    local tbl = JSON:decode("${jsonString}")
    local serialized = LibSerialize:SerializeEx({errorOnUnserializableType = false}, tbl)
    local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
    local encodedString = encodeB85(compressed)
    return 'Wago\.io;' .. encodedString .. '.1'`
    try {
      let encodedString = await execLua(lua)
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    if (!obj || !obj.addon || !obj.data || !obj.metadata || !obj.tocversion) {
      return false
    }
    var meta = {}

    meta.type = 'WAGOLIB'

    if (obj.tocversion) {
      if (obj.tocversion >= 10000 && obj.tocversion <= 19999) {
        meta.game = 'classic'
      }
      else if (obj.tocversion >= 20000 && obj.tocversion <= 29999) {
        meta.game = 'tbc'
      }
      else if (obj.tocversion >= 90000 && obj.tocversion <= 99999) {
        meta.game = 'sl'
      }
      else {
        return false
      }
    }

    meta.name = obj.metadata.table || obj.addon
    meta.wagolibAddon = obj.addon
    meta.fork = obj.wagoID

    if (meta.wagolibAddon === 'WagoAnything') {
      meta.name = obj.metadata.table
    }

    return meta
  },

  addWagoData: (code, wago) => {
    var json = JSON.parse(code.json)
    json.metadata.wagoID = wago._id

    var meta = []
    for (field in json.metadata) {
      if (!field.match(/^(wagoID)$/)) {
        meta.push(`${field}: ${json.metadata[field]}`)
      }
    }

    // the addon should not change
    if (wago.wagolib && wago.wagolib.addon && wago.wagolib.addon !== json.addon) {
      return {invalid: `Not the same addon: ${wago.wagolib.addon} != ${json.addon}`}
    }
    else if (wago.wagolib && wago.wagolib.addon === 'WagoAnything' && json.metadata.table !== wago.wagolib.anythingTable) {
      return {invalid: `Not the same table: ${wago.wagolib.anythingTable} != ${json.metadata.table}`}
    }

    wago.wagolib = {
      addon: json.addon,
      metaData: meta
    }
    if (json.addon === 'WagoAnything') {
      wago.wagolib.anythingTable = json.metadata.table
    }
    code.json = JSON.stringify(json)
    return {code: code, wago: wago}
  }
}