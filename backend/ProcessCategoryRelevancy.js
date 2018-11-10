// requires
const config = require('./config')
const mongoose = require('mongoose')
const async = require('async')
const fs = require('fs')

// connect mongoose
db = mongoose.connect(config.db.uri)
mongoose.Promise = global.Promise
var models = fs.readdirSync('./api/models')

// categories
global['Categories'] = require('../frontend/src/components/libs/categories')

// mongoose models
global['WagoItem'] = require('./api/models/WagoItem')

WagoItem.find({"relevancy.strict": {"$exists": false}, "categories.0": {"$exists": true} }).limit(5000).then((docs) => {
  docs.forEach((wago) => {
    // keep system tags
    var systemTags = Categories.filterSystemTags(wago.categories)
    // validate, group and sort categories
    wago.categories = Categories.validateCategories(wago.categories)
    // generate scores
    wago.relevancy = Categories.relevanceScores(wago.categories)
    // add system tags back in
    wago.categories = wago.categories.concat(systemTags)
    
    wago.save()
  })
})