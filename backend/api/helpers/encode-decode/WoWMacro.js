const reSlashCommand = /^(\/\w+|#)/m

module.exports = {
  typeMatch: /^MACRO$/i,
  domain: ENUM.DOMAIN.WOW,
  plainText: true,

  decode: async (str) => {
    // does this look like a macro?
    if (!str.match(reSlashCommand)) {
      return false
    }
    return str
  },

  encodeRaw: async (str) => {
    str = str.replace(/^"|"$/mg, '')
    if (!str.match(reSlashCommand)) {
        return false
    }
    
    return str.replace(/target=/g, '@').replace("\\n", "\n")
  },

  processMeta: () => {
    return {
        type: "MACRO",
        name: "My Macro"
    }
  },

  plainText: true
}