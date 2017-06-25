// app/models/auracode.js

var mongoose = require('mongoose');

// define the schema for our user model
var auraScreenshotSchema = mongoose.Schema({
    auraID : String,
    localFile : String,
    s3Key: String,
    uploaded : { type: Date, default: Date.now },
    s3Server: { type: String, default: "s3-us-west-2.amazonaws.com"},
    caption : { type: String, default: ""},
    original_bucket: { type: String, default: "ss1.wago.io"},
    thumb_bucket: { type: String, default: "ss2.wago.io"},
});

// build URL to original image
auraScreenshotSchema.virtual('url.original').get(function() {
    if (this.localFile)
         return "https://media.wago.io/screenshots/"+this.auraID+'/'+encodeURIComponent(this.localFile)
    else
        return "https://"+this.s3Server+"/"+this.original_bucket+"/"+encodeURIComponent(this.s3Key)
})

// build URL to thumbnail image
auraScreenshotSchema.virtual('url.thumbnail').get(function() {
    if (this.localFile)
        return "https://media.wago.io/screenshots/"+this.auraID+'/'+encodeURIComponent(this.localFile)
    else
        return "https://"+this.s3Server+"/"+this.original_bucket+"/"+encodeURIComponent(this.s3Key)
})



// create the model for users and expose it to our app
module.exports = mongoose.model('AuraScreenshot', auraScreenshotSchema);