const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({    
  auraID : { type: String, ref: 'WagoItem', index: true },
	encoded : String,
  json : String,
  updated : { type: Date, default: Date.now },
  lua : String,
  version: Number,
  build: String,
  changelog: String
});

Schema.index({json: 'text'})

/**
 * Statics
 */
// Find selected code version, or latest if not supplied
Schema.statics.lookup = function(id, version) {
  if (version && version > 0 && parseInt(version) == version) {
    return this.findOne({auraID: id}).sort({updated: 1}).skip(version - 1).exec()
  }
  else {
    return this.findOne({auraID: id}).sort({updated: -1}).exec()
  }
}


// create the model for users and expose it to our app
const WagoCode = mongoose.model('AuraCode', Schema)
module.exports = WagoCode