const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  key: { type: String, index: true },
  expires_at :  { type: Date, default: Date.now, expires: 60 * 60 * 1000 },
  _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }  
})

Schema.statics.incr = function (key, _userID, done) {
  new this({key, _userID}).save().then((doc) => {
    this.count({key: key}).then((num) => {
      done(null, num, doc)
    })
  })
}

const RateLimit = mongoose.model('_RateLimit', Schema)
module.exports = RateLimit