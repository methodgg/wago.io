const sharp = require('sharp')
const mkdirp = require('mkdirp')
const mmm = require('mmmagic')

module.exports = {
  avatarFromURL: (url, userID, name, callback) => {
    if (!url || !userID || !name) {
      return callback({error: 'bad_input'})
    }

    var saveToDirectory = '/nfs/media/avatars/' + userID
    mkdirp.sync(saveToDirectory)
    
    // save url to temp file
    request(url, {encoding: null}, function(err, resp, buffer) {      
      var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)
      magic.detect(buffer, (err, mime) => {
        var match = mime.match(/^image\/(png|jpg|gif|jpeg|webp)/)
        // if image mime type is detected then save file
        if (!match) {
          return (callback({error: 'not_image'}))
        }
        var time = Date.now()
        async.parallel({
          webp: (cb) => {
            sharp(buffer).resize(64, 64).ignoreAspectRatio().toFormat('webp').toFile(saveToDirectory + '/' + name + '-' + time + '.webp').then(() => {
              cb(null, 'https://media.wago.io/avatars/' + userID + '/' + name + '-' + time + '.webp')
            })
          },
          png: (cb) => {
            sharp(buffer).resize(64, 64).ignoreAspectRatio().toFormat('png').toFile(saveToDirectory + '/' + name + '-' + time + '.png').then(() => {
              cb(null, 'https://media.wago.io/avatars/' + userID + '/' + name + '-' + time + '.png')
            })
          }
        }, (err, images) => {
          if (err) {
            return callback({error: err})
          }
          else {
            callback(images)
          }
        })
      })
    })
  },

  avatarFromBuffer: (file, userID, name, callback) => {
    if (!file || !userID || !name) {
      return callback({error: 'bad_input', inputs: [file, userID, name]})
    }

    var saveToDirectory = '/nfs/media/avatars/' + userID
    mkdirp.sync(saveToDirectory)
    
    var time = Date.now()
    async.parallel({
      webp: (cb) => {
        sharp(file).resize(64, 64).ignoreAspectRatio().toFormat('webp').toFile(saveToDirectory + '/' + name + '-' + time + '.webp').then(() => {
          cb(null, 'https://media.wago.io/avatars/' + userID + '/' + name + '-' + time + '.webp')
        })
      },
      png: (cb) => {
        sharp(file).resize(64, 64).ignoreAspectRatio().toFormat('png').toFile(saveToDirectory + '/' + name + '-' + time + '.png').then(() => {
          cb(null, 'https://media.wago.io/avatars/' + userID + '/' + name + '-' + time + '.png')
        })
      }
    }, (err, images) => {
      if (err) {
        return callback({error: err})
      }
      else {
        callback(images)
      }
    })
  }
}