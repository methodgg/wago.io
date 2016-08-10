// app/models/comments.js

var mongoose = require('mongoose');

// define the schema for our user model
var commentSchema = mongoose.Schema({
    wagoID : String,
    auraID : String,
    mediaID : String,
    bundleID : String,
    authorID : String,
    commentText: String,
    postDate : { type: Date, default: Date.now },
    inReplyTo : String,
    usersTagged : [{
        _id : false,
        userID : String,
        read : {type: Boolean, default: false}
    }]
});


// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', commentSchema);