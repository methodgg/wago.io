const { Client } = require('@elastic/elasticsearch')
const client = new Client(config.elasticSearch)


module.exports = {
  ensureIndexes: async function () {
    // await client.indices.delete({index: 'imports'})
    let exists = await client.indices.exists({index: 'imports'})
    if (!exists || !exists.body) {
      await client.indices.create({index: 'imports'})
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

    // console.log((await client.indices.getMapping({index: 'imports'})).body.imports.mappings)

    // const response = await client.indices.stats({
    //   index: 'imports'
    // })
    // console.log(response.body._all)

  },

  updateIndexDocs: async function (index, docs) {
    const body = docs.flatMap(doc => [{ index: { _index: index, _id: doc.id } }, doc])
    await client.bulk({index: index, refresh: true, body})
  },

  search: async function (o) {
    const resultsPerPage = 25
    let results = []
    console.log(o)
    if (o.index === 'imports' && o.algorithm === 'popular') {
      results = await client.search({
        index: o.index,
        body: {
          query: {
            function_score: {
              query: {
                bool: o.query,
              },
              boost: 5,
              functions: [
                {field_value_factor: {field: "installScore", missing: 0, factor: 8}},
                {field_value_factor: {field: "starScore", missing: 0, factor: 6}},
                {field_value_factor: {field: "viewsScore", missing: 0, modifier: "ln1p", factor: 1}},
                {field_value_factor: {field: "ageScore", missing: 0, modifier: "ln1p", factor: 1}},
                {field_value_factor: {field: "installs", missing: 0, modifier: "ln1p", factor: .05}},
                {field_value_factor: {field: "stars", missing: 0, modifier: "ln1p", factor: .05}},
                {field_value_factor: {field: "viewsThisWeek", missing: 0, modifier: "ln1p", factor: .01}},
              ],
              score_mode: "sum",
              boost_mode: "sum"
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