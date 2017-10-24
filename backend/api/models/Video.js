var mongoose = require('mongoose')

// define the schema for our user model
var Schema = mongoose.Schema({
  wagoID : {type: String, index: true},
  source: String,  // youtube, twitch, etc
  videoID: String,  // youtube id, etc
  videoType: String,
  thumb: String,
  sort: {type: Number, default: 999},
  added : { type: Date, default: Date.now },
}, {timestamps: true})

// create URL to thumbnail image
Schema.virtual('thumbnail').get(function() {
  switch(this.source) {
    case 'youtube': return 'http://img.youtube.com/vi/'+this.videoID+'/0.jpg'
    default: return this.thumb          
  }
})

Schema.virtual('embed').get(function() {
  // adjustments...
  var embedParams = ''
  switch(this.source) {
    case 'youtube': 
      // make youtube autoplay
      embedParams = 'autoplay=1'
      break
    case 'twitch':
      // pre-wagov3, videos stored differently
      if (!this.videoType) {
        this.videoType = 'video'
        this.videoID = 'v' + this.videoID
      }
  }

  var embedURL = videoParser.create({
    videoInfo: {
      provider: this.source,
      id: this.videoID,
      mediaType: this.videoType || 'video'
    }, format: 'embed'
  })

  if (!embedURL) {
    return 'Error'
  }

  if (embedParams && embedURL.indexOf('?')) {
    embedURL = embedURL + '&' + embedParams
  }
  else {
    embedURL = embedURL + '?' + embedParams
  }

  return '<iframe src="'+embedURL+'" frameborder="0" scrolling="no"></iframe>'
})

Schema.virtual('url').get(function() {
  switch(this.source) {
    case 'youtube': return 'https://www.youtube.com/embed/'+this.videoID+'?autoplay=1'
    case 'twitch': return 'https://player.twitch.tv/?video=v'+this.videoID
  }
})

Schema.statics.findForWago = function(id) {
  return this.find({"wagoID": id}).sort({sort: 1, uploaded: 1}).exec()
}

const Video = mongoose.model('Videos', Schema)
module.exports = Video