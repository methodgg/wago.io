<template>
  <div>    
    <div id="wago-exportstring-container" class="wago-container">
      <textarea id="wago-exportstring" class="wago-importstring" spellcheck="false">{{ forkString }}</textarea>
    </div>
    <md-dialog md-open-from="#custom" md-close-to="#custom" ref="exportDialog" @close="onClose">
      <md-dialog-title>{{ $t("Fork this [-type-]", {type: type}) }}</md-dialog-title>

      <md-dialog-content>{{ $t("Fork to create a new snippet") }}</md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="exportFork()">{{ $t("Fork [-type-]", {type: type}) }}</md-button>
        <md-button class="md-primary" @click="exportClose()">{{ $t("Cancel") }}</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      forkString: '',
      scanID: '',
      needsScan: true
    }
  },
  props: ['lua', 'type', 'showExport', 'wagoID'],
  methods: {
    onClose: function () {
      this.$emit('hideExport')
    },
    exportClose: function () {
      this.$refs.exportDialog.close()
    },
    exportFork: function () {
      var post = {
        lua: this.lua,
        type: this.type,
        forkOf: this.wagoID
      }
      var vue = this
      this.http.post('/import/lua/fork', post).then((res) => {
        if (res.success && res.wagoID) {
          vue.$router.push('/' + res.wagoID)
        }
        else {
          window.eventHub.$emit('showSnackBar', vue.$t('Fork failed or expired please try again'))
        }
      })
    }
  },
  watch: {
    showExport: function () {
      if (this.showExport) {
        this.$refs.exportDialog.open()
      }
    }
  }
}
</script>
