<template>
  <md-card ref="adcontainer" :class="['wago-ad-container', ad.replace(/-\d+$/, ''), format === 'video' || format === 'video-only' ? 'wago-video-ad-container' : 'wago-ad-container-' + adSizes[0][0] + 'x' + adSizes[0][1], stickiedTop ? 'stickiedTop' : '', fixed ? 'fixed-' + fixed : '', spacerOnly ? 'ad-spacer' : '']" v-if="showAds">
    <div v-if="!spacerOnly">
      <span class="wago-advert-text">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wago" target="_blank" rel="noopener" class="wago-advert-patreon">{{ $t('Hide Ads') }}</a></span>

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
      debounce: Date.now(),
      fixFrame: null,
      isTest: false,
      adNetwork: 'playwire' // previously 'nitropay'
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.watchScroll)
    if (process.env.NODE_ENV === 'development') return
    console.log('create', this.ad)

    if (!this.showAds || document.querySelector('body').id === 'embed-body') {
      return
    }
    if (this.$store.state.isTest) {
      this.adNetwork = 'playwire'
    }
    if (!this.$store.state.firstAd) {
      this.$store.commit('showAd')
      this.adReady = true
      let body = document.querySelector('body')
      body.classList.add('ads-enabled')
      console.log('ads-enable')

      this.$nextTick(() => {
        if (this.adNetwork === 'nitropay') {
          let nitropay = document.createElement('script')
          nitropay.setAttribute('src', 'https://s.nitropay.com/ads-437.js')
          nitropay.onload = this.insertAds
          body.appendChild(nitropay)
          window['nitroAds'] = window['nitroAds'] || {
            createAd: function () {
              window.nitroAds.queue.push(['createAd', arguments])
            },
            queue: []
          }
        }
        else if (this.adNetwork === 'playwire') {
          window.tyche = {
            mode: 'tyche',
            // config: '//config.playwire.com/1023264/v2/websites/71249/banner.json',
            config: '//config.playwire.com/1024383/v2/websites/72951/banner.json',
            passiveMode: true,
            onReady: this.insertAds
          }
          let playwire = document.createElement('script')
          playwire.setAttribute('src', 'https://cdn.intergient.com/pageos/pageos.js')
          body.appendChild(playwire)

          let recovery = document.createElement('script')
          recovery.setAttribute('src', 'https://btloader.com/tag?o=5150306120761344&upapi=true')
          recovery.setAttribute('async', 'true')
          body.appendChild(recovery)
        }

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
    else if (this.adNetwork === 'nitropay') {
      this.insertAds()
    }
    else if (this.adNetwork === 'playwire') {
      if (window.tyche && window.tyche.addUnits) {
        this.insertAds()
      }
      else {
        const _this = this
        let tries = 0
        function retryAd () {
          if (window.tyche && window.tyche.addUnits) {
            _this.insertAds()
          }
          else {
            tries++
            if (tries < 30) {
              setTimeout(function() {retryAd()}, 2000)
            }
          }
        }
        retryAd()
      }
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.watchScroll)
  },
  methods: {
    playwireAdType(size) {
      if (this.forMobile) {
        return 'bottom_rail'
      }
      else if (size.match(/300x250/)) {
        return 'med_rect_atf'
      }
      else if (size.match(/728x90$/)) {
        return 'leaderboard_atf'
      }
      else if (size.match(/in-article/)) {
        return 'desktop_in_article'
      }
      return ''
    },
    handleResize () {
      this.screenWidth = window.innerWidth
    },
    insertAds () {
      if (this.spacerOnly || !this.showAds) {
        return
      }
      if (this.adNetwork === 'playwire' && !this.playwireAdType(this.ad)) {
        return
      }
      setTimeout(async () => {
        if (this.adNetwork === 'nitropay') {
          if (this.format === 'video' && this.$env !== 'development') {
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
        }
        else if (this.adNetwork === 'playwire') {
          if (this.ad === 'wago300x250') {
            await window.tyche.addUnits([
              {type: 'trendi_video'},
              {type: 'desktop_in_article'},
            ])
          }
          let adType = this.playwireAdType(this.ad)
          console.log('add', this.ad, adType)
          if (adType) {
            window.tyche.addUnits([{
              selectorId: this.ad,
              type: this.playwireAdType(this.ad)
            }])
              .then(() => {
                tyche.displayUnits()
              }).catch( (e) => {
                tyche.displayUnits()
                console.log(e)
              })
          }
        }
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
    // nitropay
    if (this.ad.match(/^wago728x90/) || this.ad.match(/wago-in-article-ad-container/)) {
      this.adSizes = [[728, 90]]
    }
    else if (this.ad.match(/^wago300x600/)) {
      this.adSizes = [[300, 600], [300, 250]]
    }
    else if (this.ad.match(/^wago300x250/)) {
      this.adSizes = [[300, 250]]
    }
    else if (this.ad.match(/wago-in-article-ad-container/)) {
      this.adSizes = [[320, 50]]
    }
    else {
      console.log('unknown ad', this.ad)
    }
    this.fixFrame = setInterval(() => {
      var iframe = document.querySelector('#' + this.ad + '.ad-box iframe')
      if (!iframe) {
        return
      }
      var height = getComputedStyle(iframe).height
      if (!height || height === '150px') { // 150 is the to-spec default iframe height
        height = iframe.getAttribute('height')
        if (height) {
          iframe.style.height = parseInt(height) + 'px'
        }
      }
    }, 1000)
  },
  beforeDestroy: function () {
    if (this.fixFrame) {
      clearInterval(this.fixFrame)
    }
    if (this.adNetwork === 'playwire' && window.tyche && window.tyche.destroyUnits) {
      window.tyche.destroyUnits(this.ad)
    }
  },
  watch: {
    $route (to, from) {
      if (this.adNetwork === 'nitropay') {
        let t = Date.now()
        if (this.debounce + 1000 < t) {
          this.debounce = t
          this.uid++
          this.$nextTick(function () {
            this.insertAds()
          })
        }
      }
    }
  },
  computed: {
    showAds () {
      // if (!this.$enableAds) {
      //   return false
      // }
      if (!this.ad || (this.forMobile && !this.$isMobile) || (!this.forMobile && this.$isMobile) || this.$route.path === '/admin') {
        return false
      }
      var isEmbed = document.getElementById('embed-body')
      var user = this.$store.state.user
      if (isEmbed || (!Object.keys(user).length || user.hideAds) || this.screenWidth < this.adWidth + 32) {
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
.wago-ad-container.wago-video-ad-container { min-width: 208px; align-self: flex-start; margin-left: 0; }
.wago-ad-container-300x250, .wago-ad-container-300x600 {width: 308px; min-width: 308px; max-width: 308px;}
.wago-ad-container-728x90 {width: 736px; min-width: 760px; max-width:760px;}
#searchResults .wago-ad-container-728x90 {margin: 16px}

.wago-ad-container.fixed-bottom {position: fixed; bottom: 0; left: calc(50% - 368px); z-index: 9;}
.wago-ad-container-728x90.fixed-bottom {left: calc(50% - 380px);}
.wago-ad-container-320x50.fixed-bottom {left: calc(50% - 160px);}

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
