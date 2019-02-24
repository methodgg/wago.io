const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  key: { type: String, index: true },
  expires :  { type: Date, expireAfterSeconds: 1 },
  url: String
})

Schema.statics.incr = async function (key, expires, url) {
  await new this({key, expires, url}).save()
  return await this.countDocuments({key: key})
}

Schema.statics.decr = function (key) {
  this.deleteOne({key}).exec()
}

const RateLimit = mongoose.model('_RateLimit', Schema)
module.exports = RateLimit