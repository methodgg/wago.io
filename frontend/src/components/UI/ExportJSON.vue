<template>
  <div>    
    <div id="wago-exportstring-container" class="wago-container">
      <textarea id="wago-exportstring">{{ forkString }}</textarea>
    </div>
    <md-dialog md-open-from="#custom" md-close-to="#custom" ref="exportDialog" @close="onClose" @open="onOpen">
      <md-dialog-title>{{ $t("Export or fork this [-type-]", {type: type}) }}</md-dialog-title>

      <md-dialog-content v-if="forkString">{{ $t("Copy string without saving, or fork to create a new Wago") }}</md-dialog-content>
      <md-dialog-content v-else>{{ $t("Loading") }}</md-dialog-content>

      <md-dialog-actions v-if="forkString">
        <md-button class="md-primary" @click="exportCopy()">{{ $t("Copy string") }}</md-button>
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
  props: ['json', 'type', 'showExport', 'wagoID'],
  methods: {
    onOpen: function () {
      if (!this.needsScan) {
        return false
      }
      var vue = this
      this.http.post('/import/json/scan', { json: this.json, type: this.type, forkOf: this.wagoID }).then((res) => {
        vue.forkString = res.encoded
        vue.scanID = res.scan
        vue.needsScan = false
      })
    },
    onClose: function () {
      this.$emit('hideExport')
    },
    exportClose: function () {
      this.$refs.exportDialog.close()
    },
    exportCopy: function () {
      try {
        document.getElementById('wago-exportstring').select()
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
        window.eventHub.$emit('showSnackBar', this.$t('Import string failed to copy please upgrade to a modern browser'))
      }
    },
    exportFork: function () {
      var post = {
        scanID: this.scanID
      }
      var vue = this
      this.http.post('/import/submit', post).then((res) => {
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
    },
    json: function () {
      this.needsScan = true
    }
  }
}
</script>

<style>
#wago-exportstring { width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:transparent;color:transparent;overflow:hidden;resize:none }
#wago-exportstring::selection { color:transparent;background:transparent }
#wago-exportstring::-moz-selection { color:transparent;background:transparent }
#wago-exportstring::-webkit-selection { color:transparent;background:transparent }
</style>
