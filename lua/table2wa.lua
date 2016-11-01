dofile( "./wago.lua" )
local JSON = (loadfile "./json.lua")()

local t
if string.find(arg[1], "/tmp/") == nil then
    t = arg[1]
else
    local f = io.open(arg[1], "r")
    t = f:read()
    f:close()
end

local s = TableToString(t)
if (s) then
    print(s)
end