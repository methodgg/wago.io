// app/models/aura.js
// load the things we need

var mongoose = require('mongoose');
var shortid = require('shortid');

// define the schema for our user model
var itemSchema = mongoose.Schema({

    _id : { type: String, unique: true, default: shortid.generate },
    custom_slug : String,
    _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

   	name : String,
    description : { type: String, default: "" },
    description_format : { type: Number, default: 1 }, // 1=BBcode, 2=Markdown
    type : String,
    subtype : String,
	categories : Array,
    categories_auto : { type: Boolean, default: false },

    created : { type: Date, default: Date.now },
    last_accessed : { type: Date, default: Date.now },
    expires_at : Date,
    modified : { type: Date, default: Date.now },
    last_comment : Date,
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
        favorites : Array,
        favorite_count : { type: Number, default: 0 },  // this should always match the length of favorites
        comments_count : { type: Number, default: 0 }
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

itemSchema.virtual('slug').get(function() {
    if (this.custom_slug) return this.custom_slug
    else return this._id
})
itemSchema.virtual('url').get(function() {
    return 'https://wago.io/'+this.slug
})

itemSchema.statics.random = function(callback) {
  this.count({"hidden": false, "private": false, "deleted": false, $or:[{type: 'WEAKAURAS2'}, {type: 'ELVUI'}]}, function(err, count) {
    if (err) {
      return callback(err);
    }
    var rand = Math.floor(Math.random() * count);
    this.findOne({"hidden": false, "private": false, "deleted": false, $or:[{type: 'WEAKAURAS2'}, {type: 'ELVUI'}]}).skip(rand).exec(callback);
  }.bind(this));
};
                      


// create the model for aura and expose it to our app
module.exports = mongoose.model('WagoItem', itemSchema);