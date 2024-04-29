const reSlashCommand = /^\/\w+/m

module.exports = {
  typeMatch: /^MACRO$/i,
  domain: ENUM.DOMAIN.WOW,

  decode: async (str) => {
    // does this look like a macro?
    if (!str.match(reSlashCommand)) {
      return false
    }
    return str.replace(/\\n/)
  },

  encode: async (str) => {
    if (!encodedString.match(reSlashCommand)) {
        return false
    }
    
    return str.replace(/target=/g, '@')
  },

  processMeta: () => {
    return {
        type: "MACRO",
        name: "My Macro"
    }
  },

  plainText: true
}

