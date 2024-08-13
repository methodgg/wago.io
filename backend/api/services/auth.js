
const config = require('../../config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const querystring = require('querystring')
const battlenet = require('../helpers/battlenet')
const hcaptchaVerify = require('hcaptcha').verify
const ObjectId = require('mongoose').Types.ObjectId

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
      who.avatar = await user.avatarURL
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
      const myCollections = WagoItem.find({ _userId: user._id, type: 'COLLECTION', deleted: false }).select('_id name').sort('name').exec()
      who.unreadMentions = await unreadComments
      who.collections = await myCollections
      // return user info when finished
      var data = { login: true, token: token, user: who }
      return res.send(data)
    }
    else {
      return res.code(403).send({ error: "unknown_user" })
    }
  }
  catch (e) {
    req.trackError(e)
    return res.code(403).send({ error: "invalid_token" })
  }
}

module.exports = function (fastify, opts, next) {
  // update password
//   fastify.post('/changepass', async (req, res) => {
//     if (!req.user || !req.body.newPass) {
//       res.code(403).send({ error: 'forbidden' })
//     }
//     // if user does not currently have a password then we don't need further validation, just save and return
//     if (!req.user.account.password) {
//       const hashed = await bcrypt.hash(req.body.newPass, 10)
//       req.user.account.password = hashed
//       await req.user.save()
//       res.send({ success: true })
//     }
//     else {
//       const authenticated = await bcrypt.compare(req.body.password, req.user.account.password)
//       if (authenticated) {
//         const hashed = await bcrypt.hash(req.body.newPass, 10)
//         req.user.account.password = hashed
//         await req.user.save()
//         res.send({ success: true })
//       }
//       else {
//         res.send({ error: 'Incorrect password' })
//       }
//     }
//   })
  // logout
  const Logout = async (req, res) => {
    if (req.user && req.user.SID) {
      UserSessions.findById(req.user.SID).remove().exec()
    }
    res.send({ action: 'logout!' })
  }
  fastify.post('/logout', Logout)
  fastify.get('/logout', Logout)

  // attempt to log into Wago
  const Login = async (req, res) => {
    switch (req.params.provider) {
      case 'wago':
        unifiedWagoAuth(req, res)
        break

    //   case 'battlenet':
    //     battlenetAuth(req, res)
    //     break

    //   case 'battlenetCN':
    //     battlenetAuth(req, res, 'CN')
    //     break

    //   case 'discord':
    //     discordAuth(req, res)
    //     break

    //   case 'google':
    //     googleAuth(req, res)
    //     break

    //   case 'patreon':
    //     patreonAuth(req, res)
    //     break

    //   case 'twitch':
    //     twitchAuth(req, res)
    //     break

    //   case 'twitter':
    //     twitterAuth(req, res)
    //     break

    //   case 'login':
    //     localAuth(req, res)
    //     break

    //   case 'create':
    //     createUser(req, res)
    //     break

      case 'user':
      case 'refresh':
        res.redirect('/account/whoami')
        break;

      default:
        return res.code(404).send({ error: 'invalid_provider', provider: req.params.provider })
    }
  }
  fastify.post('/:provider', Login)
  fastify.get('/:provider', Login)

  fastify.get('/hash', async function (req, res) {
    res.send({ hash: await bcrypt.hash(req.query.pw, 10) })
  })

  next()
}

// Login with username/password against wago database
async function localAuth(req, res) {
  try {
    var valid = await hcaptchaVerify(config.hcaptcha.secret, req.body.captcha)
    const recent = new Date(new Date().getTime() - 1000 * 60)
    if (valid && valid.success && new Date(valid.challenge_ts) > recent) {
      // find user(s) with entered name
      const user = await User.findByUsername(req.body.username)
      if (!user || !user.account.password) {
        return res.code(403).send({ error: "invalid_login" })
      }
      // check if password is a match
      const auth = await bcrypt.compare(req.body.password, user.account.password)
      // if password is a match return true
      if (auth) {
        var who = {}
        who.UID = user._id.toString()
        return makeSession(req, res, who, user)
      }
    }
  }
  catch (e) {
    console.log(e)
  }
  return res.code(403).send({ error: "invalid_login" })
}

// create local user
async function createUser(req, res) {
  if (!req.body.password || req.body.password.length < 6) {
    return res.code(403).send({ error: 'bad password' })
  }
  let username = req.body.username.replace(/^ +/, '_').replace(/ +$/, '_')
  let test = await User.findByUsername(username)
  if (test) {
    return res.code(403).send({ error: "Error: Username already exists" })
  }

  try {
    var valid = await hcaptchaVerify(config.hcaptcha.secret, req.body.captcha)

    const recent = new Date(new Date().getTime() - 1000 * 60)
    if (valid && valid.success && new Date(valid.challenge_ts) > recent) {
      var user = new User()
      user.account.username = username
      user.search.username = username.toLowerCase()
      // check if password is a match
      var pass = await bcrypt.hash(req.body.password, 10)
      user.account.password = pass
      await user.save()
      var who = {}
      who.UID = user._id

      return makeSession(req, res, who, user)
    }
  }
  catch (e) {
    console.log(e)
  }

  return res.code(403).send({ error: 'bad captcha' })
}

// unified wago auth
async function unifiedWagoAuth(req, res) {
    let accessToken = await redis.get(`auth:${req.body.code}`)
    if (!accessToken || accessToken === '0') {
        await redis.set(`auth:${req.body.code}`, '0')
        try {
            const response = await axios.post('https://accounts.wago.io/oauth/token', querystring.stringify({
                code: req.body.code,
                client_id: config.auth.wago.clientID,
                client_secret: config.auth.wago.clientSecret,
                redirect_uri: req.headers.origin + '/auth/wago',
                grant_type: 'authorization_code'
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            await redis.set(`auth:${req.body.code}`, response.data.access_token, 'EX', 300)
            accessToken = response.data.access_token
        }
        catch (e) {
            LoggedMsg.write('FAILED_AUTH', e.message, {
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

    if (accessToken && accessToken !== '0' && accessToken !== 'null') {
        try {
            const authResponse = await axios.get('https://accounts.wago.io/api/users', {
                headers: {
                    Authorization: 'Bearer ' + accessToken
                }
            })
            if (!authResponse.data.id) {
                throw 'invalid user data received'
            }
            return oAuthLogin(req, res, 'wago', authResponse.data)
        }
        catch (e) {        
            LoggedMsg.write('FAILED_AUTH', e.message, {
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
    return res.code(403).send({ error: 'Unable to auth with Wago' })
}

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
          let accounts = await getWoWProfile('eu', response.data.access_token)
          accounts = accounts.data.wow_accounts
          profiles.eu = []
          accounts.forEach(acc => {
            profiles.eu = profiles.eu.concat(acc.characters)
          })
        }
        catch (e) {
          profiles.eu = []
        }
        try {
          let accounts = await getWoWProfile('kr', response.data.access_token)
          accounts = accounts.data.wow_accounts
          profiles.kr = []
          accounts.forEach(acc => {
            profiles.kr = profiles.kr.concat(acc.characters)
          })
        }
        catch (e) {
          profiles.kr = []
        }
        try {
          let accounts = await getWoWProfile('tw', response.data.access_token)
          accounts = accounts.data.wow_accounts
          profiles.tw = []
          accounts.forEach(acc => {
            profiles.tw = profiles.tw.concat(acc.characters)
          })
        }
        catch (e) {
          profiles.tw = []
        }
        profiles.cn = []
      }
      else if (region === 'CN') {
        var profiles = { us: [], eu: [], kr: [], tw: [] }
        try {
          let accounts = await getWoWProfile('cn', response.data.access_token)
          accounts = accounts.data.wow_accounts
          profiles.cn = []
          accounts.forEach(acc => {
            profiles.cn = profiles.cn.concat(acc.characters)
          })
        }
        catch (e) {
          profiles.cn = []
        }
      }

      var chars = []
      var guilds = []
      var mostRecent = 0
      var avatarURL = ''
      var methodRaider = false

      const regions = Object.keys(profiles)
      const lookupProfiles = async function (region) {
        if (!profiles[region] || !profiles[region].length) {
          return Promise.resolve()
        }
        await Promise.all(profiles[region].map(character => getCharacter(region, character)))
      }
      const getCharacter = async function (region, character) {
        if (!character.realm || !character.name || character.name.match(/\d/) || character.level < 30) {
          return Promise.resolve()
        }
        const char = await battlenet.lookupCharacter(region, character.realm.name, character.name, user)

        if (!char.name) {
          return Promise.resolve()
        }

        if (char.guild && char.guildRealmSlug) {
          chars.push({ region: region, realm: char.realmSlug, name: char.name, guild: char.guild, guildRealm: char.guildRealmSlug, bnetID: char.bnetID })
          const guild = await battlenet.lookupGuild(region, char.guildRealm, char.guild)
          if (guild && guild.members) {
            for (let j = 0; j < guild.members.length; j++) {
              if (char.realmSlug === guild.members[j].character.realm.slug && char.name === guild.members[j].character.name) {
                guilds.push(`${region}@${char.guildRealmSlug}@${char.guild}`)
                for (let k = guild.members[j].rank; k <= 9; k++) {
                  guilds.push(`${region}@${char.guildRealmSlug}@${char.guild}@${k}`)
                }
                if (`${region}@${char.guildRealmSlug}@${char.guild}` === 'eu@twisting-nether@Method') {
                  methodRaider = (guild.members[j].rank <= 4)
                }
                break
              }
            }
          }
        }
        else {
          chars.push({ region: region, realm: char.realm, name: char.name, bnetID: char.bnetID })
        }
        if (char.level >= 50) {
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
        // since there is a mongo version control conflict that I can't seem to find when modifying battlenet chars... refetch the user
        let _user = await User.findById(user._id)
        _user[battlenetField].name = auth.name
        _user[battlenetField].characters = chars
        _user[battlenetField].guilds = guilds
        _user[battlenetField].updateStatus = 'done'
        _user[battlenetField].updateDate = new Date()
        _user.roles.methodRaider = methodRaider
        _user.account.verified_human = true
        await _user.save()
      }
      else {
        user[battlenetField].updateStatus = 'Error: No characters found.'
        user[battlenetField].updateDate = new Date()
        await user.save()
      }
    })
  }
  else {
    return res.code(403).send({ error: 'Unable to auth with Blizzard' })
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
    return res.code(403).send({ error: 'Unable to auth with Discord' })
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
    return res.code(403).send({ error: 'Unable to auth with Google' })
  }
}

// Login through Patreon
async function patreonAuth(req, res) {
  try {
    const response = await axios.post('https://api.patreon.com/oauth2/token', querystring.stringify({
      code: req.body.code || req.query.code,
      client_id: config.auth.patreon.clientID,
      client_secret: config.auth.patreon.clientSecret,
      redirect_uri: req.headers.origin + '/auth/patreon',
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
    return res.code(403).send({ error: 'Unable to auth with Patreon' })
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
    return res.code(403).send({ error: 'Unable to auth with Twitch' })
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
      res.send({ requestToken: response.oauth_token })
      // delete from memory and invalidate this req token after 1 minute
      setTimeout(function () {
        delete twitterRequestSecrets[response.oauth_token]
      }, 60000)
    }
    else if (req.body.oauth_token && twitterRequestSecrets[req.body.oauth_token]) {
      const authResponse = await twitter.getAccessToken({ oauth_token: req.body.oauth_token, oauth_verifier: req.body.oauth_verifier })
      if (!authResponse.user_id) {
        throw 'invalid'
      }
      delete twitterRequestSecrets[req.body.oauth_token]
      oAuthLogin(req, res, 'twitter', authResponse)
    }
    else {
      req.trackError({ message: 'Invalid oauth token' }, 'Failed Twitter Auth 1')
      return res.code(403).send({ error: 'Unable to auth with Twitter' })
    }
  }
  catch (e) {
    req.trackError(e, 'Failed Twitter Auth 2')
    return res.code(403).send({ error: 'Unable to auth with Twitter' })
  }
}

async function oAuthLogin(req, res, provider, authUser, callback) {
  // oAuth JSON profile assumed good at this point, log user in, register social login to existing user, or register as new user
    let query
    let avatarURL

    try {
        query = { _id: ObjectId(authUser.id) }
    }
    catch {
        query = { "wagoAuth.id": authUser.id }
    }
    avatarURL = authUser.avatar

    let oauthUser = await User.findOne(query)
    // if already logged in and oauth matches
    if (oauthUser) {
        user = oauthUser
    }
    else {
        user = new User()
    }

    user.account.username = authUser.username
    if (authUser.avatar?.endsWith('.gif')) {
        user.profile.avatar = {gif: authUser.avatar}        
    }
    else if (authUser.avatar?.endsWith('.webp')) {
        user.profile.avatar = {webp: authUser.avatar}        
    }
    else if (authUser.avatar?.endsWith('.png')) {
        user.profile.avatar = {png: authUser.avatar}        
    }

    user.wagoAuth = {
        id: authUser.id,
        name: authUser.username,
    }

    if (authUser.socialLogins?.discord) {
        user.discord.id = authUser.socialLogins.discord
    }
    if (authUser.socialLogins?.battlenet) {
        user.battlenet.id = authUser.socialLogins.battlenet
        if (authUser.wowChars?.length) {
            user.battle.net.characters = authUser.wowChars
        }
    }
    
    user.roles.subscriber = authUser.benefits?.includes('green_name_tag')
    user.roles.gold_subscriber = authUser.benefits?.includes('golden_name_tag')
    user.account.verified_human = user.account.verified_human || user.roles.subscriber || user.roles.gold_subscriber || Boolean(authUser.email_verified_at)

    makeSession(req, res, { UID: user._id }, user)
    req.user = user
    if (callback) {
      callback(user)
    }
    else {
      await user.save()
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