
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])

module.exports = async function (connection, req) {
  const cid = Math.random().toString(36).substring(2, 15)
  redis2.zadd('totalSiteUsers', 'NX', ZSCORE, cid)
  if (req.user && req.user.access && req.user.access.hideAds) {
    redis2.zadd('totalPremiumUsers', 'NX', ZSCORE, cid)
  }
  const stream = await advert.determineStream()
  redis2.zadd(`stream:${stream}`, 'NX', ZSCORE, cid)
  connection.socket.send(JSON.stringify({setStream: stream}))

  connection.socket.on('close', () => {
    redis2.zrem('totalSiteUsers', cid)
    if (req.user && req.user.access && req.user.access.hideAds) {
      redis2.zrem('totalPremiumUsers', cid)
    }
    redis2.zrem(`stream:${stream}`, cid)
  })
}

// on server restart clear the current counts for this host
async function restart() {
  redis2.zremrangebyscore('totalSiteUsers', ZSCORE, ZSCORE)
  redis2.zremrangebyscore('totalPremiumUsers', ZSCORE, ZSCORE)
  const streams = await Streamers.find({}).sort({online: -1, offline: -1})
  streams.forEach(stream => {
    redis2.zremrangebyscore(`stream:${stream.name}`, ZSCORE, ZSCORE)
  })
  redis2.zremrangebyscore(`stream:streamspread`, ZSCORE, ZSCORE)
}
restart()