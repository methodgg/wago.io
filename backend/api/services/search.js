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

module.exports = function (fastify, opts, next) {
  fastify.get('/', async (req, res, skipSearch) => {
    // get input
    var query = req.query.q || req.body.q || ""
    var sort = req.query.sort || req.body.sort || false
    // default sort order
    if (!sort && req.user && req.user.config.searchOptions.sort) {
      sort = req.user.config.searchOptions.sort
    }
    if (!sort) {
      sort = 'bestmatch'
    }
    // default expansion filter
    var expansion
    if (req.user && req.user.config.searchOptions.expansion && req.user.config.searchOptions.expansion !== 'classic') {
      expansion = req.user.config.searchOptions.expansion
    }
    else {
      expansion = 'bfa'
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
    match = /\bsort:\s*"?(date|stars|views|bestmatch)"?/i.exec(query)
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
      esSort.push({'popularity.viewsThisWeek': 'desc'})
      esSort.push({modified: 'desc'})
    }

    // if user is logged in and sort is different from their current config, then update default config
    if (req.user && req.user.config.searchOptions.sort != sort) {
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
    match = /expansion:\s*"?(all|legion|bfa)"?/i.exec(query)
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      expansion = match[1]
    }
    Search.query.expansion = expansion

    if (expansion === 'legion') {
      // less than bfa release date AND does not have bfa beta tag
      esFilter.push({ bool: { should: [{bool: {must: [{match: {game: 'bfa'}}, {range: { modified: { lt: "2018-07-17" } } }], must_not: { term: { "categories.keyword": 'beta-bfa'}}}}, {regexp: {"type.keyword": {value: 'CLASSIC-.+'}}}]}})
      expansionFilterIndex = esFilter.length - 1
    }

    // if battle for azeroth
    else if (expansion === 'bfa') {
      // greater than bfa release date OR has bfa beta tag
      esFilter.push({ bool: { should: [{bool: {must: [{match: {game: 'bfa'}}, {range: { modified: { gte: "2018-07-17" } } }]}}, {regexp: {"type.keyword": {value: 'CLASSIC-.+'}}}]}})
      expansionFilterIndex = esFilter.length - 1
    }

    // if showing all expansions
    else if (expansion === 'all') {
      // no filter
    }

    // if user is logged in and expansion is different from their current config, then update config
    if (req.user && req.user.config.searchOptions.expansion != expansion) {
      req.user.config.searchOptions.expansion = expansion
      updateUser = true
    }

    // check for import type
    var game = 'wow'
    match = /\btype:\s*"?(classic-weakaura|weakauras?2?|elvui|vuhdo|totalrp3?|collection|snippet|plater|mdt|encounternotes|image|audio)"?/i.exec(query)
    if (match) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      match[1] = match[1].toUpperCase()

      if (match[1] === 'WEAKAURA' || match[1] === 'WEAKAURA2' || match[1] === 'WEAKAURAS') {
        match[1] = 'WEAKAURAS2'
      }
      else if (match[1] === 'TOTALRP') {
        match[1] = 'TOTALRP3'
      }

      if (match[1].match(/classic/i)) {
        game = 'classic'
      }
      // lookup.type = match[1]
      Search.query.context.push({
        query: match[0],
        type: 'type',
        wagoType: match[1]==='WEAKAURAS2' && 'WEAKAURA' || match[1],
        image: '/media/wagotypes/' + match[1] + '.png'
      })
      esFilter.push({ term: { "type.keyword": match[1] } })
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
    match = findAll(/\buser:\s*([^\s]+)|\buser:\s*"([^"]+)"/ig, query)
    if (match.length) {
      var m = match[0]
      query = query.replace(m[0], '').replace(/\s{2,}/, ' ').trim()
      const user = await User.findOne({"search.username": (m[1] || m[2]).toLowerCase()}).exec()
      if (user) {
        searchSettings.userSearch = user._id
        // lookup._userId = user._id
        esFilter.push({term: { _userId: user._id } })
        Search.query.context.push({
          query: m[0],
          type: 'user',
          image: user.avatarURL,
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
          var clones = global.Categories.getClones(thisTag, game === 'classic')
          // if this category does not exist in classic/vice versa then try without filter
          // if found without filter then remove the filter - the user likely came into the search page from an external link
          if (!clones.length) {
            clones = global.Categories.getClones(thisTag)
            if (clones.length && !isNaN(expansionFilterIndex)) {
              esFilter.splice(expansionFilterIndex, 1)
              expansionFilterIndex = null
              Search.query.expansion = 'any'
            }
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
    match = /\bstarred:\s*(1|true)\b/i.exec(query)
    if (match && req.user) {
      query = query.replace(match[0], '').replace(/\s{2,}/, ' ').trim()
      if (match[1]=='1' || match[1].toLowerCase()=='true') {
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
    }

    // check for comments
    match = /\b(?:alerts?|mentioned):\s*(1|true)\b/i.exec(query)
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
      const mentions = await Comments.findMentions(req.user._id)
      searchSettings.topSearch = []
      searchSettings.secondarySearch = []
      for (const [mentionWagoID, unread] of Object.entries(mentions)) {
        // push unread comments to top of search results
        if (unread) {
          searchSettings.topSearch.push(mentionWagoID)
        }
        else {
          searchSettings.secondarySearch.push(mentionWagoID)
        }
      }
    }

    // if we changed any default search settings
    if (updateUser && req.user) {
      req.user.save()
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
      esShould.push({bool: {filter: [{term: {private: {value: false, boost: 0}}}, {term: {hidden: {value: false, boost: 0}}}, {term: {restricted: {value: false, boost: 0}}}]}})
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
      esShould.push({bool: {filter: [{ term: { private: { value: false, boost: 0 } } }, { term: { restricted: { value: false, boost: 0 } } }] } })
    }
    else if (!searchSettings.showHidden) {
      esFilter.push({term: { private: false } })
      esFilter.push({term: { hidden: false } })
      esFilter.push({term: { restricted: false } })
    }
    else {
      esFilter.push({term: { private: false } })
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
            fields: ["description", "name^2", "custom_slug^2"],
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

    // finally, run the search!
    const results = await WagoItem.esSearch(
      {query: { bool: { must: esQuery, filter: esFilter}}},
      {hydrate: true, sort: esSort, size: resultsPerPage, from: resultsPerPage*page})

    if (!results) {
      Search.total = 0
      Search.results = []
      return res.send(Search)
    }
    // initialize results
    if (results.hits && results.hits.hits) {
      Search.total = results.hits.total
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
      if (wago.type=='WEAKAURAS2' || wago.type=='WEAKAURA2') {
          wago.type = 'WEAKAURA'
      }
      item.type = wago.type
      item.description = {text: wago.description, type: wago.description_format}
      item.visibility = {private: wago.private, hidden: wago.hidden, restricted: wago.restricted}
      item.date = {created: wago.created, modified: wago.modified}
      item.categories = wago.categories.slice(0, 5)

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
      else {
        const thumbnail = await Screenshot.findOne({auraID: wago._id}).sort({sort:1}).exec()
        if (thumbnail) {
          item.thumbnail = thumbnail.url
        }
      }

      // get username
      if (wago._userId) {
        var user = await User.findById(wago._userId).exec()
        item.user = {name: user.account.username}
        item.user.searchable = !user.account.hidden
        item.user.roleClass = user.roleclass
        item.user.avatar = user.avatarURL
      }
      else {
        item.user = { name: "a Guest" }
        item.user.searchable = false
        item.user.roleClass = 'user-default'
        item.user.avatar = 'https://api.adorable.io/avatars/60/' + wago._id + '.png'
      }
      return item
    }))
    res.send(Search)
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
      results.hits.hits.forEach((user) => {
        if (typeof user.avatarURL === 'string') {
          users.push({name: user.account.username, html: `<div class="md-avatar"><img src="${user.avatarURL}"></div> ${user.account.username}`})
        }
        else if (typeof user.avatarURL === 'object') {
          users.push({name: user.account.username, html: `<div class="md-avatar"><img src="${user.avatarURL.png}"></div> ${user.account.username}`})
        }
        else {
          users.push({name: user.account.username, html: user.account.username})
        }
      })
      res.send(users)
    }
    else {
      res.send([])
    }
  })

  next()
}
