const crypto = require('crypto')
const ObjectId = require('mongoose').Types.ObjectId

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
    const payloadString = phpJsonEncode(req.body)

    const computedSignature = crypto
        .createHmac('sha256', config.wagoAuthKey)
        .update(payloadString, 'utf8')
        .digest('hex')

    if (computedSignature !== req.headers['signature']) {
        LoggedMsg.write('FAILED_AUTH_WH', "invalid webhook signature", {
            type: req.body.type,
            body: req.body,
            computedSignature,
            expectedSignature: req.headers['signature']
        })
        return res.status(401).send({error: 'invalid_signature'})
    }

    if (req.body.type !== 'user.upserted') {
        LoggedMsg.write('FAILED_AUTH_WH', "invalid type", {
            type: req.body.type,
            body: req.body
        })
        return res.status(400).send({error: 'unknown_type'})
    }

    const payload = req.body.payload
    let query
    try {
        query = { _id: ObjectId(payload.id) }
    }
    catch {
        query = { "wagoAuth.id": payload.id }
    }

    const user = await User.findOne(query)
    if (!user) {
        return res.send({error: 'new_user'})
    }

    if (payload.username) {
        user.account.username = payload.username
        user.search.username = payload.username.toLowerCase()
    }
    if (payload.avatar?.endsWith('.gif')) {
        user.profile.avatar = {gif: payload.avatar}        
    }
    else if (payload.avatar?.endsWith('.webp')) {
        user.profile.avatar = {webp: payload.avatar}        
    }
    else if (payload.avatar?.endsWith('.png')) {
        user.profile.avatar = {png: payload.avatar}        
    }

    user.wagoAuth = {
        id: payload.id,
        name: payload.username,
    }

    if (payload.socialLogins?.discord) {
        user.discord.id = payload.socialLogins.discord
    }
    if (payload.socialLogins?.battlenet) {
        user.battlenet.id = payload.socialLogins.battlenet
        if (payload.wowChars?.length) {
            user.battle.net.characters = payload.wowChars
        }
    }
    
    user.roles.subscriber = payload.benefits?.includes('green_name_tag')
    user.roles.gold_subscriber = payload.benefits?.includes('golden_name_tag')
    user.account.verified_human = user.account.verified_human || user.roles.subscriber || user.roles.gold_subscriber || Boolean(payload.email_verified_at)

    await user.save()
    res.send({done: true})
  })

  next()
}


function phpJsonEncode(obj) {
    // Use JSON.stringify to get the initial JSON string
    let jsonString = JSON.stringify(obj);

    // Escape forward slashes
    jsonString = jsonString.replace(/\//g, '\\/');

    // Convert UTF-8 characters to \uXXXX format
    jsonString = jsonString.replace(/[\u007F-\uFFFF]/g, function (c) {
        return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
    });

    return jsonString;
}