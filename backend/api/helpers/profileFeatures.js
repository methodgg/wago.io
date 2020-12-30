
module.exports = {
  get: async function (_userId, features, editMode) {
    var data = []
    if (features.toObject) {
      features = features.toObject()
    }
    for (feature of features) {
      if (feature.type === 'wago') {
        var sort
        var query
        var rootValue
        var popValue
        var collection

        feature.data = {}
        feature.data.cards = [{}, {}, {}, {}, {}]
        
        if (feature.subtype === 'imports') {
          query = {_userId, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}
        }
        else if (feature.subtype === 'collection' && feature.config && feature.config.item) {
          collection = await WagoItem.findOne({type: "COLLECTION", _id: feature.config.item, hidden: false, encrypted: false, private: false, deleted: false}).select({name: 1, collect: 1}).exec()
          query = {_id: {$in: collection.collect}, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}
          feature.data.collection = collection.name
          feature.data.collectionID = collection._id
        }

        if (feature.imports === 'popular') {
          sort = {"popularity.viewsThisWeek": -1, "popularity.views": -1}
          popValue = 'viewsThisWeek'
        }
        else if (feature.imports === 'stars') {
          sort = {"popularity.favorite_count": -1, "popularity.viewsThisWeek": -1, "popularity.views": -1}
          popValue = 'favorite_count'
        }
        else if (feature.imports === 'views') {
          sort = {"popularity.views": -1, "popularity.favorite_count": -1}
          popValue = 'views'
        }
        else if (feature.imports === 'updates') {
          sort = {"modified": -1}
          rootValue = 'modified'
        }
        else if (feature.imports === 'manual' && feature.subtype === 'imports' && feature.config && feature.config.select && feature.config.select.length) {
          sort = {}
          query = {_id: {$in: feature.config.select}, _userId, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}
        }
        else if (feature.imports === 'manual' && feature.subtype === 'collection' && feature.config && feature.config.select && feature.config.select.length && collection) {
          sort = {}
          var selectCollect = []
          for (let c of collection.collect) {
            for (let s of feature.config.select) {
              if (c === s) {
                selectCollect.push(c)
              }
            }
          }
          query = {_id: {$in: selectCollect}, _userId, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}
        }

        if (query && sort) {
          const cards = await WagoItem.find(query).sort(sort).limit(5).exec()
          
          if (feature.imports === 'manual') {
            for (let k = 0; k < feature.config.select.length; k++) {              
              feature.data.cards[k] = {}
              if (!feature.config.select[k]) {
                continue
              }
              for (let i = 0; i < cards.length; i++) {
                if (cards[i].type === 'WEAKAURAS2') {
                  cards[i].type = 'WEAKAURA'
                }
                if (feature.config.select[k] === cards[i]._id) {
                  feature.data.cards[k] = {_id: cards[i].slug, name: cards[i].name, value: cards[i].popularity[popValue], thumbnail: await cards[i].getThumbnailURL(2), type: cards[i].type}
                  break
                }
              }
            }
          }
          else {
            for (let i = 0; i < cards.length; i++) {
              if (cards[i].type === 'WEAKAURAS2') {
                cards[i].type = 'WEAKAURA'
              }
              if (popValue) {
                feature.data.cards[i] = {_id: cards[i].slug, name: cards[i].name, value: cards[i].popularity[popValue], thumbnail: await cards[i].getThumbnailURL(2), type: cards[i].type}
              }
              else {
                feature.data.cards[i] = {_id: cards[i].slug, name: cards[i].name, value: cards[i][rootValue], thumbnail: await cards[i].getThumbnailURL(2), type: cards[i].type}
              }
            }
          }
        }
        else {
          if (!feature.config) {
            feature.config = {}
          }
          feature.config.select = []
        }
        if (feature.imports === 'manual' && feature.subtype === 'imports' && editMode) {
          const Options = await WagoItem.find({_userId, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}).sort({name: 1}).exec()
          let options = []
          for (let opt of Options) {
            options.push({_id: opt._id, name: opt.name, thumbnail: await opt.getThumbnailURL(2)})
          }
          feature.data.options = options
          console.log(!feature.config.select.length)
          if (!feature.config.select.length) {
            feature.config.select = ['', '', '', '', '']
          }
        }
        else if (feature.imports === 'manual' && feature.subtype === 'collection' && collection && editMode) {
          const Options = await WagoItem.find({_id: {$in: collection.collect}, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: {$nin: ['ERROR', 'COLLECTION' ,'IMAGE']}}).sort({name: 1}).exec()
          let options = []
          for (let opt of Options) {
            options.push({_id: opt._id, name: opt.name, thumbnail: await opt.getThumbnailURL(2)})
          }
          feature.data.options = options
          if (!feature.config.select.length) {
            feature.config.select = ['', '', '', '', '']
          }
        }
        
        if (feature.subtype === 'collection' && editMode) {
          feature.data.collections = await WagoItem.find({_userId, hidden: false, encrypted: false, private: false, restricted: false, deleted: false, type: 'COLLECTION'}).sort({name: 1}).select({name: 1}).lean().exec()
        }
      }

      if (editMode) {
        feature.edit = true
      }
      else {
        feature.config = {}
      }
      data.push(feature)
    }
    return data
  }
}