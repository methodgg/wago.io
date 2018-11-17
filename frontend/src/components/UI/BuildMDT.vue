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
      <md-layout style="width:1024; height:768px">
        <div id="builder" ref="canvas" width="1024" height="768">
          <v-stage ref="mdtStage" id="mdtStage" :config="konvaStageConfig" @scroll.passive="zoomStage">
            <v-layer ref="mdtMap" v-if="mdtDungeonTable.dungeonSubLevels">
              <template v-if="mapTiles.length" v-for="(tile, i) in mapTiles">
                <v-image :config="tile" />
              </template>
              <template v-for="(creature, i) in mdtDungeonTable.dungeonEnemies[mapID]">
                <template v-for="(clone, j) in creature.clones">
                  <v-circle v-if="!clone.sublevel || clone.sublevel === subMapID + 1" @click="selectCreature(creature, clone, j)" @mouseover="setHover(creature, clone, j)" @mouseleave="setHover()" :config="{
                      x: clone.x * 1.19777777,
                      y: clone.y * -1.19777777,
                      radius: Math.round(5 * creature.scale * (creature.isBoss ? 1.7 : 1)),
                      fill: (hoverGroup === determineGroupID(creature, clone, j)) ? '#C1272D' : ((selectedGroup === determineGroupID(creature, clone, j)) ? '#27C12D' : '#212121')
                    }"
                  />
                  <v-image :config="tile" />
                </template>
              </template>
            </v-layer>
          </v-stage>
        </div>
      </md-layout>
      <md-layout md-vertical-align="start">
        {{ hoverText }}
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
      mdtDungeonTable: {},
      mapTiles: [],
      konvaStageConfig: {width: 1024, height: 768, draggable: true},
      tile: {},
      hoverGroup: -1, // which group is being moused-over
      hoverText: '',
      selectedGroup: -1 // which group is selected
    }
  },
  created: function () {
    var vue = this
    this.http.get('/data/mdtDungeonTable').then((res) => {
      if (res && res._id === 'mdtDungeonTable') {
        vue.mdtDungeonTable = res.value
        this.setMap(0)

        // setup zoom
        this.$refs.canvas.addEventListener('wheel', (evt) => {
          let scaleBy = 1.2
          var stage = this.$refs.mdtStage.getStage()
          if (evt.target.nodeName !== 'CANVAS') {
            return false
          }
          evt.preventDefault()
          var oldScale = stage.scaleX()

          var mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale
          }

          var newScale = evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
          stage.scale({ x: newScale, y: newScale })

          var newPos = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale
          }
          stage.position(newPos)
          stage.batchDraw()
        })
      }
    })
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
    setMap: function (subMap, secondCall) {
      // build map
      this.mapID = this.tableData.value.currentDungeonIdx - 1
      var dir = this.mdtDungeonTable.dungeonMaps[this.mapID][0]
      var map = this.mdtDungeonTable.dungeonMaps[this.mapID][subMap + 1]

      // setup map background
      this.mapTiles = []
      for (let i = 1; i <= 12; i++) {
        var row = (i - 1) % 4
        var col = Math.floor((i - 1) / 4)
        var image = new Image()
        image.src = `https://media.wago.io/wow-ui-textures/Worldmap/${dir}/${map}${i}.PNG` // require('../../assets/gameMaps/' + dir + '/' + map + i + '.png')
        this.mapTiles.push({image, x: row * 256, y: col * 256})
      }

      // call twice to redraw once things are loaded
      if (!secondCall) {
        this.setMap(subMap, true)
      }
    },

    setHover: function (creature, clone, cloneIndex) {
      if (creature) {
        this.hoverGroup = this.determineGroupID(creature, clone, cloneIndex)
        this.hoverText = creature.name
      }
      else {
        this.hoverGroup = -1
        this.hoverText = ''
      }
    },

    selectCreature: function (creature, clone, cloneIndex) {
      this.selectedGroup = this.determineGroupID(creature, clone, cloneIndex)
    },

    determineGroupID: function (creature, clone, cloneIndex) {
      if (clone.g) {
        return clone.g
      }
      return creature.id + '.' + cloneIndex
    },

    saveChanges: function () {
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
    exportChanges: function () {
      this.tableString = this.aceEditor.getValue()
      this.showExport = true
    },
    hideExport: function () {
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
</style>
