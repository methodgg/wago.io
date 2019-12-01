const battlenet = require('./battlenet')
const cloudflare = require('cloudflare')({email: config.cloudflare.email, key: config.cloudflare.apiKey})
const cheerio = require('cheerio')
const decompress = require('decompress')
const image = require('./image')
const lua = require('./lua')
const md5 = require('md5')
const moment = require('moment')
const mkdirp = require('mkdirp-promise')
const path = require('path')
const puppeteer = require('puppeteer')
const querystring = require('querystring')

module.exports = {
  UpdateWagoOfTheMoment: async (req) => {
    try {
      const data = await WagoItem.randomOfTheMoment()
      await SiteData.findOneAndUpdate({_id: 'WagoOfTheMoment'}, {value: data}, {upsert: true}).exec()
      return data
    }
    catch (e) {
      req.trackError(e, 'Cron: UpdateWagoOfTheMoment')
    }
  },

  UpdateTopLists: async (req) => {
    try {
      var data = []
      // favorites
      var imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorites All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'WEAKAURAS2', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite WeakAuras All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite Classic WeakAuras All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'MDT', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite MDT All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite Plater All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite Total RP All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite VuhDo All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.favorite_count").select('_id name popularity.favorite_count').limit(15).exec()
      data.push({title: 'Favorite ElvUI All Time', imports: imports.map(x => { return {count: x.popularity.favorite_count, display: '[-count-] star', name: x.name, slug: x.slug} }), lastOfSection: true })
      
      // popular
      imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'WEAKAURAS2', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular WeakAuras This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular Classic WeakAuras This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'MDT', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular MDT This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'PLATER', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular Plater This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'TOTALRP3', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular Total RP This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'VUHDO', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular VuhDo This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'ELVUI', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.viewsThisWeek").select('_id name popularity.viewsThisWeek').limit(15).exec()
      data.push({title: 'Popular ElvUI This Week', imports: imports.map(x => { return {count: x.popularity.viewsThisWeek, display: '[-count-] view', name: x.name, slug: x.slug} }), lastOfSection: true })

      // installed
      imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
      data.push({title: 'Installed', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'WEAKAURAS2', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
      data.push({title: 'Installed WeakAuras', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({type: 'CLASSIC-WEAKAURA', deleted: false, hidden: false, private: false, restricted: false}).sort("-popularity.installed_count").select('_id name popularity.installed_count').limit(15).exec()
      data.push({title: 'Installed Classic WeakAuras', imports: imports.map(x => { return {count: x.popularity.installed_count, display: '[-count-] install', name: x.name, slug: x.slug} }), lastOfSection: true })

      // new and updated imports
      imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, $where: "this.created.getTime() != this.modified.getTime()"}).sort({"modified": -1}).select('_id name modified').limit(15).exec()
      data.push({title: 'Recently Updated', imports: imports.map(x => { return {date: true, display: x.modified, name: x.name, slug: x.slug} }) })
      imports = await WagoItem.find({deleted: false, hidden: false, private: false, restricted: false, $where: "this.created.getTime() == this.modified.getTime()"}).sort({"created": -1}).select('_id name created').limit(15).exec()
      data.push({title: 'Newest Imports', imports: imports.map(x => { return {date: true, display: x.created, name: x.name, slug: x.slug} }) })

      // save data
      await SiteData.findOneAndUpdate({_id: 'TopLists'}, {value: data}, {upsert: true}).exec()
      return true
    }
    catch (e) {
      req.trackError(e, 'Cron: UpdateTopLists')
    }
  },

  UpdateLatestAddonReleases: async (req) => {
    const addons = [
      {name: 'WeakAuras-2', host: 'github', url: 'https://api.github.com/repos/weakAuras/WeakAuras2/releases/latest'},
      {name: 'VuhDo', host: 'gitlab', url: 'https://gitlab.vuhdo.io/api/v4/projects/13/releases'},
      {name: 'ElvUI', host: 'tukui', url: 'https://www.tukui.org/download.php?ui=elvui'},
      {name: 'MDT', host: 'github', url: 'https://api.github.com/repos/Nnoggie/MethodDungeonTools/releases/latest'},
    ]
    addons.forEach(async (addon) => {
      var release = {}
      try {
        const response = await axios.get(addon.url)
        if (addon.host === 'github') {
          try {
            release.addon = addon.name
            release.active = true
            release.phase = 'Release'
            release.url = response.data.url
            release.version = response.data.name
            release.date = response.data.published_at
            const preExisting = await AddonRelease.findOneAndUpdate({addon: release.addon, phase: release.phase, version: release.version}, release, {upsert: true, new: false}).exec()
            if (!preExisting) {
              AddonRelease.updateMany({addon: release.addon, version: {$ne: release.version}}, {$set: {active: false}}).exec()

              if (release.addon === 'WeakAuras-2') {
                updateWAData(req, release, response.data.assets)
              }
              else if (release.addon === 'MDT') {
                updateMDTData(req, release, response.data)
              }
            }
          }
          catch (e) {
            req.trackError(e, 'Error fetching addon from GitHub API')
          }
        }
        else if (addon.host === 'gitlab') {
          try {
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
              AddonRelease.updateMany({addon: release.addon, version: {$ne: release.version}}, {$set: {active: false}}).exec()
            }
          }
          catch (e) {
            req.trackError(e, 'Error fetching addon from GitHub API')
          }
        }
        else if (addon.host === 'tukui') {
          const scrape = cheerio.load(response.data)
          try {
            var release = {}
            release.addon = addon.name
            release.active = true
            release.phase = 'Release'
            release.url = addon.url
            release.version = scrape('#version').children('.Premium').first().text()
            release.date = new Date(scrape('#version').children('.Premium').last().text())
            const preExisting = await AddonRelease.findOneAndUpdate({addon: release.addon, phase: release.phase, version: release.version}, release, {upsert: true, new: false}).exec()
            if (!preExisting) {
              // if a new release then de-activate the previous version(s)
              AddonRelease.updateMany({addon: release.addon, phase: release.phase, version: {$ne: release.version}}, {$set: {active: false}}).exec()
            }
          }
          catch (e) {
            req.trackError(e, 'Error parsing addon ' + addon.name)
          }
        }
      }
      catch (e) {
        req.trackError(e, 'Error fetching addon ' + addon.name)
      }
    })
    const Latest = await AddonRelease.find({active: true})
    await SiteData.set('LatestAddons', Latest)
    return true
  },

  ComputeViewsThisWeek: async (req) => {
    try {
      const viewedDocs = await ViewsThisWeek.aggregate([{$group: { _id: '$wagoID', views: { $sum: 1 }}}]).exec()
      await updateViewsThisWeek(viewedDocs)
      return true
    }
    catch (e) {
      req.trackError(e, 'Cron: ComputeViewsThisWeek')
    }
  },

  UpdateLatestNews: async (req) => {
    try {
      const docs = await Blog.find({publishStatus: 'publish'}).sort('-date').limit(2).populate('_userId')
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
      return true
    }
    catch (e) {
      req.trackError(e, 'Cron: UpdateLatestNews')
    }
  },

  UpdatePatreonAccounts: async (req, nextURL) => {
    try {
      const refreshToken = await SiteData.findById('PatreonRefreshToken').exec()
      if (!refreshToken || !refreshToken.value) {
        if (!refreshToken) {
          // add a placeholder if not existing at all
          await SiteData.findOneAndUpdate({_id: 'PatreonRefreshToken'}, {value: null, private: true}, {upsert: true}).exec()
        }
        throw {name: 'MissingData', stack: 'Missing required Patreon Refresh Token', message: 'Missing required Patreon Refresh Token'}
      }
      const token = await axios.post('https://api.patreon.com/oauth2/token', querystring.stringify({
        refresh_token: refreshToken.value,
        client_id: config.auth.patreon.clientID,
        client_secret: config.auth.patreon.clientSecret,
        grant_type: 'refresh_token'
      }), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      })
      if (token && token.data && token.data.access_token) {
        await SiteData.findOneAndUpdate({_id: 'PatreonRefreshToken'}, {value: token.data.refresh_token, private: true}, {upsert: true}).exec()
        if (!nextURL) {
          nextURL = 'https://www.patreon.com/api/oauth2/api/campaigns/562591/pledges?include=patron.null'
        }
        while (nextURL) {
          var response = await axios.get(nextURL, {headers: {Authorization: 'Bearer ' + token.data.access_token}})
          var patrons = response.data.data
          for (let i = 0; i < patrons.length; i++) {
            if (!patrons[i] || !patrons[i].relationships || !patrons[i].relationships.patron || !patrons[i].relationships.patron.data || !patrons[i].relationships.patron.data.id) {
              continue
            }
            var user = await User.findOne({"patreon.id": patrons[i].relationships.patron.data.id})
            if (!user) {
              continue
            }
            user.roles.subscriber = (!patrons[i].attributes.declined_since && patrons[i].attributes.amount_cents >= 100)
            user.roles.gold_subscriber = (!patrons[i].attributes.declined_since && patrons[i].attributes.amount_cents >= 400)
            user.roles.guild_subscriber = (!patrons[i].attributes.declined_since && patrons[i].attributes.amount_cents >= 1500)
            await user.save()
          }
          if (response.data.links && response.data.links.next) {
            nextURL = response.data.links.next
          }
          else {
            nextURL = null
          }
        }
      }
      return
    }
    catch (e) {
      req.trackError(e, 'Cron: UpdatePatreonAccounts')
    }
    return
  },

  UpdateWeeklyMDT: async (req) => {
    try {
      await battlenet.updateMDTWeeks()
      return true
    }
    catch (e) {
      req.trackError(e, 'Cron: UpdateWeeklyMDT')
    }
  },

  UpdateGuildMembership: async (res) => {
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
          let memberUser = await User.findOne({"battlenet.characters.region": region, "battlenet.characters.name": guild.members[j].character.name, "battlenet.characters.realm": guild.members[j].character.realm.slug})
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

          memberUser.battlenet.guilds = [...new Set(memberUser.battlenet.guilds)]

          await memberUser.save()
        }

        // remove old members
        let exGuild = await User.find({"battlenet.guilds": guildKey, _id: {$nin: accountIdsInGuild}}).exec()
        if (exGuild.length) {
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
        }
        return Promise.resolve()
      }
    }

    for (let i = 0; i < users.length; i++) {
      for (let j = 0; j < users[i].battlenet.guilds.length; j++) {
        await battlenet.lookupCharacterStatus(users[i].battlenet.guilds[j])
      }
    }
  },

  updateValidCharacters: async (req) => {
    const fourWeeksAgo = new Date()
    fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28)
    const users = await User.find({"battlenet.characters.1": {$exists: true}, $or: [{"battlenet.updateDate": {$exists: false}}, {"battlenet.updateDate": {$lt: fourWeeksAgo}}]}).limit(200).exec()
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
  },

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
  else {
    return
  }
}

async function updateWAData (req, release, assets) {
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
    req.trackError(e, 'Unable to find WeakAura download')
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
  req.trackError(e, 'Unable to find WeakAura internalVersion')
}

async function updateMDTData (req, release, assets) {
  const addonDir = path.resolve(__dirname, '../lua', 'addons' ,'MDT', release.version)
  await mkdirp(addonDir)
  const zipFile = path.resolve(addonDir, 'MDT.zip')
  const writer = require('fs').createWriteStream(zipFile)

  var axiosDownload = {method: 'GET', responseType: 'stream', url: assets.zipball_url}
  if (!axiosDownload.url) {
    req.trackError(e, 'Unable to find MDT download')
    return false
  }

  const response = await axios(axiosDownload)
  response.data.pipe(writer)
  await new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
  await decompress(zipFile, addonDir)
  // get commit directory
  const commit = await fs.readdir(addonDir)
  var mdtData = await lua.BuildMDT_DungeonTable(`${addonDir}/${commit[1]}/BattleForAzeroth`)
  mdtData = JSON.parse(mdtData)

  // calculate dimensions
  mdtData.dungeonDimensions = []
  mdtData.dungeonEnemies.forEach((enemies, mapID) => {
    console.log(mapID)
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
  SiteData.findByIdAndUpdate('mdtDungeonTable', {value: mdtData}, {upsert: true}).exec()
  SiteData.findByIdAndUpdate('mdtAffixWeeks', {value: mdtData.affixWeeks}, {upsert: true}).exec()
  cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable', 'https://data.wago.io/data/mdtAffixWeeks']})
  for (let mapID = 0; mapID < mdtData.dungeonEnemies.length; mapID++) {
    let Obj = {
      affixWeeks: mdtData.affixWeeks,
      dungeonEnemies: mdtData.dungeonEnemies[mapID],
      mapPOIs: mdtData.mapPOIs[mapID],
      dungeonTotalCount: mdtData.dungeonTotalCount[mapID],
      scaleMultiplier: mdtData.scaleMultiplier[mapID],
      dungeonSubLevels: mdtData.dungeonSubLevels[mapID],
      dungeonMaps: mdtData.dungeonMaps[mapID],
      dungeonDimensions: mdtData.dungeonDimensions[mapID],
      enemyHash: md5(JSON.stringify(mdtData.dungeonEnemies[mapID]))
    }
    if (mapID === 15) {
      Obj.freeholdCrews = mdtData.freeholdCrews
    }
    const currentHash = await SiteData.findById('mdtDungeonTable-' + mapID).exec()
    SiteData.findByIdAndUpdate('mdtDungeonTable-' + mapID, {value: Obj}, {upsert: true}).exec()
    cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: ['https://data.wago.io/data/mdtDungeonTable-' + mapID]})

    // currentHash.value.enemyHash = null // force regenerate
    // if new portrait maps are required
    if (currentHash.value.enemyHash !== Obj.enemyHash && Obj.dungeonMaps && Obj.dungeonEnemies && Obj.dungeonEnemies.length) {
      try {
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
        }
        req.track({e_c: 'Generate MDT portrait maps', e_a: Obj.dungeonMaps['0'], e_n: Obj.dungeonMaps['0']})
      }
      catch (e) {
        req.trackError(e, 'Generating MDT portrait maps ' + Obj.dungeonMaps['0'])
      }
    }
  }

  return
}

async function buildStaticMDTPortraits(json, mapID, subMapID, teeming, faction) {
  return
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
      enemyPortraits.src = 'https://media.wago.io/mdt/portraits-${mapID}.png'
      enemyPortraits.crossOrigin = 'anonymous'
      enemyPortraits.onload = () => {`
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

  // await fs.writeFile('./test.html', html, 'utf8')

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setContent(html)
  await page.waitForSelector('img', {timeout: 120000})
  const base64 = await page.evaluate(() => {
    return document.getElementById('img').src
  })
  await browser.close()
  const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), 'base64')
  await image.saveMdtPortraitMap(buffer, imgName)
  console.log(imgName, 'mdt portrait map generated')
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
                WagoItem.findOne({_id: code.auraID, type: 'WEAKAURAS2'}).then((aura) => {
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
