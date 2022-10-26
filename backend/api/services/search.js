
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

function expansionIndex(exp) {
  exp = exp.toLowerCase()
  if (exp === 'classic') return 0
  else if (exp === 'tbc') return 1
  else if (exp === 'wotlk') return 2
  else if (exp === 'legion') return 6
  else if (exp === 'bfa') return 7
  else if (exp === 'sl') return 8
  else if (exp === 'df') return 9
  return 8
}

async function searchElastic (req, res) {
  let query = req.query.q || req.body.q || ''
  if (typeof query !== 'string') {
    query = ''
  }

  let page = parseInt(req.query.page || req.body.page || 0)
  let esFilter = []
  let esSort = ['_score']
  let sortMode = 'standard'
  let searchMode = req.query.mode || 'wow'
  let esQuery = false
  let searchIndex = 'import'
  let allowHidden = false

  let sort = req.query.sort || req.body.sort || ''
  if (sort === 'date') {
    esSort.unshift({timestamp: 'desc'})
  }
  else if (sort === 'stars') {
    esSort.unshift({stars: 'desc'})
  }
  else if (sort === 'views') {
    esSort.unshift({views: 'desc'})
  }
  else if (sort === 'installs') {
    esSort.unshift({installs: 'desc'})
  }
  else {
    sortMode = 'bestmatchv2'
  }

  // search mode
  if (searchMode === 'comments' && req.user) {
    searchIndex = 'comment'
    searchMode = 'comments'
  }
  else if (searchMode === 'starred' && req.user) {
    searchMode = 'stars'
    const faves = await WagoFavorites.find({userID: req.user._id, type: 'Star'}).select('wagoID')
    let ids = []
    faves.forEach(fave => {
      ids.push(fave.wagoID)
    })
    if (ids.length) {
      esFilter.push({ids: { values: ids } })
      allowHidden = true
    }
    else {
      return res.send({
        hits: [],
        total: 0
      })
    }
  }
  else if (searchMode === 'code') {
    searchIndex = 'code'
    searchMode = 'code'
  }
  else if (searchMode === 'wow') {
    searchIndex = 'import'
    searchMode = 'import'
    esFilter.push(({term: {domain: 0}}))
  }
  else if (searchMode === 'xiv') {
    searchIndex = 'import'
    searchMode = 'import'
    esFilter.push(({term: {domain: 1}}))
  }

  let filterExpansion = []
  let defaultFilterExpansion
  m = query.match(/expansion:\s?(df|sl|bfa|legion|wod|wotlk|tbc|classic)/)
  if (m) {
    while (m) {
      query = query.replace(m[0], '')
      filterExpansion.push({term: {expansion: {value: expansionIndex(m[1])}}})
      m = query.match(/expansion:\s?(df|sl|bfa|legion|wod|wotlk|tbc|classic)/i)
    }
  }
  else if (searchIndex.match(/import|code/) && searchMode !== 'stars') {
    // if no expansion is specified then default to the current games
    defaultFilterExpansion = []
    defaultFilterExpansion.push({term: {expansion: {value: expansionIndex('df')}}})
    defaultFilterExpansion.push({term: {expansion: {value: expansionIndex('wotlk')}}})
    defaultFilterExpansion.push({term: {expansion: {value: -1}}})
  }
  if (filterExpansion.length) {
    filterExpansion.push({term: {expansion: -1}}) // so that we dont exclude imports that are not expansion specific
    esFilter.push(({bool: {should: filterExpansion}}))
  }

  let filterTypes = []
  m = query.match(/type:\s?(\w+)/i)
  while (m) {
    filterTypes.push({term: {'type': m[1].toUpperCase()}})
    query = query.replace(m[0], '')
    m = query.match(/type:\s?(\w+)/i)
  }
  if (filterTypes.length) {
    esFilter.push(({bool: {should: filterTypes}}))
  }

  let filterUsers = []
  m = query.match(/(?:user:\s?"(.*)")/i)
  var searchingOwnProfile = false
  while (m && m[0]) {
    try {
      let user = await User.findOne({"search.username": m[1].toLowerCase()})
      if (user) {
        if (req.user && user._id.equals(req.user._id)) {
          searchingOwnProfile = true
        }
        else if (user.account.hidden) {
          return res.send({profile: "private", hits: []})
        }
        filterUsers.push({term: { userId: user._id } })
      }
      query = query.replace(m[0], '')
      m = query.match(/(?:user:\s?"(\w+)")/i)
    }
    catch {}
  }
  if (filterUsers.length) {
    defaultFilterExpansion = null
    esFilter.push(({bool: {should: filterUsers}}))
  }

  m = query.match(/mentions:(unread|read|all)/i)
  if (m && req.user && searchMode === 'comments') {
    let unreadComments = (await Comments.findUnread(req.user._id)).map(x => {return {term: { id: x._id }}})
    m[1] = m[1].toLowerCase()
    if (m[1] === 'unread') {
      if (unreadComments && unreadComments.length) {
        esFilter.push(({bool: {should: unreadComments}}))
      }
      else {
        return res.send({
          hits: [],
          total: 0
        })
      }
    }
    else if (m[1] === 'read') {
      esFilter.push(({bool: {should: {term: { taggedIDs: req.user._id }}}}))

      if (unreadComments && unreadComments.length) {
        esFilter.push(({bool: {must_not: unreadComments}}))
      }
    }
    else if (m[1] === 'all') {
      esFilter.push(({bool: {should: {term: { taggedIDs: req.user._id }}}}))
    }
    query = query.replace(m[0], '')
  }

  m = query.match(/(metric:\s?(installs|stars|views)(<|>)(\d+))/i)
  while (m) {
    m[2] = m[2].toLowerCase()
    if (m[2] === 'installs' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'installs': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'stars' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'stars': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'views' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'views': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'installs' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'installs': {gt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'stars' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'stars': {gt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'views' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'views': {gt: parseInt(m[4])}}}}})
    }

    query = query.replace(m[0], '')
    m = query.match(/(metric:\s?(installs|stars|views)(<|>)(\d+))/i)
  }

  let filterCats = []
  let catSearch = false
  m = query.match(/(?:category|tag):\s?([\w-]+)/i)
  while (m) {
    if (Categories.categories[m[1]]) {
      filterCats.push({ term: {"categories": m[1]}})
      if (!Categories.categories[m[1]].system) {
        catSearch = true
      }
    }
    query = query.replace(m[0], '')
    m = query.match(/(?:category|tag):\s?([\w-]+)/i)
  }
  if (filterCats.length) {
    defaultFilterExpansion = null
    esFilter.push(({bool: {should: filterCats}}))
    if (catSearch) {
      esSort.unshift('categoriesRoot')
    }
  }

  m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]) / 1000)
      let date2 = date + 86400
      esFilter.push({bool: {should: {range: {timestamp: {gte: date, lte: date2}}}}})
      defaultFilterExpansion = null
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:before):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]) / 1000)
      esFilter.push({bool: {should: {range: {timestamp: {lte: date}}}}})
      defaultFilterExpansion = null
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:before):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:after):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]) / 1000)
      esFilter.push({bool: {should: {range: {timestamp: {gte: date}}}}})
      defaultFilterExpansion = null
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:after):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:collection):\s?([\w-]{7,14})/i)
  if (m && m[0]) {
    try {
      let collection = await WagoItem.lookup(m[1])
      if (collection && collection.type === 'COLLECTION' && collection.collect.length) {
        if (collection.visibility !== 'Public') {
          allowHidden = true
        }
        esFilter.push({simple_query_string: {query: '"'+collection.collect.join('" "')+'"', fields: ["_id"] }})
        defaultFilterExpansion = null
      }
    }
    catch {}
    query = query.replace(m[0], '')
  }

  if (defaultFilterExpansion) {
    esFilter.push(({bool: {should: defaultFilterExpansion}}))
  }

  var searchSettings = {showAnon: 'hide', showHidden: false}

  // set constants
  var resultsPerPage = 20 // TODO: make this a global config

  // setup return object
  var Search = {}
  Search.query = {}
  Search.query.q = query
  Search.query.page = page
  Search.query.context = []
  Search.meta = {}

  query = query.replace(/\s{2,}/g, ' ').trim()
  if (query) {
    Search.query.textSearch = query
    esQuery = query
  }

  // esFilter.push({term: {deleted: false}})
  // esFilter.push({exists: {field: "userId"}}) // hide anonymous imports

  // configure search per visibility settings
  var esShould = []
  if (searchingOwnProfile) {
    // no additional filters needed
  }
  else if (req.user && !allowHidden && searchIndex === 'comment') {
    esShould.push({term: {hidden: false}})
    esShould.push({term: {userID: {value: req.user._id, boost: 0 } } })
    esShould.push({term: {taggedIDs: {value: req.user._id.toString(), boost: 3}}})
  }
  else if (req.user && !allowHidden) {
    esFilter.push({term: {hidden: false}})
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
      esShould.push({term: {restrictedTwitchUsers: {value: req.user.twitch.id, boost: 5}}})
    }
    esShould.push({bool: {filter: [{term: {hidden: {value: false, boost: 0}}}]}})
  }
  else if (!allowHidden) {
    esFilter.push({term: {hidden: false}})
  }

  if (esShould.length > 0) {
    esFilter.push({bool: {should: esShould}})
  }
  let textQuery = ''
  if (esQuery) {
    let searchFields = ["description", "name^2", "custom_slug^2"]
    if (searchIndex === 'code') {
      searchFields = ["code"]
    }
    else if (searchIndex === 'comment') {
      searchFields = ['text']
    }
    textQuery = esQuery
    let simpleSearch
    if (!textQuery.match(/[+|\-*~"()\\]/)) {
      let fuzzySearch = []
      textQuery.match(/([^\s]+)\s*/g).forEach(word => {
        word = word.trim()
        if (word.length > 5 && word.match(/^\w+$/)) {
          fuzzySearch.push(`${word}~${Math.floor(word.length / 5)}`)
        }
        else {
          fuzzySearch.push(`${word}`)
        }
      })
      simpleSearch = {
        simple_query_string: {
          query: fuzzySearch.join(' '),
          fields: searchFields,
          default_operator: "AND",
          minimum_should_match: '-25%'
        },
      }
    }
    if (!simpleSearch) {
      simpleSearch = {
        simple_query_string: {
          query: textQuery,
          fields: searchFields,
          default_operator: "AND",
          minimum_should_match: '-25%'
        },
      }
    }
    esQuery = [simpleSearch]
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
  return res.send(await elastic.search({
    index: searchIndex,
    algorithm: (sortMode === 'bestmatchv2') ? 'popular' : 'rawsort',
    query: {must: esQuery, filter: esFilter},
    textQuery,
    sort: esSort,
    page: page
  }))
}

async function oldSearch (req, res) {
  var query = req.query.q || req.body.q || ''
  if (typeof query !== 'string') {
    query = ''
  }

  var page = parseInt(req.query.page || req.body.page || 0)
  var esFilter = []
  var esSort = ['_score']
  var sortMode = 'standard'
  var esQuery = false
  var searchMode = 'import'
  var allowHidden = false

  var sort = req.query.sort || req.body.sort || ''
  if (sort === 'date') {
    esSort.unshift({modified: 'desc'})
  }
  else if (sort === 'stars') {
    esSort.unshift({'popularity.favorite_count': 'desc'})
  }
  else {
    sortMode = 'bestmatchv2'
  }

  // search mode
  m = query.match(/^!(code|mentions|starred)!/)
  if (m) {
    query = query.replace(m[0], '')
    if (m[1] === 'mentions' && req.user) {
      const mentions = await Comments.findMentions(req.user._id)
      if (mentions.length) {
        esFilter.push({ids: {values: mentions}})
        allowHidden = true
      }
    }
    else if (m[1] === 'starred' && req.user) {
      const faves = await WagoFavorites.find({userID: req.user._id, type: 'Star'}).select('wagoID')
      let ids = []
      faves.forEach(fave => {
        ids.push(fave.wagoID)
      })
      if (ids.length) {
        esFilter.push({ids: { values: ids } })
        allowHidden = true
      }
    }
    else if (m[1] === 'code') {
      searchMode = 'code'
    }
  }

  let filterExpansion = [{term: {game: ''}}]
  m = query.match(/expansion:\s?(df|sl|bfa|legion|wod|wotlk|tbc|classic)/)
  while (m) {
    query = query.replace(m[0], '')
    filterExpansion.push({term: {game: m[1]}})
    m = query.match(/expansion:\s?(\w+)/i)
  }
  if (filterExpansion.length > 1) {
    esFilter.push(({bool: {should: filterExpansion}}))
  }

  let filterTypes = []
  m = query.match(/type:\s?(\w+)/i)
  while (m) {
    filterTypes.push({term: {'type.keyword': m[1].toUpperCase()}})
    if (m[1].toUpperCase() === 'WEAKAURA') {
      // temp until index is optimized
      filterTypes.push({term: {'type.keyword': 'WOTLK-WEAKAURA'}})
      filterTypes.push({term: {'type.keyword': 'TBC-WEAKAURA'}})
      filterTypes.push({term: {'type.keyword': 'CLASSIC-WEAKAURA'}})
    }
    query = query.replace(m[0], '')
    m = query.match(/type:\s?(\w+)/i)
  }
  if (filterTypes.length) {
    esFilter.push(({bool: {should: filterTypes}}))
  }

  let filterUsers = []
  m = query.match(/(?:user:\s?"(.*)")/i)
  var searchingOwnProfile = false
  while (m) {
    try {
      let user = await User.findOne({"search.username": m[1].toLowerCase()})
      if (user) {
        if (req.user && user._id.equals(req.user._id)) {
          searchingOwnProfile = true
        }
        else if (user.account.hidden) {
          return res.send({profile: "private", hits: []})
        }
        filterUsers.push({term: { _userId: user._id } })
      }
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:user:\s?"(\w+)")/i)
  }
  if (filterUsers.length) {
    esFilter.push(({bool: {should: filterUsers}}))
  }

  m = query.match(/(metric:\s?(installs|stars|views)(<|>)(\d+))/i)
  while (m) {
    m[2] = m[2].toLowerCase()
    if (m[2] === 'installs' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'popularity.installed_count': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'stars' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'popularity.favorite_count': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'views' && m[3] === '<') {
      esFilter.push({bool: {should: {range: {'popularity.views': {lt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'installs' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'popularity.installed_count': {gt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'stars' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'popularity.favorite_count': {gt: parseInt(m[4])}}}}})
    }
    else if (m[2] === 'views' && m[3] === '>') {
      esFilter.push({bool: {should: {range: {'popularity.views': {gt: parseInt(m[4])}}}}})
    }

    query = query.replace(m[0], '')
    m = query.match(/(metric:\s?(installs|stars|views)(<|>)(\d+))/i)
  }

  if (searchMode === 'import') {
    let filterCats = []
    let catSearch = false
    m = query.match(/(?:category|tag):\s?([\w-]+)/i)
    while (m) {
      if (Categories.categories[m[1]]) {
        filterCats.push({ term: {"categories.keyword": m[1]}})
        if (!Categories.categories[m[1]].system) {
          catSearch = true
        }
      }
      query = query.replace(m[0], '')
      m = query.match(/(?:category|tag):\s?([\w-]+)/i)
    }
    if (filterCats.length) {
      esFilter.push(({bool: {should: filterCats}}))
      if (catSearch) {
        esSort.unshift('relevancy.standard')
      }
    }
  }

  m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]))
      let date2 = date + 86400000
      esFilter.push({bool: {should: {range: {modified: {gte: date, lte: date2}}}}})
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:date):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:before):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]))
      esFilter.push({bool: {should: {range: {modified: {lte: date}}}}})
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:before):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:after):\s?(\d\d\d\d-\d\d-\d\d)/i)
  while (m) {
    try {
      let date = Math.round(Date.parse(m[1]))
      esFilter.push({bool: {should: {range: {modified: {gte: date}}}}})
    }
    catch {}
    query = query.replace(m[0], '')
    m = query.match(/(?:after):\s?(\d\d\d\d-\d\d-\d\d)/i)
  }

  m = query.match(/(?:collection):\s?([\w-]{7,14})/i)
  if (m) {
    try {
      let collection = await WagoItem.lookup(m[1])
      if (collection && collection.type === 'COLLECTION' && collection.collect.length) {
        if (collection.visibility !== 'Public') {
          allowHidden = true
        }
        esFilter.push({simple_query_string: {query: '"'+collection.collect.join('" "')+'"', fields: ["_id"] }})
      }
    }
    catch {}
    query = query.replace(m[0], '')
  }






  var searchSettings = {showAnon: 'hide', showHidden: false}

  // set constants
  var resultsPerPage = 20 // TODO: make this a global config

  // setup return object
  var Search = {}
  Search.query = {}
  Search.query.q = query
  Search.query.page = page
  Search.query.context = []
  Search.meta = {}

  // check for actual search terms and protect against regex attacks
  query = query.replace(/\s{2,}/g, ' ').trim()
  if (query) {
    Search.query.textSearch = query
    query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    esQuery = query
  }

  esFilter.push({term: {deleted: false}})
  esFilter.push({exists: {field: "_userId"}}) // hide anonymous imports

  // configure search per visibility settings
  var esShould = []
  if (searchingOwnProfile) {
    // no additional filters needed
  }
  else if (req.user && !allowHidden) {
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
      esShould.push({term: {restrictedTwitchUsers: {value: req.user.twitch.id, boost: 5}}})
    }
    esShould.push({bool: {filter: [{term: {private: {value: false, boost: 0}}}, {term: {moderated: {value: false, boost: 0}}}, {term: {blocked: {value: false, boost: 0}}}, {term: {encrypted: {value: false, boost: 0}}}, {term: {hidden: {value: false, boost: 0}}}, {term: {restricted: {value: false, boost: 0}}}]}})
  }
  else if (req.user) {
    esShould.push({term: { _userId: { value: req.user._id, boost: 0 } } })
    esShould.push({ term: { restrictedUsers: { value: req.user._id.toString(), boost: 5}}})
    if (req.user.battlenet && req.user.battlenet.guilds && req.user.battlenet.guilds.length) {
      esShould.push({simple_query_string: {
        query: `"${req.user.battlenet.guilds.join('" "')}"`,
        fields: ["restrictedGuilds"],
        minimum_should_match: 1
      }})
    }
    if (req.user.twitch && req.user.twitch.id) {
      esShould.push({ term: { restrictedTwitchUsers: { value: req.user.twitch.id, boost: 5}}})
    }
    esShould.push({bool: {filter: [{ term: { private: { value: false, boost: 0 } } }, {term: {moderated: {value: false, boost: 0}}}, {term: {blocked: {value: false, boost: 0}}}, {term: {encrypted: {value: false, boost: 0}}}, { term: { restricted: { value: false, boost: 0 } } }] } })
  }
  else if (!allowHidden) {
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
          fields: ["description", "name^2", "custom_slug^2"], // add custom slug
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
  if (sortMode === 'bestmatchv2') {
    // console.log(JSON.stringify({must: esQuery, filter: esFilter}, null, 2))
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
        if (user) {
          item.user = {name: user.account.username}
          item.user.searchable = !user.account.hidden
          item.user.roleClass = user.roleclass
          item.user.avatar = user.avatarURL
          await redis.setJSON('UserProfile:'+wago._userId, item.user, 'EX', 3600)
        }
        else {
          item.user = { name: "a Guest" }
          item.user.searchable = false
          item.user.roleClass = 'user-default'
          item.user.avatar = 'https://avatars.dicebear.com/api/gridy/' + wago._id + '.svg'
        }
      }
    }
    else {
      item.user = { name: "a Guest" }
      item.user.searchable = false
      item.user.roleClass = 'user-default'
      item.user.avatar = 'https://avatars.dicebear.com/api/gridy/' + wago._id + '.svg'
    }
    return item
  }))
  res.send(Search)
}

module.exports = function (fastify, opts, next) {
  fastify.get('/ms', oldSearch)
  fastify.get('/es', searchElastic)
  fastify.get('/', searchElastic)

  fastify.get('/oldsearch', async (req, res) => {
    return []
    // get input
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