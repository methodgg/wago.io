
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  bnetID: {type: Number, index: true},
  bnetUpdate: Number,
  _userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Users'},

  region: {type: String, index: true},
  realm: {type: String},
  realmSlug: {type: String, index: true},
  name: {type: String, index: true},
  guild: {type: String, index: true},
  guildRealm: {type: String},
  guildRealmSlug: {type: String, index: true},

  class: Number,
  faction: String,
  race: Number,

  achievements: {
    points: Number
  },
  updated: Date,
  mediaTimestamp: Number
})

Schema.pre('validate', function() {
  this.updated = new Date()
})

const WoWChar = mongoose.model('WoWChar', Schema)
module.exports = WoWChar