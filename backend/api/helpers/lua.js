const execa = require('execa')
const execaOptions = {
  cwd: __dirname+'/../lua',
  timeout: 8000
}

const fs = require('fs')

// returns a file name to be used in a temporary .lua environment
function tmpLuaFileName (str) {
  // does this need to be *more* unique?
  str = str.replace(/[^\w]/g, '')
  if (str) { 
    return __dirname + '/../../lua-scans/' + new Date().getTime() + str.substring(0, 10).replace(/\(\)/, '') + '.lua'
  }
  else {
    return __dirname + '/../../lua-scans/' + new Date().getTime() + '.lua'
  }
}

module.exports = {
  WeakAura2JSON: (str, cb) => {
    // make sure there is nothing shady in WA str
    if (!str || !str.match(/^[a-zA-Z0-9\(\)]*$/)) {
      return cb('Invalid import')
    }

    // generate lua file
    var luaScript = 'dofile("./wago.lua"); WA2JSON("' + str + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return res.send({error: 'server_error'})
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },

  JSON2WeakAura: (obj, cb) => {
    if (typeof obj === 'string') {
      obj = JSON.parse(obj)
    }
    if (!obj || !obj.d || !obj.d.id) {
      return cb('Invalid export')
    }

    // generate lua file
    var str = JSON.stringify(obj)
    var luaScript = 'dofile("./wago.lua"); JSON2WA("' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim() + '")'
    var luaFile = tmpLuaFileName(str)

    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return cb(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },
  
  ElvUI2JSON: (str, cb) => {
    // make sure there is nothing shady in import str
    if (!str || !str.match(/^[a-zA-Z0-9=\+\/]*$/)) {
      return cb('Invalid import')
    }

    // generate lua file
    var luaScript = 'dofile("./wago.lua"); Elv2JSON("' + str + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return cb(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },

  JSON2ElvUI: (obj, cb) => {
    if (!obj || !obj.layoutSet) {
      return cb('Invalid export')
    }

    // generate lua file
    var str = JSON.stringify(obj)
    var luaScript = 'dofile("./wago.lua"); JSON2Elv("' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim() + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return res.send(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },
  
  Vuhdo2JSON: (str, cb) => {
    // make sure there is nothing shady in import str
    if (!str || !str.match(/^[a-zA-Z0-9=\+\/]*$/)) {
      return cb('Invalid import')
    }

    // generate lua file
    var luaScript = 'dofile("./wago.lua"); Vuhdo2JSON("' + str + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return res.send(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },
  
  JSON2Vuhdo: (obj, cb) => {
    if (!obj || (!obj.profile && !obj.bouquet && !obj.keyLayout)) {
      return cb('Invalid export')
    }

    // generate lua file
    var str = JSON.stringify(obj)
    var luaScript = 'dofile("./wago.lua"); JSON2Vuhdo("' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim() + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return res.send(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },

  Grid2JSON: (str, cb) => {
    // make sure there is nothing shady in WA str
    if (!str || !str.match(/^[0123456789ABCDEF\\n]*$/)) {
      return cb('Invalid import')
    }

    // generate lua file
    var luaScript = 'dofile("./wago.lua"); Grid2JSON("' + str + '")'
    var luaFile = tmpLuaFileName(str)
    
    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return res.send({error: 'server_error'})
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        console.log(res)
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },

  JSON2Grid: (obj, cb) => {
    cb(null, {supported: false})
    if (typeof obj === 'string') {
      obj = JSON.parse(obj)
    }
    if (!obj || !obj.d || !obj.d.id) {
      return cb('Invalid export')
    }

    // generate lua file
    var str = JSON.stringify(obj)
    var luaScript = 'dofile("./wago.lua"); JSON2WA("' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim() + '")'
    var luaFile = tmpLuaFileName(str)

    fs.writeFile(luaFile, luaScript, (err) => {
      if (err) {
        return cb(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        fs.unlink(luaFile)
        cb(null, res)
      })
    })    
  },
}