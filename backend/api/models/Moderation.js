const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({
  wagoID: {type: String, index: true},
  authorID: { type: ObjectId, ref: 'Users', index: true},
  date: {type: Date, default: Date.now},
  action: {type: String},
  details: {type: String},
  comment: {type: String},
})


const Moderation = mongoose.model('Moderation', Schema)
module.exports = Moderation