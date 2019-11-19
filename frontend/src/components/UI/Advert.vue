<template>
  <md-card class="wago-ad-container" :class="'wago-ad-container-' + adWidth" v-if="showAds">
    <span class="wago-advert-text">{{ $t('Advertisement') }}</span>
    <a href="https://www.patreon.com/wago" target="_blank" class="wago-advert-patreon">{{ $t('Hide Ads') }}</a>
    <div v-if="multi && adReady" class="pg-lazy" :data-gpt-parent="ad"></div>
    <div v-if="adReady" :id="ad" class="pg-lazy" :data-gpt-parent="ad"></div>
  </md-card>
</template>

<script>
// import postscribe from 'postscribe'
export default {
  name: 'advert',
  // props: { size: Array, path: String, id: String },
  props: { ad: String, multi: Boolean },
  comments: true,
  data: () => {
    return {
      screenWidth: window.innerWidth,
      adReady: false
    }
  },
  created () {
    window.addEventListener('resize', this.handleResize)
    if (!this.showAds) {
      return
    }
    // ad exchange
    // const { path, size, id } = this
    // window.googletag.cmd.push(() => {
    //   window.googletag.defineSlot(path, size, id)
    //     .addService(window.googletag.pubads())
    //   window.googletag.pubads().enableSingleRequest()
    //   window.googletag.enableServices()
    //   window.googletag.display(id)
    // })
    if (!this.$store.state.lazyAds[this.ad]) {
      this.$store.commit('showAd', this.ad)
      this.adReady = true
      this.$nextTick(() => {
        let script = document.createElement('script')
        script.setAttribute('src', '//m2d.m2.ai/pghb.wago.js')
        let container = document.getElementById(this.ad)
        container.appendChild(script)
      })
    }
    else {
      setTimeout(() => {
        this.adReady = true
      }, 100)
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    handleResize () {
      this.screenWidth = window.innerWidth
    }
  },
  computed: {
    showAds () {
      if (!this.ad) {
        return false
      }
      var isEmbed = document.getElementById('embed-body')
      var user = this.$store.state.user
      if (isEmbed || (user && user.hideAds) || this.screenWidth < this.adWidth + 32) {
        return false
      }

      return true
    },
    adWidth () {
      try {
        var w = parseInt(this.ad.match(/(\d+)/)[0])
        if (w) return w
      }
      catch (e) {
        return 0
      }
      return 0
    }
  }
}
</script>

<style>
.wago-ad-container {margin-left:0;width:auto}
.wago-ad-container iframe {height: x}
.wago-ad-container span.wago-advert-text { position: absolute; top: -2px; font-size: 10px; }
.wago-ad-container a.wago-advert-patreon { position: absolute; top: -2px; right: 18px; font-size: 10px; color: white }
.wago-ad-container div[data-gpt-parent='wago_import_desk_300x250'] > * { width: 300px; height: 250px }
.searchResult + .wago-ad-container { margin-left: 16px }
.wago-ad-container div[data-gpt-parent='wago_home_desk_728x90'] > * { width: 728px; height: 90px }
.wago-ad-container-300 { width: 332px }
#wago_import_desk_300x250 {width:300px; height:250px}
.wago-ad-container-728 { width: 760px }
#wago_home_desk_728x90 {width:728px; height:90px}
</style>
