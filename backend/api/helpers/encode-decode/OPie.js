module.exports = {
  typeMatch: /^OPIE$/,
  domain: ENUM.DOMAIN.WOW,

  decode: async (encodedString, exec) => {
    // test that string matches expected regex
    if (!encodedString.match(/^[a-zA-Z0-9]{7}\s[a-zA-Z0-9\s]*\.$/)) {
      return false
    }
    const lua = `
      ${opieLua}
      local str = "${encodedString}"
      local ok, ret = pcall(Opie_unserialize, str, sSign, sReg)
      if ok and type(ret) == "table" and type(ret.name) == "string" and #ret > 0 then
        for i=1,#ret do
          local v = ret[i]
          if not v then
            return ''
          else
            v.caption = type(v.caption) == "string" and v.caption:gsub("|?|", "||") or nil
            if v[1] == nil and type(v.id) == "string" then
              v.id = decodeMacro(v.id)
            end
          end
        end
        ret.name = ret.name:gsub("|?|", "||")
        ret.quarantineBind, ret.hotkey = type(ret.hotkey) == "string" and ret.hotkey or nil
        ret.quarantineOnOpen, ret.onOpen = ret.onOpen, nil
        return JSON:encode(ret)
      end
      return ''
    `
    try {
      let json = await exec(lua)
      return JSON.parse(json)
    }
    catch {
      return false
    }
  },
  encodeRaw: (str) => {
    // bandaid since I can't figure out why this is no longer working
    // no re-encoding right now
    return str
  },

  xencode: async (json, exec) => {
    const lua = `
    ${opieLua}
    local ring = JSON:decode("${json}")
    local strnums = true
    -- fix json
    while strnums do
      strnums = false
      for key, value in pairs(ring) do
        if type(key) == "string" and tonumber(key) then
          strnums = true
          ring[key] = nil
          ring[tonumber(key)] = value
        end
      end
    end
    if ring then
      ring, first = RK_SerializeDescription(copy(ring)) or false, true
      ring.limit, ring.save = type(ring.limit) == "string" and ring.limit:match("[^A-Z]") and "PLAYER" or ring.limit
      for i=1,#ring do
        local v = ring[i]
        if v[1] == nil and type(v.id) == "string" then
          v.id, first = encodeMacro(RK_QuantizeMacro(v.id, not first)), false
        end
        v.sliceToken = nil
      end
      return Opie_serialize(ring, sSign, sRegRev)
    else
      return ''
    end`
    try {
      let encodedString = await exec(lua)
      return encodedString
    }
    catch (e) {
      console.log(e)
      return false
    }
  },

  processMeta: (obj) => {
    var meta = {categories: []}
    if (!obj || !obj.name) {
      return false
    }

    meta.name = obj.name
    meta.type = 'OPIE'

    return meta
  }
}

const opieLua = `
local Opie_serialize, Opie_unserialize do
local sigT, sigN = {}
for i, c in ("01234qwertyuiopasdfghjklzxcvbnm5678QWERTYUIOPASDFGHJKLZXCVBNM9"):gmatch("()(.)") do sigT[i-1], sigT[c], sigN = c, i-1, i end
local function checksum(s)
  local h = (134217689 * #s) % 17592186044399
  for i=1,#s,4 do
    local a, b, c, d = s:match("(.?)(.?)(.?)(.?)", i)
    a, b, c, d = sigT[a], (sigT[b] or 0) * sigN, (sigT[c] or 0) * sigN^2, (sigT[d] or 0) * sigN^3
    h = (h * 211 + a + b + c + d) % 17592186044399
  end
  return h % 3298534883309
end
local function nenc(v, b, rest)
  if b == 0 then return v == 0 and rest or error("numeric overflow") end
  local v1 = v % sigN
  local v2 = (v - v1) / sigN
  return nenc(v2, b - 1, sigT[v1] .. (rest or ""))
end
local function cenc(c)
  local b, m = c:byte(), sigN-1
  return sigT[(b - b % m) / m] .. sigT[b % m]
end
local function venc(v, t, reg)
  if reg[v] then
    table.insert(t, sigT[1] .. sigT[reg[v]])
  elseif type(v) == "table" then
    local n = math.min(sigN-1, #v)
    for i=n,1,-1 do venc(v[i], t, reg) end
    table.insert(t, sigT[3] .. sigT[n])
    for k,v2 in pairs(v) do
      if not (type(k) == "number" and k >= 1 and k <= n and k % 1 == 0) then
        venc(v2, t, reg)
        venc(k, t, reg)
        table.insert(t, sigT[4])
      end
    end
  elseif type(v) == "number" then
    if v % 1 ~= 0 then error("non-integer value") end
    if v < -1000000 then error("integer underflow") end
    table.insert(t, sigT[5] .. nenc(v + 1000000, 4))
  elseif type(v) == "string" then
    table.insert(t, sigT[6] .. v:gsub("[^a-zA-Z5-8]", cenc) .. "9")
  else
    table.insert(t, sigT[1] .. ((v == true and sigT[1]) or (v == nil and sigT[0]) or sigT[2]))
  end
  return t
end

local ops = {"local ops, sigT, sigN, s, r, pri = {}, ...\\nlocal cdec, ndec = function(c, l) return string.char(sigT[c]*(sigN-1) + sigT[l]) end, function(s) local r = 0 for i=1,#s do r = r * sigN + sigT[s:sub(i,i)] end return r end",
  "s[d+1], d, pos = r[sigT[pri:sub(pos,pos)]], d + 1, pos + 1", "r[sigT[pri:sub(pos,pos)]], pos = s[d], pos + 1",
  "local t, n = {}, sigT[pri:sub(pos,pos)]\\nfor i=1,n do t[i] = s[d-i+1] end\\ns[d - n + 1], d, pos = t, d - n + 1, pos + 1", "s[d-2][s[d]], d = s[d-1], d - 2",
  "s[d+1], d, pos = ndec(pri:sub(pos, pos + 3)) - 1000000, d + 1, pos + 4", "d, s[d+1], pos = d + 1, pri:match('^(.-)9()', pos)\\ns[d] = s[d]:gsub('([0-4])(.)', cdec)",
  "s[d-1], d = s[d-1]+s[d], d - 1", "s[d-1], d = s[d-1]*s[d], d - 1", "s[d-1], d = s[d-1]/s[d], d - 1", "function ops.bind(...) s, r, pri = ... end\\nreturn ops"}
for i=2,#ops-1 do ops[i] = ("ops[%q] = function(d, pos)\\n %s\\n return d, pos\\nend"):format(sigT[i-1], ops[i]) end
ops = loadstring(table.concat(ops, "\\n"))(sigT, sigN)

function Opie_serialize(t, sign, regGhost)
  local payload = table.concat(venc(t, {}, setmetatable({},regGhost)), "")
  return ((sign .. nenc(checksum(sign .. payload), 7) .. payload):gsub("(.......)", "%1 "):gsub(" ?$", ".", 1))
end
function Opie_unserialize(s, sign, regGhost)
  local h, pri = s:gsub("[^a-zA-Z0-9.]", ""):match("^" .. sign .. "(.......)([^.]+)")
  if nenc(checksum(sign .. pri), 7) ~= h then return end

  local stack, depth, pos, len = {}, 0, 1, #pri
  ops.bind(stack, setmetatable({true, false}, regGhost), pri)
  while pos <= len do
    depth, pos = ops[pri:sub(pos, pos)](depth, pos + 1)
  end
  return depth == 1 and stack[1]
end
end

local encodeMacro, decodeMacro do
local hash_ChatTypeInfoList = {}
local hash_EmoteTokenList = {}
local function slash_i18n(command, lead)
  if lead == "!" then return "\\n!" .. command end
  local key = command:upper()
  if type(hash_ChatTypeInfoList[key]) == "string" and not hash_ChatTypeInfoList[key]:match("!") then
    return "\\n!" .. hash_ChatTypeInfoList[key] .. "!" .. command
  elseif type(hash_EmoteTokenList[key]) == "string" and not hash_EmoteTokenList[key]:match("!") then
    return "\\n!" .. hash_EmoteTokenList[key] .. "!" .. command
  end
end
local function slash_l10n(key, command)
  if key == "" then return "\\n!" .. command end
  local k2 = command:upper()
  if hash_ChatTypeInfoList[k2] == key or hash_EmoteTokenList[k2] == key then
  elseif _G["SLASH_" .. key .. 1] then
    return "\\n" .. _G["SLASH_" .. key .. 1]
  else
    local i, v = 2, EMOTE1_TOKEN
    while v do
      if v == key then
        return "\\n" .. _G["EMOTE" .. (i-1) .. "_CMD1"]
      end
      i, v = i + 1, _G["EMOTE" .. i .. "_TOKEN"]
    end
  end
  return "\\n" .. command
end
function encodeMacro(m)
  return ("\\n" .. m):gsub("\\n(([/!])%S*)", slash_i18n):sub(2)
end
function decodeMacro(m)
  return ("\\n" .. m):gsub("\\n!(.-)!(%S*)", slash_l10n):sub(2)
end
end
function RK_SerializeDescription(props)
for _, slice in ipairs(props) do
  if slice[1] == "spell" or slice[1] == "macrotext" then
    slice.id, slice[1], slice[2] = slice[2]
  end
  dropUnderscoreKeys(slice)
end
dropUnderscoreKeys(props)
props.sortScope = nil
return props
end
function dropUnderscoreKeys(t)
for k in pairs(t) do
  if type(k) == "string" and k:sub(1,1) == "_" then
    t[k] = nil
  end
end
end
function copy(orig)
local orig_type = type(orig)
local newT
if orig_type == 'table' then
  newT = {}
  for orig_key, orig_value in next, orig, nil do
    newT[copy(orig_key)] = copy(orig_value)
  end
  setmetatable(newT, copy(getmetatable(orig)))
else -- number, string, boolean, etc
  newT = orig
end
return newT
end
local RK_ParseMacro, RK_QuantizeMacro do
local castAlias = {["#show"]=0, ["#showtooltip"]=0} do
  for n,v in ("CAST:1 USE:1 CASTSEQUENCE:2 CASTRANDOM:3 USERANDOM:3"):gmatch("(%a+):(%d+)") do
    local v, idx, s = v+0, 1
    repeat
      if s then
        castAlias[s] = v
      end
      s, idx = _G["SLASH_" .. n .. idx], idx+1
    until not s
  end
end
local function replaceSpellID(ctype, sidlist, prefix, tk)
  local sr, ar
  for id, sn in sidlist:gmatch("%d+") do
    id = id + 0
    return prefix .. "spell:" .. id
  end
end
local replaceMountTag do
  local skip, gmSid, gmPref, fmSid, fmPref = {[44153]=1, [44151]=1, [61451]=1, [75596]=1, [61309]=1, [169952]=1, [171844]=1, [213339]=1,}
  local function IsKnownSpell(sid)
    local sn, sr = GetSpellInfo(sid or 0), GetSpellSubtext(sid or 0)
    return GetSpellInfo(sn, sr) ~= nil and sid or (RW:GetCastEscapeAction(sn) and sid)
  end
  local function findMount(prefSID, mtype)
    local myFactionId, nc, cs = UnitFactionGroup("player") == "Horde" and 0 or 1, 0
    local idm = C_MountJournal.GetMountIDs()
    local gmi, gmiex = C_MountJournal.GetMountInfoByID, C_MountJournal.GetMountInfoExtraByID
    for i=1, #idm do
      i = idm[i]
      local _1, sid, _3, _4, _5, _6, _7, factionLocked, factionId, hide, have = gmi(i)
      if have and not hide
         and (not factionLocked or factionId == myFactionId)
         and RW:IsSpellCastable(sid)
         then
        local _, _, _, _, t = gmiex(i)
        if sid == prefSID then
          return sid
        elseif t == mtype and not skip[sid] then
          nc = nc + 1
          if math.random(1,nc) == 1 then
            cs = sid
          end
        end
      end
    end
    return cs
  end
  function replaceMountTag(ctype, tag, prefix)
    if not MODERN then
    elseif tag == "ground" then
      gmSid = gmSid and IsKnownSpell(gmSid) or findMount(gmPref or gmSid, 230)
      return replaceSpellID(ctype, tostring(gmSid), prefix)
    elseif tag == "air" then
      fmSid = fmSid and IsKnownSpell(fmSid) or findMount(fmPref or fmSid, 248)
      return replaceSpellID(ctype, tostring(fmSid), prefix)
    end
    return nil
  end
end
local function replaceAlternatives(ctype, replaceFunc, args)
  local ret, alt2, rfCtx
  for alt, cpos in (args .. ","):gmatch("(.-),()") do
    alt2, rfCtx = replaceFunc(ctype, alt, rfCtx, args, cpos)
    if alt == alt2 or (alt2 and alt2:match("%S")) then
      ret = (ret and (ret .. ", ") or "") .. alt2:match("^%s*(.-)%s*$")
    end
  end
  return ret
end
local function genLineParser(replaceFunc)
  return function(commandPrefix, command, args)
    local ctype = castAlias[command:lower()]
    if not ctype then return end
    local pos, len, ret = 1, #args
    repeat
      local cstart, cend, vend = pos
      repeat
        local ce, cs = args:match("();", pos) or (len+1), args:match("()%[", pos)
        if cs and cs < ce then
          pos = args:match("%]()", cs)
        else
          cend, vend, pos = pos, ce-1, ce + 1
        end
      until cend or not pos
      if not pos then return end
      local cval = args:sub(cend, vend)
      if ctype < 2 then
        cval = replaceFunc(ctype, args:sub(cend, vend))
      else
        local val, reset = args:sub(cend, vend)
        if ctype == 2 then reset, val = val:match("^(%s*reset=%S+%s*)"), val:gsub("^%s*reset=%S+%s*", "") end
        val = replaceAlternatives(ctype, replaceFunc, val)
        cval = val and ((reset or "") .. val) or nil
      end
      if cval or ctype == 0 then
        local clause = (cstart < cend and (args:sub(cstart, cend-1):match("^%s*(.-)%s*$") .. " ") or "") .. (cval and cval:match("^%s*(.-)%s*$") or "")
        ret = (ret and (ret .. "; ") or commandPrefix) .. clause
      end
    until not pos or pos > #args
    return ret or ""
  end
end
local parseLine, quantizeLine, prepareQuantizer do
  parseLine = genLineParser(function(ctype, value)
    local prefix, tkey, tval = value:match("^%s*(!?)%s*{{(%a+):([%a%d/]+)}}%s*$")
    if tkey == "spell" or tkey == "spellr" then
      return replaceSpellID(ctype, tval, prefix, tkey)
    elseif tkey == "mount" then
      return replaceMountTag(ctype, tval, prefix)
    end
    return value
  end)
  local spells, OTHER_SPELL_IDS = {}, {150544, 243819}
  quantizeLine = genLineParser(function(ctype, value, ctx, args, cpos)
    if type(ctx) == "number" and ctx > 0 then
      return nil, ctx-1
    end
    local cc, mark, name = 0, value:match("^%s*(!?)(.-)%s*$")
    repeat
      local sid, peek, cnpos = spells[name:lower()]
      if sid then
        if not MODERN then
          local rname = name:gsub("%s*%([^)]+%)$", "")
          local sid2 = rname ~= name and spells[rname:lower()]
          if sid2 then
            return (mark .. "{{spellr:" .. sid .. "}}"), cc
          end
        end
        return (mark .. "{{spell:" .. sid .. "}}"), cc
      end
      if ctype >= 2 and args then
        peek, cnpos = args:match("^([^,]+),?()", cpos)
        if peek then
          cc, name, cpos = cc + 1, name .. ", " .. peek:match("^%s*(.-)%s*$"), cnpos
        end
      end
    until not peek or cc > 5
    return value
  end)
end
function RK_ParseMacro(macro)
  if type(macro) == "string" and (macro:match("{{spellr?:[%d/]+}}") or macro:match("{{mount:%a+}}") ) then
    macro = ("\\n" .. macro):gsub("(\\n([#/]%S+) ?)([^\\n]*)", parseLine)
  end
  return macro
end
function RK_QuantizeMacro(macro, useCache)
  return type(macro) == "string" and ("\\n" .. macro):gsub("(\\n([#/]%S+) ?)([^\\n]*)", quantizeLine):sub(2) or macro
end
end

local sReg, sRegRev, sSign = {__index={nil, nil, "name", "hotkey", "offset", "noOpportunisticCA", "noPersistentCA", "internal", "limit", "id", "skipSpecs", "caption", "icon", "show"}}, {__index={}}, string.char(111,101,116,111,104,72,55)`