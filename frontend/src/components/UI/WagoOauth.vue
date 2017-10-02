<template>
  <div id="wago-oauth">
    <div v-if="!provider">
      <md-card>
        <h2 v-if="!user || user.guest">{{ $t("Or log in with")}}</h2>
        <h2 v-else>{{ $t("Connect your account")}}</h2>
        <md-list class="md-double-line">
          <md-list-item class="auth-battlenet" href="#" @click.prevent="doAuth('battlenet')">
            <md-avatar>
              <ui-image v-if="user && user.battlenet && user.battlenet.avatar && user.battlenet.avatar.png" :img="user.battlenet.avatar"></ui-image>
              <ui-image v-else img="battlenet"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.battlenet">{{ user.battlenet.name }}</span>
              <span>Blizzard Battle.net</span>
              <span v-if="!user || user.guest">{{ $t("Login with Blizzard") }}</span>
              <span v-else-if="!user || !user.battlenet || !user.battlenet.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
          <md-list-item class="auth-discord" href="#" @click.prevent="doAuth('discord')">
            <md-avatar>
              <ui-image v-if="user && user.discord && user.discord.avatar && user.discord.avatar.png" :img="user.discord.avatar"></ui-image>
              <ui-image v-else img="discord"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.discord">{{ user.discord.name }}</span>
              <span>Discord</span>
              <span v-if="!user || user.guest">{{ $t("Login with Discord") }}</span>
              <span v-else-if="!user || !user.discord || !user.discord.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
          <md-list-item class="auth-facebook" href="#" @click.prevent="doAuth('facebook')">
            <md-avatar>
              <ui-image v-if="user && user.facebook && user.facebook.avatar && user.facebook.avatar.png" :img="user.facebook.avatar"></ui-image>
              <ui-image v-else img="facebook"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.facebook">{{ user.facebook.name }}</span>
              <span>Facebook</span>
              <span v-if="!user || user.guest">{{ $t("Login with Facebook") }}</span>
              <span v-else-if="!user || !user.facebook || !user.facebook.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
          <md-list-item class="auth-google" href="#" @click.prevent="doAuth('google')">
            <md-avatar>
              <ui-image v-if="user && user.google && user.google.avatar && user.google.avatar.png" :img="user.google.avatar"></ui-image>
              <ui-image v-else img="google"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.google">{{ user.google.name }}</span>
              <span>Google</span>
              <span v-if="!user || user.guest">{{ $t("Login with Google") }}</span>
              <span v-else-if="!user || !user.google || !user.google.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>          
          <md-list-item class="auth-patreon" href="#" @click.prevent="doAuth('patreon')">
            <md-avatar>
              <ui-image v-if="user && user.patreon && user.patreon.avatar && user.patreon.avatar.png" :img="user.patreon.avatar"></ui-image>
              <ui-image v-else img="patreon"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.patreon">{{ user.patreon.name }}</span>
              <span>Patreon</span>
              <span v-if="!user || user.guest">{{ $t("Login with Patreon") }}</span>
              <span v-else-if="!user || !user.patreon || !user.patreon.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
          <md-list-item class="auth-twitter" href="#" @click.prevent="doAuth('twitter')">
            <md-avatar>
              <ui-image v-if="user && user.twitter && user.twitter.avatar && user.twitter.avatar.png" :img="user.twitter.avatar"></ui-image>
              <ui-image v-else img="twitter"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.twitter">{{ user.twitter.name }}</span>
              <span>Twitter</span>
              <span v-if="!user || user.guest">{{ $t("Login with Twitter") }}</span>
              <span v-else-if="!user || !user.twitter || !user.twitter.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
        </md-list>
      </md-card>
    </div>
    <div v-else>{{ provider }}...
      <ui-loading v-if="!wagoExists"></ui-loading>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      context: 'oauth2 context',
      code: this.$route.query.code,
      provider: this.$route.params.provider
    }
  },
  methods: {
    doAuth: function (provider) {
      if (provider === 'twitter') {
        window.eventHub.$emit('showSnackBar', 'Twitter authentication currently not implemented.')
        return
      }
      this.$auth.oauth2({
        provider: provider || this.provider
      })
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    }
  },
  mounted () {
    if (this.code) {
      this.$auth.oauth2({
        code: true,
        provider: this.provider,
        params: {
          code: this.code
        },
        success: function (res) {
          // console.log('success ' + this.context)
        },
        error: function (res) {
          // console.log('error ' + this.context)
        }
      })
    }
  }
}
</script>

<style>
</style>
