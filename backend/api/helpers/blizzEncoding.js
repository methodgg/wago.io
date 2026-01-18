// this file uses the same encoding/decoding techniques that the C_EncodingUtil adds in WoW 11.1.5
const zlib = require('zlib')
const borc = require('borc')

function zlibDecompress(zipped, method) {
    return new Promise((resolve, reject) => {
        if (method === 'inflateRaw' || method === 'inflate' || method === 'gunzip') {
            zlib[method](zipped, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        }
        else {
            reject('Invalid compression method', method);
        }
    });
}

function zlibCompress(content, method) {
    return new Promise((resolve, reject) => {
        if (method === 'deflateRaw' || method === 'deflate' || method === 'gzip') {
            zlib[method](content, (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        }
        else {
            reject('Invalid compression method', method);
        }
    });
}

function mapToJSON(obj) {
    if (Buffer.isBuffer(obj)) {
      return obj.toString('utf-8');
    }
  
    if (obj instanceof Map) {
      const result = {};
      for (const [key, value] of obj.entries()) {
        let parsedKey = mapToJSON(key);
  
        // If parsedKey is a string that looks like a number, cast it
        if (typeof parsedKey === 'string' && /^\d+$/.test(parsedKey)) {
          const num = parseInt(parsedKey, 10);
          if (num >= 0) parsedKey = num;
        }
  
        result[parsedKey] = mapToJSON(value);
      }
      return result;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(mapToJSON);
    }
  
    return obj; // primitives: number, boolean, etc.
}
  
function JSONtoMap(obj) {
    if (Array.isArray(obj)) {
      return obj.map(JSONtoMap);
    }
  
    if (obj && typeof obj === 'object' && !(obj instanceof Buffer)) {
      const result = new Map();
  
      for (const [key, value] of Object.entries(obj)) {
        let actualKey = key;
  
        // Rule: convert numeric string keys back to numbers
        if (/^\d+$/.test(key)) {
          const num = parseInt(key, 10);
          if (num) actualKey = num;
        }
  
        result.set(actualKey, JSONtoMap(value));
      }
  
      return result;
    }
  
    return obj;
}

// C_EncodingUtil.CompressString options:
// 0 = deflateRaw/inflateRaw (default)
// 1 = deflate/inflate - with zlib wrapper
// 2 = gzip/gunzip
async function standardDecode(encodedString, {serialization='CBOR', compression='inflateRaw', encoding='base64'}={}) {
    try {
        let compressed
        if (encoding === 'base64' || encoding === 'hex') {
            compressed = Buffer.from(encodedString, encoding)
        }
        else {
            console.error('Unknown encoding', encoding)
            return false
        }

        const decompressed = await zlibDecompress(compressed, compression)

        if (serialization === 'JSON') {
            return JSON.parse(decompressed)
        }
        else if (serialization === 'CBOR') {
            const decodedMap = await borc.decodeFirst(decompressed)
            return mapToJSON(decodedMap)
        }
        else {
            console.error('Unknown serialization', serialization)
            return false
        }
    }
    catch (e) {
        console.log(e)
        return false
    }
}

async function standardEncode(json, {serialization='CBOR', compression='deflateRaw', encoding='base64'}={}) {
    try {
        let seralized
        if (serialization === 'JSON') {
            if (typeof json === 'string') {
                seralized = json
            }
            else {
                seralized = JSON.stringify(json)
            }
        }
        else if (serialization === 'CBOR') {
            let obj            
            if (typeof json === 'string') {
                console.log(json)
                obj = JSON.parse(json)
            }
            else {
                obj = json
            }
            const objMap = JSONtoMap(obj)
            seralized = await borc.encode(objMap)
        }
        else {
            console.error('Unknown serialization', serialization)
            return false
        }
        
        const compressed = await zlibCompress(seralized, compression)

        if (encoding === 'base64' || encoding === 'hex') {
            return Buffer.from(compressed).toString(encoding)
        }
        else {
            console.error('Unknown encoding', encoding)
            return false
        }
    }
    catch (e) {
        console.log(e)
        return false
    }
}

module.exports = {
    zlibDecompress,
    zlibCompress,
    mapToJSON,
    JSONtoMap,
    standardDecode,
    standardEncode
}