const md5 = require('md5')

module.exports = function (fastify, opts, next) {
  // get static data
  fastify.get('/:key', async (req, res) => {
    const data = await SiteData.findById(req.params.key).exec()
    if (data && !data.private) {
      var etag = 'W\\"' + md5(JSON.stringify(data)) + '"'
      if (req.headers['if-none-match'] === etag) {
        return res.code(304).send('')
      }
      res.header('Cache-Control', 'public, max-age=2592000, must-revalidate') // 1 month
      res.header('ETag', etag)
      res.send(data)
    }
    else {
      return res.code(404).send({error: "value_not_found"})
    }
  })

  next()
}