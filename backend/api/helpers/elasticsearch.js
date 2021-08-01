const { Client } = require('@elastic/elasticsearch')
const client = new Client(config.elasticSearch)

let bulkUpdates = {}

module.exports = {
  ensureIndexes: async function (updateSettings) {
    // await client.indices.delete({index: 'import'})
    // imports index
    let exists = await client.indices.exists({index: 'import'})
    if (!exists || !exists.body) {
      await client.indices.create({index: 'import'})
    }

    if (updateSettings) {
      await client.indices.close({index: 'import'})
      await client.indices.putSettings({index: 'import', body: {
        analysis: {
          analyzer: {
            default_search: {
              tokenizer: 'standard',
              filter: [
                'lowercase',
                'word_delimiter'
              ]
            }
          }
      }}})
      await client.indices.open({index: 'import'})
    }

    await client.indices.putMapping({index: 'import', body: {
      properties: {
        id: {type: 'text', index: false},
        name: {type: 'text'},
        slug: {type: 'text'},
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

    // code index
    exists = await client.indices.exists({index: 'code'})
    if (!exists || !exists.body) {
      await client.indices.create({index: 'code'})
    }

    await client.indices.putMapping({index: 'code', body: {
      properties: {
        id: {type: 'text', index: false},
        name: {type: 'text', index: false},
        versionString: {type: 'text', index: false},
        code: {type: 'text'},
        expansion: {type: 'byte'},
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

    // console.log(JSON.stringify((await client.indices.getMapping({index: 'import'})).body, null, 2))
    // console.log(JSON.stringify((await client.indices.getSettings({index: 'import'})).body, null, 2))
    // console.log(JSON.stringify((await client.indices.stats({index: 'import'})).body, null, 2))
  },

  addDoc: async function (index, doc, syncing) {
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
      }, 30000)
    }
  },

  bulkProcessing: async function (index) {
    // console.log(JSON.stringify(bulkUpdates[index].docs, null, 2))
    try {
      const { body: bulkResponse } = await client.bulk({ refresh: true, body: bulkUpdates[index].docs })
      if (bulkResponse.errors) {
        const erroredDocuments = []
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push({
              status: action[operation].status,
              error: action[operation].error,
              operation: body[i * 2],
              document: body[i * 2 + 1]
            })
          }
        })
        console.log('ELASTIC ERRORS', erroredDocuments)
      }
      else {
        bulkUpdates[index].docs = []
      }
    }
    catch (e) {
      console.log(e)
    }
    this.checkBulk(index)
  },

  search: async function (o) {
    const resultsPerPage = 25
    let results = []
    if (o.algorithm === 'popular') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            function_score: {
              query: {
                bool: o.query,
              },
              functions: [
                {gauss: {
                  timestamp: {
                    origin: Date.now() / 1000,
                    scale: 86400 * 120,
                    offset: 86400 * 75,
                    decay : 0.25
                  }
                }},
                // {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
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
    else {
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
      return {hits: results.body.hits.hits.map(d => Object.assign(d._source, {_score: d._score})), total: results.body.hits.total.value, query: o.textQuery, index: o.index}
    }
    catch (e) {
      console.log(e)
      return {hits: [], total: 0, query: o.query}
    }
  }
}