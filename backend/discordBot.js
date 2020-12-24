const Discord = require("discord.js")

const client = new Discord.Client()

module.exports = {
  start: () => {
    const _this = this
    client.login(config.discordBotKey)

    client.on("ready", async () => {
      SiteData.set('discordHost', config.host)
      console.log("Discord Bot launched!")
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
      .addFields({name: 'Message', value: message})
      .setTimestamp()
      .setFooter('Wago.io', 'https://media.wago.io/favicon/favicon-16x16.png')

    let discordUser = await client.users.fetch(to.discord.id)
    let channel = await discordUser.createDM()
    channel.send(embed)
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
      embed.addFields({name: 'Changelog', value: wago.latestVersion.changelog.text.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '')})
    }

    let discordUser = await client.users.fetch(to.discord.id)
    let channel = await discordUser.createDM()
    channel.send(embed)
  }
}