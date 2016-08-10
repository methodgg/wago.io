// app/models/auracode.js

var mongoose = require('mongoose');

// define the schema for our user model
var wagoVideoSchema = mongoose.Schema({
    wagoID : String,
    source: String,  // youtube, twitch, etc
    videoID: String,  // youtube id, etc
    thumb: String,
    added : { type: Date, default: Date.now },
});

// create URL to thumbnail image
wagoVideoSchema.virtual('thumbnail').get(function() {
    switch(this.source) {
        case 'youtube': return 'http://img.youtube.com/vi/'+this.videoID+'/0.jpg'
        case 'twitch': return this.thumb      
    }
})

wagoVideoSchema.virtual('embed').get(function() {
    switch(this.source) {
        case 'youtube': return '<iframe src="https://www.youtube.com/embed/'+this.videoID+'?autoplay=1" frameborder="0" allowfullscreen></iframe>'
        case 'twitch': return '<iframe src="https://player.twitch.tv/?video=v'+this.videoID+'" frameborder="0" scrolling="no"></iframe>'
    }
})




// create the model for users and expose it to our app
module.exports = mongoose.model('Video', wagoVideoSchema);