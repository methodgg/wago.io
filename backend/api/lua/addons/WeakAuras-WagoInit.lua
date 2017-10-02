function GetAddOnMetadata() return 20 end

function GetClassInfo() return false end

AceGUI = {}
AceGUI.RegisterLayout = function() end
AceGUI.GetWidgetVersion = function() return 1 end
AceGUI.RegisterWidgetType = function() return end

loadedFrame = {}
loadedFrame.RegisterEvent = function() end
loadedFrame.SetScript = function() end

form_frame = {}
form_frame.CreateFrame = function() end
form_frame.RegisterEvent = function() end
form_frame.SetScript = function() end

spec_frame = {}
spec_frame.CreateFrame = function() end
spec_frame.RegisterEvent = function() end
spec_frame.SetScript = function() end

LSM = {}
LSM.Register = function() end
LSM.HashTable = function() return {} end

SharedMediaSounds = {}

_G = {}
_G.SPECIALIZATION = "Specialization"
_G.CLASS_SORT_ORDER = {"WARRIOR", "DEATHKNIGHT", "PALADIN", "MONK", "PRIEST", "SHAMAN", "DRUID", "ROGUE", "MAGE", "WARLOCK", "HUNTER", "DEMONHUNTER"}
_G.RAID_CLASS_COLORS = {
    DEATHKNIGHT = {
        b = 0.23,
        g = 0.12,
        r = 0.77,
        colorStr = "ffc41f3b"
    },
    DEMONHUNTER = {
        b = 0.79,
        g = 0.19,
        r = 0.64,
        colorStr = "ffa330c9"
    },
    DRUID = {
        b = 0.04,
        g = 0.49,
        r = 1.00,
        colorStr = "ffff7d0a"
    },
    HUNTER = {
        b = 0.45,
        g = 0.83,
        r = 0.67,
        colorStr = "ffabd473"
    },
    MAGE = {
        b = 0.92,
        g = 0.78,
        r = 0.25,
        colorStr = "ff3fc7eb"
    },
    MONK = {
        b = 0.59,
        g = 1.00,
        r = 0.00,
        colorStr = "ff00ff96"
    },
    PALADIN = {
        b = 0.73,
        g = 0.55,
        r = 0.96,
        colorStr = "fff58cba"
    },
    PRIEST = {
        b = 1.00,
        g = 1.00,
        r = 1.00,
        colorStr = "ffffffff"
    },
    ROGUE = {
        b = 0.51,
        g = 0.91,
        r = 1.00,
        colorStr = "fffff569"
    },
    SHAMAN = {
        b = 0.87,
        g = 0.44,
        r = 0.00,
        colorStr = "ff0070de"
    },
    WARLOCK = {
        b = 0.93,
        g = 0.53,
        r = 0.53,
        colorStr = "ff8788ee"
    },
    WARRIOR = {
        b = 0.43,
        g = 0.61,
        r = 0.78,
        colorStr = "ffc79c6e"
    }
}
_G.LOCALIZED_CLASS_NAMES_MALE = {
    DEATHKNIGHT = "Death Knight",
    DEMONHUNTER = "Demon Hunter",
    DRUID = "Druid",
    HUNTER = "Hunter",
    MAGE = "Mage",
    MONK = "Monk",
    PALADIN = "Paladin",
    PRIEST = "Priest",
    ROGUE = "Rogue",
    SHAMAN = "Shaman",
    WARLOCK = "Warlock",
    WARRIOR = "Warrior"
}
_G.FONT_COLOR_CODE_CLOSE = "|r"

MAX_TALENT_TIERS = 7
NUM_TALENT_COLUMNS = 3
MAX_PVP_TALENT_TIERS = 7
MAX_PVP_TALENT_COLUMNS = 3
totemString = "Totem #%i"

C_S_O, R_C_C, L_C_N_M, F_C_C_C =  _G.CLASS_SORT_ORDER, _G.RAID_CLASS_COLORS, _G.LOCALIZED_CLASS_NAMES_MALE, _G.FONT_COLOR_CODE_CLOSE

Version = GetAddOnMetadata()