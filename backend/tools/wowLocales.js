/** After updating, force clear cloudflare cache
 https://wago.io/static/i18n/en-US/warcraft.json
 https://wago.io/static/i18n/de-DE/warcraft.json
 https://wago.io/static/i18n/es-ES/warcraft.json
 https://wago.io/static/i18n/fr-FR/warcraft.json
 https://wago.io/static/i18n/ru-RU/warcraft.json
 https://wago.io/static/i18n/zh-CN/warcraft.json
 https://wago.io/static/i18n/ko-KR/warcraft.json
 */


const axios = require('axios')
const csv = require('csv-parser')
const fs = require('fs')
const locales = [
  {file: '../../frontend/static/i18n/en-US/warcraft.json', locale: 'enUS'},
  {file: '../../frontend/static/i18n/de-DE/warcraft.json', locale: 'deDE'},
  {file: '../../frontend/static/i18n/es-ES/warcraft.json', locale: 'esES'},
  {file: '../../frontend/static/i18n/fr-FR/warcraft.json', locale: 'frFR'},
  {file: '../../frontend/static/i18n/ru-RU/warcraft.json', locale: 'ruRU'},
  {file: '../../frontend/static/i18n/zh-CN/warcraft.json', locale: 'zhCN'},
  {file: '../../frontend/static/i18n/ko-KR/warcraft.json', locale: 'koKR'},
]

async function go () {
  try {
    for (let i = 0; i < locales.length; i++) {
      const fileContents = fs.readFileSync(locales[i].file, 'utf8')
      locales[i].json = JSON.parse(fileContents)
      locales[i].json.classes = locales[i].json.classes || {}
      locales[i].json.encounters = locales[i].json.encounters || {}
      locales[i].json.expansions = locales[i].json.expansions || {}
      locales[i].json.instances = locales[i].json.instances || {}
      locales[i].json.dungeons = locales[i].json.dungeons || {} // used when a dungeon split into multiple wings (ie lower/upper)
      locales[i].json.professions = locales[i].json.professions || {}
      locales[i].json.keystoneAffix = locales[i].json.keystoneAffix || {}
      locales[i].json.Map = locales[i].json.Map || {}
      locales[i].json.UiMap = locales[i].json.UiMap || {}

      // ---- Get class names and specs
      // class names are stored by matching id; specs are identified by sequential order (1 index) - so if the order changes then this needs to be updated
      const this_i = i
      const updateClasses = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/ChrClasses/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
          .on('data', (chrClass) => {
            locales[this_i].json.classes[chrClass.ID] = chrClass.Name_lang
          })
          .on('end', async () => {
            // note "classes.4-2c" is hardcoded to Combat Rogue for Classic
            const {data} = await axios.get(`https://wago.tools/db2/ChrSpecialization/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
            data.pipe(csv())
            .on('data', (chrSpec) => {
              locales[this_i].json.classes[`${chrSpec.ClassID}-${(parseInt(chrSpec.OrderIndex)+1)}`] = chrSpec.Name_lang
            })
            .on('end', done)
          })
      })

      const updateEncounters = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalEncounter/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (encounter) => {
          locales[this_i].json.encounters[encounter.ID] = encounter.Name_lang
        })
        .on('end', done)
      })
      
      const updateExpansions = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalTier/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (expansion) => {
          locales[this_i].json.expansions[expansion.ID] = expansion.Name_lang
        })
        .on('end', done)
      })
      
      const updateInstances = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalInstance/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (instance) => {
          locales[this_i].json.instances[instance.ID] = instance.Name_lang
        })
        .on('end', done)
      })    
      
      const updateLFG = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/LFGDungeons/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (lfg) => {
          locales[this_i].json.dungeons[lfg.ID] = lfg.Name_lang
        })
        .on('end', done)
      })    
      
      const updateSkills = new Promise(async (done) => {
        // note "professions.firstaid" is hardcoded to First Aid for Classic
        const {data} = await axios.get(`https://wago.tools/db2/SkillLine/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (skill) => {
          locales[this_i].json.professions[skill.ID] = skill.DisplayName_lang
        })
        .on('end', done)
      })
      
      const updateAffixes = new Promise(async (done) => {
        // note "professions.firstaid" is hardcoded to First Aid for Classic
        const {data} = await axios.get(`https://wago.tools/db2/KeystoneAffix/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (skill) => {
          locales[this_i].json.keystoneAffix[skill.ID] = {name: skill.Name_lang, desc: skill.Description_lang}
        })
        .on('end', done)
      })
      
      const updateMap = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/Map/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (map) => {
          locales[this_i].json.Map[map.ID] = map.MapName_lang
        })
        .on('end', done)
      })
      
      const updateUiMap = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/UiMap/csv?locale=${locales[this_i].locale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (skill) => {
          locales[this_i].json.UiMap[skill.ID] = skill.Name_lang
        })
        .on('end', done)
      })

      await Promise.all([updateClasses, updateEncounters, updateExpansions, updateInstances, updateLFG, updateSkills, updateAffixes, updateMap, updateUiMap])

      const newContents = JSON.stringify(locales[i].json, null, 2)
      if (fileContents !== newContents) {
        fs.writeFileSync(locales[i].file, JSON.stringify(locales[i].json, null, 2), 'utf8')
      }
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