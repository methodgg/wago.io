const config = require('../../config')
const cloudflare = require('cloudflare')({token: config.cloudflare.dnsToken})
const sharp = require('sharp')
const fs = require('fs')
const FileType = require('file-type')
const webpc = require('webp-converter')
const s3 = require('../helpers/s3Client')

const tmpDir = __dirname + '/../../run-tmp'

module.exports = {
  avatarFromURL: async (url, userID) => {
    if (!url || !userID) {
      return {error: 'bad_input'}
    }

    try {
      const arraybuffer = await axios.request({
        responseType: 'arraybuffer',
        url: url,
        method: 'get'
      })
      const buffer = Buffer.from(arraybuffer.data, 'binary')

      const f = await FileType.fromBuffer(buffer)
      const match = f.mime.match(/^image\/(png|jpg|gif|jpeg|webp)/)
      // if valid mime type is detected then save file
      if (!match) {
        return {error: 'not_image'}
      }
      const time = Date.now()
      const webp = sharp(buffer).resize(64, 64).toFormat('webp').toFile(tmpDir + '/u-' + time + '.webp')
      const png = sharp(buffer).resize(64, 64).toFormat('png').toFile(tmpDir + '/u-' + time + '.png')
      await webp
      await png
      const webpUpload = s3.uploadFile({
        localFile: tmpDir + '/u-' + time + '.webp',
        s3Params: {
          Bucket: 'wago-media',
          Key: `avatars/${userID}/u-${time}.webp`
        }
      })
      const pngUpload = s3.uploadFile({
        localFile: tmpDir + '/u-' + time + '.png',
        s3Params: {
          Bucket: 'wago-media',
          Key: `avatars/${userID}/u-${time}.png`
        }
      })
      await webpUpload
      await pngUpload
      fs.unlink(`${tmpDir}/u-${time}.webp`)
      fs.unlink(`${tmpDir}/u-${time}.png`)
      return {webp: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/u-' + time + '.png'}
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  avatarFromBuffer: async (file, userID, avatarFormat) => {
    if (!file || !userID || !avatarFormat) {
      return {error: 'bad_input', inputs: [file, userID, avatarFormat]}
    }

    const time = Date.now()
    var returnData = {}
    try {
      // if animated avatar format - must be gif format AND user must have access to animated avatars
      if (avatarFormat === 'animated') {
        await fs.writeFile(tmpDir + '/b-' + time + '.gif', file)
        const webp = await webpc.gwebp(tmpDir + '/b-' + time + '.gif', tmpDir + '/b-' + time + '.webp', '-q 90')
        if (webp.indexOf('100') >= 0) {
          returnData = {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif', webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp'}
        }
        else {
          returnData = {gif: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.gif'}
        }

        const webpUpload = s3.uploadFile({
          localFile: tmpDir + '/b-' + time + '.webp',
          s3Params: {
            Bucket: 'wago-media',
            Key: `avatars/${userID}/b-${time}.webp`
          }
        })
        const gifUpload = s3.uploadFile({
          localFile: tmpDir + '/b-' + time + '.gif',
          s3Params: {
            Bucket: 'wago-media',
            Key: `avatars/${userID}/b-${time}.gif`
          }
        })
        await webpUpload
        await gifUpload
        fs.unlink(`${tmpDir}/b-${time}.webp`)
        fs.unlink(`${tmpDir}/b-${time}.gif`)
      }
      else {
        const webp = sharp(file).resize(64, 64).toFormat('webp').toFile(tmpDir + '/b-' + time + '.webp')
        const png = sharp(file).resize(64, 64).toFormat('png').toFile(tmpDir + '/b-' + time + '.png')
        await webp
        await png
        const webpUpload = s3.uploadFile({
          localFile: tmpDir + '/b-' + time + '.webp',
          s3Params: {
            Bucket: 'wago-media',
            Key: `avatars/${userID}/b-${time}.webp`
          }
        })
        const pngUpload = s3.uploadFile({
          localFile: tmpDir + '/b-' + time + '.png',
          s3Params: {
            Bucket: 'wago-media',
            Key: `avatars/${userID}/b-${time}.png`
          }
        })
        await webpUpload
        await pngUpload
        fs.unlink(`${tmpDir}/b-${time}.webp`)
        fs.unlink(`${tmpDir}/b-${time}.png`)
        returnData = {webp: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.webp', png: 'https://media.wago.io/avatars/' + userID + '/b-' + time + '.png'}
      }
      return returnData
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  gifToPng (gif, id) {
    return new Promise(async (resolve, reject) => {
      try {
        const time = Date.now()
        const localGif = `${tmpDir}/u-${time}.gif`
        const localPng = `${tmpDir}/u-${time}.png`
        const remotePng = `screenshots/${id}/${time}.png`

        if (typeof gif === 'string' && gif.match(/^https:\/\/media\.wago\.io\//)) {
          const m = gif.match(/^https:\/\/media\.wago\.io\/(\w+\/[\w-]+\/.+\.gif)$/)
          if (!m || !m[1].match(/\.gif$/)) {
            console.log(gif, m)
            return reject(false)
          }
          await s3.getFile ({
            Bucket: 'wago-media',
            Key: decodeURIComponent(m[1])
          }, localGif)
        }

        await sharp(localGif).toFormat('png').toFile(localPng)

        await s3.uploadFile({
          localFile: localPng,
          s3Params: {
            Bucket: 'wago-media',
            Key: remotePng
          }
        })
        fs.unlink(localGif, ()=>{})
        fs.unlink(localPng, ()=>{})
        return resolve(`https://media.wago.io/${remotePng}`)
      }
      catch (e) {
        console.log(e)
        console.log(gif, id)
        reject()
      }
    })
  },

  saveMdtPortraitMap: async (buffer, filename) => {
    if (!buffer || !filename) {
      return {error: 'bad_input', inputs: [buffer, filename]}
    }

    const saveToFile = tmpDir + '/' + filename
    try {
      await sharp(buffer).toFormat('webp').toFile(saveToFile + '.webp')
      await sharp(buffer).toFormat('png').toFile(saveToFile + '.png')

      await s3.uploadFile({
        localFile: saveToFile + '.webp',
        s3Params: {
          Bucket: 'wago-media',
          Key: `mdt/${filename}.webp`
        }
      })
      await s3.uploadFile({
        localFile: saveToFile + '.png',
        s3Params: {
          Bucket: 'wago-media',
          Key: `mdt/${filename}.png`
        }
      })
      const img = {webp: 'https://media.wago.io/mdt/' + filename + '.webp', png: 'https://media.wago.io/mdt/' + filename + '.png'}
      cloudflare.zones.purgeCache(config.cloudflare.zoneID, {files: [img.png, img.webp]})
      return img
    }
    catch (e) {
      return {error: 'invalid_image'}
    }
  },

  createTwitterCardOld: async (file, title) => {
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
    var image = await sharp(backgroundBuffer).composite([{input: await metaImg.toBuffer(), top: 0, left: 0}]).toBuffer()
    const screenshot = await sharp(screenshotBuffer).resize({width: 363, height: 226, fit: 'inside', position: 'right', background:{r:0, g: 0, b: 0, alpha: 0}}).extend(4)
    const {width, height} = await screenshot.metadata()
    image = await sharp(image).composite([{input: await screenshot.toBuffer(), left: 199 + Math.max(0, Math.round((562 - width) / 2)), top: 48 + Math.max(0, Math.round((274 - height) / 2))}]).jpeg().toBuffer()
    return image
  },


  createCards: async (wagoID, file, title, type, author) => {
    if (!file) {
      return false
    }
    const screenshotFile = await axios.request({
      responseType: 'arraybuffer',
      url: `https://media.wago.io/screenshots/${file}`,
      method: 'get'
    })
    const screenshot = new sharp(Buffer.from(screenshotFile.data, 'binary'))
    var entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    }
    const time = Date.now()

    title = title.replace(/[&<>"']/g, function(m) { return entities[m] })
    const scrn = await screenshot.metadata()
    var tWidth = 1200
    var tHeight = 628
    var textSize = 48
    var logoScale = .25
    var avatarSize = 64
    var authorTextAdjust = 6
    if (scrn.width < tWidth * .75 || scrn.height < tHeight * .75) {
      tWidth = 600
      tHeight = 314
      textSize = 32
      logoScale = .125
      avatarSize = 40
      authorTextAdjust = 0
    }
    var avatar
    if (author) {
      const avatarFile = await axios.request({
        responseType: 'arraybuffer',
        url: author.avatar,
        method: 'get'
      })
      const circle = Buffer.from(`<svg viewBox="0 0 ${avatarSize} ${avatarSize}"><circle cx="${avatarSize/2}" cy="${avatarSize/2}" r="${avatarSize/2}"/></svg>`)
      avatar = await new sharp(Buffer.from(avatarFile.data, 'binary')).resize(avatarSize, avatarSize).composite([{input: circle, blend: 'dest-in'}])
      author.name = author.name.replace(/[&<>"']/g, function(m) { return entities[m] })
    }
    var wagoWatermark = ''
    if (!file.match(/wago-card-standard/)) {
      wagoWatermark = `
      <g transform="scale(${logoScale}) translate(3970, 1800)">
        <path class="st0" d="M460,484.8h79.8c6-30.6,30.1-54.7,60.8-60.7v-79.9C526.2,351.2,467,410.4,460,484.8z"/>
        <path class="st1" d="M691.1,484.8h79.8c-7-74.4-66.2-133.6-140.6-140.6V424C661,430,685.1,454.1,691.1,484.8z"/>
        <path class="st0" d="M539.9,515.1c0-0.2,0.1-0.4,0.1-0.6h-0.2h-79.6H460c0,0.2,0,0.4,0.1,0.6c-7.2,35.2-38.2,61.6-75.5,61.6
          c-37.5,0-68.7-26.8-75.6-62.2h-79.8c7.5,79.3,74.2,141.3,155.5,141.3c45.8,0,86.9-19.7,115.5-51c25.4,27.9,60.8,46.6,100.6,50.3
          v-79.9C570.1,569.3,546.1,545.5,539.9,515.1z"/>
        <path class="st0" d="M630.3,575.3v79.9c74.4-7,133.6-66.2,140.6-140.6h-79.8C685.1,545.2,661,569.3,630.3,575.3z"/>
      </g>`
    }
    try {
      const backgroundFile = screenshot.clone().resize({width: tWidth, height: tHeight}).modulate({brightness: .25}).blur(25)
      const backgroundBuffer = await backgroundFile.toBuffer()// Buffer.from(backgroundFile.data, 'binary')
      const resizedScreenshot = await screenshot.resize({width: tWidth, height: tHeight, fit: 'inside', background:{r:0, g: 0, b: 0, alpha: 0}})
      var composite = [{input: await resizedScreenshot.toBuffer()}]
      var thumb = await sharp(backgroundBuffer).resize({width: tWidth, height: tHeight}).composite(composite).toBuffer()
      await sharp(thumb).resize({width: 600}).toFormat('jpg').toFile(tmpDir + '/t2-' + time + '.jpg')
      await s3.uploadFile({
        localFile: tmpDir + '/t2-' + time + '.jpg',
        s3Params: {
          Bucket: 'wago-media',
          Key: `cards/${wagoID}/t2-${time}.jpg`
        }
      })
      fs.unlink(`${tmpDir}/t2-${time}.jpg`)

      await sharp(thumb).resize({width: 180}).toFormat('jpg').toFile(tmpDir + '/t-' + time + '.jpg')
      await s3.uploadFile({
        localFile: tmpDir + '/t-' + time + '.jpg',
        s3Params: {
          Bucket: 'wago-media',
          Key: `cards/${wagoID}/t-${time}.jpg`
        }
      })
      fs.unlink(`${tmpDir}/t-${time}.jpg`)

      var authorSVG
      if (author && author.name && avatar) {
        authorSVG = `<text x="${avatarSize+8}" y="${tHeight-avatarSize+textSize/3+authorTextAdjust}" style="font-family: Roboto; font-size: ${textSize/1.8}; font-weight: bold; fill: #F2F2F2; stroke: #111111; stroke-width: 1px">${type}</text>
        <text x="${avatarSize+8}" y="${tHeight-avatarSize+textSize+authorTextAdjust}" style="font-family: Roboto; font-size: ${textSize/1.8}; font-weight: bold; fill: #F2F2F2; stroke: #111111; stroke-width: 1px">${author && author.name}</text>`
      }
      else {
        authorSVG = `<text x="4" y="${tHeight-4}" style="font-family: Roboto; font-size: ${textSize/1.8}; font-weight: bold; fill: #F2F2F2; stroke: #111111; stroke-width: 1px">${type}</text>`
      }
      var svg = `
      <svg height="${tHeight}" width="${tWidth}" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <style>
            @font-face {font-family: Roboto; src: url(https://media.wago.io/fonts/Roboto-Regular.ttf)}
            .st0{fill:#F2F2F2}
            .st1{fill:#C1272D}
          </style>
          <linearGradient id="frame1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="30%" style="stop-color:rgb(0,0,0);stop-opacity:.5" />
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
          </linearGradient>
          <linearGradient id="frame2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="10%" style="stop-color:rgb(0,0,0);stop-opacity:0" />
            <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:.9" />
          </linearGradient>
        </defs>
        <rect width="${tWidth}" height="${textSize+48}" fill="url(#frame1)" />
        <rect width="${tWidth}" height="${avatarSize+32}" y="${tHeight-avatarSize-32}" fill="url(#frame2)"  />
        ${authorSVG}
        ${wagoWatermark}
      </svg>`

      const metaImg = await sharp(new Buffer.from(svg))
      var titleSvg = `
      <svg height="${avatarSize+8}" width="${tWidth*20}" xmlns:xlink="http://www.w3.org/1999/xlink">
        <defs>
          <style>
            @font-face {font-family: Roboto; src: url(https://media.wago.io/fonts/Roboto-Regular.ttf)}
          </style>
        </defs>
        <text y="${textSize}" style="font-family: Roboto; font-size: ${textSize}; font-weight: bold; fill: #F2F2F2; stroke: #111111; stroke-width: 2px">${title}</text>
      </svg>`
      const titleImg = await sharp(new Buffer.from(titleSvg)).trim().resize(tWidth - 8, textSize, {fit: 'inside', background: {r:0,g:0,b:0,alpha:0}}).trim()
      const titleMeta = (await titleImg.toBuffer({ resolveWithObject: true })).info
        // await axios.request({
        //   responseType: 'arraybuffer',
        //   url: 'https://media.wago.io/site/wago-card-bg.jpg',
        //   method: 'get'
        // })
      composite.push({input: await metaImg.toBuffer()})
      if (author) {
        composite.push({input: await avatar.toBuffer(), top: tHeight-44, left: 4})
      }
      composite.push({input: await titleImg.toBuffer(), top: Math.floor(196 / titleMeta.height), left: Math.floor((tWidth - titleMeta.width) / 2), gravity: 'centre' })

      await sharp(backgroundBuffer).resize({width: tWidth, height: tHeight}).composite(composite).toFormat('jpg').toFile(tmpDir + '/c-' + time + '.jpg')
      await s3.uploadFile({
        localFile: tmpDir + '/c-' + time + '.jpg',
        s3Params: {
          Bucket: 'wago-media',
          Key: `cards/${wagoID}/c-${time}.jpg`
        }
      })
      fs.unlink(`${tmpDir}/c-${time}.jpg`)
    }
    catch (e) {
      console.log(e)
      return false
    }
    return time
  }
}
