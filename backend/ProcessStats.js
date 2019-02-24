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
var totalGroups = 0
var totalImports = 0
var totalTriggers = 0
var totalAurasWithAtLeastOneTrigger = 0
var totalAurasWithAtLeastTwoTriggers = 0
var totalAurasInsideGroups = 0
var SetDurationInfo = 0
var hooksecurefunc = 0
var i = 0
function getStats(c) {
  WagoItem.find({type: "WEAKAURAS2"}).select('_id popularity').limit(1000).skip(1000*c).then((docs) => {
    totalImports = totalImports + docs.length
    totalAuras = totalAuras + docs.length
    async.forEach(docs, (wago, done) => {
      i++
      WagoCode.findOne({auraID: wago._id}).sort({updated: -1}).then((code) => {
        try {
          if (!code) return done()

          if (code.json.match(/SetDurationInfo/)) {
            SetDurationInfo += wago.popularity.installed_count      
          }
          if (code.json.match(/hooksecurefunc/)) {
            hooksecurefunc += wago.popularity.installed_count       
          }
          var json = JSON.parse(code.json)

          var triggers = 0
          if (json && json.d && json.d.triggers) {
            Object.keys(json.d.triggers).forEach((t) => {
              if (!isNaN(t)) triggers++
            })
          }
          else if (json && json.d && json.d.numTriggers > 0) {
            triggers = triggers + json.d.numTriggers
          }

          if (json.c) {
            totalGroups++
            if (Array.isArray(json.c)) {
              totalAurasInsideGroups = totalAurasInsideGroups + json.c.length
              json.c.forEach((grouped) => {
                var ctriggers = 0
                if (grouped && grouped.triggers) {
                  Object.keys(grouped.triggers).forEach((t) => {
                    if (!isNaN(t)) {
                      ctriggers++
                    }
                  })
                }
                else if (grouped && parseInt(grouped.numTriggers) > 0) {
                  ctriggers = ctriggers + parseInt(grouped.numTriggers)
                }
                if (ctriggers > 0) {
                  totalAurasWithAtLeastOneTrigger++
                  totalTriggers = totalTriggers + ctriggers
                }
                if (ctriggers > 1) {
                  totalAurasWithAtLeastTwoTriggers++
                }
              })
            }
            else {
              totalAurasInsideGroups = totalAurasInsideGroups + Object.keys(json.c).length
              Object.keys(json.c).forEach((g) => {
                var grouped = json.c[g]
                var ctriggers = 0
                if (grouped && grouped.triggers) {
                  Object.keys(grouped.triggers).forEach((t) => {
                    if (!isNaN(t)) {
                      ctriggers++
                    }
                  })
                }
                else if (grouped && parseInt(grouped.numTrigger) > 0) {
                  ctriggers = ctriggers + parseInt(grouped.numTrigger)
                }
                if (ctriggers > 0) {
                  totalAurasWithAtLeastOneTrigger++
                  totalTriggers = totalTriggers + ctriggers
                }
                if (ctriggers > 1) {
                  totalAurasWithAtLeastTwoTriggers++
                }
              })
            }            
          }

          if (triggers > 0) {
            totalAurasWithAtLeastOneTrigger++
            totalTriggers = totalTriggers + triggers
          }
          if (triggers > 1) {
            totalAurasWithAtLeastTwoTriggers++
          }
        }
        catch (e) {
          console.log(wago._id, 'baaad', e)
        }
        done()
      })
    }, () => {
      console.log('c=', c)
      console.log('totalWeakAuraImports =', totalImports, 'totalWithhooksecurefunc =', hooksecurefunc, 'totalWithSetDurationInfo =', SetDurationInfo, 'totalGroups =', totalGroups, 'totalAurasInsideGroups =', totalAurasInsideGroups, 'totalTriggers =', totalTriggers, 'totalAurasWithAtLeastOneTrigger =', totalAurasWithAtLeastOneTrigger, 'totalAurasWithAtLeastTwoTriggers =', totalAurasWithAtLeastTwoTriggers)

      getStats(++c)
    })
  })
}
getStats(0)