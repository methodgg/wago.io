// Resolve promises allow lazy-load components
const Index = resolve => require(['@/components/Index.vue'], resolve)
const Login = resolve => require(['@/components/core/Login.vue'], resolve)
const Logout = resolve => require(['@/components/core/Logout.vue'], resolve)
const Account = resolve => require(['@/components/core/Account.vue'], resolve)
const Admin = resolve => require(['@/components/core/Admin.vue'], resolve)

const MenuWeakAuras = resolve => require(['@/components/core/Menu-WeakAuras.vue'], resolve)
const MenuElvUI = resolve => require(['@/components/core/Menu-ElvUI.vue'], resolve)
const MenuVuhdo = resolve => require(['@/components/core/Menu-Vuhdo.vue'], resolve)
const MenuCollections = resolve => require(['@/components/core/Menu-Collections.vue'], resolve)

const TermsOfService = resolve => require(['@/components/core/TermsOfService.vue'], resolve)
const PrivacyPolicy = resolve => require(['@/components/core/PrivacyPolicy.vue'], resolve)

const ViewWago = resolve => require(['@/components/core/ViewWago.vue'], resolve)
const ViewProfile = resolve => require(['@/components/core/ViewProfile.vue'], resolve)

const News = resolve => require(['@/components/core/News.vue'], resolve)
const Search = resolve => require(['@/components/core/Search.vue'], resolve)

const OAuth = resolve => require(['@/components/UI/WagoOauth.vue'], resolve)

function GetContextTag (params) {
  var tag
  if (params.c4) {
    tag = params.c4
  }
  else if (params.c3) {
    if (params.c1 === 'classes') {
      tag = params.c3 + ' ' + params.c2
    }
    else {
      tag = params.c3
    }
  }
  else if (params.c2) {
    tag = params.c2
  }
  else if (params.c1) {
    tag = params.c1
  }

  if (tag) {
    tag = tag.replace(/-/g, ' ')
    if (tag.match(/\s/)) {
      tag = '"' + tag + '"'
    }
    return ' Tag: ' + tag
  }

  return ''
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
    { path: '/collections', component: MenuCollections },
    { path: '/collections/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },
    { path: '/collections/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Collection' + GetContextTag(route.params) }) },

    { path: '/snippets', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' }) },
    { path: '/snippets/:c1', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2/:c3', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },
    { path: '/snippets/:c1/:c2/:c3/:c4', component: Search, props: (route) => ({ contextSearch: 'Type: Snippet' + GetContextTag(route.params) }) },

    { path: '/p/:profile', component: ViewProfile, props: true },
    { path: '/my/stars', component: Search, props: (route) => ({ contextSearch: 'Starred: True' }) },
    { path: '/my/mentions', component: Search, props: (route) => ({ contextSearch: 'Alert: True' }) },

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
