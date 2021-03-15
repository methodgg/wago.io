module.exports = function(redis) {
  redis._get = redis.get
  redis.get = async function(key) {
    var val = await redis._get(key)
    if (val === 'false') return false
    if (val === 'true') return true
    return val
  }
  
  redis.getJSON = async function(key) {
    try {
      var val = await redis._get(key)
      var json = JSON.parse(val)
      return json
    }
    catch (e) {
      return null
    }
  }

  redis.setJSON = async function(key, obj, ...args) {
    try {
      var json = JSON.stringify(obj)
      return redis.set(key, json, ...args)
    }
    catch (e) {
      return null
    }
  }

  redis.clear = async function(obj) {
    if (obj.custom_slug) {
      return redis.del(obj._id, obj.custom_slug, `API:${obj._id}`, `API:${obj.custom_slug}`)
    }
    else {
      return redis.del(obj._id, `API:${obj._id}`)
    }
  }

  return redis
}