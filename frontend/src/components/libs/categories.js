function normalize (str) {
  return str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`'"~()\s]/g, '-').trim()
}

module.exports = {
  categories: function (t) {
    if (!t) {
      t = (s) => {
        return s
      }
    }
    var cats = [
      // {id: "cl0", slug: "classes", cls:"", text: t("Classes"), noselect: true, WEAKAURA: true, ELVUI: true, VUHDO: true},
      {id: "cl6", slug: "classes/death-knight", cls:"cl-deathknight", text: t("warcraft:classes.6"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl6-1", slug: "classes/death-knight/blood", cls:"cl-deathknight", text: t("warcraft:classes.6-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl6-2", slug: "classes/death-knight/frost", cls:"cl-deathknight", text: t("warcraft:classes.6-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl6-3", slug: "classes/death-knight/unholy", cls:"cl-deathknight", text: t("warcraft:classes.6-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},

      {id: "cl12", slug: "classes/demon-hunter", cls:"cl-demonhunter", text: t("warcraft:classes.12"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl12-1", slug: "classes/demon-hunter/havoc", cls:"cl-demonhunter", text: t("warcraft:classes.12-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl12-2", slug: "classes/demon-hunter/vengeance", cls:"cl-demonhunter", text: t("warcraft:classes.12-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},

      {id: "cl11", slug: "classes/druid", cls:"cl-druid", text: t("warcraft:classes.11"), "CLASSIC-WEAKAURA": true, root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl11-1", slug: "classes/druid/balance", cls:"cl-druid", text: t("warcraft:classes.11-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl11-2", slug: "classes/druid/feral", cls:"cl-druid", text: t("warcraft:classes.11-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl11-3", slug: "classes/druid/guardian", cls:"cl-druid", text: t("warcraft:classes.11-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl11-4", slug: "classes/druid/restoration", cls:"cl-druid", text: t("warcraft:classes.11-4"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl3", slug: "classes/hunter", cls:"cl-hunter", text: t("warcraft:classes.3"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl3-1", slug: "classes/hunter/beast-mastery", cls:"cl-hunter", text: t("warcraft:classes.3-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl3-2", slug: "classes/hunter/marksmanship", cls:"cl-hunter", text: t("warcraft:classes.3-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl3-3", slug: "classes/hunter/survival", cls:"cl-hunter", text: t("warcraft:classes.3-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl8", slug: "classes/mage", cls:"cl-mage", text: t("warcraft:classes.8"), root: true, "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl8-1", slug: "classes/mage/arcane", cls:"cl-mage", text: t("warcraft:classes.8-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl8-2", slug: "classes/mage/fire", cls:"cl-mage", text: t("warcraft:classes.8-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl8-3", slug: "classes/mage/frost", cls:"cl-mage", text: t("warcraft:classes.8-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl10", slug: "classes/monk", cls:"cl-monk", text: t("warcraft:classes.10"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl10-1", slug: "classes/monk/brewmaster", cls:"cl-monk", text: t("warcraft:classes.10-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl10-2", slug: "classes/monk/mistweaver", cls:"cl-monk", text: t("warcraft:classes.10-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl10-3", slug: "classes/monk/windwalker", cls:"cl-monk", text: t("warcraft:classes.10-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},

      {id: "cl2", slug: "classes/paladin", cls:"cl-paladin", text: t("warcraft:classes.2"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl2-1", slug: "classes/paladin/holy", cls:"cl-paladin", text: t("warcraft:classes.2-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl2-2", slug: "classes/paladin/protection", cls:"cl-paladin", text: t("warcraft:classes.2-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl2-3", slug: "classes/paladin/retribution", cls:"cl-paladin", text: t("warcraft:classes.2-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl5", slug: "classes/priest", cls:"cl-priest", text: t("warcraft:classes.5"), "CLASSIC-WEAKAURA": true, root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl5-1", slug: "classes/priest/discipline", cls:"cl-priest", text: t("warcraft:classes.5-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl5-2", slug: "classes/priest/holy", cls:"cl-priest", text: t("warcraft:classes.5-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl5-3", slug: "classes/priest/shadow", cls:"cl-priest", text: t("warcraft:classes.5-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl4", slug: "classes/rogue", cls:"cl-rogue", text: t("warcraft:classes.4"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl4-1", slug: "classes/rogue/assassination", cls:"cl-rogue", text: t("warcraft:classes.4-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl4-2", slug: "classes/rogue/outlaw", cls:"cl-rogue", text: t("warcraft:classes.4-2"), prime: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "cl4-2c", slug: "classes/rogue/combat", cls:"cl-rogue", text: t("warcraft:classes.4-2c"), "CLASSIC-WEAKAURA": true, prime: false, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, classic: true},
      {id: "cl4-3", slug: "classes/rogue/subtlety", cls:"cl-rogue", text: t("warcraft:classes.4-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl7", slug: "classes/shaman", cls:"cl-shaman", text: t("warcraft:classes.7"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl7-1", slug: "classes/shaman/elemental", cls:"cl-shaman", text: t("warcraft:classes.7-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl7-2", slug: "classes/shaman/enhancement", cls:"cl-shaman", text: t("warcraft:classes.7-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl7-3", slug: "classes/shaman/restoration", cls:"cl-shaman", text: t("warcraft:classes.7-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl9", slug: "classes/warlock", cls:"cl-warlock", text: t("warcraft:classes.9"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl9-1", slug: "classes/warlock/affliction", cls:"cl-warlock", text: t("warcraft:classes.9-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl9-2", slug: "classes/warlock/demonology", cls:"cl-warlock", text: t("warcraft:classes.9-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl9-3", slug: "classes/warlock/destruction", cls:"cl-warlock", text: t("warcraft:classes.9-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "cl1", slug: "classes/warrior", cls:"cl-warrior", text: t("warcraft:classes.1"), "CLASSIC-WEAKAURA": true, root: true,WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl1-1", slug: "classes/warrior/arms", cls:"cl-warrior", text: t("warcraft:classes.1-1"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl1-2", slug: "classes/warrior/fury", cls:"cl-warrior", text: t("warcraft:classes.1-2"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "cl1-3", slug: "classes/warrior/protection", cls:"cl-warrior", text: t("warcraft:classes.1-3"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, OPIE: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "gen0", slug: "general", cls:"misc", text: t("General"), root: true, "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen7", slug: "general/achievements", cls:"misc", text: t("Achievements"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "gen2", slug: "general/questing", cls:"misc", text: t("Questing"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen6", slug: "general/non-combat", cls:"misc", text: t("Non-Combat"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen9", slug: "general/currency", cls:"misc", text: t("Currency"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen10", slug: "general/reputation", cls:"misc", text: t("Reputation"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen11", slug: "general/collectibles", cls:"misc", text: t("Collectibles"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen12", slug: "general/world-events", cls:"misc", text: t("World Events"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen8", slug: "general/world-events/holidays", cls:"misc", text: t("Holidays"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen13", slug: "general/world-events/darkmoon-faire", cls:"misc", text: t("Darkmoon Faire"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen14", slug: "general/world-events/brawlers-guild", cls:"misc", text: t("Brawler's Guild"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true},
      {id: "gen15", slug: "general/pet-battles", cls:"misc", text: t("Pet Battles"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen16", slug: "general/warfronts", cls:"misc", text: t("Warfronts"), WEAKAURA: true, COLLECTION: true, bfa: true},
      {id: "gen17", slug: "general/island-expeditions", cls:"misc", text: t("Island Expeditions"), WEAKAURA: true, COLLECTION: true, bfa: true},
      {id: "gen18", slug: "general/covenants", cls:"misc", text: t("Covenants"), WEAKAURA: true, COLLECTION: true, sl: true},

      {id: "equip", slug: "equipment", cls:"equip", text: t("Equipment"), root: true, "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "legen", slug: "equipment/legendaries", cls:"equip", text: t("Legendaries"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "equip1", slug: "equipment/trinkets", cls:"equip", text: t("Trinkets"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "equip2", slug: "equipment/item-enhancements", cls:"equip", text: t("Item Enhancements"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "equip3", slug: "equipment/azerite-traits", cls:"equip", text: t("Azerite Traits"), WEAKAURA: true, COLLECTION: true, bfa: true},

      {id: "mech", slug: "combat-mechanics", cls:"mechanics", text: t("Combat Mechanics"), "CLASSIC-WEAKAURA": true, root: true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "mech1", slug: "combat-mechanics/battle-resurrection", cls:"mechanics", text: t("Battle Resurrection"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "mech2", slug: "combat-mechanics/interrupts", cls:"mechanics", text: t("Interrupts"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "mech3", slug: "combat-mechanics/theorycrafting", cls:"mechanics", text: t("Theorycrafting"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "mech4", slug: "combat-mechanics/vehicles", cls:"mechanics", text: t("Vehicles"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "mech5", slug: "combat-mechanics/consumables", cls:"mechanics", text: t("Consumables"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "mech6", slug: "combat-mechanics/group-buffs", cls:"mechanics", text: t("Group Buffs"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      
      {id: "opie1", slug: "group-buffs", cls:"opie", text: t("Group Buffs"), OPIE: true, root: true},
      {id: "opie2", slug: "consumables", cls:"opie", text: t("Consumables"), OPIE: true, root: true},
      {id: "opie3", slug: "vehicles", cls:"opie", text: t("Vehicles"), OPIE: true, root: true},
      {id: "opie4", slug: "equipment", cls:"opie", text: t("Equipment"), OPIE: true, root: true},
      {id: "opie5", slug: "equipment/trinkets", cls:"opie", text: t("Trinkets"), OPIE: true},
      {id: "opie6", slug: "utility", cls:"opie", text: t("Utility"), OPIE: true},

      {id: "role0", slug: "class-roles", cls:"roles", text: t("Group Roles"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "role4", slug: "class-roles/raid-leading", cls:"roles", text: t("Raid Leading"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "role1", slug: "class-roles/damage-dealing", cls:"roles", text: t("Damage Dealing"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "role2", slug: "class-roles/healing", cls:"roles", text: t("Healing"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "role3", slug: "class-roles/tanking", cls:"roles", text: t("Tanking"), WEAKAURA: true, ELVUI: true, VUHDO: true, PLATER: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "vuhdo0", slug: "vuhdo", cls:"vuhdo", text: t("Vuhdo"), "systemtag": true, noselect: true, VUHDO: true},
      {id: "vuhdo1", slug: "vuhdo/vuhdo-profiles", cls:"vuhdo", text: t("Vuhdo Profiles"), "systemtag": true, VUHDO: true},
      {id: "vuhdo2", slug: "vuhdo/vuhdo-bouquets", cls:"vuhdo", text: t("Vuhdo Bouquets"), "systemtag": true, VUHDO: true},
      {id: "vuhdo3", slug: "vuhdo/vuhdo-key-layouts", cls:"vuhdo", text: t("Vuhdo Key Layouts"), "systemtag": true, VUHDO: true},

      {id: "plater0", slug: "plater", cls:"plater", text: t("Plater"), "systemtag": true, noselect: true, PLATER: true},
      {id: "plater1", slug: "plater/plater-profiles", cls:"plater", text: t("Plater Profiles"), "systemtag": true, PLATER: true},
      {id: "plater2", slug: "plater/plater-scripts", cls:"plater", text: t("Plater Scripts"), "systemtag": true, PLATER: true},
      {id: "plater3", slug: "plater/plater-mods", cls:"plater", text: t("Plater Mods"), "systemtag": true, PLATER: true},
      {id: "plater4", slug: "plater/plater-animations", cls:"plater", text: t("Plater Animations"), "systemtag": true, PLATER: true},
      {id: "plater5", slug: "plater/plater-npc-colors", cls:"plater", text: t("Plater NPC Colors"), "systemtag": true, PLATER: true},

      {id: "platerpvp", slug: "plater/pvp", cls:"snippets", text: t("PvP"), root: true, PLATER: true},
      {id: "platerdungeons", slug: "plater/dungeons", cls:"snippets", text: t("Dungeons"), root: true, PLATER: true},
      {id: "platerraidzuldazar", slug: "plater/battle-of-zuldazar", cls:"snippets", text: t("warcraft:zones.10076"), root: true, PLATER: true},
      {id: "platerraidcrucible", slug: "plater/crucible-of-storms", cls:"snippets", text: t("warcraft:zones.10057"), root: true, PLATER: true},
      {id: "platerraiduldir", slug: "plater/uldir", cls:"snippets", text: t("warcraft:zones.9389"), root: true, PLATER: true},
      {id: "platerraideternalpalace", slug: "plater/the-eternal-palace", cls:"snippets", text: t("warcraft:zones.10425"), root: true, PLATER: true},
      {id: "platerraidnyalotha", slug: "plater/nyalotha", cls:"snippets", text: t("warcraft:zones.nyalotha"), root: true, PLATER: true},
      {id: "platerutilities", slug: "plater/utilities", cls:"snippets", text: t("Utilities"), root: true, PLATER: true},

      {id: "totalrp0", slug: "totalrp", cls:"rpcampaign", text: t("Total RP3"), systemtag: true, noselect: true, TOTALRP3: true},
      {id: "totalrp1", slug: "totalrp/campaigns", cls:"rpcampaign", text: t("Campaigns"), root: true, TOTALRP3: true, PLATER: true},
      {id: "totalrp2", slug: "totalrp/campaigns/alliance-campaigns", cls:"rpcampaign", text: t("Alliance Campaigns"), TOTALRP3: true},
      {id: "totalrp3", slug: "totalrp/campaigns/horde-campaigns", cls:"rpcampaign", text: t("Horde Campaigns"), TOTALRP3: true},
      {id: "totalrp4", slug: "totalrp/items", cls:"rpitem", text: t("Items"), root: true, TOTALRP3: true},
      //{id: "totalrp5", slug: "totalrp/items/consumables", cls:"rpitem", text: t("Consumables"), TOTALRP3: true},
      {id: "totalrp6", slug: "totalrp/items/containers", cls:"rpitem", text: t("Containers"), TOTALRP3: true},
      {id: "totalrp7", slug: "totalrp/items/documents", cls:"rpitem", text: t("Documents"), TOTALRP3: true},
      {id: "totalrp8", slug: "totalrp/items/equipment", cls:"rpitem", text: t("Equipment"), TOTALRP3: true},
      {id: "totalrp9", slug: "totalrp/items/expert-mode", cls:"rpitem", text: t("Expert Mode"), TOTALRP3: true},
      {id: "totalrp10", slug: "totalrp/items/normal-mode", cls:"rpitem", text: t("Normal Mode"), TOTALRP3: true},
      {id: "totalrp11", slug: "totalrp/items/miscellaneous", cls:"rpitem", text: t("Miscellaneous"), TOTALRP3: true},
      {id: "totalrp12", slug: "totalrp/items/toys", cls:"rpitem", text: t("Toys"), TOTALRP3: true},

      {id: "rplang1", slug: "totalrp/english", cls:"rplang", text: t("English"), root: true, TOTALRP3: true},
      {id: "rplang2", slug: "totalrp/french", cls:"rplang", text: t("French"), root: true, TOTALRP3: true},
      {id: "rplang3", slug: "totalrp/spanish", cls:"rplang", text: t("Spanish"), root: true, TOTALRP3: true},
      {id: "rplang4", slug: "totalrp/german", cls:"rplang", text: t("German"), root: true, TOTALRP3: true},


      // {id: "pve", slug: "pve", cls:"", text: t("PvE"), noselect: true, WEAKAURA: true},
      
      {id: "raidnathria", slug: "pve/nathria", cls:"nathria", text: t("warcraft:zones.CastleNathria"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, sl: true},
      {id: "raidnathria1", slug: "pve/nathria/shriekwing", cls:"nathria", text: t("warcraft:bosses.Shriekwing"), WEAKAURA: true, sl: true},
      {id: "raidnathria10", slug: "pve/nathria/altimor-the-huntsman", cls:"nathria", text: t("warcraft:bosses.Altimor"), WEAKAURA: true, sl: true},
      {id: "raidnathria2", slug: "pve/nathria/hungering-destroyer", cls:"nathria", text: t("warcraft:bosses.HungeringDestroyer"), WEAKAURA: true, sl: true},
      {id: "raidnathria4", slug: "pve/nathria/artificer-xymox", cls:"nathria", text: t("warcraft:bosses.ArtificerXyMox"), WEAKAURA: true, sl: true},
      {id: "raidnathria3", slug: "pve/nathria/kaelthas-sunstrider", cls:"nathria", text: t("warcraft:bosses.SunKingsSalvation"), WEAKAURA: true, sl: true},
      {id: "raidnathria5", slug: "pve/nathria/lady-inerva-darkvein", cls:"nathria", text: t("warcraft:bosses.LadyInervaDarkvein"), WEAKAURA: true, sl: true},
      {id: "raidnathria6", slug: "pve/nathria/the-council-of-blood", cls:"nathria", text: t("warcraft:bosses.TheCouncilOfBlood"), WEAKAURA: true, sl: true},
      {id: "raidnathria7", slug: "pve/nathria/sludgefist", cls:"nathria", text: t("warcraft:bosses.Sludgefist"), WEAKAURA: true, sl: true},
      {id: "raidnathria8", slug: "pve/nathria/stone-legion-generals", cls:"nathria", text: t("warcraft:bosses.StoneLegionGenerals"), WEAKAURA: true, sl: true},
      {id: "raidnathria9", slug: "pve/nathria/sire-denathrius", cls:"nathria", text: t("warcraft:bosses.SireDenathrius"), WEAKAURA: true, sl: true},
      
      {id: "raidnyalotha", slug: "pve/nyalotha", cls:"nyalotha", text: t("warcraft:zones.nyalotha"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, bfa: true},
      {id: "raidnyalotha1", slug: "pve/nyalotha/wrathion-the-black-emperor", cls:"nyalotha", text: t("warcraft:bosses.nya1"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha2", slug: "pve/nyalotha/maut", cls:"nyalotha", text: t("warcraft:bosses.nya2"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha3", slug: "pve/nyalotha/the-prophet-skitra", cls:"nyalotha", text: t("warcraft:bosses.nya3"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha4", slug: "pve/nyalotha/dark-inquisitor-xanesh", cls:"nyalotha", text: t("warcraft:bosses.nya4"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha5", slug: "pve/nyalotha/hivemind", cls:"nyalotha", text: t("warcraft:bosses.nya5"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha6", slug: "pve/nyalotha/shadhar-the-insatiable", cls:"nyalotha", text: t("warcraft:bosses.nya6"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha7", slug: "pve/nyalotha/drestagath", cls:"nyalotha", text: t("warcraft:bosses.nya7"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha8", slug: "pve/nyalotha/vexiona", cls:"nyalotha", text: t("warcraft:bosses.nya8"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha9", slug: "pve/nyalotha/ra-den-the-despoiled", cls:"nyalotha", text: t("warcraft:bosses.nya9"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha10", slug: "pve/nyalotha/ilgynoth-corruption-reborn", cls:"nyalotha", text: t("warcraft:bosses.nya10"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha11", slug: "pve/nyalotha/carapace-of-nzoth", cls:"nyalotha", text: t("warcraft:bosses.nya11"), WEAKAURA: true, bfa: true},
      {id: "raidnyalotha12", slug: "pve/nyalotha/nzoth-the-corruptor", cls:"nyalotha", text: t("warcraft:bosses.nya12"), WEAKAURA: true, bfa: true},

      {id: "raideternalpalace", slug: "pve/the-eternal-palace", cls:"eternalpalace", text: t("warcraft:zones.10425"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, bfa: true},
      {id: "raideternalpalace1", slug: "pve/the-eternal-palace/abyssal-commander-sivara", cls:"eternalpalace", text: t("warcraft:bosses.151881"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace2", slug: "pve/the-eternal-palace/rage-of-azshara", cls:"eternalpalace", text: t("warcraft:bosses.152364"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace3", slug: "pve/the-eternal-palace/underwater-monstrosity", cls:"eternalpalace", text: t("warcraft:bosses.150653"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace4", slug: "pve/the-eternal-palace/lady-priscilla-ashvane", cls:"eternalpalace", text: t("warcraft:bosses.153142"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace5", slug: "pve/the-eternal-palace/the-hatchery", cls:"eternalpalace", text: t("warcraft:bosses.152128"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace6", slug: "pve/the-eternal-palace/the-queens-court", cls:"eternalpalace", text: t("warcraft:bosses.152853"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace7", slug: "pve/the-eternal-palace/herald-of-nzoth", cls:"eternalpalace", text: t("warcraft:bosses.151586"), WEAKAURA: true, bfa: true},
      {id: "raideternalpalace8", slug: "pve/the-eternal-palace/queen-azshara", cls:"eternalpalace", text: t("warcraft:bosses.152910"), WEAKAURA: true, bfa: true},

      {id: "raidcrucible", slug: "pve/crucible-of-storms", cls:"crucible", text: t("warcraft:zones.10057"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, bfa: true},
      {id: "raidcrucible1", slug: "pve/crucible-of-storms/the-restless-cabal", cls:"crucible", text: t("warcraft:bosses.146497"), WEAKAURA: true, bfa: true},
      {id: "raidcrucible2", slug: "pve/crucible-of-storms/uunat-harbinger-of-the-void", cls:"crucible", text: t("warcraft:bosses.145371"), WEAKAURA: true, bfa: true},

      {id: "raidzuldazar", slug: "pve/battle-of-zuldazar", cls:"zuldazar", text: t("warcraft:zones.10076"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, bfa: true},
      {id: "raidzuldazar1", slug: "pve/battle-of-zuldazar/frida-ironbellows", cls:"zuldazar", text: t("warcraft:bosses.144680"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar1b", slug: "pve/battle-of-zuldazar/ra-wani-kanae", cls:"zuldazar", text: t("warcraft:bosses.144683"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar2", slug: "pve/battle-of-zuldazar/grong-the-jungle-lord", cls:"zuldazar", text: t("warcraft:bosses.147268"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar2b", slug: "pve/battle-of-zuldazar/grong-the-revenant", cls:"zuldazar", text: t("warcraft:bosses.144638"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar3", slug: "pve/battle-of-zuldazar/flamefist-and-the-illuminated", cls:"zuldazar", text: t("warcraft:bosses.146099"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar3b", slug: "pve/battle-of-zuldazar/grimfang-and-firecaller", cls:"zuldazar", text: t("warcraft:bosses.144691"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar4", slug: "pve/battle-of-zuldazar/high-tinker-mekkatorque", cls:"zuldazar", text: t("warcraft:bosses.147589"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar4b", slug: "pve/battle-of-zuldazar/king-rastakhan", cls:"zuldazar", text: t("warcraft:bosses.139633"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar5", slug: "pve/battle-of-zuldazar/stormwall-blockade", cls:"zuldazar", text: t("warcraft:bosses.146256"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar6", slug: "pve/battle-of-zuldazar/conclave-of-the-chosen", cls:"zuldazar", text: t("warcraft:bosses.144747"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar7", slug: "pve/battle-of-zuldazar/opulence", cls:"zuldazar", text: t("warcraft:bosses.147564"), WEAKAURA: true, bfa: true},
      {id: "raidzuldazar8", slug: "pve/battle-of-zuldazar/jaina-proudmoore", cls:"zuldazar", text: t("warcraft:bosses.133251"), WEAKAURA: true, bfa: true},

      {id: "raiduldir", slug: "pve/uldir", cls:"uldir", text: t("warcraft:zones.9389"), root: true, WEAKAURA: true, PLATER: true, COLLECTION: true, bfa: true},
      {id: "raiduldir1", slug: "pve/uldir/taloc-the-corrupted", cls:"uldir", text: t("warcraft:bosses.137119"), WEAKAURA: true, bfa: true},
      {id: "raiduldir2", slug: "pve/uldir/mother", cls:"uldir", text: t("warcraft:bosses.140853"), WEAKAURA: true, bfa: true},
      {id: "raiduldir3", slug: "pve/uldir/fetid-devourer", cls:"uldir", text: t("warcraft:bosses.133298"), WEAKAURA: true, bfa: true},
      {id: "raiduldir4", slug: "pve/uldir/zekvoz-herald-of-nzoth", cls:"uldir", text: t("warcraft:bosses.134445"), WEAKAURA: true, bfa: true},
      {id: "raiduldir5", slug: "pve/uldir/zul-reborn", cls:"uldir", text: t("warcraft:bosses.138967"), WEAKAURA: true, bfa: true},
      {id: "raiduldir6", slug: "pve/uldir/mythrax-the-unraveler", cls:"uldir", text: t("warcraft:bosses.136383"), WEAKAURA: true, bfa: true},
      {id: "raiduldir7", slug: "pve/uldir/vectis", cls:"uldir", text: t("warcraft:bosses.134442"), WEAKAURA: true, bfa: true},
      {id: "raiduldir8", slug: "pve/uldir/ghuun", cls:"uldir", text: t("warcraft:bosses.132998"), WEAKAURA: true, bfa: true},

      {id: "raidantorus", slug: "pve/antorus-the-burning-throne", cls:"antorus", text: t("warcraft:zones.8638"), noselect: true, root: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "raidantorus1", slug: "pve/antorus-the-burning-throne/garothi-worldbreaker", cls:"antorus", text: t("warcraft:bosses.123371"), WEAKAURA: true, legion: true},
      {id: "raidantorus2", slug: "pve/antorus-the-burning-throne/hounds-of-sargeras", cls:"antorus", text: t("warcraft:bosses.126915"), WEAKAURA: true, legion: true},
      {id: "raidantorus3", slug: "pve/antorus-the-burning-throne/antoran-high-command", cls:"antorus", text: t("warcraft:bosses.122367"), WEAKAURA: true, legion: true},
      {id: "raidantorus4", slug: "pve/antorus-the-burning-throne/portal-keeper-hasabel", cls:"antorus", text: t("warcraft:bosses.124393"), WEAKAURA: true, legion: true},
      {id: "raidantorus5", slug: "pve/antorus-the-burning-throne/eonar-the-lifebender", cls:"antorus", text: t("warcraft:bosses.125562"), WEAKAURA: true, legion: true},
      {id: "raidantorus6", slug: "pve/antorus-the-burning-throne/imonar-the-soulhunter", cls:"antorus", text: t("warcraft:bosses.125055"), WEAKAURA: true, legion: true},
      {id: "raidantorus7", slug: "pve/antorus-the-burning-throne/kingaroth", cls:"antorus", text: t("warcraft:bosses.125050"), WEAKAURA: true, legion: true},
      {id: "raidantorus8", slug: "pve/antorus-the-burning-throne/varimathras", cls:"antorus", text: t("warcraft:bosses.125075"), WEAKAURA: true, legion: true},
      {id: "raidantorus9", slug: "pve/antorus-the-burning-throne/the-coven-of-shivarra", cls:"antorus", text: t("warcraft:bosses.122468"), WEAKAURA: true, legion: true},
      {id: "raidantorus10", slug: "pve/antorus-the-burning-throne/aggramar", cls:"antorus", text: t("warcraft:bosses.124691"), WEAKAURA: true, legion: true},
      {id: "raidantorus11", slug: "pve/antorus-the-burning-throne/argus-the-unmaker", cls:"antorus", text: t("warcraft:bosses.124828"), WEAKAURA: true, legion: true},

      {id: "raidtomb", slug: "pve/tomb-of-sargeras", cls:"tombofsargeras", text: t("warcraft:zones.8524"), noselect: true, root: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "raidtomb1", slug: "pve/tomb-of-sargeras/goroth", cls:"tombofsargeras", text: t("warcraft:bosses.115844"), WEAKAURA: true, legion: true},
      {id: "raidtomb2", slug: "pve/tomb-of-sargeras/demonic-inquisition", cls:"tombofsargeras", text: t("warcraft:bosses.116689"), WEAKAURA: true, legion: true},
      {id: "raidtomb3", slug: "pve/tomb-of-sargeras/harjatan-the-bludger", cls:"tombofsargeras", text: t("warcraft:bosses.116407"), WEAKAURA: true, legion: true},
      {id: "raidtomb4", slug: "pve/tomb-of-sargeras/mistress-sasszine", cls:"tombofsargeras", text: t("warcraft:bosses.115767"), WEAKAURA: true, legion: true},
      {id: "raidtomb5", slug: "pve/tomb-of-sargeras/sisters-of-the-moon", cls:"tombofsargeras", text: t("warcraft:bosses.118523"), WEAKAURA: true, legion: true},
      {id: "raidtomb6", slug: "pve/tomb-of-sargeras/the-desolate-host", cls:"tombofsargeras", text: t("warcraft:bosses.118460"), WEAKAURA: true, legion: true},
      {id: "raidtomb7", slug: "pve/tomb-of-sargeras/maiden-of-vigilance", cls:"tombofsargeras", text: t("warcraft:bosses.118289"), WEAKAURA: true, legion: true},
      {id: "raidtomb8", slug: "pve/tomb-of-sargeras/fallen-avatar", cls:"tombofsargeras", text: t("warcraft:bosses.116939"), WEAKAURA: true, legion: true},
      {id: "raidtomb9", slug: "pve/tomb-of-sargeras/kiljaeden", cls:"tombofsargeras", text: t("warcraft:bosses.117269"), WEAKAURA: true, legion: true},

      {id: "raidnh", slug: "pve/nighthold", cls:"nighthold", text: t("warcraft:zones.8025"), noselect: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "raidnh1", slug: "pve/nighthold/skorpyron", cls:"nighthold", text: t("warcraft:bosses.102263"), WEAKAURA: true, legion: true},
      {id: "raidnh2", slug: "pve/nighthold/chronomatic-anomaly", cls:"nighthold", text: t("warcraft:bosses.104415"), WEAKAURA: true, legion: true},
      {id: "raidnh3", slug: "pve/nighthold/trilliax", cls:"nighthold", text: t("warcraft:bosses.104288"), WEAKAURA: true, legion: true},
      {id: "raidnh4", slug: "pve/nighthold/spellblade-aluriel", cls:"nighthold", text: t("warcraft:bosses.107699"), WEAKAURA: true, legion: true},
      {id: "raidnh5", slug: "pve/nighthold/tichondrius", cls:"nighthold", text: t("warcraft:bosses.103685"), WEAKAURA: true, legion: true},
      {id: "raidnh6", slug: "pve/nighthold/krosus", cls:"nighthold", text: t("warcraft:bosses.101002"), WEAKAURA: true, legion: true},
      {id: "raidnh7", slug: "pve/nighthold/high-botanist-telarn", cls:"nighthold", text: t("warcraft:bosses.104528"), WEAKAURA: true, legion: true},
      {id: "raidnh8", slug: "pve/nighthold/star-augur-etraeus", cls:"nighthold", text: t("warcraft:bosses.103758"), WEAKAURA: true, legion: true},
      {id: "raidnh9", slug: "pve/nighthold/grand-magistrix-elisande", cls:"nighthold", text: t("warcraft:bosses.110965"), WEAKAURA: true, legion: true},
      {id: "raidnh10", slug: "pve/nighthold/guldan", cls:"nighthold", text: t("warcraft:bosses.105503"), WEAKAURA: true, legion: true},

      {id: "dungeon", slug: "pve/legion-dungeons", cls:"dungeon", text: t("Legion Dungeons"), noselect: true, root: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "dungeon3", slug: "pve/legion-dungeons/arcway", cls:"dungeon", text: t("warcraft:zones.7855"), WEAKAURA: true, legion: true},
      {id: "dungeon1", slug: "pve/legion-dungeons/assault-on-violet-hold", cls:"dungeon", text: t("warcraft:zones.7996"), WEAKAURA: true, legion: true},
      {id: "dungeon4", slug: "pve/legion-dungeons/blackrook-hold", cls:"dungeon", text: t("warcraft:zones.7805"), WEAKAURA: true, legion: true},
      {id: "dungeon12", slug: "pve/legion-dungeons/cathedral-of-eternal-night", cls:"dungeon", text: t("warcraft:zones.8527"), WEAKAURA: true, legion: true},
      {id: "dungeon2", slug: "pve/legion-dungeons/court-of-stars", cls:"dungeon", text: t("warcraft:zones.8079"), WEAKAURA: true, legion: true},
      {id: "dungeon5", slug: "pve/legion-dungeons/darkheart-thicket", cls:"dungeon", text: t("warcraft:zones.7673"), WEAKAURA: true, legion: true},
      {id: "dungeon6", slug: "pve/legion-dungeons/eye-of-azshara", cls:"dungeon", text: t("warcraft:zones.8040"), WEAKAURA: true, legion: true},
      {id: "dungeon7", slug: "pve/legion-dungeons/halls-of-valor", cls:"dungeon", text: t("warcraft:zones.7672"), WEAKAURA: true, legion: true},
      {id: "dungeon8", slug: "pve/legion-dungeons/maw-of-souls", cls:"dungeon", text: t("warcraft:zones.7812"), WEAKAURA: true, legion: true},
      {id: "dungeon9", slug: "pve/legion-dungeons/neltharions-lair", cls:"dungeon", text: t("warcraft:zones.7546"), WEAKAURA: true, legion: true},
      {id: "dungeon11", slug: "pve/legion-dungeons/return-to-karazhan", cls:"dungeon", text: t("warcraft:zones.8443"), WEAKAURA: true, legion: true},
      {id: "dungeon13", slug: "pve/legion-dungeons/seat-of-the-triumvirate", cls:"dungeon", text: t("warcraft:zones.8910"), WEAKAURA: true, legion: true},
      {id: "dungeon10", slug: "pve/legion-dungeons/vault-of-the-wardens", cls:"dungeon", text: t("warcraft:zones.7787"), WEAKAURA: true, legion: true},

      {id: "bfadungeon", slug: "pve/bfa-dungeons", cls:"dungeon", text: t("Dungeons"), root: true, WEAKAURA: true, COLLECTION: true, bfa: true},
      {id: "bfadungeon1", slug: "pve/bfa-dungeons/atal-dazar", cls:"dungeon", text: t("warcraft:zones.9028"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon2", slug: "pve/bfa-dungeons/freehold", cls:"dungeon", text: t("warcraft:zones.9164"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon3", slug: "pve/bfa-dungeons/kings-rest", cls:"dungeon", text: t("warcraft:zones.9526"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon4", slug: "pve/bfa-dungeons/shrine-of-the-storm", cls:"dungeon", text: t("warcraft:zones.9525"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon5", slug: "pve/bfa-dungeons/siege-of-boralus", cls:"dungeon", text: t("warcraft:zones.9354"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon6", slug: "pve/bfa-dungeons/temple-of-sethraliss", cls:"dungeon", text: t("warcraft:zones.9527"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon7", slug: "pve/bfa-dungeons/the-motherlode", cls:"dungeon", text: t("warcraft:zones.8064"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon8", slug: "pve/bfa-dungeons/the-underrot", cls:"dungeon", text: t("warcraft:zones.9391"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon9", slug: "pve/bfa-dungeons/tol-dagor", cls:"dungeon", text: t("warcraft:zones.9327"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon10", slug: "pve/bfa-dungeons/waycrest-manor", cls:"dungeon", text: t("warcraft:zones.9424"), WEAKAURA: true, bfa: true},
      {id: "bfadungeon11", slug: "pve/bfa-dungeons/operation-mechagon", cls:"dungeon", text: t("warcraft:zones.10225"), WEAKAURA: true, bfa: true},

      {id: "sldungeon", slug: "pve/shadowlands-dungeons", cls:"dungeon", text: t("Shadowlands Dungeons"), root: true, WEAKAURA: true, COLLECTION: true, sl: true},
      {id: "sldungeon1", slug: "pve/shadowlands-dungeons/the-necrotic-wake", cls:"dungeon", text: t("warcraft:zones.TheNecroticWake"), WEAKAURA: true, sl: true},
      {id: "sldungeon2", slug: "pve/shadowlands-dungeons/plaguefall", cls:"dungeon", text: t("warcraft:zones.Plaguefall"), WEAKAURA: true, sl: true},
      {id: "sldungeon3", slug: "pve/shadowlands-dungeons/mists-of-tirna-scithe", cls:"dungeon", text: t("warcraft:zones.MistsOfTirnaScithe"), WEAKAURA: true, sl: true},
      {id: "sldungeon4", slug: "pve/shadowlands-dungeons/halls-of-attonement", cls:"dungeon", text: t("warcraft:zones.HallsOfAttonement"), WEAKAURA: true, sl: true},
      {id: "sldungeon5", slug: "pve/shadowlands-dungeons/theater-of-pain", cls:"dungeon", text: t("warcraft:zones.TheaterOfPain"), WEAKAURA: true, sl: true},
      {id: "sldungeon6", slug: "pve/shadowlands-dungeons/de-other-side", cls:"dungeon", text: t("warcraft:zones.DeOtherSide"), WEAKAURA: true, sl: true},
      {id: "sldungeon7", slug: "pve/shadowlands-dungeons/spires-of-ascension", cls:"dungeon", text: t("warcraft:zones.SpiresOfAscension"), WEAKAURA: true, sl: true},
      {id: "sldungeon8", slug: "pve/shadowlands-dungeons/sanguine-depths", cls:"dungeon", text: t("warcraft:zones.SanguineDepths"), WEAKAURA: true, COLLECTION: true, sl: true},

      {id: "torghast", slug: "pve/torghast", cls:"torghast", text: t("warcraft:zones.Torghast"), root: true, WEAKAURA: true, COLLECTION: true, sl: true},
      {id: "torghast1", slug: "pve/torghast/encounters", cls:"torghast", text: t("Encounters"), WEAKAURA: true, sl: true},
      {id: "torghast2", slug: "pve/torghast/anima", cls:"torghast", text: t("Anima"), WEAKAURA: true, sl: true},

      {id: "pvp", slug: "pvp", cls:"pvp-arena", text: t("PvP"), root: true, "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "arena", slug: "pvp/arena", cls:"pvp-arena", text: t("Arena"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true},
      {id: "bg", slug: "pvp/battlegrounds", cls:"pvp-arena", text: t("Battlegrounds"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      // {id: "bg1", slug: "pvp/battlegrounds/alterac-valley", cls:"pvp-battleground", text: t("Alterac Valley"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg2", slug: "pvp/battlegrounds/areathi-basin", cls:"pvp-battleground", text: t("Arathi Basin"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg3", slug: "pvp/battlegrounds/deepwind-gorge", cls:"pvp-battleground", text: t("Deepwind Gorge"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg4", slug: "pvp/battlegrounds/eye-of-the-storm", cls:"pvp-battleground", text: t("Eye of the Storm"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg5", slug: "pvp/battlegrounds/isle-of-conquest", cls:"pvp-battleground", text: t("Isle of Conquest"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg6", slug: "pvp/battlegrounds/silvershard-mines", cls:"pvp-battleground", text: t("Silvershard Mines"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg7", slug: "pvp/battlegrounds/strand-of-the-ancients", cls:"pvp-battleground", text: t("Strand of the Ancients"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg8", slug: "pvp/battlegrounds/temple-of-kotmogu", cls:"pvp-battleground", text: t("Temple of Kotmogu"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg9", slug: "pvp/battlegrounds/battle-for-gilneas", cls:"pvp-battleground", text: t("The Battle for Gilneas"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg10", slug: "pvp/battlegrounds/twin-peaks", cls:"pvp-battleground", text: t("Twin Peaks"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "bg11", slug: "pvp/battlegrounds/warsong-gulch", cls:"pvp-battleground", text: t("Warsong Gulch"), WEAKAURA: true, "hideFromMenu": true},

      {id: "wpvp", slug: "pvp/world-pvp", cls:"pvp-arena", text: t("World PvP"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "wpvp1", slug: "pvp/duels", cls:"pvp-arena", text: t("Duels"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, legion: true, bfa: true, sl: true, classic: true},

      // {id: "prof0", slug: "professions", cls:"prof", text: t("Professions"), noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "prof1", slug: "professions/gathering", cls:"prof-gathering", text: t("Gathering Professions"), root: true, WEAKAURA: true, "CLASSIC-WEAKAURA": true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof2", slug: "professions/gathering/herbalism", cls:"prof-gathering", text: t("warcraft:professions.herbalism"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof3", slug: "professions/gathering/mining", cls:"prof-gathering", text: t("warcraft:professions.mining"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof4", slug: "professions/gathering/skinning", cls:"prof-gathering", text: t("warcraft:professions.skinning"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof5", slug: "professions/crafting", cls:"prof-crafting", text: t("Crafting Professions"), root: true, WEAKAURA: true, "CLASSIC-WEAKAURA": true, COLLECTION: true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof6", slug: "professions/crafting/alchemy", cls:"prof-crafting", text: t("warcraft:professions.alchemy"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof7", slug: "professions/crafting/blacksmithing", cls:"prof-crafting", text: t("warcraft:professions.blacksmith"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof8", slug: "professions/crafting/enchanting", cls:"prof-crafting", text: t("warcraft:professions.enchanting"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof9", slug: "professions/crafting/engineering", cls:"prof-crafting", text: t("warcraft:professions.engineering"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof10", slug: "professions/crafting/inscription", cls:"prof-crafting", text: t("warcraft:professions.inscription"), WEAKAURA: true, OPIE: true, legion: true, bfa: true, sl: true},
      {id: "prof11", slug: "professions/crafting/jewelcrafting", cls:"prof-crafting", text: t("warcraft:professions.jewelcrafting"), WEAKAURA: true, OPIE: true, legion: true, bfa: true, sl: true},
      {id: "prof12", slug: "professions/crafting/leatherworking", cls:"prof-crafting", text: t("warcraft:professions.leatherworking"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof13", slug: "professions/crafting/tailoring", cls:"prof-crafting", text: t("warcraft:professions.tailoring"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof14", slug: "professions/secondary", cls:"prof-secondary", text: t("Secondary Professions"), root: true, WEAKAURA: true, "CLASSIC-WEAKAURA": true, COLLECTION: true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof15", slug: "professions/secondary/archeology", cls:"prof-secondary", text: t("warcraft:professions.archeology"), WEAKAURA: true, OPIE: true, legion: true, bfa: true, sl: true},
      {id: "prof16", slug: "professions/secondary/cooking", cls:"prof-secondary", text: t("warcraft:professions.cooking"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "prof17", slug: "professions/secondary/first-aid", cls:"prof-secondary", text: t("warcraft:professions.firstaid"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, classic: true},
      {id: "prof18", slug: "professions/secondary/fishing", cls:"prof-secondary", text: t("warcraft:professions.fishing"), WEAKAURA: true, "CLASSIC-WEAKAURA": true, OPIE: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "oldraids", slug: "pve/legacy", cls:"", text: t("Legacy Content"), "menucol": 5, noselect: true},

      {id: "raiden", slug: "pve/emerald-nightmare", cls:"emeraldnightmare", text: t("warcraft:zones.8026"), noselect: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "raiden1", slug: "pve/emerald-nightmare/nythendra", cls:"emeraldnightmare", text: t("warcraft:bosses.103160"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden2", slug: "pve/emerald-nightmare/ilgynoth", cls:"emeraldnightmare", text: t("warcraft:bosses.105393"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden4", slug: "pve/emerald-nightmare/elerethe-renferal", cls:"emeraldnightmare", text: t("warcraft:bosses.111000"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden5", slug: "pve/emerald-nightmare/ursoc", cls:"emeraldnightmare", text: t("warcraft:bosses.100497"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden6", slug: "pve/emerald-nightmare/dragons-of-nightmare", cls:"emeraldnightmare", text: t("warcraft:bosses.102679"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden7", slug: "pve/emerald-nightmare/cenarius", cls:"emeraldnightmare", text: t("warcraft:bosses.113534"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raiden8", slug: "pve/emerald-nightmare/xavius", cls:"emeraldnightmare", text: t("warcraft:bosses.103769"), noselect: true, WEAKAURA: true, legion: true},

      {id: "raidtov", slug: "pve/trial-of-valor", cls:"trialofvalor", text: t("warcraft:zones.8440"), noselect: true, WEAKAURA: true, COLLECTION: true, legion: true},
      {id: "raidtov1", slug: "pve/trial-of-valor/odyn", cls:"trialofvalor", text: t("warcraft:bosses.115323"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raidtov2", slug: "pve/trial-of-valor/guarm", cls:"trialofvalor", text: t("warcraft:bosses.114344"), noselect: true, WEAKAURA: true, legion: true},
      {id: "raidtov3", slug: "pve/trial-of-valor/helya", cls:"trialofvalor", text: t("warcraft:bosses.115323"), noselect: true, WEAKAURA: true, legion: true},

      {id: "raidhfc", slug: "pve/hellfire-citadel", cls:"hellfirecitadel", text: t("warcraft:zones.7545"), noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidhfc1", slug: "pve/hellfire-citadel/assault", cls:"hellfirecitadel", text: t("warcraft:bosses.93023"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc2", slug: "pve/hellfire-citadel/iron-reaver", cls:"hellfirecitadel", text: t("warcraft:bosses.90284"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc3", slug: "pve/hellfire-citadel/kormrok", cls:"hellfirecitadel", text: t("warcraft:bosses.90435"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc4", slug: "pve/hellfire-citadel/kilrogg-deadeye", cls:"hellfirecitadel", text: t("warcraft:bosses.90378"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc5", slug: "pve/hellfire-citadel/high-council", cls:"hellfirecitadel", text: t("warcraft:bosses.92146"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc6", slug: "pve/hellfire-citadel/gorefiend", cls:"hellfirecitadel", text: t("warcraft:bosses.90199"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc7", slug: "pve/hellfire-citadel/shadow-lord-iskar", cls:"hellfirecitadel", text: t("warcraft:bosses.90316"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc8", slug: "pve/hellfire-citadel/socrethar-the-eternal", cls:"hellfirecitadel", text: t("warcraft:bosses.90296"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc9", slug: "pve/hellfire-citadel/tyrant-velhari", cls:"hellfirecitadel", text: t("warcraft:bosses.90269"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc10", slug: "pve/hellfire-citadel/fel-lord-zakuun", cls:"hellfirecitadel", text: t("warcraft:bosses.89890"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc11", slug: "pve/hellfire-citadel/xhulhorac", cls:"hellfirecitadel", text: t("warcraft:bosses.93068"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc12", slug: "pve/hellfire-citadel/mannoroth", cls:"hellfirecitadel", text: t("warcraft:bosses.91349"), noselect: true, WEAKAURA: true, "hideFromMenu": true},
      {id: "raidhfc13", slug: "pve/hellfire-citadel/archimonde", cls:"hellfirecitadel", text: t("warcraft:bosses.91331"), noselect: true, WEAKAURA: true, "hideFromMenu": true},

      {id: "gen5", slug: "development", cls:"development", text: t("Development"), root: true, noselect: true, WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen3", slug: "development/testing", cls:"development", text: t("Testing"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "gen4", slug: "development/wa-training", cls:"development", text: t("WA Training"), WEAKAURA: true, COLLECTION: true, legion: true, bfa: true, sl: true, classic: true},
      {id: "beta2", slug: "development/legion-ptr7.2", cls:"development", text: t("Legion 7.2 PTR"), noselect: true, "systemtag": true, WEAKAURA: true, legion: true, bfa: true, sl: true, classic: true},

      {id: "mdtdun", slug: "pve/dungeons", cls:"dungeon", text: t("Dungeons"), root: true, MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun1", slug: "dungeons/blackrook-hold", cls:"dungeon", text: t("warcraft:zones.7805"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun2", slug: "dungeons/cathedral-of-eternal-night", cls:"dungeon", text: t("warcraft:zones.8527"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun3", slug: "dungeons/court-of-stars", cls:"dungeon", text: t("warcraft:zones.8079"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun4", slug: "dungeons/darkheart-thicket", cls:"dungeon", text: t("warcraft:zones.7673"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun5", slug: "dungeons/eye-of-azshara", cls:"dungeon", text: t("warcraft:zones.8040"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun6", slug: "dungeons/halls-of-valor", cls:"dungeon", text: t("warcraft:zones.7672"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun7", slug: "dungeons/maw-of-souls", cls:"dungeon", text: t("warcraft:zones.7812"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun8", slug: "dungeons/neltharions-lair", cls:"dungeon", text: t("warcraft:zones.7546"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun9", slug: "dungeons/return-to-karazhan-lower", cls:"dungeon", text: t("warcraft:zones.8443-lower"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun10", slug: "dungeons/return-to-karazhan-upper", cls:"dungeon", text: t("warcraft:zones.8443-upper"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun11", slug: "dungeons/seat-of-the-triumvirate", cls:"dungeon", text: t("warcraft:zones.8910"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun12", slug: "dungeons/the-arcway", cls:"dungeon", text: t("warcraft:zones.7855"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtdun13", slug: "dungeons/vault-of-the-wardens", cls:"dungeon", text: t("warcraft:zones.7787"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun15", slug: "pve/dungeons/atal-dazar", cls:"dungeon", text: t("warcraft:zones.9028"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun16", slug: "pve/dungeons/freehold", cls:"dungeon", text: t("warcraft:zones.9164"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun16-crew2", slug: "pve/dungeons/freehold/bilge-rats", cls:"dungeon", text: t("Bilge Rats Crew"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun16-crew1", slug: "pve/dungeons/freehold/blacktooth", cls:"dungeon", text: t("Blacktooth Crew"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun16-crew3", slug: "pve/dungeons/freehold/cutwater", cls:"dungeon", text: t("Cutwater Crew"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun17", slug: "pve/dungeons/kings-rest", cls:"dungeon", text: t("warcraft:zones.9526"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun18", slug: "pve/dungeons/shrine-of-the-storm", cls:"dungeon", text: t("warcraft:zones.9525"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun19", slug: "pve/dungeons/siege-of-boralus", cls:"dungeon", text: t("warcraft:zones.9354"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun19-faction2", slug: "pve/dungeons/siege-of-boralus/alliance", cls:"dungeon", text: t("Alliance"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun19-faction1", slug: "pve/dungeons/siege-of-boralus/horde", cls:"dungeon", text: t("Horde"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun20", slug: "pve/dungeons/temple-of-sethraliss", cls:"dungeon", text: t("warcraft:zones.9527"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun21", slug: "pve/dungeons/the-motherlode", cls:"dungeon", text: t("warcraft:zones.8064"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun22", slug: "pve/dungeons/the-underrot", cls:"dungeon", text: t("warcraft:zones.9391"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun23", slug: "pve/dungeons/tol-dagor", cls:"dungeon", text: t("warcraft:zones.9327"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun24", slug: "pve/dungeons/waycrest-manor", cls:"dungeon", text: t("warcraft:zones.9424"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun25", slug: "pve/dungeons/mechagon-junkyard", cls:"dungeon", text: t("warcraft:zones.10225a"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun26", slug: "pve/dungeons/mechagon-workshop", cls:"dungeon", text: t("warcraft:zones.10225b"), MDT: true, systemtag: true, noselect: true},
      
      {id: "mdt-sldun", slug: "pve/shadowlands-dungeons", cls:"dungeon", text: t("Dungeons"), root: true, MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun29", slug: "pve/shadowlands-dungeons/de-other-side", cls:"dungeon", text: t("warcraft:zones.DeOtherSide"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun30", slug: "pve/shadowlands-dungeons/halls-of-atonement", cls:"dungeon", text: t("warcraft:zones.HallsOfAttonement"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun31", slug: "pve/shadowlands-dungeons/mists-of-tirna-scithe", cls:"dungeon", text: t("warcraft:zones.MistsOfTirnaScithe"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun32", slug: "pve/shadowlands-dungeons/plaguefall", cls:"dungeon", text: t("warcraft:zones.Plaguefall"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun33", slug: "pve/shadowlands-dungeons/sanguine-depths", cls:"dungeon", text: t("warcraft:zones.SanguineDepths"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun34", slug: "pve/shadowlands-dungeons/spires-of-ascension", cls:"dungeon", text: t("warcraft:zones.SpiresOfAscension"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun35", slug: "pve/shadowlands-dungeons/the-necrotic-wake", cls:"dungeon", text: t("warcraft:zones.TheNecroticWake"), MDT: true, systemtag: true, noselect: true},
      {id: "mdt-sldun36", slug: "pve/shadowlands-dungeons/theater-of-pain", cls:"dungeon", text: t("warcraft:zones.TheaterOfPain"), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix", slug: "affixes", cls:"affixes", text: t("Affixes"), root: true, MDT: true, systemtag: true, noselect: true},
      // {id: "mdtaffix1", slug: "affixes/overflowing", cls:"affixes", text: t("Overflowing"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix2", slug: "affixes/skittish", cls:"affixes", text: t("Skittish"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix3", slug: "affixes/volcanic", cls:"affixes", text: t("Volcanic"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix4", slug: "affixes/necrotic", cls:"affixes", text: t("Necrotic"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix5", slug: "affixes/teeming", cls:"affixes", text: t("Teeming"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix6", slug: "affixes/raging", cls:"affixes", text: t("Raging"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix7", slug: "affixes/bolstering", cls:"affixes", text: t("Bolstering"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix8", slug: "affixes/sanguine", cls:"affixes", text: t("Sanguine"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix9", slug: "affixes/tyrannical", cls:"affixes", text: t("Tyrannical"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix10", slug: "affixes/fortified", cls:"affixes", text: t("Fortified"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix11", slug: "affixes/bursting", cls:"affixes", text: t("Bursting"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix12", slug: "affixes/grievous", cls:"affixes", text: t("Grievous"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix13", slug: "affixes/explosive", cls:"affixes", text: t("Explosive"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix14", slug: "affixes/quaking", cls:"affixes", text: t("Quaking"), MDT: true, systemtag: true, noselect: true},
      // {id: "mdtaffix15", slug: "affixes/relentless", cls:"affixes", text: t("Relentless"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix16", slug: "affixes/infested", cls:"affixes", text: t("Infested"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix117", slug: "affixes/reaping", cls:"affixes", text: t("Reaping"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix119", slug: "affixes/beguiling", cls:"affixes", text: t("Beguiling"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix120", slug: "affixes/awakened", cls:"affixes", text: t("Awakened"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix121", slug: "affixes/prideful", cls:"affixes", text: t("Prideful"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix122", slug: "affixes/inspiring", cls:"affixes", text: t("Inspiring"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix123", slug: "affixes/spiteful", cls:"affixes", text: t("Spiteful"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix124", slug: "affixes/storming", cls:"affixes", text: t("Storming"), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix-bfa-s1-w1", slug: "affixes/s1/week1", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w2", slug: "affixes/s1/week2", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Explosive'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w3", slug: "affixes/s1/week3", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Grievous'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w4", slug: "affixes/s1/week4", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Necrotic'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w5", slug: "affixes/s1/week5", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Skittish'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w6", slug: "affixes/s1/week6", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w7", slug: "affixes/s1/week7", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w8", slug: "affixes/s1/week8", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Skittish'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w9", slug: "affixes/s1/week9", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w10", slug: "affixes/s1/week10", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w11", slug: "affixes/s1/week11", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w12", slug: "affixes/s1/week12", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix-bfa-s2-w1", slug: "affixes/s2/week1", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w2", slug: "affixes/s2/week2", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Explosive'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w3", slug: "affixes/s2/week3", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Grievous'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w4", slug: "affixes/s2/week4", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Necrotic'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w5", slug: "affixes/s2/week5", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Skittish'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w6", slug: "affixes/s2/week6", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w7", slug: "affixes/s2/week7", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w8", slug: "affixes/s2/week8", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Skittish'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w9", slug: "affixes/s2/week9", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w10", slug: "affixes/s2/week10", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w11", slug: "affixes/s2/week11", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s2-w12", slug: "affixes/s2/week12", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Reaping')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix-bfa-s3-w1", slug: "affixes/s3/week1", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w2", slug: "affixes/s3/week2", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Skittish'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w3", slug: "affixes/s3/week3", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w4", slug: "affixes/s3/week4", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w5", slug: "affixes/s3/week5", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Skittish'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w6", slug: "affixes/s3/week6", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Necrotic'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w7", slug: "affixes/s3/week7", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Grievous'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w8", slug: "affixes/s3/week8", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Explosive'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w9", slug: "affixes/s3/week9", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w10", slug: "affixes/s3/week10", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Volcanic'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w11", slug: "affixes/s3/week11", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s3-w12", slug: "affixes/s3/week12", cls:"affixes", text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Beguiling')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix-bfa-s4-w1", slug: "affixes/s4/week1", cls:"affixes", contains: ['mdtaffix5', 'mdtaffix3', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w2", slug: "affixes/s4/week2", cls:"affixes", contains: ['mdtaffix7', 'mdtaffix2', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Skittish'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w3", slug: "affixes/s4/week3", cls:"affixes", contains: ['mdtaffix11', 'mdtaffix4', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w4", slug: "affixes/s4/week4", cls:"affixes", contains: ['mdtaffix8', 'mdtaffix14', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w5", slug: "affixes/s4/week5", cls:"affixes", contains: ['mdtaffix7', 'mdtaffix13', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w6", slug: "affixes/s4/week6", cls:"affixes", contains: ['mdtaffix11', 'mdtaffix3', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Volcanic'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w7", slug: "affixes/s4/week7", cls:"affixes", contains: ['mdtaffix6', 'mdtaffix4', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w8", slug: "affixes/s4/week8", cls:"affixes", contains: ['mdtaffix5', 'mdtaffix14', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Teeming'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w9", slug: "affixes/s4/week9", cls:"affixes", contains: ['mdtaffix11', 'mdtaffix2', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bursting'), affix2: t('Skittish'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w10", slug: "affixes/s4/week10", cls:"affixes", contains: ['mdtaffix7', 'mdtaffix12', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Bolstering'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w11", slug: "affixes/s4/week11", cls:"affixes", contains: ['mdtaffix6', 'mdtaffix13', 'mdtaffix9', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Raging'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s4-w12", slug: "affixes/s4/week12", cls:"affixes", contains: ['mdtaffix8', 'mdtaffix12', 'mdtaffix10', 'mdtaffix120'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Sanguine'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Awakened')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtaffix-sl-s1-w1", slug: "affixes/shadowlands-s1/week-1", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix11', 'mdtaffix124', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Bursting'), affix3: t('Storming'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w2", slug: "affixes/shadowlands-s1/week-2", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix8', 'mdtaffix12', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Sanguine'), affix3: t('Grievous'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w3", slug: "affixes/shadowlands-s1/week-3", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix122', 'mdtaffix13', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Inspiring'), affix3: t('Explosive'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w4", slug: "affixes/shadowlands-s1/week-4", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix6', 'mdtaffix14', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Raging'), affix3: t('Quaking'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w5", slug: "affixes/shadowlands-s1/week-5", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix11', 'mdtaffix3', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Bursting'), affix3: t('Volcanic'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w6", slug: "affixes/shadowlands-s1/week-6", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix123', 'mdtaffix12', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Spiteful'), affix3: t('Grievous'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w7", slug: "affixes/shadowlands-s1/week-7", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix7', 'mdtaffix124', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Bolstering'), affix3: t('Storming'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w8", slug: "affixes/shadowlands-s1/week-8", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix122', 'mdtaffix4', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Inspiring'), affix3: t('Necrotic'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w9", slug: "affixes/shadowlands-s1/week-9", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix8', 'mdtaffix14', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Sanguine'), affix3: t('Quaking'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w10", slug: "affixes/shadowlands-s1/week-10", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix6', 'mdtaffix13', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Raging'), affix3: t('Explosive'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w11", slug: "affixes/shadowlands-s1/week-11", cls:"affixes", contains: ['mdtaffix10', 'mdtaffix123', 'mdtaffix3', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Fortified'), affix2: t('Spiteful'), affix3: t('Volcanic'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-sl-s1-w12", slug: "affixes/shadowlands-s1/week-12", cls:"affixes", contains: ['mdtaffix9', 'mdtaffix7', 'mdtaffix4', 'mdtaffix121'], text: t("[-affix1-], [-affix2-], [-affix3-], [-affix4-]", {affix1: t('Tyrannical'), affix2: t('Bolstering'), affix3: t('Necrotic'), affix4: t('Prideful')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtspeed", slug: "speed", cls:"speed", text: t("Speed"), root: true, MDT: true},
      {id: "mdtspeed1", slug: "speed/easy-going", cls:"speed", text: t("Easy Going"), MDT: true },
      {id: "mdtspeed2", slug: "speed/gotta-go-fast", cls:"speed", text: t("Gotta Go Fast"), MDT: true },
      {id: "mdtspeed3", slug: "speed/racing-number-one", cls:"speed", text: t("Racing for #1"), MDT: true },

      {id: "mdtcl6", slug: "classes/death-knight", cls:"cl-deathknight", text: t("warcraft:classes.6"), root: true, MDT: true},
      {id: "mdtcl6-1", slug: "classes/death-knight/blood", cls:"cl-deathknight", text: t("warcraft:classes.6-1"), MDT: true},
      {id: "mdtcl6-2", slug: "classes/death-knight/frost", cls:"cl-deathknight", text: t("warcraft:classes.6-2"), MDT: true},
      {id: "mdtcl6-3", slug: "classes/death-knight/unholy", cls:"cl-deathknight", text: t("warcraft:classes.6-3"), MDT: true},

      {id: "mdtcl12", slug: "classes/demon-hunter", cls:"cl-demonhunter", text: t("warcraft:classes.12"), root: true, MDT: true},
      {id: "mdtcl12-1", slug: "classes/demon-hunter/havoc", cls:"cl-demonhunter", text: t("warcraft:classes.12-1"), MDT: true},
      {id: "mdtcl12-2", slug: "classes/demon-hunter/vengeance", cls:"cl-demonhunter", text: t("warcraft:classes.12-2"), MDT: true},

      {id: "mdtcl11", slug: "classes/druid", cls:"cl-druid", text: t("warcraft:classes.11"), root: true, MDT: true},
      {id: "mdtcl11-1", slug: "classes/druid/balance", cls:"cl-druid", text: t("warcraft:classes.11-1"), MDT: true},
      {id: "mdtcl11-2", slug: "classes/druid/feral", cls:"cl-druid", text: t("warcraft:classes.11-2"), MDT: true},
      {id: "mdtcl11-3", slug: "classes/druid/guardian", cls:"cl-druid", text: t("warcraft:classes.11-3"), MDT: true},
      {id: "mdtcl11-4", slug: "classes/druid/restoration", cls:"cl-druid", text: t("warcraft:classes.11-4"), MDT: true},

      {id: "mdtcl3", slug: "classes/hunter", cls:"cl-hunter", text: t("warcraft:classes.3"), root: true, MDT: true},
      {id: "mdtcl3-1", slug: "classes/hunter/beast-mastery", cls:"cl-hunter", text: t("warcraft:classes.3-1"), MDT: true},
      {id: "mdtcl3-2", slug: "classes/hunter/marksmanship", cls:"cl-hunter", text: t("warcraft:classes.3-2"), MDT: true},
      {id: "mdtcl3-3", slug: "classes/hunter/survival", cls:"cl-hunter", text: t("warcraft:classes.3-3"), MDT: true},

      {id: "mdtcl8", slug: "classes/mage", cls:"cl-mage", text: t("warcraft:classes.8"), root: true, MDT: true},
      {id: "mdtcl8-1", slug: "classes/mage/arcane", cls:"cl-mage", text: t("warcraft:classes.8-1"), MDT: true},
      {id: "mdtcl8-2", slug: "classes/mage/fire", cls:"cl-mage", text: t("warcraft:classes.8-2"), MDT: true},
      {id: "mdtcl8-3", slug: "classes/mage/frost", cls:"cl-mage", text: t("warcraft:classes.8-3"), MDT: true},

      {id: "mdtcl10", slug: "classes/monk", cls:"cl-monk", text: t("warcraft:classes.10"), root: true, MDT: true},
      {id: "mdtcl10-1", slug: "classes/monk/brewmaster", cls:"cl-monk", text: t("warcraft:classes.10-1"), MDT: true},
      {id: "mdtcl10-2", slug: "classes/monk/mistweaver", cls:"cl-monk", text: t("warcraft:classes.10-2"), MDT: true},
      {id: "mdtcl10-3", slug: "classes/monk/windwalker", cls:"cl-monk", text: t("warcraft:classes.10-3"), MDT: true},

      {id: "mdtcl2", slug: "classes/paladin", cls:"cl-paladin", text: t("warcraft:classes.2"), root: true, MDT: true},
      {id: "mdtcl2-1", slug: "classes/paladin/holy", cls:"cl-paladin", text: t("warcraft:classes.2-1"), MDT: true},
      {id: "mdtcl2-2", slug: "classes/paladin/protection", cls:"cl-paladin", text: t("warcraft:classes.2-2"), MDT: true},
      {id: "mdtcl2-3", slug: "classes/paladin/retribution", cls:"cl-paladin", text: t("warcraft:classes.2-3"), MDT: true},

      {id: "mdtcl5", slug: "classes/priest", cls:"cl-priest", text: t("warcraft:classes.5"), root: true, MDT: true},
      {id: "mdtcl5-1", slug: "classes/priest/discipline", cls:"cl-priest", text: t("warcraft:classes.5-1"), MDT: true},
      {id: "mdtcl5-2", slug: "classes/priest/holy", cls:"cl-priest", text: t("warcraft:classes.5-2"), MDT: true},
      {id: "mdtcl5-3", slug: "classes/priest/shadow", cls:"cl-priest", text: t("warcraft:classes.5-3"), MDT: true},

      {id: "mdtcl4", slug: "classes/rogue", cls:"cl-rogue", text: t("warcraft:classes.4"), root: true, MDT: true},
      {id: "mdtcl4-1", slug: "classes/rogue/assassination", cls:"cl-rogue", text: t("warcraft:classes.4-1"), MDT: true},
      {id: "mdtcl4-2", slug: "classes/rogue/outlaw", cls:"cl-rogue", text: t("warcraft:classes.4-2"), MDT: true},
      {id: "mdtcl4-3", slug: "classes/rogue/subtlety", cls:"cl-rogue", text: t("warcraft:classes.4-3"), MDT: true},

      {id: "mdtcl7", slug: "classes/shaman", cls:"cl-shaman", text: t("warcraft:classes.7"), root: true, MDT: true},
      {id: "mdtcl7-1", slug: "classes/shaman/elemental", cls:"cl-shaman", text: t("warcraft:classes.7-1"), MDT: true},
      {id: "mdtcl7-2", slug: "classes/shaman/enhancement", cls:"cl-shaman", text: t("warcraft:classes.7-2"), MDT: true},
      {id: "mdtcl7-3", slug: "classes/shaman/restoration", cls:"cl-shaman", text: t("warcraft:classes.7-3"), MDT: true},

      {id: "mdtcl9", slug: "classes/warlock", cls:"cl-warlock", text: t("warcraft:classes.9"), root: true, MDT: true},
      {id: "mdtcl9-1", slug: "classes/warlock/affliction", cls:"cl-warlock", text: t("warcraft:classes.9-1"), MDT: true},
      {id: "mdtcl9-2", slug: "classes/warlock/demonology", cls:"cl-warlock", text: t("warcraft:classes.9-2"), MDT: true},
      {id: "mdtcl9-3", slug: "classes/warlock/destruction", cls:"cl-warlock", text: t("warcraft:classes.9-3"), MDT: true},

      {id: "mdtcl1", slug: "classes/warrior", cls:"cl-warrior", text: t("warcraft:classes.1"), root: true, MDT: true},
      {id: "mdtcl1-1", slug: "classes/warrior/arms", cls:"cl-warrior", text: t("warcraft:classes.1-1"), MDT: true},
      {id: "mdtcl1-2", slug: "classes/warrior/fury", cls:"cl-warrior", text: t("warcraft:classes.1-2"), MDT: true},
      {id: "mdtcl1-3", slug: "classes/warrior/protection", cls:"cl-warrior", text: t("warcraft:classes.1-3"), MDT: true},

      {id: "snip0", slug: "snippets", cls:"snippets", text: t("Code Snippets"), root: true, "LUA SNIPPET": true, COLLECTION: true},
      {id: "snip1", slug: "snippets/libraries", cls:"snippets", text: t("Libraries"), "LUA SNIPPET": true, COLLECTION: true},
      {id: "snip2", slug: "snippets/tutorials", cls:"snippets", text: t("Tutorials"), "LUA SNIPPET": true, COLLECTION: true},

      // {id: "beta-bfa", slug: "beta-bfa", cls:"snippets", text: t("Battle for Azeroth"), root: true, noselect: true, systemtag: true, WEAKAURA: true},
      {id: "beta-sl", slug: "beta-shadowlands", cls:"snippets", text: t("Shadowlands Beta"), root: true, noselect: true, systemtag: true, WEAKAURA: true},

      // classic
      {id: "classicdungeon", slug: "pve/classic-dungeons", cls:"dungeon", text: t("Classic Dungeons"), root: true, "CLASSIC-WEAKAURA": true, prime: false, classic: true},
      {id: "classicdungeon1", slug: "pve/classic-dungeons/ragefire-chasm", cls:"dungeon", text: t("warcraft:zones.2437"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon2", slug: "pve/classic-dungeons/wailing-caverns", cls:"dungeon", text: t("warcraft:zones.718"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon3", slug: "pve/classic-dungeons/the-deadmines", cls:"dungeon", text: t("warcraft:zones.1581"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon4", slug: "pve/classic-dungeons/shadowfang-keep", cls:"dungeon", text: t("warcraft:zones.209"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon5", slug: "pve/classic-dungeons/blackfathom-deeps", cls:"dungeon", text: t("warcraft:zones.719"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon6", slug: "pve/classic-dungeons/the-stockade", cls:"dungeon", text: t("warcraft:zones.717"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon7", slug: "pve/classic-dungeons/gnomeregan", cls:"dungeon", text: t("warcraft:zones.721"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon8", slug: "pve/classic-dungeons/razorfen-kraul", cls:"dungeon", text: t("warcraft:zones.491"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon9", slug: "pve/classic-dungeons/the-scarlet-monastery", cls:"dungeon", text: t("warcraft:zones.796"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon10", slug: "pve/classic-dungeons/razorfen-downs", cls:"dungeon", text: t("warcraft:zones.722"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon11", slug: "pve/classic-dungeons/uldaman", cls:"dungeon", text: t("warcraft:zones.1337"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon12", slug: "pve/classic-dungeons/zul-ferrak", cls:"dungeon", text: t("warcraft:zones.1176"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon13", slug: "pve/classic-dungeons/mauradon", cls:"dungeon", text: t("warcraft:zones.2100"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon14", slug: "pve/classic-dungeons/temple-of-atal-hakkar", cls:"dungeon", text: t("warcraft:zones.1477"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon15", slug: "pve/classic-dungeons/blackrock-depths", cls:"dungeon", text: t("warcraft:zones.1584"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon16", slug: "pve/classic-dungeons/blackrock-spire", cls:"dungeon", text: t("warcraft:zones.1583"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon17", slug: "pve/classic-dungeons/dire-maul", cls:"dungeon", text: t("warcraft:zones.2557"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon18", slug: "pve/classic-dungeons/stratholme", cls:"dungeon", text: t("warcraft:zones.2017"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "classicdungeon19", slug: "pve/classic-dungeons/scholomance", cls:"dungeon", text: t("warcraft:zones.2057"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidworld", slug: "pve/single-raid", cls:"worldboss", text: t("Single Bosses"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld1", slug: "pve/single-raid/onyxia", cls:"worldboss", text: t("warcraft:bosses.10184"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld2", slug: "pve/single-raid/azuregos", cls:"worldboss", text: t("warcraft:bosses.6109"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld3", slug: "pve/single-raid/kazzak", cls:"worldboss", text: t("warcraft:bosses.12397"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld4", slug: "pve/single-raid/lethon", cls:"worldboss", text: t("warcraft:bosses.14888"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld5", slug: "pve/single-raid/emeriss", cls:"worldboss", text: t("warcraft:bosses.14889"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld6", slug: "pve/single-raid/taerar", cls:"worldboss", text: t("warcraft:bosses.14890"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidworld7", slug: "pve/single-raid/ysondre", cls:"worldboss", text: t("warcraft:bosses.14887"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidmoltencore", slug: "pve/molten-core", cls:"moltencore", text: t("warcraft:zones.2717"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, COLLECTION: true, classic: true},
      {id: "raidmoltencore1", slug: "pve/molten-core/lucifron", cls:"moltencore", text: t("warcraft:bosses.12118"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore2", slug: "pve/molten-core/magmadar", cls:"moltencore", text: t("warcraft:bosses.11982"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore3", slug: "pve/molten-core/gehennas", cls:"moltencore", text: t("warcraft:bosses.12259"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore4", slug: "pve/molten-core/garr", cls:"moltencore", text: t("warcraft:bosses.12057"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore5", slug: "pve/molten-core/shazzrah", cls:"moltencore", text: t("warcraft:bosses.12264"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore6", slug: "pve/molten-core/baron-geddon", cls:"moltencore", text: t("warcraft:bosses.12056"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore7", slug: "pve/molten-core/golemagg-the-incinerator", cls:"moltencore", text: t("warcraft:bosses.11988"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore8", slug: "pve/molten-core/sulfuron-harbinger", cls:"moltencore", text: t("warcraft:bosses.12098"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore9", slug: "pve/molten-core/majordomo-executus", cls:"moltencore", text: t("warcraft:bosses.12018"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidmoltencore10", slug: "pve/molten-core/ragnaros", cls:"moltencore", text: t("warcraft:bosses.11502"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidblackwinglair", slug: "pve/blackwing-lair", cls:"blackwinglair", text: t("warcraft:zones.2677"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair1", slug: "pve/blackwing-lair/razorgore-the-untamed", cls:"blackwinglair", text: t("warcraft:bosses.12435"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair2", slug: "pve/blackwing-lair/vaelastrasz-the-corrupt", cls:"blackwinglair", text: t("warcraft:bosses.13020"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair3", slug: "pve/blackwing-lair/broodlord-lashlayer", cls:"blackwinglair", text: t("warcraft:bosses.12017"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair4", slug: "pve/blackwing-lair/firemaw", cls:"blackwinglair", text: t("warcraft:bosses.11983"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair5", slug: "pve/blackwing-lair/ebonroc", cls:"blackwinglair", text: t("warcraft:bosses.14601"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair6", slug: "pve/blackwing-lair/flamegor", cls:"blackwinglair", text: t("warcraft:bosses.11981"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair7", slug: "pve/blackwing-lair/chromaggus", cls:"blackwinglair", text: t("warcraft:bosses.14020"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidblackwinglair8", slug: "pve/blackwing-lair/nefarian", cls:"blackwinglair", text: t("warcraft:bosses.11583"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidtempleaq", slug: "pve/temple-of-ahn-qiraj", cls:"aq40", text: t("warcraft:zones.3428"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq1", slug: "pve/temple-of-ahn-qiraj/the-prophet-skeram", cls:"aq40", text: t("warcraft:bosses.15263"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq2", slug: "pve/temple-of-ahn-qiraj/bug-trio", cls:"aq40", text: t("warcraft:bosses.15543"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq3", slug: "pve/temple-of-ahn-qiraj/battleguard-sartura", cls:"aq40", text: t("warcraft:bosses.15516"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq4", slug: "pve/temple-of-ahn-qiraj/fankriss-the-undying", cls:"aq40", text: t("warcraft:bosses.15510"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq5", slug: "pve/temple-of-ahn-qiraj/viscidus", cls:"aq40", text: t("warcraft:bosses.15299"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq6", slug: "pve/temple-of-ahn-qiraj/princess-huhuran", cls:"aq40", text: t("warcraft:bosses.15509"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq7", slug: "pve/temple-of-ahn-qiraj/twin-emperors", cls:"aq40", text: t("warcraft:bosses.15276"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq8", slug: "pve/temple-of-ahn-qiraj/ouro", cls:"aq40", text: t("warcraft:bosses.15517"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidtempleaq9", slug: "pve/temple-of-ahn-qiraj/cthun", cls:"aq40", text: t("warcraft:bosses.15727"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidnaxxramas", slug: "pve/naxxramas", cls:"naxxramas", text: t("warcraft:zones.3456"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas1", slug: "pve/naxxramas/anub-rekhan", cls:"naxxramas", text: t("warcraft:bosses.15956"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas2", slug: "pve/naxxramas/grand-widow-faerlina", cls:"naxxramas", text: t("warcraft:bosses.15953"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas3", slug: "pve/naxxramas/maexxna", cls:"naxxramas", text: t("warcraft:bosses.15952"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas4", slug: "pve/naxxramas/noth-the-plaguebringer", cls:"naxxramas", text: t("warcraft:bosses.15954"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas5", slug: "pve/naxxramas/heigan-the-unclean", cls:"naxxramas", text: t("warcraft:bosses.15936"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas6", slug: "pve/naxxramas/loatheb", cls:"naxxramas", text: t("warcraft:bosses.16011"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas7", slug: "pve/naxxramas/patchwerk", cls:"naxxramas", text: t("warcraft:bosses.16028"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas8", slug: "pve/naxxramas/grobbulus", cls:"naxxramas", text: t("warcraft:bosses.15931"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas9", slug: "pve/naxxramas/gluth", cls:"naxxramas", text: t("warcraft:bosses.15932"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas10", slug: "pve/naxxramas/thaddius", cls:"naxxramas", text: t("warcraft:bosses.15928"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas11", slug: "pve/naxxramas/instructor-razuvious", cls:"naxxramas", text: t("warcraft:bosses.16061"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas12", slug: "pve/naxxramas/gothik-the-harvester", cls:"naxxramas", text: t("warcraft:bosses.16060"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas13", slug: "pve/naxxramas/the-four-horsemen", cls:"naxxramas", text: t("warcraft:bosses.181366"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas14", slug: "pve/naxxramas/sapphiron", cls:"naxxramas", text: t("warcraft:bosses.15989"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidnaxxramas15", slug: "pve/naxxramas/kel-thuzad", cls:"naxxramas", text: t("warcraft:bosses.15990"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidzulgurub", slug: "pve/zul-gurub", cls:"zulgurub", text: t("warcraft:zones.1977"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub2", slug: "pve/zul-gurub/high-priestess-jeklik", cls:"zulgurub", text: t("warcraft:bosses.14517"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub1", slug: "pve/zul-gurub/high-priest-venoxis", cls:"zulgurub", text: t("warcraft:bosses.14507"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub3", slug: "pve/zul-gurub/high-priestess-mar-li", cls:"zulgurub", text: t("warcraft:bosses.14510"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub6", slug: "pve/zul-gurub/bloodlord-mandokir", cls:"zulgurub", text: t("warcraft:bosses.11382"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub7", slug: "pve/zul-gurub/edge-of-madness", cls:"zulgurub", text: t("warcraft:bosses.15083"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub4", slug: "pve/zul-gurub/high-priest-thekal", cls:"zulgurub", text: t("warcraft:bosses.14509"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub8", slug: "pve/zul-gurub/gahzranka", cls:"zulgurub", text: t("warcraft:bosses.15114"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub5", slug: "pve/zul-gurub/high-priestess-arlokk", cls:"zulgurub", text: t("warcraft:bosses.14515"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub9", slug: "pve/zul-gurub/jindo-the-hexer", cls:"zulgurub", text: t("warcraft:bosses.11380"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidzulgurub10", slug: "pve/zul-gurub/hakkar", cls:"zulgurub", text: t("warcraft:bosses.14834"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},

      {id: "raidruinsaq", slug: "pve/ruins-of-ahn-qiraj", cls:"aq20", text: t("warcraft:zones.3429"), root: true, prime: false, "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq1", slug: "pve/ruins-of-ahn-qiraj/kurinaxx", cls:"aq20", text: t("warcraft:bosses.15348"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq2", slug: "pve/ruins-of-ahn-qiraj/general-rajaxx", cls:"aq20", text: t("warcraft:bosses.15341"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq3", slug: "pve/ruins-of-ahn-qiraj/moam", cls:"aq20", text: t("warcraft:bosses.15340"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq4", slug: "pve/ruins-of-ahn-qiraj/buru-the-gorger", cls:"aq20", text: t("warcraft:bosses.15370"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq5", slug: "pve/ruins-of-ahn-qiraj/ayamiss-the-hunter", cls:"aq20", text: t("warcraft:bosses.15369"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
      {id: "raidruinsaq6", slug: "pve/ruins-of-ahn-qiraj/ossirian-the-unscarred", cls:"aq20", text: t("warcraft:bosses.15339"), "CLASSIC-WEAKAURA": true, WEAKAURA: true, classic: true},
    ]
    // add sortVal
    for (var i = 0; i < cats.length; i++) {
      cats[i].sortVal = i
    }
    return cats
  },

  // match category by ID
  match: function (catID, t) {
    var matched = {}
    this.categories(t).forEach((cat) => {
      if (catID == cat.id) {
        matched = cat
      }
    })
    return matched
  },

  // find category by searching id, localized text or url slug
  search: function (str, t, idPrefix) {
    if (!t) {
      t = window.i18next.t
    }

    var findStr = normalize(str)

    var cats = this.categories(t) // search translated text
    var _cats = this.categories() // search i8n codes
    for (var i=0; i<cats.length; i++) {
      if (normalize(cats[i].id) === findStr || normalize(cats[i].text) === findStr || normalize(_cats[i].text) === findStr || normalize(cats[i].slug) === findStr) {
        if (!idPrefix || cats[i].id.match(new RegExp('^' + idPrefix))) {
          cats[i].text = t(cats[i].text)
          return cats[i]
        }
      }
    }
    if (str.match(/\./) && !str.match(/warcraft:/)) {
      return this.search('warcraft:'+str, t)
    }
    return false
  },

  findMDTSeason: function (a1, a2, a3, a4) {
    var cats = this.categories()
    if (parseInt(a1)) {
      a1 = 'mdtaffix' + a1
    }
    if (parseInt(a2)) {
      a2 = 'mdtaffix' + a2
    }
    if (parseInt(a3)) {
      a3 = 'mdtaffix' + a3
    }
    if (parseInt(a4)) {
      a4 = 'mdtaffix' + a4
    }
    for (var i=0; i<cats.length; i++) {
      if (!cats[i].contains) {
        continue
      }
      if (cats[i].contains.indexOf(a1) >= 0 && cats[i].contains.indexOf(a2) >= 0 && cats[i].contains.indexOf(a3) >= 0 && cats[i].contains.indexOf(a4) >= 0) {
        try {
          return cats[i].id.match(/mdtaffix-(\w+-s\d+)-/)[1]
        }
        catch (e) {
        }
      }
    }
    return null
  },

  getMDTAffixOptions: function (season) {
    var cats = this.categories()
    var regex = new RegExp('^mdtaffix-' + season + '-')
    var opts = []
    for (var i=0; i<cats.length; i++) {
      if (!cats[i].contains || !cats[i].id.match(regex)) {
        continue
      }
      opts.push(cats[i].contains.map((x) => {
        return parseInt(x.replace(/[^\d]/g, ''))
      }))
    }
    return opts
  },

  // make list of classes, then sort them alphabetically for the current locale, then get specs and return
  classCategories: function (t, addon, game) {
    var cats = this.categories(t)
    var classes = []
    cats.forEach((cat, key) => {
      if (cat.root && cat.id.match(/^cl\d/) && (!addon || cat[addon]) && (!game || cat[game])) {
        classes.push(cat)
      }
    })
    cats.sort(function (a, b) {
      if (a.text < b.text) {
        return -1
      }
      else {
        return 1
      }
    })
    classes.forEach((cls, k) => {
      cls.specs = []
      cats.forEach((cat) => {
        if (cat.id !== cls.id && (cat.id).indexOf(cls.id + '-') === 0 && (!addon || cat[addon]) && (!game || cat[game])) {
          classes[k].specs = classes[k].specs || []
          classes[k].specs.push(cat)
        }
      })
    })
    return classes
  },

  raidCategories: function (zones, t) {
    var cats = this.categories(t)
    var raids = []
    zones.forEach((zone) => {
      cats.forEach((cat) => {
        if (zone == cat.id) {
          raids.push(cat)
        }
      })
    })

    raids.forEach((raid, k) => {
      raids[k].bosses = []
      cats.forEach((cat) => {
        if (cat.id !== raid.id && cat.id.indexOf(raid.id) === 0) {
          raids[k].bosses.push(cat)
        }
      })
    })
    return raids
  },

  professionCategories: function (t, addon, game) {
    var gathering = this.getCategories(['prof1'], t)[0]
    var crafting = this.getCategories(['prof5'], t)[0]
    var secondary = this.getCategories(['prof14'], t)[0]

    gathering.specs = this.getCategories(['prof2', 'prof3', 'prof4'], t, null, addon, game)
    crafting.specs = this.getCategories(['prof6', 'prof7', 'prof8', 'prof9', 'prof10', 'prof11', 'prof12', 'prof13'], t, null, addon, game)
    secondary.specs = this.getCategories(['prof15', 'prof16', 'prof17', 'prof18'], t, null, addon, game)

    return [crafting, gathering, secondary]
  },

  rootCategories: function (t, type, addon) {
    var roots = []
    if (type === 'WEAKAURAS2') {
      type = 'WEAKAURA'
    }
    console.log(addon)
    this.categories(t).forEach((cat) => {
      if (cat.root && (!type || cat[type]) && !cat.noselect && (!addon || cat[addon])) {
        roots.push(cat)
      }
    })
    return roots
  },

  validateCategories: function (cats) {
    var valid = []
    var path = ''
    for (var i = 0; i < cats.length; i++) {
      var cat = this.getCategory(cats[i])[0]
      // if not a valid category object then skip it
      if (!cat || !cat.id) {
        continue
      }

      // category is valid, add both it and its root to valid[]
      valid.push(cat.id)
      if (!cat.root && !cat.systemtag) {
        var root = this.getRoot(cat)
        if (!root.systemtag) { // to account for snippet parent
          valid.push(root.id)
        }
      }
    }
    // valid is now an array of strings, remove duplicates, sort, and return
    valid = valid.filter(filterArrayUnique)
    valid.sort((a, b) => {
      var oA = this.getCategory(a)[0]
      var oB = this.getCategory(b)[0]
      return oA.sortVal - oB.sortVal
    })
    return valid
  },


  filterSystemTags: function (cats) {
    var systemTags = []
    this.categories().forEach((cat) => {
      if (cats.indexOf(cat.id) > -1 && cat.systemtag) {
        systemTags.push(cat.id)
      }
    })
    return systemTags
  },

  getChildren: function (parent, type, t, addon) {
    var children = []
    // build regex
    var re = new RegExp(parent.slug.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '/[^/]+$')
    this.categories(t).forEach((cat) => {
      if (re.exec(cat.slug) && parent.id !== cat.id && !cat.systemtag && (!type || cat[type]) && (!addon || cat[addon])) {
        children.push(cat)
      }
    })
    return children
  },

  getCategory: function (id, t, addon, game) {
    return this.getCategories([id], t, null, addon, game)
  },

  getCategories: function (ids, t, doNotSortAlpha, addon, game) {
    var cats = this.categories(t)
    var selected = []
    ids.forEach((c) => {
      cats.forEach((cat) => {
        if (c instanceof RegExp && cat.id.match(c) && (!addon || cat[addon]) && (!game || cat[game])) {
          selected.push(cat)
        }
        else if (c == cat.id && (!addon || cat[addon]) && (!game || cat[game])) {
          selected.push(cat)
        }
      })
    })

    if (!doNotSortAlpha) {
      selected.sort(function (a, b) {
        var testA = a.text
        var testB = b.text
        if (a.cls === 'affixes') {
          testA = testA.replace(/\s(\d):/, ' 0$1:')
        }
        if (b.cls === 'affixes') {
          testB = testB.replace(/\s(\d):/, ' 0$1:')
        }
        if (testA < testB) {
          return -1
        }
        else {
          return 1
        }
      })
    }
    return selected
  },

  // returns array of all ids where the text matches the text of the given id
  getClones: function(id, addon) {
    const base = this.getCategory(id, null)[0]
    if (!base) {
      return []
    }

    const cats = this.categories(false)
    var clones = []
    cats.forEach((cat) => {
      if (cat.text === base.text && (!addon || cat[addon])) {
        clones.push(cat.id)
      }
    })
    return clones
  },

  getRoot: function (cat) {
    var cats = this.categories()
    for (var i = 0; i < cats.length; i++) {
      if (cat.slug.indexOf(cats[i].slug) === 0) {
        return cats[i]
      }
    }
    return false
  },

  groupSets: function (cats) {
    var groups = []
    var current = []
    cats.forEach((cat) => {
      if (cat.systemtag) {
        return
      }
      if (cat.root) {
        if (current.length > 0) {
          groups.push(current)
        }
        current = []
      }
      current.push(cat)
    })
    if (current.length > 0) {
      groups.push(current)
    }
    return groups
  },

  relevanceScores: function (cats) {
    var scores = {
      standard: 0,
      strict: 0
    }
    for (var i = 0; i < cats.length; i++) {
      var cat = this.getCategory(cats[i])
      if (!cat || !cat[0]) {
        continue
      }
      scores.strict++
      if (cat[0].root) {
        scores.standard++
      }
    }
    return scores
  }
}

function filterArrayUnique(value, index, self) {
  return self.indexOf(value) === index;
}