const advert = require('../api/helpers/advert')

module.exports = async function (req, res) {
  if (req.raw.url.match(/^\/(auth)/) || req.raw.method.toUpperCase() !== 'GET') {
    return
  }
  try {
    var track = {}
    if (req.tracking.search) {
      track.search = req.tracking.search.query
      track.search_count = req.tracking.search.count
    }

    req.track(track)
  }
  catch (e) {
    console.error('FAILED TO TRACK ANALYTICS', e)
  }
  // if no content then end response after tracking request
  if (res.raw.statusCode === 304) {
    return res.send('')
  }

  redis2.zadd('activeUsers', Math.round(Date.now()/1000), req.raw.ip)
  if (req.user && req.user.access && req.user.access.hideAds) {
    redis2.zadd('premiumUsers', Math.round(Date.now()/1000), req.raw.ip)
  }
  else if (!req.url.match(/\/account\/whoami/)) {
    const stream = await advert.determineStream(req.raw.ip)
    redis2.zadd(`streamUsers:${stream}`, Math.round(Date.now()/1000), req.raw.ip)
    res.header('embed-twitch', stream)
  }

}