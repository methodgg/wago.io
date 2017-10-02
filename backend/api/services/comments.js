var discord = require('../helpers/discord')

server.post('/comments/new', (req, res, next) => {
  if (!req.user || !req.body.wagoID || !req.body.text) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).populate('_userId').then((wago) => {
    if (!wago) {
      return res.send(404, {error: "no_wago"})
    }

    wago.popularity.comments_count++
    wago.last_comment = Date.now()
    wago.save()

    var comment = {
      wagoID: req.body.wagoID,
      authorID: req.user._id,
      commentText: req.body.text,
      postDate: Date.now()
    }

    var tagged = []

    console.log(wago._userId._id.equals(req.user._id))

    if (wago._userId && wago._userId._id && wago._userId._id.equals(req.user._id)) {
        tagged.push({userID: wago._userId._id})
        comment.commentText = comment.commentText.replace('@' + wago._userId.profile.name, '[taggeduser]@' + wago._userId.profile.name + '[/taggeduser]')
        discord.sendMessage(wago._userId, 'messageOnComment', req.user.profile.name+" has posted a comment on your Wago **"+wago.name+"**.\n"+wago.url+"\n\n"+comment.commentText)
    }

    var re = /\b@([^.,\/@#!$%\^&\*;:{}=`~()\s]+)\b/g
    mentions = []
    while ((m = re.exec(comment.commentText)) !== null) {
      mentions.push(m[1])
    }

    async.eachOf(mentions, (username, key, cb) => {
      User.findByUsername(username).then((user) => {
        if (!user || (wago._userId && wago._userId._id && wago._userId._id.equals(user._id))) {
          return cb()
        }
        else {
          comment.commentText = comment.commentText.replace('@' + user.profile.name, '[taggeduser]@' + user.profile.name + '[/taggeduser]')
          tagged.push(user._id)
          discord.sendMessage(user, 'messageOnComment', req.user.profile.name+" has tagged you in a posted comment for Wago **"+wago.name+"**.\n"+wago.url+"\n\n"+comment.commentText)
          return cb()
        }
      })
    }, () => {
      comment.usersTagged = tagged
      new Comments(comment).save().then((doc) => {
        var c = [{ 
          cid: doc._id,
          date: Date.now(),
          text: doc.commentText,
          format: 'bbcode',
          author: {
            name: req.user.profile.name,
            avatar: req.user.avatarURL,
            class: req.user.roleclass,
            profile: req.user.profile.url,
            enableLinks: req.user.account.verified_human            
          }
        }]
        res.send(c)
      })
    })
  })
})