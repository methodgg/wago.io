<template>
  <div>
    <md-whiteframe v-for="(item, index) in content" v-bind:key="index">
      <h4>{{ item.title }}</h4>
      <div class="grid" v-if="!item.unknown">
        <span>{{$t('Anchor Point')}}</span>
        <span>{{item.anchor}}</span>
        <span>{{$t('Parent Frame')}}</span>
        <span>{{item.parent}}</span>
        <span>{{$t('To Parent\'s Anchor')}}</span>
        <span>{{item.parentAnchor}}</span>
        <span>{{$t('X Offset')}}</span>
        <span>{{item.xOffset}}</span>
        <span>{{$t('Y Offset')}}</span>
        <span>{{item.yOffset}}</span>
        <span>{{$t('Options')}}</span>
        <span>{{item.options}}</span>
      </div>
      <div class="grid" v-else>
        <span>{{$t('Data')}}</span>
        <span>{{item.data}}</span>
      </div>
    </md-whiteframe>
  </div>
</template>

<script>
export default {
  computed: {
    content: function () {
      const content = []
      const data = JSON.parse(this.$store.state.wago.code.json).map(x => x.split(/\s/).map(y => !isNaN(parseFloat(y)) ? parseFloat(y) : y))
      data.forEach(row => {
        // config https://github.com/tomrus88/BlizzardInterfaceCode/blob/91855106547ebda74623322cac64d46fc5474a57/Interface/AddOns/Blizzard_APIDocumentationGenerated/EditModeManagerSharedDocumentation.lua
        // and probably more useful https://github.com/tomrus88/BlizzardInterfaceCode/blob/91855106547ebda74623322cac64d46fc5474a57/Interface/FrameXML/EditModePresetLayouts.lua
        const [type, id, anchor, parentAnchor, parent, xOffset, yOffset, options] = row
        const item = {
          unknown: false,
          data: row,
          title: this.$t('Unknown Element'),
          parent: parent,
          xOffset,
          yOffset,
          anchor: this.anchorPoint(anchor),
          parentAnchor: this.anchorPoint(parentAnchor),
          options
        }

        if (row.length === 2) {
          item.title = 'Unknown - Suspected hud version and # of elements included'
          item.unknown = true
        }
        else if (type === 0 && id < 5) {
          item.title = this.$t('Action Bar [-num-]', {num: id+1})
        }
        else if (type === 0 && id === 10) {
          item.title = this.$t('Stance Bar')
        }
        else if (type === 0 && id === 11) {
          item.title = this.$t('Pet Action Bar')
        }
        else if (type === 0 && id === 12) {
          item.title = this.$t('Possess Action Bar')
        }
        else if (type === 1) {
          item.title = 'Cast Bar - Not yet implemented as of build 44895'
        }
        else if (type === 2) {
          item.title = 'Mini Map - Not yet implemented as of build 44895'
        }
        else if (type === 3 && id === 0) {
          item.title = this.$t('[-unit-] Unit Frame', {unit: this.$t('Player')})
        }
        else if (type === 3 && id === 1) {
          item.title = this.$t('[-unit-] Unit Frame', {unit: this.$t('Target')})
        }
        else if (type === 3 && id === 2) {
          item.title = this.$t('[-unit-] Unit Frame', {unit: this.$t('Focus')})
        }

        if (item.title === this.$t('Unknown Element')) {
          item.unknown = true
        }

        if (parent === 'UIParent') {
          item.parent = `UIParent (${this.$t('Screen Center')})`
        }

        content.push(item)
      })
      return content
    }
  },
  methods: {
    anchorPoint (id) {
      switch (id) {
        case 0: return this.$t('Top Left')
        case 1: return this.$t('Top Center')
        case 2: return this.$t('Top Right')
        case 3: return this.$t('Center Left')
        case 4: return this.$t('Center')
        case 5: return this.$t('Center Right')
        case 6: return this.$t('Bottom Left')
        case 7: return this.$t('Bottom Center')
        case 8: return this.$t('Bottom Right')
      }
    }
  }
}
</script>

<style scoped lang="scss">
h4 {
  margin-top: 0;
}
.md-whiteframe {
  padding: 8px;
  margin-bottom: 16px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 3fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px; 
} 
</style>