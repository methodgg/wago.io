module.exports = function(app) {
    var Patreon = require('./models/patreon')
    var User = require('./models/user')
    var bodyParser = require('body-parser')

    app.post('/webhook/patreon-create', function(req, res) {
        if (!req.validHook) {
            res.send({"error": "Invalid signature."})
            return false
        }

        var post = req.body
        var patron = new Patreon()
        try {
            var patron = new Patreon()
            patron.event_type = 'CREATE'
            patron.patron_id = req.body.data.relationships.patron.data.id
            patron.content = req.body
            patron.save()
        }
        catch (e) {
            console.error('error on patreon create webhook', e)
        }

        if (patron.patron_id) {
            // check if we have a user with a patreon account
            User.findOne({ 'patreon.id' : patron.patron_id }, function(err, user) {
                if (user) {
                    user.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                    user.patreon.created_at = patron.content.data.attributes.created_at;

                    user.roles.subscriber = false
                    if (user.patreon.amount_cents>=patron.subscriber_cents)
                        user.roles.subscriber = true

                    user.roles.gold_subscriber = false
                    if (user.patreon.amount_cents>=patron.gold_subscriber_cents)
                        user.roles.gold_subscriber = true

                    user.save()
                    res.send({'success': true})
                }
            })
        }
    })

    app.post('/webhook/patreon-update', function(req, res) {
        if (!req.validHook) {
            res.send({"error": "Invalid signature."})
            return false
        }

        var post = req.body
        var patron = new Patreon()
        try {
            var patron = new Patreon()
            patron.event_type = 'UPDATE'
            patron.patron_id = req.body.data.relationships.patron.data.id
            patron.content = req.body
            patron.save()
        }
        catch (e) {
            console.error('error on patreon update webhook', e)
        }

        if (patron.patron_id) {
            // check if we have a user with a patreon account
            User.findOne({ 'patreon.id' : patron.patron_id }, function(err, user) {
                if (user) {
                    user.patreon.amount_cents = patron.content.data.attributes.amount_cents;
                    user.patreon.created_at = patron.content.data.attributes.created_at;

                    user.roles.subscriber = false
                    if (user.patreon.amount_cents>=patron.subscriber_cents)
                        user.roles.subscriber = true

                    user.roles.gold_subscriber = false
                    if (user.patreon.amount_cents>=patron.gold_subscriber_cents)
                        user.roles.gold_subscriber = true

                    if (user.patreon.amount_cents>=100)
                    user.save()
                    res.send({'success': true})
                }
            })
        }
    })

    app.post('/webhook/patreon-delete', function(req, res) {
        if (!req.validHook) {
            res.send({"error": "Invalid signature."})
            return false
        }

        var post = req.body
        var patron = new Patreon()
        try {
            var patron = new Patreon()
            patron.event_type = 'DELETE'
            patron.patron_id = req.body.data.relationships.patron.data.id
            patron.content = req.body
            patron.save()
        }
        catch (e) {
            console.error('error on patreon delete webhook', e)
        }

        if (patron.patron_id) {
            // check if we have a user with a patreon account
            User.findOne({ 'patreon.id' : patron.patron_id }, function(err, user) {
                if (user) {
                    user.patreon.amount_cents = 0;
                    user.patreon.declined_since = Date.now;
                    user.roles.subscriber = false
                    user.roles.gold_subscriber = false
                    user.save()
                    res.send({'success': true})
                }
            })
        }

        // process patreon delete

        res.send({'success': true})
    })
}




