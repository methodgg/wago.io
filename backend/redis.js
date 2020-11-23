const redis = require("redis")
const client = redis.createClient(config.redis)

var redisActive = false

client.on("ready", function () {
  console.log('redis on')
  // if (config.env !== 'development')
    redisActive = true
})
client.on("connect", function () {
})
client.on("end", function () {
  redisActive = false
})
client.on("reconnecting", function () {
})
client.on("error", function (err) {
  redisActive = false
  console.log("Redis Error " + err);
})

module.exports = {
  set: async (key, val, expires) => {
    if (!redisActive) {
      return
    }
    return new Promise((done) => {
      if (typeof val === 'object') {
        try {
          var json = JSON.stringify(val)
          val = json
        }
        catch (e) {
          return done()
        }
      }
      client.set(key, val, 'EX', expires || 3600)
      done()      
    })
  },
  get: async (key) => {
    if (!redisActive) {
      return
    }
    return new Promise((done) => {
      client.get(key, (err, val) => {
        try {
          const json = JSON.parse(val)
          done(json)
        }
        catch (e) {
          done(val)
        }
      })
    })
  },
  clear: (key) => {
    if (!redisActive) {
      return
    }
    if (typeof key === 'object' && key._id) {
      client.del(key._id)
      client.del(`API:WA:${key._id}`)
      if (key.custom_slug) {
        client.del(key.custom_slug)
        client.del(`API:WA:${key.custom_slug}`)
      }
    }
    else {
      client.del(key)
      client.del(`API:WA:${key}`)
    }
  },
  clearWago: (key) => {
  },
  info: () => {
    return new Promise((done) => {
      try {
        var info = Object.assign({}, client.server_info)
        client.client('list', function(err, clients) {
          info.client_list = clients
          info.client_list_err = err
          done(info)
        })
      }
      catch (e) {
        done(val)
      }
    })
  },
  getClient: () => {
    return client
  }
}