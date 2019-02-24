const MatomoTracker = require('matomo-tracker')
const matomoWeb = new MatomoTracker(1, 'https://logging.wago.io/matomo.php')
const matomoAPI = new MatomoTracker(2, 'https://logging.wago.io/matomo.php')
const md5 = require('md5')

matomoWeb.on('error', function(err) {
  console.log('ERROR SENDING TO MATOMO', err)
})
matomoAPI.on('error', function(err) {
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
  if (this.req && this.req.raw) {
    trackProp.ua = this.req.raw.headers['user-agent']
    trackProp.lang = this.req.raw.headers['accept-language']
    trackProp.cip = this.req.raw.ip
    trackProp.url = 'https://data.wago.io' + this.req.raw.url
  }
  else if (this.headers && this.req) {
    trackProp.ua = this.headers['user-agent']
    trackProp.lang = this.headers['accept-language']
    trackProp.cip = this.req.ip
    trackProp.url = 'https://data.wago.io' + this.req.url
  }
  trackProp.uid = md5(trackProp.cip + (this.user && this.user._id.toString() || ''))
  if (this.query && this.query._ref && !this.query._ref.match(/^https:\/\/wago.io/)) {
    trackProp.urlref = this.query._ref
  }
  trackProp.cvar = JSON.stringify({
    '1': ['host', config.host]
  })

  trackProp = Object.assign(trackProp, data)
  
  if (!trackProp.url) {
    trackProp.url = 'https://wago-missing-url/'
  }
  if (this.req.raw.url.match(/^\/api\//)) {
    matomoAPI.track(trackProp)
  }
  else {
    matomoWeb.track(trackProp)
  }
}