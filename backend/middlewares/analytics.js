
module.exports = function (req, res, next) {
  if (req.raw.url.match(/^\/(auth)/) || req.raw.method.toUpperCase() !== 'GET') {
    return next()
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
  next()
}