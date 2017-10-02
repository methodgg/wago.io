<template>
  <div id="edit-vuhdo">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <div class="flex-col flex-right">
        <md-button v-if="canEdit" @click="saveChanges">{{ $t("Save changes") }}</md-button>
        <md-button @click="exportChanges">{{ $t("Export changes") }}</md-button>
      </div>
    </div>
    
    <editor v-model="editorContent" @init="editorInit" :lang="aceLanguage" :theme="editorTheme" width="100%" height="500"></editor>
  </div>
</template>

<script>
export default {
  name: 'edit-vuhdo',
  data: function () {
    return {
      editorSelected: 'tabledata',
      editorPrevious: 'tabledata',
      tableData: JSON.parse(this.$store.state.wago.code.json),
      editorFile: '',
      aceLanguage: 'json',
      aceEditor: null
    }
  },
  watch: {
  },
  components: {
    editor: require('vue2-ace-editor')
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
    customFn: function (json) {
      return []
    },

    saveChanges: function () {

    },
    exportChanges: function () {

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
    canEdit: function () {
      var user = this.$store.state.user
      var wago = this.$store.state.wago
      if (user && user._id && wago.UID && user._id === wago.UID) {
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
#edit-vuhdo .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-vuhdo .md-select { width: auto }
#edit-vuhdo .md-input-container { margin-bottom: 10px}
#edit-vuhdo .md-input-container:after { content: none }
#edit-vuhdo .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-vuhdo .flex-left { order: 0; flex: 0 1 auto}
#edit-vuhdo .flex-left .md-input-container label { white-space: nowrap}
#edit-vuhdo .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#edit-vuhdo .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
</style>
