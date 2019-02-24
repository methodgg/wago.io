module.exports = function(req, res, next) {
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
  req.tracking = {}
  next()
}