// app/models/aura.js
// load the things we need

var mongoose = require('mongoose');
var shortid = require('shortid');

// define the schema for our user model
var itemSchema = mongoose.Schema({

    _id : { type: String, unique: true, default: shortid.generate },
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   	name : String,
    description : { type: String, default: "" },
    type : String,
    subtype : String,
	categories : Array,
    categories_auto : { type: Boolean, default: false },

    created : { type: Date, default: Date.now },
    last_accessed : { type: Date, default: Date.now },
    modified : Date,
    display_date : String,
    wow_patch : String,
    batch_import : String,

    hidden : { type: Boolean, default: false },
    private : { type: Boolean, default: false },
    deleted : { type: Boolean, default: false },

    clone_of : String,

    popularity : {
        views : { type: Number, default: 0 },
        embeds : { type: Number, default: 0 },
        downloads : { type: Number, default: 0 },
        favorites : Array
    },

    // type=WEAKAURAS2
    aura : {
        wow_beta : Boolean,
        screenshot : mongoose.Schema.Types.ObjectId,
        code : mongoose.Schema.Types.ObjectId
    },

    // type=COLLECTION
    collect : Array, // array of WagoItem _ids
    collectHistory : [{
        modified: { type: Date, default: Date.now },
        action: String,
        wagoID: String
    }],

    // type=IMAGE
    image :  [{
        original: String,
        files : mongoose.Schema.Types.Mixed, // {tga: "/path/to/file.tga", etc...}
        dimensions : {
            height : Number,
            width : Number,
            bytes : Number
        },
        sprite: {
            columns: Number,
            rows: Number,
            framecount: Number,
            height: Number,
            width: Number,
        },
        uploaded: { type: Date, default: Date.now }
    }],

    // type=SNIPPET
    snippet : {
        code : mongoose.Schema.Types.ObjectId
    }



});

// virtuals
itemSchema.virtual('visibility').get(function() {
    if (this.private) return "Private"
    else if (this.hidden) return "Hidden"
    else return "Public"
})

// methods ======================


// create the model for aura and expose it to our app
module.exports = mongoose.model('WagoItem', itemSchema);