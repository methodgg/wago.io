<template>
  <div id="edit-common">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <div class="flex-col flex-right">    
        <md-button @click="exportChanges"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button v-if="canEdit" @click="saveChanges"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
      </div>
    </div>
    
    <editor v-model="editorContent" @init="editorInit" :lang="aceLanguage" :theme="editorTheme" width="100%" height="500" @input="setHasUnsavedChanges(true)"></editor>
    <export-modal :json="tableString" :type="wago.type" :showExport="showExport" :wagoID="wago._id" @hideExport="hideExport"></export-modal>
  </div>
</template>

<script>
export default {
  name: 'edit-common',
  data: function () {
    return {
      tableString: this.$store.state.wago.code.json,
      editorFile: '',
      aceLanguage: 'json',
      aceEditor: null,
      showExport: false
    }
  },
  watch: {
  },
  components: {
    editor: require('vue2-ace-editor'),
    'export-modal': require('./ExportJSON.vue')
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
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.aceEditor.getValue()
      var vue = this
      this.http.post('/import/json/save', post).then((res) => {
        if (res.success) {
          window.eventHub.$emit('showSnackBar', this.$t('Wago saved successfully'))
          vue.$router.push('/' + vue.wago.slug)
          this.$emit('set-has-unsaved-changes', false)
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
</style>
