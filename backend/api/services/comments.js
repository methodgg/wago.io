var discord = require('../helpers/discord')

module.exports = function (fastify, opts, next) {
  // post a new comment
  fastify.post('/new', async (req, res, next) => {
    if (!req.user || !req.body.wagoID || !req.body.text) {
      return res.code(403).send({error: "forbidden"})
    }

    var wago = await WagoItem.findById(req.body.wagoID).populate('_userId').exec()
    if (!wago) {
      return res.code(404).send({error: "no_wago"})
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

    comment.usersTagged = []

    if (wago._userId && wago._userId._id && !wago._userId._id.equals(req.user._id)) {
      comment.usersTagged.push({userID: wago._userId._id.toString()})
      comment.commentText = comment.commentText.replace('@' + wago._userId.profile.name, '[taggeduser]@' + wago._userId.profile.name + '[/taggeduser]')
      discord.onComment(req.user, wago._userId, wago)
    }

    var re = /@([^.,\/@#!$%\^&\*;:{}=`~()\s\[\]]+)/g
    mentions = []
    while ((m = re.exec(comment.commentText)) !== null) {
      mentions.push(m[1])
    }

    await Promise.all(mentions.map(async (username) => {
      const user = await User.findByUsername(username)
      if (!user || comment.usersTagged.indexOf(user._id.toString()) >= 0 || (wago._userId && wago._userId._id && wago._userId._id.equals(user._id))) {
        return
      }
      else {
        comment.commentText = comment.commentText.replace('@' + user.profile.name, '[taggeduser]@' + user.profile.name + '[/taggeduser]')
        comment.usersTagged.push({userID: user._id.toString()})
        discord.onComment(req.user, user, wago)
        return
      }
    }))
    var doc = await new Comments(comment).save()
    var c = [{ 
      cid: doc._id,
      date: Date.now(),
      text: doc.commentText,
      format: 'bbcode',
      canMod: true,
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

  // delete a comment
  fastify.post('/delete', async (req, res) => {
    if (!req.user || !req.body.comment) {
      return res.code(403).send({error: "forbidden"})
    }

    var comment = await Comments.findById(req.body.comment).exec()
    var wago = await WagoItem.findById(comment.wagoID).exec()
    // if user is moderator, comment author or wago owner then allow delete
    if ((req.user.isAdmin && (req.user.isAdmin.super || req.user.isAdmin.moderator)) || (req.user._id.equals(comment.authorID)) || (req.user._id.equals(wago._userId))) {
      wago.popularity.comments_count--
      wago.save()
      comment.remove()
      return res.send({success: true})
    }
    else {
      return res.code(403).send({error: "forbidden"})
    }
  })

  fastify.post('/clear', async (req, res) => {
    if (!req.user || !req.body.comment) {
      return res.code(403).send({error: "forbidden"})
    }

    var comment = await Comments.findById(req.body.comment).exec()
    for (let i = 0; i < comment.usersTagged.length; i++) {
      if (comment.usersTagged[i].userID.equals(req.user._id) && !comment.usersTagged[i].read) {
        comment.usersTagged[i].read = true
        comment.save()
        return res.send({success: true})
      }
    }
  })

  next()
}