
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
  fastify.get('/redirect', async (req, res) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let state = '';
    const charactersLength = characters.length;
    for (let i = 0; i < 48; i++) {
        state += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    await redis.set(`AUTH:${state}`, req.raw.ip, 'EX', 600)

    let host = 'https://wago.io'
    if (config.env === 'development') {
        host = 'http://localhost:8080'
    }
    res.redirect(`https://accounts.wago.io/oauth/authorize?client_id=9cc008ea-23d8-48e5-b93d-cad0cc395c42&redirect_uri=${host}%2Fauth%2Fwago&response_type=code&scope=&state=${state}`)
  })

  fastify.get('/hash', async function (req, res) {
    res.send({ hash: await bcrypt.hash(req.query.pw, 10) })
  })

  next()
}

// unified wago auth
async function unifiedWagoAuth(req, res) {
    const state = await redis.get(`AUTH:${req.body.state}`)
    if (state === req.raw.ip) {
        try {
            await redis.del(`AUTH:${req.body.state}`)
            const response = await axios.post('https://accounts.wago.io/oauth/token', querystring.stringify({
                code: req.body.code,
                client_id: config.auth.wago.clientID,
                client_secret: config.auth.wago.clientSecret,
                redirect_uri: req.headers.origin + '/auth/wago',
                grant_type: 'authorization_code'
            }), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": `Wago.io Backend/${config.gitref}`,
                    "Auth-Type": "oauth",
                    "Client-User-Agent": req.headers['user-agent']
                }
            })
            
            const accessToken = response.data.access_token
            const authResponse = await axios.get('https://accounts.wago.io/api/users', {
                headers: {
                    Authorization: 'Bearer ' + accessToken,
                    "User-Agent": `Wago.io Backend/${config.gitref}`
                }
            })
            if (!authResponse.data.id) {
                throw 'Invalid user data received'
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
    else {
        return res.code(400).send({ error: 'Invalid auth session or it has already been consumed' })
    }

    return res.code(403).send({ error: 'Unable to auth with Wago' })
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