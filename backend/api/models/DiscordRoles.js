const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  _id: String,
  guildID: { type: String, index: true },
  name: String
})

module.exports = mongoose.model('DiscordRoles', Schema)