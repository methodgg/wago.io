const execa = require('execa')
const execaOptions = {
  cwd: __dirname+'/../lua',
  timeout: 8000
}
const wagoify = require('./wago-luamin').minify

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
    if (!obj || !obj.movers) {
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
  
  TotalRP32JSON: (str, cb) => {
    // make sure import string is valid format
    if (!str || !str.match(/^\^.+\^\^$/)) {
      return cb('Invalid import')
    }

    // generate lua file
    var luaScript = `dofile("./wago.lua"); TotalRP32JSON("${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}")`
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
  
  JSON2TotalRP3: (obj, cb) => {
    if (!obj) {
      return cb('Invalid export')
    }

    // generate lua file
    var str = JSON.stringify(obj)
    var luaScript = 'dofile("./wago.lua"); JSON2TotalRP3("' + str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim() + '")'
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

  CodeReview: (WeakAura, cb) => {
    var luaCode = ""
    var luaAST = ""
    var luaProfileCode = ""

    var auras = WeakAura.c || [WeakAura.d]

    // build env tables for auras under review
    var localAuraEnv = ''
    auras.forEach(aura => {
      var name = aura.id.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
      localAuraEnv = localAuraEnv + `
      env.WeakAuras.regions["${name}"] = { region = CreateFrame() }
      env.WeakAuras.regions["${name}"].region.Background = CreateFrame()
      env.WeakAuras.regions["${name}"].region.Border = CreateFrame()
      env.WeakAuras.regions["${name}"].region.border = CreateFrame()
      env.WeakAuras.regions["${name}"].region.bar = CreateFrame()
      env.WeakAuras.regions["${name}"].region.bar.fg = CreateFrame()
      env.WeakAuras.regions["${name}"].region.bar.bg = CreateFrame()
      env.WeakAuras.regions["${name}"].region.bar.spark = CreateFrame()
      env.WeakAuras.regions["${name}"].region.cooldown = CreateFrame()
      env.WeakAuras.regions["${name}"].region.Foreground = CreateFrame()
      env.WeakAuras.regions["${name}"].region.icon = CreateFrame()
      env.WeakAuras.regions["${name}"].region.model = CreateFrame()
      env.WeakAuras.regions["${name}"].region.stacks = CreateFrame()
      env.WeakAuras.regions["${name}"].region.text = CreateFrame()
      env.WeakAuras.regions["${name}"].region.text2 = CreateFrame()
      env.WeakAuras.regions["${name}"].region.texture = CreateFrame()
      env.WeakAuras.regions["${name}"].region.timer = CreateFrame()
      env.WeakAurasSaved["displays"]["${name}"] = {}
      `
    })

    // build custom functions for auras under review
    var luaCodeBlocks = []
    luaCodeBlocks.push(`[[--Wago:Startup
      function __Wago__CountGlobals() local n=0 for k in pairs(_G) do n=n+1 end return n end
      __Wago__StartGlobals = __Wago__CountGlobals()+1 ]]`)

    var auraID = 0
    auras.forEach(WA => {
      const aura = keyd(WA)
      // onload and onstart
      if (aura.get("actions.init.do_custom")) { 
        luaCodeBlocks.push(prepareCustomCode(aura.get("actions.init.custom"), `INIT:${auraID}:${WA.id}`, true))
      }
      if (aura.get("actions.start.do_custom")) {
        luaCodeBlocks.push(prepareCustomCode(aura.get("actions.start.custom"), `ONSHOW:${auraID}:${WA.id}`, true))
      }      

      if (aura.get("trigger.type")=='custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.custom"), `TRIGGER_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.customDuration"), `DURATION_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.customName"), `NAME_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.customIcon"), `ICON_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.customTexture"), `TEXTURE_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("trigger.customStacks"), `STACKS_1:${auraID}:${WA.id}`))
        luaCodeBlocks.push(prepareCustomCode(aura.get("untrigger.custom"), `UNTRIGGER_1:${auraID}:${WA.id}`))
      }

      // secondary triggers
      if (WA.additional_triggers && WA.additional_triggers.length > 0) {
        for (var k = 0; k < WA.additional_triggers.length; k++) {
          if (aura.get(`additional_triggers[${k}].trigger.type`) === 'custom') {
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.custom"), `TRIGGER_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.customDuration"), `DURATION_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.customName"), `NAME_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.customIcon"), `ICON_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.customTexture"), `TEXTURE_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].trigger.customStacks"), `STACKS_${k}:${auraID}:${WA.id}`))
            luaCodeBlocks.push(prepareCustomCode(aura.get("additional_triggers[${k}].untrigger.custom"), `UNTRIGGER_${k}:${auraID}:${WA.id}`))
          }
        }
      }
      
      // trigger logic (must have at least 2 triggers)
      if (WA.disjunctive === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("customTriggerLogic"), `TRIGGER_LOGIC:${auraID}:${WA.id}`))
      }
      
      // custom display text
      if ((typeof WA.displayText === 'string' && WA.displayText.indexOf('%c') > -1) ||
        (typeof WA.text1 === 'string' && WA.text1.indexOf('%c') > -1) ||
        (typeof WA.text2 === 'string' && WA.text2.indexOf('%c') > -1) ||
        (typeof WA.displayTextLeft === 'string' && WA.displayTextLeft.indexOf('%c') > -1) ||
        (typeof WA.displayTextRight === 'string' && WA.displayTextRight.indexOf('%c') > -1) ||
        (typeof WA.displayStacks === 'string' && WA.displayStacks.indexOf('%c') > -1))
          luaCodeBlocks.push(prepareCustomCode(aura.get("customText"), `DISPLAY_TEXT:${auraID}:${WA.id}`))

      // animation onStart functions
      if (aura.get('animation.start.use_alpha') && aura.get('animation.start.alphaType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.start.alphaFunc"), `ANIM_START_ALPHA:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.start.use_color') && aura.get('animation.start.colorType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.start.colorFunc"), `ANIM_START_COLOR:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.start.use_rotate') && aura.get('animation.start.rotateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.start.rotateFunc"), `ANIM_START_ROTATE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.start.use_scale') && aura.get('animation.start.scaleType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.start.scaleFunc"), `ANIM_START_SCALE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.start.use_translate') && aura.get('animation.start.translateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.start.translateFunc"), `ANIM_START_TRANSLATE:${auraID}:${WA.id}`))
      }

      // animation main functions
      if (aura.get('animation.main.use_alpha') && aura.get('animation.main.alphaType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.main.alphaFunc"), `ANIM_MAIN_ALPHA:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.main.use_color') && aura.get('animation.main.colorType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.main.colorFunc"), `ANIM_MAIN_COLOR:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.main.use_rotate') && aura.get('animation.main.rotateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.main.rotateFunc"), `ANIM_MAIN_ROTATE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.main.use_scale') && aura.get('animation.main.scaleType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.main.scaleFunc"), `ANIM_MAIN_SCALE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.main.use_translate') && aura.get('animation.main.translateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.main.translateFunc"), `ANIM_MAIN_TRANSLATE:${auraID}:${WA.id}`))
      }

      // animation finish functions
      if (aura.get('animation.finish.use_alpha') && aura.get('animation.finish.alphaType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.finish.alphaFunc"), `ANIM_FINISH_ALPHA:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.finish.use_color') && aura.get('animation.finish.colorType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.finish.colorFunc"), `ANIM_FINISH_COLOR:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.finish.use_rotate') && aura.get('animation.finish.rotateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.finish.rotateFunc"), `ANIM_FINISH_ROTATE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.finish.use_scale') && aura.get('animation.finish.scaleType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.finish.scaleFunc"), `ANIM_FINISH_SCALE:${auraID}:${WA.id}`))
      }
      if (aura.get('animation.finish.use_translate') && aura.get('animation.finish.translateType') === 'custom') {
        luaCodeBlocks.push(prepareCustomCode(aura.get("animation.finish.translateFunc"), `ANIM_FINISH_TRANSLATE:${auraID}:${WA.id}`))
      }

      // on hide
      if (aura.get("actions.finish.do_custom")) { 
        luaCodeBlocks.push(prepareCustomCode(aura.get("actions.finish.custom"), `ONHIDE:${auraID}:${WA.id}`, true))
      }

      auraID++
    })

    luaCodeBlocks.push(`[[--Wago:Finish
      __Wago__Print("::CountGlobals:"..(__Wago__CountGlobals()-__Wago__StartGlobals)) ]]`)

    luaProfileCode = `
    dofile('../lua/codeReview/Wago-ProFi.lua')
    dofile('../lua/codeReview/env-Wago.lua')
    ${localAuraEnv}

    local wagoCode = { ${luaCodeBlocks.join(',\n')} }

    -- run code under sandbox
    local function run(untrusted_code)
      if untrusted_code:byte(1) == 27 then return nil, "binary bytecode prohibited" end
      local untrusted_function, message = loadstring(untrusted_code)
      if not untrusted_function then return nil, message end
      setfenv(untrusted_function, env)
      return pcall(untrusted_function)
    end

    ProFi:start()
    for i,c in pairs(wagoCode) do
      if string.len(c)>0 then
        local res, error = run(c)
        if not res and error then print("::ERR:"..error) end
      end
    end
    ProFi:stop()
    -- ProFi:checkMemory() -- not sure this is useful with fake API
    ProFi:writeReport()`

    var luaFile = tmpLuaFileName(WeakAura.d.id+'_review')
    fs.writeFile(luaFile, luaProfileCode, (err) => {
      if (err) {
        return cb(err)
      }

      // run luajit and return output
      execa('luajit', [luaFile], execaOptions).then((res) => {
        // delete the temp lua file. async - no need to wait for it
        // console.log(res.stdout)
        fs.unlink(luaFile)

        if (res && res.stdout) {
          // test for syntax error
          var review = {}
          try { review.countGlobals = res.stdout.match(/::CountGlobals:(\d+)/)[1] }
          catch(e){}
          try { review.profileRunTime = res.stdout.match(/::TotalRunTime:([\d.]+)/)[1] }
          catch(e){}

          // extract any errors
          var m
          review.errors = {}
          var errorRegex = /::ERR:\[string "--(.*?)\.\.\."\]:\d+: (.*)/g
          while ((m = errorRegex.exec(res.stdout)) !== null) {
            if (m.index === errorRegex.lastIndex) {
              errorRegex.lastIndex++
            }
            var fn = m[1].match(/(\w+):(\d+):/)
            review.errors[auras[fn[2]].id] = review.errors[auras[fn[2]].id] || []
            review.errors[auras[fn[2]].id].push({ block: fn[1], message: m[2] })
          }
          
          // extract profile on all function calls
          review.profile = {}
          var anon = {}
          var customFnRegex = /\| \[string "--(.*?)"?\]?\s*: (\w+)\s*:\s*(\d+)\s+: ([\d.]+)\s*: [\d.%]+\s*:\s*(\d+)\s*\|/g
          while ((m = customFnRegex.exec(res.stdout)) !== null) {
            if (m.index === customFnRegex.lastIndex) {
              customFnRegex.lastIndex++
            }
            if (m[1].match(/^Wago:/)) continue

            var fn = m[1].match(/(\w+):(\d+):/)
            review.profile[auras[fn[2]].id] = review.profile[auras[fn[2]].id] || []
            // if this is the profile for the code block
            if (m[3] == '0') {
              review.profile[auras[fn[2]].id].push({ block: fn[1], time: m[4] })
            }
            // skip the first anonymous function of each block (which is itself)
            else if (m[2] === 'anonymous' && !anon[m[1]]) {
              anon[m[1]] = true 
            }
            else  {
              if (m[2] === 'anonymous') {
                m[2] = 'anonymous function'
              }
              review.profile[auras[fn[2]].id].push({ block: fn[1], func: m[2], line: m[3], time: m[4], calls: m[5] })
            }
          }

          var wowFnRegex = /\| \.\.\/lua\/codeReview\/env-(\w+)\.lua\s*: (\w+)\s*:\s*(\d+)\s+: ([\d.]+)\s*: [\d.%]+\s*:\s*(\d+)\s*\|/g
          while ((m = wowFnRegex.exec(res.stdout)) !== null) {
            if (m.index === wowFnRegex.lastIndex) {
              wowFnRegex.lastIndex++
            }
            if (m[2].match(/__Wago__\w+/) || m[2] === 'anonymous') {
              continue
            }

            if (m[1]=='Wago') {
              m[1] = 'WoW'
            }

            review.profile['Environment: '+m[1]] = review.profile['Environment: '+m[1]] || []
            review.profile['Environment: '+m[1]].push({ func: m[2], /*line: m[3],*/ time: m[4], calls: m[5] })
          }
        }

        cb(null, review)
      }).catch(e => {     
        cb(e)
      })
    })
  }
}

// prepare custom WA code for profile review
function prepareCustomCode(code, label, nopcall) {
  if (!code || code.replace(/\s*/g, '').length==0) return '""'
  try {
    if (!nopcall) {
      code = `local success, func = pcall(${code},1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1)`
    }
    code = wagoify(code.replace(/__Wago__/g, ''))
    code = code.replace('[================[', '[========================[').replace(']================]', ']========================]')
    label = label.replace('[================[', '[========================[').replace(']================]', ']========================]')
    // if (label.match(/DISPLAY/)) console.log(code)
    code = `[================[--${label}\n${code} ]================]`
    return code
  }
  catch(e) {
    console.error('error minifying lua', e)
    return ''
  }
}