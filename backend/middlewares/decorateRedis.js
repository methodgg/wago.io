module.exports = function(redis) {
  redis.getJSON = async function(key) {
    try {
      var val = await redis.get(key)
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