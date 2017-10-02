local function escape_char(c)
	return ("\\%03d"):format(c:byte())
end

local function table_len(t)
	for i = 1, #t do
		if t[i] == nil then
			return i-1
		end
	end
	return #t
end

function pprint(...)
	print(ptostring(...))
end

local function key_sort(alpha, bravo)
	local type_alpha, type_bravo = type(alpha), type(bravo)
	if type_alpha ~= type_bravo then
		return type_alpha < type_bravo
	end
	
	if type_alpha == "string" then
		return alpha:lower() < bravo:lower()
	elseif type_alpha == "number" then
		return alpha < bravo
	elseif type_alpha == "table" then
		return tostring(alpha) < tostring(bravo)
	else
		return false
	end
end

local preserved = {
	["nil"] = true,
	["true"] = true,
	["false"] = true,
}

local first_ptostring = true
function ptostring(...)
	local t = {}
	for i = 1, select('#', ...) do
		if i > 1 then
			t[#t+1] = ",\t"
		end
		local v = select(i, ...)
		if type(v) == "string" then
		    if v:match('"') and not v:match("'") then
		        t[#t+1] = "'" .. v:gsub("%z", "\\000"):gsub("\n", "\\n"):gsub("[\001-\031\128-\255]", escape_char) .. "'"
		    else
			    t[#t+1] = (("%q"):format(v):gsub("\\\010", "\\n"):gsub("[\001-\031\128-\255]", escape_char))
			end
		elseif type(v) == "table" then
			t[#t+1] = "{ "
			local keys = {}
			for a in pairs(v) do
				keys[#keys+1] = a
			end
			table.sort(keys, key_sort)
			local first = true
			for _,a in ipairs(keys) do
				local b = v[a]
				if first then
					first = nil
				else
					t[#t+1] = ", "
				end
				if type(a) ~= "number" or a < 1 or a > table_len(v) then
					if type(a) == "string" and a:match("^[a-zA-Z_][a-zA-Z_0-9]*$") and not preserved[a] then
						t[#t+1] = a
						t[#t+1] = " = "
					else
						t[#t+1] = "["
						t[#t+1] = ptostring(a)
						t[#t+1] = "] = "
					end
				end
				t[#t+1] = ptostring(b)
			end
			if first then
				t[#t] = "{}"
			else
				t[#t+1] = " }"
			end
		else
			t[#t+1] = tostring(v)
		end
	end
	return table.concat(t)
end

local function is_equal(alpha, bravo)
	if type(alpha) ~= type(bravo) then
		return false
	end
	
	if type(alpha) == "number" then
		return alpha == bravo or tostring(alpha) == tostring(bravo) or math.abs(alpha - bravo) < 1e-15
	elseif type(alpha) ~= "table" then
		return alpha == bravo
	end
	
	local num = 0
	for k,v in pairs(alpha) do
		num = num + 1
		if not is_equal(v, bravo[k]) then
			return false
		end
	end
	
	for k,v in pairs(bravo) do
		num = num - 1
	end
	if num ~= 0 then
		return false
	end
	return true
end

function assert_equal(alpha, bravo)
	if not is_equal(alpha, bravo) then
		error(("Assertion failed: %s == %s"):format(ptostring(alpha), ptostring(bravo)), 2)
	end
end

function assert_error(message, func, ...)
    local success, result = pcall(func, ...)
    
    if success then
        error(("Assertion failed: error with message: %q. No error occurred."):format(ptostring(message)))
    end
    
    if result:sub(-message:len()) ~= message then
        error(("Assertion failed: error with message: %q. Wrong message: %q."):format(ptostring(message), ptostring(result)))
    end
end

dofile("../LibStub/LibStub.lua")
dofile("../LibBase64-1.0.lua")

