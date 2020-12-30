const exec = require('shelljs.exec')
const detectCode = require(__dirname + '/../../../frontend/src/components/libs/detectCustomCode')

module.exports = {
  Version: 2,

  run: async (code, game) => {
    if (!code.length) {
      return {}
    }
    if (!game || !game.match(/classic|bfa|sl/)) {
      game = 'bfa'
    }
    const luacheckrc = __dirname + '/../lua/luacheck-' + game + '.lua'
    const checkDir = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7)
    await fs.mkdir(checkDir)
    var result = {}
    var fileMap = {}
    for (let i = 0; i < code.length; i++) {
      if (typeof code[i] !== 'object' || !code[i].lua || typeof code[i].lua !== 'string' || code[i].skipLuacheck) {
        continue
      }
      var key = `${code[i].id}: ${code[i].name}`
      code[i].lua = code[i].lua.replace(/-- luacheck:/g, `--`) // don't ignore potential malicous hidings
      
      // detect defined functions and ensure they get called
      const fnRegex = /([a-zA-Z0-9.:_]+)\s*=\s*function\s*\(|function\s*([a-zA-Z0-9.:_]+)/g
      let fn
      while ((fn = fnRegex.exec(code[i].lua)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (fn.index === fnRegex.lastIndex) {
          fnRegex.lastIndex++
        }
        if (fn[1]) {
          code[i].lua += `\n${fn[1]}()`
        }
        else if (fn[2]) {
          code[i].lua += `\n${fn[2]}()`
        }
      }

      if (code[i].lua.match(/^\s*function\s*\(/m)) {
        code[i].lua = code[i].lua.replace(/^\s*function\s*\(/m, `local fn_${key.replace(/[^a-zA-Z0-9]/g, '')} = function(`) // name anonymous function
        code[i].lua += `\nfn_${key.replace(/[^a-zA-Z0-9]/g, '')}()` // and then "call" the function so luacheck recognizes that it's used
      }
      else if (code[i].lua.match(/^{[\s\S]*}$/)) {
        code[i].lua = 'local t = ' + code[i].lua + ';Wago(t)'
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
}