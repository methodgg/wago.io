// hex color to decimal https://www.spycolor.com/

module.exports = {
    onImport: async (author, wago) => {
        let url = wago.webhookOnImport?.url
        let mode = 'import'

        if (!url && (wago.private || wago.restricted || wago.encrypted || wago.hidden)) {
            return
        }

        if (!url) {            
            url = author.webhookOnImport?.url
            mode = 'author'
            if (!url && author.discord?.webhooks?.onCreate) {
                author.webhookOnImport.url = author.discord.webhooks.onCreate
                author.discord.webhooks.onCreate = null
                await author.save()
                url = author.webhookOnImport.url 
            }
        }
        if (!url) {
            return
        }

        const avatar = await author.avatarURL
        const type = wago.type.match(/WEAKAURA/) ? 'WeakAura' : wago.type

        let response
        let data
        let record

        try {
            if (url.match(/^https:\/\/discord\.com\/api\/webhooks\/(\w+)\/([-\w]+)$/)) {
                data = [{
                    title: wago.latestVersion.iteration > 1 ? `Updated Import: ${wago.name}` : `New Import: ${wago.name}`,
                    type: 'rich',
                    description: wago.latestVersion.iteration > 1 ? `${author.account.username} has updated a ${type} import.` : `${author.account.username} has created a new ${type} import.`,
                    url: wago.url,
                    timestamp: new Date(),
                    color: 12658477, // #c1272d
                    image: {
                        url: await wago.getThumbnailURL(),
                    },
                    author: {
                        name: author.account.username,
                        url: `https://wago.io${author.profile.url}`,
                        icon_url: avatar.png ?? avatar.webp ?? avatar.gif ?? avatar.jpg
                    },
                    footer: {
                        text: 'Wago.io',
                        icon_url: 'https://media.wago.io/favicon/favicon-16x16.png'
                    }
                }]        
                response = await axios.post(`${url}?wait=true`, {embeds: data})
            }
            else {
                data = {
                    title: wago.name,
                    version: wago.latestVersion.versionString,
                    changelog: wago.latestVersion.changelog.text,
                    url: wago.url,
                    type: wago.type,
                    author: author.account.username,
                    avatar: avatar.png ?? avatar.webp ?? avatar.gif ?? avatar.jpg,
                    screenshot: await wago.getThumbnailURL()
                }
                response = await axios.post(url, data)
            }

            await response
            record = {
                url,
                status: response.status,
                data,
                response: response.data,
            }
        }
        catch (e) {
            record = {
                url,
                status: e.response?.status ?? 0,
                data,
                response: e.response?.data ?? e.message,
            }
            
        }

        if (mode === 'author') {
            author.webhookOnImport.history.push(record)
            author.webhookOnImport.history = author.webhookOnImport.history.splice(-5)
            await author.save()
        }
        else {
            wago.webhookOnImport.history.push(record)
            wago.webhookOnImport.history = wago.webhookOnImport.history.splice(-5)
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