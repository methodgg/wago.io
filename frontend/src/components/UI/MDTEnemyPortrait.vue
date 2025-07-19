<template>
  <div class="enemyPortrait" v-bind:style="{
    width: (size || 36) + 'px', 
    height: (size || 36) + 'px', 
    'border-radius': (size || 36) + 'px', 
    'background-image': 'url(https://media.wago.io/mdt/portraits-' + mapSlug + '.png)',
    'background-position': (-offset.x) + 'px ' + (-offset.y) + 'px',
    'background-size': bgSize,
    border: inspiring ? '1px solid #30d9ff' : 'none'
    }"
    @click="click" @mouseover="mouseover" @mouseleave="mouseleave" @mousemove="mousemove"
  >
  </div>
</template>

<script>
export default {
  props: ['mapID', 'offset', 'size', 'inspiring', 'mapSlug'],
  methods: {
    click: function (e) {
      this.$emit('click', e)
    },
    mouseover: function (e) {
      this.$emit('mouseover', e)
    },
    mousemove: function (e) {
      this.$emit('mousemove', e)
    },
    mouseleave: function (e) {
      this.$emit('mouseleave', e)
    }
  },
  computed: {
    bgSize: function () {
      switch (this.mapID) {
        // 100% per x-sprites
        case 28:
          return '1500%'
        case 29:
          return '900%'
        case 30:
          return '920%'
        case 32:
          return '1300%'
        case 33:
          return '1200%'
        case 34:
          return '1600%'

        // tww
        case 31:
          return '1605%'
        case 35:
          return '1620%'
        case 110:
          return '1310%'
        case 111:
          return '905%'  
        case 112:
          return '1005%'  
        case 113:
          return '1020%'  
        case 114:
          return '1410%' 

        // tww
        case 116: // cinderbrew meadery
          return '1220%'
        case 117: // darkflame cleft
          return '1510%'
        case 118: // rookery
          return '920%'
        case 115: // priory
          return '1515%'  
        case 119: // floodgate
          return '1310%'  
        case 120: // motherlode
          return '2025%'  
        case 121: // theater of paion
          return '1705%' 
        case 122: // mechagon workshop
          return '1110%' 

        case 123: // eco dome
          return '1410%' 
        case 37: // lower tazevesh
          return '1610%'
        case 38: // upper tazevesh
          return '908%'

      // 'tww-mdt-s2-5': {slug: 'pve/the-war-within-dungeons-s2/operation-floodgate', i18n: 'warcraft:instances.1298', domain: 0, parent: 'tww-mdt-s2', mdtID: 119, types: ['MDT'], games: ['df']},
      // 'tww-mdt-s2-6': {slug: 'pve/the-war-within-dungeons-s2/the-motherlode', i18n: 'warcraft:instances.1012', domain: 0, parent: 'tww-mdt-s2', mdtID: 120, types: ['MDT'], games: ['df']},
      // 'tww-mdt-s2-7': {slug: 'pve/the-war-within-dungeons-s2/theater-of-pain', i18n: 'warcraft:instances.1187', domain: 0, mdtID: 121, parent: 'tww-mdt-s2', types: ['MDT'], games: ['df']},
      // 'tww-mdt-s2-8': {slug: 'pve/the-war-within-dungeons-s2/operation-mechagon-workshop', i18n: 'warcraft:instances.2028', domain: 0, mdtID: 122, parent: 'tww-mdt-s2', t
        

        default: // all dragonflight
          return '1800%'
          // return '3339%' // bfa
      }
    }
  }
}
</script>

<!-- background-size of 3339% based on 115px per sprite and 3840px wide image -->
<style scoped>
.enemyPortrait { display: inline-block; overflow: hidden; vertical-align: middle; box-sizing: initial; background-size: 3339%; }
</style>
