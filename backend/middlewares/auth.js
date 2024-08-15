
const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = async function(req, res) {
    req.internalAuthRequest = (req.headers['wago-auth-key'] === config.wagoAuthKey)
    
    if (req.raw.url.match(/^\/api\//)) {
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
            const accountLookup = await axios.get('https://accounts.wago.io/api/users', {
                headers: {
                    Authorization: 'Bearer ' + apiKey
                }
            })
            if (accountLookup?.data?.id) {
                let query
                try {
                    query = { _id: ObjectId(accountLookup.id) }
                }
                catch {
                    query = { "wagoAuth.id": accountLookup.id }
                }
                const user = await User.findOne(query)
                if (user) {
                    req.user = user
                    return
                }
            }
        }
        catch {}
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