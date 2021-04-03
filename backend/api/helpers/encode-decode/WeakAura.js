module.exports = {
  typeMatch: /^(CLASSIC-|TBC-)?WEAKAURA$/i,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^!?(WA:2!)?[a-zA-Z0-9\(\)]*$/)) {
      return false
    }
    const lua = `
      local str = "${encodedString}"
      local _, _, encodeVersion, encoded = str:find("^(!WA:%d+!)(.+)$")
      if encodeVersion then 
        encodeVersion = tonumber(encodeVersion:match("%d+"))
      else
        encoded, encodeVersion = str:gsub("^%!", "")
      end

      local decoded
      if encodeVersion > 0 then
        decoded = LibDeflate:DecodeForPrint(encoded)
      else
        decoded = decodeB64(encoded)
      end

      local decompressed, errorMsg = nil, "unknown compression method"
      if encodeVersion > 0 then
        decompressed = LibDeflate:DecompressDeflate(decoded)
      else
        decompressed, errorMsg = Compresser:Decompress(decoded)
      end

      if not(decompressed) then
        return ''        
      end

      local success, deserialized
      if encodeVersion < 2 then
        success, deserialized = Serializer:Deserialize(decompressed)
      else
        success, deserialized = LibSerialize:Deserialize(decompressed)
      end
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
    if not t or not t.d then return "" end

    local n -- fix trigger tables (the lua-json process can break these)
    if t.d.triggers and t.d.triggers["1"] then
      n = 1
      while t.d.triggers[""..n] do
        tinsert(t.d.triggers, t.d.triggers[""..n])
        t.d.triggers[""..n] = nil
        n = n+1
      end
    end

    if t.c then
      for i=1, #t.c do
        if t.c[i].triggers and t.c[i].triggers["1"] then
          n = 1
          while t.c[i].triggers[""..n] do
            tinsert(t.c[i].triggers, t.c[i].triggers[""..n])
            t.c[i].triggers[""..n] = nil
            n = n+1
          end
        end
      end
    end

    local serialized = LibSerialize:SerializeEx({errorOnUnserializableType = false}, t)
    local compressed = LibDeflate:CompressDeflate(serialized, {level = 9})
    local encoded = "!WA:2!" .. LibDeflate:EncodeForPrint(compressed)
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
    if (!obj || !obj.d || !obj.d.id) {
      return false
    }

    meta.name = obj.d.id
    meta.type = 'WEAKAURA'

    // check for game import
    if (obj.d.tocversion) {
      if ((obj.d.tocversion+'').match(/^113/)) {
        meta.type = 'CLASSIC-WEAKAURA'
        meta.game = 'classic'
      }
      else if ((obj.d.tocversion+'').match(/^20/)) {
        meta.type = 'TBC-WEAKAURA'
        meta.game = 'tbc'
      }
      else if ((obj.d.tocversion+'').match(/^80/)) {
        meta.game = 'bfa'
      }
      else if ((obj.d.tocversion+'').match(/^90/)) {
        meta.game = 'sl'
      }
    }

    if (obj.wagoID) {
      meta.fork = obj.wagoID
    }

    // check load conditions to set default categories
    if (obj.d.load) {
      let class_id

      // if load only out of combat
      if (obj.d.load.hasOwnProperty('use_combat') && !obj.d.load.use_combat) {
        meta.categories.push('gen6')
      }

      // load requirements for class or specs
      // if any specs are selected without a class, or with multiple classes, we're just going to ignore them
      // ---
      // if single class is selected
      if (obj.d.load['class'] && obj.d.load['class'].single && obj.d.load.use_class) {
        class_id = guessCategory(obj.d.load['class'].single)
        if (class_id) {
          meta.categories.push(class_id)
          if (obj.d.load.use_spec && obj.d.load['spec'] && obj.d.load['spec'].single)
          meta.categories.push(class_id+'-'+obj.d.load['spec'].single)
          else if (obj.d.load.use_spec && load['spec'] && obj.d.load['spec'].multi.length>0) {
            for (let i=0; i<obj.d.load['spec'].multi.length; i++) {
              if (obj.d.load['spec'].multi[i]) {
                meta.categories.push(class_id+'-'+i)
              }
            }
          }
        }
      }

      // if multi-select class is used
      else if (obj.d.load.use_class && obj.d.load['class'] && obj.d.load['class'].multi && obj.d.load.use_class === false) {
        let list = []
        for (let classKey in obj.d.load['class'].multi) {
          if (!obj.d.load['class'].multi.hasOwnProperty(classKey)) {
            continue
          }

          if (obj.d.load['class'].multi[classKey]) {
              class_id = guessCategory(classKey)
              if (class_id) {
                meta.categories.push(class_id)
                list.push(class_id)
              }
          }
        }
        // if only one class is selected we can still check for specs
        if (list.length==1) {
          if (obj.d.load.use_spec && obj.d.load['spec'] && obj.d.load['spec'].single)
          meta.categories.push(class_id+'-'+obj.d.load['spec'].single)
          else if (obj.d.load.use_spec && obj.d.load['spec'] && obj.d.load['spec'].multi.length>0) {
            for (let i=0; i<obj.d.load['spec'].multi.length; i++) {
              if (obj.d.load['spec'].multi[i]) {
                meta.categories.push(class_id+'-'+i)
              }
            }
          }
        }
      }

      // load requirements for encounter id
      if (obj.d.load.use_encounterid && obj.d.load.encounterid>0) {
        let raid = guessCategory(parseInt(obj.d.load.encounterid))
        if (raid && raid.indexOf('raiden')==0)
          meta.categories.push('raiden')
        else if (raid && raid.indexOf('raidnh')==0)
          meta.categories.push('raidnh')
        else if (raid && raid.indexOf('raidtov')==0)
          meta.categories.push('raidtov')
        else if (raid && raid.indexOf('raidtomb')==0)
          meta.categories.push('raidtomb')
        else if (raid && raid.indexOf('raidantorus')==0)
          meta.categories.push('raidantorus')
        else if (raid && raid.indexOf('raiduldir')==0)
          meta.categories.push('raiduldir')
        else if (raid && raid.indexOf('raidzuldazar')==0)
          meta.categories.push('raidzuldazar')
        else if (raid && raid.indexOf('raidcrucible')==0)
          meta.categories.push('raidcrucible')

        if (raid) {
          meta.categories.push(raid)
        }
      }
    }
    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      return
    }
    let json = JSON.parse(code.json)
    try {
      wago.regionType = json.d.regionType

      json.wagoID = wago._id
      json.d.url = wago.url + '/' + code.version
      json.d.version = code.version
      json.d.semver = code.versionString

      if (json.c) {
        for (let i = 0; i < json.c.length; i++) {
          json.c[i].url = wago.url + '/' + code.version
          json.c[i].version = code.version
          json.c[i].semver = code.versionString
          delete json.c[i].ignoreWagoUpdate
          delete json.c[i].skipWagoUpdate
        }
      }
      json = sortJSON(json)
      code.json = JSON.stringify(json)
      return {code, wago}
    }
    catch (e) {
      console.log(e)
      return
    }
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

function guessCategory(key) {
  switch (key) {
    // Classes
    case 'DEATHKNIGHT': return 'cl6'
    case 'DEMONHUNTER': return 'cl12'
    case 'DRUID': return 'cl11'
    case 'HUNTER': return 'cl3'
    case 'MAGE': return 'cl8'
    case 'MONK': return 'cl10'
    case 'PALADIN': return 'cl2'
    case 'PRIEST': return 'cl5'
    case 'ROGUE': return 'cl4'
    case 'SHAMAN': return 'cl7'
    case 'WARLOCK': return 'cl9'
    case 'WARRIOR': return 'cl1'

    // Encounters
    case 1853: return 'raiden1' // Nythendra
    case 1876: return 'raiden4' // Elerethe
    case 1873: return 'raiden2' // Ilgynoth
    case 1841: return 'raiden5' // Ursoc
    case 1854: return 'raiden6' // Dragons
    case 1877: return 'raiden7' // Cenarius
    case 1864: return 'raiden8' // Xavius

    case 1849: return 'raidnh1' // Skorpyron
    case 1865: return 'raidnh2' // Chronomatic Anomaly
    case 1867: return 'raidnh3' // Trilliax
    case 1871: return 'raidnh4' // Spellblade Aluriel
    case 1862: return 'raidnh5' // Tichondrius
    case 1842: return 'raidnh6' // Krosus
    case 1886: return 'raidnh7' // High Botanist
    case 1863: return 'raidnh8' // Star Augur
    case 1872: return 'raidnh9' // Elisande
    case 1866: return 'raidnh10' // Guldan

    case 1958: return 'raidtov1' // Odyn
    case 1962: return 'raidtov2' // Guarm
    case 2008: return 'raidtov3' // Helya

    case 2032: return 'raidtomb1' // Goroth
    case 2048: return 'raidtomb2' // Demonic Inquisition
    case 2036: return 'raidtomb3' // Harjatan
    case 2037: return 'raidtomb4' // Mistress Sasszine
    case 2050: return 'raidtomb5' // Sisters of the Moon
    case 2054: return 'raidtomb6' // Desolate Host
    case 2052: return 'raidtomb7' // Maiden of Vigilance
    case 2038: return 'raidtomb8' // Fallen Avatar
    case 2051: return 'raidtomb9' // Kiljaeden

    case 2063: return 'raidantorus1' // Aggramar
    case 2064: return 'raidantorus2' // Hasabel
    case 2069: return 'raidantorus3' // Varimathras
    case 2070: return 'raidantorus4' // War Council
    case 2073: return 'raidantorus5' // Coven of Shivarra
    case 2074: return 'raidantorus6' // Hounds
    case 2075: return 'raidantorus7' // Eonar the Lifebender
    case 2076: return 'raidantorus8' // Garothi Worldbreaker
    case 2082: return 'raidantorus9' // Imonar the Soulhunter
    case 2088: return 'raidantorus10' // Kin'garoth
    case 2092: return 'raidantorus11' // Argus the Unmaker

    case 2144: return 'raiduldir1' // Taloc
    case 2141: return 'raiduldir2' // MOTHER
    case 2128: return 'raiduldir3' // Fetid
    case 2136: return 'raiduldir4' // Zek'voz
    case 2145: return 'raiduldir5' // Zul, Reborn
    case 2135: return 'raiduldir6' // Mythrax
    case 2134: return 'raiduldir7' // Vectis
    case 2122: return 'raiduldir8' // G'huun

    case 2265: return 'raidzuldazar1' // Champions
    case 2284: return 'raidzuldazar2' // Grong
    case 2263: return 'raidzuldazar2b'
    case 2285: return 'raidzuldazar3' // Jadefire Masters
    case 2266: return 'raidzuldazar3b'
    case 2276: return 'raidzuldazar4' // Mekkatorque
    case 2272: return 'raidzuldazar4b' // Rastakhan
    case 2280: return 'raidzuldazar5' // Blockade
    case 2268: return 'raidzuldazar6' // Conclave
    case 2271: return 'raidzuldazar7' // Opulance
    case 2281: return 'raidzuldazar8' // Jaina

    // TODO: update this list for shadowlands and classic/tbc

    // case 1111: return 'raidcrucible1' // Cabal
    // case 1111: return 'raidcrucible2' // Uunat
  }
  return false
}