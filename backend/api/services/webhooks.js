const crypto = require('crypto')

module.exports = function (fastify, opts, next) {
  // Allow github webhook to post and trigger addon update task
  fastify.post('/tasks/addons', async (req, res) => {
    if (!req.headers['user-agent'].match(/^GitHub-Hookshot\//) ) {
      return res.code(403).send({error: 'invalid_access'})
    }
    await taskQueue.add('UpdateLatestAddonReleases', null, {priority: 3})
    res.send({done: true})
  })

  fastify.post('/webhooks/wago-account', async (req, res) => {
    const body = JSON.stringify(req.body)
    const computedSignature = crypto
        .createHmac('sha256', config.wagoAuthKey)
        .update(body, 'utf8')
        .digest('hex')

    if (computedSignature !== req.headers['signature']) {
        return res.status(401).send({error: 'invalid_signature'})
    }

    try {
        query = { _id: ObjectId(req.body.id) }
    }
    catch {
        query = { "wagoAuth.id": req.body.id }
    }

    const user = await User.findOne(query)
    if (!user) {
        return res.status(400).send({error: 'user_not_found'})
    }

    if (req.body.username) {
        user.account.username = req.body.username
    }
    if (req.body.avatar?.endsWith('.gif')) {
        user.profile.avatar = {gif: req.body.avatar}        
    }
    else if (req.body.avatar?.endsWith('.webp')) {
        user.profile.avatar = {webp: req.body.avatar}        
    }
    else if (req.body.avatar?.endsWith('.png')) {
        user.profile.avatar = {png: req.body.avatar}        
    }

    user.wagoAuth = {
        id: req.body.id,
        name: req.body.username,
    }

    if (req.body.socialLogins?.discord) {
        user.discord.id = req.body.socialLogins.discord
    }
    if (req.body.socialLogins?.battlenet) {
        user.battlenet.id = req.body.socialLogins.battlenet
        if (req.body.wowChars?.length) {
            user.battle.net.characters = req.body.wowChars
        }
    }
    
    user.roles.subscriber = req.body.benefits?.includes('green_name_tag')
    user.roles.gold_subscriber = req.body.benefits?.includes('gold_name_tag')
    user.account.verified_human = user.account.verified_human || user.roles.subscriber || user.roles.gold_subscriber || Boolean(req.body.email_verified_at)

    await user.save()
    res.send({done: true})
  })

  next()
}