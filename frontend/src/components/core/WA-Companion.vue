<template>
  <div>
    <md-card>
      <p>{{ $t('Wago supports the WeakAuras Companion desktop app') }}</p>
      <p>{{ $t('This app acts as a bridge between Wago and your in-game addon, and allows you to keep your imports up to date as authors update their auras') }}</p>
      <p>This page is a placeholder why are you even here?</p>
    </md-card>
  </div>
</template>

<script>
export default {
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'WeakAuras Companion',
      description: 'The Companion is a cross-platform (Windows/macOS/Linux) application built to provide the missing link between Wago and the WeakAuras World of Warcraft addon.',
      image: false,
      unlisted: false
    })
  }
}
</script>

<style scoped>
</style>
