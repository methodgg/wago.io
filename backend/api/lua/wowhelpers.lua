local bit = require("bit")
WeakAuras = {}
WeakAuras.L = {}

function strmatch(a,b)
	return string.match(a,b)
end

function strlen(a)
    return string.len(a)
end

function tinsert(a, b, c)
    if c then
        table.insert(a, b, c)
    else
        table.insert(a, b)
    end
end

function string_char(a)
    return string.char(a)
end

function sort(a, b)
    return table.sort(a, b)
end

function trim(s)
  return (s:gsub("^%s*(.-)%s*$", "%1"))
end

-- do nothing functions
function ChatFrame_AddMessageEventFilter() end
function hooksecurefunc() end

function CreateFrame()
    frame = {}
    frame.SetScript = function() end
    frame.Hide = function() end
    frame.Show = function() end
    frame.IsShown = function() end
    frame.RegisterEvent = function() end
    return frame
end

function UnitFactionGroup() 
    return "Horde"
end

SlashCmdList = {}