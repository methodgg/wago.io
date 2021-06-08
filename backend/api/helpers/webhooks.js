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
    },

    onReport: async (author, wago, moderation) => {
      // build message
      const avatar = await author.avatarURL
      let color = 10643712 // orange
      if (moderation.action === 'Review') {
        color = 30114 // blue
      }

      try {
        const wh = config.webhooks.moderationReport.match(/\/api\/webhooks\/(\w+)\/([-\w]+)$/)
        sendDiscordWebhook({
          embeds: [{
            title: `Moderation: ${moderation.action} - ${moderation.details}`,
            type: 'rich',
            description: moderation.comment || '',
            url: wago.url,
            timestamp: new Date(),
            color: color,
            image: {
              url: await wago.getThumbnailURL(),
            },
            author: {
              name: author.account.username,
              url: `https://wago.io${author.profile.url}`,
              icon_url: avatar.png
            },
            footer: {
              text: 'Wago.io',
              icon_url: 'https://media.wago.io/favicon/favicon-16x16.png'
            }
          }]
        }, wh[1], wh[2])
      }
      catch (e) {
        console.log('discord create webhook error', e)
      }
    }
  }
}

async function sendDiscordWebhook(data, id, token) {
  await axios.post(`https://discord.com/api/webhooks/${id}/${token}?wait=true`, data)
}

