const exec = require('shelljs.exec')
const detectCode = require(__dirname + '/../../../frontend/src/components/libs/detectCustomCode')

module.exports = {
  Lua: async (codeA, codeB) => {
    return await makeDiffs({Lua: codeA}, {Lua: codeB})
  },

  Plater: async (jsonA, jsonB) => {
    if (typeof jsonA === 'string') {
      jsonA = JSON.parse(jsonA)
    }
    if (typeof jsonB === 'string') {
      jsonB = JSON.parse(jsonB)
    }
    const codeA = detectCode.Plater(jsonA)
    const codeB = detectCode.Plater(jsonB)
    return await makeDiffs(codeA, codeB)
  },

  WeakAuras: async (jsonA, jsonB) => {
    if (typeof jsonA === 'string') {
      jsonA = JSON.parse(jsonA)
    }
    if (typeof jsonB === 'string') {
      jsonB = JSON.parse(jsonB)
    }
    const codeA = detectCode.WeakAura(jsonA)
    const codeB = detectCode.WeakAura(jsonB)
    return await makeDiffs(codeA, codeB)
  }
}

async function makeDiffs (codeA, codeB) {
  var compareA = {}
  var compareB = {}
  for (let i = 0; i < codeA.length; i++) {
    if (typeof codeA[i] !== 'object' || !codeA[i].lua) {
      continue
    }
    compareA[`${codeA[i].id}: ${codeA[i].name}`] = codeA[i].lua
  }
  for (let i = 0; i < codeB.length; i++) {
    if (typeof codeB[i] !== 'object' || !codeB[i].lua) {
      continue
    }
    compareB[`${codeB[i].id}: ${codeB[i].name}`] = codeB[i].lua
  }

  var diffs = []
  var keys = arrayUnique(Object.keys(compareA).concat(Object.keys(compareB)))
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i]
    if (compareA[key] === compareB[key]) {
      continue
    }
    if (typeof compareA[key] !== 'string') {
      compareA[key] = ''
    }
    if (typeof compareB[key] !== 'string') {
      compareB[key] = ''
    }
    if (compareA[key].match(/^--/)) {
      compareA[key] = ' ' + compareA[key]
    }
    if (compareB[key].match(/^--/)) {
      compareB[key] = ' ' + compareB[key]
    }
    var fileA = await makeTmpFile(compareA[key])
    var fileB = await makeTmpFile(compareB[key])
    let diff = await exec(`git diff --no-index --color=never ${fileB} ${fileA}`)
    if (diff && diff.stdout) {
      diff = diff.stdout.split(/\n/g).slice(4).join('\n')
      diffs.push(`--- a/${key}\n+++ b/${key}\n${diff}`)
    }
    fs.unlink(fileA)
    fs.unlink(fileB)
  }
  return diffs
}

async function makeTmpFile(contents) {
  const filename = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7) + '.diff'
  await fs.writeFile(filename, contents)
  return filename
}


function arrayUnique(array) {
  var a = array.concat()
  for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
          if(a[i] === a[j])
              a.splice(j--, 1)
      }
  }
  return a
}