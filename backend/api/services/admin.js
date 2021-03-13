const Profiler = require("../models/Profiler")
const SiteData = require("../models/SiteData")
const updateDataCaches = require('../../middlewares/updateLocalCache')
const runTask = require('../helpers/tasks')

module.exports = (fastify, opts, next) => {
  // get all blog posts
  fastify.get('/blogs', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || (!req.user.isAdmin.blog && !req.user.isAdmin.super)) {
      return res.code(403).send({error: "forbidden"})
    }
    if (req.user.isAdmin.super) {
      const blogs = await Blog.find({}).populate('_userId', 'account.username').select('_id title date publishStatus _userId').sort('-date').exec()
      res.send({blogs: blogs})
    }
    else if (req.user.isAdmin.blog) {
      const blog = await Blog.find({_userId: req.user._id}).select('_id title date publishStatus').sort('-date').exec()
      res.send({blogs: blog})
    }
  })


  // creates or updates a blog post
  fastify.post('/blog', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access || (!req.user.isAdmin.blog && !req.user.isAdmin.super)) {
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
    if (!req.user || !req.user.isAdmin.access || (!req.user.isAdmin.blog && !req.user.isAdmin.super)) {
      return res.code(403).send({error: "forbidden"})
    }
    var data = {}
    data.redis = await redis.info()
    data.waiting = await taskQueue.getWaiting(0, 50)
    data.active = await taskQueue.getActive(0, 50)
    data.completed = await taskQueue.getCompleted(0, 50)
    data.profiler = await Profiler.find({}).sort({timestamp: -1}).limit(1000)
    data.ratelimit = {}
    res.send(data)
  })

  // get rate limit by ip
  fastify.get('/ratelimit', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
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
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    var data = await SiteData.findById('EmbeddedStream').lean().exec()
    data = data.value || {}
    data.users = {
      active: await redis.get('tally:active:users'),
      embedViewers: await redis.get('tally:active:embedviewers')
    }
    data.channelOnline = await redis.get(`twitch:${data.channel || 'method'}:live`)
    res.send(data)
  })

  fastify.post('/stream', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    await SiteData.set('EmbeddedStream', {
      enabled: req.body.enabled,
      exposure: req.body.exposure,
      max: req.body.max,
      channel: req.body.channel
    })
    let online = await runTask('UpdateTwitchStatus', req.body.channel)
    await updateDataCaches.queue('EmbeddedStream')
    res.send({success: true, online: online})
  })

  fastify.get('/get-user', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    const user = await User.findById(req.query.user).select({'account.username':1, 'account.created':1, 'account.verified_human':1, 'account.hidden':1, 'battlenet':1, 'discord':1, 'patreon':1, 'twitter':1, 'google':1, 'profile':1, 'roles':1})
    res.send(user)
  })

  fastify.get('/getusers', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
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
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
      return res.code(403).send({error: "forbidden"})
    }
    await User.findByIdAndUpdate(req.body.user, {'account.verified_human': true})
    res.send({success: true})
  })

  fastify.post('/set-user-role', async (req, res) => {
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
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
    if (!req.user || !req.user.isAdmin.access ||  !req.user.isAdmin.super) {
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


  next()
}