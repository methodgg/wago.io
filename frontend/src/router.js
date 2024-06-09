// Resolve promises allow lazy-load components
const Index = resolve => require(['@/components/Index.vue'], resolve)
const Login = resolve => require(['@/components/core/Login.vue'], resolve)
const Logout = resolve => require(['@/components/core/Logout.vue'], resolve)
const Account = resolve => require(['@/components/core/Account.vue'], resolve)
const Admin = resolve => require(['@/components/core/Admin.vue'], resolve)

const MenuWeakAurasTWW = resolve => require(['@/components/core/Menu-WeakAuras-TWW.vue'], resolve)
const MenuWeakAurasDragonflight = resolve => require(['@/components/core/Menu-WeakAuras-Dragonflight.vue'], resolve)
const MenuWeakAurasShadowlands = resolve => require(['@/components/core/Menu-WeakAuras-Shadowlands.vue'], resolve)
const MenuWeakAurasBFA = resolve => require(['@/components/core/Menu-WeakAuras-BFA.vue'], resolve)
const MenuWeakAurasLegion = resolve => require(['@/components/core/Menu-WeakAuras-Legion.vue'], resolve)
const MenuWeakAurasClassic = resolve => require(['@/components/core/Menu-WeakAuras-Classic.vue'], resolve)
const MenuWeakAurasTBC = resolve => require(['@/components/core/Menu-WeakAuras-TBC.vue'], resolve)
const MenuWeakAurasWotLK = resolve => require(['@/components/core/Menu-WeakAuras-WotLK.vue'], resolve)
const MenuWeakAurasCata = resolve => require(['@/components/core/Menu-WeakAuras-Cata.vue'], resolve)
const MenuMacro = resolve => require(['@/components/core/Menu-Macro.vue'], resolve)
const MenuBlizzHUD = resolve => require(['@/components/core/Menu-BlizzHud.vue'], resolve)
const MenuElvUI = resolve => require(['@/components/core/Menu-ElvUI.vue'], resolve)
const MenuVuhdo = resolve => require(['@/components/core/Menu-Vuhdo.vue'], resolve)
const MenuTotalRP = resolve => require(['@/components/core/Menu-TotalRP.vue'], resolve)
const MenuOPie = resolve => require(['@/components/core/Menu-OPie.vue'], resolve)
const MenuPlater = resolve => require(['@/components/core/Menu-Plater.vue'], resolve)
// const MenuMDTBFA = resolve => require(['@/components/core/Menu-MDT-BFA.vue'], resolve)
// const MenuMDTShadowlands = resolve => require(['@/components/core/Menu-MDT-Shadowlands.vue'], resolve)
const MenuMDTDragonflight = resolve => require(['@/components/core/Menu-MDT-Dragonflight.vue'], resolve)
const CreateMDT = resolve => require(['@/components/core/Create-MDT.vue'], resolve)
const MenuCollections = resolve => require(['@/components/core/Menu-Collections.vue'], resolve)
const MenuDelvUI = resolve => require(['@/components/core/Menu-DelvUI.vue'], resolve)

const TermsOfService = resolve => require(['@/components/core/TermsOfService.vue'], resolve)
const PrivacyPolicy = resolve => require(['@/components/core/PrivacyPolicy.vue'], resolve)

const ViewWago = resolve => require(['@/components/core/ViewWago.vue'], resolve)

const News = resolve => require(['@/components/core/News.vue'], resolve)
const Search = resolve => require(['@/components/core/Search.vue'], resolve)
const WACompanion = resolve => require(['@/components/core/WA-Companion.vue'], resolve)
// const Stats = resolve => require(['@/components/core/Stats.vue'], resolve)
const WagoLib = resolve => require(['@/components/core/WagoLib.vue'], resolve)

const OAuth = resolve => require(['@/components/UI/WagoOauth.vue'], resolve)

const Random = resolve => require(['@/components/UI/Random.vue'], resolve)

function GetContextSearch(params, type, expansion) {
  let tag
  let slug
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
      // wait for i'bfa'next
    }
    var cat = window.Categories.search(slug, type, expansion)
    if (cat) {
      tag = cat.id
    }
  }

  var search = ''
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
    { path: '/weakauras', component: MenuWeakAurasDragonflight },
    { path: '/weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/the-war-within-weakauras', component: MenuWeakAurasTWW },
    { path: '/the-war-within-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tww', mode: 'imports' } }) },
    { path: '/the-war-within-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tww', mode: 'imports' } }) },
    { path: '/the-war-within-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tww', mode: 'imports' } }) },
    { path: '/the-war-within-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tww', mode: 'imports' } }) },
    { path: '/dragonflight-weakauras', component: MenuWeakAurasDragonflight },
    { path: '/dragonflight-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/shadowlands-weakauras', component: MenuWeakAurasShadowlands },
    { path: '/shadowlands-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'sl', mode: 'imports' } }) },
    { path: '/shadowlands-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'sl', mode: 'imports' } }) },
    { path: '/shadowlands-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'sl', mode: 'imports' } }) },
    { path: '/shadowlands-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'sl', mode: 'imports' } }) },
    { path: '/bfa-weakauras', component: MenuWeakAurasBFA },
    { path: '/bfa-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'bfa', mode: 'imports' } }) },
    { path: '/bfa-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'bfa', mode: 'imports' } }) },
    { path: '/bfa-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'bfa', mode: 'imports' } }) },
    { path: '/bfa-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'bfa', mode: 'imports' } }) },
    { path: '/legion-weakauras', component: MenuWeakAurasLegion },
    { path: '/legion-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'legion', mode: 'imports' } }) },
    { path: '/legion-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'legion', mode: 'imports' } }) },
    { path: '/legion-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'legion', mode: 'imports' } }) },
    { path: '/legion-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'legion', mode: 'imports' } }) },
    { path: '/cataclysm-weakauras', component: MenuWeakAurasCata },
    { path: '/cataclysm-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'cata', mode: 'imports' } }) },
    { path: '/cataclysm-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'cata', mode: 'imports' } }) },
    { path: '/cataclysm-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'cata', mode: 'imports' } }) },
    { path: '/cataclysm-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'cata', mode: 'imports' } }) },
    { path: '/wotlk-weakauras', component: MenuWeakAurasWotLK },
    { path: '/wotlk-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'wotlk', mode: 'imports' } }) },
    { path: '/wotlk-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'wotlk', mode: 'imports' } }) },
    { path: '/wotlk-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'wotlk', mode: 'imports' } }) },
    { path: '/wotlk-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'wotlk', mode: 'imports' } }) },
    { path: '/tbc-weakauras', component: MenuWeakAurasTBC },
    { path: '/tbc-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tbc', mode: 'imports' } }) },
    { path: '/tbc-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tbc', mode: 'imports' } }) },
    { path: '/tbc-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tbc', mode: 'imports' } }) },
    { path: '/tbc-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'tbc', mode: 'imports' } }) },
    { path: '/classic-weakauras', component: MenuWeakAurasClassic },
    { path: '/classic-weakauras/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'classic', mode: 'imports' } }) },
    { path: '/classic-weakauras/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'classic', mode: 'imports' } }) },
    { path: '/classic-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'classic', mode: 'imports' } }) },
    { path: '/classic-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'weakaura'), type: 'weakaura', game: 'wow', expansion: 'classic', mode: 'imports' } }) },
    { path: '/macros', component: MenuMacro },
    { path: '/macros/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'macro'), type: 'macro', game: 'wow', mode: 'imports' } }) },
    { path: '/macros/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'macro'), type: 'macro', game: 'wow', mode: 'imports' } }) },
    { path: '/macros/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'macro'), type: 'macro', game: 'wow', mode: 'imports' } }) },
    { path: '/macros/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'macro'), type: 'macro', game: 'wow', mode: 'imports' } }) },
    { path: '/elvui', component: MenuElvUI },
    { path: '/elvui/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'elvui'), type: 'elvui', game: 'wow', mode: 'imports' } }) },
    { path: '/elvui/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'elvui'), type: 'elvui', game: 'wow', mode: 'imports' } }) },
    { path: '/elvui/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'elvui'), type: 'elvui', game: 'wow', mode: 'imports' } }) },
    { path: '/elvui/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'elvui'), type: 'elvui', game: 'wow', mode: 'imports' } }) },
    { path: '/blizzhud', component: MenuBlizzHUD },
    { path: '/blizzhud/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'blizzhud'), type: 'blizzhud', game: 'wow', mode: 'imports' } }) },
    { path: '/blizzhud/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'blizzhud'), type: 'blizzhud', game: 'wow', mode: 'imports' } }) },
    { path: '/blizzhud/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'blizzhud'), type: 'blizzhud', game: 'wow', mode: 'imports' } }) },
    { path: '/blizzhud/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'blizzhud'), type: 'blizzhud', game: 'wow', mode: 'imports' } }) },
    { path: '/vuhdo', component: MenuVuhdo },
    { path: '/vuhdo/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'vuhdo'), type: 'vuhdo', game: 'wow', mode: 'imports' } }) },
    { path: '/vuhdo/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'vuhdo'), type: 'vuhdo', game: 'wow', mode: 'imports' } }) },
    { path: '/vuhdo/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'vuhdo'), type: 'vuhdo', game: 'wow', mode: 'imports' } }) },
    { path: '/vuhdo/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'vuhdo'), type: 'vuhdo', game: 'wow', mode: 'imports' } }) },
    { path: '/opie', component: MenuOPie },
    { path: '/opie/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'OPie'), type: 'opie', game: 'wow', mode: 'imports' } }) },
    { path: '/opie/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'OPie'), type: 'opie', game: 'wow', mode: 'imports' } }) },
    { path: '/opie/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'OPie'), type: 'opie', game: 'wow', mode: 'imports' } }) },
    { path: '/opie/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'OPie'), type: 'opie', game: 'wow', mode: 'imports' } }) },
    { path: '/plater', component: MenuPlater },
    { path: '/plater/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Plater'), type: 'plater', game: 'wow', mode: 'imports' } }) },
    { path: '/plater/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Plater'), type: 'plater', game: 'wow', mode: 'imports' } }) },
    { path: '/plater/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Plater'), type: 'plater', game: 'wow', mode: 'imports' } }) },
    { path: '/plater/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Plater'), type: 'plater', game: 'wow', mode: 'imports' } }) },
    { path: '/totalrp', component: MenuTotalRP },
    { path: '/totalrp/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'totalrp3'), type: 'totalrp3', game: 'wow', mode: 'imports' } }) },
    { path: '/totalrp/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'totalrp3'), type: 'totalrp3', game: 'wow', mode: 'imports' } }) },
    { path: '/totalrp/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'totalrp3'), type: 'totalrp3', game: 'wow', mode: 'imports' } }) },
    { path: '/totalrp/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'totalrp3'), type: 'totalrp3', game: 'wow', mode: 'imports' } }) },
    { path: '/dbm', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'dbm'), type: 'weakaura', game: 'wow', mode: 'totalrp3' } }) },
    { path: '/delvui', component: MenuDelvUI },
    { path: '/delvui/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'delvui'), type: 'delui', game: 'xiv', mode: 'imports' } }) },
    { path: '/delvui/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'delvui'), type: 'delui', game: 'xiv', mode: 'imports' } }) },
    { path: '/delvui/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'delvui'), type: 'delui', game: 'xiv', mode: 'imports' } }) },
    { path: '/delvui/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'delvui'), type: 'delui', game: 'xiv', mode: 'imports' } }) },
    // { path: '/addons', component: MenuAddons },
    // { path: '/addons/elvui', redirect: '/elvui' },
    // { path: '/addons/opie', redirect: '/opie' },
    // { path: '/addons/plater', redirect: '/plater' },
    // { path: '/addons/totalrp', redirect: '/totalrp' },
    // { path: '/addons/vuhdo', redirect: '/vuhdo' },
    // { path: '/addons/weakauras', redirect: '/weakauras' },
    // { path: '/addons/classic-weakauras', redirect: '/classic-weakauras' },
    // { path: '/addons/tbc-weakauras', redirect: '/tbc-weakauras' },
    { path: '/mdt', component: MenuMDTDragonflight },
    { path: '/mdt/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/mdt/:c1/:c2', component: Search, props: (route) => (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-mdt', component: MenuMDTDragonflight },
    { path: '/dragonflight-mdt/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-mdt/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    { path: '/dragonflight-mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'mdt'), type: 'mdt', game: 'wow', expansion: 'df', mode: 'imports' } }) },
    // { path: '/bfa-mdt', component: MenuMDTBFA },
    // { path: '/bfa-mdt/:c1', component: Search, props: (route) => ({ contextGame: 'bfa', query: GetContextSearch(route.params, 'MDT') }) },
    // { path: '/bfa-mdt/:c1/:c2', component: Search, props: (route) => ({ contextGame: 'bfa', query: GetContextSearch(route.params, 'MDT') }) },
    // { path: '/bfa-mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ contextGame: 'bfa', query: GetContextSearch(route.params, 'MDT') }) },
    // { path: '/bfa-mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextGame: 'bfa', query: GetContextSearch(route.params, 'MDT') }) },
    { path: '/build-new-mdt/:dungeon/', name: 'create-mdt', component: CreateMDT, props: true },
    // { path: '/build-new-mdt/shadowlands-s1/:dungeon/:week', name: 'create-mdt', component: CreateMDT, props: (route) => ({ game: 'sl', season: 1 }) },
    { path: '/collections', component: MenuCollections },
    { path: '/collections/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Collection'), type: 'collection', mode: 'imports' } }) },
    { path: '/collections/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Collection'), type: 'collection', mode: 'imports' } }) },
    { path: '/collections/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Collection'), type: 'collection', mode: 'imports' } }) },
    { path: '/collections/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Collection'), type: 'collection', mode: 'imports' } }) },

    // { path: '/create-new-note', name: 'create-notes', component: CreateEncounterNotes, props: true },
    { path: '/snippets', component: Search, props: (route) => ({ context: { query: '', type: 'snippet', mode: 'code' } }) },
    { path: '/snippets/:c1', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Snippet'), type: 'snippet', mode: 'code' } }) },
    { path: '/snippets/:c1/:c2', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Snippet'), type: 'snippet', mode: 'code' } }) },
    { path: '/snippets/:c1/:c2/:c3', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Snippet'), type: 'snippet', mode: 'code' } }) },
    { path: '/snippets/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ context: { query: GetContextSearch(route.params, 'Snippet'), type: 'snippet', mode: 'code' } }) },

    // { path: '/p/classic/:profile', component: ViewProfile, props: (route) => ({ query: 'User:' + route.params.profile }) },
    { path: '/p/:profile', component: Search, props: (route) => ({ context: { query: `User:"${route.params.profile}"`, mode: 'imports' } }) },
    { path: '/my/stars', component: Search, props: (route) => ({ context: { mode: 'starred' } }) },
    { path: '/my/mentions', component: Search, props: (route) => ({ context: { query: 'mentions:Unread', mode: 'comments' } }) },

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
    { name: 'searchredirect', path: '/search', component: Search, props: (route) => ({ context: { mode: 'imports', ...route.params } }) },
    { path: '/search/:mode', component: Search, props: (route) => ({ context: { ...route.params } }) },
    { path: '/search/:mode/:game(wow|xiv)', component: Search, props: (route) => ({ context: { ...route.params } }) },
    { path: '/search/:mode/:game(wow|xiv)/:expansionType', component: Search, props: (route) => ({ context: { ...route.params } }) },
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
