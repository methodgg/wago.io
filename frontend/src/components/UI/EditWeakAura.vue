<template>
  <div id="edit-weakaura">
    <codereview v-if="codeReview && codeReviewFile >= 0 && codeReview.stabilityChecks && codeReview.stabilityChecks.length" name="Code Review" :review="codeReview.stabilityChecks[codeReviewFile]" @setComment="setCodeReviewComment" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>
    <codereview v-if="luacheck && editorSelected !== 'tabledata'" name="Luacheck" :luacheck="true">{{luacheck[luacheckFile]}}</codereview>
    <div class="flex-container">
      <div class="flex-col flex-left">
        <md-input-container>
          <label for="customfn" v-html="$t('Edit [-file-]', {file: editorFile})"></label>
          <md-select name="customfn" id="customfn" v-model="editorSelected" md-menu-class="customFn">
            <md-option value="tabledata" >{{ $t("Table data") }}</md-option>
            <template v-for="fn in customFn">
              <md-subheader v-if="typeof(fn) === 'string'">{{ fn }}</md-subheader>
              <md-option v-else :value="`${fn.id}: ${fn.name}`">{{ fn.name }}</md-option>
            </template>
            <md-subheader v-if="!customFn.length">{{ $t("No custom functions found") }}</md-subheader>
          </md-select>
        </md-input-container>        
      </div>
      <div class="flex-col flex-right">
        <md-menu v-if="groupedWA" md-size="6" md-align-trigger>
          <md-button md-menu-trigger id="extractFromGroupButton"><md-icon>call_missed_outgoing</md-icon> {{ $t("Extract from group") }}</md-button>
          <md-menu-content>
            <md-menu-item v-for="(wa, key) in groupedWA" @click="extractWA(wa)" :key="key">{{ wa }}</md-menu-item>
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

    <md-dialog md-open-from="#extractFromGroupButton" md-close-to="#extractFromGroupButton" ref="extractFromGroupDialog">
      <md-dialog-title>{{ $t("Extract from group") }}</md-dialog-title>

      <md-dialog-content>
        <p v-if="extractData">{{ $t("Copy the WeakAura import string for \"[-groupedWA-]\"", {groupedWA: extractData.name}) }}</p>
        <textarea v-if="extractData" class="wago-importstring" spellcheck="false" id="wago-extractString">{{ extractData.encoded }}</textarea>
        <p v-else>{{ $t("Loading extraction string") }}</p>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button v-if="extractData" class="md-primary" @click="extractCopy()">{{ $t("Copy string") }}</md-button>
        <md-button class="md-primary" @click="$refs.extractFromGroupDialog.close()">{{ $t("Close") }}</md-button>
      </md-dialog-actions>
    </md-dialog>
    <export-modal :json="tableString" :type="'WeakAura'" :showExport="showExport" :wagoID="wago._id" @hideExport="hideExport"></export-modal>
  </div>
</template>

<script>
const semver = require('semver')
import detectCustomCode from '../libs/detectCustomCode'

export default {
  name: 'edit-weakaura',
  props: ['unsavedTable', 'cipherKey', 'loadFn'],
  data: function () {
    return {
      editorSelected: 'tabledata',
      editorPrevious: 'tabledata',
      editorPreviousObj: {},
      tableData: JSON.parse(this.$store.state.wago.code.json),
      tableString: this.$store.state.wago.code.json,
      editorFile: '',
      aceLanguage: 'json',
      aceEditor: null,
      showExport: false,
      extractData: false,
      latestVersion: {semver: semver.valid(semver.coerce(this.$store.state.wago.versions.versions[0].versionString))},
      newImportVersion: {},
      newChangelog: {},
      luacheck: this.$store.state.wago.code.luacheck,
      luacheckFile: null,
      codeReview: this.$store.state.wago.codeReview,
      codeReviewFile: -1,
      customFn: []
    }
  },
  watch: {
    editorSelected: function (newFn) {
      var tmpUnsaved = this.unsavedTable
      try {
        var fn
        this.customFn = detectCustomCode.WeakAura(this.tableData)
        if (newFn !== 'tabledata') {
          this.luacheckFile = newFn
          for (let i = 0; i < this.customFn.length; i++) {
            if (typeof this.customFn[i] === 'object' && newFn === `${this.customFn[i].id}: ${this.customFn[i].name}`) {
              fn = this.customFn[i]
              break
            }
          }
          if (this.codeReview.stabilityChecks) {
            for (let i = 0; i < this.codeReview.stabilityChecks.length; i++) {
              if (this.codeReview.stabilityChecks[i] && this.codeReview.stabilityChecks[i].func === this.luacheckFile) {
                this.codeReviewFile = i
                break
              }
            }
          }
        }
        else {
          this.luacheckFile = null
          this.codeReviewFile = -1
          for (let i = 0; i < this.customFn.length; i++) {
            if (this.codeReview.stabilityChecks[i] && this.codeReview.stabilityChecks[i].func === 'tabledata') {
              this.codeReviewFile = i
              break
            }
          }
        }

        // save current data to json object
        /* eslint-disable no-unused-vars */
        /* eslint-disable no-eval */
        var root
        // if switching FROM table data TO a custom Fn
        if (fn && this.editorPrevious === 'tabledata') {
          this.$store.commit('setWagoJSON', this.aceEditor.getValue())
          this.tableData = JSON.parse(this.aceEditor.getValue())

          this.$nextTick(() => {
            // switch to lua
            this.aceEditor.getSession().setMode('ace/mode/lua')

            if (fn.ix.table === 'd') {
              root = JSON.parse(this.editorContent).d
              this.aceEditor.setValue(eval('root.' + fn.path), -1)
            }
            else if (fn.ix.table === 'c') {
              root = JSON.parse(this.editorContent).c[fn.ix.index]
              this.aceEditor.setValue(eval('root.' + fn.path), -1)
            }
            var editor = this.aceEditor
            setTimeout(function () {
              editor.getSession().getUndoManager().reset()
            }, 500)
            this.setHasUnsavedChanges(tmpUnsaved)
            this.editorFile = root.id
          })
        }
        // if switching FROM a custom function
        else {
          var updated = this.aceEditor.getValue().replace(/\\/g, '\\\\').replace(/\r\n|\n|\r/g, '\\n').replace(/"/g, '\\"')

          // update table data
          if (this.editorPreviousObj.ix.table === 'd') {
            eval('this.tableData.d.' + this.editorPreviousObj.path + ' = "' + updated + '"')
          }
          else if (this.editorPreviousObj.ix.table === 'c') {
            eval('this.tableData.c[' + this.editorPreviousObj.ix.index + '].' + this.editorPreviousObj.path + ' = "' + updated + '"')
          }

          var json = JSON.stringify(this.tableData, null, 2)
          this.$store.commit('setWagoJSON', json)

          this.$nextTick(() => {
            // if switching TO table data
            if (fn === 'tabledata' || !fn) {
              this.aceEditor.setValue(json, -1)
              this.aceEditor.getSession().setMode('ace/mode/json')
              this.editorFile = this.tableData.d.id
            }
            // if we are switching TO a custom function
            else if (typeof fn === 'object') {
              this.aceEditor.getSession().setMode('ace/mode/lua')
              if (fn.ix.table === 'd') {
                root = this.tableData.d
                this.aceEditor.setValue(eval('root.' + fn.path), -1)
              }
              else if (fn.ix.table === 'c') {
                root = this.tableData.c[fn.ix.index]
                this.aceEditor.setValue(eval('root.' + fn.path), -1)
              }
              this.editorFile = root.id
            }
            var editor = this.aceEditor
            setTimeout(function () {
              editor.getSession().getUndoManager().reset()
            }, 500)
            this.setHasUnsavedChanges(tmpUnsaved)
          })
        }
      }
      catch (e) {
        console.log(e)
        window.eventHub.$emit('showSnackBar', this.$t('error:An error occurred reading the table data'))
      }

      // set previous to what is set NOW, for next time
      if (fn === 'tabledata') {
        this.editorPrevious = fn
      }
      else {
        this.editorPrevious = 'fn'
        this.editorPreviousObj = fn
      }
    }
  },
  components: {
    editor: require('vue2-ace-editor'),
    'export-modal': require('./ExportJSON.vue'),
    'input-semver': require('../UI/Input-Semver.vue'),
    codereview: require('./CodeReview')
  },
  mounted () {
    this.latestVersion.semver = semver.valid(semver.coerce(this.wago.versions.versions[0].versionString))
    this.latestVersion.major = semver.major(this.latestVersion.semver)
    this.latestVersion.minor = semver.minor(this.latestVersion.semver)
    this.latestVersion.patch = semver.patch(this.latestVersion.semver)

    this.customFn = detectCustomCode.WeakAura(this.tableData)
    if (this.loadFn && this.loadFn !== 'tabledata') {
      for (let i = 0; i < this.customFn.length; i++) {
        if (typeof this.customFn[i] === 'object' && this.loadFn === `${this.customFn[i].id}: ${this.customFn[i].name}`) {
          this.editorSelected = this.loadFn
          break
        }
      }
    }
    else {
      for (let i = 0; i < this.customFn.length; i++) {
        if (this.codeReview.stabilityChecks[i] && this.codeReview.stabilityChecks[i].func === 'tabledata') {
          this.codeReviewFile = i
          break
        }
      }
    }
  },
  methods: {
    editorInit: function (editor) {
      this.editorFile = this.tableData.d.id
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
    setCodeReviewComment (id, text, flag) {
      let comment = {
        author: this.wago.user,
        date: Date.now(),
        falsePositive: flag,
        format: 'bbcode',
        text: text
      }
      this.$set(this.wago.codeReviewComments, id, comment)
    },

    runLuacheck: function () {
      this.luacheck = 'loading'
      this.http.get('/lookup/wago/luacheck', {id: this.wago._id, version: this.$store.state.wago.code.versionString}).then((res) => {
        this.luacheck = res
      })
    },

    saveChanges: function () {
      this.$refs['saveChangesDialog'].close()
      if (this.editorSelected === 'tabledata') {
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
      }
      else {
        this.editorSelected = 'tabledata'
        var t = this
        setTimeout(function () {
          t.saveChanges()
        }, 50)
      }
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
    extractWA: function (wa) {
      this.extractData = false
      this.$refs.extractFromGroupDialog.open()
      if (!this.tableData.d || !this.tableData.c) {
        return
      }
      // copy table
      var table = JSON.parse(JSON.stringify(this.tableData))
      delete table.c
      delete table.d

      // loop through grouped auras and find the one we selected
      for (var i = 0; i < this.tableData.c.length; i++) {
        if (this.tableData.c[i].id === wa) {
          table.d = this.tableData.c[i]
          var vue = this
          this.http.post('/import/json/scan', {wagoID: this.wago._id, type: 'WEAKAURA', json: JSON.stringify(table)}).then((res) => {
            if (res.encoded) {
              vue.extractData = {}
              vue.extractData.encoded = res.encoded
              vue.extractData.name = wa
            }
          })
          break
        }
      }
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
    User () {
      return this.$store.state.user
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
#edit-weakaura .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-weakaura .md-select { width: auto }
#edit-weakaura .md-input-container { margin-bottom: 10px}
#edit-weakaura .md-input-container:after { content: none }
#edit-weakaura .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-weakaura .flex-left { order: 0; flex: 0 1 auto}
#edit-weakaura .flex-left .md-input-container label { white-space: nowrap}
#edit-weakaura .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#edit-weakaura .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
.customFn .md-subheader { color: #c0272e }
#saveChangesDialog .md-dialog { min-width: 40% }
</style>
