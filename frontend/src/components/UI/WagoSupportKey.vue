<template>
    <span>
    <span v-if="!showKey && supportKey" class='btn' @click="showKey=true">{{ $t('Show Support Key') }}</span>
    <span v-else-if="!showKey" class='btn' @click="getSupportKey()">{{ $t('Show Support Key') }}</span>
      <template v-else>
        Support Key: <input class='key' :value="loading ? '...' : supportKey" id="thesupportKey" />
        <span class='btn' id="copyKeyBtn" @click="copyKey()">{{ $t('Copy to clipboard') }}</span>
        <span class='btn' @click="getSupportKey('warn')" id="makeNewKey">{{ $t('Generate new Support Key') }}</span>
      </template>
      <md-dialog md-open-from="#makeNewKey" md-close-to="#makeNewKey" ref="makeNewKeyDialog">
        <md-dialog-title>{{ $t('Remove Existing support Key?')}}</md-dialog-title>
        <md-dialog-content v-html="$t('Refresh support Key Warning')"></md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="$refs['makeNewKeyDialog'].close()">Cancel</md-button>
          <md-button class="md-primary" @click="getSupportKey('new')">Ok</md-button>
        </md-dialog-actions>
      </md-dialog>
    </span>
  </template>
  
  <script>
  export default {
    data: function () {
      return {
        showKey: false,
        loading: false
      }
    },
    computed: {
      supportKey () {
        return this.$store.state.user.support_key || this.loading
      }
    },
    methods: {
      getSupportKey (tag) {
        var data = {}
        if (tag === 'warn') {
          this.$refs['makeNewKeyDialog'].open()
          return
        }
        else if (tag === 'new') {
          data.new = 1
          this.$refs['makeNewKeyDialog'].close()
        }
        this.loading = true
        this.showKey = true
        this.http.post('/account/support-key', data).then((result) => {
          this.loading = false
          if (result && result.key) {
            var user = this.$store.state.user
            user.support_key = result.key
            this.$store.commit('setUser', user)
            this.showKey = true
          }
        })
      },
      copyKey () {
        document.getElementById('thesupportKey').select()
        if (document.execCommand('copy')) {
          window.eventHub.$emit('showSnackBar', this.$t('Support key copied'))
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Support key failed to copy please upgrade to a modern browser'))
        }
        if (document.selection) {
          document.selection.empty()
        }
        else if (window.getSelection) {
          window.getSelection().removeAllRanges()
        }
      }
    }
  }
  </script>
  
  <style scoped>
    .btn { color: white; background: black; border: 1px solid white; border-radius: 4px; cursor: pointer; padding: 2px; font-size: 80%; margin-left: 12px; white-space: nowrap }
    .key { color: white; background: #212121; width: 405px; border:0; font-family: monospace; padding: 2px 4px; font-size: 80%;}
  </style>
  