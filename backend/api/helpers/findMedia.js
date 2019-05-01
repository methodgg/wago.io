module.exports = async (tbl) => {
  var textures = []
  textures = textures.concat(await scanProperties(tbl.d))
  if (tbl.c) {
    for (let i = 0; i < tbl.c.length; i++) {
      textures = textures.concat(await scanProperties(tbl.c[i]))
    }
  }

  var _textures = []
  var unique = []
  textures.forEach((t) => {
    if (t && unique.indexOf(t.wowPath) === -1) {
      unique.push(t.wowPath)
      _textures.push(t)
    }
  })
  return _textures
}

const scanProperties = async (data) => {
  var arr = []
  if (data.texture) {
    arr.push(await parsePath(data.texture))
  }
  if (data.foregroundTexture) {
    arr.push(await parsePath(data.foregroundTexture))
  }
  if (data.backgroundTexture) {
    arr.push(await parsePath(data.backgroundTexture))
  }

  const str = JSON.stringify(data)
  let m
  while ((m = regexFunctions.textures.exec(str)) !== null) {
    arr.push(await parsePath(m[3]))
  }
  while ((m = regexFunctions.audio.exec(str)) !== null) {
    arr.push(await parsePath(m[3]))
  }
  return arr
}


const regexFunctions = {
  textures: /((SetTexture|SetDisabledTexture|SetHighlightTexture|SetNormalTexture|SetPushedTexture|SetThumbTexture)([\s]*\([^\)]*\))?)/g,
  audio: /((PlaySound|SetDisabledTexture|SetHighlightTexture|SetNormalTexture|SetPushedTexture|SetThumbTexture)([\s]*\([^\)]*\))?)/g
}
const regexFilepaths = [
  {mediaPath: '/addonMedia/WeakAuras', type: 'texture', regex: /^Interface\/Addons\/WeakAuras\/PowerAurasMedia\/Auras\/([^\/]+)(\..{3})?/i},
  {mediaPath: '/addonMedia/WeakAuras', type: 'texture', regex: /^Interface\/Addons\/WeakAuras\/Media\/Textures\/([^\/]+)(\..{3})?/i},
  {mediaPath: '/addonMedia/WeakAuras', type: 'audio', regex: /^Interface\/Addons\/WeakAuras\/PowerAurasMedia\/Sounds\/([^\/]+)(\..{3})?/i},
  {mediaPath: '/wow-ui-textures', type: 'texture', regex: /^Interface\/(.+)(\..{3})?/}
]

const parsePath = async (path) => {
  return false // file search disabled until updated for s3
  if (!path) {
    return false
  }
  path = path.replace(/\\{2,}/g, '\\').replace(/\\/g, '/').replace(/\.{2,}/g, '.').replace(/^[\/("]*|[\/)"]*$/g, '')
  var data = {wowPath: path}
  for (let i = 0; i < regexFilepaths.length; i++) {
    let m = regexFilepaths[i].regex.exec(path)
    if (m) {
      data.type = regexFilepaths[i].type
      let filename = await getActualFilename('/nfs/media' + regexFilepaths[i].mediaPath, m[1])
      if (filename) {
        data.mediaPath = `${regexFilepaths[i].mediaPath}/${filename}`
        return data
      }
    }
  }

  return data
}

const getActualFilename = async (path, filename) => {
  var parts = []
  if (filename.match(/\//)) {
    parts = filename.split(/\//)
    filename = parts.pop()
    path = path + '/' + parts.join('/')
  }
  try {
    const files = await fs.readdir(path)
    const regex = new RegExp('^' + filename + '\..{3}$', 'i')
    for (let i = 0; i < files.length; i++) {
      if (files[i].match(regex)) {
        return parts.join('/') + '/' + files[i]
      }
    }
  }
  catch (e) {
    // most likely a directory does not exist which means I probably need to update my wow-ui-textures
    console.log(e)
  }
  return false
}