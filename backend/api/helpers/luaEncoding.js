const luajit = require('./lua')

async function decode(encodedString, {serialization='LibSerialize', compression='LibDeflate', encoding='base64'}={}) {
    try {
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

        if (serialization === 'LibSerialize' || serialization === 'AceSerializer') {
            lua.push(`_, data = ${serialization}:Deserialize(data)`)
        }
        else {
            throw 'Unknown serialization method ' + serialization
        }

        lua.push(`return JSON:encode(data, {forceTableToArray = {snippets = true}}) or ""`)
        console.log('get json')
        const jsonStr = await luajit.runLua(lua.join('\n'))
        console.log(jsonStr.substring(0, 100))
        if (jsonStr?.length > 20 && jsonStr.match(/^\s*\{/)) {
            return JSON.parse(jsonStr)
        }
        return false
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

        const lua = [
            `local data = JSON:decode("${json.replace(/\\/g, '\\\\').replace(/"/g, '\\"').trim()}")`, 
            'if not data then return "" end', 
            'data = fixNumberedIndexes(data)'
        ]
    
        if (serialization === 'LibSerialize' || serialization === 'AceSerializer') {
            lua.push(`data = ${serialization}:Serialize(data)`)
        }
        else {
            throw 'Unknown serialization method'
        }

        if (compression === 'LibDeflate') {
            lua.push(`data = LibDeflate:CompressDeflate(data, {level = 9})`)
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

        lua.push('return data or ""')
        const encodedStr = await luajit.runLua(lua.join('\n'))
        if (encodedStr?.length > 20) {
            return encodedStr
        }
        return false
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