// since typeof breaks module.exports with this version of webpack
const checkType = o => Object.prototype.toString.call(o).replace(/\[|object\s|\]/g, '').toLowerCase()

module.exports = {
  Plater: function (data) {
    if (checkType(data) !== 'object') {
      return []
    }
    var func = []
    if (data.type === 'script' || data['11']) { // Plater script      
      func.push({ id: 'Script', name: 'Constructor', path: '11', lua: data['12'] })
      func.push({ id: 'Script', name: 'On Show', path: '12', lua: data['14'] })
      func.push({ id: 'Script', name: 'On Update', path: '13', lua: data['11'] })
      func.push({ id: 'Script', name: 'On Hide', path: '14', lua: data['13'] })
      func.push({ id: 'Script', name: 'Initialization', path: '15', lua: data['15'] })
      return func
    }
    else if (data.type === 'hook' || data['9']) { // Plater hook
      for (hook in data['9']) {
        func.push({ id: 'Script', name: hook, path: '[9]["' + hook + '"]', lua: data['9'][hook] })
      }
      return func
    }

    // --- old format
    else if (checkType(data[8]) === 'number') { // Plater script - fallback
      func.push({ id: 'Script', name: 'Constructor', path: 11, lua: data['12'] })
      func.push({ id: 'Script', name: 'On Show', path: 13, lua: data['14'] })
      func.push({ id: 'Script', name: 'On Update', path: 10, lua: data['11'] })
      func.push({ id: 'Script', name: 'On Hide', path: 12, lua: data['13'] })
      func.push({ id: 'Script', name: 'Initialization', path: 14, lua: data['15'] })
      return func
    }
    else if (checkType(data[8]) === 'object') { // Plater hook - fallback
      for (hook in data[8]) {
        func.push({ id: 'Script', name: hook, path: '[8]["' + hook + '"]', lua: data[8][hook] })
      }
      return func
    }

    return []
  },

  WeakAura: function (data) {
    if (!data.d) {
      return []
    }
    var auras = [data.d].concat(data.c || [])
    var func = []
    // loop through each aura in array and look for pre-defined custom functions
    auras.forEach((item, key) => {
      var ix
      if (key === 0) {
        ix = {index: 0, table: 'd'}
      }
      else {
        ix = {index: key - 1, table: 'c'}
      }
      // actions functions
      if (item.actions) {
        // onInit
        if (item.actions.init && item.actions.init.do_custom && item.actions.init.custom && item.actions.init.custom.trim()) {
          func.push(item.id)
          func.push({id: item.id, name: 'onInit', ix: ix, path: 'actions.init.custom', lua: item.actions.init.custom})
        }
        // onShow
        if (item.actions.start && item.actions.start.do_custom && item.actions.start.custom && item.actions.start.custom.trim()) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({id: item.id, name: 'onShow', ix: ix, path: 'actions.start.custom', lua: item.actions.start.custom})
        }
        // onHide
        if (item.actions.finish && item.actions.finish.do_custom && item.actions.finish.custom && item.actions.finish.custom.trim()) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({id: item.id, name: 'onHide', ix: ix, path: 'actions.finish.custom', lua: item.actions.finish.custom})
        }
      }
      // display text
      if (checkType(item.displayText) === 'string' && item.displayText.match(/%c/) && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Text', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }
      else if (checkType(item.text1) === 'string' && item.text1.match(/%c/) && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Stacks', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }
      else if (checkType(item.text2) === 'string' && item.text2.match(/%c/) && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Stacks', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }
      else if (checkType(item.displayTextLeft) === 'string' && item.displayTextLeft.match(/%c/) && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Stacks', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }
      else if (checkType(item.displayTextRight) === 'string' && item.displayTextRight.match(/%c/) && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Stacks', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }
      // display stacks
      else if (checkType(item.displayStacks) === 'string' && item.displayStacks.match(/%c/) > -1 && item.customText && item.customText.trim()) {
        if (func.indexOf(item.id) < 0) {
          func.push(item.id)
        }
        func.push({ id: item.id, name: 'Display Stacks', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
      }

      if (item.grow === 'CUSTOM' && item.customGrow && item.customGrow.trim().length) {
        func.push({ id: item.id, name: 'Custom Grow', ix: ix, path: 'customGrow', lua: item.customGrow})
      }
      if (item.sort === 'custom' && item.customSort && item.customSort.trim().length) {
        func.push({ id: item.id, name: 'Custom Sort', ix: ix, path: 'customSort', lua: item.customSort})
      }
      if (item.anchorPerUnit === 'CUSTOM' && item.customAnchorPerUnit && item.customAnchorPerUnit.trim().length) {
        func.push({ id: item.id, name: 'Custom Anchor', ix: ix, path: 'customAnchorPerUnit', lua: item.customAnchorPerUnit})
      }
      if (checkType(item.customText) === 'string' && item.subRegions && item.subRegions.length && item.customText && item.customText.trim().length) {
        for (let n = 0; n < item.subRegions.length; n++) {
          if (item.subRegions[n].text_text && item.subRegions[n].text_text.match(/%c/)) {
            func.push({ id: item.id, name: 'Custom Text', ix: ix, path: 'customText', lua: item.customText, displayEveryFrame: item.customTextUpdate === 'update'})
          }
        }
      }
      // triggers
      if (item.triggers && item.triggers['1']) {
        let n = 1
        let k = '' + 1
        if (item.triggers.disjunctive === 'custom' && item.triggers.customTriggerLogic && item.triggers.customTriggerLogic.trim().length) {
          func.push({ id: item.id, name: 'Trigger Logic', ix: ix, path: 'triggers.customTriggerLogic', lua: item.triggers.customTriggerLogic })
        }
        while (item.triggers[k] && item.triggers[k].trigger) {
          if (item.triggers[k].trigger.type === 'custom' && item.triggers[k].trigger.custom) {
            if (func.indexOf(item.id) < 0) {
              func.push(item.id)
            }
            func.push({ id: item.id, name: 'Trigger (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.custom', lua: item.triggers[k].trigger.custom, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            // untrigger
            if (item.triggers[k].untrigger && item.triggers[k].untrigger.custom && item.triggers[k].untrigger.custom.trim().length && item.triggers[k].trigger.custom_hide === 'custom') {
              func.push({ id: item.id, name: 'Untrigger (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].untrigger.custom', lua: item.triggers[k].untrigger.custom })
            }
            // duration
            if (item.triggers[k].trigger.custom_hide === 'custom' && item.triggers[k].trigger.customDuration && item.triggers[k].trigger.customDuration.trim().length) {
              func.push({ id: item.id, name: 'Duration Info (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customDuration', lua: item.triggers[k].trigger.customDuration, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            }
            // name
            if (item.triggers[k].trigger.customName && item.triggers[k].trigger.customName.trim().length) {
              func.push({ id: item.id, name: 'Name Info (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customName', lua: item.triggers[k].trigger.customName, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            }
            // icon
            if (item.triggers[k].trigger.customIcon && item.triggers[k].trigger.customIcon.trim().length) {
              func.push({ id: item.id, name: 'Icon Info (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customIcon', lua: item.triggers[k].trigger.customIcon, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            }
            // texture
            if (item.triggers[k].trigger.customTexture && item.triggers[k].trigger.customTexture.trim().length) {
              func.push({ id: item.id, name: 'Texture Info (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customTexture', lua: item.triggers[k].trigger.customTexture, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            }
            // stacks
            if (item.triggers[k].trigger.customStacks && item.triggers[k].trigger.customStacks.trim().length) {
              func.push({ id: item.id, name: 'Stack Info (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customStacks', lua: item.triggers[k].trigger.customStacks, triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
            }
            // custom variables
            if (item.triggers[k].trigger.customVariables && item.triggers[k].trigger.customVariables.trim().length) {
              func.push({ id: item.id, name: 'Custom Variables (' + k + ')', ix: ix, path: 'triggers[""+' + k + '].trigger.customVariables', lua: item.triggers[k].trigger.customVariables, skipLuacheck: true })
            }
            let overlayCount = 1
            while (item.triggers[k].trigger['customOverlay' + overlayCount]) {
              if (item.triggers[k].trigger['customOverlay' + overlayCount].trim().length) {
                func.push({ id: item.id, name: `Overlay ${overlayCount} (${k})`, ix: ix, path: 'triggers[""+' + k + '].trigger["customOverlay' + overlayCount + '"]', lua: item.triggers[k].trigger['customOverlay' + overlayCount], triggerEveryFrame: item.triggers[k].trigger.check === 'update' })
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
        if (item.trigger && item.trigger.type === 'custom' && item.trigger.custom && item.trigger.custom.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Trigger (1)', ix: ix, path: 'trigger.custom', lua: item.trigger.custom })
          // main untrigger
          if (item.untrigger && item.untrigger.custom && item.untrigger.custom.trim().length) {
            func.push({ id: item.id, name: 'Untrigger (1)', ix: ix, path: 'untrigger.custom', lua: item.untrigger.custom })
          }
          // duration
          if (item.trigger && item.trigger.customDuration && item.trigger.customDuration.trim().length) {
            func.push({ id: item.id, name: 'Duration Info (1)', ix: ix, path: 'trigger.customDuration', lua: item.trigger.customDuration })
          }
          // overlay
          if (item.trigger && item.trigger.customOverlay1 && item.trigger.customOverlay1.trim().length) {
            var overlayCount = 1
            while (item.trigger['customOverlay' + overlayCount] && item.trigger['customOverlay' + overlayCount].trim().length) {
              func.push({ id: item.id, name: `Overlay ${overlayCount} (1)`, ix: ix, path: 'trigger.customOverlay' + overlayCount, lua: item.trigger['customOverlay' + overlayCount] })
              overlayCount++
            }
          }
          // name
          if (item.trigger && item.trigger.customName && item.trigger.customName.trim().length) {
            func.push({ id: item.id, name: 'Name Info (1)', ix: ix, path: 'trigger.customName', lua: item.trigger.customName })
          }
          // icon
          if (item.trigger && item.trigger.customIcon && item.trigger.customIcon.trim().length) {
            func.push({ id: item.id, name: 'Icon Info (1)', ix: ix, path: 'trigger.customIcon', lua: item.trigger.customIcon })
          }
          // texture
          if (item.trigger && item.trigger.customTexture && item.trigger.customTexture.trim().length) {
            func.push({ id: item.id, name: 'Texture Info (1)', ix: ix, path: 'trigger.customTexture', lua: item.trigger.customTexture })
          }
          // stacks
          if (item.trigger && item.trigger.customStacks && item.trigger.customStacks.trim().length) {
            func.push({ id: item.id, name: 'Stack Info (1)', ix: ix, path: 'trigger.customStacks', lua: item.trigger.customStacks })
          }
        }
        // secondary triggers
        if (item.additional_triggers && item.additional_triggers.length) {
          for (let k = 0; k < item.additional_triggers.length; k++) {
            if (item.additional_triggers[k].trigger && item.additional_triggers[k].trigger.type === 'custom' && item.additional_triggers[k].trigger.custom) {
              if (func.indexOf(item.id) < 0) {
                func.push(item.id)
              }
              func.push({ id: item.id, name: 'Trigger (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.custom', lua: item.additional_triggers[k].trigger.custom })
              // untrigger
              if (item.additional_triggers[k].untrigger && item.additional_triggers[k].untrigger.custom && item.additional_triggers[k].untrigger.custom.trim().length) {
                func.push({ id: item.id, name: 'Untrigger (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].untrigger.custom', lua: item.additional_triggers[k].untrigger.custom })
              }
              // duration
              if (item.trigger && item.trigger.customDuration && item.trigger.customDuration.trim().length) {
                func.push({ id: item.id, name: 'Duration Info (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.customDuration', lua: item.additional_triggers[k].trigger.customDuration})
              }
              // name
              if (item.trigger && item.trigger.customName && item.trigger.customName.trim().length) {
                func.push({ id: item.id, name: 'Name Info (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.customName', lua: item.additional_triggers[k].trigger.customName })
              }
              // icon
              if (item.trigger && item.trigger.customIcon && item.trigger.customIcon.trim().length) {
                func.push({ id: item.id, name: 'Icon Info (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.customIcon', lua: item.additional_triggers[k].trigger.customIcon })
              }
              // texture
              if (item.trigger && item.trigger.customTexture && item.trigger.customTexture.trim().length) {
                func.push({ id: item.id, name: 'Texture Info (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.customTexture', lua: item.additional_triggers[k].trigger.customTexture })
              }
              // stacks
              if (item.trigger && item.trigger.customStacks && item.trigger.customStacks.trim().length) {
                func.push({ id: item.id, name: 'Stack Info (' + k + ')', ix: ix, path: 'additional_triggers[' + k + '].trigger.customStacks', lua: item.additional_triggers[k].trigger.customStacks })
              }
            }
          }
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          // trigger logic (must have at least 2 triggers)
          if (item.disjunctive === 'custom' && item.customTriggerLogic && item.customTriggerLogic.trim().length) {
            func.push({ id: item.id, name: 'Trigger Logic', ix: ix, path: 'customTriggerLogic', lua: item.customTriggerLogic })
          }
        }
      }
      // conditions
      if (item.conditions && item.conditions.length) {
        for (let k = 0; k < item.conditions.length; k++) {
          if (item.conditions[k] && item.conditions[k].changes && item.conditions[k].changes.length) {
            for (let k2 = 0; k2 < item.conditions[k].changes.length; k2++) {
              if (checkType(item.conditions[k].changes[k2]) === 'object' && item.conditions[k].changes[k2].property === 'customcode' && item.conditions[k].changes[k2].value && item.conditions[k].changes[k2].value.custom) {
                func.push({ id: item.id, name: `Condition ${k+1} - ${k2+1}`, ix: ix, path: `conditions[${k}].changes[${k2}].value.custom`, lua: item.conditions[k].changes[k2].value.custom })
              }
            }
          }
        }
      }
      // animation onStart functions
      if (item.animation && item.animation.start) {
        // animate alpha
        if (item.animation.start.use_alpha && item.animation.start.alphaType === 'custom' && item.animation.start.alphaFunc && item.animation.start.alphaFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'onStart animate alpha', ix: ix, path: 'animation.start.alphaFunc', lua: item.animation.start.alphaFunc })
        }
        // animate color
        if (item.animation.start.use_color && item.animation.start.colorType === 'custom' && item.animation.start.colorFunc && item.animation.start.colorFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'onStart animate color', ix: ix, path: 'animation.start.colorFunc', lua: item.animation.start.colorFunc })
        }
        // animate rotation
        if (item.animation.start.use_rotate && item.animation.start.rotateType === 'custom' && item.animation.start.rotateFunc && item.animation.start.rotateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'onStart animate rotation', ix: ix, path: 'animation.start.rotateFunc', lua: item.animation.start.rotateFunc })
        }
        // animate scale
        if (item.animation.start.use_scale && item.animation.start.scaleType === 'custom' && item.animation.start.scaleFunc && item.animation.start.scaleFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'onStart animate scale', ix: ix, path: 'animation.start.scaleFunc', lua: item.animation.start.scaleFunc })
        }
        // animate translation
        if (item.animation.start.use_translate && item.animation.start.translateType === 'custom' && item.animation.start.translateFunc && item.animation.start.translateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'onStart animate translation', ix: ix, path: 'animation.start.translateFunc', lua: item.animation.start.translateFunc })
        }
      }
      // animation main/ongoing functions
      if (item.animation && item.animation.main) {
        // animate alpha
        if (item.animation.main.use_alpha && item.animation.main.alphaType === 'custom' && item.animation.main.alphaFunc && item.animation.main.alphaFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Main animate alpha', ix: ix, path: 'animation.main.alphaFunc', lua: item.animation.main.alphaFunc })
        }
        // animate color
        if (item.animation.main.use_color && item.animation.main.colorType === 'custom' && item.animation.main.colorFunc && item.animation.main.colorFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Main animate color', ix: ix, path: 'animation.main.colorFunc', lua: item.animation.main.colorFunc })
        }
        // animate rotation
        if (item.animation.main.use_rotate && item.animation.main.rotateType === 'custom' && item.animation.main.rotateFunc && item.animation.main.rotateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Main animate rotation', ix: ix, path: 'animation.main.rotateFunc', lua: item.animation.main.rotateFunc })
        }
        // animate scale
        if (item.animation.main.use_scale && item.animation.main.scaleType === 'custom' && item.animation.main.scaleFunc && item.animation.main.scaleFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Main animate scale', ix: ix, path: 'animation.main.scaleFunc', lua: item.animation.main.scaleFunc })
        }
        // animate translation
        if (item.animation.main.use_translate && item.animation.main.translateType === 'custom' && item.animation.main.translateFunc && item.animation.main.translateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Main animate translation', ix: ix, path: 'animation.main.translateFunc', lua: item.animation.main.translateFunc })
        }
      }
      // animation finish functions
      if (item.animation && item.animation.finish) {
        // animate alpha
        if (item.animation.finish.use_alpha && item.animation.finish.alphaType === 'custom' && item.animation.finish.alphaFunc && item.animation.finish.alphaFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Finish animate alpha', ix: ix, path: 'animation.finish.alphaFunc', lua: item.animation.finish.alphaFunc })
        }
        // animate color
        if (item.animation.finish.use_color && item.animation.finish.colorType === 'custom' && item.animation.finish.colorFunc && item.animation.finish.colorFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Finish animate color', ix: ix, path: 'animation.finish.colorFunc', lua: item.animation.finish.colorFunc })
        }
        // animate rotation
        if (item.animation.finish.use_rotate && item.animation.finish.rotateType === 'custom' && item.animation.finish.rotateFunc && item.animation.finish.rotateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Finish animate rotation', ix: ix, path: 'animation.finish.rotateFunc', lua: item.animation.finish.rotateFunc })
        }
        // animate scale
        if (item.animation.finish.use_scale && item.animation.finish.scaleType === 'custom' && item.animation.finish.scaleFunc && item.animation.finish.scaleFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Finish animate scale', ix: ix, path: 'animation.finish.scaleFunc', lua: item.animation.finish.scaleFunc })
        }
        // animate translation
        if (item.animation.finish.use_translate && item.animation.finish.translateType === 'custom' && item.animation.finish.translateFunc && item.animation.finish.translateFunc.trim().length) {
          if (func.indexOf(item.id) < 0) {
            func.push(item.id)
          }
          func.push({ id: item.id, name: 'Finish animate translation', ix: ix, path: 'animation.finish.translateFunc', lua: item.animation.finish.translateFunc })
        }
      }
    })

    return func
  }
  
}