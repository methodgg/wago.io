<template>
  <div id="wago-oauth">
    <div v-if="!provider">
      <md-card>
        <h2 v-if="!user || user.guest">{{ $t("Or log in with")}}</h2>
        <h2 v-else>{{ $t("Connect your account")}}</h2>
        <md-list class="md-double-line">
          <md-list-item class="auth-battlenet" href="#" @click.prevent="doAuth('battlenet')">
            <md-avatar>
              <ui-image v-if="user && user.battlenet && user.battlenet.updateStatus === 'pending-API'" img="loading"></ui-image>
              <ui-image v-else-if="user && user.battlenet && user.battlenet.avatar && user.battlenet.avatar.png" :img="user.battlenet.avatar"></ui-image>
              <ui-image v-else img="battlenet"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.battlenet && user.battlenet.name">{{ user.battlenet.name }}</span>
              <span>Blizzard Battle.net</span>
              <span v-if="!user || user.guest">{{ $t("Login with Blizzard") }}</span>
              <span v-else-if="!user.battlenet || !user.battlenet.name">{{ $t("Connect to account") }}</span>
              <span v-else-if="user && user.battlenet && user.battlenet.updateStatus === 'pending-API'" style="color:#c1272d">{{ $t("Profile update in progress") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>
          <md-list-item v-if="user && user.battlenet.name">
            <div v-if="user.battlenet.guilds && user.battlenet.guilds.length" class="md-list-text-container" style="margin-left:56px">
              <span>{{ $t("The following guilds are associated to your account") }}</span>
              <span>{{ $t("Any imports restricted to these guilds are accessible by you") }}</span>
              <span>
                <template v-for="guild in user.battlenet.guilds">
                  {{ guild.replace(/@/g, ' - ')}}<br>
                </template>
              </span>
            </div>
            <div v-if="user && user.battlenet && !(user.battlenet.guilds || !user.battlenet.guilds.length)" class="md-list-text-container">
              <span>{{ $t("No guilds are associated to your account") }}</span>
              <span>{{ $t("Update your profile to gain access to any guild-restricted imports") }}</span>
            </div>
          </md-list-item>
          <md-list-item class="auth-battlenet" href="#" @click.prevent="doAuth('battlenetCN')">
            <md-avatar>
              <ui-image v-if="user && user.battlenetCN && user.battlenetCN.updateStatus === 'pending-API'" img="loading"></ui-image>
              <ui-image v-else-if="user && user.battlenetCN && user.battlenetCN.avatar && user.battlenetCN.avatar.png" :img="user.battlenetCN.avatar"></ui-image>
              <ui-image v-else img="battlenet"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.battlenetCN">{{ user.battlenetCN.name }}</span>
              <span>Blizzard Battle.net China</span>
              <span v-if="!user || user.guest">{{ $t("Login with Blizzard") }}</span>
              <span v-else-if="!user || !user.battlenetCN || !user">{{ $t("Connect to account") }}</span>
              <span v-else-if="user.battlenetCN.updateStatus === 'pending-API'">{{ $t("Profile update in progress") }}</span>
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
          <!--<md-list-item class="auth-twitch" href="#" @click.prevent="doAuth('twitch')">
            <md-avatar>
              <ui-image v-if="user && user.twitch && user.twitch.avatar && user.twitch.avatar.png" :img="user.twitch.avatar"></ui-image>
              <ui-image v-else img="twitch"></ui-image>
            </md-avatar>
            <div class="md-list-text-container">
              <span v-if="user && user.twitch">{{ user.twitch.name }}</span>
              <span>Twitch</span>
              <span v-if="!user || user.guest">{{ $t("Login with Twitch") }}</span>
              <span v-else-if="!user || !user.twitch || !user.twitch.name">{{ $t("Connect to account") }}</span>
              <span v-else>{{ $t("Update profile") }}</span>
            </div>
          </md-list-item>-->
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
    <div v-else>
      <ui-warning mode="ok">
        {{ $t("Verifying authentication") }}
      </ui-warning>
      <ui-loading></ui-loading>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      context: 'oauth2 context',
      code: this.$route.query.code,
      provider: this.$route.params.provider,
      bnetUpdateTimer: null
    }
  },
  methods: {
    doAuth: function (provider) {
      if (provider === 'twitter') {
        this.http.post('/auth/twitter')
          .then((res) => {
            window.twitterReqToken = res.requestToken
            window.location.href = 'https://api.twitter.com/oauth/authenticate?oauth_token=' + res.requestToken
          })
          .catch((err) => {
            console.log(err)
          })
      }
      else if (provider === 'battlenet' && this.user && this.user.battlenet && this.user.battlenet.updateStatus === 'pending-API') {
        // do nothing...
      }
      else {
        this.$auth.oauth2({
          provider: provider || this.provider
        })
      }
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
      return this.$store.state.user
    }
  },
  created () {
    var vue = this
    if (this.user && this.user.battlenet && this.user.battlenet.updateStatus === 'pending-API') {
      this.bnetUpdateTimer = setTimeout(() => {
        this.checkUpdatedBnetProfile(vue)
      }, 2000)
    }
  },
  destroyed () {
    clearTimeout(this.bnetUpdateTimer)
  },
  mounted () {
    var vue = this
    if (this.provider === 'twitter' && this.$route.query.oauth_token && this.$route.query.oauth_verifier) {
      this.http.post('/auth/twitter', {
        oauth_token: this.$route.query.oauth_token,
        oauth_verifier: this.$route.query.oauth_verifier
      }).then((res) => {
        // console.log(res)
      })
      .catch((err) => {
        window.eventHub.$emit('showSnackBar', vue.$t('An error occurred'))
        vue.$router.replace('/login')
        console.log(err)
      })
    }
    else if (this.code) {
      this.$auth.oauth2({
        code: true,
        provider: this.provider,
        params: {
          code: this.code
        },
        success: function (res) {
          console.log('success ' + this.context, res)
        },
        error: function (res) {
          window.eventHub.$emit('showSnackBar', vue.$t('An error occurred'))
          vue.$router.replace('/login')
          // console.log('error ' + this.context)
        }
      })
    }
  }
}
</script>

<style>
</style>
