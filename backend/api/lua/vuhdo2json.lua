dofile( "./wago.lua" )
dofile( "./VUHDO.lua" )
local JSON = (loadfile "./json.lua")()

local t
if string.find(arg[1], "/tmp/") == nil then
    t = VUHDO_decompressIfCompressed(VUHDO_LibBase64.Decode(arg[1]))
else
    local f = io.open(arg[1], "r")
    t = f:read()
    f:close()
    t = VUHDO_decompressIfCompressed(t)
end


--print(t)
if (t) then
    print(JSON:encode(t))
end

