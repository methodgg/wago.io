<template>
  <div id="doc">
    <md-card>
      <formatted-text :enableLinks="true" :text="{format: 'markdown', text: doc, html: true}"></formatted-text>
    </md-card>
  </div>
</template>

<script>
import FormattedText from '../UI/FormattedText.vue'
import SecurityNotice from '../docs/SecurityNotice-2026-02.md'
export default {
  components: {
    'formatted-text': FormattedText
  },
  props: ['file'],
  computed: {
    doc: function () {
      if (this.file === 'SecurityNotice-2026-02') {
        return SecurityNotice
      }
      return ''
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: this.file,
      image: false,
      unlisted: false
    })
  }
}
</script>

<style lang="scss" scoped>
#doc {
  h2 {    
    margin: 16px 0 0;
    padding: 16px 0;
    font-size: 200%;
  }
  h3 {
    font-size: 150%;
  }
  hr {
    margin: 16px 0;
  }
}
</style>