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
            <slot>1</slot> <!-- defined slots prevent Konvas from spamming "<div>undefined</div>" -->
            <v-layer ref="mdtMap" v-if="mdtDungeonTable.dungeonSubLevels">
              <slot>1</slot>
              <template v-if="mapTiles.length" v-for="(tile, i) in mapTiles">
                <slot>1</slot>
                <v-image :config="tile" />
              </template>
              <template v-for="(poi, i) in mdtDungeonTable.mapPOIs[mapID][subMapID]">
                <slot>1</slot>
                <v-image v-if="poi.type === 'graveyard'" @mouseover="setPOIToolip(poi)" @mouseout="setPOIToolip()" @mousemove="moveTooltip()" :config="{
                  image: mapPOIs.graveyard, 
                  x: poi.x * mdtScale - mapPOIs.graveyard.naturalWidth / 2, 
                  y: poi.y * -mdtScale - mapPOIs.graveyard.naturalHeight / 2
                }" />
              </template>
              <template v-for="(creature, i) in enemies">
                <slot>1</slot>
                <template v-for="(clone, j) in creature.clones">
                  <slot>1</slot>
                  <v-circle v-if="(!clone.sublevel || clone.sublevel === subMapID + 1) && (!clone.teeming || (clone.teeming && isTeemingSelected()))" :config="{
                      x: clone.x * mdtScale,
                      y: clone.y * -mdtScale,
                      radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fillPatternImage: enemyPortraits,
                      fillPatternRepeat: 'no-repeat',
                      fillPatternX: -Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fillPatternY: -Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fillPatternScaleX: 2 * Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64,
                      fillPatternScaleY: 2 * Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)) / 64,
                      listening: false
                    }"
                  />
                  <v-circle v-if="(!clone.sublevel || clone.sublevel === subMapID + 1) && (!clone.teeming || (clone.teeming && isTeemingSelected()))" 
                    @click="selectCreature(creature, clone, j)" 
                    @mouseover="setTargetHover(creature, clone, j)" 
                    @mouseleave="setTargetHover()" 
                    @mousemove="moveTooltip()"
                    :config="{
                      x: clone.x * mdtScale,
                      y: clone.y * -mdtScale,
                      radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fill: clone.hover ? 'rgba(119, 253, 50, 0.6)' : (clone.pull >= 0 ? 'rgba(99, 233, 30, 0.3)' : 'rgba(99, 233, 30, 0.0)'),
                      stroke: isInfestedCreature(clone) ? 'red' : (creature.isBoss ? 'gold' : 'black'),
                      strokeWidth: .5,
                      shadowColor: 'white',
                      shadowOpacity: 1,
                      shadowEnabled : clone.hoverAvatar || false,
                      shadowOffset: {x: 0, y: 0},
                      shadowBlur: 10
                    }"
                  />
                </template>
              </template>
              <template v-for="(obj, id) in tableData.objects">
                <!-- note -->
                <v-image v-if="obj.n" @mouseover="setPOIToolip(obj)" @mouseout="setPOIToolip()" @mousemove="moveTooltip()" :config="{
                  image: mapPOIs.graveyard,
                  x: obj.d[0] * mdtScale,
                  y: -obj.d[1] * mdtScale
                }"/>
                <!-- line -->
                <v-line v-else-if="obj.l && obj.d[2] === subMapID + 1 && obj.d[3]" :config="{
                  points: linePointsXY(obj.l),
                  strokeWidth: obj.d[0] * .4,
                  stroke: '#' + obj.d[4]
                }"/>
                <!-- ring -->
                <!-- triangle -->
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

          <md-list class="custom-list md-double-line md-dense" id="mdtPulls">
            <template v-for="pull in tableData.value.pulls.length">
              <div @mouseover="setTargetHover(false, false, false, pull - 1)" @mouseleave="setTargetHover()">
                <md-list-item v-bind:class="{selected: currentPull === pull - 1}"
                  @click="selectPull(pull - 1)">
                  <div class="md-list-text-container">
                    <span>{{ $t('Pull [-num-]', { num : pull}) }}; {{ pullPercent(pull - 1) }}%</span>
                    <span v-html="pullEnemyList(pull - 1)"></span>
                    <md-progress :md-progress="pullPercent(pull - 1, true)"></md-progress>
                    <div v-show-slide="currentPull === pull - 1" class="mdtGroupDetails">
                      <div v-for="(details, detailIndex) in pullDetails[pull - 1]">
                        <span v-if="parseInt(details.g)" class="groupnum">{{ details.g }}</span>
                        <span v-else class="singlepull">➽</span>
                        <template v-for="(target, targetIndex) in details.targets">
                          <mdt-enemy-portrait :mapID="mapID" :creatureID="findCreatureID(pull - 1, detailIndex, targetIndex)"
                            @mouseover="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, true)" @mouseleave="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, false)"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </md-list-item>
              </div>
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
    <div id="mdtTooltip" v-bind:style="{top: cursorTooltipY + 'px', left: cursorTooltipX + 'px'}">
      <div class="tooltipPOI" v-if="tooltipPOI" v-html="tooltipPOI.replace(/\\n/g, '<br>')"></div>
      <div class="tooltipEnemy" v-else-if="tooltipEnemy.name">
        <mdt-enemy-portrait :mapID="mapID" :creatureID="tooltipEnemy.id" :size="56" />
        <span v-if="tooltipEnemy.isBoss" style="margin-left:-3px">💀 </span><strong>{{ tooltipEnemy.name }}</strong><br>
        {{ $t('Level [-level-] [-type-]', {level: tooltipEnemy.level, type: tooltipEnemy.creatureType}) }}<br>
        {{ $t('Health [-hp-]', {hp: calcEnemyHealth(tooltipEnemy, true)}) }}<br>
      </div>
    </div>
  </div>
</template>

<!--
  TODO:
  add more tooltip details
  m+ level
  notes
  arrows
  POI
  patrol routes
  add/remove groups to pulls
  create/edit annotations
  enemy portraits
  -->
  

<script>
export default {
  name: 'build-mdt',
  data: function () {
    return {
      mdtScale: 539 / 450, // 1.197777 repeating, of course. Found by trial and error, there may be something that more accurately scales wow pixels into real pixels, but this is very close.
      tableString: this.$store.state.wago.code.json,
      tableData: JSON.parse(this.$store.state.wago.code.json),
      enemies: [],
      pullDetails: [],
      showExport: false,
      mapID: 0,
      subMapID: 0,
      mdtDungeonTable: this.$store.state.MDTTable,
      mdtLevel: 10,
      mapTiles: [],
      enemyPortraits: null,
      mapPOIs: {},
      konvaStageConfig: {width: 1024, height: 768},
      tile: {},
      hoverGroups: [], // which group(s) is being moused-over
      hoverText: '',
      cursorTooltipX: 0,
      cursorTooltipY: 0,
      tooltipEnemy: {},
      tooltipPOI: '',
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
    this.mapID = this.tableData.value.currentDungeonIdx - 1

    if (!this.mdtDungeonTable || !this.mdtDungeonTable.affixWeeks) {
      this.http.get('/data/mdtDungeonTable').then((res) => {
        if (res && res._id === 'mdtDungeonTable') {
          this.mdtDungeonTable = res.value
          this.enemies = this.mdtDungeonTable.dungeonEnemies[this.mapID]
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
    'export-modal': require('./ExportJSON.vue'),
    'mdt-enemy-portrait': require('./MDTEnemyPortrait.vue')
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
          var oldScale = stage.scaleX()

          var mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          }

          var newScale = Math.min(6, Math.max(1, evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy))

          if (newScale === oldScale) {
            return false
          }
          evt.preventDefault()
          stage.scale({ x: newScale, y: newScale })

          var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
          }
          stage.position(newPos)
          stage.batchDraw()
        })
      })

      // setup pull info
      for (let i = 0; i < this.tableData.value.pulls.length; i++) {
        this.updatePullDetails(i)
      }
    },

    setMap (subMap, preloaded) {
      // setup preload images
      var preload = []
      var promises = []

      // enemy portraits
      this.enemyPortraits = new Image()
      this.enemyPortraits.src = 'https://media.wago.io/avatars/56ef7fd27251b4eb17a6c2ea/discord-1506749979849.png'
      preload.push(this.enemyPortraits.src)

      // build map files
      var dir = this.mdtDungeonTable.dungeonMaps[this.mapID][0]
      var map = this.mdtDungeonTable.dungeonMaps[this.mapID][subMap + 1]
      this.mapTiles = []
      for (let i = 1; i <= 12; i++) {
        var row = (i - 1) % 4
        var col = Math.floor((i - 1) / 4)
        var image = new Image()
        image.src = `https://media.wago.io/wow-ui-textures/Worldmap/${dir}/${map}${i}.PNG`
        preload.push(image.src)
        this.mapTiles.push({image, x: row * 256, y: col * 256})
      }

      // map POI images
      var POIs = ['graveyard']
      POIs.forEach((poi) => {
        this.mapPOIs[poi] = new Image()
        this.mapPOIs[poi].src = require('../../assets/mapPOI/' + poi + '.png')
        preload.push(this.mapPOIs[poi].src)
      })

      if (preloaded) {
        return
      }

      // load the images
      for (var i = 0; i < preload.length; i++) {
        (function (url, promise) {
          var img = new Image()
          img.onload = function () {
            promise.resolve()
          }
          img.src = url
        })(preload[i], promises[i] = $.Deferred())
      }
      var vue = this
      $.when.apply($, promises).done(function () {
        vue.setMap(subMap, true)
      })
    },

    setTargetHover (creature, clone, cloneIndex, pullIndex) {
      for (let i = 0; i < this.enemies.length; i++) {
        for (let k = 0; k < this.enemies[i].clones.length; k++) {
          // if hovering over an avatar
          if (pullIndex >= 0) {
            this.$set(this.enemies[i].clones[k], 'hover', this.enemies[i].clones[k].pull === pullIndex)
          }
          // if we're turning all hovers off
          else if (!clone) {
            this.$set(this.enemies[i].clones[k], 'hover', false)
          }
          // if matching a single enemy
          else if (!clone.g && creature.id === this.enemies[i].id && k === cloneIndex) {
            this.$set(this.enemies[i].clones[k], 'hover', true)
          }
          // if matching part of a group
          else if (clone.g && clone.g === this.enemies[i].clones[k].g) {
            this.$set(this.enemies[i].clones[k], 'hover', true)
          }
          // not matching
          else {
            this.$set(this.enemies[i].clones[k], 'hover', false)
          }
        }
      }

      if (creature && isNaN(pullIndex)) {
        this.tooltipEnemy = creature
        this.tooltipPOI = ''
        this.$nextTick(() => {
          this.moveTooltip()
        })
      }
      else {
        this.cursorTooltipX = -1000
        this.cursorTooltipY = -1000
        this.tooltipEnemy = false
      }
    },

    moveTooltip () {
      var box = document.getElementById('mdtTooltip')
      this.cursorTooltipX = window.event.clientX + 10
      this.cursorTooltipY = window.event.clientY - 10 - box.offsetHeight
      console.log(box.offsetHeight)
    },

    setTargetHoverAvatar (pullIndex, groupIndex, targetIndex, bool) {
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].id === this.pullDetails[pullIndex][groupIndex].targets[targetIndex].id) {
          this.$set(this.enemies[i].clones[this.pullDetails[pullIndex][groupIndex].targets[targetIndex].cloneIndex], 'hoverAvatar', bool)
          return
        }
      }
    },

    findCreatureID (pullIndex, groupIndex, targetIndex) {
      return this.pullDetails[pullIndex][groupIndex].targets[targetIndex].id
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

    isFortifiedSelected () {
      return this.selectedAffixes.indexOf(10) >= 0
    },

    isTyrannicalSelected () {
      return this.selectedAffixes.indexOf(9) >= 0
    },

    isInfestedCreature (clone) {
      if (!clone.infested) {
        return false
      }
      var week = this.tableData.week % 3
      if (!week) {
        week = 3
      }
      week--

      return clone.infested[week]
    },

    calcEnemyHealth (creature, shorten) {
      var mult = 1
      if (creature.boss && this.isTyrannicalSelected()) mult = 1.4
      else if (!creature.boss && this.isFortifiedSelected()) mult = 1.2
      mult = Math.round((1.08 ^ (this.mdtLevel - 2)) * mult, 2)

      console.log(creature.health, mult)
      var hp = Math.round(mult * creature.health)
      if (!shorten || hp < 1e3) return hp

      if (hp >= 1e9) {
        return (hp / 1e9).toFixed(2) + 'B'
      }
      else if (hp >= 1e6) {
        return (hp / 1e6).toFixed(2) + 'M'
      }
      else if (hp >= 1e3) {
        return (hp / 1e3).toFixed(2) + 'K'
      }
      return hp
    },

    selectPull (pullIndex) {
      this.currentPull = pullIndex
    },

    pullEnemyList (pullIndex, returnObj) {
      var targets = {_groups: []}
      var isTeeming = this.isTeemingSelected()
      this.tableData.value.pulls[pullIndex].forEach((clones, enemyIndex) => {
        // validate data
        if (!clones || !this.enemies[enemyIndex].clones) {
          return
        }
        clones.forEach((cloneIndex) => {
          cloneIndex--
          // if not being pulled or not on teeming map
          if (!this.enemies[enemyIndex].clones[cloneIndex] || (this.enemies[enemyIndex].clones[cloneIndex].teeming && !isTeeming)) {
            // if clone is set to current pullIndex, remove it
            if (this.enemies[enemyIndex].clones[cloneIndex] === pullIndex) {
              this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', -1)
            }
            return
          }

          // add pull data
          this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', pullIndex)

          // setup targets for html
          targets[this.enemies[enemyIndex].name] = targets[this.enemies[enemyIndex].name] || { count: 0, forces: this.enemies[enemyIndex].count, boss: this.enemies[enemyIndex].isBoss }
          targets[this.enemies[enemyIndex].name].count++
          if (targets._groups.indexOf(this.enemies[enemyIndex].clones[cloneIndex].g) === -1) {
            targets._groups.push(this.enemies[enemyIndex].clones[cloneIndex].g)
          }
        })
      })
      if (returnObj) {
        return targets
      }
      var str = ''
      for (let name in targets) {
        if (!targets.hasOwnProperty(name) || name === '_groups') continue
        if (targets[name].boss) str = str + '💀' + name + ', '
        else str = str + targets[name].count + 'x ' + name + ', '
      }
      return str.substring(0, str.length - 2)
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

    updatePullDetails (pullIndex) {
      var enemies = this.enemies
      var groups = {}
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

          groups[enemies[enemyIndex].clones[cloneIndex].g] = groups[enemies[enemyIndex].clones[cloneIndex].g] || []
          let meta = Object.assign({}, enemies[enemyIndex])
          meta.clones = null
          meta.cloneIndex = cloneIndex
          groups[enemies[enemyIndex].clones[cloneIndex].g].push(meta)
        })
      })

      var details = []
      for (let g in groups) {
        if (!groups.hasOwnProperty(g)) continue
        details.push({g: g, targets: groups[g]})
      }
      this.pullDetails.splice(pullIndex, 1, details)
    },

    setPOIToolip (poi) {
      if (!poi) {
        this.cursorTooltipX = -1000
        this.cursorTooltipY = -1000
        this.tooltipPOI = ''
        return
      }

      var lines = []
      if (poi.type === 'door' && poi.doorDescription) lines.push(poi.doorDescription.replace('\\n', '<br>'))
      else if (poi.type === 'door' && poi.lockpick) lines.push('<span class="lockedDoor">' + this.$t('Locked') + '</span>')
      else if (poi.type === 'graveyard' && poi.graveyardDescription) lines.push(poi.graveyardDescription.replace('\\n', '<br>'))
      else if (poi.type === 'generalNote' && poi.text) lines.push(poi.text.replace('\\n', '<br>'))
      else if (poi.n && poi.d && poi.d[4]) lines.push(poi.d[4].replace('\\n', '<br>')) // user note

      this.tooltipEnemy = ''
      this.tooltipPOI = lines.join('<br>')
      this.$nextTick(() => {
        this.moveTooltip()
      })
    },

    linePointsXY (points) {
      return points.map(x => Math.abs(x) * this.mdtScale)
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
#build-mdt .md-theme-default.md-sidenav .md-sidenav-content { background-color: inherit; min-width: 360px; }
#builder { position: relative; min-height: 768px }
#builder canvas { position: absolute; left: 0; top: 0; width:1024px; max-width: 1024px; height: 768px; max-height: 768px; }
.mdtOptions { margin: 0; overflow: hidden; width: 100%; height: 768px; overflow-y: auto }
.mdtOptions .md-sidenav-content { min-width: 75%; }
.inlineContainer { display: inline-flex; flex-direction: row; flex-wrap: wrap; }
.affix { padding-right: 6px; padding-bottom: 4px; white-space: nowrap; line-height:36px; display: inline; }
.affix img { width: 22px; height: 22px; }
#selectAffixWeek { position: relative; }
.affixWeek { margin-top: -22px; }
.affixMeta { color: rgba(128,128,128,.6); font-size: 12px; position: absolute; left: 16px; top: 24px; }
#changeAffixesBtn { margin-top: 0; }
#mdtPulls .md-progress { margin-top: 4px }
#mdtPulls .selected { background-color: rgba(99, 233, 30, 0.1); padding-top: 16px }
.mdtGroupDetails > div { margin: 15px 0; }
.mdtGroupDetails .groupnum:before { content: 'Group'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .singlepull:before { content: 'Singles'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .groupnum, .mdtGroupDetails .singlepull { position: relative; font-size: 26px; width: 1.7em; display: inline-block; text-align: right; padding-right: 6px; }
.mdtGroupDetails .enemyPortrait { margin-top: -9px; width:32px; height:32px; z-index:10 }
#mdtTooltip { z-index: 100; position: fixed; padding: 16px; background: rgba(0, 0, 0, .8); border: 2px solid black; color: white; }
#mdtTooltip .tooltipPOI { max-width: 210px }
#mdtTooltip .tooltipEnemy { width: 210px; position: relative; }
#mdtTooltip .tooltipEnemy .enemyPortrait { position: absolute; left: -48px; top: -48px; border: 2px solid black; }
</style>
