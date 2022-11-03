<template>
  <div>
    <md-whiteframe v-for="(item, index) in content" v-bind:key="index">
      <h4>{{ item.title }}</h4>
      <div class="grid" v-if="item.options">
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
      <div class="grid" v-else-if="item.unknown">
        <span>{{$t('Data')}}</span>
        <span>{{item.data}}</span>
      </div>
      <div v-else-if="item.hudVersion < 30">
        {{$t('This version is from early Dragonflight alpha and no longer supported. Importing may not work in-game.')}}
      </div>
      <div v-else-if="item.hudVersion < latestHudVersion">
        {{$t('This version is from an older Dragonflight beta and no longer supported. Importing may not work in-game.')}}
      </div>
      <div v-else-if="item.hudVersion === latestHudVersion">
        {{$t('This is the current version known to Wago.io.')}}
      </div>
      <div v-else-if="item.hudVersion > latestHudVersion">
        {{$t('This is newer than what Wago.io expects and Wago will need an update. Some config settings may be incorrect or missing.')}}
      </div>
    </md-whiteframe>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      latestHudVersion: 30.0,
      holdData: []
    }
  },
  computed: {
    content: function () {
      const content = []
      const data = JSON.parse(this.$store.state.wago.code.json).map(x => x.split(/\s/).map(y => !isNaN(parseFloat(y)) ? parseFloat(y) : y))
      data.forEach(row => {
        // https://github.com/tomrus88/BlizzardInterfaceCode/blob/master/Interface/FrameXML/EditModePresetLayouts.lua
        // https://github.com/tomrus88/BlizzardInterfaceCode/blob/master/Interface/AddOns/Blizzard_APIDocumentationGenerated/EditModeManagerDocumentation.lua
        // https://github.com/tomrus88/BlizzardInterfaceCode/blob/master/Interface/AddOns/Blizzard_APIDocumentationGenerated/EditModeManagerSharedDocumentation.lua
        console.log(row)
        const [type, id, whatsthis, anchor, parentAnchor, parent, xOffset, yOffset, strata, options] = row
        const item = {
          unknown: false,
          data: row,
          title: this.$t('Unknown Element'),
          parent: parent,
          xOffset,
          yOffset,
          strata, // not sure if this is accurate, currently value is always 1 and can't overwrite it
          anchor: this.anchorPoint(anchor),
          parentAnchor: this.anchorPoint(parentAnchor),
          options: this.parseOptions(options, type),
          raw: options
        }

        if (row.length === 2) {
          item.hudVersion = parseFloat(item.data[1] + '.' + item.data[0])
          item.title = this.$t('Blizz HUD Version [-num-]', {num: item.hudVersion})
        }
        else if (this.hudSettings[type] && typeof this.hudSettings[type].title === 'function') {
          item.title = this.hudSettings[type].title(id)
        }
        else if (this.hudSettings[type] && typeof this.hudSettings[type].title === 'string') {
          item.title = this.hudSettings[type].title
        }
        else {
          console.log('unknown', this.hudSettings, type)
          item.title = this.$t('Unknown Element [-type-]', {type})
          item.unknown = true
        }

        content.push(item)
      })
      return content
    },
    hudSettings: function () { return [
      { // 0 - action bar
        title: (id) => {
          if (id < 10) {
            return this.$t('Action Bar [-num-]', {num: id+1})
          }
          else if (id === 10) {
            return this.$t('Stance Bar')
          }
          else if (id === 11) {
            return this.$t('Pet Action Bar')
          }
          else if (id === 12) {
            return this.$t('Possess Action Bar')
          }
          else {
            return 'Unknown Action Bar'
          }
        },
        fields: [
          {label: this.$t('Orientation'), value: (v) => [this.$t('Horizontal'), this.$t('Vertical')][v]},
          {label: this.$t('Number of Rows'), value: this.intValue},
          {label: this.$t('Number of Icons'), value: this.intValue},
          {label: this.$t('Icon Size'), value: (v) => `${v * 10 + 50}%`},
          {label: this.$t('Icon Padding'), value: this.intValue},
          {label: this.$t('Visible'), value: this.boolValue},
          {label: this.$t('Hide Bar Art'), value: this.boolValue},
          {label: this.$t('Snap To Side'), value: this.boolValue},
          {label: this.$t('Hide Bar Scrolling'), value: this.boolValue},
          {label: this.$t('Always Show Buttons'), value: this.boolValue}
        ]
      },
      { // 1 - cast bar
        title: this.$t('Cast Bar'),
        fields: [
          {label: this.$t('Bar Size'), value: (v) => `${v * 10 + 100}%`},
          {label: this.$t('Lock to Player Frame'), value: this.boolValue},
        ]
      },
      { // 2 - mini map
        title: this.$t('Mini Map'),
        fields: [
          {label: this.$t('Header Underneath'), value: this.boolValue},
        ]
      },
      { // 3 - unit frame
        title: (v) => {
          return [
            this.$t('Player Unit Frame'),
            this.$t('Target Unit Frame'),
            this.$t('Focus Unit Frame'),
            this.$t('Party Unit Frames'),
            this.$t('Raid Unit Frames'),
            this.$t('Boss Unit Frames'),
            this.$t('Arena Unit Frames'),
          ][v] || 'Unknown Unit Frame ' + v
        },
        fields: [
          {label: this.$t('Hide Portrait'), value: this.boolValue},
          {label: this.$t('Cast Bar Underneath'), value: this.boolValue},
          {label: this.$t('Buffs On Top'), value: this.boolValue},
          {label: this.$t('Use Larger Frame'), value: this.boolValue},
          {label: this.$t('Use Raid-Style Party Frames'), value: this.boolValue},
          {label: this.$t('Show Party Frame Background'), value: this.boolValue},
          {label: this.$t('Use Horizontal Groups'), value: this.boolValue},
          {label: this.$t('Cast Bar On Side'), value: this.boolValue},
          {label: this.$t('Show Cast Time'), value: this.boolValue},
          {label: this.$t('View Raid Size'), value: (v) => [10, 25, 40][v]},
          {label: this.$t('Frame Width'), value: (v) => 72 + v * 2},
          {label: this.$t('Frame Height'), value: (v) => 36 + v * 2},
          {label: this.$t('Display Border'), value: this.boolValue},
          {label: this.$t('Keep Groups Together'), value: this.boolValue},
          {label: this.$t('Sort Players By'), value: (v) => [this.$t('Role'), this.$t('Group'), this.$t('Alphabetical')][v]},
          {label: this.$t('Row Size'), value: (v) => 2 + v},
        ]
      },
      { // 4 - encounter bar
        title: this.$t('Encounter Bar'),
        fields: [
          // {label: this.$t('xyz'), value: this.boolValue,
        ]
      },
      { // 5- extra abilities
        title: this.$t('Extra Abilities'),
        fields: [
          // {label: this.$t('xyz'), value: this.boolValue,
        ]
      },
      { // 6- auraFrame
        title: (v) => {
          return [
            this.$t('Buff Frame'),
            this.$t('Debuff Frame'),
          ][v] || 'Unknown Aura Frame'
        },
        fields: [
          {label: this.$t('Orientation'), value: (v) => [this.$t('Horizontal'), this.$t('Vertical')][v]},
          {label: this.$t('Icon Wrap'), value: (v) => [this.$t('Down'), this.$t('Up'), this.$t('Left'), this.$t('Right')][v]},
          {label: this.$t('Icon Direction'), value: (v) => [this.$t('Left'), this.$t('Right', this.$t('Down'), this.$t('Up'), )][v]},
          {label: this.$t('Icon Limit'), value: this.intValue},
          {label: this.$t('Icon Size'), value: (v) => `${v * 10 + 50}%`},
          {label: this.$t('Icon Padding'), value: this.intValue},
          {label: this.$t('Show Full'), value: this.boolValue},
        ]
      },
      { // 7 - talking head
        title: this.$t('Talking Head Frame'),
        fields: [
          // {label: this.$t('xyz'), value: this.boolValue,
        ]
      },
      { // 8 - chat frame
        title: this.$t('Chat Frame'), // TODO: can we have multiple chat frames? Currently no (5.22)
        fields: [
          null, // widthHundreds (added to next)
          {label: this.$t('Width'), value: this.intValue},
          null, // heightHundreds (added to next)
          {label: this.$t('Height'), value: this.intValue},

      ]
      },
      { // 9 - Leave Vehicle
        title: this.$t('Leave Vehicle Button'),
        fields: [
          // {label: this.$t('xyz'), value: this.boolValue,
        ]
      },
    ]}
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
    intValue (v) {
      return parseInt(v)
    },
    boolValue (v) {
      return v && this.$t('True') || this.$t('False')
    },
    parseOptions (options, type) {
      if (!options || (options+'').length < 2) {
        return null
      }
      let enumModValue = 0
      const results = {}
      ;(options+'').match(/(..)/g).forEach((item) => {
        item = item.split('').map(x => x = x.charCodeAt(0) - 35)
        if (!this.hudSettings[type]) {
          results[`Unknown Frame Type ${type}`] = item
        }
        else if (this.hudSettings[type].fields[item[0]]) {
          // monitor aura frame to correctly list direction and wrap based on the orientation
          if (type === 6 && item[0] === 0) {
            enumModValue = item[1] * 2
          }
          else if (type === 6 && enumModValue && (item[0] === 1 || item[0] === 2)) {
            item[1] += enumModValue
          }

          // because chat frame width/height "Hundreds" and "TensAndOnes" are separate
          if (type === 8 && (item[0] === 0 || item[0] === 2)) {
            enumModValue = item[1] * 100
            return
          }
          else if (type === 8 && enumModValue && (item[0] === 1 || item[0] === 3)) {
            item[1] += enumModValue
          }

          results[this.hudSettings[type].fields[item[0]].label] = this.hudSettings[type].fields[item[0]].value(item[1])
        }
        else {
          results[`Unknown Field`] = item
        }
      })
      return results
    },

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