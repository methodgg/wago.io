<template>
  <div id="edit-plater">
    <codereview v-if="codeReview.alerts && codeReview.alertContent" :alerts="codeReview.alertContent" :highlights="codeReview.info" @loadFn="loadByKeypath" :name="$t('Alert!!')" @setComment="setCodeReviewComment" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>
    <codereview v-else-if="codeReview.info.dependencies.length || codeReview.info.highlights.size" :highlights="codeReview.info" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>

    <div class="flex-container" id="editor-main">
      <div class="flex-col flex-left">
        <md-input-container>
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
        <md-button v-if="customCodeIndex >= 0" @click="formatCode"><md-icon>code</md-icon> {{ $t("Format Lua") }}</md-button>
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

    <editor v-model="editorContent" @init="editorInit" :lang="aceLanguage" :theme="editorTheme" width="100%" height="500" @input="setHasUnsavedChanges(true)"></editor>

    <export-modal :json="tableString" :type="'Plater'" :showExport="showExport" :wagoID="wago._id" @hideExport="hideExport"></export-modal>
  </div>
</template>

<script>
const semver = require('semver')
import detectCustomCode from '../libs/detectCustomCode'
import luamin from '../libs/luamin'
import InputSemver from '../UI/Input-Semver.vue'
import ExportJSON from '../UI/ExportJSON.vue'
import CodeReview from './CodeReview'

export default {
  name: 'edit-plater',
  props: ['unsavedTable', 'cipherKey', 'loadFn'],
  data: function () {
    return {
      editorPrevious: 'tabledata',
      editorPreviousObj: {},
      tableData: JSON.parse(this.$store.state.wago.code.json),
      tableString: this.$store.state.wago.code.json,
      editorFile: '',
      scriptType: '',
      aceLanguage: 'json',
      aceEditor: null,
      showExport: false,
      extractData: false,
      latestVersion: {semver: semver.valid(semver.coerce(this.$store.state.wago.versions.versions[0].versionString))},
      newImportVersion: {},
      newChangelog: {},
      luacheck: this.$store.state.wago.code.luacheck,
      luacheckFile: null,
      customCode: this.$store.state.wago.code.customCode,
      customCodeIndex: -1,
      codeReview: this.$store.state.wago.codeReview,
      codeReviewFile: -1,
      customFn: []
    }
  },
  watch: {
    customCodeIndex: async function (newIndex, oldIndex) {
      const unsavedTableState = this.unsavedTable
      if (oldIndex === -1) {
        let table = this.aceEditor.getValue()
        this.$store.commit('setWagoJSON', table)
        this.tableData = JSON.parse(table)
      }
      else if (this.customCode[oldIndex]) {
        let updatedLua = this.aceEditor.getValue()
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
        this.aceEditor.setValue('')
        this.aceEditor.getSession().setMode('ace/mode/json')
        this.aceEditor.setValue(JSON.stringify(this.tableData, null, 2), -1)
      }
      else if (this.customCode[newIndex]) {
        this.aceEditor.setValue('')
        this.aceEditor.getSession().setMode('ace/mode/lua')
        this.aceEditor.setValue(this.customCode[newIndex].lua, -1)
      }

      await this.$nextTick()
      this.aceEditor.getSession().getUndoManager().reset()
      this.setHasUnsavedChanges(unsavedTableState)
    }
  },
  components: {
    editor: require('vue2-ace-editor'),
    'export-modal': ExportJSON,
    'input-semver': InputSemver,
    codereview: CodeReview
  },
  mounted () {
    this.latestVersion.semver = semver.valid(semver.coerce(this.wago.versions.versions[0].versionString))
    this.latestVersion.major = semver.major(this.latestVersion.semver)
    this.latestVersion.minor = semver.minor(this.latestVersion.semver)
    this.latestVersion.patch = semver.patch(this.latestVersion.semver)

    if (this.loadFn) {
      this.loadByKeypath(this.loadFn)
    }
  },
  methods: {
    editorInit: function (editor) {
      if (typeof this.tableData['8'] === 'number') {
        this.scriptType = 'Script'
      }
      else if (typeof this.tableData['9'] === 'object') {
        this.scriptType = 'Mod'
      }
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
    luacheckInit: function (editor) {
      window.braceRequires()
      editor.setOptions({
        scrollPastEnd: false,
        printMargin: false,
        maxLines: 100,
        readOnly: true
      })
    },

    loadByKeypath: async function (keypath) {
      for (let i = 0; i < this.customCode.length; i++) {
        if (this.customCode[i].keypath === keypath) {
          this.customCodeIndex = i
          await this.$nextTick()
          let t = document.getElementById('editor-main').getBoundingClientRect().top
          window.scrollTo({top: t - 84 + window.pageYOffset, behavior: 'smooth'})
        }
      }
    },

    formatCode: function () {
      var lua = this.aceEditor.getValue()
      lua = luamin.Beautify(lua, {})
      this.aceEditor.setValue(lua, -1)
    },

    saveChanges: async function () {
      this.$refs['saveChangesDialog'].close()
      this.customCodeIndex = -1
      await this.$nextTick()
      await this.$nextTick() // wait 2 ticks
      let post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.aceEditor.getValue()
      post.newVersion = this.newImportVersion.semver
      post.changelog = this.newChangelog.text
      post.changelogFormat = this.newChangelog.format
      post.cipherKey = this.cipherKey
      let vue = this
      this.http.post('/import/json/save', post).then((res) => {
        if (res.success) {
          window.eventHub.$emit('showSnackBar', this.$t('Wago saved successfully'))
          vue.$router.push('/' + vue.wago.slug)
          this.setHasUnsavedChanges(false)
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
    generateNextVersionData () {
      this.newChangelog = { text: '', format: this.$store.state.user.defaultEditorSyntax }
      this.$set(this.newImportVersion, 'semver', semver.inc(this.latestVersion.semver, 'patch'))
      this.$set(this.newImportVersion, 'major', semver.major(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'minor', semver.minor(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'patch', semver.patch(this.newImportVersion.semver))
    },
    focusFieldByRef (ref) {
      setTimeout(() => {
        this.$refs[ref].$el.focus()
      }, 150)
    },
    exportChanges: function () {
      if (this.editorSelected === 'tabledata') {
        this.tableString = this.aceEditor.getValue()
        this.showExport = true
      }
      else {
        this.editorSelected = 'tabledata'
        var t = this
        setTimeout(function () {
          t.exportChanges()
        }, 50)
      }
    },
    hideExport: function () {
      this.showExport = false
    },

    runLuacheck: function () {
      this.luacheck = 'loading'
      this.http.get('/lookup/wago/luacheck', {id: this.wago._id, version: this.$store.state.wago.code.version}).then((res) => {
        this.luacheck = res
      })
    }
  },
  computed: {
    editorContent: {
      get: function () {
        return this.$store.state.wago.code.json
      },

      set: function () {

      }
    },
    groupedWA: function () {
      if (!this.tableData.c) {
        return false
      }

      var auras = []

      // loop through each aura in array
      this.tableData.c.forEach((item, key) => {
        if (item && item.id) {
          auras.push(item.id)
        }
      })
      return auras
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
#edit-plater .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-plater .md-select { width: auto }
#edit-plater .md-input-container { margin-bottom: 10px}
#edit-plater .md-input-container:after { content: none }
#edit-plater .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-plater .flex-left { order: 0; flex: 0 1 auto}
#edit-plater .flex-left .md-input-container label { white-space: nowrap}
#edit-plater .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#edit-plater .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
.customFn .md-subheader { color: #c0272e }
#saveChangesDialog .md-dialog { min-width: 40% }
.code-select .md-button {line-height: 20px}
.code-select .md-button span {display: block; line-height: 20px}
.code-select .md-button span small {display: block; font-weight: bold;}
.code-select .md-button span small span {display: none}
</style>
