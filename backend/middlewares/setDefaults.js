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
  const wotm = await redis.get('static:WagoOfTheMoment') 
  if (wotm) {
    res.header('wotm', encodeURIComponent(wotm || {}))
  }

  req.tracking = {}
  if (parseInt(req.body.domain ?? req.query.domain) === ENUM.DOMAIN.FELLOWSHIP || ('' + (req.body.domain ?? req.query.domain ?? '')).toUpperCase() === 'FELLOWSHIP') {
    req.domain = ENUM.DOMAIN.FELLOWSHIP
  }
  else {
    req.domain = ENUM.DOMAIN.WOW
  }
}