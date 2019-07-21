module.exports = function (req, res, next) {
  const method = req.raw.method && req.raw.method.toUpperCase && req.raw.method.toUpperCase()
  const allowedOrigins = ['https://wago.io', 'http://io:8080']

  if (!req.headers.origin) {
    res.header('Access-Control-Allow-Origin', '*')
  }
  else if (allowedOrigins.indexOf(req.headers.origin) >= 0 || req.raw.url.match(/^\/api\//)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
  }
  else {
    res.header('Access-Control-Allow-Origin', false)
  }
  res.header('Vary', 'Origin')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Expose-Headers', 'set-cookie,wotm')
  // if preflight check
  if (method === 'OPTIONS') {
    res.header('Access-Control-Request-Headers', 'GET, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'set-cookie,cookie,wotm,authorization,x-auth-token,accept,accept-version,content-type,request-id,origin')
    
    return res.code(204).send('')
  }
  return next()
}