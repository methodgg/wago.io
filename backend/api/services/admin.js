const Profiler = require("../models/Profiler")
const SiteData = require("../models/SiteData")
const updateDataCaches = require('../../middlewares/updateLocalCache')
const runTask = require('../helpers/tasks')
const Streamers = require("../models/Streamer")

module.exports = (fastify, opts, next) => {
  // get all blog posts
  fastify.get('/blogs', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.blog)) {
      return res.code(403).send({error: "forbidden"})
    }
    const blogs = await Blog.find({}).populate('_userId', 'account.username').select('_id title date publishStatus _userId').sort('-date').exec()
    res.send({blogs: blogs})
  })


  // creates or updates a blog post
  fastify.post('/blog', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.blog)) {
      return res.code(403).send({error: "forbidden"})
    }

    if (!req.body.title || !req.body.content) {
      return res.code(403).send({error: "no content"})
    }

    if (req.body.id) {
      var blog = await Blog.findById(req.body.id).exec()
      blog.title = req.body.title
      blog.content = req.body.content
      blog.publishStatus = req.body.publishStatus
      await blog.save()
      res.send({success: true, blog: blog})
    }
    else {
      var blog = new Blog()
      blog.title = req.body.title
      blog.content = req.body.content
      blog.publishStatus = req.body.publishStatus
      blog.date = Date.now()
      blog._userId = req.user._id
      await blog.save()
      res.send({success: true, blog: blog})
    }

    taskQueue.add('UpdateLatestNews')
  })

  // lists current task queue
  fastify.get('/status', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var data = {}
    data.waiting = await taskQueue.getWaiting(0, 50)
    data.active = await taskQueue.getActive(0, 50)
    data.completed = await taskQueue.getCompleted(0, 50)
    data.profiler = await Profiler.find({}).sort({timestamp: -1}).limit(1000)
    data.ratelimit = {}
    res.send(data)
  })

  // get rate limit by ip
  fastify.get('/ratelimit', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var data = {}
    data['Auth Keys'] = await new Promise((done) => {
      var count = 0
      const scanStreamUsers = redis2.scanStream({
        match: 'rate:auth:' + (req.query.q || '*')
      })
      scanStreamUsers.on('data', (data) => {
        count = count + data.length
      })
      scanStreamUsers.on('end', () => {
        done(count)
      })
    })

    data['Common Keys'] = await new Promise((done) => {
      var count = 0
      const scanStreamUsers = redis2.scanStream({
        match: 'rate:wago:' + (req.query.q || '*')
      })
      scanStreamUsers.on('data', (data) => {
        count = count + data.length
      })
      scanStreamUsers.on('end', () => {
        done(count)
      })
    })

    res.send(data)
  })

  fastify.get('/stream', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.config.embed)) {
      return res.code(403).send({error: "forbidden"})
    }
    var data = await SiteData.findById('EmbeddedStream').lean().exec()
    data = data.value || {}
    data.activeUsers = await redis.get('tally:active:users')
    if (!data.streams) data.streams = []
    for (let i = 0; i < data.streams.length; i++) {
      data.streams[i].online = await redis.get(`twitch:${data.streams[i].channel}:live`)
      data.streams[i].viewing = await redis2.zcount(`stream:${data.streams[i].channel}`, '-inf', '+inf')
    }
    res.send(data)
  })

  fastify.post('/stream', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.config.embed)) {
      return res.code(403).send({error: "forbidden"})
    }
    var streams = []
    if (req.body.streams) {
      req.body.streams.forEach(s => {
        streams.push({
          channel: s.channel,
          exposure: s.exposure,
          max: s.max
        })
      })
    }
    var data = {
      enabled: req.body.enabled,
      streams: streams
    }
    await SiteData.set('EmbeddedStream', data)
    const channelStatuses = await runTask('UpdateTwitchStatus', req.body.channel)
    await updateDataCaches.queue('EmbeddedStream')
    await streams.forEach(async (stream, i) => {
      streams[i].online = channelStatuses[stream.channel]
      streams[i].viewing = await redis.get('tally:active:embed:' + streams.channel)
    })
    res.send({success: true, streams: streams, enabled: data.enabled, activeUsers: await redis.get('tally:active:users')})
  })

  fastify.get('/getstreamers', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.config.embed)) {
      return res.code(403).send({error: "forbidden"})
    }
    const streams = await Streamers.find({}).sort({online: -1, offline: -1})
    let streamViewers = 0
    for (let i = 0; i < streams.length; i++) {
      streams[i].wagoViewers = await redis2.zcount(`stream:${streams[i].name}`, '-inf', '+inf')
      streams[i].viewers = streams[i].viewers - streams[i].wagoViewers
      streamViewers = streamViewers + streams[i].wagoViewers
    }
    const users = {
      total: await redis2.zcount('activeUsers', '-inf', '+inf'),
      subs: await redis2.zcount('premiumUsers', '-inf', '+inf'),
      streamspread: await redis2.zcount('stream:streamspread', '-inf', '+inf'),
      closed: await redis2.zcount(`stream:__CLOSED__`, '-inf', '+inf'),
      viewing: streamViewers
    }
    res.send({streams, users})
  })

  fastify.post('/streamer/add', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.config.embed)) {
      return res.code(403).send({error: "forbidden"})
    }
    const name = req.body.name
    const exists = await Streamers.findOne({name: {$regex: new RegExp(name, 'i')}})
    if (exists) {
      return res.send({error: 'Streamer already exists: '+exists.name})
    }
    const streamer = new Streamers({name, game: 'Never seen'})
    await streamer.save()
    res.send({success: true})
  })

  fastify.post('/streamer/delete', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.config.embed)) {
      return res.code(403).send({error: "forbidden"})
    }
    await Streamers.findByIdAndDelete(req.body.id)
    res.send({success: true})
  })

  fastify.get('/get-user', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.moderator)) {
      return res.code(403).send({error: "forbidden"})
    }
    const user = await User.findById(req.query.user).select({'account.username':1, 'account.created':1, 'account.verified_human':1, 'account.hidden':1, 'battlenet':1, 'discord':1, 'patreon':1, 'twitter':1, 'google':1, 'profile':1, 'roles':1})
    res.send(user)
  })

  fastify.get('/getusers', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.moderator)) {
      return res.code(403).send({error: "forbidden"})
    }
    const data = {
      admin: await User.find({"roles.isAdmin.access": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      gold: await User.find({"roles.gold_subscriber": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      subs: await User.find({"roles.subscriber": true, "roles.gold_subscriber": {$ne: true}}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      methodRaider: await User.find({"roles.methodRaider": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      methodStreamer: await User.find({"roles.methodStreamer": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      ambassador: await User.find({"roles.ambassador": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      communityLeader: await User.find({"roles.community_leader": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      developer: await User.find({"roles.developer": true}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
      contestWinner: await User.find({$or: [{"roles.artContestWinnerAug2018": true}]}).select({'account.username': 1, 'profile.avatar': 1}).sort({'account.username': 1}).exec(),
    }
    res.send(data)
  })

  fastify.post('/verify-human-user', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.moderator)) {
      return res.code(403).send({error: "forbidden"})
    }
    await User.findByIdAndUpdate(req.body.user, {'account.verified_human': true})
    res.send({success: true})
  })

  fastify.post('/set-user-role', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.moderator)) {
      return res.code(403).send({error: "forbidden"})
    }
    if (!req.body.role.match(/^ambassador|methodStreamer|community_leader|developer$/)) {
      return res.send({success: false})
    }

    var user = await User.findById(req.body.user)
    user.roles[req.body.role] = req.body.value
    console.log(user)
    await user.save()
    res.send({success: true})
  })

  fastify.get('/search-username', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !(req.user.isAdmin.super || req.user.isAdmin.moderator)) {
      return res.code(403).send({error: "forbidden"})
    }

    if (!req.query.name) {
      return res.send([])
    }
    const results = await User.esSearch({
      query: {
        bool: {
          should: [
            {
              regexp: {
                "account.username": {
                  value: req.query.name.toLowerCase(),
                  boost: 2
                }
              }
            },
            {
              regexp: {
                "account.username": {
                  value: req.query.name.toLowerCase() + '.*',
                  boost: 1.2
                }
              }
            },
            {
              regexp: {
                "account.username": {
                  value: '.*' + req.query.name.toLowerCase() + '.*',
                  boost: .9
                }
              }
            }
          ]
        }
      },
    },
    { hydrate: true, sort: ['_score'], size: 10, from: 0})
    if (results && results.hits && results.hits.hits) {
      var users = []
      for (user of results.hits.hits) {
        users.push({name: user.account.username, _id: user._id})
      }
      res.send(users)
    }
    else {
      res.send([])
    }
  })

  fastify.post('/redis/get', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var redisServ
    if (req.body.server === 'cache') {
      redisServ = redis
    }
    else if (req.body.server === 'rate') {
      redisServ = redis2
    }
    if (!redisServ) {
      return res.send({error: 'no server'})
    }
    var value = await redisServ.get(req.body.key)
    if (value) {
      res.send({
        key: req.body.key,
        value: value,
        ttl: await redisServ.ttl(req.body.key)
      })
    }
    else {
      res.send({value: null})
    }
  })

  fastify.post('/redis/delete', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var redisServ
    if (req.body.server === 'cache') {
      redisServ = redis
    }
    else if (req.body.server === 'rate') {
      redisServ = redis2
    }
    if (!redisServ) {
      return res.send({error: 'no server'})
    }
    redisServ.del(req.body.key)
    res.send({success: true})
  })

  fastify.post('/redis/info', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var redisServ
    if (req.body.server === 'cache') {
      redisServ = redis
    }
    else if (req.body.server === 'rate') {
      redisServ = redis2
    }
    if (!redisServ) {
      return res.send({error: 'no server'})
    }
    res.send({info: await redisServ.info()})
  })




  next()
}