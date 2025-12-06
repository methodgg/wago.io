// this file uses the same encoding/decoding techniques that the C_EncodingUtil adds in WoW 11.1.5
const zlib = require('zlib')
const borc = require('borc')

function zlibDecompress(gzipped) {
    return new Promise((resolve, reject) => {
        zlib.inflateRaw(gzipped, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
    });
}

function zlibCompress(gzipped) {
    return new Promise((resolve, reject) => {
        zlib.deflateRaw(gzipped, (err, result) => {
            if (err) {
                return reject(err);
            }
            resolve(result);
        });
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

async function standardDecode(encodedString) {
    try {
        const compressed = Buffer.from(encodedString, 'base64')
        const decompressed = await zlibDecompress(compressed)
        const decodedMap = await borc.decodeFirst(decompressed)
        const json = mapToJSON(decodedMap)
        return json
    }
    catch (e) {
        console.log(e)
        return false
    }
}

async function standardEncode(json) {
    try {
        const obj = JSON.parse(json)
        const encodedMap = JSONtoMap(obj)
        const encodedCbor = await borc.encode(encodedMap)
        const compressed = await zlibCompress(encodedCbor)
        return Buffer.from(compressed).toString('base64')
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