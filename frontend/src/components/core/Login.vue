<template>
  <div>
    <ui-warning v-if="requireBetaAccess">{{ $t("Wago beta server is only available to Patreon subscribers") }}</ui-warning>
    <md-layout>
      <form id="login-form" novalidate v-on:submit.prevent="doLogin">
        <md-card><md-card-area>
          <md-card-header>
            <h2>{{ $t("Log into Wago") }}</h2>
          </md-card-header>
          
          <md-card-content>
            <md-input-container>
              <label>{{ $t("Username") }}</label>
              <md-input type="text" id="login-name"></md-input>
            </md-input-container>
            
            <md-input-container>
              <label>{{ $t("Password") }}</label>
              <md-input type="password" id="login-password"></md-input>
            </md-input-container>
            
            <md-button class="md-raised md-primary" type="submit">{{ $t("Log in") }}</md-button>
          </md-card-content>
        </md-card-area></md-card>
      </form>
      <wago-oauth :user="false"></wago-oauth>
    </md-layout>
  </div>
</template>

<script>
export default {
  components: {
    'wago-oauth': require('../UI/WagoOauth.vue')
  },
  methods: {
    doLogin: function () {
      // var router = this.$router
      var vue = this
      var username = document.getElementById('login-name').value
      var password = document.getElementById('login-password').value

      // validate input
      if (!username.length || !password.length) {
        window.eventHub.$emit('showSnackBar', vue.$t('error:Invalid Login'))
        return
      }

      // attempt to login
      vue.http.post('/auth/login', {
        username: username,
        password: password,
        initPath: window.initPath
      }).then((res) => {
        if (res.locale && vue.$store.state.locale !== res.locale) {
          vue.$store.commit('setLocale', res.locale)
        }

        // successful login is handled by http interceptor
        if (!res.login || !res.token || !res.user) {
          window.eventHub.$emit('showSnackBar', vue.$t('error:Invalid Login'))
        }
      })
    }
  },
  mounted: function () {
    // login page requires user to not be logged in
    if (this.$store.state.user.UID) {
      this.$router.replace('/account')
    }
    this.$store.commit('setPageInfo', {
      title: 'Login'
    })
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
    requireBetaAccess () {
      return window.requireBetaAccess
    }
  }
}
</script>

<style>

</style>
