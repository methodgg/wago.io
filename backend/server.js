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
 * CORS
 */
const corsMiddleware = require('restify-cors-middleware')
const corsOpts = {
  origins: ['https://wago.io', 'https://*.wago.io', 'http://ubuntu:8080'],
  allowHeaders: ['Cookie', 'Authorization', 'x-auth-token'],
  exposeHeaders: ['Set-Cookie', 'wotm'],
  ignoreCors: ['/data/:key', '/lookup/weakauras', '/wago/raw/encoded']
}
const cors = corsMiddleware(corsOpts)
// replace cors.actual of standard middleware to add ignoreCors paths
cors.actual = require('./middlewares/corsActual').handler(corsOpts)
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
 * Logging
 */
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const logger = winston.createLogger({
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.File({ filename: 'logs/errors.log', level: 'error', handleExceptions: true, maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: 'logs/warning.log', level: 'warn', maxsize: 5242880, maxFiles: 5 }),
    new winston.transports.File({ filename: 'logs/info.log', maxsize: 5242880, maxFiles: 5 }),
  ]
})
if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.json(),
    handleExceptions: true,
    colorize: true,
    json: false,
    level: 'debug'
  }))
}
global.logger = logger
logger.info("Server startup")
/** npm logging levels
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4, 
  silly: 5 
 */
const expressWinston = require('express-winston')
server.use(expressWinston.logger({
  winstonInstance: winston.createLogger({
    transports: [
      new winston.transports.File({ filename: 'logs/info.log', maxsize: 5242880, maxFiles: 5 })
    ],
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    msg: "HTTP {{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}",
  }),
  meta: true, 
  requestFilter: function (req, propName) { 
    if (propName === 'headers') {
      req[propName]['x-auth-token'] = undefined
      req[propName]['cookie'] = undefined
    }
    return req[propName] 
  },
  dynamicMeta: function (req, res) {
    if (req.user)
      return {user: req.user.account.username}
    else
      return undefined
  },
  ignoreRoute: function (req, res) { return false; } // optional: allows to skip some log messages based on request and/or response
}))


/**
 * Service requests
 */
require('./api/services/account')
require('./api/services/admin')
require('./api/services/api')
require('./api/services/auth') // authentication service
require('./api/services/comments') 
require('./api/services/import') 
require('./api/services/lookup')
require('./api/services/search')
require('./api/services/wago')

/**
 * Lift Server, Connect to DB & Bind Routes
 */
server.listen(config.port, function() {
  mongoose.connection.on('error', function(err) {
    logger.error('Mongoose default connection error: ' + err)
    process.exit(1)
  })

  mongoose.connection.on('open', function(err) {
    if (err) {
      logger.error('Mongoose default connection error: ' + err)
      process.exit(1)
    }
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