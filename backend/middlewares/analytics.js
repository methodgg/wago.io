
module.exports = function (req, res, payload, next) {
  if (req.raw.url.match(/^\/(auth|account)/) || req.raw.method.toUpperCase() !== 'GET') {
    return next()
  }
  try {
    var track = {}
    if (typeof payload === 'object') {
      track.bw_bytes = JSON.stringify(payload).length
    }
    else if (typeof payload === 'string') {
      track.bw_bytes = payload.length
    }

    if (req.tracking.search) {
      track.search = req.tracking.search.query
      track.search_count = req.tracking.search.count
    }

    req.track(track)
  }
  catch (e) {
    console.error('FAILED TO TRACK ANALYTICS', e)
  }
  next()
}