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
global['WagoItem'] = require('./api/models/WagoItem')
global['WagoCode'] = require('./api/models/WagoCode')

var totalAuras = 0
var totalTriggers = 0
var totalAurasWithAtLeastOneTrigger = 0
var i = 0
WagoItem.find({type: "WEAKAURAS2"}).select('_id').then((docs) => {
  totalAuras = docs.length
  async.forEach(docs, (wago, done) => {
    WagoCode.findOne({auraID: wago._id}).sort({updated: -1}).then((code) => {
      console.log(++i, i / totalAuras * 100)
      try {
        var json = JSON.parse(code.json)

        var triggers = 0
        if (json && json.d && json.d.triggers) {
          Object.keys(json.d.triggers).forEach((t) => {
            if (!isNaN(t)) triggers++
          })
          if (json.c) {
            json.c.forEach((grouped) => {
              if (grouped && grouped.triggers) {
                Object.keys(grouped.triggers).forEach((t) => {
                  if (!isNaN(t)) triggers++
                })
              }
            })
          }
        }
        else if (json && json.d && json.d.numTriggers > 0) {
          triggers = triggers + json.d.numTriggers
          if (json.c) {
            json.c.forEach((grouped) => {
              if (grouped && grouped.numTriggers > 0) {
                triggers = triggers + grouped.numTrigger
              }
            })
          }
        }
        if (triggers > 0) {
          totalAurasWithAtLeastOneTrigger++
          totalTriggers = totalTriggers + triggers
        }
      }
      catch (e) {
        console.log(wago._id, 'baaad')
      }
      done()
    })
  }, () => {
    console.log('totalAuras = ', totalAuras, 'totalTriggers = ', totalTriggers, 'totalAurasWithAtLeastOneTrigger = ', totalAurasWithAtLeastOneTrigger)
    process.exit()
  })
})