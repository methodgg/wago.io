// app/models/aura.js
// load the things we need

var mongoose = require('mongoose');
var shortid = require('shortid');

// define the schema for our user model
var auraSchema = mongoose.Schema({

    _id : { type: String, unique: true, default: shortid.generate },
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    meta : {
    	name : String,
    	categories : Array,
        type : { type: Number, default: 0 }, // 0=Weakaura, 1=Code snippit
        description : { type: String, default: "" },
        created : { type: Date, default: Date.now },
        uploaded : Date,
        last_accessed : { type: Date, default: Date.now },
        display_date : String,
        wow_beta : { type: Boolean, default: false },
        wow_patch : String,
        hidden : { type: Boolean, default: false },
        private : { type: Boolean, default: false },
        deleted : { type: Boolean, default: false },
        clone_of : String
    },

    popularity : {
        views : { type: Number, default: 0 },
        embeds : { type: Number, default: 0 },
        favorites : Array
    },

});

// virtuals
auraSchema.virtual('meta.visibility').get(function() {
    if (this.meta.private) return "Private"
    else if (this.meta.hidden) return "Hidden"
    else return "Public"
})
  /*
auraSchema.virtual('versions' {
    ref: 'AuraCode',
    localField: '_id',
    foreignField: 'auraID'
})*/

// methods ======================


// create the model for aura and expose it to our app
module.exports = mongoose.model('Aura', auraSchema);