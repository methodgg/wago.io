// app/models/aura.js
// load the things we need

var mongoose = require('mongoose');
var shortid = require('shortid');

// define the schema for our user model
var mediaSchema = mongoose.Schema({

    _id : { type: String, unique: true, default: shortid.generate },
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    meta : {
    	name : String,
    	categories : Array,
        type : { type: Number, default: 0 }, // 0=texture, 1=font, 2=audio
        subtype : String,
        description : { type: String, default: "" },
        created : { type: Date, default: Date.now },
        hidden : { type: Boolean, default: false },
        private : { type: Boolean, default: false },
        deleted : { type: Boolean, default: false }
    },

    files :  [{
        _id : false,
        original: String,
        paths : mongoose.Schema.Types.Mixed,
        uploaded : { type: Date, default: Date.now },
        sprite: {
            columns: { type: Number, default: 0 },
            rows: { type: Number, default: 0 },
            framecount: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
            width: { type: Number, default: 0 }
        }
    }],

    popularity : {
        views : { type: Number, default: 0 },
        downloads : { type: Number, default: 0 },
        favorites : Array
    },

});

// virtuals
mediaSchema.virtual('meta.visibility').get(function() {
    if (this.meta.private) return "Private"
    else if (this.meta.hidden) return "Hidden"
    else return "Public"
})



// create the model for aura and expose it to our app
module.exports = mongoose.model('Media', mediaSchema);