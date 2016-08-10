dofile( "./wago.lua" )
local JSON = (loadfile "./json.lua")()

function deserialize( sfile )
      local tables,err = loadfile( sfile )
      if err then print(err) end

      --local tables = ftables()
      for idx = 1,#tables do
         local tolinki = {}
         for i,v in pairs( tables[idx] ) do
            if type( v ) == "table" then
               tables[idx][i] = tables[v[1]]
            end
            if type( i ) == "table" and tables[i[1]] then
               table.insert( tolinki,{ i,tables[i[1]] } )
            end
         end
         -- link indices
         for _,v in ipairs( tolinki ) do
            tables[idx][v[2]],tables[idx][v[1]] =  tables[idx][v[1]],nil
         end
      end
      return tables[1]
   end

local t = deserialize(arg[1])

print(t)
--print(JSON:encode(arg[1]))
