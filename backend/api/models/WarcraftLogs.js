const mongoose = require('mongoose'),
      Mixed = mongoose.Schema.Types.Mixed

const Schema = new mongoose.Schema({
    log: { type: String, index: true },
    dungeons: [Mixed],
    enemies: Mixed
})

Schema.statics.lookup = function(logID) {
  return this.findOne({log: logID}).exec()
}


const WCL = mongoose.model('WarcraftLogs', Schema)
module.exports = WCL