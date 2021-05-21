
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
  console.log('open socket')

  connection.socket.on('close', () => {
    console.log('close socket')
    redis2.zrem('totalSiteUsers', cid)
    if (req.user && req.user.access && req.user.access.hideAds) {
      redis2.zrem('totalPremiumUsers', cid)
    }
    redis2.zrem(`streamViewers:${stream}`, cid)
  })
}

// on server restart clear the current counts for this host
async function restart() {
  redis2.zremrangebyscore('totalSiteUsers', ZSCORE, ZSCORE)
  redis2.zremrangebyscore('totalPremiumUsers', ZSCORE, ZSCORE)
  const streams = await Streamers.find({})
  streams.forEach(stream => {
    redis2.zremrangebyscore(`streamViewers:${stream.name}`, ZSCORE, ZSCORE)
  })
  redis2.zremrangebyscore(`streamViewers:streamspread`, ZSCORE, ZSCORE)
}
restart()