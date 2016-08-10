// app/models/screnshot-request.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var screenshotRequestSchema = mongoose.Schema({

    _id : String,
    createdAt: { type: Date, default: Date.now, expires: 450 },
    auraID: String,
    s3Key: String,
    bucket: String

});


// create the model for users and expose it to our app
module.exports = mongoose.model('SSReq', screenshotRequestSchema);