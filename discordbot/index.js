// setup discord bot
const Eris = require("eris")

const config = require('../backend/config')
var bot = new Eris(config.discordBotKey)

bot.on("ready", function() { // When the bot is ready
  console.log("Discord bot is alive!")
})

bot.connect() // Get the bot to connect to Discord


// setup express server
var express = require('express')
var app = express()
var bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(9999)
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/sendtext', function (req, res) {
  // console.log(req.body)
  var text = req.body.message
  var profileID = req.body.profileID
  bot.getDMChannel(profileID).then(function(channel) {
    // console.log('channel found', channel, channel.id)
    bot.createMessage(channel.id, text).then(function() {
    // console.log('message sent')
    })
  })
})

