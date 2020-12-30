<template>
  <div>    
    <ui-loading v-if="profile.loading"></ui-loading>
    <ui-warning mode="alert" v-else-if="!profile.public">{{ $t("This profile page is private no one else may view it or search imports by this username") }}</ui-warning>
    <div v-if="profile.public || profile.mine">
      <md-card>
        <md-layout>
          <md-card-header>
            <md-avatar class="md-large">
              <ui-image :img="profile.avatar"></ui-image>
            </md-avatar>
            <div>
              <div :class="'profile-username ' + profile.roleClass">{{ profile.name }}</div>
              <div class="profile-links" v-if="profile.social">
                <a v-if="profile.social.discord" :href="'https://discord.gg/' + profile.social.discord" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-discord"></md-icon></a>
                <a v-if="profile.social.twitch" :href="'https://twitch.tv/' + profile.social.twitch" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-twitch"></md-icon></a>
                <a v-if="profile.social.twitter" :href="'https://twitter.com/' + profile.social.twitter" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-twitter"></md-icon></a>
                <a v-if="profile.social.github" :href="'https://github.com/' + profile.social.github" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-github"></md-icon></a>
                <a v-if="profile.social.youtube" :href="'https://youtube.com/' + profile.social.youtube" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-youtube"></md-icon></a>
                <a v-if="profile.social.facebook" :href="'https://facebook.com/' + profile.social.facebook" target="_blank" rel="noopener"><md-icon md-iconset="fab fa-facebook"></md-icon></a>
              </div>
            </div>
          </md-card-header>
          <md-card-actions v-if="isTest && profile.mine && !profileEdit" id="profile-actions" ref="action-buttons">
            <md-button @click="profileEdit=true"><md-icon>edit</md-icon> {{ $t("Edit Profile") }}</md-button>
            <md-button @click="addFeature" v-if="profile.featured.length < 3"><md-icon>art_track</md-icon> {{ $t("Add Featured Content") }}</md-button>
          </md-card-actions>
        </md-layout>

        <div v-if="profile.mine && profileEdit && isTest">
          <md-layout class="profile-edit-social">
            <md-input-container>
              <md-icon md-iconset="fab fa-discord"></md-icon>
              <label>{{ $t('Discord Server') }}</label>
              <md-input v-model="profile.social.discord" id="profileDiscord"></md-input>
              <span class="md-hint" v-if="focusField == 'profileDiscord'">https://discord.gg/<strong>abcd1234</strong></span>
            </md-input-container>
            <md-input-container>
              <md-icon md-iconset="fab fa-twitch"></md-icon>
              <label>Twitch</label>
              <md-input v-model="profile.social.twitch" id="profileTwitch"></md-input>
              <span class="md-hint" v-if="focusField == 'profileTwitch'">https://twitch.tv/<strong>abcd1234</strong></span>
            </md-input-container>
            <md-input-container>
              <md-icon md-iconset="fab fa-twitter"></md-icon>
              <label>Twitter</label>
              <md-input v-model="profile.social.twitter" id="profileTwitter"></md-input>
              <span class="md-hint" v-if="focusField == 'profileTwitter'">@<strong>abcd1234</strong></span>
            </md-input-container>
            <md-input-container>
              <md-icon md-iconset="fab fa-github"></md-icon>
              <label>GitHub</label>
              <md-input v-model="profile.social.github" id="profileGithub"></md-input>
              <span class="md-hint" v-if="focusField == 'profileGithub'">https://github.com/<strong>abcd1234</strong></span>
            </md-input-container>
            <md-input-container>
              <md-icon md-iconset="fab fa-youtube"></md-icon>
              <label>YouTube</label>
              <md-input v-model="profile.social.youtube" id="profileYoutube"></md-input>
              <span class="md-hint" v-if="focusField == 'profileYoutube'">https://www.youtube.com/<strong>abcd1234</strong></span>
            </md-input-container>
            <md-input-container>
              <md-icon md-iconset="fab fa-facebook"></md-icon>
              <label>Facebook</label>
              <md-input v-model="profile.social.facebook" id="profileFacebook"></md-input>
              <span class="md-hint" v-if="focusField == 'profileFacebook'">https://facebook.com/<strong>abcd1234</strong></span>
            </md-input-container>
          </md-layout>
          <md-input-container>
            <label>{{ $t("Description") }}</label>
            <md-textarea v-model="profile.description.text"></md-textarea>
          </md-input-container>
          <div style="margin-top:-24px">
            <div class="md-radio md-theme-default"><div class="md-radio-container" style="opacity:0; width:0"></div><label class="md-radio-label">{{ $t("Description Format") }}</label></div>
            <md-radio v-model="profile.description.format" md-value="bbcode">BBCode</md-radio>
            <md-radio v-model="profile.description.format" md-value="markdown">Markdown</md-radio>
          </div>
          
          <md-button id="cancelProfileBtn" class="md-primary" @click="saveProfile">
            <md-icon>save</md-icon> {{ $t('Save changes') }}
          </md-button>
          
          <md-button id="saveProfileBtn" class="md-primary" @click="cancelProfileEdit">
            <md-icon>cancel</md-icon> {{ $t('Cancel') }}
          </md-button>
        </div>

        <md-card-content v-else-if="profile.description && profile.description.text" class="user-description">
          <formatted-text :text="profile.description" :enableLinks="profile.enableLinks"></formatted-text>
        </md-card-content>

        <div md-elevation="6" v-for="(feature, key) of profile.featured" :key="key" class="profile-feature">
          <template v-if="profile.mine && feature.edit">
            <md-layout md-gutter="8" md-row>
              <md-layout>
                <md-input-container>
                  <label>{{ $t('Feature Type') }}</label>
                  <md-select v-model="feature.type" @input="setFeatureType(key)">
                    <md-option value="">None</md-option>
                    <!--<md-option value="twitch" v-if="profile.social.twitch">Twitch</md-option>-->
                    <md-option value="wago">Wago</md-option>
                    <md-option value="wow" v-if="$store.state.user.battlenet && $store.state.user.battlenet.characters">{{ $t('WoW Character Profile') }}</md-option>
                  </md-select>
                </md-input-container>
              </md-layout>
              <md-layout>
                <md-input-container v-if="feature.type === 'wago'">
                  <label>{{ $t('Sub Type') }}</label>
                  <md-select v-model="feature.subtype" @input="requestFeatureUpdate(key)">
                    <md-option value="imports">{{ $t('My Imports') }}</md-option>
                    <md-option value="collection">{{ $t('Curated Collection') }}</md-option>
                  </md-select>
                </md-input-container>
                <md-input-container v-else-if="feature.type === 'wow'">
                  <label>{{ $t('Character') }}</label>
                  <md-select v-model="feature.subtype" @input="requestFeatureUpdate(key)">
                    <md-option v-for="char of $store.state.user.battlenet.characters" :value="char.bnetID" :key="char.bnetID"><small>{{ char.region }}-{{ char.realm }}</small> {{ char.name }}</md-option>
                  </md-select>
                </md-input-container>
                <md-input-container v-else-if="feature.type === 'twitch'">
                  <label>{{ $t('Sub Type') }}</label>
                  <md-select v-model="feature.subtype" @input="requestFeatureUpdate(key)">
                    <md-option value="live">{{ $t('Live Stream') }}</md-option>
                  </md-select>
                </md-input-container>
              </md-layout>
            </md-layout>
            <template v-if="feature.type === 'wago'">
              <md-layout md-gutter="8" md-row v-if="feature.subtype === 'imports'">
                <md-layout>
                  <md-input-container>
                    <label>{{ $t('Imports') }}</label>
                    <md-select v-model="feature.imports" @input="requestFeatureUpdate(key)">
                      <md-option value="popular">{{ $t('Auto - By Current Popularity') }}</md-option>
                      <md-option value="stars">{{ $t('Auto - By Stars') }}</md-option>
                      <md-option value="views">{{ $t('Auto - By Total Views') }}</md-option>
                      <md-option value="updates">{{ $t('Auto - Recently Updated') }}</md-option>
                      <md-option value="manual">{{ $t('Manual Selection') }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
                <md-layout></md-layout>
              </md-layout>
              <md-layout md-gutter="8" md-row v-else-if="feature.subtype === 'collection'">
                <md-layout>
                  <md-input-container>
                    <label>{{ $t('Collection') }}</label>
                    <md-select v-model="feature.config.item" @input="requestFeatureUpdate(key)">
                      <md-option v-for="(optionValue, optionKey) of feature.data.collections" :value="optionValue._id" :key="optionKey">{{ optionValue.name }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
                <md-layout>
                  <md-input-container v-if="feature.config.item">
                    <label>{{ $t('Imports') }}</label>
                    <md-select v-model="feature.imports" @input="requestFeatureUpdate(key)">
                      <md-option value="popular">{{ $t('Auto - By Current Popularity') }}</md-option>
                      <md-option value="stars">{{ $t('Auto - By Stars') }}</md-option>
                      <md-option value="views">{{ $t('Auto - By Total Views') }}</md-option>
                      <md-option value="updates">{{ $t('Auto - Recently Updated') }}</md-option>
                      <md-option value="manual">{{ $t('Manual Selection') }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
              </md-layout>
              <md-layout md-gutter="8" md-row v-if="feature.imports === 'manual' && feature.config && feature.config.select" class="feature-select-imports">
                <md-layout>
                  <md-input-container v-for="(select, selectKey) of feature.config.select" :key="selectKey">
                    <label>{{ $t('Showcase [-num-]', {num: selectKey + 1}) }}</label>
                    <md-select v-model="feature.config.select[selectKey]" @change="setManualImport(key, selectKey)">
                      <md-option value=""></md-option>
                      <md-option v-for="(optionValue, optionKey) of feature.data.options" :value="optionValue._id" :key="optionKey">{{ optionValue.name }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
              </md-layout>
            </template>
            <template v-else-if="feature.type === 'twitch'">
              <embed-twitch :channel="profile.social.twitch"></embed-twitch>
            </template>
          </template>
          <md-layout v-else md-row class="feature-header">
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'imports' && feature.imports == 'popular'">{{ $t('[-user-]\'s popular imports', {user: profile.name}) }}</h3>
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'imports' && feature.imports == 'views'">{{ $t('[-user-]\'s most viewed imports', {user: profile.name}) }}</h3>
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'imports' && feature.imports == 'stars'">{{ $t('[-user-]\'s most starred imports', {user: profile.name}) }}</h3>
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'imports' && feature.imports == 'updates'">{{ $t('[-user-]\'s latest imports', {user: profile.name}) }}</h3>
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'imports' && feature.imports == 'manual'">{{ $t('[-user-]\'s featured imports', {user: profile.name}) }}</h3>
            <h3 v-if="feature.type === 'wago' && feature.subtype == 'collection'">{{ $t('Collection') }} - {{ feature.data.collection }}</h3>
            <div>
              <md-button class="md-primary" @click="searchMoreFeature(feature)">
                <md-icon>search</md-icon> {{ $t('Search More') }}
              </md-button>
              <md-button v-if="isTest && profile.mine" class="md-primary" @click="setFeatureEdit(key, true)">
                <md-icon>edit</md-icon> {{ $t('Edit Feature') }}
              </md-button>
            </div>
          </md-layout>
          <md-layout md-row class="feature-cards" v-if="feature.type === 'wago'">
            <ui-image v-if="feature.loading" img="loading"></ui-image>
            <template v-else-if="feature.data.cards && feature.data.cards.length" v-for="(card, cardKey) of feature.data.cards">
              <md-card :key="cardKey" v-if="card._id || feature.edit">
                <md-card-media>
                  <router-link :to="'/' + card._id"><img :src="card.thumbnail"></router-link>
                </md-card-media>
                <md-card-content>
                  <span class="import-type">{{ card.type }}</span>
                  <router-link :to="'/' + card._id">{{ card.name }}<br>
                    <span v-if="feature.imports == 'popular' && card.value">{{ $t('[-count-] views this week', {count: card.value.toLocaleString()}) }}</span>
                    <span v-else-if="feature.imports == 'views' && card.value">{{ $t('[-count-] views', {count: card.value.toLocaleString()}) }}</span>
                    <span v-else-if="feature.imports == 'stars' && card.value">{{ $t('[-count-] stars', {count: card.value.toLocaleString()}) }}</span>
                    <span v-else-if="feature.imports == 'updates' && card.value">{{ card.value | moment('MMM Do YYYY') }}</span>
                  </router-link>
                </md-card-content>
              </md-card>
            </template>
          </md-layout>
          <div style="float:right" v-if="feature.edit">
            <md-button class="md-primary" @click="closeEditFeature(key)">
              <md-icon>cancel</md-icon> {{ $t('Cancel') }}
            </md-button>
            <md-button class="md-primary" @click="saveFeature(key)">
              <md-icon>save</md-icon> {{ $t('Save') }}
            </md-button>
          </div>
        </div>
      </md-card>

      <wago-search :contextSearch="profileSearch" :contextSort="profileSearchSort" :key="profileSearchKey"></wago-search>
    </div>
    <div v-else>
      <p>{{ $t("This profile page is private") }}</p>
    </div>
  </div>
</template>

<script>
import WagoSearch from './Search'
import FormattedText from '../UI/FormattedText.vue'
import EmbedTwitch from '../UI/EmbedTwitch.vue'
export default {
  components: {
    'wago-search': WagoSearch,
    'formatted-text': FormattedText,
    'embed-twitch': EmbedTwitch
  },
  data: function () {
    return {
      profile: {loading: true},
      featureUndo: [{}, {}, {}],
      profileEdit: false,
      focusField: '',
      profileSearch: '',
      profileSearchKey: 0,
      profileSearchSort: ''
    }
  },
  mounted: function () {
    this.fetchProfile()
  },
  created () {
    document.addEventListener('focusin', this.focusChanged)
    document.addEventListener('focusout', this.focusChanged)
  },
  beforeDestroy () {
    document.removeEventListener('focusin', this.focusChanged)
    document.removeEventListener('focusout', this.focusChanged)
  },
  watch: {
    '$route.params.profile': function () {
      this.fetchProfile()
    },
    'profile.social.discord': function () {
      this.profile.social.discord = this.profile.social.discord.replace('https://(www.)?discord.gg/', '')
    },
    'profile.social.twitch': function () {
      this.profile.social.twitch = this.profile.social.twitch.replace('https://(www.)?twitch.tv/', '')
    },
    'profile.social.twitter': function () {
      this.profile.social.twitter = this.profile.social.twitter.replace('https://(www.)?twitter.com/', '')
    },
    'profile.social.github': function () {
      this.profile.social.github = this.profile.social.github.replace('https://(www.)?github.com/', '')
    },
    'profile.social.youtube': function () {
      this.profile.social.youtube = this.profile.social.youtube.replace('https://(www.)?youtube.com/', '')
    },
    'profile.social.facebook': function () {
      this.profile.social.facebook = this.profile.social.facebook.replace('https://(www.)?facebook.com/', '')
    }
  },
  methods: {
    fetchProfile () {
      var vue = this
      var who = this.$route.params.profile
      this.contextSearch = 'User: ' + who
      var params = {}
      if (window.location.hash) {
        who = who + window.location.hash
      }
      params.user = who
      this.profile = {loading: true}
      vue.http.get('/lookup/profile', params).then((res) => {
        vue.profile = JSON.parse(JSON.stringify(res))
        let userSearch = vue.profile.name
        if (userSearch.match(/\s/)) {
          userSearch = `"${userSearch}"`
        }
        vue.profileSearch = 'User: ' + userSearch + ' '
        vue.profileSearchKey++
        vue.$store.commit('setPageInfo', {
          title: vue.profile.name
        })
      })
    },
    focusChanged () {
      this.focusField = ''
      if (document.activeElement && document.activeElement.id) {
        this.focusField = document.activeElement.id
      }
    },
    saveProfile () {
      this.http.post('/account/profile', {description: this.profile.description, social: this.profile.social})
      this.profileEdit = false
    },
    cancelProfileEdit () {
      this.profileEdit = false
      this.fetchProfile()
    },
    async addFeature () {
      this.profile.featured.push({edit: true, loading: true, type: 'wago', subtype: 'imports', imports: 'popular', data: {}})
    },
    async setFeatureType (key) {
      // validate subtype
      if (this.profile.featured[key].type === 'wago' && !this.profile.featured[key].subtype.match(/imports|collection/)) {
        this.$set(this.profile.featured[key], 'subtype', 'imports')
      }
      else if (this.profile.featured[key].type === 'wow') {
        this.$set(this.profile.featured[key], 'subtype', this.$store.state.user.battlenet.characters[0].bnetID)
      }
      else if (this.profile.featured[key].type === 'twitch' && !this.profile.featured[key].subtype.match(/live/)) {
        this.$set(this.profile.featured[key], 'subtype', 'live')
      }
    },
    async requestFeatureUpdate (key) {
      this.$set(this.profile.featured[key], 'loading', true)
      var params = Object.assign({user: this.$route.params.profile, key: key}, this.profile.featured[key])
      delete params.data
      console.log('getfeat')
      this.$set(this.profile.featured, key, (await this.http.post('/account/profile/feature', {feature: JSON.stringify(params)}))[0])
      this.$set(this.profile.featured[key], 'loading', false)
    },
    setManualImport (key, selectKey) {
      let value = this.profile.featured[key].config.select[selectKey]
      if (!value) {
        this.$set(this.profile.featured[key].data.cards, selectKey, {})
        return
      }
      for (let i = 0; i < this.profile.featured[key].data.options.length; i++) {
        if (this.profile.featured[key].data.options[i]._id === value) {
          this.$set(this.profile.featured[key].data.cards, selectKey, this.profile.featured[key].data.options[i])
          break
        }
      }
    },
    async saveFeature (key) {
      this.$set(this.profile.featured[key], 'edit', false)
      let settings = Object.assign({}, this.profile.featured[key])
      delete settings.data
      await this.http.post('/account/profile/feature/save', {key: key, feature: JSON.stringify(settings)})
      if (!this.profile.featured[key].type) {
        this.profile.featured.splice(key, 1)
      }
    },
    setFeatureEdit (key, value) {
      this.featureUndo[key] = Object.assign({}, this.profile.featured[key])
      this.$set(this.profile.featured[key], 'edit', value)
    },
    closeEditFeature (key) {
      this.$set(this.profile.featured, key, this.featureUndo[key])
    },
    searchMoreFeature (feature) {
      this.profileSearchSort = ''
      this.profileSearch = 'User: ' + this.profile.name + ' '
      if (feature.type === 'wago' && feature.imports === 'popular') {
        this.profileSearchSort = 'bestmatch'
      }
      else if (feature.type === 'wago' && (feature.imports === 'stars' || feature.imports === 'views')) {
        this.profileSearchSort = feature.imports
      }
      else if (feature.type === 'wago' && feature.imports === 'updates') {
        this.profileSearchSort = 'date'
      }

      if (feature.type === 'wago' && feature.subtype === 'collection') {
        this.profileSearch = 'Collection: ' + feature.data.collectionID + ' '
      }
      this.profileSearchKey++
      window.scroll({top: document.getElementById('searchForm').offsetTop - 20, left: 0, behavior: 'smooth'})
    }
  },
  computed: {
    isTest () {
      return (this.$env === 'development' || document.getElementById('test-content')) && (this.$store.state.user && this.$store.state.user.access && this.$store.state.user.access.beta)
    }
  }
}
</script>

<style scoped lang="scss">
#profile-actions {align-self: flex-start; flex-wrap: wrap}
.md-card-header {flex: 1}
.profile-username {
  font-size: 133%;
}
.profile-links {
  margin-top: 8px;
  a {
    color: inherit!important;
    margin-right: 4px;
    opacity: .8;
    &:hover {
      opacity: 1;
    }
    i.md-icon {
      font-size: 125%;
    }
  }
}
.profile-edit-social .md-input-container {
  max-width: 300px;
  margin-right: 8px;
  .md-icon {
    font-size: 130%;
    align-self: center;
    margin-bottom: -4px;
  }
  .md-hint {
    height: 20px;
    position: absolute;
    bottom: -29px;
    font-size: 13px;
    opacity: .6;
    display: block !important;
    left: 0;
    transform: translate3d(0, -8px, 0);
    transition: all 0.3s cubic-bezier(0.55, 0, 0.55, 0.2);
    strong {
      color: white
    }
  }
}
#saveProfileBtn, #cancelProfileBtn {float: right}
.profile-feature {
  margin: 8px 0;
  padding: 8px;
  background: #212121;
  box-shadow: inset 1px 1px 2px 1px #00000044;
  .feature-header h3 {
    flex: 1;
  }
  .feature-select-imports .md-layout {
    justify-content: space-between;
    .md-input-container {
      max-width: 19.5%;
    }
  }
  .feature-cards {
    justify-content: space-between;
    .md-card {
      padding: 0;
      margin: 0;
      width: 100%;
      max-width: 19.5%;
      .md-card-content {
        padding: 0;
        position: relative;
        .import-type {
          position: absolute;
          top: 0px;
          left: 16px;
          font-size: 80%;
          pointer-events: none;
        }
        a {
          padding: 20px 16px 16px 16px;
          color: inherit!important;
          display: block;
          &:hover {
            text-decoration: none;
          }
        }
        span {
          opacity: .6;
        }
      }
    }
  }
}

</style>
<style>
.user-description img {
  max-width: 80%;
  max-height: 200px;
}
</style>

