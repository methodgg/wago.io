<template>
  <div v-if="User && User.name">
    <md-menu ref="loginButton" md-offset-y="50" md-size="4">
      <md-button id="loginbutton" md-menu-trigger :class="User.css">{{ User.name }} <md-icon>account_circle</md-icon></md-button>
      <md-menu-content>
        <md-list-item><router-link to="/settings">{{ $t("Settings") }}</router-link></md-list-item>
        <md-list-item v-if="User.access.admin"><router-link to="/admin">Admin</router-link></md-list-item>
        <md-list-item><router-link to="/logout">{{ $t("Logout") }}</router-link></md-list-item>
      </md-menu-content>
    </md-menu>
  </div>
  <div v-else>
    <a :href="loginURL" @click.prevent="login()" class="md-button">{{ $t("Login") }} <md-icon>account_circle</md-icon></a>
  </div>
</template>

<script>
export default {
  name: 'core-select-locale',
  methods: {
    setLocale: function (loc) {
      if (this.$store.state.locale !== loc) {
        this.$store.commit('setLocale', loc)
      }
    },
    login: function () {
        window.clearCookie('token')
        this.$nextTick(() => {
            window.location = this.loginURL    
        })        
    }
  },
  computed: {
    User () {
      return this.$store.state.user
    },
    loginURL () {
        if (process.env.NODE_ENV === 'development') {
            return 'http://localhost:3030/auth/redirect'
        }
        return 'https://wago.io/login'       
    },
    supportedLocales () {
      var uniqueLang = []
      var supported = []
      window.locales.forEach((item) => {
        if (uniqueLang.indexOf(item.lang) < 0) {
          uniqueLang.push(item.lang)
          supported.push(item)
        }
      })
      return supported
    }
  }
}
</script>

<style scoped>
#loginbutton {margin-right: 0; max-width: 230px; overflow: hidden; text-overflow: ellipsis;}
.submenu > .md-button { padding: 0 }
.submenu .md-menu { width: 100%}
.submenu .md-menu .md-button { padding: 0 16px; margin: 0; width:100%; text-align: left; text-transform: initial; font-size: inherit; font-weight: inherit; }
.submenu .md-menu .md-button:hover { background-color: inherit }
</style>

