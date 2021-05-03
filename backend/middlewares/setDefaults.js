const advert = require('../api/helpers/advert')

module.exports = async function(req, res) {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body)
    }
    catch (e) {
      req.body = {}
    }
  }
  if (!req.body) {
    req.body = {}
  }
  if (global['WagoOfTheMoment']) {
    res.header('wotm', encodeURIComponent(JSON.stringify(global['WagoOfTheMoment'] || {})))
  }

  if (req.user && req.user.access && req.user.access.hideAds) {
    redis2.zadd('premiumUsers', Math.round(Date.now()/1000), req.raw.ip)
  }
  else if (!req.url.match(/\/account/)) {
    res.header('embed-twitch', await advert.determineStream(req.raw.ip))
  }

  // active users
  redis2.zadd('activeUsers', Math.round(Date.now()/1000), req.raw.ip)

  req.tracking = {}
}