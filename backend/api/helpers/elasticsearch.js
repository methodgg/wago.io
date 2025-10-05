const { Client } = require('@elastic/elasticsearch')
const client = new Client(config.elasticSearch)

let bulkUpdates = {}

module.exports = {
  ensureIndexes: async function (updateSettings) {
    // await client.indices.delete({ index: 'imports' })
    // imports index
    let exists = await client.indices.exists({ index: 'imports' })
    if (!exists || !exists.body) {
      await client.indices.create({ index: 'imports' })
    }

    if (updateSettings) {
      await client.indices.close({ index: 'imports' })
      await client.indices.putSettings({
        index: 'imports', body: {
          analysis: {
            analyzer: {
              default_search: {
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'word_delimiter'
                ]
              },
              bigram_combiner: {
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'shingle_filter',
                  'remove_space_filter'
                ]
              }
            },
            filter: {
              shingle_filter: {
                type: 'shingle',
                min_shingle_size: 2,
                max_shingle_size: 3,
                output_unigrams: true
              },
              remove_space_filter: {
                type: "pattern_replace",
                pattern: " ",
                replacement: ""
              }
            }
          }
        }
      })

      await client.indices.putMapping({
        index: 'imports', body: {
          properties: {
            id: { type: 'text', index: false },
            name: { type: 'text', analyzer: 'bigram_combiner' },
            slug: { type: 'text', analyzer: 'bigram_combiner' },
            domain: { type: 'short' },
            descriptio: { type: 'text', analyzer: 'bigram_combiner' },
            categories: { type: 'keyword' },
            auraNames: { type: 'text', analyzer: 'bigram_combiner' },
            customCode: { type: 'text' },
            categoriesRoot: { type: 'short' },
            categoriesTotal: { type: 'short' },
            expansion: { type: 'byte' },
            patchIteration: { type: 'long' },
            installs: { type: 'long' },
            stars: { type: 'long' },
            views: { type: 'long' },
            viewsThisWeek: { type: 'long' },
            comments: { type: 'long' },
            installScore: { type: 'half_float' },
            starScore: { type: 'half_float' },
            viewsScore: { type: 'half_float' },
            thumbnail: { type: 'text', index: false },
            thumbnailStatic: { type: 'text', index: false },
            timestamp: { type: 'integer' },
            hidden: { type: 'boolean' },
            type: { type: 'keyword' },
            restrictions: { type: 'keyword' },
            userId: { type: 'keyword' },
            userName: { type: 'text', index: false },
            userAvatar: { type: 'text', index: false },
            userClass: { type: 'text', index: false },
            userLinked: { type: 'boolean', index: false },
            name_plain: { type: 'text' },
            slug_plain: { type: 'text' },
            description_plain: { type: 'text' },
          }
        }
      })
      await client.indices.open({ index: 'imports' })
    }

    // await client.indices.delete({index: 'comment'})
    exists = await client.indices.exists({ index: 'comments' })
    if (!exists || !exists.body) {
      await client.indices.create({ index: 'comments' })
    }

    if (updateSettings) {
      await client.indices.close({ index: 'comments' })
      await client.indices.putSettings({
        index: 'comments', body: {
          analysis: {
            analyzer: {
              default_search: {
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'word_delimiter'
                ]
              },
              bigram_combiner: {
                tokenizer: 'standard',
                filter: [
                  'lowercase',
                  'shingle_filter',
                  'remove_space_filter'
                ]
              }
            },
            filter: {
              shingle_filter: {
                type: 'shingle',
                min_shingle_size: 2,
                max_shingle_size: 3,
                output_unigrams: true
              },
              remove_space_filter: {
                type: "pattern_replace",
                pattern: " ",
                replacement: ""
              }
            }
          }
        }
      })

      await client.indices.putMapping({
        index: 'comments', body: {
          properties: {
            id: { type: 'keyword' },
            text: { type: 'text' },
            type: { type: 'keyword' },
            expansion: { type: 'byte' },
            timestamp: { type: 'integer' },
            hidden: { type: 'boolean' },
            taggedIDs: { type: 'keyword' },
            importName: { type: 'text', index: false },
            importID: { type: 'keyword' },
            userId: { type: 'keyword' },
            userName: { type: 'text', index: false },
            userAvatar: { type: 'text', index: false },
            userClass: { type: 'text', index: false },
            userLinked: { type: 'boolean', index: false },
            domain: { type: 'short' },
          }
        }
      })
      await client.indices.open({ index: 'comments' })
    }

    // console.log(JSON.stringify((await client.indices.getMapping({index: 'import'})).body, null, 2))
    // console.log(JSON.stringify((await client.indices.getSettings({index: 'import'})).body, null, 2))
    // console.log(JSON.stringify((await client.indices.stats({index: 'import'})).body, null, 2))
  },

  addDoc: async function (index, doc, syncing) {
    if (!bulkUpdates[index]) {
      bulkUpdates[index] = { docs: [], timeout: null }
    }
    if (!syncing) {
      for (let i = 0; i < bulkUpdates[index].docs.length; i++) {
        if (bulkUpdates[index].docs[i].id === doc.id) {
          bulkUpdates[index].docs[i] = doc
          return this.checkBulk(index)
        }
      }
    }
    if (doc) {
      bulkUpdates[index].docs.push({ index: { _index: index, _id: doc.id } })
      bulkUpdates[index].docs.push(doc)
      this.checkBulk(index)
    }
  },

  removeDoc: async function (index, id) {
    if (!bulkUpdates[index]) {
      bulkUpdates[index] = { docs: [], timeout: null }
    }
    bulkUpdates[index].docs.push({ delete: { _index: index, _id: id } })
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
    try {
      const bulkResponse = (await client.bulk({ refresh: true, body: bulkUpdates[index].docs })).body
      if (bulkResponse.errors) {
        const erroredDocuments = []
        bulkResponse.items.forEach((action, i) => {
          const operation = Object.keys(action)[0]
          if (action[operation].error) {
            erroredDocuments.push(action)
          }
        })
        console.log('ELASTIC ERRORS', JSON.stringify(erroredDocuments, null, 2))
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
    o.page = Math.min(o.page || 0, 100)
    let results = []
    if (o.algorithm === 'bestmatchv3' && o.index !== 'comments') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            function_score: {
              query: {
                bool: o.query,
              },
              functions: [
                // {
                //   gauss: {
                //     timestamp: {
                //       origin: Date.now() / 1000,
                //       scale: 86400 * 120,
                //       offset: 86400 * 75,
                //       decay: 0.25
                //     }
                //   }
                // },
                // {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
                { field_value_factor: { field: "starScore", missing: 0, factor: 6 } },
                { field_value_factor: { field: "viewsScore", missing: 0, modifier: "ln1p", factor: 1 } },
                { field_value_factor: { field: "installs", missing: 0, modifier: "ln1p", factor: .05 } },
                { field_value_factor: { field: "stars", missing: 0, modifier: "ln1p", factor: .05 } },
                // { field_value_factor: { field: "viewsThisWeek", missing: 0, modifier: "ln1p", factor: .1 } },
                { field_value_factor: { field: "patchIteration", factor: 4 } },
                // { field_value_factor: { field: "ageScore", missing: 0, modifier: "ln1p", factor: .1 } },
              ],
              score_mode: "sum"
            }
          },
          sort: o.sort || ['_score'],
          size: resultsPerPage,
          from: resultsPerPage * (o.page || 0),
          highlight: o.highlight
        }
      })
    }
    else if (o.algorithm === 'bestmatchv2' && o.index !== 'comments') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            function_score: {
              query: {
                bool: o.query,
              },
              functions: [
                {
                  gauss: {
                    timestamp: {
                      origin: Date.now() / 1000,
                      scale: 86400 * 120,
                      offset: 86400 * 75,
                      decay: 0.25
                    }
                  }
                },
                // {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
                { field_value_factor: { field: "starScore", missing: 0, factor: 6 } },
                { field_value_factor: { field: "viewsScore", missing: 0, modifier: "ln1p", factor: 1 } },
                { field_value_factor: { field: "ageScore", missing: 0, modifier: "ln1p", factor: .01 } },
                { field_value_factor: { field: "installs", missing: 0, modifier: "ln1p", factor: .05 } },
                { field_value_factor: { field: "stars", missing: 0, modifier: "ln1p", factor: .05 } },
                { field_value_factor: { field: "viewsThisWeek", missing: 0, modifier: "ln1p", factor: .01 } },
              ],
              score_mode: "sum"
            }
          },
          sort: o.sort || ['_score'],
          size: resultsPerPage,
          from: resultsPerPage * (o.page || 0),
          highlight: o.highlight
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
          from: resultsPerPage * (o.page || 0),
          highlight: o.highlight
        }
      })
    }
    try {
      return {
        hits: results.body.hits.hits.map(d => Object.assign(
          d._source, d.highlight, {
          _score: d._score,
          customCode: o.codeSearch ? d._source.customCode : undefined,
          auraNames: undefined,
          name_plain: undefined,
          slug_plain: undefined,
          description_plain: undefined,
        })),
        total: results.body.hits.total.value, query: o.textQuery, index: o.index
      }
    }
    catch (e) {
      console.log(e)
      return { hits: [], total: 0, query: o.query }
    }
  },

  // topTrending: async function ({ expansionIndex, addonType }) {
  //   const esFilter = [{ term: { hidden: false } }]
  //   if (expansionIndex >= 0) {
  //     esFilter.push({ term: { expansion: { value: expansionIndex(expansionIndex) } } })
  //   }
  //   esFilter.push({ term: { hidden: false } })
  //   results = await client.search({
  //     index: o.index,
  //     body: {
  //       query: this.trendingAlgo({ bool: { must: esFilter } }),
  //       sort: o.sort || ['_score'],
  //       size: resultsPerPage,
  //       from: resultsPerPage * (o.page || 0),
  //       highlight: o.highlight
  //     }
  //   })
  // },

  trendingAlgo: (mode, query) => {
    if (mode === 'comments') {
      return {
        bool: query,
      }
    }

    return {
      query,
      functions: [
        // {
        //   gauss: {
        //     timestamp: {
        //       origin: Date.now() / 1000,
        //       scale: 86400 * 120,
        //       offset: 86400 * 75,
        //       decay: 0.25
        //     }
        //   }
        // },
        // {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
        { field_value_factor: { field: "starScore", missing: 0, factor: 6 } },
        { field_value_factor: { field: "viewsScore", missing: 0, modifier: "ln1p", factor: 1 } },
        { field_value_factor: { field: "installs", missing: 0, modifier: "ln1p", factor: .05 } },
        { field_value_factor: { field: "stars", missing: 0, modifier: "ln1p", factor: .05 } },
        // { field_value_factor: { field: "viewsThisWeek", missing: 0, modifier: "ln1p", factor: .1 } },
        { field_value_factor: { field: "patchIteration", factor: 4 } },
        // { field_value_factor: { field: "ageScore", missing: 0, modifier: "ln1p", factor: .1 } },
      ],
      score_mode: "sum"
    }
  }
}