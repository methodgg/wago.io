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
        verified_human : { type: Boolean, default: false },
        reset : String
    },
    roles : {
        super_admin : { type: Boolean, default: false },
        admin : { type: Boolean, default: false },
        moderator : { type: Boolean, default: false },
        subscriber : { type: Boolean, default: false },
        gold_subscriber : { type: Boolean, default: false },
        ambassador : { type: Boolean, default: false }
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
    patreon : {
        id: String,
        access_token: String,
        refresh_token: String,
        amount_cents: Number,
        created_at: Date,
        declined_since: Date,
        profile: mongoose.Schema.Types.Mixed
    },
    discord : {
        id : String,
        name : String,
        discriminator : String,
        options : {
            messageOnFaveUpdate : Boolean,
            messageOnComment : Boolean
        },
        webhooks : {
            onCreate : String
        }
    },
    config: {
        theme : String
    },
    search: {
        username: String
    }
});

// trigger
userSchema.pre('save', function(next) {
    if (this.account && this.account.username)
        this.search.username = this.account.username.toLowerCase()

    next()
})

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


userSchema.virtual('access.custom_slug').get(function() {
    if (this.roles.super_admin) return true
    if (this.roles.admin || this.roles.gold_subscriber || this.roles.ambassador) return true

    return false
})

userSchema.virtual('access.beta').get(function() {
    if (this.roles.super_admin) return true
    if (this.roles.admin || this.roles.gold_subscriber || this.roles.subscriber || this.roles.ambassador || this.roles.moderator) return true

    return false
})
userSchema.virtual('access.alpha').get(function() {
    if (this.roles.super_admin) return true
    return false
})

userSchema.virtual('roleclass').get(function() {
    if (this.roles.super_admin || this.roles.admin)
        return 'user-admin'
    else if (this.roles.moderator)
        return 'user-moderator'
    else if (this.roles.gold_subscriber)
        return 'user-goldsub'
    else if (this.roles.subscriber)
        return 'user-sub'
    else if (this.roles.ambassador)
        return 'user-ambassador'

    else
        return ''
})


// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    if (!this.account.password) return false

    return bcrypt.compareSync(password, this.account.password)
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);