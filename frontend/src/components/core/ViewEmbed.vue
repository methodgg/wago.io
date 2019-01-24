<template>
  <div id="view-wago">
    <div id="wago-importstring-container" v-if="wago.code && wago.code.encoded">
      <textarea id="wago-importstring" class="wago-importstring" spellcheck="false">{{ wago.code.encoded }}</textarea>
    </div>
    <ui-warning v-if="wago.error === 'page_not_found'" mode="alert">
      404 {{ $t("No results found") }}
    </ui-warning>
    <ui-warning v-else-if="wago.error" mode="alert">
      Error: {{ wago.error }}
    </ui-warning>
    <ui-loading v-else-if="!wagoExists"></ui-loading>
    <div v-else style="position:relative">
      <div id="wago-header">
        <h3><img src="../../assets/wagoio-logo.png"/> <md-layout md-column><span class="title">{{ wago.name }}</span><span>View or modify at <a :href="wago.url" target="_blank">wago.io/{{ wago.slug }}</a></span></md-layout></h3>
        <div>
          <md-button v-if="wago.code && wago.code.encoded && !wago.alerts.blacklist" @click="copyEncoded" id="copy-import-button">
            <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
          </md-button>
        </div>
      </div>

      <!-- BUILDER FRAME -->
      <div id="wago-builder-container" class="wago-container" v-if="wago.type === 'MDT'">
        <div id="wago-builder">
          <build-mdt v-if="wago.type=='MDT'" :readonly="true"></build-mdt>
        </div>
      </div>
    </div>    

    <div id="view-wago" v-if="!wagoExists">
      <md-spinner></md-spinner>
    </div>
  </div>
</template>

<script>
export default {
  props: ['wagoID'],
  components: {
    'build-mdt': require('../UI/MDTBuilder.vue')
  },
  created: function () {
    this.fetchWago()
    window.addEventListener('scroll', this.watchScroll)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
  },
  data: function () {
    return {
      currentVersionString: ''
    }
  },
  computed: {
    wago () {
      return this.$store.state.wago
    },
    wagoExists () {
      if (this.$store.state.wago && this.$store.state.wago._id) {
        return true
      }
      return false
    }
  },
  methods: {
    fetchWago () {
      if (this.doNotReloadWago) {
        return false
      }
      var vue = this
      var wagoID = this.wagoID
      this.$store.commit('setWago', {})

      var params = {}
      params.id = wagoID
      this.version = this.$route.params.version
      if (this.version) {
        params.version = this.version
      }

      vue.http.get('/lookup/wago', params).then((res) => {
        if (res.error) {
          this.$store.commit('setWago', res)
          return
        }
        if (res.code && res.code.json) {
          res.code.obj = JSON.parse(res.code.json)
          res.code.json = JSON.stringify(res.code.obj, null, 2)
        }

        if (res.code && res.code.versionString) {
          this.currentVersionString = res.code.versionString
        }

        vue.$store.commit('setWago', res)
        vue.$store.commit('setPageInfo', {
          title: res.name,
          description: res.description.text,
          unlisted: (res.visibility.hidden || res.visibility.private)
        })
      })
    },
    copyEncoded () {
      var btn = document.getElementById('copy-import-button')
      btn.style['min-width'] = btn.offsetWidth + 'px'
      btn.style['width'] = btn.offsetWidth + 'px'
      var btnContent = btn.innerHTML
      try {
        document.getElementById('wago-importstring').select()
        var copied = document.execCommand('copy')
        if (copied) {
          document.querySelector('#copy-import-button:not([hidden])').focus()
          btn.innerHTML = '<strong>COPIED!</strong>'
        }
        else {
          btn.innerHTML = '<strong>ERROR</strong>'
        }
        setTimeout(() => {
          btn.innerHTML = btnContent
        }, 1200)
        return copied
      }
      catch (e) {
        console.error(e.message)
      }
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>
body { margin: 0; padding: 0}
#wago-header { margin: 8px; display: flex; flex-wrap: wrap }
#wago-header h3 { margin: 0; display: flex }
#wago-header h3 img { height: 28px }
#wago-header h3 span { margin: -4px 0 1px 4px; display: block; font-size: 80%; color: #999 }
#wago-header h3 span.title { font-size: 100%; color: #ddd }
#wago-header h3 span a { color: #999 }
#wago-header > div { flex: 1; text-align: right; align-items: flex-end }

.wago-container { margin: 0 8px 8px 8px }
#copy-import-button.md-button { border: 2px solid #c1272d; border-radius: 25px; margin: 0; display: inline-block }
#wago-importstring-container { position: absolute;}
.wago-importstring { width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:transparent;color:transparent;overflow:hidden;resize:none }
.wago-importstring::selection { color:transparent;background:transparent }
.wago-importstring::-moz-selection { color:transparent;background:transparent }
.wago-importstring::-webkit-selection { color:transparent;background:transparent }


</style>
