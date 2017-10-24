server.get('/search', (req, res, skipSearch) => {
  // get input
  var query = req.params.q || req.body.q || ""
  var sort = req.params.sort || req.body.sort || '-modified'
  var page = parseInt(req.query.page || req.body.page || 0)

  // set constants
  const resultsPerPage = 20 // TODO: make this a global config

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

  // build criteria to search for
  async.series([
    // if search includes 'type: wagotype'
    function(done) {
      const regex = /\btype:\s*"?(weakauras?2?|elvui|vuhdo|collection|snippet|encounternotes|image|audio)"?/i
      var typeSearch = query.match(regex)
      if (!typeSearch || typeSearch.length==0) return done()

      if ((typeMatch = regex.exec(typeSearch)) !== null) {
        // valid wagotype context found. Remove tag from query and update lookup
        query = query.replace(typeMatch[0], '').replace(/\s{2,}/, ' ').trim()
        typeMatch[1] = typeMatch[1].toUpperCase()

        if (typeMatch[1] === 'WEAKAURA' || typeMatch[1] === 'WEAKAURA2' || typeMatch[1] === 'WEAKAURAS') {
          typeMatch[1] = 'WEAKAURAS2'
        }        
        lookup.type = typeMatch[1]

        Search.query.context.push({
          query: typeMatch[0],
          type: 'type',
          wagoType: typeMatch[1]==='WEAKAURAS2' && 'WEAKAURA' || typeMatch[1],
          image: '/media/wagotypes/' + typeMatch[1] + '.png'
        })
      }
      return done()
    },

    // if search includes 'user: username'
    function(done) {
      const regex = /\buser:\s*([\w\-]+)|\buser:\s*"([^"]+)"/ig
      var userSearch = query.match(regex)
      if (!userSearch || userSearch.length==0) return done()

      async.each(userSearch, function(userQuery, cb) {
        var userMatch
        if ((userMatch = regex.exec(userSearch)) !== null) {
          // user: username context found. Remove tag from query and search DB
          query = query.replace(userMatch[0], '').replace(/\s{2,}/, ' ').trim()
          User.findOne({ "search.username": (userMatch[1] || userMatch[2]).toLowerCase() }).then((user) => {
            if (user) {
              lookup._userId = lookup._userId || {"$in": []}
              lookup._userId["$in"].push(user._id)

              Search.query.context.push({
                query: userMatch[0],
                type: 'user',
                image: user.avatarURL,
                user: {
                  url: user.profile.url,
                  roleClass: user.roleClass,
                  name: user.profile.name
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

            Search.query.context.push({
              query: tagMatch[0],
              type: 'tag',
              tag: thisTag
            })
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
              lookup._id = lookup._id.concat(collection.collect)
            }
            cb()
          })
        }
        else {
          return cb()
        }
      }, function() {
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
          lookup._userId = { "$exists": false }
          Search.query.context.push({
            query: anonSearch[0],
            type: 'option',
            option: {
              name: 'anon',
              force: true,
              enabled: false
            }
          })
        }
        else if (anonSearch[1]=='0' || anonSearch[1].toLowerCase()=='false') {
          // do not exclude anonymous
          lookup._userId = { "$exists": true }
          Search.query.context.push({
            query: anonSearch[0],
            type: 'option',
            option: {
              name: 'anon',
              enabled: false
            }
          })
        }
        
        else if (!defaultAnon) {
          lookup._userId = { "$exists": true }
        }

        return cb()
      }
      else if (!defaultAnon) {
        lookup._userId = { "$exists": true }
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
          Comments.findUnread(req.user._id).then((mentions) => {
            // if no wago's have alerts then return no results
            if (!mentions || !mentions[0]) {
              lookup._id = false
              return cb()
            }
            mentions.forEach((comment) => {
              // only include what the user has an alert on
              if (alertSearch[1]=='1' || alertSearch[1]=='true') {
                lookup._id = lookup._id || {"$in": []}
                lookup._id["$in"].push(mentions.wagoID)
              }
              // only include what the user has an alert on (why would anyone ever want to?)
              else {
                lookup._id = lookup._id || {"$nin": []}
                lookup._id["$nin"].push(mentions.wagoID)
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

      query.split(' ').forEach((word) => {
        // create regex
        var wordRegex = new RegExp('\\b'+word+'\\b', 'i')
        // setup $or array
        var textSearch = []
        textSearch.push({"name": wordRegex})
        textSearch.push({"description": wordRegex})
        lookup["$and"].push({"$or": textSearch})
        // results in { "$and": [ { "$or": [ {"name": "word"}, {"description": "word"} ] } ] }
      })
    }

    // limit lookup to what we have access to
    lookup['deleted'] = false
    if (req.user) {
      lookup['$or'] = [{ '_userId': req.user._id }, { private: false, hidden: false }]
    }
    else {
      lookup['private'] = false
      lookup['hidden'] = false
    }

    // search wago for all of our criteria
    WagoItem.find(lookup).sort(sort).skip(resultsPerPage*page).limit(resultsPerPage).then((docs) => {
      if (!docs) {
        Search.total = 0
        Search.results = []
        return res.send(Search)
      }
      
      // initialize results
      Search.results = Array.apply(null, Array(docs.length)).map(function () {})

      // for each found result...
      async.forEachOf(docs, function (wago, async_key, next) {
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
            WagoItem.count(lookup).then((num) => {
              Search.total = num
              done()
            })
          },

          // get screenshot
          function (done) {
            Screenshot.findOne({auraID: wago._id}).then((screen) => {
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
            Search.total = count
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