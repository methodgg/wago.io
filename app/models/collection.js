// app/models/collection.js

var mongoose = require('mongoose');
var shortid = require('shortid');

// define the schema for our user model
var collectionSchema = mongoose.Schema({
    _id : { type: String, unique: true, default: shortid.generate },
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    name : String,
    description : String,
    modified : { type: Date, default: Date.now },

    hidden : { type: Boolean, default: false },
    private : { type: Boolean, default: false },

    wagoIDs : Array,

    popularity : {
        views : { type: Number, default: 0 },
        favorites : Array
    },
});

collectionSchema.virtual('visibility').get(function() {
    if (this.private) return "Private"
    else if (this.hidden) return "Hidden"
    else return "Public"
})


// create the model for users and expose it to our app
module.exports = mongoose.model('Collection', collectionSchema);