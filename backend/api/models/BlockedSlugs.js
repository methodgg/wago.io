const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    slug: String
});


const BlockedSlugs = mongoose.model('BlockedSlugs', Schema)
module.exports = BlockedSlugs