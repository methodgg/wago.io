const ua = require('universal-analytics')
const UUID = require('uuid-1345')

module.exports = function(req, res, next) {
  if (req.path().match(/\/(account|auth)\//) || req.method != 'GET') {
    return next()
  }
  new Promise((resolve, reject) => {
    UUID.v5({
      namespace: UUID.namespace.oid,
      name: req.headers['user-agent'] + req.connection.remoteAddress
    }, (err, result) => {
      if (err) {
        return reject()
      }
      resolve(ua('UA-75437214-1', result, {strictCidFormat: false, geoid: req.headers['cf-ipcountry'] || null, ua: req.headers['user-agent'] || null, dr: req.params._ref || null}))
    })     
  }).then((visitor) => {
    if (req.headers.referer) {
      visitor.pageview({dp: req.headers.referer.replace(/^https:\/\/wago.io/, ''), dh: 'https://wago.io'}).send()
    }
    else {
      visitor.event("API", req.path()).send()
    }
    return next()
  }).catch((e) => {
    return next()
  })

}