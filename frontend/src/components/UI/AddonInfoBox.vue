<template>
  <md-layout md-row id="addon-meta">
    <template v-for="link in links">
      <md-button v-if="link.url.match(/^\/search/)" @click="doSearch(link)">{{ link.name }}</md-button>
      <md-button v-else-if="link.url.match(/^\//)" @click="$router.push(link.url)">{{ link.name }}</md-button>
      <md-button v-else :href="link.url" target="_blank" rel="noopener">{{ link.name }}</md-button>
    </template>
  </md-layout>
</template>

<script>
import CategoryImage from '../UI/CategoryImage.vue'
export default {
  props: ['addon', 'expansion', 'game'],
  components: {
    'category-image': CategoryImage
  },
  data: function () {
    return {
      addonData: {}
    }
  },
  methods: {
    doSearch (link) {      
      this.$store.commit('setSearchToggles', {
        mode: 'imports',
        game: this.game,
        expansion: this.expansion,
        type: this.addon,
      })
      if (this.expansion) {
        this.$router.push(`/search/imports/${this.game}/${this.expansion}-${this.addon}/`)
      }
      else {
        this.$router.push(`/search/imports/${this.game}/${this.addon}/`)
      }
    }
  },
  computed: {
    links: function () {
      let searchURL = `/search/type:${this.addon}`
      if (this.expansion) {
        searchURL = `/search/expansion:${this.expansion}%20type:${this.addon}`
      }
      let links = []
      switch (this.addon.toLowerCase()) {
        case 'collection':
          links.push({url: searchURL, name: this.$t('Search Collections')})
          break

        case 'blizzhud':
          links.push({url: searchURL, name: this.$t('Search BlizzHUD'), domain: 0})
          break

        case 'delvui':
          links.push({url: searchURL, name: this.$t('Search DelvUI'), domain: 1})
          links.push({url: 'https://github.com/DelvUI/DelvUI', name: this.$t('View DelvUI Website')})
          links.push({url: 'https://discord.gg/delvui', name: this.$t('Join DelvUI Discord')})
          break

        case 'elvui':
          links.push({url: searchURL, name: this.$t('Search ElvUI'), domain: 0})
          links.push({url: 'https://www.tukui.org/', name: this.$t('View ElvUI Website')})
          links.push({url: 'https://discord.gg/xFWcfgE', name: this.$t('Join ElvUI Discord')})
          break

        case 'macro':
          links.push({url: searchURL, name: this.$t('Search Macros'), domain: 0})
          links.push({url: 'https://warcraft.wiki.gg/wiki/Making_a_macro', name: this.$t('Macro guide on Warcraft Wiki')})
          break

        case 'mdt':
          links.push({url: '/dragonflight-mdt/pve/dragonflight-dungeons-s3', name: this.$t('Search MDT'), domain: 0})
          links.push({url: 'https://addons.wago.io/addons/mythic-dungeon-tools', name: this.$t('Download MDT')})
          links.push({url: 'https://discord.gg/tdxMPb3', name: this.$t('Join MDT Discord')})
          break

        case 'opie':
          links.push({url: searchURL, name: this.$t('Search OPie'), domain: 0})
          links.push({url: 'https://www.curseforge.com/wow/addons/opie', name: this.$t('Download OPie')})
          break

        case 'plater':
          links.push({url: searchURL, name: this.$t('Search Plater'), domain: 0})
          links.push({url: 'https://addons.wago.io/addons/plater-nameplates', name: this.$t('Download Plater')})
          links.push({url: 'https://discord.gg/AGSzAZX', name: this.$t('Join Plater Discord')})
          break

        case 'totalrp3':
          links.push({url: searchURL, name: this.$t('Search Total RP'), domain: 0})
          links.push({url: 'https://addons.wago.io/addons/total-rp-3', name: this.$t('Download Total RP 3')})
          links.push({url: 'https://addons.wago.io/addons/total-rp-3-extended', name: this.$t('Download Total RP 3 Extended')})
          links.push({url: 'http://discord.totalrp3.info/', name: this.$t('Join Total RP Discord')})
          break

        case 'vuhdo':
          links.push({url: searchURL, name: this.$t('Search VuhDo'), domain: 0})
          links.push({url: 'https://addons.wago.io/addons/vuhdo', name: this.$t('Download Vuhdo')})
          links.push({url: 'https://discord.gg/57en44E', name: this.$t('Join VuhDo Discord')})
          break

        case 'weakaura':
          links.push({url: searchURL, name: this.$t('Search WeakAuras'), domain: 0})
          links.push({url: 'https://addons.wago.io/addons/weakauras', name: this.$t('Download WeakAuras')})
          links.push({url: 'https://weakauras.wtf', name: this.$t('Download Companion App')})
          links.push({url: 'https://discord.gg/weakauras', name: this.$t('Join WeakAuras Discord')})
      }
      return links
    }
  },
  mounted: async function () {
    if (!this.$store.state.addons[0]) {
      var vue = this
      await this.http.get('/lookup/index').then((res) => {
        if (res.addons) {
          vue.addonReleases = JSON.parse(JSON.stringify(res.addons))
          vue.$store.commit('setAddons', vue.addonReleases)
        }
      })
    }

    if (this.$store.state.addons[0]) {
      this.$store.state.addons.forEach((addon) => {
        if (addon.addon.toLowerCase().indexOf(this.addon.toLowerCase()) >= 0 && addon.phase === 'Release') {
          this.addonData = addon
          this.addonData.version = this.addonData.version.replace(/^v/, '')
        }
      })
    }
  }
}
</script>

<style scoped>
#addon-meta {border-bottom: 1px solid #333; padding-bottom: 16px}
#addon-meta .md-button { background: #00000033; margin:8px 0 8px 16px;}
#addon-meta .md-button:hover { background: #77777733}
</style>

