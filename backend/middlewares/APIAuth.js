module.exports = function(req, res, next) {
  if (req.user || !req.query.key || !req.getPath().match(/^\/api\//)) {
    return next()
  }

  User.findByAPIKey(req.query.key).then((user) => {
    if (user) {
      req.user = user
      req.apiKey = req.query.key
      return next()
    }
    else {
      return res.send(401, {msg: 'Invalid API Key'})
    }
  })
}