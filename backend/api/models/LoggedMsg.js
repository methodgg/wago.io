// model LoggedMsg
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  type: String,
  message: String,
  obj: mongoose.Schema.Types.Mixed,
  expires: { type: Date, default: Date.now, expires: 86400 } // 1 day
})

Schema.statics.write = async function(type, message, obj) {
    this.create({type, message, obj: {
        name: obj.name,
        type: obj.type,
        url: obj.url,
        stack: obj.stack, 
        request: obj.request,
        response: obj.response
    }})
}

const LoggedMsg = mongoose.model('LoggedMsg', Schema)
module.exports = LoggedMsg