dofile( "./wowhelpers.lua" )

pcall(function() dofile( "./libs/LibStub/LibStub.lua" ) end)
dofile( "./libs/LibBase64-1.0/LibBase64-1.0.lua" )
dofile( "./libs/AceSerializer-3.0/AceSerializer-3.0.lua" )
dofile( "./libs/LibCompress/LibCompress.lua" )

local LibCompress = LibStub:GetLibrary("LibCompress")
local LibBase64 = LibStub("LibBase64-1.0-ElvUI")
local Serializer = LibStub:GetLibrary("AceSerializer-3.0")

local JSON = (loadfile "./json.lua")()


function table.show(t, name, indent)
   local cart     -- a container
   local autoref  -- for self references

   --[[ counts the number of elements in a table
   local function tablecount(t)
      local n = 0
      for _, _ in pairs(t) do n = n+1 end
      return n
   end
   ]]
   -- (RiciLake) returns true if the table is empty
   local function isemptytable(t) return next(t) == nil end

   local function basicSerialize (o)
      local so = tostring(o)
      if type(o) == "function" then
         local info = debug.getinfo(o, "S")
         -- info.name is nil because o is not a calling level
         if info.what == "C" then
            return string.format("%q", so .. ", C function")
         else
            -- the information is defined through lines
            return string.format("%q", so .. ", defined in (" ..
                info.linedefined .. "-" .. info.lastlinedefined ..
                ")" .. info.source)
         end
      elseif type(o) == "number" or type(o) == "boolean" then
         return so
      else
         return string.format("%q", so)
      end
   end

   local function addtocart (value, name, indent, saved, field)
      indent = indent or ""
      saved = saved or {}
      field = field or name

      cart = cart .. indent .. field

      if type(value) ~= "table" then
         cart = cart .. " = " .. basicSerialize(value) .. ";\n"
      else
         if saved[value] then
            cart = cart .. " = {}; -- " .. saved[value]
                        .. " (self reference)\n"
            autoref = autoref ..  name .. " = " .. saved[value] .. ";\n"
         else
            saved[value] = name
            --if tablecount(value) == 0 then
            if isemptytable(value) then
               cart = cart .. " = {};\n"
            else
               cart = cart .. " = {\n"
               for k, v in pairs(value) do
                  k = basicSerialize(k)
                  local fname = string.format("%s[%s]", name, k)
                  field = string.format("[%s]", k)
                  -- three spaces between levels
                  addtocart(v, fname, indent .. "   ", saved, field)
               end
               cart = cart .. indent .. "};\n"
            end
         end
      end
   end

   name = name or "__AURA__"
   if type(t) ~= "table" then
      return name .. " = " .. basicSerialize(t)
   end
   cart, autoref = "", ""
   addtocart(t, name, indent)
   return cart .. autoref
end

function Decode(dataString)
	local profileType, profileKey, profileData, message
	local stringType = GetImportStringType(dataString)

	if stringType == "Base64" then
		local decodedData = LibBase64:Decode(dataString)
		local decompressedData, message = LibCompress:Decompress(decodedData)

		if not decompressedData then
			print("Error decompressing data:", message)
			return
		end

		local serializedData, success
		serializedData, profileType, profileKey = SplitString(decompressedData, "::")
		success, profileData = Serializer:Deserialize(serializedData)
		if not success then
			print("Error deserializing:", profileData)
			return
		end
	elseif stringType == "Table" then
		local profileDataAsString
		profileDataAsString, profileType, profileKey = SplitString(dataString, "::")
		if not profileDataAsString then
			print("Error extracting profile data. Invalid import string!")
			return
		end

		local profileToTable = loadstring(string.format("%s %s", "return", profileDataAsString))
		if profileToTable then
			message, profileData = pcall(profileToTable)
		end

		if not profileData or type(profileData) ~= "table" then
			print("Error converting lua string to table:", message)
			return
		end
	end

	--return profileType, profileKey, profileData
    return profileData

end

function GetImportStringType(dataString)
	local stringType = ""

	if LibBase64:IsBase64(dataString) then
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
end

local t
if string.find(arg[1], "/tmp/wagoimport") == nil then
    t = JSON:decode(arg[1])
else
    local f = io.open(arg[1], "r")
    t = f:read()
    f:close()
    t = JSON:decode(t)
end


local serialData = Serializer:Serialize(t)
local exportString = string.format("%s::%s::%s", serialData, "profile", "profile")
local compressedData = LibCompress:Compress(serialData)
local encodedData = LibBase64:Encode(compressedData)

if (encodedData) then
    print(encodedData)
end