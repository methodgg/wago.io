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
    {name: 'Baganator', slug: 'baganator', color: '44d0fd', image: 'baganator.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/baganator', name: $t('Download Baganator')},
        {url: 'https://discord.gg/TtSN6DxSky', name: $t('Join Baganator Discord')}
    ]},
    {name: 'BigWigs', slug: 'bigwigs', color: 'fe8937', image: 'bigwigs.png', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/bigwigs', name: $t('Download BigWigs')},
        {url: 'https://discord.gg/jGveg85', name: $t('Join BigWigs Discord')}
    ]},
    {name: 'Cell', slug: 'cell', color: '218a37', image: 'cell.png', expansions: ['ALL'], categories: ['%CLASSES%', 'cell0', 'role0'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/cell', name: $t('Download Cell')},
        {url: 'https://discord.gg/9PSe3fKQGJ', name: $t('Join Cell Discord')}
    ]},
    {name: 'Deadly Boss Mods', slug: 'dbm', color: 'bcbcbc', image: 'dbm.png', expansions: ['ALL'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/deadly-boss-mods-dbm', name: $t('Download Deadly Boss Mods')}
    ]},
    {name: 'GSE', slug: 'gse', color: '00CCCC', image: 'gse.png', expansions: ['ALL'], categories: ['%CLASSES%', 'gse0'], group: 'tools', links: [
        {url: 'https://addons.wago.io/addons/gse-advanced-macro-compiler', name: $t('Download GSE')},
        {url: 'https://discord.gg/yUS9R4ZXZA', name: $t('Join GSE Discord')}
    ]},
    {name: 'Macro', slug: 'macro', color: 'BA25BF', image: 'macro.png', expansions: ['ALL'], categories: ['%CLASSES%', 'macroutility', 'macrotargeting'], group: 'tools', links: [
        {url: 'https://warcraft.wiki.gg/wiki/Making_a_macro', name: $t('Macro guide on Warcraft Wiki')}
    ]},
    {name: 'Midnight Simple Unit Frames', slug: 'msuf', color: 'daa932', image: 'msuf.png', expansions: ['midnight'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/midnightsimpleunitframes', name: $t('Download Midnight Simple Unit Frames')}
    ]},
    {name: 'Mythic Dungeon Tools', url: '/mdt', searchSlug: 'mdt', color: 'f1dc11', image: 'mdt.png', expansions: ['midnight'], group: 'combat'},
    {name: 'OPie', slug: 'opie', color: '2595E6', image: 'opie.png', expansions: ['midnight'], categories: ['%CLASSES%', 'opie0', 'prof1', 'prof5', 'prof14'], group: 'ui'},
    {name: 'Platynator', slug: 'platynator', color: '00f300', image: 'platynator.png', expansions: ['ALL'], group: 'ui', links: [
        {url: 'https://addons.wago.io/addons/platynator', name: $t('Download Platynator')},
    ]},
    {name: 'Targeted Spells', slug: 'targeted-spells', color: 'afadac', image: 'targeted-spells.jpg', expansions: ['midnight'], group: 'combat', links: [
        {url: 'https://addons.wago.io/addons/targeted-spells', name: $t('Download Targeted Spells')},
    ]},
    {name: 'Total RP3', slug: 'totalrp3', color: 'c3793a', image: 'totalrp.png', expansions: ['ALL'], categories: ['totalrp1', 'totalrp4', 'rplang0'], links: [
        {url: 'https://addons.wago.io/addons/total-rp-3', name: $t('Download Total RP 3')},
        {url: 'https://addons.wago.io/addons/total-rp-3-extended', name: $t('Download Total RP 3 Extended')},
        {url: 'http://discord.totalrp3.info/', name: $t('Join Total RP Discord')}
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
    {name: 'Blizzard Housing (Coming soon)', url: '/', color: '009ae4', image: 'blizzard.png', expansions: ['midnight'], group: 'blizzard'},
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