<template>
  <div id="index">
    <div id="col1">
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
    </div>

    <div id="col2">
      <md-whiteframe id="topwagos">
        <md-list class="md-dense">
          <md-list-item>
            <strong>Favorites</strong>
          </md-list-item>
        </md-list>
      </md-whiteframe>
    </div>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#importform, #topwagos { padding: 16px }
#importform textarea { max-height: 110px; min-height:110px }
#importform .field-group .md-input-container { display: inline-block; max-width: 25%; position: relative}
.field-group2 .md-input-container, .field-group2 strong { display: inline-block; max-width: 49%;}
#signinanon { padding-left: 32px;  margin-top: -8px; }

@media (min-width: 1281px) {
  #col1, #col2 { width: 59.5%; display:inline-block; vertical-align:top; padding: 16px }
  #col2 { width: 40%; display:inline-block; vertical-align:top; padding: 16px 0 }
}

@media (max-width: 600px) {
  #importform { display:none }
}

#inputStringWrapper { width: 100%; position: relative; }
#inputStringWrapper div  { position: absolute; top: 0; color: #a5a5a5; padding: 6px 0 0 0; pointer-events: none}

.has-category-select + .has-category-select { margin-top: -24px}

</style>

<script>
import CategorySelect from './UI/SelectCategory.vue'

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
      disableSubmit: true
    }
  },
  components: {
    CategorySelect
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
