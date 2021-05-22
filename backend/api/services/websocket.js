
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])
const sockets = {}

module.exports = async function (connection, req) {
  const cid = Math.random().toString(36).substring(2, 15)
  sockets[cid] = connection.socket
  sockets[cid].sendObj = function (obj) {
    return this.send(JSON.stringify(obj))
  }
  let stream

  // setup user
  sockets[cid].isAlive = true
  await redis2.zadd('totalSiteUsers', ZSCORE, cid)
  if (req.user && req.user.access && req.user.access.hideAds) {
    await redis2.zadd('totalPremiumUsers', ZSCORE, cid)
  }

  // setup ping interval
  sockets[cid].interval = setInterval(() => {
    if (sockets[cid].isAlive === false) {
      sockets[cid].close()
      return sockets[cid].terminate()
    }
    sockets[cid].isAlive = false
    sockets[cid].sendObj({ping: 1})
  }, 30000)

  sockets[cid].on('message', async (data) => {
    try {
      data = JSON.parse(data)
    }
    catch (e) {return}
    if (data.pong) {
      sockets[cid].isAlive = true
    }
    else if (data.do === 'getStream') {
      stream = await advert.determineStream()
      await redis2.zadd(`streamViewers:${stream}`, ZSCORE, cid)
      sockets[cid].sendObj({setStream: stream})
    }
  })

  sockets[cid].on('close', async () => {
    await redis2.zrem(`totalSiteUsers`, cid)
    if (req.user && req.user.access && req.user.access.hideAds) {
      await redis2.zrem('totalPremiumUsers', cid)
    }
    if (stream) {
      await redis2.zrem(`streamViewers:${stream}`, cid)
    }
    clearInterval(sockets[cid].interval)
    clearTimeout(sockets[cid].expire)
    delete sockets[cid]
  })
}

// on server restart clear the current counts for this host
async function restart() {
  await redis2.zremrangebyscore('totalSiteUsers', ZSCORE, ZSCORE)
  await redis2.zremrangebyscore('totalPremiumUsers', ZSCORE, ZSCORE)
  const streams = await Streamers.find({})
  streams.forEach(async (stream) => {
    await redis2.zremrangebyscore(`streamViewers:${stream.name}`, ZSCORE, ZSCORE)
  })
  await redis2.zremrangebyscore(`streamViewers:streamspread`, ZSCORE, ZSCORE)
}
restart()