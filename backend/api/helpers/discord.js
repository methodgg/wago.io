var Axios = require('axios')

module.exports = {
  // broadcast to owner's discord when a new import is created
  webhookOnCreate: (user, wago) => {
    // build message
    var msg = `${user.account.username} has imported a new ${wago.type} Wago!`
    var hookData = { 
      "embeds": [{
        "title": "New "+wago.type+": "+wago.name,
        "url": wago.url,
        "description": msg,
        "type": "rich",
        "thumbnail": {"url": 'https://media.wago.io/favicon/mediumtile.png'}
      }]
    }
    Axios.post(user.discord.webhooks.onCreate, hookData)
      .then((res) => {
        // console.log(res)
      })
  },

  // when a wago is updated check for anyone that has starred it AND has the discord notification enabled
  onUpdate: (owner, wago) => {
    var msg = `${owner.account.username} has updated ${wago.name}!\n${wago.url}`
    User.find({_id: wago.popularity.favorites, "discord.options.messageOnFaveUpdate": true}).select('discord').then((users) => {
      users.forEach((user) => {
        if (!owner._id.equals(user._id)) {
          sendChatMessage(user.discord.id, msg)
        }
      })
    })
  },

  // when a comment is posted check for anyone that has starred it AND has the discord notification enabled
  onComment: (owner, tagged, wago) => {
    var msg = `${owner.account.username} has posted a comment to ${wago.name}!\n${wago.url}`
    User.find({_id: tagged._id}).select('discord').then((users) => {
      users.forEach((user) => {
        sendChatMessage(user.discord.id, msg)
      })
    })
  }
}

function sendChatMessage (profileID, message) {
  Axios.post('http://192.168.0.181:9999/sendtext', { profileID: profileID, message: message })
  .then((res) => {
    // console.log(res)
  })
}