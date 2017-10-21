const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  wagoID: {type: String, index: true},
  viewed:  { type: Date, default: Date.now, expires: 604800 } // expires after 1 week
})

const ViewsThisWeek = mongoose.model('ViewsThisWeek', Schema)
module.exports = ViewsThisWeek