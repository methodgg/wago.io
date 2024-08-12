const Discord = require("discord.js")
global.config = require('./config')
global.ENUM = require('./middlewares/enum')
const lua = require('./api/helpers/lua')
const WA = require('./api/helpers/encode-decode/WeakAura')
const Plater = require('./api/helpers/encode-decode/Plater')

const client = new Discord.Client()

module.exports = {
  start: () => {
    const _this = this
    client.login(config.discordBotKey)

    client.on("ready", async () => {
      redis.set('static:discordHost', config.host)
      console.log("Discord Bot launched!")
    })

    // if user is leaves a server, then remove any roles
    client.on('message', async (message) => {
      if ((config.env === 'development' && message.channel.id !== '207153760399654912') || (config.env !== 'development' && message.channel.id === '207153760399654912')) {
        return
      }

      const matchWA = /(!WA:2![a-zA-Z0-9\(\)]+)/
      const matchPlater = /^([a-zA-Z0-9\(\)]{30,})$/
      let stringType

      let result = message.content.match(matchWA)
      let importString = result && result[1]
      stringType = importString && 'WeakAura'

      if (!importString) {
        result = message.content.match(matchPlater)
        importString = result && result[1]
        stringType = importString && 'Plater'
      }

      if (!importString && message.attachments) {
        // check attached file
        const attachments = message.attachments.filter(x => x.size < 180000)
        for (const att of attachments) {
          if (importString) continue
          const content = await axios.get(att[1].url)
          if (content && content.data) {
            result = content.data.match(matchWA)
            importString = result && result[1]
            stringType = importString && 'WeakAura'
          }
          if (!importString && content && content.data) {
            result = content.data.match(matchPlater)
            importString = result && result[1]
            stringType = importString && 'Plater'
          }
        }
      }

      if (!importString) {
        return
      }

      let decoded
      let meta
      if (stringType === 'WeakAura') {
        decoded = await WA.decode(importString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        meta = WA.processMeta(decoded)
      }
      else if (stringType === 'Plater') {
        decoded = await Plater.decode(importString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        meta = Plater.processMeta(decoded)
      }

      if (decoded && meta) {
        const wago = new WagoItem({
          type: meta.type,
          addon: stringType,
          domain: WA.domain,
          game: meta.game,
          name: meta.name || 'Import from Discord',
          categories: [],
          description: `Imported from **${message.guild.name}** Discord, *#${message.channel.name}* by **${message.author.username}**.`,
          description_format: 'markdown',
          hidden: true,
          expires_at: new Date().setTime(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
          _userId: '62ebf029da9ef14623e27f4c' // WagoDiscordBot
        })

        await wago.save()

        const code = new WagoCode({
          auraID: wago._id,
          encoded: message.content,
          json: JSON.stringify(decoded),
          version: 1,
          versionString: '1.0.0'
        })

        await code.save()
        console.log('process')
        await taskQueue.add('ProcessCode', { id: wago._id, version: code.versionString, addon: wago.addon, encode: true }, { priority: 2, jobId: `${wago._id}:${code.version}:${code.versionString}` })
        client.api.channels[message.channel.id].messages.post({
          data: {
            content: `Imported to <${wago.url}>`,
            message_reference: {
              message_id: message.id,
              channel_id: message.channel.id,
              guild_id: message.guild.id
            }
          }
        })
      }
    })


    // if user is leaves a server, then remove any roles
    client.on('guildMemberRemove', async (guild, user) => {

    })

    // when bot joins a server fetch all roles
    client.on('guildCreate', async (guild) => {
      // guild.roles.cache.forEach(role => {
      //   console.log('ROLE', role.id, role.name)
      // })
    })

    // when bot is removed from server: delete all user's roles (if wago user)
    client.on('guildDelete', async (guild) => {

    })

    // when role is added/removed (or other updates)
    client.on('guildMemberUpdate', async (oldUser, newUser) => {

    })

    // when a new role is added to server
    client.on('roleCreate', async (role) => {
      console.log(role, 'roleCreate')
    })

    // when a role is deleted from server
    client.on('roleDelete', async (role) => {

    })

    // when a role is modified on server (check if it was renamed, we dont care about other updates?)
    client.on('roleDelete', async (oldRole, newRole) => {

    })

    // is bot's session expires: reconnect after 10 seconds
    client.on('invalidated', async () => {
      discordBot.destroy()
      setTimeout(() => {
        _this.start()
      }, 10000)
    })
  },

  postComment: async (author, to, wago, message) => {
    var subtitle
    if (to._id.equals(wago._userId)) {
      subtitle = 'A comment has been posted to one of your imports.'
    }
    else {
      subtitle = 'A comment has been posted mentioning you.'
    }
    let avatar = await author.avatarURL
    const embed = new Discord.MessageEmbed()
      .setColor('#c1272d')
      .setTitle('Comment Posted: ' + wago.name)
      .setDescription(subtitle)
      .setURL(wago.url)
      .setImage(await wago.getThumbnailURL())
      .setAuthor(author.account.username, avatar.png, `https://wago.io${author.profile.url}`)
      .addFields({ name: 'Message', value: message })
      .setTimestamp()
      .setFooter('Wago.io', 'https://media.wago.io/favicon/favicon-16x16.png')

    try {
      let discordUser = await client.users.fetch(to.discord.id)
      let channel = await discordUser.createDM()
      await channel.send(embed)
    }
    catch (e) {
        LoggedMsg.write('DISCORD_MSG_TO_USER_ERROR', e.message, {
            message: e?.message,
            name: e?.name,
            stack: e?.stack,
            config: e?.config,
            code: e?.code,
            status: e?.response?.status,
            data: e?.response?.data,
            headers: e?.response?.headers
        })
        console.error('discord send message error')
        console.error(e)
    }
  },

  postUpdate: async (author, to, wago) => {
    let avatar = await author.avatarURL
    const embed = new Discord.MessageEmbed()
      .setColor('#c1272d')
      .setTitle(`Update: ${wago.name} - ${wago.latestVersion.versionString}`)
      .setDescription('An update to one of your starred imports has been imported.')
      .setURL(wago.url)
      .setImage(await wago.getThumbnailURL())
      .setAuthor(author.account.username, avatar.png, `https://wago.io${author.profile.url}`)
      .setTimestamp()
      .setFooter('Wago.io', 'https://media.wago.io/favicon/favicon-16x16.png')

    if (wago.latestVersion.changelog.text) {
      embed.addFields({ name: 'Changelog', value: wago.latestVersion.changelog.text.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '') })
    }

    try {
      let discordUser = await client.users.fetch(to.discord.id)
      let channel = await discordUser.createDM()
      channel.send(embed)
    }
    catch (e) {
        LoggedMsg.write('DISCORD_MSG_TO_USER_ERROR', e.message, {
            message: e?.message,
            name: e?.name,
            stack: e?.stack,
            config: e?.config,
            code: e?.code,
            status: e?.response?.status,
            data: e?.response?.data,
            headers: e?.response?.headers
        })
        console.error('discord send message error')
        console.error(e)
    }
  }
}