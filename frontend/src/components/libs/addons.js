const categories = require('./categories2')
module.exports = ($t) => [
    {name: 'Mists of Pandaria WeakAuras', url: '/mop-weakauras', color: 'cccccc', image: 'weakauras.png', expansions: ['mop'], group: 'tools'},
    {name: 'Dungeon WeakAuras', url: '/mop-weakauras/pve/mists-of-pandaria-dungeons', color: lookupColor('mopdungeon'), image: lookupIcon('mopdungeon'), expansions: ['mop'], group: 'tools'},
    {name: 'Throne of Thunder WeakAuras', url: '/mop-weakauras/pve/throne-of-thunder', color: lookupColor('raidthroneofthunder'), image: lookupIcon('raidthroneofthunder'), expansions: ['mop'], group: 'tools'},

    {name: 'Titan Reforged WeakAuras', url: '/titan-reforged-wotlk-weakauras', color: 'cccccc', image: 'weakauras.png', expansions: ['titan-wotlk'], group: 'tools'},

    {name: 'The Burning Crusade WeakAuras', url: '/tbc-weakauras', color: 'cccccc', image: 'weakauras.png', expansions: ['tbc'], group: 'tools'},
    {name: 'Dungeon WeakAuras', url: '/tbc-weakauras/pve/tbc-dungeons', color: lookupColor('tbcdungeon'), image: lookupIcon('tbcdungeon'), expansions: ['tbc'], group: 'tools'},
    {name: 'Karazhan WeakAuras', url: '/tbc-weakauras/pve/karazhan', color: lookupColor('raidkarazhan'), image: lookupIcon('raidkarazhan'), expansions: ['tbc'], group: 'tools'},

    {name: 'Classic WeakAuras', url: '/classic-weakauras', color: 'cccccc', image: 'weakauras.png', expansions: ['classic'], group: 'tools'},
    {name: 'Dungeon WeakAuras', url: '/classic-weakauras/pve/classic-dungeons', color: lookupColor('tbcdungeon'), image: lookupIcon('classicdungeon'), expansions: ['classic'], group: 'tools'},
    {name: 'Naxxramas WeakAuras', url: '/classic-weakauras/pve/naxxramas', color: lookupColor('raidnaxxramas'), image: lookupIcon('raidnaxxramas'), expansions: ['classic'], group: 'tools'},
    {name: 'WeakAuras', searchSlug: 'weakaura', image: 'weakauras.png'},

    {name: 'ElvUI', slug: 'elvui', color: 'fe7c00', image: 'tukui.png', expansions: ['ALL'], categories: ['%CLASSES%', 'role0'], group: 'ui', links: [
        {url: 'https://www.tukui.org/', name: $t('View ElvUI Website')},
        {url: 'https://discord.gg/xFWcfgE', name: $t('Join ElvUI Discord')}
    ]},
    {name: 'Plater Nameplates', slug: 'plater', color: 'fcc771', image: 'plater.png', expansions: ['ALL'], categories: ['%CLASSES%', 'platersys', 'platercontent', 'role0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/plater-nameplates', name: $t('Download Plater')},
        {url: 'https://discord.gg/AGSzAZX', name: $t('Join Plater Discord')},
    ]},
    {name: 'AyijeCDM', slug: 'ayije-cdm', color: 'fe9808', image: 'ayijecdm.png', expansions: ['midnight'], categories: ['%CLASSES%'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/ayijecdm', name: $t('Download AyijeCDM')},
    ]},
    {name: 'Baganator', slug: 'baganator', color: '44d0fd', image: 'baganator.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/baganator', name: $t('Download Baganator')},
        {url: 'https://discord.gg/TtSN6DxSky', name: $t('Join Baganator Discord')}
    ]},
    {name: 'Better Blizz Frames', slug: 'better-blizz-frames', color: '217DD3', image: 'bbf.png', expansions: ['ALL'], group: 'ui', categories: ['%CLASSES%', 'bbf0'], links: [
        {url: 'https://addons.wago.io/addons/betterblizzframes', name: $t('Download Better Blizz Frames')},
        {url: 'https://discord.gg/cjqVaEMm25', name: $t('Join Better Blizz Frames Discord')}
    ]},
    {name: 'Better Blizz Plates', slug: 'better-blizz-plates', color: '217DD3', image: 'bbp.png', expansions: ['ALL'], group: 'ui', categories: ['%CLASSES%', 'bbp0'], links: [
        {url: 'https://addons.wago.io/addons/betterblizzplates', name: $t('Download Better Blizz Plates')},
        {url: 'https://discord.gg/cjqVaEMm25', name: $t('Join Better Blizz Plates Discord')}
    ]},
    {name: 'Better Cooldown Manager', slug: 'better-cdm', color: '1eeed8', image: 'bcm.png', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/bettercooldownmanager', name: $t('Download Better Cooldown Manager')},
    ]},
    {name: 'BigWigs', slug: 'bigwigs', color: 'fe8937', image: 'bigwigs.png', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/bigwigs', name: $t('Download BigWigs')},
        {url: 'https://discord.gg/jGveg85', name: $t('Join BigWigs Discord')}
    ]},
    {name: 'Buff Reminders', slug: 'buff-reminders', color: '95866b', image: 'buffreminders.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/buffreminders', name: $t('Download Buff Reminders')},
        {url: 'https://discord.gg/qezQ2hXJJ7', name: $t('Join Buff Reminders Discord')}
    ]},
    {name: 'Cell', slug: 'cell', color: '218a37', image: 'cell.png', expansions: ['ALL'], categories: ['%CLASSES%', 'cell0', 'role0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/cell', name: $t('Download Cell')},
        {url: 'https://discord.gg/9PSe3fKQGJ', name: $t('Join Cell Discord')}
    ]},
    {name: 'Class UI Enhanced', slug: 'class-ui-enhanced', color: 'e7727e', image: 'classui.png', expansions: ['midnight'], categories: ['%CLASSES%'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/classuienhanced', name: $t('Download Class UI Enhanced')},
        {url: 'https://discord.gg/8dWuth44Dx', name: $t('Join Class UI Enhanced Discord')}
    ]},
    {name: 'Cooldown Companion', slug: 'cooldown-companion', color: '01f6fe', image: 'cdcompanion.png', expansions: ['midnight'], categories: ['%CLASSES%'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/cooldown-companion', name: $t('Download Cooldown Companion')},
        {url: 'https://discord.gg/RQhW8FFuBY', name: $t('Join Cooldown Companion Discord')}
    ]},
    {name: 'Cooldown Manager Centered', slug: 'cooldown-manager-centered', color: '9fe508', image: 'cdmcentered.png', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/cooldownmanagercentered', name: $t('Download Cooldown Manager Centered')},
        {url: 'https://discord.gg/Vu9maq5Kn9', name: $t('Join Cooldown Manager Centered Discord')}
    ]},
    {name: 'Deadly Boss Mods', slug: 'dbm', color: 'bcbcbc', image: 'dbm.png', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/deadly-boss-mods-dbm', name: $t('Download Deadly Boss Mods')},
    ]},
    {name: 'Danders Frames', slug: 'danders-frames', color: '8354b5', image: 'danders.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/deadly-boss-mods-dbm', name: $t('Download Danders Frames')},
        {url: 'https://discord.gg/SDWtduCqnT', name: $t('Join Danders Discord')}
    ]},
    {name: 'EllesmereUI', slug: 'ellesmere-ui', color: '2ff6bf', image: 'ellesmereui.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/ellesmereui', name: $t('Download EllesmereUI')},
    ]},
    {name: 'Enhance QoL', slug: 'enhance-qol', color: 'e0d0b3', image: 'enhanceqol.png', expansions: ['midnight'], categories: ['%CLASSES%', 'enhanceqol0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/eqol', name: $t('Download Enhance QoL')},
        {url: 'https://discord.gg/kqQfG9YhVn', name: $t('Join Enhance Qol Discord')}
    ]},
    {name: 'EXBOSS', slug: 'exboss', color: 'f0f0f0', image: 'exboss.png', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/exboss', name: $t('Download EXBOSS')},
    ]},
    {name: 'Grid2', slug: 'grid2', color: '637a41', image: 'grid2.jpg', expansions: ['ALL'], categories: ['%CLASSES%', 'role0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/grid2', name: $t('Download Grid2')},
    ]},
    {name: 'GSE', slug: 'gse', color: '00CCCC', image: 'gse.png', expansions: ['ALL'], categories: ['%CLASSES%', 'gse0'], group: 'tools', links: [
        {url: 'https://addons.wago.io/addons/gse-advanced-macro-compiler', name: $t('Download GSE')},
        {url: 'https://discord.gg/yUS9R4ZXZA', name: $t('Join GSE Discord')}
    ]},
    {name: 'HenniAuras', slug: 'henni-auras', color: 'b86329', image: 'henni-auras.jpeg', expansions: ['midnight'], categories: ['%CLASSES%', 'role0', 'raidvoidspire', 'raiddreamrift', 'raidmarchqueldanas'], group: 'tools', links: [
        {url: 'https://addons.wago.io/addons/henni-auras', name: $t('Download HenniAuras')},
    ]},
    {name: 'M33kAuras', slug: 'm33kauras', color: 'f7dec4', image: 'm33kauras.jpg', expansions: ['midnight'], group: 'tools', links: [
        {url: 'https://github.com/m33shoq/M33kAuras/releases', name: $t('Download M33kAuras')},
    ]},
    {name: 'Macro', slug: 'macro', color: 'BA25BF', image: 'macro.png', expansions: ['ALL'], categories: ['%CLASSES%', 'macroutility', 'macrotargeting'], group: 'tools', links: [
        {url: 'https://warcraft.wiki.gg/wiki/Making_a_macro', name: $t('Macro guide on Warcraft Wiki')}
    ]},
    {name: 'Midnight Simple Unit Frames', slug: 'msuf', color: 'daa932', image: 'msuf.png', expansions: ['midnight'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/midnightsimpleunitframes', name: $t('Download Midnight Simple Unit Frames')}
    ]},
    {name: 'MPlus Timer', slug: 'mplus-timer', color: '7ED321', image: 'mplus.png', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/mplustimer', name: $t('Download MPlus Timer')},
        {url: 'https://discord.gg/3B6QHURmBy', name: $t('Join MPlus Timer Discord')}
    ]},
    {name: 'Mythic Dungeon Tools', url: '/mdt', searchSlug: 'mdt', color: 'f1dc11', image: 'mdt.png', expansions: ['midnight'], group: 'combat'},
    {name: 'OPie', slug: 'opie', color: '2595E6', image: 'opie.png', expansions: ['ALL'], categories: ['%CLASSES%', 'opie0', 'prof1', 'prof5', 'prof14'], group: 'ui'},
    {name: 'Platynator', slug: 'platynator', color: '00f300', image: 'platynator.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/platynator', name: $t('Download Platynator')},
    ]},
    {name: 'sArena Reloaded', slug: 'sarena-reloaded', color: '6df4fe', image: 'sarenareloaded.jpg', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/sarena-reloaded', name: $t('sArena Reloaded')},
        {url: 'https://discord.gg/cjqVaEMm25', name: $t('Join sArena Reloaded Discord')}
    ]},
    {name: 'Sensei Class Resource Bar', slug: 'sensei-class-resource-bar', color: 'fbcc91', image: 'senseiclassresourcebar.png', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/sensei-class-resource-bar', name: $t('Download Sensei Class Resource Bar')},
    ]},
    {name: 'SkironCooldownManager', slug: 'skiron-cooldown-manager', color: '398fac', image: 'skironcdm.png', expansions: ['midnight'], categories: ['%CLASSES%'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/skironcooldownmanager', name: $t('Download SkironCooldownManager')},
    ]},   
    {name: 'Targeted Spells', slug: 'targeted-spells', color: 'afadac', image: 'targeted-spells.jpg', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/targeted-spells', name: $t('Download Targeted Spells')},
    ]},
    {name: 'Total RP3', slug: 'totalrp3', color: 'c3793a', image: 'totalrp.png', expansions: ['ALL'], categories: ['totalrp1', 'totalrp4', 'rplang0'], links: [
        {url: 'https://addons.wago.io/addons/total-rp-3', name: $t('Download Total RP 3')},
        {url: 'https://addons.wago.io/addons/total-rp-3-extended', name: $t('Download Total RP 3 Extended')},
        {url: 'http://discord.totalrp3.info/', name: $t('Join Total RP Discord')}
    ]},
    {name: 'Twintop\'s Resource Bar', slug: 'twintops-resource-bar', color: 'ac78e9', image: 'twintop.png', expansions: ['midnight'], categories: ['%CLASSES%'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/twintopresourcebar', name: $t('Download Twintop\'s Resource Bar')},
    ]},
    {name: 'Unhalted Unit Frames', slug: 'unhalted-unit-frames', color: 'adadfd', image: 'unhalted.png', expansions: ['midnight'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/unhaltedunitframes', name: $t('Download Unhalted Unit Frames')},
    ]},
    {name: 'VuhDo', slug: 'vuhdo', color: '6BB85E', image: 'vuhdo.png', expansions: ['ALL'], categories: ['%CLASSES%', 'vuhdo0', 'role0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/vuhdo', name: $t('Download Vuhdo')},
        {url: 'https://discord.gg/57en44E', name: $t('Join VuhDo Discord')},
    ]},
    {name: 'Watchtower', slug: 'watchtower', color: 'cee2f3', image: 'watchtower.png', expansions: ['midnight'], categories: ['%CLASSES%', 'prof1', 'prof5', 'prof14', 'role0', 'gen0'], group: 'tools', links: [
        {url: 'https://addons.wago.io/addons/watchtower', name: $t('Download Watchtower')},
        {url: 'https://discord.gg/FwWZZ39kPX', name: $t('Join Watchtower Discord')}
    ]},
    {name: 'Blizzard Edit Mode', slug: 'blizzhud', color: '009ae4', image: 'blizzard.png', expansions: ['ALL'], categories: ['%CLASSES%', 'role0'], group: 'blizzard'},
    {name: 'Blizzard Cooldown Manager', slug: 'cooldown-manager', color: '009ae4', image: 'blizzard.png', expansions: ['midnight'], categories: ['%CLASSES%', 'role0'], group: 'blizzard'},
    {name: 'Housing Blueprints', slug: 'housing-blueprints', color: '009ae4', image: 'blizzard.png', expansions: ['midnight'], group: 'housing', categories: ['blueprint0']},
]

function lookupColor(id) {
    const cat = categories.match(id)
    if (cat) return cat.color.substring(1)
    return 'cccccc'
}

function lookupIcon(id) {
    const cat = categories.match(id)
    if (cat) return cat.image
    return ''
}