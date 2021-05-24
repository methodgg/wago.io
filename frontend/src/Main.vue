<template>
  <div>
    <wago-app />
    <advert ad="wago320x50" :forMobile="true" fixed="bottom" />
    <stream-embed v-if="stream" :stream="stream" />
  </div>
</template>

<script>
import App from './App.vue'
import StreamEmbed from './components/UI/StreamEmbed.vue'
export default {
  name: 'wagomain',
  components: {
    'wago-app': App,
    'stream-embed': StreamEmbed
  },
  computed: {
    stream: function() {
      return this.$store.state.streamEmbed
    }
  },
  created: function() {
    this.$socket.connect()
  }
}
</script>
