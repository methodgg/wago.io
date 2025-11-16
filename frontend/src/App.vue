<template>
    <div id="app">
      <notification-banner id="maintenance" v-if="isMaintenance" :preventClose="true">Our search engine is currently repopulating. Not all imports can be found until this completes. Approx ETA {{ maintenanceDate | moment('MMM Do LT') }}.</notification-banner>
      <notification-banner id="platynator-notice" v-if="isPlatynatorNew"><router-link to="/search/imports/wow/platynator">Platynator imports are now available on Wago.</router-link></notification-banner>
      <wago-header></wago-header>

      <div id="menu-underlay" @click="closeMenus()" v-if="userMenuOpen"></div>
      <div id="maincontent" v-if="!isEmbed">
        <div id="copyContainer"></div>
        <div id="TopMobileBanner"></div>
          
        <md-snackbar md-position="top center" ref="snackbar" md-duration="4000">
          <span>{{ PopMsg }}</span>
          <md-button @click.native="$refs.snackbar.close()">{{ $t("Close") }}</md-button>
        </md-snackbar>
  
        <div id="content-frame">
          <advert ad="leaderboard-top" :patreonLink="true" :frame="false" />
          <div id="content" :class="{'with-sidebar': includeSidebar}">
            <router-view></router-view>
            <div v-if="includeSidebar" :class="{'side-bar': true, 'with-stream': $store.state.streamEmbed !== '__none'}">
              <advert v-if="asteriTest()" ad="embed-asteri" />
              <advert v-else ad="rectangle-sidebar" :patreonLink="true" />
              <stream-embed v-if="$store.state.streamEmbed && $store.state.streamEmbed !== '__none'" :stream="$store.state.streamEmbed" />
              <div v-else style="margin-left:10px">
                <a :href="appBanner.url" target="_blank"><img :src="appBanner.image" id="dl-app-image" alt="Download the Wago App"></a>
              </div>
            </div>
          </div>
          <!-- <advert ad="leaderboard-bottom" :patreonLink="true" :frame="false" /> -->
        </div>

        <wago-footer></wago-footer>
      </div>
      <div v-else-if="!$isMobile">
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
  
  import Advert from './components/UI/Advert.vue'
  import SelectLocale from './components/UI/SelectLocale.vue'
  import SearchBar from './components/UI/SearchBar.vue'
  import LoginButton from './components/UI/LoginButton.vue'
  import NotificationBanner from './components/UI/NotificationBanner.vue'
  import ViewEmbed from './components/core/ViewEmbed.vue'
  import StreamEmbed from './components/UI/StreamEmbed.vue'
  import addonDB from './components/libs/addons'

  import WagoHeader from './components/UI/WagoHeader.vue'
  import WagoFooter from './components/UI/WagoFooter.vue'
  
  export default {
    name: 'app',
    components: {
      'select-locale': SelectLocale,
      'search-bar': SearchBar,
      'login-button': LoginButton,
      'view-embed': ViewEmbed,
      'notification-banner': NotificationBanner,
      'advert': Advert,
      'stream-embed': StreamEmbed,
      'wago-header': WagoHeader,
      'wago-footer': WagoFooter
    },
    data: () => {
      return {
        PopMsg: 'test',
        gSearch: '',
        searchString: '',
        advSearchType: '',
        advSearchUser: '',
        advSearchUserName: '',
        advSearchText: '',
        advSearchStarred: false,
        advSearchMentioned: false,
        advSearchDate: '',
        today: new Date(),
        isPlatynatorNew: new Date() < new Date('2025-11-30'),
        showAddonsButton: window.localStorage.getItem('notification-1'),
        videoEmbedHTML: '',
        addonDB,
        userMenuOpen: false,
        maintenanceDate: new Date('2024-01-08T22:30:00Z'),
        appBanner: {
          url: 'https://bit.ly/WagoAppAddons',
          image: 'https://media.wago.io/site/app-addons.png'
        }
      }
    },
    created: function () {
      if (Math.random() > 0.5) {
        this.appBanner = {
          url: 'https://bit.ly/WagoAppUIPacks',
          image: 'https://media.wago.io/site/app-uipacks.png'
        }
      }
      // listen for link click events at the document level
      if (document.addEventListener) {
        document.addEventListener('click', (e) => {
          if (!e.button) { // leftclick = 0; otherwise firefox overwrites other click actions
            interceptClickEvent(e, this)
          }
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
        if (this.isMaintenance) {
          this.$store.commit('setUser', { guest: true, config: { searchOptions: { sort: 'bestmatch', relevance: 'standard', expansion: '' } } })
        }
        else {
          this.http.get('/account/whoami', params).then((res) => {  
            if (res.token) {
              window.setCookie('token', res.token, 365)
              vue.axios.defaults.headers = { 'x-auth-token': res.token }
            }
  
            if (res.user) {
              this.$store.commit('setUser', res.user)
              if (vue.$route.path === '/login') {
                vue.$router.replace('/settings')
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
      }
  
      window.eventHub.$on('showSnackBar', this.showSnackBar)
  
      if (this.$store.getters.i18nLanguage.match(/fa/)) {
        document.body.classList.add('rtl-lang')
      }
    },
    methods: {
      // april fools
      aprilFools () {
        const today = new Date()
        return (1 === today.getUTCDate() && 3 === today.getUTCMonth() && today.getUTCHours() >= 6) || (2 === today.getUTCDate() && 3 === today.getUTCMonth() && today.getUTCHours() < 6)
      },
      rickroll () {
        this.videoEmbedHTML = '<iframe src="https://www.youtube.com/embed/7sisF70Ppp8?autoplay=1&start=7" frameborder="0" scrolling="no" allow="autoplay"></iframe>'
        this.$refs.videoplayer.open()
      },
      hideVideo () {
        this.videoEmbedHTML = ''
      },
      // end
  
      closeMenus() {
          this.userMenuOpen = false
      },
  
      asteriTest () {
        const currentDate = new Date(); // Get the current date and time
        const targetDate = new Date("July 20, " + currentDate.getFullYear() + " 15:00:00 GMT-0700");
        const nextDate = new Date(targetDate.getTime() + 4 * 3600 * 1000); // end time
  
        // Check if the current date is between the target date and next date
        if (currentDate >= targetDate && currentDate < nextDate) {
          return true;
        } else {
          return false;
        }
      },
      showSnackBar: function (text) {
        this.PopMsg = text
        this.$refs.snackbar.open()
      },
      doLogout: function () {
        window.location.href = "https://accounts.wago.io/logout?redirect_url=https://wago.io/logout"
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
      isMaintenance () {
        return this.$store.state.isMaintenance
      },
      isEmbed () {
        return document.getElementById('embed-body')
      },
      embedID () {
        const params = new URLSearchParams(window.location.search)
        return params.get('id')
      },
      includeSidebar () {
        if (window.innerWidth <= 1024) return false
        return ((this.$store.state.user.UID || this.$store.state.user.guest) && !this.$store.state.user.hideAds) && !this.$store.state.isMaintenance && this.$store.state.pageInfo.layout !== 'MDT'
      }
    },
    watch: {
      $route (to, from) {
        if (this.$refs.mobileSidebar) {
          this.$refs.mobileSidebar.close()
        }
        this.$store.commit('setPageInfo', {
          layout: 'default',
        })
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
          { rel: 'stylesheet', href: '//media.wago.io/fonts/fonts.1601783774.css' },
  
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
  <style lang="scss">
  @import './assets/global.css';
  body, html {
    height: 100%;
    width: 100%;
    margin: 0;
  }
  #maincontent {
    /*background: #2C2C2C;*/
    padding: 0 4px;
  }
  #menu-underlay {
    position: fixed;
    left:0; right:0; top:0; bottom:0;
    z-index:998
  }
  #userdropdown a:hover {
    background:#68696b;
  }
  #globalmenu a:hover {
    background: #212121;
  }
  
  #topbar {
    background: #000000;
    width: 100%;
    .md-toolbar {
      max-width: 1290px;
      margin: 0 auto;
      min-height: 60px;
      padding: 0;
      z-index: 50;
      flex-wrap:nowrap
    }
  }
  #full-navbar {
    background: #333333;
    width: 100%;
    &.transition .sub-nav {
      display: none!important;
    }
    .nav {
      display: flex;
      max-width: 1250px;
      margin: 0 auto;
      & > a {
        padding: 8px 16px;
        color: white;
        line-height: 24px;
        font-weight: bold;
        &:hover {
          text-decoration: none;
          background: #3A3A3A;
        }
        &.home-import-btn {
          background: #C1272D;
          min-width: 120px;
          text-align: center;
        }
      }
      & > .menu-section {
        display: flex;
        padding: 8px 16px;
        color: white;
        font-weight: bold;
        position: relative;
        cursor: default;
        .sub-nav {
          display: none;
          flex-direction: column;
          box-shadow: 5px 5px 30px #00000066;
          border-radius: 0 0 2px 2px;
          min-width: 170px;
          z-index: 99!important;
          .menu-group {
              border-bottom:1px solid #444;
              flex-direction: column;
              h4 {
                margin: 0;
                font-size: 12px;
                padding: 0 10px;
                color: #edd;
                pointer-events: none;
              }            
              & > * {
                padding: 8px 16px;
                color: white;
                background: #3A3A3A;
                cursor: pointer;
                display: flex;
                align-items: center;
                &:hover {
                  background: #444444;
                  text-decoration: none;
                }
              }
          }        
          & > a {
            padding: 8px 16px;
            color: white;
            background: #3A3A3A;
            cursor: pointer;
            display: flex;
            align-items: center;
            &:hover {
              background: #444444;
              text-decoration: none;
            }
          }
          :last-child {
            border-radius: 0 0 2px 2px;
          }
          .sub-nav-heading {
              font-size: inherit;
              display: flex;
              align-items: center;
          }
        }
        &:hover {
          background: #3A3A3A;
          .sub-nav {
            display: flex;
            position: absolute;
            top: 40px;
            left: 0;
          }
        }
        
        .addon-icon {
          width: 20px;
          margin-right: 8px;
          margin-left: -4px;
          display: inline-flex;
          align-items: center;
          justify-content: flex-end;
          img {
            max-width: 100%;
            max-height: 16px;
          }          
        }
      }
    }
  }
  .grow {
    flex-grow:1
  }
  #adsidebar {
    overflow: inherit
  }
  #adsidebar > div {
    position: sticky;
    position: -webkit-sticky;
    top: 0px;
  }
  @media (max-width: 1149px) {
    #TopMobileBanner {
      margin: 16px auto 0;
      max-width: 455px;
      max-height: 55px;
    }
    #TopNavBanner {
      display: none
    }
  }
  @media (min-width: 1150px) {
    #TopMobileBanner {
      display: none
    }
  }
  @media (max-width: 1050px) {
      #patreon-btn {
        display: none
      }
  }
  @media (min-width: 601px) {
    #app { pointer-events: none; }
    .md-backdrop { pointer-events: none }
    #topbar {z-index: 9}
  
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
    #content-frame {min-height: calc(100vh - 136px)}
    #content { display: flex; pointer-events: auto; position: relative; flex-wrap: nowrap;}
    #content > div:first-of-type {min-width: 0}
    #content > div, #content-profile #searchResults { flex: 1; width: 100%; margin: 16px 0; background: #212121; box-shadow: none;}
    #content-profile #searchResults {
      padding: 0;
    }
    #content .side-bar {
      flex: 1;
      width: 350px;
      max-width: 350px;
      position: sticky;
      top: 8px;
      align-self: flex-start;
  
      &.with-stream {
        width: 350px;
        max-width: 350px;
      }
    }
    #logo { text-align: left; padding: 8px 16px; flex-shrink: 0}
    #logo img { max-height: 40px; }
    #xmaslogo img { width: 45px; position: absolute; left: 41px; top: -3px;}
    #h-nav { 
      flex: 1;
      a.md-button {
        border: 1px solid #333;
        background: none;
        margin: 0 0 0 16px;
        text-transform: none;
        svg {
          width: 16px;
          margin-right: 8px;
        }
      }
    }
    #h-nav, #hr-nav { display: flex }
  }
  
  #mobile-sidebar .md-input-container {
    margin: 0 8px 4px;
    width: auto;
  }
  #mobile-sidebar .search-container {
    min-width: 100%;
    margin: 0;
  }
  
  #app {
    min-height: 100%;
    display: flex;
    flex-flow: column nowrap;
    flex: 1;
    pointer-events: auto;
  }
  
  #full-sidebar .mainnav { padding: 0; background-color: #ccc; position: relative; display: block}
  #full-sidebar .md-sidenav-content { overflow: inherit; bottom: auto }
  .mainnav .md-subheader { padding-left: 0;}
  .mainnav .md-list-item img { max-height: 32px }
  .mainnav .md-list-item a { justify-content: start }
  .mainnav .md-list-item a span.unreadCount { margin-left: 8px; line-height: 18px }
  .menu-game-select {padding-top: 3px}
  .menu-game-select a:after {content:' - '; color: rgba(255, 255, 255, .87)}
  .menu-game-select a:last-child:after {content:''}
  .mainnav .md-list-item a span.menu-action { width: 100% }
  .mainnav .md-list-item { height: 36px }
  .mainnav .md-list-item.multi-line { height: 40px }
  .mainnav .md-list-item .md-list-item-container { min-height: auto; }
  .mainnav .md-list-item.small { height: 16px; }
  .mainnav .md-list-item.small .md-list-item-container { font-size: 12px; height: 18px; }
  .mainnav.bottom .md-list-item-container { font-size: 90%; padding-right: 0 }
  .mainnav.bottom .md-list-item-container img { max-width: 74px; }
  .mainnav.bottom .md-list-item a div { display: inline-block; width: 90px;  }
  
  #wago-addons-btn {border: 1px solid #a12126; margin: 4px 16px; line-height: 30px; color: white; background: #2a090a url('./assets/robot.png'); background-size: 27%; background-repeat: no-repeat; background-position: top right;}
  #wago-addons-btn a {color: inherit; display: block; padding: 4px 52px 4px 12px; }
  #wago-addons-btn:hover {background-color: #1d0607}
  #wago-addons-btn a:hover {text-decoration: none;}
  
  #side-bottom {}
  #side-bottom .resource {  display: inline-block; padding: 8px 0 0 16px; color: default }
  #side-bottom .resource img { max-width: 30%; }
  .md-sidenav h2 { background: black; margin:0; padding: 16px 24px; text-align: center}
  #user-info { background: #CCC; padding: 16px 16px 0 }
  #gSearch { margin-left: 16px; white-space: nowrap; flex: 1; max-width: 640px; }
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
  #wotm a { max-width: 100%; overflow: hidden; text-overflow: ellipsis; display: inline-block; }
  .wotm-controls { padding: 16px 16px 0; margin-bottom: -8px}
  .wotm-controls button { background: none; border: none; cursor: pointer}
  .legal { padding: 16px; }
  .legal > span { font-size: 90%; padding: 0 0 8px; display: block; }
  
  #footer {
    background: #333333;
    padding: 8px 0;
    & > .md-layout {
      max-width: 1236px;
      margin: 0 auto;
      > div {
        margin-right: 32px;
        display:flex;
        a {
          color: white;
          margin-right: 8px;
          display: block;
          svg {
            width: 16px;
          }
          .footer-discord:hover {
            color: #5662F6;
          }
          .footer-github:hover {
            color: #F0F6FC;
          }
          .footer-patreon:hover {
            color: #FF424E;
          }
          .footer-twitter:hover {
            color: #1A8CD8;
          }
          .footer-envelope:hover {
            color: #0D56DA;
          }
        }
      }
    }
  }
  body.ads-enabled {
    #footer {
      padding: 8px 0 125px;
    }
    #bottomAnchor-close {
      opacity: 1!important;
    }
  }
  
  
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
  
  .unreadCount { margin-left: 8px; background: #c1272d; color: white; padding: 4px; border-radius: 2px!important;  }
  .newAlert, .newAlert-orange { display: flex; justify-content: flex-end; flex-grow: 1 }
  .newAlert span { background: #c1272d; color: white; padding: 2px 4px; border-radius: 2px!important; }
  .newAlert-orange span { background: #c15827; color: white; padding: 2px 4px; border-radius: 2px!important; }
  .md-snackbar-container { border: 1px solid black }
  
  #randombtn {
    padding: 2px!important;
    img {
      height: 36px; transition: all 1s ease-in; cursor: pointer;
    }
  }
  
  body.theme-dark .md-input-container label a { -webkit-text-fill-color: initial }
  
  #content {
    margin: 0 auto;
    max-width: 1250px;
  }
  .ads-enabled #content {
    max-width: 1100px;
  }
  #search-weakaura .md-list.md-dense .md-list-item.md-inset .md-list-item-container {
    padding-left: 0;
  }
  
  .submenu-single-line {line-height: 36px!important;  min-height: 36px; display: block;}
  .menu-game-select a {color: #999!important; font-size: 14px;}
  .menu-game-select a:hover {text-decoration: none!important; color: #BBB!important}
  
  .md-list-item.menu-section {
    background: #333333;
    position: relative;
  }
  .md-list-item.menu-section .md-list-item-container {
    font-weight: bold;
    font-size: 90%;
    min-height: 36px;
    line-height: 36px;
  }
  
  #header-unread {
    align-self: center;
    a:hover {
      color: #d7373d!important;
      text-decoration: none;
    }
  }
  
  #wago-btn {
    border-color: #d7373d  !important;
    position: relative;
    overflow: initial;
    z-index: 99;
    img {
      height: 20px;
      margin-right: 4px;
    }
    
    .sub-nav {
      display: none;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: 5px 5px 30px #00000066;
      border-radius: 0 0 2px 2px;
      min-width: 140px;
      z-index: 99!important;
      text-align: left;
      & > * {
        padding: 4px 12px;
        color: white;
        background: #3A3A3A;
        cursor: pointer;
        display: block;
        &:hover {
          background: #444444;
          text-decoration: none;
        }
      }
      :last-child {
        border-radius: 0 0 2px 2px;
      }
    }
    &:hover {
      background: #3A3A3A;
      .sub-nav {
        display: block;
        position: absolute;
        top: 39px;
        left: 0;
      }
    }
  }

#patreon-btn {
    padding: 5px 8px!important;
    margin: 2px 8px!important;
    text-transform: none;
    position: relative;
    overflow: initial;
    z-index: 99;
    svg {
      height: 20px;
      margin-right: 4px;
    }
    
    .sub-nav {
      display: none;
      flex-direction: column;
      align-items: flex-start;
      box-shadow: 5px 5px 30px #00000066;
      border-radius: 0 0 2px 2px;
      min-width: 140px;
      z-index: 99!important;
      text-align: left;
      & > * {
        padding: 4px 12px;
        color: white;
        background: #3A3A3A;
        cursor: pointer;
        display: block;
        &:hover {
          background: #444444;
          text-decoration: none;
        }
      }
      :last-child {
        border-radius: 0 0 2px 2px;
      }
    }
    &:hover {
      background: #3A3A3A;
      .sub-nav {
        display: block;
        position: absolute;
        top: 39px;
        left: 0;
      }
    }
}

#dl-app-image {
  border: 1px solid #be262c;
  border-radius: 4px;
  overflow: hidden;
}
  
</style>