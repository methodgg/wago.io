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
          return '1200%'
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
          return '1410%'  // city of threads
        

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
