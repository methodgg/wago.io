const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  wagoID: {type: String, index: true},
  type: {type: String, index: true}, // Star, Install
  userID : { type: mongoose.Schema.Types.ObjectId, index: true },
  appID : {type: String, index: true},
  timestamp : { type: Date, default: Date.now }
})

Schema.statics.addStar = function (wago, userID) {
  this.findOneAndUpdate({wagoID: wago._id, appID: appID, type: 'Star'}, {wagoID: wago._id, appID: appID, type: 'Star', timestamp: Date.now()}, {upsert: true, new: true}).then(() => {
    this.count({wagoID: wago._id, type: 'Star'}).then((num) => {
      wago.popularity.favorite_count = num
      wago.save()
    })
  })
}

Schema.statics.removeStar = function (wago, userID) {
  var obj = {wagoID: wago._id, userID: userID, type: 'Star', timestamp: Date.now()}
  this.findOneAndRemove(obj).then(() => {
    this.count({wagoID: wago._id, type: 'Star'}).then((num) => {
      wago.popularity.favorite_count = num
      wago.save()
    })
  })
}

Schema.statics.addInstall = function (wago, appID) {
  this.findOneAndUpdate({wagoID: wago._id, appID: appID, type: 'Install'}, {wagoID: wago._id, appID: appID, type: 'Install', timestamp: Date.now()}, {upsert: true, new: true}).then(() => {
    this.count({wagoID: wago._id, type: 'Install'}).then((num) => {
      wago.popularity.installed_count = num
      wago.save()
    })
  })
}

const Favorites = mongoose.model('WagoFavorites', Schema)
module.exports = Favorites