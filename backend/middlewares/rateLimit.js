module.exports = async function (req, res) {
  const method = req.raw.method && req.raw.method.toUpperCase && req.raw.method.toUpperCase()
  if (method === 'OPTIONS') {
    // OPTIONS for cors pre-flight.
    return
  }
  var key, max, expire
  if (req.raw.url.match(/^\/auth\//)) {
    key = 'limit:auth:' + req.raw.ip
    max = 30
    expire = 3600
  }
  else {
    key = 'limit:wago:' + req.raw.ip
    max = 2000
    expire = 60
  }

  let current = await redis2.llen(key)
  if (current > max) {
    let ttl = await redis2.ttl(key)
    req.trackError({name: 'Rate Limit Exceeded', message: 'Rate Limit Exceeded', stack: `${key}; TTL=${ttl}; Hits=${current}`})
    if (ttl > 0) {
      return res.code(429).send({error: "Rate limit exceeded"})
    }
    await redis2.expire(key, 1) // in case expire wasn't set?
  }

  if (current) {
    await redis2.rpushx(key, 1)
  }
  else {
    await redis2.rpush(key, 1)
    await redis2.expire(key, expire)
  }
}
