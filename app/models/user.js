// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    account : {
        username : String,
        password : String,
        hidden : { type: Boolean, default: true },
        default_aura_visibility : { type: String, default: "Public" },
        created : { type: Date, default: Date.now },
        active : { type: Date, default: Date.now },
        verified_human : { type: Boolean, default: false }
    },
    api : {
        public_key : { type: String, default: '' },
        requests : { type: Number, default: 0 }
    },
    facebook : {
        id : String,
        token : String,
        email : String,
        name : String
    },
    twitter : {
        id : String,
        token : String,
        displayName : String,
        username : String
    },
    google : {
        id  : String,
        token : String,
        email : String,
        name : String
    },
    battlenet : {
        id  : String,
        token : String,
        name : String,
        region: String,
        characters : Array
    },
    config: {
        theme : String
    }
});

// virtuals
userSchema.virtual('profile.visibility').get(function() {
    if (this.account.hidden) return "Private"
    else return "Public"
})
userSchema.virtual('profile.visibility').set(function(val) {
    if (val=='Public') this.account.hidden=false
    else this.account.hidden=true
})


userSchema.virtual('account.total_accounts').get(function() {
    num=0
    if (this.account.password) num++
    if (this.facebook.id) num++
    if (this.twitter.id) num++
    if (this.google.id) num++
    if (this.battlenet.id) num++
    return num
})


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.account.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);