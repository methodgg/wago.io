const { Client } = require('@elastic/elasticsearch')
const client = new Client(config.elasticSearch)

let bulkUpdates = {}

module.exports = {
  ensureIndexes: async function (updateSettings) {
    // await client.indices.delete({index: 'imports'})
    let exists = await client.indices.exists({index: 'imports'})
    if (!exists || !exists.body) {
      await client.indices.create({index: 'imports'})
    }

    if (updateSettings) {
      await client.indices.close({index: 'imports'})
      await client.indices.putSettings({index: 'imports', body: {
        analysis: {
          analyzer: {
            default_search: {
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'word_delimiter',
                'kstem'
              ]
            }
          }
      }}})
      await client.indices.open({index: 'imports'})
    }

    await client.indices.putMapping({index: 'imports', body: {
      properties: {
        id: {type: 'text', index: false},
        name: {type: 'text', boost: 2},
        slug: {type: 'text', boost: 1.5},
        description: {type: 'text'},
        categories: {type: 'keyword'},
        categoriesRoot: {type: 'short'},
        categoriesTotal: {type: 'short'},
        expansion: {type: 'byte'},
        installs: {type: 'integer'},
        stars: {type: 'integer'},
        views: {type: 'integer'},
        viewsThisWeek: {type: 'integer'},
        comments: {type: 'integer'},
        installScore: {type: 'half_float'},
        starScore: {type: 'half_float'},
        viewsScore: {type: 'half_float'},
        thumbnail: {type: 'text', index: false},
        timestamp: {type: 'integer'},
        hidden: {type: 'boolean'},
        type: {type: 'keyword'},
        restrictions: {type: 'keyword'},
        userId: {type: 'keyword'},
        userName: {type: 'text', index: false},
        userAvatar: {type: 'text', index: false},
        userClass: {type: 'text', index: false},
        userLinked: {type: 'boolean', index: false}
      }
    }})
  },

  addDoc: async function (index, doc) {
    if (!bulkUpdates[index]) {
      bulkUpdates[index] = {docs: [], timeout: null}
    }
    bulkUpdates[index].docs.push({index: {_index: index, _id: doc.id}})
    bulkUpdates[index].docs.push(doc)
    this.checkBulk(index)
  },

  removeDoc: async function (index, id) {
    if (!bulkUpdates[index]) {
      bulkUpdates[index] = {docs: [], timeout: null}
    }
    bulkUpdates[index].docs.push({delete: {_index: index, _id: id}})
    this.checkBulk(index)
  },

  checkBulk: async function (index) {
    if (bulkUpdates[index].docs.length >= 1000) {
      clearTimeout(bulkUpdates[index].timeout)
      bulkUpdates[index].timeout = null
      this.bulkProcessing(index)
    }
    else if (!bulkUpdates[index].timeout && bulkUpdates[index].docs.length) {
      bulkUpdates[index].timeout = setTimeout(() => {
        this.bulkProcessing(index)
        bulkUpdates[index].timeout = null
      }, 90000)
    }
  },

  bulkProcessing: async function (index) {
    let p = client.bulk({index: index, refresh: true, body: bulkUpdates[index].docs})
    bulkUpdates[index].docs = []
    await p
    this.checkBulk(index)
  },

  search: async function (o) {
    const resultsPerPage = 25
    let results = []
    if (o.index === 'imports' && o.algorithm === 'popular') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            function_score: {
              query: {
                bool: o.query,
              },
              functions: [
                {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
                {field_value_factor: {field: "starScore", missing: 0, factor: 6}},
                {field_value_factor: {field: "viewsScore", missing: 0, modifier: "ln1p", factor: 1}},
                {field_value_factor: {field: "ageScore", missing: 0, modifier: "ln1p", factor: .01}},
                {field_value_factor: {field: "installs", missing: 0, modifier: "ln1p", factor: .05}},
                {field_value_factor: {field: "stars", missing: 0, modifier: "ln1p", factor: .05}},
                {field_value_factor: {field: "viewsThisWeek", missing: 0, modifier: "ln1p", factor: .01}},
              ],
              score_mode: "sum"
            }
          },
          sort: o.sort || ['_score'],
          size: resultsPerPage,
          from: resultsPerPage * (o.page || 0)
        }
      })
    }
    else if (o.algorithm === 'rawsort') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            bool: o.query,
          },
          sort: o.sort || ['_score'],
          size: resultsPerPage,
          from: resultsPerPage * (o.page || 0)
        }
      })
    }
    try {
      return {hits: results.body.hits.hits.map(d => Object.assign(d._source, {_score: d._score})), total: results.body.hits.total.value, query: o.query}
    }
    catch (e) {
      console.log(e)
      return {hits: [], total: 0, query: o.query}
    }
  }
}