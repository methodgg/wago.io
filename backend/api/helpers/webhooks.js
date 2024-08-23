// hex color to decimal https://www.spycolor.com/

module.exports = {
  discord: {
    // broadcast to owner's discord when a new import is created
    onCreate: async (author, wago) => {
      if (wago.private || wago.restricted || wago.encrypted || !author.discord || !author.discord.webhooks || !author.discord.webhooks.onCreate) {
        return
      }
      let type = wago.type
      if (type.match(/WEAKAURA/)) {
        type = 'WeakAura'
      }
      const avatar = await author.avatarURL

      let embeds = [{
        title: `Updated Import: ${wago.name}`,
        type: 'rich',
        description: `${author.account.username} has created a new ${type} import.`,
        url: wago.url,
        timestamp: new Date(),
        color: 12658477, // #c1272d
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
      const wh = author.discord.webhooks.onCreate.match(/\/api\/webhooks\/(\w+)\/([-\w]+)$/)
      sendDiscordWebhook({embeds}, wh[1], wh[2])
    },

    onUpdate: async (author, wago) => {
      if (wago.private || wago.restricted || wago.encrypted || !author.discord || !author.discord.webhooks || !author.discord.webhooks.onCreate) {
        return
      }
      let type = wago.type
      if (type.match(/WEAKAURA/)) {
        type = 'WeakAura'
      }
      const avatar = await author.avatarURL

      let embeds = [{
        title: `Updated Import: ${wago.name}`,
        type: 'rich',
        description: `${author.account.username} has updated the ${type} import.`,
        url: wago.url,
        timestamp: new Date(),
        color: 12658477, // #c1272d
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
      if (wago.latestVersion.changelog.text) {
        embeds[0].description += "\n\nChangelog: " + wago.latestVersion.changelog.text.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '')
      }
      const wh = author.discord.webhooks.onCreate.match(/\/api\/webhooks\/(\w+)\/([-\w]+)$/)
      sendDiscordWebhook({embeds}, wh[1], wh[2])
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
    try {
        await axios.post(`https://discord.com/api/webhooks/${id}/${token}?wait=true`, data)
    }
    catch (e) {
        LoggedMsg.write('DISCORD_MSG_TO_WEBHOOK_ERROR', e.message, {
            message: e?.message,
            name: e?.name,
            stack: e?.stack,
            config: e?.config,
            code: e?.code,
            status: e?.response?.status,
            data: e?.response?.data,
            headers: e?.response?.headers
        })
    }
}

// async function modifyDiscordWebhook(string, id, token, msgID) {
//   console.log(data)
//   try {
//     // let res = await axios.post(`https://discord.com/api/webhooks/${id}/${token}?wait=true`, data)
//     let res = await axios.get(`https://discord.com/api/webhooks/${id}/${token}/messages/851682916115283989?wait=true`)
//     console.log(res.data)
//   }
//   catch (e) {
//     console.log(e.response)
//   }
// }
