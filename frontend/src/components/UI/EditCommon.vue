<template>
  <div id="edit-common">
    <div class="flex-container">      
      <div class="flex-col flex-left">
        <md-input-container v-if="customCode?.length">
          <label for="customfn" v-html="$t('Edit [-file-]', {file: editorFile})"></label>
          <md-select name="customfn" id="customfn" v-model="customCodeIndex" md-menu-class="customFn">
            <md-option :value="-1" >{{ $t("Table data") }}</md-option>
            <template v-for="(fn, i) in customCode">
              <md-option :value="i" class="code-select"><small>{{ fn.name.replace(/ - .*?$/, '') }}<span>:</span></small> {{ fn.name.replace(/^.* - /, '') }}</md-option>
            </template>
            <md-subheader v-if="!customCode || !customCode.length">{{ $t("No custom functions found") }}</md-subheader>
          </md-select>
        </md-input-container>
      </div>
      <div class="flex-col flex-right">    
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

    <div :key="customCodeIndex" v-if="customCode && customCode[customCodeIndex] && customCode[customCodeIndex]">
      <codereview v-if="customCode[customCodeIndex].stabilityChecks && customCode[customCodeIndex].stabilityChecks.length" name="Code Review" :review="codeReview.stabilityChecks[customCodeIndex]" @setComment="setCodeReviewComment" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>
      <codereview v-if="customCode[customCodeIndex].luacheck" name="Luacheck" :luacheck="true" :canMin="true" >{{customCode[customCodeIndex].luacheck}}</codereview>
      <codereview v-if="customCode[customCodeIndex].metrics" :name="'Code Analysis - ' + customCode[customCodeIndex].name" :codeInfo="true" :json="customCode[customCodeIndex].metrics" :canMin="true"></codereview>
    </div>

    <monaco-editor v-model="editorContent" :lang="editorLang" @input="setHasUnsavedChanges"></monaco-editor>
    <export-modal :json="editorContent" :type="wago.type" :showExport="showExport" :wagoID="wago._id" :wagolib="wago.wagolib" @hideExport="hideExport"></export-modal>
  </div>
</template>

<script>
const semver = require('semver')
import ExportJSON from './ExportJSON.vue'
import InputSemver from '../UI/Input-Semver.vue'
import MonacoEditor from './MonacoEditor.vue'
import CodeReview from './CodeReview'

export default {
  name: 'edit-common',
  props: ['cipherKey'],
  data: function () {
    return {
      tableString: this.$store.state.wago.code.json,
      editorContent: this.$store.state.wago.code.json,
      editorFile: '',
      showExport: false,
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
      editorLang: 'json',
      customCode: this.$store.state.wago.code.customCode,
      customCodeIndex: -1,
    }
  },
  components: {
    'monaco-editor': MonacoEditor,
    'export-modal': ExportJSON,
    'input-semver': InputSemver,
    codereview: CodeReview
  },
  methods: {
    saveChanges: function () {
      this.$refs['saveChangesDialog'].close()
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.editorContent
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
      this.tableString = this.editorContent
      this.showExport = true
      console.log(this.tableString)
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
    }
  },
  watch: {
    customCodeIndex: async function (newIndex, oldIndex) {
      const unsavedTableState = this.unsavedTable
      if (oldIndex === -1) {
        let table = this.editorContent
        this.$store.commit('setWagoJSON', table)
        this.tableData = JSON.parse(table)
      }
      else if (this.customCode[oldIndex]) {
        let updatedLua = this.editorContent
        let safeLua = updatedLua.replace(/\\/g, '\\\\').replace(/\r\n|\n|\r/g, '\\n').replace(/"/g, '\\"')
        this.$set(this.customCode[oldIndex], 'lua', updatedLua)
        if (this.customCode[oldIndex].keypath.match(/^\w/)) {
          eval(`this.tableData.${this.customCode[oldIndex].keypath} = "${safeLua}"`)
        }
        else {
          eval(`this.tableData${this.customCode[oldIndex].keypath} = "${safeLua}"`)
        }
      }

      await this.$nextTick()
      if (newIndex === -1) {
        this.editorContent = JSON.stringify(this.tableData, null, 2)
        this.editorLang = 'json'
      }
      else if (this.customCode[newIndex]) {
        this.editorContent = this.customCode[newIndex].lua
        this.editorLang = 'lua'
      }

      await this.$nextTick()
      this.setHasUnsavedChanges(unsavedTableState)
    }
  },
  computed: {
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
        return 'terminal'
      }
      else {
        return this.$store.state.user.config.editor || 'terminal'
      }
    }
  }
}
</script>

<style>
#edit-common .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-common .md-select { width: auto }
#edit-common .md-input-container { margin-bottom: 10px}
#edit-common .md-input-container:after { content: none }
#edit-common .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-common .flex-left { order: 0; flex: 0 1 auto}
#edit-common .flex-left .md-input-container label { white-space: nowrap}
#edit-common .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#edit-common .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
#saveChangesDialog .md-dialog { min-width: 40% }
</style>
