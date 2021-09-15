// model ImportScan
// fields: _id, type, input, decoded, date(expires 11min)
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  type: String,
  categories: [String],
  game: String,
  domain: Number,
  input: String,
  decoded: String,
  fork: String,
  addon: String,
  description: String,
  expires: { type: Date, default: Date.now, expires: 11*3600 } // expires in 11 minutes (client js assumes 10 minutes to account for delay)
})

const ImportScan = mongoose.model('ImportScan', Schema)
module.exports = ImportScan