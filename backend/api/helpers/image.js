const config = require('../../config')
const cloudflare = require('cloudflare')({email: config.cloudflare.email, key: config.cloudflare.apiKey})
const sharp = require('sharp')
const hashFile = require('hash-file')
const mkdirp = require('mkdirp-promise')
const Magic = require('promise-mmmagic')
const magic = new Magic(Magic.MAGIC_MIME_TYPE)
const webpc = require('webp-converter')

module.exports = {
  avatarFromURL: async (url, userID) => {
    if (!url || !userID) {
      return {error: 'bad_input'}
    }

    var saveToDirectory = '/nfs/media/avatars/' + userID
    await mkdirp(saveToDirectory)
    var arraybuffer = await axios.request({
      responseType: 'arraybuffer',
      url: url,
      method: 'get'
    })
    var buffer = Buffer.from(arraybuffer.data, 'binary')

    try {
      const mime = await magic.detect(buffer)
      const match = mime.match(/^image\/(png|jpg|gif|jpeg|webp)/)
      // if valid mime type is detected then save file
      if (!match) {
        return {error: 'not_image'}
      }
      const time = Date.now()
      var webp = sharp(buffer).resize(64, 64).resize({fit: 'fill'}).toFormat('webp').toFile(saveToDirectory + '/u-' + time + '.webp')
      var png = sharp(buffer).resize(64, 64).resize({fit: 'fill'}).toFormat('png').toFile(saveToDirectory + '/u-' + time + '.png')
      await webp
      await png
      return {webp: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.png'}
    }
    catch (e) {
      req.trackError(e)
      return {error: 'invalid_image'}
    }
  },

  avatarFromBuffer: async (file, userID, avatarFormat) => {
    if (!file || !userID || !avatarFormat) {
      return {error: 'bad_input', inputs: [file, userID, avatarFormat]}
    }

    var saveToDirectory = '/nfs/media/avatars/' + userID
    await mkdirp(saveToDirectory)
    
    var time = Date.now()
    try {
      // if animated avatar format - must be gif format AND user must have access to animated avatars
      if (avatarFormat === 'animated') {
        await fs.writeFile(saveToDirectory + '/b-' + time + '.gif', file)
        var webp = await webpc.gwebp(saveToDirectory + '/b-' + time + '.gif', saveToDirectory + '/b-' + time + '.webp', '-q 90')
        if (webp.indexOf('100') >= 0) {
          return {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif', webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp'}
        }
        else {
          return {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif'}
        }
      }
      else {
        var webp = sharp(file).resize(64, 64).resize({fit: 'fill'}).toFormat('webp').toFile(saveToDirectory + '/b-' + time + '.webp')
        var png = sharp(file).resize(64, 64).resize({fit: 'fill'}).toFormat('png').toFile(saveToDirectory + '/b-' + time + '.png')
        await webp
        await png
        return {webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.png'}
      }
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  saveMdtPortraitMap: async (buffer, filename) => {
    if (!buffer || !filename) {
      return {error: 'bad_input', inputs: [buffer, filename]}
    }
    const saveToFile = '/nfs/media/mdt/' + filename

    var originalHash
    try {
      currentHash = await hashFile(saveToFile + '.webp')
    }
    catch (e) {
      currentHash = ''
    }
    try {
      var webp = sharp(buffer).toFormat('webp').toFile(saveToFile + '.webp')
      var png = sharp(buffer).toFormat('png').toFile(saveToFile + '.png')
      await webp
      await png
      var newHash = await hashFile(saveToFile + '.webp')
      if (newHash !== originalHash) {
        cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: [img.png, img.webp]})
      }
      return {web: 'https://media.wago.io/mdt/' + filename + '.webp', png: 'https://media.wago.io/mdt/' + filename + '.png'}
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  createTwitterCard: async (file, title) => {
    if (!file) {
      return false
    }
    title = title.replace(/[<>]/g, ' ')
    if (title.length > 45) {
      title = title.substr(0, 45)
    }
    var svg = `
    <svg height="314" width="600">
      <defs>
        <style>
          @font-face {font-family: Roboto; src: url(/nfs/media/fonts/Roboto-Regular.ttf);}
        </style>
      </defs>
      <text x="50%" y="37" fill="#FFFFFF" text-anchor="middle" alignment-baseline="central" font-family="'Roboto'" style="font-size: 22;">${title}</text>
    </svg>`
    var metaImg = await sharp(new Buffer.from(svg)).png()
    var image = await sharp('/nfs/media/site/twitter-card-bg.jpg').overlayWith(await metaImg.toBuffer(), {top: 0, left: 0}).toBuffer()
    const screenshot = await sharp(await fs.readFile('/nfs/media/screenshots' + file)).resize({width: 363, height: 226, fit: 'inside', position: 'right', background:{r:0, g: 0, b: 0, alpha: 0}}).extend(4)
    const {width, height} = await screenshot.metadata()
    image = await sharp(image).overlayWith(await screenshot.toBuffer(), {left: 199 + Math.max(0, Math.round((562 - width) / 2)), top: 48 + Math.max(0, Math.round((274 - height) / 2))}).jpeg().toBuffer()
    return image
  }
}
