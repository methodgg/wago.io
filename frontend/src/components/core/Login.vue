<template>
  <div>
    <ui-warning mode="alert">
      Wago.io uses cookies to track your user session. By logging in to the website you consent to having a cookie installed to preserve your authentication.
    </ui-warning>
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
                  <md-input type="text" id="login-name" v-model="loginName"></md-input>
                </md-input-container>
                
                <md-input-container>
                  <label>{{ $t("Password") }}</label>
                  <md-input type="password" id="login-password" v-model="loginPass"></md-input>
                </md-input-container>
              
                <hcaptcha v-if="loginName && $env !== 'development'" :sitekey="hcaptchaSiteKey" theme="dark" @verify="onVerifyCaptcha"></hcaptcha>
                
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
                <md-input type="text" id="create-name" v-model="createName"></md-input>
              </md-input-container>

              <md-input-container>
                <label>{{ $t("Password") }}</label>
                <md-input type="password" id="create-password" v-model="createPass"></md-input>
              </md-input-container>

              <md-input-container>
                <label>{{ $t("Confirm Password") }}</label>
                <md-input type="password" id="create-password2" v-model="createPass2"></md-input>
              </md-input-container>
              
              <hcaptcha v-if="createName && $env !== 'development'" :sitekey="hcaptchaSiteKey" theme="dark" @verify="onVerifyCaptcha"></hcaptcha>

              <md-button class="md-raised md-primary" type="submit">{{ $t("Create account") }}</md-button>
            </form>
          </md-card-content>
        </md-card>
      </md-layout>
      <md-layout md-column>
        <wago-oauth></wago-oauth>
      </md-layout>
    </md-layout>
  </div>
</template>

<script>
import WagoOauth from '../UI/WagoOauth.vue'
import Hcaptcha from '../UI/Hcaptcha.vue'
export default {
  components: {
    'wago-oauth': WagoOauth,
    'hcaptcha': Hcaptcha
  },
  data: () => {
    return {
      captchaValid: false,
      submitForm: false,
      createName: '',
      createPass: '',
      createPass2: '',
      loginName: '',
      loginPass: '',
      hcaptchaSiteKey: '69d55f48-8b59-4e20-9dc5-a865baac19cf'
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
        username: this.loginName,
        password: this.loginPass,
        captcha: this.captchaValid,
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
      if (!this.captchaValid && this.$env !== 'development') {
        console.log('NOT VALID CAPTCHA')
        return
      }
      this.submitForm = true
      var vue = this
      var username = this.createName
      var password = this.createPass
      var password2 = this.createPass2

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
        captcha: this.captchaValid
      }).then((res) => {
        this.submitForm = false
        if (res.error) {
          return window.eventHub.$emit('showSnackBar', res.error)
        }
        // success is handled by http interceptor
      })
    },
    onVerifyCaptcha: function (v) {
      this.captchaValid = v
    },
    onExpiredCaptcha: function () {
      this.captchaValid = false
    }
  },
  mounted: function () {
    if (this.$store.state.isMaintenance) {
      this.$router.replace('/')
      return
    }
    try {
      if (window !== window.parent) {
        top.location = self.location
      }
    }
    catch {
      this.$router.replace('/')
    }
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
