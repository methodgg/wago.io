// Resolve promises allow lazy-load components
const Index = resolve => require(['@/components/Index.vue'], resolve)
const Login = resolve => require(['@/components/core/Login.vue'], resolve)
const Logout = resolve => require(['@/components/core/Logout.vue'], resolve)
const Account = resolve => require(['@/components/core/Account.vue'], resolve)
const Admin = resolve => require(['@/components/core/Admin.vue'], resolve)

const MenuWeakAuras = resolve => require(['@/components/core/Menu-WeakAuras.vue'], resolve)
const MenuWeakAurasClassic = resolve => require(['@/components/core/Menu-ClassicWeakAuras.vue'], resolve)
const MenuElvUI = resolve => require(['@/components/core/Menu-ElvUI.vue'], resolve)
const MenuVuhdo = resolve => require(['@/components/core/Menu-Vuhdo.vue'], resolve)
const MenuTotalRP = resolve => require(['@/components/core/Menu-TotalRP.vue'], resolve)
const MenuOPie = resolve => require(['@/components/core/Menu-OPie.vue'], resolve)
const MenuPlater = resolve => require(['@/components/core/Menu-Plater.vue'], resolve)
const MenuMDT = resolve => require(['@/components/core/Menu-MDT.vue'], resolve)
const CreateMDT = resolve => require(['@/components/core/Create-MDT.vue'], resolve)
const CreateEncounterNotes = resolve => require(['@/components/core/Create-Notes.vue'], resolve)
const MenuCollections = resolve => require(['@/components/core/Menu-Collections.vue'], resolve)

const TermsOfService = resolve => require(['@/components/core/TermsOfService.vue'], resolve)
const PrivacyPolicy = resolve => require(['@/components/core/PrivacyPolicy.vue'], resolve)

const ViewWago = resolve => require(['@/components/core/ViewWago.vue'], resolve)
const ViewProfile = resolve => require(['@/components/core/ViewProfile.vue'], resolve)

const News = resolve => require(['@/components/core/News.vue'], resolve)
const Search = resolve => require(['@/components/core/Search.vue'], resolve)
const WACompanion = resolve => require(['@/components/core/WA-Companion.vue'], resolve)
// const Stats = resolve => require(['@/components/core/Stats.vue'], resolve)

const OAuth = resolve => require(['@/components/UI/WagoOauth.vue'], resolve)

const Random = resolve => require(['@/components/UI/Random.vue'], resolve)

import Categories from './components/libs/categories'

function GetContextTag (params) {
  var tag
  var slug
  // if first param is a game then ignore it here; used in GetContextGame
  if (params.c1.match(/^(bfa|classic)$/)) {
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
    var cat = Categories.search(slug, window.i18next.t)
    if (cat && cat.text) {
      tag = cat.text
    }
  }

  var search = ''

  if (tag) {
    // tag = tag.replace(/-/g, ' ')
    if (tag.match(/\s/)) {
      tag = '"' + tag + '"'
    }
    search = ' Tag: ' + tag
  }

  return search
}

export default {
  mode: 'history',
  routes: [
    // index/import form with dev log
    { path: '/', component: Index },

    // auth
    { path: '/login', component: Login },
    { path: '/logout', component: Logout },
    { path: '/account', component: Account },
    { path: '/admin', component: Admin },

    // menus/categories
    { path: '/weakauras', component: MenuWeakAuras },
    { path: '/weakauras/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: WeakAura' + GetContextTag(route.params) }) },
    { path: '/weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: WeakAura' + GetContextTag(route.params) }) },
    { path: '/weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: WeakAura' + GetContextTag(route.params) }) },
    { path: '/weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: WeakAura' + GetContextTag(route.params) }) },
    { path: '/classic-weakauras', component: MenuWeakAurasClassic },
    { path: '/classic-weakauras/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Classic-WeakAura' + GetContextTag(route.params) }) },
    { path: '/classic-weakauras/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Classic-WeakAura' + GetContextTag(route.params) }) },
    { path: '/classic-weakauras/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Classic-WeakAura' + GetContextTag(route.params) }) },
    { path: '/classic-weakauras/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Classic-WeakAura' + GetContextTag(route.params) }) },
    { path: '/elvui', component: MenuElvUI },
    { path: '/elvui/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: ElvUI' + GetContextTag(route.params) }) },
    { path: '/elvui/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: ElvUI' + GetContextTag(route.params) }) },
    { path: '/elvui/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: ElvUI' + GetContextTag(route.params) }) },
    { path: '/elvui/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: ElvUI' + GetContextTag(route.params) }) },
    { path: '/vuhdo', component: MenuVuhdo },
    { path: '/vuhdo/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Vuhdo' + GetContextTag(route.params) }) },
    { path: '/vuhdo/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Vuhdo' + GetContextTag(route.params) }) },
    { path: '/vuhdo/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Vuhdo' + GetContextTag(route.params) }) },
    { path: '/vuhdo/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Vuhdo' + GetContextTag(route.params) }) },
    { path: '/opie', component: MenuOPie },
    { path: '/opie/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: OPie' + GetContextTag(route.params) }) },
    { path: '/opie/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: OPie' + GetContextTag(route.params) }) },
    { path: '/opie/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: OPie' + GetContextTag(route.params) }) },
    { path: '/opie/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: OPie' + GetContextTag(route.params) }) },
    { path: '/plater', component: MenuPlater },
    { path: '/plater/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Plater' + GetContextTag(route.params) }) },
    { path: '/plater/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Plater' + GetContextTag(route.params) }) },
    { path: '/plater/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Plater' + GetContextTag(route.params) }) },
    { path: '/plater/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Plater' + GetContextTag(route.params) }) },
    { path: '/totalrp', component: MenuTotalRP },
    { path: '/totalrp/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: TotalRP' + GetContextTag(route.params) }) },
    { path: '/totalrp/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: TotalRP' + GetContextTag(route.params) }) },
    { path: '/totalrp/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: TotalRP' + GetContextTag(route.params) }) },
    { path: '/totalrp/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: TotalRP' + GetContextTag(route.params) }) },
    { path: '/mdt', component: MenuMDT },
    { path: '/mdt/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: MDT' + GetContextTag(route.params) }) },
    { path: '/mdt/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: MDT' + GetContextTag(route.params) }) },
    { path: '/mdt/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: MDT' + GetContextTag(route.params) }) },
    { path: '/mdt/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: MDT' + GetContextTag(route.params) }) },
    { path: '/build-new-mdt/:dungeon/:week', name: 'create-mdt', component: CreateMDT, props: true },
    { path: '/collections', component: MenuCollections },
    { path: '/collections/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },

    { path: '/create-new-note', name: 'create-notes', component: CreateEncounterNotes, props: true },
    { path: '/snippets', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' }) },
    { path: '/snippets/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },

    { path: '/p/classic/:profile', component: ViewProfile, props: (route) => ({ contextSearch: 'User: ' + route.params.profile }) },
    { path: '/p/:profile', component: ViewProfile, props: (route) => ({ contextSearch: 'User: ' + route.params.profile }) },
    { path: '/my/stars', component: Search, props: (route) => ({ contextSearch: 'Starred: True' }) },
    { path: '/my/mentions', component: Search, props: (route) => ({ contextSearch: 'Mentioned: True' }) },
    { path: '/my/restricted', component: Search, props: (route) => ({ contextSearch: 'Restricted: True' }) },

    // pages
    { path: '/wa-companion', component: WACompanion },
    // { path: '/stats', component: Stats },
    { path: '/random', component: Random },

    // legal mumbo jumbo
    { path: '/terms-of-service', component: TermsOfService },
    { path: '/privacy-policy', component: PrivacyPolicy },

    // search
    { path: '/search/:query', component: Search },

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
