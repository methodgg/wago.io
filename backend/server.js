// --- SETUP FASTIFY
global.config = require('./config')
var fastifyOpt = {
  ignoreTrailingSlash: true,
  maxParamLength: 1048576,
  bodyLimit: 1048576 * 15,
  jsonBodyLimit: 1048576 * 15,
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
const Redis = require("ioredis")
global.RedisConnect = new Redis(config.redis)
const {Queue, Worker, QueueScheduler, QueueEvents} = require('bullmq')
const Profiler = require('./api/models/Profiler')
const discordBot = require('./discordBot')
global.taskQueue = new Queue('taskQueueA', {connection: RedisConnect})
global.async = require('async')
global.axios = require('axios')
global.bluebird = require('bluebird')
global.commonRegex = require('./commonRegex')
global.elastic = require('./api/helpers/elasticsearch')
global.meili = require('./api/helpers/meilisearch')
global.redis = new Redis(config.redis)
redis = require('./middlewares/decorateRedis')(redis)
global.redis2 = new Redis(config.redis2)
global.fs = require('fs').promises
global.mongoose = require('mongoose')
global.ENUM = require('./middlewares/enum')

// --- FASTIFY PLUGINS
fastify.register(require('fastify-cookie'))
fastify.register(require('fastify-compress'))
fastify.register(require('fastify-file-upload'), {
  limits: { fileSize: 1048576 * 15 },
})
fastify.register(require('fastify-websocket'), {
  options: { maxPayload: 1048576, perMessageDeflate: true }
})

// --- DECORATORS
fastify.decorate('enum', require('./middlewares/enum'))
fastify.decorateRequest('track', require('./middlewares/matomo'))
fastify.decorateRequest('trackError', require('./middlewares/matomoErrors'))
fastify.decorateReply('cache', require('./middlewares/cache'))
fastify.setErrorHandler(require('./middlewares/errors'))

// --- HOOKS & MIDDLEWARES
fastify.addHook('onRequest', async (req) => {
  await Profiler.startRequest(req)
})
fastify.addHook('onResponse', (req, res) => {
  Profiler.logEvent(req.profiler, 'Response', res.statusCode)
})
fastify.addHook('preValidation', require('./middlewares/rateLimit'))
fastify.addHook('preValidation', require('./middlewares/cors'))
fastify.addHook('preHandler', require('./middlewares/auth'))
fastify.addHook('preHandler', require('./middlewares/setDefaults'))
fastify.addHook('preHandler', require('./middlewares/analytics'))
fastify.addHook('preHandler', require('./middlewares/getRegion'))

// --- ROUTES
// fastify.get('/ws', {websocket: true}, require('./api/services/websocket'))
fastify.get('/logout', (req, res) => {res.redirect('/auth/logout')})
fastify.get('/ping', (req, res) => {res.send({pong: true, host: config.base_url, you: req.raw.ip})})
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
    await mongoose.connect(config.db.uri, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true})
    const models = await fs.readdir('./api/models')
    models.forEach((model) => {
      if (model.indexOf('.js')<0) return
      model = model.split('.')[0]
      global[model] = require('./api/models/' + model)
    })
    global.Categories = require('../frontend/src/components/libs/categories2')
    await meili.getIndexes()

    const encodeDecodeAddons = await fs.readdir('./api/helpers/encode-decode')
    global.Addons = {}
    encodeDecodeAddons.forEach((addon) => {
      if (addon.indexOf('.js')<0) return
      addon = addon.split('.')[0]
      global.Addons[addon] = require('./api/helpers/encode-decode/' + addon)
    })

    // setup queues and workers
    global.Queues = {}
    for (const host of config.dataHosts) {
      Queues[host] = new Queue(`taskQueue:${host}`, {connection: RedisConnect})
    }
    const runTask = require('./api/helpers/tasks')
    const updateLocalCache = require('./middlewares/updateLocalCache')
    new QueueScheduler(`taskQueue:${config.host}`, {connection: RedisConnect})
    const localWorker = new Worker(`taskQueue:${config.host}`, async (job) => {
      if (job.name === 'UpdateCache') {
        updateLocalCache.run(job.data)
      }
      else {
        await runTask(job.name, job.data)
      }
    }, {connection: RedisConnect})
    updateLocalCache.run()

    var profilerTasks = {}
    new QueueScheduler('taskQueueA', {connection: RedisConnect})
    const worker = new Worker('taskQueueA', async (job) => {
      await runTask(job.name, job.data, profilerTasks[job.id])
    }, {
      concurrency: 3,
      connection: RedisConnect
    })
    worker.on('active', async (job) => {
      profilerTasks[job.id] = await Profiler.startTask(job)
    })
    worker.on('completed', async (job) => {
      if (profilerTasks[job.id]) {
        await Profiler.logEvent(profilerTasks[job.id], 'Complete', 200)
        delete profilerTasks[job.id]
      }
    })
    worker.on('failed', async (job) => {
      if (profilerTasks[job.id]) {
        await Profiler.logEvent(profilerTasks[job.id], 'Failed', 500)
        delete profilerTasks[job.id]
      }
    })
    worker.on('error', async (job) => {
      if (profilerTasks[job.id]) {
        await Profiler.logEvent(profilerTasks[job.id], 'Failed', 500)
        delete profilerTasks[job.id]
      }
    })
    
    // setup simulated crontasks
    if (config.env === 'development' || config.host === 'NYC3-01') {
      const cleanup = await taskQueue.getRepeatableJobs()
      for (let i = 0; i < cleanup.length; i++) {
        await taskQueue.removeRepeatableByKey(cleanup[i].key)
      }
      await taskQueue.add('CleanTaskQueue', null, {repeat: {cron: '*/10 * * * *'}, priority: 10})
      await taskQueue.add('UpdateWagoOfTheMoment', null, {repeat: {cron: '* * * * *'}, priority: 3})
      await taskQueue.add('UpdateTwitchStatus', null, {repeat: {cron: '* * * * *'}, priority: 3})
      await taskQueue.add('UpdatePatreonAccounts', null, {repeat: {cron: '0 */4 * * *'}, priority: 3})
      await taskQueue.add('UpdateWeeklyMDT', null, {repeat: {cron: '0 */4 * * *'}, priority: 3})
      await taskQueue.add('UpdateTopLists', null, {repeat: {cron: '*/5 * * * *'}, priority: 3})
      await taskQueue.add('UpdateValidCharacters', null, {repeat: {cron: '10 * * * *'}, priority: 3})
      await taskQueue.add('UpdateGuildMembership', null, {repeat: {cron: '15 * * * *'}, priority: 3})
      await taskQueue.add('UpdateSupportedAddons', null, {repeat: {cron: '45 * * * *'}, priority: 3})
      await taskQueue.add('ComputeStatistics', null, {repeat: {cron: '0 * * * *'}, priority: 4})
      await taskQueue.add('UpdateLatestAddonReleases', null, {repeat: {cron: '*/20 * * * *'}, priority: 4})
      await taskQueue.add('SyncElastic', {table: 'User'}, {repeat: {cron: '0 10 5 * *'}, priority: 10})
      await taskQueue.add('SyncElastic', {table: 'import'}, {repeat: {cron: '0 10 15 * *'}, priority: 10})
      await taskQueue.add('SyncElastic', {table: 'code'}, {repeat: {cron: '0 10 20 * *'}, priority: 10})
      await taskQueue.add('SyncMeili', {table: 'WagoApp'}, {repeat: {cron: '0 10 8 * *'}, priority: 10})
      await taskQueue.add('SyncMeili', {table: 'Imports:Metrics'}, {repeat: {cron: '30 * * * *'}, priority: 10})
      await taskQueue.add('SyncMeili', {table: 'Imports:ToDo'}, {repeat: {cron: '*/3 * * * *'}, priority: 10})

      // run once at startup (1 host only)
      await elastic.ensureIndexes()

      global.discordBot = require('./discordBot')
      discordBot.start()
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
