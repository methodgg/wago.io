const util = require('util');
const zlib = require('zlib');
const inflate = util.promisify(zlib.inflateRaw)
const deflate = util.promisify(zlib.deflateRaw)

module.exports = {
  typeMatch: /^DELVUI$/,
  domain: ENUM.DOMAIN.FF14,

  decode: async (encodedString) => {
    if (!encodedString.match(/^(?=(.{4})*$)[A-Za-z0-9+/]*={0,2}$/)) {
      return false
    }
    try {
      let decoded = (await inflate(Buffer.from(encodedString, 'base64'))).toString()
      if (decoded.charCodeAt(0) === 0xFEFF) {
        return JSON.parse(decoded.substr(1)) // remove BOM
      }
      else {
        return JSON.parse(decoded)
      }
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  encodeRaw: async (jsonString) => {
    try {
      return (await deflate('\uFEFF' + jsonString)).toString('base64')
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  processMeta: (obj) => {
    let meta = {type: 'DELVUI', categories: []}
    // Return false if the object does not match the structure or missing key data fields; the import will not be allowed for this addon.
    if (obj && obj.$type) {
      let job = getJob(obj.$type)
      if (!job) {
        return false
      }
      meta.categories.push('delvui2')
      meta.categories.push(`job-${job.id.toLowerCase()}`)
      meta.name = `DelvUI ${job.name} Job Pack`
    }

    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      console.log('no json')
      return false
    }
    let json = JSON.parse(code.json)
    let job = getJob(json.$type)
    if (job && wago.categories.indexOf(`job-${job.id.toLowerCase()}`) < 0) {
      wago.categories.push('delvui2')
      wago.categories.push(`job-${job.id.toLowerCase()}`)
    }
    else if (json.PlayerBuffListConfig && json.PlayerDebuffListConfig && json.TargetBuffListConfig && json.TargetDebuffListConfig) {
      wago.categories.push('delvui1')
    }
    return {wago}
  }
}

function getJob(type) {
  if (typeof type !== 'string') {
    return false
  }
  let m = type.match(/^DelvUI\.Interface\.(Astrologian|Bard|BlackMage|Dancer|DarkKnight|Dragoon|Gunbreaker|Machinist|Monk|Ninja|Paladin|RedMage|Samurai|Scholar|Summoner|Warrior|WhiteMage)HudConfig,/)
  if (!m) {
    return false
  }
  else if (m[1] === 'Astrologian') {
    return {id: 'AST', name: m[1]}
  }
  else if (m[1] === 'Bard') {
    return {id: 'BRD', name: m[1]}
  }
  else if (m[1] === 'BlackMage') {
    return {id: 'BLM', name: 'Black Mage'}
  }
  else if (m[1] === 'BlueMage') {
    return {id: 'BLU', name: 'Blue Mage'}
  }
  else if (m[1] === 'Dancer') {
    return {id: 'DNC', name: m[1]}
  }
  else if (m[1] === 'DarkKnight') {
    return {id: 'DRK', name: 'Dark Knight'}
  }
  else if (m[1] === 'Dragoon') {
    return {id: 'DRG', name: m[1]}
  }
  else if (m[1] === 'Gunbreaker') {
    return {id: 'GNB', name: m[1]}
  }
  else if (m[1] === 'Machinist') {
    return {id: 'MCH', name: m[1]}
  }
  else if (m[1] === 'Monk') {
    return {id: 'MNK', name: m[1]}
  }
  else if (m[1] === 'Ninja') {
    return {id: 'NIN', name: m[1]}
  }
  else if (m[1] === 'Paladin') {
    return {id: 'PLD', name: m[1]}
  }
  else if (m[1] === 'RedMage') {
    return {id: 'RDM', name: 'Red Mage'}
  }
  else if (m[1] === 'Samurai') {
    return {id: 'SAM', name: m[1]}
  }
  else if (m[1] === 'Scholar') {
    return {id: 'SCH', name: m[1]}
  }
  else if (m[1] === 'Summoner') {
    return {id: 'SMN', name: m[1]}
  }
  else if (m[1] === 'Warrior') {
    return {id: 'WAR', name: m[1]}
  }
  else if (m[1] === 'WhiteMage') {
    return {id: 'WHM', name: 'White Mage'}
  }
}