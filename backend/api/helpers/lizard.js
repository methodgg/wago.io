const exec = require('shelljs.exec')

module.exports = {
  Version: 2,

  run: async (code) => {
    if (!code.length) {
      return []
    }
    const lizardDir = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7)
    await fs.mkdir(lizardDir)
    var fileMap = {}
    for (let i = 0; i < code.length; i++) {
      if (typeof code[i] !== 'object' || !code[i].lua || typeof code[i].lua !== 'string' || code[i].skipLuacheck) {
        continue
      }
      let lua = code[i].lua.replace(/GENERATED CODE/g, 'generated_code') // don't ignore potential malicous hidings

      let file = new Date().getTime() + Math.random().toString(36).substring(7) + '.lua'
      fileMap[file] = i
      code[i].lizard = {loc: 0, ccn: 0, token: 0}
      await fs.writeFile(lizardDir + '/' + file, lua)
    }

    let lizard = await exec(`lizard ${lizardDir} -i 999`)
    if (lizard && lizard.stdout) {
      let m
      const section = lizard.stdout.split(/=+/g)[1]
      const lizardRegex = /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+).*?\/(\w+\.lua)/gm
      while ((m = lizardRegex.exec(section)) !== null) {
        if (m.index === lizardRegex.lastIndex) {
          lizardRegex.lastIndex++
        }
        let key = fileMap[m[6]]
        if (code[key]) {
          code[key].lizard = {
            loc: code[key].lizard.loc + parseInt(m[1]),
            ccn: Math.max(code[key].lizard.ccn || 0, parseInt(m[2])),
            token: code[key].lizard.token + parseInt(m[3]),
          }
        }
      }
    }

    // cleanup
    const files = Object.keys(fileMap)
    for (let file of files) {
      await fs.unlink(lizardDir + '/' + file)
    }
    await fs.rmdir(lizardDir)
    return code
  }
}
