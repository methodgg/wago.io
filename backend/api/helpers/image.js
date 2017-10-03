const sharp = require('sharp')
const webpc = require('webp-converter')

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

  avatarFromBuffer: (file, userID, avatarFormat, callback) => {
    if (!file || !userID || !avatarFormat) {
      return callback({error: 'bad_input', inputs: [file, userID, avatarFormat]})
    }

    var saveToDirectory = '/nfs/media/avatars/' + userID
    mkdirp.sync(saveToDirectory)
    
    var time = Date.now()

    // if animated avatar format
    if (avatarFormat === 'animated') {
      // can only get to this if image buffer is a gif
      async.waterfall([
        // save gif
        (cb) => {
          fs.writeFile(saveToDirectory + '/' + avatarFormat + '-' + time + '.gif', file, (err) => {
            cb(err, saveToDirectory + '/' + avatarFormat + '-' + time + '.gif')
          })
        },
        // save webp
        (gif, cb) => {
          webpc.gwebp(gif, saveToDirectory + '/' + avatarFormat + '-' + time + '.webp', '-q 90', (status) => {
            if (status.indexOf('100') > -1) {
              cb(null, gif, 'https://media.wago.io/avatars/' + userID + '/' + avatarFormat + '-' + time + '.webp')
            }
            else {
              cb('Unable to convert to webp ' + status)
            }
          })
        }
      ], (err, gif, webp) => {
        if (err) {
          return callback({error: err})
        }
        else {
          callback(null, {gif: webp.replace(/\.webp/, '.gif'), webp: webp})
        }
      })
    }
    // standard format
    else {
      async.parallel({
        webp: (cb) => {
          sharp(file).resize(64, 64).ignoreAspectRatio().toFormat('webp').toFile(saveToDirectory + '/' + avatarFormat + '-' + time + '.webp').then(() => {
            cb(null, 'https://media.wago.io/avatars/' + userID + '/' + avatarFormat + '-' + time + '.webp')
          })
        },
        png: (cb) => {
          sharp(file).resize(64, 64).ignoreAspectRatio().toFormat('png').toFile(saveToDirectory + '/' + avatarFormat + '-' + time + '.png').then(() => {
            cb(null, 'https://media.wago.io/avatars/' + userID + '/' + avatarFormat + '-' + time + '.png')
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
}