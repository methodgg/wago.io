var originMatcher = require('../node_modules/restify-cors-middleware/src/origin-matcher.js')
var constants = require('../node_modules/restify-cors-middleware/src/constants.js')

exports.handler = function (options) {
  var matcher = originMatcher.create(options.origins)
  var matcherIgnore = originMatcher.create(options.ignoreCors)
  return function (req, res, next) {
    var originHeader = req.headers['origin']

    // If either no origin was set, or the origin isn't supported, continue
    // without setting any headers
    if (!originHeader || !matcher(originHeader)) {
      return next()
    }

    // if requesting a static data route that should ignore CORS (to allow caching)
    if (matcherIgnore(req.route.path)) {      
      res.setHeader(constants['AC_ALLOW_ORIGIN'], '*')
    }

    // if match was found, let's set some headers.
    res.setHeader(constants['AC_ALLOW_ORIGIN'], originHeader)
    res.setHeader(constants['STR_VARY'], constants['STR_ORIGIN'])
    if (options.credentials) {
      res.setHeader(constants['AC_ALLOW_CREDS'], 'true')
    }
    res.setHeader(constants['AC_EXPOSE_HEADERS'],
      options.exposeHeaders.join(', '))

    return next()
  }
}