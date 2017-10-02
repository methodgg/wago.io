const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      Mixed = mongoose.Schema.Types.Mixed

const Schema = new mongoose.Schema({
    _id: { type: String, unique: true },
    value: Mixed
}, { timestamps: true });


const SiteData = mongoose.model('SiteData', Schema)
module.exports = SiteData