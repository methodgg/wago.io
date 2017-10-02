<template>
  <div id="loading">
    <img v-if="theme=='dark'" src="./../../assets/wago-loading-dark.gif">
    <img v-else src="./../../assets/wago-loading-light.gif">
  </div>
</template>

<script>
export default {
  computed: {
    theme () {
      return this.$store.state.theme
    }
  }
}
</script>

<style>
#loading {
  width: 100%;
  margin: 1em auto;
  text-align: center
}
</style>
