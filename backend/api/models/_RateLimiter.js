const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  key: { type: String, index: true },
  expires :  { type: Date, expireAfterSeconds: 1 },
  _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }  
})

Schema.statics.incr = function (key, expires, done) {
  new this({key, expires}).save().then((doc) => {
    this.countDocuments({key: key}).then((num) => {
      done(null, num, doc)
    })
  })
}

const RateLimit = mongoose.model('_RateLimit', Schema)
module.exports = RateLimit