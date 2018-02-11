-- build environment
nada = function() return nil end
tada = function() return 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 end

dofile('../lua/codeReview/env-BaseLua.lua')
dofile('../lua/codeReview/env-WoW.lua')
dofile('../lua/codeReview/env-WeakAuras.lua')
env._G = env

env.__Wago__Print = function(s)
  local v = debug.traceback() -- no funny business!
  if v:match("%[string \"%-%-Wago.+") then
    print(s)
  end
end