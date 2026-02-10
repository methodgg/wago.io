// this file uses the same encoding/decoding techniques that the C_EncodingUtil adds in WoW 11.1.5
const zlib = require('zlib')
const borc = require('borc')

function zlibDecompress(zipped, method) {
    return new Promise((resolve, reject) => {
        if (method === 'deflateRaw') method = 'inflateRaw'
        else if (method === 'deflate') method = 'deflate'
        else if (method === 'gzip') method = 'gunzip'

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
        if (method === 'raw') method = 'deflateRaw'
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
        if (typeof parsedKey === 'string' && /^-?[\d.]+$/.test(parsedKey)) {
          const num = parseFloat(parsedKey, 10);
          if (!isNaN(num)) parsedKey = num;
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
        if (/^-?\d+$/.test(key)) {
          const num = parseFloat(key, 10);
          if (!isNaN(num)) actualKey = num;
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
async function decode(encodedString, {serialization='CBOR', compression='deflateRaw', encoding='base64'}={}) {
    try {
        let compressed
        if (encoding === 'base64' || encoding === 'hex') {
            compressed = Buffer.from(encodedString, encoding)
        }
        else {
            console.error('Unknown encoding', encoding)
            return false
        }

        let decompressed
        if (compression !== 'none') {
            decompressed = await zlibDecompress(compressed, compression)
        }
        else {
            decompressed = compressed
        }

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
        console.log('blizz decode error', e)
        return false
    }
}

async function encode(json, {serialization='CBOR', compression='deflateRaw', encoding='base64'}={}) {
    try {
        let serialized
        if (serialization === 'JSON') {
            if (typeof json === 'string') {
                serialized = json
            }
            else {
                serialized = JSON.stringify(json)
            }
        }
        else if (serialization === 'CBOR') {
            let obj            
            if (typeof json === 'string') {
                obj = JSON.parse(json)
            }
            else {
                obj = json
            }
            const objMap = JSONtoMap(obj)
            serialized = await borc.encode(objMap)
        }
        else {
            console.error('Unknown serialization', serialization)
            return false
        }
        
        let compressed
        if (compression !== 'none') {
            compressed = await zlibCompress(serialized, compression)
        }
        else {
            compressed = serialized
        }

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
    decode,
    encode
}