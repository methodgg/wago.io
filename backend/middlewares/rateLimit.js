module.exports = async function (req, res) {
  const method = req.raw.method && req.raw.method.toUpperCase && req.raw.method.toUpperCase()
  if (method === 'OPTIONS') {
    // OPTIONS for cors pre-flight.
    return
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
  var count = await redis2.incr(key)
  if (count === 1) {
    redis2.expire(key, expire)
  }
  else if (count > max) {
    return res.code(429).send({error: "Rate limit exceeded"})
  }

  // existing embed?
  const current = await redis2.get(`currentstream:${req.raw.ip}`)
  if (current && await redis.get(`twitch:${current}:live`)) {
    redis2.zadd('streamViews', Math.round(Date.now()/1000), `${current}:${req.raw.ip}`)
    redis2.expire(`currentstream:${req.raw.ip}`, 70)
    return
  }
  return
}