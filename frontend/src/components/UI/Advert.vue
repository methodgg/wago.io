<template>
  <md-card ref="adcontainer" :class="['wago-ad-container', format === 'video' || format === 'video-only' ? 'wago-video-ad-container' : 'wago-ad-container-' + adSizes[0][0] + 'x' + adSizes[0][1], stickiedTop ? 'stickiedTop' : '', fixed ? 'fixed-' + fixed : '', spacerOnly ? 'ad-spacer' : '']" v-if="showAds">
    <div v-if="!spacerOnly">
      <span class="wago-advert-text">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wago" target="_blank" class="wago-advert-patreon">{{ $t('Hide Ads') }}</a></span>
    
      <div :key="uid">
        <div id="wagoVideoAd" v-if="format === 'video' || format === 'video-only'" class="video-ad-box"></div>
        <div :id="ad" class="ad-box"></div>
      </div>
    </div>
  </md-card>
</template>

<script>
// import postscribe from 'postscribe'
export default {
  name: 'advert',
  // props: { size: Array, path: String, id: String },
  props: { ad: String, forMobile: Boolean, fixed: String, format: String, belowTheFold: Boolean, spacerOnly: Boolean },
  comments: true,
  data: () => {
    return {
      screenWidth: window.innerWidth,
      adReady: false,
      uid: 0,
      adSizes: [[1, 1]],
      renderVisibleOnly: false,
      stickiedTop: false,
      debounce: Date.now()
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.watchScroll)

    if (!this.showAds) {
      return
    }

    // const isTest = document.getElementById('test-content')
    if (!this.$store.state.firstAd) {
      this.$store.commit('showAd')
      this.adReady = true
      this.$nextTick(() => {
        let body = document.querySelector('body')

        let streamspread = document.createElement('script')
        streamspread.setAttribute('src', 'https://adc.streamspread.com/js/fd23dd90-b346-4a09-ae30-817beb89a23a.js')
        body.appendChild(streamspread)

        let nitropay = document.createElement('script')
        nitropay.setAttribute('src', 'https://s.nitropay.com/ads-437.js')
        body.appendChild(nitropay)
        window['nitroAds'] = window['nitroAds'] || {
          createAd: function () {
            window.nitroAds.queue.push(['createAd', arguments])
          },
          queue: []
        }

        body.classList.add('ads-enabled')

        let style = document.createElement('style')
        style.innerHTML =
          `
          .hasFloatingBar:not(.enforceTop) .wago-video-ad-container {
            position: fixed;
            top: -16px;
            right: 0px;
            z-index: 9;
          }
          #topwagos .md-layout .md-layout + .md-layout{
            max-width: 428px!important;
            width: 428px!important;
            align-items: flex-start;
          }
          .wago-ad-container-300 {
            width: 408px!important;
            max-width: 408px!important;
          }
          .hasFloatingBar .wago-ad-container-300:after {
            width: 408px!important;
            max-width: 408px!important;
            position: relative!important;
            content: " ";
          }
          .wago-ad-container-300 div {
            background-color: #d61717!important;
            width: 400px!important;
            height: 300px!important;
          }
          @media (min-width: 650px) {
            #wago-floating-header {
              right: 424px;
            }
          }`
        body.appendChild(style)
      })
    }
    this.insertAds()
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.watchScroll)
  },
  methods: {
    handleResize () {
      this.screenWidth = window.innerWidth
    },
    insertAds () {
      if (this.spacerOnly || !this.showAds) {
        return
      }
      setTimeout(() => {
        if (this.format === 'video') {
          window['nitroAds'].createAd(`wagoVideoAd`, {
            format: 'video-ac',
            mediaQuery: '(min-width: 1025px)',
            demo: this.$env === 'development'
          })
        }
        else if (this.format === 'video-only') {
          window['nitroAds'].createAd(`wagoVideoAd`, {
            format: 'video-ac',
            mediaQuery: '(min-width: 1025px)',
            demo: this.$env === 'development'
          })
          return
        }
        window['nitroAds'].createAd(this.ad, {
          format: this.format || 'display',
          refreshLimit: 10,
          refreshTime: 90,
          demo: this.$env === 'development',
          refreshVisibleOnly: true,
          // renderVisibleOnly: this.renderVisibleOnly,
          sizes: this.adSizes,
          report: {
            enabled: true,
            wording: 'Report Ad',
            position: 'top-right'
          }
        })
      }, 50)
    },

    watchScroll () {
      var top = document.getElementById('topbar')
      if (top) {
        var rect = top.getBoundingClientRect()
        this.stickiedTop = !!(rect.bottom < 0)
      }
    }
  },
  mounted: function () {
    if (this.ad.match(/^wago728x90/)) {
      this.adSizes = [[728, 90]]
    }
    else if (this.ad.match(/^wago300x600/)) {
      this.adSizes = [[300, 600], [300, 250]]
    }
    else if (this.ad.match(/^wago300x250/)) {
      this.adSizes = [[300, 250]]
    }
    else if (this.ad.match(/^wago320x50/)) {
      this.adSizes = [[320, 50]]
    }
    else {
      console.log('unknown ad', this.ad)
    }
  },
  watch: {
    $route (to, from) {
      let t = Date.now()
      if (this.debounce + 1000 < t) {
        this.debounce = t
        this.uid++
        this.$nextTick(function () {
          this.insertAds()
        })
      }
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
      try {
        var w = parseInt(this.ad.match(/(\d+)/)[0])
        if (w) return w
      }
      catch (e) {
        return 0
      }
    }
  }
}
</script>

<style>
.wago-ad-container {margin-left:0;width:auto;padding:16px 4px 4px 4px}
.wago-ad-container iframe {height: x} /*fixes inheritance bug*/
.wago-ad-container span.wago-advert-text { position: absolute; top: -2px; font-size: 10px; z-index: 99}

.wago-video-ad-container { width: 408px!important; max-width: 408px!important; }

.searchResult + .wago-ad-container { margin: 16px auto; }
.wago-ad-container { min-width: 208px; align-self: flex-start; }
.wago-ad-container-300x250, .wago-ad-container-300x600 {width: 308px; min-width: 308px; max-width: 308px;}
.wago-ad-container-728x90 {width: 736px; min-width: 736px; max-width:736px;}

.wago-ad-container.fixed-bottom {position: fixed; bottom: 0; left: calc(50% - 368px); z-index: 9;}
.wago-ad-container-728x90.fixed-bottom {left: calc(50% - 368px);}
.wago-ad-container-320x50.fixed-bottom {left: calc(50% - 160px);}

.wago-ad-container.fixed-bottom + div {margin-bottom: 100px; min-height: 1px;}

#topwagos .wago-ad-container { margin-left: 4px; box-shadow: 0 1px 5px rgba(0, 0, 0, 0.6), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12)}
#wago_mobile_anchor {width:320px; height:50px;}

.md-card.wago-ad-anchor {z-index: 999; position: fixed; bottom:0; margin: 0; padding:16px 4px 4px 4px; box-sizing: border-box; -webkit-backface-visibility: hidden;}
.wago-ad-anchor.wago-ad-container-728 {width: 736px; left: 50%; margin-left: -250px}
.wago-ad-anchor.wago-ad-container-320 {width: 320px!important; left: 50%; margin-left: -158px; padding: 14px 4px 0 4px }
.wago-ad-anchor + div {margin-bottom: 95px}

.report-link {margin-top: 2px}

.video-ad-box { min-height: 256px }
.video-ad-box + .ad-box { margin-top: 24px; }

.wago-ad-container.fixed-sticky.stickiedTop {position: fixed; top: 0; right: 0; margin-top: 0}
.wago-ad-container.ad-spacer {display: none}
.wago-ad-container.stickiedTop.ad-spacer {display: block}

</style>
