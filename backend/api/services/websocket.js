
const advert = require('../helpers/advert')
const Streamers = require("../models/Streamer")
const ZSCORE = parseInt(config.host.split(/-/)[1])
const connections = {}

function makeCID() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}
setInterval(async () => {
  for (const [cid, connection] of Object.entries(connections)) {
    if (!connection.alive) {
      clearTimeout(connection.staleTimer)
      await redis2.zrem(`totalSiteVisitors`, cid)
      await redis2.zrem('totalPremiumVisitors', cid)
      if (connection.embedStream) {
        await redis2.zrem(`embedVisitors:${connection.embedStream}`, cid)
      }
      connection.socket.close()
      delete connections[cid]
    }
    else if (connection.lastMsg < new Date().getTime() - 29000) {
      connection.alive = false
      connection.send({ping: 1})
    }
    else {
      // stable connection
    }
  }
}, 30000)

function Connection(conn, cid) {
  this.socket = conn.socket
  this.cid = cid || makeCID()
  this.alive = true
  this.send = (obj) => {
    this.socket.send(JSON.stringify(obj))
  }
  this.lastMsg = new Date().getTime()
  this.rename = (newCID) => {
    let oldCID = this.cid
    let clone = {}
    for (let key in this) {
      if (this.hasOwnProperty(key)) {
        clone[key] = this[key]
      }
    }
    clone.cid = newCID
    delete connections[oldCID]
    return clone
  }
  this.startStaleTimer = () => {
    clearTimeout(this.staleTimer)
    this.staleTimer = setTimeout(async () => {
      if (this.embedStream && this.embedStream !== '__streamspread') {
        await redis2.zrem(`embedVisitors:${this.embedStream}`, this.cid)
        this.embedStream = '__stale'
        await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, this.cid)
      }
    }, 20*60*1000)
  }
  this.socket.on('close', () => {
    this.alive = false
  })
  this.socket.on('error', (e) => {
    this.alive = false
  })

  this.socket.on('message', async (data) => {
    this.lastMsg = new Date().getTime()
    this.alive = true
    try {
      let json = JSON.parse(data)
      data = json
    }
    catch {}
    for (const [key, value] of Object.entries(data)) {
      // hello: request-cid
      if (key === 'hello') {
        let cid
        if (value === 1) {
          this.send({setCID: this.cid})
          cid = this.cid
        }
        else if (value && typeof value === 'string') {
          await redis2.zrem(`totalSiteVisitors`, this.cid)
          await redis2.zrem('totalPremiumVisitors', this.cid)
          if (this.embedStream) {
            await redis2.zrem(`embedVisitors:${this.embedStream}`, this.cid)
          }
          cid = value
          connections[cid] = this.rename(cid)
          if (connections[cid].staleTimer) {
            connections[cid].startStaleTimer()
          }
        }
        await redis2.zadd('totalSiteVisitors', ZSCORE, cid)
        if (connections[cid].premiumUser) {
          await redis2.zadd('totalPremiumVisitors', ZSCORE, cid)
        }
        if (connections[cid].embedStream) {
          await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, cid)
        }
      }
      // do: reqStream
      else if (key === 'do' && value === 'reqStream') {
        this.embedStream = await advert.determineStream()
        await redis2.zadd(`embedVisitors:${this.embedStream}`, ZSCORE, this.cid)
        this.send({setStream: this.embedStream})
        this.startStaleTimer()
      }
      // do: reqStream
      else if (key === 'do' && value === 'reqWago') {
        this.send({ident: data.ident, wago: 'test'})
      }
    }
  })
}


module.exports = async function (connection, req) {
  let cid = makeCID()
  try {
    connections[cid] = new Connection(connection, cid)
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