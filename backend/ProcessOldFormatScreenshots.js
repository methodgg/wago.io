/**
 * Tool to update pre-V3 screenshots to V3 format.
 * Converts images to webp and updates database.
 */


// requires
const config = require('./config')
const mongoose = require('mongoose')
const async = require('async')
const fs = require('fs')
const _ = require('lodash')
const sharp = require('sharp')
const webpc = require('webp-converter')
const mkdirp = require('mkdirp')
const mmm = require('mmmagic')
const {execFile} = require('child_process');
const gifsicle = require('gifsicle');

var magic = new mmm.Magic(mmm.MAGIC_MIME_TYPE)

// connect mongoose
db = mongoose.connect(config.db.uri)
mongoose.Promise = global.Promise
var models = fs.readdirSync('./api/models')

// mongoose models
global['Screenshot'] = require('./api/models/Screenshot')

var moreToDo = true
var count = 0
async.until(() => {
  // process until moreToDo == false
  return !moreToDo

}, (next) => {
  Screenshot.find({thumbnail: {$exists: false}}).limit(10).then((screens) => {
    // if all screenshots are processed
    if (screens.length === 0) {
      moreToDo = false
      return next()
    }

    async.each(screens, (item, callback) => {
      var file = '/nfs/media/screenshots/' + item.auraID + '/' + item.localFile
      var saveToDirectory = '/nfs/media/screenshots/' + item.auraID + '/'
      try {
        var fileStat = fs.statSync(file)
        var fileBuffer = fs.readFileSync(file)
      }
      catch (e) {
        console.log('ERR can not read file', file, e)
        return callback()  
      }
      var time = fileStat.m + 0
      magic.detect(fileBuffer, (err, mime) => {
        var match = mime.match(/^image\/(png|jpg|gif|jpeg|webp)/)
        if (!match) {
          // how is this even in the database?
          // item.remove.exec()
          console.log('ERR not an image', file)
          return callback()
        }

        // if image is a gif, assume it is animated and use gifsicle to process
        if (match[1] === 'gif') {
          async.parallel([
            // process thumbnail
            (cb) => {
              // optimize gif
              execFile(gifsicle, ['--resize-fit 300x200 -o', saveToDirectory + '/thumb-' + time + '.gif', file], (err) => {
                if (err) {
                  return cb(err)
                }
                item.fullsize.gif = 'thumb-' + time + '.gif'
                webpc.gwebp(saveToDirectory + '/thumb-' + time + '.gif', saveToDirectory + '/thumb-' + time + '.webp', '-q 90', (status) => {
                  if (status.indexOf('100') > -1) {
                    item.fullsize.webp = 'thumb-' + time + '.webp'
                    cb()
                  }
                  else {
                    cb('Unable to convert to webp ' + status)
                  }
                })

              })
            },
            // process fullsize
            (cb) => {
              // optimize gif
              execFile(gifsicle, ['-o', saveToDirectory + '/original-' + time + '.gif', file], (err) => {
                if (err) {
                  return cb(err)
                }
                item.fullsize.gif = 'original-' + time + '.gif'
                webpc.gwebp(saveToDirectory + '/original-' + time + '.gif', saveToDirectory + '/original-' + time + '.webp', '-q 90', (status) => {
                  if (status.indexOf('100') > -1) {
                    item.fullsize.webp = 'original-' + time + '.webp'
                    cb()
                  }
                  else {
                    cb('Unable to convert to webp ' + status)
                  }
                })

              })
            }
          ], (err) => {
              if (err) {
                console.log('ERR processing file', file, err)
                return callback()
              }
              item.save().then(() => {
                count++
                console.log('DONE', file)
                callback()
              })
          })

        }
        // if not a gif, process into static png and webp
        else {
          console.log('Starting', file)
          async.parallel([
            // process to webp thumbnail
            (cb) => {
              sharp(fileBuffer).resize(300, 200).max().toFormat('webp').toFile(saveToDirectory + '/thumb-' + time + '.webp').then(() => {
                item.thumbnail.webp = 'thumb-' + time + '.webp'
                cb()
              })
            },
            // process to png thumbnail
            (cb) => {
              sharp(fileBuffer).resize(300, 200).max().toFormat('png').toFile(saveToDirectory + '/thumb-' + time + '.png').then(() => {
                item.thumbnail.webp = 'thumb-' + time + '.png'
                cb()
              })
            },
            // process to webp fullsize
            (cb) => {
              sharp(fileBuffer).toFormat('webp').toFile(saveToDirectory + '/original-' + time + '.webp').then(() => {
                item.fullsize.webp = 'original-' + time + '.webp'
                cb()
              })
            },
            // process to png fullsize
            (cb) => {
              sharp(fileBuffer).toFormat('png').toFile(saveToDirectory + '/original-' + time + '.png').then(() => {
                item.fullsize.webp = 'original-' + time + '.png'
                cb()
              })
            }], (err) => {
              if (err) {
                console.log('ERR processing file', file, err)
                return callback()
              }
              item.save().then(() => {
                count++
                console.log('DONE', file)
                callback()
              })
          })
        }
      })
    }, () => {
      next()
    })
  })
}, () => {
  console.log('All done!')
})


