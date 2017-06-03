dofile( "./wago.lua" )
local JSON = (loadfile "./json.lua")()

local t
if string.find(arg[1], "/tmp/") == nil then
    t = StringToTable(arg[1], false)
else
    local f = io.open(arg[1], "r")                
    t = f:read("*all")
    f:close()
end
collectgarbage=nil
WeakAurasSaved=nil

time=os.time;_G={};coroutine=nil;xpcall=nil;pcall=nil;gcinfo=nil;module=nil;setfenv=nil;jit=nil;bit=nil;package=nil;debug=nil;loadfile=nil;rawequal=nil;rawset=nil;unpack=nil;require=nil;newproxy=nil;dofile=nil;load=nil;os=nil;getfenv=nil;getmetatable=nil;rawequal=nil;setmetatable=nil;io=nil;collectgarbage=nil

if string.find(t, "WeakAurasSaved", 1, true) and string.find(t, "WeakAurasSaved", 1, true)<=5  then
    loadstring(t)()
    if WeakAurasSaved then
        print(JSON:encode(WeakAurasSaved))
    else
        print("{err: \"BADLUA\"}")
    end
else
    print("{err: \"BADFILE\"}")
end