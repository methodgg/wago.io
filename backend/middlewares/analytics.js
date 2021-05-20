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
}