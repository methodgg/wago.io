module.exports = function(req, res, next) {
  if (req.user || !req.query.key || !req.getPath().match(/^\/api\//)) {
    return next()
  }

  User.findByAPIKey(req.query.key).then((user) => {
    if (user) {
      req.user = user
    }
    next()
  })
}