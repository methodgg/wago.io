
const config = require('../../config')
const Axios = require('axios')
const bcrypt = require('bcrypt')      
const md5 = require('md5')
const jwt = require('jsonwebtoken')
const OAuth = require('oauth')
const oauthSignature = require('oauth-signature')
const querystring = require('querystring')

const image = require('../helpers/image')

function makeSession(req, res, token, user) {
  token.expires = Date.now() + 90 * 24 * 60 * 60 * 1000 // require re-login 90 days from now
  token.userAgent = req.headers['user-agent']

  // if this is an existing sesssion and we've already verified the SID then update it now
  if (token.SID) {
    var promise = UserSessions.findByIdAndUpdate(token.SID, token).exec()
  }

  // else if this is a brand new session
  else if (!req.headers['x-auth-token']) {
    var session = new UserSessions(token)
    var promise = session.save()
  }
  else if (req.headers['x-auth-token']) {
    try {
      // if user has an existing expired session then we can validate and re-use it
      var session = jwt.verify(req.headers['x-auth-token'], config.jwtSecret)
      if (session && session.SID) {
        UserSessions.findById(session.SID).then(function(doc) {
          // if session matches, update with new information
          if (doc && doc.UID === token.UID) {
            token.SID = session.SID
            return makeSession(req, res, token, user)
          }
          else {
            req.headers['x-auth-token'] = false
            return makeSession(req, res, token, user)
          }
        })
      }
      else {
        req.headers['x-auth-token'] = false
        return makeSession(req, res, token, user)
      }
    }
    // no valid session is found then create a new one
    catch (e) {
      var session = new UserSessions(token)
      var promise = session.save()
    }
  }

  // sign and return token
  if (promise) {
    promise.then(function(doc) {
      // drop prototypes so we are A-OK for JWT
      doc = JSON.parse(JSON.stringify(doc))
      var token = jwt.sign(doc, config.jwtSecret, function(err, token) {
        if (!err && token) {
          var who = {}
          who.UID = user._id
          who.name = user.account.username || 'User-' + user._id.toString()
          who.avatar = user.avatarURL
          who.css = user.roleClass
          who.patron = user.patreon && user.patreon.amount_cents >= 100
          who.gold_patron = user.patreon && user.patreon.amount_cents >= 400
      
          who.battlenet = user.battlenet || false
          who.facebook = user.facebook || false
          who.discord = user.discord || false
          who.google = user.google || false
          who.patreon = user.patreon || false
          who.twitter = user.twitter || false
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
          if (user.roles.admin.access) {
            who.access.admin = user.roles.admin
          }
          
          who.config = user.config

          async.parallel({
            comments: (cb) => {
              Comments.findUnread(user._id).then((mentions) => {
                who.unreadMentions = mentions
                cb()
              })
            },
      
            collections: (cb) => {
              WagoItem.find({_userId: user._id, type: 'COLLECTION'}).select('_id name').sort('name').then((collections) => {
                who.collections = collections
                cb()
              })
            }
          }, () => {
            // return user info when finished
            var data = {login: true, token: token, user: who}
            return res.send(200, data)
          })
        }
        else {
          console.log(err, doc)
          res.send(500, {error: "server_error"})
        }
      })
    }).catch(e => {
      console.error(e)
      return res.send(403, {error: 'unknown_user'})
    })
  }
}

// update password
server.post('/auth/changepass', (req, res) => {
  if (!req.user || !req.body.newPass) {
    res.send(403, {error: 'forbidden'})
  }
  // if user does not currently have a password then we don't need further validation, just save and return
  if (!req.user.account.password) {
    bcrypt.hash(req.body.newPass, 10).then((pass) => {
      req.user.account.password = pass
      req.user.save().then(() => {
        res.send({success: true})
      })
    })
  }
  else {
    bcrypt.compare(req.body.password, req.user.account.password).then((auth) => {
      if (auth) {
        bcrypt.hash(req.body.newPass, 10).then((pass) => {
          req.user.account.password = pass
          req.user.save().then(() => {
            res.send({success: true})
          })
        })
      }
      else {
        res.send({error: 'Incorrect password'})
      }
    })
  }
})

// Log out of Wago
server.post('/auth/logout', Logout)
server.get('/logout', Logout)
function Logout (req, res, next) {
  if (req.user && req.user.SID) {
    UserSessions.findById(req.user.SID).remove().exec()
  }
  res.clearCookie('token')
  res.send({action: 'logout!'})
}

// attempt to log into Wago
server.post('/auth/:provider', doAuth)
server.get('/auth/:provider', doAuth)
function doAuth (req, res, next) {
  switch(req.params.provider) {
    case 'battlenet':
      battlenetAuth(req, res)
      break
      
    case 'discord':
      discordAuth(req, res)
      break
      
    case 'facebook':
      facebookAuth(req, res)
      break
      
    case 'google':
      googleAuth(req, res)
      break
            
    case 'patreon':
      patreonAuth(req, res)
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
      res.redirect('/account/whoami', next)
      break;

    default:
      res.send(404, {error: 'invalid_provider', provider: req.params.provider})
  }
}

server.get('/auth', (req, res, next) => {
  res.redirect('/account/whoami', next)
})

// Login with username/password against wago database
function localAuth (req, res) {
  // find user(s) with entered email
  User.findByUsername(req.body.username).then(function(user) {
    if (!user || !user.account.password) {
      return res.send(403, {error: "invalid_login"})
    }
    // check if password is a match
    bcrypt.compare(req.body.password, user.account.password).then((auth) => {
      // if password is a match return true
      if (auth) {
        var who = {}
        who.UID = user._id.toString()

        return makeSession(req, res, who, user)
      }
      else {

        // otherwise no match
        return res.send({error: "invalid_login"})
      }
    })
  })  
}

// create local user
function createUser (req, res) {
  if (!req.body.password || req.body.password.length < 6) {
    return res.send(403, {error: 'bad password'})
  }
  // make sure username is not in use
  User.findByUsername(req.body.username).then(function(user) {
    if (user) {
      return res.send(403, {error: "Error: Username already exists"})
    }
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
  })
}

// Login through Blizzard Battle.net
function battlenetAuth(req, res) {
  var key, secret
  if (req.headers.origin === 'https://t1000.wago.io') {
    key = config.auth.battlenet.betaClientID
    secret = config.auth.battlenet.betaClientSecret
  }
  else {
    key = config.auth.battlenet.clientID
    secret = config.auth.battlenet.clientSecret
  }
  Axios.post('https://us.battle.net/oauth/token', querystring.stringify({
    code: req.body.code || req.query.code,
    redirect_uri: req.headers.origin + '/auth/battlenet',
    scope: 'wow.profile',
    grant_type: 'authorization_code'
  }), {
    auth: {
      username: key,
      password: secret
    }
  }).then(function (response) {
    var authResponse = {}
    Axios.get('https://us.api.battle.net/account/user', {
      headers: {
        Authorization: 'Bearer ' + response.data.access_token
      }
    }).then((authRes) => {
      if (authRes.data.id) {
        authResponse.id = authRes.data.id
        authResponse.name = authRes.data.battletag
        
        // get user name/id, then check each region until characters are found
        async.tryEach([
          function getUS(callback) {
            getWoWProfile('us', response.data.access_token, callback)
          },
          function getEU(callback) {
            getWoWProfile('eu', response.data.access_token, callback)
          },
          function getTW(callback) {
            getWoWProfile('tw', response.data.access_token, callback)
          },
          function getKR(callback) {
            getWoWProfile('kr', response.data.access_token, callback)
          }
        ], (err, results) => {
          if (results) {
            authResponse.region = results.region
            authResponse.maxLevel = results.maxLevel
            authResponse.avatar = results.avatar
          }
          // success
          oAuthLogin(req, res, 'battlenet', authResponse)
        })
      }
      else {
        callback({error: 'no_account_found'})
      }
    }).catch((err) => {
      winston.error('failed battlenet user fetch', err)
      callback({error: 'no_account_found'})
    })
  }).catch((err) => {
    winston.error('failed battlenet auth', err)
    callback({error: 'no_account_found'})
  })
}

// Login through Discord
function discordAuth(req, res) {
  Axios.post('https://discordapp.com/api/oauth2/token', querystring.stringify({
    code: req.body.code || req.query.code,
    client_id: config.auth.discord.clientID,
    client_secret: config.auth.discord.clientSecret,
    redirect_uri: req.headers.origin + '/auth/discord',
    grant_type: 'authorization_code'
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then(function (response) {
    Axios.get('https://discordapp.com/api/v6/users/@me', {
      headers: {
        Authorization: 'Bearer ' + response.data.access_token
      }
    }).then(function (authResponse) {
      if (!authResponse.data.id) {
        return res.send(403, {error: "invalid_discord"})
      }

      // success
      oAuthLogin(req, res, 'discord', authResponse.data)
    })
  }).catch(function (err) {    
    winston.error('failed discord auth', err)
    res.send(500, err)
  })
}

// Login through facebook
function facebookAuth(req, res) {
  Axios.post('https://graph.facebook.com/v2.4/oauth/access_token', {
    code: req.body.code || req.query.code,
    client_id: config.auth.facebook.clientID,
    client_secret: config.auth.facebook.clientSecret,
    redirect_uri: req.headers.origin + '/auth/facebook',
  }).then(function (response) {
    var responseJson = response.data
    Axios.get('https://graph.facebook.com/v2.5/me', {params: { access_token: responseJson.access_token }}).then(function (authResponse) {
      if (!authResponse.data.id) {
        return res.send(403, {error: "invalid_facebook"})
      }

      // success
      oAuthLogin(req, res, 'facebook', authResponse.data)
    })
  }).catch(function (err) {    
    winston.error('failed facebook auth', err)
    res.send(500, err)
  })
}

// Login through Google
function googleAuth(req, res) {
  Axios.post('https://www.googleapis.com/oauth2/v4/token', querystring.stringify({
    code: req.body.code || req.query.code,
    client_id: config.auth.google.clientID,
    client_secret: config.auth.google.clientSecret,
    redirect_uri: req.headers.origin + '/auth/google',
    grant_type: 'authorization_code'
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.data && response.data.id_token){
      var profile = jwt.decode(response.data.id_token)
      oAuthLogin(req, res, 'google', profile)
    }
    else {
      res.send(500, {error: 'invalid token'})
    }
  }).catch(function (err) {
    winston.error('failed google auth', err)
    res.send(500, err)
  })
}

// Login through Patreon
function patreonAuth(req, res) {
  Axios.post('https://api.patreon.com/oauth2/token', querystring.stringify({
    code: req.query.code,
    client_id: config.auth.patreon.clientID,
    client_secret: config.auth.patreon.clientSecret,
    redirect_uri:  req.headers.origin + '/auth/patreon',
    grant_type: 'authorization_code'
  }), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  }).then((response) => {
    if (response.data.access_token) {
      Axios.get('https://api.patreon.com/oauth2/api/current_user', {
        headers: {
          Authorization: 'Bearer ' + response.data.access_token
        }
      })
      .then((userResponse) => {
        oAuthLogin(req, res, 'patreon', userResponse.data)
      })
      .catch(function (err) {
        res.send(500, err)
      })
    }    
  }).catch(function (err) {
    winston.error('failed patreon auth', err)
    res.send(500, err)
  })
}

// Login through Twitter
var Twitter = require("node-twitter-api")
global.twitterRequestSecrets = {}
function twitterAuth(req, res) {
  var twitter = new Twitter({
    consumerKey: config.auth.twitter.clientID,
    consumerSecret: config.auth.twitter.clientSecret,
    callback: req.headers.origin + '/auth/twitter',
  })
  if (!req.body.oauth_token) {
    twitter.getRequestToken(function(err, requestToken, requestSecret) {
      if (err)
        res.status(500).send(err);
      else {
        twitterRequestSecrets[requestToken] = requestSecret;
        res.send({requestToken: requestToken})
        // delete from memory and invalidate this req token after 1 minute
        setTimeout(function () {
          delete twitterRequestSecrets[requestToken]
        }, 60000)
      }
    })
  }
  else if (req.body.oauth_token && twitterRequestSecrets[req.body.oauth_token]) {
    twitter.getAccessToken(req.body.oauth_token, twitterRequestSecrets[req.body.oauth_token], req.body.oauth_verifier, function(err, accessToken, accessSecret) {
      if (err) {
        res.status(500).send(err)
      }
      else {
        twitter.verifyCredentials(accessToken, accessSecret, function(err, user) {
          if (err) {
            res.status(500).send(err);
          }
          else {
            oAuthLogin(req, res, 'twitter', user)
          }
        })
      }
    })
  }
  else {
    res.send({error: 'invalid_token'})
  }
}

function oAuthLogin(req, res, provider, authUser) {
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
      region: authUser.region
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
  
  case 'facebook':
    // id is not synced with previous version of wago, prefer to use email for lookups instead but somehow email is not always provided...? FB option somewhere?
    if (authUser.email) { 
      query = {"facebook.email": authUser.email}
    }
    else {
      query = {"facebook.id": authUser.id}
    }

    profile = {
      id: authUser.id, 
      name: authUser.name,
      email: authUser.email
    }
    newAcctName = authUser.name
    avatarURL = authUser.picture
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
    query = {"patreon.id": authUser.data.id}
    try {
      profile = {
        id: authUser.data.id,
        name: authUser.data.attributes.vanity || authUser.data.attributes.first_name
      }
      avatarURL = authUser.data.attributes.thumb_url
      if (authUser.data.relationships.pledges.data.length>0 && authUser.data.relationships.pledges.data[0].attributes) {
        profile.amount_cents = authUser.data.relationships.pledges.data[0].attributes.amount_cents
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

  case 'twitter':
    query = {"twitter.id": authUser.id_str}
    profile = {
      id: authUser.id_str,
      name: '@' + authUser.screen_name,
    }
    newAcctName = authUser.screen_name
    avatarURL = authUser.profile_image_url_https
  break

  }
  // if valid login
  User.findOne(query).then((oauthUser) => {
    // if already logged in and oauth matches
    if (req.user && ((oauthUser && req.user._id.equals(oauthUser._id)))) {
      image.avatarFromURL(avatarURL, req.user._id.toString(), provider, (img) => {
        if (!img.error) {
          profile.avatar = img
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
        req.user.save().then((user) => {
          var who = {}
          who.UID = user._id
          return makeSession(req, res, who, user)
        })
      })       
    }

    // if not registered then create a new account
    else if (!oauthUser) {
      var user
      if (req.user) {
        user = req.user
      } 
      else {
        user = new User()
      }
      image.avatarFromURL(avatarURL, user._id.toString(), provider, (img) => {
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
          user.save().then((newuser) => {
            var who = {}
            who.UID = newuser._id
            return makeSession(req, res, who, newuser)
          })
        }
        else {
          // if brand new user, check if we can use the username
          User.findByUsername(newAcctName).then((testUser) => {
            // if username exists then assign unique name
            if (testUser) {
              user.account.username = newAcctName + user._id.toString()
            }
            else {
              user.account.username = newAcctName
            }
            user.search.username = user.account.username.toLowerCase()

            user.save().then((newuser) => {
              var who = {}
              who.UID = newuser._id
              return makeSession(req, res, who, newuser)
            })
          })
        }
      })
    }

    // if oauth is registered in wago then update profile and log user in
    else if (oauthUser) {
      image.avatarFromURL(avatarURL, oauthUser._id.toString(), provider, (img) => {
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
        oauthUser[provider] = profile

        oauthUser.save().then((user) => {
          var who = {}
          who.UID = user._id
          return makeSession(req, res, who, user)
        })
      })
    }
  })
}


function getWoWProfile(region, token, callback) {
  var url
  switch (region) {
    case 'us':
      url = 'https://us.api.battle.net/wow/user/characters'
      break
    case 'eu':
      url = 'https://eu.api.battle.net/wow/user/characters'
      break
    case 'tw':
      url = 'https://tw.api.battle.net/wow/user/characters'
      break
    case 'kr':
      url = 'https://kr.api.battle.net/wow/user/characters'
      break
    default:
      console.log({error: 'unknown battlenet auth region', region: region})
      return callback(null)
  }
  
  Axios.get(url, { headers: { Authorization: 'Bearer ' + token } })
    .then((charRes) => {
      // if no characters found on this region then move on
      if (!charRes.data.characters || charRes.data.characters.length === 0) {
        return callback(null)
      }
      // if characters are found then loop through, find any 110s to flag account as human and use most recently updated for avatar
      var myCharacter = { lastModified: 1, region: region }
      charRes.data.characters.forEach((char) => {
        if (char.level >= 110) {
          myCharacter.maxLevel = true
          if (char.lastModified > myCharacter.lastModified) {
            myCharacter.lastModified = char.lastModified
            myCharacter.avatar = 'http://render-' + region + '.worldofwarcraft.com/character/' + char.thumbnail
          }          
        }
      })
      myCharacter.region = region
      callback(null, myCharacter)
    })
    .catch((err) => {
      callback(err)
    })
}