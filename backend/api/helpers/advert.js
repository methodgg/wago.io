module.exports = {
  determineStream: async function (ip) {
    // existing embed?
    const current = await redis2.get(`currentstream:${ip}`)
    if (current && (current === 'streamspread' || await redis.get(`twitch:${current}:live`))) {
      await redis2.expire(`currentstream:${ip}`, 70)
      return current
    }

    // determine method stream or advert
    const streamOverride = global.EmbeddedStream || {streams:[]}
    // If enabled
    if (streamOverride.enabled && streamOverride.streams.length) {
      // check if user is currently viewing an available stream
      for (let i = 0; i < streamOverride.streams.length; i++) {
        if (await redis2.get(`stream:${streamOverride.streams[i].channel}:${ip}`) && await redis.get(`twitch:${streamOverride.streams[i].channel}:live`)) {
          redis2.expire(`stream:${streamOverride.streams[i].channel}:${ip}`, 70)
          return streamOverride.streams[i].channel
        }
      }
      for (let i = 0; i < streamOverride.streams.length; i++) {
        // check exposure chance
        if (Math.random() * 100 < streamOverride.streams[i].exposure && await redis.get(`twitch:${streamOverride.streams[i].channel}:live`)) {
          // and we are not over max viewer count...
          const embedViewers = parseInt(await redis.get('tally:active:embed:' + streamOverride.streams[i].channel))
          // then show stream to user
          if (embedViewers < parseInt(streamOverride.streams[i].max)) {
            await redis2.set(`stream:${streamOverride.streams[i].channel}:${ip}`, 1, 'EX', 70)
            await redis2.set(`currentstream:${ip}`, streamOverride.streams[i].channel, 'EX', 70)
            return streamOverride.streams[i].channel
          }
        }
      }
    }

    const streamerList = await Streamer.find({online: {$ne: null}})
    if (streamerList.length) {
      const total = streamerList.map(c => c.viewers).reduce((acc, cur) => acc + cur);
      const rng = Math.random() * total
      let acc = 0
      for (let i = 0; i < streamerList.length; i++) {
        if (streamerList[i].wagoViewers >= streamerList[i].viewers) {
          acc = acc + streamerList[i].viewers
          continue
        }
        if (rng < streamerList[i].viewers + acc) {
          await redis2.set(`stream:${streamerList[i].name}:${ip}`, 1, 'EX', 70)
          await redis2.set(`currentstream:${ip}`, streamerList[i].name, 'EX', 70)
          return streamerList[i].name
        }
        acc = acc + streamerList[i].viewers
      }
    }

    await redis2.set(`currentstream:${ip}`, 'streamspread', 'EX', 70)
    return 'streamspread'
  }
}