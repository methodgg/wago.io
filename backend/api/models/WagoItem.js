const mongoose = require('mongoose'),
      mongoosastic = require('mongoosastic'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      shortid = require('shortid'),
      config = require('../../config')

const Schema = new mongoose.Schema({
  _id : { type: String, default: shortid.generate, es_indexed: true },
  custom_slug : { type: String, index: true, es_indexed: true },
  _userId : { type: mongoose.Schema.Types.ObjectId, ref: 'Users', es_indexed: true },

  name : { type: String, index: true, es_indexed: true},
  description : { type: String, default: "", es_indexed: true },
  description_format : { type: Number, default: 1 }, // 1=BBcode, 2=Markdown
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

  hidden : { type: Boolean, default: false, index: true, es_indexed: true },
  private : { type: Boolean, default: false, index: true, es_indexed: true },
  deleted : { type: Boolean, default: false, index: true, es_indexed: true },

  clone_of : String,
  fork_of: String,

  popularity : {
      views : { type: Number, default: 0, index: true, es_indexed: true },
      viewsThisWeek : { type: Number, default: 0, index: true, es_indexed: true },
      embeds : { type: Number, default: 0 },
      downloads : { type: Number, default: 0 },
      favorites : { type: Array, index: true, es_indexed: true },
      favorite_count : { type: Number, default: 0, index: true, es_indexed: true },  // this should always match the length of favorites
      installed_count : { type: Number, index: true }, // count users of Buds' app that have this WA installed
      comments_count : { type: Number, default: 0, index: true, es_indexed: true }
  },

  // relevancy scores for searches
  relevancy: {
    standard: { type: Number, index: true, es_indexed: true },
    strict: { type: Number, index: true, es_indexed: true }
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
})

// add Mongoosastic plugin (elastic search)
Schema.plugin(mongoosastic, {
  hosts: config.elasticServers
})

/**
 * Statics
 */
// Look up wago by id or custom slug
Schema.statics.lookup = function(slug) {
  return this.findOne({"$or": [{_id: slug}, {custom_slug: slug}]}).exec()
}

// virtuals
Schema.virtual('visibility').get(function() {
  if (this.private) return "Private"
  else if (this.hidden) return "Hidden"
  else return "Public"
})

Schema.virtual('slug').get(function() {
  if (this.custom_slug) return this.custom_slug
  else return this._id
})
Schema.virtual('url').get(function() {
  return 'https://wago.io/'+this.slug
})

Schema.statics.randomOfTheMoment = function(callback) {
  var search = {"hidden": false, "private": false, "deleted": false, $or:[{type: 'WEAKAURAS2'}, {type: 'ELVUI'}, {type: 'VUHDO'}], modified: { "$gte": new Date(2018, 7, 17) } }
  this.count(search).exec().then((count) => {
    if (count > 0) {
      var rand = Math.floor(Math.random() * count)
      this.findOne(search).skip(rand).exec().then((doc) => {
        Screenshot.findOne({auraID: doc._id}).exec().then((screen) => {
          if (screen) {
            var wotm = {}
            wotm.name = doc.name
            wotm.slug = doc.slug
            wotm.screenshot = screen.url
            callback(wotm)
          }
          else {
            return this.randomOfTheMoment(callback)
          }
        })
      })
    }
  })
}

const WagoItem = mongoose.model('WagoItem', Schema)
// if (require('../../config').env == 'production' && require('../../config').host == 'data-02' && !global.CRONTASK) {
//   var es_Stream = WagoItem.synchronize()
//   var es_Count = 0

//   es_Stream.on('error', function(err){
//     logger.error({label: 'Elastic index error', err: err});
//   });
//   es_Stream.on('data', function() {
//     es_Count++;
//   });
//   es_Stream.on('close', function() {
//     logger.info('Elastic indexed ' + es_Count + ' documents!');
//   });
// }
module.exports = WagoItem
