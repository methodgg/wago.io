
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])
const connections = []

function makeCID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
let n = 0
function Connection(conn, cid) {
  const c = ++n
  this.socket = conn.socket
  this.cid = cid || makeCID()
  this.alive = true
  this.send = (obj) => {
    this.socket.send(JSON.stringify(obj))
  }
  this.ping = () => {
    clearInterval(this.pong)
    this.alive = true
    this.pong = setInterval(() => {
      if (!this.alive) {
        return this.socket.terminate()
      }
      this.alive = false
      this.send({ping: 1})
    }, 30000)
  }
  this.ping()
  this.startStaleTimer = () => {
    clearTimeout(this.staleTimer)
    this.staleTimer = setTimeout(async () => {
      if (this.embedStream && this.embedStream !== '__streamspread') {
        await redis2.zrem(`embedVisitors:${this.embedStream}`, this.cid)
        this.embedStream = '__stale'
        await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, cid)
      }
    }, 20*60*1000)
  }
  this.delete = async () => {
    try {
      clearInterval(this.pong)
      clearTimeout(this.staleTimer)
      await redis2.zrem(`totalSiteVisitors`, this.cid)
      await redis2.zrem('totalPremiumVisitors', this.cid)
      if (this.embedStream) {
        await redis2.zrem(`embedVisitors:${this.embedStream}`, this.cid)
      }
      delete this
    }
    catch (e) {console.log(e)}
  }
  this.socket.on('close', () => {
    this.delete()
  })
  this.socket.on('error', (e) => {
    this.delete()
    console.log('err', e)
  })

  this.socket.on('message', async (data) => {
    try {
      let json = JSON.parse(data)
      data = json
    }
    catch {}
    for (const [key, value] of Object.entries(data)) {
      // ping-pong
      if (key === 'pong') {
        this.ping()
      }
      // hello: request-cid
      else if (key === 'hello') {
        if (value === 1) {
          this.send({setCID: cid})
        }
        else if (value && typeof value === 'string') {
          await redis2.zrem(`totalSiteVisitors`, this.cid)
          await redis2.zrem('totalPremiumVisitors', this.cid)
          if (this.embedStream) {
            await redis2.zrem(`embedVisitors:${this.embedStream}`, this.cid)
          }
          this.cid = value
        }
        await redis2.zadd('totalSiteVisitors', ZSCORE, cid)
        if (this.premiumUser) {
          await redis2.zadd('totalPremiumVisitors', ZSCORE, cid)
        }
        if (this.embedStream) {
          await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, cid)
        }
      }
      // do: reqStream
      else if (key === 'do' && value === 'reqStream') {
        this.embedStream = await advert.determineStream()
        await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, cid)
        this.send({setStream: this.embedStream})
        this.startStaleTimer()
      }
    }
  })
}


module.exports = async function (connection, req) {
  let cid = makeCID()
  try {
    connections.push(new Connection(connection, cid))
  }
  catch (e) {console.log(e)}
}

// on server restart clear the current counts for this host
async function restart() {
  await redis2.zremrangebyscore('totalSiteVisitors', ZSCORE, ZSCORE)
  await redis2.zremrangebyscore('totalPremiumVisitors', ZSCORE, ZSCORE)
  const streams = await Streamers.find({})
  streams.forEach(async (stream) => {
    await redis2.zremrangebyscore(`embedVisitors:${stream.name}`, ZSCORE, ZSCORE)
  })
  await redis2.zremrangebyscore(`embedVisitors:__streamspread`, ZSCORE, ZSCORE)
  await redis2.zremrangebyscore(`embedVisitors:__stale`, ZSCORE, ZSCORE)
}
restart()