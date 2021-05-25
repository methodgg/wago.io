const DetectCode_WeakAura = require('./get-code-wa')
const DetectCode_Plater = require('./get-code-plater')

module.exports = function(tbl, type) {
  if (type.match(/WEAKAURA/i)) {
    let codes = []
    if (tbl.d) {
      codes = codes.concat(DetectCode_WeakAura(tbl.d, 'd'))
    }
    if (tbl.c) {
      tbl.c.forEach((d, i) => {
        codes = codes.concat(DetectCode_WeakAura(d, `c[${i}]`))
      })
    }
    return codes
  }
  if (type.match(/PLATER/i)) {
    return DetectCode_Plater(tbl)
  }
  return []
}