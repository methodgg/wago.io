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

  fastify.get('/webhooks/test', async (req, res) => {
    const body = {
            "type": "user.upserted",
            "payload": {
            "id": "659352af8e4e111509caa7ad",
            "username": "René659352af8e4e111509caa7ad",
            "email": null,
            "avatar": "https://media.wago.io/avatars/659352af8e4e111509caa7ad/u-1705696013597.webp",
            "email_verified_at": null,
            "created_at": "2024-01-02T00:02:55.000000Z",
            "updated_at": "2024-08-12T22:22:13.000000Z",
            "is_creator": false,
            "is_admin": false,
            "socialLogins": {
                "patreon": "68549595"
            },
            "benefits": [],
            "creator_subscriptions": []
            }
        }
        const payloadString = (JSON.stringify(body)).replace(/\//g, '\\/')
        const expected = 'f7078927ba77af94a5cef86464f1e50e8ab078ca04714a0e9eddb58bf85423aa'

        const computedSignature = crypto
            .createHmac('sha256', config.wagoAuthKey)
            .update(payloadString, 'utf8')
            .digest('hex')
        console.log(expected, computedSignature)
  })

  fastify.post('/webhooks/wago-account', async (req, res) => {
    const payloadString = (JSON.stringify(req.body)).replace(/\//g, '\\/')

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