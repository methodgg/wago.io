/**
 * Based off memory-store but uses Mongoose
 * Created for Wago
 */
"use strict";

function calculateNextResetTime(windowMs) {
  const d = new Date();
  d.setMilliseconds(d.getMilliseconds() + windowMs);
  return d;
}

function MongoStore(windowMs) {
  let resetTime = new Date(calculateNextResetTime(windowMs));

  var store = {
    incr: function(key, cb) {
    _RateLimiter.incr(key, resetTime, cb)
    },

    decrement: function(key) {
      // not needed but keep the structure
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

module.exports = MongoStore;
