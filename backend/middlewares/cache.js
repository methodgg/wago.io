module.exports = function (seconds) {
  if (!seconds) return this
  this.header('cache-control', `public, max-age=${seconds}`)
  return this
}