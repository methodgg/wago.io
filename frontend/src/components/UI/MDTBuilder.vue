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
        <md-button v-if="canEdit" @click="$refs['saveChangesDialog'].open()" ref="saveChangesButton"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
      </div>
      <md-dialog md-open-from="#saveChangesButton" md-close-to="#saveChangesButton" ref="saveChangesDialog" id="saveChangesDialog" :focus="true">
        <md-dialog-title>{{ $t("Save Modifications") }}</md-dialog-title>

        <input-semver v-model="newImportVersion" :latestVersion="latestVersion"></input-semver>

        <md-dialog-content>
          <md-input-container class="changelog-notes">
            <label>{{ $t("Changelog") }}</label>
            <md-textarea v-model="newChangelog.text" :placeholder="$t('You may enter any patch notes or updates here')"></md-textarea>
          </md-input-container>
          <div>
            <div class="md-radio md-theme-default"><label class="md-radio-label">{{ $t("Format") }}</label></div>
            <md-radio v-model="newChangelog.format" md-value="bbcode">BBCode</md-radio>
            <md-radio v-model="newChangelog.format" md-value="markdown">Markdown</md-radio>
          </div>
        </md-dialog-content>

        <md-dialog-actions>
          <md-button class="md-primary" @click="saveChanges()">{{ $t("Save") }}</md-button>
          <md-button class="md-primary" @click="$refs['saveChangesDialog'].close()">{{ $t("Cancel") }}</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>

    <md-layout md-row style="flex-wrap: nowrap">
      <md-layout id="stageContainer" md-vertical-align="start">
        <div id="builder" ref="canvas" v-bind:class="annotationClass">
          <ui-loading v-if="mdtLoading"></ui-loading>
          <v-stage v-else-if="konvaStageConfig.width > 0" ref="mdtStage" id="mdtStage" :config="konvaStageConfig" @scroll.passive="zoomStage">
            <slot>1</slot> <!-- defined slots prevent Konva from spamming "<div>undefined</div>" -->
            <v-layer ref="mdtMap" v-if="mdtDungeonTable.dungeonSubLevels">
              <slot>1</slot>
              <template v-if="mapTiles.length" v-for="(tile, i) in mapTiles">
                <slot>1</slot>
                <v-image :config="tile" />
              </template>
              <template v-for="(poi, i) in mdtDungeonTable.mapPOIs[mapID][subMapID]">
                <slot>1</slot>
                <mdt-poi :data="poi" :mdtScale="mdtScale" :mapID="mapID" @mouseover="setPOITooltip" @mouseout="setPOITooltip" @mousemove="moveTooltip" @click="clickPOI" />
              </template>
              <template v-for="(creature, i) in enemies">
                <slot>1</slot>
                <template v-for="(clone, j) in creature.clones">
                  <slot>1</slot>
                  <v-line v-if="clone.patrol && clone.sublevel === subMapID + 1 && (!clone.teeming || (clone.teeming && isTeemingSelected())) && (!clone.faction || (clone.faction === tableData.faction))" 
                    @mouseover="setTargetHover(creature, clone, j, undefined, true)"
                    @mouseleave="setTargetHover()"
                    :config="{
                      points: linePointsObjXY(clone.patrol),
                      strokeWidth: 1,
                      stroke: clone.hover ? '#77FD32' : '#150047',
                      dash: [5, 3, 2, 3],
                      lineCap: 'round',
                      lineJoin: 'round'
                    }"
                  />
                </template>
              </template>
              <v-image
                :config="{
                  image: enemyPortraitMap,
                  scaleX: 1/6,
                  scaleY: 1/6,
                  listening: false
                }"
              />
              <template v-for="(creature, i) in enemies">
                <slot>1</slot>
                <template v-for="(clone, j) in creature.clones">
                  <slot>1</slot>
                  <v-circle v-if="(!clone.sublevel || clone.sublevel === subMapID + 1) && (!clone.teeming || (clone.teeming && isTeemingSelected())) && (!clone.faction || (clone.faction === tableData.faction))" 
                    @click="selectCreature(i, j)" 
                    @mouseover="setTargetHover(creature, clone, j)" 
                    @mouseleave="setTargetHover()" 
                    @mousemove="moveTooltip()"
                    :config="{
                      x: clone.x * mdtScale,
                      y: clone.y * -mdtScale,
                      radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1) * (mdtDungeonTable.scaleMultiplier[mapID] || 1)) / mdtScale,
                      fill: isCreatureNoTarget(creature.id) ? 'rgba(33, 33, 33, 0.6)' : 
                            clone.hover ? 'rgba(119, 253, 50, 0.65)' : 
                            clone.pull >= 0 ? 'rgba(99, 233, 30, 0.3)' : 
                            'rgba(99, 233, 30, 0.0)',
                      stroke: isCreatureNoTarget(creature.id) ? '#333333' :
                              isSeasonalAffixClone(clone) ? 'red' : 
                              creature.isBoss ? 'gold' : 
                              'black',
                      strokeWidth: .5,
                      strokeEnabled: ((creature.isBoss && isCreatureNoTarget(creature.id)) || isSeasonalAffixClone(clone)),
                      shadowColor: 'white',
                      shadowOpacity: 1,
                      shadowEnabled : clone.hoverAvatar || false,
                      shadowOffset: {x: 0, y: 0},
                      shadowBlur: 10,
                    }"
                  />
                </template>
              </template>
              <v-circle v-if="hoverSpecific.cloneIndex >= 0" 
                :config="{
                  x: enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex].x * mdtScale,
                  y: enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex].y * -mdtScale,
                  radius: Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1) * (mdtDungeonTable.scaleMultiplier[mapID] || 1)) / mdtScale,
                  stroke: isSeasonalAffixClone(enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex]) ? 'red' : (enemies[hoverSpecific.creatureIndex].isBoss ? 'gold' : 'black'),
                  strokeWidth: 3,
                  strokeEnabled: true,
                  fillPatternX: (-Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1))) / mdtScale,
                  fillPatternY: (-Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1))) / mdtScale,
                  fillPatternImage: enemyPortraits,
                  fillPatternOffset: getEnemyPortraitOffset(hoverSpecific.creatureIndex, 115),
                  fillPatternRepeat: 'no-repeat',
                  fillPatternScaleX: Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1)) / 64,
                  fillPatternScaleY: Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1)) / 64,
                  listening: false
                }"
              />
              <template v-for="(obj, id) in tableData.objects">
                <!-- note -->
                <mdt-poi v-if="obj && obj.n && obj.d && obj.d[2] === subMapID + 1" :data="obj" :annotationsIndex="id" :mdtScale="mdtScale" :mapID="mapID" @mouseover="setPOITooltip" @mouseout="setPOITooltip" @mousemove="moveTooltip" @click="clickPOI(obj, id)" />
                <!-- arrow -->
                <v-arrow v-else-if="obj && obj.t && obj.l && obj.d[2] === subMapID + 1 && obj.d[3]" :config="{
                  points: linePointsXY(obj.l),
                  strokeWidth: obj.d[0] * .4,
                  stroke: '#' + obj.d[4],
                  fill: '#' + obj.d[4]
                }"/>
                <!-- line -->
                <v-line v-else-if="obj && obj.l && obj.d[2] === subMapID + 1 && obj.d[3]" :config="{
                  points: linePointsXY(obj.l),
                  strokeWidth: obj.d[0] * .4,
                  stroke: '#' + obj.d[4],
                  tension: .3
                }"/>
                <!-- ring -->
                <!-- triangle -->
              </template>
            </v-layer>
          </v-stage>
        </div>
        <div id="mdtAnnotateMenu" v-if="!mdtLoading">
          <md-button-toggle md-single class="md-primary">
            <md-button class="md-icon-button" @click="setAnnotate('standard')">
              <md-icon style="transform:rotate(-65deg); margin-left:2px">near_me</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="setAnnotate('freedraw')">
              <md-icon>edit</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="setAnnotate('note')">
              <md-icon>receipt</md-icon>
            </md-button>
            <md-button class="md-icon-button" @click="setAnnotate('line')">
              <md-icon style="transform:rotate(-45deg); font-size: 28px; margin-left: -5px; margin-top: -2px">remove</md-icon>
            </md-button>
            <!--<md-button class="md-icon-button" @click="setAnnotate('move')">
              <md-icon>control_camera</md-icon>
            </md-button>-->
            <md-button class="md-icon-button" @click="setAnnotate('arrow')">
              <md-icon>call_made</md-icon>
            </md-button>
          </md-button-toggle>
        </div>
      </md-layout>
      <md-layout style="width:25%" md-vertical-align="start">
        <md-card id="mdtOptions" v-if="!mdtLoading">
          <md-card-area>
            <div class="inlineContainer">
              <template v-for="(affixID, k) in selectedAffixes">
                <span v-html="displayAffix(affixID)" class="affix"></span>
              </template>
              <md-button class="md-raised md-accent" @click="toggleAffixSelection" id="changeAffixesBtn">{{ $t("Change Affixes") }}</md-button>
            </div>
          </md-card-area>
          
          <md-card-area v-if="mapID === 15">
            <!-- Freehold Crew Option -->
            <div class="inlineContainer">
              <md-layout md-row>
                <md-checkbox v-model="tableData.freeholdCrewSelected" @change="updateTableString()">{{ $t('Join Crew [-crew-]', {crew: freeholdCrew()}) }}</md-checkbox>
              </md-layout>
            </div>
          </md-card-area>

          <md-card-area v-if="mapID === 18">
            <!-- Boralus Faction Option -->
            <div class="inlineContainer">
              <md-layout md-row>
                <md-radio v-model.number="tableData.faction" md-value="1" @change="updateTableString(true)">{{ $t('Horde') }}</md-radio>
                <md-radio v-model.number="tableData.faction" md-value="2" @change="updateTableString(true)">{{ $t('Alliance') }}</md-radio>
              </md-layout>
            </div>
          </md-card-area>

          <md-list class="custom-list md-double-line md-dense" id="mdtPulls">
            <template v-for="pull in tableData.value.pulls.length">
              <div @mouseover="setTargetHover(false, false, false, pull - 1)" @mouseleave="setTargetHover()">
                <md-list-item v-bind:class="{selected: currentPull === pull - 1}"
                  @click="selectPull(pull - 1)">
                  <div class="md-list-text-container">
                    <span>{{ $t('Pull [-num-]', { num : pull}) }}; {{ pullDetails[pull - 1].percent }}%</span>
                    <span v-html="pullDetails[pull - 1].hList"></span>
                    <md-progress :md-progress="pullDetails[pull - 1].percentRunningTotal"></md-progress>
                    <div v-show-slide="currentPull === pull - 1" class="mdtGroupDetails">
                      <div v-for="(details, detailIndex) in pullDetails[pull - 1].groups">
                        <span v-if="parseInt(details.g)" class="groupnum">{{ details.g }}</span>
                        <span v-else class="singlepull">➽</span>
                        <template v-for="(target, targetIndex) in details.targets">
                          <mdt-enemy-portrait :size="36" :mapID="mapID" :offset="getEnemyPortraitOffset(target.enemyIndex, 36)" :seasonalAffix="isSeasonalAffixClone(target.clone)"
                            @mouseover="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, true)" 
                            @mouseleave="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, false)"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </md-list-item>
              </div>
            </template>
            <md-list-item @click="createPull()" style="margin-bottom: 16px">
              <div class="md-list-text-container">
                <span>➕ {{ $t('Create new pull') }}</span>
              </div><br>
            </md-list-item>
          </md-list>

          <md-sidenav class="md-right" ref="affixSelection">
            <md-list class="md-double-line md-dense" id="selectAffixWeek">
              <template v-for="(week, k) in mdtDungeonTable.affixWeeks">
                <md-list-item @click="setAffixWeek(k)">
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
    <div id="mdtTooltip" v-if="tooltipPOI || tooltipEnemy" v-bind:style="{top: cursorTooltipY + 'px', left: cursorTooltipX + 'px'}">
      <div class="tooltipPOI" v-if="tooltipPOI" v-html="tooltipPOI.replace(/\\n/g, '<br>')"></div>
      <div class="tooltipEnemy" v-else-if="tooltipEnemy.name">
        <mdt-enemy-portrait :size="56" :mapID="mapID" :offset="getEnemyPortraitOffset(tooltipEnemy.enemyIndex, 56)" />
        <span v-if="tooltipEnemy.isBoss" style="margin-left:-3px">💀 </span><strong>{{ tooltipEnemy.name }}</strong><br>
        {{ $t('Level [-level-] [-type-]', {level: tooltipEnemy.level, type: tooltipEnemy.creatureType}) }}<br>
        {{ $t('[-hp-] HP @ +10', {hp: calcEnemyHealth(tooltipEnemy, true)}) }}<br>
        <span v-if="tooltipEnemy.clone && isSeasonalAffixClone(tooltipEnemy.clone)" style="color:red">{{ $t('Infested') }}<br></span>
        <span v-if="tooltipEnemy.clone && tooltipEnemy.clone.g > 0">{{ $t('Group [-num-]', {num: tooltipEnemy.clone.g}) }}</span>
        <span v-if="tooltipEnemy.clone && tooltipEnemy.clone.pull >= 0">{{ $t('Pull [-num-]', {num: tooltipEnemy.clone.pull + 1}) }}<br></span>
      </div>
    </div>
    <md-dialog v-model="userNoteEditText" ref="userNoteEdit" id="mdtEditNote">
      <md-dialog-title>{{ $t('Set Note') }}</md-dialog-title>
      <md-input-container>
        <md-textarea v-model="userNoteEditText" :placeholder="$t('Note text')"></md-textarea>
      </md-input-container>
      <md-dialog-actions>
        <md-button class="md-primary" @click="userNoteEditClose()">Cancel</md-button>
        <md-button class="md-primary" @click="userNoteEditClose(true)">Ok</md-button>
      </md-dialog-actions>
    </md-dialog>

  </div>
</template>

<!--
  TODO:
  add more tooltip details?
  m+ level needed?
  arrows/rings/other annotation tools?
  - color : color_lens or style or fiber_manual_record
  - width
  - shapes? -- outline style
    - triangle? details
    - square? crop_din
    - circle? fiber_manual_record
  - note : receipt
  - move object
  - eraser
  - clear all
  create/edit annotations
  -->
  

<script>
const semver = require('semver')

export default {
  name: 'build-mdt',
  data: function () {
    return {
      mdtScale: 539 / 450, // 1.197777 repeating, of course. Found by trial and error; there may be something that more accurately scales wow pixels into real pixels, but this is very close.
      mdtLoading: true,
      tableString: this.$store.state.wago.code.json,
      tableData: JSON.parse(this.$store.state.wago.code.json),
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      enemies: [],
      pullDetails: [],
      showExport: false,
      mapID: 0,
      subMapID: 0,
      mdtDungeonTable: this.$store.state.MDTTable,
      mdtLevel: 10,
      mapTiles: [],
      enemyPortraits: null,
      enemyPortraitMap: null,
      mapPOIs: {},
      webpSupport: false,
      tile: {},
      hoverGroups: [], // which group(s) is being moused-over
      hoverText: '',
      cursorTooltipX: 0,
      cursorTooltipY: 0,
      tooltipEnemy: {},
      tooltipPOI: '',
      selectedAffixes: [],
      hoverSpecific: {},
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
      currentPull: -1,
      annotationMode: false,
      annotationClass: 'standard',
      isPainting: false,
      paintingContext: null,
      paintingPosition: {},
      paintingStrokeWidth: 3,
      paintingStrokeColor: 'FFFFFF',
      userNoteEditText: '',
      editPoiID: -1
    }
  },
  created: function () {
    this.mapID = this.tableData.value.currentDungeonIdx - 1
    if (this.$store.state.mdtDungeonTable) {
      this.mdtDungeonTable = this.$store.state.mdtDungeonTable
    }

    if (!this.mdtDungeonTable || !this.mdtDungeonTable.affixWeeks) {
      this.http.get('/data/mdtDungeonTable').then((res) => {
        if (res && res._id === 'mdtDungeonTable') {
          this.mdtDungeonTable = res.value
          this.$store.commit('saveMDT', this.mdtDungeonTable)
          this.init()
        }
      })
    }
    else {
      this.init()
    }
  },
  watch: {
    subMapID: function (val) {
      this.setMap(val)
    }
  },
  components: {
    'export-modal': require('./ExportJSON.vue'),
    'mdt-enemy-portrait': require('./MDTEnemyPortrait.vue'),
    'mdt-poi': require('./MDTPOI.vue'),
    'input-semver': require('../UI/Input-Semver.vue')
  },
  mounted () {
    this.latestVersion.semver = semver.valid(semver.coerce(this.wago.versions.versions[0].versionString))
    this.latestVersion.major = semver.major(this.latestVersion.semver)
    this.latestVersion.minor = semver.minor(this.latestVersion.semver)
    this.latestVersion.patch = semver.patch(this.latestVersion.semver)
  },
  methods: {
    init () {
      this.selectedAffixes = this.mdtDungeonTable.affixWeeks[this.tableData.week - 1]
      this.enemies = this.mdtDungeonTable.dungeonEnemies[this.mapID]
      for (let i = 0; i < this.enemies.length; i++) {
        this.enemies[i].enemyIndex = i
      }
      // boralus make sure faction value is set
      if (this.mapID === 18 && !this.tableData.faction) {
        this.tableData.faction = 1
      }
      // check webp support and load map
      var testWebp = new Image()
      testWebp.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA'
      testWebp.onload = testWebp.onerror = () => {
        this.webpSupport = (testWebp.height === 2)
        this.setMap(this.subMapID)
      }
    },

    updateTableString (reloadMap) {
      this.$nextTick(() => {
        if (reloadMap) {
          for (let i = 0; i < this.tableData.value.pulls.length; i++) {
            this.updatePullDetails(i)
          }
          this.setMap(this.subMapID)
        }
        this.tableString = JSON.stringify(this.tableData, null, 2)
        this.$store.commit('setWagoJSON', this.tableString)
        this.$emit('set-has-unsaved-changes', true)
      })
    },

    setupStage () {
      var vue = this
      this.isPainting = false

      this.$nextTick().then(function () {
        var stage = vue.$refs.mdtStage.getStage()
        var canvas = vue.$refs.canvas
        stage.draggable(true)

        // center the map onload; do it here once we know how wide the window is
        stage.move({x: (1000 - document.getElementById('stageContainer').offsetWidth) * -0.6})

        // setup zoom
        canvas.addEventListener('wheel', (evt) => {
          evt.preventDefault()

          let scaleBy = 1.2
          if (evt.target.nodeName !== 'CANVAS') {
            return false
          }
          var oldScale = stage.scaleX()

          var mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          }

          var newScale = Math.min(10, Math.max(1, evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy))

          if (newScale === oldScale) {
            return false
          }
          stage.scale({ x: newScale, y: newScale })

          var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
          }
          stage.position(newPos)
          stage.batchDraw()
        })

        stage.addEventListener('mousedown touchstart', (evt) => {
          vue.paintingPosition = stage.getPointerPosition()
          var scale = stage.scaleX()
          var x = ((vue.paintingPosition.x - stage.x()) / scale) / vue.mdtScale
          var y = -((vue.paintingPosition.y - stage.y()) / scale) / vue.mdtScale

          if (vue.annotationMode === 'freedraw' || vue.annotationMode === 'line' || vue.annotationMode === 'arrow') {
            vue.isPainting = true
            vue.tableData.objects.push({l: [x, y], d: [vue.paintingStrokeWidth, 1.1, vue.subMapID + 1, true, vue.paintingStrokeColor, -8, true]})
          }
          else if (vue.annotationMode === 'note') {
            vue.userNoteEditOpen('', {x, y})
          }
          else {
            vue.isPainting = false
          }
        })

        stage.addEventListener('mouseup touchend', (evt) => {
          vue.isPainting = false
          // if line is started but never actually drawn then remove it from the table
          if ((vue.annotationMode === 'freedraw' || vue.annotationMode === 'line' || vue.annotationMode === 'arrow') && vue.tableData.objects[vue.tableData.objects.length - 1].l.length <= 3) {
            vue.tableData.objects.pop()
            return
          }
        })

        stage.addEventListener('mousemove touchmove', (evt) => {
          if (!vue.isPainting) {
            return
          }

          var pos = stage.getPointerPosition()
          var scale = stage.scaleX()
          var x = ((pos.x - stage.x()) / scale) / vue.mdtScale
          var y = -((pos.y - stage.y()) / scale) / vue.mdtScale
          if (x < 0 || y > 0) {
            return
          }
          else if (Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10) {
            return
          }

          var data = vue.tableData.objects[vue.tableData.objects.length - 1]
          if (vue.annotationMode === 'freedraw') {
            // using vue's mutating methods
            vue.tableData.objects[vue.tableData.objects.length - 1].l.push(x)
            vue.tableData.objects[vue.tableData.objects.length - 1].l.push(y)
            vue.tableData.objects[vue.tableData.objects.length - 1].l.push(x)
            vue.tableData.objects[vue.tableData.objects.length - 1].l.push(y)
          }
          else if (vue.annotationMode === 'line') {
            vue.tableData.objects[vue.tableData.objects.length - 1].l.splice(2, 2, x, y)
          }
          else if (vue.annotationMode === 'arrow') {
            vue.tableData.objects[vue.tableData.objects.length - 1].l.splice(2, 2, x, y)
            vue.$set(vue.tableData.objects[vue.tableData.objects.length - 1], 't', [Math.atan2(data.l[1] - y, data.l[0] - x)])
          }
          // vue.tableData.objects.splice(vue.tableData.objects.length - 1, 1, data)
          vue.paintingPosition = pos
          vue.updateTableString()
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
      this.enemyPortraits.src = `https://media.wago.io/mdt/portraits-${this.mapID}.png`
      preload.push(this.enemyPortraits.src)

      var faction = ''
      if (this.tableData.faction) {
        faction = '-Faction' + this.tableData.faction
      }

      this.enemyPortraitMap = new Image()
      this.enemyPortraitMap.src = `https://media.wago.io/mdt/portraitMap-${this.mapID}-${subMap + 1}${this.isTeemingSelected() ? '-Teeming' : ''}${faction}.${this.webpSupport ? 'webp' : 'png'}`
      preload.push(this.enemyPortraitMap.src)

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
      var POIs = ['OBJECTICONS.png', 'POIICONS.png', 'DOOR.png', 'USERNOTEICONS.png']
      POIs.forEach((file) => {
        this.mapPOIs[file] = new Image()
        this.mapPOIs[file].src = require('../../assets/mapPOI/' + file)
        preload.push(this.mapPOIs[file].src)
      })

      if (preloaded) {
        this.mdtLoading = false
        this.setupStage()
        return
      }
      else {
        if (document.getElementById('stageContainer')) {
          // this.$set(this.konvaStageConfig, 'offsetX', (1000 - document.getElementById('stageContainer').offsetWidth) * -0.4)
        }
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

    getEnemyPortraitOffset (creatureIndex, size) {
      var row = 0
      size = size || 36
      if (creatureIndex >= Math.ceil(this.enemies.length / 2)) {
        row++
      }
      return {x: ((creatureIndex) - (Math.ceil(this.enemies.length / 2) * row)) * size, y: row * size}
    },

    setTargetHover (creature, clone, cloneIndex, pullIndex, noTooltip) {
      if (creature && creature.id && this.isCreatureNoTarget(creature.id)) {
        return
      }
      for (let i = 0; i < this.enemies.length; i++) {
        for (let k = 0; k < this.enemies[i].clones.length; k++) {
          // if hovering over an avatar
          if (pullIndex >= 0) {
            this.$set(this.enemies[i].clones[k], 'hover', this.enemies[i].clones[k].pull === pullIndex)
          }
          // if we're turning all hovers off
          else if (!clone) {
            this.$set(this.enemies[i].clones[k], 'hover', false)
            this.$set(this.hoverSpecific, 'cloneIndex', -1)
            this.$set(this.hoverSpecific, 'creatureIndex', -1)
          }
          // if matching a single enemy
          else if (creature.id === this.enemies[i].id && k === cloneIndex) {
            this.$set(this.enemies[i].clones[k], 'hover', true)
            this.$set(this.hoverSpecific, 'cloneIndex', k)
            this.$set(this.hoverSpecific, 'creatureIndex', i)
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

      if (creature && isNaN(pullIndex) && !noTooltip) {
        creature.clone = clone
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
      if (this.tooltipEnemy || this.tooltipPOI) {
        var box = document.getElementById('mdtTooltip')
        var x = window.event.clientX + 10
        if (x + box.offsetWidth > window.innerWidth - 30) {
          x = window.event.clientX - 10 - box.offsetWidth
        }
        this.cursorTooltipX = x

        var y = window.event.clientY - 10 - box.offsetHeight
        if (y < 24) {
          y = window.event.clientY + 40
        }
        this.cursorTooltipY = y
      }
    },

    setTargetHoverAvatar (pullIndex, groupIndex, targetIndex, bool) {
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i].id === this.pullDetails[pullIndex].groups[groupIndex].targets[targetIndex].id) {
          this.$set(this.enemies[i].clones[this.pullDetails[pullIndex].groups[groupIndex].targets[targetIndex].cloneIndex], 'hoverAvatar', bool)
          return
        }
      }
    },

    findCreatureID (pullIndex, groupIndex, targetIndex) {
      return this.pullDetails[pullIndex].groups[groupIndex].targets[targetIndex].id
    },

    selectCreature (creatureIndex, cloneIndex) {
      // if no pull is selected then do nothing
      if (this.currentPull < 0) {
        return
      }

      // if current pull matches clicked target then we'll be removing only, otherwise we'll add unit/group after we remove
      var addToPull = (this.enemies[creatureIndex].clones[cloneIndex].pull !== this.currentPull)
      var previousPull = this.enemies[creatureIndex].clones[cloneIndex].pull

      // if target is part of a group then apply to all creatures in the group
      if (this.enemies[creatureIndex].clones[cloneIndex].g && this.enemies[creatureIndex].clones[cloneIndex].pull >= 0) {
        this.removeGroupFromPull(this.enemies[creatureIndex].clones[cloneIndex].pull, this.enemies[creatureIndex].clones[cloneIndex].g)
      }
      // othersise just remove the solo creature
      else if (this.tableData.value.pulls[this.currentPull][creatureIndex] && this.enemies[creatureIndex].clones[cloneIndex].pull >= 0) {
        if (this.tableData.value.pulls[this.currentPull][creatureIndex].indexOf(cloneIndex + 1) >= 0) {
          this.$delete(this.tableData.value.pulls[this.currentPull][creatureIndex], this.tableData.value.pulls[this.currentPull][creatureIndex].indexOf(cloneIndex + 1))
        }
        // use null instead of empty arrays
        if (!this.tableData.value.pulls[this.currentPull][creatureIndex].length) {
          this.$set(this.tableData.value.pulls[this.currentPull], creatureIndex, null)
        }
        this.$delete(this.enemies[creatureIndex].clones[cloneIndex], 'pull')
      }

      if (previousPull >= 0) {
        this.updatePullDetails(previousPull)
      }

      if (addToPull) {
        if (this.enemies[creatureIndex].clones[cloneIndex].g) {
          this.addGroupToPull(this.currentPull, this.enemies[creatureIndex].clones[cloneIndex].g)
        }
        else {
          this.tableData.value.pulls[this.currentPull][creatureIndex] = this.tableData.value.pulls[this.currentPull][creatureIndex] || []
          if (this.tableData.value.pulls[this.currentPull].length <= creatureIndex) {
            // increase array size to match required length
            this.tableData.value.pulls[this.currentPull].push(...new Array(creatureIndex + 1 - this.tableData.value.pulls[this.currentPull].length))
          }
          this.tableData.value.pulls[this.currentPull][creatureIndex].push(cloneIndex + 1)
          this.$set(this.enemies[creatureIndex].clones[cloneIndex], 'pull', this.currentPull)
        }

        this.updatePullDetails(this.currentPull)
      }

      // update data table
      this.updateTableString()
    },

    addGroupToPull (pullIndex, group) {
      this.enemies.forEach((creature, creatureIndex) => {
        creature.clones.forEach((clone, cloneIndex) => {
          if (clone.g === group) {
            this.tableData.value.pulls[pullIndex][creatureIndex] = this.tableData.value.pulls[pullIndex][creatureIndex] || []
            if (this.tableData.value.pulls[pullIndex].length <= creatureIndex) {
              // increase array size to match required length
              this.tableData.value.pulls[pullIndex].push(...new Array(creatureIndex + 1 - this.tableData.value.pulls[pullIndex].length))
            }
            this.tableData.value.pulls[pullIndex][creatureIndex].push(cloneIndex + 1)
            this.$set(this.enemies[creatureIndex].clones[cloneIndex], 'pull', pullIndex)
          }
        })
      })
    },

    removeGroupFromPull (pullIndex, group) {
      this.enemies.forEach((creature, creatureIndex) => {
        creature.clones.forEach((clone, cloneIndex) => {
          if (clone.g === group && this.tableData.value.pulls[pullIndex][creatureIndex]) {
            this.$delete(this.tableData.value.pulls[pullIndex][creatureIndex], this.tableData.value.pulls[pullIndex][creatureIndex].indexOf(cloneIndex + 1))
            // use null instead of empty arrays
            if (!this.tableData.value.pulls[pullIndex][creatureIndex].length) {
              this.$set(this.tableData.value.pulls[pullIndex], creatureIndex, null)
            }
            this.$delete(this.enemies[creatureIndex].clones[cloneIndex], 'pull')
          }
        })
      })
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
      this.selectedAffixes = this.mdtDungeonTable.affixWeeks[week]
      this.tableData.week = week + 1
      this.updateTableString()
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

    isSeasonalAffixClone (clone) {
      if (!clone || !clone.infested) {
        return false
      }
      var week = this.tableData.week % 3
      if (!week) {
        week = 3
      }
      week--

      return !!clone.infested[week]
    },

    isCreatureNoTarget (creatureID) {
      if (this.mapID === 15 && this.tableData.freeholdCrewSelected) {
        var i = this.freeholdCrew(true)
        if (this.mdtDungeonTable.freeholdCrews[i] && this.mdtDungeonTable.freeholdCrews[i][creatureID]) {
          return true
        }
      }
      return false
    },

    calcEnemyHealth (creature, shorten) {
      var mult = 1
      if (creature.boss && this.isTyrannicalSelected()) mult = 1.4
      else if (!creature.boss && this.isFortifiedSelected()) mult = 1.2
      mult = Math.round((1.08 ^ (this.mdtLevel - 2)) * mult, 2)

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

    createPull () {
      this.tableData.value.pulls.push(new Array(this.enemies.length))
      this.currentPull = this.tableData.value.pulls.length - 1
      this.updatePullDetails(this.currentPull)
      this.$nextTick(() => {
        var o = document.getElementById('mdtOptions')
        o.scrollTop = o.scrollHeight
      })
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

    pullPercent (pullIndex, runningTotal, targets) {
      var required = this.mdtDungeonTable.dungeonTotalCount[this.mapID]
      var max
      if (required.teemingEnabled && this.isTeemingSelected()) {
        max = required.teeming
      }
      else {
        max = required.normal
      }

      if (!targets) {
        targets = this.pullEnemyList(pullIndex, true)
      }
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
      var groups = {}
      var targets = {}
      var isTeeming = this.isTeemingSelected()

      this.tableData.value.pulls[pullIndex].forEach((clones, enemyIndex) => {
        if (!clones || !this.enemies[enemyIndex].clones) {
          return
        }
        clones.forEach((cloneIndex) => {
          cloneIndex--
          if (!this.enemies[enemyIndex].clones[cloneIndex] || (this.enemies[enemyIndex].clones[cloneIndex].teeming && !isTeeming) || (this.enemies[enemyIndex].clones[cloneIndex].faction && this.tableData.faction !== this.enemies[enemyIndex].clones[cloneIndex].faction) || this.isCreatureNoTarget(this.enemies[enemyIndex].id)) {
            // if clone is set to current pullIndex, remove it
            if (this.enemies[enemyIndex].clones[cloneIndex] === pullIndex) {
              this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', -1)
            }
            return
          }

          // add pull data
          this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', pullIndex)

          groups[this.enemies[enemyIndex].clones[cloneIndex].g] = groups[this.enemies[enemyIndex].clones[cloneIndex].g] || []
          let meta = Object.assign({}, this.enemies[enemyIndex])
          meta.clones = null
          meta.cloneIndex = cloneIndex
          meta.enemyIndex = enemyIndex
          groups[this.enemies[enemyIndex].clones[cloneIndex].g].push(meta)

          // setup targets obj for horizontal list
          targets[this.enemies[enemyIndex].name] = targets[this.enemies[enemyIndex].name] || { count: 0, forces: this.enemies[enemyIndex].count, boss: this.enemies[enemyIndex].isBoss, enemyIndex: enemyIndex }
          targets[this.enemies[enemyIndex].name].count++
          if (!targets._groups) {
            targets._groups = [this.enemies[enemyIndex].clones[cloneIndex].g]
          }
          else if (targets._groups.indexOf(this.enemies[enemyIndex].clones[cloneIndex].g) === -1) {
            targets._groups.push(this.enemies[enemyIndex].clones[cloneIndex].g)
          }
        })
      })

      var details = {groups: []}
      for (let g in groups) {
        if (!groups.hasOwnProperty(g)) continue
        details.groups.push({g: g, targets: groups[g]})
      }

      var hList = ''
      for (let name in targets) {
        if (!targets.hasOwnProperty(name) || name === '_groups') continue
        if (targets[name].boss) hList = hList + '💀' + name + ', '
        else hList = hList + targets[name].count + 'x ' + name + ', '
      }
      details.hList = hList.slice(0, -2)

      details.percent = this.pullPercent(pullIndex, false, targets)
      details.percentRunningTotal = this.pullPercent(pullIndex, true, targets)

      this.pullDetails.splice(pullIndex, 1, details)
    },

    freeholdCrew (index) {
      var week = this.tableData.week % 3
      if (!week) {
        week = 3
      }
      if (index) {
        return week - 1
      }
      switch (week) {
        case 1: return 'Blacktooth'
        case 2: return 'Bilge Rats'
        case 3: return 'Cutwater'
      }
    },

    setPOITooltip (poi, text) {
      if (!poi) {
        this.cursorTooltipX = -1000
        this.cursorTooltipY = -1000
        this.tooltipPOI = ''
        return
      }

      var lines = []
      if (text) lines = text.split(/\n/g)
      else if (poi.type === 'door' && poi.doorDescription) lines.push(poi.doorDescription.replace('\\n', '<br>'))
      else if (poi.type === 'door' && poi.lockpick) lines.push('<span class="lockedDoor">' + this.$t('Locked') + '</span>')
      else if (poi.type === 'graveyard' && poi.graveyardDescription) lines.push(poi.graveyardDescription.replace('\\n', '<br>'))
      else if (poi.type === 'generalNote' && poi.text) lines.push(poi.text.replace('\\n', '<br>'))
      else if (poi.n && poi.d && poi.d[4]) lines.push(poi.d[4].replace('\\n', '<br>')) // user note

      this.tooltipEnemy = ''
      this.tooltipPOI = `<span>${lines.join('<br></span><span>')}</span>`
      this.$nextTick(() => {
        this.moveTooltip()
      })
    },

    clickPOI (poi, id) {
      if (!poi) {
        return
      }
      if (!isNaN(poi.mapLink)) {
        this.subMapID = poi.mapLink
      }
      // if user note
      else if (poi.n && poi.d) {
        this.userNoteEditOpen(poi.d[4], {objID: id})
      }
    },

    linePointsXY (points) {
      return points.map(x => Math.abs(x) * this.mdtScale)
    },

    linePointsObjXY (points) {
      var a = []
      points.forEach((coords) => {
        a.push(coords.x * this.mdtScale)
        a.push(-coords.y * this.mdtScale)
      })
      return a
    },

    setAnnotate (mode) {
      this.annotationMode = mode
      var stage = this.$refs.mdtStage.getStage()

      switch (mode) {
        case 'freedraw':
        case 'line':
        case 'arrow':
          this.annotationClass = 'annotate-crosshair'
          stage.draggable(false)
          break

        case 'note':
          this.annotationClass = 'annotate-note'
          stage.draggable(false)
          break

        case 'standard':
          stage.draggable(true)
          this.annotationClass = 'standard'
          break

        default:
          this.annotationClass = 'standard'
      }
    },

    userNoteEditOpen (text, poiMeta) {
      this.userNoteEditText = text
      this.editPoiMeta = poiMeta
      this.$refs.userNoteEdit.open()
    },

    userNoteEditClose (save) {
      this.$refs.userNoteEdit.close()
      if (save) {
        var obj
        if (isNaN(this.editPoiMeta.objID)) {
          obj = {n: true, d: [this.editPoiMeta.x, this.editPoiMeta.y, 1, true, this.userNoteEditText]}
          this.tableData.objects.push(obj)
        }
        else {
          obj = this.tableData.objects[this.editPoiMeta.objID]
          obj.d[4] = this.userNoteEditText
          this.$set(this.tableData.objects, this.editPoiMeta.objID, obj)
        }
        this.updateTableString()
      }
    },

    saveChanges () {
      this.$refs['saveChangesDialog'].close()
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      if (this.aceEditor) {
        post.json = this.aceEditor.getValue()
      }
      else {
        post.json = this.tableString
      }
      post.newVersion = this.newImportVersion.semver
      var vue = this
      this.http.post('/import/json/save', post).then((res) => {
        if (res.success) {
          window.eventHub.$emit('showSnackBar', this.$t('Wago saved successfully'))
          vue.$router.push('/' + vue.wago.slug)
          this.$emit('set-has-unsaved-changes', false)
          if (res.encoded) {
            this.$emit('update-encoded', res.encoded)
          }
          if (res.latestVersion) {
            this.$set(this.latestVersion, 'semver', semver.valid(semver.coerce(res.latestVersion)))
            this.$set(this.latestVersion, 'major', semver.major(this.latestVersion.semver))
            this.$set(this.latestVersion, 'minor', semver.minor(this.latestVersion.semver))
            this.$set(this.latestVersion, 'patch', semver.patch(this.latestVersion.semver))
            this.$emit('update-version', res.latestVersion)
          }
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
      if (this.aceEditor) {
        this.tableString = this.aceEditor.getValue()
      }
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
    },
    konvaStageConfig: () => {
      return {width: document.getElementById('builder') && document.getElementById('builder').offsetWidth || 0, height: 768}
    }
  }
}
</script>

<style>
#builder, #mdtStage { width: 100% }
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
#builder canvas { position: absolute; left: 0; top: 0; width:60%; max-width: 1000px; height: 768px; max-height: 768px; }
#stageContainer { max-width:1000px; width:60%; height:768px; position: relative; flex: 2 }
#mdtOptions { margin: 0; overflow: hidden; width: 100%; height: 768px; overflow-y: auto;}
#mdtOptions .md-sidenav-content { min-width: 75%; }
.inlineContainer { display: inline-flex; flex-direction: row; flex-wrap: wrap; }
.affix { padding-right: 6px; padding-bottom: 4px; white-space: nowrap; line-height:36px; display: inline; }
.affix img { width: 22px; height: 22px; }
#selectAffixWeek { position: relative; }
.affixWeek { margin-top: -22px; }
.affixMeta { color: rgba(128,128,128,.6); font-size: 12px; position: absolute; left: 16px; top: 24px; }
#changeAffixesBtn { margin-top: 0; }
#mdtPulls .md-progress { margin-top: 4px }
#mdtPulls .selected > div { background-color: rgba(99, 233, 30, 0.1); padding-top: 16px }
#mdtPulls .selected > button { display: none }
#mdtPulls .md-list-text-container > * { white-space: normal }
.mdtGroupDetails > div { margin: 15px 0; }
.mdtGroupDetails .groupnum:before { content: 'Group'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .singlepull:before { content: 'Singles'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .groupnum, .mdtGroupDetails .singlepull { position: relative; font-size: 26px; width: 1.7em; display: inline-block; text-align: right; padding-right: 6px; }
.mdtGroupDetails .enemyPortrait { margin-top: -9px; width:32px; height:32px; z-index:99 }
#mdtTooltip { z-index: 100; position: fixed; padding: 16px; background: rgba(0, 0, 0, .8); border: 2px solid black; color: white; }
#mdtTooltip .tooltipPOI { max-width: 240px }
#mdtTooltip .tooltipPOI span + span { font-size: 90%; color: #DDD }
#mdtTooltip .tooltipEnemy { width: 210px; position: relative; }
#mdtTooltip .tooltipEnemy .enemyPortrait { position: absolute; left: -48px; top: -48px; border: 2px solid black; }
#mdtAnnotateMenu { position: absolute; top: 36px; left: 18px; width: 50px; height: 200px; border: 1px solid black; background: #212121; opacity: .9 }
#mdtAnnotateMenu .md-button-toggle { padding: 0}
#mdtAnnotateMenu button, #mdtAnnotateMenu button .md-ink-ripple { padding: 2px; width: 24px; min-width: 24px; max-width: 24px; height: 24px; min-height: 24px; max-height: 24px; }
#mdtAnnotateMenu button i.md-icon { font-size: 18px; margin: 0; }
#mdtEditNote .md-input-container { padding: 16px }
#mdtEditNote .md-input-container:after { margin: 0 16px }
#builder.annotate-crosshair { cursor: crosshair }
#builder.annotate-note { cursor: cell }
#saveChangesDialog .md-dialog { min-width: 40% }
</style>
