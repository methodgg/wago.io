<template>
  <div id="app">
    <div id="maincontent" v-if="!isEmbed">
      <div id="copyContainer"></div>
      <md-toolbar id="topbar">
        <md-button class="md-icon-button md-hide-small-and-up" @click="toggleMobileNav()">
          <md-icon>menu</md-icon>
        </md-button>
        <h2 class="md-title" id="logo"><router-link to="/"><img src="./assets/wagoio-logo.png"/></router-link></h2>
        <h2 class="md-title" id="xmaslogo" v-if="today.getMonth() === 11"><router-link to="/"><img src="./assets/xmas-hat.png"/></router-link></h2>

        <div id="h-nav" class="md-hide-xsmall">
          <form novalidate @submit.stop.prevent="goSearch(gSearch)" id="gSearch">
            <input type="text" v-model="gSearch" placeholder="Search Wago..." />
            <md-menu md-direction="bottom left" :md-offset-y="50" ref="advancedSearch">
              <md-button class="md-icon-button md-primary" md-menu-trigger @click="buildSearch(true)">
                <md-icon>arrow_drop_down</md-icon>
              </md-button>
              <md-menu-content id="advancedSearch">
                <md-input-container>
                  <label for="advSearchType">{{ $t("Select Type") }}</label>
                  <md-select name="advSearchType" id="advSearchType" v-model="advSearchType" md-menu-class="advSearchSelect">
                    <md-option value=""><em>All Imports</em></md-option>
                    <md-option value="ElvUI">ElvUI</md-option>
                    <md-option value="TotalRP">Total RP</md-option>
                    <md-option value="MDT">Method Dungeon Tools</md-option>
                    <md-option value="Plater">Plater</md-option>
                    <md-option value="VuhDo">VuhDo</md-option>
                    <md-option value="WeakAura">WeakAura</md-option>
                    <md-option value="Classic-WeakAura">Classic WeakAura</md-option>
                    <md-option value="Collection">Collection</md-option>
                    <md-option value="Snippet">Snippet</md-option>
                  </md-select>
                </md-input-container>

                <md-input-container>
                  <label for="advSearchUser">{{ $t("Select User") }}</label>
                  <md-select name="advSearchUser" id="advSearchUser" v-model="advSearchUser" md-menu-class="advSearchSelect">
                    <md-option value=""><em>{{ $t("All Users") }}</em></md-option>
                    <md-option value="anon">{{ $t("Include Anonymous") }}</md-option>
                    <md-option value="user">{{ $t("Specific User") }}</md-option>
                  </md-select>
                </md-input-container>

                <md-input-container v-if="advSearchUser === 'user'" id="advSearchUserName">
                  <label for="advSearchUserName">{{ $t("User Name") }}</label>
                  <md-autocomplete v-model="advSearchUserName" :fetch="autoCompleteUserName"></md-autocomplete>
                </md-input-container>

                <md-layout md-row>
                  <md-checkbox v-model="advSearchStarred">Starred</md-checkbox>
                  <md-checkbox v-model="advSearchMentioned">Mentioned</md-checkbox>
                </md-layout>

                <md-input-container>
                  <label for="advSearchDate">{{ $t("Date Modified") }}</label>
                  <md-select name="advSearchDate" id="advSearchDate" v-model="advSearchDate" md-menu-class="advSearchSelect">
                    <md-option value=""><em>{{ $t("Any Time") }}</em></md-option>
                    <md-option value="24 Hours">{{ $t("Last 24 Hours") }}</md-option>
                    <md-option value="3 Days">{{ $t("Last Three Days") }}</md-option>
                    <md-option value="7 Days">{{ $t("Last Week") }}</md-option>
                    <md-option value="1 Month">{{ $t("Last Month") }}</md-option>
                  </md-select>
                </md-input-container>

                <md-input-container>
                  <label>Text Search</label>
                  <md-input v-model="advSearchText"></md-input>
                </md-input-container>

                <md-layout md-align="end" md-gutter="16">
                  <md-layout md-flex="50" class="advSearchButtons">
                    <md-button class="md-raised md-primary" @click="goSearch(gSearch)">Search</md-button>
                    <md-button @click="buildSearch('reset')">Reset</md-button>
                  </md-layout>
                </md-layout>
              </md-menu-content>
            </md-menu>
          </form>
        </div>
        <div id="hr-nav" class="md-hide-xsmall">
          <h2 class="md-title md-hide-small-and-up" id="logo"><router-link to="/"><img src="./assets/wagoio-logo.png"/></router-link></h2>
          <img src="./assets/random.png" id="randombtn" @click="$router.push('/random')" />
          <select-locale display="code"></select-locale>
          <login-button></login-button>
        </div>
      </md-toolbar>
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
          <md-list-item><router-link to='/'>{{ $t("Import") }}</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/elvui'>ElvUI</router-link></md-list-item>
          <md-list-item v-if="User && User.access && User.access.beta"><router-link to='/create-new-note'>Encounter Notes [Beta]</router-link></md-list-item>
          <!-- <md-list-item><router-link to='/grid2'>Grid2</router-link></md-list-item> -->
          <md-list-item><router-link to='/mdt'>Method Dungeon Tools</router-link></md-list-item>
          <md-list-item><router-link to='/plater'>Plater Nameplates</router-link></md-list-item>
          <md-list-item><router-link to='/totalrp'>Total RP</router-link></md-list-item>
          <md-list-item><router-link to='/vuhdo'>VuhDo</router-link></md-list-item>
          <md-list-item><router-link to='/weakauras'>WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/collections'>{{ $t("Collections") }}</router-link></md-list-item>
          <md-list-item><router-link to='/snippets'>{{ $t("Snippets") }}</router-link><md-divider></md-divider></md-list-item>
        </md-list>
      </md-sidenav>
      <md-sidenav class="md-hide-xsmall" ref="full-sidebar" id="full-sidebar">
        <md-list class="mainnav">
          <md-list-item><router-link to='/'>{{ $t("Import") }}</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/elvui'>ElvUI</router-link></md-list-item>
          <md-list-item v-if="User && User.access && User.access.beta"><router-link to='/create-new-note'>Encounter Notes [Beta]</router-link></md-list-item>
          <!-- <md-list-item><router-link to='/grid2'>Grid2</router-link></md-list-item> -->
          <md-list-item><router-link to='/mdt'>Method Dungeon Tools</router-link></md-list-item>
          <md-list-item><router-link to='/plater'>Plater Nameplates</router-link></md-list-item>
          <md-list-item><router-link to='/totalrp'>Total RP</router-link></md-list-item>
          <md-list-item><router-link to='/vuhdo'>VuhDo</router-link></md-list-item>
          <md-list-item><router-link to='/weakauras'>WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/classic-weakauras'>Classic WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/collections'>{{ $t("Collections") }}</router-link></md-list-item>
          <md-list-item><router-link to='/snippets'>{{ $t("Snippets") }}</router-link><md-divider></md-divider></md-list-item>
          <template v-if="LoggedIn">
            <md-list-item><router-link :to="'/p/'+User.name">{{ $t("My Profile") }}</router-link></md-list-item>
            <md-list-item><router-link to="/my/mentions">{{ $t("My Mentions") }} <span class="unreadCount" v-if="User.unreadMentions.length > 0">{{ User.unreadMentions.length }}</span></router-link></md-list-item>
            <md-list-item><router-link to="/my/stars">{{ $t("My Favorites") }}</router-link><md-divider></md-divider></md-list-item>
          </template>
        </md-list>
        <div v-if="WotM.name" id="wotm">
          <strong>{{ $t("Wago of the Minute") }}</strong><br>
          <router-link :to="'/' + WotM.slug"><strong>{{ WotM.name }}</strong></router-link><br>
          <router-link :to="'/' + WotM.slug"><md-image :md-src="WotM.screenshot" /></router-link>
        </div>

        <md-list class="mainnav bottom">
          <md-list-item target="_blank" href="https://www.patreon.com/wago"><div><img src="./assets/Patreon_White.png"></div>{{ $t("Support the website") }}</md-list-item>
          <md-list-item target="_blank" href="https://discord.gg/wa2"><div><img src="./assets/discord.png"></div>{{ $t("Join WA Discord") }}</md-list-item>
          <md-list-item target="_blank" href="https://github.com/oratory/wago.io"><div><img src="./assets/github.png"></div>{{ $t("Open source") }}</md-list-item>
          <md-list-item target="_blank" href="https://weakauras.wtf/"><div><img src="./assets/weakauralogo.png" style="height:23px"></div>WeakAuras Companion</md-list-item>
          <!--<md-list-item target="_blank" href="https://www.nevermorenation.com/"><div><img src="./assets/nevermore.png"></div>Classic Raiding Guild<md-divider></md-divider></md-list-item>-->
        </md-list>

        <div class='legal'>
          <span>&copy; 2016-{{(new Date()).getFullYear()}} Wago.io</span>
          <span><router-link to="/terms-of-service">{{ $t("Terms of Service") }}</router-link></span>
          <span><router-link to="/privacy-policy">{{ $t("Privacy Policy") }}</router-link></span>
        </div>
      </md-sidenav>

      <md-snackbar md-position="top center" ref="snackbar" md-duration="4000">
        <span>{{ PopMsg }}</span>
        <md-button @click.native="$refs.snackbar.close()">{{ $t("Close") }}</md-button>
      </md-snackbar>

      <div id="content">
        <router-view></router-view>
      </div>
    </div>
    <div v-else>
      <view-embed :wagoID="embedID"></view-embed>
    </div>
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
  components: {
    'select-locale': require('./components/UI/SelectLocale.vue'),
    'login-button': require('./components/UI/LoginButton.vue'),
    'md-autocomplete': require('./components/UI/md-autocomplete.vue'),
    'view-embed': require('./components/core/ViewEmbed.vue')
  },
  data: () => {
    return {
      PopMsg: 'test',
      gSearch: '',
      advSearchType: '',
      advSearchUser: '',
      advSearchUserName: '',
      advSearchText: '',
      advSearchStarred: false,
      advSearchMentioned: false,
      advSearchDate: '',
      today: new Date()
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
    if (!this.isEmbed) {
      this.http.get('/account/whoami', params).then((res) => {
        if (res.locale && vue.$store.state.locale !== res.locale) {
          vue.$store.commit('setLocale', res.locale)
        }

        if (res.token) {
          window.setCookie('token', res.token, 365)
          vue.axios.defaults.headers = { 'x-auth-token': res.token }
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
          this.$store.commit('setUser', { guest: true, config: { searchOptions: { sort: 'bestmatch', relevance: 'standard', expansion: '' } } })
        }
      }).catch((err) => {
        console.error(err)
        window.initPage = vue.$route.path
        // vue.$router.replace('/login')
      })
    }

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
      this.$refs.advancedSearch.close()
      this.$router.push('/search/' + q.trim().replace(/\s+/g, '+'))
      this.searchString = q.trim()
      this.buildSearch('reset')
    },
    buildSearch: function (root) {
      if (root === 'reset') {
        this.advSearchUser = ''
        this.advSearchUserName = ''
        this.advSearchType = ''
        this.advSearchText = ''
        this.advSearchStarred = false
        this.advSearchMentioned = false
        this.advSearchDate = ''

        this.gSearch = ''
      }
      else if (root) {
        var s = this.gSearch
        var m = s.match(/\btype:\s*"?([a-zA-Z0-9]+)"?\s*/i)
        if (m) {
          this.advSearchType = m[1]
        }

        m = s.match(/\banon:\s*"?([a-zA-Z0-9]+)"?\s*/i)
        if (m && (m[1] === '1' || m[1].toLowerCase() === 'true')) {
          this.advSearchUser = 'anon'
        }

        m = s.match(/\buser:\s*"?([a-zA-Z0-9]+)"?\s*/i)
        if (m) {
          this.advSearchUser = 'user'
          this.advSearchUserName = m[1]
        }

        m = s.match(/\bstarred:\s*"?([a-zA-Z0-9]+)"?\s*/i)
        if (m && (m[1] === '1' || m[1].toLowerCase() === 'true')) {
          this.advSearchStarred = true
        }

        m = s.match(/\bmentioned:\s*"?([a-zA-Z0-9]+)"?\s*/i)
        if (m && (m[1] === '1' || m[1].toLowerCase() === 'true')) {
          this.advSearchMentioned = true
        }

        m = s.match(/\bmodified:\s*"?(\d+\s*[a-zA-Z]+)"?\s*/i)
        if (m) {
          this.advSearchDate = m[1]
        }

        s = s.replace(/\btype:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        s = s.replace(/\banon:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        s = s.replace(/\buser:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        s = s.replace(/\bstarred:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        s = s.replace(/\bmentioned:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        s = s.replace(/\bmodified:\s*"?\d+\s*[a-zA-Z]+"?\s*/i, '')
        this.advSearchText = s.trim()
      }
      else {
        var filters = []
        if (this.advSearchType) {
          filters.push('Type: ' + this.advSearchType)
        }
        this.gSearch = this.gSearch.replace(/\btype:\s*"?[a-zA-Z0-9]+"?\s*/i, '')

        if (this.advSearchUser === 'anon') {
          filters.push('Anon: True')
        }
        else if (this.advSearchUser === 'user' && this.advSearchUserName) {
          filters.push('User: ' + this.advSearchUserName)
        }
        this.gSearch = this.gSearch.replace(/\banon:\s*"?[a-zA-Z0-9]+"?\s*/i, '')
        this.gSearch = this.gSearch.replace(/\buser:\s*"?[a-zA-Z0-9]+"?\s*/i, '')

        if (this.advSearchStarred) {
          filters.push('Starred: True')
        }

        if (this.advSearchMentioned) {
          filters.push('Mentioned: True')
        }

        if (this.advSearchDate) {
          filters.push('Modified: ' + this.advSearchDate)
        }

        if (this.advSearchText) {
          filters.push(this.advSearchText.trim())
        }

        this.gSearch = filters.join(' ')
      }
    },
    autoCompleteUserName: function (q) {
      return this.http.get('/search/username', {name: q.q})
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
    },
    isEmbed () {
      return document.getElementById('embed-body')
    },
    embedID () {
      const params = new URLSearchParams(window.location.search)
      return params.get('id')
    }
  },
  watch: {
    $route (to, from) {
      if (this.$refs.mobileSidebar) {
        this.$refs.mobileSidebar.close()
      }
    },
    advSearchType () {
      this.buildSearch(false)
    },
    advSearchUser (v) {
      if (v === 'user') {
        this.advSearchUserName = ''
        this.$nextTick(() => {
          document.querySelector('#advSearchUserName input').focus()
          document.querySelector('#advSearchUserName').classList.add('md-input-focused')
        })
      }
      this.buildSearch(false)
    },
    advSearchUserName () {
      this.buildSearch(false)
    },
    advSearchText () {
      this.buildSearch(false)
    },
    advSearchStarred () {
      this.buildSearch(false)
    },
    advSearchMentioned () {
      this.buildSearch(false)
    },
    advSearchDate () {
      this.buildSearch(false)
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
        { name: 'msapplication-square310x310logo', content: 'https://media.wago.io/favicon/largetile.png' },

        { name: 'robots', content: this.Page.robots }
      ],
      link: [
        { rel: 'stylesheet', href: '//media.wago.io/fonts/fonts.css' },

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
    top:64px;
    pointer-events: auto;
    transform: translateZ(0)!important;
  }
  #full-sidebar .md-sidenav-content {
    width: 260px;
    display: flex;
    flex-flow: column;
    background: #ECECEC;
    z-index: 1
  }
  #content { padding-left: 260px; pointer-events: auto; position: relative }
  #logo { text-align: left; padding: 8px 16px; }
  #logo img { max-height: 40px; }
  #xmaslogo img { width: 45px; position: absolute; left: 41px; top: -3px;}
  #h-nav { flex: 1 }
  #h-nav, #hr-nav { display: flex }
}

#app {
  min-height: 100%;
  display: flex;
  flex-flow: column nowrap;
  flex: 1;
  pointer-events: auto;
}

#full-sidebar .mainnav { padding: 0; background-color: #ccc; position: relative; display: block}
#full-sidebar .md-sidenav-content { overflow: inherit; }
.mainnav .md-subheader { padding-left: 0;}
.mainnav .md-list-item img { max-height: 32px }
.mainnav .md-list-item a { justify-content: start }
.mainnav .md-list-item a span { margin-left: 8px; line-height: 18px }
.mainnav .md-list-item { height: 36px }
.mainnav .md-list-item .md-list-item-container { min-height: auto; }
.mainnav .md-list-item.small { height: 16px; }
.mainnav .md-list-item.small .md-list-item-container { font-size: 12px; height: 18px; }
.mainnav.bottom .md-list-item-container { font-size: 90%; }
.mainnav.bottom .md-list-item-container img { max-width: 74px; }
.mainnav.bottom .md-list-item a div { display: inline-block; width: 90px;  }
#side-bottom {}
#side-bottom .resource {  display: inline-block; padding: 8px 0 0 16px; color: default }
#side-bottom .resource img { max-width: 30%; }
.md-sidenav h2 { background: black; margin:0; padding: 16px 24px; text-align: center}
#user-info { background: #CCC; padding: 16px 16px 0 }
#gSearch { margin-left: 16px; white-space: nowrap; width: 100% }
#gSearch input { border:0; padding: 0 16px; line-height:40px; max-width: 640px;  width: 100%; outline: none; }
#gSearch button { margin-left: -48px }
#gSearch .md-menu { display: inline }
#advancedSearch { padding: 16px; width: 640px; max-width: 640px; top:64px!important; left: 120px!important; box-shadow: 0 7px 9px -4px rgba(0, 0, 0, 0.2), 0 14px 21px 2px rgba(0, 0, 0, 0.14), 0 5px 26px 4px rgba(0, 0, 0, 0.12) }
#advancedSearch .md-list:after { content:none }
#advancedSearch .md-checkbox { margin-right: 32px; font-size: 12px; font-weight: normal; }
.advSearchSelect.md-select-content { max-height: initial; min-width: 220px; margin-left: 0; margin-top: 36px!important }
.advSearchButtons { flex-direction: row-reverse; }

.md-list { padding-bottom: 0}
.md-list:after { height: 1px; width:100%; background-color: rgba(0,0,0,.12); content: " " }
.md-list-item .md-list-item-container { padding-left: 16px }
#wotm { padding: 16px }
#wotm img { max-height: 200px }
.wotm-controls { padding: 16px 16px 0; margin-bottom: -8px}
.wotm-controls button { background: none; border: none; cursor: pointer}
.legal { padding: 16px; }
.legal span { font-size: 90%; padding: 0 0 8px; display: block; }

@media (max-width: 800px) {
  #gSearch button { display: none }
}

@media (max-width: 600px) {
  .md-toolbar h2 { margin:0; padding:0}
  footer .legal { float: none; padding-bottom: 6px}
  footer .legal span { display: inline; padding-left: 6px }
  footer .resource { padding-left: 0; width:50%}
  #logo img { max-height: 40px }
  #xmaslogo img {width: 43px; position: absolute; left: 81px; top: -2px;}
}

.document { padding: 16px }
.md-card { padding: 16px; margin: 16px; background: white }
.md-card > h3 { margin: 0 }
.md-card > h3 + .md-subheader { padding:0; min-height:0 }

.unreadCount { background: #c1272d; color: white; padding: 4px; border-radius: 2px;  }
.md-snackbar-container { border: 1px solid black }

#randombtn { height: 36px; opacity: 0.7; transition: all 1s ease-in; cursor: pointer; margin: 6px 8px }
</style>
