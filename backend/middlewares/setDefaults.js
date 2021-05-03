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
  if (!req.url.match(/\/account/) && (!req.user || !req.user.access || !req.user.access.hideAds)) {
    res.header('embed-twitch', await advert.determineStream(req.raw.ip))
  }
  req.tracking = {}
}