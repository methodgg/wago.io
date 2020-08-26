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
    var tableA = sortJSON(jsonA)
    tableA.semver = ''
    tableA.url = ''
    tableA.version = ''

    const codeB = detectCode.Plater(jsonB)
    var tableB = sortJSON(jsonB)
    tableB.semver = ''
    tableB.url = ''
    tableB.version = ''
    for (const c of codeA) {
      if (typeof c === 'object' && c.path) {
        eval(`tableA.${c.path} = ''`)
        eval(`tableB.${c.path} = ''`)
      }
    }
    for (const c of codeB) {
      if (typeof c === 'object' && c.path) {
        eval(`tableA.${c.path} = ''`)
        eval(`tableB.${c.path} = ''`)
      }
    }

    codeA.push({id: jsonA['1'], name: 'Table data', path: '', lua: JSON.stringify(tableA, null, 2)})
    codeB.push({id: jsonA['1'], name: 'Table data', path: '', lua: JSON.stringify(tableB, null, 2)})
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
    var tableA = sortJSON(jsonA)
    tableA.d.semver = ''
    tableA.d.url = ''
    tableA.d.version = ''
    if (tableA.c) {
      for (let i = 0; i < tableA.c.length; i++) {
        tableA.c[i].semver = ''
        tableA.c[i].url = ''
        tableA.c[i].version = ''
      }
    }

    const codeB = detectCode.WeakAura(jsonB)
    var tableB = sortJSON(jsonB)
    tableB.d.semver = ''
    tableB.d.url = ''
    tableB.d.version = ''
    if (tableB.c) {
      for (let i = 0; i < tableB.c.length; i++) {
        tableB.c[i].semver = ''
        tableB.c[i].url = ''
        tableB.c[i].version = ''
      }
    }
    for (const code of codeA) {
      if (typeof code === 'object' && code.path && code.ix && code.ix.table === 'c') {
        eval(`tableA.c[${code.ix.index}].${code.path} = ''`)
        eval(`tableB.c[${code.ix.index}].${code.path} = ''`)
      }
      if (typeof code === 'object' && code.path) {
        eval(`tableA.d.${code.path} = ''`)
        eval(`tableB.d.${code.path} = ''`)
      }
    }
    for (const code of codeB) {
      if (typeof code === 'object' && code.path && code.ix && code.ix.table === 'c') {
        eval(`tableA.c[${code.ix.index}].${code.path} = ''`)
        eval(`tableB.c[${code.ix.index}].${code.path} = ''`)
      }
      if (typeof code === 'object' && code.path) {
        eval(`tableA.d.${code.path} = ''`)
        eval(`tableB.d.${code.path} = ''`)
      }
    }
    
    codeA.push({id: jsonA.d.id, name: 'Table data', path: '', lua: JSON.stringify(tableA, null, 2)})
    codeB.push({id: jsonA.d.id, name: 'Table data', path: '', lua: JSON.stringify(tableB, null, 2)})

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

function sortJSON(obj) {
  // if a regular array then its already sorted but still sort any child objects
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (obj[i] && typeof obj[i] == 'object') {
        obj[i] = sortJSON(obj[i])
      }
    }
    return obj
  }

  // sort object as expected
  var sorted = {}
  var keys
  keys = Object.keys(obj)
  keys.sort(function(key1, key2) {
    if(key1 < key2) return -1
    if(key1 > key2) return 1
    return 0
  })

  for (var i in keys) {
    var key = keys[i]
    if (obj[key] && typeof obj[key] == 'object') {
      sorted[key] = sortJSON(obj[key])
    } else {
      sorted[key] = obj[key]
    }
  }

  return sorted
}