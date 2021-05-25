module.exports = function(data) {
  let codes = []
  if (data.type === 'script' || data['11']) { // Plater script
    codes = checkTrigger(codes, `${keypath}.triggers[${i}]`, `${data.id}`, data.triggers[''+i].trigger, data.triggers[''+i].untrigger, i)

    if (isValidCodeString(data['12'])) {
      codes.push({name: `Constructor`, keypath: `['12']`, lua: data['12'].trim()})
    }
    if (isValidCodeString(data['14'])) {
      codes.push({name: `On Show`, keypath: `['14']`, lua: data['14'].trim()})
    }
    if (isValidCodeString(data['11'])) {
      codes.push({name: `On Update`, keypath: `['11']`, lua: data['11'].trim()})
    }
    if (isValidCodeString(data['13'])) {
      codes.push({name: `On Hide`, keypath: `['13']`, lua: data['13'].trim()})
    }
    if (isValidCodeString(data['15'])) {
      codes.push({name: `Initialization`, keypath: `['15']`, lua: data['15'].trim()})
    }
    return codes
  }
  else if (data.type === 'hook' || data['9']) { // Plater hook
    for (hook in data['9']) {
      if (isValidCodeString(data['9'][hook])) {
        codes.push({name: hook, keypath: `[9]["${hook.replace(/"/, '\\"')}"]`, lua: data['9'][hook].trim()})
      }
    }
    return codes
  }

  return []
}

function isValidCodeString(str) {
  return !!(str && typeof(str) === 'string' && str.match(/\w/))
}