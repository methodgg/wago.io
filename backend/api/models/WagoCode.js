const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({    
  auraID : { type: String, ref: 'WagoItem', index: true },
	encoded : String,
  json : String,
  updated : { type: Date, default: Date.now },
  lua : { type: String },
  version: Number, // incremental counter
  versionString: { type: String, index: true }, // semantic version number
  branch: String, // ex "8.0-beta", default is not set for live
  changelog: {
    text: String,
    format: String
  },
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
    if (version && typeof version === 'string' && version.match(/\d+\.\d+\.\d+/)) {
      find = this.findOne({auraID: id, versionString: version})
    }
    else if (version && parseInt(version) == version && version > 0) {
      find = this.findOne({auraID: id}).sort({updated: 1}).skip(parseInt(version) - 1)
    }    
    else {
      find = this.findOne({auraID: id}).sort({updated: -1})
    }
    find.then((doc) => {
      if (!doc) {
        return reject({err: 'No code found'})
      }
      if ((!doc.versionString || !doc.version || (version && doc.version > version)) || (!doc.version && !version)) {
        // missing version numbers here, so add them in for all versions
        WagoCode.find({auraID: id}).sort({updated: 1}).then((versions) => {
          async.forEachOf(versions, (codeVersion, i, cb) => {
            i++
            if (codeVersion.version && codeVersion.versionString) {
              return cb()
            }
            else if (!codeVersion.versionString && i == versions.length) {
              codeVersion.versionString = '1.0.0'
            }
            else if (!codeVersion.versionString) {
              codeVersion.versionString = '0.0.' + i
            }
            codeVersion.version = i            
            codeVersion.save().then(() => {
              if ((!version && i === versions.length) || i === version) {
                doc.versionString = codeVersion.versionString
                doc.version = codeVersion.version
                doc.save().then(() => {
                  resolve(doc)
                })
              }
              cb()
            })
          }, () => {
            resolve(doc)
          })
        })
      }
      else {
        resolve(doc)
      }
    }).catch((e) => {
      logger.error(e)
    })
  })
}


// create the model for users and expose it to our app
const WagoCode = mongoose.model('AuraCode', Schema)
module.exports = WagoCode