<template>
    <wago-app />
</template>

<script>
import App from './App.vue'
export default {
  name: 'wagomain',
  components: {
    'wago-app': App
  },
  computed: {
    // stream: function() {
    //   return this.$store.state.streamEmbed
    // }
  },
  created: function() {
    this.$socket.connect()
  }
}
</script>
