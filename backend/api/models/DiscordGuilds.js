const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  _id: String,
  name: String
});

module.exports = mongoose.model('DiscordGuilds', Schema)