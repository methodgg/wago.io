dofile( "./wago.lua" )
dofile( "./TMW.lua" )
local JSON = (loadfile "./json.lua")()

local t
if false and string.find(arg[1], "/tmp/") == nil then
    t = JSON:decode(arg[1])
else
    local f = io.open(arg[1], "r")
    t = f:read()
    f:close()
    t = JSON:decode(t)
end

local strings = GetSettingsStrings(nil, t[1].type, t[1].version, t, ...)
local str = table.concat(strings, "\r\n\r\n"):gsub("|", "||")
str = MakeSerializedDataPretty(str)

if (str) then
    print(str)
end