<template>
  <div id="build-mdt">
    <div class="flex-container" v-if="mdtDungeonTable.dungeonSubLevels">
      <div class="flex-col flex-left">
        <md-input-container>
          <label for="subMap">{{ "Map" }}</label>
          <md-select name="subMap" id="subMap" v-model="subMapID">
            <template v-for="(name, id) in mdtDungeonTable.dungeonSubLevels[mapID]">
              <md-option :value="id">{{ name }}</md-option>
            </template>
          </md-select>
        </md-input-container>
      </div>
      <div class="flex-col flex-right"> 
        <md-button @click="exportChanges"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button v-if="canEdit" @click="saveChanges"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
      </div>
    </div>

    <md-layout md-row>
      <md-layout style="width:65%; height:768px" md-vertical-align="start">
        <div id="builder" ref="canvas" width="1024" height="768">
          <v-stage ref="mdtStage" id="mdtStage" :config="konvaStageConfig" @scroll.passive="zoomStage">
            <slot>a</slot> <!-- sometimes "<div>undefined</div>" gets spammed as part of the Vue-Konvas stage, not sure why; I think it needs a default slot - can this help me track it down? -->
            <v-layer ref="mdtMap" v-if="mdtDungeonTable.dungeonSubLevels">
              <slot>b</slot>
              <template v-if="mapTiles.length" v-for="(tile, i) in mapTiles">
                <slot>c</slot>
                <v-image :config="tile" />
              </template>
              <template v-for="(creature, i) in mdtDungeonTable.dungeonEnemies[mapID]">
                <slot>d</slot>
                <template v-for="(clone, j) in creature.clones">
                  <slot>e</slot>
                  <v-circle v-if="(!clone.sublevel || clone.sublevel === subMapID + 1) && (!clone.teeming || (clone.teeming && isTeemingSelected()))" @click="selectCreature(creature, clone, j)" @mouseover="setHover(creature, clone, j)" @mouseleave="setHover()" :config="{
                      x: clone.x * 1.19777777,
                      y: clone.y * -1.19777777,
                      radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fill: (hoverGroup === determineGroupID(creature, clone, j)) ? '#C1272D' : ((selectedGroup === determineGroupID(creature, clone, j)) ? '#27C12D' : '#212121')
                    }"
                  />
                </template>
              </template>
            </v-layer>
          </v-stage>
        </div>
      </md-layout>
      <md-layout style="width:35%" md-vertical-align="start" v-if="mdtDungeonTable.dungeonSubLevels">
        <md-card class="mdtOptions">
          <md-card-area>
            <div class="inlineContainer">
              <template v-for="(affixID, k) in selectedAffixes">
                <span v-html="displayAffix(affixID)" class="affix"></span>
              </template>
              <md-button class="md-raised md-accent" @click="toggleAffixSelection" id="changeAffixesBtn">{{ $t("Change Affixes") }}</md-button>
            </div>
          </md-card-area>

          <md-list class="custom-list md-triple-line md-dense" id="mdtPulls">
            <template v-for="pull in tableData.value.pulls.length">
              <md-list-item @click="selectPull(pull)">
                <div class="md-list-text-container">
                  <span>Pull {{ pull }}</span>
                  <span v-html="pullGroupList(pull -1)"></span>
                  <span v-html="pullEnemyList(pull - 1)"></span>
                  <md-progress :md-progress="pullPercent(pull - 1, true)"></md-progress>
                </div>
              </md-list-item>
            </template>
          </md-list>

          <md-sidenav class="md-right" ref="affixSelection">
            <md-list class="md-double-line md-dense" id="selectAffixWeek">
              <template v-for="(week, k) in mdtDungeonTable.affixWeeks">
                <md-list-item @click="setAffixWeek(week)">
                  <div class="affixWeek">
                    <template v-for="affixID in week">
                      <span v-html="displayAffix(affixID)" class="affix"></span>             
                    </template>   
                  </div>            
                  <span class="affixMeta">{{ $t("Week [-num-]", {num: k + 1 }) }}</span>
                </md-list-item>
              </template>
            </md-list>
          </md-sidenav>
        </md-card>
      </md-layout>
    </md-layout>
    <export-modal :json="tableString" :type="wago.type" :showExport="showExport" :wagoID="wago._id" @hideExport="hideExport"></export-modal>
  </div>
</template>

<script>
export default {
  name: 'build-mdt',
  data: function () {
    return {
      tableString: this.$store.state.wago.code.json,
      tableData: JSON.parse(this.$store.state.wago.code.json),
      showExport: false,
      mapID: 0,
      subMapID: 0,
      mdtDungeonTable: this.$store.state.MDTTable,
      mapTiles: [],
      konvaStageConfig: {width: 1024, height: 768},
      tile: {},
      hoverGroup: -1, // which group is being moused-over
      hoverText: '',
      selectedGroup: -1, // which group is selected
      selectedAffixes: [],
      dungeonAffixes: {
        1: { name: 'Overflowing', icon: 'inv_misc_volatilewater' },
        2: { name: 'Skittish', icon: 'Spell_Magic_LesserInvisibilty' },
        3: { name: 'Volcanic', icon: 'spell_Shaman_Lavasurge' },
        4: { name: 'Necrotic', icon: 'Spell_Deathknight_Necroticplague' },
        5: { name: 'Teeming', icon: 'Spell_Nature_MassTeleport' },
        6: { name: 'Raging', icon: 'Ability_Warrior_FocusedRage' },
        7: { name: 'Bolstering', icon: 'Ability_Warrior_BattleShout' },
        8: { name: 'Sanguine', icon: 'Spell_Shadow_BloodBoil' },
        9: { name: 'Tyrannical', icon: 'Achievement_Boss_Archaedas' },
        10: { name: 'Fortified', icon: 'ability_toughness' },
        11: { name: 'Bursting', icon: 'Ability_IronMaidens_WhirlofBlood' },
        12: { name: 'Grievous', icon: 'Ability_BackStab' },
        13: { name: 'Explosive', icon: 'Spell_Fire_FelFlameRing_RED' },
        14: { name: 'Quaking', icon: 'Spell_Nature_Earthquake' },
        15: { name: 'Relentless', icon: 'INV_Chest_Plate04' },
        16: { name: 'Infested', icon: 'Achievement_Nazmir_Boss_Ghuun' },
        117: { name: 'Reaping', icon: 'Ability_Racial_EmbraceOfTheLoa_Bwonsomdi' }
      },
      currentPull: 0
    }
  },
  created: function () {
    if (!this.mdtDungeonTable || !this.mdtDungeonTable.affixWeeks) {
      this.http.get('/data/mdtDungeonTable').then((res) => {
        if (res && res._id === 'mdtDungeonTable') {
          this.mdtDungeonTable = res.value
          this.$store.commit('saveMDT', this.mdtDungeonTable)
          this.selectedAffixes = this.mdtDungeonTable.affixWeeks[this.tableData.week - 1]
          this.setupStage()
        }
      })
    }
    else {
      this.selectedAffixes = this.mdtDungeonTable.affixWeeks[this.tableData.week - 1]
      this.setupStage()
    }
  },
  watch: {
    subMapID: function (val) {
      this.setMap(val)
    }
  },
  components: {
    'export-modal': require('./ExportJSON.vue')
  },
  methods: {
    setupStage () {
      this.setMap(this.subMapID)

      var vue = this
      vue.$nextTick().then(function () {
        vue.$refs.mdtStage.getStage().draggable(true)

        // setup zoom
        vue.$refs.canvas.addEventListener('wheel', (evt) => {
          let scaleBy = 1.2
          var stage = vue.$refs.mdtStage.getStage()
          if (evt.target.nodeName !== 'CANVAS') {
            return false
          }
          evt.preventDefault()
          var oldScale = stage.scaleX()

          var mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          }

          var newScale = Math.max(1, evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy)
          stage.scale({ x: newScale, y: newScale })

          var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
          }
          stage.position(newPos)
          stage.batchDraw()
        })
      })
    },
    setMap (subMap, loaded) {
      // build map
      this.mapID = this.tableData.value.currentDungeonIdx - 1
      var dir = this.mdtDungeonTable.dungeonMaps[this.mapID][0]
      var map = this.mdtDungeonTable.dungeonMaps[this.mapID][subMap + 1]

      // setup map background
      this.mapTiles = []
      var loadedImages = 0
      for (let i = 1; i <= 12; i++) {
        var row = (i - 1) % 4
        var col = Math.floor((i - 1) / 4)
        var image = new Image()
        image.src = `https://media.wago.io/wow-ui-textures/Worldmap/${dir}/${map}${i}.PNG` // require('../../assets/gameMaps/' + dir + '/' + map + i + '.png')
        if (!loaded) {
          image.onload = () => {
            if (++loadedImages >= 12) {
              this.setMap(subMap, true)
            }
          }
        }
        this.mapTiles.push({image, x: row * 256, y: col * 256})
      }
    },

    setHover (creature, clone, cloneIndex) {
      if (creature) {
        this.hoverGroup = this.determineGroupID(creature, clone, cloneIndex)
        this.hoverText = creature.name
      }
      else {
        this.hoverGroup = -1
        this.hoverText = ''
      }
    },

    selectCreature (creature, clone, cloneIndex) {
      this.selectedGroup = this.determineGroupID(creature, clone, cloneIndex)
    },

    determineGroupID (creature, clone, cloneIndex) {
      if (clone.g) {
        return clone.g
      }
      return creature.id + '.' + cloneIndex
    },

    displayAffix (affixID) {
      if (!this.dungeonAffixes || !this.dungeonAffixes[affixID]) {
        return ''
      }
      return '<img src="//media.wago.io/wow-ui-textures/ICONS/' + this.dungeonAffixes[affixID].icon + '.PNG" /> ' + this.dungeonAffixes[affixID].name
    },

    toggleAffixSelection () {
      this.$refs.affixSelection.toggle()
    },

    setAffixWeek (week) {
      this.selectedAffixes = week
      this.tableData.week = week + 1
      this.$refs.affixSelection.close()
    },

    isTeemingSelected () {
      return this.selectedAffixes.indexOf(5) >= 0
    },

    selectPull (pullIndex) {
      this.currentPull = pullIndex
    },

    pullEnemyList (pullIndex, returnObj) {
      var enemies = this.mdtDungeonTable.dungeonEnemies[this.mapID]
      var targets = {_groups: []}
      var isTeeming = this.isTeemingSelected()
      this.tableData.value.pulls[pullIndex].forEach(function (clones, enemyIndex) {
        if (!clones || !enemies[enemyIndex].clones) {
          return
        }
        clones.forEach(function (cloneIndex) {
          cloneIndex--
          if (!enemies[enemyIndex].clones[cloneIndex] || (enemies[enemyIndex].clones[cloneIndex].teeming && !isTeeming)) {
            return
          }

          targets[enemies[enemyIndex].name] = targets[enemies[enemyIndex].name] || { count: 0, forces: enemies[enemyIndex].count }
          targets[enemies[enemyIndex].name].count++
          if (targets._groups.indexOf(enemies[enemyIndex].clones[cloneIndex].g) === -1) {
            targets._groups.push(enemies[enemyIndex].clones[cloneIndex].g)
          }
        })
      })
      if (returnObj) {
        return targets
      }
      var str = ''
      for (let name in targets) {
        if (!targets.hasOwnProperty(name) || name === '_groups') continue
        str = str + targets[name].count + 'x ' + name + ', '
      }
      return str.substring(0, str.length - 2)
    },

    pullGroupList (pullIndex) {
      var targets = this.pullEnemyList(pullIndex, true)
      return this.$t('[-groups-] Groups', {groups: targets._groups.length}) + '; ' + this.pullPercent(pullIndex) + '%'
    },

    pullPercent (pullIndex, runningTotal) {
      var required = this.mdtDungeonTable.dungeonTotalCount[this.mapID]
      var max
      if (required.teemingEnabled && this.isTeemingSelected()) {
        max = required.teeming
      }
      else {
        max = required.normal
      }

      var targets = this.pullEnemyList(pullIndex, true)
      var current = 0
      for (let key in targets) {
        if (!targets.hasOwnProperty(key) || key === '_groups') continue
        current = current + targets[key].forces * targets[key].count
      }

      if (runningTotal && pullIndex > 0) {
        var sum = 0
        for (let i = 0; i <= pullIndex; i++) {
          sum = sum + this.pullPercent(i)
        }
        return sum
      }
      else {
        return Math.round(current / max * 10000) / 100
      }
    },

    saveChanges () {
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.aceEditor.getValue()
      var vue = this
      this.http.post('/import/json/save', post).then((res) => {
        if (res.success) {
          window.eventHub.$emit('showSnackBar', this.$t('Wago saved successfully'))
          vue.$router.push('/' + vue.wago.slug)
        }
        else if (res && res.error) {
          window.eventHub.$emit('showSnackBar', res.error)
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Unknown error could not save'))
        }
      })
    },
    exportChanges () {
      this.tableString = this.aceEditor.getValue()
      this.showExport = true
    },
    hideExport () {
      this.showExport = false
    }
  },
  computed: {
    editorContent: {
      get: function () {
        return this.$store.state.wago.code.json
      },

      set: function () {

      }
    },
    wago: function () {
      return this.$store.state.wago
    },
    canEdit: function () {
      var user = this.$store.state.user
      var wago = this.$store.state.wago

      if (user && user.UID && wago.UID && user.UID === wago.UID) {
        return true
      }
      return false
    },
    editorTheme: function () {
      if (!this.$store.state.user || !this.$store.state.user.config || !this.$store.state.user.config.editor) {
        return 'tomorrow'
      }
      else {
        return this.$store.state.user.config.editor || 'tomorrow'
      }
    }
  }
}
</script>

<style>
#build-mdt .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#build-mdt .md-select { width: auto }
#build-mdt .md-input-container { margin-bottom: 10px}
#build-mdt .md-input-container:after { content: none }
#build-mdt .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#build-mdt .flex-left { order: 0; flex: 0 1 auto}
#build-mdt .flex-left .md-input-container label { white-space: nowrap}
#build-mdt .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#build-mdt .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
#builder { position: relative; min-height: 768px }
#builder canvas { position: absolute; left: 0; top: 0; width:1024px; max-width: 1024px; height: 768px; max-height: 768px; }
.mdtOptions { margin: 0; overflow: hidden; width: 100%; height: 768px; overflow-y: auto }
.mdtOptions .md-sidenav-content { min-width: 75%; }
.inlineContainer { display: inline-flex; flex-direction: row; flex-wrap: wrap; }
.affix { padding-right: 6px; padding-bottom: 4px; white-space: nowrap; line-height:36px; display: inline; }
.affix img { width: 22px; height: 22px; }
#selectAffixWeek { position: relative; }
.affixWeek { margin-top: -22px; }
.affixMeta { color: rgba(128,128,128,.6); font-size: 12px; position: absolute; left: 16; top: 24px; }
#changeAffixesBtn { margin-top: 0; }
#mdtPulls .md-progress { margin-top: 4px }
</style>
