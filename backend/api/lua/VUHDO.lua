VUHDO_LibCompress = LibStub:GetLibrary("LibCompress")
pcall(function() dofile( "./libs/LibBase64-1.0/LibBase64-1.0.lua" ) end)
VUHDO_LibBase64 = LibStub:GetLibrary("LibBase64-1.0")
VUHDO_LibCompressEncode = VUHDO_LibCompress:GetAddonEncodeTable()

local pairs = pairs;
local type = type;
local tostring = tostring;
local tonumber = tonumber;
local strsub = string.sub;
local strfind = string.find;
local strbyte = string.byte;
local floor = math.floor;
local format = string.format;
local twipe = table.wipe;
local tinsert = table.insert;
local tsort = table.sort;
local strchar = string.char;
local bor = bit.bor;
local band = bit.band;
local tconcat = table.concat;
local lshift = bit.lshift;
local rshift = bit.rshift;
local tremove = table.remove;
local next = next;

-- Sabc=S5+abcde
-- Sabc=N3+1.3
-- Sabc=0
-- Sabc=1
-- Sabc=T1234+...

-- Nabc=S1+x


local VUHDO_KEY_TO_ABBREV = {
	["isFullDuration"] = "*a",
	["useBackground"] = "*b",
	["color"] = "*c",
	["isStacks"] = "*d",
	["isIcon"] = "*e",
	["isColor"] = "*f",
	["bright"] = "*g",
	["others"] = "*h",
	["icon"] = "*i",
	["timer"] = "*j",
	["animate"] = "*k",
	["isClock"] = "*l",
	["mine"] = "*m",
	["name"] = "*n",
	["useOpacity"] = "*o",
	["countdownMode"] = "*p",
	["radio"] = "*r",
	["isManuallySet"] = "*s",
	["useText"] = "*t",
	["custom"] = "*u",
};


local VUHDO_ABBREV_TO_KEY = {
	["*a"] = "isFullDuration",
	["*b"] = "useBackground",
	["*c"] = "color",
	["*d"] = "isStacks",
	["*e"] = "isIcon",
	["*f"] = "isColor",
	["*g"] = "bright",
	["*h"] = "others",
	["*i"] = "icon",
	["*j"] = "timer",
	["*k"] = "animate",
	["*l"] = "isClock",
	["*m"] = "mine",
	["*n"] = "name",
	["*o"] = "useOpacity",
	["*p"] = "countdownMode",
	["*r"] = "radio",
	["*s"] = "isManuallySet",
	["*t"] = "useText",
	["*u"] = "custom",
};



--
local tStrValue; -- Mustn't be reused after recursion finished
function VUHDO_serializeTable(aTable)
	local tString = "";

	for tKey, tValue in pairs(aTable) do
		tString = "number" == type(tKey)
			and string.format("%sN%d=", tString, tKey) or string.format("%sS%s=", tString, VUHDO_KEY_TO_ABBREV[tKey] or tKey);

		if "string" == type(tValue) then
			tString = string.format("%sS%d+%s", tString, #tValue, tValue);
		elseif "number" == type(tValue) then
			tStrValue = string.format("%0.4f", tValue);
			tString = string.format("%sN%d+%s", tString, #tStrValue, tStrValue);
		elseif "boolean" == type(tValue) then
			tString = tString .. (tValue and "1" or "0");
		elseif "table" == type(tValue) then
			local tNewString = VUHDO_serializeTable(tValue);
			tString = string.format("%sT%d+%s", tString, #tNewString, tNewString);
		end
	end

	return tString;
end



--
local tEndPos;
local tNumBytes;
local tValue;
local function VUHDO_getValueByLength(aString, aGleichPos)
	tEndPos = string.find(aString, "+", aGleichPos + 2, true);
	if not tEndPos then return nil, nil; end

	tNumBytes = tonumber(strsub(aString, aGleichPos + 2, tEndPos - 1));
	tValue = string.sub(aString, tEndPos + 1, tEndPos + tNumBytes);
	return tEndPos + tNumBytes + 1, tValue;
end



--
function VUHDO_deserializeTable(aString)
	local tTable = { };
	local tIndex = 1;
	local tValueType;
	local tGleichPos;
	local tKey, tValue;

	while tIndex <= #aString do
		tGleichPos = string.find(aString, "=", tIndex + 1, true);

		if tGleichPos then
			tKey = string.sub(aString, tIndex + 1, tGleichPos - 1);

			if 78 == string.byte(aString, tIndex) then -- N
				tKey = tonumber(tKey);
			else -- S
				tKey = VUHDO_ABBREV_TO_KEY[tKey] or tKey;
			end

			tValueType = string.byte(aString, tGleichPos + 1);
			if 83 == tValueType then -- S
				tIndex, tValue = VUHDO_getValueByLength(aString, tGleichPos);
			elseif 78 == tValueType then -- N
				tIndex, tValue = VUHDO_getValueByLength(aString, tGleichPos);
				tValue = tonumber(tValue);
			elseif 48 == tValueType then -- 0
				tValue = false;
				tIndex = tGleichPos + 2;
			elseif 49 == tValueType then -- 1
				tValue = true;
				tIndex = tGleichPos + 2;
			elseif 84 == tValueType then -- T
				tIndex, tValue = VUHDO_getValueByLength(aString, tGleichPos);
				tValue = VUHDO_deserializeTable(tValue);
			else
				return tTable;
			end
		else
			return tTable;
		end

		if tKey and tValue ~= nil then
			tTable[tKey] = tValue;
		end
	end

	return tTable;
end




--
function VUHDO_decompressStringHuffman(aFile)
	return "string" == type(aFile) and VUHDO_LibCompress:DecompressHuffman(aFile) or aFile;
end



--
function VUHDO_compressStringHuffman(aFile)
	return "string" == type(aFile) and VUHDO_LibCompress:CompressHuffman(aFile) or aFile;
end



--
function VUHDO_decompressIfCompressed(aFile)        
	return VUHDO_deserializeTable(VUHDO_decompressStringHuffman(aFile)) or aFile;
end



--
function VUHDO_decompressOrCopy(aFile)
	return "string" == type(aFile) and VUHDO_deserializeTable(VUHDO_decompressStringHuffman(aFile)) or VUHDO_deepCopyTable(aFile);
end



--
function VUHDO_compressTable(aTable)
	return type(aTable) == "table" and VUHDO_serializeTable(aTable) or aTable;
end



--
function VUHDO_compressAndPackTable(aTable)
	return type(aTable) == "table" and VUHDO_compressStringHuffman(VUHDO_serializeTable(aTable)) or aTable;
end



-- Helper to serialize a table to a string for pretty printing
-- Taken from Lua Users Wiki: http://lua-users.org/wiki/TableUtils
function VUHDO_tableValueToString(v)
  if "string" == type( v ) then
    v = string.gsub( v, "\n", "\\n" )
    if string.match( string.gsub(v,"[^'\"]",""), '^"+$' ) then
      return "'" .. v .. "'"
    end
    return '"' .. string.gsub(v,'"', '\\"' ) .. '"'
  else
    return "table" == type( v ) and VUHDO_tableToString( v ) or
      tostring( v )
  end
end



function VUHDO_tableKeyToString(k)
  if "string" == type( k ) and string.match( k, "^[_%a][_%a%d]*$" ) then
    return k
  else
    return "[" .. VUHDO_tableValueToString( k ) .. "]"
  end
end



function VUHDO_tableToString(tbl)
  local result, done = {}, {}
  for k, v in ipairs( tbl ) do
    table.insert( result, VUHDO_tableValueToString( v ) )
    done[ k ] = true
  end
  for k, v in pairs( tbl ) do
    if not done[ k ] then
      table.insert( result,
        VUHDO_tableKeyToString( k ) .. "=" .. VUHDO_tableValueToString( v ) )
    end
  end
  return "{" .. table.concat( result, "," ) .. "}"
end