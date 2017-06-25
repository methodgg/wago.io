// app/models/aura-code.js

var mongoose = require('mongoose');

// define the schema for our user model
var auraCodeSchema = mongoose.Schema({
    auraID : { type: String, ref: 'Aura', index: true },
	encoded : String,
    json : String,
    updated : { type: Date, default: Date.now },
    lua : String,
    version: Number,
    build: String,
    changelog: String
});

auraCodeSchema.index({json: 'text'})

// create the model for users and expose it to our app
module.exports = mongoose.model('AuraCode', auraCodeSchema);