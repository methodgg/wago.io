
const jwt = require('jsonwebtoken')
const config = require('../config')
const ObjectId = require('mongoose').Types.ObjectId

module.exports = async function(req, res) {
    req.internalAuthRequest = (req.headers['wago-auth-key'] === config.wagoAuthKey)
    
    if (req.raw.url.match(/^\/(api|lookup)\//) && (req.headers['api-key'] || req.query.key)) {
        const apiKey = req.headers['api-key'] ?? req.query.key
        if (!apiKey) {
            return
        }

        let user
        if (apiKey.length === 64) {
            user = await User.findByAPIKey(apiKey)
            if (user) {
                req.user = user
                return
            }
        }

        try {
            let accountID = await redis.get(`apiauth:${apiKey}`)
            if (!accountID && apiKey.match(/^[A-Za-z0-9_-]{2,}(?:\.[A-Za-z0-9_-]{2,}){2}$/)) {
                const accountLookup = await axios.get('https://accounts.wago.io/api/users', {
                    headers: {
                        Authorization: 'Bearer ' + apiKey,
                        "User-Agent": `Wago.io Backend/${config.gitref}`,
                        "X-Auth-Type": "api-key",
                        "X-Client-User-Agent": req.headers['user-agent'],
                        "X-URL": req.raw.url
                    }
                })
                accountID = accountLookup?.data?.id
            }
            if (accountID) {
                let query
                try {
                    query = { _id: ObjectId(accountID) }
                }
                catch {
                    query = { "wagoAuth.id": accountID }
                }
                const user = await User.findOne(query)
                if (user) {
                    redis.set(`apiauth:${apiKey}`, user._id, 'EX', 120)
                    req.user = user
                    return
                }
            }
        }
        catch (error) {
            LoggedMsg.write('API_KEY_ERROR', error.message, {
                message: error?.message,
                name: error?.name,
                url: req.url,
                host: config.host,
                stack: error?.stack,
                config: error?.config,
                code: error?.code,
                status: error?.response?.status,
                data: error?.response?.data,
                headers: error?.response?.headers
            })
        }
        return // let the invividual routes handle no-user errors so that public data will still work with invalid keys
        return res.code(401).send({msg: 'Invalid API Key'}) 
    }

    var userToken = req.headers['x-auth-token']
    var decoded = await jwtDecode(userToken)
    if (!decoded || !decoded._id) {
        return
    }

    var session = await UserSessions.findById(decoded._id).exec()
    // if session is expired or flagged as requiring a fresh login
    if (!session || session.requireLogin || session.expires < +new Date()) {
        return
    }

    // if session is found then lookup user and set req.user
    var user = await User.findById(session.UID).exec()
    if (user) {
        req.user = user
        req.user.SID = session._id
        req.user.isAdmin = user.roles.isAdmin

        // fix any invalid search field when they auth
        if (user.search?.username !== user.account.username.toLowerCase()) {
            user.search.username = user.account.username.toLowerCase()
            await user.save()
        }
    }
    return 
}

async function jwtDecode(token) {
  return new Promise((resolve) => {
    try {
      jwt.verify(token, config.jwtSecret, function(err, decoded) {
        if (err) {
          return resolve(false)
        }
        return resolve(decoded)
      })
    }
    catch (e) {
      return resolve(false)
    }
  })
}