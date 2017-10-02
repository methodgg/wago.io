server.get('/ping', (req, res, next) => {
  res.send({pong: true})
})