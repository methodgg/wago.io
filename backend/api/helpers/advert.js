module.exports = {
  determineStream: async function () {
    // existing embed?
    // const current = await redis2.get(`currentstream:${cid}`)
    // if (current && (current === 'streamspread' || current === '__CLOSED__' || await redis.get(`twitch:${current}:live`))) {
    //   await redis2.expire(`currentstream:${cid}`, 70)
    //   return current
    // }

    // determine method stream or advert
    const streamOverride = global.EmbeddedStream || {streams:[]}
    // If enabled
    if (streamOverride.enabled && streamOverride.streams.length) {
      for (let i = 0; i < streamOverride.streams.length; i++) {
        // check exposure chance
        if (Math.random() * 100 < streamOverride.streams[i].exposure && await redis.get(`twitch:${streamOverride.streams[i].channel}:live`)) {
          // and we are not over max viewer count...
          const embedViewers = await redis2.zcount(`embedVisitors:${streamOverride.streams[i].channel}`, '-inf', '+inf')
          // then show stream to user
          if (embedViewers < parseInt(streamOverride.streams[i].max)) {
            // await redis2.set(`stream:${streamOverride.streams[i].channel}:${cid}`, 1, 'EX', 70)
            // await redis2.set(`currentstream:${cid}`, streamOverride.streams[i].channel, 'EX', 70)
            return streamOverride.streams[i].channel
          }
        }
      }
    }

    // const streamerList = await Streamer.find({online: {$ne: null}})
    // if (streamerList.length) {
    //   const total = streamerList.map(c => c.viewers).reduce((acc, cur) => acc + cur);
    //   const rng = Math.random() * total
    //   let acc = 0
    //   for (let i = 0; i < streamerList.length; i++) {
    //     if (streamerList[i].wagoViewers >= streamerList[i].viewers) {
    //       acc = acc + streamerList[i].viewers
    //       continue
    //     }
    //     if (rng < streamerList[i].viewers + acc) {
    //       await redis2.set(`stream:${streamerList[i].name}:${cid}`, 1, 'EX', 70)
    //       await redis2.set(`currentstream:${cid}`, streamerList[i].name, 'EX', 70)
    //       return streamerList[i].name
    //     }
    //     acc = acc + streamerList[i].viewers
    //   }
    // }

    // await redis2.set(`currentstream:${cid}`, 'streamspread', 'EX', 70)
    return 'streamspread'
  },

  removeStream: async function (cid) {
    const current = await redis2.get(`currentstream:${cid}`)
    if (current) {
      redis2.del(`currentstream:${cid}`)
      redis2.zrem(`stream:${current}:${cid}`)
    }
  }
}