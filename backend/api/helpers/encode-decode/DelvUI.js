const util = require('util')
const zlib = require('zlib')
const inflate = util.promisify(zlib.inflateRaw)
const deflate = util.promisify(zlib.deflateRaw)

module.exports = {
  typeMatch: /^DELVUI$/,
  domain: ENUM.DOMAIN.FF14,

  decode: async function (encodedString) {
    try {
      let profiles = []
      for (let obj of encodedString.split(/\|/g)) {
        if (!obj) {
          continue
        }
        let decoded = (await inflate(Buffer.from(obj, 'base64'))).toString()
        if (decoded.charCodeAt(0) === 0xFEFF) {
          decoded = decoded.substr(1) // remove BOM
        }
        profiles.push(JSON.parse(decoded))
      }
      return profiles
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  encodeRaw: async (jsonString) => {
    try {
      let json = JSON.parse(jsonString)
      let encoded = []
      for (let obj of json) {
        let e = await deflate('\uFEFF' + JSON.stringify(obj))
        encoded.push(e.toString('base64'))
      }
      return encoded.join('|')
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  processMeta: (obj) => {
    let meta = {type: 'DELVUI', categories: []}
    // Return false if the object does not match the structure or missing key data fields; the import will not be allowed for this addon.
    if (obj && Array.isArray(obj) && obj.length > 1 && obj[0].$type && obj[0].$type.match(/\.(\w+), DelvUI/)) {
      meta.name = 'DelvUI Profile'
      meta.categories.push('delvui1')
    }
    else if (obj.length === 1 && obj[0].$type) {
      let type = obj[0].$type.match(/\.(\w+), DelvUI/)
      if (!type) {
        return false
      }

      meta.name = type[1].replace(/([A-Z])/g, ' $1').trim()
      meta.categories.push('delvui2')
    }
    else {
      return false
    }

    return meta
  },

  /**
   * $type:
      DelvUI.Interface.GeneralElements.PlayerUnitFrameConfig
      DelvUI.Interface.GeneralElements.TargetUnitFrameConfig
      DelvUI.Interface.GeneralElements.TargetOfTargetUnitFrameConfig
      DelvUI.Interface.GeneralElements.FocusTargetUnitFrameConfig
      DelvUI.Interface.GeneralElements.PlayerCastbarConfig
      DelvUI.Interface.GeneralElements.TargetCastbarConfig
      DelvUI.Interface.GeneralElements.TargetOfTargetCastbarConfig
      DelvUI.Interface.GeneralElements.FocusTargetCastbarConfig
      DelvUI.Interface.StatusEffects.PlayerBuffsListConfig
      DelvUI.Interface.StatusEffects.PlayerDebuffsListConfig
      DelvUI.Interface.StatusEffects.TargetBuffsListConfig
      DelvUI.Interface.StatusEffects.TargetDebuffsListConfig
      DelvUI.Interface.Jobs.PaladinConfig
      ...
      DelvUI.Interface.GeneralElements.TanksColorConfig
      DelvUI.Interface.GeneralElements.HealersColorConfig
      DelvUI.Interface.GeneralElements.MeleeColorConfig
      DelvUI.Interface.GeneralElements.RangedColorConfig
      DelvUI.Interface.GeneralElements.CastersColorConfig
      DelvUI.Interface.GeneralElements.MiscColorConfig
      DelvUI.Interface.GeneralElements.PrimaryResourceConfig
      DelvUI.Helpers.TooltipsConfig
      DelvUI.Interface.GeneralElements.GCDIndicatorConfig
      DelvUI.Interface.GeneralElements.MPTickerConfig
   */

  addWagoData: (code, wago) => {
    if (!code.json) {
      return false
    }
    let json = JSON.parse(code.json)
    if (!json) {
      return false
    }
    else if (json.PlayerBuffListConfig && json.PlayerDebuffListConfig && json.TargetBuffListConfig && json.TargetDebuffListConfig) {
      wago.categories.push('delvui1')
    }
    else if (json.$type) {
      let job = getJob(json.$type)
      if (job && job.id) {
        if (job.system) {
          wago.categories.push(job.system)
        }
        else {
          wago.categories.push('delvui2')
        }
        wago.categories.push(`job-${job.id.toLowerCase()}`)
      }
    }
    else if (Array.isArray(json)) {
      wago.categories.push('delvui3')
    }
    return {wago}
  }
}

function getJob(type) {
  if (typeof type !== 'string') {
    return false
  }
  let m = type.match(/^DelvUI\.Interface\.(General|Astrologian|Bard|BlackMage|Dancer|DarkKnight|Dragoon|Gunbreaker|Machinist|Monk|Ninja|Paladin|RedMage|Samurai|Scholar|Summoner|Warrior|WhiteMage)HudConfig,/)
  if (!m) {
    return false
  }
  else if (m[1] === 'General') {
    return {system: 'delvui4', name: 'General Hud Config'}
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