
function findAll(regex, str) {
  var matches = []
  var m
  while ((m = regex.exec(str)) !== null) {
    if (m.index === regex.lastIndex) {
      regex.lastIndex++
    }
    matches.push(m)
  }
  return matches
}

const meiliIndex = {
  main: meiliSearch.index('imports'),
  mainCats: meiliSearch.index('importsCats'),
  stars: meiliSearch.index('stars'),
  starsCats: meiliSearch.index('starsCats'),
  date: meiliSearch.index('date'),
  dateCats: meiliSearch.index('dateCats'),
  code: meiliSearch.index('code')
}

const oldCategories = require('../../../frontend/src/components/libs/categories')

function expansionIndex(exp) {
  exp = exp.toLowerCase()
  if (exp === 'classic') return 0
  else if (exp === 'tbc') return 1
  else if (exp === 'legion') return 6
  else if (exp === 'bfa') return 7
  else if (exp === 'sl') return 8
  return 8
}

module.exports = function (fastify, opts, next) {
  fastify.get('/ms', async (req, res) => {
    let query = req.query.q || req.body.q || ""
    if (typeof query !== 'string') {
      query = ''
    }
    let m
    let filters = ''
    let facets = []
    let allowHidden = false
    let searchIndex = 'main'
    let searchMode = 'imports'

    if (req.query.sort && req.query.sort.match(/^(stars|date)$/)) {
      searchIndex = req.query.sort
    }

    m = query.match(/^!(code|mentions|starred)!/)
    if (m) {
      query = query.replace(m[0], '')
      if (m[1] === 'mentions' && req.user) {
        // searchIndex = 'comments'
        const mentions = await Comments.findMentions(req.user._id)
        let ids = []
        mentions.forEach(id => {
          ids.push(`id=${id}`)
        })
        if (ids.length) {
          allowHidden = true
          filters += ` AND (${ids.join(' OR ')})`
        }
      }
      else if (m[1] === 'starred' && req.user) {
        const faves = await WagoFavorites.find({userID: req.user._id, type: 'Star'}).select('wagoID')
        let ids = []
        faves.forEach(fave => {
          ids.push(`id=${fave.wagoID}`)
        })
        if (ids.length) {
          allowHidden = true
          filters += ` AND (${ids.join(' OR ')})`
        }
      }
    }

    let filterExpansion = []
    m = query.match(/expansion:\s?(\w+)/i)
    while (m) {
      filterExpansion.push(`expansion=${expansionIndex(m[1])}`)
      query = query.replace(m[0], '')
      m = query.match(/expansion:\s?(\w+)/i)
    }
    if (filterExpansion.length) {
      filters += ` AND (${filterExpansion.join(' OR ')} OR expansion=-1)`
    }

    let filterTypes = []
    m = query.match(/type:\s?(\w+)/i)
    while (m) {
      filterTypes.push(`type=${m[1].toUpperCase()}`)
      query = query.replace(m[0], '')
      m = query.match(/type:\s?(\w+)/i)
    }
    if (filterTypes.length) {
      filters += ` AND (${filterTypes.join(' OR ')})`
    }

    let categories = []
    m = query.match(/(?:category|tag):\s?([\w-]+)/i)
    while (m) {
      if (Categories.categories[m[1]]) {
        categories.push(`categories:${m[1]}`)
        if (!Categories.categories[m[1]].system && searchMode === 'imports') {
          searchIndex += 'Cats'
        }
      }
      query = query.replace(m[0], '')
      m = query.match(/(?:category|tag):\s?([\w-]+)/i)
    }
    if (categories.length) {
      facets.push(categories)
    }

    m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
    while (m) {
      try {
        let date = Math.round(Date.parse(m[1]) / 1000)
        let date2 = date + 86400
        filters += ` AND (timestamp >= ${date} AND timestamp <= ${date2})`
      }
      catch {}
      query = query.replace(m[0], '')
      m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
    }

    m = query.match(/(?:before):\s?(\d\d\d\d-\d\d-\d\d)/i)
    while (m) {
      try {
        let date = Math.round(Date.parse(m[1]) / 1000)
        filters += ` AND (timestamp < ${date})`
      }
      catch {}
      query = query.replace(m[0], '')
      m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
    }

    m = query.match(/(?:after):\s?(\d\d\d\d-\d\d-\d\d)/i)
    while (m) {
      try {
        let date = Math.round(Date.parse(m[1]) / 1000)
        filters += ` AND (timestamp > ${date})`
      }
      catch {}
      query = query.replace(m[0], '')
      m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
    }

    m = query.match(/(?:collection):\s?([\w-]{7,14})/i)
    let filterIDs = []
    if (m) {
      try {
        let collection = await WagoItem.lookup(m[1])
        if (collection && collection.type === 'COLLECTION' && collection.collect.length) {
          if (collection.visibility !== 'Public') {
            allowHidden = true
          }
          collection.collect.forEach(id => {
            filterIDs.push(`id="${id}"`)
          })
        }
      }
      catch {}
      query = query.replace(m[0], '')
    }
    if (filterIDs.length) {
      filters += ` AND (${filterIDs.join(' OR ')})`
    }

    m = query.match(/(?:user:\s?"(.*)")/i)
    let filterUsers = []
    while (m) {
      try {
        let user = await User.findOne({"search.username": m[1].toLowerCase()})
        if (user) {
          if (user.account.hidden && (!req.user || !user._id.equals(req.user._id))) {
            return res.send({profile: "private", hits: []})
          }
          filterUsers.push(`userId="${user._id}"`)
        }
      }
      catch {}
      query = query.replace(m[0], '')
      m = query.match(/(?:user:\s?"(.*)")/i)
    }
    if (filterUsers.length) {
      filters += ` AND (${filterUsers.join(' OR ')})`
    }

    m = query.match(/(.*)(metric:\s?(installs|stars|views)(<|>|=)(\d+))(.*)/i)
    let filterMetrics = []
    while (m) {
      filterMetrics.push(`${m[3]}${m[4]}${m[5]}`)
      query = query.replace(m[0], '')
      m = query.match(/(.*)(metric:\s?(installs|stars|views)(<|>|=)(\d+))(.*)/i)
    }
    if (filterMetrics.length) {
      filters += ` AND (${filterMetrics.join(' OR ')})`
    }

    if (!allowHidden && req.user) {
      let restrictions = [`userId="${req.user._id}"`, `hidden=false`]
      if (req.user.battlenet && req.user.battlenet.guilds) {
        req.user.battlenet.guilds.forEach(guild => {
          restrictions.push(`restriction="${guild}"`)
        })
      }

      filters += ` AND (${restrictions.join(' OR ')})`
    }
    else if (!allowHidden) {
      filters += ` AND (hidden=false)`
    }

    filters = filters.replace(/^ AND /, '')
    let options = {
      filters: filters,
      limit: 25,
      offset: parseInt(req.query.page || 0) * 25
    }

    if (facets.length) {
      options.facetFilters = facets
    }

    let results = await meiliIndex[searchIndex].search(query.trim(), options)
    results.index = searchIndex
    res.send(results)
  })


  fastify.get('/', async (req, res, skipSearch) => {
    // get input
    var query = req.query.q || req.body.q || ""
    if (typeof query !== 'string') {
      query = ''
    }

    var sort = req.query.sort || req.body.sort || false
    // default sort order
    if (!sort && req.user && req.user.config.searchOptions.sort) {
      sort = req.user.config.searchOptions.sort
    }
    if (!sort || sort === 'bestmatch') {
      sort = 'bestmatchv2'
    }
    // default expansion filter
    var expansion
    if (req.user && req.user.config.searchOptions.expansion) {
      expansion = req.user.config.searchOptions.expansion
    }
    else {
      expansion = 'sl'
    }
    // default tag relevance
    var relevance
    if (req.user && req.user.config.searchOptions.relevance) {
      relevance = req.user.config.searchOptions.relevance
    }
    else {
      relevance = 'standard'
    }

    var page = parseInt(req.query.page || req.body.page || 0)
    var esFilter = []
    var esSort = ['_score']
    var esQuery = false

    var searchSettings = {showAnon: 'hide', showHidden: false}

    // set constants
    var resultsPerPage = 20 // TODO: make this a global config
    var updateUser = false

    // setup return object
    var Search = {}
    Search.query = {}
    Search.query.q = query
    Search.query.page = page
    Search.query.context = []
    Search.meta = {}

    // our lookup object
    var lookup = {}

    // build criteria to search for

    // if search includes 'sort: mode'
    match = /\bsort:\s*"?(date|stars|views|bestmatch(v2)?)"?/i.exec(query)
    if (match && match.length) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      sort = match[1].toLowerCase()
    }
    Search.query.sort = sort

    if (sort === 'date') {
      esSort.unshift({modified: 'desc'})
    }
    else if (sort === 'stars') {
      esSort.unshift({'popularity.favorite_count': 'desc'})
    }
    else if (sort === 'views') {
      esSort.unshift({'popularity.views': 'desc'})
    }
    else if (sort === 'popular') {
      esSort.unshift({'popularity.viewsThisWeek': 'desc'})
    }
    else if (sort === 'bestmatch') {
      sort = 'bestmatchv2'
      // esSort.push({'popularity.viewsThisWeek': 'desc'})
      // esSort.push({modified: 'desc'})
    }

    // if user is logged in and sort is different from their current config, then update default config
    if (req.user && req.user.config.searchOptions.sort != sort && typeof sort === 'string') {
      req.user.config.searchOptions.sort = sort
      updateUser = true
    }

    // if tags are included, check for relevancy search option to sort by relevancy scores
    if (query.match(/tags?:/i)) {
      // relaxed = don't consider the number of categories
      // strict = sort by total number of categories with secondary sort by total number of root categories
      // standard = sort by total number of root categories
      match = /\brelevance:\s*"?(relaxed|strict|standard)"?/i.exec(query)
      if (match) {
        query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
        relevance = match[1]
      }
      Search.query.relevance = relevance

      // if relaxed relevance
      if (relevance === 'relaxed') {
        // no filters
      }

      // if strict relevance
      else if (relevance === 'strict') {
        // strict score sorts by total number of categories with secondary sorting on number of root categories
        esSort.unshift('relevancy.standard')
        esSort.unshift('relevancy.strict')
      }

      // standard
      else if (relevance === 'standard') {
        // standard score sorts by number of root categories
        esSort.unshift('relevancy.standard')
      }

      // if user is logged in and relevance is different from their current config, then update config
      if (req.user && req.user.config.searchOptions.relevance != relevance) {
        req.user.config.searchOptions.relevance = relevance
        updateUser = true
      }
    }

    // check for expansion filter
    var expansionFilterIndex = null
    match = /expansion:\s*"?(all|classic|tbc|legion|bfa|sl)"?/i.exec(query)
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      expansion = match[1]
    }
    Search.query.expansion = expansion

    // check for import type
    var matchType
    match = /\btype:\s*"?(\w+)"?/i.exec(query)
    let typeID
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      let type = match[1]
      typeID = match[1].toUpperCase()

      if (typeID.match(/WEAKAURA/)) {
        typeID = 'WEAKAURA'
      }
      else if (typeID === 'TOTALRP') {
        typeID = 'TOTALRP3'
      }

      if (expansion === 'classic' && typeID === 'WEAKAURA') {
        typeID = 'CLASSIC-WEAKAURA'
      }
      else if (expansion === 'tbc' && typeID === 'WEAKAURA') {
        typeID = 'TBC-WEAKAURA'
      }

      Search.query.context.push({
        query: match[0],
        type: 'type',
        wagoType: typeID.match(/WEAKAURA/) && 'WEAKAURA' || typeID,
        image: '/media/wagotypes/' + typeID + '.png'
      })
      esFilter.push(({bool: { should: [{term: {'type.keyword': typeID}}, {term: {'wagolib.addon.keyword': type}}, {term: {'wagolib.anythingTable.keyword': type}}]}}))
    }
    else {
      esFilter.push({ bool: { must_not: { term: { 'type.keyword': 'ERROR'}}}})
    }

    if (expansion !== 'all' && typeID && typeID.match(/WEAKAURA|MDT/)) {
        esFilter.push({ term: { game: expansion } })
        expansionFilterIndex = esFilter.length - 1
    }

    // if user is logged in and expansion is different from their current config, then update config
    if (req.user && req.user.config.searchOptions.expansion != expansion) {
      req.user.config.searchOptions.expansion = expansion
      updateUser = true
    }

    // check for date range
    match = /\bmodified:\s*(\d+)\s*(second|minute|hour|day|week|month|year)s?/i.exec(query)
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      var num = parseInt(match[1])
      var time
      switch (match[2].toLowerCase()) {
        case 'second':
          time = 's'
          break
        case 'minute':
          time = 'm'
          break
        case 'hour':
          time = 'h'
          break
        case 'day':
          time = 'd'
          break
        case 'week':
          time = 'w'
          break
        case 'month':
          time = 'M'
          break
        case 'year':
          time = 'y'
          break
        default:
          return done()
      }

      if (num > 1) {
        match[2] = match[2] + 's'
      }
      // lookup.type = match[1] + ' ' + match[2].charAt(0).toUpperCase() + match[2].toLowerCase().slice(1)

      Search.query.context.push({
        query: match[0],
        type: 'date',
        range: match[1] + ' ' + match[2].charAt(0).toUpperCase() + match[2].toLowerCase().slice(1)
      })
      esFilter.push({range: { modified: { gte: `now-${num}${time}`} } })
    }

    // check if searching by user(s)
    match = findAll(/\buser:\s*"([^"]+)"|\buser:\s*([^\s]+)/ig, query)
    if (match.length) {
      var m = match[0]
      query = query.replace(m[0], '').replace(/\s{2,}/, ' ').trim()
      let searchUser = m[2]
      if (!searchUser) {
        searchUser = m[1]
      }
      const user = await User.findOne({"search.username": searchUser.toLowerCase()}).exec()
      if (user) {
        searchSettings.userSearch = user._id
        // lookup._userId = user._id
        esFilter.push({term: { _userId: user._id } })
        Search.query.context.push({
          query: m[0],
          type: 'user',
          image: await user.avatarURL,
          user: {
            url: user.profile.url,
            roleClass: user.roleClass,
            name: user.account.username || 'User-' + user._id.toString()
          }
        })
      }
    }

    // check for tag(s)
    match = findAll(/\btags?:\s*([\w\-]+)|\btags?:\s*"([^"]+)"/ig, query)
    if (match.length) {
      match.forEach((m) => {
        query = query.replace(m[0], '').replace(/\s{2,}/, ' ').trim()
        var tags = (m[1] || m[2]).split(/,\s?/g)
        tags.forEach((thisTag) => {
          var clones = oldCategories.getClones(thisTag, matchType)
          // if this category does not exist in classic/vice versa then try without filter
          // if found without filter then remove the filter - the user likely came into the search page from an external link
          if (!clones.length) {
            clones = oldCategories.getClones(thisTag)
          }
          if (!clones.length) {
            return
          }

          lookup.categories = lookup.categories || {"$all": []}

          Search.query.context.push({
            query: m[0],
            type: 'tag',
            tag: thisTag
          })

          var esTags = []
          clones.forEach((clone) => {
            lookup.categories["$all"].push(clone)
            esTags.push({ term: { "categories.keyword": clone } })
          })
          esFilter.push({bool: { should: esTags } })
        })
      })
    }

    // check for collection
    match = findAll(/\bcollection:\s*([a-zA-Z0-9\-_]+)|\bcollection:\s*"([^"]+)"/ig, query)
    if (match.length) {
      match = match[0]
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      const collection = await WagoItem.findById([match[1], match[2]]).exec()
      if (collection && collection.collect) {
        searchSettings.showAnon = 'allow' // show anonymous imports if they are part of collection (can be overridden with anon: false)
        if (collection.hidden) {
          searchSettings.showHidden = true // show hidden imports if they are part of a hidden collection
        }
        esFilter.push({simple_query_string: {query: '"'+collection.collect.join('" "')+'"', fields: ["_id"] }})
      }
    }

    // check for anonymous setting
    match = /\banon:\s*(1|0|true|false|force)\b/i.exec(query)
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      if (match[1] === '1' || match[1].toLowerCase() === 'true') {
        searchSettings.showAnon = 'allow'
        Search.query.context.push({
          query: match[0],
          type: 'option',
          option: {
            name: 'anon',
            enabled: true
          }
        })
      }
      else if (match[1] === '0' || match[1].toLowerCase() === 'false') {
        searchSettings.showAnon = 'hide'
        Search.query.context.push({
          query: match[0],
          type: 'option',
          option: {
            name: 'anon',
            enabled: false
          }
        })
      }
      else if (match[1].toLowerCase() === 'force') {
        searchSettings.showAnon = 'exclusive'
        Search.query.context.push({
          query: match[0],
          type: 'option',
          option: {
            name: 'anon',
            force: true,
            enabled: false
          }
        })
      }
    }

    // check for restricted filter
    match = /\brestricted:\s*(1|true)\b/i.exec(query)
    if (match && req.user) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      Search.query.context.push({
        query: match[0],
        type: 'option',
        option: {
          name: 'restricted',
          enabled: true
        }
      })
      esFilter.push({term: { restricted: true } })
    }

    // check for favorites
    match = /!starred!/i.exec(query)
    if (match && req.user) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
        const faves = await WagoFavorites.find({userID: req.user._id, type: 'Star'}).select('wagoID').exec()
        var stars = []
        faves.forEach((fave) => {
          stars.push(fave.wagoID)
        })

        Search.query.context.push({
          query: match[0],
          type: 'option',
          option: {
            name: 'starred',
            enabled: true
          }
        })
        esFilter.push({ids: { values: stars } })
      }

    // check for comments
    match = /!mentions!/i.exec(query)
    if (match && req.user) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      Search.query.context.push({
        query: match[0],
        type: 'option',
        option: {
          name: 'alert',
          enabled: true
        }
      })
      const mentions = await Comments.findMentions(req.user._id, req.query.includeRead)
      esFilter.push({ids: { values: mentions } })
      searchSettings.showHidden = true
    }

    // if we changed any default search settings
    if (updateUser && req.user) {
      await req.user.save()
    }

    // check for actual search terms and protect against regex attacks
    query = query.replace(/\s{2,}/g, ' ').trim()
    if (query) {
      Search.query.textSearch = query
      query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
      esQuery = query
    }

    esFilter.push({term: { deleted: false } })
    // configure search per anon settings
    if (searchSettings.showAnon === 'hide') {
      esFilter.push({exists: { field: "_userId" } })
    }
    else if (searchSettings.showAnon === 'exclusive') {
      esFilter.push({bool: { must_not: [{ exists: { field: "_userId" } }] } })
    }

    // configure search per visibility settings
    var esShould = []
    if (searchSettings.userSearch && req.user && req.user._id.equals(searchSettings.userSearch)) {
      // no additional filters needed
    }
    else if (req.user && !searchSettings.showHidden) {
      esShould.push({term: {_userId: {value: req.user._id, boost: 0 } } })
      esShould.push({term: {restrictedUsers: {value: req.user._id.toString(), boost: 5}}})
      if (req.user.battlenet && req.user.battlenet.guilds && req.user.battlenet.guilds.length) {
        esShould.push({simple_query_string: {
          query: `"${req.user.battlenet.guilds.join('" "')}"`,
          fields: ["restrictedGuilds"],
          minimum_should_match: 1
        }})
      }
      if (req.user.twitch && req.user.twitch.id) {
        esShould.push({term: {restrictedTwitchUsers: {value: req.user.twitch.id, boost: 5} } })
      }
      esShould.push({bool: {filter: [{term: {private: {value: false, boost: 0}}}, {term: {moderated: {value: false, boost: 0}}}, {term: {blocked: {value: false, boost: 0}}}, {term: {encrypted: {value: false, boost: 0}}}, {term: {hidden: {value: false, boost: 0}}}, {term: {restricted: {value: false, boost: 0}}}]}})
    }
    else if (req.user) {
      esShould.push({term: { _userId: { value: req.user._id, boost: 0 } } })
      esShould.push({ term: { restrictedUsers: { value: req.user._id.toString(), boost: 5 } } })
      if (req.user.battlenet && req.user.battlenet.guilds && req.user.battlenet.guilds.length) {
        esShould.push({simple_query_string: {
          query: `"${req.user.battlenet.guilds.join('" "')}"`,
          fields: ["restrictedGuilds"],
          minimum_should_match: 1
        }})
      }
      if (req.user.twitch && req.user.twitch.id) {
        esShould.push({ term: { restrictedTwitchUsers: { value: req.user.twitch.id, boost: 5 } } })
      }
      esShould.push({bool: {filter: [{ term: { private: { value: false, boost: 0 } } }, {term: {moderated: {value: false, boost: 0}}}, {term: {blocked: {value: false, boost: 0}}}, {term: {encrypted: {value: false, boost: 0}}}, { term: { restricted: { value: false, boost: 0 } } }] } })
    }
    else if (!searchSettings.showHidden) {
      esFilter.push({term: { private: false } })
      esFilter.push({term: { moderated: false } })
      esFilter.push({term: { blocked: false } })
      esFilter.push({term: { hidden: false } })
      esFilter.push({term: { encrypted: false } })
      esFilter.push({term: { restricted: false } })
    }
    else {
      esFilter.push({term: { private: false } })
      esFilter.push({term: { moderated: false } })
      esFilter.push({term: { blocked: false } })
      esFilter.push({term: { encrypted: false } })
      esFilter.push({term: { restricted: false } })
    }

    if (esShould.length > 0) {
      esFilter.push({bool: {should: esShould}})
    }
    if (esQuery) {
      esQuery = [
        {
          simple_query_string: {
            query: esQuery,
            fields: ["description", "name^2"],
            minimum_should_match: "-25%"
          },
        }
      ]
    }
    else if (esFilter) {
      esQuery = esFilter
      esFilter = []
    }
    else {
      esQuery = {match_all: {}}
    }

    // if we have top and secondary searches (unread comments and read comments)
    if (searchSettings.topSearch && searchSettings.topSearch.length && page === 0) {
      esFilter.push({simple_query_string: {query: searchSettings.topSearch.join(' '), fields: ["_id"] }})
      if (searchSettings.topSearch.length / resultsPerPage > page + 1) {
        searchSettings.secondarySearch = []
      }
      else {
        page = Math.max(0, page - Math.ceil(searchSettings.topSearch.length / resultsPerPage))
      }
      if (searchSettings.secondarySearch) {
        Search.meta.forceNextPage = true
      }
    }
    else if (searchSettings.secondarySearch && searchSettings.secondarySearch.length) {
      if (searchSettings.topSearch && searchSettings.topSearch.length) {
        page--
      }
      esFilter.push({simple_query_string: {query: searchSettings.secondarySearch.slice(page * resultsPerPage, resultsPerPage).join(' '), fields: ["_id"] }})
    }
    var results
    // setup function_score
    if (sort === 'bestmatchv2') {
      results = await WagoItem.esSearch({
        query: {
          function_score: {
            query: {
              bool: {must: esQuery, filter: esFilter},
            },
            boost: 5,
            functions: [{
              gauss: {
                modified: {
                  origin: "now",
                  scale: "120d",
                  offset: "75d", 
                  decay : 0.25
                }
              },
            }, {
              field_value_factor: {
                field: "popularity.viewsThisWeek",
                modifier: "log1p",
                factor: .1
              }
            }, {
              field_value_factor: {
                field: "popularity.favorite_count",
                modifier: "log2p",
                factor: .001
              }
            }]
          }
        }
      }, {hydrate: true, sort: esSort, size: resultsPerPage, from: resultsPerPage*page})
    }
    else {
      results = await WagoItem.esSearch({
        query: { bool: { must: esQuery, filter: esFilter}}},
        {hydrate: true, sort: esSort, size: resultsPerPage, from: resultsPerPage*page
      })
    }

    // finally, run the search!
    // const 

    if (!results) {
      Search.total = 0
      Search.results = []
      return res.send(Search)
    }
    // confused as to what happened here? some breaking version change I don't see?
    if (results.hits && results.hits.extTotal && !results.hits.total) {
      results.hits.total = results.hits.extTotal
    }
    
    // initialize results
    if (results.hits && results.hits.hits) {
      Search.total = results.hits.total
      if (typeof Search.total === 'object') {
        Search.total = Search.total.value || 0
      }
      Search.results = results.hits.hits
    }
    else if (results.hits && results.hits.hits) {
      Search.total = results.hits.total
      if (typeof Search.total === 'object') {
        Search.total = Search.total.value || 0
      }
      Search.results = results.hits.hits
    }
    else if (results.length == resultsPerPage) {
      // if total couldn't be determined for some reason then give a total to ensure the search page loads more results
      Search.total = resultsPerPage + 1
      Search.results = results
    }
    else {
      Search.total = results.length
      Search.results = results
    }

    req.tracking.search = {
      query: Search.query.q.replace(/sort: \w+/, '').replace(/Expansion: \w+/, '').replace(/Relevance: \w+/, '').replace(/\s+/g, ' '),
      count: Search.total
    }

    // sanitize results
    Search.results = Search.results.filter((wago) => {
      // make sure we have no nulls (why do we need this?)
      return !!(wago)
    })
    Search.results = await Promise.all(Search.results.map(async (wago) => {
      var item = {}
      item.name = wago.name
      item.slug = wago.slug
      item.url = wago.url
      item.type = wago.type
      item.description = {text: wago.description, type: wago.description_format}
      item.hidden = wago.private || wago.hidden || wago.restricted || wago.encrypted || wago.moderated
      item.date = {created: wago.created, modified: wago.modified}
      item.timestamp = wago.modified.getTime()
      item.categories = wago.categories.slice(0, 5)

      item.views = wago.popularity.views
      item.comments = wago.popularity.comments_count
      item.downloads = wago.popularity.downloads
      item.embeds = wago.popularity.embeds
      item.stars = wago.popularity.favorite_count
      item.wagolib = wago.wagolib

      // legacy
      item.viewCount = wago.popularity.views
      item.commentCount = wago.popularity.comments_count
      item.downloadCount = wago.popularity.downloads
      item.embedCount = wago.popularity.embeds
      item.favoriteCount = wago.popularity.favorite_count

      // if logged in check for mentions
      if (req.user && req.user.unreadMentions && req.user.unreadMentions.indexOf(wago._id) >= 0) {
        item.unreadMention = true
      }

      // get thumbnail
      if (wago.image && wago.image[0] && wago.image[0].files.png) {
        item.thumbnail = 'https://media.wago.io/images/' + wago.image[0].files.png
      }
      else if (wago.image && wago.image[0] && wago.image[0].files.jpg) {
        item.thumbnail = 'https://media.wago.io/images/' + wago.image[0].files.jpg
      }
      else if (wago.previewImage) {
        item.thumbnail = wago.previewImage
      }
      else if (!wago.previewImage && typeof wago.previewImage !== 'string') {
        const thumbnail = await Screenshot.findOne({auraID: wago._id}).sort({sort:1}).exec()
        if (thumbnail) {
          item.thumbnail = thumbnail.url
          wago.previewImage = thumbnail.url
          await wago.save()
        }
        else {
          wago.previewImage = ''
          await wago.save()
        }
      }

      // get username
      if (wago._userId) {
        var user = await redis.getJSON('UserProfile:'+wago._userId)
        if (user) {
          item.user = user
        }
        else {
          user = await User.findById(wago._userId).exec()
          item.user = {name: user.account.username}
          item.user.searchable = !user.account.hidden
          item.user.roleClass = user.roleclass
          item.user.avatar = user.avatarURL
          await redis.setJSON('UserProfile:'+wago._userId, item.user, 'EX', 3600)
        }
      }
      else {
        item.user = { name: "a Guest" }
        item.user.searchable = false
        item.user.roleClass = 'user-default'
        item.user.avatar = 'https://api.hello-avatar.com/adorables/60/' + wago._id + '.png'
      }
      return item
    }))
    res.send(Search)
  })

  fastify.get('/menu', async (req, res) => {
    return res.send([])
  })


  // search by name : autocomplete
  fastify.get('/username', async (req, res) => {
    if (!req.query.name || req.query.name.length < 3) {
      return res.send([])
    }
    const results = await User.esSearch({
      query: {
        bool: {
          must: [
            { term: { "account.hidden": { value: false, boost: 0 } } }
          ],
          should: [
            {
              regexp: {
                "account.username": {
                  value: req.query.name.toLowerCase(),
                  boost: 2
                }
              }
            },
            {
              regexp: {
                "account.username": {
                  value: req.query.name.toLowerCase() + '.*',
                  boost: 1.2
                }
              }
            },
            {
              regexp: {
                "account.username": {
                  value: '.*' + req.query.name.toLowerCase() + '.*',
                  boost: .9
                }
              }
            }
          ]
        }
      },
    },
    { hydrate: true, sort: ['_score'], size: 10, from: 0})
    if (results && results.hits && results.hits.hits) {
      var users = []
      for (user of results.hits.hits) {
        var avatar = await user.avatarURL
        if (typeof avatar === 'string') {
          users.push({name: user.account.username, html: `<div class="md-avatar"><img src="${avatar}"></div> ${user.account.username}`})
        }
        else if (typeof avatar === 'object') {
          users.push({name: user.account.username, html: `<div class="md-avatar"><img src="${avatar.png}"></div> ${user.account.username}`})
        }
        else {
          users.push({name: user.account.username, html: user.account.username})
        }
      }
      res.send(users)
    }
    else {
      res.send([])
    }
  })

  next()
}