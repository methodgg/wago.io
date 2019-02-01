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
        <h3>
          <img src="../../assets/wagoio-logo.png" v-if="darkBackground"/><img src="../../assets/wagoio-logo-dark.png" v-else/> 
          <md-layout md-column><span class="title">{{ wago.name }}</span><span>View or modify at <a :href="wago.url" target="_blank">wago.io/{{ wago.slug }}</a></span></md-layout>
        </h3>
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
// global to be called from parent frame
window.setColor = (item, color) => {
  if (!color || !color.match(/^[\dABCDEF]{6}$/i)) {
    return
  }
  var css
  switch (item) {
    case 'background':
      css = `body#embed-body { background-color: #${color}!important }`
      document.body.setAttribute('update', Date.now()) // trigger background observer within vue
      break
    case 'menu':
      css = `body#embed-body #mdtOptions > .md-card, body#embed-body #mdtPulls { background-color: #${color}!important }`
      break
    case 'text1':
      css = `body#embed-body #wago-header h3 span.title, body#embed-body .md-button, body#embed-body .topaffix, body#embed-body #mdtOptions label { color: #${color}!important }`
      break
    case 'text2':
      css = `body#embed-body #wago-header h3 span, body#embed-body #wago-header h3 span a, body#embed-body .md-list-text-container > :nth-child(2):not(:last-child) { color: #${color}!important; } 
             body#embed-body .md-input-container label, body#embed-body .md-input-container.md-has-select, body#embed-body .md-select:after, body#embed-body .md-input-container input { color: #${color}!important; -webkit-text-fill-color: #${color}!important }`
      break
    default:
      return
  }
  const head = document.head
  const style = document.createElement('style')
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  head.appendChild(style)
}

export default {
  props: ['wagoID'],
  components: {
    'build-mdt': require('../UI/MDTBuilder.vue')
  },
  created: function () {
    this.fetchWago()
    window.addEventListener('scroll', this.watchScroll)
    const params = new URLSearchParams(window.location.search)
    window.setColor('background', params.get('background'))
    window.setColor('menu', params.get('menu'))
    window.setColor('text1', params.get('text1'))
    window.setColor('text2', params.get('text2'))

    this.observer = new MutationObserver(this.checkBackground)
    this.observer.observe(document.getElementById('embed-body'), {attributes: true})
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
    this.observer.disconnect()
  },
  data: function () {
    return {
      currentVersionString: '',
      darkBackground: true,
      observer: null
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
      params.embed = 1
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
    },
    checkBackground () {
      try {
        var color = getComputedStyle(document.body)['background-color']
      }
      catch (e) {
        this.darkBackground = true
        return
      }
      var r
      var g
      var b
      // calc brightness https://awik.io/determine-color-bright-dark-using-javascript/
      if (color.match(/^rgb/)) {
        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
        r = color[1]
        g = color[2]
        b = color[3]
      }
      else {
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +('0x' + color.slice(1).replace(color.length < 5 && /./g, '$&$&'))
        r = color >> 16
        g = color >> 8 & 255
        b = color & 255
      }
      var hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))
      if (hsp > 127.5) {
        this.darkBackground = false
        return
      }
      this.darkBackground = true
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
