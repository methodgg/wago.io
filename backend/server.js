// --- SETUP FASTIFY
global.config = require('./config')
var fastifyOpt = {
  ignoreTrailingSlash: true,
  maxParamLength: 1048576,
  bodyLimit: 1048576 * 15,
  trustProxy: true
}
if (config.env === 'production') {
  fastifyOpt.https = {
    http2: true,
    key: require('fs').readFileSync('./fastify-wago.key'),
    cert: require('fs').readFileSync('./fastify-wago.crt')
  }
}
const fastify = require('fastify')(fastifyOpt)

// --- GLOBAL MODULES
global.async = require('async')
global.axios = require('axios')
global.bluebird = require('bluebird')
global.commonRegex = require('./commonRegex')
global.fs = require('fs').promises
global.mongoose = require('mongoose')

// --- FASTIFY PLUGINS
fastify.register(require('fastify-cookie'))
fastify.register(require('fastify-compress'))
fastify.register(require('fastify-file-upload'), {
  limits: { fileSize: 1048576 * 15 },
})
fastify.register(require('./middlewares/fastify-rate-limit'))

// --- DECORATORS
fastify.decorateRequest('track', require('./middlewares/matomo'))
fastify.decorateRequest('trackError', require('./middlewares/matomoErrors'))
fastify.decorateReply('cache', require('./middlewares/cache'))
fastify.setErrorHandler(require('./middlewares/errors'))

// --- HOOKS & MIDDLEWARES
fastify.addHook('preValidation', require('./middlewares/cors'))
fastify.addHook('preHandler', require('./middlewares/setDefaults'))
fastify.addHook('preHandler', require('./middlewares/analytics'))
fastify.addHook('preHandler', require('./middlewares/auth'))
fastify.addHook('preHandler', require('./middlewares/getRegion'))

// --- ROUTES
fastify.get('/logout', (req, res) => {res.redirect('/auth/logout')})
fastify.get('/ping', (req, res) => {res.send({pong: true, host: config.base_url})})
fastify.get('/favicon.ico', (req, res) => {res.redirect('https://media.wago.io/favicon/favicon.ico')})
fastify.get('/loaderio-ea4a5150f4d42634b2499beaf72f04a9.txt', (req, res) => {res.send('loaderio-ea4a5150f4d42634b2499beaf72f04a9')})
fastify.register(require('./api/services/account'), { prefix: '/account' })
fastify.register(require('./api/services/admin'), { prefix: '/admin' })
fastify.register(require('./api/services/api'), { prefix: '/api' })
fastify.register(require('./api/services/auth'), { prefix: '/auth' })
fastify.register(require('./api/services/comments'), { prefix: '/comments' })
fastify.register(require('./api/services/data'), { prefix: '/data' })
fastify.register(require('./api/services/html'), { prefix: '/html' }) // pre-render content, embeds; called by proxy
fastify.register(require('./api/services/import'), { prefix: '/import' })
fastify.register(require('./api/services/lookup'), { prefix: '/lookup' })
fastify.register(require('./api/services/search'), { prefix: '/search' })
fastify.register(require('./api/services/wago'), { prefix: '/wago' })
fastify.register(require('./api/services/webhooks'))

// --- START SERVER AND CONNECT TO MONGO
const startServer = async () => {
  try {
    await fastify.listen(config.port, '0.0.0.0')
    console.log(`Fastify listening on ${fastify.server.address().port}`)
    await mongoose.connect(config.db.uri, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
    const models = await fs.readdir('./api/models')
    models.forEach((model) => {
      if (model.indexOf('.js')<0) return
      model = model.split('.')[0]
      global[model] = require('./api/models/' + model)
    })
    global.Categories = require('../frontend/src/components/libs/categories')

    // update memory-store of semi-static data
    if (config.env !== 'crontasks') {
      require('./middlewares/updateInMemoryData')()
      setInterval(require('./middlewares/updateInMemoryData'), 60 * 1000)
    }
    // setup simulated crontasks
    if (config.env === 'development' || config.env === 'crontasks') {
      const cronTasks = require('./api/helpers/cronTasks')
      // to allow tracking outside of standard request scope
      const cronReq = {
        track: require('./middlewares/matomo'),
        trackError: require('./middlewares/matomoErrors')
      }      
      var minute = Math.floor((new Date()-new Date().setHours(0,0,0,0)) / 60000) // start at x minutes from midnight
      const runCron = async () => {
        if (minute % 240 === 0) { // every 4 hours
          if (config.env === 'crontasks') {
            await cronTasks.UpdatePatreonAccounts(cronReq)
          }
          await cronTasks.UpdateWeeklyMDT(cronReq)
        }
        if (minute % 60 === 0) { // every hour
          await cronTasks.ComputeViewsThisWeek(cronReq)
        }
        if (minute % 20 === 0) { // every 20 minutes
          await cronTasks.UpdateLatestAddonReleases(cronReq)
        }
        if (minute % 5 === 0) { // every 5 minutes
          await cronTasks.UpdateTopTenLists(cronReq)
        }
        await cronTasks.UpdateWagoOfTheMoment(cronReq)
        await cronTasks.UpdateLatestNews(cronReq)

        // once per week make sure elasticsearch is sync'd up with Mongo
        if (minute === 30 && (new Date).getDay() === 0) {
          var syncStream = WagoItem.synchronize()
          syncStream.on('error', function(err){
            cronReq.trackError(err, 'Elastic Sync Error WagoItem')
          })
          syncStream.on('close', function() {
            cronReq.track({e_a: 'Elastic Sync Complete', e_c: 'WagoItem', e_n: 'WagoItem'})
          })
        }
        else if (minute === 30 && (new Date).getDay() === 1) {
          var syncStream = User.synchronize()
          syncStream.on('error', function(err){
            cronReq.trackError(err, 'Elastic Sync Error User')
          })
          syncStream.on('close', function() {
            cronReq.track({e_a: 'Elastic Sync Complete', e_c: 'User', e_n: 'User'})
          })
        }

        minute++
        // reset at midnight
        if (minute === 1440) {
          minute = 0
        }
      }
      // run cron at launch and every minute thereafter
      runCron()
      setInterval(runCron, 60 * 1000)
    }

    if (config.env === 'development') {
      // require('./unitTests')
    }
  } catch (err) {
    console.log('FASTIFY ERROR', err)
    process.exit(1)
  }
}
startServer()
