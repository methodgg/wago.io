
const config = require('../../config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const OAuth = require('oauth')
// const oauthSignature = require('oauth-signature')
const querystring = require('querystring')
const battlenet = require('../helpers/battlenet')

const image = require('../helpers/image')

async function makeSession(req, res, token, user) {
  token.expires = Date.now() + 90 * 24 * 60 * 60 * 1000 // require re-login 90 days from now
  token.userAgent = req.headers['user-agent']

  // if this is an existing sesssion and we've already verified the SID then update it now
  if (token.SID) {
    var userDoc = await UserSessions.findByIdAndUpdate(token.SID, token).exec()
  }

  // else if this is a brand new session
  else if (!req.headers['x-auth-token']) {
    var userDoc = await new UserSessions(token).save()
  }
  else if (req.headers['x-auth-token']) {
    try {
      // if user has an existing expired session then we can validate and re-use it
      var session = jwt.verify(req.headers['x-auth-token'], config.jwtSecret)
      if (session && session.SID) {
        var sessionDoc = await UserSessions.findById(session.SID).exec()
        // if session matches, update with new information
        if (sessionDoc && sessionDoc.UID === token.UID) {
          token.SID = session.SID
          return makeSession(req, res, token, user)
        }
        else {
          req.headers['x-auth-token'] = false
          return makeSession(req, res, token, user)
        }
      }
      else {
        req.headers['x-auth-token'] = false
        return makeSession(req, res, token, user)
      }
    }
    // no valid session is found then create a new one
    catch (e) {
      var userDoc = await new UserSessions(token).save()
    }
  }

  // drop prototypes so we are A-OK for JWT
  userDoc = JSON.parse(JSON.stringify(userDoc))
  try {
    var token = jwt.sign(userDoc, config.jwtSecret)
    if (token) {
      var who = {}
      who.UID = user._id
      who.name = user.account.username || 'User-' + user._id.toString()
      who.avatar = user.avatarURL
      who.css = user.roleClass
      who.patron = user.patreon && user.patreon.amount_cents >= 100
      who.gold_patron = user.patreon && user.patreon.amount_cents >= 400

      who.battlenet = user.battlenet || false
      who.discord = user.discord || false
      who.google = user.google || false
      who.patreon = user.patreon || false
      who.twitter = user.twitter || false
      who.twitch = user.twitch || false
      who.twitch.refreshToken = undefined
      if (user.account.password) {
        who.localAcct = true
      }

      who.defaultImportVisibility = user.account.default_aura_visibility
      who.profileVisibility = user.profile.visibility

      who.access = {}
      who.access.human = user.account.verified_human
      who.access.customSlug = user.access.custom_slug
      who.access.beta = user.access.beta
      who.access.animatedAvatar = user.access.animatedAvatar
      who.access.restrictGuild = user.access.restrictGuild
      who.access.restrictSubs = user.access.restrictSubs
      who.hideAds = user.access.hideAds
      if (user.roles.isAdmin.access) {
        who.access.admin = user.roles.isAdmin
      }
      who.config = user.config

      const unreadComments = Comments.findUnread(user._id)
      const myCollections = WagoItem.find({_userId: user._id, type: 'COLLECTION', deleted: false}).select('_id name').sort('name').exec()
      who.unreadMentions = await unreadComments
      who.collections = await myCollections
      // return user info when finished
      var data = {login: true, token: token, user: who}
      return res.send(data)
    }
    else {
      return res.code(403).send({error: "unknown_user"})
    }
  }
  catch (e) {
    req.trackError(e)
    return res.code(403).send({error: "invalid_token"})
  }
}

module.exports = function (fastify, opts, next) {
  // update password
  fastify.post('/changepass', async (req, res) => {
    if (!req.user || !req.body.newPass) {
      res.send(403, {error: 'forbidden'})
    }
    // if user does not currently have a password then we don't need further validation, just save and return
    if (!req.user.account.password) {
      const hashed = await bcrypt.hash(req.body.newPass, 10)
      req.user.account.password = hashed
      await req.user.save()
      res.send({success: true})
    }
    else {
      const authenticated = await bcrypt.compare(req.body.password, req.user.account.password)
      if (authenticated) {
        const hashed = await bcrypt.hash(req.body.newPass, 10)
        req.user.account.password = hashed
        await req.user.save()
        res.send({success: true})
      }
      else {
        res.send({error: 'Incorrect password'})
      }
    }
  })
  // logout
  const Logout = async (req, res) => {
    if (req.user && req.user.SID) {
      UserSessions.findById(req.user.SID).remove().exec()
    }
    res.send({action: 'logout!'})
  }
  fastify.post('/logout', Logout)
  fastify.get('/logout', Logout)

  // attempt to log into Wago
  const Login = async (req, res) => {
    switch(req.params.provider) {
      case 'battlenet':
        battlenetAuth(req, res)
        break

      case 'battlenetCN':
        battlenetAuth(req, res, 'CN')
        break

      case 'discord':
        discordAuth(req, res)
        break

      case 'google':
        googleAuth(req, res)
        break

      case 'patreon':
        patreonAuth(req, res)
        break

      case 'twitch':
        twitchAuth(req, res)
        break

      case 'twitter':
        twitterAuth(req, res)
        break

      case 'login':
        localAuth(req, res)
        break

      case 'create':
        createUser(req, res)
        break

      case 'user':
      case 'refresh':
        res.redirect('/account/whoami')
        break;

      default:
        return res.code(404).send({error: 'invalid_provider', provider: req.params.provider})
    }
  }
  fastify.post('/:provider', Login)
  fastify.get('/:provider', Login)

  next()
}

// Login with username/password against wago database
async function localAuth (req, res) {
  // find user(s) with entered email
  const user = await User.findByUsername(req.body.username)
  if (!user || !user.account.password) {
    return res.code(403).send({error: "invalid_login"})
  }
  // check if password is a match
  const auth = await bcrypt.compare(req.body.password, user.account.password)
  // if password is a match return true
  if (auth) {
    var who = {}
    who.UID = user._id.toString()
    return makeSession(req, res, who, user)
  }
  return res.code(403).send({error: "invalid_login"})
}

// create local user
/*async function createUser (req, res) {
  if (!req.body.password || req.body.password.length < 6) {
    return res.send(403, {error: 'bad password'})
  }
  var user = await User.findByUsername(req.body.username)
  if (user) {
    return res.send(403, {error: "Error: Username already exists"})
  }

  const google = await axios.post('https://www.google.com/recaptcha/api/siteverify', querystring.stringify({
      secret: '6LfMCGkUAAAAACj35VLnGhJFq2cFqwSj3Hh-5UFq',
      response: req.body.recaptcha,
      remoteip: req.connection.remoteAddress
    })).then(function (google) {
      if (google.data.success) {
        logger.info('Passed captcha')
        var user = new User()
        user.account.username = req.body.username
        user.search.username = req.body.username.toLowerCase()
        // check if password is a match
        bcrypt.hash(req.body.password, 10).then((pass) => {
          user.account.password = pass
          user.save().then((user) => {
            var who = {}
            who.UID = user._id

            return makeSession(req, res, who, user)
          })
        })
      }
      else {
        logger.info('Failed captcha')
        return res.send(403, {error: 'bad captcha'})
      }
    })
  })
}*/

// Login through Blizzard Battle.net
async function battlenetAuth(req, res, region) {
  var key = config.auth.battlenet.clientID
  var secret = config.auth.battlenet.clientSecret
  var tokenURL
  var userURL
  var battlenetField = 'battlenet'
  if (region === 'CN') {
    tokenURL = 'https://www.battlenet.com.cn/oauth/token'
    userURL = 'https://www.battlenet.com.cn/oauth/userinfo'
    battlenetField = 'battlenetCN'
  }
  else {
    region = 'global'
    tokenURL = 'https://us.battle.net/oauth/token'
    userURL = 'https://us.battle.net/oauth/userinfo'
  }
  const response = await axios.post(tokenURL, querystring.stringify({
    redirect_uri: req.headers.origin + '/auth/battlenet',
    scope: 'wow.profile account.public',
    grant_type: 'authorization_code',
    code: req.body.code || req.query.code,
  }), {
    auth: {
      username: key,
      password: secret
    }
  })
  const authResponse = await axios.get(userURL, {
    headers: {
      Authorization: 'Bearer ' + response.data.access_token
    }
  })
  if (authResponse && authResponse.data.id) {
    var auth = {
      id: authResponse.data.id,
      name: authResponse.data.battletag
    }
    // get user and return, then fetch characters. Browser checks updateStatus until update is complete.
    oAuthLogin(req, res, battlenetField, auth, async (user) => {
      if (region === 'global') {
        var profiles = {}
        try {
          let accounts = await getWoWProfile('us', response.data.access_token)
          accounts = accounts.data.wow_accounts
          profiles.us = []
          accounts.forEach(acc => {
            profiles.us = profiles.us.concat(acc.characters)
          })
        }
        catch (e) {
          profiles.us = []
        }
        try {
          profiles.eu = await getWoWProfile('eu', response.data.access_token)
          profiles.eu = profiles.eu.data.characters
        }
        catch (e) {
          profiles.eu = []
        }
        try {
          profiles.kr = await getWoWProfile('kr', response.data.access_token)
          profiles.kr = profiles.kr.data.characters
        }
        catch (e) {
          profiles.kr = []
        }
        try {
          profiles.tw = await getWoWProfile('tw', response.data.access_token)
          profiles.tw = profiles.tw.data.characters
        }
        catch (e) {
          profiles.tw = []
        }
        profiles.cn = []
      }
      else if (region === 'CN') {
        var profiles = {us: [], eu: [], kr: [], tw: []}
        try {
          profiles.cn = await getWoWProfile('cn', response.data.access_token)
          profiles.cn = profiles.cn.data.characters
        }
        catch (e) {
          profiles.cn = []
        }
      }

      var chars = []
      var guilds = []
      var mostRecent = 0
      var avatarURL = ''
      const regions = Object.keys(profiles)
      const lookupProfiles = async function (region) {
        if (!profiles[region] || !profiles[region].length) {
          return Promise.resolve()
        }
        await Promise.all(profiles[region].map(character => getCharacter(region, character)))
      }
      const getCharacter = async function (region, character) {
        if (!character.realm || !character.name || character.name.match(/\d/)) {
          return Promise.resolve()
        }
        const char = await battlenet.lookupCharacter(region, character.realm.name, character.name)
        if (!char.name) {
          return Promise.resolve()
        }
        if (char.guild && char.guild.realm) {
          chars.push({region: region, realm: char.realm.slug, name: char.name, guild: char.guild.name, guildRealm: char.guild.realm.slug, bnetID: char.id })
          const guild = await battlenet.lookupGuild(region, char.guild.realm.slug, char.guild.name)
          if (guild && guild.members) {
            for (let j = 0; j < guild.members.length; j++) {
              if (char.realm.slug === guild.members[j].character.realm.slug && char.name === guild.members[j].character.name) {
                guilds.push(`${region}@${char.guild.realm.slug}@${char.guild.name}`)
                for (let k = guild.members[j].rank; k <= 9; k++) {
                  guilds.push(`${region}@${char.guild.realm.slug}@${char.guild.name}@${k}`)
                }
                break
              }
            }
          }
        }
        else {
          chars.push({region: region, realm: char.realm.name, name: char.name, bnetID: char.id })
        }
        if (char.level >= 110) {
          if (mostRecent < char.lastModified) {
            mostRecent = char.lastModified
            avatarURL = 'https://render-' + region + '.worldofwarcraft.com/character/' + char.thumbnail
          }
        }
        return Promise.resolve()
      }

      await Promise.all(regions.map(region => lookupProfiles(region)))

      if (chars.length > 0) {
        const img = await image.avatarFromURL(avatarURL, user._id.toString(), battlenetField)
        if (!img.error) {
          user[battlenetField].avatar = img
        }
        guilds = [...new Set(guilds)]
        user[battlenetField].name = auth.name
        user[battlenetField].characters = chars
        user[battlenetField].guilds = guilds
        user[battlenetField].updateStatus = 'done'
        user[battlenetField].updateDate = new Date()
        user.account.verified_human = true
        user.save()
      }
      else {
        user[battlenetField].updateStatus = 'Error: No characters found.'
        user.save()
      }
    })
  }
  else {
    return res.code(403).send({error: 'Unable to auth with Blizzard'})
  }
}

// Login through Discord
async function discordAuth(req, res) {
  try {
    const response = await axios.post('https://discordapp.com/api/oauth2/token', querystring.stringify({
      code: req.body.code || req.query.code,
      client_id: config.auth.discord.clientID,
      client_secret: config.auth.discord.clientSecret,
      redirect_uri: req.headers.origin + '/auth/discord',
      grant_type: 'authorization_code'
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    const authResponse = await axios.get('https://discordapp.com/api/v6/users/@me', {
      headers: {
        Authorization: 'Bearer ' + response.data.access_token
      }
    })
    if (!authResponse.data.id) {
      throw 'invalid'
    }
    oAuthLogin(req, res, 'discord', authResponse.data)
  }
  catch (e) {
    req.trackError(e, 'Failed Discord Auth')
    return res.code(403).send({error: 'Unable to auth with Discord'})
  }
}

// Login through Google
async function googleAuth(req, res) {
  try {
    const authResponse = await axios.post('https://www.googleapis.com/oauth2/v4/token', querystring.stringify({
      code: req.body.code || req.query.code,
      client_id: config.auth.google.clientID,
      client_secret: config.auth.google.clientSecret,
      redirect_uri: req.headers.origin + '/auth/google',
      grant_type: 'authorization_code'
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    if (!authResponse.data.id_token) {
      throw 'invalid'
    }
    const profile = jwt.decode(authResponse.data.id_token)
    oAuthLogin(req, res, 'google', profile)
  }
  catch (e) {
    req.trackError(e, 'Failed Google Auth')
    return res.code(403).send({error: 'Unable to auth with Google'})
  }
}

// Login through Patreon
async function patreonAuth(req, res) {
  try {
    const response = await axios.post('https://api.patreon.com/oauth2/token', querystring.stringify({
      code: req.query.code,
      client_id: config.auth.patreon.clientID,
      client_secret: config.auth.patreon.clientSecret,
      redirect_uri:  req.headers.origin + '/auth/patreon',
      grant_type: 'authorization_code'
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    const authResponse = await axios.get('https://api.patreon.com/oauth2/api/current_user', {
      headers: {
        Authorization: 'Bearer ' + response.data.access_token
      }
    })
    if (!authResponse.data.data.id) {
      throw 'invalid'
    }
    oAuthLogin(req, res, 'patreon', authResponse.data.data)
  }
  catch (e) {
    console.log(e)
    req.trackError(e, 'Failed Patreon Auth')
    return res.code(403).send({error: 'Unable to auth with Patreon'})
  }
}

// Login through Twitch
async function twitchAuth(req, res) {
  try {
    const response = await axios.post('https://id.twitch.tv/oauth2/token', querystring.stringify({
      code: req.body.code || req.query.code,
      client_id: config.auth.twitch.clientID,
      client_secret: config.auth.twitch.clientSecret,
      redirect_uri: req.headers.origin + '/auth/twitch',
      grant_type: 'authorization_code'
    }), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    var authResponse = await axios.get('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: 'Bearer ' + response.data.access_token
      }
    })
    if (!authResponse.data.data[0].id) {
      throw 'invalid'
    }
    authResponse = authResponse.data.data[0]
    authResponse.refreshToken = response.data.refresh_token
    oAuthLogin(req, res, 'twitch', authResponse)
  }
  catch (e) {
    req.trackError(e, 'Failed Twitch Auth')
    return res.code(403).send({error: 'Unable to auth with Twitch'})
  }
}

// Login through Twitter
const Twitter = require("twitter-lite") // because oauth 1a is a pain in the butt
const twitter = new Twitter({
  consumer_key: config.auth.twitter.clientID,
  consumer_secret: config.auth.twitter.clientSecret,
})
global.twitterRequestSecrets = {}
async function twitterAuth(req, res) {
  try {
    if (!req.body.oauth_token) {
      const response = await twitter.getRequestToken(req.headers.origin + '/auth/twitter')
      twitterRequestSecrets[response.oauth_token] = response.oauth_token_secret
      res.send({requestToken: response.oauth_token})
      // delete from memory and invalidate this req token after 1 minute
      setTimeout(function () {
        delete twitterRequestSecrets[response.oauth_token]
      }, 60000)
    }
    else if (req.body.oauth_token && twitterRequestSecrets[req.body.oauth_token]) {
      const authResponse = await twitter.getAccessToken({key: req.body.oauth_token, secret: twitterRequestSecrets[req.body.oauth_token], verifier: req.body.oauth_verifier})
      if (!authResponse.user_id) {
        throw 'invalid'
      }
      oAuthLogin(req, res, 'twitter', authResponse)
    }
  }
  catch (e) {
    req.trackError(e, 'Failed Twitter Auth')
    return res.code(403).send({error: 'Unable to auth with Twitter'})
  }
}

async function oAuthLogin(req, res, provider, authUser, callback) {
  // oAuth JSON profile assumed good at this point, log user in, register social login to existing user, or register as new user
  var query
  var profile
  var newAcctName
  var avatarURL
  var humanDetected = false
  var paid = 0
  switch (provider) {
  case 'battlenet':
    query = {"battlenet.id": authUser.id}
    profile = {
      id: authUser.id,
      name: authUser.name,
      updateStatus: 'pending-API'
    }
    humanDetected = authUser.maxLevel
    newAcctName = authUser.name
    avatarURL = authUser.avatar
    break

  case 'discord':
    query = {"discord.id": authUser.id}
    profile = {
      id: authUser.id,
      name: authUser.username + '#' + authUser.discriminator,
    }
    newAcctName = authUser.username
    avatarURL = 'https://cdn.discordapp.com/avatars/' + authUser.id + '/' + authUser.avatar + '.png?size=64'
    break

  case 'google':
    query = {"google.id": authUser.sub}
    profile = {
      id: authUser.sub,
      name: authUser.name,
    }
    newAcctName = authUser.name
    avatarURL = authUser.picture
    break

  case 'patreon':
    query = {"patreon.id": authUser.id}
    try {
      profile = {
        id: authUser.id,
        name: authUser.attributes.vanity || authUser.attributes.first_name
      }
      avatarURL = authUser.attributes.thumb_url
      if (authUser.relationships.pledges.data.length>0 && authUser.relationships.pledges.data[0].attributes) {
        profile.amount_cents = authUser.relationships.pledges.data[0].attributes.amount_cents
      }
    }
    catch (e) {
      return res.send(500, {error: 'Could not read patreon data', error: e, auth: authUser})
    }
    newAcctName = profile.name

    // paid users are verified humans
    if (profile.amount_cents > 0) {
      humanDetected = true
      paid = profile.amount_cents
    }
    break

  case 'twitch':
    query = {"twitch.id": authUser.id}
    profile = {
      id: authUser.id,
      name: authUser.display_name,
      refreshToken: authUser.refresh_token
    }
    avatarURL = authUser.profile_image_url
    break

  case 'twitter':
    query = {"twitter.id": authUser.user_id}
    profile = {
      id: authUser.user_id,
      name: '@' + authUser.screen_name,
    }
    newAcctName = authUser.screen_name
    avatarURL = authUser.profile_image_url_https
  break
  }

  var oauthUser = await User.findOne(query)
  // if already logged in and oauth matches
  if (req.user && ((oauthUser && req.user._id.equals(oauthUser._id)))) {
    if (avatarURL) {
      var img = await image.avatarFromURL(avatarURL, oauthUser._id.toString(), provider)
      if (!img.error) {
        profile.avatar = img
      }
    }

    // update profile
    if (oauthUser[provider] && oauthUser[provider].options) {
      profile.options = oauthUser[provider].options
    }
    if (oauthUser[provider] && oauthUser[provider].webhooks) {
      profile.webhooks = oauthUser[provider].webhooks
    }
    req.user[provider] = profile
    // if human detected then set verified flag
    if (humanDetected) {
      req.user.account.verified_human = true
    }
    if (paid>=100) {
      req.user.roles.subscriber = true
    }
    if (paid>=400) {
      req.user.roles.gold_subscriber = true
    }
    makeSession(req, res, {UID: req.user._id}, req.user)
    await req.user.save()
    if (callback) {
      callback(req.user)
    }
    return
  }

  // if not registered then create a new account
  else if (!oauthUser && (req.user || newAcctName)) {
    var user
    if (req.user) {
      user = req.user
    }
    else {
      user = new User()
    }
    var img = await image.avatarFromURL(avatarURL, user._id.toString(), provider)
    if (!img.error) {
      profile.avatar = img
    }
    user[provider] = profile
    if (humanDetected) {
      user.account.verified_human = true
    }
    if (paid>=100) {
      user.roles.subscriber = true
    }
    if (paid>=400) {
      user.roles.gold_subscriber = true
    }

    // if user exists but this is a new oauth then save it
    if (req.user) {
      makeSession(req, res, {UID: user._id}, user)
      await user.save()
      if (callback) {
        callback(user)
      }
      return
    }
    else {
      // if brand new user, check if we can use the username
      const exists = await User.findByUsername(newAcctName)
      // if username exists then assign unique name
      if (exists) {
        user.account.username = newAcctName + user._id.toString()
      }
      else {
        user.account.username = newAcctName
      }
      user.search.username = user.account.username.toLowerCase()

      makeSession(req, res, {UID: user._id}, user)
      await user.save()
      if (callback) {
        callback(user)
      }
      return
    }
  }

  // if oauth is registered in wago then update profile and log user in
  else if (oauthUser) {
    var img = await image.avatarFromURL(avatarURL, oauthUser._id.toString(), provider)
    if (!img.error) {
      profile.avatar = img
    }
    var who = {}
    who.UID = oauthUser._id
    // update profile
    if (oauthUser[provider] && oauthUser[provider].options) {
      profile.options = oauthUser[provider].options
    }
    if (oauthUser[provider] && oauthUser[provider].webhooks) {
      profile.webhooks = oauthUser[provider].webhooks
    }
    if (humanDetected) {
      user.account.verified_human = true
    }
    if (paid>=100) {
      user.roles.subscriber = true
    }
    if (paid>=400) {
      user.roles.gold_subscriber = true
    }
    oauthUser[provider] = profile

    makeSession(req, res, who, oauthUser)
    await oauthUser.save()
    if (callback) {
      callback(oauthUser)
    }
    return
  }
  else {
    return res.send({err: 'Invalid input'})
  }
}


async function getWoWProfile(region, token) {
  var url
  switch (region) {
    case 'us':
      url = 'https://us.api.blizzard.com/profile/user/wow?namespace=profile-us&locale=en_US'
      break
    case 'eu':
      url = 'https://eu.api.blizzard.com/profile/user/wow?namespace=profile-eu&locale=en_GB'
      break
    case 'tw':
      url = 'https://tw.api.blizzard.com/profile/user/wow?namespace=profile-tw&locale=zh_TW'
      break
    case 'kr':
      url = 'https://kr.api.blizzard.com/profile/user/wow?namespace=profile-kr&locale=ko_KR'
      break
    case 'cn':
      url = 'https://gateway.battlenet.com.cn/profile/user/wow?namespace=profile-cn&locale=zh_CN'
      break
    default:
      throw ('Unknown battlenet auth region ' + region)
  }
  try {
    return axios.get(url, {
      headers: { Authorization: 'Bearer ' + token },
      // proxy: config.axios.proxy
    })
  }
  catch (e) {
    req.trackError(e, 'BNET PROFILE')
  }
}