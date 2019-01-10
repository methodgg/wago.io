const mongoose = require('mongoose'),
      Mixed = mongoose.Schema.Types.Mixed

const Schema = new mongoose.Schema({
    log: { type: String, index: true },
    dungeons: [Mixed],
    enemies: Mixed,
    time: {
      start: Date,
      end: Date
    },
    expires: { type: Date, default: Date.now, expires: 15*3600 } // expires in 15 minutes
})

Schema.statics.lookup = function(logID) {
  return this.findOne({log: logID}).exec()
}


const WCL = mongoose.model('WarcraftLogs', Schema)
module.exports = WCL