module.exports = function (error, label) {
  if (!label && error.config && error.config.url) {
    // axios error include the url
    label = 'Axios ' + error.config.url
  }
  const err = {
    e_c: 'ERR: ' + (label ? label : error.name),
    e_a: error.stack,
    e_n: error.message
  }
  if (config.env === 'development') {
    console.error(label || '', '\n', error.stack)
    return
  }
  if (this && this.req && this.req.track) {
    this.req.track(err)
  }
  else {
    // out of scope; initiate tracker
    const MatomoTracker = require('matomo-tracker')
    const matomo = new MatomoTracker(1, 'https://logging.wago.io/matomo.php')
    matomo.track(err)
  }
}