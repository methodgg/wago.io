const mongoose = require('mongoose'),
      ObjectId = mongoose.Schema.Types.ObjectId

const Schema = new mongoose.Schema({    
  auraID : { type: String, ref: 'WagoItem', index: true },
	encoded : String,
  json : String,
  updated : { type: Date, default: Date.now },
  text: String,
  lua : { type: String },
  version: Number, // incremental counter
  versionString: { type: String, index: true }, // semantic version number
  branch: String, // ex "8.0-beta", default is not set for live
  luacheck: String,
  luacheckVersion: Number, // processVersion alias
  changelog: {
    text: String,
    format: String
  },
  fix: {
    triggerTable: Boolean // for WA 7.3.6 release that broke imports with triggers Sept 5-6 2018
  }
});

/**
 * Statics
 */
// Find selected code version, or latest if not supplied
Schema.statics.lookup = async function(id, version) {
  try {
    var doc
    if (version && typeof version === 'string' && version.replace(/-\d+$/, '').match(/\d+\.\d+\.\d+/)) {
      doc = await this.findOne({auraID: id, versionString: version.replace(/-\d+$/, '')}).exec()
    }
    else if (version && parseInt(version) == version && parseInt(version) > 0) {
      doc = await this.findOne({auraID: id, version: parseInt(version)}).sort({updated: 1}).exec()
    }    
    else {
      doc = await this.findOne({auraID: id}).sort({updated: -1}).exec()
    }
    if (!doc) {
      return {err: 'No code found'}
    }
    
    if (!doc.versionString || !doc.version || (version && doc.version > version) || doc.versionString.match(/undefined/) || (!doc.version && !version)) {
      // missing version numbers here, so repopulate them in for all versions
      var versions = await WagoCode.find({auraID: id}).sort({updated: 1}).exec()
      await async.forEachOf(versions, async (codeVersion, i, cb) => {
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
        await codeVersion.save()
        
        if ((!version && i === versions.length) || i === version) {
          doc.versionString = codeVersion.versionString
          doc.version = codeVersion.version
          await doc.save()
        }
      })
    }
    return doc
  }
  catch (e) {
    console.error(e.message)
    return {}
  }
}
// alias processVersion -> luacheckVersion 
// TODO: rename in database
Schema.virtual('processVersion').
  get(function() { return this.luacheckVersion }).
  set(function(v) { this.set({ luacheckVersion: v })
})


// create the model for users and expose it to our app
const WagoCode = mongoose.model('AuraCode', Schema)
module.exports = WagoCode