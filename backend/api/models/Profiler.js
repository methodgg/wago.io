const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
  route: {type: String, index: true},
  host: {type: String},
  method: {type: String},
  statusCode: {type: Number},
  events: [{
    label: String,
    elapsed: Number
  }],
  timestamp : {type: Date, default: Date.now, expires: 3600*24*5, index: true},
  elapsed: {type: Number, index: true}
})

Schema.statics.startRequest = async function (req) {
  if (req.raw.method.match(/GET|POST/)) {
    req.profiler = new this({route: req.raw.originalUrl.replace(/(&|\?)_ref=.*(&|$)/, ''), method: req.raw.method, host: req.hostname, events: [{label: 'Request', elapsed: 0}]})
    await req.profiler.save()
  }
}

Schema.statics.startTask = async function (job) {
  var profiler = new this({route: job.name, method: 'TASK', host: config.host, events: [{label: 'Start', elapsed: 0}]})
  await profiler.save()
  return profiler
}

Schema.statics.logEvent = async function (profiler, label, statusCode) {
  if (profiler) {
    profiler.events.push({label: label, elapsed: Date.now() - profiler.timestamp})
    profiler.elapsed = Date.now() - profiler.timestamp
    if (statusCode) {
      profiler.statusCode = statusCode
    }
    await profiler.save()
  }
}

const Profiler = mongoose.model('Profiler', Schema)
module.exports = Profiler