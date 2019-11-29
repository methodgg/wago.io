<template>
  <div id="index">
    <md-layout md-gutter="32" :md-column-small="true">
      <md-layout id="col1" md-vertical-align="start">
        <md-whiteframe id="importform">
          <md-input-container :class="{ 'md-input-invalid': importError }">
            <label>{{ $t("Paste your import string here") }}</label>
            <div id="inputStringWrapper">
              <md-textarea id="inputStringTextarea" name="importString" placeholder=" " v-model="importString"></md-textarea>
              <div v-if="!importString" v-html="$t('Paste your WeakAura, ElvUI or Vuhdo string here')"></div>
            </div>
            <span class="md-error">{{ importErrorMsg }}</span>
          </md-input-container>

          <div class="field-group">
            <md-input-container>
              <label for="visibilty">{{ $t("Visibility") }}</label>
              <md-select name="visibilty" id="visibilty" v-model="visibility">
                <md-option value="Public" selected>{{ $t("Public") }}</md-option>
                <md-option value="Hidden">{{ $t("Hidden (only viewable with link)") }}</md-option>
                <md-option v-if="user.name" value="Restricted">{{ $t("Restricted (viewable for select users)") }}</md-option>
                <md-option v-if="user.name" value="Private">{{ $t("Private (only you may view)") }}</md-option>
              </md-select>
            </md-input-container>

            <md-input-container v-if="user.UID || user.guest">
              <label for="importAs">{{ $t("Import As") }}</label>
              <md-select name="importAs" id="importAs" v-model="importAs">
                <md-option value="User" v-if="user.UID">{{ user.name }}</md-option>
                <md-option value="Guest">{{ $t("Anonymous Guest") }}</md-option>
                <md-subheader v-if="!user.name" id="signinanon" v-html="$t('Sign in to keep track of your imports')"></md-subheader>
              </md-select>
            </md-input-container>

            <md-input-container>
              <label for="expire">{{ $t("Expire After") }}</label>
              <md-select name="expire" id="expire" v-model="expire">
                <md-option value="never">{{ $t("Never") }}</md-option>
                <md-option value="3mo">{{ $t("3 months") }}</md-option>
                <md-option value="1mo">{{ $t("1 month") }}</md-option>
                <md-option value="1wk">{{ $t("1 week") }}</md-option>
                <md-option value="3hr">{{ $t("3 hours") }}</md-option>
                <md-option value="15m">{{ $t("15 minutes") }}</md-option>
              </md-select>
            </md-input-container>
          </div>

          <div v-if="visibility === 'Restricted'" style="margin-left:1em">
            <template v-for="(rest, index) in restrictions">
              <md-layout :key="index">
                <md-layout>
                  <md-input-container>
                    <label>{{ $t("Access Granted To") }}</label>
                    <md-select v-model="rest.type" @change="onUpdateRestrictionsDebounce(index)">
                      <md-option value="user">{{ $t("Username") }}</md-option>
                      <md-option value="guild" v-if="user.access.restrictGuild && user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                      <!--<md-option value="twitchsubs" v-if="user.access.restrictSubs && user.twitch && user.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
                      <md-option v-if="index > 0" value="remove">{{ $t("Remove Access") }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
                <md-layout class="resticted-options">
                  <md-input-container v-if="rest.type === 'user'">
                    <label for="advSearchUserName">{{ $t("Enter Username") }}</label>
                    <md-autocomplete v-model="rest.value" :fetch="autoCompleteUserName" :debounce="600" @change="onUpdateRestrictionsDebounce(index)"></md-autocomplete>
                  </md-input-container>
                  <md-input-container v-if="rest.type === 'guild'">
                    <label>{{ $t("Select Guild") }}</label>
                    <md-select v-model="rest.value" @change="onUpdateRestrictionsDebounce(index)">
                      <template v-for="(guild, guildIndex) in user.battlenet.guilds">
                        <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                      </template>
                    </md-select>
                  </md-input-container>
                  <md-input-container v-if="rest.type === 'guild' && rest.value">
                    <label>{{ $t("Select Rank(s)") }} [ <a :href="getGuildLink(rest.value)" target="_blank">{{ $t("View Members") }}</a> ]</label>
                    <md-select v-model="rest.rank" @change="onUpdateRestrictionsDebounce(index)">
                      <md-option value="9">{{ $t("Everyone (Ranks 1-10)") }}</md-option>
                      <md-option value="8">{{ $t("Ranks 1-9") }}</md-option>
                      <md-option value="7">{{ $t("Ranks 1-8") }}</md-option>
                      <md-option value="6">{{ $t("Ranks 1-7") }}</md-option>
                      <md-option value="5">{{ $t("Ranks 1-6") }}</md-option>
                      <md-option value="4">{{ $t("Ranks 1-5") }}</md-option>
                      <md-option value="3">{{ $t("Ranks 1-4") }}</md-option>
                      <md-option value="2">{{ $t("Ranks 1-3") }}</md-option>
                      <md-option value="1">{{ $t("Ranks 1-2") }}</md-option>
                      <md-option value="0">{{ $t("Guild Leader (Rank 1)") }}</md-option>
                    </md-select>
                  </md-input-container>
                </md-layout>
              </md-layout>
            </template>
            <md-layout v-if="restrictions.length < 20 && restrictions[0].value">
              <md-layout>
                <md-input-container>
                  <label>{{ $t("Access Granted New") }}</label>
                  <md-select v-model="newRestrictionType" @change="checkNewRestrictions">
                    <md-option value="user">{{ $t("Username") }}</md-option>
                    <md-option value="guild" v-if="user.access.restrictGuild && user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                    <!--<md-option value="twitchsubs" v-if="user.access.restrictSubs && user.twitch && user.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
                  </md-select>
                </md-input-container>
              </md-layout>
              <md-layout class="resticted-options">
                <md-input-container v-if="newRestrictionType === 'user'">
                  <label for="advSearchUserName">{{ $t("Enter Username") }}</label>
                  <md-autocomplete v-model="newRestrictionValue" :fetch="autoCompleteUserName" @blur="checkNewRestrictions"></md-autocomplete>
                </md-input-container>
                <md-input-container v-if="newRestrictionType === 'guild'">
                  <label>{{ $t("Select Guild") }}</label>
                  <md-select v-model="newRestrictionValue" @change="checkNewRestrictions">
                    <template v-for="(guild, guildIndex) in user.battlenet.guilds">
                      <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                    </template>
                  </md-select>
                </md-input-container>
              </md-layout>
            </md-layout>
          </div>

          <div v-if="isScanning"><md-spinner md-indeterminate></md-spinner></div>
          <md-layout v-if="weakauramode">
            <label for="weakauramode">{{ $t("Type") }}</label>
            <md-select name="weakauramode" id="weakauramode" v-model="weakauramode">
              <md-option value="WEAKAURAS2">WEAKAURA</md-option>
              <md-option value="CLASSIC-WEAKAURA">CLASSIC-WEAKAURA</md-option>
            </md-select>
          </md-layout>
          <strong v-else>{{ type === 'WEAKAURAS2' ? 'WEAKAURA' : type }}</strong><br>

          <md-layout v-if="scanID">
            <md-layout>
              <md-input-container>
                <label for="name">{{ $t("Name") }}</label>
                <md-input name="name" id="name" v-model="name"></md-input>
              </md-input-container>
            </md-layout>
          </md-layout>

          <div v-if="scanID && type !== 'Lua Error'">
            <label id="categoryLabel">{{ $t("Categories") }}</label>
            <md-button class="md-icon-button md-raised" @click="numCategorySets++">
              <md-icon>add</md-icon>
            </md-button>
            <div v-for="n in numCategorySets">
              <div v-if="scanID" class="has-category-select">
                <category-select :game="game" :selectedCategories="setCategories[n-1]" :type="type.toUpperCase()" @update="cat => {setCategories[numCategorySets-1] = cat}" ></category-select>
              </div>
            </div>
          </div>

          <md-button class="md-raised" :disabled="disableSubmit" @click="submitImport()" style="margin-top:2em">Submit</md-button>
        </md-whiteframe>

        <div v-if="latestBlogs && latestBlogs.length > 0" id="sitenews">
          <wago-news :posts="latestBlogs"></wago-news>
        </div>
      </md-layout>

      <md-layout id="col2" :md-column-medium="true" md-vertical-align="start">        
        <!--<advert/>-->
        <md-whiteframe id="topwagos" v-if="top10Lists && top10Lists.faves">
          <md-layout>
            <md-layout>
              <md-list class="md-dense">
                <md-list-item>
                  <strong>{{ $t("Popular This Week") }}</strong>
                </md-list-item>
                <md-list-item v-for="(item, index) in top10Lists.popular" :key="index">
                  <router-link :to="'/' + item._id">
                    <div class="md-list-text-container">
                      <span>{{ item.name }}</span>
                      <span>{{ $t("[-count-] view", {count: item.popularity.viewsThisWeek}) }}</span>
                    </div>
                  </router-link>
                </md-list-item>
              </md-list>
            </md-layout>
            <md-layout>
              <md-list class="md-dense">
                <md-list-item>
                  <strong>{{ $t("Favorites All Time") }}</strong>
                </md-list-item>
                <md-list-item v-for="(item, index) in top10Lists.faves" :key="index">
                  <router-link :to="'/' + item._id">
                    <div class="md-list-text-container">
                      <span>{{ item.name }}</span>
                      <span>{{ $t("[-count-] star", {count: item.popularity.favorite_count}) }}</span>
                    </div>
                  </router-link>
                </md-list-item>
              </md-list>
            </md-layout>
          </md-layout>
          <md-layout>
            <md-layout>
              <md-list class="md-dense">
                <md-list-item>
                  <strong>{{ $t("Recently Updated") }}</strong>
                </md-list-item>
                <md-list-item v-for="(item, index) in top10Lists.updates" :key="index">
                  <router-link :to="'/' + item._id">
                    <div class="md-list-text-container">
                      <span>{{ item.name }}</span>
                      <span>{{ item.modified | moment('MMM Do YYYY LT') }}</span>
                    </div>
                  </router-link>
                </md-list-item>
              </md-list>
            </md-layout>
            <md-layout>
              <md-list class="md-dense">
                <md-list-item>
                  <strong>{{ $t("Newest Imports") }}</strong>
                </md-list-item>
                <md-list-item v-for="(item, index) in top10Lists.newest" :key="index">
                  <router-link :to="'/' + item._id">
                    <div class="md-list-text-container">
                      <span>{{ item.name }}</span>
                      <span>{{ item.created | moment('MMM Do YYYY LT') }}</span>
                    </div>
                  </router-link>
                </md-list-item>
              </md-list>
            </md-layout>
          </md-layout>
        </md-whiteframe>

        <md-table v-if="addonReleases.length > 0" id="addonReleases">
          <md-table-header>
            <md-table-row>
              <md-table-head>{{ $t("Latest addons") }}</md-table-head>
              <md-table-head>{{ $t("Version #") }}</md-table-head>
              <md-table-head>{{ $t("Date") }}</md-table-head>
            </md-table-row>
          </md-table-header>
          <md-table-body>
            <md-table-row v-for="(addon, addonIndex) in addonReleases" :key="addonIndex" v-if="addon.addon !== 'Grid2'">
              <md-table-cell>{{ addon.addon }}</md-table-cell>
              <md-table-cell><a :href="addon.url" target="_blank">{{ addon.version }}</a></md-table-cell>
              <md-table-cell>{{ addon.date | moment('MMM Do YYYY') }}</md-table-cell>
            </md-table-row>
          </md-table-body>
        </md-table>
      </md-layout>
    </md-layout>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#importform { z-index: 3 }
#importform, #topwagos, #addonReleases { padding: 16px; width:100% }
#importform textarea { max-height: 110px; min-height:110px }
#importform .field-group .md-input-container { display: inline-block; max-width: 32%; position: relative}
.field-group2 .md-input-container, .field-group2 strong { display: inline-block; max-width: 49%;}
#signinanon { padding-left: 32px;  margin-top: -8px; }

@media (min-width: 1281px) {
  #col1, #col2 { padding: 16px }
  #col2 { padding-left:0 }
  #topwagos > .md-layout > .md-layout { width: 50% }
  #topwagos > .md-layout > .md-layout > ul { max-width: 100%; min-width: 100% }
}

@media (max-width: 600px) {
  #importform { display:none }
}

#inputStringWrapper { width: 100%; position: relative; }
#inputStringWrapper div  { position: absolute; top: 0; color: #a5a5a5; padding: 6px 0 0 0; pointer-events: none}

.has-category-select { position: relative}
.has-category-select:after {
    height: 1px;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #B6B6B6;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    content: " ";
}

#topwagos .md-list-item { flex-wrap: wrap }

#sitenews { width: 100%}
#sitenews .md-card {margin: 16px 0 0; width:100%}
#sitenews .md-card .md-subhead { opacity: 1 }

#categoryLabel { margin-top: 10px; display: inline-block}

#inputStringTextarea { overflow-x: hidden!important; overflow-y: hidden!important }

.resticted-options { flex: 3; flex-wrap: nowrap}

</style>

<script>
import Categories from './libs/categories'
import CategorySelect from './UI/SelectCategory.vue'
import WagoNews from './core/News.vue'
import VueMarkdown from 'vue-markdown'
import Advert from './UI/Advert.vue'

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}

export default {
  name: 'app',
  data: () => {
    return {
      importString: '',
      importError: false,
      importErrorMsg: '',
      visibility: 'Public',
      importAs: 'Guest',
      expire: '3mo',
      name: '',
      weakauramode: '',
      setCategories: [],
      categories: [],
      type: '',
      isScanning: false,
      scanID: '',
      disableSubmit: true,
      top10Lists: {},
      latestBlogs: [],
      addonReleases: [],
      numCategorySets: 1,
      game: 'bfa',
      restrictions: [{type: 'user', value: ''}],
      newRestrictionType: 'user',
      newRestrictionValue: ''
    }
  },
  components: {
    CategorySelect,
    'vue-markdown': VueMarkdown,
    'wago-news': WagoNews,
    'md-autocomplete': require('./UI/md-autocomplete.vue'),
    'advert': Advert
  },
  computed: {
    user () {
      var u = this.$store.state.user
      if (u.UID && u.name) {
        this.importAs = 'User'
        this.visibility = u.defaultImportVisibility
        this.expire = 'never'
      }
      return this.$store.state.user
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: this.$t('Import')
    })

    var vue = this
    this.http.get('/lookup/index').then((res) => {
      if (res.top10) {
        vue.top10Lists = JSON.parse(JSON.stringify(res.top10))
      }
      if (res.news) {
        vue.latestBlogs = JSON.parse(JSON.stringify(res.news))
      }
      if (res.addons) {
        vue.addonReleases = JSON.parse(JSON.stringify(res.addons))
      }
    })
  },
  methods: {
    submitImport () {
      var post = {
        scanID: this.scanID,
        visibility: this.visibility,
        importAs: this.importAs,
        expireAfter: this.expire,
        waMode: this.weakauramode,
        name: this.name,
        categories: JSON.stringify(flatten(this.setCategories)),
        game: this.game
      }
      if (this.visibility === 'Restricted') {
        post.restrictions = JSON.stringify(flatten(this.restrictions))
      }
      var vue = this
      this.http.post('/import/submit', post).then((res) => {
        if (res.success && res.wagoID) {
          vue.$router.push('/' + res.wagoID)
        }
        else {
          window.eventHub.$emit('showSnackBar', vue.$t('Import failed or expired please try again'))
        }
      })
    },

    onUpdateCategories () {
      // filters?
    },

    checkNewRestrictions: function () {
      this.$nextTick(() => {
        console.log('check', this.newRestrictionType, this.newRestrictionValue)
        if ((this.newRestrictionType && this.newRestrictionValue) || this.newRestrictionType === 'twitchsubs') {
          this.restrictions.push({type: this.newRestrictionType, value: this.newRestrictionValue})
          this.newRestrictionType = 'user'
          this.newRestrictionValue = ''
          console.log(this.restrictions)
          // onUpdateRestrictions is called here via reactivity
        }
      })
    },

    onUpdateRestrictions: function (index) {
      console.log('onupdate')
      if (typeof index === 'undefined' || ((this.restrictions[index] && this.restrictions[index].value) || this.restrictions[index].type === 'twitchsubs' || this.restrictions[index].type === 'remove')) {
        if (typeof index !== 'undefined' && this.restrictions[index].type === 'remove') {
          this.restrictions.splice(index, 1)
        }
        else if (typeof index !== 'undefined' && typeof this.restrictions[index].rank === 'undefined') {
          this.$set(this.restrictions[index], 'rank', '9')
        }
      }
      this.checkNewRestrictions()
    },

    onUpdateRestrictionsDebounce: function (index) {
      if (this.restrictionDebounceTimeout) {
        window.clearTimeout(this.restrictionDebounceTimeout)
      }

      this.restrictionDebounceTimeout = setTimeout(() => {
        this.onUpdateRestrictions(index)
      }, 600)
    },

    getGuildLink: function (guildKey) {
      const slug = (str) => {
        return str.toLowerCase().replace(/\s/g, '-').replace(/'/g, '')
      }
      const guild = guildKey.split(/@/)
      switch (guild[0]) {
        case 'eu':
          return `https://worldofwarcraft.com/en-gb/guild/eu/${slug(guild[1])}/${slug(guild[2])}`
        case 'us':
          return `https://worldofwarcraft.com/en-us/guild/us/${slug(guild[1])}/${slug(guild[2])}`
        case 'kr':
          return `https://worldofwarcraft.com/ko-kr/guild/kr/${slug(guild[1])}/${slug(guild[2])}`
        case 'cn':
          return `https://worldofwarcraft.com/zh-cn/guild/cn/${slug(guild[1])}/${slug(guild[2])}`
      }
      return '#'
    },

    autoCompleteUserName: function (q) {
      return this.http.get('/search/username', {name: q.q})
    }
  },
  watch: {
    importString: function (val) {
      val = val.trim()
      if (!val || val.match(/%SCAN%/)) {
        return
      }
      var vue = this
      vue.importError = false
      vue.importErrorMsg = ''
      vue.scanID = ''
      vue.type = ''
      vue.disableSubmit = true

      // ignore short strings (probably unintentional keypress)
      if (val.length < 10) {
        this.importError = true
        return
      }
      // clean up browser overhead
      if (val.length > 500) {
        this.importString = val.substring(0, 500) + '%SCAN%'
        document.getElementById('inputStringTextarea').scrollTop = 0
        document.getElementById('inputStringTextarea').blur()
      }

      // send content to import scan
      vue.isScanning = true
      this.http.post('/import/scan', { importString: val }).then((res) => {
        vue.isScanning = false
        if (res.error) {
          vue.importError = true
          if (res.error === 'invalid_import') {
            vue.importErrorMsg = vue.$t('error:Invalid import')
          }
          else if (res.error === 'invalid_url') {
            vue.importErrorMsg = vue.$t('error:Invalid url')
          }
        }
        else {
          // if no errors setup the default fields
          vue.importError = false
          vue.name = res.name
          vue.type = res.type
          if (res.type.match(/WEAKAURA/)) {
            this.weakauramode = res.type
          }
          vue.disableSubmit = false
          // build category select
          if (res.categories) {
            vue.categories = Categories.getCategories(res.categories, vue.$t)
            vue.setCategories = vue.categories
          }
          else {
            vue.categories = []
            vue.setCategories = []
          }

          // set scanID after other data is assigned
          vue.scanID = res.scan
        }
      })
    }
  }
}
</script>
