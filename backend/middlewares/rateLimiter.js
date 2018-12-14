/**
 * Rate limiter
 */
const rateLimit = require('./express-rate-limit/lib/express-rate-limit')
const mongoStore = require('./express-rate-limit/lib/mongo-store')

// 50 requests per minute against backend service
const commonRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
  store: mongoStore,
  keyGenerator: (req) => {
    return req.headers['cf-connecting-ip']
  },
  handler: (req, res) => {
    res.send(429, {msg: 'Rate limit exceeded'})
  }
})
// 10 token failed authentication attempts per hour
const commonAuthRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  headers: false,
  expectUser: true,
  keyGenerator: (req) => {
    return 'auth' + req.headers['cf-connecting-ip']
  },
  handler: (req, res) => {
    res.send(429, {msg: 'Too many failed auth attempts. IP Blocked.'})
  }
})
// 6000 API requests per hour
const apiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6000,
  store: mongoStore,
  keyGenerator: (req) => {
    return 'api' + req.headers['cf-connecting-ip']
  },
  handler: (req, res) => {
    res.send(429, {msg: 'Rate limit exceeded'})
  }
})
// 10 API failed authentication attempts per hour
const apiAuthRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  headers: false,
  expectUser: true,
  keyGenerator: (req) => {
    return 'apiAuth' + req.headers['cf-connecting-ip']
  },
  handler: (req, res) => {
    res.send(429, {msg: 'Too many failed auth attempts. IP Blocked.'})
  }
})

module.exports = function(req, res, next) {
  if (req.url.indexOf('/api/') === 0 && req.query.key) {
    return apiAuthRateLimit(req, res, () => {
      return apiRateLimit(req, res, next)
    })
  }
  else if (req.url.indexOf('/api/') === 0) {
    return apiRateLimit(req, res, next)
  }
  else if (req.headers['x-auth-token'] && req.cookies && req.cookies.token === req.headers['x-auth-token']) {
    return commonAuthRateLimit(req, res, () => {
      return commonRateLimit(req, res, next)
    })
  }
  else {
    return commonRateLimit(req, res, next)
  }
}