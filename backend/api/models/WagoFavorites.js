const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  wagoID: {type: String, index: true},
  type: {type: String, index: true}, // Star, Install
  userID : { type: mongoose.Schema.Types.ObjectId, index: true },
  appID : {type: String, index: true},
  ipAddress : {type: String, index: true},
  timestamp : { type: Date, default: Date.now }
})

Schema.statics.addStar = async function (wago, userID) {
  await this.findOneAndUpdate({wagoID: wago._id, userID: userID, type: 'Star'}, {wagoID: wago._id, userID: userID, type: 'Star', timestamp: Date.now()}, {upsert: true, new: true}).exec()
  const num = await this.countDocuments({wagoID: wago._id, type: 'Star'})
  wago.popularity.favorite_count = num
  wago.save()
}

Schema.statics.removeStar = async function (wago, userID) {
  await this.findOneAndRemove({wagoID: wago._id, userID: userID, type: 'Star'}).exec()
  const num = await this.countDocuments({wagoID: wago._id, type: 'Star'})
  wago.popularity.favorite_count = num
  wago.save()
}

Schema.statics.addInstall = async function (wagoID, appID, ipAddress) {
  const exists = await this.findOne({wagoID:wagoID, type: 'Install', $or: [{appID: appID}, {ipAddress: ipAddress}]}).exec()
  if (!exists) {
    await this.create({wagoID: wagoID, appID: appID, type: 'Install', timestamp: Date.now(), ipAddress: ipAddress})
    const num = await this.countDocuments({wagoID: wagoID, type: 'Install'})
    const wago = await WagoItems.findById(wagoID)
    wago.popularity.installed_count = num
    await wago.save()
  }
}

const Favorites = mongoose.model('WagoFavorites', Schema)
module.exports = Favorites