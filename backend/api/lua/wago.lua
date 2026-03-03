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
dofile( "./base64.lua" )
-- dofile( "./base85.lua" )

dofile( "./VUHDO.lua" )

dofile( "./libs/LibBase64-1.0-Elv/LibBase64-1.0.lua" )
local LibBase64Elv = LibStub("LibBase64-1.0-ElvUI")

local Compresser = LibStub:GetLibrary("LibCompress")
local LibCompress = LibStub:GetLibrary("LibCompress")
local Encoder = Compresser:GetAddonEncodeTable()
local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
local AceSerializer = Serializer
local LibDeflate = LibStub:GetLibrary("LibDeflate")
local LibSerialize = LibStub("LibSerialize")
local configForDeflate = {level = 7}
errorMsg = ""

local function fixNumberedIndexes(tbl)
    local fixed = {}
    
    for k, v in pairs(tbl) do
        if type(v) == "table" then
            v = fixNumberedIndexes(v)
        end
        if tonumber(k) then
            fixed[tonumber(k)] = v
        else
            fixed[k] = v
        end
    end
    return fixed
end


local function HexEncode(s,title)
	local hex= { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" }
	local b_rshift = bit.rshift
	local b_and = bit.band
	local byte= string.byte
	local t= { }
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

local JSON = (loadfile "./json.lua")()