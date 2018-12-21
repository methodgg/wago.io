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
WagoCode.count({semver: null}).then((num) => {
  remaining = num
})

function makeVersions(c) {
  var processed = []
  WagoCode.find({semver: null}).limit(100).skip(c*100).then((docs) => {
    async.forEach(docs, (code, done) => {
      if (processed.indexOf(code.auraID) >= 0) {
        return done()
      }
      WagoCode.find({auraID: code.auraID}).sort({updated: 1}).then((versions) => {
        async.forEachOf(versions, (version, i, cb) => {
          i++
          if (i == versions.length) {
            version.semver = '1.0.0-' + i
          }
          else {
            version.semver = '0.0.' + i
          }
          version.save().then(() => {
            processed.push(code.auraID)
            cb()
          })
        }, () => {
          done()
        })
      })
    }, () => {
      console.log('c =', c, 'remaining =', remaining - c * 100)      
      makeVersions(c+1)
    })
  })
}
makeVersions(0)