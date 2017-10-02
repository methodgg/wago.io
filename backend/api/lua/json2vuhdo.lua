dofile( "./wago.lua" )
dofile( "./VUHDO.lua" )
local JSON = (loadfile "./json.lua")()

local t
if string.find(arg[1], "/tmp/") == nil then
    t = JSON:decode(arg[1])
else
    local f = io.open(arg[1], "r")
    t = f:read()
    f:close()
    t = JSON:decode(t)
end

local s = VUHDO_compressAndPackTable(t)
if (s) then
    print(s)
end