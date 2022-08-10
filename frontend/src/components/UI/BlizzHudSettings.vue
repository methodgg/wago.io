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
        const [type, id, anchor, parentAnchor, parent, xOffset, yOffset, strata, options] = row
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
          item.title = 'Unknown - Suspected hud version and # of elements included'
          item.unknown = true
        }
        else if (this.hudSettings[type] && typeof this.hudSettings[type].title === 'function') {
          item.title = this.hudSettings[type].title(id)
        }
        else if (this.hudSettings[type] && typeof this.hudSettings[type].title === 'string') {
          item.title = this.hudSettings[type].title
        }
        else {
          console.log('unknown', this.hudSettings, type)
          item.title = this.$t('Unknown Element')
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
        },
        fields: [
          {label: this.$t('Orientation'), value: (v) => [this.$t('Horizontal'), this.$t('Vertical')][v]},
          {label: this.$t('Number of Rows'), value: (v) => v},
          {label: this.$t('Number of Icons'), value: (v) => v},
          {label: this.$t('Icon Size'), value: (v) => `${v * 10 + 50}%`},
          {label: this.$t('Icon Padding'), value: (v) => v},
          {label: this.$t('Visible'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Hide Bar Art'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Snap To Side'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Hide Bar Scrolling'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Always Show Buttons'), value: (v) => this.trueOrFalse(v)}
        ]
      },
      { // 1 - cast bar
        title: this.$t('Cast Bar'),
        fields: [
          {label: this.$t('Bar Size'), value: (v) => `${v * 10 + 100}%`},
          {label: this.$t('Lock to Player Frame'), value: (v) => this.trueOrFalse(v)},
        ]
      },
      { // 2 - mini map
        title: this.$t('Mini Map'),
        fields: [
          {label: this.$t('Header Underneath'), value: (v) => this.trueOrFalse(v)},
        ]
      },
      { // 3 - unit frame
        title: (v) => {
          return [
            this.$t('Player Unit Frame'),
            this.$t('Target Unit Frame'),
            this.$t('Focus Unit Frame'),
          ][v]
        },
        fields: [
          {label: this.$t('Hide Portrait'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Cast Bar Underneath'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Buffs On Top'), value: (v) => this.trueOrFalse(v)},
          {label: this.$t('Use Larger Frame'), value: (v) => this.trueOrFalse(v)},
        ]
      },
      { // 4 - encounter bar
        title: this.$t('Encounter Bar'),
        fields: {
          // {label: this.$t('xyz'), value: (v) => this.trueOrFalse(v),
        }
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
    trueOrFalse (v) {
      return v && this.$t('True') || this.$t('False')
    },
    parseOptions (options, type) {
      if (!options) {
        return {}
      }
      const results = {}
      options.match(/(..)/g).forEach((item) => {
        item = item.split('').map(x => x = x.charCodeAt(0) - 35)
        if (this.hudSettings[type].fields[item[0]]) {
          results[this.hudSettings[type].fields[item[0]].label] = this.hudSettings[type].fields[item[0]].value(item[1])
        }
      })
      return results
    },

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