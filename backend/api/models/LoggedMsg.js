// model LoggedMsg
const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  type: String,
  message: String,
  obj: mongoose.Schema.Types.Mixed,
  expires: { type: Date, default: Date.now, expires: 86400 } // 1 day
})

Schema.statics.write = async function(type, message, obj) {
    const serializedError = {
        message: obj?.message,
        name: obj?.name,
        stack: obj?.stack,
        config: obj?.config,
        code: obj?.code,
        status: obj?.response?.status,
        data: obj?.response?.data,
        headers: obj?.response?.headers
    };
    this.create({type, message, obj: serializedError})
}

const LoggedMsg = mongoose.model('LoggedMsg', Schema)
module.exports = LoggedMsg