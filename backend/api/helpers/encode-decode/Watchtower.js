const getCode = require('../code-detection/get-code')
const patchDates = require('../patchDates')
const blizzEncoding = require('../blizzEncoding')

module.exports = {
  typeMatch: /^WATCHTOWER$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    const content = encodedString.match(/^WT1:(\w+):([a-zA-Z0-9+=\/]+)$/)
    if (content?.[1] && content[2]) {
        try {
            const obj = {
                type: content[1],
                data: await blizzEncoding.standardDecode(content[2])
            }
            return obj
        }
        catch {}
    }
    return false
  },

  encodeRaw: async (json, exec) => {
    try {
        const obj = JSON.parse(json)
        console.log('encode', obj)
        const prefix = `WT1:${obj.type}:`
        return prefix + await blizzEncoding.standardEncode(obj.data)
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    var meta = { categories: [] }
    if (!obj) {
      return false
    }
    meta.type = 'WATCHTOWER'
    meta.name = `Watchtower ${obj.type}`

    return meta
  },
}