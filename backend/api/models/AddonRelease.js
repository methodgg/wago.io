const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  addon: String,
  phase: String,
  url: String,
  version: String,
  gameVersion: String,
  date: Date,
  active: {type: Boolean, default: true}
})

const AddonRelease = mongoose.model('AddonRelease', Schema)
module.exports = AddonRelease