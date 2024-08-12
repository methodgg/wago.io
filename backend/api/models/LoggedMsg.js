// model LoggedMsg
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  type: String,
  message: String,
  obj: mongoose.Schema.Types.Mixed,
  expires: { type: Date, default: Date.now, expires: 86400 } // 1 day
})

Schema.statics.write = async function(type, message, obj) {
    this.create({type, message, obj})
}

const LoggedMsg = mongoose.model('LoggedMsg', Schema)
module.exports = LoggedMsg