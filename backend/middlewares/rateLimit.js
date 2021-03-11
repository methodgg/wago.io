const store = redis.getClient()

module.exports = function (req, res, next) {
  const method = req.raw.method && req.raw.method.toUpperCase && req.raw.method.toUpperCase()
  if (method === 'OPTIONS') {
    // OPTIONS for cors pre-flight.
    return next()
  }
  var key, max, expire
  if (req.raw.url.match(/^\/auth\//)) {
    key = 'rate:auth:' + req.raw.ip
    max = 30
    expire = 3600
  }
  else {
    key = 'rate:wago:' + req.raw.ip
    max = 500
    expire = 60
  }
  store.incr(key, (err, count) => {
    if (err) {
      console.error('RATE LIMIT ERROR', err)
    }
    else if (count <= 5) {
      store.expire(key, expire)
    }
    else if (count > max) {
      return res.code(429).send({error: "Rate limit exceeded"})
    }
  })

  const channel = (global.EmbeddedStream || {}).channel || 'method'
  store.get(`stream:${channel}:${req.raw.ip}`, (err, val) => {
    if (!err && val) {
      store.expire(`stream:${channel}:${req.raw.ip}`, 70)
    }
  })

  return next()
}