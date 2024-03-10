module.exports = {
  typeMatch: /^VUHDO$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^[a-zA-Z0-9=\+\/]*$/)) {
      return false
    }
    const lua = `
      local str = "${encodedString}"
      local t = VUHDO_decompressIfCompressed(VUHDO_LibBase64.Decode(str))

      if t then
        return JSON:encode(t)
      else
        return ''
      end
    `
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  encode: async (json, exec) => {
    const lua = `
      local t = JSON:decode("${json}")

      if t.profile and t.profile.PANEL_SETUP and t.profile.PANEL_SETUP["1"] then
        n = 1
        while t.profile.PANEL_SETUP[""..n] do
          tinsert(t.profile.PANEL_SETUP, t.profile.PANEL_SETUP[""..n])
          t.profile.PANEL_SETUP[""..n] = nil
          n = n+1
        end
      end

      local compressed = VUHDO_compressAndPackTable(t)
      local encodedString = VUHDO_LibBase64.Encode(compressed)
      return encodedString
    `
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  processMeta: (obj) => {
    var meta = {categories: []}
    if (!obj) {
      return false
    }

    meta.type = 'VUHDO'

    if (obj.bouquetName && obj.bouquet) {
      meta.name = obj.bouquetName + ' Bouquet'
    }
    else if (obj.keyLayout && obj.keyLayout.MOUSE && obj.keyLayout.NAME) {
      meta.name = obj.keyLayout.NAME + ' Key Layout'
    }
    else if (obj.profile && obj.profile.ORIGINATOR_TOON && obj.profile.PANEL_SETUP) {
      meta.name = obj.profile.ORIGINATOR_TOON + ' Profile'
    }
    else {
      return false
    }

    return meta
  },

  addWagoData: (code, wago) => {
    if (!code.json) {
      return
    }
    let obj = JSON.parse(code.json)

    let sysCat
    if (obj.bouquetName && obj.bouquet) {
      sysCat = 'vuhdo2'
    }
    else if (obj.keyLayout && obj.keyLayout.MOUSE && obj.keyLayout.NAME) {
      sysCat = 'vuhdo3'
    }
    else if (obj.profile && obj.profile.ORIGINATOR_TOON && obj.profile.PANEL_SETUP) {
      sysCat = 'vuhdo1'
    }
    // category setup
    if (wago.categories.indexOf('vuhdo0') < 0) {
      wago.categories.push('vuhdo0')
      if (sysCat) {
        wago.categories.push(sysCat)
      }
      return {wago}
    }
    return {}
  }
}
