module.exports = function (req, res, next) {
  const method = req.raw.method && req.raw.method.toUpperCase && req.raw.method.toUpperCase()
  const allowedOrigins = [/^https:\/\/([^.]+\.)?wago.io/, /^http:\/\/io:8080/, /^http:\/\/localhost:\d+/]

  let allow = true
  if (!req.headers.origin) {
    res.header('Access-Control-Allow-Origin', '*')
  }
  else if (req.raw.url.match(/^\/api\//)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin)
  }
  else {
    allow = false
    for (let i = 0; i < allowedOrigins.length; i++) {
      if (req.headers.origin.match(allowedOrigins[i])) {
        res.header('Access-Control-Allow-Origin', req.headers.origin)
        allow = true
        break
      }
    }
  }
  if (!allow) {
    res.header('Access-Control-Allow-Origin', false)
  }
  res.header('Vary', 'Origin')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Expose-Headers', 'set-cookie,wotm,embed-twitch')
  // if preflight check
  if (method === 'OPTIONS') {
    res.header('Access-Control-Request-Headers', 'GET, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'set-cookie,cookie,wotm,embed-twitch,authorization,x-auth-token,accept,accept-version,content-type,request-id,origin,identifier,api-key')

    return res.code(204).send('')
  }
  return next()
}