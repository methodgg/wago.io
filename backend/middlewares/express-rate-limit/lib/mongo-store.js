/**
 * Based off memory-store but uses Mongoose
 * Created for Wago
 */
"use strict";

module.exports = {
  incr: function(key, cb) {
    if (typeof key === 'string') {
      _RateLimiter.incr(key, null, cb)
    }
    else {
      _RateLimiter.incr(key.key, key.userID, cb) 
    }
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
