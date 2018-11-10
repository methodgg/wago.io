const jwt = require('jsonwebtoken')
const config = require('../config')

module.exports = function(req, res, next) {
  var userToken = req.headers['x-auth-token']
  
  // if no user token is supplied or if someone is trying some shady XSS stuff then do not give any user access
  var validCookieToken = (req.cookies && userToken === req.cookies.token)
  if (process.env.NODE_ENV === 'development') {
    validCookieToken = true 
  }
  if (!userToken || !req.headers.origin || !validCookieToken) {
    return next()
  }
  // verify the token and set req.user
  jwt.verify(userToken, config.jwtSecret, function(err, token) {
    var SID
    // not entirely sure why this changes?
    if (token && token.$__ && token.$__.id) {
      SID = token.$__.id
    }
    else if (token && token._doc && token._doc._id) {
      SID = token._doc._id
    }
    else if (token && token._id) {
      SID = token._id
    }
    if (!err && SID) {
      UserSessions.findById(SID).then(function(session) {
        // if session is expired or flagged as requiring a fresh login
        if (!session || session.requireLogin || session.expires < +new Date()) {
          // return res.send({error: 'session_expired', requireLogin: true})
          return next()
        }

        // if session is found then lookup user and set req.user
        User.findById(session.UID).then(function(doc) {
          if (doc) {
            req.user = doc
            req.user.SID = session._id
            req.user.admin = doc.roles.admin || doc.roles.super_admin

            async.parallel({
              comments: (cb) => {
                Comments.findUnread(req.user._id).then((mentions) => {
                  req.user.unreadMentions = mentions
                  cb()
                })
              },
        
              collections: (cb) => {
                WagoItem.find({_userId: req.user._id, type: 'COLLECTION'}).select('_id name').sort('name').then((collections) => {
                  var arr = []
                  collections.forEach((c) => {
                    arr.push(c._id)
                  })
                  req.user.collections = arr
                  cb()
                })
              }
            }, () => {
              return next()
            })
          }
          else {
            // return res.send({error: 'session_expired', requireLogin: true})
            return next()
          }
        })
      })
    }
    else {
      logger.error({label: 'User token error', error: err, token: token})
      next()
    }
  })    
}