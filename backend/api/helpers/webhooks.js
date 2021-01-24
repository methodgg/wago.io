const Discord = require("discord.js")

module.exports = {
  discord: {
    // broadcast to owner's discord when a new import is created
    onCreate: async (author, wago) => {
      if (wago.private || wago.restricted || wago.encrypted) {
        return
      }
      if (wago.type === 'WEAKAURA') {
        wago.type = 'WeakAura'
      }
      else if (wago.type === 'CLASSIC-WEAKAURA') {
        wago.type = 'Classic WeakAura'
      }
      // build message
      const avatar = await author.avatarURL
      const embed = new Discord.MessageEmbed()
        .setColor('#c1272d')
        .setTitle(`New Import: ${wago.name}`)
        .setDescription(`${author.account.username} has created a new ${wago.type} import.`)
        .setURL(wago.url)
        .setAuthor(author.account.username, avatar.png, `https://wago.io${author.profile.url}`)
        .setTimestamp()
        .setFooter('Wago.io', 'https://media.wago.io/favicon/favicon-16x16.png')
    
      try {
        const wh = author.discord.webhooks.onCreate.match(/\/api\/webhooks\/(\w+)\/([-\w]+)$/)
        const webhookClient = new Discord.WebhookClient(wh[1], wh[2])
        webhookClient.send(embed)
      }
      catch (e) {
        console.log('discord create webhook error', e.message)
      }
    },

    onUpdate: async (author, wago) => {
      if (wago.private || wago.restricted || wago.encrypted) {
        return
      }
      let type = wago.type
      if (type === 'WEAKAURA') {
        type = 'WeakAura'
      }
      else if (type === 'CLASSIC-WEAKAURA') {
        type = 'Classic WeakAura'
      }
      // build message
      const avatar = await author.avatarURL
      const embed = new Discord.MessageEmbed()
        .setColor('#c1272d')
        .setTitle(`Updated Import: ${wago.name}`)
        .setDescription(`${author.account.username} has updated the ${type} import.`)
        .setURL(wago.url)
        .setImage(await wago.getThumbnailURL())
        .setAuthor(author.account.username, avatar.png, `https://wago.io${author.profile.url}`)
        .setTimestamp()
        .setFooter('Wago.io', 'https://media.wago.io/favicon/favicon-16x16.png')
    
      if (wago.latestVersion.changelog.text) {
        embed.addFields({name: 'Changelog', value: wago.latestVersion.changelog.text.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '')})
      }
    
      try {
        const wh = author.discord.webhooks.onCreate.match(/\/api\/webhooks\/(\w+)\/([-\w]+)$/)
        const webhookClient = new Discord.WebhookClient(wh[1], wh[2])
        webhookClient.send(embed)
      }
      catch (e) {
        console.log('discord create webhook error', e.message)
      }
    }
  }
}