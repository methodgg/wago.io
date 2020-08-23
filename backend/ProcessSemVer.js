// requires
const config = require('./config')
global.CRONTASK = true
const mongoose = require('mongoose')
const async = require('async')
const fs = require('fs')

// connect mongoose
db = mongoose.connect(config.db.uri)
mongoose.Promise = global.Promise

// mongoose models
global['WagoCode'] = require('./api/models/WagoCode')

var remaining = 1
WagoCode.count({versionString: null}).then((num) => {
  remaining = num
  makeVersions(0)
})

var n = 0
function makeVersions(c) {
  var processed = []
  WagoCode.find({versionString: null}).limit(100).skip(c*100).then((docs) => {
    if (!docs) return
    async.forEach(docs, (code, done) => {
      if (processed.indexOf(code.auraID) >= 0) {
        return done()
      }
      WagoCode.find({auraID: code.auraID}).sort({updated: 1}).then((versions) => {
        async.forEachOf(versions, (version, i, cb) => {
          i++
          if (i == versions.length) {
            version.versionString = '1.0.0'
          }
          else {
            version.versionString = '0.0.' + i
          }
          version.version = i
          version.save().then(() => {
            n++
            cb()
          })
        }, () => {
          processed.push(code.auraID)
          done()
        })
      })
    }, () => {
      setTimeout(() => {
        makeVersions(c+1)
      }, 30000)      
    })
  })
}
