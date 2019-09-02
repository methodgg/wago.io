<template>
  <div id="build-mdt">
    <div class="flex-container" v-if="mdtDungeonTable.dungeonSubLevels">
      <div class="flex-col flex-left">
        <md-input-container>
          <label for="subMap">{{ "Map" }}</label>
          <md-select name="subMap" id="subMap" v-model="subMapID" v-if="mdtDungeonTable.dungeonSubLevels.length > 1">
            <template v-for="(name, id) in mdtDungeonTable.dungeonSubLevels">
              <md-option :value="id">{{ name }}</md-option>
            </template>
          </md-select>
          <md-input v-else readonly :value="mdtDungeonTable.dungeonSubLevels[0]"></md-input>
        </md-input-container>
      </div>
      <div class="flex-col flex-right" style="position:relative" v-if="!readonly">
        <md-input-container class="md-hide-small-and-up" id="mobilePull" v-if="currentPull >= 0">
          <md-input readonly :value="$t('Pull [-num-]', {num: currentPull + 1})"></md-input>
        </md-input-container>
        <md-button id="wago-options-toggle" class="md-icon-button md-raised md-hide-small-and-up" @click="toggleMDTOptions">
          <md-icon>more_horiz</md-icon>
        </md-button>
        <md-button class="md-hide-xsmall" @click="exportChanges" v-if="wago._id"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button class="md-hide-xsmall" v-if="canEdit" @click="$refs['saveChangesDialog'].open()" ref="saveChangesButton"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
        <md-button class="md-hide-xsmall" v-if="scratch" @click="saveFromScratch"><md-icon>save</md-icon> {{ $t("Save MDT") }}</md-button>
      </div>
      <div class="flex-col flex-right" style="position:relative" v-if="readonly">
        <template v-for="(affixID, k) in selectedAffixes">
          <span v-html="displayAffix(affixID)" class="topaffix"></span>
        </template>
        <md-button class="md-raised" disabled id="sumPct">
          <md-icon>functions</md-icon>
          <strong v-if="pullDetails.length">{{ Math.round(100*pullDetails[pullDetails.length - 1].percentRunningTotal)/100 }}%</strong>
          <strong v-else>0%</strong>
        </md-button>
        <md-button v-if="screenWidth < 800" id="wago-options-toggle" class="md-icon-button md-raised" @click="toggleMDTOptions">
          <md-icon>more_horiz</md-icon>
        </md-button>
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
          <ui-loading v-if="mdtLoading || !tableData"></ui-loading>
          <v-stage v-else-if="konvaStageConfig.width > 0" ref="mdtStage" id="mdtStage" :config="konvaStageConfig" @scroll.passive="zoomStage">
            <slot>1</slot> <!-- defined slots prevent Konva from spamming "<div>undefined</div>" -->
            <v-layer ref="mdtMap" v-if="mdtDungeonTable.dungeonSubLevels">
              <slot>1</slot>
              <template v-if="mapTiles.length" v-for="(tile, i) in mapTiles">
                <slot>1</slot>
                <v-image :config="tile" />
              </template>
              <template v-for="(poi, i) in mdtDungeonTable.mapPOIs[subMapID]">
                <slot>1</slot>
                <mdt-poi :data="poi" :mdtScale="mdtScale" :mapID="mapID" @mouseover="setPOITooltip" @mouseout="setPOITooltip(null)" @mousemove="moveTooltip" @click="clickPOI" />
              </template>
              <template v-for="(creature, i) in enemies">
                <slot>1</slot>
                <template v-if="creature">
                  <template v-for="(clone, j) in creature.clones">
                    <slot>1</slot>
                    <v-line v-if="clone && clone.patrol && clone.sublevel === subMapID + 1 && (!clone.teeming || (clone.teeming && isTeemingSelected())) && (!clone.week || clone.week.indexOf(tableData.week)) && (!clone.faction || (clone.faction === tableData.faction))"
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
              </template>
              <v-image
                :config="{
                  image: enemyPortraitMap,
                  scaleX: 1/5,
                  scaleY: 1/5,
                  listening: false
                }"
              />
              <template v-for="(creature, i) in enemies">
                <slot>1</slot>
                <template v-if="creature">
                  <slot>1</slot>
                  <template v-for="(clone, j) in creature.clones">
                    <slot>1</slot>
                    <v-circle v-if="clone && (!clone.sublevel || clone.sublevel === subMapID + 1) && (!clone.teeming || (clone.teeming && isTeemingSelected())) && (!clone.week || clone.week.indexOf(tableData.week)) && (!clone.faction || (clone.faction === tableData.faction))"
                      @click="selectCreature(i, j)"
                      @tap="selectCreature(i, j)"
                      @mouseover="setTargetHover(creature, clone, j)"
                      @mouseleave="setTargetHover()"
                      @mousemove="moveTooltip()"
                      :config="{
                        x: clone.x * mdtScale,
                        y: clone.y * -mdtScale,
                        radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1) * (mdtDungeonTable.scaleMultiplier || 1)) / mdtScale,
                        fill: isCreatureNoTarget(creature.id) ? 'rgba(33, 33, 33, 0.6)' :
                              clone.hover ? hexToRGB(clone.color, 0.65) :
                              clone.pull >= 0 ? hexToRGB(clone.color, 0.4) :
                              'rgba(0, 0, 0, 0)',
                        stroke: isCreatureNoTarget(creature.id) ? '#333333' :
                                isInfested(clone) ? 'red' :
                                creature.isBoss ? 'gold' :
                                'black',
                        strokeWidth: .5,
                        strokeEnabled: ((creature.isBoss && isCreatureNoTarget(creature.id)) || isInfested(clone)),
                        shadowColor: 'white',
                        shadowOpacity: 1,
                        shadowEnabled : clone.hoverAvatar || false,
                        shadowOffset: {x: 0, y: 0},
                        shadowBlur: 10,
                      }"
                    />
                  </template>
                </template>
              </template>
              <v-circle v-if="hoverSpecific.cloneIndex >= 0"
                :config="{
                  x: enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex].x * mdtScale,
                  y: enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex].y * -mdtScale,
                  radius: Math.round(7 * enemies[hoverSpecific.creatureIndex].scale * (enemies[hoverSpecific.creatureIndex].isBoss ? 1.7 : 1) * (mdtDungeonTable.scaleMultiplier || 1)) / mdtScale,
                  stroke: isInfested(enemies[hoverSpecific.creatureIndex].clones[hoverSpecific.cloneIndex]) ? 'red' : (enemies[hoverSpecific.creatureIndex].isBoss ? 'gold' : 'black'),
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
                <mdt-poi v-if="obj && obj.n && obj.d && obj.d[2] === subMapID + 1" :data="obj" :annotationsIndex="id" :mdtScale="mdtScale" :mapID="mapID" @mouseover="setPOITooltip(obj); setSelectedMoveAnnotation(id)" @mouseout="setPOITooltip(null); setSelectedMoveAnnotation(null)" @mousemove="moveTooltip" @click="clickPOI(obj, id)" />
                <!-- arrow -->
                <v-arrow v-else-if="obj && obj.t && obj.l && obj.l.length >= 4 && obj.d[2] === subMapID + 1 && obj.d[3]" @mouseover="setSelectedMoveAnnotation(id)" @mouseout="setSelectedMoveAnnotation(null)" :config="{
                  points: linePointsXY(obj.l),
                  strokeWidth: Math.max(obj.d[0] * 0.4, (id === selectedMoveAnnotationID ? 2 : 0)),
                  stroke: '#' + (id === selectedMoveAnnotationID ? '0288D1' : obj.d[4]),
                  fill: '#' + (id === selectedMoveAnnotationID ? '0288D1' : obj.d[4])
                }"/>
                <!-- line -->
                <v-line v-else-if="obj && obj.l && obj.l.length >= 4 && obj.d[2] === subMapID + 1 && obj.d[3]" @mouseover="setSelectedMoveAnnotation(id)" @mouseout="setSelectedMoveAnnotation(null)" :config="{
                  points: linePointsXY(obj.l),
                  strokeWidth: Math.max(obj.d[0] * 0.4, (id === selectedMoveAnnotationID ? 2 : 0)),
                  stroke: '#' + (id === selectedMoveAnnotationID ? '0288D1' : obj.d[4]),
                  tension: .3
                }"/>
                <!-- ring -->
                <!-- triangle -->
              </template>
            </v-layer>
          </v-stage>
        </div>
        <div id="mdtAnnotateMenu" v-if="!mdtLoading && !readonly">
          <div class="annotate-label">{{ $t('Tools') }}</div>
          <md-button-toggle md-single class="md-primary">
            <div class="md-icon-button md-toggle" ref="annotate-standard" @click="setAnnotate('standard')" @mouseover="setPOITooltip('annotation', $t('Selection Tool'))" @mouseout="setPOITooltip(null)">
              <md-ink-ripple />
              <md-icon style="transform:rotate(-65deg); margin-top:-2px">near_me</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-freedraw" @click="setAnnotate('freedraw')" @mouseover="setPOITooltip('annotation', $t('Pencil Tool'))" @mouseout="setPOITooltip(null)">
              <md-ink-ripple />
              <md-icon>edit</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-note" @click="setAnnotate('note')" @mouseover="setPOITooltip('annotation', $t('Create Note Tool'))" @mouseout="setPOITooltip(null)">
              <md-ink-ripple />
              <md-icon>receipt</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-line" @click="setAnnotate('line')" @mouseover="setPOITooltip('annotation', $t('Line Tool'))" @mouseout="setPOITooltip(null)">
              <md-ink-ripple />
              <md-icon style="transform:rotate(-45deg); font-size: 28px; margin-left: -5px; margin-top: -2px">remove</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-arrow" @click="setAnnotate('arrow')" @mouseover="setPOITooltip('annotation', $t('Arrow Tool'))" @mouseout="setPOITooltip(null)">
              <md-icon>call_made</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-box" @click="setAnnotate('box')" @mouseover="setPOITooltip('annotation', $t('Box Tool'))" @mouseout="setPOITooltip(null)">
              <md-icon style="margin:">check_box_outline_blank</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-move" @click="setAnnotate('move')" @mouseover="setPOITooltip('annotation', $t('Move Object Tool'))" @mouseout="setPOITooltip(null)" >
              <md-ink-ripple />
              <md-icon style="transform:rotate(-45deg); margin-top:-2px; margin-left: 1px">zoom_out_map</md-icon>
            </div>
            <div class="md-icon-button" ref="annotate-eraser" @click="setAnnotate('eraser', $event)" @mouseover="setPOITooltip('annotation', $t('Eraser Tool\nShift click to clear all annotations'))" @mouseout="setPOITooltip(null)" >
              <md-ink-ripple />
              <md-icon>remove_circle_outline</md-icon>
            </div>
          </md-button-toggle>
          <div id="stroke-input" @mouseover="setPOITooltip('annotation', $t('Set Line Width'))" @mouseout="setPOITooltip(null)">
            <button @click="paintingStrokeWidth = Math.max(paintingStrokeWidth - 1, 1)">-</button>
            <input min="1" max="20" v-model="paintingStrokeWidth" type="number">
            <button @click="paintingStrokeWidth = Math.min(paintingStrokeWidth + 1, 20)">+</button>
          </div>
          <div id="color-input" @mouseover="setPOITooltip('annotation', $t('Set Line Color'))" @mouseout="setPOITooltip(null)">
            <button @click="showColorPicker" v-bind:style="{'background-color': paintingStrokeColor.hex}"></button>
          </div>
          <div v-if="isColorPickerOpen" id="color-picker">
            <color-picker v-model="paintingStrokeColor" :disableAlpha="true" />
          </div>
        </div>
      </md-layout>
      <md-layout id="mdtOptions" md-vertical-align="start" v-bind:class="{'hidden': hideMobileOptions}">
        <md-card v-if="!mdtLoading">
          <md-card-area v-if="!readonly" class="md-hide-small-and-up">
            <md-button @click="exportChanges" v-if="wago._id"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
            <md-button v-if="canEdit" @click="$refs['saveChangesDialog'].open()" ref="saveChangesButton"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
          </md-card-area>

          <md-card-area v-if="!readonly">
            <div class="inlineContainer">
              <template v-for="(affixID, k) in selectedAffixes">
                <span v-html="displayAffix(affixID)" class="affix"></span>
              </template>
              <md-button class="md-raised md-accent" @click="toggleAffixSelection" id="changeAffixesBtn">{{ $t("Change Affixes") }}</md-button>
              <md-button class="md-raised" disabled id="sumPct"><md-icon>functions</md-icon>
                <span v-if="pullDetails.length">{{ Math.round(100*pullDetails[pullDetails.length - 1].percentRunningTotal)/100 }}%</span>
                <span v-else>0%</span>
              </md-button>
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
                <md-list-item class="mdt-pull" v-bind:class="{selected: currentPull === pull - 1}" @click="selectPull(pull - 1)" v-bind:style="{'border-left-color': '#' + (pullDetails[pull - 1].color || '228b22'), 'background-color': currentPull === pull - 1 ? hexToRGB(pullDetails[pull - 1].color, 0.1) : null}">
                  <div class="md-list-text-container" v-if="pullDetails[pull - 1]">
                    <span>{{ $t('Pull [-num-]', { num : pull}) }}; {{ pullDetails[pull - 1].percent }}%</span>
                    <span v-html="pullDetails[pull - 1].hList"></span>
                    <md-progress :md-progress="pullDetails[pull - 1].percentRunningTotal"></md-progress>
                    <div v-show-slide="currentPull === pull - 1" class="mdtGroupDetails">
                      <div v-for="(details, detailIndex) in pullDetails[pull - 1].groups">
                        <span v-if="parseInt(details.g)" class="groupnum">{{ details.g }}</span>
                        <span v-else class="singlepull">➽</span>
                        <template v-for="(target, targetIndex) in details.targets">
                          <mdt-enemy-portrait :size="36" :mapID="mapID" :offset="getEnemyPortraitOffset(target.enemyIndex, 36)" :seasonalAffix="isInfested(target.clone)"
                            @mouseover="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, true)"
                            @mouseleave="setTargetHoverAvatar(pull - 1, detailIndex, targetIndex, false)"
                          />
                        </template>
                      </div>
                    </div>
                  </div>
                </md-list-item>
              </div>
              <template v-for="reapPct in reapingPercents">
                <div class="reaping-pull" v-if="isReapingSelected() && reapingPullDetails[reapPct] && reapingPullDetails[reapPct].pull === pull && reapingPullDetails[reapPct].targets && reapingPullDetails[reapPct].targets.length"
                  @mouseover="setReapingHover(pull - 1)" @mouseleave="setTargetHover()">
                  <md-list-item v-bind:class="{selected: currentReapingPull === reapPct}"
                    @click="selectReapingPull(reapPct)">
                    <div class="md-list-text-container">
                      <span>{{ $t('Reaping [-num-]%', { num : reapPct}) }}</span>
                      <span v-html="reapingPullDetails[reapPct].hList"></span>
                      <div v-show-slide="currentReapingPull === reapPct" class="mdtGroupDetails">
                        <div>
                          <template v-for="(iconURL, targetIndex) in reapingPullDetails[reapPct].targets">
                            <div :style="{'background-image': 'url(' + iconURL + ')'}" class="reapingTargetIcon"></div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </md-list-item>
                </div>
              </template>
            </template>
            <md-list-item @click="createPull()" style="margin-bottom: 16px" v-if="!readonly">
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
    <export-modal v-if="!readonly" :json="tableString" :type="wago.type" :showExport="showExport" :wagoID="wago._id" @hideExport="hideExport"></export-modal>
    <div id="mdtTooltip" v-if="tooltipPOI || tooltipEnemy.name" v-bind:style="{top: cursorTooltipY + 'px', left: cursorTooltipX + 'px'}">
      <div class="tooltipPOI" v-if="tooltipPOI" v-html="tooltipPOI.replace(/\\n/g, '<br>')"></div>
      <div class="tooltipEnemy" v-else-if="tooltipEnemy.name">
        <mdt-enemy-portrait :size="56" :mapID="mapID" :offset="getEnemyPortraitOffset(tooltipEnemy.enemyIndex, 56)" />
        <span v-if="tooltipEnemy.isBoss" style="margin-left:-3px">💀 </span><strong>{{ tooltipEnemy.name }}</strong>
        <span>{{ $t('Level [-level-] [-type-]', {level: tooltipEnemy.level, type: tooltipEnemy.creatureType}) }}</span>
        <span>{{ $t('[-hp-] HP @ +10', {hp: calcEnemyHealth(tooltipEnemy, true)}) }}</span>
        <span v-if="tooltipEnemy.clone && isReapingSelected() && tooltipEnemy.reaping" style="color:#8f6dd3" v-html="$t('Reaping [-spirit-]', {spirit: displayReaping(tooltipEnemy.reaping), interpolation: { escapeValue: false }})"></span>
        <span v-if="tooltipEnemy.clone && isInfested(tooltipEnemy.clone)" style="color:red">{{ $t('Infested') }}</span>
        <span v-if="tooltipEnemy.clone && tooltipEnemy.clone.g > 0">{{ $t('Group [-num-]', {num: tooltipEnemy.clone.g}) }}</span>
        <span v-if="tooltipEnemy.clone && tooltipEnemy.clone.pull >= 0">{{ $t('Pull [-num-]', {num: tooltipEnemy.clone.pull + 1}) }}</span>
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

<script>
const semver = require('semver')
const async = require('async')

export default {
  name: 'build-mdt',
  props: ['scratch', 'readonly'],
  data: function () {
    return {
      mdtScale: 539 / 450, // 1.197777 repeating, of course. Found by trial and error; there may be something that more accurately scales wow pixels into real pixels, but this is very close.
      mdtLoading: true,
      tableString: this.$store.state.wago.code.json,
      tableData: JSON.parse(this.$store.state.wago.code.json),
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
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
        117: { name: 'Reaping', icon: 'Ability_Racial_EmbraceoftheLoa_Bwonsomdi' },
        119: { name: 'Beguiling', icon: 'Spell_Shadow_MindShear' }
      },
      currentPull: -1,
      reapingPercents: [20, 40, 60, 80, 100],
      reapingPullDetails: {},
      currentReapingPull: -1,
      annotationMode: false,
      annotationClass: 'standard',
      isPainting: false,
      paintingContext: null,
      paintingPosition: {},
      paintingStrokeWidth: 3,
      paintingStrokeColor: {hex: '#FFFFFF'},
      selectedMoveAnnotationID: null,
      moveStartCoords: {},
      hideMobileOptions: false,
      isColorPickerOpen: false,
      userNoteEditText: '',
      editPoiID: -1,
      screenWidth: window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth,
      konvaStageConfig: {},
      checkKonvaSize: null,
      stageEvents: false
    }
  },
  created: function () {
    this.hideMobileOptions = (this.screenWidth < 800)
    this.mapID = this.tableData.value.currentDungeonIdx - 1
    if (this.$store.state.mdtDungeonTable) {
      this.mdtDungeonTable = this.$store.state.mdtDungeonTable
    }
    this.checkKonvaSize = setInterval(this.updateKonvaSize, 100)

    this.http.get('/data/mdtDungeonTable-' + this.mapID).then((res) => {
      if (res && res.value) {
        this.mdtDungeonTable = res.value
        this.$store.commit('saveMDT', this.mdtDungeonTable)
        this.init()
      }
    })
  },
  destroyed () {
    window.removeEventListener('resize', this.setMap)
    clearInterval(this.checkKonvaSize)
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
    'input-semver': require('../UI/Input-Semver.vue'),
    'color-picker': require('vue-color').Chrome
  },
  mounted () {
    this.latestVersion.semver = semver.valid(semver.coerce(this.wago.versions.versions[0].versionString))
    this.latestVersion.major = semver.major(this.latestVersion.semver)
    this.latestVersion.minor = semver.minor(this.latestVersion.semver)
    this.latestVersion.patch = semver.patch(this.latestVersion.semver)
  },
  methods: {
    init () {
      if (!this.tableData.week) {
        this.tableData.week = 1
      }
      this.selectedAffixes = this.mdtDungeonTable.affixWeeks[this.tableData.week - 1]
      this.enemies = this.mdtDungeonTable.dungeonEnemies
      for (let i = 0; i < this.enemies.length; i++) {
        if (this.enemies[i]) {
          this.enemies[i].enemyIndex = i
        }
      }
      // boralus make sure faction value is set
      if (this.mapID === 18 && !this.tableData.faction) {
        this.tableData.faction = 1
      }
      // setup pull info
      for (let i = 0; i < this.tableData.value.pulls.length; i++) {
        this.updatePullDetails(i)
      }
      // check webp support and load map
      var testWebp = new Image()
      testWebp.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wAiMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA'
      testWebp.onload = testWebp.onerror = () => {
        this.webpSupport = (testWebp.height === 2)
        this.setMap(this.subMapID)
        window.addEventListener('resize', this.setMap)
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
        if (!this.readonly) {
          this.tableString = JSON.stringify(this.tableData, null, 2)
          this.$store.commit('setWagoJSON', this.tableString)
          this.$emit('set-has-unsaved-changes', true)
        }
      })
    },

    setupStage () {
      var vue = this
      this.isPainting = false

      this.$nextTick().then(function () {
        if (!vue.$refs.mdtStage) {
          return // not ready
        }
        var stage = vue.$refs.mdtStage.getStage()
        var canvas = vue.$refs.canvas
        stage.draggable(true)
        stage.position({x: (1000 - document.getElementById('stageContainer').offsetWidth) * -0.6, y: 0})
        stage.scale({ x: 1, y: 1 })
        stage.batchDraw()

        if (vue.stageEvents) {
          return
        }
        vue.stageEvents = true

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
          if (evt.touches && evt.touches[0] && evt.touches[1]) {
            return
          }
          vue.paintingPosition = stage.getPointerPosition()
          vue.isColorPickerOpen = false
          var scale = stage.scaleX()
          var x = Math.round(((vue.paintingPosition.x - stage.x()) / scale) / vue.mdtScale / 10) * 10
          var y = Math.round(-((vue.paintingPosition.y - stage.y()) / scale) / vue.mdtScale / 10) * 10

          if (vue.annotationMode === 'freedraw' || vue.annotationMode === 'line' || vue.annotationMode === 'arrow' || vue.annotationMode === 'box') {
            vue.isPainting = true
            vue.tableData.objects.push({l: [x, y], d: [vue.paintingStrokeWidth, 1, vue.subMapID + 1, true, vue.paintingStrokeColor.hex.replace(/#/, ''), -8, true]})
          }
          else if (vue.annotationMode === 'note') {
            vue.userNoteEditOpen('', {x, y})
          }
          else if (vue.annotationMode === 'move' && !isNaN(vue.selectedMoveAnnotationID) && vue.tableData.objects[vue.selectedMoveAnnotationID] && vue.tableData.objects[vue.selectedMoveAnnotationID].l) {
            vue.isPainting = true
            vue.moveStartCoords = {x, y, line: JSON.parse(JSON.stringify(vue.tableData.objects[vue.selectedMoveAnnotationID].l))}
          }
          else if (vue.annotationMode === 'move' && !isNaN(vue.selectedMoveAnnotationID) && vue.tableData.objects[vue.selectedMoveAnnotationID] && vue.tableData.objects[vue.selectedMoveAnnotationID].n && vue.tableData.objects[vue.selectedMoveAnnotationID].d) {
            vue.isPainting = true
            vue.moveStartCoords = {x, y, note: JSON.parse(JSON.stringify(vue.tableData.objects[vue.selectedMoveAnnotationID].d))}
          }
          else if (vue.annotationMode === 'eraser') {
            vue.isPainting = true
          }
          else {
            vue.isPainting = false
          }
        })

        var lastDist = 0
        stage.addEventListener('mouseup touchend', (evt) => {
          lastDist = 0
          vue.isPainting = false
          // if line is started but never actually drawn then remove it from the table
          if ((vue.annotationMode === 'freedraw' || vue.annotationMode === 'line' || vue.annotationMode === 'arrow' || vue.annotationMode === 'box') && vue.tableData.objects[vue.tableData.objects.length - 1].l.length <= 3) {
            vue.tableData.objects.pop()
            return
          }
        })

        stage.addEventListener('mousemove touchmove', (evt) => {
          // if two touch points then handle pinch zoom
          if (evt.touches && evt.touches[0] && evt.touches[1]) {
            const dist = vue.getDistance({x: evt.touches[0].clientX, y: evt.touches[0].clientY}, {x: evt.touches[1].clientX, y: evt.touches[1].clientY})
            if (!lastDist) {
              lastDist = dist
              return
            }
            const oldScale = stage.getScaleX()
            const newScale = stage.getScaleX() * dist / lastDist
            if (newScale === oldScale) {
              return
            }
            lastDist = dist

            const posX = ((evt.touches[0].clientX + evt.touches[1].clientX) / 2)
            const posY = ((evt.touches[0].clientY + evt.touches[1].clientY) / 2)
            const zoomTo = {
              x: (posX - stage.x()) / oldScale,
              y: (posY - stage.y()) / oldScale
            }
            stage.scale({ x: newScale, y: newScale })
            const newPos = {
              x: -(zoomTo.x - posX / newScale) * newScale,
              y: -(zoomTo.y - posY / newScale) * newScale
            }
            stage.position(newPos)
            stage.draw()
            return
          }
          if (!vue.isPainting) {
            return
          }

          var pos = stage.getPointerPosition()
          var scale = stage.scaleX()
          var x = Math.round((((pos.x - stage.x()) / scale) / vue.mdtScale) * 10) / 10
          var y = Math.round((-((pos.y - stage.y()) / scale) / vue.mdtScale) * 10) / 10
          if (x < 0 || y > 0) {
            return
          }
          else if (Math.abs(pos.x - x) < 10 && Math.abs(pos.y - y) < 10) {
            return
          }

          var thisObj = vue.tableData.objects.length - 1
          if (!isNaN(vue.selectedMoveAnnotationID) && vue.tableData.objects[vue.selectedMoveAnnotationID]) {
            thisObj = vue.selectedMoveAnnotationID
          }

          if (vue.annotationMode === 'freedraw') {
            vue.tableData.objects[thisObj].l.push(x)
            vue.tableData.objects[thisObj].l.push(y)
            vue.tableData.objects[thisObj].l.push(x)
            vue.tableData.objects[thisObj].l.push(y)
          }
          else if (vue.annotationMode === 'line' || vue.annotationMode === 'arrow') {
            var startX = vue.tableData.objects[thisObj].l[0]
            var startY = vue.tableData.objects[thisObj].l[1]
            // break line into segments so eraser tool works as expected
            var d = vue.getDistance({x, y}, {x: startX, y: startY})
            var numSegments = Math.max(1, d * 2 / Math.max(5, vue.paintingStrokeWidth))
            var line = []
            var currX = startX
            var currY = startY
            for (let i = 1; i <= numSegments; i++) {
              var t = i / numSegments
              var newX = startX + t * (x - startX)
              var newY = startY + t * (y - startY)
              line.push(Math.round(currX * 10) / 10)
              line.push(Math.round(currY * 10) / 10)
              line.push(Math.round(newX * 10) / 10)
              line.push(Math.round(newY * 10) / 10)
              currX = newX
              currY = newY
            }
            line.push(Math.round(currX * 10) / 10)
            line.push(Math.round(currY * 10) / 10)
            line.push(Math.round(x * 10) / 10)
            line.push(Math.round(y * 10) / 10)
            vue.$set(vue.tableData.objects[thisObj], 'l', line)
            // vue.tableData.objects[thisObj].l.splice(2, 2, x, y)

            if (vue.annotationMode === 'arrow') {
              vue.$set(vue.tableData.objects[thisObj], 't', [Math.atan2(vue.tableData.objects[thisObj].l[1] - y, vue.tableData.objects[thisObj].l[0] - x)])
            }
          }
          else if (vue.annotationMode === 'box') {
            var start = {x: vue.tableData.objects[thisObj].l[0], y: vue.tableData.objects[thisObj].l[1]}
            vue.$set(vue.tableData.objects[thisObj], 'l', [start.x, start.y, x, start.y, x, start.y, x, y, x, y, start.x, y, start.x, y, start.x, start.y])
          }
          else if (vue.annotationMode === 'move' && (vue.moveStartCoords.line || vue.moveStartCoords.note)) {
            var diff = {x: x - vue.moveStartCoords.x, y: y - vue.moveStartCoords.y}
            if (vue.moveStartCoords.line) {
              for (let i = 0; i < vue.moveStartCoords.line.length; i++) {
                if (i % 2 === 0) { // x value
                  vue.$set(vue.tableData.objects[thisObj].l, i, parseInt(vue.moveStartCoords.line[i]) + diff.x)
                }
                else { // y value
                  vue.$set(vue.tableData.objects[thisObj].l, i, parseInt(vue.moveStartCoords.line[i]) + diff.y)
                }
              }
            }
            else if (vue.moveStartCoords.note) {
              vue.$set(vue.tableData.objects[thisObj].d, 0, parseInt(vue.moveStartCoords.note[0]) + diff.x)
              vue.$set(vue.tableData.objects[thisObj].d, 1, parseInt(vue.moveStartCoords.note[1]) + diff.y)
            }
          }
          else if (vue.annotationMode === 'eraser' && vue.tableData.objects && vue.tableData.objects.length) {
            // scan all objects and see if any points are close enough to cursor
            let zoom = vue.$refs.mdtStage.getStage().scaleX()
            for (let oi = 0; oi < vue.tableData.objects.length; oi++) {
              if (vue.tableData.objects[oi].l) {
                for (let i = 0; i <= vue.tableData.objects[oi].l.length; i = i + 4) {
                  let d = vue.getDistance({x, y}, {x: vue.tableData.objects[oi].l[i], y: vue.tableData.objects[oi].l[i + 1]})
                  if (d / zoom < 5) {
                    vue.tableData.objects[oi].l.splice(i, 4)
                    if (vue.tableData.objects[oi].l.length > i + 3) {
                      // need to split line into two objects
                      let newObj = vue.tableData.objects[oi].l.splice(i + 4, vue.tableData.objects[oi].l.length)
                      vue.tableData.objects.push({l: newObj, d: vue.tableData.objects[oi].d})
                    }
                    else if (!vue.tableData.objects[oi].l.length) {
                      // if line is deleted then remove the object
                      vue.tableData.objects.splice(oi, 1)
                    }
                    return
                  }
                }
              }
            }
          }
          // vue.tableData.objects.splice(thisObj, 1, data)
          vue.paintingPosition = pos
          vue.updateTableString()
        })
      })
    },

    updateKonvaSize () {
      if (!this.mdtDungeonTable.dungeonMaps) {
        return
      }
      var w
      if (this.readonly) {
        w = Math.min(1000, document.body.offsetWidth - 16)
      }
      else {
        w = document.getElementById('builder') && document.getElementById('builder').offsetWidth || 0
      }
      if (!this.konvaStageConfig || w !== this.konvaStageConfig.width) {
        this.konvaStageConfig = {width: w, height: 666, x: (1000 - document.getElementById('stageContainer').offsetWidth) * -0.6}
        this.setMap()
      }
    },

    setMap (subMap, preloaded) {
      if (typeof subMap !== 'number' && this.subMapID >= 0) {
        subMap = this.subMapID
      }
      else if (typeof subMap !== 'number') {
        return
      }
      // setup preload images
      var preload = []
      // var promises = []

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
      var dir = this.mdtDungeonTable.dungeonMaps[0]
      var map = this.mdtDungeonTable.dungeonMaps[subMap + 1]
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
      async.each(preload, (url, done) => {
        var img = new Image()
        img.onload = function () {
          done()
        }
        img.src = url
      }, () => {
        this.setMap(subMap, true)
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
          if (!this.enemies[i].clones[k]) {
            continue
          }
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

    setReapingHover (pullIndex) {
      // highlights all previously pulled enemies
      for (let i = 0; i < this.enemies.length; i++) {
        for (let k = 0; k < this.enemies[i].clones.length; k++) {
          // if hovering over an avatar
          if (pullIndex >= 0 && this.enemies[i].clones[k]) {
            this.$set(this.enemies[i].clones[k], 'hover', this.enemies[i].clones[k].pull <= pullIndex)
          }
        }
      }
    },

    moveTooltip () {
      if (this.tooltipEnemy || this.tooltipPOI) {
        var canvas = document.getElementById('mdtStage').getBoundingClientRect()
        var mouse = this.$refs.mdtStage.getStage().getPointerPosition()
        var box = document.getElementById('mdtTooltip')
        if (!mouse) {
          return
        }
        var x = mouse.x + 10 + canvas.left
        if (x + box.offsetWidth > window.innerWidth - 30) {
          x = mouse.x - 10 + canvas.left - box.offsetWidth
        }
        this.cursorTooltipX = x

        var y = mouse.y - 10 + canvas.top - box.offsetHeight
        if (y < 24) {
          y = mouse.y + 55 + canvas.top
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
      if (this.currentPull < 0 || this.readonly) {
        return
      }

      // if current pull matches clicked target then we'll be removing only, otherwise we'll add unit/group after we remove
      var addToPull = (this.enemies[creatureIndex].clones[cloneIndex].pull !== this.currentPull)
      var previousPull = this.enemies[creatureIndex].clones[cloneIndex].pull

      // if target is part of a group then apply to all creatures in the group
      if (this.enemies[creatureIndex].clones[cloneIndex].g && this.enemies[creatureIndex].clones[cloneIndex].pull >= 0) {
        this.removeGroupFromPull(this.enemies[creatureIndex].clones[cloneIndex].pull, this.enemies[creatureIndex].clones[cloneIndex].g)
      }
      // otherwise just remove the solo creature
      else if (this.tableData.value.pulls[this.currentPull][creatureIndex + 1] && this.enemies[creatureIndex].clones[cloneIndex].pull >= 0) {
        this.$delete(this.tableData.value.pulls[this.currentPull][creatureIndex + 1], this.tableData.value.pulls[this.currentPull][creatureIndex + 1].indexOf(cloneIndex + 1))
        if (!this.tableData.value.pulls[this.currentPull][creatureIndex + 1].length) {
          this.$delete(this.tableData.value.pulls[this.currentPull], creatureIndex + 1)
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
          const enemyIndex = creatureIndex + 1
          if (Array.isArray(this.tableData.value.pulls[this.currentPull][enemyIndex])) {
            this.tableData.value.pulls[this.currentPull][enemyIndex].push(cloneIndex + 1)
          }
          else {
            this.$set(this.tableData.value.pulls[this.currentPull], enemyIndex, [cloneIndex + 1])
          }
          this.$set(this.enemies[creatureIndex].clones[cloneIndex], 'pull', this.currentPull)
        }

        this.updatePullDetails(this.currentPull)
      }

      // update data table
      this.updateTableString()
    },

    addGroupToPull (pullIndex, group) {
      this.enemies.forEach((creature, creatureIndex) => {
        creatureIndex++
        creature.clones.forEach((clone, cloneIndex) => {
          if (clone && clone.g === group) {
            if (Array.isArray(this.tableData.value.pulls[this.currentPull][creatureIndex])) {
              this.tableData.value.pulls[this.currentPull][creatureIndex].push(cloneIndex + 1)
            }
            else {
              this.$set(this.tableData.value.pulls[this.currentPull], creatureIndex, [cloneIndex + 1])
            }
            this.$set(this.enemies[creatureIndex - 1].clones[cloneIndex], 'pull', pullIndex)
          }
        })
      })
    },

    removeGroupFromPull (pullIndex, group) {
      this.enemies.forEach((creature, creatureIndex) => {
        creatureIndex++
        creature.clones.forEach((clone, cloneIndex) => {
          if (clone && clone.g === group && this.tableData.value.pulls[pullIndex][creatureIndex]) {
            this.$delete(this.tableData.value.pulls[pullIndex][creatureIndex], this.tableData.value.pulls[pullIndex][creatureIndex].indexOf(cloneIndex + 1))
            if (!this.tableData.value.pulls[pullIndex][creatureIndex].length) {
              this.$delete(this.tableData.value.pulls[pullIndex], creatureIndex)
            }
            this.$delete(this.enemies[creatureIndex - 1].clones[cloneIndex], 'pull')
          }
        })
      })
    },

    displayAffix (affixID, textonly) {
      if (!this.dungeonAffixes || !this.dungeonAffixes[affixID]) {
        return ''
      }
      if (textonly) {
        return this.dungeonAffixes[affixID].name
      }
      return '<img src="//media.wago.io/wow-ui-textures/ICONS/' + this.dungeonAffixes[affixID].icon + '.PNG" /> ' + this.dungeonAffixes[affixID].name
    },

    toggleAffixSelection () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop
      this.$refs.affixSelection.toggle()
      document.documentElement.scrollTop = document.body.scrollTop = scrollTop
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

    isInfested (clone) {
      if (this.selectedAffixes.indexOf(16) === -1 || !clone || !clone.infested) {
        return false
      }
      var week = this.tableData.week % 3
      if (!week) {
        week = 3
      }
      week--

      return !!clone.infested[week]
    },

    isReapingSelected (clone) {
      return this.selectedAffixes.indexOf(117) >= 0
    },

    isBeguildingSelected (clone) {
      return this.selectedAffixes.indexOf(119) >= 0
    },

    displayReaping (creatureID) {
      const c = this.getReapingCreature(creatureID)
      if (c && c.name && c.portrait) {
        return `<img src="${c.portrait}"/> ${c.name}`
      }
      return ''
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
      this.currentReapingPull = -1
    },
    selectReapingPull (reapingPct) {
      this.currentPull = -1
      this.currentReapingPull = reapingPct
    },

    createPull () {
      this.tableData.value.pulls.push({color: '228b22'})
      this.currentPull = this.tableData.value.pulls.length - 1
      this.updatePullDetails(this.currentPull)
      this.updateReapingPulls()
      this.$nextTick(() => {
        var o = document.getElementById('mdtOptions')
        o.scrollTop = o.scrollHeight
      })
    },

    pullEnemyList (pullIndex, returnObj) {
      var targets = {_groups: []}
      var isTeeming = this.isTeemingSelected()
      for (const _enemyIndex in this.tableData.value.pulls[pullIndex]) {
        if (!this.tableData.value.pulls[pullIndex].hasOwnProperty(_enemyIndex) || !parseInt(_enemyIndex)) {
          continue
        }

        const clones = this.tableData.value.pulls[pullIndex][_enemyIndex]
        const enemyIndex = _enemyIndex - 1

        // validate data
        if (!clones || !this.enemies[enemyIndex] || !this.enemies[enemyIndex].clones) {
          return
        }
        clones.forEach((cloneIndex) => {
          cloneIndex--
          // if not being pulled or not on teeming map
          if (!this.enemies[enemyIndex].clones[cloneIndex] || (this.enemies[enemyIndex].clones[cloneIndex].teeming && !isTeeming) || (this.enemies[enemyIndex].clones[cloneIndex].week && !this.enemies[enemyIndex].clones[cloneIndex].week[this.tableData.week])) {
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
      }
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
      var required = this.mdtDungeonTable.dungeonTotalCount
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

      // if pull is saved in old format
      if (Array.isArray(this.tableData.value.pulls[pullIndex])) {
        var pullObj = {color: '228b22'}
        this.tableData.value.pulls[pullIndex].forEach((clones, enemyIndex) => {
          if (!clones || !this.enemies[enemyIndex] || !this.enemies[enemyIndex].clones) {
            return
          }
          pullObj[enemyIndex] = clones
        })
        this.$set(this.tableData.value.pulls, pullIndex, pullObj)
      }

      for (const _enemyIndex in this.tableData.value.pulls[pullIndex]) {
        if (!this.tableData.value.pulls[pullIndex].hasOwnProperty(_enemyIndex) || !parseInt(_enemyIndex)) {
          continue
        }

        const clones = this.tableData.value.pulls[pullIndex][_enemyIndex]
        // convert string enemy ids to numeric
        if (typeof _enemyIndex === 'string' && parseInt(_enemyIndex)) {
          this.$delete(this.tableData.value.pulls[pullIndex], _enemyIndex)
          this.$set(this.tableData.value.pulls[pullIndex], parseInt(_enemyIndex), clones)
        }
        const enemyIndex = parseInt(_enemyIndex) - 1
        if (!clones) {
          continue
        }

        clones.forEach((cloneIndex) => {
          cloneIndex--
          if (!this.enemies[enemyIndex].clones[cloneIndex] || (this.enemies[enemyIndex].clones[cloneIndex].teeming && !isTeeming) || (this.enemies[enemyIndex].clones[cloneIndex].faction && this.tableData.faction !== this.enemies[enemyIndex].clones[cloneIndex].faction) || this.isCreatureNoTarget(this.enemies[enemyIndex].id)) {
            // if clone is set to current pullIndex, remove it
            if (this.enemies[enemyIndex].clones[cloneIndex] === pullIndex) {
              this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', -1)
              this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'color', null)
            }
            return
          }

          // add pull data
          this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'pull', pullIndex)
          this.$set(this.enemies[enemyIndex].clones[cloneIndex], 'color', this.tableData.value.pulls[pullIndex].color)

          groups[this.enemies[enemyIndex].clones[cloneIndex].g] = groups[this.enemies[enemyIndex].clones[cloneIndex].g] || []
          let meta = Object.assign({}, this.enemies[enemyIndex])
          meta.clones = null
          meta.cloneIndex = cloneIndex
          meta.enemyIndex = enemyIndex
          groups[this.enemies[enemyIndex].clones[cloneIndex].g].push(meta)

          // setup targets obj for horizontal list
          targets[enemyIndex] = targets[enemyIndex] || { count: 0, forces: this.enemies[enemyIndex].count, boss: this.enemies[enemyIndex].isBoss, enemyIndex: enemyIndex, name: this.enemies[enemyIndex].name }
          targets[enemyIndex].count++
          if (!targets._groups) {
            targets._groups = [this.enemies[enemyIndex].clones[cloneIndex].g]
          }
          else if (targets._groups.indexOf(this.enemies[enemyIndex].clones[cloneIndex].g) === -1) {
            targets._groups.push(this.enemies[enemyIndex].clones[cloneIndex].g)
          }
        })
      }

      var details = {groups: [], color: this.tableData.value.pulls[pullIndex].color || '228b22'}
      for (let g in groups) {
        if (!groups.hasOwnProperty(g)) continue
        details.groups.push({g: g, targets: groups[g]})
      }

      var hList = ''
      for (let index in targets) {
        if (!targets[index].name || index === '_groups') continue
        if (targets[index].boss) hList = hList + '💀' + targets[index].name + ', '
        else hList = hList + targets[index].count + 'x ' + targets[index].name + ', '
      }
      details.hList = hList.slice(0, -2)

      details.percent = this.pullPercent(pullIndex, false, targets)
      details.percentRunningTotal = this.pullPercent(pullIndex, true, targets)

      this.pullDetails.splice(pullIndex, 1, details)

      if (this.isReapingSelected()) {
        this.updateReapingPulls()
      }
    },

    updateReapingPulls () {
      var reapPct = 0
      var reapTargets = {}
      this.reapingPullDetails = {20: {hList: '', targets: []}, 40: {hList: '', targets: []}, 80: {hList: '', targets: []}, 60: {hList: '', targets: []}, 100: {hList: '', targets: []}}
      this.pullDetails.forEach((pull, pullIndex) => {
        reapPct += pull.percent
        pull.groups.forEach((g) => {
          g.targets.forEach((target) => {
            if (target.reaping) {
              reapTargets[target.reaping] = (reapTargets[target.reaping] || 0) + 1
            }
          })
        })
        this.reapingPercents.forEach((reapIndex) => {
          if (reapPct >= reapIndex && reapPct - pull.percent < reapIndex) {
            this.reapingPullDetails[reapIndex].pull = pullIndex + 1
            Object.keys(reapTargets).forEach((target) => {
              const creature = this.getReapingCreature(target)
              this.reapingPullDetails[reapIndex].hList = this.reapingPullDetails[reapIndex].hList + reapTargets[target] + 'x ' + creature.name + ', '
              for (let i = 0; i < reapTargets[target]; i++) {
                this.reapingPullDetails[reapIndex].targets.push(creature.portrait)
              }
            })
            this.reapingPullDetails[reapIndex].hList = this.reapingPullDetails[reapIndex].hList.slice(0, -2)
          }
        })
      })
    },

    getReapingCreature (creatureID) {
      switch ('' + creatureID) {
        case '148716':
          return {name: 'Risen Soul', portrait: 'https://media.wago.io/wow-ui-textures/ICONS/ability_warlock_soulsiphon.PNG'}
        case '148893':
          return {name: 'Tormented Soul', portrait: 'https://media.wago.io/wow-ui-textures/ICONS/Spell_Shadow_SoulLeech_1.PNG'}
        case '148894':
          return {name: 'Lost Soul', portrait: 'https://media.wago.io/wow-ui-textures/ICONS/Ability_Warlock_ImprovedSoulLeech.PNG'}
      }
      console.log('unknown reaping creature', creatureID, typeof creatureID)
      return false
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
      else if (poi === 'annotation') {
        var menu = document.getElementById('mdtAnnotateMenu').getBoundingClientRect()
        this.cursorTooltipX = menu.left + menu.width + 10
        this.cursorTooltipY = menu.top
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
      else if (poi.n && poi.d && this.annotationMode !== 'move') {
        this.userNoteEditOpen(poi.d[4], {objID: id})
      }
    },

    setSelectedMoveAnnotation (id) {
      if (this.annotationMode === 'move' && !this.isPainting && (!this.selectedMoveAnnotationID || !id)) {
        this.selectedMoveAnnotationID = id
        if (parseInt(id) >= 0) {
          this.$refs.mdtStage.getStage().draggable(false)
        }
        else {
          this.$refs.mdtStage.getStage().draggable(true)
        }
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

    getDistance (p1, p2) {
      return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
    },

    setAnnotate (mode, event) {
      document.querySelector('#mdtAnnotateMenu .md-toggle').classList.remove('md-toggle')
      this.$refs['annotate-' + mode].classList.add('md-toggle')
      this.annotationMode = mode
      var stage = this.$refs.mdtStage.getStage()

      switch (mode) {
        case 'freedraw':
        case 'line':
        case 'arrow':
        case 'box':
          this.annotationClass = 'annotate-crosshair'
          stage.draggable(false)
          break

        case 'move':
          this.annotationClass = 'annotate-crosshair'
          break

        case 'note':
          this.annotationClass = 'annotate-note'
          stage.draggable(false)
          break

        case 'standard':
          stage.draggable(true)
          this.annotationClass = 'standard'
          break

        case 'eraser':
          if (event && event.shiftKey) {
            this.$set(this.tableData, 'objects', [])
            this.setAnnotate('standard')
            // since shift clicking tends to select a bunch of items on the page, unselect it
            if (window.getSelection) {
              window.getSelection().removeAllRanges()
            }
            else if (document.selection) {
              document.selection.empty()
            }
          }
          else {
            stage.draggable(false)
            this.annotationClass = 'annotate-eraser'
          }
          break

        default:
          this.annotationClass = 'standard'
      }
    },

    showColorPicker () {
      this.isColorPickerOpen = true
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
    saveFromScratch () {
      this.http.post('/import/create', { json: this.tableString, type: 'MDT', create: true }).then((res) => {
        if (res.success && res.wagoID) {
          this.$router.push('/' + res.wagoID)
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
    },
    toggleMDTOptions () {
      this.hideMobileOptions = !this.hideMobileOptions
    },
    hexToRGB (hex, alpha) {
      if (!hex) {
        hex = '228b22'
      }
      if (typeof alpha === 'undefined') {
        alpha = 1
      }
      var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!rgb) {
        return this.hexToRGB('228b22')
      }
      return `rgba(${parseInt(rgb[1], 16)}, ${parseInt(rgb[2], 16)}, ${parseInt(rgb[3], 16)}, ${alpha})`
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
#builder, #mdtStage { width: 100% }
#build-mdt .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#build-mdt .md-select { width: auto }
#build-mdt .md-input-container { margin-bottom: 0}
#build-mdt .md-input-container:after { content: none }
#build-mdt .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#build-mdt .flex-left { order: 0; flex: 0 1 auto}
#build-mdt .flex-left .md-input-container label { white-space: nowrap}
#build-mdt .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#build-mdt .ace_editor { box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); }
#build-mdt .md-theme-default.md-sidenav .md-sidenav-content { background-color: inherit; min-width: 360px; }
#builder { position: relative; min-height: 666px }
#builder canvas { position: absolute; left: 0; top: 0; width:60%; max-width: 1000px; height: 666px; max-height: 666px; }
#stageContainer { max-width:1000px; width:60%; height:666px; position: relative; flex: 2 }
#mdtOptions .md-card { margin: 0; overflow: hidden; width: 100%; height: 666px; overflow-y: auto;}
#mdtOptions .md-card .md-sidenav-content { min-width: 75%; }
#mdtOptions .md-sidenav-backdrop { position: fixed }
/* embed options scrollbar */
#embed-body #mdtOptions .md-card { scrollbar-width: thin; }
#embed-body #mdtOptions .md-card::-webkit-scrollbar { width: 8px; }
#embed-body #mdtOptions .md-card::-webkit-scrollbar-track { background: #f1f1f1; }
#embed-body #mdtOptions .md-card::-webkit-scrollbar-thumb { background: #888; }
#embed-body #mdtOptions .md-card::-webkit-scrollbar-thumb:hover { background: #555; }

#sumPct { color: inherit; text-transform: none }
.inlineContainer { display: inline-flex; flex-direction: row; flex-wrap: wrap; }
.affix { padding-right: 6px; padding-bottom: 4px; white-space: nowrap; line-height:36px; display: inline; }
.affix img { width: 22px; height: 22px; }
.topaffix { margin: 6px 4px; padding: 0; white-space: nowrap; line-height:36px; display: inline-block;}
.topaffix img { width: 18px; height: 18px; }
#selectAffixWeek { position: relative; }
.affixWeek { margin-top: -22px; }
.affixMeta { color: rgba(128,128,128,.6); font-size: 12px; position: absolute; left: 16px; top: 24px; }
#changeAffixesBtn { margin-top: 0; }
#mdtPulls .md-progress { margin-top: 4px }
#mdtPulls .selected > div { padding-top: 16px }
#mdtPulls .selected > button { display: none }
#mdtPulls .mdt-pull { border-left: 3px solid #228b22; }
#mdtPulls .md-list-text-container > * { white-space: normal }
#mdtPulls .reapingTargetIcon { display: inline-block; overflow: hidden; vertical-align: middle; box-sizing: initial; width: 36px; height: 36px; border-radius: 36px; background-position: -4px -4px; background-size: 120%;}
#mdtPulls .reaping-pull { border-left: 3px solid #37083f; background: rgba(55, 8, 63, 0.3) }
.mdtGroupDetails > div { margin: 15px 0; }
.mdtGroupDetails .groupnum:before { content: 'Group'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .singlepull:before { content: 'Singles'; font-size: 9px; position: absolute; top: -15px; right: 6px; text-align: right }
.mdtGroupDetails .groupnum, .mdtGroupDetails .singlepull { position: relative; font-size: 26px; width: 1.7em; display: inline-block; text-align: right; padding-right: 6px; }
.mdtGroupDetails .enemyPortrait { margin-top: -9px; width:32px; height:32px; z-index:99 }
#mdtTooltip { z-index: 100; position: fixed; padding: 16px; background: rgba(0, 0, 0, .8); border: 2px solid black; color: white; }
#mdtTooltip .tooltipPOI { max-width: 240px }
#mdtTooltip .tooltipPOI span + span { font-size: 90%; color: #DDD }
#mdtTooltip .tooltipEnemy { width: 210px; position: relative; }
#mdtTooltip .tooltipEnemy span { display: block }
#mdtTooltip .tooltipEnemy span img { max-height: 16px }
#mdtTooltip .tooltipEnemy .enemyPortrait { position: absolute; left: -48px; top: -48px; border: 2px solid black; }
#mdtAnnotateMenu { position: absolute; top: 36px; left: 18px; width: 50px; border: 1px solid black; background: #212121; opacity: .9 }
#mdtAnnotateMenu .annotate-label { text-align: center; text-decoration: underline; font-weight: bold; font-size: 12px }
#mdtAnnotateMenu .md-button-toggle { padding: 0}
#mdtAnnotateMenu .md-icon-button { display: inline-block; position: relative; padding: 2px; width: 24px; min-width: 24px; max-width: 24px; height: 24px; min-height: 24px; max-height: 24px; }
#mdtAnnotateMenu .md-icon-button i.md-icon { font-size: 18px; margin: 0; color: white; cursor: pointer }
#stroke-input { text-align: center }
#stroke-input input { text-align: center; font-weight: bold; font-size: 12px; height: 24px; width:18px; padding: 0; color: white; background: none; border: 0; }
#stroke-input button { border: 0; background: none; color: white; padding:0; width: 10px; cursor: pointer }
#stroke-input input[type="number"] { -webkit-appearance: textfield; -moz-appearance: textfield; appearance: textfield; }
#stroke-input input[type="number"]::-webkit-inner-spin-button, #stroke-input input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
#color-input button { width: 100%; height: 18px; border: 1px solid black; border-width: 1px 3px }
#color-picker .vc-chrome-body { background: #333 }
#color-picker .vc-chrome-active-color { width: 24px; height: 24px; }
#color-picker .vc-chrome-hue-wrap { margin-top: 7px; }
#color-picker .vc-input__input { border: 0; background: none; color: white; box-shadow: none; text-align: left; font-size: 14px; padding-left: 30px }
#color-picker .vc-chrome-toggle-btn, #color-picker span.vc-input__label { display: none }
#mdtEditNote .md-input-container { padding: 16px }
#mdtEditNote .md-input-container:after { margin: 0 16px }
#builder.annotate-crosshair { cursor: crosshair }
#builder.annotate-note { cursor: cell }
#builder.annotate-eraser { cursor: not-allowed }
#saveChangesDialog .md-dialog { min-width: 40% }

@media (max-width: 600px) {
  #mdtOptions { display: block; position: absolute; }
  #mdtOptions.md-hide-xsmall { display: none }
  #stageContainer { margin-left: -16px}
  #stageContainer, #builder canvas {width:calc(100vw) }
  #mobilePull { position: absolute; top: -12px; right: 48px; max-width: 70px }
  #wago-options-toggle { background-color: rgba(0, 0, 0, 0.7); margin-right: 22px }
  #wago-builder-container.wago-container { margin-right: 0}
}

.hidden { display: none!important }
</style>
