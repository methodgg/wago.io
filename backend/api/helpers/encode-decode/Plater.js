module.exports = {
  typeMatch: /^PLATER$/,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^[a-zA-Z0-9\(\)]*$/)) {
      return false
    }
    const lua = `
      local str = "${encodedString}"
      local decoded = LibDeflate:DecodeForPrint(str)
      local decompressed = LibDeflate:DecompressDeflate(decoded)
      if not(decompressed) then
        return ''
      end

      local success, deserialized = Serializer:Deserialize(decompressed)
      if not(success) then
        return ''
      end
      return JSON:encode(deserialized)
    `
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (json, exec) => {
    const lua = `
    local t = JSON:decode("${json}")
    if not t then return "" end

    local serialized = Serializer:Serialize(t)
    local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
    local encoded = LibDeflate:EncodeForPrint(compressed)
    return encoded`
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    var meta = {categories: []}
    if (!obj) {
      return false
    }

    meta.type = 'PLATER'

    if (obj.tocversion) {
      if ((obj.tocversion+'').match(/^113/)) {
        meta.game = 'classic'
      }
      else if ((obj.tocversion+'').match(/^20/)) {
        meta.game = 'tbc'
      }
      else if ((obj.tocversion+'').match(/^80/)) {
        meta.game = 'bfa'
      }
      else if ((obj.tocversion+'').match(/^90/)) {
        meta.game = 'sl'
      }
    }

    if (obj.url) {
      let m = obj.url.match(/https:\/\/wago.io\/([^\/]+)\//)
      if (m && m[1]) {
        meta.fork = m[1]
      }
    }

    if (Array.isArray(obj)) {
      // if old format script
      if (typeof obj[8] === 'number' && typeof obj[1] === 'string') {
        meta.name = obj[1]
        meta.description = obj[5]
      }
      // if old format hook/mod
      else if (typeof obj[8] === 'object' && typeof obj[0] === 'string') {
        meta.name = obj[0]
        meta.description = obj[2]
      }
      // if old format animation
      else if (typeof obj[0] === 'object' && typeof obj[1] === 'object' && obj[0].animation_type && obj[0].duration && obj[1].animation_type && obj[1].duration) {
        meta.name = 'Plater Animation'
      }
    }
    else if (obj.OptionsPanelDB && obj.OptionsPanelDB.PlaterOptionsPanelFrame) {
      meta.name = 'Plater Profile'
    }
    else if (obj.NpcColor && obj['1'] && obj['1'][0] && typeof obj['1'][0] === 'number' && obj['1'][2] && typeof obj['1'][2] === 'string') {
      meta.name = 'Plater NPC Colors'
    }
    else if (typeof obj['1'] === 'object' && typeof obj['2'] === 'object' && obj['1'].animation_type && obj['1'].duration && obj['2'].animation_type && obj['2'].duration) {
      meta.name = 'Plater Animation'
    }
    else if (obj.type === 'script') {
      meta.name = obj['2']
      meta.description = obj['6']
    }
    else if (obj.type === 'hook') {
      meta.name = obj['1']
      meta.description = obj['3']
    }
    
    if (!meta.description && obj.info && obj.info.desc) {
      meta.description = obj.info.desc
    }

    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      return
    }
    let json = JSON.parse(code.json)
    
    if (Array.isArray(json)) {
      var tbl = {}
      json.forEach((v, k) => {
        tbl[''+(k+1)] = v
      })
      json = tbl
    }

    let sysCat
    if (json.OptionsPanelDB && json.OptionsPanelDB.PlaterOptionsPanelFrame) {
      sysCat = 'plater1'
    }
    else if (json.NpcColor && json['1'] && json['1'][0] && typeof json['1'][0] === 'number' && json['1'][2] && typeof json['1'][2] === 'string') {
      sysCat = 'plater5'
    }
    else if (typeof json['1'] === 'object' && typeof json['2'] === 'object' && json['1'].animation_type && json['1'].duration && json['2'].animation_type && json['2'].duration) {
      sysCat = 'plater4'
    }
    else if (json.type === 'script') {
      sysCat = 'plater2'
    }
    else if (json.type === 'hook') {
      sysCat = 'plater3'
    }
    
    json.url = wago.url + '/' + code.version
    json.version = code.version
    json.semver = code.versionString
      
    json = sortJSON(json) // sort by key so that we can diff the full table
    code.json = JSON.stringify(json)

    // category setup
    if (wago.categories.indexOf('plater0') < 0) {
      wago.categories.push('plater0')
      if (sysCat) {
        wago.categories.push(sysCat)
      }
      return {code, wago}
    }
    return {code}
  }
}

function sortJSON(obj) {
  // if a regular array then its already sorted but still sort any child objects
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] == 'object') {
        obj[i] = sortJSON(obj[i])
      }
    }
    return obj
  }

  // sort object as expected
  var sorted = {}
  var keys
  keys = Object.keys(obj)
  keys.sort(function(key1, key2) {
    if(key1 < key2) return -1
    if(key1 > key2) return 1
    return 0
  })

  for (var i in keys) {
    var key = keys[i]
    if (obj[key] && typeof obj[key] == 'object') {
      sorted[key] = sortJSON(obj[key])
    } else {
      sorted[key] = obj[key]
    }
  }

  return sorted
}