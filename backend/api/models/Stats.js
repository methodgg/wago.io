const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  name: {type: String, index: true},
  date: {type: Date, index: true},
  value: Number
})

const Stats = mongoose.model('Stats', Schema)
module.exports = Stats