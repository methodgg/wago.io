const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      Mixed = mongoose.Schema.Types.Mixed

const Schema = new mongoose.Schema({
    _id: { type: String },
    value: Mixed,
    private: {type: Boolean, default: false}
}, { timestamps: true });


const SiteData = mongoose.model('SiteData', Schema)
module.exports = SiteData