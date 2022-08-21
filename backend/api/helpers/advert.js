module.exports = {
  determineStream: async function (cid, replace) {
    // existing embed?
    const current = await redis2.get(`currentstream:${cid}`)
    if (current && (current === '__streamspread' || current === '__closed' || (!replace && await redis.get(`twitch:${current}:live`)))) {
      return current
    }
    else {
      await redis2.zrem(`allEmbeds:${current}`, cid)
    }

    // determine method stream or advert
    const streamOverride = global.EmbeddedStream || {streams:[]}
    // If enabled
    if (streamOverride.enabled && streamOverride.streams.length) {
      for (let i = 0; i < streamOverride.streams.length; i++) {
        // check exposure chance
        if (Math.random() * 100 < streamOverride.streams[i].exposure && replace !== streamOverride.streams[i].channel && await redis.get(`twitch:${streamOverride.streams[i].channel}:live`)) {
          // and we are not over max viewer count...
          const embedViewers = await redis2.zcount(`allEmbeds:${streamOverride.streams[i].channel}`, '-inf', '+inf')
          // then show stream to user
          if (embedViewers < parseInt(streamOverride.streams[i].max)) {
            await redis2.set(`currentstream:${cid}`, streamOverride.streams[i].channel)
            return streamOverride.streams[i].channel
          }
        }
      }
    }

    // let streamerList = (await Streamer.find({online: {$ne: null}}))
    // if (streamerList.length) {
    //   streamerList = streamerList.filter(c => c.name !== replace)
    //   const total = streamerList.map(c => c.viewers).reduce((acc, cur) => acc + cur);
    //   const rng = Math.random() * total
    //   let acc = 0
    //   for (let i = 0; i < streamerList.length; i++) {
    //     if (rng < streamerList[i].viewers + acc && streamerList[i].name !== replace) {
    //       await redis2.set(`stream:${streamerList[i].name}:${cid}`, 1, 'EX', 70)
    //       await redis2.set(`currentstream:${cid}`, streamerList[i].name, 'EX', 70)
    //       return streamerList[i].name
    //     }
    //     else {
    //       acc = acc + streamerList[i].viewers
    //     }
    //   }
    // }

    const defaultStream = await redis.get('static:DefaultStream')
    await redis2.set(`currentstream:${cid}`, defaultStream)
    return defaultStream
  },

  removeStream: async function (cid) {
    const current = await redis2.get(`currentstream:${cid}`)
    if (current) {
      redis2.del(`currentstream:${cid}`)
      redis2.zrem(`stream:${current}:${cid}`)
    }
  }
}