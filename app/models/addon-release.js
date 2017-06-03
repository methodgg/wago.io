// app/models/aura-code.js

var mongoose = require('mongoose');

// define the schema for our user model
var addonSchema = mongoose.Schema({
    addon: String,
    phase: String,
    url: String,
    version: String,
    gameVersion: String,
    date: Date,
    active: {type: Boolean, default: true}
});

// create the model for users and expose it to our app
module.exports = mongoose.model('AddonRelease', addonSchema);