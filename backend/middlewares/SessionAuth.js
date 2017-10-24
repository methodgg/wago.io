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
    console.log('no token', (!userToken), (!req.headers.origin), (userToken !== req.cookies.token))
    return next()
  }
  // verify the token and set req.user
  jwt.verify(userToken, config.jwtSecret, function(err, token) {
    if (!err && token) {
      var SID = token.$__._id
      console.log('sid', SID)
      UserSessions.findById(SID).then(function(session) {
        // if session is expired or flagged as requiring a fresh login
        if (!session || session.requireLogin || session.expires < +new Date()) {
          console.log('sid not found')
          res.send({error: 'session_expired', requireLogin: true})
          // return next()
        }

        // if session is found then lookup user and set req.user
        User.findById(session.UID).then(function(doc) {
          if (doc) {
            req.user = doc
            req.user.SID = session.$__._id
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
            res.send({error: 'session_expired', requireLogin: true})
            // return next()
          }
        })
      })
    }
    else {
      console.log('token err', err, token)
    }
  })    
}