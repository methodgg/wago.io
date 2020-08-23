module.exports = function (error, label) {
  if (!label && error.config && error.config.url) {
    // axios error include the url
    label = 'Axios ' + error.config.url
  }
  if (typeof error === 'string') {
    error = {message: error}
  }
  if (error.response && error.response.data && error.response.status) {
    error.message = error.response.status + ': ' + error.response.data
  }
  const err = {
    e_c: config.host + ' ERR: ' + (label ? label : error.name),
    e_a: error.stack,
    e_n: error.message
  }
  if (config.env === 'development') {
    console.error(err)
    return
  }
  if (this && this.req && this.req.track) {
    this.req.track(err)
  }
  else {
    // out of scope; initiate tracker
    require('./matomo')(err)
  }
}