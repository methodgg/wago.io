
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])

module.exports = async function (connection, req) {
  const cid = Math.random().toString(36).substring(2, 15)
  redis2.zadd('totalSiteUsers', ZSCORE, cid)
  if (req.user && req.user.access && req.user.access.hideAds) {
    redis2.zadd('totalPremiumUsers', ZSCORE, cid)
  }
  const stream = await advert.determineStream()
  redis2.zadd(`streamViewers:${stream}`, ZSCORE, cid)
  connection.socket.send(JSON.stringify({setStream: stream}))

  connection.socket.on('close', async () => {
    redis2.zrem(`totalSiteUsers`, cid)
    if (req.user && req.user.access && req.user.access.hideAds) {
      redis2.zrem('totalPremiumUsers', cid)
    }
    redis2.zrem(`streamViewers:${stream}`, cid)
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