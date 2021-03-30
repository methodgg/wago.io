module.exports = {
  typeMatch: /^ELVUI$/,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^[a-zA-Z0-9=\+\/]*$/)) {
      return false
    }
    const lua = `
      ${elvuiLua}
      local dataString = "${encodedString}"
      local profileInfo, profileType, profileKey, profileData, message
      local stringType = GetImportStringType(dataString)

      if stringType == "Base64" then
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
      elseif stringType == "Table" then
        local profileDataAsString
        profileDataAsString, profileInfo = SplitString(dataString, "}::") -- "}::" indicates the end of the table

        if not profileInfo then
          -- print("Error extracting profile info. Invalid import string!")
          return ''
        end

        if not profileDataAsString then
          -- print("Error extracting profile data. Invalid import string!")
          return ''
        end

        profileDataAsString = string.format("%s%s", profileDataAsString, "}") --Add back the missing "}"
        profileDataAsString = string.gsub(profileDataAsString, "\\124\\124", "\\124") --Remove escape pipe characters
        profileType, profileKey = SplitString(profileInfo, "::")

        local profileToTable = loadstring(string.format("%s %s", "return", profileDataAsString))
        if profileToTable then
          message, profileData = pcall(profileToTable)
        end

        if not profileData or type(profileData) ~= "table" then
          -- print("Error converting lua string to table:", message)
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
        local compressedData = LibCompress:Compress(serialData)
        local encodedData = LibBase64Elv:Encode(compressedData)
        return encodedData
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
function GetImportStringType(dataString)
	local stringType = ""

	if LibBase64Elv:IsBase64(dataString) then
		stringType = "Base64"
	elseif string.find(dataString, "{") then --Basic check to weed out obviously wrong strings
		stringType = "Table"
	end

	return stringType
end

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