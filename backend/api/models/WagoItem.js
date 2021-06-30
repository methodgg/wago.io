const mongoose = require('mongoose'),
      mongoosastic = require('mongoosastic'),
      shortid = require('shortid'),
      config = require('../../config');
const image = require('../helpers/image')

const Schema = new mongoose.Schema({
  _id : { type: String, default: shortid.generate, es_indexed: true },
  custom_slug : { type: String, index: true, es_indexed: true },
  _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users', es_indexed: true },

  name : { type: String, index: true, es_indexed: true, es_cast: function(value) {
    return `${value} ${this.custom_slug || ''}`.trim();
  }},
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
  moderated: { type: Boolean, default: false, index: true, es_indexed: true },
  moderatedComment: { type: String },

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
  previewImage: String,

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
  hasCustomCode: Boolean,
  codeProcessVersion: Number,

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
  },

  // type=WAGOLIB
  wagolib: {
    addon: {type: String, index: true, es_indexed: true},
    metaData: [{type: String, index: true, es_indexed: true}],
    anythingTable: {type: String, index: true, es_indexed: true}
  },

  _meili: Boolean,
  _meiliCode: Boolean,
  _meiliWA: Boolean
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
  else if (this.moderated) return "Moderated"
  else return "Public"
})

Schema.virtual('slug').get(function() {
  if (this.custom_slug) return this.custom_slug
  else return this._id
})
Schema.virtual('url').get(function() {
  return 'https://wago.io/'+this.slug
})
Schema.virtual('expansionIndex').get(function() {
  if (!this.type.match(/WEAKAURA/)) return -1

  else if (this.game === 'classic') return 0
  else if (this.game === 'tbc') return 1
  else if (this.game === 'legion') return 6
  else if (this.game === 'bfa') return 7
  else if (this.game === 'sl') return 8
})
Schema.virtual('categoryRanks').get(function() {
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
  return {root: root || 1, total: total || 1}
})


Schema.virtual('searchScores').get(async function() {
  let hotness = {}
  // ageScore: gaussian curve 1-100; new-75+ days
  const hoursOld = Math.min(1800, (Date.now() - this.modified.getTime()) / 3600000)
  hotness.ageScore = parseFloat((100 * Math.E ** (-(hoursOld ** 2) / 810000)).toFixed(1) || 0)

  const recentDate = new Date()
  recentDate.setMonth(recentDate.getDate() - 18)

  // viewsScore: Z-Score of views in the past week
  const stdViews = parseFloat(await redis.get('stats:standardDeviation:views')) || 1
  const meanViews = parseFloat(await redis.get('stats:mean:views')) || 0
  const views = await ViewsThisWeek.count({wagoID: this._id})
  hotness.viewsScore = parseFloat(((views - meanViews) / stdViews).toFixed(1) || 0)

  // installScore: Z-Score of installs in the past month
  const stdInstalls = parseFloat(await redis.get('stats:standardDeviation:installs')) || 1
  const meanInstalls = parseFloat(await redis.get('stats:mean:installs')) || 0
  const installs = await WagoFavorites.count({wagoID: this._id, type: 'Install', timestamp: {$gt: recentDate}})
  hotness.installScore = parseFloat(((installs - meanInstalls) / stdInstalls).toFixed(1) || 0)

  /// starScore: Z-Score of installs in the past month
  const stdStars = parseFloat(await redis.get('stats:standardDeviation:stars')) || 1
  const meanStars = parseFloat(await redis.get('stats:mean:stars')) || 0
  const stars = await WagoFavorites.count({wagoID: this._id, type: 'Star', timestamp: {$gt: recentDate}})
  hotness.starScore = parseFloat(((stars - meanStars) / stdStars).toFixed(1) || 0)

  return hotness
})

Schema.methods.getRawThumbnail = async function() {
  const screen = await Screenshot.findForWago(this._id, true)
  return screen && screen.url || null
}

Schema.methods.getThumbnailURL = async function(size) {
  if (!this.imageGenerated) {
    var type = this.type
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
  var search = {hidden: false, restricted: false, private: false, moderated: false, encrypted: false, deleted: false, blocked: false, $or:[{type: 'WEAKAURA', modified: {"$gte": new Date(2020, 10, 13)}}, {type: ['CLASSIC-WEAKAURA', 'ELVUI', 'VUHDO', 'PLATER', 'TOTALRP3']}]}
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

Schema.virtual('meiliWAData').get(async function () {
  return Object.assign({
    id: this._id,
    name: this.name,
    slug: this.custom_slug || '',
    description: this.description || '',
    hasDesc: (this.description || '').trim().length && 1 || 0,
    categories: this.categories,
    expansion: this.expansionIndex,
    installs: this.popularity.installed_count,
    stars: this.popularity.favorite_count,
    views: this.popularity.views,
    viewsThisWeek: this.popularity.viewsThisWeek,
    versionString: this.latestVersion.versionString || '1.0.0',
    thumbnail: await this.getRawThumbnail(),
    timestamp: Math.round(this.modified.getTime() / 1000)
  }, await this.searchScores)
})

Schema.virtual('indexedImportData').get(async function () {
  const data = await this.meiliWAData
  data.hidden = this.hidden || this.private || this.moderated || this.encrypted || this.restricted || this.deleted || this.blocked
  data.type = this.type.replace(/.*-WEAKAURA/, 'WEAKAURA')
  if (this.restricted) {
    data.restriction = this.restrictedUsers.concat(this.restrictedGuilds)
    data.restriction.push(this._userId.toString())
    data.restriction = [...new Set(data.restriction)]
  }
  else if (this.private || this.moderated) {
    data.restriction = this._userId.toString()
  }
  let catRanks = this.categoryRanks
    data.categoriesRoot = catRanks.root
    data.categoriesTotal = catRanks.total
  data.comments = this.popularity.comments_count
  if (this._userId) {
    data.userId = this._userId
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
  return data
})

Schema.virtual('meiliCodeData').get(async function () {
  const code = await WagoCode.lookup(this._id)
  let luaCode = ''
  if (code.customCode && code.customCode.length) {
    code.customCode.forEach(c => {
      luaCode += `-- ${c.name}\n${c.lua}\n\n`
    })
    luaCode = luaCode.trim()
  }
  if (luaCode) {
    const data = Object.assign({
      id: this._id,
      name: this.name,
      hidden: this.hidden || this.private || this.moderated || this.encrypted || this.restricted || this.deleted || this.blocked,
      type: this.type.replace(/.*-WEAKAURA/, 'WEAKAURA'),
      expansion: this.expansionIndex,
      installs: this.popularity.installed_count,
      stars: this.popularity.favorite_count,
      views: this.popularity.views,
      versionString: code.versionString || '1.0.0',
      timestamp: Math.round(code.updated.getTime() / 1000),
      code: luaCode
    }, await this.searchScores)

    if (this.restricted) {
      data.restriction = this.restrictedUsers.concat(this.restrictedGuilds)
      data.restriction.push(this._userId.toString())
      data.restriction = [...new Set(data.restriction)]
    }
    else if (this.private || this.moderated) {
      data.restriction = this._userId.toString()
    }

    if (this._userId) {
      data.userId = this._userId
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
    return data
  }
  return null
})

async function getIndex() {
  return await meiliWagoApp.getOrCreateIndex('weakauras')
}
function isValidMeiliWA(doc) {
  return !!doc._userId && !doc.expires_at && doc.type.match(/WEAKAURA$/)
}

let meiliIndexWA
async function setMeiliIndex() {
  if (!meiliIndexWA) {
    meiliIndexWA = await getIndex()
  }
  if (isValidMeiliWA(this)) {
    try {
      let meiliToDoWA = await redis.getJSON('meili:todo:wagoapp') || []
      if (this._meiliWA && (this._doNotIndexWA || this.hidden || this.private || this.moderated || this.encrypted || this.restricted || this.deleted || this.blocked)) {
        // delete index
        meiliToDoWA = meiliToDoWA.filter(id => {
          return id !== this._id
        })
        redis.setJSON('meili:todo:wagoapp', meiliToDoWA)
        await meiliIndexWA.deleteDocument(this._id)
        this._meiliWA = false
        await this.save()
      }
      else if ((this._doMeiliIndex || this._toggleVisibility) && !(this.hidden || this.private || this.moderated || this.encrypted || this.restricted || this.deleted || this.blocked)) {
        // add/update index
        meiliToDoWA = meiliToDoWA.filter(id => {
          return id !== this._id
        })
        meiliToDoWA.push(await this._id)
        redis.setJSON('meili:todo:wagoapp', meiliToDoWA)
        if (!this._meiliWA) {
          this._meiliWA = true
          await this.save()
        }
      }
    }
    catch (e) {
      console.log('Meili error', e)
    }
  }
  else if (this._meiliWA) {
    await meiliIndexWA.deleteDocument(this._id)
    this._meiliWA = false
    await this.save()
  }
}

const watchText = ['name', 'description', 'custom_slug']
const watchVisibility = ['hidden', 'private', 'moderated', 'encrypted', 'restricted', 'deleted', 'blocked']
watchText.forEach(field => {
  Schema.path(field).set(function(v) {
    if (this[field] !== undefined) {
      this._doMeiliIndex = (this[field] !== v || this.isNew)
      if (field === 'name') {
        this._doMeiliCodeIndex = this._meiliCode && (this[field] !== v || this.isNew)
      }
    }
    return v
  })
})
watchVisibility.forEach(field => {
  Schema.path(field).set(function(v) {
    this._toggleVisibility = (this._toggleVisibility || this[field] !== undefined)
    if (v) {
      this._doNotIndexWA = true
    }
    return v
  })
})
Schema.path('categories').set(function(v) {
  if (!this._doMeiliIndex && this.categories !== undefined) {
    this._doMeiliIndex = (JSON.stringify(this.categories) !== JSON.stringify(v))
  }
  return v
})
Schema.post('save', setMeiliIndex)
Schema.post('update', setMeiliIndex)
Schema.post('remove', setMeiliIndex)

const WagoItem = mongoose.model('WagoItem', Schema)
WagoItem.esSearch = bluebird.promisify(WagoItem.esSearch, {context: WagoItem})


module.exports = WagoItem