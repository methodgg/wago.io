module.exports = {
  // broadcast to owner's discord when a new import is created
  webhookOnCreate: (user, wago) => {
    if (wago.type === 'WEAKAURAS2') {
      wago.type = 'WeakAura'
    }
    // build message
    var msg = `${user.account.username} has imported a new ${wago.type} on Wago.io!`
    var hookData = {
      "embeds": [{
        "title": "New "+wago.type+": "+wago.name,
        "url": wago.url,
        "description": msg,
        "type": "rich",
        "thumbnail": {"url": 'https://media.wago.io/favicon/mediumtile.png'}
      }]
    }
    try {
      axios.post(user.discord.webhooks.onCreate, hookData)
    }
    catch (e) {
      console.log('discord create webhook error', e.message)
    }
  },

  webhookOnUpdate: (user, wago) => {
    if (wago.type === 'WEAKAURAS2') {
      wago.type = 'WeakAura'
    }
    // build message
    var msg = `${user.account.username} has updated a ${wago.type} on Wago.io!`
    var hookData = {
      "embeds": [{
        "title": wago.type+": "+wago.name,
        "url": wago.url,
        "description": msg,
        "type": "rich",
        "thumbnail": {"url": wago.thumb || 'https://media.wago.io/favicon/mediumtile.png'}
      }]
    }
    try {
      axios.post(user.discord.webhooks.onCreate, hookData)
    }
    catch (e) {
      console.log('discord update webhook error', e.message)
    }
  },

  // when a wago is updated check for anyone that has starred it AND has the discord notification enabled
  onUpdate: async (owner, wago) => {
    var msg = `${owner.account.username} has updated ${wago.name}!\n${wago.url}`
    const stars = await WagoFavorites.find({type: 'Star', wagoID: wago._id})
    for (let i = 0; i < stars.length; i++) {
      const user = await User.findOne({_id: stars[i].userID, "discord.options.messageOnFaveUpdate": true}).select('discord').exec()
      if (user && !owner._id.equals(user._id)) {
        sendChatMessage(user.discord.id, msg)
      }
    }
  },

  // when a comment is posted check for anyone that has starred it AND has the discord notification enabled
  onComment: async (owner, tagged, wago) => {
    var msg = `${owner.account.username} has posted a comment to ${wago.name}!\n${wago.url}`
    const users = await User.find({_id: tagged._id, "discord.options.messageOnComment": true}).select('discord').exec()
    users.forEach((user) => {
      sendChatMessage(user.discord.id, msg)
    })
  }
}

function sendChatMessage (profileID, message) {
  try {
    axios.post('http://discordbot:9999/sendtext', { profileID: profileID, message: message })
  }
  catch (e) {
    console.log('discord chat message error', e.message)
  }
}