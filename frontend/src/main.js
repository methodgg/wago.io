require('es6-promise').polyfill()
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

document.body.classList.add('theme-' + (window.readCookie('theme') || 'dark'))

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

// setup Vuex state
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
  state: {
    locale: window.readCookie('locale') || 'en-US',
    user: {},
    loggedIn: false,
    wotm: {},
    wago: {},
    addons: {},
    snackBarText: 'alert',
    loginRedirect: '/',
    theme: window.readCookie('theme') || 'dark',
    editorTheme: window.readCookie('editorTheme') || 'tomorrow',
    MDTTable: false,
    MDTWeek: 0,
    pageInfo: {
      title: 'Import',
      description: 'Database of sharable World of Warcraft addon elements',
      image: 'https://wago.io/media/favicon/apple-touch-icon-180x180.png'
    },
    firstAd: false
  },
  mutations: {
    // store.commit('setLocale', 'en-US')
    setLocale (state, locale) {
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
        var e = {name: 'UnknownLocale', message: locale}
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
    setUser (state, user) {
      if (user && user.UID) {
        state.loggedIn = true
      }
      else {
        state.loggedIn = false
      }
      state.user = JSON.parse(JSON.stringify(user))
      if (state.user.config && state.user.config.theme) {
        window.setCookie('theme', state.user.config.theme, 365)
        document.body.classList.forEach(t => {
          if (t.match(/^theme-/)) {
            document.body.classList.remove(t)
          }
        })
        document.body.classList.add('theme-' + state.user.config.theme)
      }
      if (state.user.config && state.user.config.editor) {
        window.setCookie('editor', state.user.config.editor, 365)
      }
    },

    userClearMention (state, commentID) {
      if (!state.user || !state.user.UID) {
        return
      }
      for (var i = 0; i < state.user.unreadMentions.length; i++) {
        if (state.user.unreadMentions[i]._id === commentID) {
          state.user.unreadMentions.splice(i, 1)
        }
      }
    },

    userSearchOption (state, data) {
      if (!state.user) {
        return
      }
      state.user.config.searchOptions[data.field] = data.value
    },

    setPageInfo (state, page) {
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
      state.pageInfo = JSON.parse(JSON.stringify(page))
      window.prerenderReady = true
    },

    setWotm (state, wotm) {
      state.wotm = JSON.parse(decodeURIComponent(wotm))
    },
    setWago (state, wago) {
      state.wago = wago
    },
    setAddons (state, addons) {
      state.addons = addons
    },
    setWagoJSON (state, json) {
      state.wago.code.json = json
    },
    setMDTWeek (state, week) {
      state.MDTWeek = week
    },
    setLoginRedirect (state, path) {
      state.loginRedirect = path
    },
    setEditorTheme (state, theme) {
      window.setCookie('editorTheme', theme, 365)
      state.editorTheme = theme
      Vue.set(state.user.config, 'editor', theme)
    },
    setTheme (state, theme) {
      window.setCookie('theme', theme)
      document.body.classList.forEach(t => {
        if (t.match(/^theme-/)) {
          document.body.classList.remove(t)
        }
      })
      document.body.classList.add('theme-' + theme)
      Vue.set(state.user.config, 'theme', theme, 365)
      state.theme = theme
    },

    saveMDT (state, table) {
      state.mdtDungeonTable = table
    },

    showAd (state) {
      state.firstAd = true
    }
  },
  getters: {
    i18nLanguage (state) {
      return state.locale.split('-')[0]
    },
    i18nRegion (state) {
      return state.locale.split('-')[1]
    }
  }
})

import App from './Main'

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

  if (to.path === '/login') {
    if (from.path === '/') {
      store.commit('setLoginRedirect', '/account')
    }
    else {
      store.commit('setLoginRedirect', from.path)
    }
  }

  // hide any open menus on navigation
  var needClick = document.querySelectorAll('.md-menu-backdrop')
  needClick.forEach((el) => {
    el.click()
  })

  // beta server require login (if JS does not know user is logged in when visiting the page then wait for whoami request handled in App.vue)
  if (window.requireBetaAccess && (!store.state.user.access || !store.state.user.access.beta) && !to.path.match(/^\/(login|auth)/)) {
    router.replace('/login')
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
    if (!to.path.match(/^\/(login|account)/)) {
      // eslint-disable-next-line
      // load new ad
    }
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
import 'vue-material/dist/vue-material.css'

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

Vue.use({install: function (v) {
  v.prototype.$env = process.env.NODE_ENV
}})
var dataServers
var authServer
if (process.env.NODE_ENV === 'development') {
  dataServers = ['http://io:3030']
  authServer = 'http://io:3030'
}
else {
  // using round robin client-based load balancing
  // dataServers = getServersByCountry(window.cfCountry) // attempt to detect country by cloudflare and assign regional data servers when available
  dataServers = window.dataServers // populated by nginx
  authServer = 'https://data.wago.io' // uses round-robin dns so ensures auth requests go to the same server (required for twitter in-memory auth)
}
dataServers = dataServers.sort(() => {
  return 0.5 - Math.random()
})

import axios from 'axios'
import VueAxios from 'vue-axios'
Vue.use(VueAxios, axios)
// set default options
// TODO: switch axios auth'ing to fetch
Vue.axios.defaults.baseURL = dataServers[0]
Vue.axios.defaults.timeout = 10000
Vue.axios.defaults.withCredentials = true // to use cookies with CORS
if (window.readCookie('token')) {
  Vue.axios.defaults.headers = { 'x-auth-token': window.readCookie('token') }
}

axios.interceptors.response.use(function (response) {
  // if logging in
  if (response.data.login && response.data.token && response.data.user) {
    window.setCookie('token', response.data.token, 365)
    Vue.axios.defaults.headers = { 'x-auth-token': response.data.token }
    store.commit('setUser', response.data.user)
    router.replace(store.loginRedirect || '/account')
  }

  return response
})

var refSent = false
// setup http fetch helper
const http = {
  install: function (Vue, options) {
    Vue.prototype.http = {
      config: function (url) {
        var headers = {}

        // add jwt token
        if (window.readCookie('token')) {
          headers['x-auth-token'] = window.readCookie('token')
        }

        return {
          headers: headers,
          credentials: 'include',
          mode: 'cors'
        }
      },

      get: async function (url, params) {
        // add referer for analytics
        if (!refSent && document.referrer && !document.referrer.match(/^https:\/\/wago.io/) && !url.match(/^\/account\//)) {
          params = params || {}
          params._ref = document.referrer
          refSent = true
        }

        // prepend API server
        var host
        if (!url.match(/^http/) && url.match(/^\/auth/)) {
          host = authServer
          url = host + url
          dataServers.push(host)
        }
        else if (!url.match(/^http/)) {
          host = dataServers.shift()
          url = host + url
          dataServers.push(host)
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
            window.eventHub.$emit('showSnackBar', i18next.t('Error rate limit exceeded'))
            return {}
          }
          this.interceptHeaders(res)
          var json = await res.json()
          return json
        }
        catch (err) {
          // if we couldn't reach the server
          if (host && dataServers.length > 1) {
            // remove server from server list and try again
            dataServers.splice(dataServers.indexOf(host), 1)
            url = url.replace(host, dataServers[0])
            return this.get(url, params)
          }
          else {
            console.log('No servers available', err)
            window.eventHub.$emit('showSnackBar', i18next.t('Error could not reach data server'))
          }
        }
      },
      post: async function (url, params) {
        // prepend API server
        if (!url.match(/^http/) && url.match(/^\/auth/)) {
          host = authServer
          url = host + url
          dataServers.push(host)
        }
        else if (!url.match(/^http/)) {
          var host = dataServers.shift()
          url = host + url
          dataServers.push(host)
        }

        if (!params) {
          params = {}
        }

        var config = this.config()
        config.method = 'post'
        config.headers['Accept'] = 'application/json'
        config.body = JSON.stringify(params)

        // ajax away!
        try {
          var res = await fetch(url, config)
          if (res.status === 429) {
            console.log('Whoh! Easy on the F5 key!')
            window.eventHub.$emit('showSnackBar', i18next.t('Error rate limit exceeded'))
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
          // if we couldn't reach the server
          if (host && dataServers.length > 1) {
            // remove server from server list and try again
            dataServers.splice(dataServers.indexOf(host), 1)
            url = url.replace(host, dataServers[0])
            return this.get(url, params)
          }
          else {
            console.log('No servers available', err)
            window.eventHub.$emit('showSnackBar', i18next.t('Error could not reach data server'))
          }
        }
      },
      upload: function (url, file, params) {
        // prepend API server
        if (!url.match(/^http/)) {
          var host = dataServers.shift()
          url = host + url
          dataServers.push(host)
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
      // PostToWACompanion: function (action, id) {
      //   var e = document.createElement('a')
      //   e.id = 'sendToCompanion'
      //   e.href = `weakauras-companion://wago/${action}/${id}`
      //   document.getElementsByTagName('body')[0].appendChild(e)
      //   e.click()
      //   e.parentNode.removeChild(e)
      //   return fetch(`weakauras-companion://wago/${action}/${id}`, {
      //     mode: 'no-cors',
      //     cache: 'no-cache'
      //   })
      //   .then((res) => {
      //     return res.json()
      //   }).then((json) => {
      //     if (json.success) {
      //       window.eventHub.$emit('showSnackBar', i18next.t('WeakAura successfully sent to Companion App'))
      //     }
      //     else {
      //       window.eventHub.$emit('showSnackBar', i18next.t('An error has occurred'))
      //     }
      //   }).catch((err) => {
      //     console.log(err)
      //     window.eventHub.$emit('showSnackBar', i18next.t('Error could not reach the WeakAura Companion App, are you sure it is running?'))
      //   })
      // },
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
          Vue.axios.defaults.headers = { }
        }

        if (json.mdtWeek) {
          store.commit('setMDTWeek', json.mdtWeek)
        }
      }
    }
  }
}
Vue.use(http)

const isMobile = {
  install: (Vue) => {
    let agent = navigator.userAgent || navigator.vendor || window.opera
    // eslint-disable-next-line
    Vue.prototype.$isMobile = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(agent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))
  }
}
Vue.use(isMobile)

const testAds = {
  install: (Vue) => {
    var params = new URLSearchParams(window.location.search)
    Vue.prototype.$enableAds = false
    if (params.get('enable-ads') === 'true') {
      console.log('ADS ENABLED')
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

// since b.net only allows a single callback per app we need a second key for a beta app
var bnetClientID
if (window.location.hostname === 'io') {
  bnetClientID = '814f698f09d446a8b5ba7b1b6123fb3f'
}
else {
  bnetClientID = '32e7423b92714e888c73e087be3a9ad3'
}

// setup third party oauth authentication
import VueAuth from '@websanova/vue-auth/dist/vue-auth.esm.js'
import driverAuthBearer from '@websanova/vue-auth/dist/drivers/auth/bearer.esm.js'
import driverHttpAxios from '@websanova/vue-auth/dist/drivers/http/axios.1.x.esm.js'
import driverRouterVueRouter from '@websanova/vue-auth/dist/drivers/router/vue-router.2.x.esm.js'

Vue.use(VueAuth, {
  auth: driverAuthBearer,
  http: driverHttpAxios,
  router: driverRouterVueRouter,
  fetchData: {enabled: false},
  oauth2: {
    battlenet: {
      url: 'https://us.battle.net/oauth/authorize',
      method: 'POST',
      params: {
        client_id: bnetClientID,
        redirect_uri: 'auth/battlenet',
        response_type: 'code',
        scope: 'wow.profile'
      }
    },
    battlenetCN: {
      url: 'https://www.battlenet.com.cn/oauth/authorize',
      method: 'POST',
      params: {
        client_id: bnetClientID,
        redirect_uri: 'auth/battlenetCN',
        response_type: 'code',
        scope: 'wow.profile'
      }
    },
    discord: {
      url: 'https://discordapp.com/api/oauth2/authorize',
      method: 'POST',
      params: {
        client_id: '716425995854544986',
        redirect_uri: 'auth/discord',
        response_type: 'code',
        scope: 'identify'
      }
    },
    google: {
      url: 'https://accounts.google.com/o/oauth2/auth',
      params: {
        client_id: '1066257896372-gn76b3s7sfra5s46861urve9rved56vd.apps.googleusercontent.com',
        redirect_uri: 'auth/google',
        response_type: 'code',
        scope: 'profile openid'
      }
    },
    patreon: {
      url: 'https://www.patreon.com/oauth2/authorize?f=1',
      params: {
        client_id: '-lUfSkaxFXmH-l0EBKFchZ3LmYGnjwKSL-93pVhZm2qiQXhZmaaNMyx8LuS1OiZ-',
        redirect_uri: 'auth/patreon',
        response_type: 'code',
        scope:'users pledges-to-me'
      }
    }
  }
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

window.braceRequires = function () {
  // ace editor themes and file types
  require('brace/mode/html')
  require('brace/mode/json')
  require('brace/mode/lua')
  // bright themes
  require('brace/theme/chrome')
  require('brace/theme/clouds')
  require('brace/theme/crimson_editor')
  require('brace/theme/dawn')
  require('brace/theme/dreamweaver')
  require('brace/theme/eclipse')
  require('brace/theme/github')
  require('brace/theme/iplastic')
  require('brace/theme/solarized_light')
  require('brace/theme/textmate')
  require('brace/theme/tomorrow')
  require('brace/theme/xcode')
  require('brace/theme/kuroir')
  require('brace/theme/katzenmilch')
  require('brace/theme/sqlserver')
  // dark themes
  require('brace/theme/ambiance')
  require('brace/theme/chaos')
  require('brace/theme/clouds_midnight')
  require('brace/theme/cobalt')
  require('brace/theme/idle_fingers')
  require('brace/theme/kr_theme')
  require('brace/theme/merbivore')
  require('brace/theme/merbivore_soft')
  require('brace/theme/mono_industrial')
  require('brace/theme/monokai')
  require('brace/theme/pastel_on_dark')
  require('brace/theme/solarized_dark')
  require('brace/theme/terminal')
  require('brace/theme/tomorrow_night')
  require('brace/theme/tomorrow_night_blue')
  require('brace/theme/tomorrow_night_bright')
  require('brace/theme/tomorrow_night_eighties')
  require('brace/theme/twilight')
  require('brace/theme/vibrant_ink')
}

// setup Konva
import VueKonva from 'vue-konva'
Vue.use(VueKonva)

window.i18next = window.i18next = require('i18next')
import VueI18Next from '@panter/vue-i18next'

import XHR from 'i18next-xhr-backend'
Vue.use(VueI18Next)
i18next.use(XHR)
  .init({
    lng: store.state.locale,
    fallbackLng: 'en-US',
    ns: ['translation', 'warcraft'],
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


