<template>
  <div>
    <div v-if="profile.public || profile.mine">
      <md-card>
        <md-card-header>
          <md-avatar class="md-large">
            <ui-image :img="profile.avatar"></ui-image>
          </md-avatar>
          <div :class="'md-title ' + profile.roleClass">{{ profile.name }}</div>
        </md-card-header>

        <!--<md-card-content>
          <formatted-text :text="profile.description"></Formatted-text>
        </md-card-content>-->
      </md-card>

      <p v-if="!profile.public">{{ $t("Your profile page is private no one else may view it or search your imports by your username") }}</p>

      <wago-search :contextSearch="'User: ' + profile.name + ' '"></wago-search>
    </div>
    <div v-else>
      <p>{{ $t("This profile page is private") }}</p>
    </div>
  </div>
</template>

<script>
export default {
  components: {
    'wago-search': require('./Search'),
    'formatted-text': require('../UI/FormattedText.vue')
  },
  data: function () {
    return {
      profile: {}
    }
  },
  watch: {
    '$route': 'fetchProfile'
  },
  created: function () {
    this.fetchProfile()
  },
  methods: {
    fetchProfile () {
      var vue = this
      var who = this.$route.params.profile
      var params = {}
      params.user = who

      vue.http.get('/lookup/profile', params).then((res) => {
        if (!res.description.text) {
          res.description.text = this.$t('[-username-] has not set a profile description', {username: res.name})
        }
        vue.profile = JSON.parse(JSON.stringify(res))
      })
    }
  }
}
</script>

<style>

</style>
