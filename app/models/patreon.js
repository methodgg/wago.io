// app/models/patreon.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our patreon model
// stores data from patreon webhooks
var PatreonSchema = mongoose.Schema({
    event_date: { type: Date, default: Date.now },
    event_type: String,
    patron_id: String,
    content: mongoose.Schema.Types.Mixed
});

PatreonSchema.virtual('subscriber_cents').get(function() {
    return 100
})
PatreonSchema.virtual('gold_subscriber_cents').get(function() {
    return 400
})

// create the model for users and expose it to our app
module.exports = mongoose.model('Patreon', PatreonSchema);