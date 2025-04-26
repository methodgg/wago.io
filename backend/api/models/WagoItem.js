const mongoose = require('mongoose')
const shortid = require('shortid')
const image = require('../helpers/image')
const parseText = require('../helpers/parseText')
const GameVersion = require('./GameVersion')

const Schema = new mongoose.Schema({
  _id: { type: String, default: shortid.generate },
  custom_slug: { type: String, index: true },
  _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },

  name: {
    type: String, index: true, es_cast: function (value) {
      return `${value} ${this.custom_slug || ''}`.trim();
    }
  },
  description: { type: String, default: "" },
  description_format: { type: String, default: 'bbcode' },
  type: { type: String, index: true },
  subtype: String,
  categories: { type: Array, index: true },
  categories_auto: { type: Boolean, default: false },

  created: { type: Date, default: Date.now, index: true },
  last_accessed: { type: Date, default: Date.now },
  expires_at: { type: Date, expires: 300 },
  modified: { type: Date, default: Date.now, index: true },
  last_comment: { type: Date, index: true },
  display_date: String,
  patch_name: String,
  supports_patch: String,
  batch_import: String,
  game: { type: String, default: 'df', index: true }, // expansion code
  domain: { type: Number, default: ENUM.DOMAIN.WOW, index: true }, // actual game: 'WOW' or 'FF14'
  tocversion: Number,

  hidden: { type: Boolean, default: false, index: true },
  private: { type: Boolean, default: false, index: true },
  encrypted: { type: Boolean, default: false, index: true },
  encryptedCount: { type: Number, default: 0 }, // used for caching
  restricted: { type: Boolean, default: false, index: true },
  restrictedUsers: [{ type: String, index: true }], // user._id
  restrictedGuilds: [{ type: String, index: true }], // guildKey 'region@Realm@Guild Name"
  restrictedTwitchUsers: [{ type: String, index: true }], // user.twitch.id
  deleted: { type: Boolean, default: false, index: true },
  blocked: { type: Boolean, default: false, index: true },
  moderated: { type: Boolean, default: false, index: true },
  moderatedComment: { type: String },

  clone_of: String,
  fork_of: String,

  popularity: {
    views: { type: Number, default: 0, index: true },
    viewsThisWeek: { type: Number, default: 0, index: true },
    embeds: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    favorite_count: { type: Number, default: 0, index: true },  // this should always match the length of favorites
    installed_count: { type: Number, default: 0, index: true }, // count users of WA Companion that have this installed
    comments_count: { type: Number, default: 0, index: true }
  },

  imageGenerated: Number,
  previewImage: String,
  previewStatic: String,

  referrals: [
    { url: String, count: { type: Number, default: 0 } }
  ],

  latestVersion: {
    versionString: String,
    iteration: Number,
    changelog: {
      format: { type: String, default: '' },
      text: { type: String, default: '' }
    }
  },
  hasCustomCode: Boolean,
  codeProcessVersion: Number,

  // relevancy scores for searches
  relevancy: {
    standard: { type: Number, index: true },
    strict: { type: Number, index: true }
  },

  // type=WEAKAURAS
  regionType: { type: String, index: true },
  auraNames: [String],

  // type=COLLECTION
  collect: { type: Array, index: true }, // array of WagoItem _ids
  collectHistory: [{
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
  image: [{
    original: String,
    files: mongoose.Schema.Types.Mixed, // {tga: "/path/to/file.tga", etc...}
    dimensions: {
      height: Number,
      width: Number,
      bytes: Number
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
  snippet: {
    code: mongoose.Schema.Types.ObjectId
  },

  embeddedStrData: mongoose.Schema.Types.Mixed,

  // type=WAGOLIB
  wagolib: {
    addon: { type: String, index: true },
    metaData: [{ type: String, index: true }],
    anythingTable: { type: String, index: true }
  },

  webhookOnImport: {
    url: String,
    history: [{
        url: String,
        status: Number,
        data: mongoose.Schema.Types.Mixed,
        response: mongoose.Schema.Types.Mixed,
        date: { type: Date, default: Date.now },
    }]
  },

  uiPackSettings: {
    paidPackOptOut: { type: Boolean, default: false },
  },

  _indexImport: Boolean,
  _indexCode: Boolean,
  _meiliWA: Boolean
})

/**
 * Statics
 */
// Look up wago by id or custom slug
Schema.statics.lookup = async function (slug) {
  return await this.findOne({ "$or": [{ _id: slug }, { custom_slug: slug }] })
}

// virtuals
Schema.virtual('visibility').get(function () {
  if (this.private) return "Private"
  else if (this.hidden) return "Hidden"
  else if (this.restricted) return "Restricted"
  else if (this.moderated) return "Moderated"
  else return "Public"
})

Schema.virtual('slug').get(function () {
  if (this.custom_slug) return this.custom_slug
  else return this._id
})
Schema.virtual('url').get(function () {
  return 'https://wago.io/' + this.slug
})
Schema.virtual('expansionIndex').get(function () {
  if (!this.type.match(/WEAKAURA|MDT/)) return -1

  else if (this.game === 'classic') return 0
  else if (this.game === 'tbc') return 1
  else if (this.game === 'wotlk') return 2
  else if (this.game === 'cata') return 3
  else if (this.game === 'mop') return 4
  else if (this.game === 'legion') return 6
  else if (this.game === 'bfa') return 7
  else if (this.game === 'sl') return 8
  else if (this.game === 'df') return 9
  else if (this.game === 'tww') return 10

  return -1
})
Schema.virtual('categoryRanks').get(function () {
  let root = 0
  let total = 0
  this.categories.forEach(cat => {
    cat = Categories.categories[cat]
    if (!cat || cat.system) {
      return
    }
    total++
    // if category has a parent
    if (!cat.parent) {
      root++
    }
  })
  return { root: root || 1, total: total || 1 }
})


Schema.virtual('searchScores').get(async function () {
  let hotness = {}
  // ageScore: gaussian curve 1-100; new-75+ days
  const hoursOld = Math.min(1800, (Date.now() - this.modified.getTime()) / 3600000)
  hotness.ageScore = parseFloat((100 * Math.E ** (-(hoursOld ** 2) / 810000)).toFixed(1) || 0)

  const recentDate = new Date()
  recentDate.setMonth(recentDate.getDate() - 18)

  // viewsScore: Z-Score of views in the past week
  const stdViews = parseFloat(await redis.get('stats:standardDeviation:views')) || 1
  const meanViews = parseFloat(await redis.get('stats:mean:views')) || 0
  const views = await ViewsThisWeek.count({ wagoID: this._id })
  hotness.viewsScore = Math.max(0, parseFloat(((views - meanViews) / stdViews).toFixed(1) || 0))

  // installScore: Z-Score of installs in the past month
  const stdInstalls = parseFloat(await redis.get('stats:standardDeviation:installs')) || 1
  const meanInstalls = parseFloat(await redis.get('stats:mean:installs')) || 0
  const installs = await WagoFavorites.count({ wagoID: this._id, type: 'Install', timestamp: { $gt: recentDate } })
  hotness.installScore = Math.max(0, parseFloat(((installs - meanInstalls) / stdInstalls).toFixed(1) || 0))

  /// starScore: Z-Score of installs in the past month
  const stdStars = parseFloat(await redis.get('stats:standardDeviation:stars')) || 1
  const meanStars = parseFloat(await redis.get('stats:mean:stars')) || 0
  const stars = await WagoFavorites.count({ wagoID: this._id, type: 'Star', timestamp: { $gt: recentDate } })
  hotness.starScore = Math.max(0, parseFloat(((stars - meanStars) / stdStars).toFixed(1) || 0))

  return hotness
})

Schema.virtual('gameVersion').get(function () {
  return GameVersion.findGameVersion(this.tocversion, this.modified, this.domain)
})

Schema.methods.getRawThumbnail = async function () {
  const screen = await Screenshot.findForWago(this._id, true)
  return screen && screen.url || null
}

Schema.methods.getThumbnailURL = async function (size) {
  if (!this.imageGenerated) {
    var type = this.type
    const screen = await Screenshot.findForWago(this._id, true)
    var user
    if (this._userId) {
      user = await User.findById(this._userId).exec()
      if (user) {
        await user.avatarURL // make sure we have data here
        user = { name: user.account.username, avatar: user.profile.avatar.webp || user.profile.avatar.gif || user.profile.avatar.png || "https://media.wago.io/avatars/62ebf029da9ef14623e27f4c/b-1659629755105.png" }
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

Schema.methods.getCardImageURL = async function () {
  if (!this.imageGenerated) {
    var type = this.type
    const screen = await Screenshot.findForWago(this._id, true)
    var user
    if (this._userId) {
      user = await User.findById(this._userId).exec()
      if (user) {
        await user.avatarURL // make sure we have data here
        user = { name: user.account.username, avatar: user.profile.avatar.webp || user.profile.avatar.gif || user.profile.avatar.png || "https://media.wago.io/avatars/62ebf029da9ef14623e27f4c/b-1659629755105.png" }
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

Schema.statics.randomOfTheMoment = async function (count, n) {
  if (!n) {
    n = 0
  }
  var search = { hidden: false, restricted: false, private: false, moderated: false, encrypted: false, deleted: false, blocked: false, modified: { "$gte": new Date(2020, 10, 13) } }
  if (!count) {
    count = await this.countDocuments(search).exec()
  }
  if (count > 0 && n < 50) {
    const rand = Math.floor(Math.random() * count)
    const doc = await this.findOne(search).skip(rand).exec()
    const screen = await Screenshot.findOne({ auraID: doc._id }).exec()
    if (screen) {
      return { name: doc.name, slug: doc.slug, screenshot: screen.url }
    }
    else {
      return this.randomOfTheMoment(count, n + 1)
    }
  }
}

Schema.pre('validate', function () {
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

Schema.virtual('meiliWAData').get(async function () {
  return Object.assign({
    id: this._id,
    name: this.name,
    slug: this.custom_slug || '',
    description: this.description || '',
    descriptionHTML: parseText({ text: this.description, format: this.description_format }),
    hasDesc: (this.description || '').trim().length && 1 || 0,
    categories: this.categories,
    expansion: this.expansionIndex,
    installs: this.popularity.installed_count,
    stars: this.popularity.favorite_count,
    views: this.popularity.views,
    viewsThisWeek: this.popularity.viewsThisWeek,
    versionString: this.latestVersion.versionString || '1.0.0',
    thumbnail: await this.getRawThumbnail(),
    timestamp: Math.round(this.modified.getTime() / 1000),
  }, await this.searchScores)
})

Schema.virtual('indexedImportData').get(async function () {
  if (!this._userId || this.deleted || this.expires_at || this.moderated) {
    return null
  }

  const data = await this.meiliWAData
  data.id = this._id
  data.customCode = ''

  data.patchIteration = await GameVersion.patchIteration(this.tocversion)
  data.hidden = this.hidden || this.private || this.moderated || this.encrypted || this.restricted || this.deleted || this.blocked
  data.type = this.type.replace(/.*-WEAKAURA/, 'WEAKAURA')
  if (this.restricted) {
    data.restrictions = this.restrictedUsers.concat(this.restrictedGuilds)
    data.restrictions.push(this._userId.toString())
    data.restrictions = [...new Set(data.restrictions)]
  }
  else if (this.private || this.moderated) {
    data.restrictions = this._userId.toString()
  }

  if ((data.type === 'WEAKAURA' || data.type === 'PLATER') && !this.encrypted) {
    data.expansion = (GameVersion.tocToPatch(this.tocversion).major || 0) - 1 // vanilla = 0
    const code = await WagoCode.lookup(this._id)
    try {
      if (this.auraNames) {
        data.auraNames = this.auraNames.join('/')
      }
      // build a single "file" of all the custom code
      const luacode = []
      if (code?.customCode?.length) {
        code.customCode.forEach(l => {
          luacode.push(`-- wagokey: ${l.name}\n${l.lua.replace(/wagokey: /g, '')}`)
        })
      }
      if (luacode.length) {
        data.customCode = luacode
      }
    }
    catch (e) {
      // console.log('code error', e)
      // if import is missing json then we have bad data, could probably just delete it, but don't index anything
      return null
    }
  }
  else if (data.type === 'MDT') {    
    data.expansion = 10 // TODO get this dynamically
  }
  else {
    data.expansion = -1
  }

  data.domain = this.domain
  let catRanks = this.categoryRanks
  data.categoriesRoot = catRanks.root
  data.categoriesTotal = catRanks.total
  data.thumbnailStatic = this.previewStatic
  data.comments = this.popularity.comments_count
  if (this._userId) {
    data.userId = this._userId.toString()
    await this.populate('_userId').execPopulate()
    if (this._userId && this._userId.account) {
      data.userId = this._userId._id.toString()
      data.userName = this._userId.account.username
      let avatar = await this._userId.avatarURL
      data.userAvatar = avatar.webp || avatar.gif || avatar.png || avatar.jpg
      data.userClass = this._userId.roleclass
      data.userLinked = !this._userId.account.hidden
    }
  }

  data.name_plain = data.name
  data.slug_plain = data.slug
  data.description_plain = data.description

  return data
})


async function updateIndexes() {
  if (this.isModified('name description custom_slug categories game popularity versionString modified hidden private encrypted restricted deleted blocked moderated restrictedUsers restrictedGuilds imageGenerated expires_at')) {
    if (this._userId && !this.deleted && !this.expires_at && !this.moderated) {
      await elastic.addDoc('imports', await this.indexedImportData)
      this._indexImport = true
    }
    else if (this._indexImport) {
      this._indexImport = false
      await elastic.removeDoc('imports', this._id)
    }
  }
}

Schema.pre('save', updateIndexes)
Schema.pre('update', updateIndexes)
Schema.pre('remove', updateIndexes)

const WagoItem = mongoose.model('WagoItem', Schema)


module.exports = WagoItem