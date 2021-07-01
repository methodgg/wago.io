function normalize (str) {
  return str.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`"'~()\s]/g, '-').trim()
}

class Categories {
  constructor () {
    this.categories = {
      // required: slug, cls, i18n
      // include root if category is top level
      // include [types] if category is restricted to certain import types
      // include [games] if category is restricted to certain games/expansions
      'cl6': {slug: 'classes/death-knight', image: 'deathknight', color: '#C41F3B', i18n: 'warcraft:classes.6', games: ['legion', 'bfa', 'sl']},
      'cl6-1': {slug: 'classes/death-knight/blood', i18n: 'warcraft:classes.6-1', parent: 'cl6', games: ['legion', 'bfa', 'sl']},
      'cl6-2': {slug: 'classes/death-knight/frost', i18n: 'warcraft:classes.6-2', parent: 'cl6', games: ['legion', 'bfa', 'sl']},
      'cl6-3': {slug: 'classes/death-knight/unholy', i18n: 'warcraft:classes.6-3', parent: 'cl6', games: ['legion', 'bfa', 'sl']},

      'cl12': {slug: 'classes/demon-hunter', image: 'demonhunter', color: '#A330C9', i18n: 'warcraft:classes.12', games: ['legion', 'bfa', 'sl']},
      'cl12-1': {slug: 'classes/demon-hunter/havoc', cls:'cl-demonhunter', i18n: 'warcraft:classes.12-1', parent: 'cl12', games: ['legion', 'bfa', 'sl']},
      'cl12-2': {slug: 'classes/demon-hunter/vengeance', i18n: 'warcraft:classes.12-2', parent: 'cl12', games: ['legion', 'bfa', 'sl']},

      'cl11': {slug: 'classes/druid', image: 'druid', color: '#FF7D0A', i18n: 'warcraft:classes.11'},
      'cl11-1': {slug: 'classes/druid/balance', i18n: 'warcraft:classes.11-1', parent: 'cl11'},
      'cl11-2': {slug: 'classes/druid/feral', i18n: 'warcraft:classes.11-2', parent: 'cl11'},
      'cl11-3': {slug: 'classes/druid/guardian', i18n: 'warcraft:classes.11-3', parent: 'cl11', games: ['legion', 'bfa', 'sl']},
      'cl11-4': {slug: 'classes/druid/restoration', i18n: 'warcraft:classes.11-4', parent: 'cl11'},

      'cl3': {slug: 'classes/hunter', image: 'hunter', color: '#ABD473', i18n: 'warcraft:classes.3'},
      'cl3-1': {slug: 'classes/hunter/beast-mastery', i18n: 'warcraft:classes.3-1', parent: 'cl3'},
      'cl3-2': {slug: 'classes/hunter/marksmanship', i18n: 'warcraft:classes.3-2', parent: 'cl3'},
      'cl3-3': {slug: 'classes/hunter/survival', i18n: 'warcraft:classes.3-3', parent: 'cl3'},

      'cl8': {slug: 'classes/mage', image: 'mage', color: '#69CCF0', i18n: 'warcraft:classes.8'},
      'cl8-1': {slug: 'classes/mage/arcane', i18n: 'warcraft:classes.8-1', parent: 'cl8'},
      'cl8-2': {slug: 'classes/mage/fire', i18n: 'warcraft:classes.8-2', parent: 'cl8'},
      'cl8-3': {slug: 'classes/mage/frost', i18n: 'warcraft:classes.8-3', parent: 'cl8'},

      'cl10': {slug: 'classes/monk', image: 'monk', color: '#00FF96', i18n: 'warcraft:classes.10', games: ['legion', 'bfa', 'sl']},
      'cl10-1': {slug: 'classes/monk/brewmaster', i18n: 'warcraft:classes.10-1', parent: 'cl10', games: ['legion', 'bfa', 'sl']},
      'cl10-2': {slug: 'classes/monk/mistweaver', i18n: 'warcraft:classes.10-2', parent: 'cl10', games: ['legion', 'bfa', 'sl']},
      'cl10-3': {slug: 'classes/monk/windwalker', i18n: 'warcraft:classes.10-3', parent: 'cl10', games: ['legion', 'bfa', 'sl']},

      'cl2': {slug: 'classes/paladin', image: 'paladin', color: '#F58CBA', i18n: 'warcraft:classes.2'},
      'cl2-1': {slug: 'classes/paladin/holy', i18n: 'warcraft:classes.2-1', parent: 'cl2'},
      'cl2-2': {slug: 'classes/paladin/protection', i18n: 'warcraft:classes.2-2', parent: 'cl2'},
      'cl2-3': {slug: 'classes/paladin/retribution', i18n: 'warcraft:classes.2-3', parent: 'cl2'},

      'cl5': {slug: 'classes/priest', image: 'priest', color: '#FFFFFF', lightColor: '#A9A9A9', i18n: 'warcraft:classes.5'},
      'cl5-1': {slug: 'classes/priest/discipline', i18n: 'warcraft:classes.5-1', parent: 'cl5'},
      'cl5-2': {slug: 'classes/priest/holy', i18n: 'warcraft:classes.5-2', parent: 'cl5'},
      'cl5-3': {slug: 'classes/priest/shadow', i18n: 'warcraft:classes.5-3', parent: 'cl5'},

      'cl4': {slug: 'classes/rogue', image: 'rogue', color: '#FFF569', lightColor: '#E8D901', i18n: 'warcraft:classes.4'},
      'cl4-1': {slug: 'classes/rogue/assassination', i18n: 'warcraft:classes.4-1', parent: 'cl4'},
      'cl4-2': {slug: 'classes/rogue/outlaw', i18n: 'warcraft:classes.4-2', parent: 'cl4', games: ['legion', 'bfa', 'sl']},
      'cl4-2c': {slug: 'classes/rogue/combat', i18n: 'warcraft:classes.4-2c', parent: 'cl4', games: ['classic', 'tbc']},
      'cl4-3': {slug: 'classes/rogue/subtlety', i18n: 'warcraft:classes.4-3', parent: 'cl4'},

      'cl7': {slug: 'classes/shaman', image: 'shaman', color: '#0070DE', i18n: 'warcraft:classes.7'},
      'cl7-1': {slug: 'classes/shaman/elemental', i18n: 'warcraft:classes.7-1', parent: 'cl7'},
      'cl7-2': {slug: 'classes/shaman/enhancement', i18n: 'warcraft:classes.7-2', parent: 'cl7'},
      'cl7-3': {slug: 'classes/shaman/restoration', i18n: 'warcraft:classes.7-3', parent: 'cl7'},

      'cl9': {slug: 'classes/warlock', image: 'warlock', color: '#9482C9', i18n: 'warcraft:classes.9'},
      'cl9-1': {slug: 'classes/warlock/balance', i18n: 'warcraft:classes.9-1', parent: 'cl9'},
      'cl9-2': {slug: 'classes/warlock/feral', i18n: 'warcraft:classes.9-2', parent: 'cl9'},
      'cl9-3': {slug: 'classes/warlock/guardian', i18n: 'warcraft:classes.9-3', parent: 'cl9'},

      'cl1': {slug: 'classes/warrior', image: 'warrior', color: '#C79C6E', i18n: 'warcraft:classes.1'},
      'cl1-1': {slug: 'classes/warrior/arms', i18n: 'warcraft:classes.1-1', parent: 'cl1'},
      'cl1-2': {slug: 'classes/warrior/fury', i18n: 'warcraft:classes.1-2', parent: 'cl1'},
      'cl1-3': {slug: 'classes/warrior/protection', i18n: 'warcraft:classes.1-3', parent: 'cl1'},

      'gen0': {slug: 'general', image:'miscellaneous', color: '#D0B58B', i18n: 'General', types: ['WEAKAURA', 'COLLECTION']},
      'gen7': {slug: 'general/achievements', i18n: 'Achievements', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen2': {slug: 'general/questing', i18n: 'Questing', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION']},
      'gen6': {slug: 'general/non-combat', i18n: 'Non-Combat', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION']},
      'gen9': {slug: 'general/currency', i18n: 'Currency', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen10': {slug: 'general/reputation', i18n: 'Reputation', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], },
      'gen11': {slug: 'general/collectibles', i18n: 'Collectibles', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen12': {slug: 'general/world-events', i18n: 'World Events', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen13': {slug: 'general/world-events/darkmoon-faire', i18n: 'Darkmoon Faire', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen14': {slug: 'general/world-events/brawlers-guild', i18n: 'Brawler\'s Guild', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen15': {slug: 'general/pet-battles', i18n: 'Pet Battles', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'gen16': {slug: 'general/warfronts', i18n: 'Warfronts', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'gen17': {slug: 'general/island-expeditions', i18n: 'Island Expeditions', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'gen18': {slug: 'general/covenants', i18n: 'Covenants', parent: 'gen0', types: ['WEAKAURA', 'COLLECTION'], games: ['sl']},

      'equip': {slug: 'equipment', image: 'equipment', color: '#7ED321', i18n: 'Equipment', types: ['WEAKAURA', 'COLLECTION']},
      'legen': {slug: 'equipment/legendaries', i18n: 'Legendaries', parent: 'equip', types: ['WEAKAURA', 'COLLECTION'], games: ['legion', 'bfa', 'sl']},
      'equip1': {slug: 'equipment/trinkets', i18n: 'Trinkets', parent: 'equip', types: ['WEAKAURA', 'COLLECTION']},
      'equip2': {slug: 'equipment/item-enhancements', i18n: 'Item Enhancements', parent: 'equip', types: ['WEAKAURA', 'COLLECTION']},

      'mech': {slug: 'combat-mechanics', image: 'mechanics', color: '#F55F37', i18n: 'Combat Mechanics', types: ['WEAKAURA', 'COLLECTION']},
      'mech1': {slug: 'combat-mechanics/battle-resurrection', i18n: 'Battle Resurrection', parent: 'mech', types: ['WEAKAURA'], games: ['legion', 'bfa', 'sl']},
      'mech2': {slug: 'combat-mechanics/interrupts', i18n: 'Interrupts', parent: 'mech', types: ['WEAKAURA']},
      'mech3': {slug: 'combat-mechanics/theorycrafting', i18n: 'Theorycrafting', parent: 'mech', types: ['WEAKAURA', 'COLLECTION']},
      'mech4': {slug: 'combat-mechanics/vehicles', i18n: 'Vehicles', parent: 'mech', types: ['WEAKAURA'], games: ['legion', 'bfa', 'sl']},
      'mech5': {slug: 'combat-mechanics/consumables', i18n: 'Consumables', parent: 'mech', types: ['WEAKAURA', 'COLLECTION']},
      'mech6': {slug: 'combat-mechanics/group-buffs', i18n: 'Group Buffs', parent: 'mech', types: ['WEAKAURA', 'COLLECTION']},

      'role0': {slug: 'class-roles', image: 'roles', color: '#BED0C1', i18n: 'Group Roles'},
      'role4': {slug: 'class-roles/raid-leading', i18n: 'Raid Leading', parent: 'role0'},
      'role1': {slug: 'class-roles/damage-dealing', i18n: 'Damage Dealing', parent: 'role0'},
      'role2': {slug: 'class-roles/healing', i18n: 'Healing', parent: 'role0'},
      'role3': {slug: 'class-roles/tanking', i18n: 'Tanking', parent: 'role0'},

      // shadowlands
      'raidsantumdom': {slug: 'pve/sanctum-of-domination', image: 'sanctumofdom', color: '#5CE000', i18n: 'warcraft:zones.SanctumOfDomination', types: ['WEAKAURA', 'COLLECTION'], games: ['sl']},
      'raidsantumdom1': {slug: 'pve/sanctum-of-domination/shriekwing', i18n: 'warcraft:bosses.Tarragrue', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom2': {slug: 'pve/sanctum-of-domination/altimor-the-huntsman', i18n: 'warcraft:bosses.EyeoftheJailer', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom3': {slug: 'pve/sanctum-of-domination/hungering-destroyer', i18n: 'warcraft:bosses.TheNine', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom4': {slug: 'pve/sanctum-of-domination/artificer-xymox', i18n: 'warcraft:bosses.RemnantofNerzhul', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom5': {slug: 'pve/sanctum-of-domination/kaelthas-sunstrider', i18n: 'warcraft:bosses.SoulrenderDormazain', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom6': {slug: 'pve/sanctum-of-domination/lady-inerva-darkvein', i18n: 'warcraft:bosses.PainsmithRaznal', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom7': {slug: 'pve/sanctum-of-domination/the-council-of-blood', i18n: 'warcraft:bosses.GuardianoftheFirstOnes', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom8': {slug: 'pve/sanctum-of-domination/sludgefist', i18n: 'warcraft:bosses.FatescribeRohKalo', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom9': {slug: 'pve/sanctum-of-domination/stone-legion-generals', i18n: 'warcraft:bosses.Kelthuzad', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},
      'raidsantumdom10': {slug: 'pve/sanctum-of-domination/stone-legion-generals', i18n: 'warcraft:bosses.SylvanasWindrunner', parent: 'raidsantumdom', types: ['WEAKAURA'], games: ['sl']},

      'raidnathria': {slug: 'pve/nathria', image: 'nathria', color: '#9693BD', i18n: 'warcraft:zones.CastleNathria', types: ['WEAKAURA', 'COLLECTION'], games: ['sl']},
      'raidnathria1': {slug: 'pve/nathria/shriekwing', i18n: 'warcraft:bosses.Shriekwing', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria10': {slug: 'pve/nathria/altimor-the-huntsman', i18n: 'warcraft:bosses.Altimor', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria2': {slug: 'pve/nathria/hungering-destroyer', i18n: 'warcraft:bosses.HungeringDestroyer', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria4': {slug: 'pve/nathria/artificer-xymox', i18n: 'warcraft:bosses.ArtificerXyMox', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria3': {slug: 'pve/nathria/kaelthas-sunstrider', i18n: 'warcraft:bosses.SunKingsSalvation', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria5': {slug: 'pve/nathria/lady-inerva-darkvein', i18n: 'warcraft:bosses.LadyInervaDarkvein', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria6': {slug: 'pve/nathria/the-council-of-blood', i18n: 'warcraft:bosses.TheCouncilOfBlood', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria7': {slug: 'pve/nathria/sludgefist', i18n: 'warcraft:bosses.Sludgefist', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria8': {slug: 'pve/nathria/stone-legion-generals', i18n: 'warcraft:bosses.StoneLegionGenerals', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},
      'raidnathria9': {slug: 'pve/nathria/sire-denathrius', i18n: 'warcraft:bosses.SireDenathrius', parent: 'raidnathria', types: ['WEAKAURA'], games: ['sl']},

      'sldungeon': {slug: 'pve/shadowlands-dungeons', image: 'dungeon', color: '#F5A623', i18n: 'Shadowlands Dungeons', types: ['WEAKAURA', 'COLLECTION'], games: ['sl']},
      'sldungeon1': {slug: 'pve/shadowlands-dungeons/the-necrotic-wake', i18n: 'warcraft:zones.TheNecroticWake', parent: 'dungesldungeonon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon2': {slug: 'pve/shadowlands-dungeons/plaguefall', i18n: 'warcraft:zones.Plaguefall', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon3': {slug: 'pve/shadowlands-dungeons/mists-of-tirna-scithe', i18n: 'warcraft:zones.MistsOfTirnaScithe', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon4': {slug: 'pve/shadowlands-dungeons/halls-of-attonement', i18n: 'warcraft:zones.HallsOfAttonement', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon5': {slug: 'pve/shadowlands-dungeons/theater-of-pain', i18n: 'warcraft:zones.TheaterOfPain', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon6': {slug: 'pve/shadowlands-dungeons/de-other-side', i18n: 'warcraft:zones.DeOtherSide', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon7': {slug: 'pve/shadowlands-dungeons/spires-of-ascension', i18n: 'warcraft:zones.SpiresOfAscension', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon8': {slug: 'pve/shadowlands-dungeons/sanguine-depths', i18n: 'warcraft:zones.SanguineDepths', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},
      'sldungeon9': {slug: 'pve/shadowlands-dungeons/tazavesh-the-veiled-market', i18n: 'warcraft:zones.Tazavesh', parent: 'sldungeon', types: ['WEAKAURA'], games: ['sl']},

      // bfa
      'raidnyalotha': {slug: 'pve/nyalotha', image: 'nyalotha', color: '#5EE1A6', i18n: 'warcraft:zones.nyalotha', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'raidnyalotha1': {slug: 'pve/nyalotha/wrathion-the-black-emperor', i18n: 'warcraft:bosses.nya1', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha2': {slug: 'pve/nyalotha/maut', i18n: 'warcraft:bosses.nya2', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha3': {slug: 'pve/nyalotha/the-prophet-skitra', i18n: 'warcraft:bosses.nya3', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha4': {slug: 'pve/nyalotha/dark-inquisitor-xanesh', i18n: 'warcraft:bosses.nya4', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha5': {slug: 'pve/nyalotha/hivemind', i18n: 'warcraft:bosses.nya5', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha6': {slug: 'pve/nyalotha/shadhar-the-insatiable', i18n: 'warcraft:bosses.nya6', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha7': {slug: 'pve/nyalotha/drestagath', i18n: 'warcraft:bosses.nya7', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha8': {slug: 'pve/nyalotha/vexiona', i18n: 'warcraft:bosses.nya8', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha9': {slug: 'pve/nyalotha/ra-den-the-despoiled', i18n: 'warcraft:bosses.nya9', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha10': {slug: 'pve/nyalotha/ilgynoth-corruption-reborn', i18n: 'warcraft:bosses.nya10', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha11': {slug: 'pve/nyalotha/carapace-of-nzoth', i18n: 'warcraft:bosses.nya11', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},
      'raidnyalotha12': {slug: 'pve/nyalotha/nzoth-the-corruptor', i18n: 'warcraft:bosses.nya12', parent: 'raidnyalotha', types: ['WEAKAURA'], games: ['bfa']},

      'raideternalpalace': {slug: 'pve/the-eternal-palace', image: 'eternalpalace', color: '#FF98EC', i18n: 'warcraft:zones.10425', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'raideternalpalace1': {slug: 'pve/the-eternal-palace/abyssal-commander-sivara', i18n: 'warcraft:bosses.151881', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace2': {slug: 'pve/the-eternal-palace/rage-of-azshara', i18n: 'warcraft:bosses.152364', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace3': {slug: 'pve/the-eternal-palace/underwater-monstrosity', i18n: 'warcraft:bosses.150653', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace4': {slug: 'pve/the-eternal-palace/lady-priscilla-ashvane', i18n: 'warcraft:bosses.153142', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace5': {slug: 'pve/the-eternal-palace/the-hatchery', i18n: 'warcraft:bosses.152128', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace6': {slug: 'pve/the-eternal-palace/the-queens-court', i18n: 'warcraft:bosses.152853', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace7': {slug: 'pve/the-eternal-palace/herald-of-nzoth', i18n: 'warcraft:bosses.151586', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},
      'raideternalpalace8': {slug: 'pve/the-eternal-palace/queen-azshara', i18n: 'warcraft:bosses.152910', parent: 'raideternalpalace', types: ['WEAKAURA'], games: ['bfa']},

      'raidcrucible': {slug: 'pve/crucible-of-storms', image: 'cruciblestorms', color: '#3329b3', i18n: 'warcraft:zones.10057', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'raidcrucible1': {slug: 'pve/crucible-of-storms/the-restless-cabal', i18n: 'warcraft:bosses.146497', parent: 'raidcrucible', types: ['WEAKAURA'], games: ['bfa']},
      'raidcrucible2': {slug: 'pve/crucible-of-storms/uunat-harbinger-of-the-void', i18n: 'warcraft:bosses.145371', parent: 'raidcrucible', types: ['WEAKAURA'], games: ['bfa']},

      'raidzuldazar': {slug: 'pve/battle-of-zuldazar', image: 'zuldazar', color: '#4BB21F', i18n: 'warcraft:zones.10076', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'raidzuldazar1': {slug: 'pve/battle-of-zuldazar/frida-ironbellows', i18n: 'warcraft:bosses.144680', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar1b': {slug: 'pve/battle-of-zuldazar/ra-wani-kanae', i18n: 'warcraft:bosses.144683', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar2': {slug: 'pve/battle-of-zuldazar/grong-the-jungle-lord', i18n: 'warcraft:bosses.147268', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar2b': {slug: 'pve/battle-of-zuldazar/grong-the-revenant', i18n: 'warcraft:bosses.144638', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar3': {slug: 'pve/battle-of-zuldazar/flamefist-and-the-illuminated', i18n: 'warcraft:bosses.146099', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar3b': {slug: 'pve/battle-of-zuldazar/grimfang-and-firecaller', i18n: 'warcraft:bosses.144691', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar4': {slug: 'pve/battle-of-zuldazar/high-tinker-mekkatorque', i18n: 'warcraft:bosses.147589', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar4b': {slug: 'pve/battle-of-zuldazar/king-rastakhan', i18n: 'warcraft:bosses.139633', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar5': {slug: 'pve/battle-of-zuldazar/stormwall-blockade', i18n: 'warcraft:bosses.146256', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar6': {slug: 'pve/battle-of-zuldazar/conclave-of-the-chosen', i18n: 'warcraft:bosses.144747', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar7': {slug: 'pve/battle-of-zuldazar/opulence', i18n: 'warcraft:bosses.147564', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},
      'raidzuldazar8': {slug: 'pve/battle-of-zuldazar/jaina-proudmoore', i18n: 'warcraft:bosses.133251', parent: 'raidzuldazar', types: ['WEAKAURA'], games: ['bfa']},

      'raiduldir': {slug: 'pve/uldir', image: 'uldir', color: '#D42D20', i18n: 'warcraft:zones.9389', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'raiduldir1': {slug: 'pve/uldir/taloc-the-corrupted', i18n: 'warcraft:bosses.137119', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir2': {slug: 'pve/uldir/mother', i18n: 'warcraft:bosses.140853', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir3': {slug: 'pve/uldir/fetid-devourer', i18n: 'warcraft:bosses.133298', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir4': {slug: 'pve/uldir/zekvoz-herald-of-nzoth', i18n: 'warcraft:bosses.134445', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir5': {slug: 'pve/uldir/zul-reborn', i18n: 'warcraft:bosses.138967', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir6': {slug: 'pve/uldir/mythrax-the-unraveler', i18n: 'warcraft:bosses.136383', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir7': {slug: 'pve/uldir/vectis', i18n: 'warcraft:bosses.134442', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},
      'raiduldir8': {slug: 'pve/uldir/ghuun', i18n: 'warcraft:bosses.132998', parent: 'raiduldir', types: ['WEAKAURA'], games: ['bfa']},

      'bfadungeon': {slug: 'pve/bfa-dungeons', image: 'dungeon', color: '#F5A623', i18n: 'BFA Dungeons', types: ['WEAKAURA', 'COLLECTION'], games: ['bfa']},
      'bfadungeon1': {slug: 'pve/bfa-dungeons/atal-dazar', i18n: 'warcraft:zones.9028', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon2': {slug: 'pve/bfa-dungeons/freehold', i18n: 'warcraft:zones.9164', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon3': {slug: 'pve/bfa-dungeons/kings-rest', i18n: 'warcraft:zones.9526', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon4': {slug: 'pve/bfa-dungeons/shrine-of-the-storm', i18n: 'warcraft:zones.9525', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon5': {slug: 'pve/bfa-dungeons/siege-of-boralus', i18n: 'warcraft:zones.9354', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon6': {slug: 'pve/bfa-dungeons/temple-of-sethraliss', i18n: 'warcraft:zones.9527', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon7': {slug: 'pve/bfa-dungeons/the-motherlode', i18n: 'warcraft:zones.8064', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon8': {slug: 'pve/bfa-dungeons/the-underrot', i18n: 'warcraft:zones.9391', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon9': {slug: 'pve/bfa-dungeons/tol-dagor', i18n: 'warcraft:zones.9327', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon10': {slug: 'pve/bfa-dungeons/waycrest-manor', i18n: 'warcraft:zones.9424', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},
      'bfadungeon11': {slug: 'pve/bfa-dungeons/operation-mechagon', i18n: 'warcraft:zones.10225', parent: 'bfadungeon', types: ['WEAKAURA'], games: ['bfa']},

      // legion
      'raidantorus': {slug: 'pve/antorus-the-burning-throne', image: 'antorus', color: '#1978aa', i18n: 'warcraft:zones.8638', types: ['WEAKAURA', 'COLLECTION'], games: ['legion']},
      'raidantorus1': {slug: 'pve/antorus-the-burning-throne/garothi-worldbreaker', i18n: 'warcraft:bosses.123371', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus2': {slug: 'pve/antorus-the-burning-throne/hounds-of-sargeras', i18n: 'warcraft:bosses.126915', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus3': {slug: 'pve/antorus-the-burning-throne/antoran-high-command', i18n: 'warcraft:bosses.122367', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus4': {slug: 'pve/antorus-the-burning-throne/portal-keeper-hasabel', i18n: 'warcraft:bosses.124393', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus5': {slug: 'pve/antorus-the-burning-throne/eonar-the-lifebender', i18n: 'warcraft:bosses.125562', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus6': {slug: 'pve/antorus-the-burning-throne/imonar-the-soulhunter', i18n: 'warcraft:bosses.125055', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus7': {slug: 'pve/antorus-the-burning-throne/kingaroth', i18n: 'warcraft:bosses.125050', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus8': {slug: 'pve/antorus-the-burning-throne/varimathras', i18n: 'warcraft:bosses.125075', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus9': {slug: 'pve/antorus-the-burning-throne/the-coven-of-shivarra', i18n: 'warcraft:bosses.122468', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus10': {slug: 'pve/antorus-the-burning-throne/aggramar', i18n: 'warcraft:bosses.124691', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},
      'raidantorus11': {slug: 'pve/antorus-the-burning-throne/argus-the-unmaker', i18n: 'warcraft:bosses.124828', parent: 'raidantorus', types: ['WEAKAURA'], games: ['legion']},

      'raidtomb': {slug: 'pve/tomb-of-sargeras', image: 'tombofsarg', color: '#006d35', i18n: 'warcraft:zones.8524', types: ['WEAKAURA', 'COLLECTION'], games: ['legion']},
      'raidtomb1': {slug: 'pve/tomb-of-sargeras/goroth', i18n: 'warcraft:bosses.115844', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb2': {slug: 'pve/tomb-of-sargeras/demonic-inquisition', i18n: 'warcraft:bosses.116689', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb3': {slug: 'pve/tomb-of-sargeras/harjatan-the-bludger', i18n: 'warcraft:bosses.116407', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb4': {slug: 'pve/tomb-of-sargeras/mistress-sasszine', i18n: 'warcraft:bosses.115767', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb5': {slug: 'pve/tomb-of-sargeras/sisters-of-the-moon', i18n: 'warcraft:bosses.118523', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb6': {slug: 'pve/tomb-of-sargeras/the-desolate-host', i18n: 'warcraft:bosses.118460', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb7': {slug: 'pve/tomb-of-sargeras/maiden-of-vigilance', i18n: 'warcraft:bosses.118289', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb8': {slug: 'pve/tomb-of-sargeras/fallen-avatar', i18n: 'warcraft:bosses.116939', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},
      'raidtomb9': {slug: 'pve/tomb-of-sargeras/kiljaeden', i18n: 'warcraft:bosses.117269', parent: 'raidtomb', types: ['WEAKAURA'], games: ['legion']},

      'raidnh': {slug: 'pve/nighthold', image: 'nighthold', color: '#cb02b7', i18n: 'warcraft:zones.8025', types: ['WEAKAURA', 'COLLECTION'], games: ['legion']},
      'raidnh1': {slug: 'pve/nighthold/skorpyron', i18n: 'warcraft:bosses.102263', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh2': {slug: 'pve/nighthold/chronomatic-anomaly', i18n: 'warcraft:bosses.104415', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh3': {slug: 'pve/nighthold/trilliax', i18n: 'warcraft:bosses.104288', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh4': {slug: 'pve/nighthold/spellblade-aluriel', i18n: 'warcraft:bosses.107699', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh5': {slug: 'pve/nighthold/tichondrius', i18n: 'warcraft:bosses.103685', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh6': {slug: 'pve/nighthold/krosus', i18n: 'warcraft:bosses.101002', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh7': {slug: 'pve/nighthold/high-botanist-telarn', i18n: 'warcraft:bosses.104528', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh8': {slug: 'pve/nighthold/star-augur-etraeus', i18n: 'warcraft:bosses.103758', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh9': {slug: 'pve/nighthold/grand-magistrix-elisande', i18n: 'warcraft:bosses.110965', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},
      'raidnh10': {slug: 'pve/nighthold/guldan', i18n: 'warcraft:bosses.105503', parent: 'raidnh', types: ['WEAKAURA'], games: ['legion']},

      'raiden': {slug: 'pve/emerald-nightmare', image: 'emeraldnightmare', color: '#6b2100', i18n: 'warcraft:zones.8026', types: ['WEAKAURA', 'COLLECTION'], games: ['legion']},
      'raiden1': {slug: 'pve/emerald-nightmare/nythendra', i18n: 'warcraft:bosses.103160', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden2': {slug: 'pve/emerald-nightmare/ilgynoth', i18n: 'warcraft:bosses.105393', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden4': {slug: 'pve/emerald-nightmare/elerethe-renferal', i18n: 'warcraft:bosses.111000', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden5': {slug: 'pve/emerald-nightmare/ursoc', i18n: 'warcraft:bosses.100497', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden6': {slug: 'pve/emerald-nightmare/dragons-of-nightmare', i18n: 'warcraft:bosses.102679', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden7': {slug: 'pve/emerald-nightmare/cenarius', i18n: 'warcraft:bosses.113534', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},
      'raiden8': {slug: 'pve/emerald-nightmare/xavius', i18n: 'warcraft:bosses.103769', parent: 'raiden', types: ['WEAKAURA'], games: ['legion']},

      'dungeon': {slug: 'pve/legion-dungeons', image: 'dungeon', color: '#F5A623', i18n: 'Legion Dungeons', types: ['WEAKAURA', 'COLLECTION'], games: ['legion']},
      'dungeon3': {slug: 'pve/legion-dungeons/arcway', i18n: 'warcraft:zones.7855', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon1': {slug: 'pve/legion-dungeons/assault-on-violet-hold', i18n: 'warcraft:zones.7996', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon4': {slug: 'pve/legion-dungeons/blackrook-hold', i18n: 'warcraft:zones.7805', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon12': {slug: 'pve/legion-dungeons/cathedral-of-eternal-night', i18n: 'warcraft:zones.8527', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon2': {slug: 'pve/legion-dungeons/court-of-stars', i18n: 'warcraft:zones.8079', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon5': {slug: 'pve/legion-dungeons/darkheart-thicket', i18n: 'warcraft:zones.7673', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon6': {slug: 'pve/legion-dungeons/eye-of-azshara', i18n: 'warcraft:zones.8040', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon7': {slug: 'pve/legion-dungeons/halls-of-valor', i18n: 'warcraft:zones.7672', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon8': {slug: 'pve/legion-dungeons/maw-of-souls', i18n: 'warcraft:zones.7812', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon9': {slug: 'pve/legion-dungeons/neltharions-lair', i18n: 'warcraft:zones.7546', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon11': {slug: 'pve/legion-dungeons/return-to-karazhan', i18n: 'warcraft:zones.8443', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon13': {slug: 'pve/legion-dungeons/seat-of-the-triumvirate', i18n: 'warcraft:zones.8910', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},
      'dungeon10': {slug: 'pve/legion-dungeons/vault-of-the-wardens', i18n: 'warcraft:zones.7787', parent: 'dungeon', types: ['WEAKAURA'], games: ['legion']},

      // wod
      'raidhfc': {slug: 'pve/hellfire-citadel', image: 'hellfirecitadel', color: '#689E12', i18n: 'warcraft:zones.7545', types: ['WEAKAURA', 'COLLECTION'], games: ['wod']},
      'raidhfc1': {slug: 'pve/hellfire-citadel/assault', i18n: 'warcraft:bosses.93023', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc2': {slug: 'pve/hellfire-citadel/iron-reaver', i18n: 'warcraft:bosses.90284', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc3': {slug: 'pve/hellfire-citadel/kormrok', i18n: 'warcraft:bosses.90435', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc4': {slug: 'pve/hellfire-citadel/kilrogg-deadeye', i18n: 'warcraft:bosses.90378', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc5': {slug: 'pve/hellfire-citadel/high-council', i18n: 'warcraft:bosses.92146', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc6': {slug: 'pve/hellfire-citadel/gorefiend', i18n: 'warcraft:bosses.90199', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc7': {slug: 'pve/hellfire-citadel/shadow-lord-iskar', i18n: 'warcraft:bosses.90316', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc8': {slug: 'pve/hellfire-citadel/socrethar-the-eternal', i18n: 'warcraft:bosses.90296', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc9': {slug: 'pve/hellfire-citadel/tyrant-velhari', i18n: 'warcraft:bosses.90269', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc10': {slug: 'pve/hellfire-citadel/fel-lord-zakuun', i18n: 'warcraft:bosses.89890', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc11': {slug: 'pve/hellfire-citadel/xhulhorac', i18n: 'warcraft:bosses.93068', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc12': {slug: 'pve/hellfire-citadel/mannoroth', i18n: 'warcraft:bosses.91349', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},
      'raidhfc13': {slug: 'pve/hellfire-citadel/archimonde', i18n: 'warcraft:bosses.91331', parent: 'raidhfc', types: ['WEAKAURA'], games: ['wod']},

      'raidtov': {slug: 'pve/trial-of-valor', image: 'trialofvalor', color: '#8F0995', i18n: 'warcraft:zones.8440', types: ['WEAKAURA', 'COLLECTION'], games: ['wod']},
      'raidtov1': {slug: 'pve/trial-of-valor/odyn', i18n: 'warcraft:bosses.115323', parent: 'raidtov', types: ['WEAKAURA'], games: ['wod']},
      'raidtov2': {slug: 'pve/trial-of-valor/guarm', i18n: 'warcraft:bosses.114344', parent: 'raidtov', types: ['WEAKAURA'], games: ['wod']},
      'raidtov3': {slug: 'pve/trial-of-valor/helya', i18n: 'warcraft:bosses.115323', parent: 'raidtov', types: ['WEAKAURA'], games: ['wod']},

      // tbc
      'raidsw': {slug: 'pve/sunwell-plateau', image: 'sunwell', color: '#02FFEA', i18n: 'warcraft:zones.4075', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidsw1': {slug: 'pve/sunwell-plateau/kalecgos', i18n: 'warcraft:bosses.24850', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},
      'raidsw2': {slug: 'pve/sunwell-plateau/brutallus', i18n: 'warcraft:bosses.24882', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},
      'raidsw3': {slug: 'pve/sunwell-plateau/felmyst', i18n: 'warcraft:bosses.25038', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},
      'raidsw4': {slug: 'pve/sunwell-plateau/eredar-twins', i18n: 'warcraft:bosses.25166', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},
      'raidsw5': {slug: 'pve/sunwell-plateau/muru', i18n: 'warcraft:bosses.25741', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},
      'raidsw6': {slug: 'pve/sunwell-plateau/kiljaeden', i18n: 'warcraft:bosses.25315', parent: 'raidsw', types: ['WEAKAURA'], games: ['tbc']},

      'raidbt': {slug: 'pve/black-temple', image: 'blacktemple', color: '#09AD02', i18n: 'warcraft:zones.3959', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidbt1': {slug: 'pve/black-temple/high-warlord-najentus', i18n: 'warcraft:bosses.22887', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt2': {slug: 'pve/black-temple/supremus', i18n: 'warcraft:bosses.22898', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt3': {slug: 'pve/black-temple/shade-of-akama', i18n: 'warcraft:bosses.22841', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt4': {slug: 'pve/black-temple/teron-gorefiend', i18n: 'warcraft:bosses.22871', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt5': {slug: 'pve/black-temple/gurtogg-bloodboil', i18n: 'warcraft:bosses.22948', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt6': {slug: 'pve/black-temple/reliquary-of-the-lost', i18n: 'warcraft:bosses.22856', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt7': {slug: 'pve/black-temple/mother-shahraz', i18n: 'warcraft:bosses.22947', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt8': {slug: 'pve/black-temple/the-illidari-council', i18n: 'warcraft:bosses.23426', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},
      'raidbt9': {slug: 'pve/black-temple/illidan-stormrage', i18n: 'warcraft:bosses.22917', parent: 'raidbt', types: ['WEAKAURA'], games: ['tbc']},

      'raidmthyjal': {slug: 'pve/hyjal-summit', image: 'mthyjal', color: '#FF492D', i18n: 'warcraft:zones.3606', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidmthyjal1': {slug: 'pve/hyjal-summit/rage-winterchill', i18n: 'warcraft:bosses.17767', parent: 'raidmthyjal', types: ['WEAKAURA'], games: ['tbc']},
      'raidmthyjal2': {slug: 'pve/hyjal-summit/anetheron', i18n: 'warcraft:bosses.17808', parent: 'raidmthyjal', types: ['WEAKAURA'], games: ['tbc']},
      'raidmthyjal3': {slug: 'pve/hyjal-summit/kazrogal', i18n: 'warcraft:bosses.17888', parent: 'raidmthyjal', types: ['WEAKAURA'], games: ['tbc']},
      'raidmthyjal4': {slug: 'pve/hyjal-summit/azgalor', i18n: 'warcraft:bosses.17842', parent: 'raidmthyjal', types: ['WEAKAURA'], games: ['tbc']},
      'raidmthyjal5': {slug: 'pve/hyjal-summit/archimonde', i18n: 'warcraft:bosses.17968', parent: 'raidmthyjal', types: ['WEAKAURA'], games: ['tbc']},

      'raidssc': {slug: 'pve/serpent-shrine-cavern', image: 'serpentshrine', color: '#48FF98', i18n: 'warcraft:zones.3607', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidssc1': {slug: 'pve/serpent-shrine-cavern/hydross-the-unstable', i18n: 'warcraft:bosses.21216', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},
      'raidssc2': {slug: 'pve/serpent-shrine-cavern/the-lurker-below', i18n: 'warcraft:bosses.21217', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},
      'raidssc3': {slug: 'pve/serpent-shrine-cavern/leotheras-the-blind', i18n: 'warcraft:bosses.21215', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},
      'raidssc4': {slug: 'pve/serpent-shrine-cavern/fathom-lord-karathress', i18n: 'warcraft:bosses.21214', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},
      'raidssc5': {slug: 'pve/serpent-shrine-cavern/morogrim-tidewalker', i18n: 'warcraft:bosses.21213', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},
      'raidssc6': {slug: 'pve/serpent-shrine-cavern/lady-vashj', i18n: 'warcraft:bosses.21212', parent: 'raidssc', types: ['WEAKAURA'], games: ['tbc']},

      'raidtk': {slug: 'pve/the-eye', image: 'tempestkeep', color: '#FF2DC8', i18n: 'warcraft:zones.3845', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidtk1': {slug: 'pve/the-eye/void-reaver', i18n: 'warcraft:bosses.19516', parent: 'raidtk', types: ['WEAKAURA'], games: ['tbc']},
      'raidtk2': {slug: 'pve/the-eye/alar', i18n: 'warcraft:bosses.19514', parent: 'raidtk', types: ['WEAKAURA'], games: ['tbc']},
      'raidtk3': {slug: 'pve/the-eye/high-astromancer-solarian', i18n: 'warcraft:bosses.18805', parent: 'raidtk', types: ['WEAKAURA'], games: ['tbc']},
      'raidtk4': {slug: 'pve/the-eye/kaelthas-sunstrider', i18n: 'warcraft:bosses.19622', parent: 'raidtk', types: ['WEAKAURA'], games: ['tbc']},

      'raidgruul': {slug: 'pve/lairs-of-giants', image: 'gruul', color: '#FF8748', i18n: 'warcraft:zones.lairs', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidgruul1': {slug: 'pve/lairs-of-giants/high-king-maulgar', i18n: 'warcraft:bosses.18831', parent: 'raidgruul', types: ['WEAKAURA'], games: ['tbc']},
      'raidgruul2': {slug: 'pve/lairs-of-giants/gruul-the-dragonkiller', i18n: 'warcraft:bosses.19044', parent: 'raidgruul', types: ['WEAKAURA'], games: ['tbc']},
      'raidgruul3': {slug: 'pve/lairs-of-giants/magtheridon', i18n: 'warcraft:bosses.17257', parent: 'raidgruul', types: ['WEAKAURA'], games: ['tbc']},

      'raidkarazhan': {slug: 'pve/karazhan', image: 'karazhan', color: '#48BAFF', i18n: 'warcraft:zones.3475', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'raidkarazhan1': {slug: 'pve/karazhan/attumen-the-huntsman', i18n: 'warcraft:bosses.16152', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan2': {slug: 'pve/karazhan/moroes', i18n: 'warcraft:bosses.15687', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan3': {slug: 'pve/karazhan/maiden-of-virtue', i18n: 'warcraft:bosses.16457', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan4a': {slug: 'pve/karazhan/wizard-of-oz', i18n: 'warcraft:bosses.18168', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan4b': {slug: 'pve/karazhan/the-big-bad-wolf', i18n: 'warcraft:bosses.17521', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan4c': {slug: 'pve/karazhan/romulo-and-julianne', i18n: 'warcraft:bosses.17533', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan5': {slug: 'pve/karazhan/the-curator', i18n: 'warcraft:bosses.15691', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan6': {slug: 'pve/karazhan/chess-event', i18n: 'warcraft:bosses.185119', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan7': {slug: 'pve/karazhan/terestian-illhoof', i18n: 'warcraft:bosses.15688', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan8': {slug: 'pve/karazhan/shade-of-aran', i18n: 'warcraft:bosses.16524', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan9': {slug: 'pve/karazhan/netherspite', i18n: 'warcraft:bosses.15689', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan10': {slug: 'pve/karazhan/nightbane', i18n: 'warcraft:bosses.17225', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},
      'raidkarazhan11': {slug: 'pve/karazhan/prince-malchezaar', i18n: 'warcraft:bosses.15690', parent: 'raidkarazhan', types: ['WEAKAURA'], games: ['tbc']},

      'tbcdungeon': {slug: 'pve/tbc-dungeons', image: 'dungeontbc', color: '#F5A623', i18n: 'TBC Dungeons', types: ['WEAKAURA', 'COLLECTION'], games: ['tbc']},
      'tbcdungeon1': {slug: 'pve/tbc-dungeons/hellfire-ramparts', i18n: 'warcraft:zones.3562', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon2': {slug: 'pve/tbc-dungeons/the-blood-furnace', i18n: 'warcraft:zones.3713', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon3': {slug: 'pve/tbc-dungeons/the-shattered-halls', i18n: 'warcraft:zones.3714', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon4': {slug: 'pve/tbc-dungeons/the-slave-pens', i18n: 'warcraft:zones.3717', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon5': {slug: 'pve/tbc-dungeons/the-underbog', i18n: 'warcraft:zones.3716', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon6': {slug: 'pve/tbc-dungeons/the-steamvault', i18n: 'warcraft:zones.3715', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon7': {slug: 'pve/tbc-dungeons/mana-tombs', i18n: 'warcraft:zones.3792', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon8': {slug: 'pve/tbc-dungeons/auchenai-crypts', i18n: 'warcraft:zones.3790', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon9': {slug: 'pve/tbc-dungeons/sethekk-halls', i18n: 'warcraft:zones.3791', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon10': {slug: 'pve/tbc-dungeons/shadow-labyrinth', i18n: 'warcraft:zones.3789', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon11': {slug: 'pve/tbc-dungeons/the-mechanar', i18n: 'warcraft:zones.3849', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon12': {slug: 'pve/tbc-dungeons/the-botanica', i18n: 'warcraft:zones.3847', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},
      'tbcdungeon13': {slug: 'pve/tbc-dungeons/magisters-terrace', i18n: 'warcraft:zones.4131', parent: 'tbcdungeon', types: ['WEAKAURA'], games: ['tbc']},

      // classic
      'raidnaxxramas': {slug: 'pve/naxxramas', image: 'naxxramas', color: '#B3ACAC', i18n: 'warcraft:zones.3456', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidnaxxramas1': {slug: 'pve/naxxramas/anub-rekhan', i18n: 'warcraft:bosses.15956', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas2': {slug: 'pve/naxxramas/grand-widow-faerlina', i18n: 'warcraft:bosses.15953', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas3': {slug: 'pve/naxxramas/maexxna', i18n: 'warcraft:bosses.15952', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas4': {slug: 'pve/naxxramas/noth-the-plaguebringer', i18n: 'warcraft:bosses.15954', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas5': {slug: 'pve/naxxramas/heigan-the-unclean', i18n: 'warcraft:bosses.15936', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas6': {slug: 'pve/naxxramas/loatheb', i18n: 'warcraft:bosses.16011', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas7': {slug: 'pve/naxxramas/patchwerk', i18n: 'warcraft:bosses.16028', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas8': {slug: 'pve/naxxramas/grobbulus', i18n: 'warcraft:bosses.15931', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas9': {slug: 'pve/naxxramas/gluth', i18n: 'warcraft:bosses.15932', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas10': {slug: 'pve/naxxramas/thaddius', i18n: 'warcraft:bosses.15928', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas11': {slug: 'pve/naxxramas/instructor-razuvious', i18n: 'warcraft:bosses.16061', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas12': {slug: 'pve/naxxramas/gothik-the-harvester', i18n: 'warcraft:bosses.16060', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas13': {slug: 'pve/naxxramas/the-four-horsemen', i18n: 'warcraft:bosses.181366', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas14': {slug: 'pve/naxxramas/sapphiron', i18n: 'warcraft:bosses.15989', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},
      'raidnaxxramas15': {slug: 'pve/naxxramas/kel-thuzad', i18n: 'warcraft:bosses.15990', parent: 'raidnaxxramas', types: ['WEAKAURA'], games: ['classic']},

      'raidtempleaq': {slug: 'pve/temple-of-ahn-qiraj', image: 'aq40', color: '#DF86B2', i18n: 'warcraft:zones.3428', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidtempleaq1': {slug: 'pve/temple-of-ahn-qiraj/the-prophet-skeram', i18n: 'warcraft:bosses.15263', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq2': {slug: 'pve/temple-of-ahn-qiraj/bug-trio', i18n: 'warcraft:bosses.15543', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq3': {slug: 'pve/temple-of-ahn-qiraj/battleguard-sartura', i18n: 'warcraft:bosses.15516', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq4': {slug: 'pve/temple-of-ahn-qiraj/fankriss-the-undying', i18n: 'warcraft:bosses.15510', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq5': {slug: 'pve/temple-of-ahn-qiraj/viscidus', i18n: 'warcraft:bosses.15299', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq6': {slug: 'pve/temple-of-ahn-qiraj/princess-huhuran', i18n: 'warcraft:bosses.15509', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq7': {slug: 'pve/temple-of-ahn-qiraj/twin-emperors', i18n: 'warcraft:bosses.15276', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq8': {slug: 'pve/temple-of-ahn-qiraj/ouro', i18n: 'warcraft:bosses.15517', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},
      'raidtempleaq9': {slug: 'pve/temple-of-ahn-qiraj/cthun', i18n: 'warcraft:bosses.15727', parent: 'raidtempleaq', types: ['WEAKAURA'], games: ['classic']},

      'raidruinsaq': {slug: 'pve/ruins-of-ahn-qiraj', image: 'aq20', color: '#00EE7A', i18n: 'warcraft:zones.3429', parent: 'raidruinsaq', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidruinsaq1': {slug: 'pve/ruins-of-ahn-qiraj/kurinaxx', i18n: 'warcraft:bosses.15348', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},
      'raidruinsaq2': {slug: 'pve/ruins-of-ahn-qiraj/general-rajaxx', i18n: 'warcraft:bosses.15341', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},
      'raidruinsaq3': {slug: 'pve/ruins-of-ahn-qiraj/moam', i18n: 'warcraft:bosses.15340', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},
      'raidruinsaq4': {slug: 'pve/ruins-of-ahn-qiraj/buru-the-gorger', i18n: 'warcraft:bosses.15370', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},
      'raidruinsaq5': {slug: 'pve/ruins-of-ahn-qiraj/ayamiss-the-hunter', i18n: 'warcraft:bosses.15369', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},
      'raidruinsaq6': {slug: 'pve/ruins-of-ahn-qiraj/ossirian-the-unscarred', i18n: 'warcraft:bosses.15339', parent: 'raidruinsaq', types: ['WEAKAURA'], games: ['classic']},

      'raidzulgurub': {slug: 'pve/zul-gurub', image: 'zulgurub', color: '#B8FF25', i18n: 'warcraft:zones.1977', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidzulgurub2': {slug: 'pve/zul-gurub/high-priestess-jeklik', i18n: 'warcraft:bosses.14517', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub1': {slug: 'pve/zul-gurub/high-priest-venoxis', i18n: 'warcraft:bosses.14507', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub3': {slug: 'pve/zul-gurub/high-priestess-mar-li', i18n: 'warcraft:bosses.14510', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub6': {slug: 'pve/zul-gurub/bloodlord-mandokir', i18n: 'warcraft:bosses.11382', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub7': {slug: 'pve/zul-gurub/edge-of-madness', i18n: 'warcraft:bosses.15083', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub4': {slug: 'pve/zul-gurub/high-priest-thekal', i18n: 'warcraft:bosses.14509', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub8': {slug: 'pve/zul-gurub/gahzranka', i18n: 'warcraft:bosses.15114', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub5': {slug: 'pve/zul-gurub/high-priestess-arlokk', i18n: 'warcraft:bosses.14515', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub9': {slug: 'pve/zul-gurub/jindo-the-hexer', i18n: 'warcraft:bosses.11380', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},
      'raidzulgurub10': {slug: 'pve/zul-gurub/hakkar', i18n: 'warcraft:bosses.14834', parent: 'raidzulgurub', types: ['WEAKAURA'], games: ['classic']},

      'raidblackwinglair': {slug: 'pve/blackwing-lair', image: 'blackwinglair', color: '#007AEE', i18n: 'warcraft:zones.2677', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidblackwinglair1': {slug: 'pve/blackwing-lair/razorgore-the-untamed', i18n: 'warcraft:bosses.12435', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair2': {slug: 'pve/blackwing-lair/vaelastrasz-the-corrupt', i18n: 'warcraft:bosses.13020', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair3': {slug: 'pve/blackwing-lair/broodlord-lashlayer', i18n: 'warcraft:bosses.12017', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair4': {slug: 'pve/blackwing-lair/firemaw', i18n: 'warcraft:bosses.11983', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair5': {slug: 'pve/blackwing-lair/ebonroc', i18n: 'warcraft:bosses.14601', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair6': {slug: 'pve/blackwing-lair/flamegor', i18n: 'warcraft:bosses.11981', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair7': {slug: 'pve/blackwing-lair/chromaggus', i18n: 'warcraft:bosses.14020', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},
      'raidblackwinglair8': {slug: 'pve/blackwing-lair/nefarian', i18n: 'warcraft:bosses.11583', parent: 'raidblackwinglair', types: ['WEAKAURA'], games: ['classic']},

      'raidmoltencore': {slug: 'pve/molten-core', image: 'moltencore', color: '#F6921A', i18n: 'warcraft:zones.2717', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'raidmoltencore1': {slug: 'pve/molten-core/lucifron', i18n: 'warcraft:bosses.12118', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore2': {slug: 'pve/molten-core/magmadar', i18n: 'warcraft:bosses.11982', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore3': {slug: 'pve/molten-core/gehennas', i18n: 'warcraft:bosses.12259', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore4': {slug: 'pve/molten-core/garr', i18n: 'warcraft:bosses.12057', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore5': {slug: 'pve/molten-core/shazzrah', i18n: 'warcraft:bosses.12264', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore6': {slug: 'pve/molten-core/baron-geddon', i18n: 'warcraft:bosses.12056', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore7': {slug: 'pve/molten-core/golemagg-the-incinerator', i18n: 'warcraft:bosses.11988', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore8': {slug: 'pve/molten-core/sulfuron-harbinger', i18n: 'warcraft:bosses.12098', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore9': {slug: 'pve/molten-core/majordomo-executus', i18n: 'warcraft:bosses.12018', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},
      'raidmoltencore10': {slug: 'pve/molten-core/ragnaros', i18n: 'warcraft:bosses.11502', parent: 'raidmoltencore', types: ['WEAKAURA'], games: ['classic']},

      'raidworld': {slug: 'pve/single-raid', image: 'worldboss', color: '#CC0DBC', i18n: 'Single Bosses', types: ['WEAKAURA'], games: ['classic']},
      'raidworld1': {slug: 'pve/single-raid/onyxia', i18n: 'warcraft:bosses.10184', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld2': {slug: 'pve/single-raid/azuregos', i18n: 'warcraft:bosses.6109', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld3': {slug: 'pve/single-raid/kazzak', i18n: 'warcraft:bosses.12397', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld4': {slug: 'pve/single-raid/lethon', i18n: 'warcraft:bosses.14888', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld5': {slug: 'pve/single-raid/emeriss', i18n: 'warcraft:bosses.14889', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld6': {slug: 'pve/single-raid/taerar', i18n: 'warcraft:bosses.14890', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},
      'raidworld7': {slug: 'pve/single-raid/ysondre', i18n: 'warcraft:bosses.14887', parent: 'raidworld', types: ['WEAKAURA'], games: ['classic']},

      'classicdungeon': {slug: 'pve/classic-dungeons', image: 'dungeon', color: '#F5A623', i18n: 'warcraft:zones.2437', types: ['WEAKAURA', 'COLLECTION'], games: ['classic']},
      'classicdungeon1': {slug: 'pve/classic-dungeons/ragefire-chasm', i18n: 'warcraft:zones.2437', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon2': {slug: 'pve/classic-dungeons/wailing-caverns', i18n: 'warcraft:zones.718', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon3': {slug: 'pve/classic-dungeons/the-deadmines', i18n: 'warcraft:zones.1581', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon4': {slug: 'pve/classic-dungeons/shadowfang-keep', i18n: 'warcraft:zones.209', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon5': {slug: 'pve/classic-dungeons/blackfathom-deeps', i18n: 'warcraft:zones.719', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon6': {slug: 'pve/classic-dungeons/the-stockade', i18n: 'warcraft:zones.717', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon7': {slug: 'pve/classic-dungeons/gnomeregan', i18n: 'warcraft:zones.721', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon8': {slug: 'pve/classic-dungeons/razorfen-kraul', i18n: 'warcraft:zones.491', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon9': {slug: 'pve/classic-dungeons/the-scarlet-monastery', i18n: 'warcraft:zones.796', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon10': {slug: 'pve/classic-dungeons/razorfen-downs', i18n: 'warcraft:zones.722', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon11': {slug: 'pve/classic-dungeons/uldaman', i18n: 'warcraft:zones.1337', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon12': {slug: 'pve/classic-dungeons/zul-ferrak', i18n: 'warcraft:zones.1176', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon13': {slug: 'pve/classic-dungeons/mauradon', i18n: 'warcraft:zones.2100', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon14': {slug: 'pve/classic-dungeons/temple-of-atal-hakkar', i18n: 'warcraft:zones.1477', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon15': {slug: 'pve/classic-dungeons/blackrock-depths', i18n: 'warcraft:zones.1584', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon16': {slug: 'pve/classic-dungeons/blackrock-spire', i18n: 'warcraft:zones.1583', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon17': {slug: 'pve/classic-dungeons/dire-maul', i18n: 'warcraft:zones.2557', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon18': {slug: 'pve/classic-dungeons/stratholme', i18n: 'warcraft:zones.2017', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},
      'classicdungeon19': {slug: 'pve/classic-dungeons/scholomance', i18n: 'warcraft:zones.2057', parent: 'classicdungeon', types: ['WEAKAURA'], games: ['classic']},

      'torghast': {slug: 'pve/torghast', image: 'torghast', color: '#D80143', i18n: 'warcraft:zones.Torghast', types: ['WEAKAURA'], games: ['sl']},
      'torghast1': {slug: 'pve/torghast/encounters', i18n: 'Encounters', parent: 'torghast', types: ['WEAKAURA'], games: ['sl']},
      'torghast2': {slug: 'pve/torghast/anima', i18n: 'Anima', parent: 'torghast', types: ['WEAKAURA'], games: ['sl']},

      'pvp': {slug: 'pvp', image: 'pvp', color: '#ed1b24', i18n: 'PvP', types: ['WEAKAURA']},
      'arena': {slug: 'pvp/arena', i18n: 'Arena', parent: 'pvp', types: ['WEAKAURA'], games: ['tbc', 'legion', 'bfa', 'sl']},
      'bg': {slug: 'pvp/battlegrounds', i18n: 'Battlegrounds', parent: 'pvp'},
      'wpvp': {slug: 'pvp/world-pvp', i18n: 'World PvP', parent: 'pvp'},
      'wpvp1': {slug: 'pvp/duels', i18n: 'Duels', parent: 'pvp'},

      'prof1': {slug: 'professions/gathering', image: 'gathering', color: '#5E63B8', i18n: 'Gathering Professions', types: ['WEAKAURA', 'OPIE']},
      'prof2': {slug: 'professions/gathering/herbalism', i18n: 'warcraft:professions.herbalism', parent: 'prof1', types: ['WEAKAURA', 'OPIE']},
      'prof3': {slug: 'professions/gathering/mining', i18n: 'warcraft:professions.mining', parent: 'prof1', types: ['WEAKAURA', 'OPIE']},
      'prof4': {slug: 'professions/gathering/skinning', i18n: 'warcraft:professions.skinning', parent: 'prof1', types: ['WEAKAURA', 'OPIE']},
      'prof5': {slug: 'professions/crafting', image: 'crafting', color: '#B85E5F', i18n: 'Crafting Professions', types: ['WEAKAURA', 'OPIE']},
      'prof6': {slug: 'professions/crafting/alchemy', i18n: 'warcraft:professions.alchemy', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof7': {slug: 'professions/crafting/blacksmithing', i18n: 'warcraft:professions.blacksmith', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof8': {slug: 'professions/crafting/enchanting', i18n: 'warcraft:professions.enchanting', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof9': {slug: 'professions/crafting/engineering', i18n: 'warcraft:professions.engineering', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof10': {slug: 'professions/crafting/inscription', i18n: 'warcraft:professions.inscription', parent: 'prof5', types: ['WEAKAURA', 'OPIE'], games: ['legion', 'bfa', 'sl']},
      'prof11': {slug: 'professions/crafting/jewelcrafting', i18n: 'warcraft:professions.jewelcrafting', parent: 'prof5', types: ['WEAKAURA', 'OPIE'], games: ['tbc', 'legion', 'bfa', 'sl']},
      'prof12': {slug: 'professions/crafting/leatherworking', i18n: 'warcraft:professions.leatherworking', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof13': {slug: 'professions/crafting/tailoring', i18n: 'warcraft:professions.tailoring', parent: 'prof5', types: ['WEAKAURA', 'OPIE']},
      'prof14': {slug: 'professions/secondary', image: 'secondaryprof', color: '#C4C4C4', i18n: 'Secondary Professions', types: ['WEAKAURA', 'OPIE']},
      'prof15': {slug: 'professions/secondary/archeology', i18n: 'warcraft:professions.archeology', parent: 'prof14', types: ['WEAKAURA', 'OPIE'], games: ['legion', 'bfa']},
      'prof16': {slug: 'professions/secondary/cooking', i18n: 'warcraft:professions.cooking', parent: 'prof14', types: ['WEAKAURA', 'OPIE']},
      'prof17': {slug: 'professions/secondary/first-aid', i18n: 'warcraft:professions.firstaid', parent: 'prof14', types: ['WEAKAURA', 'OPIE'], games: ['classic', 'tbc', 'legion']},
      'prof18': {slug: 'professions/secondary/fishing', i18n: 'warcraft:professions.fishing', parent: 'prof14', types: ['WEAKAURA', 'OPIE']},

      'gen5': {slug: 'development', image: 'development', color: '#D27B61', i18n: 'Development', types: ['WEAKAURA']},
      'gen3': {slug: 'development/testing', i18n: 'Testing', parent: 'development', types: ['WEAKAURA']},
      'gen4': {slug: 'development/wa-training', i18n: 'WA Training', parent: 'development', types: ['WEAKAURA']},

      'mdtdun15': {slug: 'pve/dungeons/atal-dazar', i18n: 'warcraft:zones.9028', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun16': {slug: 'pve/dungeons/freehold', i18n: 'warcraft:zones.9164', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun16-crew2': {slug: 'pve/dungeons/freehold/bilge-rats', i18n: 'Bilge Rats Crew', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun16-crew1': {slug: 'pve/dungeons/freehold/blacktooth', i18n: 'Blacktooth Crew', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun16-crew3': {slug: 'pve/dungeons/freehold/cutwater', i18n: 'Cutwater Crew', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun17': {slug: 'pve/dungeons/kings-rest', i18n: 'warcraft:zones.9526', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun18': {slug: 'pve/dungeons/shrine-of-the-storm', i18n: 'warcraft:zones.9525', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun19': {slug: 'pve/dungeons/siege-of-boralus', i18n: 'warcraft:zones.9354', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun19-faction2': {slug: 'pve/dungeons/siege-of-boralus/alliance', i18n: 'Alliance', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun19-faction1': {slug: 'pve/dungeons/siege-of-boralus/horde', i18n: 'Horde', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun20': {slug: 'pve/dungeons/temple-of-sethraliss', i18n: 'warcraft:zones.9527', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun21': {slug: 'pve/dungeons/the-motherlode', i18n: 'warcraft:zones.8064', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun22': {slug: 'pve/dungeons/the-underrot', i18n: 'warcraft:zones.9391', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun23': {slug: 'pve/dungeons/tol-dagor', i18n: 'warcraft:zones.9327', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun24': {slug: 'pve/dungeons/waycrest-manor', i18n: 'warcraft:zones.9424', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun25': {slug: 'pve/dungeons/mechagon-junkyard', i18n: 'warcraft:zones.10225a', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdtdun26': {slug: 'pve/dungeons/mechagon-workshop', i18n: 'warcraft:zones.10225b', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['bfa']},
      'mdt-sldun29': {slug: 'pve/shadowlands-dungeons/de-other-side', i18n: 'warcraft:zones.DeOtherSide', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun30': {slug: 'pve/shadowlands-dungeons/halls-of-atonement', i18n: 'warcraft:zones.HallsOfAttonement', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun31': {slug: 'pve/shadowlands-dungeons/mists-of-tirna-scithe', i18n: 'warcraft:zones.MistsOfTirnaScithe', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun32': {slug: 'pve/shadowlands-dungeons/plaguefall', i18n: 'warcraft:zones.Plaguefall', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun33': {slug: 'pve/shadowlands-dungeons/sanguine-depths', i18n: 'warcraft:zones.SanguineDepths', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun34': {slug: 'pve/shadowlands-dungeons/spires-of-ascension', i18n: 'warcraft:zones.SpiresOfAscension', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun35': {slug: 'pve/shadowlands-dungeons/the-necrotic-wake', i18n: 'warcraft:zones.TheNecroticWake', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdt-sldun36': {slug: 'pve/shadowlands-dungeons/theater-of-pain', i18n: 'warcraft:zones.TheaterOfPain', system: true, parent: 'mdtdungeon', types: ['MDT'], games: ['sl']},
      'mdtaffix': {slug: 'affixes', image: 'affixes', color: '#ef2254', i18n: 'Affixes', system: true, types: ['MDT']},
      'mdtaffix2': {slug: 'affixes/skittish', i18n: 'Skittish', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix3': {slug: 'affixes/volcanic', i18n: 'Volcanic', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix4': {slug: 'affixes/necrotic', i18n: 'Necrotic', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix5': {slug: 'affixes/teeming', i18n: 'Teeming', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix6': {slug: 'affixes/raging', i18n: 'Raging', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix7': {slug: 'affixes/bolstering', i18n: 'Bolstering', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix8': {slug: 'affixes/sanguine', i18n: 'Sanguine', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix9': {slug: 'affixes/tyrannical', i18n: 'Tyrannical', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix10': {slug: 'affixes/fortified', i18n: 'Fortified', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix11': {slug: 'affixes/bursting', i18n: 'Bursting', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix12': {slug: 'affixes/grievous', i18n: 'Grievous', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix13': {slug: 'affixes/explosive', i18n: 'Explosive', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix14': {slug: 'affixes/quaking', i18n: 'Quaking', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix16': {slug: 'affixes/infested', i18n: 'Infested', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix117': {slug: 'affixes/reaping', i18n: 'Reaping', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix119': {slug: 'affixes/beguiling', i18n: 'Beguiling', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix120': {slug: 'affixes/awakened', i18n: 'Awakened', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix121': {slug: 'affixes/prideful', i18n: 'Prideful', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix122': {slug: 'affixes/inspiring', i18n: 'Inspiring', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix123': {slug: 'affixes/spiteful', i18n: 'Spiteful', system: true, parent: 'affixes', types: ['MDT']},
      'mdtaffix124': {slug: 'affixes/storming', i18n: 'Storming', system: true, parent: 'affixes', types: ['MDT']},
      // 'mdtaffix-bfa-s1-w1': {slug: 'affixes/s1/week1', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w2': {slug: 'affixes/s1/week2', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w3': {slug: 'affixes/s1/week3', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w4': {slug: 'affixes/s1/week4', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w5': {slug: 'affixes/s1/week5', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w6': {slug: 'affixes/s1/week6', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w7': {slug: 'affixes/s1/week7', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w8': {slug: 'affixes/s1/week8', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w9': {slug: 'affixes/s1/week9', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w10': {slug: 'affixes/s1/week10', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w11': {slug: 'affixes/s1/week11', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s1-w12': {slug: 'affixes/s1/week12', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w1': {slug: 'affixes/s2/week1', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w2': {slug: 'affixes/s2/week2', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w3': {slug: 'affixes/s2/week3', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w4': {slug: 'affixes/s2/week4', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w5': {slug: 'affixes/s2/week5', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w6': {slug: 'affixes/s2/week6', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w7': {slug: 'affixes/s2/week7', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w8': {slug: 'affixes/s2/week8', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w9': {slug: 'affixes/s2/week9', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w10': {slug: 'affixes/s2/week10', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w11': {slug: 'affixes/s2/week11', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s2-w12': {slug: 'affixes/s2/week12', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w1': {slug: 'affixes/s3/week1', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w2': {slug: 'affixes/s3/week2', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w3': {slug: 'affixes/s3/week3', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w4': {slug: 'affixes/s3/week4', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w5': {slug: 'affixes/s3/week5', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w6': {slug: 'affixes/s3/week6', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w7': {slug: 'affixes/s3/week7', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w8': {slug: 'affixes/s3/week8', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w9': {slug: 'affixes/s3/week9', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w10': {slug: 'affixes/s3/week10', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w11': {slug: 'affixes/s3/week11', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s3-w12': {slug: 'affixes/s3/week12', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w1': {slug: 'affixes/s4/week1', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w2': {slug: 'affixes/s4/week2', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w3': {slug: 'affixes/s4/week3', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w4': {slug: 'affixes/s4/week4', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w5': {slug: 'affixes/s4/week5', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w6': {slug: 'affixes/s4/week6', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w7': {slug: 'affixes/s4/week7', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w8': {slug: 'affixes/s4/week8', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w9': {slug: 'affixes/s4/week9', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w10': {slug: 'affixes/s4/week10', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w11': {slug: 'affixes/s4/week11', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-bfa-s4-w12': {slug: 'affixes/s4/week12', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w1': {slug: 'affixes/shadowlands-s1/week-1', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w2': {slug: 'affixes/shadowlands-s1/week-2', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w3': {slug: 'affixes/shadowlands-s1/week-3', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w4': {slug: 'affixes/shadowlands-s1/week-4', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w5': {slug: 'affixes/shadowlands-s1/week-5', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w6': {slug: 'affixes/shadowlands-s1/week-6', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w7': {slug: 'affixes/shadowlands-s1/week-7', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w8': {slug: 'affixes/shadowlands-s1/week-8', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w9': {slug: 'affixes/shadowlands-s1/week-9', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w10': {slug: 'affixes/shadowlands-s1/week-10', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w11': {slug: 'affixes/shadowlands-s1/week-11', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      // 'mdtaffix-sl-s1-w12': {slug: 'affixes/shadowlands-s1/week-12', i18n: '[-affix1-], [-affix2-], [-affix3-], [-affix4-]'},
      'mdtspeed': {slug: 'speed', image: 'speed', color: '#42bce4', i18n: 'Speed', types: ['MDT']},
      'mdtspeed1': {slug: 'speed/easy-going', i18n: 'Easy Going', parent: 'speed', types: ['MDT']},
      'mdtspeed2': {slug: 'speed/gotta-go-fast', i18n: 'Gotta Go Fast', parent: 'speed', types: ['MDT']},
      'mdtspeed3': {slug: 'speed/racing-number-one', i18n: 'Racing for #1', parent: 'speed', types: ['MDT']},
      // 'mdtcl6': {slug: 'classes/death-knight', cls: 'cl-deathknight', color: '#123456', i18n: 'warcraft:classes.6'},
      // 'mdtcl6-1': {slug: 'classes/death-knight/blood', cls: 'cl-deathknight', color: '#123456', i18n: 'warcraft:classes.6-1'},
      // 'mdtcl6-2': {slug: 'classes/death-knight/frost', cls: 'cl-deathknight', color: '#123456', i18n: 'warcraft:classes.6-2'},
      // 'mdtcl6-3': {slug: 'classes/death-knight/unholy', cls: 'cl-deathknight', color: '#123456', i18n: 'warcraft:classes.6-3'},
      // 'mdtcl12': {slug: 'classes/demon-hunter', cls: 'cl-demonhunter', color: '#123456', i18n: 'warcraft:classes.12'},
      // 'mdtcl12-1': {slug: 'classes/demon-hunter/havoc', cls: 'cl-demonhunter', color: '#123456', i18n: 'warcraft:classes.12-1'},
      // 'mdtcl12-2': {slug: 'classes/demon-hunter/vengeance', cls: 'cl-demonhunter', color: '#123456', i18n: 'warcraft:classes.12-2'},
      // 'mdtcl11': {slug: 'classes/druid', cls: 'cl-druid', color: '#123456', i18n: 'warcraft:classes.11'},
      // 'mdtcl11-1': {slug: 'classes/druid/balance', cls: 'cl-druid', color: '#123456', i18n: 'warcraft:classes.11-1'},
      // 'mdtcl11-2': {slug: 'classes/druid/feral', cls: 'cl-druid', color: '#123456', i18n: 'warcraft:classes.11-2'},
      // 'mdtcl11-3': {slug: 'classes/druid/guardian', cls: 'cl-druid', color: '#123456', i18n: 'warcraft:classes.11-3'},
      // 'mdtcl11-4': {slug: 'classes/druid/restoration', cls: 'cl-druid', color: '#123456', i18n: 'warcraft:classes.11-4'},
      // 'mdtcl3': {slug: 'classes/hunter', cls: 'cl-hunter', color: '#123456', i18n: 'warcraft:classes.3'},
      // 'mdtcl3-1': {slug: 'classes/hunter/beast-mastery', cls: 'cl-hunter', color: '#123456', i18n: 'warcraft:classes.3-1'},
      // 'mdtcl3-2': {slug: 'classes/hunter/marksmanship', cls: 'cl-hunter', color: '#123456', i18n: 'warcraft:classes.3-2'},
      // 'mdtcl3-3': {slug: 'classes/hunter/survival', cls: 'cl-hunter', color: '#123456', i18n: 'warcraft:classes.3-3'},
      // 'mdtcl8': {slug: 'classes/mage', cls: 'cl-mage', color: '#123456', i18n: 'warcraft:classes.8'},
      // 'mdtcl8-1': {slug: 'classes/mage/arcane', cls: 'cl-mage', color: '#123456', i18n: 'warcraft:classes.8-1'},
      // 'mdtcl8-2': {slug: 'classes/mage/fire', cls: 'cl-mage', color: '#123456', i18n: 'warcraft:classes.8-2'},
      // 'mdtcl8-3': {slug: 'classes/mage/frost', cls: 'cl-mage', color: '#123456', i18n: 'warcraft:classes.8-3'},
      // 'mdtcl10': {slug: 'classes/monk', cls: 'cl-monk', color: '#123456', i18n: 'warcraft:classes.10'},
      // 'mdtcl10-1': {slug: 'classes/monk/brewmaster', cls: 'cl-monk', color: '#123456', i18n: 'warcraft:classes.10-1'},
      // 'mdtcl10-2': {slug: 'classes/monk/mistweaver', cls: 'cl-monk', color: '#123456', i18n: 'warcraft:classes.10-2'},
      // 'mdtcl10-3': {slug: 'classes/monk/windwalker', cls: 'cl-monk', color: '#123456', i18n: 'warcraft:classes.10-3'},
      // 'mdtcl2': {slug: 'classes/paladin', cls: 'cl-paladin', color: '#123456', i18n: 'warcraft:classes.2'},
      // 'mdtcl2-1': {slug: 'classes/paladin/holy', cls: 'cl-paladin', color: '#123456', i18n: 'warcraft:classes.2-1'},
      // 'mdtcl2-2': {slug: 'classes/paladin/protection', cls: 'cl-paladin', color: '#123456', i18n: 'warcraft:classes.2-2'},
      // 'mdtcl2-3': {slug: 'classes/paladin/retribution', cls: 'cl-paladin', color: '#123456', i18n: 'warcraft:classes.2-3'},
      // 'mdtcl5': {slug: 'classes/priest', cls: 'cl-priest', color: '#123456', i18n: 'warcraft:classes.5'},
      // 'mdtcl5-1': {slug: 'classes/priest/discipline', cls: 'cl-priest', color: '#123456', i18n: 'warcraft:classes.5-1'},
      // 'mdtcl5-2': {slug: 'classes/priest/holy', cls: 'cl-priest', color: '#123456', i18n: 'warcraft:classes.5-2'},
      // 'mdtcl5-3': {slug: 'classes/priest/shadow', cls: 'cl-priest', color: '#123456', i18n: 'warcraft:classes.5-3'},
      // 'mdtcl4': {slug: 'classes/rogue', cls: 'cl-rogue', color: '#123456', i18n: 'warcraft:classes.4'},
      // 'mdtcl4-1': {slug: 'classes/rogue/assassination', cls: 'cl-rogue', color: '#123456', i18n: 'warcraft:classes.4-1'},
      // 'mdtcl4-2': {slug: 'classes/rogue/outlaw', cls: 'cl-rogue', color: '#123456', i18n: 'warcraft:classes.4-2'},
      // 'mdtcl4-3': {slug: 'classes/rogue/subtlety', cls: 'cl-rogue', color: '#123456', i18n: 'warcraft:classes.4-3'},
      // 'mdtcl7': {slug: 'classes/shaman', cls: 'cl-shaman', color: '#123456', i18n: 'warcraft:classes.7'},
      // 'mdtcl7-1': {slug: 'classes/shaman/elemental', cls: 'cl-shaman', color: '#123456', i18n: 'warcraft:classes.7-1'},
      // 'mdtcl7-2': {slug: 'classes/shaman/enhancement', cls: 'cl-shaman', color: '#123456', i18n: 'warcraft:classes.7-2'},
      // 'mdtcl7-3': {slug: 'classes/shaman/restoration', cls: 'cl-shaman', color: '#123456', i18n: 'warcraft:classes.7-3'},
      // 'mdtcl9': {slug: 'classes/warlock', cls: 'cl-warlock', color: '#123456', i18n: 'warcraft:classes.9'},
      // 'mdtcl9-1': {slug: 'classes/warlock/affliction', cls: 'cl-warlock', color: '#123456', i18n: 'warcraft:classes.9-1'},
      // 'mdtcl9-2': {slug: 'classes/warlock/demonology', cls: 'cl-warlock', color: '#123456', i18n: 'warcraft:classes.9-2'},
      // 'mdtcl9-3': {slug: 'classes/warlock/destruction', cls: 'cl-warlock', color: '#123456', i18n: 'warcraft:classes.9-3'},
      // 'mdtcl1': {slug: 'classes/warrior', cls: 'cl-warrior', color: '#123456', i18n: 'warcraft:classes.1'},
      // 'mdtcl1-1': {slug: 'classes/warrior/arms', cls: 'cl-warrior', color: '#123456', i18n: 'warcraft:classes.1-1'},
      // 'mdtcl1-2': {slug: 'classes/warrior/fury', cls: 'cl-warrior', color: '#123456', i18n: 'warcraft:classes.1-2'},
      // 'mdtcl1-3': {slug: 'classes/warrior/protection', cls: 'cl-warrior', color: '#123456', i18n: 'warcraft:classes.1-3'},

      'snip0': {slug: 'snippets', image: 'snippets', color: '#d18cf3', i18n: 'Code Snippets', types: ['SNIPPET']},
      'snip1': {slug: 'snippets/libraries', i18n: 'Libraries', parent: 'snip0', types: ['SNIPPET']},
      'snip2': {slug: 'snippets/tutorials', i18n: 'Tutorials', parent: 'snip0', types: ['SNIPPET']},

      'opie1': {slug: 'group-buffs', image: 'opie', color: '#2595E6', i18n: 'Group Buffs', types: ['OPIE']},
      'opie2': {slug: 'consumables', image: 'opie', color: '#2595E6', i18n: 'Consumables', types: ['OPIE']},
      'opie3': {slug: 'vehicles', image: 'opie', color: '#2595E6', i18n: 'Vehicles', types: ['OPIE']},
      'opie4': {slug: 'equipment', image: 'opie', color: '#2595E6', i18n: 'Equipment', types: ['OPIE']},
      'opie5': {slug: 'equipment/trinkets', image: 'opie', color: '#2595E6', i18n: 'Trinkets', types: ['OPIE']},
      'opie6': {slug: 'utility', image: 'opie', color: '#2595E6', i18n: 'Utility', types: ['OPIE']},

      'plater1': {slug: 'plater-profiles', image: 'plater', color: '#FFC972', i18n: 'Plater Profiles', system: true, types: ['PLATER']},
      'plater2': {slug: 'plater-scripts', image: 'plater', color: '#FFC972', i18n: 'Plater Scripts', system: true, types: ['PLATER']},
      'plater3': {slug: 'plater-mods', image: 'plater', color: '#FFC972', i18n: 'Plater Mods', system: true, types: ['PLATER']},
      'plater4': {slug: 'plater-animations', image: 'plater', color: '#FFC972', i18n: 'Plater Animations', system: true, types: ['PLATER']},
      'plater5': {slug: 'plater-npc-colors', image: 'plater', color: '#FFC972', i18n: 'Plater NPC Colors', system: true, types: ['PLATER']},

      'platerutilities': {slug: 'utilities', image: 'snippets', color: '#d18cf3', i18n: 'Utilities', types: ['PLATER']},
      'platerdungeons': {slug: 'dungeons', image: 'snippets', color: '#d18cf3', i18n: 'Dungeons', types: ['PLATER']},
      'platerpvp': {slug: 'pvp', image: 'snippets', color: '#d18cf3', i18n: 'PvP', types: ['PLATER']},
      'platertorghast': {slug: 'torghast', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.Torghast', types: ['PLATER']},
      'platernathria': {slug: 'castle-nathria', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.CastleNathria', types: ['PLATER']},
      'platersanctumdominion': {slug: 'sanctum-of-dominion', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.SanctumOfDomination', types: ['PLATER']},
      'platerraidzuldazar': {slug: 'battle-of-zuldazar', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.10076', types: ['PLATER']},
      'platerraidcrucible': {slug: 'crucible-of-storms', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.10057', types: ['PLATER']},
      'platerraiduldir': {slug: 'uldir', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.9389', types: ['PLATER']},
      'platerraideternalpalace': {slug: 'the-eternal-palace', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.10425', types: ['PLATER']},
      'platerraidnyalotha': {slug: 'nyalotha', image: 'snippets', color: '#d18cf3', i18n: 'warcraft:zones.nyalotha', types: ['PLATER']},

      'totalrp1': {slug: 'campaigns', image: 'trpcamp', color: '#C3793A', i18n: 'Campaigns', types: ['TOTALRP3']},
      'totalrp2': {slug: 'campaigns/alliance-campaigns', i18n: 'Alliance Campaigns', parent: 'totalrp1', types: ['TOTALRP3']},
      'totalrp3': {slug: 'campaigns/horde-campaigns', i18n: 'Horde Campaigns', parent: 'totalrp1', types: ['TOTALRP3']},
      'totalrp4': {slug: 'items', image: 'equipment', color: '#7ED321', i18n: 'Items', types: ['TOTALRP3']},
      'totalrp6': {slug: 'items/containers', i18n: 'Containers', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp7': {slug: 'items/documents', i18n: 'Documents', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp8': {slug: 'items/equipment', i18n: 'Equipment', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp9': {slug: 'items/expert-mode', i18n: 'Expert Mode', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp10': {slug: 'items/normal-mode', i18n: 'Normal Mode', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp11': {slug: 'items/miscellaneous', i18n: 'Miscellaneous', parent: 'totalrp4', types: ['TOTALRP3']},
      'totalrp12': {slug: 'items/toys', i18n: 'Toys', parent: 'totalrp4', types: ['TOTALRP3']},
      'rplang1': {slug: 'english', image: 'lang', color: '#269C7D', i18n: 'English', types: ['TOTALRP3']},
      'rplang2': {slug: 'french', image: 'lang', color: '#269C7D', i18n: 'French', types: ['TOTALRP3']},
      'rplang3': {slug: 'spanish', image: 'lang', color: '#269C7D', i18n: 'Spanish', types: ['TOTALRP3']},
      'rplang4': {slug: 'german', image: 'lang', color: '#269C7D', i18n: 'German', types: ['TOTALRP3']},

      'vuhdo1': {slug: 'profiles', image: 'vuhdo', color: '#6BB85E', i18n: 'Vuhdo Profiles', system: true, types: ['VUHDO']},
      'vuhdo2': {slug: 'bouquets', image: 'vuhdo', color: '#6BB85E', i18n: 'Vuhdo Bouquets', system: true, types: ['VUHDO']},
      'vuhdo3': {slug: 'key-layouts', image: 'vuhdo', color: '#6BB85E', i18n: 'Vuhdo Key Layouts', system: true, types: ['VUHDO']}
    }
  }

  init (t) {
    if (!t) {
      t = window.i18next.t
    }

    let styles = ''
    let sort = 0
    for (const [id, cat] of Object.entries(this.categories)) {
      this.categories[id].id = id
      this.categories[id].text = t(cat.i18n)
      this.categories[id].sortVal = sort++

      let color = this.getAttr(cat, 'color')
      let image = this.getAttr(cat, 'image')
      if (!color || !image) {
        continue
      }
      styles += `
      .md-chip.${id}, .${id} .menu-image, .search-input .ql-editor .search-tag.category.${id} {color:${color}; background-image:url('/static/image/menu/${image}.png')}
      .${id}, .${id} a {color:${color}!important}
      .search-tag.${id} {border-color:${color}}
      .multiselect .md-chip.${id} {background: ${color}; color: black!important}`
    }

    const css = document.createElement('style')
    if (css.styleSheet) {
      css.styleSheet.cssText = styles
    }
    else {
      css.appendChild(document.createTextNode(styles))
    }
    document.getElementsByTagName('head')[0].appendChild(css)
  }

  translate (t) {
    let copy = {}
    for (const [id, cat] of Object.entries(this.categories)) {
      copy[id] = cat
      copy[id].text = t(cat.i18n)
    }
    return copy
  }

  match (item) {
    if (this.categories[item]) {
      return this.categories[item]
    }
    for (const cat of Object.values(this.categories)) {
      if (cat.text === item || cat.i18n === item) {
        return cat
      }
    }
    return null
  }

  matchChildren (parent, addon, game) {
    console.log('match children', parent, addon, game)
    if (!parent) return []
    let children = []
    for (const cat of Object.values(this.categories)) {
      if (cat.parent === parent && (!addon || !cat.types || cat.types.indexOf(addon) >= 0) && (!game || !cat.games || cat.games.indexOf(game) >= 0)) {
        children.push(cat)
      }
    }
    console.log(children)
    return children
  }

  search (str, addon, game) {
    let findStr = normalize(str)
    let c = this.match(findStr)
    if (c) {
      return c
    }

    addon = (addon || '').toUpperCase()
    game = (game || '').toLowerCase()
    console.log('libsearch', findStr, addon, game)
    for (const [id, cat] of Object.entries(this.categories)) {
      if ((findStr === normalize(cat.i18n) || findStr === normalize(cat.text) || findStr === normalize(cat.slug)) && (!addon || !cat.types || cat.types.indexOf(addon) >= 0) && (!game || !cat.games || cat.games.indexOf(game) >= 0)) {
        return cat
      }
    }

    if (str.match(/\./) && !str.match(/warcraft:/)) {
      return this.search('warcraft:' + str, addon, game)
    }
    return null
  }

  findMDTSeason (a1, a2, a3, a4) {
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
    for (const [id, cat] of Object.entries(this.categories)) {
      if (!cat.contains) {
        continue
      }
      if (cat.contains.indexOf(a1) >= 0 && cat.contains.indexOf(a2) >= 0 && cat.contains.indexOf(a3) >= 0 && cat.contains.indexOf(a4) >= 0) {
        try {
          return id.match(/mdtaffix-(\w+-s\d+)-/)[1]
        }
        catch (e) {
        }
      }
    }
    return null
  }

  getMDTAffixOptions (season) {
    var regex = new RegExp('^mdtaffix-' + season + '-')
    var opts = []
    for (const [id, cat] of Object.entries(this.categories)) {
      if (!cat.contains || !id.match(regex)) {
        continue
      }
      opts.push(cat.contains.map((x) => {
        return parseInt(x.replace(/[^\d]/g, ''))
      }))
    }
    return opts
  }

  classCategories (addon, game) {
    let classes = []
    for (const [id, cat] of Object.entries(this.categories)) {
      if (!cat.parent && id.match(/^cl\d/) && (!addon || !cat.types || cat.types.indexOf(addon) >= 0) && (!game || !cat.games || cat.games.indexOf(game) >= 0)) {
        cat.specs = this.matchChildren(id, addon, game)
        classes.push(cat)
      }
    }

    classes.sort(function (a, b) {
      if (a.text < b.text) {
        return -1
      }
      else {
        return 1
      }
    })

    return classes
  }

  raidCategories (zones) {
    let raids = []
    zones.forEach((zone) => {
      let z = this.match(zone)
      if (z) {
        console.log(z)
        z.bosses = this.matchChildren(z.id)
        raids.push(z)
      }
    })

    return raids
  }

  professionCategories (addon, game) {
    let gathering = this.categories.prof1
    gathering.specs = this.matchChildren('prof1', addon, game)

    let crafting = this.categories.prof5
    crafting.specs = this.matchChildren('prof5', addon, game)

    let secondary = this.categories.prof14
    secondary.specs = this.matchChildren('prof14', addon, game)

    return [crafting, gathering, secondary]
  }

  rootCategories (addon, game) {
    let roots = []
    for (const cat of Object.values(this.categories)) {
      if (!cat.parent && (!addon || !cat.types || cat.types.indexOf(addon) >= 0) && (!game || !cat.games || cat.games.indexOf(game) >= 0)) {
        roots.push(cat)
      }
    }
    return roots
  }

  validateCategories (cats) {
    let valid = []
    for (const cat of cats) {
      if (this.categories[cat]) {
        valid.push(cat)
        if (this.categories[cat].parent) {
          valid.push(this.categories[cat].parent)
        }
      }
    }

    return [...new Set(valid)]
  }

  filterSystemTags (cats) {
    let systemTags = []
    for (const cat of cats) {
      if (this.categories[cat] && this.categories[cat].system) {
        systemTags.push(cat)
      }
    }

    return [...new Set(systemTags)]
  }

  getCategories (cats, doNotSortAlpha, addon, game) {
    var selected = []
    if (!Array.isArray(cats)) {
      cats = [cats]
    }
    for (const search of cats) {
      for (const [id, cat] of Object.entries(this.categories)) {
        if (((search instanceof RegExp && id.match(search)) || search === id) && (!addon || !cat.types || cat.types.indexOf(addon) >= 0) && (!game || !cat.games || cat.games.indexOf(game) >= 0)) {
          selected.push(cat)
        }
      }
    }

    if (!doNotSortAlpha) {
      selected.sort(function (a, b) {
        if (a.text < b.text) {
          return -1
        }
        return 1
      })
    }
    return selected
  }

  getClones (id, addon) {
    const base = this.categories[id]
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
  }

  groupSets (cats) {
    var groups = []
    var current = []
    cats.forEach((cat) => {
      if (cat.system) {
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
  }

  relevanceScores (cats) {
    var scores = {
      standard: 0,
      strict: 0
    }
    for (const cat of cats) {
      if (!this.categories[cat] || this.categories[cat].system) {
        continue
      }
      scores.strict++
      if (!this.categories[cat].parent) {
        scores.standard++
      }
    }
    return scores
  }

  getAttr (cat, attr) {
    if (cat[attr]) {
      return cat[attr]
    }
    else if (cat.parent && this.categories[cat.parent] && this.categories[cat.parent][attr]) {
      return this.categories[cat.parent][attr]
    }
    return null
  }
}

module.exports = new Categories()