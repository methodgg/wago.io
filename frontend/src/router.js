// Resolve promises allow lazy-load components
const Index = resolve => require(['@/components/Index.vue'], resolve)
const Login = resolve => require(['@/components/core/Login.vue'], resolve)
const Logout = resolve => require(['@/components/core/Logout.vue'], resolve)
const Account = resolve => require(['@/components/core/Account.vue'], resolve)
const Admin = resolve => require(['@/components/core/Admin.vue'], resolve)

const MenuWeakAurasDragonflight = resolve => require(['@/components/core/Menu-WeakAuras-Dragonflight.vue'], resolve)
const MenuWeakAurasShadowlands = resolve => require(['@/components/core/Menu-WeakAuras-Shadowlands.vue'], resolve)
const MenuWeakAurasBFA = resolve => require(['@/components/core/Menu-WeakAuras-BFA.vue'], resolve)
const MenuWeakAurasLegion = resolve => require(['@/components/core/Menu-WeakAuras-Legion.vue'], resolve)
const MenuWeakAurasClassic = resolve => require(['@/components/core/Menu-WeakAuras-Classic.vue'], resolve)
const MenuWeakAurasTBC = resolve => require(['@/components/core/Menu-WeakAuras-TBC.vue'], resolve)
const MenuWeakAurasWotLK = resolve => require(['@/components/core/Menu-WeakAuras-WotLK.vue'], resolve)
const MenuElvUI = resolve => require(['@/components/core/Menu-ElvUI.vue'], resolve)
const MenuVuhdo = resolve => require(['@/components/core/Menu-Vuhdo.vue'], resolve)
const MenuTotalRP = resolve => require(['@/components/core/Menu-TotalRP.vue'], resolve)
const MenuOPie = resolve => require(['@/components/core/Menu-OPie.vue'], resolve)
const MenuTPie = resolve => require(['@/components/core/Menu-TPie.vue'], resolve)
const MenuPlater = resolve => require(['@/components/core/Menu-Plater.vue'], resolve)
const MenuMDTBFA = resolve => require(['@/components/core/Menu-MDT-BFA.vue'], resolve)
const MenuMDTShadowlands = resolve => require(['@/components/core/Menu-MDT-Shadowlands.vue'], resolve)
const CreateMDT = resolve => require(['@/components/core/Create-MDT.vue'], resolve)
const CreateEncounterNotes = resolve => require(['@/components/core/Create-Notes.vue'], resolve)
const MenuCollections = resolve => require(['@/components/core/Menu-Collections.vue'], resolve)
const MenuAddons = resolve => require(['@/components/core/Menu-Addons.vue'], resolve)
const MenuDelvUI = resolve => require(['@/components/core/Menu-DelvUI.vue'], resolve)

const TermsOfService = resolve => require(['@/components/core/TermsOfService.vue'], resolve)
const PrivacyPolicy = resolve => require(['@/components/core/PrivacyPolicy.vue'], resolve)

const ViewWago = resolve => require(['@/components/core/ViewWago.vue'], resolve)
const ViewProfile = resolve => require(['@/components/core/ViewProfile.vue'], resolve)

const News = resolve => require(['@/components/core/News.vue'], resolve)
const Search = resolve => require(['@/components/core/Search.vue'], resolve)
const WACompanion = resolve => require(['@/components/core/WA-Companion.vue'], resolve)
// const Stats = resolve => require(['@/components/core/Stats.vue'], resolve)
const WagoLib = resolve => require(['@/components/core/WagoLib.vue'], resolve)

const OAuth = resolve => require(['@/components/UI/WagoOauth.vue'], resolve)

const Random = resolve => require(['@/components/UI/Random.vue'], resolve)

function GetContextSearch (params, type, expansion) {
  var tag
  var slug
  // if first param is a game then ignore it here; used in GetContextGame
  if (params.c1 && params.c1.match(/^(bfa|classic)$/)) {
    params.c1 = params.c2
    params.c2 = params.c3
    params.c3 = params.c4
    params.c4 = params.c5
  }
  if (params.c4) {
    tag = params.c4
    slug = params.c1 + '/' + params.c2 + '/' + params.c3 + '/' + params.c4
  }
  else if (params.c3) {
    slug = params.c1 + '/' + params.c2 + '/' + params.c3
    if (params.c1 === 'classes') {
      tag = params.c3 + ' ' + params.c2
    }
    else {
      tag = params.c3
    }
  }
  else if (params.c2) {
    tag = params.c2
    slug = params.c1 + '/' + params.c2
  }
  else if (params.c1) {
    tag = params.c1
    slug = params.c1
  }

  if (slug) {
    while (!window.i18next.t) {
      // wait for i8next
    }
    var cat = window.Categories.search(slug, type, expansion)
    if (cat) {
      tag = cat.id
    }
  }

  var search = ''
  if (expansion) {
    search = `expansion:${expansion.toLowerCase()}`
  }
  if (type) {
    search += ` type:${type.toLowerCase()}`
  }
  if (tag) {
    search += ` tag:${tag.toLowerCase()}`
  }

  return search
}

export default {
  mode: 'history',
  routes: [
    // index/import form with dev log
    { path: '/', component: Index },
    { path: '/test.html', component: Index },

    // auth
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/account', component: Account },
    { path: '/admin', component: Admin },

    // menus/categories
    { path: '/weakauras', component: MenuWeakAurasShadowlands },
    { path: '/weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/dragonflight-weakauras', component: MenuWeakAurasDragonflight },
    { path: '/dragonflight-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'df'), contextDomain: 0 }) },
    { path: '/dragonflight-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'df'), contextDomain: 0 }) },
    { path: '/dragonflight-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'df'), contextDomain: 0 }) },
    { path: '/dragonflight-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'df'), contextDomain: 0 }) },
    { path: '/shadowlands-weakauras', component: MenuWeakAurasShadowlands },
    { path: '/shadowlands-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/shadowlands-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/shadowlands-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/shadowlands-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'sl'), contextDomain: 0 }) },
    { path: '/bfa-weakauras', component: MenuWeakAurasBFA },
    { path: '/bfa-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'bfa'), contextDomain: 0 }) },
    { path: '/bfa-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'bfa'), contextDomain: 0 }) },
    { path: '/bfa-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'bfa'), contextDomain: 0 }) },
    { path: '/bfa-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'bfa'), contextDomain: 0 }) },
    { path: '/legion-weakauras', component: MenuWeakAurasLegion },
    { path: '/legion-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'legion'), contextDomain: 0 }) },
    { path: '/legion-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'legion'), contextDomain: 0 }) },
    { path: '/legion-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'legion'), contextDomain: 0 }) },
    { path: '/legion-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'legion'), contextDomain: 0 }) },
    { path: '/wotlk-weakauras', component: MenuWeakAurasWotLK },
    { path: '/wotlk-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'wotlk'), contextDomain: 0 }) },
    { path: '/wotlk-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'wotlk'), contextDomain: 0 }) },
    { path: '/wotlk-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'wotlk'), contextDomain: 0 }) },
    { path: '/wotlk-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'wotlk'), contextDomain: 0 }) },
    { path: '/tbc-weakauras', component: MenuWeakAurasTBC },
    { path: '/tbc-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'tbc'), contextDomain: 0 }) },
    { path: '/tbc-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'tbc'), contextDomain: 0 }) },
    { path: '/tbc-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'tbc'), contextDomain: 0 }) },
    { path: '/tbc-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'tbc'), contextDomain: 0 }) },
    { path: '/classic-weakauras', component: MenuWeakAurasClassic },
    { path: '/classic-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'classic'), contextDomain: 0 }) },
    { path: '/classic-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'classic'), contextDomain: 0 }) },
    { path: '/classic-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'classic'), contextDomain: 0 }) },
    { path: '/classic-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'weakaura', 'classic'), contextDomain: 0 }) },
    { path: '/elvui', component: MenuElvUI },
    { path: '/elvui/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'elvui'), contextDomain: 0 }) },
    { path: '/elvui/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'elvui'), contextDomain: 0 }) },
    { path: '/elvui/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'elvui'), contextDomain: 0 }) },
    { path: '/elvui/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'elvui'), contextDomain: 0 }) },
    { path: '/vuhdo', component: MenuVuhdo },
    { path: '/vuhdo/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'vuhdo'), contextDomain: 0 }) },
    { path: '/vuhdo/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'vuhdo'), contextDomain: 0 }) },
    { path: '/vuhdo/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'vuhdo'), contextDomain: 0 }) },
    { path: '/vuhdo/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'vuhdo'), contextDomain: 0 }) },
    { path: '/opie', component: MenuOPie },
    { path: '/opie/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'OPie'), contextDomain: 0 }) },
    { path: '/opie/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'OPie'), contextDomain: 0 }) },
    { path: '/opie/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'OPie'), contextDomain: 0 }) },
    { path: '/opie/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'OPie'), contextDomain: 0 }) },
    { path: '/plater', component: MenuPlater },
    { path: '/plater/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Plater'), contextDomain: 0 }) },
    { path: '/plater/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Plater'), contextDomain: 0 }) },
    { path: '/plater/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Plater'), contextDomain: 0 }) },
    { path: '/plater/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Plater'), contextDomain: 0 }) },
    { path: '/totalrp', component: MenuTotalRP },
    { path: '/totalrp/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'totalrp3'), contextDomain: 0 }) },
    { path: '/totalrp/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'totalrp3'), contextDomain: 0 }) },
    { path: '/totalrp/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'totalrp3'), contextDomain: 0 }) },
    { path: '/totalrp/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'totalrp3'), contextDomain: 0 }) },
    { path: '/dbm', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'dbm'), contextDomain: 0 }) },
    { path: '/delvui', component: MenuDelvUI },
    { path: '/delvui/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'delvui'), contextDomain: 1 }) },
    { path: '/delvui/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'delvui'), contextDomain: 1 }) },
    { path: '/delvui/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'delvui'), contextDomain: 1 }) },
    { path: '/delvui/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'delvui'), contextDomain: 1 }) },
    { path: '/tpie', component: MenuTPie },
    { path: '/tpie/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'TPie'), contextDomain: 1 }) },
    { path: '/tpie/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'TPie'), contextDomain: 1 }) },
    { path: '/tpie/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'TPie'), contextDomain: 1 }) },
    { path: '/tpie/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'TPie'), contextDomain: 1 }) },
    { path: '/addons', component: MenuAddons },
    { path: '/addons/elvui', redirect: '/elvui' },
    { path: '/addons/opie', redirect: '/opie' },
    { path: '/addons/plater', redirect: '/plater' },
    { path: '/addons/totalrp', redirect: '/totalrp' },
    { path: '/addons/vuhdo', redirect: '/vuhdo' },
    { path: '/addons/weakauras', redirect: '/weakauras' },
    { path: '/addons/classic-weakauras', redirect: '/classic-weakauras' },
    { path: '/addons/tbc-weakauras', redirect: '/tbc-weakauras' },
    { path: '/mdt', component: MenuMDTShadowlands },
    { path: '/mdt/:c1', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/mdt/:c1/:c2', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/shadowlands-mdt', component: MenuMDTShadowlands },
    { path: '/shadowlands-mdt/:c1', component: Search, props: (route) => ({ contextGame: 'sl', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/shadowlands-mdt/:c1/:c2', component: Search, props: (route) => ({ contextGame: 'sl', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/shadowlands-mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ contextGame: 'sl', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/shadowlands-mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextGame: 'sl', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/bfa-mdt', component: MenuMDTBFA },
    { path: '/bfa-mdt/:c1', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/bfa-mdt/:c1/:c2', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/bfa-mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/bfa-mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextGame: 'bfa', contextSearch: GetContextSearch(route.params, 'MDT') }) },
    { path: '/build-new-mdt/:dungeon/:week', name: 'create-mdt', component: CreateMDT, props: true },
    { path: '/build-new-mdt/shadowlands-s1/:dungeon/:week', name: 'create-mdt', component: CreateMDT, props: (route) => ({ game: 'sl', season: 1 }) },
    { path: '/collections', component: MenuCollections },
    { path: '/collections/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Collection') }) },
    { path: '/collections/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Collection') }) },
    { path: '/collections/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Collection') }) },
    { path: '/collections/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Collection') }) },

    { path: '/create-new-note', name: 'create-notes', component: CreateEncounterNotes, props: true },
    { path: '/snippets', component: Search, props: (route) => ({ contextSearch: 'Type:Snippet' }) },
    { path: '/snippets/:c1', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Snippet') }) },
    { path: '/snippets/:c1/:c2', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Snippet') }) },
    { path: '/snippets/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Snippet') }) },
    { path: '/snippets/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: GetContextSearch(route.params, 'Snippet') }) },

    { path: '/p/classic/:profile', component: ViewProfile, props: (route) => ({ contextSearch: 'User: ' + route.params.profile }) },
    { path: '/p/:profile', component: ViewProfile, props: (route) => ({ contextSearch: 'User: ' + route.params.profile }) },
    { path: '/my/stars', component: Search, props: (route) => ({ contextSearch: '!starred!' }) },
    { path: '/my/mentions', component: Search, props: (route) => ({ contextSearch: '!mentions!' }) },

    // pages
    { path: '/wa-companion', component: WACompanion },
    // { path: '/stats', component: Stats },
    { path: '/random', component: Random },
    { path: '/WagoLib', component: WagoLib },
    { path: '/wagolib', component: WagoLib },

    // legal mumbo jumbo
    { path: '/terms-of-service', component: TermsOfService },
    { path: '/privacy-policy', component: PrivacyPolicy },

    // search
    // { name: 'search', path: '/search/:query', component: Search, props: (route) => {console.log(route); return {} } },
    { name: 'search', path: '/search/:query', component: Search, props: (route) => ({ contextSearch: route.params.query, ...route.params }) },
    { path: '/search/', component: Search },

    // news
    { path: '/news', component: News },
    { path: '/news/:newsID', component: News },
    { path: '/news/:newsID/:sso', component: News },

    // SSO oauth callbacks
    { path: '/auth/:provider', component: OAuth },

    // MUST BE LAST IN ROUTES
    // view wago
    { path: '/:wagoID', component: ViewWago },
    // { path: '/:wagoID/embed.js' }, // handled via nginx and redirected to data server
    { path: '/:wagoID/:version', component: ViewWago }
  ]
}
