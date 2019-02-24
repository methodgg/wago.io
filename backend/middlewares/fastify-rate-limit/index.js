'use strict'

const fp = require('fastify-plugin')
const FJS = require('fast-json-stringify')
const md5 = require('md5')

// const LocalStore = require('./store/LocalStore')
// const RedisStore = require('./store/RedisStore')
const MongoStore = require('./store/MongoStore')

const serializeError = FJS({
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' }
  }
})

function rateLimitPlugin (fastify, opts, next) {
  // const store = opts.redis
  //   ? new RedisStore(opts.redis, timeWindow)
  //   : new LocalStore(timeWindow, opts.cache)
  const store = new MongoStore()

  fastify.addHook('onRequest', onRateLimit)
  fastify.addHook('onSend', removeRateLimit)

  async function onRateLimit (req, res, next) {
    if (req.raw.method === 'OPTIONS') {
      return next()
    }
    var key = md5(req.raw.ip)

    try {
      if (req.raw.url.indexOf('/api/') === 0) {
        if (req.query.key) {
          // limit auth request attempts
          req.clearLimitOnAuth = 'auth-' + key
          onIncr(10, await store.incr({key: 'auth-' + key, expires: 3600 * 1000, url: req.raw.url}))
        }
        // rate limit api requests 6000 per hour
        onIncr(6000, await store.incr({key: 'api-' + key, expires: 3600 * 1000, url: req.raw.url}), true)
      }
      else {
        if (req.raw.url.indexOf('/auth/' || (req.headers['x-auth-token'] && req.cookies && req.cookies.token === req.headers['x-auth-token']))) {
          // limit auth request attempts
          req.clearLimitOnAuth = 'auth-' + key
          onIncr(10, await store.incr({key: 'auth-' + key, expires: 3600 * 1000, url: req.raw.url}))
        }
        // rate limit common requests 1000 per 10min
        onIncr(1000, await store.incr({key: 'common-' + key, expires: 600 * 1000, url: req.raw.url}), true)
      }
    }
    catch (e) {
      req.trackError(e)
    }
    function onIncr (max, current, finish) {
      if (current <= max && finish) {
        res.header('X-RateLimit-Limit', max)
        res.header('X-RateLimit-Remaining', max - current)
        return 
      } 
      else if (current > max) {
        // track possible errors or ddos attacks
        req.track({
          e_c: 'REQ LIMIT EXCEEDED',
          e_a: `${current} > ${max} at ${req.raw.url}`,
          e_n: `${current} > ${max} at ${req.raw.url}`
        })
        res.type('application/json').serializer(serializeError)
        res.code(429)
          .header('X-RateLimit-Limit', max)
          .header('X-RateLimit-Remaining', 0)
          .send({
            statusCode: 429,
            error: 'Too Many Requests',
            message: `Rate limit exceeded`
          })
      }
    }
  }

  function removeRateLimit (req, res, payload, next) {
    if (req.clearLimitOnAuth) {
      store.decr(req.clearLimitOnAuth)
    }
    next()
  }

  next()
}

module.exports = fp(rateLimitPlugin, {
  fastify: '>=2.x',
  name: 'fastify-rate-limit'
})
