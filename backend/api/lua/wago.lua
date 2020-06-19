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
pcall(function() dofile( "./libs/LibSerialize/LibSerialize.lua" ) end)

dofile( "./VUHDO.lua" )

dofile( "./libs/LibBase64-1.0-Elv/LibBase64-1.0.lua" )
local LibBase64Elv = LibStub("LibBase64-1.0-ElvUI")

local Compresser = LibStub:GetLibrary("LibCompress")
local LibCompress = LibStub:GetLibrary("LibCompress")
local Encoder = Compresser:GetAddonEncodeTable()
local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
local LibDeflate = LibStub:GetLibrary("LibDeflate")
local LibDeflate = LibStub:GetLibrary("LibDeflate")
local LibSerialize = LibStub("LibSerialize")
local configForDeflate = {level = 7}

local JSON = (loadfile "./json.lua")()

function StringToTable(inString)
  local _, _, encodeVersion, encoded = inString:find("^(!WA:%d+!)(.+)$")
  if encodeVersion then 
    encodeVersion = tonumber(encodeVersion:match("%d+"))
  else
    encoded, encodeVersion = inString:gsub("^%!", "")
  end

  local decoded
  if encodeVersion > 0 then
    decoded = LibDeflate:DecodeForPrint(encoded)
  else
    decoded = decodeB64(encoded)
  end

  local decompressed, errorMsg = nil, "unknown compression method"
  if encodeVersion > 0 then
    decompressed = LibDeflate:DecompressDeflate(decoded)
  else
    decompressed, errorMsg = Compresser:Decompress(decoded)
  end

  if not(decompressed) then
    return "Error decompressing: " .. errorMsg
  end

  local success, deserialized
  if encodeVersion < 2 then
    success, deserialized = Serializer:Deserialize(decompressed)
  else
    success, deserialized = LibSerialize:Deserialize(decompressed)
  end
  if not(success) then
    return "Error deserializing "..deserialized
  end
  return deserialized
end

function DeflateToTable(encoded)
  local decoded = LibDeflate:DecodeForPrint(encoded)
  local decompressed = LibDeflate:DecompressDeflate(decoded)
  if not(decompressed) then
    return "Error decompressing: " .. errorMsg
  end


  local success, deserialized = Serializer:Deserialize(decompressed)
  if not(success) then
    return "Error deserializing "..deserialized
  end
  return deserialized
end

function TableToDeflate(inTable)
  local serialized = Serializer:Serialize(inTable)
  local compressed = LibDeflate:CompressDeflate(serialized, configForDeflate)
  return LibDeflate:EncodeForPrint(compressed)
end

function TableToString(inTable)
  local serialized = Serializer:Serialize(inTable)
  -- local serialized = LibSerialize:SerializeEx(configForLS, inTable) -- new serializer
  local compressed = LibDeflate:CompressDeflate(serialized, configForDeflate)
  local encoded = "!" .. LibDeflate:EncodeForPrint(compressed)
  -- local encoded = "!WA:!" .. LibDeflate:EncodeForPrint(compressed)
  return encoded
end

function TableToStringOld(inTable) -- old WA format
  local serialized = Serializer:Serialize(inTable);
  local compressed = Compresser:CompressHuffman(serialized);
  local encoded = encodeB64(compressed);
  return encoded
end

function TableToStringMDT(inTable)
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

function Table2JSON(t)
  print(JSON:encode(t))
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

function JSON2MDT(json)
  local t = JSON:decode(json)
  -- convert number enemy indexes to actual numbers from table <-> JSON conversion
  -- why does this not work in a single iteration I have no idea
  local strnums = true
  while strnums do
    strnums = false
    for pullIndex, pull in ipairs(t.value.pulls) do
      for key, value in pairs(pull) do
        if type(key) == "string" and tonumber(key) then
          strnums = true
          t.value.pulls[pullIndex][key] = nil
          t.value.pulls[pullIndex][tonumber(key)] = value
        end
      end
    end
  end

  if (t) then
    print(TableToStringMDT(t))
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

function Deflate2JSON(importStr)
  local t = DeflateToTable(importStr)
  if (t) then
    print(JSON:encode(t))
  else
    print("{}")
  end
end

function Plater2JSON(importStr)
  local t = DeflateToTable(importStr)
  if (t) then
    print(JSON:encode(t))
  else
    print("{}")
  end
end

function JSON2Plater(json)
  local t = JSON:decode(json)
  if (t) then
    print(TableToDeflate(t))
  else
    print("")
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
  local encoded, usesLibDeflate = importStr:gsub("^%!", "");
  if usesLibDeflate == 1 then
    local decoded = LibDeflate:DecodeForPrint(encoded)
    importStr = LibDeflate:DecompressDeflate(decoded)
  end
  local success, deserialized = Serializer:Deserialize(importStr);
  if success then
    print(JSON:encode(deserialized))
    return
  end
  print("{}")
end

function JSON2TotalRP3(json)
  local t = JSON:decode(json)
  print(Serializer:Serialize(t))
end

local Opie_serialize, Opie_unserialize do
	local sigT, sigN = {}
	for i, c in ("01234qwertyuiopasdfghjklzxcvbnm5678QWERTYUIOPASDFGHJKLZXCVBNM9"):gmatch("()(.)") do sigT[i-1], sigT[c], sigN = c, i-1, i end
	local function checksum(s)
		local h = (134217689 * #s) % 17592186044399
		for i=1,#s,4 do
			local a, b, c, d = s:match("(.?)(.?)(.?)(.?)", i)
			a, b, c, d = sigT[a], (sigT[b] or 0) * sigN, (sigT[c] or 0) * sigN^2, (sigT[d] or 0) * sigN^3
			h = (h * 211 + a + b + c + d) % 17592186044399
		end
		return h % 3298534883309
	end
	local function nenc(v, b, rest)
		if b == 0 then return v == 0 and rest or error("numeric overflow") end
		local v1 = v % sigN
		local v2 = (v - v1) / sigN
		return nenc(v2, b - 1, sigT[v1] .. (rest or ""))
	end
	local function cenc(c)
		local b, m = c:byte(), sigN-1
		return sigT[(b - b % m) / m] .. sigT[b % m]
	end
	local function venc(v, t, reg)
		if reg[v] then
			table.insert(t, sigT[1] .. sigT[reg[v]])
		elseif type(v) == "table" then
			local n = math.min(sigN-1, #v)
			for i=n,1,-1 do venc(v[i], t, reg) end
			table.insert(t, sigT[3] .. sigT[n])
			for k,v2 in pairs(v) do
				if not (type(k) == "number" and k >= 1 and k <= n and k % 1 == 0) then
					venc(v2, t, reg)
					venc(k, t, reg)
					table.insert(t, sigT[4])
				end
			end
		elseif type(v) == "number" then
			if v % 1 ~= 0 then error("non-integer value") end
			if v < -1000000 then error("integer underflow") end
			table.insert(t, sigT[5] .. nenc(v + 1000000, 4))
		elseif type(v) == "string" then
			table.insert(t, sigT[6] .. v:gsub("[^a-zA-Z5-8]", cenc) .. "9")
		else
			table.insert(t, sigT[1] .. ((v == true and sigT[1]) or (v == nil and sigT[0]) or sigT[2]))
		end
		return t
	end

	local ops = {"local ops, sigT, sigN, s, r, pri = {}, ...\nlocal cdec, ndec = function(c, l) return string.char(sigT[c]*(sigN-1) + sigT[l]) end, function(s) local r = 0 for i=1,#s do r = r * sigN + sigT[s:sub(i,i)] end return r end",
		"s[d+1], d, pos = r[sigT[pri:sub(pos,pos)]], d + 1, pos + 1", "r[sigT[pri:sub(pos,pos)]], pos = s[d], pos + 1",
		"local t, n = {}, sigT[pri:sub(pos,pos)]\nfor i=1,n do t[i] = s[d-i+1] end\ns[d - n + 1], d, pos = t, d - n + 1, pos + 1", "s[d-2][s[d]], d = s[d-1], d - 2",
		"s[d+1], d, pos = ndec(pri:sub(pos, pos + 3)) - 1000000, d + 1, pos + 4", "d, s[d+1], pos = d + 1, pri:match('^(.-)9()', pos)\ns[d] = s[d]:gsub('([0-4])(.)', cdec)",
		"s[d-1], d = s[d-1]+s[d], d - 1", "s[d-1], d = s[d-1]*s[d], d - 1", "s[d-1], d = s[d-1]/s[d], d - 1", "function ops.bind(...) s, r, pri = ... end\nreturn ops"}
	for i=2,#ops-1 do ops[i] = ("ops[%q] = function(d, pos)\n %s\n return d, pos\nend"):format(sigT[i-1], ops[i]) end
	ops = loadstring(table.concat(ops, "\n"))(sigT, sigN)

	function Opie_serialize(t, sign, regGhost)
		local payload = table.concat(venc(t, {}, setmetatable({},regGhost)), "")
		return ((sign .. nenc(checksum(sign .. payload), 7) .. payload):gsub("(.......)", "%1 "):gsub(" ?$", ".", 1))
	end
	function Opie_unserialize(s, sign, regGhost)
		local h, pri = s:gsub("[^a-zA-Z0-9.]", ""):match("^" .. sign .. "(.......)([^.]+)")
		if nenc(checksum(sign .. pri), 7) ~= h then return end
	
		local stack, depth, pos, len = {}, 0, 1, #pri
		ops.bind(stack, setmetatable({true, false}, regGhost), pri)
		while pos <= len do
			depth, pos = ops[pri:sub(pos, pos)](depth, pos + 1)
		end
		return depth == 1 and stack[1]
	end
end

local encodeMacro, decodeMacro do
  local hash_ChatTypeInfoList = {}
  local hash_EmoteTokenList = {}
	local function slash_i18n(command, lead)
		if lead == "!" then return "\n!" .. command end
		local key = command:upper()
		if type(hash_ChatTypeInfoList[key]) == "string" and not hash_ChatTypeInfoList[key]:match("!") then
			return "\n!" .. hash_ChatTypeInfoList[key] .. "!" .. command
		elseif type(hash_EmoteTokenList[key]) == "string" and not hash_EmoteTokenList[key]:match("!") then
			return "\n!" .. hash_EmoteTokenList[key] .. "!" .. command
		end
	end
	local function slash_l10n(key, command)
		if key == "" then return "\n!" .. command end
		local k2 = command:upper()
		if hash_ChatTypeInfoList[k2] == key or hash_EmoteTokenList[k2] == key then
		elseif _G["SLASH_" .. key .. 1] then
			return "\n" .. _G["SLASH_" .. key .. 1]
		else
			local i, v = 2, EMOTE1_TOKEN
			while v do
				if v == key then
					return "\n" .. _G["EMOTE" .. (i-1) .. "_CMD1"]
				end
				i, v = i + 1, _G["EMOTE" .. i .. "_TOKEN"]
			end
		end
		return "\n" .. command
	end
	function encodeMacro(m)
		return ("\n" .. m):gsub("\n(([/!])%S*)", slash_i18n):sub(2)
	end
	function decodeMacro(m)
		return ("\n" .. m):gsub("\n!(.-)!(%S*)", slash_l10n):sub(2)
	end
end
function RK_SerializeDescription(props)
	for _, slice in ipairs(props) do
		if slice[1] == "spell" or slice[1] == "macrotext" then
			slice.id, slice[1], slice[2] = slice[2]
		end
		dropUnderscoreKeys(slice)
	end
	dropUnderscoreKeys(props)
	props.sortScope = nil
	return props
end
function dropUnderscoreKeys(t)
	for k in pairs(t) do
		if type(k) == "string" and k:sub(1,1) == "_" then
			t[k] = nil
		end
	end
end
function copy(orig)
  local orig_type = type(orig)
  local newT
  if orig_type == 'table' then
    newT = {}
    for orig_key, orig_value in next, orig, nil do
      newT[copy(orig_key)] = copy(orig_value)
    end
    setmetatable(newT, copy(getmetatable(orig)))
  else -- number, string, boolean, etc
    newT = orig
  end
  return newT
end
local RK_ParseMacro, RK_QuantizeMacro do
	local castAlias = {["#show"]=0, ["#showtooltip"]=0} do
		for n,v in ("CAST:1 USE:1 CASTSEQUENCE:2 CASTRANDOM:3 USERANDOM:3"):gmatch("(%a+):(%d+)") do
			local v, idx, s = v+0, 1
			repeat
				if s then
					castAlias[s] = v
				end
				s, idx = _G["SLASH_" .. n .. idx], idx+1
			until not s
		end
	end
	local function replaceSpellID(ctype, sidlist, prefix, tk)
		local sr, ar
		for id, sn in sidlist:gmatch("%d+") do
			id = id + 0
      return prefix .. "spell:" .. id
		end
	end
	local replaceMountTag do
		local skip, gmSid, gmPref, fmSid, fmPref = {[44153]=1, [44151]=1, [61451]=1, [75596]=1, [61309]=1, [169952]=1, [171844]=1, [213339]=1,}
		local function IsKnownSpell(sid)
			local sn, sr = GetSpellInfo(sid or 0), GetSpellSubtext(sid or 0)
			return GetSpellInfo(sn, sr) ~= nil and sid or (RW:GetCastEscapeAction(sn) and sid)
		end
		local function findMount(prefSID, mtype)
			local myFactionId, nc, cs = UnitFactionGroup("player") == "Horde" and 0 or 1, 0
			local idm = C_MountJournal.GetMountIDs()
			local gmi, gmiex = C_MountJournal.GetMountInfoByID, C_MountJournal.GetMountInfoExtraByID
			for i=1, #idm do
				i = idm[i]
				local _1, sid, _3, _4, _5, _6, _7, factionLocked, factionId, hide, have = gmi(i)
				if have and not hide
				   and (not factionLocked or factionId == myFactionId)
				   and RW:IsSpellCastable(sid)
				   then
					local _, _, _, _, t = gmiex(i)
					if sid == prefSID then
						return sid
					elseif t == mtype and not skip[sid] then
						nc = nc + 1
						if math.random(1,nc) == 1 then
							cs = sid
						end
					end
				end
			end
			return cs
		end
		function replaceMountTag(ctype, tag, prefix)
			if not MODERN then
			elseif tag == "ground" then
				gmSid = gmSid and IsKnownSpell(gmSid) or findMount(gmPref or gmSid, 230)
				return replaceSpellID(ctype, tostring(gmSid), prefix)
			elseif tag == "air" then
				fmSid = fmSid and IsKnownSpell(fmSid) or findMount(fmPref or fmSid, 248)
				return replaceSpellID(ctype, tostring(fmSid), prefix)
			end
			return nil
		end
	end
	local function replaceAlternatives(ctype, replaceFunc, args)
		local ret, alt2, rfCtx
		for alt, cpos in (args .. ","):gmatch("(.-),()") do
			alt2, rfCtx = replaceFunc(ctype, alt, rfCtx, args, cpos)
			if alt == alt2 or (alt2 and alt2:match("%S")) then
				ret = (ret and (ret .. ", ") or "") .. alt2:match("^%s*(.-)%s*$")
			end
		end
		return ret
	end
	local function genLineParser(replaceFunc)
		return function(commandPrefix, command, args)
			local ctype = castAlias[command:lower()]
			if not ctype then return end
			local pos, len, ret = 1, #args
			repeat
				local cstart, cend, vend = pos
				repeat
					local ce, cs = args:match("();", pos) or (len+1), args:match("()%[", pos)
					if cs and cs < ce then
						pos = args:match("%]()", cs)
					else
						cend, vend, pos = pos, ce-1, ce + 1
					end
				until cend or not pos
				if not pos then return end
				local cval = args:sub(cend, vend)
				if ctype < 2 then
					cval = replaceFunc(ctype, args:sub(cend, vend))
				else
					local val, reset = args:sub(cend, vend)
					if ctype == 2 then reset, val = val:match("^(%s*reset=%S+%s*)"), val:gsub("^%s*reset=%S+%s*", "") end
					val = replaceAlternatives(ctype, replaceFunc, val)
					cval = val and ((reset or "") .. val) or nil
				end
				if cval or ctype == 0 then
					local clause = (cstart < cend and (args:sub(cstart, cend-1):match("^%s*(.-)%s*$") .. " ") or "") .. (cval and cval:match("^%s*(.-)%s*$") or "")
					ret = (ret and (ret .. "; ") or commandPrefix) .. clause
				end
			until not pos or pos > #args
			return ret or ""
		end
	end
	local parseLine, quantizeLine, prepareQuantizer do
		parseLine = genLineParser(function(ctype, value)
			local prefix, tkey, tval = value:match("^%s*(!?)%s*{{(%a+):([%a%d/]+)}}%s*$")
			if tkey == "spell" or tkey == "spellr" then
				return replaceSpellID(ctype, tval, prefix, tkey)
			elseif tkey == "mount" then
				return replaceMountTag(ctype, tval, prefix)
			end
			return value
		end)
		local spells, OTHER_SPELL_IDS = {}, {150544, 243819}
		quantizeLine = genLineParser(function(ctype, value, ctx, args, cpos)
			if type(ctx) == "number" and ctx > 0 then
				return nil, ctx-1
			end
			local cc, mark, name = 0, value:match("^%s*(!?)(.-)%s*$")
			repeat
				local sid, peek, cnpos = spells[name:lower()]
				if sid then
					if not MODERN then
						local rname = name:gsub("%s*%([^)]+%)$", "")
						local sid2 = rname ~= name and spells[rname:lower()]
						if sid2 then
							return (mark .. "{{spellr:" .. sid .. "}}"), cc
						end
					end
					return (mark .. "{{spell:" .. sid .. "}}"), cc
				end
				if ctype >= 2 and args then
					peek, cnpos = args:match("^([^,]+),?()", cpos)
					if peek then
						cc, name, cpos = cc + 1, name .. ", " .. peek:match("^%s*(.-)%s*$"), cnpos
					end
				end
			until not peek or cc > 5
			return value
		end)
	end
	function RK_ParseMacro(macro)
		if type(macro) == "string" and (macro:match("{{spellr?:[%d/]+}}") or macro:match("{{mount:%a+}}") ) then
			macro = ("\n" .. macro):gsub("(\n([#/]%S+) ?)([^\n]*)", parseLine)
		end
		return macro
	end
	function RK_QuantizeMacro(macro, useCache)
		return type(macro) == "string" and ("\n" .. macro):gsub("(\n([#/]%S+) ?)([^\n]*)", quantizeLine):sub(2) or macro
	end
end

local sReg, sRegRev, sSign = {__index={nil, nil, "name", "hotkey", "offset", "noOpportunisticCA", "noPersistentCA", "internal", "limit", "id", "skipSpecs", "caption", "icon", "show"}}, {__index={}}, string.char(111,101,116,111,104,72,55)
function Opie2JSON(snap)
	local ok, ret = pcall(Opie_unserialize, snap, sSign, sReg)
	if ok and type(ret) == "table" and type(ret.name) == "string" and #ret > 0 then
		for i=1,#ret do
			local v = ret[i]
			if not v then
				return
			else
				v.caption = type(v.caption) == "string" and v.caption:gsub("|?|", "||") or nil
				if v[1] == nil and type(v.id) == "string" then
					v.id = decodeMacro(v.id)
				end
			end
		end
		ret.name = ret.name:gsub("|?|", "||")
		ret.quarantineBind, ret.hotkey = type(ret.hotkey) == "string" and ret.hotkey or nil
		ret.quarantineOnOpen, ret.onOpen = ret.onOpen, nil
		Table2JSON(ret)
	end
end

function JSON2Opie(json)
  local ring = JSON:decode(json)
  local strnums = true
  -- fix json
  while strnums do
    strnums = false
    for key, value in pairs(ring) do
      if type(key) == "string" and tonumber(key) then
        strnums = true
        ring[key] = nil
        ring[tonumber(key)] = value
      end
    end
  end
  if ring then
    ring, first = RK_SerializeDescription(copy(ring)) or false, true
		ring.limit, ring.save = type(ring.limit) == "string" and ring.limit:match("[^A-Z]") and "PLAYER" or ring.limit
		for i=1,#ring do
			local v = ring[i]
			if v[1] == nil and type(v.id) == "string" then
				v.id, first = encodeMacro(RK_QuantizeMacro(v.id, not first)), false
			end
			v.sliceToken = nil
    end
    print(Opie_serialize(ring, sSign, sRegRev))
    
  else
    print("")
  end
end