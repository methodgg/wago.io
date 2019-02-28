var mongoose = require('mongoose')

// define the schema for our user model
var Schema = mongoose.Schema({
    auraID : { type: String, index: true},
    localFile : String,
    sort: {type: Number, default: 999},
    s3Key: String,
    uploaded : { type: Date, default: Date.now },
    s3Server: { type: String, default: "s3-us-west-2.amazonaws.com"},
    caption : { type: String, default: ""},
    original_bucket: { type: String, default: "ss1.wago.io"},
    thumb_bucket: { type: String, default: "ss2.wago.io"},
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
    return this.findOne({auraID: id, localFile: {$exists: true}}).exec()
  }
  else {
    return this.find({auraID: id, localFile: {$exists: true}}).exec()
  }
}

const Screenshot = mongoose.model('AuraScreenshot', Schema)
module.exports = Screenshot