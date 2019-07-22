const exec = require('shelljs.exec')

module.exports = {
  Lua: async (code) => {
    return await makeLuaCheck({Snippet: code})
  },

  Plater: async (json) => {
    try {
      json = JSON.parse(json)
    }
    catch (e) {
      return []
    }
    if (!Array.isArray(json)) {
      return []
    }
    else if (typeof json[8] === 'number') { // Plater script
      var tbl = {}
      tbl.Constructor = json[11]
      tbl['On Show'] = json[13]
      tbl['On Update'] = json[10]
      tbl['On Hide'] = json[12]
      return await makeLuaCheck(tbl)
    }
    else if (typeof json[8] === 'object') { // Plater hook
      return await makeLuaCheck(json[8])
    }
  },

  WeakAuras: async (json) => {
    const tbl = JSON.parse(json)
    const code = getCustomCodeWA([tbl.d].concat(tbl.c))
    return await makeLuaCheck(code)
  }
}

async function makeLuaCheck (lua) {
  const keys = Object.keys(lua)
  const luacheckrc = __dirname + '/../lua/luacheck.cfg'
  var result = {}
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!lua[key]) {
      continue
    }
    if (lua[key].match(/^\s?function\s?\(/)) {
      lua[key] = lua[key].replace(/^\s?function\s?\(/, `local fn_${key.replace(/[^a-zA-Z0-9]/g, '')} = function(`) // name anonymous function
      lua[key] += `\nfn_${key.replace(/[^a-zA-Z0-9]/g, '')}()` // and then "call" the function so luacheck recognizes that it's used
    }
    const luaFile = await makeTmpFile(lua[key])
    let check = await exec(`luacheck ${luaFile} --config ${luacheckrc}`)
    if (check && check.stdout) {
      check = check.stdout.replace(new RegExp(luaFile+':?', 'g'), '').replace(/\u001b/g, '').replace(/\[\d+m/g, '').replace(/    /g, '').replace(/^Checking\s+/, '').replace(/ in 1 file/, '')
      result[key] = check
    }
    fs.unlink(luaFile)
  }
  return result
}

async function makeTmpFile(contents) {
  const filename = __dirname + '/../../run-tmp/' + new Date().getTime() + Math.random().toString(36).substring(7) + '.lua'
  await fs.writeFile(filename, contents)
  return filename
}

// ported from frontend's table editor
function getCustomCodeWA(data) { // TODO: this is identical to the fn in diffs.js; make a new lib
  var code = {}
  if (typeof data !== 'object') {
    return []
  }
  var auras = Object.keys(data).map((key) => {
    return data[key];
  })

  auras.forEach((item, key) => {
    if (!item || typeof item !== 'object') {
      return
    }
    // actions functions
    if (item.actions) {
      // onInit
      if (item.actions.init && item.actions.init.do_custom) {
        code[item.id + ': onInit'] = item.actions.init.custom
      }

      // onShow
      if (item.actions.start && item.actions.start.do_custom) {
        code[item.id + ': onShow'] = item.actions.start.custom
      }

      // onHide
      if (item.actions.finish && item.actions.finish.do_custom) {
        code[item.id + ': onHide'] = item.actions.finish.custom
      }
    }

    // display text
    if (((typeof item.displayText === 'string' && item.displayText.indexOf('%c') > -1) ||
      (typeof item.text1 === 'string' && item.text1.indexOf('%c') > -1) ||
      (typeof item.text2 === 'string' && item.text2.indexOf('%c') > -1) ||
      (typeof item.displayTextLeft === 'string' && item.displayTextLeft.indexOf('%c') > -1) ||
      (typeof item.displayTextRight === 'string' && item.displayTextRight.indexOf('%c') > -1)) &&
      item.customText) {
      code[item.id + ': DisplayText'] = item.customText
    }

    // display stacks
    else if (typeof item.displayStacks === 'string' && item.displayStacks.indexOf('%c') > -1) {
      code[item.id + ': DisplayStacks'] = item.customText
    }

    // custom grow
    if (item.grow === 'CUSTOM' && item.customGrow) {
      code[item.id + ': CustomGrow'] = item.customGrow
    }
    // custom sort
    if (item.grow === 'CUSTOM' && item.customSort) {
      code[item.id + ': CustomSort'] = item.customSort
    }

    // triggers
    if (item.triggers && item.triggers['1']) {
      let n = 1
      let k = '' + 1
      if (item.triggers.disjunctive === 'custom' && item.triggers.customTriggerLogic && item.triggers.customTriggerLogic.trim().length > 0) {
        code[item.id + ': Trigger Logic'] = item.triggers.customTriggerLogic
      }
      while (item.triggers[k] && item.triggers[k].trigger) {
        if (item.triggers[k].trigger.type === 'custom' && item.triggers[k].trigger.custom) {

          code[item.id + ': Trigger ('+k+')'] = item.triggers[k].trigger.custom

          // untrigger
          if (item.triggers[k].untrigger && item.triggers[k].untrigger.custom && item.triggers[k].untrigger.custom.trim().length > 0 && item.triggers[k].trigger.custom_hide === 'custom') {
            code[item.id + ': Untrigger ('+k+')'] = item.triggers[k].untrigger.customName
          }

          // duration
          if (item.triggers[k].trigger.customDuration && item.triggers[k].trigger.customDuration.trim().length > 0) {
            code[item.id + ': Duration Info ('+k+')'] = item.triggers[k].trigger.customDuration
          }

          // name
          if (item.triggers[k].trigger.customName && item.triggers[k].trigger.customName.trim().length > 0) {
            code[item.id + ': Name Info ('+k+')'] = item.triggers[k].trigger.customName
          }

          // icon
          if (item.triggers[k].trigger.customIcon && item.triggers[k].trigger.customIcon.trim().length > 0) {
            code[item.id + ': Icon Info ('+k+')'] = item.triggers[k].trigger.customIcon
          }

          // texture
          if (item.triggers[k].trigger.customTexture && item.triggers[k].trigger.customTexture.trim().length > 0) {
            code[item.id + ': Texture Info ('+k+')'] = item.triggers[k].trigger.customTexture
          }

          // stacks
          if (item.triggers[k].trigger.customStacks && item.triggers[k].trigger.customStacks.trim().length > 0) {
            code[item.id + ': Stack Info ('+k+')'] = item.triggers[k].trigger.customStacks
          }

          // custom variables
          if (item.triggers[k].trigger.customVariables && item.triggers[k].trigger.customVariables.trim().length > 0) {
            code[item.id + ': Custom Variables ('+k+')'] = item.triggers[k].trigger.customVariables
          }

          let overlayCount = 1
          while (item.triggers[k].trigger['customOverlay' + overlayCount]) {
            if (item.triggers[k].trigger['customOverlay' + overlayCount].trim().length > 0) {
              code[item.id + ': Overlay '+overlayCount+' ('+k+')'] = item.triggers[k].trigger['customOverlay' + overlayCount]
            }
            overlayCount++
          }
        }

        n++
        k = '' + n
      }
    }
    else {
      // primary trigger (old format)
      if (item.trigger && item.trigger.type === 'custom' && item.trigger.custom) {
        code[item.id + ': Trigger (1)'] = item.trigger.custom

        // main untrigger
        if (item.untrigger && item.untrigger.custom && item.untrigger.custom.trim().length > 0) {
          code[item.id + ': Untrigger (1)'] = item.untrigger.custom
        }

        // duration
        if (item.trigger && item.trigger.customDuration && item.trigger.customDuration.trim().length > 0) {
          code[item.id + ': Duration Info (1)'] = item.trigger.customDuration
        }

        // overlay
        if (item.trigger && item.trigger.customOverlay1 && item.trigger.customOverlay1.trim().length > 0) {
          var overlayCount = 1
          while (item.trigger['customOverlay' + overlayCount] && item.trigger['customOverlay' + overlayCount].trim().length > 0) {
            code[item.id + ': Overlay '+overlayCount+' (1)'] = item.trigger['customOverlay' + overlayCount]
            overlayCount++
          }
        }

        // name
        if (item.trigger && item.trigger.customName && item.trigger.customName.trim().length > 0) {
          code[item.id + ': Name Info (1)'] = item.trigger.customName
        }

        // icon
        if (item.trigger && item.trigger.customIcon && item.trigger.customIcon.trim().length > 0) {
          code[item.id + ': Icon Info (1)'] = item.trigger.customIcon
        }

        // texture
        if (item.trigger && item.trigger.customTexture && item.trigger.customTexture.trim().length > 0) {
          code[item.id + ': Texture Info (1)'] = item.trigger.customTexture
        }

        // stacks
        if (item.trigger && item.trigger.customStacks && item.trigger.customStacks.trim().length > 0) {
          code[item.id + ': Stack Info (1)'] = item.trigger.customStacks
        }
      }
    }

    // secondary triggers
    if (item.additional_triggers && item.additional_triggers.length > 0) {
      for (let k = 0; k < item.additional_triggers.length; k++) {
        if (item.additional_triggers[k].trigger && item.additional_triggers[k].trigger.type === 'custom' && item.additional_triggers[k].trigger.custom) {
          code[item.id + ': Trigger ('+(k + 2)+')'] = item.additional_triggers[k].trigger.custom

          // untrigger
          if (item.additional_triggers[k].untrigger && item.additional_triggers[k].untrigger.custom && item.additional_triggers[k].untrigger.custom.trim().length > 0) {
            code[item.id + ': Untrigger ('+(k + 2)+')'] = item.additional_triggers[k].untrigger.custom
          }

          // duration
          if (item.trigger && item.trigger.customDuration && item.trigger.customDuration.trim().length > 0) {
            code[item.id + ': Duration Info ('+(k + 2)+')'] = item.additional_triggers[k].trigger.customDuration
          }

          // name
          if (item.trigger && item.trigger.customName && item.trigger.customName.trim().length > 0) {
            code[item.id + ': Name Info ('+(k + 2)+')'] = item.additional_triggers[k].trigger.customName
          }

          // icon
          if (item.trigger && item.trigger.customIcon && item.trigger.customIcon.trim().length > 0) {
            code[item.id + ': Icon Info ('+(k + 2)+')'] = item.additional_triggers[k].trigger.customIcon
          }

          // texture
          if (item.trigger && item.trigger.customTexture && item.trigger.customTexture.trim().length > 0) {
            code[item.id + ': Texture Info ('+(k + 2)+')'] = item.additional_triggers[k].trigger.customTexture
          }

          // stacks
          if (item.trigger && item.trigger.customStacks && item.trigger.customStacks.trim().length > 0) {
            code[item.id + ': Stack Info ('+(k + 2)+')'] = item.additional_triggers[k].trigger.customStacks
          }
        }
      }

      // trigger logic (must have at least 2 triggers)
      if (item.disjunctive === 'custom' && item.customTriggerLogic && item.customTriggerLogic.trim().length > 0) {
        code[item.id + ': Trigger Logic'] = item.customTriggerLogic
      }
    }

    // conditions
    if (item.conditions && item.conditions.length) {
      for (let k = 0; k < item.conditions.length; k++) {
        if (item.conditions[k].changes && item.conditions[k].changes.length) {
          for (let k2 = 0; k2 < item.conditions[k].changes.length; k2++) {
            if (typeof item.conditions[k].changes[k2] === 'object' && item.conditions[k].changes[k2].property === 'customcode' && item.conditions[k].changes[k2].value && item.conditions[k].changes[k2].value.custom) {
              code[item.id + ': Condition '+(k+1)+' - '+(k2+1)] = item.conditions[k].changes[k2].value.custom
            }
          }
        }
      }
    }

    // animation onStart functions
    if (item.animation && item.animation.start) {
      // animate alpha
      if (item.animation.start.use_alpha && item.animation.start.alphaType === 'custom' && item.animation.start.alphaFunc && item.animation.start.alphaFunc.trim().length > 0) {
        code[item.id + ': onStart animate alpha'] = item.animation.start.alphaFunc
      }

      // animate color
      if (item.animation.start.use_color && item.animation.start.colorType === 'custom' && item.animation.start.colorFunc && item.animation.start.colorFunc.trim().length > 0) {
        code[item.id + ': onStart animate color'] = item.animation.start.colorFunc
      }

      // animate rotation
      if (item.animation.start.use_rotate && item.animation.start.rotateType === 'custom' && item.animation.start.rotateFunc && item.animation.start.rotateFunc.trim().length > 0) {
        code[item.id + ': onStart animate rotation'] = item.animation.start.rotateFunc
      }

      // animate scale
      if (item.animation.start.use_scale && item.animation.start.scaleType === 'custom' && item.animation.start.scaleFunc && item.animation.start.scaleFunc.trim().length > 0) {
        code[item.id + ': onStart animate scale'] = item.animation.start.scaleFunc
      }

      // animate translation
      if (item.animation.start.use_translate && item.animation.start.translateType === 'custom' && item.animation.start.translateFunc && item.animation.start.translateFunc.trim().length > 0) {
        code[item.id + ': onStart animate translation'] = item.animation.start.translateFunc
      }
    }

    // animation main/ongoing functions
    if (item.animation && item.animation.main) {
      // animate alpha
      if (item.animation.main.use_alpha && item.animation.main.alphaType === 'custom' && item.animation.main.alphaFunc && item.animation.main.alphaFunc.trim().length > 0) {
        code[item.id + ': Main animate alpha'] = item.animation.main.alphaFunc
      }

      // animate color
      if (item.animation.main.use_color && item.animation.main.colorType === 'custom' && item.animation.main.colorFunc && item.animation.main.colorFunc.trim().length > 0) {
        code[item.id + ': Main animate color'] = item.animation.main.colorFunc
      }

      // animate rotation
      if (item.animation.main.use_rotate && item.animation.main.rotateType === 'custom' && item.animation.main.rotateFunc && item.animation.main.rotateFunc.trim().length > 0) {
        code[item.id + ': Main animate rotation'] = item.animation.main.rotateFunc
      }

      // animate scale
      if (item.animation.main.use_scale && item.animation.main.scaleType === 'custom' && item.animation.main.scaleFunc && item.animation.main.scaleFunc.trim().length > 0) {
        code[item.id + ': Main animate scale'] = item.animation.main.scaleFunc
      }

      // animate translation
      if (item.animation.main.use_translate && item.animation.main.translateType === 'custom' && item.animation.main.translateFunc && item.animation.main.translateFunc.trim().length > 0) {
        code[item.id + ': Main animate translation'] = item.animation.main.translateFunc
      }
    }

    // animation finish functions
    if (item.animation && item.animation.finish) {
      // animate alpha
      if (item.animation.finish.use_alpha && item.animation.finish.alphaType === 'custom' && item.animation.finish.alphaFunc && item.animation.finish.alphaFunc.trim().length > 0) {
        code[item.id + ': Finish animate alpha'] = item.animation.finish.alphaFunc
      }

      // animate color
      if (item.animation.finish.use_color && item.animation.finish.colorType === 'custom' && item.animation.finish.colorFunc && item.animation.finish.colorFunc.trim().length > 0) {
        code[item.id + ': Finish animate color'] = item.animation.finish.colorFunc
      }

      // animate rotation
      if (item.animation.finish.use_rotate && item.animation.finish.rotateType === 'custom' && item.animation.finish.rotateFunc && item.animation.finish.rotateFunc.trim().length > 0) {
        code[item.id + ': Finish animate rotation'] = item.animation.finish.rotateFunc
      }

      // animate scale
      if (item.animation.finish.use_scale && item.animation.finish.scaleType === 'custom' && item.animation.finish.scaleFunc && item.animation.finish.scaleFunc.trim().length > 0) {
        code[item.id + ': Finish animate scale'] = item.animation.finish.scaleFunc
      }

      // animate translation
      if (item.animation.finish.use_translate && item.animation.finish.translateType === 'custom' && item.animation.finish.translateFunc && item.animation.finish.translateFunc.trim().length > 0) {
        code[item.id + ': Finish animate translation'] = item.animation.finish.translateFunc
      }
    }
  })

  return code
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