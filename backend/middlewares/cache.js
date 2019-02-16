module.exports = function (seconds) {
  if (!seconds) return this
  this.header('cache-control', `max-age=${seconds}`)
  return this
}