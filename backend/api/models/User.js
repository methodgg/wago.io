const mongoose = require('mongoose'),
      mongoosastic = require('mongoosastic'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      config = require('../../config')

const Schema = new mongoose.Schema({
  account : {
    username : { type: String, index: true, es_index: true, maxlength: 128 },
    password : String,
    hidden : { type: Boolean, default: false, es_index: true },
    default_aura_visibility : { type: String, default: "Public" },
    created : { type: Date, default: Date.now },
    active : { type: Date, default: Date.now },
    verified_human : { type: Boolean, default: false },
    api_key : { type: String, index: true },
    companionHideAlert: Boolean,
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
    isAdmin : {
      access: { type: Boolean, default: false },
      super: { type: Boolean, default: false },
      blog: { type: Boolean, default: false },
      moderator : { type: Boolean, default: false }
    },
    subscriber : { type: Boolean, default: false },
    gold_subscriber : { type: Boolean, default: false },
    pro_subscriber : { type: Boolean, default: false },
    ambassador : { type: Boolean, default: false },
    community_leader : { type: Boolean, default: false },
    developer : { type: Boolean, default: false },
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
    avatar : {
      png: String,
      webp: String
    },
    updateStatus: String,
    updateDate: Date,
    characters: [{
      region: {type: String, index: true},
      realm: {type: String, index: true},
      name: {type: String, index: true},
      guild: {type: String, index: true},
      guildRealm: {type: String, index: true},
      bnetID: Number
    }],
    guilds: [{type: String, index: true}]
  },
  battlenetCN : {
    id : String,
    name : String,
    avatar : {
      png: String,
      webp: String
    },
    updateStatus: String,
    updateDate: Date,
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
  twitch: {
    id: String,
    name: String,
    avatar : {
      png: String,
      webp: String
    },
    refreshToken: String,
    subscribedTo: [String]
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
    username: {type: String, index: true, maxlength: 128}
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
  if (!name || typeof(name) !== 'string') {
    return null
  }
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
  var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  var key = ''
  for (let i = 0; i < 64; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  this.account.api_key = key
  this.save()
  return key
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
  if (this.profile.avatar && (this.profile.avatar.webp || this.profile.avatar.png)) {
    return this.profile.avatar
  }
  else {
    const image = require('../helpers/image')
    image.avatarFromURL('https://api.adorable.io/avatars/64/' + this._id.toString() + '.png', this._id.toString(), 'adorable').then((img) => {
      this.profile.avatar = img
      this.save()
    })
    // next time, this image will be saved locally but return remote image now instead of waiting
    return {png: 'https://api.adorable.io/avatars/64/' + this._id.toString() + '.png'}
  }
})


Schema.virtual('access.custom_slug').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.ambassador || this.roles.community_leader || this.roles.developer || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.animatedAvatar').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.subscriber || this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.community_leader || this.roles.ambassador || this.roles.developer || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.queueSkip').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.subscriber || this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.community_leader || this.roles.ambassador || this.roles.developer || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.referrals').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.subscriber || this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.community_leader || this.roles.ambassador || this.roles.developer || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.beta').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.subscriber || this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.community_leader || this.roles.ambassador || this.roles.developer  || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.api').get(function() {
  return true
})
Schema.virtual('access.hideAds').get(function() {
  if (this.roles.subscriber || this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.community_leader || this.roles.ambassador || this.roles.developer  || this.roles.artContestWinnerAug2018) return true
  return false
})
Schema.virtual('access.restrictGuild').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.gold_subscriber || this.roles.pro_subscriber || this.roles.ambassador || this.roles.community_leader || this.roles.developer || this.roles.artContestWinnerAug2018) return true

  return false
})
Schema.virtual('access.restrictSubs').get(function() {
  if (this.roles.isAdmin.access) return true
  if (this.roles.pro_subscriber || this.roles.ambassador || this.roles.developer || this.roles.community_leader) return true

  return false
})

Schema.virtual('roleclass').get(function() {
  if (this.roles.isAdmin.access)
      return 'user-admin'
  else if (this.roles.isAdmin.moderator)
      return 'user-moderator'
  else if (this.roles.gold_subscriber || this.roles.artContestWinnerAug2018 || this.roles.pro_subscriber)
      return 'user-goldsub'
  else if (this.roles.subscriber)
      return 'user-sub'
  else if (this.roles.ambassador || this.roles.developer || this.roles.community_leader)
      return 'user-goldsub'

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
User.esSearch = bluebird.promisify(User.esSearch, {context: User})

module.exports = User