<template>
  <div id="app">
    <div id="maincontent" v-if="!isEmbed">
      <div id="copyContainer"></div>
      <notification-banner id="maintenance" v-if="isMaintenance" :preventClose="true">Wago is in maintenance mode, and is read-only. </notification-banner>      
      <div id="topbar">
        <md-toolbar>
          <md-button class="md-icon-button md-hide-small-and-up" @click="toggleMobileNav()">
            <md-icon>menu</md-icon>
          </md-button>
          <h2 class="md-title" @click="$store.commit('setSearchText', '')" id="logo"><router-link to="/"><img src="./assets/wagoio-logo.png"/></router-link></h2>

          <div id="h-nav" class="md-hide-xsmall">
            <div id="top-search-bar">
              <search-bar ref="searchField"></search-bar>
            </div>
            <md-button v-if="(this.$store.state.user.UID || this.$store.state.user.guest) && !this.$store.state.user.hideAds" href="https://www.patreon.com/wagoio" target="_blank">
              <svg aria-hidden="true" focusable="false" class="header-patreon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"></path></svg>
              {{ $t('Support Wago.io') }}
            </md-button>
            
            <router-link id="macro-btn" to='/macros' class="md-button alert-button">
                <img src="./assets/menu-macro.png" /> WoW Macros are now supported!
            </router-link>
            
          </div>
          <div id="hr-nav" class="md-hide-xsmall">
            <h2 class="md-title md-hide-small-and-up" id="logo"><router-link to="/"><img src="./assets/wagoio-logo.png"/></router-link></h2>
            <div v-if="User && User.unreadMentions && User.unreadMentions.length" id="header-unread">
              <router-link to="/my/mentions"><md-icon>comment</md-icon> <span class="unreadCount">{{ User.unreadMentions.length }}</span></router-link>
            </div>
            <login-button v-if="!isMaintenance"></login-button>
          </div>
        </md-toolbar>
      </div>
      <md-sidenav class="md-hide-small-and-up md-left" ref="mobileSidebar" id="mobile-sidebar">
        <search-bar ref="searchField"></search-bar>
        <md-list>
          <md-list-item v-if="LoggedIn">
            <span :class="User.css"><md-icon>person</md-icon> {{ User.name }}</span>
            <md-list-expand>
              <md-list>
                <md-list-item><router-link :to="'/p/'+encodeURIComponent(User.name)">{{ $t("My Profile") }}</router-link></md-list-item>
                <md-list-item><router-link to="/my/mentions">{{ $t("My Mentions") }} <span class="unreadCount" v-if="User.unreadMentions.length">{{ User.unreadMentions.length }}</span></router-link></md-list-item>
                <md-list-item><router-link to="/my/stars">{{ $t("My Favorites") }}</router-link></md-list-item>
                <md-list-item><router-link to="/account">{{ $t("Account Settings") }}</router-link></md-list-item>
                <md-list-item v-if="User.access.admin"><router-link to="/admin">Admin</router-link></md-list-item>
              </md-list>
            </md-list-expand>
          </md-list-item>
          <md-list-item v-else><router-link to='/login'>{{ $t("Login") }}</router-link></md-list-item>
          <md-list-item><router-link to='/'>{{ $t("Import") }}</router-link></md-list-item>
          <md-list-item><router-link to='/news'>{{ $t("Site News") }}</router-link></md-list-item>
          <md-list-item><a href="https://addons.wago.io">Wago Addons</a><md-divider></md-divider></md-list-item>
          <md-list-item class="menu-section">World of Warcraft</md-list-item>
          <md-list-item><router-link to='/search/imports/wow/bigwigs'>BigWigs</router-link></md-list-item>
          <md-list-item><router-link to='/blizzhud'>BlizzHUD</router-link></md-list-item>
          <md-list-item><router-link to='/search/imports/wow/dbm'>DBM</router-link></md-list-item>
          <md-list-item><router-link to='/elvui'>ElvUI</router-link></md-list-item>
          <md-list-item><router-link to='/macros'>Macros</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/mdt'>Mythic Dungeon Tools</router-link></md-list-item>
          <md-list-item><router-link to='/plater'>Plater Nameplates</router-link></md-list-item>
          <md-list-item><router-link to='/totalrp'>Total RP</router-link></md-list-item>
          <md-list-item><router-link to='/vuhdo'>VuhDo</router-link></md-list-item>
          <md-list-item><router-link to='/the-war-within-weakauras'>The War Within WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/dragonflight-weakauras'>Dragonflight WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/cataclysm-weakauras'>Cata WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item><router-link to='/classic-weakauras'>Classic WeakAuras</router-link><md-divider></md-divider></md-list-item>
          <md-list-item class="menu-section">General</md-list-item>
          <md-list-item><router-link to='/collections'>{{ $t("Collections") }}</router-link></md-list-item>
          <md-list-item><router-link to='/snippets'><span class="menu-action" @click="$store.commit('setSearchText', `type:SNIPPET`)">{{ $t("Snippets") }}</span></router-link><md-divider></md-divider></md-list-item>
        </md-list>
      </md-sidenav>
      <div class="full-navbar md-hide-xsmall" ref="full-navbar" id="full-navbar">
        <div class="nav">
          <router-link to='/' class="home-import-btn">{{ $t("Import") }}</router-link>
          <div class="menu-section" v-if="false">
            <span>World of Warcraft <md-icon>expand_more</md-icon></span>
            <div class="sub-nav">
              <router-link v-for="(addon, key) of addonDB" :to='addon.path' :key="key">
                <div class="md-list-text-container">
                  {{ addon.name }}
                  <span class="game-select" v-if="addon.submenu">
                    <router-link v-for="(item, key) of addon.submenu" :to="item.path" :key="key"> {{ item.name }}</router-link>
                  </span>
                </div>
              </router-link>
              <router-link to='/addon-imports'>{{ $t('More...') }}</router-link>
            </div>
          </div>
          <div class="menu-section" v-else>
            <span>World of Warcraft <md-icon>expand_more</md-icon></span>
            <div class="sub-nav">
              <router-link to='/dragonflight-weakauras'>
                <div class="md-list-text-container">
                  <span class="sub-nav-heading"><span class="addon-icon"><img src="./assets/weakauras.png"></span> WeakAuras</span>
                  <span class="game-select">
                    <router-link to='/the-war-within-weakauras'>The War Within</router-link>
                    <router-link to='/dragonflight-weakauras'>Dragonflight</router-link>
                    <router-link to='/cataclysm-weakauras'>Cataclysm</router-link>
                    <router-link to='/classic-weakauras'>Classic</router-link>
                  </span>
                </div>
              </router-link>
              <router-link to='/blizzhud'><span class="addon-icon"><img src="./assets/menu-blizzhud.png"></span> BlizzHUD</router-link>
              <router-link to='/elvui'><span class="addon-icon"><img src="./assets/tukui.png"></span> ElvUI</router-link>
              <router-link to='/macros'><span class="addon-icon"><img src="./assets/menu-macro.png"></span> Macros</router-link>
              <router-link to='/dragonflight-mdt'><span class="addon-icon"><img src="./assets/mdt.png"></span> Mythic Dungeon Tools</router-link>
              <router-link to='/opie'><span class="addon-icon"><img src="./assets/menu-opie.png"></span> OPie</router-link>
              <router-link to='/plater'><span class="addon-icon"><img src="./assets/menu-plater.png"></span> Plater Nameplates</router-link>
              <router-link to='/totalrp'><span class="addon-icon"><img src="./assets/menu-trpcamp.png"></span> Total RP</router-link>
              <router-link to='/vuhdo'><span class="addon-icon"><img src="./assets/menu-vuhdo.png"></span> VuhDo</router-link>
              <router-link to='/search/imports/wow/bigwigs'><span class="addon-icon"><img src="./assets/menu-bigwigs.png"></span> BigWigs</router-link>
              <router-link to='/search/imports/wow/dbm'><span class="addon-icon"><img src="./assets/menu-dbm.png"></span> Deadly Boss Mods</router-link>
            </div>
          </div>
          <!-- <div class="menu-section">
            <span>Final Fantasy XIV <md-icon>expand_more</md-icon></span>
            <div class="sub-nav">
              <router-link to='/delvui'>DelvUI</router-link>
              <router-link to='/tpie'>TPie</router-link>
            </div>
          </div> -->
          <div class="menu-section">
            <span>Addons <md-icon>expand_more</md-icon></span>
            <div class="sub-nav">
              <a href="https://addons.wago.io">Download Addons</a>
              <a href="https://addons.wago.io/app">Wago App</a>
            </div>
          </div>
          <router-link to='/collections'>{{ $t("Collections") }}</router-link>
          <router-link to='/snippets'>{{ $t("Snippets") }}</router-link>
          <!--<router-link to='/snippets'><span class="menu-action" @click="$store.commit('setSearchText', `type:SNIPPET`)">{{ $t("Snippets") }}</span></router-link>-->

          <template v-if="LoggedIn">
            <div class="menu-section">
            <span>{{ $t("My Data") }}  <md-icon>expand_more</md-icon></span>
              <div class="sub-nav">
                <router-link :to="'/p/'+encodeURIComponent(User.name)">{{ $t("My Profile") }}</router-link>
                <router-link to="/my/mentions">{{ $t("My Mentions") }} <span class="unreadCount" v-if="User.unreadMentions.length">{{ User.unreadMentions.length }}</span></router-link>
                <router-link to="/my/stars">{{ $t("My Favorites") }}</router-link>
              </div>
            </div>
          </template>
          <router-link id="randombtn" to='/random'><img src="./assets/random.png"></router-link>

          <div class="grow"></div>
          <select-locale display="code"></select-locale>
        </div>
      </div>

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
            <advert v-else-if="!asteriTest()" ad="embed-streambuff" />
          </div>
          <advert ad="mobile-anchor" :forMobile="true" v-if="this.$store.state.user.UID || this.$store.state.user.guest" />
        </div>
        <advert ad="leaderboard-bottom" :patreonLink="true" :frame="false" />
      </div>

      <div class="footer md-hide-xsmall" id="footer">
        <md-layout md-row>
          <div>
            <a href="https://patreon.com/wagoio" target="_blank">
              <svg aria-hidden="true" focusable="false" class="footer-patreon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"></path></svg>
            </a>
            <a href="https://github.com/oratory/wago.io" target="_blank">
              <svg aria-hidden="true" focusable="false" class="footer-github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
            </svg>
            </a>
            <a href="https://twitter.com/wago_io" target="_blank">
              <svg aria-hidden="true" focusable="false" class="footer-twitter" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path></svg>
            </a>
            <a href="https://discord.gg/weakauras" target="_blank">
              <svg aria-hidden="true" focusable="false" class="footer-discord" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg>
            </a>
            <a href="mailto:contact@wago.io">
              <svg aria-hidden="true" focusable="false" data-prefix="fas" class="footer-envelope" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"></path></svg>
            </a>
          </div>
          <div>
            <router-link to="/terms-of-service">{{ $t("Terms of Service") }}</router-link>
            <router-link to="/privacy-policy">{{ $t("Privacy Policy") }}</router-link>
            <div id="ncmp-consent-link"></div>
          </div>
          <div>
            <span>© 2016-{{(new Date()).getFullYear()}} Wago.io</span>
          </div>
        </md-layout>
      </div>
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

export default {
  name: 'app',
  components: {
    'select-locale': SelectLocale,
    'search-bar': SearchBar,
    'login-button': LoginButton,
    'view-embed': ViewEmbed,
    'notification-banner': NotificationBanner,
    'advert': Advert,
    'stream-embed': StreamEmbed
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
      showAddonsButton: window.localStorage.getItem('notification-1'),
      videoEmbedHTML: '',
      addonDB
    }
  },
  created: function () {
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
      return !(this.$store.state.user.hideAds || this.$store.state.isMaintenance || this.$store.state.pageInfo.layout === 'MDT')
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
.game-select {padding-top: 3px}
.game-select a:after {content:' - '; color: rgba(255, 255, 255, .87)}
.game-select a:last-child:after {content:''}
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
#ncmp-consent-link > button { font-size: 14px; margin-right: 8px; padding: 0; border: 0; background: none; color: #fff; cursor: pointer; font-size: 14px; letter-spacing: .01em; font-weight: 400; line-height: 20px;}
#ncmp-consent-link > button:hover { text-decoration: underline }

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

.unreadCount { background: #c1272d; color: white; padding: 4px; border-radius: 2px;  }
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

.submenu-single-line {line-height: 36px!important;  min-height: 36px; display: block;}
.game-select a {color: #999!important; font-size: 14px;}
.game-select a:hover {text-decoration: none!important; color: #BBB!important}

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

#macro-btn {
  border-color: #BA25BF  !important;
  position: relative;
  overflow: initial;
  z-index: 99;
  img {
    height: 20px;
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

</style>