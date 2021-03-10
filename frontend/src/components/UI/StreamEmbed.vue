<template>
  <div id="embed-player" v-if="stream !== 'streamspread' && visible">
    <div id="embed-player-player">
      <div id="embed-player-holder">
        <div id="embed-player-stream">
          <iframe :src="`https://player.twitch.tv?channel=${stream}&amp;parent=wago.io&amp;height=240&amp;width=420&amp;muted=true`" allowfullscreen="true" scrolling="no" frameborder="0" allow="autoplay; fullscreen" title="Twitch" sandbox="allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" width="420" height="240"></iframe>
        </div>
        <div id="embed-player-header">
          <div id="embed-player-hl-close" @click="visible=false">
            <img id="embed-player-hl-close-icon" src="./../../assets/stream-close.png">
          </div>
        </div>
        <div id="embed-player-watch-on-twitch">Watch on Twitch.tv</div>
        <div id="embed-player-hl-promo" style="margin-top: 0px;height: 56px">
          <img id="embed-player-hl-channel-image" src="./../../assets/method.png" style="margin-top:8px;margin-bottom: 8px">
          <a id="embed-player-hl-watermark-holder" href="https://twitch.com" style="margin-right: 20px;margin-top: 8px;padding-left: 20px">
            <img id="embed-player-hl-watermark" src="./../../assets/twitch.svg" style="height: 30px; margin-top: 5px">
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'embedstream',
  props: { stream: String },
  data: () => {
    return {
      visible: true
    }
  },

  created () {
    if (this.stream === 'streamspread') {      
      let body = document.querySelector('body')
      let streamspread = document.createElement('script')
      streamspread.setAttribute('src', 'https://adc.streamspread.com/js/fd23dd90-b346-4a09-ae30-817beb89a23a.js')
      body.appendChild(streamspread)
    }
  },
  destroyed () {
  },
  methods: {
  },
  beforeDestroy: function () {
  },
  computed: {
  }
}
</script>

<style>
#embed-player {position: fixed; z-index: 999999; right: 8px; bottom: 8px; margin: auto!important; overflow: hidden; text-align: center!important; border-radius: 5px;}
#embed-player-holder {position: relative; width: 420px; height: 240px;}
#embed-player-stream {background-color: #000000;}
#embed-player-header {display: flex; justify-content: flex-end; position: absolute; top: 0px; left: 0; width: 100%; height: auto; z-index: 1000; cursor: hand; background-color: rgba(0, 0, 0, 0); color: #ffffff;}
#embed-player-hl-close {width: 26px; cursor: pointer; height: 26px; background-color: #2A2530; margin-top: 10px; border-radius: 50%; margin-right: 20px; text-align: center; display: inline-block; opacity: 0.7; position: relative;}
#embed-player-hl-close:hover {opacity: 1}
#embed-player-hl-close-icon {width: 10px; height: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);}
#embed-player-watch-on-twitch {opacity: 0; position: absolute; top: 84px; left: 0; width: 100%; height: 76px; cursor: pointer; cursor: hand; background-color: rgba(0, 0, 0, 0.8); color: #ffffff; line-height: 76px; font-size: 24px;}
#embed-player-watch-on-twitch:hover {opacity: 1}
#embed-player-hl-promo {width: 420px; height: 70px; background: #2e2e38; margin-left: auto; margin-right: auto; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; margin-bottom: 20px; position: relative;}
#embed-player-hl-channel-image {display: inline-block; float: left; width: auto; height: 40px; border-radius: 50%; margin: 8px 0 8px 15px;}
#embed-player-hl-watermark-holder {height: 40px; background-color: transparent; float: right; margin-right: 20px; margin-top: 8px; margin-bottom: 15px; padding-left: 20px; border-left: 2px solid #1c1c22;}
</style>
