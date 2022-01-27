// /data/wow/journal-expansion/index
// - expansion names
// - foreach journalExpansionId
//   - /data/wow/journal-expansion/{journalExpansionId}
//   - zone names for dungeons and raids

// /data/wow/journal-encounter/index
// - encounter names

// /data/wow/playable-class/index
// - class names
// - foreach classId
//   - /data/wow/playable-class/{classId}
//   - specialization names

// /data/wow/profession/index
// - profession names


const config = require('../config')
const axios = require('axios')
const fs = require('fs')
const locales = [
  {file: '../../frontend/static/i18n/en-US/warcraft.json', name: 'en_US'},
  {file: '../../frontend/static/i18n/de-DE/warcraft.json', name: 'de_DE'},
  {file: '../../frontend/static/i18n/es-ES/warcraft.json', name: 'es_ES'},
  {file: '../../frontend/static/i18n/fr-FR/warcraft.json', name: 'fr_FR'},
  {file: '../../frontend/static/i18n/ru-RU/warcraft.json', name: 'ru_RU'},
  {file: '../../frontend/static/i18n/zh-CN/warcraft.json', name: 'zh_CN'},
  {file: '../../frontend/static/i18n/ko-KR/warcraft.json', name: 'ko_KR'},
]

async function go () {
  try {
    const token = await getToken()
    if (!token) throw 'no token'

    for (let i = 0; i < locales.length; i++) {
      locales[i].json = JSON.parse(fs.readFileSync(locales[i].file, 'utf8'))
      locales[i].json.classes = locales[i].json.classes || {}
      locales[i].json.encounters = locales[i].json.encounters || {}
      locales[i].json.expansions = locales[i].json.expansions || {}
      locales[i].json.instances = locales[i].json.instances || {}
      locales[i].json.professions = locales[i].json.professions || {}
    }

    // ---- Get class names and specs
    // class names are stored by matching id; specs are identified by sequential order - so if the order changes then this needs to be updated
    const classes = await axios.get(`https://us.api.blizzard.com/data/wow/playable-class/index?namespace=static-us&access_token=${token}`)
    for (const c of classes.data.classes) {
      console.log(c.name.en_US)
      const char = await axios.get(`https://us.api.blizzard.com/data/wow/playable-class/${c.id}?namespace=static-us&access_token=${token}`)
      for (let i = 0; i < locales.length; i++) {
        locales[i].json.classes[c.id] = char.data.name[locales[i].name]
        let n = 1
        // NOTE: 4-2c is used for Combat rogue in classic; this isn't available on the API
        for (const spec of char.data.specializations) {
          locales[i].json.classes[`${c.id}-${n++}`] = spec.name[locales[i].name]
        }
      }
    }

    console.log('Encounters')
    const encounters = await axios.get(`https://us.api.blizzard.com/data/wow/journal-encounter/index?namespace=static-us&access_token=${token}`)
    for (const e of encounters.data.encounters) {
      for (let i = 0; i < locales.length; i++) {
        locales[i].json.encounters[e.id] = e.name[locales[i].name]
      }
    }

    console.log('Expansions')
    const expansions = await axios.get(`https://us.api.blizzard.com/data/wow/journal-expansion/index?namespace=static-us&access_token=${token}`)
    for (const x of expansions.data.tiers) {
      for (let i = 0; i < locales.length; i++) {
        locales[i].json.expansions[x.id] = x.name[locales[i].name]
      }
    }

    console.log('Instances')
    const zones = await axios.get(`https://us.api.blizzard.com/data/wow/journal-instance/index?namespace=static-us&access_token=${token}`)
    for (const z of zones.data.instances) {
      for (let i = 0; i < locales.length; i++) {
        locales[i].json.instances[z.id] = z.name[locales[i].name]
      }
    }

    console.log('Professions')
    const professions = await axios.get(`https://us.api.blizzard.com/data/wow/profession/index?namespace=static-us&access_token=${token}`)
    for (const p of professions.data.professions) {
      for (let i = 0; i < locales.length; i++) {
        locales[i].json.professions[p.id] = p.name[locales[i].name]
      }
    }

    console.log('Saving JSON')
    for (let i = 0; i < locales.length; i++) {
      fs.writeFileSync(locales[i].file, JSON.stringify(locales[i].json, null, 2), 'utf8')
    }
  }
  catch (e) {
    if (e.code) {
      console.error('ERROR', e.code, e.errno)
      console.error(e.config)
      console.error(e.response)
    }
    else {
      console.error('ERROR', e)
    }
  }
}
go()


async function getToken (region) {
  if (region === 'cn') {
    tokenURL = 'https://www.battlenet.com.cn/oauth/token'
  }
  else {
    tokenURL = 'https://us.battle.net/oauth/token'
  }
  try {
    const response = await axios({
      method: 'post',
      url: tokenURL,
      data: 'grant_type=client_credentials',
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