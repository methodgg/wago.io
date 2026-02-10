<template>
  <v-sprite :config="getSprite(data)" @click="click(data)" @mouseover="mouseover(data)" @mouseout="mouseout" @mousemove="mousemove" />
</template>

<script>
export default {
  props: ['data', 'mapID', 'mdtScale', 'annotationsIndex'],
  data: function () {
    return {
      POIICONS: { // sprite sheet 14x28 of 16x16 icons
        error: [13 * 18, 2 * 18, 18, 18], // 14th column, 3rd row
        graveyard: [8 * 18, 0, 18, 18] // 9th column, 1st row
      },
      OBJECTICONS: { // sprite sheet 8x8 of 32x32 icons
        generalNote: [2 * 32, 6 * 32, 32, 32], // 3rd column, 7th row
        adTeemingNote: [2 * 32, 6 * 32, 32, 32], // 3rd column, 7th row
        tdprisonkey: [2 * 32, 6 * 32, 32, 32], // 3rd column, 7th row
        wmMaggotNote: [2 * 32, 6 * 32, 32, 32], // 3rd column, 7th row
        heavyCannon: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        mlFrackingTotem: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        mlMineCart: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        tuSkip: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        tuMatronNote: [2 * 32, 6 * 32, 32, 32], // 3rd column, 7th row
        shrineSkip: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        templeEye: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        krSpiritGuide: [2 * 32, 0, 32, 32], // 3rd column, 1st row
        sobGutters: [2 * 32, 6 * 32, 32, 32] // 3rd column, 7th row
      },
      DOOR: { // sprite sheet 1x5 of 32x32 icons
        0: [0, 0, 32, 32], // no arrow
        '-1': [1 * 32, 0, 32, 32], // down arrow
        1: [2 * 32, 0, 32, 32], // up arrow
        '-2': [3 * 32, 0, 32, 32], // left arrow
        2: [4 * 32, 0, 32, 32] // right arrow
      },
      MECHBOT: { // sprite sheet 1x3 of 64x64 icons
        0: [3 * 64, 0, 64, 64], // grey
        1: [0 * 64, 0, 64, 64], // green
        2: [1 * 64, 0, 64, 64], // red
        3: [2 * 64, 0, 64, 64] // blue
      },
      USERNOTEICONS: [], // sprite sheet 1x50 of 32x32 icons
      mdtDungeonTable: this.$store.state.mdtDungeonTable,
      tableData: JSON.parse(this.$store.state.wago.code.json)
    }
  },
  created: function () {
    // this.mdtDungeonTable = this.$store.state.mdtDungeonTable
    this.USERNOTEICONS = []
    for (let i = 0; i < 50; i++) {
      this.USERNOTEICONS.push([i * 32, 0, 32, 32])
    }
  },
  methods: {
    getSprite (data) {
      var image = new Image()

      if (data.type === 'door' || data.type === 'mapLink' || data.type === 'dungeonEntrance') {
        image.src = require('../../assets/mapPOI/DOOR.png')
        return {image, animation: data.direction || 0, animations: this.DOOR, x: (data.x * this.mdtScale) - 16, y: -(data.y * this.mdtScale) - 16}
      }

      else if (data.type === 'mechagonBot' && data.botIndex) {
        image.src = require('../../assets/mapPOI/MECHBOTS.png')
        return {image, animation: data.botIndex || 0, animations: this.MECHBOT, x: (data.x * this.mdtScale) - 16, y: -(data.y * this.mdtScale) - 16, scaleX: 0.1, scaleY: 0.1}
      }

      else if (data.type && this.POIICONS[data.type]) {
        image.src = require('../../assets/mapPOI/POIICONS.png')
        return {image, animation: data.type, animations: this.POIICONS, x: (data.x * this.mdtScale) - 7, y: -(data.y * this.mdtScale) - 7}
      }

      else if (data.type && this.OBJECTICONS[data.type]) {
        image.src = require('../../assets/mapPOI/OBJECTICONS.png')
        return {image, animation: data.type, animations: this.OBJECTICONS, x: (data.x * this.mdtScale) - 11.2, y: -(data.y * this.mdtScale) - 11.2, scaleX: 0.7, scaleY: 0.7}
      }

      else if (data.n && data.d) {
        image.src = require('../../assets/mapPOI/USERNOTEICONS.png')
        var count = 0
        for (let i = 0; i < this.tableData.objects.length && i < this.annotationsIndex && count < 50; i++) {
          if (this.tableData.objects[i] && this.tableData.objects[i].n) count++
        }
        return {image, animation: count, animations: this.USERNOTEICONS, x: (data.d[0] * this.mdtScale) - 13.6, y: -(data.d[1] * this.mdtScale) - 16.6, scaleX: 0.85, scaleY: 0.85}
      }

      else {
        // error / unknown POI
        image.src = require('../../assets/mapPOI/USERNOTEICONS.png')
        console.log('Unknown POI type', data)
        return {image, animation: 'error', animations: this.USERNOTEICONS, x: (data.d[0] * this.mdtScale) - 13.6, y: -(data.d[1] * this.mdtScale) - 16.6, scaleX: 0.85, scaleY: 0.85}
      }
    },

    // pass mouse interactions to parent
    click: function (poi) {
      switch (poi.type) {
        case 'mapLink':
          return this.$emit('click', {mapLink: poi.target - 1})
      }
      this.$emit('click')
    },
    mouseover: function (poi) {
      var text
      switch (poi.type) {
        case 'dungeonEntrance':
          text = 'Dungeon Entrance'
          break
        case 'door':
          text = (poi.doorName + (poi.doorDescription ? `\n${poi.doorDescription}` : '') + (poi.lockpick ? '\n<span style="color:#32CD32">Locked</span>' : ''))
          break
        case 'generalNote':
          text = poi.text
          break
        case 'graveyard':
          text = poi.graveyardDescription || 'Graveyard'
          break
        case 'mapLink':
          text = 'To ' + this.mdtDungeonTable.dungeonSubLevels[poi.target - 1]
          break

        // dungeon specific
        case 'adTeemingNote': // atol dazar
          text = 'Note on Teeming:\nG29 is not always present.\nTeeming enemies of G2 are not always present.\nG27 is not always present.'
          break
        case 'krSpiritGuide': // kings rest
          text = 'Untainted Spirit Guide\nUnlocks after defeating Purification Construct 1'
          break
        case 'tuSkip': // the underrot
          text = 'Shortcut\nUnlocks after killing Sporecaller Zancha'
          break
        case 'tuMatronNote': // the underrot
          text = 'Matron 4+5 can spawn on either left or right platform.'
          break
        case 'tdprisonkey': // tol dagor
          text = 'Discarded Cell Key\nPossible Spawn Location\nOpens 1x Prison Bars'
          break
        case 'heavyCannon': // tol dagor
          text = 'Heavy Cannon\nUsable by players\nDamages both enemies and allies'
          break
        case 'mlFrackingTotem': // motherlode
          text = 'Fracking Totem\nUsable by players\nIncapacitates Earthrager for 1min - Breaks on Damage'
          break
        case 'mlMineCart': // motherlode
          text = 'Mine Cart\nUsable by players'
          break
        case 'shrineSkip': // shrine
          text = 'Shortcut'
          break
        case 'sobGutters': // siege of boralus
          text = 'Note on Gutters:\nFootmen will insta-kill Gutters when a player comes near them. If they die without taking damage from the group they will not give any enemy forces.'
          break
        case 'templeEye': // temple
          text = 'Eye of Sethraliss\nBring both Eyes to the Skull of Sethraliss\nEach Eye you bring to the Skull awards 12 Enemy Forces'
          break
        case 'wmMaggotNote': // waycrest manor
          text = 'Note on Devouring Maggots:\nDevouring Maggots with the buff <em>Parasitic</em> will try to <em>Infest</em> Players\nUpon successfull cast of <em>Infest</em> the Devouring Maggot will disappear and spawn 2x Devouring Maggots after a debuff on the infested player runs out.\nYou can only gain 1 count for killing the initial Infested Maggot - the 2 newly spawned Infested Maggots do not give count.\n\nInfected Peasants spawn 3x Devouring Maggots which do give 1 count each.\nThese Devouring Maggots are mapped next to the Infected Peasants.'
          break
        case 'mechagonBot': // mechagon junkyard
          switch (poi.botIndex) {
            case 1:
              text = 'Welding Bot'
              break
            case 2:
              text = 'Grease Bot'
              break
            case 3:
              text = 'Shock Bot'
              break
          }
          break

        default:
          // user note
          if (poi.n && poi.d) {
            text = poi.d[4] || 'Error\nNo note content'
          }
          // unknown/error
          else {
            text = 'Error\nUnknown POI ' + poi.type
          }
      }
      this.$emit('mouseover', poi, text)
    },
    mousemove: function (e) {
      this.$emit('mousemove', e)
    },
    mouseout: function () {
      this.$emit('mouseout')
    }
  }
}
</script>
