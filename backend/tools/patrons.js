global.config = require('../config')
global.mongoose = require('mongoose')
global.bluebird = require('bluebird')

const axios = require('axios')

const run = async () => {
  await mongoose.connect(config.db.uri, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true})
  const User = require('../api/models/User')

  nextURL = 'https://www.patreon.com/api/oauth2/v2/campaigns/562591/members?include=currently_entitled_tiers,user&fields%5Btier%5D=title'
  while (nextURL) {
    var response = await axios.get(nextURL, {headers: {Authorization: 'Bearer '+  config.auth.patreon.creatorToken}})
    var patrons = response.data.data
    // console.log(patrons, patrons.length)
    for (let i = 0; i < patrons.length; i++) {
      if (!patrons[i] || !patrons[i].relationships || !patrons[i].relationships.user || !patrons[i].relationships.user.data || !patrons[i].relationships.user.data.id) {
        continue
      }
      var user = await User.findOne({"patreon.id": patrons[i].relationships.user.data.id})
      var tier
      try {
        tier = patrons[i].relationships.currently_entitled_tiers.data[0].id
      }
      catch (e) {
        tier = 0
      }
      // subscriber 1385924
      // gold sub 1386010
      if (!tier) {
        continue
      }
      else if (tier > 1385924) {
        tier = 'GOLD'
      }
      else {
        tier = 'SUB'
      }
      var username
      if (user) {
        username = user.account.username
      }
      else {
        username = 'NO WAGO ACCOUNT PATREON ID ' + patrons[i].relationships.user.data.id
        console.log(patrons[i].relationships.user.data)
      }
      console.log(username, tier)
      if (parseInt(patrons[i].relationships.user.data.id) == 46738855) {
        console.log(typeof patrons[i].relationships.user.data.id)
        console.log('------------------------------------')
      }
    }
    if (response.data.links && response.data.links.next) {
      nextURL = response.data.links.next
    }
    else {
      nextURL = null
    }
  }
}

try {
  run()
}
catch (e) {
  console.log(e)
}