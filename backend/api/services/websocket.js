
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])
const connections = {}

function Connection(conn, cid) {
  this.socket = conn.socket
  this.cid = cid
  this.alive = true
  this.send = (obj) => {
    this.socket.send(JSON.stringify(obj))
  }
  this.lastMsg = new Date().getTime()
  this.ping = function() {
    this.alive = false
    this.send({ping: 1})
  }
  this.startStaleTimer = () => {
    clearTimeout(this.staleTimer)
    const that = this
    this.staleTimer = setTimeout(async () => {
      if (that.alive && that.embedStream && that.embedStream !== '__streamspread') {
        await redis2.zrem(`allEmbeds:${that.embedStream}`, that.cid)
        that.embedStream = '__stale'
        await redis2.zadd(`allEmbeds:${that.embedStream}`, ZSCORE, that.cid)
        await redis2.set(`currentstream:${cid}`, that.embedStream)
      }
    }, 20*60*1000) // go stale after 20 min
  }
  this.socket.on('close', () => {
    this.ping() // check if user has other tabs open before deleting connection info
  })
  this.socket.on('error', (e) => {
    this.ping()
  })

  this.socket.on('message', async (data) => {
    this.lastMsg = new Date().getTime()
    this.alive = true

    const reply = {}
    try {
      let json = JSON.parse(data)
      data = json
    }
    catch {}
    for (const [key, value] of Object.entries(data)) {
      // Ping-Pong
      if (key === 'pong') {
        this.alive = true
        return
      }
    }
    if (Object.keys(reply).length) {
      if (data.ident && !reply.ident) {
        reply.ident = data.ident
      }
      this.send(reply)
    }
  })
}


module.exports = async function (connection, req) {
  try {
    let cid = req.query.cid
    if (!cid) {
      connection.destroy()
    }
    connections[cid] = new Connection(connection, cid)

    await redis2.zadd('allSiteVisitors', ZSCORE, cid)
    if (connections[cid].premiumUser) {
      await redis2.zadd('allPremiumVisitors', ZSCORE, cid)
    }
    connections[cid].send({hello: cid})

    connections[cid].embedStream = await advert.determineStream(cid)
    await redis2.zadd(`allEmbeds:${connections[cid].embedStream}`, ZSCORE, cid)
    connections[cid].send({setStream: connections[cid].embedStream})
    connections[cid].startStaleTimer()
  }
  catch (e) {console.log(e)}
}


// handle ping and cleanup dead connections
setInterval(async () => {
  for (const [oid, connection] of Object.entries(connections)) {
    if (!connection.alive) {
      clearTimeout(connection.staleTimer)
      await redis2.del(`currentstream:${connection.cid}`)
      await redis2.zrem(`allSiteVisitors`, connection.cid)
      await redis2.zrem('allPremiumVisitors', connection.cid)
      if (this.embedStream) {
        await redis2.zrem(`allEmbeds:${this.embedStream}`, connection.cid)
      }
      else {
        const streams = await Streamers.find({online: {$gt: 0}})
        for (let i=0; i<streams.length; i++) {
          let c = await redis2.zrem(`allEmbeds:${streams[i].name}`, connection.cid)
          if (c) {
            break
          }
        }
        await redis2.zrem(`allEmbeds:__streamspread`, connection.cid)
        await redis2.zrem(`allEmbeds:__stale`, connection.cid)
      }
      delete connections[oid]
    }
    else if (connection.lastMsg < new Date().getTime() - 30000) {
      connection.ping()
    }
    else {
      // stable connection
    }
  }
}, 29000)

// make sure redis and connection cids match up
async function cleanCIDs() {
  // find all CIDs
  let CIDs = [].concat(
    await redis2.zrangebyscore('allSiteVisitors', ZSCORE, ZSCORE),
    await redis2.zrangebyscore('allPremiumVisitors', ZSCORE, ZSCORE),
    await redis2.zrangebyscore('allEmbeds:__streamspread', ZSCORE, ZSCORE),
    await redis2.zrangebyscore('allEmbeds:__stale', ZSCORE, ZSCORE)
  )
  const streams = await Streamers.find({online: {$gt: 0}})
  for (let i=0; i<streams.length; i++) {
    CIDs = CIDs.concat(await redis2.zrangebyscore(`allEmbeds:${streams[i].name}`, ZSCORE, ZSCORE))
  }
  CIDs = [...new Set(CIDs)]

  const conns = Object.values(connections).map(a => a.cid)
  await CIDs.forEach(async (cid) => {
    if (conns.indexOf(cid) === -1) {
      await redis2.zrem(`allSiteVisitors`, cid)
      await redis2.zrem('allPremiumVisitors', cid)
      for (let i=0; i<streams.length; i++) {
        let c = await redis2.zrem(`allEmbeds:${streams[i].name}`, cid)
        if (c) {
          break
        }
      }
      await redis2.zrem(`allEmbeds:__streamspread`, cid)
      await redis2.zrem(`allEmbeds:__stale`, cid)
    }
  })
  setTimeout(cleanCIDs, 600000)
}
// shortly after server restart, clear out old redis data for clients that did not reconnect
// repeats after every 10 minutes to fix any socket errors
setTimeout(cleanCIDs, 20000)