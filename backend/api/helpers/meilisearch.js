const { MeiliSearch } = require('meilisearch')
const meiliWagoApp = new MeiliSearch(config.meiliWagoApp)

let bulkUpdates = {}
let indexes = {}

module.exports = {
  getIndexes: async function () {
    indexes.weakauras = await meiliWagoApp.getOrCreateIndex('weakauras')
    bulkUpdates.weakauras = {docs: [], timeout: null}
  },
  index: function (r) {
    return indexes[r]
  },

  addDoc: async function (index, doc, syncing) {
    console.log('add doc', index, doc)
    if (!bulkUpdates[index]) {
      bulkUpdates[index] = {docs: [], timeout: null}
    }
    if (!syncing) {
      for (let i = 0; i < bulkUpdates[index].docs.length; i++) {
        if (bulkUpdates[index].docs[i].id === doc.id) {
          bulkUpdates[index].docs[i] = doc
          return this.checkBulk(index)
        }
      }
    }
    bulkUpdates[index].docs.push(doc)
    this.checkBulk(index)
  },

  removeDoc: async function (index, id) {
    console.log('remove doc', index, id)
    for (let i = 0; i < bulkUpdates[index].docs.length; i++) {
      if (bulkUpdates[index].docs[i].id === id) {
        bulkUpdates[index].docs.splice(i, 1)
      }
    }
    indexes[index].deleteDocument(id)
  },

  checkBulk: async function (index) {
    console.log('checkbulk')
    if (bulkUpdates[index].docs.length >= 1000) {
      clearTimeout(bulkUpdates[index].timeout)
      bulkUpdates[index].timeout = null
      this.bulkProcessing(index)
    }
    else if (!bulkUpdates[index].timeout && bulkUpdates[index].docs.length) {
      bulkUpdates[index].timeout = setTimeout(() => {
        this.bulkProcessing(index)
        bulkUpdates[index].timeout = null
      }, 30000)
    }
  },

  bulkProcessing: async function (index) {
    console.log('process')
    try {
      const update = await indexes[index].addDocuments(bulkUpdates[index].docs)
      if (!update || !update.updateId) {
        console.log('MEILI UPDATE ERRORS', update)
      }
      else {
        bulkUpdates[index].docs = []
      }
    }
    catch (e) {
      console.log(e)
    }
    this.checkBulk(index)
  }
}