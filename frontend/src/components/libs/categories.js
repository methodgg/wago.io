module.exports = {
  categories: function (t) {
    if (!t) {
      t = (s) => {
        return s
      }
    }
    var cats = [
      // {id: "cl0", slug: "classes", cls:"", text: t("Classes"), noselect: true, WEAKAURA: true, ELVUI: true, VUHDO: true},
      {id: "cl6", slug: "classes/death-knight", cls:"cl-deathknight", text: t("warcraft:classes.6"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl6-1", slug: "classes/death-knight/blood", cls:"cl-deathknight", text: t("warcraft:classes.6-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl6-2", slug: "classes/death-knight/frost", cls:"cl-deathknight", text: t("warcraft:classes.6-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl6-3", slug: "classes/death-knight/unholy", cls:"cl-deathknight", text: t("warcraft:classes.6-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl12", slug: "classes/demon-hunter", cls:"cl-demonhunter", text: t("warcraft:classes.12"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl12-1", slug: "classes/demon-hunter/havoc", cls:"cl-demonhunter", text: t("warcraft:classes.12-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl12-2", slug: "classes/demon-hunter/vengeance", cls:"cl-demonhunter", text: t("warcraft:classes.12-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl11", slug: "classes/druid", cls:"cl-druid", text: t("warcraft:classes.11"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl11-1", slug: "classes/druid/balance", cls:"cl-druid", text: t("warcraft:classes.11-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl11-2", slug: "classes/druid/feral", cls:"cl-druid", text: t("warcraft:classes.11-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl11-3", slug: "classes/druid/guardian", cls:"cl-druid", text: t("warcraft:classes.11-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl11-4", slug: "classes/druid/restoration", cls:"cl-druid", text: t("warcraft:classes.11-4"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl3", slug: "classes/hunter", cls:"cl-hunter", text: t("warcraft:classes.3"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl3-1", slug: "classes/hunter/beast-mastery", cls:"cl-hunter", text: t("warcraft:classes.3-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl3-2", slug: "classes/hunter/marksmanship", cls:"cl-hunter", text: t("warcraft:classes.3-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl3-3", slug: "classes/hunter/survival", cls:"cl-hunter", text: t("warcraft:classes.3-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl8", slug: "classes/mage", cls:"cl-mage", text: t("warcraft:classes.8"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl8-1", slug: "classes/mage/arcane", cls:"cl-mage", text: t("warcraft:classes.8-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl8-2", slug: "classes/mage/fire", cls:"cl-mage", text: t("warcraft:classes.8-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl8-3", slug: "classes/mage/frost", cls:"cl-mage", text: t("warcraft:classes.8-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl10", slug: "classes/monk", cls:"cl-monk", text: t("warcraft:classes.10"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl10-1", slug: "classes/monk/brewmaster", cls:"cl-monk", text: t("warcraft:classes.10-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl10-2", slug: "classes/monk/mistweaver", cls:"cl-monk", text: t("warcraft:classes.10-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl10-3", slug: "classes/monk/windwalker", cls:"cl-monk", text: t("warcraft:classes.10-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl2", slug: "classes/paladin", cls:"cl-paladin", text: t("warcraft:classes.2"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl2-1", slug: "classes/paladin/holy", cls:"cl-paladin", text: t("warcraft:classes.2-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl2-2", slug: "classes/paladin/protection", cls:"cl-paladin", text: t("warcraft:classes.2-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl2-3", slug: "classes/paladin/retribution", cls:"cl-paladin", text: t("warcraft:classes.2-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl5", slug: "classes/priest", cls:"cl-priest", text: t("warcraft:classes.5"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl5-1", slug: "classes/priest/discipline", cls:"cl-priest", text: t("warcraft:classes.5-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl5-2", slug: "classes/priest/holy", cls:"cl-priest", text: t("warcraft:classes.5-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl5-3", slug: "classes/priest/shadow", cls:"cl-priest", text: t("warcraft:classes.5-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl4", slug: "classes/rogue", cls:"cl-rogue", text: t("warcraft:classes.4"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl4-1", slug: "classes/rogue/assassination", cls:"cl-rogue", text: t("warcraft:classes.4-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl4-2", slug: "classes/rogue/outlaw", cls:"cl-rogue", text: t("warcraft:classes.4-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl4-3", slug: "classes/rogue/subtlety", cls:"cl-rogue", text: t("warcraft:classes.4-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl7", slug: "classes/shaman", cls:"cl-shaman", text: t("warcraft:classes.7"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl7-1", slug: "classes/shaman/elemental", cls:"cl-shaman", text: t("warcraft:classes.7-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl7-2", slug: "classes/shaman/enhancement", cls:"cl-shaman", text: t("warcraft:classes.7-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl7-3", slug: "classes/shaman/restoration", cls:"cl-shaman", text: t("warcraft:classes.7-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl9", slug: "classes/warlock", cls:"cl-warlock", text: t("warcraft:classes.9"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl9-1", slug: "classes/warlock/affliction", cls:"cl-warlock", text: t("warcraft:classes.9-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl9-2", slug: "classes/warlock/demonology", cls:"cl-warlock", text: t("warcraft:classes.9-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl9-3", slug: "classes/warlock/destruction", cls:"cl-warlock", text: t("warcraft:classes.9-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "cl1", slug: "classes/warrior", cls:"cl-warrior", text: t("warcraft:classes.1"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl1-1", slug: "classes/warrior/arms", cls:"cl-warrior", text: t("warcraft:classes.1-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl1-2", slug: "classes/warrior/fury", cls:"cl-warrior", text: t("warcraft:classes.1-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "cl1-3", slug: "classes/warrior/protection", cls:"cl-warrior", text: t("warcraft:classes.1-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "gen0", slug: "general", cls:"misc", text: t("General"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "gen7", slug: "general/achievements", cls:"misc", text: t("Achievements"), WEAKAURA: true, COLLECTION: true},
      {id: "gen2", slug: "general/questing", cls:"misc", text: t("Questing"), WEAKAURA: true, COLLECTION: true},
      {id: "gen6", slug: "general/non-combat", cls:"misc", text: t("Non-Combat"), WEAKAURA: true, COLLECTION: true},
      {id: "gen9", slug: "general/currency", cls:"misc", text: t("Currency"), WEAKAURA: true, COLLECTION: true},
      {id: "gen10", slug: "general/reputation", cls:"misc", text: t("Reputation"), WEAKAURA: true, COLLECTION: true},
      {id: "gen11", slug: "general/collectibles", cls:"misc", text: t("Collectibles"), WEAKAURA: true, COLLECTION: true},
      {id: "gen12", slug: "general/world-events", cls:"misc", text: t("World Events"), WEAKAURA: true, COLLECTION: true},
      {id: "gen8", slug: "general/world-events/holidays", cls:"misc", text: t("Holidays"), WEAKAURA: true, COLLECTION: true},
      {id: "gen13", slug: "general/world-events/darkmoon-faire", cls:"misc", text: t("Darkmoon Faire"), WEAKAURA: true, COLLECTION: true},
      {id: "gen14", slug: "general/world-events/brawlers-guild", cls:"misc", text: t("Brawler's Guild"), WEAKAURA: true, COLLECTION: true},
      {id: "gen15", slug: "general/pet-battles", cls:"misc", text: t("Pet Battles"), WEAKAURA: true, COLLECTION: true},
      {id: "gen16", slug: "general/warfronts", cls:"misc", text: t("Warfronts"), WEAKAURA: true, COLLECTION: true},
      {id: "gen17", slug: "general/island-expeditions", cls:"misc", text: t("Island Expeditions"), WEAKAURA: true, COLLECTION: true},
      
      {id: "equip", slug: "equipment", cls:"equip", text: t("Equipment"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "legen", slug: "equipment/legendaries", cls:"equip", text: t("Legendaries"), WEAKAURA: true, COLLECTION: true},
      {id: "equip1", slug: "equipment/trinkets", cls:"equip", text: t("Trinkets"), WEAKAURA: true, COLLECTION: true},
      {id: "equip2", slug: "equipment/item-enhancements", cls:"equip", text: t("Item Enhancements"), WEAKAURA: true, COLLECTION: true},
      {id: "equip3", slug: "equipment/azerite-traits", cls:"equip", text: t("Azerite Traits"), WEAKAURA: true, COLLECTION: true},
      
      {id: "mech", slug: "combat-mechanics", cls:"mechanics", text: t("Combat Mechanics"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "mech1", slug: "combat-mechanics/battle-resurrection", cls:"mechanics", text: t("Battle Resurrection"), WEAKAURA: true, COLLECTION: true},
      {id: "mech2", slug: "combat-mechanics/interrupts", cls:"mechanics", text: t("Interrupts"), WEAKAURA: true, COLLECTION: true},
      {id: "mech3", slug: "combat-mechanics/theorycrafting", cls:"mechanics", text: t("Theorycrafting"), WEAKAURA: true, COLLECTION: true},
      {id: "mech4", slug: "combat-mechanics/vehicles", cls:"mechanics", text: t("Vehicles"), WEAKAURA: true, COLLECTION: true},
      {id: "mech5", slug: "combat-mechanics/consumables", cls:"mechanics", text: t("Consumables"), WEAKAURA: true, COLLECTION: true},
      {id: "mech6", slug: "combat-mechanics/group-buffs", cls:"mechanics", text: t("Group Buffs"), WEAKAURA: true, COLLECTION: true},

      {id: "role0", slug: "class-roles", cls:"roles", text: t("Group Roles"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "role4", slug: "class-roles/raid-leading", cls:"roles", text: t("Raid Leading"), WEAKAURA: true, COLLECTION: true},
      {id: "role1", slug: "class-roles/damage-dealing", cls:"roles", text: t("Damage Dealing"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "role2", slug: "class-roles/healing", cls:"roles", text: t("Healing"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "role3", slug: "class-roles/tanking", cls:"roles", text: t("Tanking"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "vuhdo0", slug: "vuhdo", cls:"vuhdo", text: t("Vuhdo"), "systemtag": true, noselect: true, VUHDO: true},
      {id: "vuhdo1", slug: "vuhdo/vuhdo-profiles", cls:"vuhdo", text: t("Vuhdo Profiles"), "systemtag": true, VUHDO: true},
      {id: "vuhdo2", slug: "vuhdo/vuhdo-bouquets", cls:"vuhdo", text: t("Vuhdo Bouquets"), "systemtag": true, VUHDO: true},
      {id: "vuhdo3", slug: "vuhdo/vuhdo-key-layouts", cls:"vuhdo", text: t("Vuhdo Key Layouts"), "systemtag": true, VUHDO: true},

      {id: "totalrp0", slug: "totalrp", cls:"rpcampaign", text: t("Total RP3"), systemtag: true, noselect: true, TOTALRP3: true},
      {id: "totalrp1", slug: "totalrp/campaigns", cls:"rpcampaign", text: t("Campaigns"), root: true, TOTALRP3: true},
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
      
      {id: "raidcrucible", slug: "pve/crucible-of-storms", cls:"crucible", text: t("warcraft:zones.10057"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidcrucible1", slug: "pve/crucible-of-storms/the-restless-cabal", cls:"crucible", text: t("warcraft:bosses.146497"), WEAKAURA: true},
      {id: "raidcrucible2", slug: "pve/crucible-of-storms/uunat-harbinger-of-the-void", cls:"crucible", text: t("warcraft:bosses.145371"), WEAKAURA: true},
      
      {id: "raidzuldazar", slug: "pve/battle-of-zuldazar", cls:"zuldazar", text: t("warcraft:zones.10076"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidzuldazar1", slug: "pve/battle-of-zuldazar/frida-ironbellows", cls:"zuldazar", text: t("warcraft:bosses.144680"), WEAKAURA: true},
      {id: "raidzuldazar1b", slug: "pve/battle-of-zuldazar/ra-wani-kanae", cls:"zuldazar", text: t("warcraft:bosses.144683"), WEAKAURA: true},
      {id: "raidzuldazar2", slug: "pve/battle-of-zuldazar/grong-the-jungle-lord", cls:"zuldazar", text: t("warcraft:bosses.147268"), WEAKAURA: true},
      {id: "raidzuldazar2b", slug: "pve/battle-of-zuldazar/grong-the-revenant", cls:"zuldazar", text: t("warcraft:bosses.144638"), WEAKAURA: true},
      {id: "raidzuldazar3", slug: "pve/battle-of-zuldazar/flamefist-and-the-illuminated", cls:"zuldazar", text: t("warcraft:bosses.146099"), WEAKAURA: true},
      {id: "raidzuldazar3b", slug: "pve/battle-of-zuldazar/grimfang-and-firecaller", cls:"zuldazar", text: t("warcraft:bosses.144691"), WEAKAURA: true},
      {id: "raidzuldazar4", slug: "pve/battle-of-zuldazar/high-tinker-mekkatorque", cls:"zuldazar", text: t("warcraft:bosses.147589"), WEAKAURA: true},
      {id: "raidzuldazar4b", slug: "pve/battle-of-zuldazar/king-rastakhan", cls:"zuldazar", text: t("warcraft:bosses.139633"), WEAKAURA: true},
      {id: "raidzuldazar5", slug: "pve/battle-of-zuldazar/stormwall-blockade", cls:"zuldazar", text: t("warcraft:bosses.146256"), WEAKAURA: true},
      {id: "raidzuldazar6", slug: "pve/battle-of-zuldazar/conclave-of-the-chosen", cls:"zuldazar", text: t("warcraft:bosses.144747"), WEAKAURA: true},
      {id: "raidzuldazar7", slug: "pve/battle-of-zuldazar/opulence", cls:"zuldazar", text: t("warcraft:bosses.147564"), WEAKAURA: true},
      {id: "raidzuldazar8", slug: "pve/battle-of-zuldazar/jaina-proudmoore", cls:"zuldazar", text: t("warcraft:bosses.JAINA"), WEAKAURA: true},

      {id: "raiduldir", slug: "pve/uldir", cls:"uldir", text: t("warcraft:zones.9389"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "raiduldir1", slug: "pve/uldir/taloc-the-corrupted", cls:"uldir", text: t("warcraft:bosses.137119"), WEAKAURA: true},
      {id: "raiduldir2", slug: "pve/uldir/mother", cls:"uldir", text: t("warcraft:bosses.140853"), WEAKAURA: true},
      {id: "raiduldir3", slug: "pve/uldir/fetid-devourer", cls:"uldir", text: t("warcraft:bosses.133298"), WEAKAURA: true},
      {id: "raiduldir4", slug: "pve/uldir/zekvoz-herald-of-nzoth", cls:"uldir", text: t("warcraft:bosses.134445"), WEAKAURA: true},
      {id: "raiduldir5", slug: "pve/uldir/zul-reborn", cls:"uldir", text: t("warcraft:bosses.138967"), WEAKAURA: true},
      {id: "raiduldir6", slug: "pve/uldir/mythrax-the-unraveler", cls:"uldir", text: t("warcraft:bosses.136383"), WEAKAURA: true},
      {id: "raiduldir7", slug: "pve/uldir/vectis", cls:"uldir", text: t("warcraft:bosses.134442"), WEAKAURA: true},
      {id: "raiduldir8", slug: "pve/uldir/ghuun", cls:"uldir", text: t("warcraft:bosses.132998"), WEAKAURA: true},

      {id: "raidantorus", slug: "pve/antorus-the-burning-throne", cls:"antorus", text: t("warcraft:zones.8638"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidantorus1", slug: "pve/antorus-the-burning-throne/garothi-worldbreaker", cls:"antorus", text: t("warcraft:bosses.123371"), WEAKAURA: true},
      {id: "raidantorus2", slug: "pve/antorus-the-burning-throne/hounds-of-sargeras", cls:"antorus", text: t("warcraft:bosses.126915"), WEAKAURA: true},
      {id: "raidantorus3", slug: "pve/antorus-the-burning-throne/antoran-high-command", cls:"antorus", text: t("warcraft:bosses.122367"), WEAKAURA: true},
      {id: "raidantorus4", slug: "pve/antorus-the-burning-throne/portal-keeper-hasabel", cls:"antorus", text: t("warcraft:bosses.124393"), WEAKAURA: true},
      {id: "raidantorus5", slug: "pve/antorus-the-burning-throne/eonar-the-lifebender", cls:"antorus", text: t("warcraft:bosses.125562"), WEAKAURA: true},
      {id: "raidantorus6", slug: "pve/antorus-the-burning-throne/imonar-the-soulhunter", cls:"antorus", text: t("warcraft:bosses.125055"), WEAKAURA: true},
      {id: "raidantorus7", slug: "pve/antorus-the-burning-throne/kingaroth", cls:"antorus", text: t("warcraft:bosses.125050"), WEAKAURA: true},
      {id: "raidantorus8", slug: "pve/antorus-the-burning-throne/varimathras", cls:"antorus", text: t("warcraft:bosses.125075"), WEAKAURA: true},
      {id: "raidantorus9", slug: "pve/antorus-the-burning-throne/the-coven-of-shivarra", cls:"antorus", text: t("warcraft:bosses.122468"), WEAKAURA: true},
      {id: "raidantorus10", slug: "pve/antorus-the-burning-throne/aggramar", cls:"antorus", text: t("warcraft:bosses.124691"), WEAKAURA: true},
      {id: "raidantorus11", slug: "pve/antorus-the-burning-throne/argus-the-unmaker", cls:"antorus", text: t("warcraft:bosses.124828"), WEAKAURA: true},

      {id: "raidtomb", slug: "pve/tomb-of-sargeras", cls:"tombofsargeras", text: t("warcraft:zones.8524"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidtomb1", slug: "pve/tomb-of-sargeras/goroth", cls:"tombofsargeras", text: t("warcraft:bosses.115844"), WEAKAURA: true},
      {id: "raidtomb2", slug: "pve/tomb-of-sargeras/demonic-inquisition", cls:"tombofsargeras", text: t("warcraft:bosses.116689"), WEAKAURA: true},
      {id: "raidtomb3", slug: "pve/tomb-of-sargeras/harjatan-the-bludger", cls:"tombofsargeras", text: t("warcraft:bosses.116407"), WEAKAURA: true},
      {id: "raidtomb4", slug: "pve/tomb-of-sargeras/mistress-sasszine", cls:"tombofsargeras", text: t("warcraft:bosses.115767"), WEAKAURA: true},
      {id: "raidtomb5", slug: "pve/tomb-of-sargeras/sisters-of-the-moon", cls:"tombofsargeras", text: t("warcraft:bosses.118523"), WEAKAURA: true},
      {id: "raidtomb6", slug: "pve/tomb-of-sargeras/the-desolate-host", cls:"tombofsargeras", text: t("warcraft:bosses.118460"), WEAKAURA: true},
      {id: "raidtomb7", slug: "pve/tomb-of-sargeras/maiden-of-vigilance", cls:"tombofsargeras", text: t("warcraft:bosses.118289"), WEAKAURA: true},
      {id: "raidtomb8", slug: "pve/tomb-of-sargeras/fallen-avatar", cls:"tombofsargeras", text: t("warcraft:bosses.116939"), WEAKAURA: true},
      {id: "raidtomb9", slug: "pve/tomb-of-sargeras/kiljaeden", cls:"tombofsargeras", text: t("warcraft:bosses.117269"), WEAKAURA: true},

      {id: "raidnh", slug: "pve/nighthold", cls:"nighthold", text: t("warcraft:zones.8025"), WEAKAURA: true, COLLECTION: true},
      {id: "raidnh1", slug: "pve/nighthold/skorpyron", cls:"nighthold", text: t("warcraft:bosses.102263"), WEAKAURA: true},
      {id: "raidnh2", slug: "pve/nighthold/chronomatic-anomaly", cls:"nighthold", text: t("warcraft:bosses.104415"), WEAKAURA: true},
      {id: "raidnh3", slug: "pve/nighthold/trilliax", cls:"nighthold", text: t("warcraft:bosses.104288"), WEAKAURA: true},
      {id: "raidnh4", slug: "pve/nighthold/spellblade-aluriel", cls:"nighthold", text: t("warcraft:bosses.107699"), WEAKAURA: true},
      {id: "raidnh5", slug: "pve/nighthold/tichondrius", cls:"nighthold", text: t("warcraft:bosses.103685"), WEAKAURA: true},
      {id: "raidnh6", slug: "pve/nighthold/krosus", cls:"nighthold", text: t("warcraft:bosses.101002"), WEAKAURA: true},
      {id: "raidnh7", slug: "pve/nighthold/high-botanist-telarn", cls:"nighthold", text: t("warcraft:bosses.104528"), WEAKAURA: true},
      {id: "raidnh8", slug: "pve/nighthold/star-augur-etraeus", cls:"nighthold", text: t("warcraft:bosses.103758"), WEAKAURA: true},
      {id: "raidnh9", slug: "pve/nighthold/grand-magistrix-elisande", cls:"nighthold", text: t("warcraft:bosses.110965"), WEAKAURA: true},
      {id: "raidnh10", slug: "pve/nighthold/guldan", cls:"nighthold", text: t("warcraft:bosses.105503"), WEAKAURA: true},

      {id: "dungeon", slug: "pve/dungeons", cls:"dungeon", text: t("Legion Dungeons"), noselect: true, root: true, WEAKAURA: true, COLLECTION: true},
      {id: "dungeon3", slug: "pve/dungeons/arcway", cls:"dungeon", text: t("warcraft:zones.7855"), WEAKAURA: true},
      {id: "dungeon1", slug: "pve/dungeons/assault-on-violet-hold", cls:"dungeon", text: t("warcraft:zones.7996"), WEAKAURA: true},
      {id: "dungeon4", slug: "pve/dungeons/blackrook-hold", cls:"dungeon", text: t("warcraft:zones.7805"), WEAKAURA: true},
      {id: "dungeon12", slug: "pve/dungeons/cathedral-of-eternal-night", cls:"dungeon", text: t("warcraft:zones.8527"), WEAKAURA: true},
      {id: "dungeon2", slug: "pve/dungeons/court-of-stars", cls:"dungeon", text: t("warcraft:zones.8079"), WEAKAURA: true},
      {id: "dungeon5", slug: "pve/dungeons/darkheart-thicket", cls:"dungeon", text: t("warcraft:zones.7673"), WEAKAURA: true},
      {id: "dungeon6", slug: "pve/dungeons/eye-of-azshara", cls:"dungeon", text: t("warcraft:zones.8040"), WEAKAURA: true},
      {id: "dungeon7", slug: "pve/dungeons/halls-of-valor", cls:"dungeon", text: t("warcraft:zones.7672"), WEAKAURA: true},
      {id: "dungeon8", slug: "pve/dungeons/maw-of-souls", cls:"dungeon", text: t("warcraft:zones.7812"), WEAKAURA: true},
      {id: "dungeon9", slug: "pve/dungeons/neltharions-lair", cls:"dungeon", text: t("warcraft:zones.7546"), WEAKAURA: true},
      {id: "dungeon11", slug: "pve/dungeons/return-to-karazhan", cls:"dungeon", text: t("warcraft:zones.8443"), WEAKAURA: true},  
      {id: "dungeon13", slug: "pve/dungeons/seat-of-the-triumvirate", cls:"dungeon", text: t("warcraft:zones.8910"), WEAKAURA: true},
      {id: "dungeon10", slug: "pve/dungeons/vault-of-the-wardens", cls:"dungeon", text: t("warcraft:zones.7787"), WEAKAURA: true},

      {id: "bfadungeon", slug: "pve/bfa-dungeons", cls:"dungeon", text: t("Dungeons"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "bfadungeon1", slug: "pve/bfa-dungeons/atal-dazar", cls:"dungeon", text: t("warcraft:zones.9028"), WEAKAURA: true},
      {id: "bfadungeon2", slug: "pve/bfa-dungeons/freehold", cls:"dungeon", text: t("warcraft:zones.9164"), WEAKAURA: true},
      {id: "bfadungeon3", slug: "pve/bfa-dungeons/kings-rest", cls:"dungeon", text: t("warcraft:zones.9526"), WEAKAURA: true},
      {id: "bfadungeon4", slug: "pve/bfa-dungeons/shrine-of-the-storm", cls:"dungeon", text: t("warcraft:zones.9525"), WEAKAURA: true},
      {id: "bfadungeon5", slug: "pve/bfa-dungeons/siege-of-boralus", cls:"dungeon", text: t("warcraft:zones.9354"), WEAKAURA: true},
      {id: "bfadungeon6", slug: "pve/bfa-dungeons/temple-of-sethraliss", cls:"dungeon", text: t("warcraft:zones.9527"), WEAKAURA: true},
      {id: "bfadungeon7", slug: "pve/bfa-dungeons/the-motherlode", cls:"dungeon", text: t("warcraft:zones.8064"), WEAKAURA: true},
      {id: "bfadungeon8", slug: "pve/bfa-dungeons/the-underrot", cls:"dungeon", text: t("warcraft:zones.9391"), WEAKAURA: true},
      {id: "bfadungeon9", slug: "pve/bfa-dungeons/tol-dagor", cls:"dungeon", text: t("warcraft:zones.9327"), WEAKAURA: true},
      {id: "bfadungeon10", slug: "pve/bfa-dungeons/waycrest-manor", cls:"dungeon", text: t("warcraft:zones.9424"), WEAKAURA: true},

      // {id: "pvp", slug: "pvp", cls:"pvp", text: t("PvP"), noselect: true, WEAKAURA: true},

      {id: "arena", slug: "pvp/arena", cls:"pvp-arena", text: t("Arena"), root: true, WEAKAURA: true, COLLECTION: true},
      // {id: "arena1", slug: "pvp/arena/blades-edge", cls:"pvp-arena", text: t("Blade's Edge Arena"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena2", slug: "pvp/arena/blackrook-hold", cls:"pvp-arena", text: t("Blackrook Hold"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena3", slug: "pvp/arena/dalaran", cls:"pvp-arena", text: t("Dalaran Arena"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena4", slug: "pvp/arena/nagrand", cls:"pvp-arena", text: t("Nagrand Arena"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena5", slug: "pvp/arena/ruins-of-lordaeron", cls:"pvp-arena", text: t("Ruins of Lordaeron"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena6", slug: "pvp/arena/tigers-peak", cls:"pvp-arena", text: t("The Tiger's Peak"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena7", slug: "pvp/arena/ring-of-valor", cls:"pvp-arena", text: t("The Ring of Valor"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena8", slug: "pvp/arena/tolviron", cls:"pvp-arena", text: t("Tol'viron Arena"), WEAKAURA: true, "hideFromMenu": true},
      // {id: "arena9", slug: "pvp/arena/valsharah", cls:"pvp-arena", text: t("Val'sharah Arena"), WEAKAURA: true, "hideFromMenu": true},

      {id: "bg", slug: "pvp/battlegrounds", cls:"pvp-battleground", text: t("Battlegrounds"), root: true, WEAKAURA: true, COLLECTION: true},
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

      {id: "wpvp", slug: "pvp/world-pvp", cls:"pvp-world", text: t("World PvP"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "wpvp1", slug: "pvp/duels", cls:"pvp-world", text: t("Duels"), WEAKAURA: true},
      
      // {id: "prof0", slug: "professions", cls:"prof", text: t("Professions"), noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "prof1", slug: "professions/gathering", cls:"prof-gathering", text: t("Gathering Professions"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "prof2", slug: "professions/gathering/herbalism", cls:"prof-gathering", text: t("warcraft:professions.herbalism"), WEAKAURA: true},
      {id: "prof3", slug: "professions/gathering/mining", cls:"prof-gathering", text: t("warcraft:professions.mining"), WEAKAURA: true},
      {id: "prof4", slug: "professions/gathering/skinning", cls:"prof-gathering", text: t("warcraft:professions.skinning"), WEAKAURA: true},
      {id: "prof5", slug: "professions/crafting", cls:"prof-crafting", text: t("Crafting Professions"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "prof6", slug: "professions/crafting/alchemy", cls:"prof-crafting", text: t("warcraft:professions.alchemy"), WEAKAURA: true},
      {id: "prof7", slug: "professions/crafting/blacksmithing", cls:"prof-crafting", text: t("warcraft:professions.blacksmith"), WEAKAURA: true},
      {id: "prof8", slug: "professions/crafting/enchanting", cls:"prof-crafting", text: t("warcraft:professions.enchanting"), WEAKAURA: true},
      {id: "prof9", slug: "professions/crafting/engineering", cls:"prof-crafting", text: t("warcraft:professions.engineering"), WEAKAURA: true},
      {id: "prof10", slug: "professions/crafting/inscription", cls:"prof-crafting", text: t("warcraft:professions.inscription"), WEAKAURA: true},
      {id: "prof11", slug: "professions/crafting/jewelcrafting", cls:"prof-crafting", text: t("warcraft:professions.jewelcrafting"), WEAKAURA: true},
      {id: "prof12", slug: "professions/crafting/leatherworking", cls:"prof-crafting", text: t("warcraft:professions.leatherworking"), WEAKAURA: true},
      {id: "prof13", slug: "professions/crafting/tailoring", cls:"prof-crafting", text: t("warcraft:professions.tailoring"), WEAKAURA: true},
      {id: "prof14", slug: "professions/secondary", cls:"prof-secondary", text: t("Secondary Professions"), root: true, WEAKAURA: true, COLLECTION: true},
      {id: "prof15", slug: "professions/secondary/archeology", cls:"prof-secondary", text: t("warcraft:professions.archeology"), WEAKAURA: true},
      {id: "prof16", slug: "professions/secondary/cooking", cls:"prof-secondary", text: t("warcraft:professions.cooking"), WEAKAURA: true},
      {id: "prof17", slug: "professions/secondary/first-aid", cls:"prof-secondary", text: t("warcraft:professions.firstaid"), WEAKAURA: true},
      {id: "prof18", slug: "professions/secondary/fishing", cls:"prof-secondary", text: t("warcraft:professions.fishing"), WEAKAURA: true},

      {id: "oldraids", slug: "pve/legacy", cls:"", text: t("Legacy Content"), "menucol": 5, noselect: true},

      {id: "raiden", slug: "pve/emerald-nightmare", cls:"emeraldnightmare", text: t("warcraft:zones.8026"), noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "raiden1", slug: "pve/emerald-nightmare/nythendra", cls:"emeraldnightmare", text: t("warcraft:bosses.103160"), noselect: true, WEAKAURA: true},
      {id: "raiden2", slug: "pve/emerald-nightmare/ilgynoth", cls:"emeraldnightmare", text: t("warcraft:bosses.105393"), noselect: true, WEAKAURA: true},
      {id: "raiden4", slug: "pve/emerald-nightmare/elerethe-renferal", cls:"emeraldnightmare", text: t("warcraft:bosses.111000"), noselect: true, WEAKAURA: true},
      {id: "raiden5", slug: "pve/emerald-nightmare/ursoc", cls:"emeraldnightmare", text: t("warcraft:bosses.100497"), noselect: true, WEAKAURA: true},
      {id: "raiden6", slug: "pve/emerald-nightmare/dragons-of-nightmare", cls:"emeraldnightmare", text: t("warcraft:bosses.102679"), noselect: true, WEAKAURA: true},
      {id: "raiden7", slug: "pve/emerald-nightmare/cenarius", cls:"emeraldnightmare", text: t("warcraft:bosses.113534"), noselect: true, WEAKAURA: true},
      {id: "raiden8", slug: "pve/emerald-nightmare/xavius", cls:"emeraldnightmare", text: t("warcraft:bosses.103769"), noselect: true, WEAKAURA: true},

      {id: "raidtov", slug: "pve/trial-of-valor", cls:"trialofvalor", text: t("warcraft:zones.8440"), noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "raidtov1", slug: "pve/trial-of-valor/odyn", cls:"trialofvalor", text: t("warcraft:bosses.115323"), noselect: true, WEAKAURA: true},
      {id: "raidtov2", slug: "pve/trial-of-valor/guarm", cls:"trialofvalor", text: t("warcraft:bosses.114344"), noselect: true, WEAKAURA: true},
      {id: "raidtov3", slug: "pve/trial-of-valor/helya", cls:"trialofvalor", text: t("warcraft:bosses.115323"), noselect: true, WEAKAURA: true},

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

      {id: "gen5", slug: "development", cls:"development", text: t("Development"), root: true, noselect: true, WEAKAURA: true, COLLECTION: true},
      {id: "gen3", slug: "development/testing", cls:"development", text: t("Testing"), WEAKAURA: true, COLLECTION: true},
      {id: "gen4", slug: "development/wa-training", cls:"development", text: t("WA Training"), WEAKAURA: true, COLLECTION: true},
      {id: "beta2", slug: "development/legion-ptr7.2", cls:"development", text: t("Legion 7.2 PTR"), noselect: true, "systemtag": true, WEAKAURA: true},

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
      {id: "mdtdun17", slug: "pve/dungeons/kings-rest", cls:"dungeon", text: t("warcraft:zones.9526"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun18", slug: "pve/dungeons/shrine-of-the-storm", cls:"dungeon", text: t("warcraft:zones.9525"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun19", slug: "pve/dungeons/siege-of-boralus", cls:"dungeon", text: t("warcraft:zones.9354"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun20", slug: "pve/dungeons/temple-of-sethraliss", cls:"dungeon", text: t("warcraft:zones.9527"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun21", slug: "pve/dungeons/the-motherlode", cls:"dungeon", text: t("warcraft:zones.8064"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun22", slug: "pve/dungeons/the-underrot", cls:"dungeon", text: t("warcraft:zones.9391"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun23", slug: "pve/dungeons/tol-dagor", cls:"dungeon", text: t("warcraft:zones.9327"), MDT: true, systemtag: true, noselect: true},
      {id: "mdtdun24", slug: "pve/dungeons/waycrest-manor", cls:"dungeon", text: t("warcraft:zones.9424"), MDT: true, systemtag: true, noselect: true},

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
      
      {id: "mdtaffix-bfa-s1-w1", slug: "affixes/week1", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Raging'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w2", slug: "affixes/week2", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Teeming'), affix2: t('Explosive'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w3", slug: "affixes/week3", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Bolstering'), affix2: t('Grievous'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w4", slug: "affixes/week4", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Sanguine'), affix2: t('Necrotic'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w5", slug: "affixes/week5", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Bursting'), affix2: t('Skittish'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w6", slug: "affixes/week6", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Teeming'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w7", slug: "affixes/week7", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Raging'), affix2: t('Necrotic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w8", slug: "affixes/week8", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Bolstering'), affix2: t('Skittish'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w9", slug: "affixes/week9", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Teeming'), affix2: t('Volcanic'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w10", slug: "affixes/week10", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Sanguine'), affix2: t('Grievous'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w11", slug: "affixes/week11", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Bolstering'), affix2: t('Explosive'), affix3: t('Tyrannical'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},
      {id: "mdtaffix-bfa-s1-w12", slug: "affixes/week12", cls:"affixes", text: t("[-affix1-] [-affix2-] [-affix3-] [-affix4-]", {affix1: t('Bursting'), affix2: t('Quaking'), affix3: t('Fortified'), affix4: t('Infested')}), MDT: true, systemtag: true, noselect: true},

      {id: "mdtspeed", slug: "speed", cls:"speed", text: t("Speed"), root: true, MDT: true, noselect: true },
      {id: "mdtspeed1", slug: "speed/easy-going", cls:"speed", text: t("Easy Going"), root: true, MDT: true },
      {id: "mdtspeed2", slug: "speed/gotta-go-fast", cls:"speed", text: t("Gotta Go Fast"), root: true, MDT: true },
      {id: "mdtspeed3", slug: "speed/racing-number-one", cls:"speed", text: t("Racing for #1"), root: true, MDT: true },

      {id: "mdtcl6", slug: "classes/death-knight", cls:"cl-deathknight", text: t("warcraft:classes.6"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl6-1", slug: "classes/death-knight/blood", cls:"cl-deathknight", text: t("warcraft:classes.6-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl6-2", slug: "classes/death-knight/frost", cls:"cl-deathknight", text: t("warcraft:classes.6-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl6-3", slug: "classes/death-knight/unholy", cls:"cl-deathknight", text: t("warcraft:classes.6-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl12", slug: "classes/demon-hunter", cls:"cl-demonhunter", text: t("warcraft:classes.12"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl12-1", slug: "classes/demon-hunter/havoc", cls:"cl-demonhunter", text: t("warcraft:classes.12-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl12-2", slug: "classes/demon-hunter/vengeance", cls:"cl-demonhunter", text: t("warcraft:classes.12-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl11", slug: "classes/druid", cls:"cl-druid", text: t("warcraft:classes.11"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl11-1", slug: "classes/druid/balance", cls:"cl-druid", text: t("warcraft:classes.11-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl11-2", slug: "classes/druid/feral", cls:"cl-druid", text: t("warcraft:classes.11-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl11-3", slug: "classes/druid/guardian", cls:"cl-druid", text: t("warcraft:classes.11-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl11-4", slug: "classes/druid/restoration", cls:"cl-druid", text: t("warcraft:classes.11-4"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl3", slug: "classes/hunter", cls:"cl-hunter", text: t("warcraft:classes.3"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl3-1", slug: "classes/hunter/beast-mastery", cls:"cl-hunter", text: t("warcraft:classes.3-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl3-2", slug: "classes/hunter/marksmanship", cls:"cl-hunter", text: t("warcraft:classes.3-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl3-3", slug: "classes/hunter/survival", cls:"cl-hunter", text: t("warcraft:classes.3-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl8", slug: "classes/mage", cls:"cl-mage", text: t("warcraft:classes.8"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl8-1", slug: "classes/mage/arcane", cls:"cl-mage", text: t("warcraft:classes.8-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl8-2", slug: "classes/mage/fire", cls:"cl-mage", text: t("warcraft:classes.8-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl8-3", slug: "classes/mage/frost", cls:"cl-mage", text: t("warcraft:classes.8-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl10", slug: "classes/monk", cls:"cl-monk", text: t("warcraft:classes.10"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl10-1", slug: "classes/monk/brewmaster", cls:"cl-monk", text: t("warcraft:classes.10-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl10-2", slug: "classes/monk/mistweaver", cls:"cl-monk", text: t("warcraft:classes.10-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl10-3", slug: "classes/monk/windwalker", cls:"cl-monk", text: t("warcraft:classes.10-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl2", slug: "classes/paladin", cls:"cl-paladin", text: t("warcraft:classes.2"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl2-1", slug: "classes/paladin/holy", cls:"cl-paladin", text: t("warcraft:classes.2-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl2-2", slug: "classes/paladin/protection", cls:"cl-paladin", text: t("warcraft:classes.2-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl2-3", slug: "classes/paladin/retribution", cls:"cl-paladin", text: t("warcraft:classes.2-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl5", slug: "classes/priest", cls:"cl-priest", text: t("warcraft:classes.5"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl5-1", slug: "classes/priest/discipline", cls:"cl-priest", text: t("warcraft:classes.5-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl5-2", slug: "classes/priest/holy", cls:"cl-priest", text: t("warcraft:classes.5-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl5-3", slug: "classes/priest/shadow", cls:"cl-priest", text: t("warcraft:classes.5-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl4", slug: "classes/rogue", cls:"cl-rogue", text: t("warcraft:classes.4"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl4-1", slug: "classes/rogue/assassination", cls:"cl-rogue", text: t("warcraft:classes.4-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl4-2", slug: "classes/rogue/outlaw", cls:"cl-rogue", text: t("warcraft:classes.4-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl4-3", slug: "classes/rogue/subtlety", cls:"cl-rogue", text: t("warcraft:classes.4-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl7", slug: "classes/shaman", cls:"cl-shaman", text: t("warcraft:classes.7"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl7-1", slug: "classes/shaman/elemental", cls:"cl-shaman", text: t("warcraft:classes.7-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl7-2", slug: "classes/shaman/enhancement", cls:"cl-shaman", text: t("warcraft:classes.7-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl7-3", slug: "classes/shaman/restoration", cls:"cl-shaman", text: t("warcraft:classes.7-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl9", slug: "classes/warlock", cls:"cl-warlock", text: t("warcraft:classes.9"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl9-1", slug: "classes/warlock/affliction", cls:"cl-warlock", text: t("warcraft:classes.9-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl9-2", slug: "classes/warlock/demonology", cls:"cl-warlock", text: t("warcraft:classes.9-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl9-3", slug: "classes/warlock/destruction", cls:"cl-warlock", text: t("warcraft:classes.9-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "mdtcl1", slug: "classes/warrior", cls:"cl-warrior", text: t("warcraft:classes.1"), root: true, WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl1-1", slug: "classes/warrior/arms", cls:"cl-warrior", text: t("warcraft:classes.1-1"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl1-2", slug: "classes/warrior/fury", cls:"cl-warrior", text: t("warcraft:classes.1-2"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},
      {id: "mdtcl1-3", slug: "classes/warrior/protection", cls:"cl-warrior", text: t("warcraft:classes.1-3"), WEAKAURA: true, ELVUI: true, VUHDO: true, COLLECTION: true},

      {id: "snip0", slug: "snippets", cls:"snippets", text: t("Code Snippets"), root: true, "LUA SNIPPET": true, COLLECTION: true},
      {id: "snip1", slug: "snippets/libraries", cls:"snippets", text: t("Libraries"), "LUA SNIPPET": true, COLLECTION: true},
      {id: "snip2", slug: "snippets/tutorials", cls:"snippets", text: t("Tutorials"), "LUA SNIPPET": true, COLLECTION: true},

      {id: "beta-bfa", slug: "beta-bfa", cls:"snippets", text: t("Battle for Azeroth"), root: true, noselect: true, systemtag: true, WEAKAURA: true}
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
  search: function (str, t) {
    if (!t) {
      t = window.i18next.t
    }

    var cats = this.categories(t) // search translated text
    var _cats = this.categories() // search i8n codes
    for (var i=0; i<cats.length; i++) {
      if (cats[i].id === str.toLowerCase().trim()|| cats[i].text.toLowerCase().trim() === str.toLowerCase().trim() || _cats[i].text.replace(/-/, ' ') === str.toLowerCase().trim() || _cats[i].text.toLowerCase().trim() === str.toLowerCase().trim() || cats[i].slug === str) {
        cats[i].text = t(cats[i].text)
        return cats[i]
      }
    }
    if (str.match(/\./) && !str.match(/warcraft:/)) {
      return this.search('warcraft:'+str, t)
    }
    return false
  },

  // make list of classes, then sort them alphabetically for the current locale, then get specs and return
  classCategories: function (t) {
    var cats = this.categories(t)
    var classes = []
    cats.forEach((cat, key) => {
      if (cat.id === 'cl1' || cat.id === 'cl2' || cat.id === 'cl3' || cat.id === 'cl4' || cat.id === 'cl5' || cat.id === 'cl6' || 
      cat.id === 'cl7' || cat.id === 'cl8' || cat.id === 'cl9' || cat.id === 'cl10' || cat.id === 'cl11' || cat.id === 'cl12') {
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
        if (cat.id !== cls.id && (cat.id).indexOf(cls.id + '-') === 0) {
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

  professionCategories: function (t) {
    var gathering = this.getCategories(['prof1'], t)[0]
    gathering.specs = this.getCategories(['prof2', 'prof3', 'prof4'], t)
    
    var crafting = this.getCategories(['prof5'], t)[0]
    crafting.specs = this.getCategories(['prof5', 'prof6', 'prof7', 'prof8', 'prof9', 'prof10', 'prof11', 'prof12', 'prof13'], t)
    
    var secondary = this.getCategories(['prof14'], t)[0]
    secondary.specs = this.getCategories(['prof15', 'prof16', 'prof17', 'prof18'], t)

    return [crafting, gathering, secondary]
  },

  rootCategories: function (t, type) {
    var roots = []
    this.categories(t).forEach((cat) => {
      if (cat.root && (!type || cat[type]) && !cat.noselect) {
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

  getChildren: function (parent, type, t) {
    var children = []
    // build regex
    var re = new RegExp(parent.slug.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + '/[^/]+$')
    this.categories(t).forEach((cat) => {
      if (re.exec(cat.slug) && parent.id !== cat.id && !cat.systemtag && (!type || cat[type])) {
        children.push(cat)
      }
    })
    return children
  },
 
  getCategory: function (id, t) {
    return this.getCategories([id], t)
  },
 
  getCategories: function (ids, t, doNotSortAlpha) {
    var cats = this.categories(t)
    var selected = []
    ids.forEach((c) => {
      cats.forEach((cat) => {
        if (c instanceof RegExp && cat.id.match(c)) {
          selected.push(cat) 
        }
        else if (c == cat.id) {
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

  getClones: function(id) {
    var cats = this.categories(false)
    var base = this.getCategory(id)[0]
    var clones = []

    cats.forEach((cat) => {
      if (cat.text === base.text && cat.id !== base.id) {
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