<template>
  <div id="edit-delvui">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <div class="flex-col flex-right">
        <md-menu v-if="delvConfigs.length > 1" md-size="6" md-align-trigger>
          <md-button md-menu-trigger id="extractFromGroupButton"><md-icon>call_missed_outgoing</md-icon> {{ $t("Extract Single Config") }}</md-button>
          <md-menu-content>
            <md-menu-item v-for="(comp, key) in delvConfigs" @click="extractDelvConfig(comp)" :key="key" v-if="comp && comp.$type && comp.$type.match(/^DelvUI\..*\.([a-zA-Z]+), DelvUI$/)">{{ comp.$type.replace(/^DelvUI\..*\.([a-zA-Z]+), DelvUI$/, '$1').replace(/([A-Z][a-z])/g, ' $1').trim() }}</md-menu-item>
          </md-menu-content>
        </md-menu>
        <md-button @click="exportChanges"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button v-if="canEdit" @click="generateNextVersionData(); $refs['saveChangesDialog'].open()" ref="saveChangesButton"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
      </div>
      <md-dialog md-open-from="#saveChangesButton" md-close-to="#saveChangesButton" ref="saveChangesDialog" id="saveChangesDialog" @open="focusFieldByRef('changelogText')">
        <md-dialog-title>{{ $t("Save Modifications") }}</md-dialog-title>

        <input-semver v-model="newImportVersion" :latestVersion="latestVersion"></input-semver>

        <md-dialog-content>
          <md-input-container class="changelog-notes">
            <label>{{ $t("Changelog") }}</label>
            <md-textarea v-model="newChangelog.text" ref="changelogText" :placeholder="$t('You may enter any patch notes or updates here')"></md-textarea>
          </md-input-container>
          <div>
            <div class="md-radio md-theme-default"><label class="md-radio-label">{{ $t("Format") }}</label></div>
            <md-radio v-model="newChangelog.format" md-value="bbcode">BBCode</md-radio>
            <md-radio v-model="newChangelog.format" md-value="markdown">Markdown</md-radio>
          </div>
        </md-dialog-content>

        <md-dialog-actions>
          <md-button class="md-primary" @click="saveChanges()">{{ $t("Save") }}</md-button>
          <md-button class="md-primary" @click="$refs['saveChangesDialog'].close()">{{ $t("Cancel") }}</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>

    <editor v-model="editorContent" @init="editorInit" :lang="aceLanguage" :theme="editorTheme" width="100%" height="500" @input="setHasUnsavedChanges(true)"></editor>
    <export-modal :json="tableString" :type="wago.type" :showExport="showExport" :wagoID="wago._id" :wagolib="wago.wagolib" @hideExport="hideExport"></export-modal>

    <md-dialog md-open-from="#extractFromGroupButton" md-close-to="#extractFromGroupButton" ref="extractFromGroupDialog">
      <md-dialog-title>{{ $t("Extract Single Config") }}</md-dialog-title>

      <md-dialog-content>
        <p v-if="extractData">{{ $t("Copy the DelvUI import string for \"[-delvConfig-]\"", {delvConfig: extractData.name}) }}</p>
        <textarea v-if="extractData" class="wago-importstring" spellcheck="false" id="wago-extractString">{{ extractData.encoded }}</textarea>
        <p v-else>{{ $t("Loading extraction string") }}</p>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button v-if="extractData" class="md-primary" @click="extractCopy()">{{ $t("Copy string") }}</md-button>
        <md-button class="md-primary" @click="$refs.extractFromGroupDialog.close()">{{ $t("Close") }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
const semver = require('semver')
import ExportJSON from './ExportJSON.vue'
import InputSemver from '../UI/Input-Semver.vue'

export default {
  name: 'edit-common',
  props: ['cipherKey'],
  data: function () {
    return {
      tableString: this.$store.state.wago.code.json,
      editorFile: '',
      aceLanguage: 'json',
      aceEditor: null,
      showExport: false,
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
      extractData: false
    }
  },
  watch: {
  },
  components: {
    editor: require('vue2-ace-editor'),
    'export-modal': ExportJSON,
    'input-semver': InputSemver
  },
  methods: {
    editorInit: function (editor) {
      this.aceEditor = editor
      window.braceRequires()
      editor.setOptions({
        autoScrollEditorIntoView: true,
        scrollPastEnd: true,
        printMargin: false,
        minLines: 80,
        maxLines: 1000
      })
    },

    saveChanges: function () {
      this.$refs['saveChangesDialog'].close()
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.aceEditor.getValue()
      post.newVersion = this.newImportVersion.semver
      post.changelog = this.newChangelog.text
      post.changelogFormat = this.newChangelog.format
      post.cipherKey = this.cipherKey
      var vue = this
      this.http.post('/import/json/save', post).then((res) => {
        if (res.success) {
          window.eventHub.$emit('showSnackBar', this.$t('Wago saved successfully'))
          vue.$router.push('/' + vue.wago.slug)
          this.$emit('set-has-unsaved-changes', false)
          if (res.encoded) {
            this.$emit('update-encoded', res.encoded)
          }
          if (res.latestVersion) {
            this.$set(this.latestVersion, 'semver', semver.valid(semver.coerce(res.latestVersion)))
            this.$set(this.latestVersion, 'major', semver.major(this.latestVersion.semver))
            this.$set(this.latestVersion, 'minor', semver.minor(this.latestVersion.semver))
            this.$set(this.latestVersion, 'patch', semver.patch(this.latestVersion.semver))
            this.$emit('update-version', res.latestVersion)
            this.$set(this.wago.code, 'changelog', {text: post.changelog, format: post.changelogFormat})
          }
        }
        else if (res && res.error) {
          window.eventHub.$emit('showSnackBar', res.error)
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Unknown error could not save'))
        }
      })
    },
    setHasUnsavedChanges: function (bool) {
      this.$emit('set-has-unsaved-changes', bool)
    },
    exportChanges: function () {
      this.tableString = this.aceEditor.getValue()
      this.showExport = true
    },
    hideExport: function () {
      this.showExport = false
    },
    focusFieldByRef (ref) {
      setTimeout(() => {
        this.$refs[ref].$el.focus()
      }, 150)
    },
    generateNextVersionData () {
      this.newChangelog = { text: '', format: this.$store.state.user.defaultEditorSyntax }
      this.$set(this.newImportVersion, 'semver', semver.inc(this.latestVersion.semver, 'patch'))
      this.$set(this.newImportVersion, 'major', semver.major(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'minor', semver.minor(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'patch', semver.patch(this.newImportVersion.semver))
    },
    extractDelvConfig: function (cfg) {
      this.$refs.extractFromGroupDialog.open()
      let vue = this
      this.http.post('/import/json/scan', {wagoID: this.wago._id, type: 'DELVUI', json: JSON.stringify([cfg])}).then((res) => {
        if (res.encoded) {
          vue.extractData = {}
          vue.extractData.encoded = res.encoded
          vue.extractData.name = cfg.$type.replace(/^DelvUI\..*\.([a-zA-Z]+), DelvUI$/, '$1').replace(/([A-Z][a-z])/g, ' $1').trim()
        }
      })
    },
    extractCopy: function () {
      try {
        document.getElementById('wago-extractString').select()
        var copied = document.execCommand('copy')
        if (copied) {
          window.eventHub.$emit('showSnackBar', this.$t('Import string copied'))
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Import string failed to copy please upgrade to a modern browser'))
        }
        return copied
      }
      catch (e) {
        console.log(e)
        window.eventHub.$emit('showSnackBar', this.$t('Import string failed to copy please upgrade to a modern browser'))
      }
    },
  },
  computed: {
    editorContent: {
      get: function () {
        return this.$store.state.wago.code.json
      },

      set: function () {

      }
    },
    wago: function () {
      return this.$store.state.wago
    },
    canEdit: function () {
      var user = this.$store.state.user
      var wago = this.$store.state.wago

      if (user && user.UID && wago.UID && user.UID === wago.UID) {
        return true
      }
      return false
    },
    editorTheme: function () {
      if (!this.$store.state.user || !this.$store.state.user.config || !this.$store.state.user.config.editor) {
        return 'tomorrow'
      }
      else {
        return this.$store.state.user.config.editor || 'tomorrow'
      }
    },
    delvConfigs: function () {
      let arr = JSON.parse(this.tableString)
      console.log('compopn', arr)
      if (Array.isArray(arr)) {
        return arr
      }
      else {
        return []
      }
    }
  }
}
</script>

<style>
#edit-delvui .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-delvui .md-select { width: auto }
#edit-delvui .md-input-container { margin-bottom: 10px}
#edit-delvui .md-input-container:after { content: none }
#edit-delvui .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-delvui .flex-left { order: 0; flex: 0 1 auto}
#edit-delvui .flex-left .md-input-container label { white-space: nowrap}
#edit-delvui .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#edit-delvui .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
#saveChangesDialog .md-dialog { min-width: 40% }
</style>
