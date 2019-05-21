var mongoose = require('mongoose')

// define the schema for our user model
var Schema = mongoose.Schema({
    auraID : { type: String, index: true},
    localFile : String,
    sort: {type: Number, default: 999},
    s3Key: String,
    uploaded : { type: Date, default: Date.now },
    file: {
      original: {
        png: String,
        webp: String,
        gif: String
      },
      thumbnail: {
        png: String,
        webp: String,
        gif: String
      }
    }
}, {timestamps: true})

// build URL to original image
Schema.virtual('url').get(function() {
  if (this.localFile)
    return "https://media.wago.io/screenshots/"+this.auraID+'/'+encodeURIComponent(this.localFile)
  else
    return "https://"+this.s3Server+"/"+this.original_bucket+"/"+encodeURIComponent(this.s3Key)
})

Schema.statics.findForWago = function(id, one) {
  if (one) {
    return this.findOne({auraID: id, localFile: {$exists: true}}).sort({sort:1}).exec()
  }
  else {
    return this.find({auraID: id, localFile: {$exists: true}}).sort({sort:1}).exec()
  }
}

const Screenshot = mongoose.model('AuraScreenshot', Schema)
module.exports = Screenshot