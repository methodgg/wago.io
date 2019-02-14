const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      Mixed = mongoose.Schema.Types.Mixed

const Schema = new mongoose.Schema({
    _id: { type: String },
    value: Mixed,
    locale: { type: String, index: true }
}, { timestamps: true });


const BlizzData = mongoose.model('BlizzData', Schema)
module.exports = BlizzData