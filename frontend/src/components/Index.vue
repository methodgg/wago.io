<template>
  <div id="index">
    <md-layout md-gutter="32" :md-column-small="true">
      <md-layout id="col1" md-vertical-align="start">
        <md-whiteframe id="importform">
          <md-input-container :class="{ 'md-input-invalid': importError }">
            <label>{{ $t("Paste your import string here") }}</label>
            <div id="inputStringWrapper">
              <md-textarea id="inputStringTextarea" name="importString" placeholder=" " v-model.trim="importString"></md-textarea>
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

          <div v-if="isScanning"><md-spinner md-indeterminate></md-spinner></div>
          <strong>{{ type }}</strong><br>

          <md-input-container v-if="scanID">
            <label for="name">{{ $t("Name") }}</label>
            <md-input name="name" id="name" v-model="name"></md-input>
          </md-input-container>

          <md-input-container v-if="scanID" class="md-has-value has-category-select">
            <label>{{ $t("Categories") }}</label>
            <category-select :selectedCategories="setCategories" :type="type.toUpperCase()" @update="cat => {setCategories = cat}" ></category-select>
          </md-input-container>

          <md-button class="md-raised" :disabled="disableSubmit" @click="submitImport()">Submit</md-button>
        </md-whiteframe>

        <div v-if="latestBlogs && latestBlogs.length > 0" id="sitenews">
          <wago-news :posts="latestBlogs"></wago-news>
        </div>
      </md-layout>

      <md-layout id="col2" :md-column-medium="true" md-vertical-align="start">
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
                      <span>{{ $t("[-count-] views", {count: item.popularity.viewsThisWeek}) }}</span>
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
                      <span>{{ $t("[-count-] stars", {count: item.popularity.favorite_count}) }}</span>
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
              <md-table-head>{{ $t("Type") }}</md-table-head>
              <md-table-head>{{ $t("Version #") }}</md-table-head>
              <md-table-head>{{ $t("Date") }}</md-table-head>
            </md-table-row>
          </md-table-header>
          <md-table-body>
            <md-table-row v-for="(addon, addonIndex) in addonReleases" :key="addonIndex">
              <md-table-cell>{{ addon.addon }}</md-table-cell>
              <md-table-cell><a :href="addon.url" target="_blank">{{ addon.phase }}</a></md-table-cell>
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

.has-category-select + .has-category-select {margin-top: -24px}

#topwagos .md-list-item { flex-wrap: wrap }

#sitenews { width: 100%}
#sitenews .md-card {margin: 16px 0 0; width:100%}
#sitenews .md-card .md-subhead { opacity: 1 }

</style>

<script>
import CategorySelect from './UI/SelectCategory.vue'
import WagoNews from './core/News.vue'
import VueMarkdown from 'vue-markdown'

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
      setCategories: [],
      setCategories2: [],
      categories: [],
      type: '',
      isScanning: false,
      scanID: '',
      disableSubmit: true,
      top10Lists: {},
      latestBlogs: [],
      addonReleases: []
    }
  },
  components: {
    CategorySelect,
    'vue-markdown': VueMarkdown,
    'wago-news': WagoNews
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
        name: this.name,
        categories: JSON.stringify(this.setCategories.concat(this.setCategories2))
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
    }
  },
  watch: {
    importString: function (val) {
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
          vue.disableSubmit = false
          // build category select
          vue.categories = []
          vue.setCategories = []
          vue.setCategories2 = []

          // set scanID after other data is assigned
          vue.scanID = res.scan
        }
      })
    }
  }
}
</script>
