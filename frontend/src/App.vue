<template>
  <div id="app">
    <div id="copyContainer"></div>
    <md-sidenav class="md-hide-small-and-up md-left" ref="mobileSidebar" id="mobile-sidebar">
      <form novalidate @submit.prevent="goSearch(gSearch)" id="gSearch-m">
        <md-input-container>
          <label>Search</label>
          <md-input v-model="gSearch"></md-input>
          <md-button @click="goSearch(gSearch)">{{ $t("Go") }}</md-button>
        </md-input-container>
      </form>
      <md-list>
        <md-list-item v-if="LoggedIn">
          <span :class="User.css"><md-icon>person</md-icon> {{ User.name }}</span>
          <md-list-expand>
            <md-list>
              <md-list-item><router-link :to="'/p/'+User.name">{{ $t("My Profile") }}</router-link></md-list-item>
              <md-list-item><router-link to="/my/mentions">{{ $t("My Mentions") }} <span class="unreadCount" v-if="User.unreadMentions > 0">{{ User.unreadMentions }}</span></router-link></md-list-item>
              <md-list-item><router-link to="/my/stars">{{ $t("My Favorites") }}</router-link></md-list-item>
              <md-list-item><router-link to="/account">{{ $t("Account Settings") }}</router-link></md-list-item>
              <md-list-item v-if="User.access.admin"><router-link to="/admin">Admin</router-link></md-list-item>
            </md-list>
          </md-list-expand>
        </md-list-item>
        <md-list-item v-else><router-link to='/login'>{{ $t("Login") }}</router-link></md-list-item>
        <md-list-item><router-link to='/'>{{ $t("Import") }}</router-link></md-list-item>
        <md-list-item><router-link to='/weakauras'>WeakAuras</router-link></md-list-item>
        <md-list-item><router-link to='/elvui'>ElvUI</router-link></md-list-item>
        <md-list-item><router-link to='/vuhdo'>Vuhdo</router-link></md-list-item>
        <md-list-item><router-link to='/totalrp'>Total RP</router-link></md-list-item>
        <md-list-item><router-link to='/collections'>{{ $t("Collections") }}</router-link></md-list-item>
      </md-list>
    </md-sidenav>
    <md-sidenav class="md-hide-xsmall" ref="full-sidebar" id="full-sidebar">
      <h2 class="md-title md-hide-xsmall"><router-link to="/"><img id="logo" src="./assets/wagologo.png"/></router-link></h2>
      <div class="autoscroll">
        <div id="user-info">
          <div v-if="LoggedIn" v-html="$t('Welcome! You are viewing Wago as [-roleclass-][-name-]', {name: User.name, roleclass: User.css})"></div>
          <div v-else v-html="$t('Welcome! You are viewing Wago as a guest')"></div>
        </div>
        <form novalidate @submit.stop.prevent="goSearch(gSearch)" id="gSearch">
          <md-input-container>
            <label>{{ $t("Search") }}</label>
            <md-input v-model="gSearch"></md-input>
          </md-input-container>
        </form>
        <md-list v-if="LoggedIn" id="usernav">
          <md-list-item><router-link :to="'/p/'+User.name">{{ $t("My Profile") }}</router-link></md-list-item>
          <md-list-item><router-link to="/my/mentions">{{ $t("My Mentions") }} <span class="unreadCount" v-if="User.unreadMentions.length > 0">{{ User.unreadMentions.length }}</span></router-link></md-list-item>
          <md-list-item><router-link to="/my/stars">{{ $t("My Favorites") }}</router-link></md-list-item>
          <md-list-item><router-link to="/account">{{ $t("Account Settings") }}</router-link></md-list-item>
          <md-list-item v-if="User.access.admin"><router-link to="/admin">Admin</router-link></md-list-item>
        </md-list>     
        <div v-if="WotM.name" id="wotm">
          <strong>{{ $t("Wago of the Minute") }}</strong><br>
          <router-link :to="'/' + WotM.slug"><strong>{{ WotM.name }}</strong></router-link><br>
          <router-link :to="'/' + WotM.slug"><md-image :md-src="WotM.screenshot" /></router-link>
        </div>
      </div>
    </md-sidenav>
    <md-toolbar id="nav"> 
      <md-button class="md-icon-button md-hide-small-and-up" @click="toggleMobileNav()">
        <md-icon>menu</md-icon>
      </md-button>
      <h2 class="md-title md-hide-small-and-up"><img id="logo" src="./assets/wagologo.png"/></h2>
      
      <div id="h-nav" class="md-hide-xsmall">
        <a class='vr md-button md-theme-default' href='/'>{{ $t("Import") }}</a>
        <a class='vr md-button md-theme-default' href='/weakauras'>WeakAuras</a>
        <a class='vr md-button md-theme-default' href='/elvui'>ElvUI</a>
        <a class='vr md-button md-theme-default' href='/vuhdo'>Vuhdo</a>
        <a class='vr md-button md-theme-default' href='/totalrp'>Total RP</a>
        <a class='vr md-button md-theme-default' href='/collections'>{{ $t("Collections") }}</a>
      </div>
      <div id="hr-nav" class="md-hide-xsmall">
        <ui-select-locale display="code"></ui-select-locale>
      </div>
    </md-toolbar>

    <md-snackbar md-position="top center" ref="snackbar" md-duration="4000">
      <span>{{ PopMsg }}</span>
      <md-button class="md-accent" md-theme="light-blue" @click.native="$refs.snackbar.close()">{{ $t("Close") }}</md-button>
    </md-snackbar>

    <div id="content">
      <router-view></router-view>
    </div>

    <footer>
      <div class='legal fleft'>
        <span>&copy; 2017 Wago.io</span>
        <span><router-link to="/terms-of-service">{{ $t("Terms of Service") }}</router-link></span>
        <span><router-link to="/privacy-policy">{{ $t("Privacy Policy") }}</router-link></span>
      </div>

      <a class="resource" target="_blank" href="https://postapoc.gg"><img src="./assets/postapoc.png">Post Apocalypse</a>
      <a class="resource" target="_blank" href="https://www.patreon.com/wago"><img src="./assets/patreon.png">{{ $t("Support the website") }}</a>
      <a class="resource" target="_blank" href="https://discord.gg/wa2"><img src="./assets/discord.png">{{ $t("Join WA Discord") }}</a>
      <a class="resource" target="_blank" href="https://github.com/oratory/wago.io"><img src="./assets/github.png">{{ $t("View source") }}</a>
     

    </footer>
  </div>
</template>

<script>
function interceptClickEvent (e, vue) {
  var target = e.target || e.srcElement
  // if clicked element is <a class='vr'> then use vue-router
  if (target.tagName === 'A' && target.className.match(/\bvr\b/)) {
    var href = target.getAttribute('href')
    vue.$router.push(href)
    // tell the browser not to respond to the link click
    e.preventDefault()
  }
}

export default {
  name: 'app',
  data: () => {
    return {
      PopMsg: 'test',
      gSearch: ''
    }
  },
  created: function () {
    // listen for link click events at the document level
    if (document.addEventListener) {
      document.addEventListener('click', (e) => {
        interceptClickEvent(e, this)
      })
    }
    else if (document.attachEvent) {
      document.attachEvent('onclick', (e) => {
        interceptClickEvent(e, this)
      })
    }

    var vue = this
    var params = {}

    if (!window.readCookie('locale')) {
      params.getLocale = 1
    }

    // get user account and locale settings
    this.http.get('/account/whoami', params).then((res) => {
      if (res.locale && vue.$store.state.locale !== res.locale) {
        vue.$store.commit('setLocale', res.locale)
      }

      if (res.token) {
        window.SetCookie('token', res.token, 365)
        vue.axios.defaults.headers = { 'x-auth-token': res.token }
      }

      if (res.wotm) {
        vue.$store.commit('initWotM', res.wotm)
      }

      // if beta server and user does not have beta access
      // if (process.env.WEB_SERVER.match(/t1000/) && (res.guest || !res.user || !res.user.access || !res.user.access.beta)) {
      //   window.requireBetaAccess = true
      //   if (!vue.$route.path.match(/\/auth\//)) {
      //     window.initPage = vue.$route.path
      //     vue.$router.replace('/login')
      //   }
      // }
      if (res.user) {
        this.$store.commit('setUser', res.user)
        if (vue.$route.path === '/login') {
          vue.$router.replace('/account')
        }
      }
      else if (res.guest) {
        this.$store.commit('setUser', { guest: true })
      }
    }).catch((err) => {
      console.log('whoami error', err)
      window.initPage = vue.$route.path
      // vue.$router.replace('/login')
    })

    window.eventHub.$on('showSnackBar', this.showSnackBar)
  },
  methods: {
    showSnackBar: function (text) {
      this.PopMsg = text
      this.$refs.snackbar.open()
    },
    doLogout: function () {
      this.$router.replace('/logout')
    },
    toggleMobileNav: function () {
      this.$refs.mobileSidebar.toggle()
    },
    goSearch: function (q) {
      this.$router.push('/search/' + q.trim().replace(/\s+/g, '+'))
      this.gSearch = ''
    }
  },
  computed: {
    lang () {
      return this.$store.getters.language
    },
    User () {
      return this.$store.state.user
    },
    LoggedIn () {
      return this.$store.state.loggedIn
    },
    WotM () {
      return this.$store.state.wotm
    },
    Page () {
      return this.$store.state.pageInfo
    }
  },
  watch: {
    $route (to, from) {
      this.$refs.mobileSidebar.close()
    }
  },
  metaInfo () {
    return {
      titleTemplate: '%s | Wago.io',
      title: this.Page.title,
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, shrink-to-fit=no' },
        { 'http-equiv': 'x-ua-compatible', content: 'ie=edge' },
        { 'theme-color': 'x-ua-compatible', content: '#c1272d' },
        { name: 'description', content: this.Page.description },

        { name: 'twitter:card', value: 'summary' },

        { name: 'og:title', content: this.Page.title + ' | Wago.io', vmid: 'head-og-title' },
        { name: 'og:type', content: this.$route.path === '/' && 'website' || 'article', vmid: 'head-og-type' },
        { name: 'og:url', content: 'https://wago.io' + this.$route.path, vmid: 'head-og-url' },
        { name: 'og:image', content: this.Page.image, vmid: 'head-og-img' },
        { name: 'og:description', content: this.Page.description, vmid: 'head-og-desc' },

        { name: 'msapplication-square70x70logo', content: 'https://media.wago.io/favicon/smalltile.png' },
        { name: 'msapplication-square150x150logo', content: 'https://media.wago.io/favicon/mediumtile.png' },
        { name: 'msapplication-wide310x150logo', content: 'https://media.wago.io/favicon/widetile.png' },
        { name: 'msapplication-square310x310logo', content: 'https://media.wago.io/favicon/largetile.png' }
      ],
      link: [
        { rel: 'stylesheet', href: '//fonts.googleapis.com/css?family=Roboto:300,400,500,700,400italic' },
        { rel: 'stylesheet', href: '//fonts.googleapis.com/icon?family=Material+Icons' },

        { rel: 'shortcut icon', href: 'https://media.wago.io/favicon/favicon.ico', type: 'image/x-icon' },
        { rel: 'apple-touch-icon', sizes: '57x57', href: 'https://media.wago.io/favicon/apple-touch-icon-57x57.png' },
        { rel: 'apple-touch-icon', sizes: '60x60', href: 'https://media.wago.io/favicon/apple-touch-icon-60x60.png' },
        { rel: 'apple-touch-icon', sizes: '72x72', href: 'https://media.wago.io/favicon/apple-touch-icon-72x72.png' },
        { rel: 'apple-touch-icon', sizes: '76x76', href: 'https://media.wago.io/favicon/apple-touch-icon-76x76.png' },
        { rel: 'apple-touch-icon', sizes: '114x114', href: 'https://media.wago.io/favicon/apple-touch-icon-114x114.png' },
        { rel: 'apple-touch-icon', sizes: '120x120', href: 'https://media.wago.io/favicon/apple-touch-icon-120x120.png' },
        { rel: 'apple-touch-icon', sizes: '144x144', href: 'https://media.wago.io/favicon/apple-touch-icon-144x144.png' },
        { rel: 'apple-touch-icon', sizes: '152x152', href: 'https://media.wago.io/favicon/apple-touch-icon-152x152.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: 'https://media.wago.io/favicon/apple-touch-icon-180x180.png' },
        { rel: 'icon', sizes: '16x16', type: 'image/png', href: 'https://media.wago.io/favicon/favicon-16x16.png' },
        { rel: 'icon', sizes: '32x32', type: 'image/png', href: 'https://media.wago.io/favicon/favicon-32x32.png' },
        { rel: 'icon', sizes: '96x96', type: 'image/png', href: 'https://media.wago.io/favicon/favicon-96x96.png' },
        { rel: 'icon', sizes: '192x192', type: 'image/png', href: 'https://media.wago.io/favicon/android-chrome-192x192.png' }
      ],
      noscript: [
        { innerHTML: 'This website requires JavaScript.' }
      ]
    }
  }
}
</script>

<style lang="scss" src="./assets/themes.scss"></style>
<style>
@import './assets/global.css';

@media (min-width: 601px) {
  #app { pointer-events: none; }
  #app > * { width: 100%; max-width:100% }
  .md-backdrop { pointer-events: none }

  #full-sidebar .md-sidenav-content {
    top:0;
    pointer-events: auto;
    transform: translateZ(0)!important;
  }
  #full-sidebar .md-sidenav-content {
    width: 304px;
    display: flex;
    flex-flow: column;
    overflow: hidden;
    background: #ECECEC;
    z-index: 1
  }
  #content, #nav { padding-left: 304px; pointer-events: auto; position: relative }
  #logo { max-height: 72px; }
}

#app {
  min-height: 100%;
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  padding-bottom: 180px;
  pointer-events: auto;
}
#h-nav { flex: 1 }
footer {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 16px;
  margin-top: 100%;
  min-height: 100px;
  background-color: black;
  color: white;
  z-index:2
}
footer a { color: white; }
footer .legal { font-size: 80%; padding-right: 16px; float: left }
footer .legal span { display:block }
footer .resource { float: left; padding: 4px 24px; text-align: center; font-size: 80%}
footer .resource img { height: 32px; display: block; margin: 0 auto}
footer .md-bottom-bar, footer .md-bottom-bar button, footer .md-bottom-bar i { background: inherit!important; color: white!important }
footer .md-bottom-bar-item.md-active .md-icon, footer .md-bottom-bar-item.md-active .md-text { color: white }

#usernav { padding: 0; background-color: #ccc; padding-top: 8px}
#usernav .md-subheader { padding-left: 0;}
#usernav .md-list-item a { justify-content: start }
#usernav .md-list-item a span { margin-left: 8px; line-height: 18px }
.autoscroll { overflow: auto; margin-bottom: 100px }
.md-sidenav h2 { background: black; margin:0; padding: 16px 24px; text-align: center}
#user-info { background: #CCC; padding: 16px 16px 0 }
#gSearch { background: #CCC; padding: 0 16px}
#gSearch .md-input-container { margin: 0 }
#gSearch-m { padding: 0 16px}
#gSearch-m button { margin-top: -2px }
.md-list { padding-bottom: 0}
.md-list:after { height: 1px; width:100%; background-color: rgba(0,0,0,.12); content: " " }
.md-list-item .md-list-item-container { padding-left: 16px }
#wotm { padding: 16px }
#wotm img { max-height: 200px }
.wotm-controls { padding: 16px 16px 0; margin-bottom: -8px}
.wotm-controls button { background: none; border: none; cursor: pointer}

@media (max-width: 600px) {
  #logo { max-height: 28px; }
  .md-toolbar h2 { margin:0; padding:0}
  footer .legal { float: none; padding-bottom: 6px}
  footer .legal span { display: inline; padding-left: 6px }
  footer .resource { padding-left: 0; width:50%}
}

.document { padding: 16px }
.md-card { padding: 16px; margin: 16px; background: white }
.md-card > h3 { margin: 0 }
.md-card > h3 + .md-subheader { padding:0; min-height:0 }

.unreadCount { background: #c1272d; color: white; padding: 4px; border-radius: 2px;  }
</style>
