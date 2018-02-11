/**
 * Module Dependencies
 */
const config        = require('./config'),
  restify       = require('restify'),
  mongoose      = require('mongoose'),
  CookieParser  = require('restify-cookies')

/**
 * Global Modules
 */

global.async = require('async')
global.fs = require('fs')
global._ = require('lodash')
global.keyd = require('keyd')
global.request = require('request')
global.videoParser = require('js-video-url-parser')
global.commonRegex = require('./commonRegex')

/**
 * Initialize Data Server
 */
global.server = restify.createServer({
  name    : config.name,
  version : config.version
})

var runTask = require('./api/services/tasks') // localhost tasks
require('./api/services/status') // status monitor

/**
 * Logging
 */
global.winston = require('winston');
const expressWinston = require('express-winston')



/**
 * CORS
 */
const corsMiddleware = require('restify-cors-middleware')
const cors = corsMiddleware({
  origins: ['http://wago.io', 'https://wago.io', 'https://*.wago.io', 'http://192.168.0.181:8080'],
  allowHeaders: ['Cookie', 'Authorization', 'x-auth-token'],
  exposeHeaders: ['Set-Cookie', 'wotm']
})
server.pre(cors.preflight)
server.use(cors.actual)

/**
 * Middleware
 */
server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.bodyParser({mapParams: false}))
server.use(restify.gzipResponse())
server.use(CookieParser.parse)
server.use(require('./middlewares/defaults')) // set default vars

/**
 * JWT
 */
server.use(require('./middlewares/SessionAuth')) // set req.user

/**
 * Service requests
 */
require('./api/services/account')
require('./api/services/admin')
require('./api/services/auth') // authentication service
require('./api/services/comments') 
require('./api/services/import') 
require('./api/services/lookup')
require('./api/services/search')
require('./api/services/wago')


/**
 * Error Handling
 */
// server.use(expressWinston.errorLogger({
//   winstonInstance: errorLogger,
//   statusLevels: true
// }))


/**
 * Lift Server, Connect to DB & Bind Routes
 */
server.listen(config.port, function() {

  mongoose.connection.on('error', function(err) {
    winston.error('Mongoose default connection error: ' + err)
      process.exit(1)
  })

  mongoose.connection.on('open', function(err) {

    if (err) {
      winston.error('Mongoose default connection error: ' + err)
      process.exit(1)
    }

    winston.info(
      '%s v%s ready to accept connections on port %s in %s environment.',
      server.name,
      config.version,
      config.port,
      config.name
    )
  })

  global.db = mongoose.connect(config.db.uri)
  mongoose.Promise = global.Promise

  var models = fs.readdirSync('./api/models')

  _.forEach(models, (model) => {
    if (model.indexOf('.js')<0) return

    var filename = model.split('.')[0]
    global[filename] = require('./api/models/' + filename)
  })

  global['Categories'] = require('../frontend/src/components/libs/categories')

  // build global vars on runtime
  runTask('random')
  runTask('top10')
  runTask('addons')
  runTask('news')

  /**
   * Save site data into memory
   */
  SiteData.find().exec().then((data) => {
    data.forEach(function(d) {
      global[d._id] = d.value
    })
  })
})