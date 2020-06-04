<template>
  <md-layout md-column id="addon-meta">
    <md-whiteframe>
      <md-layout>
        <md-avatar class='square'><category-image :group="'t-' + addon"></category-image></md-avatar>
        <md-layout md-column>
          <a v-for="(link, id) in links" :href="link.url" target="_blank">{{ link.name }}</a>
        </md-layout>
      </md-layout>
    </md-whiteframe>
  </md-layout>
</template>

<script>
export default {
  props: ['addon'],
  components: {
    'category-image': require('../UI/CategoryImage.vue')
  },
  data: function () {
    return {
      addonData: {}
    }
  },
  computed: {
    links: function () {
      var links = []
      switch (this.addon.toLowerCase()) {
        case 'elvui':
          links.push({url: 'https://www.tukui.org/', name: this.$t('View Website')})
          links.push({url: 'https://discord.gg/xFWcfgE', name: this.$t('Join Discord')})
          if (this.addonData.version) {
            links.push({url: 'https://www.tukui.org/download.php?ui=elvui', name: this.$t('Latest Version [-version-]', {version: this.addonData.version})})
            links.push({url: 'https://www.tukui.org/classic-addons.php?id=2', name: this.$t('Classic Version [-version-]', {version: this.addonData.classicVersion})})
          }
          break

        case 'opie':
          links.push({url: 'https://www.curseforge.com/wow/addons/opie', name: this.$t('View on Curse')})
          break

        case 'plater':
          links.push({url: 'https://www.curseforge.com/wow/addons/plater-nameplates', name: this.$t('View on Curse')})
          links.push({url: 'https://discord.gg/AGSzAZX', name: this.$t('Join Discord')})
          break

        case 'mdt':
          links.push({url: 'https://www.method.gg/dungeontools', name: this.$t('View Website')})
          links.push({url: 'https://discord.gg/ttcM6uJ', name: this.$t('Join Discord')})
          if (this.addonData.version) {
            links.push({url: 'https://github.com/Nnoggie/MethodDungeonTools/releases', name: this.$t('Latest Version [-version-]', {version: this.addonData.version})})
          }
          break

        case 'totalrp3':
          links.push({url: 'https://www.curseforge.com/wow/addons/total-rp-3', name: this.$t('View on Curse')})
          links.push({url: 'http://discord.totalrp3.info/', name: this.$t('Join Discord')})
          break

        case 'vuhdo':
          links.push({url: 'https://www.curseforge.com/wow/addons/vuhdo', name: this.$t('View on Curse')})
          links.push({url: 'https://discord.gg/57en44E', name: this.$t('Join Discord')})
          break

        case 'weakaura':
          links.push({url: 'https://www.curseforge.com/wow/addons/weakauras-2', name: this.$t('View on Curse')})
          links.push({url: 'https://weakauras.wtf', name: this.$t('Download Companion App')})
          links.push({url: 'https://discord.gg/wa2', name: this.$t('Join Discord')})
          if (this.addonData.version) {
            links.push({url: 'https://github.com/WeakAuras/WeakAuras2/releases', name: this.$t('Latest Version [-version-]', {version: this.addonData.version})})
          }
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
        console.log(addon)
        if (addon.addon.toLowerCase().indexOf(this.addon.toLowerCase()) >= 0 && addon.phase === 'Release') {
          this.addonData = addon
          this.addonData.version = this.addonData.version.replace(/^v/, '')
        }
      })
    }
  }
}
</script>

<style>
#addon-meta .md-whiteframe { padding: 16px; margin: 16px; width:calc(100% - 16px); margin-right: 16px; flex-grow: 1; flex-basis: 0;}
#addon-meta { flex: initial; }
#addon-meta .md-avatar {margin-left: 0; margin-top: 0; width: 58px; height: 58px; border-radius:0}
#addon-meta a {color: inherit!important}
#addon-meta .md-layout .md-layout {margin-left: 16px}
</style>

