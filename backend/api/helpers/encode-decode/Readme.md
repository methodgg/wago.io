## Follow this template for adding new import types

View the other addons in use for further examples.

```js
module.exports = {
  typeMatch: /^MYADDON$/, // simple regex that should match your meta.type (see processMeta below)

  // Decodes an import string and returns a JSON object.
  // Receives `str` which is the raw import string, and `exec` which is a function to run Lua code.
  decode: async (encodedString, exec) => {
    // Test that string matches expected regex
    if (!encodedString.match(/^\w+$/)) {
      return false
    }
    // Lua code to decode the string. This should return JSON:encode(table).
    // The Lua code here has access to the contents of ../../lua/wago.lua
    const lua = `
      local str = "${encodedString}" -- encodedString is already escaped for \\ and \"
      -- run some functions to get a table
      local myTable = DoThings(str)
      return JSON:encode(myTable)
    `
    try {
      let json = await exec(lua)
      // If successful, json is now a JSON string, so parse into an object and return it.
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (jsonString, exec) => {
    // Lua code to encode a JSON string into an import string. 
    // The Lua code here has access to the contents of ../../lua/wago.lua
    const lua = `
    local tbl = JSON:decode("${jsonString}") -- jsonString is already escaped for \\ and \"
    if not tbl then return "" end

    local encodedString = DoThat(tbl)
    return encodedString`
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  // Returns object with related meta data: name, type, game, categories
  // Also functions as a validation for the data structure. 
  // This is kept separate from the decoding process because multiple addons can share a decode algorithm so this way means it's only decoded once.
  processMeta: (obj) => {
    // Return false if the object does not match the structure or missing key data fields; the import will not be allowed for this addon.
    if (!obj || !obj.someValueThatShouldBeHere) {
      return false
    }
    var meta = {}

    // This is the only required field and must be unique to your addon.
    meta.type = 'MyAddon'

    // the remaining fields are optional.
    meta.game = 'sl' // Expansion from object (example if toc version is stored to object; defaults to the most recent retail expansion).
    // meta.game may be : 'sl', 'classic', 'tbc'
    
    // the remaining fields are both optional and only used for new imports - not when updating existing imports.
    meta.name = 'Name' // Name from object, or otherwise. Defaults to match the type field (user can modify this entry).
    meta.description = 'This is a neat import' // Description from object, or otherwise. Defaults to empty string (user can modify this entry).
    meta.categories = ['cl12'] // Categories; view categories in /frontend/src/components/libs/categories.js (user can modify this entry).
    meta.fork = obj.wagoID // if your addon's data includes the wago ID it can be assigned here as a fork.
    return meta
  },

  // Returns modified code object and wago object after modifications.
  // This function can be removed if no modifications are required; you probably won't need it without additional Wago integration.
  addWagoData: async (code, wago) => {
    if (code.json) {
      // usually the modified code will effect the json object
      var json = JSON.parse(code.json)
      json.wagoID = wago._id
      code.json = JSON.stringify(json)
    }

    // usually, only code is modified.
    return {code: code}
    // if both code and wago are modified, return both. 
    return {code: code, wago: wago}
  }
}
```