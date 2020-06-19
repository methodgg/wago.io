local LibSerialize = require("LibSerialize")

local pairs = pairs
local type = type
local tostring = tostring
local assert = assert
local unpack = unpack
local pcall = pcall


--[[---------------------------------------------------------------------------
    Examples from the top of LibSerialize.lua
--]]---------------------------------------------------------------------------

do
    local t = { "test", [false] = {} }
    t[ t[false] ] = "hello"
    local serialized = LibSerialize:Serialize(t, "extra")
    local success, tab, str = LibSerialize:Deserialize(serialized)
    assert(success)
    assert(tab[1] == "test")
    assert(tab[ tab[false] ] == "hello")
    assert(str == "extra")
end

do
    local serialized = LibSerialize:SerializeEx(
        { errorOnUnserializableType = false },
        print, { a = 1, b = print })
    local success, fn, tab = LibSerialize:Deserialize(serialized)
    assert(success)
    assert(fn == nil)
    assert(tab.a == 1)
    assert(tab.b == nil)
end

do
    local t = { a = 1 }
    t.t = t
    t[t] = "test"
    local serialized = LibSerialize:Serialize(t)
    local success, tab = LibSerialize:Deserialize(serialized)
    assert(success)
    assert(tab.t.t.t.t.t.t.a == 1)
    assert(tab[tab.t] == "test")
end

do
    local t = { a = 1, b = print, c = 3 }
    local nested = { a = 1, b = print, c = 3 }
    t.nested = nested
    setmetatable(nested, { __LibSerialize = {
        filter = function(t, k, v) return k ~= "c" end
    }})
    local opts = {
        filter = function(t, k, v) return LibSerialize:IsSerializableType(k, v) end
    }
    local serialized = LibSerialize:SerializeEx(opts, t)
    local success, tab = LibSerialize:Deserialize(serialized)
    assert(success)
    assert(tab.a == 1)
    assert(tab.b == nil)
    assert(tab.c == 3)
    assert(tab.nested.a == 1)
    assert(tab.nested.b == nil)
    assert(tab.nested.c == nil)
end


--[[---------------------------------------------------------------------------
    Utilities
--]]---------------------------------------------------------------------------

local function tCompare(lhsTable, rhsTable, depth)
    depth = depth or 1
    for key, value in pairs(lhsTable) do
        if type(value) == "table" then
            local rhsValue = rhsTable[key]
            if type(rhsValue) ~= "table" then
                return false
            end
            if depth > 1 then
                if not tCompare(value, rhsValue, depth - 1) then
                    return false
                end
            end
        elseif value ~= rhsTable[key] then
            -- print("mismatched value: " .. key .. ": " .. tostring(value) .. ", " .. tostring(rhsTable[key]))
            return false
        end
    end
    -- Check for any keys that are in rhsTable and not lhsTable.
    for key, value in pairs(rhsTable) do
        if lhsTable[key] == nil then
            -- print("mismatched key: " .. key)
            return false
        end
    end
    return true
end


--[[---------------------------------------------------------------------------
    Test cases for serialization
--]]---------------------------------------------------------------------------

local function fail(value, desc)
    assert(false, ("Test failed (%s): %s"):format(tostring(value), desc))
end

local function testfilter(t, k, v)
    return k ~= "banned" and v ~= "banned"
end

local function check(value, bytelen, cmp)
    local serialized = LibSerialize:SerializeEx({ errorOnUnserializableType = false, filter = testfilter }, value)
    if #serialized ~= bytelen then
        fail(value, ("Unexpected serialized length (%d, expected %d)"):format(#serialized, bytelen))
    end

    local success, deserialized = LibSerialize:Deserialize(serialized)
    if not success then
        fail(value, ("Deserialization failed: %s"):format(deserialized))
    end

    local typ = type(value)
    if typ == "table" and not tCompare(cmp or value, deserialized) then
        fail(value, "Non-matching deserialization result")
    elseif typ ~= "table" and value ~= deserialized then
        fail(value, ("Non-matching deserialization result: %s"):format(tostring(deserialized)))
    end
end

-- Format: each test case is { value, bytelen, cmp }. The value will be serialized
-- and then deserialized, checking for success and equality, and the length of
-- the serialized string will be compared against bytelen. If `cmp` is provided,
-- it will be used for comparison against the deserialized result instead of `value`.
-- Note that the length always contains one extra byte for the version number.
local testCases = {
    { nil, 2 },
    { true, 2 },
    { false, 2 },
    { 0, 2 },
    { 1, 2 },
    { 127, 2 },
    { 128, 3 },
    { 4095, 3 },
    { 4096, 4 },
    { 65535, 4 },
    { 65536, 5 },
    { 16777215, 5 },
    { 16777216, 6 },
    { 4294967295, 6 },
    { 4294967296, 9 },
    { 9007199254740992, 9 },
    { 1.5, 6 },
    { 27.32, 8 },
    { 123.45678901235, 10 },
    { 148921291233.23, 10 },
    { -1, 3 },
    { -4095, 3 },
    { -4096, 4 },
    { -65535, 4 },
    { -65536, 5 },
    { -16777215, 5 },
    { -16777216, 6 },
    { -4294967295, 6 },
    { -4294967296, 9 },
    { -9007199254740992, 9 },
    { -1.5, 6 },
    { -123.45678901235, 10 },
    { -148921291233.23, 10 },
    { "", 2 },
    { "a", 3 },
    { "abcdefghijklmno", 17 },
    { "abcdefghijklmnop", 19 },
    { ("1234567890"):rep(30), 304 },
    { {}, 2 },
    { { 1 }, 3 },
    { { 1, 2, 3, 4, 5 }, 7 },
    { { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15 }, 17 },
    { { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 }, 19 },
    { { 1, 2, 3, 4, a = 1, b = 2, [true] = 3, d = 4 }, 17 },
    { { 1, 2, 3, 4, 5, a = 1, b = 2, c = true, d = 4 }, 21 },
    { { 1, 2, 3, 4, 5, a = 1, b = 2, c = 3, d = 4, e = false }, 24 },
    { { a = 1, b = 2, c = 3 }, 11 },
    { { "aa", "bb", "aa", "bb" }, 14 },
    { { "aa1", "bb2", "aa3", "bb4" }, 18 },
    { { "aa1", "bb2", "aa1", "bb2" }, 14 },
    { { "aa1", "bb2", "bb2", "aa1" }, 14 },
    { { "abcdefghijklmno", "abcdefghijklmno", "abcdefghijklmno", "abcdefghijklmno" }, 24 },
    { { "abcdefghijklmno", "abcdefghijklmno", "abcdefghijklmno", "abcdefghijklmnop" }, 40 },
    { { 1, 2, 3, print, print, 6 }, 7, { 1, 2, 3, nil, nil, 6 } },
    { { 1, 2, 3, print, 5, 6 }, 8, { 1, 2, 3, nil, 5, 6 } },
    { { a = print, b = 1, c = print }, 5, { b = 1 } },
    { { a = print, [print] = "a" }, 2, {} },
    { { "banned", 1, 2, 3, banned = 4, test = "banned", a = 1 }, 9, { nil, 1, 2, 3, a = 1 } },
}

do
    local t = { a = 1, b = 2 }
    table.insert(testCases, { { t, t, t }, 13 })
    table.insert(testCases, { { { a = 1, b = 2 }, { a = 1, b = 2 }, { a = 1, b = 2 } }, 23 })
end

for _, testCase in ipairs(testCases) do
    check(unpack(testCase))
end

-- Since all the above tests assume serialization success, try some failures now.
local failCases = {
    { print },
    { [print] = true },
    { [true] = print },
    print,
}

for _, testCase in ipairs(failCases) do
    local success = pcall(LibSerialize.Serialize, LibSerialize, testCase)
    assert(success == false)
end

print("All tests passed!")
