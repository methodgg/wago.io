<template>
  <md-card v-if="enableAd && container" ref="adcontainer" :class="[
    'wago-ad-container', ad,
    frame === false ? 'no-frame' : ''
    ]">
      <span class="wago-advert-text" v-if="patreonLink">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wago" target="_blank" rel="noopener" class="wago-advert-patreon">{{ $t('Hide Ads with Patreon') }}</a></span>
      <div>
        <div :id="uid" :class="adClass + ' i-' + ad"></div>
      </div>
  </md-card>
</template>

<script>
export default {
  name: 'advert',
  props: {
    ad: String,
    forMobile: Boolean,
    fixed: String,
    patreonLink: Boolean,
    frame: {type: Boolean, default: true},
    container: {type: Boolean, default: true}
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
      adNetwork: 'playwire' // previously 'nitropay'
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('scroll', this.watchScroll)
    if (this.ad === 'trendi_video') { // video selector from paywire: ".wago-advert-text + div > #wagoVideoAd.video-ad-box"
      this.uid = 'wagoVideoAd'
      this.adClass = 'video-ad-box'
    }
    else if (this.ad === 'med_rect_atf') {
      this.uid = 'wago300x250'
      this.adClass = 'ad-box'
    }
    this.insertAd()
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
      if (!this.enableAd) {
        return
      }
      setTimeout(async () => {
        if (this.adNetwork === 'playwire') {
          if (window.tyche && this.container) {
            console.log('add', this.ad, this.uid)
            await window.tyche.addUnits([{
              selectorId: this.uid,
              type: this.ad
            }])
            tyche.displayUnits()
          }
          else if (window.tyche) {
            console.log('add', this.ad)
            await window.tyche.addUnits([{
              type: this.ad
            }])
            tyche.displayUnits()
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
  beforeDestroy: function () {
    if (this.fixFrame) {
      clearInterval(this.fixFrame)
    }
    if (this.adNetwork === 'playwire' && window.tyche && window.tyche.destroyUnits) {
      window.tyche.destroyUnits(this.ad)
    }
  },
  watch: {
    enableAd () {
      this.$nextTick(function () {
        this.insertAd()
      })
    }
  },
  computed: {
    enableAd () {
      if (!this.$store.state.advertSetup) {
        return false
      }
      else if ((this.forMobile && !this.$isMobile) || (!this.forMobile && this.$isMobile) || this.$route.path === '/admin') {
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

<style lang="scss">
.wago-ad-container {
  width:auto;
  padding:16px 4px 4px 4px;
  margin:0;
  .wago-advert-text {
    font-size: 80%;
    z-index: 1;
  }
  &.no-frame {
    background: none!important;
    border: 0!important;
    box-shadow: none!important;
    margin-top: 0!important;
  }
  &.trendi_video {
    margin: 0 0 16px 16px;
    padding: 0;
    width: 300px;
    .wago-advert-text {
      padding-left: 4px;
    }
  }
  &.med_rect_atf {
    width: 300px;
    height: 250px;
    margin: 0 0 0 16px;
    padding: 0;
  }
  &.leaderboard_btf, &.leaderboard_atf {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    .i-leaderboard_btf, .i-leaderboard_atf {
      min-height: 110px;
      & > * {
        display: block!important;
      }
    }
  }
}
.side-bar.with-stream .wago-ad-container.trendi_video {
  width: 340px;
}
</style>

