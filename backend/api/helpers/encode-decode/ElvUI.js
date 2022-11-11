module.exports = {
  typeMatch: /^ELVUI$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    let stringVersion
    if (encodedString.match(/^!E(\d+)![a-zA-Z0-9\(\)]+$/)) {
      stringVersion = 2
    }
    else if (encodedString.match(/^[a-zA-Z0-9=\+\/]+$/)) {
      stringVersion = 1
    }
    else {
      return false
    }
    
    const lua = `
      ${elvuiLua}
      local dataString = "${encodedString}"
      local profileInfo, profileType, profileKey, profileData

      if ${stringVersion} == 2 then
        local _, _, encodeVersion, encoded = dataString:find("^(!E%d+!)(.+)$")
        if encodeVersion then
          encodeVersion = tonumber(encodeVersion:match("%d+"))
        else
        -- print('Error getting encode version.')
          return ''
        end

        local decodedData, decompressed
        if encodeVersion == 1 then
          decodedData = LibDeflate:DecodeForPrint(encoded)
          decompressed = LibDeflate:DecompressDeflate(decodedData)
        end

        if not decompressed then
          -- print('Error decompressing data.')
          return ''
        end

        local serializedData, success
        serializedData, profileInfo = SplitString(decompressed, '^^::') -- '^^' indicates the end of the AceSerializer string

        if not profileInfo then
          -- print('Error importing profile. String is invalid or corrupted!')
          return
        end

        serializedData = string.format('%s%s', serializedData, '^^') --Add back the AceSerializer terminator
        profileType, profileKey = SplitString(profileInfo, '::')
        success, profileData = Serializer:Deserialize(serializedData)

        if not success then
          -- print('Error deserializing:', profileData)
          return ''
        end
      
      elseif ${stringVersion} == 1 then -- old data string
        local decodedData = LibBase64Elv:Decode(dataString)
        local decompressedData, message = LibCompress:Decompress(decodedData)

        if not decompressedData then
          -- print("Error decompressing data:", message)
          return ''
        end

        local serializedData, success
        serializedData, profileInfo = SplitString(decompressedData, "^^::") -- "^^" indicates the end of the AceSerializer string
        if not profileInfo then
          -- print("Error importing profile. String is invalid or corrupted!")
          return ''
        end

        serializedData = string.format("%s%s", serializedData, "^^") --Add back the AceSerializer terminator
        profileType, profileKey = SplitString(profileInfo, "::")
        success, profileData = Serializer:Deserialize(serializedData)

        if not success then
          -- print("Error deserializing:", profileData)
          return ''
        end
      end

      return JSON:encode(profileData)
    `
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },

  encode: async (json, exec) => {
    const lua = `
      local t = JSON:decode("${json}")

      local serialData = Serializer:Serialize(t)
      if (serialData) then
        local exportString = string.format("%s::%s::%s", serialData, "profile", "my profile")
        local compressedData = LibDeflate:CompressDeflate(exportString, {level = 9}) -- 5 in elv code?
		    local encodedData = LibDeflate:EncodeForPrint(compressedData)
        return "!E1!" .. encodedData
      end
      return ''
    `
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      return false
    }
  },

  processMeta: (obj) => {
    if (!obj || !obj.movers || !obj.general) {
      return false
    }

    var meta = {type: 'ELVUI', name: 'ElvUI Profile', categories: []}
    return meta
  }
}

const elvuiLua = `
function SplitString(s, delim)
	assert(type (delim) == "string" and string.len(delim) > 0, "bad delimiter")

	local start = 1
	local t = {}  -- results table

	-- find each instance of a string followed by the delimiter
	while true do
		local pos = string.find(s, delim, start, true) -- plain find

		if not pos then
			break
		end

		tinsert(t, string.sub(s, start, pos - 1))
		start = pos + string.len(delim)
	end -- while

	-- insert final one (after last delimiter)
	tinsert(t, string.sub(s, start))

	return unpack(t)
end`