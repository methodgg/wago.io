dofile( "./wowhelpers.lua" )

pcall(function() dofile( "./libs/LibStub/LibStub.lua" ) end)
pcall(function() dofile( "./libs/CallbackHandler-1.0/CallbackHandler-1.0.lua" ) end)
pcall(function() dofile( "./libs/LibChatAnims/LibChatAnims.lua" ) end)
pcall(function() dofile( "./libs/AceGUI-3.0/AceGUI-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceConsole-3.0/AceConsole-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceConfig-3.0/AceConfigRegistry-3.0/AceConfigRegistry-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceConfig-3.0/AceConfigCmd-3.0/AceConfigCmd-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceConfig-3.0/AceConfigDialog-3.0/AceConfigDialog-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceConfig-3.0/AceConfig-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceTimer-3.0/AceTimer-3.0.lua" ) end)
dofile( "./libs/AceSerializer-3.0/AceSerializer-3.0.lua" )
pcall(function() dofile( "./libs/ChatThrottleLib/ChatThrottleLib.lua" ) end)
pcall(function() dofile( "./libs/AceComm-3.0/AceComm-3.0.lua" ) end)
pcall(function() dofile( "./libs/AceEvent-3.0/AceEvent-3.0.lua" ) end)
dofile( "./libs/LibCompress/LibCompress.lua" )
pcall(function() dofile( "./libs/LibBabble-Race-3.0/LibBabble-3.0.lua" ) end)
pcall(function() dofile( "./libs/LibBabble-Race-3.0/LibBabble-Race-3.0.lua" ) end)
pcall(function() dofile( "./libs/LibDataBroker-1.1/LibDataBroker-1.1.lua" ) end)
pcall(function() dofile( "./libs/LibButtonGlow-1.0/LibButtonGlow-1.0.lua" ) end)
pcall(function() dofile( "./libs/LibDeflate/LibDeflate.lua" ) end)

dofile( "./VUHDO.lua" )

dofile( "./libs/LibBase64-1.0-Elv/LibBase64-1.0.lua" )
local LibBase64Elv = LibStub("LibBase64-1.0-ElvUI")

local Compresser = LibStub:GetLibrary("LibCompress")
local LibCompress = LibStub:GetLibrary("LibCompress")
local Encoder = Compresser:GetAddonEncodeTable()
local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
local LibDeflate = LibStub:GetLibrary("LibDeflate")
local configForDeflate = {level = 9}

local JSON = (loadfile "./json.lua")()

function StringToTable(inString)
  -- if gsub strips off a ! at the beginning then we know that this is not a legacy encoding
  local encoded, usesDeflate = inString:gsub("^%!", "")
  local decoded

  decoded = decodeB64(inString);
  if usesDeflate == 1 then
    decoded = LibDeflate:DecodeForPrint(encoded)
  else
    decoded = decodeB64(encoded)
  end

  local decompressed, errorMsg = nil, "unknown compression method"
  if usesDeflate == 1 then
    decompressed = LibDeflate:DecompressDeflate(decoded)
  else
    decompressed, errorMsg = Compresser:Decompress(decoded)
  end

  if not(decompressed) then
    return "Error decompressing: " .. errorMsg
  end

  local success, deserialized = Serializer:Deserialize(decompressed)
  if not(success) then
    return "Error deserializing "..deserialized
  end
  return deserialized
end

function TableToString(inTable)
  local serialized = Serializer:Serialize(inTable)
  local compressed = LibDeflate:CompressDeflate(serialized, configForDeflate)
  local encoded = "!" .. LibDeflate:EncodeForPrint(compressed)
  return encoded
end

function TableToStringOld(inTable)
  local serialized = Serializer:Serialize(inTable);
  local compressed = Compresser:CompressHuffman(serialized);
  local encoded = encodeB64(compressed);
  return encoded
end

local decodeB64Table = {}
local B64tobyte = {
      a =  0,  b =  1,  c =  2,  d =  3,  e =  4,  f =  5,  g =  6,  h =  7,
      i =  8,  j =  9,  k = 10,  l = 11,  m = 12,  n = 13,  o = 14,  p = 15,
      q = 16,  r = 17,  s = 18,  t = 19,  u = 20,  v = 21,  w = 22,  x = 23,
      y = 24,  z = 25,  A = 26,  B = 27,  C = 28,  D = 29,  E = 30,  F = 31,
      G = 32,  H = 33,  I = 34,  J = 35,  K = 36,  L = 37,  M = 38,  N = 39,
      O = 40,  P = 41,  Q = 42,  R = 43,  S = 44,  T = 45,  U = 46,  V = 47,
      W = 48,  X = 49,  Y = 50,  Z = 51,["0"]=52,["1"]=53,["2"]=54,["3"]=55,
    ["4"]=56,["5"]=57,["6"]=58,["7"]=59,["8"]=60,["9"]=61,["("]=62,[")"]=63
}
local bit_band, bit_lshift, bit_rshift = bit.band, bit.lshift, bit.rshift

function decodeB64(str)
    local bit8 = decodeB64Table;
    local decoded_size = 0;
    local ch;
    local i = 1;
    local bitfield_len = 0;
    local bitfield = 0;
    local l = #str;
    while true do
        if bitfield_len >= 8 then
            decoded_size = decoded_size + 1;
            bit8[decoded_size] = string_char(bit_band(bitfield, 255));
            bitfield = bit_rshift(bitfield, 8);
            bitfield_len = bitfield_len - 8;
        end
        ch = B64tobyte[str:sub(i, i)];
        bitfield = bitfield + bit_lshift(ch or 0, bitfield_len);
        bitfield_len = bitfield_len + 6;
        if i > l then
            break;
        end
        i = i + 1;
    end
    return table.concat(bit8, "", 1, decoded_size)
end

local bytetoB64 = {
    [0]="a","b","c","d","e","f","g","h",
    "i","j","k","l","m","n","o","p",
    "q","r","s","t","u","v","w","x",
    "y","z","A","B","C","D","E","F",
    "G","H","I","J","K","L","M","N",
    "O","P","Q","R","S","T","U","V",
    "W","X","Y","Z","0","1","2","3",
    "4","5","6","7","8","9","(",")"
}

--This code is based on the Encode7Bit algorithm from LibCompress
--Credit goes to Galmok of European Stormrage (Horde), galmok@gmail.com
local encodeB64Table = {};
function encodeB64(str)
    local B64 = encodeB64Table;
    local remainder = 0;
    local remainder_length = 0;
    local encoded_size = 0;
    local l=#str
    local code
    for i=1,l do
        code = string.byte(str, i);
        remainder = remainder + bit_lshift(code, remainder_length);
        remainder_length = remainder_length + 8;
        while(remainder_length) >= 6 do
            encoded_size = encoded_size + 1;
            B64[encoded_size] = bytetoB64[bit_band(remainder, 63)];
            remainder = bit_rshift(remainder, 6);
            remainder_length = remainder_length - 6;
        end
    end
    if remainder_length > 0 then
        encoded_size = encoded_size + 1;
        B64[encoded_size] = bytetoB64[remainder];
    end
    return table.concat(B64, "", 1, encoded_size)
end

-- elvui
function Decode(dataString)
  local profileInfo, profileType, profileKey, profileData, message
	local stringType = GetImportStringType(dataString)

	if stringType == "Base64" then
		local decodedData = LibBase64Elv:Decode(dataString)
		local decompressedData, message = LibCompress:Decompress(decodedData)

		if not decompressedData then
			print("Error decompressing data:", message)
			return
		end

		local serializedData, success
		serializedData, profileInfo = SplitString(decompressedData, "^^::") -- "^^" indicates the end of the AceSerializer string

		if not profileInfo then
			print("Error importing profile. String is invalid or corrupted!")
			return
		end

		serializedData = string.format("%s%s", serializedData, "^^") --Add back the AceSerializer terminator
		profileType, profileKey = SplitString(profileInfo, "::")
		success, profileData = Serializer:Deserialize(serializedData)

		if not success then
			print("Error deserializing:", profileData)
			return
		end
	elseif stringType == "Table" then
		local profileDataAsString
		profileDataAsString, profileInfo = SplitString(dataString, "}::") -- "}::" indicates the end of the table

		if not profileInfo then
			print("Error extracting profile info. Invalid import string!")
			return
		end

		if not profileDataAsString then
			print("Error extracting profile data. Invalid import string!")
			return
		end

		profileDataAsString = string.format("%s%s", profileDataAsString, "}") --Add back the missing "}"
		profileDataAsString = string.gsub(profileDataAsString, "\124\124", "\124") --Remove escape pipe characters
		profileType, profileKey = SplitString(profileInfo, "::")

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
end

-- Grid2
local function HexEncode(s,title)
	local hex= { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" }
	local b_rshift = bit.rshift
	local b_and = bit.band
	local byte= string.byte
	local t= { string.format("[=== %s profile ===]",title or "") }
	local j= 0
	for i=1,#s do
		if j<=0 then
			t[#t+1], j = "\n", 32
		end		
		j = j - 1
		--
		local b= byte(s,i)
		t[#t+1]= hex[ b_and(b,15) + 1 ]
		t[#t+1]= hex[ b_and(b_rshift(b,4),15) + 1 ]
	end
	t[#t+1]= "\n"
	t[#t+1]= t[1]
	return table.concat(t)
end

local function HexDecode(s)
	-- remove header,footer and any non hex character
	s= s:gsub("%[.-%]",""):gsub("[^0123456789ABCDEF]","")
	if (#s==0) or (#s%2 ~= 0) then return false, "Invalid Hex string" end
	-- lets go decoding
	local b_lshift= bit.lshift
	local byte= string.byte
	local char= string.char
	local t = {}
	local bl,bh
	local i = 1
	repeat
		bl = byte(s,i)
		bl = bl>=65 and bl-55 or bl-48
		i = i + 1
		bh = byte(s,i)  
		bh = bh>=65 and bh-55 or bh-48
		i = i + 1
		t[#t+1] = char( b_lshift(bh,4) + bl )
	until i>=#s
	return table.concat(t)
end

function WA2JSON(importStr) 
  local t = StringToTable(importStr, false)

  if (t) then
    print(JSON:encode(t))
  else
    print("{}")
  end
end

function JSON2WA(json)
  local t = JSON:decode(json)
  local n

  if t and t.d and t.d.triggers and t.d.triggers["1"] then
    n = 1
    while t.d.triggers[""..n] do
      tinsert(t.d.triggers, t.d.triggers[""..n])
      t.d.triggers[""..n] = nil
      n = n+1
    end
  end

  if t and t.c then
    for i=1, #t.c do
      if t.c[i].triggers and t.c[i].triggers["1"] then
        n = 1
        while t.c[i].triggers[""..n] do
          tinsert(t.c[i].triggers, t.c[i].triggers[""..n])
          t.c[i].triggers[""..n] = nil
          n = n+1
        end
      end
    end
  end

  if (t) then
    print(TableToString(t))
  else
    print("")
  end
end

function Elv2JSON(importStr)
  local t = Decode(importStr, false)
  
  if (t) then
    print(JSON:encode(t))
  else
    print("{}")
  end
end

function JSON2Elv(json)
  local t = JSON:decode(json)

  local serialData = Serializer:Serialize(t)
  if (serialData) then
    local exportString = string.format("%s::%s::%s", serialData, "profile", "my profile")
    local compressedData = LibCompress:Compress(serialData)
    local encodedData = LibBase64Elv:Encode(compressedData)
    print(encodedData)
  end
end

function Vuhdo2JSON(importStr) 
  local t = VUHDO_decompressIfCompressed(VUHDO_LibBase64.Decode(importStr))

  if (t) then
    print(JSON:encode(t))
  else
    print("{}")
  end
end

function JSON2Vuhdo(json)
  local t = JSON:decode(json)

  if (t) then
    print(VUHDO_compressAndPackTable(t))
  else
    print("")
  end
end

function Grid2JSON(importStr)
	local data, err = HexDecode(importStr)
	if data	then
		data, err = Compresser:DecompressHuffman(data)
		if data then 
      local success, deserialized = Serializer:Deserialize(data);
      if (success) then
        print(JSON:encode(deserialized))
        return
      end
		end
  end
  print("{}")
end

function JSON2Grid(json, title)
  local t = JSON:decode(json)

  local result = Compresser:CompressHuffman(Serializer:Serialize(t)) 
	print(HexEncode(result, title))
end

function TotalRP32JSON(importStr)
  local success, deserialized = Serializer:Deserialize(importStr);
  if (success) then
    print(JSON:encode(deserialized))
    return
  end
  print("{}")
end

function JSON2TotalRP3(json)
  local t = JSON:decode(json)
  print(Serializer:Serialize(t))
end