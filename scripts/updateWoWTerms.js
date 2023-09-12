require('dotenv').config()

const axios = require('axios')
const cloudflare = require('cloudflare')({token: process.env.CLOUDFLARE_TOKEN})
const csv = require('csv-parser')
const fs = require('fs')

const locales = [
  'en-US',
  'de-DE',
  'es-ES',
  'fr-FR',
  'ru-RU',
  'zh-CN',
  'ko-KR'
]

async function go () {
  const clearCacheURLs = []
  try {
    for (const locale of locales) {
      const jsonFile = `${process.env.DIRECTORY_I18N}/${locale}/warcraft.json`
      const fileContents = fs.readFileSync(jsonFile, 'utf8')
      const json = JSON.parse(fileContents)
      json.classes = json.classes || {}
      json.encounters = json.encounters || {}
      json.expansions = json.expansions || {}
      json.instances = json.instances || {}
      json.professions = json.professions || {}

      const apiLocale = locale.replace(/-/, '')
      // ---- Get class names and specs
      // class names are stored by matching id; specs are identified by sequential order (1 index) - so if the order changes then this needs to be updated
      const updateClasses = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/ChrClasses/csv?locale=${apiLocale}`, {responseType: 'stream'})
        data.pipe(csv())
          .on('data', (chrClass) => {
            json.classes[chrClass.ID] = chrClass.Name_lang
          })
          .on('end', async () => {
            // note "classes.4-2c" is hardcoded to Combat Rogue for Classic
            const {data} = await axios.get(`https://wago.tools/db2/ChrSpecialization/csv?locale=${apiLocale}`, {responseType: 'stream'})
            data.pipe(csv())
            .on('data', (chrSpec) => {
              json.classes[`${chrSpec.ClassID}-${(parseInt(chrSpec.OrderIndex)+1)}`] = chrSpec.Name_lang
            })
            .on('end', done)
          })
      })

      const updateEncounters = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalEncounter/csv?locale=${apiLocale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (encounter) => {
          json.encounters[encounter.ID] = encounter.Name_lang
        })
        .on('end', done)
      })
      
      const updateExpansions = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalTier/csv?locale=${apiLocale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (expansion) => {
          json.expansions[expansion.ID] = expansion.Name_lang
        })
        .on('end', done)
      })
      
      const updateInstances = new Promise(async (done) => {
        const {data} = await axios.get(`https://wago.tools/db2/JournalInstance/csv?locale=${apiLocale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (instance) => {
          json.instances[instance.ID] = instance.Name_lang
        })
        .on('end', done)
      })    
      
      const updateSkills = new Promise(async (done) => {
        // note "professions.firstaid" is hardcoded to First Aid for Classic
        const {data} = await axios.get(`https://wago.tools/db2/SkillLine/csv?locale=${apiLocale}`, {responseType: 'stream'})
        data.pipe(csv())
        .on('data', (skill) => {
          json.professions[skill.ID] = skill.DisplayName_lang
        })
        .on('end', done)
      })

      await Promise.all([updateClasses, updateEncounters, updateExpansions, updateInstances, updateSkills])

      const newContents = JSON.stringify(json, null, !process.env.PRODUCTION && 2)
      if (fileContents !== newContents) {
        fs.writeFileSync(jsonFile, newContents, 'utf8')
        clearCacheURLs.push({url: `https://wago.io/static/i18n/${locale}/warcraft.json`})
      }
    }
  }
  catch (e) {
    if (e.code) {
      console.error('ERROR', e.code, e)
    }
    else {
      console.error('ERROR', e)
    }
  }

  if (clearCacheURLs.length) {
    cloudflare.zones.purgeCache(process.env.CLOUDFLARE_ZONE, {files: clearCacheURLs})
    console.log('Updated', clearCacheURLs.map(x => x.url))
  }
}
go()