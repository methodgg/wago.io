server.get('/search', (req, res, skipSearch) => {
  // get input
  var query = req.params.q || req.body.q || ""
  var sort = req.params.sort || req.body.sort || 'elastic'
  var page = parseInt(req.query.page || req.body.page || 0)
  var esFilter = []
  var esSort = ['_score']
  var esQuery = false

  // set constants
  var resultsPerPage = 20 // TODO: make this a global config

  // setup return object
  var Search = {}
  Search.query = {}
  Search.query.q = query
  Search.query.sort = sort
  Search.query.page = page
  Search.query.context = []

  // our lookup object
  var lookup = {}

  // override settings
  var defaultAnon = false
  var allowHidden = false

  // build criteria to search for
  async.series([
    // if search includes 'sort: sort' - valid sort options: date stars views
    function(done) {
      const regex = /\bsort:\s*"?(date|stars|views|bestmatch)"?/i
      var sortType = query.match(regex)
      if (!sortType || sortType.length==0) return done()

      if ((sortMatch = regex.exec(sortType)) !== null) {
        // valid sort option found. Remove tag from query and update lookup
        query = query.replace(sortMatch[0], '').replace(/\s{2,}/, ' ').trim()
        sortMatch[1] = sortMatch[1].toLowerCase()

        if (sortMatch[1] === 'date') {
          sort = '-modified'
          esSort.unshift({modified: 'desc'})
        }
        else if (sortMatch[1] === 'stars') {
          sort = '-popularity.favorite_count'
          esSort.unshift({'popularity.favorite_count': 'desc'})
        }
        else if (sortMatch[1] === 'views') {
          sort = '-popularity.views'
          esSort.unshift({'popularity.views': 'desc'})
        }
        else if (sortMatch[1] === 'popular') {
          sort = '-popularity.viewsThisWeek'
          esSort.unshift({'popularity.viewsThisWeek': 'desc'})
        }
        else if (sortMatch[1] === 'bestmatch') {
          esSort.push({'popularity.viewsThisWeek': 'desc'})
          esSort.push({modified: 'desc'})
        }

        // if user is logged in and sort is different from their current config, then update config
        if (sortMatch && req.user && req.user.config.searchOptions.sort != sortMatch[1]) {
          req.user.config.searchOptions.sort = sortMatch[1]
          req.user.save().then((user) => {
            // no need to wait here
          })
        }
      }
      return done()
    },

    // check for relevancy search option to sort by relevancy scores
    function(done) {
      // only applies if category tags are included in search query
      if (!query.match(/tag:/i)) {
        return done()
      }
      const regex = /\brelevance:\s*"?(relaxed|strict)"?/i
      var sortType = query.match(regex)
      // if relaxed relevance 
      if (sortType && sortType[1] === 'relaxed') {
        // don't consider the number of categories
        query = query.replace(sortType[0], '').replace(/\s{2,}/, ' ').trim()
      }

      // if strict relevance
      else if (sortType && sortType[1] === 'strict') {
        // strict score sorts by total number of categories with secondary sorting on number of root categories
        sort = 'relevancy.strict relevancy.standard ' + sort
        query = query.replace(sortType[0], '').replace(/\s{2,}/, ' ').trim()
        esSort.unshift('relevancy.standard')
        esSort.unshift('relevancy.strict')
      }

      // default 
      else {
        // standard score sorts by number of root categories
        sort = 'relevancy.standard ' + sort
        esSort.unshift('relevancy.standard')
      }

      // if user is logged in and relevance is different from their current config, then update config
      if (sortType && req.user && req.user.config.searchOptions.relevance != sortType[1]) {
        req.user.config.searchOptions.relevance = sortType[1]
        req.user.save().then((user) => {
          // no need to wait here
        })
      }

      return done()
    },

    // check for expansion filter
    function(done) {
      // only applies if category tags are included in search query
      if (!query.match(/expansion:/i)) {
        return done()
      }
      
      const regex = /expansion:\s*"?(all|legion|bfa)"?/i
      var gameVersion = query.match(regex)
      // if legion
      if (gameVersion && gameVersion[1] === 'legion') {
        query = query.replace(gameVersion[0], '').replace(/\s{2,}/, ' ').trim()

        esFilter.push({ bool: { must: {range: { modified: { lt: "2018-07-17" } } }, must_not: { term: { "categories.keyword": 'beta-bfa' } } } })
      }

      // if battle for azeroth
      else if (gameVersion && gameVersion[1] === 'bfa') {
        query = query.replace(gameVersion[0], '').replace(/\s{2,}/, ' ').trim()
        
        // esFilter.push({range: { modified: { gte: "2018-07-17" } } })
        esFilter.push({ bool: { should: [{range: { modified: { gte: "2018-07-17" } } }, { term: { "categories.keyword": 'beta-bfa' } }] } })
      }

      // if showing all expansions
      else if (gameVersion && gameVersion[1] === 'all') {
        query = query.replace(gameVersion[0], '').replace(/\s{2,}/, ' ').trim()
      }

      // if user is logged in and expansion is different from their current config, then update config
      if (gameVersion && req.user && req.user.config.searchOptions.expansion != gameVersion[1]) {
        req.user.config.searchOptions.expansion = gameVersion[1]
        req.user.save().then((user) => {
          // no need to wait here
        })
      }

      return done()
    },

    // if search includes 'type: wagotype'
    function(done) {
      const regex = /\btype:\s*"?(weakauras?2?|elvui|vuhdo|totalrp3?|collection|snippet|mdt|encounternotes|image|audio)"?/i
      var typeSearch = query.match(regex)
      if (!typeSearch || typeSearch.length==0) return done()

      if ((typeMatch = regex.exec(typeSearch)) !== null) {
        // valid wagotype context found. Remove tag from query and update lookup
        query = query.replace(typeMatch[0], '').replace(/\s{2,}/, ' ').trim()
        typeMatch[1] = typeMatch[1].toUpperCase()

        if (typeMatch[1] === 'WEAKAURA' || typeMatch[1] === 'WEAKAURA2' || typeMatch[1] === 'WEAKAURAS') {
          typeMatch[1] = 'WEAKAURAS2'
        } 
        else if (typeMatch[1] === 'TOTALRP') {
          typeMatch[1] = 'TOTALRP3'
        }
        lookup.type = typeMatch[1]

        Search.query.context.push({
          query: typeMatch[0],
          type: 'type',
          wagoType: typeMatch[1]==='WEAKAURAS2' && 'WEAKAURA' || typeMatch[1],
          image: '/media/wagotypes/' + typeMatch[1] + '.png'
        })
        esFilter.push({match: { type: typeMatch[1] } })
        
      }
      return done()
    },

    // if search includes 'user: username'
    function(done) {
      const regex = /\buser:\s*([^\s]+)|\buser:\s*"([^"]+)"/ig
      var userSearch = query.match(regex)
      if (!userSearch || userSearch.length==0) return done()

      async.each(userSearch, function(userQuery, cb) {
        var userMatch
        if ((userMatch = regex.exec(userSearch)) !== null) {
          // user: username context found. Remove tag from query and search DB
          query = query.replace(userMatch[0], '').replace(/\s{2,}/, ' ').trim()
          User.findOne({ "search.username": (userMatch[1] || userMatch[2]).toLowerCase() }).then((user) => {
            if (user) {
              lookup._userId = user._id
              esFilter.push({term: { _userId: user._id } })

              Search.query.context.push({
                query: userMatch[0],
                type: 'user',
                image: user.avatarURL,
                user: {
                  url: user.profile.url,
                  roleClass: user.roleClass,
                  name: user.account.username || 'User-' + user._id.toString()
                }
              })
            }

            return cb()
          })
        }
        else {
          return cb()
        }
      }, function() {
        done()
      })
    },

    // if search includes 'tag: tagname'
    function(done) {
      const regex = /\btag:\s*([\w\-]+)|\btag:\s*"([^"]+)"/ig
      var tagSearch = query.match(regex)
      if (!tagSearch || tagSearch.length==0) return done()

      async.each(tagSearch, function(tagQuery, cb) {
        var tagMatch
        if ((tagMatch = regex.exec(tagSearch)) !== null) {
          // valid tag context found. Remove tag from query and search DB
          query = query.replace(tagMatch[0], '').replace(/\s{2,}/, ' ').trim()
          var tags = (tagMatch[1] || tagMatch[2]).split(',')
          var related = []
          tags.forEach((thisTag) => {
            lookup.categories = lookup.categories || {"$all": []}
            lookup.categories["$all"].push(thisTag)
            esTags = [{ term: { "categories.keyword": thisTag } }]

            Search.query.context.push({
              query: tagMatch[0],
              type: 'tag',
              tag: thisTag
            })

            global.Categories.getClones(thisTag).forEach((clone) => {
              lookup.categories["$all"].push(clone)
              esTags.push({ term: { categories: clone } })
            })
            esFilter.push({bool: { should: esTags } })
          })

          // if there is only one tag or one set of related tags then we can show other related tags
          if (tagMatch.length === 1 && related.length === 1) {
            Search.query.related = Categories.findByClass(related[0], lookup.type)
          }
          return cb()
        }
        else {
          return cb()
        }
      }, function() {
        done()
      })
    },

    // if search includes 'collection: id`
    function(done) {
      const regex = /\bcollection:\s*([a-zA-Z0-9\-_]+)|\bcollection:\s*"([^"]+)"/ig
      var collectIDs = query.match(regex)
      if (!collectIDs || collectIDs.length==0) return done()
      lookup._id = []
      async.each(collectIDs, function(_ids, cb) {
        if ((collectMatch = regex.exec(_ids)) !== null) {
          query = query.replace(collectMatch[0], '').replace(/\s{2,}/, ' ').trim()
          WagoItem.findById([collectMatch[1], collectMatch[2]]).then((collection) => {
            if (collection && collection.collect) {
              defaultAnon = true // default anon items to on
              if (collection.hidden) { // if collection is hidden then allow hidden imports to be shown
                allowHidden = true
              }
              lookup._id = lookup._id.concat(collection.collect)
            }
            cb()
          })
        }
        else {
          return cb()
        }
      }, function() {
        if (lookup._id.length > 0) {
          esFilter.push({ids: { values: lookup._id } })
        }
        done()
      })
    },

    // option for anonymous imports
    function(cb) {
      // ignore if we are searching a specific user
      if (lookup._userId) return cb()

      const regex = /\banon:\s*(1|0|true|false|force)\b/ig
      var anonSearch
      if ((anonSearch = regex.exec(query)) !== null) {
        query = query.replace(anonSearch[0], '')
        if (anonSearch[1]=='1' || anonSearch[1].toLowerCase()=='true') {
          // do not exclude anonymous
          Search.query.context.push({
            query: anonSearch[0],
            type: 'option',
            option: {
              name: 'anon',
              enabled: true
            }
          })
        }
        else if (anonSearch[1]=='force') {
          // ONLY return anonymous
          Search.query.context.push({
            query: anonSearch[0],
            type: 'option',
            option: {
              name: 'anon',
              force: true,
              enabled: false
            }
          })
          esFilter.push({bool: { must_not: [{ exists: { field: "_userId" } }] } })
        }
        else if (anonSearch[1]=='0' || anonSearch[1].toLowerCase()=='false') {
          // exclude anonymous (default)
          Search.query.context.push({
            query: anonSearch[0],
            type: 'option',
            option: {
              name: 'anon',
              enabled: false
            }
          })
          esFilter.push({exists: { field: "_userId" } })
        }
        
        else if (!defaultAnon) {
          esFilter.push({exists: { field: "_userId" } })
        }

        return cb()
      }
      else if (!defaultAnon) {
        esFilter.push({exists: { field: "_userId" } })
        return cb()
      }
      else {
        return cb()
      }
    },

    // option for my-favorites
    function(cb) {
      // option only valid for logged in users
      if (!req.user) return cb()

      const regex = /\bstarred:\s*(1|0|true|false)\b/ig
      var faveSearch
      if ((faveSearch = regex.exec(query)) !== null) {
        query = query.replace(faveSearch[0], '')
        if (faveSearch[1]=='1' || faveSearch[1].toLowerCase()=='true') {
          // only include what user has starred
          lookup['popularity.favorites'] = req.user._id
          Search.query.context.push({
            query: faveSearch[0],
            type: 'option',
            option: {
              name: 'starred',
              enabled: true
            }
          })
          esFilter.push({term: { 'popularity.favorites': req.user._id } })
        }
        else {
          // only include what user has NOT starred
          lookup['popularity.favorites'] = { "$ne": req.user._id }
          Search.query.context.push({
            query: faveSearch[0],
            type: 'option',
            option: {
              name: 'starred',
              enabled: false
            }
          })
          //esFilter.push({must_not: {term: { 'popularity.favorites': req.user._id } } })
        }

        return cb()
      }
      else {
        return cb()
      }
    },

    // option for my-mention alerts
    function(cb) {
      // option only valid for logged in users
      if (!req.user) return cb()

      const regex = /\balert:\s*(1|0|true|false)\b/ig
      var alertSearch
      if ((alertSearch = regex.exec(query)) !== null) {
        query = query.replace(alertSearch[0], '')
        if (alertSearch[1]=='1' || alertSearch[1].toLowerCase()=='true') {
          Search.query.context.push({
            query: alertSearch[0],
            type: 'option',
            option: {
              name: 'alert',
              enabled: (alertSearch[1]=='1' || alertSearch[1].toLowerCase()=='true')
            }
          })
          Comments.findMentions(req.user._id).then((mentions) => {
            // if no wago's have alerts then return no results
            if (!mentions || !mentions[0]) {
              lookup._id = false
              return cb()
            }
            mentions.forEach((comment) => {
              // only include what the user has an alert on
              if (alertSearch[1]=='1' || alertSearch[1].toLowerCase()=='true') {
                if (!comment.usersTagged[0].read) {
                  lookup.priority = lookup.priority || []
                  lookup.priority.push(comment.wagoID)
                }
                else {
                  lookup._id = lookup._id || {"$in": []}
                  lookup._id["$in"].push(comment.wagoID)
                }
              }
            })
            return cb()
          })
        }
        else {
          return cb()
        }
      }
      else {
        return cb()
      }
    },
    

  ], () => {
    // any actual search terms?
    // make sure excess space is removed
    query = query.replace(/\s{2,}/g, ' ').trim()
    // prevent regex attacks
    query = query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
    if (query) {
      // convert lookup object into $and Array
      lookup = { "$and": [lookup] }

      // remaining search query
      Search.query.textSearch = query
      lookup["$text"] = { "$search": query }
      esQuery = query
    }

    // limit lookup to what we have access to
    lookup['deleted'] = false
    esFilter.push({term: { deleted: false } })
    
    var esShould = []
    if (req.user && lookup._userId && req.user._id.equals(lookup._userId)) {
      // no additional filters needed
    }
    else if (req.user && !allowHidden) {
      esShould.push({term: { _userId: { value: req.user._id, boost: 0 } } })
      esShould.push({bool: {filter: [{ term: { private: { value: false, boost: 0 } } }, { term: { hidden: { value: false, boost: 0 } } }] } })
    }
    else if (req.user) {
      esShould.push({term: { _userId: { value: req.user._id, boost: 0 } } })
      esShould.push({term: { private: { value: false, boost: 0 } } })
    }
    else if (!allowHidden) {
      esFilter.push({term: { private: false } })
      esFilter.push({term: { hidden: false } })
    }
    else {      
      esFilter.push({term: { private: false } })
    }

    // search wago for all of our criteria    
    if (esShould.length > 0) {
      // should = array of OR, add to filter
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
      esQuery = { match_all: {} }
    }
      
    var runSearch = new Promise((resolve, reject) => {
      if (lookup.priority && page === 0) {
        resultsPerPage = 100 // show all priority results at once - should rarely be over the standard 20 anyway.
        esFilter.push({simple_query_string: {query: lookup.priority.join(' '), fields: ["_id"] }})
      }
      else if (lookup.priority && lookup._id && lookup._id["$in"]) {
        page-- // show first page of non priority results
        esFilter.push({simple_query_string: {query: lookup._id["$in"].join(' '), fields: ["_id"] }})
      }
      else if (lookup._id && lookup._id["$in"]) {
        esFilter.push({simple_query_string: {query: lookup._id["$in"].join(' '), fields: ["_id"] }})
        // esFilter.push({ids: { type: "_doc", values: lookup._id["$in"] } }) 
      }
      WagoItem.esSearch({
        query: {
          bool: {
            must: esQuery,
            filter: esFilter
          }
        },          
      },
      { hydrate: true, sort: esSort, size: resultsPerPage, from: resultsPerPage*page}, (err, results) => {
        if (err) {
          logger.error({label: 'ElasticSearch error', err})
          reject(err)
        }
        else {
          resolve(results)
        }
      })
    })
    // else {
    //   var runSearch = WagoItem.find(lookup).sort(sort).skip(resultsPerPage*page).limit(resultsPerPage)
    // }
    
    runSearch.then((docs) => {
      if (!docs) {
        Search.total = 0
        Search.results = []
        return res.send(Search)
      }

      // initialize results
      if (docs.hits && docs.hits.hits) {
        Search.total = docs.hits.total
        Search.results = docs.hits.hits
      }
      else {      
        Search.results = docs
      }

      Search.meta = {}
      if (lookup.priority && Search.total < 20) {
        Search.meta.forceNextPage = true
      }


      // for each found result...
      async.forEachOf(Search.results, function (wago, async_key, next) {
        if (!wago) {
          delete Search.results[async_key]
          return next()
        }
        // setup return object
        var item = {}
        item.name = wago.name
        item.slug = wago.slug
        item.url = wago.url
        if (wago.type=='WEAKAURAS2' || wago.type=='WEAKAURA2') {
            wago.type = 'WEAKAURA';
        }
        item.type = wago.type
        item.description = { text: wago.description, type: 'bbcode' }
        item.visibility = { private: wago.private, hidden: wago.hidden }
        item.date = { created: wago.created, modified: wago.modified }
        item.description = { text: wago.description, format: 'bbcode' }
        item.categories = wago.categories.slice(0, 5)

        item.viewCount = wago.popularity.views
        item.commentCount = wago.popularity.comments_count
        item.downloadCount = wago.popularity.downloads
        item.embedCount = wago.popularity.embeds
        item.favoriteCount = wago.popularity.favorite_count

        // if logged in check for myfave and mentions
        if (req.user) {
          for (var i=0; i<wago.popularity.favorites.length; i++) {
            if (wago.popularity.favorites[i].equals(req.user._id)) {
              item.myfave = true
              break
            }
          }

          if (req.user.unreadMentions.indexOf(wago._id) >= 0) {
            item.unreadMention = true
          }
        }

        // look up additional data
        async.parallel([
          // count total results
          function (done) {
            if (Search.total) {
              return done()
            }
            WagoItem.count(lookup).then((num) => {
              Search.total = num
              done()
            })
          },

          // get screenshot
          function (done) {
            if (wago.image && wago.image[0]) {
              if (wago.image[0].files.png) {
                item.thumbnail = wago.image[0].files.png
              }
              if (wago.image[0].files.jpg) {
                item.thumbnail = wago.image[0].files.jpg
              }
              if (item.thumbnail && item.thumbnail.indexOf(/https?:\/\//) < 0) {
                item.thumbnail = 'https://media.wago.io/images/'  + item.thumbnail
              }
              return done()
            }
            Screenshot.findOne({auraID: wago._id}).sort({sort:1}).then((screen) => {
              if (!screen) return done()

              item.thumbnail = screen.url
              done()
            })
          },

          // get username
          function (done) {
            // set defaults
            item.user = { name: "a Guest" }
            item.user.searchable = false
            item.user.roleClass = 'user-default'
            item.user.avatar = 'https://api.adorable.io/avatars/60/' + wago._id + '.png'

            if (!wago._userId) return done()

            User.findById(wago._userId).then((user) => {
              if (!user) return done()

              // if user found 
              item.user.name = user.account.username
              item.user.searchable = !user.account.hidden
              item.user.roleClass = user.roleclass
              item.user.avatar = user.avatarURL
              return done()
            })
          }
        ], () => {
          Search.results[async_key] = item
          next()
        })
      },
      // once forEach is done and we have all our results
      () => {
        // called once parallel is done
        if (page === 0) {
          WagoItem.count(lookup).then((count) => {
            res.send(Search)
          })
        }
        else {
          res.send(Search) 
        }
      })
    })
  })
})