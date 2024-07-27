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
    function fixNumericIndexes(tbl)
      local fixed = {}
      for k, v in pairs(tbl) do
        if type(k) == "string" and tonumber(k) and tonumber(k) > 0 then
          fixed[tonumber(k)] = v
        elseif type(k) == "table" then
          fixed[k] = fixNumericIndexes(v)
        else
          fixed[k] = v
        end
      end
      return fixed
    end
    ring = fixNumericIndexes(ring)
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

    local props = copy(ring)
	local q, m, haveMacroCache = {}, {}, false
	repeat
		local props = m[table.remove(q)] or props
		props.limit = type(props.limit) == "string" and props.limit:match("[^A-Z]") and "PLAYER" or props.limit
		props.save, props.hotkey, props.v, props.vm, props.dropTokens = nil
		for i=1,#props do
			local v = props[i]
			local st = v[1]
			if st == nil and type(v.id) == "string" then
				v.id, haveMacroCache = IM:EncodeCommands(v.id, haveMacroCache), true
			elseif st == "ring" then
				local sn = v[2]
				if sn == name then
					m[name] = 0
				elseif ring[sn] and ring[sn].save and not m[sn] then
					q[#q+1], m[sn] = sn, copy(ring[sn])
				end
			end
			v.caption = nil -- DEPRECATED [2101/X4]
			v.sliceToken, v.vm = nil
      end
	until not q[1]
	props._scv = 1
	return Opie_serialize(props)`
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
local sb, sc = string.byte, string.char
local sigT, sigB, sigN = {}, {}
for i, c in ("01234qwertyuiopasdfghjklzxcvbnm5678QWERTYUIOPASDFGHJKLZXCVBNM9"):gmatch("()(.)") do sigT[i-1], sigT[c], sigB[sb(c)], sigN = c, i-1, i-1, i end
local function checksum(s)
    local h, p2, p3 = (134217689 * #s) % 17592186044399, sigN^2, sigN^3
  for i=1,#s,4 do
    local a, b, c, d = s:match("(.?)(.?)(.?)(.?)", i)
        a, b, c, d = sigT[a], (sigT[b] or 0) * sigN, (sigT[c] or 0) * p2, (sigT[d] or 0) * p3
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
        t[#t+1] = sigT[1] .. sigT[reg[v]]
  elseif type(v) == "table" then
    local n = math.min(sigN-1, #v)
    for i=n,1,-1 do venc(v[i], t, reg) end
        t[#t+1] = sigT[3] .. sigT[n]
    for k,v2 in pairs(v) do
      if not (type(k) == "number" and k >= 1 and k <= n and k % 1 == 0) then
        venc(v2, t, reg)
        venc(k, t, reg)
                t[#t+1] = sigT[4]
      end
    end
  elseif type(v) == "number" then
        if v >= -1000000 and v < 13776336 and v % 1 == 0 then
            t[#t+1] = sigT[5] .. nenc(v + 1000000, 4)
        elseif (v+v == v) or (v < 0) == (v >= 0) then
            error("not a (real) number")
        else
            local f, e = math.frexp(v)
            if e < -1070 then
                f, e = f / 2, e + 1
            end
            t[#t+1] = sigT[f < 0 and 14 or 13] .. nenc(e+1500-1, 2) .. nenc(f*2^53*(f < 0 and -1 or 1), 9)
        end
  elseif type(v) == "string" then
        t[#t+1] = sigT[6] .. v:gsub("[^a-zA-Z5-8]", cenc) .. "9"
  else
        t[#t+1] = sigT[1] .. ((v == true and sigT[1]) or (v == nil and sigT[0]) or sigT[2])
    end
    return t
end
local function tenc(t)
    local u, ua, fm, fc = {}, {}, {}, sigN-3
    for i=3,sigN-1 do
        fm[sigT[1] .. sigT[i]] = sigT[2] .. sigT[i]
    end
    for i=1,#t do
        local k = t[i]
        if fm[k] then
            fc, fm[k] = fc - 1, nil
        elseif u[k] then
            u[k] = u[k] + 1
        elseif #k >= 4 then
            ua[#ua+1], u[k] = k, 1
        end
    end
    table.sort(ua, function(a, b)
        return (#a-2)*(u[a]-1) > (#b-2)*(u[b]-1)
    end)
    for i=fc+1, #ua do
        u[ua[i]], ua[i] = nil
    end
    local r, s = next(fm)
    for i=1,#t do
        local uk = u[t[i]]
        if uk == nil then
        elseif type(uk) == "string" then
            t[i] = uk
        elseif r and uk > 1 then
            u[t[i]], t[i], r, s = r, t[i] .. s, next(fm, r)
        end
  end
  return t
end

local function copy(t, copies)
	local into = {}
	copies = copies or {}
	copies[t] = into
	for k,v in pairs(t) do
		k = type(k) == "table" and (copies[k] or copy(k, copies)) or k
		v = type(v) == "table" and (copies[v] or copy(v, copies)) or v
		into[k] = v
	end
	return into
end

local ops do
    local s, r, pri
    local function cdec(c, l)
        return sc(sigT[c]*(sigN-1) + sigT[l])
    end
    local function ndec(p, l)
        local r = 0
        for i=p,p+l-1 do
            r = r * sigN + sigB[sb(pri,i)]
        end
        return r
    end
    ops = {
        function(d, pos)
            s[d+1] = r[sigB[sb(pri, pos)]]
            return d+1, pos+1
        end,
        function(d, pos)
            r[sigB[sb(pri,pos)]] = s[d]
            return d, pos+1
        end,
        function(d, pos)
            local t, n = {}, sigB[sb(pri,pos)]
            for i=1,n do
                t[i] = s[d-i+1]
            end
            s[d - n + 1] = t
            return d+1-n, pos+1
        end,
        function(d, pos)
            s[d-2][s[d]] = s[d-1]
            return d-2, pos
        end,
        function(d, pos)
            s[d+1] = ndec(pos, 4) - 1000000
            return d+1, pos+4
        end,
        function(d, pos)
            d, s[d+1], pos = d+1, pri:match('^(.-)9()', pos)
            s[d] = s[d]:gsub('([0-4])(.)', cdec)
            return d, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]+s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]*s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]/s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]-s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]^s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d-1] = s[d-1]*2^s[d]
            return d-1, pos
        end,
        function(d, pos)
            s[d+1] =  2^(ndec(pos,2)-1500) * (ndec(pos+2,9)*2^-52)
            return d+1, pos+11
        end,
        function(d, pos)
            s[d+1] = -2^(ndec(pos,2)-1500) * (ndec(pos+2,9)*2^-52)
            return d+1, pos+11
        end,
        function(d, pos)
            s[d-1] = r[s[d]]
            return d-1, pos
        end,
        function(d, pos)
            r[s[d]] = s[d-1]
            return d-1, pos
        end,
    }
    local opsB = {}
    for i=1,#ops do
        opsB[sb(sigT[i])] = ops[i]
    end
    ops = opsB
    function ops.bind(...)
        s, r, pri = ...
end
end

local defaultSign = sc(111,101,116,111,104,72,55)
local st = {
    [defaultSign] = {"name", "hotkey", "offset", "noOpportunisticCA", "noPersistentCA", "internal", "limit", "id", "skipSpecs", "caption", "icon", "show"},
}

function Opie_serialize(t, sign)
    sign = sign == nil and defaultSign or sign
    local rt, sd = {}, st[sign]
    for i=1, sd and #sd or 0 do
        rt[sd[i]] = 2+i
    end
    local payload = table.concat(tenc(venc(t, {}, setmetatable({}, {__index=rt}))), "")
    return ((sign .. nenc(checksum(sign .. payload), 7) .. payload):gsub("(.......)", "%1 "):gsub(" ?$", ".", 1))
end
function Opie_unserialize(s)
    local ssign, h, pri = s:gsub("[^a-zA-Z0-9.]", ""):match("^(" .. ("."):rep(#defaultSign) .. ")(.......)([^.]+)")
    if st[ssign] == nil or nenc(checksum(ssign .. pri), 7) ~= h then return end
    local rt, sd = {true, false}, st[ssign]
    for i=1, sd and #sd or 0 do
        rt[2+i] = sd[i]
    end
    local stack, depth, pos, len = {}, 0, 1, #pri
    ops.bind(stack, setmetatable({}, {__index=rt}), pri)
    while pos <= len do
        depth, pos = ops[sb(pri, pos)](depth, pos + 1)
    end
    ops.bind()
    return depth == 1 and stack[1]
end

local function genSliceTokenIndexMap(props)
	local r = {}
	for i=1, #props do
		r[props[i].sliceToken or r] = i
	end
	r[r] = nil
	return r
end
function FindSliceWithAction(props, needle, avoidTokens)
    local mv, mi
    for i=1, #props do
        local si = props[i]
        if not avoidTokens[si.sliceToken] then
            local v = BUP.DiffSlice(props[i], needle)
            if v and v % 2 > 0 and (mv == nil or v > mv) then
                mv, mi = v, i
end
end
    end
    return mi
end
function DiffSlice(slice, bs)
    if not bs then return end
    local am, mm, ia, ib = true, true, slice, bs
    repeat
        for k,v in pairs(ia) do
            local kt = type(k)
            am = am and (kt ~= "number" or ib[k] == v)
            mm = mm and (kt ~= "string" or ib[k] == v or ignoreSliceFields[k] or k:sub(1,1) == "_")
        end
        ia, ib = ib, ia
    until ia == slice or not (am or mm)
    local r = (am and 1 or 0) + (mm and 2 or 0)
    return r > 0 and r or nil
end
function dropUnderscoreKeys(t)
for k in pairs(t) do
  if type(k) == "string" and k:sub(1,1) == "_" then
    t[k] = nil
  end
end
end

function RK_SerializeDescription(props, bp)
	local stim, drop = bp and bp.v and props.v == bp.v and genSliceTokenIndexMap(bp)
	if stim then
		local present = genSliceTokenIndexMap(props)
		for tok, bidx in pairs(stim) do
			if not present[tok] then
				local alt = FindSliceWithAction(props, bp[bidx], stim)
				if alt then
					props[alt].sliceToken, present[tok] = tok, alt
				else
					drop = drop or {}
					drop[tok] = 1
				end
  end
end
		if type(props.dropTokens) == "table" then
			for tok, c in pairs(props.dropTokens) do
				c = not (present[tok] or drop and drop[tok]) and (type(c) ~= "number" and 1 or c < 99 and c + 1)
				if c then
					drop = drop or {}
					drop[tok] = c
          end
        end
      end
    end
	for _, slice in ipairs(props) do
		if stim then
			local bs = props[stim[slice.sliceToken]]
			slice.vm = bs and DiffSlice(slice, bs) or nil
		end
		if slice[1] == "spell" or slice[1] == "imptext" then
			slice.id, slice[1], slice[2] = slice[2]
		end
		--dropUnderscoreKeys(slice)
	end
	--dropUnderscoreKeys(props)
	if stim then
		props.v, props.vm, props.dropTokens = bp.v, BUP.DiffRingMeta(props, bp) or nil, drop
	end
	props.sortScope = nil
	props.quarantineBind = nil -- DEPRECATED [2310/Z2]
	return props
end

`
