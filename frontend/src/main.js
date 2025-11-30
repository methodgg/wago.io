window.prerenderReady = false
/**
 * Setup global functions & variables in window
 */
window.setCookie = function (name, value, days) {
  var expires = ''
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
    expires = '; expires=' + date.toUTCString()
  }
  if (window.location.hostname.match(/wago\.io/)) {
    document.cookie = name + '=' + value + expires + '; domain=.wago.io; path=/'
  }
  // if testing locally
  else {
    document.cookie = name + '=' + value + expires + '; path=/'
  }
}

window.readCookie = function (name) {
  var nameEQ = name + '='
  var ca = document.cookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

window.clearCookie = function (name) {
  window.setCookie(name, '', -1)
}

window.locales = require('../../i18nLocaleConfig').locales


let GAME_DOMAIN = 0
if (window.location.hostname === 'fellowship.wago.io' || window.location.hash === '#fellowship') {
  GAME_DOMAIN = 2
}

// if (window.readCookie('theme')==='classic') {
//   document.body.classList.add('theme-classic')
//   document.body.classList.remove('theme-dark')
// }
// else if (window.readCookie('theme') === 'waluigi') {
//   document.body.classList.add('theme-dark')
// }

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// setup Vuex state
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    isMaintenance: false,
    isTest: process.env.NODE_ENV === 'development' || document.getElementById('test-content'),
    locale: window.readCookie('locale') || 'en-US',
    advertSetup: false,
    advertBlocked: false,
    user: {
      config: {
        searchOptions: {}
      }
    },
    loggedIn: false,
    wotm: {},
    wago: {},
    addons: {},
    snackBarText: 'alert',
    loginRedirect: '/',
    theme: 'dark',
    editorTheme: window.readCookie('editorTheme') || 'tomorrow',
    MDTTable: false,
    MDTWeek: 0,
    pageInfo: {
      title: 'Import',
      description: 'Database of sharable World of Warcraft addon elements',
      image: 'https://wago.io/media/favicon/apple-touch-icon-180x180.png',
      layout: 'default'
    },
    siteSearch: '',
    searchMode: '',
    searchGame: '',
    searchExpansion: '',
    searchType: '',
    searchVersion: '',
    execSearch: 0,
    firstAd: false,
    linkApp: false,
    adProvider: null,

    socket: {
      cid: null,
      isConnected: false,
      reconnectError: false
    },
    gameDomain: GAME_DOMAIN
  },
  mutations: {
    // store.commit('setLocale', 'en-US')
    setLocale(state, locale) {
      if (locale.indexOf('-') === 2) {
        // locale already in lang-region format
      }
      else if (locale === locale.toUpperCase()) {
        // locale is a region
        locale = state.locale.split('-')[0] + '-' + locale
      }
      else if (locale === locale.toLowerCase()) {
        // locale is a language
        locale = locale + '-' + state.locale.split('-')[1]
      }
      else {
        // what is this!
        var e = { name: 'UnknownLocale', message: locale }
        throw e
      }

      // is this a supported locale?
      var supported
      window.locales.forEach((item) => {
        if (item.code === locale) {
          supported = true
        }
      })

      // if not then keep the language but discard the user's region for i8n purposes
      var setLocale
      if (!supported) {
        var lng = locale.split('-')[0]
        window.locales.forEach((item) => {
          if (setLocale) return

          // if match found use this
          if (item.code.split('-')[0] === lng) {
            setLocale = item.code
            return
          }
        })
      }
      else {
        setLocale = locale
      }
      state.locale = setLocale
      window.i18next.changeLanguage(setLocale)
      window.setCookie('locale', setLocale, 365)
      location.reload()
    },

    // store.commit('setUser', {JSON user object from API...})
    setUser(state, user) {
      if (!user.hideAds) {
        store.commit('loadAds')
      }
      if (user && user.UID) {
        state.loggedIn = true
      }
      else {
        state.loggedIn = false
      }
      state.user = JSON.parse(JSON.stringify(user))
      if (state.user.config && state.user.config.editor) {
        window.setCookie('editor', state.user.config.editor, 365)
      }
    },

    loadAds(state) {
      if (state.isMaintenance) {
        return
      }
      const body = document.querySelector('body')
      if (!state.advertSetup) {
        body.classList.add('ads-enabled')

        // let provider = 'nitropay'
        let provider = 'playwire'
        // sessionStorage.setItem('ad_provider', provider)

        if (provider === 'nitropay') {
          //**** Nitropay
          window.nitroAds = window.nitroAds || {
            createAd: function () {
              return new Promise(e => { window.nitroAds.queue.push(["createAd", arguments, e]) })
            },
            addUserToken: function () { window.nitroAds.queue.push(["addUserToken", arguments]) },
            queue: []
          }
          const nitropay = document.createElement('script')
          nitropay.setAttribute('src', 'https://s.nitropay.com/ads-437.js')
          const sideRail = {
            demo: !!(process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/)),
            refreshLimit: 0,
            refreshTime: 30,
            format: 'rail',
            railOffsetTop: 150,
            railOffsetBottom: 40,
            railSpacing: 6,
            railCollisionWhitelist: ['#app', '#maincontent', '#content-frame', '#rail-left', '#rail-left-close', '#rail-right', '#rail-right-close'],
            sizes: [
              ['160', '600'],
              ['300', '600'],
              ['300', '250'],
            ],
            mediaQuery: '(min-width: 1800px)'
          }
          nitropay.onload = () => {
            state.advertSetup = true
            state.advertBlocked = false
            state.adProvider = 'nitropay'
            window.advertRails.make()

            window.nitroAds.createAd('TopMobileBanner', {
              "refreshLimit": 0,
              "refreshTime": 30,
              "renderVisibleOnly": true,
              "sizes": [
                [
                  "445",
                  "55"
                ]
              ],
              mediaQuery: '(max-width: 1149px)'
            });

            window.nitroAds.createAd('floating', {
              format: 'floating',
              mediaQuery: '(min-width: 900px)',
              video: {
                float: 'right',
                hidePlaylist: true
              },            
              report: {
                enabled: true,
                wording: 'Report Ad',
                position: 'top-right'
              }
            })
          }
          nitropay.onerror = () => {
            state.advertSetup = true
            state.advertBlocked = true
          }
          body.appendChild(nitropay)

          window.advertRails = {
            ads: [],
            makeRails: () => {
              window.advertRails.ads.push(window.nitroAds.createAd('rail-left', Object.assign({ rail: 'left' }, sideRail)))
              window.advertRails.ads.push(window.nitroAds.createAd('rail-right', Object.assign({ rail: 'right' }, sideRail)))
            },
            destroyRails: () => {
              document.getElementById('rail-left') && document.getElementById('rail-left').remove()
              document.getElementById('rail-right') && document.getElementById('rail-right').remove()
            },
            make: () => {
              window.advertRails.makeRails()
              window.advertRails.ads.push(window.nitroAds.createAd('bottom-anchor', {
                demo: !!(process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/)),
                refreshLimit: 0,
                refreshTime: 30,
                format: "anchor",
                anchor: "bottom",
                anchorBgColor: 'rgb(51 51 51 / 50%)',
                anchorPersistClose: true,
                mediaQuery: "(min-width: 0px)",
                report: {
                  enabled: true,
                  icon: true,
                  wording: "Report Ad",
                  position: "top-right"
                }
              }))
            },
            refresh: () => {
              window.advertRails.ads.map(async x => {
                try {
                  const ad = await x
                  console.log('ad on navigate', ad)
                  ad.onNavigate()
                }
                catch (e) {
                  console.error(e)
                }
              })
            }
          }
        }
        else if (provider === 'playwire') {
          window.ramp = window.ramp || {}
          window.ramp.que = window.ramp.que || []
          window.ramp.passiveMode = true
          
          const playwire = document.createElement('script')
          playwire.setAttribute('src', '//cdn.intergient.com/1024383/72951/ramp.js')
          playwire.setAttribute('data-cfasync', 'false')
          playwire.onerror = () => {
            state.advertSetup = true
            state.advertBlocked = true
          }
          playwire.onload = () => {
            state.advertSetup = true
            state.advertBlocked = false
            state.adProvider = 'playwire'
            window.ramp.que.push(function () {
              window.ramp.spaNewPage()
            })
          }
          body.appendChild(playwire)
        }
      }
    },

    setStreamEmbed(state, streamEmbed) {
      if (state.streamEmbed !== '__streamspread' && streamEmbed) {
        Vue.set(state, 'streamEmbed', streamEmbed)
      }
    },

    userClearMention(state, commentID) {
      if (!state.user || !state.user.UID) {
        return
      }
      for (var i = 0; i < state.user.unreadMentions.length; i++) {
        if (state.user.unreadMentions[i]._id === commentID) {
          state.user.unreadMentions.splice(i, 1)
        }
      }
    },

    userSearchOption(state, data) {
      if (!state.user) {
        return
      }
      state.user.config.searchOptions[data.field] = data.value
    },

    setSearchText(state, text) {
      Vue.set(state, 'siteSearch', '')
      Vue.nextTick(() => {
        let q = text.replace(/\s{2,}/g, ' ').trim()
        const m = q.match(/^!(\w+)!/)
        if (m && m[1]) {
          q = q.replace(m[0], '')
          Vue.set(state, 'searchMode', m[1])
          window.localStorage.setItem('search.mode', m[1])
        }
        Vue.set(state, 'siteSearch', q.trim())
        state.execSearch++
      })
    },

    setSearchGame(state, data) {
      Vue.set(state, 'searchGame', data.game + '')
      window.localStorage.setItem(`search.game`, data.game)
    },
    
    setSearchMode(state, mode) {
      Vue.set(state, 'searchMode', mode + '')
      window.localStorage.setItem('search.mode', mode + '')
    },

    setSearchExpansion(state, data) {
      Vue.set(state, 'searchExpansion', data.expansion + '')
      window.localStorage.setItem(`search.expansion.${data.game}`, data.expansion)
    },

    setSearchType(state, data) {
      Vue.set(state, 'searchType', data.type + '')
      window.localStorage.setItem(`search.type.${data.game}`, data.type)
    },

    setSearchToggles(state, data) {
      console.log('set toggles', data)
      Vue.set(state, 'searchMode', data.mode + '')
      window.localStorage.setItem('search.mode', data.mode + '')
      Vue.set(state, 'searchGame', data.game + '')
      window.localStorage.setItem(`search.game`, data.game)
      Vue.set(state, 'searchExpansion', data.expansion + '')
      window.localStorage.setItem(`search.expansion.${data.game}`, data.expansion)
      Vue.set(state, 'searchType', data.type + '')
      window.localStorage.setItem(`search.type.${data.game}`, data.type)
    },

    setSearchOpts(state, opts) {
      Vue.set(state, 'searchMode', opts.mode || '')
      window.localStorage.setItem('search.mode', opts.mode || '')
      Vue.set(state, 'siteSearch', (opts.query || '').trim())
      state.execSearch++
    },

    setPageInfo(state, page) {
      if (!page.title) {
        page.title = state.pageInfo.title
      }
      if (page.description) {
        // remove bbcode
        var plaintext = page.description.replace(/\[\/?(?:b|center|code|color|face|font|i|justify|large|left|li|noparse|ol|php|quote|right|s|size|small|sub|sup|taggeduser|table|tbody|tfoot|td|th|tr|u|url|\*)*?.*?\]/g, '').replace(/\n/g, ' ')

        // if shortening the text
        if (plaintext.length > 160) {
          // truncate to length
          plaintext = plaintext.substr(0, 160)
          // truncate to last word
          plaintext = plaintext.substr(0, Math.min(plaintext.length, plaintext.lastIndexOf(' ')))
        }
        page.description = plaintext
      }
      else {
        page.description = 'Database of sharable World of Warcraft addon elements'
      }
      if (!page.image) {
        page.image = 'https://wago.io/media/favicon/apple-touch-icon-180x180.png'
      }
      if (page.unlisted) {
        page.robots = 'noindex,nofollow'
      }
      else {
        page.robots = 'index,follow'
      }
      if (!page.layout) {
        page.layout = state.pageInfo.layout || 'default'
      }
      state.pageInfo = Object.assign({}, page)
      window.prerenderReady = true
    },

    setWotm(state, wotm) {
      state.wotm = JSON.parse(decodeURIComponent(wotm))
    },
    setWago(state, wago) {
      state.wago = wago
    },
    setAddons(state, addons) {
      state.addons = addons
    },
    setWagoJSON(state, json) {
      state.wago.code.json = json
    },
    setMDTWeek(state, week) {
      state.MDTWeek = week
    },
    setLoginRedirect(state, path) {
      state.loginRedirect = path
    },
    setEditorTheme(state, theme) {
      window.setCookie('editorTheme', theme, 365)
      state.editorTheme = theme
      Vue.set(state.user.config, 'editor', theme)
    },
    saveMDT(state, table) {
      state.mdtDungeonTable = table
    },

    showAd(state) {
      state.firstAd = true
    },

    linkApp(state) {
      state.linkApp = true
    },

    SOCKET_OPEN(state, socket) {

    },
    SOCKET_DATA(state, data) {
      if (data.setStream) {
        store.commit('setStreamEmbed', data.setStream)
      }
      else if (data.setCID) {
        state.socket.cid = data.setCID
      }
    }
  },
  getters: {
    i18nLanguage(state) {
      return state.locale.split('-')[0]
    },
    i18nRegion(state) {
      return state.locale.split('-')[1]
    }
  }
})

import App from './Main.vue'

// load router
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import routes from './router.js'
const router = new VueRouter(
  routes
)
Vue.router = router
// called before any route changes
router.beforeEach((to, from, next) => {
  // close mobile nav
  if (Vue.$refs && Vue.$refs['mobile-sidebar']) {
    Vue.$refs['mobile-sidebar'].close()
  }

  document.getElementById('full-navbar')?.classList.add('transition')
  setTimeout(() => {
    document.getElementById('full-navbar')?.classList.remove('transition')  
  }, 100)
    

  // hide any open menus on navigation
  var needClick = document.querySelectorAll('.md-menu-backdrop')
  needClick.forEach((el) => {
    el.click()
  })

  // beta server require login (if JS does not know user is logged in when visiting the page then wait for whoami request handled in App.vue)
  if (window.requireBetaAccess && (!store.state.user.access || !store.state.user.access.beta) && !to.path.match(/^\/(login|auth)/)) {
    router.replace('/')
    return next(false)
  }

  // allow route change
  next()

  // disallow route change
  // next(false)
})

router.afterEach((to, from) => {
  if (!window.preventScroll) {
    window.scrollTo(0, 0)
  }

  if (!from.matched.length || !to.matched.length || (to.matched[0].path === from.matched[0].path && to.matched[0].path === '/:wagoID')) {
    return
  }
  if (!from.matched.length || (to.matched[0].path !== from.matched[0].path || to.matched[0].path !== '/:wagoID')) {
    if (window.ramp?.spaNewPage) {
      window.ramp.spaNewPage()
    }
    else if (window.advertRails?.refresh && sessionStorage.getItem('ad_provider') === 'nitropay') {
      window.advertRails.refresh()
    }

    gtag('config', 'G-WYTP0LZWS6', {
      'page_title': document.title,
      'page_path': to.fullPath
    });
  }
})

// setup vue-meta for header
import Meta from 'vue-meta'
Vue.use(Meta)

// load vddl (drag drop) component
import Vddl from 'vddl'
Vue.use(Vddl)

// load v-show-slide component
import VShowSlide from 'v-show-slide'
Vue.use(VShowSlide)

// crypto
import VueCryptojs from 'vue-cryptojs'
Vue.use(VueCryptojs)

// setup vue material
import VueMaterial from 'vue-material'
// require('vue-material/dist/vue-material.css')
Vue.use(VueMaterial)
// Vue.material.registerTheme({
//   default: {
//     primary: 'black'
//   }
// })
// Vue.material.registerTheme('dark', {
//   primary: {
//     color: 'grey',
//     hue: '800'
//   },
//   accent: {
//     color: 'grey',
//     hue: 300
//   }
// })


const isEmbedPage = !!(document.getElementById('embed-body'))
Vue.use({
  install: function (v) {
    v.prototype.$env = process.env.NODE_ENV
    if (window.location.hostname.match(/itsmark/)) v.prototype.$env = 'development'
  }
})
var dataServers
var authServer
var socketServer
const socketCID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
if (process.env.NODE_ENV === 'development') {
  dataServers = ['http://localhost:3030']
  authServer = 'http://localhost:3030'
  socketServer = 'ws://localhost:3030/ws'
}
else if (window.location.hostname.match(/test/)) {
  dataServers = ['https://data1.wago.io']
  authServer = 'https://data1.wago.io'
  socketServer = 'wss://data1.wago.io/ws'
}
else if (window.location.hostname.match(/itsmark/)) {
  dataServers = ['https://wagodata.itsmark.me']
  authServer = 'https://wagodata.itsmark.me'
  socketServer = 'wss://wagodata.itsmark.me/ws'
}
else {
  // using round robin client-based load balancing
  // dataServers = getServersByCountry(window.cfCountry) // attempt to detect country by cloudflare and assign regional data servers when available
  dataServers = ['https://data.wago.io']
  authServer = 'https://data.wago.io'
  socketServer = 'wss://data.wago.io/ws'
}

dataServers = dataServers.sort(() => {
  return 0.5 - Math.random()
})

// import VueNativeSock from 'vue-native-websocket'
// if (!isEmbedPage) {
//   Vue.use(VueNativeSock, socketServer, {
//     store: store,
//     format: 'json',
//     // reconnection: true,
//     reconnectionDelay: 3000
//   })
// }

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)
// set default options
// TODO: switch axios auth'ing to fetch
Vue.axios.defaults.baseURL = dataServers[0]
Vue.axios.defaults.timeout = 10000
Vue.axios.defaults.withCredentials = true // to use cookies with CORS
if (window.readCookie('token') && window === window.parent) {
  Vue.axios.defaults.headers = { 'x-auth-token': window.readCookie('token') }
}

axios.interceptors.response.use(function (response) {
  // if logging in
  if (response.data.login && response.data.token && response.data.user) {
    window.setCookie('token', response.data.token, 365)
    Vue.axios.defaults.headers = { 'x-auth-token': response.data.token }
    store.commit('setUser', response.data.user)
    router.replace(store.loginRedirect || '/settings')
  }

  return response
})

var refSent = false
// setup http fetch helper
const http = {
  install: function (Vue, options) {
    Vue.prototype.http = {
      config: function (url) {
        var headers = {'Content-Type': 'application/json'}

        // add jwt token
        if (window.readCookie('token') && window === window.parent && url.match(new RegExp('^' + dataServers[0]))) {
          headers['x-auth-token'] = window.readCookie('token')
        }

        return {
          headers: headers,
          credentials: 'include',
          mode: 'cors'
        }
      },

      get: async function (url, params) {
        if (!params) {
          params = {}
        }
        // add referer for analytics
        if (!refSent && document.referrer && !document.referrer.match(/^https:\/\/(\w+\.)?wago.io/) && !url.match(/^\/account\//)) {
          params._ref = document.referrer
          refSent = true
        }

        if (!url.match(/^http/)) {
          url = dataServers[0] + url
        }

        if (url.includes(dataServers[0])) {
          params.domain = GAME_DOMAIN
        }
        // append querystring to url
        if (params) {
          if (!url.match(/\?/)) {
            url = url + '?'
          }
          else {
            url = url + '&'
          }
          url = url + Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')
        }

        // ajax away!
        try {
          var res = await fetch(url, this.config(url))
          if (res.status === 429) {
            console.log('Whoh! Easy on the F5 key!')
            window.eventHub.$emit('showSnackBar', window.i18next.t('Error rate limit exceeded'))
            return {}
          }
          this.interceptHeaders(res)
          var json = await res.json()
          return json
        }
        catch (err) {
          console.error(err)
          window.eventHub.$emit('showSnackBar', window.i18next.t('Error could not reach data server'))
        }
      },
      post: async function (url, params) {
        // prepend API server
        if (!url.match(/^http/)) {
          url = dataServers[0] + url
        }

        if (!params) {
          params = {}
        }
        if (url.includes(dataServers[0])) {
          params.domain = GAME_DOMAIN
        }

        var config = this.config(url)
        config.method = 'post'
        config.headers['Accept'] = 'application/json'
        config.body = JSON.stringify(params)

        // ajax away!
        try {
          var res = await fetch(url, config)
          if (res.status === 429) {
            console.log('Whoh! Easy on the F5 key!')
            window.eventHub.$emit('showSnackBar', window.i18next.t('Error rate limit exceeded'))
          }
          var type = this.interceptHeaders(res)
          var json
          if (type.json) {
            json = await res.json()
          }
          else if (type.blob) {
            return res.blob()
          }
          this.interceptJSON(json)
          return json
        }
        catch (err) {
        }
      },
      upload: function (url, file, params) {
        // prepend API server
        if (!url.match(/^http/)) {
          url = dataServers[0] + url
        }

        if (!params) {
          params = {}
        }

        var _t = this
        return new Promise((resolve, reject) => {
          var reader = new FileReader()
          reader.onload = function (event) {
            params.file = event.target.result
            resolve(_t.post(url, params))
          }
          reader.readAsDataURL(file)
        })
      },
      dataServer: function () {
        var host = dataServers.shift()
        dataServers.push(host)
        return host
      },
      interceptHeaders: function (res) {
        var responseType = {}
        for (var pair of res.headers.entries()) {
          switch (pair[0]) {
            case 'wotm':
              store.commit('setWotm', pair[1])
              break
            case 'content-type':
              if (pair[1].match(/json/)) {
                responseType.json = true
              }
              else if (pair[1].match(/zip/)) {
                responseType.blob = true
              }
              break
          }
        }
        return responseType
      },
      interceptJSON: function (json) {
        if (typeof json !== 'object') {
          return
        }
        if (json.login && json.token && json.user) {
          window.setCookie('token', json.token, 365)
          store.commit('setUser', json.user)
          router.replace(store.loginRedirect || '/account')
        }
        else if (json.guest === true) {
          // session expired or no session at all, clear cookies
          window.clearCookie('token')
          window.clearCookie('theme')
          Vue.axios.defaults.headers = {}
        }

        if (json.mdtWeek) {
          store.commit('setMDTWeek', json.mdtWeek)
        }
      }
    }
  }
}
Vue.use(http)

const socket = {
  install: function (Vue) {
    Vue.prototype.$socket = {
      send: function (data, onReceive) {
        if (!this.connected) {
          throw 'Can not send while not connected to socket.'
        }
        if (onReceive) {
          data.ident = Math.random().toString(36).substring(2, 15)
          this.listeners[data.ident] = onReceive
        }
        const json = JSON.stringify(data)
        this.socket.send(json)
      },
      connect: function () {
        if (isEmbedPage) {
          return
        }
        this.listeners = {}
        let connection = new WebSocket(`${socketServer}?cid=${socketCID}`)
        connection.onmessage = (event) => {
          const data = JSON.parse(event.data)
          if (data.ping) {
            Vue.prototype.$socket.send({ pong: 1 })
          }
          else if (data.error) {
            window.eventHub.$emit('showSnackBar', `Socket Error: ${data.error}`)
          }
          else if (data.ident && this.listeners[data.ident]) {
            this.listeners[data.ident](data)
          }
          else {
            store.commit('SOCKET_DATA', data, this)
          }
        }

        connection.onopen = (event) => {
          this.connected = true
          this.socket = event.target
          store.commit('SOCKET_OPEN', this)
          this.reconnect = setTimeout(function () {
            connection.close()
          }, 1000 * 60 * 20)
        }

        connection.onclose = (event) => {
          connection.close()
          this.connected = false
          clearTimeout(this.reconnect)
        }

        connection.onerror = (error, event) => {
          connection.close()
          this.connected = false
          clearTimeout(this.reconnect)
          const that = this
          this.reconnect = setTimeout(function () {
            that.connect()
          }, 5000)
        }
      }
    }
  }
}
Vue.use(socket)

const DBC = {
  install: function (Vue) {
    Vue.prototype.$DBC = {
      items: [],
      cache: {},
      get: null,
      lookup: function (lookup) {
        this.items.push(lookup)
      },
      process: async function () {
        let items = [...this.items]
        this.items = []
        for (const lookup of items) {
          if (this.cache[lookup.id]) {
            lookup.done(this.cache[lookup.id])
          }
          else {
            try {
              let res = await Vue.prototype.http.get('/lookup/dbc', { id: lookup.id })
              if (res) {
                this.cache[lookup.id] = res
                lookup.done(res)
              }
            }
            catch (e) { console.log(e) }
          }
        }
      }
    }
  }
}
Vue.use(DBC)

const isMobile = {
  install: (Vue) => {
    let agent = navigator.userAgent || navigator.vendor || window.opera
    // eslint-disable-next-line
    Vue.prototype.$isMobile = /android|webos|iphone|ipad|ipos|blackberry|phone/i.test(agent)
  }
}
Vue.use(isMobile)

const testAds = {
  install: (Vue) => {
    var params = new URLSearchParams(window.location.search)
    if (params.get('enable-ads') === 'true') {
      Vue.prototype.$enableAds = true
    }
  }
}
Vue.use(testAds)

const screenWidth = {
  install: (Vue) => {
    Vue.prototype.$screenWidth = window.innerWidth
    window.onresize = function () {
      Vue.prototype.$screenWidth = window.innerWidth
    }
  }
}
Vue.use(screenWidth)
Vue.config.productionTip = false

import VueLazyLoad from 'vue-lazyload'
Vue.use(VueLazyLoad)

// setup momentjs
Vue.use(require('vue-moment'))

// scrollTo
Vue.use(require('vue-scrollto'), {
  offset: -90,
  duration: 350
})

// setup global components
import UIImage from './components/UI/Image.vue'
Vue.component('ui-image', UIImage)

import UILoading from './components/UI/Loading.vue'
Vue.component('ui-loading', UILoading)

import UIWarning from './components/UI/Warning.vue'
Vue.component('ui-warning', UIWarning)

import UIAdvert from './components/UI/Advert.vue'
Vue.component('advert', UIAdvert)

// setup Konva
import VueKonva from 'vue-konva'
Vue.use(VueKonva)

window.Categories = window.Categories = require('./components/libs/categories2')
window.i18next = window.i18next = require('i18next')
import VueI18Next from '@panter/vue-i18next'

import XHR from 'i18next-xhr-backend'
Vue.use(VueI18Next)
console.log('GAME_DOMAIN', GAME_DOMAIN)
i18next.use(XHR)
  .init({
    lng: store.state.locale,
    fallbackLng: 'en-US',
    ns: ['translation', GAME_DOMAIN === 2 ? 'fellowship' : 'warcraft'],
    load: 'currentOnly',
    returnEmptyString: false,
    backend: {
      loadPath: '/static/i18n/[-lng-]/[-ns-].json',
      allowMultiLoading: false,
      crossDomain: false
    },
    interpolation: {
      prefix: '[-',
      suffix: '-]'
    }
  }, () => {
    const i18n = new VueI18Next(i18next)
    window.Categories.init()
    /* eslint-disable no-unused-vars */
    window.eventHub = new Vue()
    new Vue({
      el: '#app',
      i18n,
      router,
      http,
      store,
      template: '<App/>',
      render: h => h(App),
    })
  })

