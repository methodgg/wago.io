<template>
  <div v-if="User && User.name">
    <md-menu ref="loginButton" md-offset-x="-205" md-size="4">
      <md-button md-menu-trigger :class="User.css">{{ User.name }} <md-icon>account_circle</md-icon></md-button>
      <md-menu-content>
        <md-list-item><router-link to="/account">{{ $t("Account Settings") }}</router-link></md-list-item>
        <md-list-item v-if="User.access.admin"><router-link to="/admin">Admin</router-link></md-list-item>
        <md-list-item><router-link to="/logout">Logout</router-link></md-list-item>
      </md-menu-content>
    </md-menu>
  </div>
  <div v-else>
    <md-button href="" @click="$router.push('/login')">{{ $t("Login") }} <md-icon>account_circle</md-icon></md-button>
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
    }
  },
  computed: {
    User () {
      console.log(this.$store.state.user)
      return this.$store.state.user
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

<style>
.submenu > .md-button { padding: 0 }
.submenu .md-menu { width: 100%}
.submenu .md-menu .md-button { padding: 0 16px; margin: 0; width:100%; text-align: left; text-transform: initial; font-size: inherit; font-weight: inherit; }
.submenu .md-menu .md-button:hover { background-color: inherit }
</style>

