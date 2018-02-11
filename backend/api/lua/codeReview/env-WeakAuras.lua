WeakAuras = {}
WeakAuras.regions = {}
WeakAuras.regions.name = { region = CreateFrame() }
WeakAuras.regions.name.region.Background = CreateFrame()
WeakAuras.regions.name.region.Border = CreateFrame()
WeakAuras.regions.name.region.border = CreateFrame()
WeakAuras.regions.name.region.bar = CreateFrame()
WeakAuras.regions.name.region.bar.fg = CreateFrame()
WeakAuras.regions.name.region.bar.bg = CreateFrame()
WeakAuras.regions.name.region.bar.spark = CreateFrame()
WeakAuras.regions.name.region.cooldown = CreateFrame()
WeakAuras.regions.name.region.Foreground = CreateFrame()
WeakAuras.regions.name.region.icon = CreateFrame()
WeakAuras.regions.name.region.model = CreateFrame()
WeakAuras.regions.name.region.stacks = CreateFrame()
WeakAuras.regions.name.region.text = CreateFrame()
WeakAuras.regions.name.region.text2 = CreateFrame()
WeakAuras.regions.name.region.texture = CreateFrame()
WeakAuras.regions.name.region.timer = CreateFrame()
WeakAuras.raidUnits = (function() local t={} for i=1,40 do t[i]="raid"..i end return t end)()
WeakAuras.partyUnits = (function() local t={} for i=1,4 do t[i]="party"..i end return t end)()
WeakAuras.IsOptionsOpen = tada
WeakAuras.ShowOverlayGlow = tada
WeakAuras.HideOverlayGlow = tada
WeakAuras.ScanEvents = tada
WeakAuras.GetAuraTooltipInfo = tada
WeakAuras.triggerState = { name = { triggers = {} } }
WeakAuras.CurrentEncounter = { id = "1", zone_id = "1", boss_guids = {} }

WeakAurasSaved = { displays = { name = {} } }

aura_env = {}
aura_env.id = "name"
aura_env.cloneId = "name"
aura_env.state = {}
-- setmetatable(aura_env, { __newindex = function(tbl, key, value) __Wago__SetAuraEnv(key, value) rawset(tbl, key, value) end })

env.WeakAuras = WeakAuras
env.WeakAurasSaved = WeakAurasSaved
env.aura_env = aura_env