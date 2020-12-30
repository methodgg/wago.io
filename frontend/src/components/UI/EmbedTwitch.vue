<template>
    <div ref="twitchplayer"></div>
</template>

<script>
// import postscribe from 'postscribe'
export default {
  name: 'advert',
  // props: { size: Array, path: String, id: String },
  props: { channel: String },
  data: () => {
    return {
    }
  },

  mounted () {
    if (!window.Twitch) {
      console.log('load twitch')
      let script = document.createElement('script')
      script.setAttribute('src', 'https://embed.twitch.tv/embed/v1.js')
      document.querySelector('body').appendChild(script)
    }
    console.log(window.Twitch, this.$refs.twitchplayer)
    let player = new window.Twitch.Embed(this.$refs.twitchplayer, {
      width: 854,
      height: 480,
      channel: this.channel,
      muted: true
    })
    console.log(player)
  }
}
</script>
