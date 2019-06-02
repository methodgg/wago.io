const config = require('../../config')
const querystring = require('querystring')
const async = require('async')
const mdtWeekReset = 670


// where region is NA, EU, KR, TW or CN
function getHost (region) {
  switch (region.toUpperCase()) {
    case 'NA':
      return 'https://us.api.blizzard.com'
    case 'EU':
      return 'https://eu.api.blizzard.com'
    case 'KR':
      return 'https://kr.api.blizzard.com'
    case 'TW':
      return 'https://tw.api.blizzard.com'
    case 'CN':
      return 'https://gateway.battlenet.com.cn'
    default:
      return 'https://us.api.blizzard.com'
  }
}

// TODO: Keep token in memory with expiry
async function getToken (region) {
  if (region === 'CN') {
    tokenURL = 'https://www.battlenet.com.cn/oauth/token'
  }
  else {
    tokenURL = 'https://us.battle.net/oauth/token'
  }
  try {
    const response = await axios.post(tokenURL, querystring.stringify({
      grant_type: 'client_credentials'
    }), {
      auth: {
        username: config.auth.battlenet.clientID,
        password: config.auth.battlenet.clientSecret
      }
    })

    if (response && response.data && response.data.access_token) {
      return response.data.access_token
    }
    else {
      return false
    }
  }
  catch (e) {
    console.log('ERR BNET TOKEN', region, e.message)
    return false
  }
}

function getAPI (region, endpoint, token) {
  var namespace = 'dynamic-' + region.toLowerCase()
  if (namespace === 'dynamic-na') {
    namespace = 'dynamic-us'
  }
  if (endpoint.match(/\?/)) {
    endpoint = endpoint + '&namespace=' + namespace
  }
  else {
    endpoint = endpoint + '?namespace=' + namespace
  }
  return axios.get(getHost(region) + endpoint, {
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
}

async function updateMDTWeek(region, token) {
  const result = await getAPI(region, '/data/wow/mythic-keystone/period/index', token)
  var week = (result.data.current_period.id - mdtWeekReset) % 12
  if (!week) week = 12
  SiteData.findByIdAndUpdate('mdtWeek' + region, {value: week}, {upsert: true}).exec()
}

module.exports = {
  updateMDTWeeks: async (region) => {
    const token = await getToken()
    await updateMDTWeek('NA', token)
    await updateMDTWeek('EU', token)
    await updateMDTWeek('KR', token)
    await updateMDTWeek('TW', token)

    // const tokenCN = await getToken('CN')
    // await updateMDTWeek('CN', tokenCN)
  },

  lookupSpell: async (spellID, locale) => {
    if (!locale) {
      locale = 'en_US'
    }
    var spellLookup = `spell/${spellID}`
    const doc = await BlizzData.findOne({_id: spellLookup, locale: locale}).exec()
    if (doc && doc.value) {
      return doc.value
    }
    const token = await getToken()
    var result = await getAPI('NA', '/wow/' + spellLookup, token)
    try {
      // icon file search disabled until updated to use s3
      // blizz API gives lowercase icon name, so find the actual case-sensitive filename
      // const regex = new RegExp('^' + result.data.icon + '\.png$', 'i')
      // const files = await fs.readdir('/nfs/media/wow-ui-textures/ICONS')
      // for (let i = 0; i < files.length; i++) {
      //   if (files[i].match(regex)) {
      //     result.data.iconFile = files[i]
      //     BlizzData.findOneAndUpdate({_id: spellLookup, locale: locale}, {_id: spellLookup, locale: locale, value: result.data}, {upsert: true}).exec()
      //     return result.data
      //   }
      // }
      BlizzData.findOneAndUpdate({_id: spellLookup, locale: locale}, {_id: spellLookup, locale: locale, value: result.data}, {upsert: true}).exec()
      return result.data
    }
    catch (e) {
      console.log('ERR BNET SPELL ID', spellID, e.message)
      return {}
    }
  },

  searchSpell: async (text, locale) => {
    if (!locale) {
      locale = 'en_US'
    }
    const doc = await BlizzData.findOne({$or: [{'value.name': {$regex: new RegExp('^' + text + '$', 'i')}}, {'value.icon': {$regex: new RegExp('^' + text + '$', 'i')}}], locale: locale})
    if (doc && doc.value) {
      return doc.value
    }
    try {
      return {error: 'not found'}
      // icon file search disabled until updated to use s3
      const files = await fs.readdir('/nfs/media/wow-ui-textures/ICONS')
      const regex = new RegExp('^' + text + '\.png$', 'i')
      for (let i = 0; i < files.length; i++) {
        if (files[i].match(regex)) {
          return {id: -1, icon: text, iconFile: files[i]}
        }
      }
      return {error: 'not found'}
    }
    catch (e) {
      console.log('ERR BNET SEARCH SPELL', text, e.message)
      return {error: 'not found'}
    }
  },

  lookupGuild: async (region, realm, guildname) => {
    const token = await getToken()
    try {
      const guild = await getAPI(region, `/wow/guild/${realm}/${guildname}?fields=members`, token)
      return guild.data
    }
    catch (e) {
      if (e.response && e.response.status === 404) {
        return {error: "NOGUILD"}
      }
      return {}
    }
  },

  lookupCharacter: async (region, realm, name) => {
    const token = await getToken()
    try {
      const char = await getAPI(region, `/wow/character/${realm}/${name}?fields=guild`, token)
      console.log(char.data.name)
      return char.data
    }
    catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('NOCHAR')
        return {error: "NOCHAR"}
      }
      return {}
    }
  }
}