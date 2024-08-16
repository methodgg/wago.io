// uncaught error handler
module.exports = function (error, req, res) {
  var label = ''
  if (!res.raw || !res.raw.connection || !res.raw.connection._httpMessage || !res.raw.connection._httpMessage.statusCode) {
    res.code(500)
  }
  else {
    label = res.raw.connection._httpMessage.statusCode
  }
  if (req && req.raw && req.raw.originalUrl) {
    label = label + ' ' + req.raw.originalUrl
  }
  // log error 
  LoggedMsg.write('ERROR', error.message, {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      config: error?.config,
      code: error?.code,
      status: error?.response?.status,
      data: error?.response?.data,
      headers: error?.response?.headers
  })
  // send generic error to browser
  res.send('{"error": "An error has occurred."}')
}