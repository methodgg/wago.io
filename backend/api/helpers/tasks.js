const battlenet = require('./battlenet')
const cloudflare = require('cloudflare')({token: config.cloudflare.dnsToken})
const decompress = require('@atomic-reactor/decompress')
const image = require('./image')
const lua = require('./lua')
const md5 = require('md5')
const mkdirp = require('mkdirp')
const path = require('path')
const querystring = require('querystring')
const updateDataCaches = require('../../middlewares/updateLocalCache')
const Categories = require(__dirname + '/../../../frontend/src/components/libs/categories')
const detectCode = require(__dirname + '/../../../frontend/src/components/libs/detectCustomCode')
const luacheck = require('./luacheck')

const logger = require('../../middlewares/matomo')
const logError = require('../../middlewares/matomoErrors')


module.exports = async (task, data) => {
  try {
    switch (task) {
      case 'UpdatePatreonAccounts':
        return await UpdatePatreonAccounts()

      case 'UpdateWeeklyMDT':
        return await UpdateWeeklyMDT()

      case 'ComputeViewsThisWeek':
        return await ComputeViewsThisWeek()

      case 'DiscordMessage':
        return await DiscordMessage(data)

      case 'UpdateValidCharacters':
        return await UpdateValidCharacters()

      case 'UpdateGuildMembership':
        return await UpdateGuildMembership()

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

      default:
        throw {name: 'Unknown task', message: 'Unknown task ' + task}
    }
  }
  catch (e) {
    console.log(e)
    logError(e, 'Task ', task)
  }
}

async function UpdateWagoOfTheMoment () {
  const data = await WagoItem.randomOfTheMoment()
  await SiteData.findOneAndUpdate({_id: 'WagoOfTheMoment'}, {value: data}, {upsert: true}).exec()
  await updateDataCaches.queue('WagoOfTheMoment')
}

async function UpdateActiveUserCount () {
  var activeUsers = 0
  const scanStreamUsers = redis2.scanStream({
    match: 'rate:wago:*'
    })
  scanStreamUsers.on('data', (data) => {
    activeUsers = activeUsers + data.length
  })
  scanStreamUsers.on('end', () => {
    redis.set('tally:active:users', activeUsers)
    })
  const cfg = await SiteData.get('EmbeddedStream')
  var streams = cfg.streams
  for (let i = 0; i < streams.length; i++) {
    streams[i].count = 0
  const scanStreamEmbed = redis2.scanStream({
      match: `stream:${streams[i].channel}:*`
  })
  scanStreamEmbed.on('data', (data) => {
      streams[i].count = streams[i].count + data.length
  })
  scanStreamEmbed.on('end', () => {
      redis.set('tally:active:embed:' + streams[i].channel, streams[i].count)
  })
}
}

async function UpdateTwitchStatus (channel) {
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
    const cfg = await SiteData.get('EmbeddedStream')
    streams = cfg.streams
  }
  for (let i = 0; i < streams.length; i++) {
    let channel = streams[i].channel
  const req = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${channel}`, {
    headers: {
      'client-id': config.auth.twitch.clientID,
      'Authorization': 'Bearer '+ twitchToken
    }
  })
    await redis.set(`twitch:${channel}:live`, (req.data.data.length > 0))
    status[channel] = (req.data.data.length > 0)
  }
  return status
}

async function UpdateLatestNews () {
  const docs = await Blog.find({publishStatus: 'publish'}).sort('-date').limit(1).populate('_userId')
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
  await SiteData.findOneAndUpdate({_id: 'LatestNews'}, {value: news}, {upsert: true}).exec()
  await updateDataCaches.queue('LatestNews')
}

async function UpdatePatreonAccounts () {
  nextURL = 'https://www.patreon.com/api/oauth2/v2/campaigns/562591/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title'
  while (nextURL) {
    var response = await axios.get(nextURL, {headers: {Authorization: 'Bearer '+  config.auth.patreon.creatorToken}})
    var patrons = response.data.data
    for (let i = 0; i < patrons.length; i++) {
      if (!patrons[i] || !patrons[i].relationships || !patrons[i].relationships.user || !patrons[i].relationships.user.data || !patrons[i].relationships.user.data.id) {
        continue
      }
      var user = await User.findOne({"patreon.id": patrons[i].relationships.user.data.id})
      if (!user) {
        continue
      }
      var tier
      try {
        tier = patrons[i].relationships.currently_entitled_tiers.data[0].id
      }
      catch (e) {
        tier = 0
      }
      // subscriber 1385924
      // gold sub 1386010
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

async function UpdateWeeklyMDT () {
  await battlenet.updateMDTWeeks()
}

async function UpdateTopLists () {
  var data = []
  // favorites
  var imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorites All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite WeakAuras All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite Classic WeakAuras All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'MDT', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite MDT All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite Plater All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite Total RP All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite VuhDo All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
  data.push({title: 'Favorite ElvUI All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }), lastOfSection: true })
  
  // popular
  imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular WeakAuras This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular Classic WeakAuras This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'MDT', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular MDT This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular Plater This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular Total RP This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular VuhDo This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
  data.push({title: 'Popular ElvUI This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }), lastOfSection: true })

  // installed
  imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
  data.push({title: 'Installed', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
  data.push({title: 'Installed WeakAuras', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false, encrypted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
  data.push({title: 'Installed Classic WeakAuras', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }), lastOfSection: true })

  // new and updated imports
  imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, encrypted: false, $where: "this.created.getTime() != this.modified.getTime()"}).sort({"modified": -1}).select('_id name modified').limit(15).exec()
  data.push({title: 'Recently Updated', imports: imports.map(x => { return {date: true, display: x.modified, name: x.name, slug: x.slug} }) })
  imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, encrypted: false, $where: "this.created.getTime() == this.modified.getTime()"}).sort({"created": -1}).select('_id name created').limit(15).exec()
  data.push({title: 'Newest Imports', imports: imports.map(x => { return {date: true, display: x.created, name: x.name, slug: x.slug} }) })

  // save data
  await SiteData.findOneAndUpdate({_id: 'TopLists'}, {value: data}, {upsert: true}).exec()
  await updateDataCaches.queue('TopLists')
}

async function DiscordMessage (data) {
  if (global.discordBot) {
    const author = await User.findById(data.author)
    const wago = await WagoItem.lookup(data.wago)
    if (data.type === 'comment') {
      const sendTo = await User.findOne({_id: data.to, "discord.options.messageOnComment": true}).select('discord').exec()
      if (sendTo && !author._id.equals(sendTo._id)) {
        discordBot.postComment(author, sendTo, wago, data.message)
      }
    }
    else if (data.type === 'update') {
      const stars = await WagoFavorites.find({type: 'Star', wagoID: wago._id})
      for (let i = 0; i < stars.length; i++) {
        const sendTo = await User.findOne({_id: stars[i].userID, "discord.options.messageOnFaveUpdate": true}).select('discord').exec()
        if (sendTo && !author._id.equals(sendTo._id)) {
          discordBot.postUpdate(author, sendTo, wago)
        }
      }
    }
  }
}

async function UpdateValidCharacters () {
  const fourWeeksAgo = new Date()
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
  const users = await User.find({"battlenet.characters.1": {$exists: true}, $or: [{"battlenet.updateDate": {$exists: false}}, {"battlenet.updateDate": {$lt: fourWeeksAgo}}]}).limit(50).exec()
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

async function UpdateGuildMembership () {
  function guildRankSort(a, b) {
    if (a.rank > b.rank) return -1
    else if (a.rank < b.rank) return 1
    return 0
  }
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  var guildsChecked = []
  const users = await User.find({"battlenet.guilds.1": {$exists: true}, $or: [{"roles.gold_subscriber": true}, {"roles.pro_subscriber": true}, {"roles.ambassador": true}, {"roles.developer": true}, {"roles.community_leader": true}, {"roles.artContestWinnerAug2018": true}]}).exec()
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
      let exGuild = await User.find({"battlenet.guilds": guildKey}).exec()
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
        let memberUser = await User.findOne({"battlenet.characters.region": region, "battlenet.characters.name": guild.members[j].character.name})
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
      let exGuild = await User.find({"battlenet.guilds": guildKey, _id: {$nin: accountIdsInGuild}}).exec()
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

async function ComputeViewsThisWeek ()  {
  const viewedDocs = await ViewsThisWeek.aggregate([{$group: { _id: '$wagoID', views: { $sum: 1 }}}]).exec()
  await updateViewsThisWeek(viewedDocs)
}

async function updateViewsThisWeek(docs) {
  if (docs.length > 0) {
    // process in batches of 500
    var items = docs.splice(0, 500)
    var ops = []
    items.forEach((wago) => {
      ops.push({
        updateOne: {
          filter: {_id: wago._id},
          update: {'popularity.viewsThisWeek': wago.views}
        }
      })
    })
    await WagoItem.bulkWrite(ops)
    return await updateViewsThisWeek(docs)
  }
}

async function UpdateLatestAddonReleases () {
  const addons = [
    {name: 'WeakAuras-2', host: 'github', url: 'https://api.github.com/repos/weakAuras/WeakAuras2/releases'},
    {name: 'VuhDo', host: 'gitlab', url: 'https://gitlab.vuhdo.io/api/v4/projects/13/releases'},
    {name: 'ElvUI', host: 'tukui', url: 'https://www.tukui.org/api.php?ui=elvui'},
    {name: 'MDT', host: 'github', url: 'https://api.github.com/repos/Nnoggie/MythicDungeonTools/releases'},
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
          const preExisting = await AddonRelease.findOneAndUpdate({addon: release.addon, phase: release.phase, version: release.version}, release, {upsert: true, new: false}).exec()
          if (!preExisting) {
            madeUpdate = true
            await AddonRelease.updateMany({addon: release.addon, version: {$ne: release.version}}, {$set: {active: false}}).exec()

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
        const preExisting = await AddonRelease.findOneAndUpdate({addon: release.addon, phase: release.phase, version: release.version}, release, {upsert: true, new: false}).exec()
        if (!preExisting) {
          madeUpdate = true
          await AddonRelease.updateMany({addon: release.addon, version: {$ne: release.version}}, {$set: {active: false}}).exec()
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
        const preExisting = await AddonRelease.findOneAndUpdate({addon: release.addon, phase: release.phase, version: release.version, classicVersion: release.classicVersion}, release, {upsert: true, new: false}).exec()
        if (!preExisting) {
          // if a new release then de-activate the previous version(s)
          madeUpdate = true
          await AddonRelease.updateMany({addon: release.addon, phase: release.phase, version: {$ne: release.version}}, {$set: {active: false}}).exec()
        }
      }
    }
    catch (e) {
      console.log(e)
      throw 'Error fetching addon ' + addon.name
    }
  }
  if (madeUpdate) {
    const Latest = await AddonRelease.find({active: true})
    await SiteData.set('LatestAddons', Latest)  
    await updateDataCaches.queue('LatestAddons')
  }
}

async function SyncElastic(table) {
  var syncStream
  return await new Promise((done, reject) => {
    switch (table){
      case 'WagoItem':
        syncStream = WagoItem.synchronize()
        break
  
      case 'User':
        syncStream = User.synchronize()
        break

      default:
        return done()
    }
  
    syncStream.on('error', function(err){
      logError(err, 'Elastic Sync Error ' + table)
      reject(err)
    })
    syncStream.on('close', function() {
      logger({e_a: 'Elastic Sync Complete', e_c: table, e_n: table})
      done()
    })
  })
}

const processVersions = {
  PLATER: 2,
  SNIPPET: 2,
  WEAKAURA: 2
}
const encodeDecodeAddons = require('fs').readdirSync('./api/helpers/encode-decode')
async function ProcessCode(data) {
  var doc = await WagoItem.lookup(data.id)
  var code = await WagoCode.lookup(data.id, data.version)
  if (!doc || !code) {
    return
  }
  if (!data.id) return

  if (data.addon && Addons[data.addon]) {
    const addon = Addons[data.addon]
    if (addon && addon.addWagoData) {
      let data = addon.addWagoData(code, doc)
      if (data && data.code) {
        code = data.code
        code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
      }
      if (data && data.wago) {
        doc = data.wago
      }
    }
  }
  else if (doc.type) {
    // match addon by type
    for (const addon of Object.values(Addons)) {
      if (doc.type.match(addon.typeMatch)) {
        let data = addon.addWagoData(code, doc)
        if (data && data.code) {
          code = data.code
          code.encoded = await addon.encode(code.json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        }
        if (data && data.wago) {
          doc = data.wago
        }
      }
    }    
  }

  switch (doc.type) {
    case 'SNIPPET':
      code.luacheck = JSON.stringify(await luacheck.run([{id: 'Lua', name: 'Snippet', lua: code.lua}]))
      code.processVersion = processVersions.SNIPPET
    break

    case 'WEAKAURA':
    case 'CLASSIC-WEAKAURA':
      var json = JSON.parse(code.json)
      var customCode = detectCode.WeakAura(json)      
      code.luacheck = JSON.stringify(await luacheck.run(customCode, doc.game))
      code.processVersion = processVersions.WEAKAURA
    break

    case 'PLATER':
      var json = JSON.parse(code.json)
      // check for any missing data
      if (Array.isArray(json)) {
        var tbl = {}
        json.forEach((v, k) => {
          tbl[''+(k+1)] = v
        })
        json = tbl
      }
      json.url = doc.url + '/' + code.version
      json.version = code.version
      json.semver = code.versionString
        
      json = sortJSON(json) // sort by key so that we can diff the full table
      code.json = JSON.stringify(json)
      var encoded = await lua.JSON2Plater(json)
      if (encoded) {
        code.encoded = encoded
      }
      
      var customCode = detectCode.Plater(json)   
      code.luacheck = JSON.stringify(await luacheck.run(customCode))
      code.processVersion = processVersions.PLATER
    break
  }
  if (code.luacheck && code.luacheck.match(commonRegex.WeakAuraBlacklist)) {
    doc.blocked = true
  }
  else if (code.blocked) {
    doc.blocked = false
  }
    await doc.save()
  await code.save()
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
  keys.sort(function(key1, key2) {
    if(key1 < key2) return -1
    if(key1 > key2) return 1
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

async function updateWAData (release, assets) {
  const addonDir = path.resolve(__dirname, '../lua', 'addons' ,'WeakAuras', release.version)
  await mkdirp(addonDir)
  const zipFile = path.resolve(addonDir, 'WeakAuras.zip')
  const writer = require('fs').createWriteStream(zipFile)

  var axiosDownload = {method: 'GET', responseType: 'stream'}
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
      SiteData.set('weakAuraInternalVersion', internalVersion)
      return
    }
  }
  // if we get here then internalVersion is not found or is not an integer
  logError(e, 'Unable to find WeakAura internalVersion')
}

async function updateMDTData (release, assets) {
  if (!assets.zipball_url) {
    logError('Unable to find MDT download', assets)
    return false
  }
  const addonDir = path.resolve(__dirname, '../lua', 'addons' ,'MDT', release.version)
  await mkdirp(addonDir)
  const zipFile = path.resolve(addonDir, 'MDT.zip')
  const writer = require('fs').createWriteStream(zipFile)
  var axiosDownload = {method: 'GET', responseType: 'stream', url: assets.zipball_url}

  const response = await axios(axiosDownload)
  response.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  await decompress(zipFile, addonDir)
  // get commit directory
  const commit = await fs.readdir(addonDir)
  var mdtData = await lua.BuildMDT_DungeonTable(`${addonDir}/${commit[1]}`)
  mdtData = JSON.parse(mdtData)

  // calculate dimensions
  mdtData.dungeonDimensions = []
  mdtData.dungeonEnemies.forEach((enemies, mapID) => {
    // console.log(mapID)
    mdtData.dungeonDimensions.push({maxX: -9999999, minX: 9999999, maxY: -9999999, minY: 9999999})
    if (!enemies) return
    enemies.forEach((creature) => {
      if (!creature || !creature.clones) return
      creature.clones.forEach((clone) => {
        if (!clone) {
          return
        }
        mdtData.dungeonDimensions[mapID].maxX = Math.max(mdtData.dungeonDimensions[mapID].maxX, clone.x)
        mdtData.dungeonDimensions[mapID].minX = Math.min(mdtData.dungeonDimensions[mapID].minX, clone.x)
        mdtData.dungeonDimensions[mapID].maxY = Math.max(mdtData.dungeonDimensions[mapID].maxY, clone.y)
        mdtData.dungeonDimensions[mapID].minY = Math.min(mdtData.dungeonDimensions[mapID].minY, clone.y)
      })
    })
  })

  // save core data plus for each dungeon
  await SiteData.findByIdAndUpdate('mdtDungeonTable', {value: mdtData}, {upsert: true}).exec()
  await SiteData.findByIdAndUpdate('mdtAffixWeeks', {value: mdtData.affixWeeks}, {upsert: true}).exec()
  await cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable', 'https://data.wago.io/data/mdtAffixWeeks']})
  for (let mapID = 0; mapID < mdtData.dungeonEnemies.length; mapID++) {
    let Obj = {
      affixWeeks: mdtData.affixWeeks,
      dungeonEnemies: mdtData.dungeonEnemies[mapID],
      enemyHash: md5(JSON.stringify(mdtData.dungeonEnemies[mapID])),
      mapPOIs: mdtData.mapPOIs[mapID],
      mapInfo: mdtData.mapInfo[mapID],
      dungeonTotalCount: mdtData.dungeonTotalCount[mapID],
      scaleMultiplier: mdtData.scaleMultiplier[mapID],
      dungeonSubLevels: mdtData.dungeonSubLevels[mapID],
      dungeonMaps: mdtData.dungeonMaps[mapID],
      dungeonDimensions: mdtData.dungeonDimensions[mapID]
    }
    if (mapID === 15) {
      Obj.freeholdCrews = mdtData.freeholdCrews
    }
    const currentHash = await SiteData.findById('mdtDungeonTable-' + mapID).exec()
    await SiteData.findByIdAndUpdate('mdtDungeonTable-' + mapID, {value: Obj}, {upsert: true}).exec()
    await cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable-' + mapID]})

    // currentHash.value.enemyHash = null // force regenerate
    // if new portrait maps are required
    if ((!currentHash || currentHash.value.enemyHash !== Obj.enemyHash) && Obj.dungeonMaps && Obj.dungeonEnemies && Obj.dungeonEnemies.length) {
      try {
        console.log('make portrait map', mapID)
        for (let subMapID = 1; subMapID <= Object.keys(Obj.dungeonMaps).length; subMapID++) {
          if (mapID === 18) {
            await buildStaticMDTPortraits(Obj, mapID, subMapID, false, 1)
            await buildStaticMDTPortraits(Obj, mapID, subMapID, false, 2)
            await buildStaticMDTPortraits(Obj, mapID, subMapID, true, 1)
            await buildStaticMDTPortraits(Obj, mapID, subMapID, true, 2)
          }
          else {
            await buildStaticMDTPortraits(Obj, mapID, subMapID, false)
            await buildStaticMDTPortraits(Obj, mapID, subMapID, true)
          }
          break
        }
        logger({e_c: 'Generate MDT portrait maps', e_a: Obj.dungeonMaps['0'], e_n: Obj.dungeonMaps['0']})
      }
      catch (e) {
        logError(e, 'Generating MDT portrait maps ' + Obj.dungeonMaps['0'])
      }
    }
  }

  return
}

async function buildStaticMDTPortraits(json, mapID, subMapID, teeming, faction) {
  // this is very finicky so only run it locally to generate the images
  if (config.env !== 'development') {
  return
  }
  const puppeteer = require('puppeteer-firefox')
  const mdtScale = 539 / 450
  if (teeming) teeming = '-Teeming'
  else teeming = ''

  var imgName = `portraitMap-${mapID}-${subMapID}${teeming}`

  if (faction) {
    imgName = imgName + '-Faction' + faction
  }
  console.log('make map for', json.dungeonMaps["0"], imgName)

  var html = `<!DOCTYPE html>
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
      var multiplier = 5

      var stage = new Konva.Stage({
        container: 'container',
        width: 1024 * multiplier,
        height: 768 * multiplier
      });

      var layer = new Konva.Layer();
      var enemyPortraits = new Image()
      enemyPortraits.src = 'https://wago.io/mdt/portraits-${mapID}.png?'
      enemyPortraits.crossOrigin = 'Anonymous'
      enemyPortraits.onload = () => { console.log(enemyPortraits.src, 'loaded') `
      
      json.dungeonEnemies.forEach((creature, i) => {
        if (!creature || !creature.clones) return

        creature.clones.forEach((clone, j) => {
          if (clone && (!clone.sublevel || clone.sublevel === subMapID) && (!clone.teeming || (clone.teeming && teeming)) && (!clone.faction || (clone.faction === faction))) {
            html = html + `
            var circle${i}_${j} = new Konva.Circle({
              x: ${clone.x * mdtScale} * multiplier,
              y: ${clone.y * -mdtScale} * multiplier,
              radius: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1) * (json.scaleMultiplier || 1)) / mdtScale} * multiplier,
              fillPatternX: ${(-Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1))) / mdtScale} * multiplier,
              fillPatternY: ${(-Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1))) / mdtScale} * multiplier,
              fillPatternImage: enemyPortraits,
              fillPatternOffset: ${getEnemyPortraitOffset(json.dungeonEnemies.length, i, 115)},
              fillPatternRepeat: 'no-repeat',
              fillPatternScaleX: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64} * multiplier,
              fillPatternScaleY: ${Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64} * multiplier,
              stroke: '${creature.isBoss ? 'gold' : 'black'}',
              strokeWidth: .5 * multiplier
            })

            // add the shape to the layer
            layer.add(circle${i}_${j});`
          }
        })
        return
      })

      html = html + `
      stage.add(layer);

      setTimeout(() => {
        var img = document.createElement('img')
        img.src = stage.toDataURL()
        img.id = 'img'
        document.body.appendChild(img)
        document.getElementById('container').remove()
      }, 1000)
    }
    </script>
  </body>
  </html>`

  // await fs.writeFile('../test.html', html, 'utf8')
  console.log('launch puppeteer')
  const browser = await puppeteer.launch({args: [
    '--disable-web-security', // ignore cors errors
  ]})
  const page = await browser.newPage()
  await page.setCacheEnabled(false)
  await page.setContent(html)
  
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  await page.waitForSelector('img', {timeout: 120000})
  const base64 = await page.evaluate(() => {
    return document.getElementById('img').src
  })
  await browser.close()
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  await image.saveMdtPortraitMap(buffer, imgName)
  return
}

function getEnemyPortraitOffset (numCreatures, creatureIndex, size) {
  var row = 0
  size = size || 36
  if (creatureIndex >= Math.ceil(numCreatures / 2)) {
    row++
  }
  var o = {x: ((creatureIndex) - (Math.ceil(numCreatures / 2) * row)) * size, y: row * size}
  return `{x: ${o.x}, y: ${o.y}}`
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
