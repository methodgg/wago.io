<template>
  <div id="stream-embed" class="embed-container" :class="{'twitch-embed-container': stream !== '__streamspread', 'ss-embed-container': stream === '__streamspread'}" v-if="visible && showAds">
    <div class="embedded-player" id="stream-player"></div>
    <div class="embedded-player-close" @click="closeStream()" v-if="twitchOn">
      <img class="embedded-player-close-icon" src="./../../assets/stream-close.png">
    </div>
    <div style="overflow-y: auto; height: 404px;" id="stream-chat" v-if="includeChat">
        <iframe :src="`https://www.twitch.tv/embed/${stream}/chat?darkpopout&parent=${embedParent}`" id="twitch-chat"
            height="630"
            width="350">
        </iframe>
    </div>


  </div>
</template>

<script>
import { unref } from 'vue'
let twitchPlayer

export default {
  name: 'embedstream',
  props: { stream: String, preview: Boolean },
  data: () => {
    return {
      screenWidth: window.innerWidth,
      visible: true,
      source: '',
      loadJS: null,
      twitchOn: false,
      loaded: false,
      refresh: null,
      muted: true,
      embedParent: window.location.hostname
    }
  },

  created () {
    window.addEventListener('resize', this.handleResize)
    const _this = this

    this.refresh = setInterval(function () {
      if (_this.visible && twitchPlayer && twitchPlayer.getMuted()) {
        _this.visible = false
        _this.muted = twitchPlayer.getMuted()
        setTimeout(function () {
          _this.visible = true
          _this.loadEmbed()
        }, 1000)
      }
    }, 1000*60*20)
  },
  destroyed () {
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    closeStream () {
      this.visible = false
      // this.http.post('/account/close-embed')
    },

    handleResize () {
      this.screenWidth = window.innerWidth
    },

    async loadEmbed () {
      const channel = unref(this.stream)
      const muted = unref(this.muted)

      if (!this.showAds || this.stream === '__closed' || this.stream === '__none') {
        this.visible = false
        return false
      }
      else if (this.stream === '__streamspread' && this.showAds) {
        this.loadJS = new Promise((resolve) => {
          let body = document.querySelector('body')
          let streamspread = document.createElement('script')
          streamspread.src = 'https://adc.streamspread.com/js/fd23dd90-b346-4a09-ae30-817beb89a23a.js'
          streamspread.async = true
          streamspread.onload = resolve
          body.appendChild(streamspread)
        })
        this.source = 'streamspread'
      }
      else if (!twitchPlayer) {
        this.loadJS = new Promise((resolve) => {
          let body = document.querySelector('body')
          let streamspread = document.createElement('script')
          streamspread.src = 'https://player.twitch.tv/js/embed/v1.js'
          streamspread.async = true
          streamspread.onload = resolve
          body.appendChild(streamspread)
        })
        this.source = 'twitch'
      }

      if (this.source === 'twitch' && !twitchPlayer) {
        twitchPlayer = 'pending...'
        await this.loadJS
        twitchPlayer = new window.Twitch.Player('stream-player', {
          autoplay: true,
          width: 350,
          channel,
          muted,
        });
        twitchPlayer.play()
        this.twitchOn = true
      }
    }
  },
  beforeDestroy: function () {
  },
  computed: {
    showAds () {
      if (this.$isMobile) {
        return false
      }
      var isEmbed = document.getElementById('embed-body')
      var user = this.$store.state.user
      if (isEmbed || (!Object.keys(user).length || user.hideAds) || this.screenWidth < 452) {
        return false
      }

      this.$nextTick(() => {
        this.loadEmbed()
      })
      return true
    },
    
    includeChat () {
      return this.stream.toLowerCase() === 'method'
    }
  }
}
</script>

<style>
.embed-container {width: 100%; margin: 16px 0 0 10px; text-align: center!important; border-radius: 2px; overflow: initial; position: relative;}
#twitch-chat {border-radius: 2px; border:0}
.ss-embed-container {height: 250px}
.twitch-embed-container {aspect-ratio: 16 / 9;}
.embedded-player {width: 100%; height: 100%; border-radius: 2px;}
.embedded-player iframe, .embedded-player iframe:not(.md-image) {height: inherit}
.embedded-player.preview {position: relative}
.embedded-player-close {width: 26px; height: 26px;cursor: pointer; background-color: #2A2530; border-radius: 50%; text-align: center; display: inline-block; opacity: 0.7; position: absolute; top: 8px; right: 8px}
.embedded-player-close:hover {opacity: 1}
.embedded-player-close-icon {width: 10px; height: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);}
@media (max-width: 1350px) {
  .embed-container {
    display: none!important;
  }
}
</style>
