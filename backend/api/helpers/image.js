const config = require('../../config')
const cloudflare = require('cloudflare')({email: config.cloudflare.email, key: config.cloudflare.apiKey})
const sharp = require('sharp')
const hashFile = require('hash-file')
const mkdirp = require('mkdirp-promise')
const Magic = require('promise-mmmagic')
const magic = new Magic(Magic.MAGIC_MIME_TYPE)
const webpc = require('webp-converter')
const rimraf = require('rimraf')
const nothing = () => {}

const tmpDir = __dirname + '/../../run-tmp/'

module.exports = {
  avatarFromURL: async (url, userID) => {
    if (!url || !userID) {
      return {error: 'bad_input'}
    }

    const saveToDirectory = tmpDir + userID
    await mkdirp(saveToDirectory)
    const arraybuffer = await axios.request({
      responseType: 'arraybuffer',
      url: url,
      method: 'get'
    })
    const buffer = Buffer.from(arraybuffer.data, 'binary')

    try {
      const mime = await magic.detect(buffer)
      const match = mime.match(/^image\/(png|jpg|gif|jpeg|webp)/)
      // if valid mime type is detected then save file
      if (!match) {
        return {error: 'not_image'}
      }
      const time = Date.now()
      const webp = sharp(buffer).resize(64, 64).resize({fit: 'fill'}).toFormat('webp').toFile(saveToDirectory + '/u-' + time + '.webp')
      const png = sharp(buffer).resize(64, 64).resize({fit: 'fill'}).toFormat('png').toFile(saveToDirectory + '/u-' + time + '.png')
      await webp
      await png
      const uploadPromise = new Promise(resolve => {
        const uploader = s3.uploadDir({
          localDir: saveToDirectory,
          s3Params: {
            Bucket: 'wago-media',
            Prefix: `avatars/${userID}/`
          }
        })
        uploader.on('error', err => {
          resolve({error: 'invalid_image'})
          rimraf(saveToDirectory, nothing)
        })
        uploader.on('end', () => {
          resolve({webp: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.png'})
          rimraf(saveToDirectory, nothing)
        })
      })
      return await uploadPromise
    }
    catch (e) {
      rimraf(saveToDirectory, nothing)
      return {error: 'invalid_image'}
    }
  },

  avatarFromBuffer: async (file, userID, avatarFormat) => {
    if (!file || !userID || !avatarFormat) {
      return {error: 'bad_input', inputs: [file, userID, avatarFormat]}
    }

    const saveToDirectory = tmpDir + userID
    await mkdirp(saveToDirectory)

    const time = Date.now()
    var returnData = {}
    try {
      // if animated avatar format - must be gif format AND user must have access to animated avatars
      if (avatarFormat === 'animated') {
        await fs.writeFile(saveToDirectory + '/b-' + time + '.gif', file)
        const webp = await webpc.gwebp(saveToDirectory + '/b-' + time + '.gif', saveToDirectory + '/b-' + time + '.webp', '-q 90')
        if (webp.indexOf('100') >= 0) {
          returnData = {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif', webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp'}
        }
        else {
          returnData = {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif'}
        }
      }
      else {
        const webp = sharp(file).resize(64, 64).resize({fit: 'fill'}).toFormat('webp').toFile(saveToDirectory + '/b-' + time + '.webp')
        const png = sharp(file).resize(64, 64).resize({fit: 'fill'}).toFormat('png').toFile(saveToDirectory + '/b-' + time + '.png')
        await webp
        await png
        returnData = {webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.png'}
      }
      const uploadPromise = new Promise(resolve => {
        const uploader = s3.uploadDir({
          localDir: saveToDirectory,
          s3Params: {
            Bucket: 'wago-media',
            Prefix: `avatars/${userID}/`
          }
        })
        uploader.on('error', err => {
          resolve({error: 'invalid_image'})
          rimraf(saveToDirectory, nothing)
        })
        uploader.on('end', () => {
          resolve(returnData)
          rimraf(saveToDirectory, nothing)
        })
      })
      return await uploadPromise
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  saveMdtPortraitMap: async (buffer, filename) => {
    if (!buffer || !filename) {
      return {error: 'bad_input', inputs: [buffer, filename]}
    }

    const saveToDirectory = tmpDir + 'mdt/'
    await mkdirp(saveToDirectory)
    const saveToFile = saveToDirectory + filename

    try {
      const webp = sharp(buffer).toFormat('webp').toFile(saveToFile + '.webp')
      const png = sharp(buffer).toFormat('png').toFile(saveToFile + '.png')
      await webp
      await png
      const uploadPromise = new Promise(resolve => {
        const uploader = s3.uploadDir({
          localDir: saveToDirectory,
          s3Params: {
            Bucket: 'wago-media',
            Prefix: 'mdt/'
          }
        })
        uploader.on('error', err => {
          resolve({error: 'invalid_image'})
        })
        uploader.on('end', () => {
          cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: [img.png, img.webp]})
          resolve({web: 'https://media.wago.io/mdt/' + filename + '.webp', png: 'https://media.wago.io/mdt/' + filename + '.png'})
        })
      })
      return await uploadPromise
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
          @font-face {font-family: Roboto; src: url(https://media.wago.io/fonts/Roboto-Regular.ttf);}
        </style>
      </defs>
      <text x="50%" y="37" fill="#FFFFFF" text-anchor="middle" alignment-baseline="central" font-family="'Roboto'" style="font-size: 22;">${title}</text>
    </svg>`
    const backgroundFile = await axios.request({
      responseType: 'arraybuffer',
      url: 'https://media.wago.io/site/twitter-card-bg.jpg',
      method: 'get'
    })
    const backgroundBuffer = Buffer.from(backgroundFile.data, 'binary')
    const screenshotFile = await axios.request({
      responseType: 'arraybuffer',
      url: `https://media.wago.io/screenshots/${file}`,
      method: 'get'
    })
    const screenshotBuffer = Buffer.from(screenshotFile.data, 'binary')
    var metaImg = await sharp(new Buffer.from(svg)).png()
    var image = await sharp(backgroundBuffer).overlayWith(await metaImg.toBuffer(), {top: 0, left: 0}).toBuffer()
    const screenshot = await sharp(screenshotBuffer).resize({width: 363, height: 226, fit: 'inside', position: 'right', background:{r:0, g: 0, b: 0, alpha: 0}}).extend(4)
    const {width, height} = await screenshot.metadata()
    image = await sharp(image).overlayWith(await screenshot.toBuffer(), {left: 199 + Math.max(0, Math.round((562 - width) / 2)), top: 48 + Math.max(0, Math.round((274 - height) / 2))}).jpeg().toBuffer()
    return image
  }
}
