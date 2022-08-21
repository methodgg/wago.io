const config = require('../../config')
const querystring = require('querystring')
const WoWChar = require('../models/WoWChar')
const mdtWeekReset = 648
const tmpDir = __dirname + '/../../run-tmp'
const s3 = require('../helpers/s3Client')

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

function getSlug (str) {
  return encodeURI((str || '').toLowerCase().replace(/'/g, '').replace(/\s/g, '-'))
}


async function getToken (region) {
  let token = await redis.get('BattleNetClientToken')
  if (token) {
    return token
  }
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
      if (response.data.expires_in > 3600) { // should usually be 86399 (just over 24 hours)
        await redis.set('BattleNetClientToken', response.data.access_token, 'EX', response.data.expires_in - 300)
      }
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
  if (endpoint.match(/^\/(profile|data\/wow\/guild)/)) {
    namespace = namespace.replace(/dynamic/, 'profile')
  }
  endpoint = endpoint.toLowerCase()
  if (endpoint.match(/\?/)) {
    endpoint = endpoint + '&namespace=' + namespace
  }
  else {
    endpoint = endpoint + '?namespace=' + namespace
  }
  switch (region) {
    case 'eu':
      endpoint = endpoint + '&locale=en_GB'
      break
    case 'kr':
      endpoint = endpoint + '&locale=ko_KR'
      break
    case 'tw':
      endpoint = endpoint + '&locale=zh_TW'
      break
    case 'cn':
      endpoint = endpoint + '&locale=zh_CN'
      break
    default:
      endpoint = endpoint + '&locale=en_US'
      break
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
  redis.set('static:mdtWeek' + region, week)
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
    // const url = `/wow/guild/${encodeURI(realm)}/${encodeURI(guildname)}?fields=members`
    const url = `/data/wow/guild/${getSlug(realm)}/${getSlug(guildname)}/roster`
    const cached = await BlizzData.findOne({_id: region + '-' + url})
    if (cached) {
      return cached.value
    }
    const token = await getToken()
    try {
      const guild = await getAPI(region, url, token)
      await BlizzData.create({_id: region + '-' + url, value: guild.data, expires_at: new Date((new Date()).getTime() + 10 * 60000)})
      return guild.data
    }
    catch (e) {
      if (e.response && (e.response.status === 404 || e.response.status === 403)) {
        return {error: "NOGUILD"}
      }
      return {}
    }
  },

  lookupCharacter: async (region, realm, name, user) => {
    const url = `/profile/wow/character/${getSlug(realm)}/${getSlug(name)}`
    const token = await getToken()
    try {
      var char = await WoWChar.find({region, realm, name}).exec()
      if (char && char.updated > Date.now() - 3600000 * 48) {
        return char
      }
      const summary = (await getAPI(region, url, token)).data
      if (!summary || !summary.id) {
        return {}
      }
      var char = await WoWChar.findOne({region, realm, name}).exec()
      if (!char) {
        char = new WoWChar({bnetID: summary.id, region, realm, realmSlug: summary.realm.slug, name})
      }
      else if (!char.bnetID !== summary.id) {
        if (summary.id) {
          await WoWChar.findOneAndDelete({bnetID: summary.id})
        }
        char = new WoWChar({bnetID: summary.id, region, realm, realmSlug: summary.realm.slug, name})
      }

      if (user && user._id) {
        char._userId = user._id
        if (summary.level >= 50 && !user.account.verified_human) {
          user.account.verified_human = true
          await user.save()
        }
      }

      if (summary.guild && summary.guild.name) {
        char.guild = summary.guild.name
        char.guildRealm = summary.guild.realm.name
        char.guildRealmSlug = summary.guild.realm.slug
      }

      if (!char.bnetUpdate || char.bnetUpdate < summary.last_login_timestamp) {
        const imageURL = `https://render-${region}.worldofwarcraft.com/character/${summary.realm.slug}/${summary.id % 256}/${summary.id}-inset.jpg`
        const arraybuffer = await axios.request({
          responseType: 'arraybuffer',
          url: imageURL,
          method: 'get'
        })
        if (char.mediaTimestamp) {
          s3.delete({
            Bucket: 'wago-media',
            Key: `wowchar/${summary.id}/${char.mediaTimestamp}.jpg`
          })
        }
        let time = Date.now()
        await fs.writeFile(`${tmpDir}/w-${time}.jpg`, arraybuffer)
        await s3.uploadFile({
          localFile: `${tmpDir}/w-${time}.jpg`,
          s3Params: {
            Bucket: 'wago-media',
            Key: `wowchar/${summary.id}/${time}.jpg`
          }
        })
        char.mediaTimestamp = time
        fs.unlink(`${tmpDir}/w-${time}.jpg`)
      }
      char.bnetUpdate = summary.last_login_timestamp
      char.class = summary.character_class.id
      char.faction = summary.faction.type
      char.race = summary.race.id
      char.achievements.points = summary.achievement_points
      await char.save()

      return char
    }
    catch (e) {
      if (e.response && (e.response.status === 404 || e.response.status === 403)) {
        if (e.response.status === 404) {
          // console.log('not found', region, realm, name)
          await WoWChar.findOneAndDelete({region, realm, name}).exec()
        }
        return {error: "NOCHAR"}
      }
      // console.log(url, e)
      return {}
    }
  },

  lookupCharacterStatus: async (region, realm, name) => {
    if (!realm) {
      return {}
    }
    const url = `/profile/wow/character/${getSlug(realm)}/${getSlug(name)}/status`
    const token = await getToken()
    try {
      const char = await getAPI(region, url, token)
      await BlizzData.create({_id: region + '-' + url, value: char.data, expires_at: new Date((new Date()).getTime() + 10 * 60000)})
      return char.data
    }
    catch (e) {
      if (e.response && (e.response.status === 404 || e.response.status === 403)) {
        return {error: "NOCHAR"}
      }
      return {}
    }
  }
}