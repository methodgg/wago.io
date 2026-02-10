const lua = require('./lua')

async function decode(encodedString, {serialization='LibSerialize', compression='LibDeflate', encoding='base64'}={}) {
    try {        
        await addon.decode(req.body.importString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim(), lua.runLua)
        const escapedString = encodedString.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()
        const lua = [`local data = "${escapedString}"`]
        if (encoding === 'base64') {
            lua.push(`data = LibDeflate:DecodeForPrint(data)`)
        }
        else {
            throw 'Unknown serialization method'
        }

        if (compression === 'LibDeflate') {
            lua.push(`data = LibDeflate:DecompressDeflate(data)`)
        }
        else {
            throw 'Unknown compression method'
        }

        if (serialization === 'LibSerialize') {
            lua.push(`_, data = LibSerialize:Deserialize(data)`)
        }
        else {
            throw 'Unknown serialization method'
        }

        lua.push(`return JSON:encode(data, {"forceTableToArray" = {"snippets" = true}}) or nil`)
            
        const jsonStr = await lua.runLua(lua.join('\n'))
        return JSON.parse(jsonStr)
    }
    catch (e) {
      console.log('lua decode error', e)
      return false
    }
}

async function encode(json, {serialization='LibSerialize', compression='LibDeflate', encoding='base64'}={}) {
    try {
        if (typeof json === 'object') {
            json = JSON.stringify(json)
        }

        const lua = [`local data = JSON:decode("${json}")`, 'if not data then return "" end', 'data = fixNumberedIndexes(tbl, false)']
    
        if (serialization === 'LibSerialize') {
            lua.push(`_, data = LibSerialize:Serialize(tbl)`)
        }
        else {
            throw 'Unknown serialization method'
        }

        if (compression === 'LibDeflate') {
            lua.push(`data = LibDeflate:CompressDeflate(serialized, {level = 9})`)
        }
        else {
            throw 'Unknown compression method'
        }

        if (encoding === 'base64') {
            lua.push(`data = LibDeflate:EncodeForPrint(data)`)
        }
        else {
            throw 'Unknown encoding method'
        }

        lua.push('return data or nil')
        const jsonStr = await lua.runLua(lua.join('\n'))
        return JSON.parse(jsonStr)
    }
    catch (e) {
        console.log(e)
        return false
    }
}

module.exports = {
    decode,
    encode
}