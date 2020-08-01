const exec = require('shelljs.exec')
const detectCode = require(__dirname + '/../../../frontend/src/components/libs/detectCustomCode')

module.exports = {
  Lua: async (code) => {
    return await makeLuaCheck([{id: 'Lua', name: 'Snippet', lua: code}])
  },

  Plater: async (json) => {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    const code = detectCode.Plater(json)
    return await makeLuaCheck(code)
  },

  WeakAuras: async (json) => {
    if (typeof json === 'string') {
      json = JSON.parse(json)
    }
    const code = detectCode.WeakAura(json)
    return await makeLuaCheck(code)
  }
}

async function makeLuaCheck (code) {
  if (!code.length) {
    return {}
  }
  const luacheckrc = __dirname + '/../lua/luacheck.cfg'
  const checkDir = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7)
  await fs.mkdir(checkDir)
  var result = {}
  var fileMap = {}
  for (let i = 0; i < code.length; i++) {
    if (typeof code[i] !== 'object' || !code[i].lua) {
      continue
    }
    var key = `${code[i].id}: ${code[i].name}`
    code[i].lua = code[i].lua.replace(/-- luacheck:/g, `--`) // don't ignore potential malicous hidings
    if (code[i].lua.match(/^\s?function\s?\(/m)) {
      code[i].lua = code[i].lua.replace(/^\s?function\s?\(/m, `local fn_${key.replace(/[^a-zA-Z0-9]/g, '')} = function(`) // name anonymous function
      code[i].lua += `\nfn_${key.replace(/[^a-zA-Z0-9]/g, '')}()` // and then "call" the function so luacheck recognizes that it's used
    }

    let file = new Date().getTime() + Math.random().toString(36).substring(7) + '.lua'
    fileMap[file] = key
    await fs.writeFile(checkDir + '/' + file, code[i].lua)
  }
  let check = await exec(`luacheck ${checkDir} --config ${luacheckrc}`)
  if (check && check.stdout) {
    let m
    const luacheckRegex = /C?ecking .*?\/(\w+\.lua)\s+([\w\s]+)^([^]*?)^\w/gm
    while ((m = luacheckRegex.exec(check.stdout)) !== null) {
      if (m.index === luacheckRegex.lastIndex) {
        luacheckRegex.lastIndex++
      }
      let key = fileMap[m[1]]
      let results = (`${m[2]}${m[3].replace(/.*\.lua:/g, '')}`).trim()+'\n'
      result[key] = results
    }
  }
  // cleanup
  const files = Object.keys(fileMap)
  for (let file of files) {
    await fs.unlink(checkDir + '/' + file)
  }
  await fs.rmdir(checkDir)
  return result
}