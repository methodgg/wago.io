
function DeserializeData(str)
	if not str then
		return
	end

	local results

	str = string.gsub(str, "[%c ]", "")

	for string in string.gmatch(str, "(^%d+.-^^)") do
		results = results or {}

		local result = DeserializeDatum(string)

		table.insert(results, result)
	end

	return results
end


function DeserializeDatum(string)
    local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
	local success, data, version, spaceControl, type = Serializer:Deserialize(string)

	if not success or not data then
		-- corrupt/incomplete string
		return nil
	end

	if spaceControl then
		if spaceControl:find("`|") then
			-- EVERYTHING is broken. try really hard to salvage it. It probably won't be completely successful
			-- return DeserializeDatum(string.gsub("`", "~`"):string.gsub("~`|", "~`~|"))
		elseif spaceControl:find("`") then
			-- if spaces have become corrupt, then reformat them and... re-deserialize
			return DeserializeDatum(string.gsub("`", "~`"))
		elseif spaceControl:find("~|") then
			-- if pipe characters have been screwed up by blizzard's method of escaping things combined with AS-3.0's way of escaping things, try to fix them.
			-- return DeserializeDatum(string.gsub("~||", "~|"))
		end
	end

	if not version then
		-- if the version is not included in the data,
		-- then it must have been before the first version that included versions in export strings/comm,
		-- so just take a guess that it was the first version that had version checks with it.
		version = 41403
	end


	-- finally, we have everything we need. create a result object and return it.
	local result = {
		data = data,
		type = type,
		version = version,
		select(6, Serializer:Deserialize(string)), -- capture all extra args
	}

	return result
end


function GetSettingsString(type, settings, version, ...)
	-- ... contains additional data that may or may not be used/needed
	return SerializeData(settings, type, ...)
end

function GetSettingsStrings(strings, type, version, settings, ...)
	local strings = strings or {}

	local string = GetSettingsString(type, settings, version, ...)
	if not tContains(strings, string) then
		tinsert(strings, string)
	end

	tRemoveDuplicates(strings)

	return strings
end

function SerializeData(data, type, version, ...)
	-- nothing more than a wrapper for AceSerializer-3.0
    local Serializer = LibStub:GetLibrary("AceSerializer-3.0")
	return Serializer:Serialize(data, version, " ~", type, ...)
end

function MakeSerializedDataPretty(string)
	return string:
	gsub("(^[^tT%d][^^]*^[^^]*)", "%1 "): -- add spaces between tables to clean it up a little
	gsub("~J", "~J "): -- ~J is the escape for a newline
	gsub("%^ ^", "^^") -- remove double space at the end
end


function tRemoveDuplicates(table)

	local offs = 0

	-- Start at the end of the table so that we don't remove duplicates from the beginning
	for k = #table, 1, -1 do

		-- offs is adjusted each time something is removed so that we don't waste time
		-- searching for nil values when the table is shifted by a duplicate removal
		k = k + offs

		-- If we have reached the beginning of the table, we are done.
		if k <= 0 then
			return table
		end

		-- item is the value being searched for
		local item = table[k]

		-- prevIndex tracks the last index where the searched-for value was found
		local prevIndex

		-- Once again start the iteration from the end because we don't want to have to
		-- deal with index shifting when we remove a value
		for i = #table, 1, -1 do
			if table[i] == item then

				-- We found a match. If there has already been another match, remove that match
				-- and record this match as being the first one (closes to index 0) in the table.
				if prevIndex then
					tremove(table, prevIndex)
					offs = offs - 1
				end

				-- Queue this match for removal should we find another match closer to the beginning.
				prevIndex = i
			end
		end
	end

	-- Done. Return the table for ease-of-use.
	return table
end

function tContains(table, item, returnNum)
	local firstkey
	local num = 0
	for k, v in pairs(table) do
		if v == item then
			if not returnNum then
				-- Return only the key of the first match
				return k
			else
				num = num + 1
				firstkey = firstkey or k
			end
		end
	end

	-- Return the key of the first match and also the total number of matches
	return firstkey, num
end