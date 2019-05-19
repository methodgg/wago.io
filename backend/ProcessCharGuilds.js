// requires
global.config = require('./config')
global.async = require('async')
global.axios = require('axios')
global.bluebird = require('bluebird')
global.fs = require('fs').promises
global.mongoose = require('mongoose')

// connect mongoose
db = mongoose.connect(config.db.uri)
mongoose.Promise = global.Promise

// mongoose models
global['User'] = require('./api/models/User')
global['WagoiItem'] = require('./api/models/WagoItem')

async function run () {
  const users = await User.find({"battlenet.characters.guild": {$exists: true}, "battlenet.characters.region": {$exists: true}}).exec()
  users.forEach(async (user) => {
    user.battlenet.characters.forEach(async (char) => {
      if (!char.region || !char.guild || !char.guildRealm) {
        return
      }
      var guildKey = `${char.region}@${char.guildRealm}@${char.guild}`
      if (user.battlenet.guilds.indexOf(guildKey) === -1) {
        user.battlenet.guilds.push(guildKey)
      }
    })
    if (user.battlenet.guilds.length) {
      await user.save()
    }
  })
}
run()