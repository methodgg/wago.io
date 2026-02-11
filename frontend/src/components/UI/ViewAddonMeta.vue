<template>
    <md-layout md-row id="addon-meta">
        <md-button @click="doSearch()">{{ $t('Search [-addon-] Imports', {addon: addon.name}) }}</md-button>
        <template v-for="link in (addon.links ?? [])">
            <md-button v-if="link.url.match(/^\//)" @click="$router.push(link.url)">{{ link.name }}</md-button>
            <md-button v-else :href="link.url" target="_blank" rel="noopener">{{ link.name }}</md-button>
        </template>
    </md-layout>
</template>

<script>
import CategoryImage from '../UI/CategoryImage.vue'
export default {
  props: ['addon'],
  components: {
    'category-image': CategoryImage
  },
  methods: {
    doSearch () {      
      this.$store.commit('setSearchToggles', {
        mode: 'imports',
        game: 'wow',
        expansion: null,
        type: this.addon.slug,
      })
      this.$router.push(`/search/imports/wow/${this.addon.slug}/`)
    }
  },
}
</script>

<style scoped>
#addon-meta {border-bottom: 1px solid #333; padding-bottom: 16px}
#addon-meta .md-button { background: #00000033; margin:8px 0 8px 16px;}
#addon-meta .md-button:hover { background: #77777733}
</style>

