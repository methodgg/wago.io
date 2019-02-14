const MatomoTracker = require('matomo-tracker')
const matomo = new MatomoTracker(1, 'https://logging.wago.io/matomo.php')
const md5 = require('md5')

matomo.on('error', function(err) {
  console.log('ERROR SENDING TO MATOMO', err)
})

module.exports = function (data) {
  if (config.env === 'development') {
    // if tracking an event then log to dev console
    if (data.e_c) {
      console.log(data)
    }
    return
  }
  if (!data) { 
    data = {}
  }
  var trackProp = {}
  trackProp.token_auth = config.matomo.key
  trackProp.ua = this.raw.headers['user-agent']
  trackProp.lang = this.raw.headers['accept-language']
  trackProp.cip = this.headers['x-forwarded-for'] || this.raw.connection.remoteAddress || this.raw.socket.remoteAddress || (this.raw.connection.socket ? this.raw.connection.socket.remoteAddress : null)
  trackProp.uid = md5(trackProp.cip + (this.user && this.user._id.toString() || ''))
  if (this.query._ref && !this.query._ref.match(/^https:\/\/wago.io/)) {
    trackProp.urlref = this.query._ref
  }
  trackProp.url = 'https://data.wago.io' + this.raw.url
  trackProp.cvar = JSON.stringify({
    '1': ['host', config.host]
  })
  trackProp = Object.assign(trackProp, data)
  matomo.track(trackProp)
}