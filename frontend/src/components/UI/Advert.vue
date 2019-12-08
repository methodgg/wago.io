<template>
  <md-card :class="['wago-ad-container', 'wago-ad-container-' + adWidth, isAnchor ? 'wago-ad-anchor' : '']" v-if="showAds">
    <span class="wago-advert-text">{{ $t('Advertisement') }}</span>
    <a href="https://www.patreon.com/wago" target="_blank" class="wago-advert-patreon">{{ $t('Hide Ads') }}</a>
    <div v-if="adReady" :id="ad" class="pg-lazy" :data-gpt-parent="ad"></div>
  </md-card>
</template>

<script>
// import postscribe from 'postscribe'
export default {
  name: 'advert',
  // props: { size: Array, path: String, id: String },
  props: { ad: String, forMobile: Boolean },
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
    if (!this.$store.state.firstAd) {
      this.$store.commit('showAd')
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
      // if (!this.$enableAds) {
      //   return false
      // }
      if (!this.ad || (this.forMobile && !this.$isMobile) || (!this.forMobile && this.$isMobile)) {
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
      switch (this.ad) {
        case 'wago_weakauras_anchor':
          return 728
        case 'wago_mobile_anchor':
          return 320
        default:
          try {
            var w = parseInt(this.ad.match(/(\d+)/)[0])
            if (w) return w
          }
          catch (e) {
            return 0
          }
          return 0
      }
    },
    isAnchor () {
      return this.ad.match(/anchor/)
    }
  }
}
</script>

<style>
.wago-ad-container {margin-left:0;width:auto;padding:16px 4px 4px 4px}
.wago-ad-container iframe {height: x} /*fixes inheritance bug*/
.wago-ad-container span.wago-advert-text { position: absolute; top: -2px; font-size: 10px; }
.wago-ad-container a.wago-advert-patreon { position: absolute; top: -2px; right: 4px; margin-right: 0!important; font-size: 10px; color: white }
.wago-ad-container div[data-gpt-parent='wago_import_desk_300x250'] > * { width: 300px; height: 250px }

.searchResult + .wago-ad-container { margin-left: 16px }
.wago-ad-container div[data-gpt-parent='wago_home_desk_728x90'] > * { width: 728px; height: 90px }
.wago-ad-container-300 { width: 308px }
#wago_import_desk_300x250 {width:300px; height:250px}
#wago_homeage_300x600, #wago_snippetpage_300x600 {width:300px; height:600px;}
#wago_import_desk_120x600 {width:120px; height:600px;}
#index .wago-ad-container-300, #index .wago-ad-container-120 {margin-left: 32px} 
#topwagos .wago-ad-container { margin-left: 4px; box-shadow: 0 1px 5px rgba(0, 0, 0, 0.6), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)}
.wago-ad-container-728 {width: 736px}
#wago_home_desk_728x90, #wago_weakauras_anchor {width:728px; height:90px}
#wago_mobile_anchor {width:320px; height:50px;}

.md-card.wago-ad-anchor {z-index: 999; position: fixed; bottom:0; margin: 0; padding:16px 4px 4px 4px; box-sizing: border-box; -webkit-backface-visibility: hidden;}
.wago-ad-anchor.wago-ad-container-728 {width: 736px; left: 50%; margin-left: -250px}
.wago-ad-anchor.wago-ad-container-320 {width: 320px!important; left: 50%; margin-left: -158px; padding: 14px 4px 0 4px }
.wago-ad-anchor + div {margin-bottom: 95px}

</style>
