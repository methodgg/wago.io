const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({    
  auraID : { type: String, ref: 'WagoItem', index: true },
	encoded : String,
  json : String,
  updated : { type: Date, default: Date.now },
  lua : { type: String },
  version: Number, // incremental counter
  semver: String, // semantic version number
  branch: String, // ex "8.0-beta", default is not set for live
  semver: { type: String, index: true },
  changelog: String,
  fix: {
    triggerTable: Boolean // for WA 7.3.6 release that broke imports with triggers Sept 5-6 2018
  }
});
// compound text index
Schema.index({json: 'text', lua: 'text'})

/**
 * Statics
 */
// Find selected code version, or latest if not supplied
Schema.statics.lookup = function(id, version) {
  return new Promise((resolve, reject) => {
    var find
    if (version && version > 0 && parseInt(version) == version) {
      find = this.findOne({auraID: id}).sort({updated: 1}).skip(version - 1)
    }
    else {
      find = this.findOne({auraID: id}).sort({updated: -1})
    }
    find.then((doc) => {
      if (!doc) {
        return reject({err: 'No code found'})
      }
      if ((!doc.version || (version && doc.version > version)) || (!doc.version && !version)) {
        // if viewing latest version or there is some weirdness, set to latest version
        this.count({auraID: id}).then((num) => {
          doc.version = num
          doc.save()
          resolve(doc)
        })
      }
      // if viewing an older version and version number is not set, then set it
      if ((!doc.version && version) || doc.version > version) {
        doc.version = version
        doc.save()
        return resolve(doc)
      }
      // otherwise version is set correctly
      else {
        resolve(doc)
      }
    }).catch((e) => {
      logger.error(e.message)
    })
  })
}


// create the model for users and expose it to our app
const WagoCode = mongoose.model('AuraCode', Schema)
module.exports = WagoCode