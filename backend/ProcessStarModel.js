// requires
const config = require('./config')
global.CRONTASK = true
const mongoose = require('mongoose')
const async = require('async')
const fs = require('fs')

// connect mongoose
db = mongoose.connect(config.db.uri)
mongoose.Promise = global.Promise
var models = fs.readdirSync('./api/models')

// mongoose models
global['WagoItem'] = require('./api/models/WagoItem')
global['WagoFavorites'] = require('./api/models/WagoFavorites')

var i = 0
WagoItem.find({"popularity.favorite_count": {"$gt": 0}}).select('popularity').then((docs) => {
  docs.forEach((wago) => {
    console.log(wago._id, ++i)
    wago.popularity.favorites.forEach((userID) => {
      WagoFavorites.addStar(wago, userID)
    })
  })
})