/**
 * Based off memory-store but uses Mongoose
 * Created for Wago
 */
"use strict";

function calculateNextResetTime(windowMs) {
  const d = new Date()
  d.setMilliseconds(d.getMilliseconds() + windowMs);
  return d
}

function MongoStore() {
  var store = {
    incr: async function(opts) {
      let resetTime = new Date(calculateNextResetTime(opts.expires))
      return await _RateLimiter.incr(opts.key, resetTime, opts.url)
    },

    decr: function(key) {
      _RateLimiter.decr(key)
    },

    // export an API to allow hits all IPs to be reset
    resetAll: function() {
      // not needed but keep the structure
    },

    // export an API to allow hits from one IP to be reset
    resetKey: function(key) {
      // not needed but keep the structure
    }
  }
  return store
}

module.exports = MongoStore