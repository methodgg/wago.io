
const advert = require('../helpers/advert')

module.exports = async function (connection, req) {
  if (req.query.cid) {
    // const stream = await advert.determineStream(req.query.cid)
    // connection.socket.send(JSON.stringify({setStream: stream}))
  }
}