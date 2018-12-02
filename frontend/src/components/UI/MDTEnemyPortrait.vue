<template>
  <div class="enemyPortrait" v-bind:style="{
    width: (size || 36) + 'px', 
    height: (size || 36) + 'px', 
    'border-radius': (size || 36) + 'px', 
    'background-image': 'url(https://media.wago.io/mdt/portraits-' + mapID + '.png)',
    'background-position': (-offset.x) + 'px ' + (-offset.y) + 'px'
    }"
    @click="click" @mouseover="mouseover" @mouseleave="mouseleave" @mousemove="mousemove"
  >
  </div>
</template>

<script>
export default {
  props: ['mapID', 'offset', 'size'],
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
  }
}
</script>

<!-- background-size of 3339% based on 115px per sprite and 3840px wide image -->
<style scoped>
.enemyPortrait { display: inline-block; overflow: hidden; vertical-align: middle; box-sizing: initial; background-size: 3339%; }
</style>
