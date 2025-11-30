const exec = require('shelljs.exec')

module.exports = {
  Version: 2,

  run: async (code, game) => {
    if (!code.length) {
      return []
    }
    const g = game?.match(/(classic|tbc|wotlk|cata|mop|bfa|sl|df)/)
    if (!g) {
      game = 'df'
    }
    else {
      game = g[1]
    }
    const luacheckrc = __dirname + '/../lua/luacheck-' + game + '.lua'
    const checkDir = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7)
    await fs.mkdir(checkDir)
    var fileMap = {}
    for (let i = 0; i < code.length; i++) {
      if (typeof code[i] !== 'object' || !code[i].lua || typeof code[i].lua !== 'string' || code[i].skipLuacheck) {
        continue
      }
      var key = code[i].name
      let lua = code[i].lua.replace(/-- luacheck:/g, `--`) // don't ignore potential malicous hidings

      if (code[i].keypath && !code[i].keypath.match(/\.actions\.(init|start|finish)\.custom$/)) {
        let tmpFn = `fn${Math.floor(Math.random()*10000)}`
        let luax
        while (luax !== lua) {
          luax = lua
          lua = lua.replace(/^\s*--\[(=*)\[[\s\S]*?\]\1\]/gm, '').replace(/^\s*--.*$/m, '')
        }
        if (lua.match(/^\s*function\s*\(/)) { // if anonymous function found...
          lua = lua.replace(/^\s*function\s*\(/, `local function ${tmpFn}(`) // name it so it has context...
          lua += `\n${tmpFn}()` // and call it so luacheck recognizes that it's used
        }
      }
      else if (lua.match(/^{[\s\S]*}$/)) {
        lua = 'local t = ' + lua + ';Wago(t)'
      }

      let file = new Date().getTime() + Math.random().toString(36).substring(7) + '.lua'
      fileMap[file] = i
      await fs.writeFile(checkDir + '/' + file, lua)
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
        code[key].luacheck = results
      }
    }

    // cleanup
    const files = Object.keys(fileMap)
    for (let file of files) {
      await fs.unlink(checkDir + '/' + file)
    }
    await fs.rmdir(checkDir)
    return code
  }
}