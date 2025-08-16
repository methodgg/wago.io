const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  name: {type: String, index: true},
  online: Date,
  offline: Date,
  viewers: Number,
  wagoViewers: Number,
  title: String,
  game: String,
  service: {type: String, default: 'twitch'}
})

const Streamers = mongoose.model('Streamers', Schema)
module.exports = Streamers