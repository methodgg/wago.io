// Thanks to WA for the structure https://github.com/WeakAuras/WeakAuras2/blob/5ae7d6cdb842a2adaf56164e8390ca86e23c1646/WeakAuras/Transmission.lua#L1127
module.exports = function(data, keypath) {
  let codes = []
  if (data.triggers && data.triggers['1']) {
    let i = 1
    while (data.triggers[''+i]) {
      codes = checkTrigger(codes, `${keypath}.triggers[${i}]`, `${data.id}`, data.triggers[''+i].trigger, data.triggers[''+i].untrigger, i)
      i++
    }

    if (data.triggers['1'] && data.triggers.disjunctive === 'custom' && isValidCodeString(data.triggers.customTriggerLogic)) {
      codes.push({
        name: `${data.id} - Trigger Logic`,
        keypath: `${keypath}.triggers.customTriggerLogic`,
        lua: data.triggers.customTriggerLogic.trim()
      })
    }
  }
  else if (data.trigger && data.trigger.type === 'custom') { // old format
    codes = checkTrigger(codes, `${keypath}.trigger`, `${data.id}`, data.trigger, data.untrigger, 1)
    if (data.additional_triggers && data.additional_triggers.length) {
      data.additional_triggers.forEach((t, i) => {
        codes = checkTrigger(codes, `${keypath}.additional_triggers[${i+1}]`, `${data.id} - ${i+1}`, t.trigger, t.untrigger, i+2)
      })

      if (data.disjunctive === 'custom' && isValidCodeString(data.customTriggerLogic)) {
        codes.push({
          name: `${data.id} - Trigger Logic`,
          keypath: `${keypath}.customTriggerLogic`,
          lua: data.customTriggerLogic.trim()
        })
      }
    }
  }

  if (data.actions) {
    codes = checkActionCustom(codes, `${keypath}.actions.init`, `${data.id} - Init Action`, data.actions.init)
    codes = checkActionCustom(codes, `${keypath}.actions.start`, `${data.id} - Start Action`, data.actions.start)
    codes = checkActionCustom(codes, `${keypath}.actions.finish`, `${data.id} - Finish Action`, data.actions.finish)
    codes = checkActionCustomText(codes, `${keypath}.actions.start`, `${data.id} - Start Custom Text`, data.actions.start)
    codes = checkActionCustomText(codes, `${keypath}.actions.finish`, `${data.id} - Finish Custom Text`, data.actions.finish)
  }

  if (isValidCodeString(data.customText)) {
    if (isStringMatch(data.displayText, /%c/)) {
      codes.push({
        name: `${data.id} - Display Text`,
        keypath: `${keypath}.customText`,
        lua: data.customText.trim(),
        displayEveryFrame: data.customTextUpdate === 'update'
      })
    }
    else if (isStringMatch(data.text1, /%c/) || isStringMatch(data.text2, /%c/) || isStringMatch(data.displayTextLeft, /%c/) || isStringMatch(data.displayTextRight, /%c/) || isStringMatch(data.displayStacks, /%c/)) {
      codes.push({
        name: `${data.id} - Display Stacks`,
        keypath: `${keypath}.customText`,
        lua: data.customText.trim(),
        displayEveryFrame: data.customTextUpdate === 'update'
      })
    }
    else if (data.subRegions && data.subRegions.length && data.subRegions.find(t => isStringMatch(t.text_text, /%c/))) {
      codes.push({
        name: `${data.id} - Custom Text`,
        keypath: `${keypath}.customText`,
        lua: data.customText.trim(),
        displayEveryFrame: data.customTextUpdate === 'update'
      })
    }
  }

  if (data.animation) {
    codes = checkAnimation(codes, `${keypath}.animation.start`, `${data.id} - Start Animation`, data.animation.start)
    codes = checkAnimation(codes, `${keypath}.animation.main`, `${data.id} - Main Animation`, data.animation.main)
    codes = checkAnimation(codes, `${keypath}.animation.finish`, `${data.id} - Finish Animation`, data.animation.finish)
  }

  if (data.conditions) {
    data.conditions.forEach((condition, i) => {
      if (condition && condition.changes && condition.changes.length) {
        condition.changes.forEach((change, k) => {
          if (typeof(change.value) === 'object') {
            codes = checkCustomCondition(codes, `${keypath}.conditions[${i}].changes[${k}].value.custom`, `${data.id} - Condition`, change)
          }
        })
      }
    })
  }
  if (isStringMatch(data.grow, /^custom$/i) && isValidCodeString(data.customGrow)) {
    codes.push({
      name: `${data.id} - Custom Grow`,
      keypath: `${keypath}.customGrow`,
      lua: data.customGrow.trim()
    })
  }
  if (isStringMatch(data.sort, /^custom$/i) && isValidCodeString(data.customSort)) {
    codes.push({
      name: `${data.id} - Custom Sort`,
      keypath: `${keypath}.customSort`,
      lua: data.customSort.trim()
    })
  }
  if (isStringMatch(data.anchorPerUnit, /^custom$/i) && isValidCodeString(data.customAnchorPerUnit)) {
    codes.push({
      name: `${data.id} - Custom Anchor`,
      keypath: `${keypath}.customAnchorPerUnit`,
      lua: data.customAnchorPerUnit.trim()
    })
  }
  return codes
}

function isValidCodeString(str) {
  return isStringMatch(str, /\w/)
}

function isStringMatch(str, m) {
  return !!(str && typeof(str) === 'string' && str.match(m))
}

function checkTrigger(codes, keypath, id, trigger, untrigger, index) {
  if (!trigger || trigger.type !== 'custom') {
    return codes
  }

  if (isValidCodeString(trigger.custom)) {
    codes.push({
      name: `${id} - Trigger ${index}`,
      keypath: `${keypath}.trigger.custom`,
      lua: trigger.custom.trim(),
      triggerEveryFrame: trigger.check === 'update'
    })
  }

  if (untrigger && isValidCodeString(untrigger.custom) && trigger.custom_hide === 'custom') {
    codes.push({
      name: `${id} - Untrigger ${index}`,
      keypath: `${keypath}.untrigger.custom`,
      lua: untrigger.custom.trim()
    })
  }

  if (trigger.custom_type !== 'stateupdate') {
    let funcs = ['customName', 'customIcon', 'customTexture', 'customStacks', 'customVariables']
    if (trigger.custom_hide === 'custom') {
      funcs.unshift('customDuration')
    }
    funcs.forEach(fn => {
      if (isValidCodeString(trigger[fn])) {
        codes.push({
          name: `${id} - ${fn.replace(/^custom/, '')} ${index}`,
          keypath: `${keypath}.trigger.${fn}`,
          lua: trigger[fn].trim(),
          triggerEveryFrame: trigger.check === 'update'
        })
      }
    })

    let n = 1
    while (isValidCodeString(trigger['customOverlay' + n])) {
      codes.push({
        name: `${id} - Overlay {$n}`,
        keypath: `${keypath}.trigger.customOverlay${n}`,
        lua: trigger['customOverlay' + n].trim()
      })
      n++
    }
  }

  return codes
}

function checkActionCustom(codes, keypath, id, item) {
  if (item && item.do_custom && isValidCodeString(item.custom)) {
    codes.push({
      name: id,
      keypath: `${keypath}.custom`,
      lua: item.custom
    })
  }
  return codes
}

function checkActionCustomText(codes, keypath, id, item) {
  if (item && isStringMatch(item.message, /%c/) && isValidCodeString(item.message_custom)) {
    codes.push({
      name: id,
      keypath: `${keypath}.message_custom`,
      lua: item.message_custom.trim()
    })
  }
  return codes
}

function checkAnimation(codes, keypath, id, item) {
  if (!item) {
    return codes
  }

  if (item.alphaType === 'custom' && item.use_alpha && isValidCodeString(item.alphaFunc)) {
    codes.push({
      name: `${id}: Alpha`,
      keypath: `${keypath}.alphaFunc`,
      lua: item.alphaFunc.trim()
    })
  }

  if (item.translateType === 'custom' && item.use_translate && isValidCodeString(item.translateFunc)) {
    codes.push({
      name: `${id}: Translate`,
      keypath: `${keypath}.translateFunc`,
      lua: item.translateFunc.trim()
    })
  }

  if (item.scaleType === 'custom' && item.use_scale && isValidCodeString(item.scaleFunc)) {
    codes.push({
      name: `${id}: Scale`,
      keypath: `${keypath}.scaleFunc`,
      lua: item.scaleFunc.trim()
    })
  }

  if (item.rotateType === 'custom' && item.use_rotate && isValidCodeString(item.rotateFunc)) {
    codes.push({
      name: `${id}: Rotate`,
      keypath: `${keypath}.rotateFunc`,
      lua: item.rotateFunc.trim()
    })
  }

  if (item.colorType === 'custom' && item.use_color && isValidCodeString(item.colorFunc)) {
    codes.push({
      name: `${id}: Color`,
      keypath: `${keypath}.colorFunc`,
      lua: item.colorFunc.trim()
    })
  }
  return codes
}

function checkCustomCondition(codes, keypath, id, item) {
  if (!isValidCodeString(item.value.custom)) {
    return codes
  }

  if (item.property === 'chat') {
    codes.push({
      name: `${id}: [Condition] Custom Chat`,
      keypath: `${keypath}.value.custom`,
      lua: item.value.custom.trim()
    })
  }
  else if (item.property == 'customcode') {
    codes.push({
      name: `${id}: [Condition] Run Custom Code`,
      keypath: `${keypath}.value.custom`,
      lua: item.value.custom.trim()
    })
  }

  return codes
}
