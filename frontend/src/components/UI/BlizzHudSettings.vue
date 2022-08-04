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
        <template v-for="(v, k) in item.options">
          <span>{{k}}</span>
          <span>{{v}}</span>
        </template>
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
          options: this.parseOptions(options, type),
          raw: options
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
    },
    parseOptions (options, type) {
      if (!options) {
        return {}
      }
      const results = {}
      let fields = {}
      switch (type) {
        case 0: // action bar
          fields = {
            '0': this.$t('Orientation'),
            '1': this.$t('Number of Rows'),
            '2': this.$t('Number of Icons'),
            '3': this.$t('Icon Size'),
            '4': this.$t('Icon Padding'),
            '5': this.$t('Visible'),
            '6': this.$t('Hide Bar Art'),
            '7': this.$t('Snap To Side'),
            '8': this.$t('Hide Bar Scrolling'),
            '9': this.$t('Always Show Buttons'),
          }
          break
        case 1: // cast bar
          fields = {
            '0': this.$t('Bar Size'),
          }
          break
        case 2: // mini map
          fields = {
            '0': this.$t('Header Underneath'),
          }
          break
        case 3: // unit frame
          fields = {
            '0': this.$t('Hide Portrait'),
            '1': this.$t('Cast Bar Underneath'),
            '2': this.$t('Buffs On Top'),
            '3': this.$t('Use Larger Frame'),
          }
          break
      }

      options.match(/(..)/g).forEach((item) => {
        item = item.split('').map(x => x = x.charCodeAt(0) - 35)
        if (fields[item[0]]) {
          results[fields[item[0]]] = this.optionsValue(type, item[0], item[1])
        }
      })
      return results
    },

    optionsValue (type, field, value) {
      if (type === 0 && field === 0 && value === 0) {
        return this.$t('Horizontal')
      }
      else if (type === 0 && field === 0 && value === 1) {
        return this.$t('Vertical')
      }
      else if (type === 0 && field === 3) {
        return `${value * 10 + 50}%`
      }
      else if (type === 0 && field === 5 && value === 0) {
        return this.$t('Always Visible')
      }
      else if (type === 0 && field === 5 && value === 1) {
        return this.$t('Only In Combat')
      }
      else if (type === 0 && field === 5 && value === 2) {
        return this.$t('Only Out Of Combat')
      }
      else if (type === 0 && (field === 8 || field === 9) && value === 0) {
        return this.$t('False')
      }
      else if (type === 0 && (field === 8 || field === 9) && value === 1) {
        return this.$t('True')
      }
      else if (type === 3 && value === 0) {
        return this.$t('False')
      }
      else if (type === 3 && value === 1) {
        return this.$t('True')
      }

      return value
    }
  }
}

// 2 => 200%
// 1 => 190%
// 0 => 180%
// / => 170%
// . => 160%
// - => 150%
// , => 140%
// + => 130%
// * => 120%
// ) => 110%
// ( => 100%
// ' => 90%
// & => 80%
// % => 70%
// $ => 60%
// # => 50%
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