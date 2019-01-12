const ua = require('universal-analytics')
const UUID = require('uuid-1345')

module.exports = function(req, res, next) {
  if ((req.headers.referer && !req.headers.referer.match(/^https:\/\/wago.io/)) || req.path().match(/\/account\//) || req.method != 'GET') {
    return next()
  }
  new Promise((resolve, reject) => {
    if (req.user) {
      UUID.v5({
        namespace: UUID.namespace.oid,
        name: req.user._id.toString()
      }, (err, result) => {
        if (err) {
          return reject()
        }
        resolve(ua('UA-75437214-1', result))
      })      
    }
    else {
      UUID.v5({
        namespace: UUID.namespace.oid,
        name: req.headers['user-agent'] + req.connection.remoteAddres
      }, (err, result) => {
        if (err) {
          return reject()
        }
        resolve(ua('UA-75437214-1', result))
      })        
    }
  }).then((track) => {
    if (req.headers.referer) {
      track.pageview({dp: req.headers.referer.replace(/^https:\/\/wago.io/, ''), dh: 'https://wago.io'}).send()
    }
    else {
      track.event("API", req.path()).send()
    }
    return next()
  }).catch((e) => {
    return next()
  })

}