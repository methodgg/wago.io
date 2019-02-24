// uncaught error handler
module.exports = function (error, req, res) {
  var label = ''
  if (!res.res || !res.res.connection || !res.res.connection._httpMessage || !res.res.connection._httpMessage.statusCode) {
    res.code(500)
  }
  else {
    label = res.res.connection._httpMessage.statusCode
  }
  if (req && req.raw && req.raw.originalUrl) {
    label = label + ' ' + req.raw.originalUrl
  }
  // log error to matomo
  req.trackError(error, label)
  // send generic error to browser
  res.send({error: 'An error has occurred.'})
}