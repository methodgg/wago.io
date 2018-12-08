<template>
  <md-layout>
    <md-layout md-column>
      <md-card>
        <md-card-area>
          <md-card-header>
            <h2>{{ $t("Log into Wago") }}</h2>
          </md-card-header>
          <md-card-content>
            <form id="login-form" novalidate v-on:submit.prevent="doLogin">
              <md-input-container>
                <label>{{ $t("Username") }}</label>
                <md-input type="text" id="login-name"></md-input>
              </md-input-container>
              
              <md-input-container>
                <label>{{ $t("Password") }}</label>
                <md-input type="password" id="login-password"></md-input>
              </md-input-container>
              
              <md-button class="md-raised md-primary" type="submit">{{ $t("Log in") }}</md-button>
            </form>
          </md-card-content>
        </md-card-area>
      </md-card>
      <md-card>
        <h2>{{ $t("Create Account") }}</h2>
        <md-card-content>
          <p>{{ $t("Wago does not collect email addresses and therefore has no forgotten password function; we recommend using one of the social logins") }}</p>
          <form id="create-acct" novalidate v-on:submit.prevent="createAcct">
            <md-input-container>
              <label>{{ $t("Username") }}</label>
              <md-input type="text" id="create-name"></md-input>
            </md-input-container>

            <md-input-container>
              <label>{{ $t("Password") }}</label>
              <md-input type="password" id="create-password"></md-input>
            </md-input-container>

            <md-input-container>
              <label>{{ $t("Confirm Password") }}</label>
              <md-input type="password" id="create-password2"></md-input>
            </md-input-container>

            <template>
              <vue-recaptcha sitekey="6LfMCGkUAAAAACs_6tjQoqpEaQIph8NnHmQgPuu7" @verify="onVerifyCaptcha" @expired="onExpiredCaptcha"></vue-recaptcha>
            </template>

            <md-button class="md-raised md-primary" type="submit" :disabled="!recaptchaValid || submitForm">{{ $t("Create account") }}</md-button>
          </form>
        </md-card-content>
      </md-card>
    </md-layout>
    <md-layout md-column>
      <wago-oauth></wago-oauth>
    </md-layout>
  </md-layout>   
</template>

<script>
import VueRecaptcha from 'vue-recaptcha'
export default {
  components: {
    'wago-oauth': require('../UI/WagoOauth.vue'),
    VueRecaptcha
  },
  data: () => {
    return {
      recaptchaValid: false,
      submitForm: false
    }
  },
  methods: {
    doLogin: function () {
      var vue = this
      var username = document.getElementById('login-name').value.trim()
      var password = document.getElementById('login-password').value.trim()
      // validate input
      if (!username.length || !password.length) {
        window.eventHub.$emit('showSnackBar', vue.$t('Invalid Login'))
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
          window.eventHub.$emit('showSnackBar', vue.$t('Invalid Login'))
        }
      })
    },
    createAcct: function () {
      if (!this.recaptchaValid) {
        return
      }
      this.submitForm = true
      var vue = this
      var username = document.getElementById('create-name').value.trim()
      var password = document.getElementById('create-password2').value.trim()
      var password2 = document.getElementById('create-password2').value.trim()

      if (!username) {
        return window.eventHub.$emit('showSnackBar', vue.$t('Passwords do not match'))
      }
      else if (!password || password.length < 6) {
        return window.eventHub.$emit('showSnackBar', vue.$t('Must set a password of at least six characters in length'))
      }
      else if (password !== password2) {
        return window.eventHub.$emit('showSnackBar', vue.$t('Passwords do not match'))
      }

      vue.http.post('/auth/create', {
        username: username,
        password: password,
        recaptcha: this.recaptchaValid
      }).then((res) => {
        this.submitForm = false
        if (res.error) {
          return window.eventHub.$emit('showSnackBar', res.error)
        }
        // success is handled by http interceptor
      })
    },
    onVerifyCaptcha: function (re) {
      this.recaptchaValid = re
    },
    onExpiredCaptcha: function () {
      this.recaptchaValid = false
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
