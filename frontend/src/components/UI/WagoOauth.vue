<template>
    <div id="wago-oauth" v-if="provider">
        <template v-if="status === 'pending'">
            <ui-warning mode="ok">
            {{ $t("Verifying authentication") }}
            </ui-warning>
            <ui-loading></ui-loading>
        </template>
        <template v-else>
            <ui-warning mode="alert">
                {{ $t('An error occured, please try again') }}<br>{{ status }}
            </ui-warning>
            <p style="margin-left:16px">{{ $t('Please try again.') }}</p>
            <login-button></login-button>
        </template>
    </div>
</template>

<script>
import LoginButton from './LoginButton.vue'

export default {
  components: {
    'login-button': LoginButton,
  },
  data: function () {
    return {
      status: 'pending',
      context: 'oauth2 context',
      code: this.$route.query.code,
      provider: this.$route.params.provider,
      state: this.$route.query.state,
      bnetUpdateTimer: null
    }
  },
  methods: {
    doAuth: function (provider) {
      this.$auth.oauth2(provider || this.provider, {})
    },

    checkUpdatedBnetProfile: (vue) => {
      vue.http.get('/account/whoami').then((res) => {
        if (res && res.user && res.user.battlenet && res.user.battlenet.updateStatus !== 'pending-API') {
          vue.$store.commit('setUser', res.user)
        }
        else {
          if (this.bnetUpdateTimer) {
            clearTimeout(this.bnetUpdateTimer)
          }
          vue.bnetUpdateTimer = setTimeout(() => {
            vue.checkUpdatedBnetProfile(vue)
          }, 2000)
        }
      })
    }
  },
  computed: {
    user () {
      if (this.$store.state.user?.UID && this.code) {
        this.$router.replace('/settings')
      }
      return this.$store.state.user
    }
  },
  async mounted () {
    if (!this.provider || window.readCookie('token')) {
        this.$router.replace('/settings')
        return
    }
    const vue = this
    try {
        const res = await this.http.post(this.$env === 'development' ? 'http://localhost:3030/auth/' + this.provider : 'https://data.wago.io/auth/' + this.provider, {
            code: this.code,
            state: this.state
        })
        if (res.ok) {
            vue.$router.replace('/settings')
        }
        else if (res.error) {
            this.status = res.error
        }
    }
    catch(err) {
        window.eventHub.$emit('showSnackBar', vue.$t('An error occurred'))
        this.status = err.message
    }

    return
  }
}
</script>

<style scoped>
  h2 {margin: 16px}
</style>
