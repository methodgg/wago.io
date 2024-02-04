<template>
  <md-card v-if="enableAd && container" ref="adcontainer" :class="[
    advertBlocked ? 'wago-recovery-container' : 'wago-ad-container', ad,
    frame === false ? 'no-frame' : '',
    ad.match(/streambuff/) && !$store.state.streambuffVideo ? 'streambuff-no' : '',
  ]">
    <template v-if="ad=='embed-asteri'">
      <div asterilivestream_profile="91_72" asterilivestream_width="300" asterilivestream_height="250"></div>
    </template>
    <template v-else>
      <span class="wago-advert-text" v-if="patreonLink && !advertBlocked">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wagoio" target="_blank" rel="noopener" class="wago-advert-patreon">{{ $t('Hide Ads with Patreon') }}</a></span>
      <div>
        <div :id="ad" :class="adClass + ' i-' + ad">
          <div class="recovery" v-if="advertBlocked && !ad.match(/streambuff/)">
            <template v-if="ad.match(/leaderboard/)">
              <h3>{{ $t('Ad blocker detected') }} - {{ $t('This site is supported by advertising') }}</h3>
            </template>
            <template v-else>              
              <h3>{{ $t('Ad blocker detected') }}<br>{{ $t('This site is supported by advertising') }}</h3>
            </template>
            <p v-html="$t('Please consider adding Wago.io to your blocker allow-list or joining Patreon').replace(/Patreon/, '<a href=\'https://www.patreon.com/wagoio\' target=\'_blank\' rel=\'noopener\'>Patreon</a>')"></p>
          </div>
        </div>
      </div>
    </template>
  </md-card>
</template>

<script>
export default {
  name: 'advert',
  props: {
    ad: String,
    fixed: String,
    patreonLink: Boolean,
    frame: {type: Boolean, default: true},
    container: {type: Boolean, default: true},
    float: {type: String, default: 'auto'}
  },
  comments: true,
  data: () => {
    return {
      screenWidth: window.innerWidth,
      adReady: false,
      uid: 'ad-'+(Math.random() + 1).toString(36).substring(7),
      adSizes: [[1, 1]],
      renderVisibleOnly: false,
      stickiedTop: false,
      debounce: Date.now(),
      fixFrame: null,
      isTest: false,
      adClass: '',
      adNetwork: 'nitropay', // previously 'playwire',
      timeout: null,
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.watchScroll)
    this.insertAd()
    if (this.ad.match(/asteri/)) {
      setTimeout(() => {
        const asteriScript = document.createElement('script')
        asteriScript.setAttribute('src', 'https://asteriresearch.com/livestream-latest.min.js')      
        document.querySelector('body').appendChild(asteriScript)
      }, 1000)
      return
    }
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('scroll', this.watchScroll)
  },
  methods: {
    handleResize () {
      this.screenWidth = window.innerWidth
    },
    insertAd () {
      if (!this.enableAd || this.timeout) {
        return
      }
      if (this.ad.match(/streambuff|asteri/)) {
        return // handled elsewhere
      }
      this.timeout = setTimeout(async () => {
        if (!window.nitroAds) {
          return
        }
        else if (this.adNetwork === 'nitropay' && this.ad.match(/video/)) {
          this.nitroAd = await window.nitroAds.createAd(this.ad, {
            format: 'video-nc',
            mediaQuery: '(min-width: 900px)',
            video: {
              float: this.float,
              hidePlaylist: true
            },            
            report: {
              enabled: true,
              wording: 'Report Ad',
              position: 'top-right'
            }
          })
        }
        else if (this.adNetwork === 'nitropay' && this.ad.match(/mobile-anchor/)) {
          this.nitroAd = await window.nitroAds.createAd(this.ad, {
            demo: process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/),
            refreshLimit: 0,
            refreshTime: 30,
            format: 'anchor',
            anchor: 'bottom',
            anchorPersistClose: false,
            renderVisibleOnly: false,
            refreshVisibleOnly: true,
            sizes: this.nitroPaySizes,
            mediaQuery: '(max-width: 1024px)',
            report: {
              enabled: true,
              wording: 'Report Ad',
              position: 'bottom-right'
            }
          })
        }
        else if (this.adNetwork === 'nitropay' && this.ad.match(/mobile/)) {
          this.nitroAd = await window.nitroAds.createAd(this.ad, {
            demo: process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/),
            refreshLimit: 0,
            refreshTime: 30,
            renderVisibleOnly: true,
            refreshVisibleOnly: true,
            sizes: this.nitroPaySizes,
            mediaQuery: '(min-width: 768px) and (max-width: 1024px), (min-width: 320px) and (max-width: 767px)',
            report: {
              enabled: true,
              wording: 'Report Ad',
              position: 'top-right'
            }
          })
        }
        else if (this.adNetwork === 'nitropay' && this.ad.match(/search/)) {
          this.nitroAd = await window.nitroAds.createAd(this.ad, {
            demo: process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/),
            refreshLimit: 0,
            refreshTime: 30,
            renderVisibleOnly: true,
            refreshVisibleOnly: true,
            sizes: this.nitroPaySizes,
            report: {
              enabled: true,
              wording: 'Report Ad',
              position: 'top-right'
            }
          })
        }
        else if (this.adNetwork === 'nitropay' && !this.ad.match(/asteri/)) {
          this.nitroAd = await window.nitroAds.createAd(this.ad, {
            demo: process.env.NODE_ENV === 'development' || window.location.hostname.match(/test/),
            refreshLimit: 0,
            refreshTime: 30,
            renderVisibleOnly: false,
            refreshVisibleOnly: true,
            sizes: this.nitroPaySizes,
            mediaQuery: '(min-width: 1025px)',
            report: {
              enabled: true,
              wording: 'Report Ad',
              position: 'top-right'
            }
          })
        }
        // console.log('inserted ad', this.ad, this.nitroAd, (this.nitroAd ? this.nitroAd.onNavigate : undefined))
        this.timeout = undefined
        this.refreshId++
        // else if (this.adNetwork === 'playwire') {
        //   if (window.tyche && this.container) {
        //     await window.tyche.addUnits([{
        //       selectorId: this.uid,
        //       type: this.ad
        //     }])
        //     tyche.displayUnits()
        //   }
        //   else if (window.tyche) {
        //     console.log('add', this.ad)
        //     await window.tyche.addUnits([{
        //       type: this.ad
        //     }])
        //     tyche.displayUnits()
        //   }
        // }
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
  beforeDestroy: function () {
    if (this.fixFrame) {
      clearInterval(this.fixFrame)
    }
    if (this.adNetwork === 'playwire' && window.tyche && window.tyche.destroyUnits) {
      window.tyche.destroyUnits(this.ad)
    }
  },
  watch: {
    enableAd (t) {
      if (t) {
        this.$nextTick(function () {
          this.insertAd()
        })
      }
    },
    $route (to, from) {
      if (!from.matched.length || !to.matched.length || (to.matched[0].path === from.matched[0].path && to.matched[0].path === '/:wagoID')) {
        return
      }
      if (this.enableAd && this.nitroAd && this.nitroAd.onNavigate) {
        this.$nextTick(function () {
          // if (!this.ad.match(/video/)) {
            this.nitroAd.onNavigate()
          // }
        })
      }
    }
  },
  computed: {
    enableAd () {
      if ((!this.$store.state.advertSetup && !this.advertBlocked) || !this.$route) {
        return false
      }
      else if (this.advertBlocked && this.ad.match(/video-sidebar|anchor/)) {
        return false
      }
      else if ((this.ad.match(/mobile/) && !this.$isMobile) || (!this.ad.match(/mobile/) && this.$isMobile) || this.$route.path === '/admin') {
        return false
      }      
      var isEmbed = document.getElementById('embed-body')
      var user = this.$store.state.user
      if (isEmbed || (!Object.keys(user).length || user.hideAds) || this.screenWidth < this.adWidth + 32) {
        return false
      }

      return true
    },
    advertBlocked () {
      return this.$store.state.advertBlocked
    },
    adWidth () {
      try {
        var w = parseInt(this.ad.match(/(\d+)/)[0])
        if (w) return w
      }
      catch (e) {
        return 0
      }
    },
    nitroPaySizes () {
      if (this.ad.match(/mobile/)) {
        return [
          [320, 50],
        ]
      }
      else if (this.ad.match(/search/)) {
        return [
          [728, 90],
        ]
      }
      else if (this.ad.match(/leaderboard-bottom/)) {
        return [
          [728, 90],
          [970, 90],
          [970, 250],
        ]
      }
      else if (this.ad.match(/leaderboard/)) {
        return [
          [728, 90],
          [970, 90],
          // [970, 250],
        ]
      }
      else if (this.ad.match(/rectangle/)) {
        return [
          [300, 250],
          [336, 280],
        ]
      }
      else {
        return []
      }
    }
  }
}
</script>

<style lang="scss">
.wago-ad-container, .wago-recovery-container {
  width: auto;
  padding: 16px 4px 4px 4px;
  display: flex!important;
  .wago-advert-text {
    font-size: 80%;
    z-index: 9;
  }
  &.no-frame {
    background: none!important;
    border: 0!important;
    box-shadow: none!important;
    margin-top: 0!important;
    margin-bottom: 0!important;
  }
  &.video-sidebar, &.embed-streambuff, &.embed-asteri {
    margin: 0 0 16px 10px;
    padding: 0;
    width: 340px;
    z-index: inherit;
    .wago-advert-text {
      padding-left: 4px;
    }
  }
  &.video-sidebar.forced-float {
    height: 0;
  }
  &.streambuff-no {
    background: none;
    border: 0;
    box-shadow: none
  }
  &.rectangle-sidebar {
    width: 340px;
    margin: 0 0 16px 10px;
    padding: 8px 0 12px;
    .wago-advert-text {
      margin: 0 20px;
    }
  }
  &.leaderboard-top, &.leaderboard-bottom {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .i-leaderboard-top, .i-leaderboard-bottom {
      min-height: 110px;
      min-width: 720px;
      & > * {
        display: block!important;
      }
    }
  }
  .recovery {
    text-align: center;
    padding: 8px;
    line-height: 28px;
    background: #333;
    a {
      color: white!important;
      font-weight: bold;
    }
  }
}
.side-bar.with-stream .wago-ad-container.video-sidebar {
  width: 340px;
}
#video-sidebar {
  min-height: 191px;
  margin-top: 10px;
}
</style>

