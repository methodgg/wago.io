<template>
  <div :class="{'embed-player': 1, preview: preview}" v-if="stream !== 'streamspread' && visible">
      <div class="embed-player-holder">
        <div class="embed-player-stream">
          <iframe :src="`https://player.twitch.tv?channel=${stream}&amp;parent=wago.io&amp;height=300&amp;width=420&amp;muted=true`" allowfullscreen="true" scrolling="no" frameborder="0" allow="autoplay; fullscreen" title="Twitch" sandbox="allow-modals allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" width="420" height="300"></iframe>
        </div>
        <div class="embed-player-header">
          <div class="embed-player-hl-close" @click="visible=false">
            <img class="embed-player-hl-close-icon" src="./../../assets/stream-close.png">
          </div>
        </div>
        <!--<div class="embed-player-hl-promo" style="margin-top: 0px;height: 56px">
          <img class="embed-player-hl-channel-image" v-if="stream === 'sco'"src="https://media.wago.io/avatars/5e18cc1f484ae90a6d494120/b-1602585093194.png" style="margin-top:8px;margin-bottom: 8px">
          <img class="embed-player-hl-channel-image" v-else src="./../../assets/method.png" style="margin-top:8px;margin-bottom: 8px">
          <a class="embed-player-hl-link" :href="'https://twitch.tv/' + stream" target="_blank">twitch.tv/{{ stream }}</a>
        </div>-->
      </div>
  </div>
</template>

<script>
export default {
  name: 'embedstream',
  props: { stream: String, preview: Boolean },
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

<style scoped>
.embed-player iframe {height: 240px; border-radius: 2px;}
.embed-player {position: fixed; z-index: 999999; right: 8px; bottom: 8px; margin: auto!important; overflow: hidden; text-align: center!important; border-radius: 2px;}
.embed-player.preview {position: relative}
.embed-player-holder {position: relative; width: 420px; height: 240px;}
.embed-player-stream {background-color: #000000;}
.embed-player-header {display: flex; justify-content: flex-end; position: absolute; top: 0px; left: 0; width: 100%; height: auto; z-index: 1000; cursor: hand; background-color: rgba(0, 0, 0, 0); color: #ffffff;}
.embed-player-hl-close {width: 26px; cursor: pointer; height: 26px; background-color: #2A2530; margin-top: 10px; border-radius: 50%; margin-right: 20px; text-align: center; display: inline-block; opacity: 0.7; position: relative;}
.embed-player-hl-close:hover {opacity: 1}
.embed-player-hl-close-icon {width: 10px; height: auto; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);}
.embed-player-hl-promo {width: 420px; height: 70px; background: #2e2e38; margin-left: auto; margin-right: auto; border-bottom-right-radius: 5px; border-bottom-left-radius: 5px; margin-bottom: 20px; position: relative; display: flex; justify-content: space-between; align-items: center}
.embed-player-hl-channel-image {display: inline-block; float: left; width: auto; height: 40px; border-radius: 50%; margin: 8px 0 8px 15px;}
.embed-player-hl-link {color: white!important; background: #9147ff; padding: 4px 8px; margin: 0 16px; border-radius: 4px; font-weight: bold; font-size: 90%;}
</style>
