const mongoose = require('mongoose'),
      mongoosastic = require('mongoosastic'),
      shortid = require('shortid'),
      config = require('../../config')
const image = require('../helpers/image')

const Schema = new mongoose.Schema({
  _id : { type: String, default: shortid.generate, es_indexed: true },
  custom_slug : { type: String, index: true, es_indexed: true },
  _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users', es_indexed: true },

  name : { type: String, index: true, es_indexed: true },
  description : { type: String, default: "", es_indexed: true },
  description_format : { type: String, default: 'bbcode' },
  type : { type: String, index: true, es_indexed: true },
  subtype : String,
  categories : { type: Array, index: true, es_indexed: true },
  categories_auto : { type: Boolean, default: false },

  created : { type: Date, default: Date.now, index: true },
  last_accessed : { type: Date, default: Date.now },
  expires_at :  { type: Date, expires: 300 },
  modified : { type: Date, default: Date.now, index: true, es_indexed: true },
  last_comment : { type: Date, index: true },
  display_date : String,
  wow_patch : String,
  supports_patch: String,
  batch_import : String,
  game: { type: String, default: 'sl', index: true, es_indexed: true },

  hidden : { type: Boolean, default: false, index: true, es_indexed: true },
  private : { type: Boolean, default: false, index: true, es_indexed: true },
  encrypted : { type: Boolean, default: false, index: true, es_indexed: true },
  encryptedCount : { type: Number, default: 0 }, // used for caching
  restricted: { type: Boolean, default: false, index: true, es_indexed: true },
  restrictedUsers: [{ type: String, index: true, es_indexed: true }], // user._id
  restrictedGuilds: [{ type: String, index: true, es_indexed: true }], // guildKey 'region@Realm@Guild Name"
  restrictedTwitchUsers: [{ type: String, index: true, es_indexed: true }], // user.twitch.id
  deleted : { type: Boolean, default: false, index: true, es_indexed: true },
  blocked: { type: Boolean, default: false, index: true, es_indexed: true },

  clone_of : String,
  fork_of: String,

  popularity : {
    views : { type: Number, default: 0, index: true, es_indexed: true },
    viewsThisWeek : { type: Number, default: 0, index: true, es_indexed: true },
    embeds : { type: Number, default: 0 },
    downloads : { type: Number, default: 0 },
    favorite_count : { type: Number, default: 0, index: true, es_indexed: true },  // this should always match the length of favorites
    installed_count : { type: Number, default: 0, index: true, es_indexed: true }, // count users of WA Companion that have this installed
    comments_count : { type: Number, default: 0, index: true, es_indexed: true }
  },

  imageGenerated : Number,

  referrals : [
    {url: String, count: { type: Number, default: 0}}
  ],

  latestVersion : {
    versionString : String,
    iteration: Number,
    changelog : {
      format: { type: String, default: '' },
      text: { type: String, default: '' }
    }
  },

  // relevancy scores for searches
  relevancy: {
    standard: { type: Number, index: true, es_indexed: true },
    strict: { type: Number, index: true, es_indexed: true }
  },

  // type=WEAKAURAS2
  regionType: { type: String, index: true, es_indexed: true },

  // type=COLLECTION
  collect : { type: Array, index: true }, // array of WagoItem _ids
  collectHistory : [{
      modified: { type: Date, default: Date.now },
      action: String,
      wagoID: String
  }],

  mediaReview: Number, // based on review revision number
  attachedMedia: [new mongoose.Schema({
    wowPath: String,
    type: String, // audio, texture, bar, font
    mediaPath: String
  })],

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
})

// add Mongoosastic plugin (elastic search)
Schema.plugin(mongoosastic, {
  index: 'wago',
  hosts: config.elasticServers
})

/**
 * Statics
 */
// Look up wago by id or custom slug
Schema.statics.lookup = async function(slug) {
  return await this.findOne({"$or": [{_id: slug}, {custom_slug: slug}]})
}

// virtuals
Schema.virtual('visibility').get(function() {
  if (this.private) return "Private"
  else if (this.hidden) return "Hidden"
  else if (this.restricted) return "Restricted"
  else return "Public"
})

Schema.virtual('slug').get(function() {
  if (this.custom_slug) return this.custom_slug
  else return this._id
})
Schema.virtual('url').get(function() {
  return 'https://wago.io/'+this.slug
})

Schema.methods.getThumbnailURL = async function(size) {
  if (!this.imageGenerated) {
    var type = this.type
    if (type === 'WEAKAURAS2') {
      type = 'WEAKAURA'
    }
    const screen = await Screenshot.findForWago(this._id, true)
    var user
    if (this._userId) {
      user = await User.findById(this._userId).exec()
      if (user) {
        user = {name: user.account.username, avatar: user.profile.avatar.gif || user.profile.avatar.png}
      }
    }
    if (screen && screen.localFile) {
      this.imageGenerated = await image.createCards(this._id, `${screen.auraID}/${screen.localFile}`, this.name, type, user)
    }
    else if (this.type === 'MDT') {
      for (const cat of this.categories) {
        var mdtID = cat.match(/^mdtdun(\d+)$/)
        if (mdtID && mdtID[1] && (parseInt(mdtID[1]) >= 15 || parseInt(mdtID[1]) <= 26)) {
          this.imageGenerated = await image.createCards(this._id, `../mdt/wago-card-mdt${mdtID[1]}.jpg`, this.name, 'MDT ROUTE', user)
          break
        }
      }
      if (!this.imageGenerated) {
        this.imageGenerated = await image.createCards(this._id, `../site/wago-card-standard.jpg`, this.name, 'MDT ROUTE', user)
      }      
    }
    else {
      this.imageGenerated = await image.createCards(this._id, `../site/wago-card-standard.jpg`, this.name, type, user)
    }
    if (this.imageGenerated) {
      await this.save()
    }
  }
  if (!size) {
    size = ''
  }
  return `https://media.wago.io/cards/${this._id}/t${size}-${this.imageGenerated}.jpg`
}

Schema.methods.getCardImageURL = async function() {
  if (!this.imageGenerated) {
    var type = this.type
    if (type === 'WEAKAURAS2') {
      type = 'WEAKAURA'
    }
    const screen = await Screenshot.findForWago(this._id, true)
    var user
    if (this._userId) {
      user = await User.findById(this._userId).exec()
      if (user) {
        user = {name: user.account.username, avatar: user.profile.avatar.gif || user.profile.avatar.png}
      }
    }
    if (screen && screen.localFile) {
      this.imageGenerated = await image.createCards(this._id, `${screen.auraID}/${screen.localFile}`, this.name, type, user)
    }
    else if (this.type === 'MDT') {
      for (const cat of this.categories) {
        var mdtID = cat.match(/^mdtdun(\d+)$/)
        if (mdtID && mdtID[1] && (parseInt(mdtID[1]) >= 15 || parseInt(mdtID[1]) <= 26)) {
          this.imageGenerated = await image.createCards(this._id, `../mdt/wago-card-mdt${mdtID[1]}.jpg`, this.name, 'MDT ROUTE', user)
          break
        }
      }
      if (!this.imageGenerated) {
        this.imageGenerated = await image.createCards(this._id, `../site/wago-card-standard.jpg`, this.name, 'MDT ROUTE', user)
      }      
    }
    else {
      this.imageGenerated = await image.createCards(this._id, `../site/wago-card-standard.jpg`, this.name, type, user)
    }
    if (this.imageGenerated) {
      await this.save()
    }
  }
  return `https://media.wago.io/cards/${this._id}/c-${this.imageGenerated}.jpg`
}

Schema.statics.randomOfTheMoment = async function(count, n) {
  if (!n) {
    n = 0
  }
  var search = {hidden: false, restricted: false, private: false, encrypted: false, deleted: false, blocked: false, $or:[{type: 'WEAKAURAS2', modified: {"$gte": new Date(2020, 10, 13)}}, {type: 'MDT', modified: {"$gte": new Date(2020, 11, 24)}}, {type: ['CLASSIC-WEAKAURA', 'ELVUI', 'VUHDO', 'PLATER', 'TOTALRP3']}]}
  if (!count) {
    count = await this.countDocuments(search).exec()
  }
  if (count > 0 && n < 50) {
    const rand = Math.floor(Math.random() * count)
    const doc = await this.findOne(search).skip(rand).exec()
    const screen = await Screenshot.findOne({auraID: doc._id}).exec()
    if (screen) {
      return {name: doc.name, slug: doc.slug, screenshot: screen.url}
    }
    else {
      return this.randomOfTheMoment(count, n + 1)
    }
  }
}

Schema.pre('validate', function() {
  if (this.custom_slug && this.custom_slug.length > 128) {
    this.custom_slug = this.custom_slug.substr(0, 128)
  }
  if (!this.name) {
    this.name = 'Import'
  }
  else if (this.name.length > 128) {
    this.name = this.name.substr(0, 128)
  }
})

const WagoItem = mongoose.model('WagoItem', Schema)
WagoItem.esSearch = bluebird.promisify(WagoItem.esSearch, {context: WagoItem})
module.exports = WagoItem