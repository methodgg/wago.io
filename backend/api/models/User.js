const mongoose = require('mongoose'),
      mongoosastic = require('mongoosastic'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      config = require('../../config')

const Schema = new mongoose.Schema({
  account : {
    username : { type: String, index: true, es_index: true },
    password : String,
    hidden : { type: Boolean, default: false, es_index: true },
    default_aura_visibility : { type: String, default: "Public" },
    created : { type: Date, default: Date.now },
    active : { type: Date, default: Date.now },
    verified_human : { type: Boolean, default: false },
    api_key : { type: String, index: true },
    reset : String
  },
  profile: {
    avatar: {
      png: String,
      gif: String,
      webp: String
    },
    description: {
      text: String,
      format: String
    },
    guilds: [{
      default: { type: Boolean, default: false },
      guildID: ObjectId
    }]
  },
  roles : {
    admin : { 
      access: { type: Boolean, default: false },
      super: { type: Boolean, default: false },
      blog: { type: Boolean, default: false },
      moderator : { type: Boolean, default: false }      
    },
    subscriber : { type: Boolean, default: false },
    gold_subscriber : { type: Boolean, default: false },
    guild_subscriber : { type: Boolean, default: false }, // patron of guild level pledge
    guild_member : { type: Boolean, default: false }, // member of guild with guild level pledge
    ambassador : { type: Boolean, default: false },
    artContestWinnerAug2018: { type: Boolean, default: false }
  },
  facebook : {
    id : String,
    email : String,
    name : String,
    avatar : {
      png: String,
      webp: String
    }
  },
  twitter : {
    id : String,
    name : String,
    avatar : {
      png: String,
      webp: String
    }
  },
  google : {
    id  : String,
    name : String,
    avatar : {
      png: String,
      webp: String
    }
  },
  battlenet : {
    id : String,
    name : String,
    region: String,
    avatar : {
      png: String,
      webp: String
    }
  },
  patreon : {
    id: String,
    name : String,
    avatar : {
      png: String,
      webp: String
    },
    amount_cents: Number,
    created_at: Date,
    declined_since: Date,
    profile: mongoose.Schema.Types.Mixed
  },
  discord : {
    id : String,
    name : String,
    discriminator : String,
    avatar : {
      png: String,
      webp: String
    },
    options : {
      messageOnFaveUpdate : Boolean,
      messageOnComment : Boolean
    },
    webhooks : {
      onCreate : String
    }
  },
  config: {
    theme : String,
    editor : String,
    textSyntax : { type: String, default: "bbcode" }, // bbcode or markdown
    searchOptions: {
      sort: { type: String, default: "bestmatch" },
      relevance: { type: String, default: "standard" },
      expansion: { type: String, default: "" }
    }
  },
  search: {
    username: {type: String, index: true}
  }
}, { minimize: true });


/**
 * Compound indexes
 */
// Schema.index({"account.firstname": 1, "account.lastname": 1})

/**
 * Statics
 */
Schema.statics.findByUsername = function(name) {
  return this.findOne({"search.username": name.toLowerCase()}).exec()
}

Schema.statics.findByAPIKey = function(key) {
  return new Promise((resolve, reject) => {
    this.findOne({"account.api_key": key}).then((user) => {
      if (user && user.access.api) {
        resolve(user)
      }
      else {
        resolve(false)
      }
    })
  })
}
Schema.methods.createAPIKey = function() {
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  var key = 'xxxxxxxx-xxxx-xxxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, function(c) {
    return chars.charAt(Math.floor(Math.random() * chars.length))
  })

  this.account.api_key = key
  return this.save()
}
  

/**
 * Virtuals
 */
Schema.virtual('profile.visibility').get(function() {
  if (this.account.hidden) return "Private"
  else return "Public"
})
Schema.virtual('profile.visibility').set(function(val) {
  if (val=='Public') this.account.hidden=false
  else this.account.hidden=true
})
Schema.virtual('profile.url').get(function() {
  if (this.account.hidden || !this.account.username) return false
  return '/p/' + this.account.username
})
Schema.virtual('profile.name').get(function() {
  return this.account.username || 'User-' + this._id
})

Schema.virtual('account.total_accounts').get(function() {
  num=0
  if (this.account.password) num++
  if (this.facebook.id) num++
  if (this.twitter.id) num++
  if (this.google.id) num++
  if (this.battlenet.id) num++
  return num
})

// avatar url or default to adorable.io
Schema.virtual('avatarURL').get(function() {
  if (this.profile.avatar && this.profile.avatar.webp) {
    return this.profile.avatar
  }
  else {
    var user = this
    const image = require('../helpers/image')
    image.avatarFromURL('https://api.adorable.io/avatars/64/' + this._id.toString() + '.png', this._id.toString(), 'adorable', (img) => {
      this.profile.avatar = img
      this.save().then(() => {

      })      
    })
    // next time, this image will be saved locally but return remote image now instead of waiting
    return 'https://api.adorable.io/avatars/64/' + this._id.toString() + '.png'
  }
})


Schema.virtual('access.custom_slug').get(function() {
  if (this.roles.admin.super) return true
  if (this.roles.gold_subscriber || this.roles.ambassador || this.roles.artContestWinnerAug2018 || this.roles.guild_member) return true

  return false
})
Schema.virtual('access.animatedAvatar').get(function() {
  if (this.roles.admin.super) return true
  if (this.roles.gold_subscriber || this.roles.subscriber || this.roles.ambassador || this.roles.admin.moderator || this.roles.artContestWinnerAug2018 || this.roles.guild_member) return true

  return false
})
Schema.virtual('access.beta').get(function() {
  if (this.roles.admin.super) return true
  if (this.roles.gold_subscriber || this.roles.subscriber || this.roles.ambassador || this.roles.admin.moderator || this.roles.artContestWinnerAug2018 || this.roles.guild_member) return true

  return false
})
Schema.virtual('access.api').get(function() {
  if (this.roles.admin.super) return true
  if (this.roles.gold_subscriber || this.roles.subscriber || this.roles.ambassador || this.roles.admin.moderator || this.roles.artContestWinnerAug2018 || this.roles.guild_member) return true

  return false
})

Schema.virtual('roleclass').get(function() {
  if (this.roles.admin.super)
      return 'user-admin'
  else if (this.roles.admin.moderator)
      return 'user-moderator'
  else if (this.roles.gold_subscriber || this.roles.artContestWinnerAug2018 || this.roles.guild_member)
      return 'user-goldsub'
  else if (this.roles.subscriber)
      return 'user-sub'
  else if (this.roles.ambassador)
      return 'user-ambassador'

  else
      return 'user-default'
})

// zzzzzz
Schema.virtual('roleClass').get(function() {
  return this.roleclass
})

// add Mongoosastic plugin (elastic search)
Schema.plugin(mongoosastic, {
  hosts: config.elasticServers
})

const User = mongoose.model('Users', Schema)


// if (require('../../config').env == 'production' && require('../../config').host == 'data-02' && !global.CRONTASK) {
//   User.synchronize()
// }
module.exports = User