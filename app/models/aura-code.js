// app/models/auracode.js

var mongoose = require('mongoose');

// define the schema for our user model
var auraCodeSchema = mongoose.Schema({
    auraID : { type: String, ref: 'Aura' },
	encoded : String,
    json : String,
    updated : { type: Date, default: Date.now },
    lua : String,
    version: Number             
});

// create the model for users and expose it to our app
module.exports = mongoose.model('AuraCode', auraCodeSchema);