const battlenet = require('./battlenet')
const cloudflare = require('cloudflare')({ token: config.cloudflare.dnsToken })
const decompress = require('@atomic-reactor/decompress')
const { Octokit } = require('@octokit/rest');
const image = require('./image')
const lua = require('./lua')
const md5 = require('md5')
const mkdirp = require('mkdirp')
const path = require('path')
const getCode = require('./code-detection/get-code')
const luacheck = require('./luacheck')
const elastic = require('./elasticsearch')
const patchDates = require('./patchDates')
const codeMetrics = require('./codeMetrics')
const categories = require('../../../frontend/src/components/libs/categories2')

const ENUM = require('../../middlewares/enum')
const logger = require('../../middlewares/matomo')
const logError = require('../../middlewares/matomoErrors')

const octokit = new Octokit({
  auth: config.github.token
})


module.exports = async (task, data) => {
  try {
    switch (task) {
      case 'UpdatePatreonAccounts':
        return await UpdatePatreonAccounts()

      case 'UpdateWeeklyMDT':
        return await UpdateWeeklyMDT()

      case 'ComputeStatistics':
        return await ComputeStatistics()

      case 'DiscordMessage':
        return await DiscordMessage(data)

      case 'UpdateValidCharacters':
        return await UpdateValidCharacters()

      case 'UpdateGuildMembership':
        return await UpdateGuildMembership()

      case 'UpdateMDT':
        return await updateMDT()

      case 'UpdateLatestAddonReleases':
        return await UpdateLatestAddonReleases()

      case 'UpdateTopLists':
        return await UpdateTopLists()

      case 'UpdateTwitchStatus':
        return await UpdateTwitchStatus(data)

      case 'UpdateWagoOfTheMoment':
        return await UpdateWagoOfTheMoment()

      case 'UpdateActiveUserCount':
        return await UpdateActiveUserCount()

      case 'UpdateLatestNews':
        return await UpdateLatestNews()

      case 'SyncElastic':
        return await SyncElastic(data.table)

      case 'ProcessCode':
        return await ProcessCode(data)

      case 'ProcessAllCode':
        return await ProcessAllCode()

      case 'CleanTaskQueue':
        return taskQueue.clean(10000)

      case 'UpdateGameVersions':
        return await GameVersion.updatePatches()

      default:
        throw { name: 'Unknown task', message: 'Unknown task ' + task }
    }
  }
  catch (e) {
    console.error(e)
    logError(e, 'Task ', task)
  }
}

async function UpdateWagoOfTheMoment() {
  const data = await WagoItem.randomOfTheMoment()
  await redis.set('static:WagoOfTheMoment', JSON.stringify(data))
}

async function UpdateTwitchStatus(channel) {
  var twitchToken = await redis.get('twitch:appToken')
  if (!twitchToken) {
    const getToken = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${config.auth.twitch.clientID}&client_secret=${config.auth.twitch.clientSecret}&grant_type=client_credentials`)
    if (getToken && getToken.data && getToken.data.access_token) {
      twitchToken = getToken.data.access_token
      redis.set('twitch:appToken', twitchToken, 'EX', getToken.data.expires_in)
    }
  }
  var streams = []
  var status = {}
  if (!channel || typeof channel !== 'string') {
    const cfg = JSON.parse(await redis.get('static:EmbeddedStream'))
    streams = cfg?.streams || []
  }
  for (let i = 0; i < streams.length; i++) {
    let channel = streams[i].channel
    if (channel) {
      const req = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
        headers: {
          'client-id': config.auth.twitch.clientID,
          'Authorization': 'Bearer ' + twitchToken
        }
      })
      await redis.set(`twitch:${channel}:live`, (req.data.data.length > 0))
      status[channel] = (req.data.data.length > 0)
    }
  }

  const streamers = await Streamer.find({})
  var getStreams = []
  for (let i = 0; i < streamers.length; i++) {
    getStreams.push(`user_login=${streamers[i].name}&`)
  }

  var twitchStreamers = []
  while (getStreams.length) {
    let twitchUserQuery = getStreams.splice(0, 20)
    let twitchReq = await axios.get(`https://api.twitch.tv/helix/streams?${twitchUserQuery.join('')}`, {
      headers: {
        'client-id': config.auth.twitch.clientID,
        'Authorization': 'Bearer ' + twitchToken
      }
    })
    if (twitchReq && twitchReq.data && twitchReq.data.data) {
      twitchStreamers = twitchStreamers.concat(twitchReq.data.data)
    }
  }

  for (let i = 0; i < streamers.length; i++) {
    for (let k = 0; k < twitchStreamers.length; k++) {
      if (twitchStreamers[k].user_name.toLowerCase() === streamers[i].name.toLowerCase()) {
        streamers[i].online = new Date(twitchStreamers[k].started_at)
        streamers[i].offline = null
        streamers[i].game = twitchStreamers[k].game_name
        streamers[i].title = twitchStreamers[k].title
        streamers[i].viewers = twitchStreamers[k].viewer_count - (streamers[i].wagoViewers || 0)
        streamers[i].name = twitchStreamers[k].user_name
        await streamers[i].save()
        streamers[i].ok = true
        await redis.set(`twitch:${streamers[i].name}:live`, 1)
      }
    }
  }
  for (let i = 0; i < streamers.length; i++) {
    if (!streamers[i].ok && streamers[i].online) {
      streamers[i].online = null
      streamers[i].offline = Date.now()
      streamers[i].viewers = 0
      streamers[i].wagoViewers = 0
      await streamers[i].save()
      await redis.del(`twitch:${streamers[i].name}:live`)
      await redis2.zremrangebyscore(`allEmbeds:${streamers[i].name}`, '-inf', '+inf')
    }
  }

  return status
}

async function UpdateLatestNews() {
  const docs = await Blog.find({ publishStatus: 'publish' }).sort('-date').limit(1).populate('_userId')
  var news = []
  docs.forEach((item) => {
    news.push({
      content: item.content,
      date: item.date,
      format: item.format,
      title: item.title,
      _id: item._id,
      user: {
        username: item._userId.account.username,
        css: item._userId.roleclass
      }
    })
  })
  await redis.set('static:LatestNews', JSON.stringify(news))
}

async function UpdatePatreonAccounts() {
  let nextURL = 'https://www.patreon.com/api/oauth2/v2/campaigns/8814646/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title'
  const addonSubs = []
  while (nextURL) {
    const response = await axios.get(nextURL, { headers: { Authorization: 'Bearer ' + config.auth.patreon.creatorToken } })
    const patrons = response.data.data
    for (let i = 0; i < patrons.length; i++) {
      if (!patrons[i] || !patrons[i].relationships || !patrons[i].relationships.user || !patrons[i].relationships.user.data || !patrons[i].relationships.user.data.id) {
        continue
      }
      const user = await User.findOne({ "patreon.id": patrons[i].relationships.user.data.id })
      if (!user) {
        continue
      }
      let tier
      try {
        tier = patrons[i].relationships.currently_entitled_tiers.data[0].id
      }
      catch (e) {
        tier = 0
      }
      // supporter 8747937
      // addon supporter 8747907
      // gold supporter 8747906
      // ultimate supporter 8751772
      user.roles.patreonTier = tier
      user.roles.subscriber = (tier == 8747937 || tier == 8747907 || tier == 8747906 || tier == 8751772)
      user.roles.gold_subscriber = (tier == 8747906 || tier == 8751772)
      addonSubs.push(user._id.toString())
      await user.save()
    }
    if (response.data.links && response.data.links.next) {
      nextURL = response.data.links.next
    }
    else {
      nextURL = null
    }
  }
  return await UpdatePatreonAccounts_grandfathered(addonSubs)
}

async function UpdatePatreonAccounts_grandfathered(skipExisting) {
  let nextURL = 'https://www.patreon.com/api/oauth2/v2/campaigns/562591/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title'
  while (nextURL) {
    const response = await axios.get(nextURL, { headers: { Authorization: 'Bearer ' + config.auth.patreon_old.creatorToken } })
    const patrons = response.data.data
    for (let i = 0; i < patrons.length; i++) {
      if (!patrons[i] || !patrons[i].relationships || !patrons[i].relationships.user || !patrons[i].relationships.user.data || !patrons[i].relationships.user.data.id) {
        continue
      }
      const user = await User.findOne({ "patreon.id": patrons[i].relationships.user.data.id })
      if (!user || skipExisting.includes(user._id.toString())) {
        continue
      }
      let tier
      try {
        tier = patrons[i].relationships.currently_entitled_tiers.data[0].id
      }
      catch (e) {
        tier = 0
      }
      // subscriber 1385924
      // gold sub 1386010
      user.roles.patreonTier = tier
      user.roles.subscriber = tier > 0
      user.roles.gold_subscriber = tier > 1385924
      // user.roles.guild_subscriber = (!patrons[i].attributes.declined_since && patrons[i].attributes.amount_cents >= 1500)
      await user.save()
    }
    if (response.data.links && response.data.links.next) {
      nextURL = response.data.links.next
    }
    else {
      nextURL = null
    }
  }
  return
}

async function UpdateWeeklyMDT() {
  await battlenet.updateMDTWeeks()
}

async function UpdateTopLists() {
  const data = []
  let imports

  // trending 
  // imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  // data.push({ title: 'Trending Imports', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })


  // favorites
  imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorites All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite WeakAuras All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WOTLK-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite WotLK WeakAuras All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite Plater All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite Total RP All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite VuhDo All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite ElvUI All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }), lastOfSection: true })
  imports = await WagoItem.find({ type: 'DELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.favorite_count").select('_id name popularity.favorite_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Favorite DelvUI All Time', imports: imports.map(x => { return { count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }), lastOfSection: true })

  // popular
  imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular WeakAuras This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WOTLK-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular WotLK WeakAuras This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular Plater This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular Total RP This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular VuhDo This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular ElvUI This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }), lastOfSection: true })
  imports = await WagoItem.find({ type: 'DELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Popular DelvUI This Week', imports: imports.map(x => { return { count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }), lastOfSection: true })

  // installed
  imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.installed_count").select('_id name popularity.installed_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Installed', imports: imports.map(x => { return { count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.installed_count").select('_id name popularity.installed_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Installed WeakAuras', imports: imports.map(x => { return { count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ type: 'WOTLK-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false }).sort("-popularity.installed_count").select('_id name popularity.installed_count previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Installed WotLK WeakAuras', imports: imports.map(x => { return { count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }), lastOfSection: true })

  // new and updated imports
  imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false, "latestVersion.iteration": { $gt: 1 } }).sort({ "modified": -1 }).select('_id name modified previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Recently Updated', imports: imports.map(x => { return { date: true, display: x.modified, name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })
  imports = await WagoItem.find({ deleted: false, hidden: false, private: false, restricted: false, encrypted: false, "latestVersion.iteration": 1 }).sort({ "created": -1 }).select('_id name created previewImage previewStatic').limit(10).exec()
  data.push({ title: 'Newest Imports', imports: imports.map(x => { return { date: true, display: x.created, name: x.name, slug: x.slug, img: x.previewImage, static: x.previewStatic } }) })

  // save data
  await redis.set('static:TopLists', JSON.stringify(data))
}

async function DiscordMessage(data) {
  if (global.discordBot) {
    const author = await User.findById(data.author)
    const wago = await WagoItem.lookup(data.wago)
    if (data.type === 'comment') {
      const sendTo = await User.findOne({ _id: data.to, "discord.options.messageOnComment": true }).select('discord').exec()
      if (sendTo && !author._id.equals(sendTo._id)) {
        discordBot.postComment(author, sendTo, wago, data.message)
      }
    }
    else if (data.type === 'update') {
      const stars = await WagoFavorites.find({ type: 'Star', wagoID: wago._id })
      for (let i = 0; i < stars.length; i++) {
        const sendTo = await User.findOne({ _id: stars[i].userID, "discord.options.messageOnFaveUpdate": true }).select('discord').exec()
        if (sendTo && !author._id.equals(sendTo._id)) {
          discordBot.postUpdate(author, sendTo, wago)
        }
      }
    }
  }
}

async function UpdateValidCharacters() {
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const users = await User.find({ "battlenet.characters.1": { $exists: true }, $or: [{ "battlenet.updateDate": { $exists: false } }, { "battlenet.updateDate": { $lt: fourWeeksAgo } }] }).limit(50).exec()
  for (let i = 0; i < users.length; i++) {
    var validChars = []
    for (let k = 0; k < users[i].battlenet.characters.length; k++) {
      const status = await battlenet.lookupCharacterStatus(users[i].battlenet.characters[k].region, users[i].battlenet.characters[k].realm, users[i].battlenet.characters[k].name)
      if (status.error || !status.is_valid || (users[i].battlenet.characters[k].bnetID && users[i].battlenet.characters[k].bnetID != status.id)) {
        continue
      }
      else if (!users[i].battlenet.characters[k].bnetID) {
        users[i].battlenet.characters[k].bnetID = status.id
      }
      validChars.push(users[i].battlenet.characters[k])
    }
    users[i].battlenet.updateDate = new Date()
    users[i].battlenet.characters = validChars
    await users[i].save()
  }
}

async function UpdateGuildMembership() {
  function guildRankSort(a, b) {
    if (a.rank > b.rank) return -1
    else if (a.rank < b.rank) return 1
    return 0
  }
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  var guildsChecked = []
  const users = await User.find({ "battlenet.guilds.1": { $exists: true }, $or: [{ "roles.gold_subscriber": true }, { "roles.pro_subscriber": true }, { "roles.ambassador": true }, { "roles.developer": true }, { "roles.community_leader": true }, { "roles.artContestWinnerAug2018": true }] }).exec()
  const updateGuild = async function (guildKey) {
    const accountIdsInGuild = []
    const accountsInGuild = []
    if (guildKey.match(/@\d$/, '') || guildsChecked.indexOf(guildKey) >= 0) {
      return Promise.resolve()
    }

    guildsChecked.push(guildKey)
    const [region, realm, guildname] = guildKey.split(/@/g)
    const guild = await battlenet.lookupGuild(region, realm, guildname)
    if (!guild || !guild.members) {
      // if unknown error (likely 500)
      return Promise.resolve()
    }
    else if (guild.error === 'NOGUILD') {
      // if this guild no longer exists, remove all members from it
      let exGuild = await User.find({ "battlenet.guilds": guildKey }).exec()
      let deletePromise = new Promise(async (deleteDone) => {
        exGuild.forEach(async (exMember) => {
          let re = new RegExp('^' + guildKey + '(@\\d)?$')
          for (let g = exMember.battlenet.guilds.length - 1; g >= 0; g--) {
            if (exMember.battlenet.guilds[g].match(re)) {
              exMember.battlenet.guilds.splice(g, 1)
            }
          }
          await exMember.save()
          return deleteDone()
        })
      })
      await deletePromise
      return Promise.resolve()
    }
    else {
      // guild found! Match all wago users with guild
      guild.members.sort(guildRankSort)
      for (let j = 0; j < guild.members.length; j++) {
        let memberUser = await User.findOne({ "battlenet.characters.region": region, "battlenet.characters.name": guild.members[j].character.name })
        if (!memberUser) {
          continue
        }

        var memberID = memberUser._id.toString()
        if (accountsInGuild.indexOf(memberID) === -1) {
          accountIdsInGuild.push(memberUser._id)
          accountsInGuild.push(memberID)
        }

        // if new member to guild
        if (memberUser.battlenet.guilds.indexOf(guildKey) === -1) {
          memberUser.battlenet.guilds.push(guildKey)
          for (let k = guild.members[j].rank; k <= 9; k++) {
            memberUser.battlenet.guilds.push(`${guildKey}@${k}`)
          }
        }

        // else they are already in guild, but since they may have changed ranks
        // remove everything and re-add all current ranks
        else {
          let re = new RegExp('^' + escapeRegExp(guildKey) + '@\\d$')
          for (let g = 0; g < memberUser.battlenet.guilds.length; g++) {
            if (memberUser.battlenet.guilds[g].match(re)) {
              memberUser.battlenet.guilds.splice(g, 1)
              break
            }
          }
          for (let k = guild.members[j].rank; k <= 9; k++) {
            memberUser.battlenet.guilds.push(`${guildKey}@${k}`)
          }
        }

        if (guildKey === 'eu@twisting-nether@Method') {
          memberUser.roles.methodRaider = (guild.members[j].rank <= 4)
        }

        memberUser.battlenet.guilds = [...new Set(memberUser.battlenet.guilds)]

        await memberUser.save()
      }

      // remove old members
      let exGuild = await User.find({ "battlenet.guilds": guildKey, _id: { $nin: accountIdsInGuild } }).exec()
      for (let d = 0; d < exGuild.length; d++) {
        let re = new RegExp('^' + guildKey + '(@\\d)?$')
        for (let g = exGuild[d].battlenet.guilds.length - 1; g >= 0; g--) {
          if (exGuild[d].battlenet.guilds[g].match(re)) {
            exGuild[d].battlenet.guilds.splice(g, 1)
          }
        }
        if (guildKey === 'eu@twisting-nether@Method') {
          exGuild[d].roles.methodRaider = false
        }

        await exGuild[d].save()
      }
    }
  }

  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users[i].battlenet.guilds.length; j++) {
      await updateGuild(users[i].battlenet.guilds[j])
    }
  }
  await updateGuild('eu@twisting-nether@Method')
}

async function ComputeStatistics() {
  // calc views this week
  const viewedDocs = await ViewsThisWeek.aggregate([{ $group: { _id: '$wagoID', views: { $sum: 1 } } }]).exec()
  let totalImports = 0
  let totalSum = 0
  let totalSquared = 0
  while (viewedDocs.length > 0) {
    // process in batches of 500
    let items = viewedDocs.splice(0, 500)
    let ops = []
    items.forEach((wago) => {
      ops.push({
        updateOne: {
          filter: { _id: wago._id },
          update: { 'popularity.viewsThisWeek': wago.views }
        }
      })
      if (wago.views > 5) {
        totalImports++
        totalSum += wago.views
        totalSquared += wago.views * wago.views
      }
    })
    await WagoItem.bulkWrite(ops)
  }

  let mean = totalSum / totalImports
  let standardDeviation = Math.sqrt((totalSquared - ((totalSum * totalSum) / totalImports)) / (totalSum - 1))
  await redis.set('stats:standardDeviation:views', standardDeviation || 0)
  await redis.set('stats:mean:views', mean || 0)

  const recentDate = new Date()
  recentDate.setMonth(recentDate.getDate() - 18)

  // calc installs this month
  totalImports = 0
  totalSum = 0
  totalSquared = 0
  const installDocs = await WagoFavorites.aggregate([
    { $match: { type: 'Install', timestamp: { $gt: recentDate } } },
    { $group: { _id: '$wagoID', installs: { $sum: 1 } } }
  ]).exec()

  while (installDocs.length > 0) {
    // process in batches of 500
    var items = installDocs.splice(0, 500)
    items.forEach((wago) => {
      if (wago.installs > 5) {
        totalImports++
        totalSum += wago.installs
        totalSquared += wago.installs * wago.installs
      }
    })
  }

  mean = totalSum / totalImports
  standardDeviation = Math.sqrt((totalSquared - ((totalSum * totalSum) / totalImports)) / (totalSum - 1))
  await redis.set('stats:standardDeviation:installs', standardDeviation || 0)
  await redis.set('stats:mean:installs', mean || 0)

  // calc stars this month
  totalImports = 0
  totalSum = 0
  totalSquared = 0
  const starDocs = await WagoFavorites.aggregate([
    { $match: { type: 'Star', timestamp: { $gt: recentDate } } },
    { $group: { _id: '$wagoID', stars: { $sum: 1 } } }
  ]).exec()

  while (starDocs.length > 0) {
    // process in batches of 500
    var items = starDocs.splice(0, 500)
    items.forEach((wago) => {
      if (wago.stars > 5) {
        totalImports++
        totalSum += wago.stars
        totalSquared += wago.stars * wago.stars
      }
    })
  }

  mean = totalSum / totalImports
  standardDeviation = Math.sqrt((totalSquared - ((totalSum * totalSum) / totalImports)) / (totalSum - 1))
  await redis.set('stats:standardDeviation:stars', standardDeviation || 0)
  await redis.set('stats:mean:stars', mean || 0)
}

async function updateMDT(branch='master', path='') {
  try {
    const response = await octokit.repos.getContent({
      owner: 'Nnoggie',
      repo: 'MythicDungeonTools',
      path,
      ref: branch,
    })

    // Filter the response to get only file objects (exclude directories)
    const dungeonFiles = response.data.filter(file => {
      return file.type === 'file' && file.path.match(/\/\w+.lua$/)
      }
    )
    for (const f of dungeonFiles) {
      await updateMDTDungeon(f, branch)
    }

    // Recursively fetch files in subdirectories
    const subdirectories = response.data.filter(file => file.type === 'dir' && file.path.match(/BattleForAzeroth|Dragonflight|Legion|Shadowlands|WrathOfTheLichKing/))
    for (const dir of subdirectories) {
      await updateMDT(branch, dir.path)
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    process.exit()
  }
}

async function updateMDTDungeon(file, branch) {
  const response = await octokit.repos.getContent({
    owner: 'Nnoggie',
    repo: 'MythicDungeonTools',
    path: file.path,
    ref: branch,
  });
  const contents = Buffer.from(response.data.content, 'base64').toString('utf-8')
  if (!contents.match(/MDT\.dungeonEnemies\[dungeonIndex\]/)) {
      return
  }
  const luaCode = `local MDT = {
    L=function(s) return s end, 
    dungeonList={},
    mapInfo={},
    zoneIdToDungeonIdx={},
    dungeonMaps={},
    dungeonSubLevels={},
    dungeonTotalCount={},
    mapPOIs={},
    scaleMultiplier={},
    dungeonEnemies={}
  }
  ${contents}
  MDT.dungeonIndex = dungeonIndex`
  .replace('= ...', '= "..."')
  .replace(/L\["([^"]+)"\]/g, 'L("$1")');

  const json = await lua.runLua(`dofile("./wago-legacy.lua"); ${luaCode} Table2JSON(MDT)`)
  const mdtData = JSON.parse(json)

  if (!categories.findByMDT_ID(mdtData.dungeonIndex)) {
    return
  }
  console.log('Process for MDT', file.path, mdtData.dungeonIndex)

  // mdtData.dungeonDimensions = []
  // mdtData.dungeonEnemies.forEach((enemies, mapID) => {
  //   // console.log(mapID)
  //   mdtData.dungeonDimensions.push({ maxX: -9999999, minX: 9999999, maxY: -9999999, minY: 9999999 })
  //   if (!enemies) return
  //   enemies.forEach((creature) => {
  //     if (!creature || !creature.clones) return
  //     creature.clones.forEach((clone) => {
  //       if (!clone) {
  //         return
  //       }
  //       mdtData.dungeonDimensions[mapID].maxX = Math.max(mdtData.dungeonDimensions[mapID].maxX, clone.x)
  //       mdtData.dungeonDimensions[mapID].minX = Math.min(mdtData.dungeonDimensions[mapID].minX, clone.x)
  //       mdtData.dungeonDimensions[mapID].maxY = Math.max(mdtData.dungeonDimensions[mapID].maxY, clone.y)
  //       mdtData.dungeonDimensions[mapID].minY = Math.min(mdtData.dungeonDimensions[mapID].minY, clone.y)
  //     })
  //   })
  // })

  const mapID = mdtData.dungeonIndex - 1
  const enemyHash = md5(JSON.stringify(mdtData.dungeonEnemies[mapID]))  
  const currentData = await SiteData.findById('mdtDungeonTable-' + mapID).exec()

  const mapData = {
    slug: path.basename(file.path).replace(/\.lua/, ''),
    enemyHash,
    affixWeeks: mdtData.affixWeeks,
    dungeonEnemies: mdtData.dungeonEnemies[mapID],
    mapPOIs: mdtData.mapPOIs[mapID],
    mapInfo: mdtData.mapInfo[mapID],
    dungeonTotalCount: mdtData.dungeonTotalCount[mapID],
    dungeonSubLevels: mdtData.dungeonSubLevels[mapID],
    dungeonMaps: mdtData.dungeonMaps[mapID]
  }

  await SiteData.findByIdAndUpdate('mdtDungeonTable-' + (mapID), { value: mapData }, { upsert: true }).exec()

  overwrite = true
  if (overwrite || !currentData || (currentData.value.enemyHash !== enemyHash && mapData.dungeonMaps && mapData.dungeonEnemies && mapData.dungeonEnemies.length)) {
    console.log('make portrait map', mapID, file.path)
    await buildStaticMDTPortraits(mapData, mapID, false)
    // await buildStaticMDTPortraits(mapData, mapID, true)
  }
}

async function UpdateLatestAddonReleases() {
  const addons = [
    { name: 'WeakAuras-2', host: 'github', url: 'https://api.github.com/repos/weakAuras/WeakAuras2/releases' },
    // {name: 'VuhDo', host: 'gitlab', url: 'https://gitlab.vuhdo.io/api/v4/projects/13/releases'},
    // {name: 'ElvUI', host: 'tukui', url: 'https://www.tukui.org/api.php?ui=elvui'},
    // {name: 'MDT', host: 'github', url: 'https://api.github.com/repos/Nnoggie/MythicDungeonTools/releases'},
  ]
  var madeUpdate = false
  for (let addon of addons) {
    var release = {}
    try {
      const response = await axios.get(addon.url)
      if (addon.host === 'github') {
        var uniquePhases = {}
        for (const item of response.data) {
          release = {}
          release.addon = addon.name
          release.active = true
          release.phase = item.prerelease ? 'Pre-Release' : 'Release'
          if (uniquePhases[addon.name + release.phase]) {
            continue
          }
          uniquePhases[addon.name + release.phase] = true
          release.url = item.url
          release.version = item.name
          release.date = item.published_at
          const preExisting = await AddonRelease.findOneAndUpdate({ addon: release.addon, phase: release.phase, version: release.version }, release, { upsert: true, new: false }).exec()
          if (!preExisting) {
            madeUpdate = true
            await AddonRelease.updateMany({ addon: release.addon, version: { $ne: release.version } }, { $set: { active: false } }).exec()

            if (release.addon === 'WeakAuras-2' && release.phase === 'Release') {
              await updateWAData(release, item.assets)
            }
            else if (release.addon === 'MDT' && release.phase === 'Release') {
              await updateMDTData(release, item)
            }
          }
        }
      }
      else if (addon.host === 'gitlab') {
        release.addon = addon.name
        release.active = true
        release.phase = 'Release'
        for (let i = 0; i < response.data.length; i++) {
          if (response.data[i].name.match(/^v[\d.-]+$/)) {
            release.version = response.data[i].name
            release.url = 'https://gitlab.vuhdo.io/vuhdo/vuhdo/-/releases' + release.version
            release.date = response.data[i].released_at
            break
          }
        }
        if (!release.url) {
          return
        }
        const preExisting = await AddonRelease.findOneAndUpdate({ addon: release.addon, phase: release.phase, version: release.version }, release, { upsert: true, new: false }).exec()
        if (!preExisting) {
          madeUpdate = true
          await AddonRelease.updateMany({ addon: release.addon, version: { $ne: release.version } }, { $set: { active: false } }).exec()
        }
      }
      else if (addon.host === 'tukui') {
        release.addon = addon.name
        release.active = true
        release.phase = 'Release'
        release.url = response.data.web_url
        release.version = response.data.version
        release.date = new Date(response.data.lastupdate)

        if (addon.name === 'ElvUI') {
          var classicResponse = await axios.get('https://www.tukui.org/api.php?classic-addon=2')
          release.classicVersion = classicResponse.data.version
        }
        const preExisting = await AddonRelease.findOneAndUpdate({ addon: release.addon, phase: release.phase, version: release.version, classicVersion: release.classicVersion }, release, { upsert: true, new: false }).exec()
        if (!preExisting) {
          // if a new release then de-activate the previous version(s)
          madeUpdate = true
          await AddonRelease.updateMany({ addon: release.addon, phase: release.phase, version: { $ne: release.version } }, { $set: { active: false } }).exec()
        }
      }
    }
    catch (e) {
      console.error(e)
      throw 'Error fetching addon ' + addon.name
    }
  }
  if (madeUpdate) {
    const Latest = await AddonRelease.find({ active: true })
    await redis.set('static:LatestAddons', JSON.stringify(Latest))
  }
}

async function SyncElastic(table) {
  console.log("SYNC ELASTIC", table)
  return await new Promise(async (done, reject) => {
    let count = 0
    let doc
    switch (table) {
      case 'imports':
        const cursorImports = WagoItem.find({ _userId: { $exists: true }, expires_at: null }).cursor()
        doc = await cursorImports.next()
        while (doc) {
          count++
          if (doc.deleted) {
            elastic.removeDoc('imports', await doc._id)
          }
          else {
            const d = await doc.indexedImportData
            if (d) {
              elastic.addDoc('imports', d, true)
            }
            else {
              elastic.removeDoc('imports', await doc._id)
            }
          }
          doc = await cursorImports.next()
          if (count % 500 === 0) {
            console.log(table, count)
          }
          if (count % 5000 === 0) {
            // hack to ease up on spamming ES
            // await new Promise(r => setTimeout(r, 5000))
          }
        }
        break

      case 'comments':
        const cursorComments = Comments.find({ codeReview: null }).cursor()
        doc = await cursorComments.next()
        while (doc) {
          count++
          if (doc.deleted) {
            elastic.removeDoc('comments', await doc._id)
          }
          else {
            const data = await doc.indexedCommentData
            if (data && !data.deleted) {
              elastic.addDoc('comments', data, true)
            }
          }
          doc = await cursorComments.next()
          if (count % 500 === 0) {
            console.log(table, count)
          }
        }
        break

      case 'WagoItem':
        syncStream = WagoItem.synchronize()
        break

      case 'User':
        syncStream = User.synchronize()
        break

      default:
        return done()
    }
  })
}

const codeProcessVersion = ENUM.PROCESS_VERSION.WAGO
async function CodeReview(customCode, doc) {
  try {
    let lc = await luacheck.run(customCode, doc.game)
    if (lc) {
      customCode = lc
    }
  }
  catch (e) {
    console.error('luacheck error', doc._id, e)
  }

  try {
    let metrics = await codeMetrics.run(customCode)
    if (metrics) {
      customCode = metrics
    }
  }
  catch (e) {
    console.error('codeMetrics error', doc._id, e)
  }
  return customCode
}

function TableReview(obj, data) {
  if (!data) {
    data = {
      dependencies: new Set()
    }
  }
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object') {
      data = TableReview(v, data)
    }
    else if (typeof v === 'string' && (k === 'texture' || (k === 'sound' && (obj.do_sound || obj.sound_type === 'Play')))) {
      let s = v.replace(/\\{1,2}/g, '/')
      let m = s.match(/^Interface\/AddOns\/([^\/]+)\//i)
      if (m) {
        data.dependencies.add(m[1])
      }
    }
  }
  return data
}
async function ProcessCode(data) {
  if (!data.id) return
  var doc = await WagoItem.lookup(data.id)
  var code = await WagoCode.lookup(data.id, data.version)
  if (!doc || doc.type.match(/UNKNOWN/) || !code || !code._id || doc.encrypted) {
    return
  }
  if (data.addon && Addons[data.addon]) {
    const addon = Addons[data.addon]
    if (addon && addon.addWagoData) {
      let meta = await addon.addWagoData(code, doc)
      if (meta) {
        if (meta.code) { code = meta.code }
        if (meta.wago) { doc = meta.wago }
      }
      if (data.encode || !code.encoded) {
        if (addon.encode) {
          code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        }
        else if (addon.encodeRaw) {
          code.encoded = await addon.encodeRaw(code.json)
        }
      }
    }
  }
  else if (doc.type) {
    // match addon by type
    for (const addon of Object.values(Addons)) {
      if (addon.addWagoData && doc.type.match(addon.typeMatch)) {
        let meta = await addon.addWagoData(code, doc)
        if (meta) {
          if (meta.code) { code = meta.code }
          if (meta.wago) { doc = meta.wago }
        }
        if (data.encode || !code.encoded) {
          if (addon.encode) {
            code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
          }
          else if (addon.encodeRaw) {
            code.encoded = await addon.encodeRaw(code.json)
          }
        }
      }
    }
  }
  let err
  try {
    switch (doc.type) {
      case 'SNIPPET':
        code.customCode = await CodeReview([{ id: 'Lua', name: 'Snippet', lua: code.lua }], doc)
        break

      case 'WEAKAURA':
      case 'CLASSIC-WEAKAURA':
      case 'TBC-WEAKAURA':
      case 'WOTLK-WEAKAURA':
      case 'CATA-WEAKAURA':
      case 'PLATER':
        const json = JSON.parse(code.json)

        doc.domain = 0

        code.customCode = await CodeReview(getCode(json, doc.type), doc)
        let tableMetrics = TableReview(json)
        tableMetrics.dependencies = [...tableMetrics.dependencies]
        code.tableMetrics = tableMetrics
        break
    }
  }
  catch (e) {
    console.error(data, e)
    err = true
  }
  if (err) throw 'Code Processing Error'

  doc.blocked = false
  if (code.version > 1) {
    await WagoCode.updateMany({ auraID: doc._id, _id: { $ne: code._id } }, { $set: { isLatestVersion: false } })
  }
  code.isLatestVersion = true

  if (code.customCode && code.customCode.length) {
    doc.hasCustomCode = true
    code.customCode.forEach(c => {
      if (c.luacheck && c.luacheck.match(commonRegex.WeakAuraBlacklist)) {
        doc.blocked = true
      }
    })
  }

  doc.categories = [...new Set(doc.categories)]
  doc.codeProcessVersion = codeProcessVersion

  await WagoItem.findOneAndUpdate({_id: doc._id}, {$set: doc})
  await WagoCode.findOneAndUpdate({auraID: code.auraID, version: code.version}, {$set: code})

  if (doc._userId && !doc.deleted && !doc.expires_at) {
    const d = await doc.indexedImportData
    if (d) {
      elastic.addDoc('imports', d)
    }
  }

  cloudflare.zones.purgeCache(config.cloudflare.zoneID, {
    files: [
      { url: `https://data.wago.io/api/raw/encoded?id=${doc._id}` },
      { url: `https://data.wago.io/api/raw/encoded?id=${doc.slug}` },
      { url: `https://data.wago.io/api/raw/encoded?id=${doc._id}&version=${code.versionString}` },
      { url: `https://data.wago.io/api/raw/encoded?id=${doc.slug}&version=${code.versionString}` },
      { url: `https://data.wago.io/lookup/wago/code?id=${doc._id}&version=${code.versionString}`, headers: { Origin: 'https://wago.io' } },
      { url: `https://data.wago.io/lookup/wago/code?id=${doc.slug}&version=${code.versionString}`, headers: { Origin: 'https://wago.io' } },
      { url: `https://data.wago.io/lookup/wago/code?id=${doc._id}&version=${code.versionString}-${doc.latestVersion.iteration}`, headers: { Origin: 'https://wago.io' } },
      { url: `https://data.wago.io/lookup/wago/code?id=${doc.slug}&version=${code.versionString}-${doc.latestVersion.iteration}`, headers: { Origin: 'https://wago.io' } },
    ]
  })
  await redis.clear(doc)

  if (code.customCode.length) {
    return doc
  }
  return null
}

async function ProcessAllCode() {
  // return
  var cursor = WagoItem.find({
    deleted: false,
    _userId: { $exists: true },
    type: {$regex: /WEAKAURA/}, $or: [
        {$and: [{tocversion: {$lt: 40400}}, {tocversion: {$gt: 40000}}]},
        {$and: [{tocversion: {$lt: 30400}}, {tocversion: {$gt: 30000}}]},
        {$and: [{tocversion: {$lt: 20501}}, {tocversion: {$gt: 20000}}]},
    ]
  }).cursor({ batchSize: 50 })

  let count = 0
  for await (const doc of cursor) {
    count++
    if (doc.deleted) {
      await elastic.removeDoc('imports', doc._id)
    }
    else {
      await taskQueue.add('ProcessCode', { id: doc._id })

      if (count % 1000 == 0) {
        console.log('process code', count)
      }
    }
  }
}

function sortJSON(obj) {
  // if a regular array then its already sorted but still sort any child objects
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] == 'object') {
        obj[i] = sortJSON(obj[i])
      }
    }
    return obj
  }

  // sort object as expected
  var sorted = {}
  var keys
  keys = Object.keys(obj)
  keys.sort(function (key1, key2) {
    if (key1 < key2) return -1
    if (key1 > key2) return 1
    return 0
  })

  for (var i in keys) {
    var key = keys[i]
    if (obj[key] && typeof obj[key] == 'object') {
      sorted[key] = sortJSON(obj[key])
    } else {
      sorted[key] = obj[key]
    }
  }

  return sorted
}

async function updateWAData(release, assets) {
  const addonDir = path.resolve(__dirname, '../lua', 'addons', 'WeakAuras', release.version)
  await mkdirp(addonDir)
  const zipFile = path.resolve(addonDir, 'WeakAuras.zip')
  const writer = require('fs').createWriteStream(zipFile)

  var axiosDownload = { method: 'GET', responseType: 'stream' }
  for (let i = 0; i < assets.length; i++) {
    if (assets[i].name.match(/WeakAuras-[\d.]+\.zip/)) {
      axiosDownload.url = assets[i].browser_download_url
      break
    }
  }
  if (!axiosDownload.url) {
    logError(e, 'Unable to find WeakAura download')
    return false
  }

  const response = await axios(axiosDownload)
  response.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  await decompress(zipFile, addonDir)
  const waLua = await fs.readFile(addonDir + '/WeakAuras/WeakAuras.lua', 'utf8')
  const versionMatch = waLua.match(/internalVersion\s?=\s?(\d+)/)
  if (versionMatch && versionMatch[1]) {
    const internalVersion = parseInt(versionMatch[1])
    if (internalVersion) {
      redis.set('static:weakAuraInternalVersion', internalVersion)
      return
    }
  }
  // if we get here then internalVersion is not found or is not an integer
  logError(e, 'Unable to find WeakAura internalVersion')
}

async function UpdateGameVersions() {
  const { data } = await axios.get(`https://wago.tools/api/builds`)
  GameVersions
}

// async function updateMDTData(release, assets) {
//   if (!assets.zipball_url) {
//     logError('Unable to find MDT download', assets)
//     return false
//   }
//   const addonDir = path.resolve(__dirname, '../lua', 'addons', 'MDT', release.version)
//   await mkdirp(addonDir)
//   const zipFile = path.resolve(addonDir, 'MDT.zip')
//   const writer = require('fs').createWriteStream(zipFile)
//   var axiosDownload = { method: 'GET', responseType: 'stream', url: assets.zipball_url }

//   const response = await axios(axiosDownload)
//   response.data.pipe(writer)
//   await new Promise((resolve, reject) => {
//     writer.on('finish', resolve)
//     writer.on('error', reject)
//   })
//   await decompress(zipFile, addonDir)
//   // get commit directory
//   const commit = await fs.readdir(addonDir)
//   var mdtData = await lua.BuildMDT_DungeonTable(`${addonDir}/${commit[1]}`)
//   mdtData = JSON.parse(mdtData)

//   // calculate dimensions
//   mdtData.dungeonDimensions = []
//   mdtData.dungeonEnemies.forEach((enemies, mapID) => {
//     // console.log(mapID)
//     mdtData.dungeonDimensions.push({ maxX: -9999999, minX: 9999999, maxY: -9999999, minY: 9999999 })
//     if (!enemies) return
//     enemies.forEach((creature) => {
//       if (!creature || !creature.clones) return
//       creature.clones.forEach((clone) => {
//         if (!clone) {
//           return
//         }
//         mdtData.dungeonDimensions[mapID].maxX = Math.max(mdtData.dungeonDimensions[mapID].maxX, clone.x)
//         mdtData.dungeonDimensions[mapID].minX = Math.min(mdtData.dungeonDimensions[mapID].minX, clone.x)
//         mdtData.dungeonDimensions[mapID].maxY = Math.max(mdtData.dungeonDimensions[mapID].maxY, clone.y)
//         mdtData.dungeonDimensions[mapID].minY = Math.min(mdtData.dungeonDimensions[mapID].minY, clone.y)
//       })
//     })
//   })

//   // save core data plus for each dungeon
//   // await SiteData.findByIdAndUpdate('mdtDungeonTable', { value: mdtData }, { upsert: true }).exec()
//   // await SiteData.findByIdAndUpdate('mdtAffixWeeks', { value: mdtData.affixWeeks }, { upsert: true }).exec()
//   // await cloudflare.zones.purgeCache(config.cloudflare.zoneID, { files: ['https://data.wago.io/data/mdtDungeonTable', 'https://data.wago.io/data/mdtAffixWeeks'] })
//   for (let mapID = 0; mapID < mdtData.dungeonEnemies.length; mapID++) {
//     let Obj = {
//       affixWeeks: mdtData.affixWeeks,
//       dungeonEnemies: mdtData.dungeonEnemies[mapID],
//       enemyHash: md5(JSON.stringify(mdtData.dungeonEnemies[mapID])),
//       mapPOIs: mdtData.mapPOIs[mapID],
//       mapInfo: mdtData.mapInfo[mapID],
//       dungeonTotalCount: mdtData.dungeonTotalCount[mapID],
//       scaleMultiplier: mdtData.scaleMultiplier[mapID],
//       dungeonSubLevels: mdtData.dungeonSubLevels[mapID],
//       dungeonMaps: mdtData.dungeonMaps[mapID],
//       dungeonDimensions: mdtData.dungeonDimensions[mapID]
//     }
//     if (mapID === 15) {
//       Obj.freeholdCrews = mdtData.freeholdCrews
//     }
//     const currentHash = await SiteData.findById('mdtDungeonTable-' + mapID).exec()
//     await SiteData.findByIdAndUpdate('mdtDungeonTable-' + mapID, { value: Obj }, { upsert: true }).exec()
//     await cloudflare.zones.purgeCache(config.cloudflare.zoneID, { files: ['https://data.wago.io/data/mdtDungeonTable-' + mapID] })

//     // currentHash.value.enemyHash = null // force regenerate
//     // if new portrait maps are required
//     if ((!currentHash || currentHash.value.enemyHash !== Obj.enemyHash) && Obj.dungeonMaps && Obj.dungeonEnemies && Obj.dungeonEnemies.length) {
//       try {
//         console.log('make portrait map', mapID)
//         for (let subMapID = 1; subMapID <= Object.keys(Obj.dungeonMaps).length; subMapID++) {
//           if (mapID === 18) {
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, false, 1)
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, false, 2)
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, true, 1)
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, true, 2)
//           }
//           else {
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, false)
//             await buildStaticMDTPortraits(Obj, mapID, subMapID, true)
//           }
//           break
//         }
//         logger({ e_c: 'Generate MDT portrait maps', e_a: Obj.dungeonMaps['0'], e_n: Obj.dungeonMaps['0'] })
//       }
//       catch (e) {
//         logError(e, 'Generating MDT portrait maps ' + Obj.dungeonMaps['0'])
//       }
//     }
//   }

//   return
// }

async function buildStaticMDTPortraits(json, mapID, teeming, faction) {
  // this is very finicky so only run it locally to generate the images
  if (config.env !== 'development') {
    return
  }
  const puppeteer = require('puppeteer')
  if (teeming) teeming = '-Teeming'
  else teeming = ''

  let imgName = `portraitMap-${json.slug}${teeming}`

  if (faction) {
    imgName = imgName + '-Faction' + faction
  }
  console.log('make map for', imgName)

  const html =`<!DOCTYPE html>
  <html>
  <head>
    <script src="https://unpkg.com/konva@2.4.2/konva.min.js"></script>
    <meta charset="utf-8">
    <title>Konva Circle Demo</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        overflow: hidden;
        background-color: #F0F0F0;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script>
      const multiplier = 5
      const spriteSize = 138

      const stage = new Konva.Stage({
        container: 'container',
        width: 1024 * multiplier,
        height: 768 * multiplier
      });

      const layer = new Konva.Layer();
      const enemyPortraits = new Image()
      enemyPortraits.src = 'https://media.wago.io/mdt/portraits-${json.slug}.png'
      enemyPortraits.crossOrigin = 'Anonymous'
      enemyPortraits.onload = () => { console.log(enemyPortraits.src, 'loaded') 

      const scaleBase = 19/30
      const scaleBoss = scaleBase * 2
      const json = ${JSON.stringify(json)}

      function getEnemyPortraitOffset(numCreatures, creatureIndex, size) {
        let row = 0
        size = size || 36
        if (creatureIndex >= Math.ceil(numCreatures / 2)) {
          row++
        }
        return { x: ((creatureIndex) - (Math.ceil(numCreatures / 2) * row)) * size + size/2, y: row * size + size/2 }
      }

  json.dungeonEnemies.forEach((creature, i) => {
    if (!creature || !creature.clones) return

    creature.clones.forEach((clone, j) => {
      if (clone && (!clone.teeming || (clone.teeming && ${teeming ? 1 : 0})) && (!clone.faction || (clone.faction === faction))) {
            let radius = Math.round(5 * (creature.scale * (creature.isBoss ? 1.7 : 1) * (json.scaleMultiplier || 1))) * multiplier
            const circle = new Konva.Circle({
              x: clone.x * multiplier,
              y: -clone.y * multiplier,
              radius,
              fillPatternImage: enemyPortraits,
              fillPatternScale: { x: radius * 2 / spriteSize, y: radius * 2 / spriteSize },
              fillPatternOffset: getEnemyPortraitOffset(json.dungeonEnemies.length, i, 138),
              fillPatternRepeat: 'no-repeat',
              stroke: creature.isBoss ? 'gold' : 'black',
              strokeWidth: .5 * multiplier
            })

            // add the shape to the layer
            layer.add(circle)
      }
    })
    return
  })

      stage.add(layer);

      setTimeout(() => {
        var img = document.createElement('img')
        img.src = stage.toDataURL()
        img.id = 'img'
        document.body.appendChild(img)
        document.getElementById('container').remove()
        console.log('img created')
      }, 1000)
    }
    </script>
  </body>
  </html>`

  // await fs.writeFile('../tmp-mdt.html', html, 'utf8')
  console.log('launch puppeteer')
  const browser = await puppeteer.launch({
    args: [
      '--disable-web-security', // ignore cors errors
    ]
  })
  const page = await browser.newPage()
  await page.setCacheEnabled(false)
  await page.setContent(html)

  await page.waitForSelector('img', { timeout: 120000 })
  const base64 = await page.evaluate(() => {
    return document.getElementById('img').src
  })
  await browser.close()
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  if (buffer.length > 5000) {
  await image.saveMdtPortraitMap(buffer, imgName)
  }
  else {
    console.error('Could not create portrait map')
  }
  return
}



/*

  UpdateTwitchSubs: async (req) => {
    const users = await User.find({"roles.pro_subscriber": true, "twitch.refreshToken": {$exists: true}}).exec()
    users.forEach(async (user) => {
      try {
        var refresh = await axios.post('https://id.twitch.tv/oauth2/token', querystring.stringify({
          client_id: config.auth.twitch.clientID,
          client_secret: config.auth.twitch.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: user.twitch.refreshToken
        }), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        var validate = await axios.get('https://id.twitch.tv/oauth2/validate', {headers: {Authorization: 'OAuth ' + refresh.data.access_token }})
        if (validate.data.user_id === user.twitch.id) {
          user.twitch.refreshToken = refresh.data.refresh_token
          await user.save()
          var subs = await axios.get('https://api.twitch.tv/helix/subscriptions', {params: {broadcaster_id: user.twitch.id}, headers: {Authorization: 'Bearer ' + refresh.data.access_token }})
          if (subs.data.data) {
            var currentSubs = []
            subs.data.data.forEach(async (subscriber) => {
              var subUser = await User.findOne({"twitch.id": subscriber.user_id}).exec()
              if (subUser) {
                currentSubs.push(subUser._id)
                if (subUser.twitch.subscribedTo.indexOf(user.twitch.id) === -1) {
                  subUser.twitch.subscribedTo.push(user.twitch.id)
                  await subUser.save()
                }
              }
            })
            // remove old subs
            if (currentSubs.length) {
              var exSubs = await User.find({"twitch.subscribedTo": user.twitch.id, _id: {$nin: currentSubs}}).exec()
              exSubs.forEach(async (exSubscriber) => {
                var i = exSubscriber.twitch.subscribedTo.indexOf(user.twitch.id)
                exSubscriber.twitch.subscribedTo.splice(i, 1)
                await exSubscriber.save()
              })
            }
          }
        }
        else {
          // no longer allowing link between wago and twitch
          user.twitch.refreshToken = null
          await user.save()
        }
      }
      catch (e) {
        if (e.response && e.response.status === 401 && user) {
          user.twitch.refreshToken = null
          await user.save()
        }
        req.trackError(e, 'Cron: UpdateTwitchSubs')
      }
    })
  }
}
*/


/*
// TODO stats page

function generateStats(res) {
  const startDate = new Date(1463788800000) // May 21 2016
  async.series({
    WeakAuras: (done) => {
      Stats.findOne({name: 'Total WeakAuras'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "WEAKAURAS2", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total WeakAuras', date: dDate}, {name: 'Total WeakAuras', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    ElvUI: (done) => {
      Stats.findOne({name: 'Total ElvUI'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "ELVUI", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total ElvUI', date: dDate}, {name: 'Total ElvUI', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    MDT: (done) => {
      Stats.findOne({name: 'Total MDT Routes'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "MDT", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total MDT Routes', date: dDate}, {name: 'Total MDT Routes', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    TotalRP: (done) => {
      Stats.findOne({name: 'Total TotalRP'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "TOTALRP3", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total TotalRP', date: dDate}, {name: 'Total TotalRP', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    VuhDo: (done) => {
      Stats.findOne({name: 'Total VuhDo'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        while (date < today) {
          let dDate = new Date(date)
          WagoItem.count({type: "VUHDO", created: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((num) => {
            Stats.findOneAndUpdate({name: 'Total VuhDo', date: dDate}, {name: 'Total VuhDo', date: dDate, value: num}, {upsert: true}).exec()
          })
          date = date.nextWeek()
        }
        done()
      })
    },
    Companion: (done) => {
      let date = startDate
      let today = new Date
      while (date < today) {
        let dDate = new Date(date)
        WagoFavorites.distinct('appID', {type: 'Install', timestamp: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((IDs) => {
          var num = IDs.length
          Stats.findOneAndUpdate({name: 'WeakAura Companion Installs', date: dDate}, {name: 'WeakAura Companion Installs', date: dDate, value: num}, {upsert: true}).exec()
        })
        date = date.nextWeek()
      }
      done()
    },
    WACode: (done) => {
      Stats.findOne({name: 'WeakAura Region group'}).sort({date: -1}).then((stat) => {
        let date
        let today = new Date()
        if (!stat) {
          date = startDate
        }
        else if (stat.date.nextWeek() < today) {
          date = stat.date.nextWeek()
        }
        else {
          // up to date already
          return done()
        }
        async.whilst(
          () => {
            return date < today
          },
          (cb) => {
            let dDate = new Date(date)
            let countAuthorOptions = 0
            let countBuffTrigger2 = 0
            let countTriggers = 0
            let countTriggerCustomCode = 0
            let countTriggerCustomCodeEveryFrame = 0
            let countRegionTypes = {group:0, dynamicgroup:0, aurabar:0, icon:0, text:0, model:0, model:0, texture:0, progresstexture:0, stopmotion:0}
            WagoCode.find({updated: {"$gte": dDate, "$lt": dDate.nextWeek()}}).then((wa) => {
              async.forEach(wa, (code, next) => {
                // confirm import is a weakaura
                WagoItem.findOne({_id: code.auraID, type: 'WEAKAURA'}).then((aura) => {
                  if (aura) {
                    var json = JSON.parse(code.json)
                    if (!json.d) {
                      return next()
                    }
                    if (!json.c) {
                      json.c = [json.d]
                    }
                    else {
                      countRegionTypes[json.d.regionType]++
                    }
                    for (let i = 0; i < json.c.length; i++) {
                      if (!json.c[i]) continue
                      countRegionTypes[json.c[i].regionType]++

                      // author options feature
                      if (json.c[i].authorOptions && json.c[i].authorOptions.length) {
                        countAuthorOptions++
                      }
                      // bufftrigger2 feature
                      if (json.c[i].triggers && json.c[i].triggers['1']) {
                        countBuffTrigger2++
                      }
                      // count triggers with custom code
                      if (json.c[i].trigger) {
                        countTriggers++
                        if (json.c[i].trigger.type === 'custom' &&  json.c[i].trigger.custom) {
                          countTriggerCustomCode++
                          if (json.c[i].trigger.check === 'update') {
                            countTriggerCustomCodeEveryFrame++
                          }
                        }
                      }
                      if (json.c[i].additional_triggers && json.c[i].additional_triggers.length) {
                        for (let k = 0; k < json.c[i].additional_triggers.length; k++) {
                          countTriggers++
                          if (json.c[i].additional_triggers[k].type === 'custom' &&  json.c[i].additional_triggers[k].custom) {
                            countTriggerCustomCode++
                            if (json.c[i].trigger.check === 'update') {
                              countTriggerCustomCodeEveryFrame++
                            }
                          }
                        }
                      }
                      if (json.c[i].triggers) {
                        for (var k in json.c[i].triggers) {
                          if (parseInt(k) && json.c[i].triggers[k].trigger) {
                            countTriggers++
                            if (json.c[i].triggers[k].trigger.type === 'custom' &&  json.c[i].triggers[k].trigger.custom) {
                              countTriggerCustomCode++
                              if (json.c[i].triggers[k].trigger.check === 'update') {
                                countTriggerCustomCodeEveryFrame++
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  next()
                })
              }, () => {
                Stats.findOneAndUpdate({name: 'WeakAura Imports with Author Options Feature', date: dDate}, {name: 'WeakAura Imports with Author Options Feature', date: dDate, value: countAuthorOptions}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Imports with BuffTrigger2 Feature', date: dDate}, {name: 'WeakAura Imports with BuffTrigger2 Feature', date: dDate, value: countBuffTrigger2}, {upsert: true}).exec()
                // Stats.findOneAndUpdate({name: 'WeakAura Triggers', date: dDate}, {name: 'WeakAura Triggers', date: dDate, value: countTriggers}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Triggers with Custom Code', date: dDate}, {name: 'WeakAura Triggers with Custom Code', date: dDate, value: countTriggerCustomCode}, {upsert: true}).exec()
                Stats.findOneAndUpdate({name: 'WeakAura Triggers with Custom Code Updating Every Frame', date: dDate}, {name: 'WeakAura Triggers with Custom Code Updating Every Frame', date: dDate, value: countTriggerCustomCodeEveryFrame}, {upsert: true}).exec()
                Object.keys(countRegionTypes).forEach((region) => {
                  if (region && region !== 'undefined') {
                    console.log(region, countRegionTypes[region])
                    Stats.findOneAndUpdate({name: 'WeakAura Region ' + region, date: dDate}, {name: 'WeakAura Region ' + region, date: dDate, value: countRegionTypes[region]}, {upsert: true}).exec()
                  }
                })

                date = date.nextWeek()
                cb()
              })
            })
          }, () => {
            done()
          })
      })
    }
  }, () => {
    res.send({done: true})
  })
}

Date.prototype.nextWeek = function() {
  var date = new Date(this.valueOf())
  date.setDate(date.getDate() + 7)
  return date
}

*/
