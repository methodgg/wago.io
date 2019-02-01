<template>
  <div id="edit-notes">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <div class="flex-col flex-right">
        <md-button @click="copyAngry" id="copy-import-button">
          <md-icon>assignment</md-icon> {{ $t("Copy for Angry Assignments") }}
        </md-button>
        <md-button @click="copyAngry" :disabled="true" id="copy-import-button">
          <md-icon>assignment</md-icon> {{ $t("ERT Copy coming soon") }}
        </md-button>
        <!--<md-button @click="exportChanges" v-if="showExport"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button v-if="canEdit" @click="generateNextVersionData(); $refs['saveChangesDialog'].open()" ref="saveChangesButton" :disabled="wago.type === 'ELVUI' || wago.type === 'VUHDO'"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
        <md-button class="md-hide-xsmall" v-if="scratch" @click="saveFromScratch"><md-icon>save</md-icon> {{ $t("Save Notes") }}</md-button>-->
      </div>
      <md-dialog md-open-from="#saveChangesButton" md-close-to="#saveChangesButton" ref="saveChangesDialog" id="saveChangesDialog" @open="focusFieldByRef('changelogText')">
        <md-dialog-title>{{ $t("Save Modifications") }}</md-dialog-title>

        <input-semver v-model="newImportVersion" :latestVersion="latestVersion"></input-semver>

        <md-dialog-content>
          <md-input-container class="changelog-notes">
            <label>{{ $t("Changelog") }}</label>
            <md-textarea v-model="newChangelog.text" ref="changelogText" :placeholder="$t('You may enter any patch notes or updates here')"></md-textarea>
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
    
    <md-whiteframe id="wago-note-editor">
      <quill ref="quillContent" v-model="noteContent" @change="parseNotes" :options="quillConfig"></quill>
      <md-table v-once>
        <md-table-header>
          <md-table-row>
            <md-table-head>Current Advanced Parsing Options</md-table-head>
            <md-table-head>Code</md-table-head>
            <md-table-head>Example</md-table-head>
            <md-table-head>Result AA</md-table-head>
            <md-table-head>Result ERT</md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <md-table-row>
            <md-table-cell>Color Start</md-table-cell>
            <md-table-cell>|cALPHA_HEXCODE</md-table-cell>
            <md-table-cell><strong>|cFFBE67FF</strong>Add some color</md-table-cell>
            <md-table-cell><span style="color:#BE67FF">Add some color</span></md-table-cell>
            <md-table-cell><span style="color:#BE67FF">Add some color</span></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Color Stop</md-table-cell>
            <md-table-cell>|r</md-table-cell>
            <md-table-cell><strong>|cFFBE67FF</strong>No more<strong>|r</strong> color</md-table-cell>
            <md-table-cell><span style="color:#BE67FF">No more</span> color</md-table-cell>
            <md-table-cell><span style="color:#BE67FF">No more</span> color</md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Color Classes</md-table-cell>
            <md-table-cell>|cClass</md-table-cell>
            <md-table-cell><strong>|cMonk</strong>I am a monk!</md-table-cell>
            <md-table-cell><span style="color:#00FF96">I am a monk!</span></md-table-cell>
            <md-table-cell><span style="color:#00FF96">I am a monk!</span></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Icons by spell ID</md-table-cell>
            <md-table-cell>{icon spellID} or {icon:spellID}</md-table-cell>
            <md-table-cell>{icon 121253}</md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Achievement_brewery_2.PNG" /></md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Achievement_brewery_2.PNG" /></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Icons by icon name</md-table-cell>
            <md-table-cell>{icon name} or {icon:name}</md-table-cell>
            <md-table-cell>{icon:spell_holy_summonlightwell}</md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Spell_Holy_SummonLightwell.PNG" /></md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Spell_Holy_SummonLightwell.PNG" /></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Shortcut icons</md-table-cell>
            <md-table-cell>{class name} or {raid target}</md-table-cell>
            <md-table-cell>{star} {mage}</md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/iconsUI/raidmarker-rt1.png" /> <img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Mage.PNG" /></md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/iconsUI/raidmarker-rt1.png" /> <img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Mage.PNG" /></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Spell link by ID</md-table-cell>
            <md-table-cell>{spell spellID}</md-table-cell>
            <md-table-cell>{spell 282098}</md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Ability_Racial_PterrordaxSwoop.PNG"> <a style="color:#9adbfe" data-wowhead="spell=282098">Gift of Wind</a></md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Ability_Racial_PterrordaxSwoop.PNG"> <span style="color:#9adbfe">Gift of Wind</span><br><small>Not linked</small></md-table-cell>
          </md-table-row>
          <md-table-row>
            <md-table-cell>Spell link by Wowhead URL</md-table-cell>
            <md-table-cell>Just paste the URL</md-table-cell>
            <md-table-cell>https://www.wowhead.com/spell=284360/sea-storm</md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Spell_Frost_IceStorm.PNG"><a style="color:#9adbfe" data-wowhead="spell=284360">Sea Storm</a></md-table-cell>
            <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-ui-textures/ICONS/Spell_Frost_IceStorm.PNG"><span style="color:#9adbfe">Sea Storm</span><br><small>Not linked</small></md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>
    </md-whiteframe>
    <textarea id="wago-importstring" readonly="true"></textarea>
  </div>
</template>

<script>
const async = require('async')
const semver = require('semver')
const Quill = require('quill')
const Parchment = Quill.import('parchment')
Quill.register(new Parchment.Attributor.Attribute('wowhead', 'data-wowhead', {scope: Parchment.Scope.INLINE}))
import { quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'

export default {
  props: ['scratch'],
  name: 'edit-notes',
  created: function () {
    this.$nextTick(() => {
      this.$refs.quillContent.quill.root.setAttribute('spellcheck', false)
      document.querySelector('#wago-note-editor .ql-container').addEventListener('click', () => {
        if (!this.$refs.quillContent.quill.getSelection()) {
          this.$refs.quillContent.quill.setSelection(42949672946)
        }
      })
    })
  },
  data: function () {
    return {
      showExport: false,
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
      noteContent: `Welcome to the early stages of the Encounter Notes section on Wago.io.<br><br>This is a WYSIWYG editor for Angry Assignments and Exorsus Notes.<br><br>There is no saving to Wago yet, but many features of both addons work here.<br><br>Both addons have their own unique features but most are compatible with each other.`,
      parsedNotes: '',
      noteLength: 0,
      activeTimer: null,
      caret: {},
      previousFocus: null,
      blizzData: {spells: {}},

      // quill
      quillConfig: {
        // formats: ['color'], // only allow pasted color
        theme: 'snow', // no theme, styling below
        modules: {
          toolbar: {
            container: [
              [{'color': ['#FFFFFF', '#888888', '#000000', '#c41f3b', '#a330c9', '#ff7d0a', '#abd473', '#40C7eb', '#00ff96', '#f58cba', '#fff569', '#0070de', '#8787ed', '#c79c6e']}],
              ['rt1', 'rt2', 'rt3', 'rt4', 'rt5', 'rt6', 'rt7', 'rt8'],
              ['mage', 'priest', 'warlock', 'demonhunter', 'druid', 'monk', 'rogue', 'hunter', 'shaman', 'deathknight', 'paladin', 'warrior'],
              ['tank', 'healer', 'damage'],
              ['bloodlust', 'heroism', 'healthstone']
            ],
            handlers: {
              rt1: () => {
                this.quillInsertImage(this.imageURL('star'))
              },
              rt2: () => {
                this.quillInsertImage(this.imageURL('circle'))
              },
              rt3: () => {
                this.quillInsertImage(this.imageURL('diamond'))
              },
              rt4: () => {
                this.quillInsertImage(this.imageURL('triangle'))
              },
              rt5: () => {
                this.quillInsertImage(this.imageURL('moon'))
              },
              rt6: () => {
                this.quillInsertImage(this.imageURL('square'))
              },
              rt7: () => {
                this.quillInsertImage(this.imageURL('cross'))
              },
              rt8: () => {
                this.quillInsertImage(this.imageURL('skull'))
              },
              mage: () => {
                this.quillInsertImage(this.imageURL('mage'))
              },
              priest: () => {
                this.quillInsertImage(this.imageURL('priest'))
              },
              warlock: () => {
                this.quillInsertImage(this.imageURL('warlock'))
              },
              demonhunter: () => {
                this.quillInsertImage(this.imageURL('demonhunter'))
              },
              druid: () => {
                this.quillInsertImage(this.imageURL('druid'))
              },
              monk: () => {
                this.quillInsertImage(this.imageURL('monk'))
              },
              rogue: () => {
                this.quillInsertImage(this.imageURL('rogue'))
              },
              hunter: () => {
                this.quillInsertImage(this.imageURL('hunter'))
              },
              shaman: () => {
                this.quillInsertImage(this.imageURL('shaman'))
              },
              deathknight: () => {
                this.quillInsertImage(this.imageURL('deathknight'))
              },
              paladin: () => {
                this.quillInsertImage(this.imageURL('paladin'))
              },
              warrior: () => {
                this.quillInsertImage(this.imageURL('warrior'))
              },
              tank: () => {
                this.quillInsertImage(this.imageURL('tank'))
              },
              healer: () => {
                this.quillInsertImage(this.imageURL('healer'))
              },
              damage: () => {
                this.quillInsertImage(this.imageURL('damage'))
              },
              bloodlust: () => {
                this.quillInsertImage(this.imageURL('bloodlust'))
              },
              heroism: () => {
                this.quillInsertImage(this.imageURL('heroism'))
              },
              healthstone: () => {
                this.quillInsertImage(this.imageURL('healthstone'))
              }
            }
          }
        }
      }
    }
  },
  components: {
    'input-semver': require('../UI/Input-Semver.vue'),
    quill: quillEditor
  },
  mounted () {
    let wowheadTooltips = document.createElement('script')
    wowheadTooltips.setAttribute('src', 'https://wow.zamimg.com/widgets/power.js')
    document.head.appendChild(wowheadTooltips)
  },
  methods: {
    copyAngry () {
      const quill = this.$refs.quillContent.quill
      const content = quill.getContents().ops
      var copyStr = ''
      content.forEach((op) => {
        if (typeof op.insert === 'object' && op.insert.image) {
          var icon = op.insert.image.match(/^https:\/\/media.wago.io\/wow-ui-textures\/ICONS\/(\w+)\.PNG$/)
          var raidmarker = op.insert.image.match(/^https:\/\/media.wago.io\/iconsUI\/raidmarker-(\w+)\.png$/)
          var roleicon = op.insert.image.match(/^https:\/\/media.wago.io\/iconsUI\/role-icon-(\w+)\.png$/)
          if (icon) {
            copyStr += `{icon ${icon[1]}}`
          }
          else if (raidmarker) {
            copyStr += `{${raidmarker[1]}}`
          }
          else if (roleicon) {
            copyStr += `{${roleicon[1]}}`
          }
        }
        else if (!op.attributes) {
          copyStr += op.insert
        }
        else if (op.attributes.link && op.attributes.wowhead) {
          copyStr += `{${op.attributes.wowhead.replace(/=/, ' ')}}`
        }
        else if (op.attributes.color && op.attributes.color.match(/#\w{6}/) && typeof op.insert === 'string') {
          copyStr += `|cFF${op.attributes.color.substr(1)}${op.insert}|r`
        }
        else if (op.attributes.color && op.attributes.color.match(/rgba/) && typeof op.insert === 'string') {
          var parts = op.attributes.color.substring(op.attributes.color.indexOf('(')).split(',')
          var r = parseInt(parts[0].trim().substring(1))
          var g = parseInt(parts[1].trim())
          var b = parseInt(parts[2].trim())
          var a = parseFloat(parts[3].trim().substring(0, parts[3].length - 1)).toFixed(2)
          copyStr += `|c${(a * 255).toString(16).substring(0, 2)}${r.toString(16)}${g.toString(16)}${b.toString(16)}${op.insert}|r`
        }
      })
      document.getElementById('wago-importstring').value = copyStr
      try {
        document.getElementById('wago-importstring').select()
        var copied = document.execCommand('copy')
        if (copied) {
          window.eventHub.$emit('showSnackBar', this.$t('Notes copied'))
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Notes failed to copy please upgrade to a modern browser'))
        }
        document.getElementById('copy-import-button').focus()
        return copied
      }
      catch (e) {
        console.error(e.message)
        window.eventHub.$emit('showSnackBar', this.$t('Notes failed to copy please upgrade to a modern browser'))
      }
      this.$nextTick(() => {
        document.getElementById('wago-importstring').value = ''
      })
    },
    quillInsertImage (url) {
      const quill = this.$refs.quillContent.quill
      const position = quill.getSelection(true).index
      quill.insertEmbed(position, 'image', url, 'user')
      quill.setSelection(position + 1, 0, 'silent')
    },
    imageURL (image) {
      switch (image.toLowerCase().replace(/\s/g, '')) {
        case 'rt1': case 'sz1': case 'cr1': case 'si1': case 'цр1':
        case 'star': case 'stern': case 'étoile': case 'stella': case 'звезда':
          return 'https://media.wago.io/iconsUI/raidmarker-rt1.png'
        case 'rt2': case 'sz2': case 'cr2': case 'si2': case 'цр2':
        case 'circle': case 'kreis': case 'cercle': case 'cerchio': case 'круг':
          return 'https://media.wago.io/iconsUI/raidmarker-rt2.png'
        case 'rt3': case 'sz3': case 'cr3': case 'si3': case 'цр3':
        case 'diamond': case 'diamant': case 'losange': case 'rombo': case 'ромб':
          return 'https://media.wago.io/iconsUI/raidmarker-rt3.png'
        case 'rt4': case 'sz4': case 'cr4': case 'si4': case 'цр4':
        case 'triangle': case 'dreieck': case 'triangolo': case 'треугольник':
          return 'https://media.wago.io/iconsUI/raidmarker-rt4.png'
        case 'rt5': case 'sz5': case 'cr5': case 'si5': case 'цр5':
        case 'moon': case 'mond': case 'lune': case 'luna': case 'полумесяц':
          return 'https://media.wago.io/iconsUI/raidmarker-rt5.png'
        case 'rt6': case 'sz6': case 'cr6': case 'si6': case 'цр6':
        case 'square': case 'quadrat': case 'carré': case 'quadrato': case 'квадрат':
          return 'https://media.wago.io/iconsUI/raidmarker-rt6.png'
        case 'rt7': case 'sz7': case 'cr7': case 'si7': case 'цр7': case 'x':
        case 'cross': case 'kreuz': case 'croix': case 'croce': case 'крест':
          return 'https://media.wago.io/iconsUI/raidmarker-rt7.png'
        case 'rt8': case 'sz8': case 'cr8': case 'si8': case 'цр8':
        case 'skull': case 'totenschädel': case 'crâne': case 'teschio': case 'череп':
          return 'https://media.wago.io/iconsUI/raidmarker-rt8.png'

        case 'warrior': case 'krieger': case 'guerrero': case 'guerrier': case 'guerreiro':
        case '전사': case 'Воин': case '战士':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Warrior.PNG'
        case 'paladin': case 'paladín': case 'Paladino':
        case '성기사': case 'Паладин': case '圣骑士':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Paladin.PNG'
        case 'hunter': case 'jäger': case 'cazador': case 'chasseur': case 'cacciatore':
        case 'caçador': case '사냥꾼': case 'Охотник': case '猎人':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Hunter.PNG'
        case 'rogue': case 'schurke': case 'pícaro': case 'voleur': case 'ladro':
        case 'ladino': case '도적': case 'разбойник': case '盗贼':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Rogue.PNG'
        case 'priest': case 'priester': case 'sacerdote': case 'prêtre':
        case '사제': case 'жрец': case '牧师':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Priest.PNG'
        case 'deathknight': case 'todesritter': case 'caballerodelamuerte': case 'cavalieredellamorte': case 'chevalierdelamorte':
        case 'cavaleirodamorte': case '죽음의기사': case 'рыцарьсмерти': case '死亡骑士':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_DeathKnight.PNG'
        case 'shaman': case 'schamane': case 'chamán': case 'chaman': case 'sciamano':
        case 'xamã': case '주술사': case 'шаман': case '萨满祭司':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Shaman.PNG'
        case 'mage': case 'magier': case 'mago':
        case '마법사': case 'маг': case '法师':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Mage.PNG'
        case 'warlock': case 'hexenmeister': case 'brujo': case 'démoniste': case 'stregone':
        case 'bruxo': case '흑마법사': case 'чернокнижник': case '术士':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Warlock.PNG'
        case 'monk': case 'mönch': case 'monje': case 'moine': case 'monaco':
        case 'monge': case '수도사': case 'монах': case '武僧':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Monk.PNG'
        case 'druid': case 'druide': case 'druida': case 'druido':
        case '드루이드': case 'друид': case '德鲁伊':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_Druid.PNG'
        case 'demonhunter': case 'dämonenjäger': case 'cazadordedemonios': case 'chasseurdedémon': case 'cacciatoredidemoni':
        case 'caçadordedemônios': case '악마사냥꾼': case 'охотникнадемонов': case '恶魔猎手':
          return 'https://media.wago.io/wow-ui-textures/ICONS/ClassIcon_DemonHunter.PNG'

        case 'tank':
          return 'https://media.wago.io/iconsUI/role-icon-tank.png'
        case 'healer':
          return 'https://media.wago.io/iconsUI/role-icon-healer.png'
        case 'damage': case 'dps':
          return 'https://media.wago.io/iconsUI/role-icon-damage.png'

        case 'bloodlust': case 'bl':
          return 'https://media.wago.io/wow-ui-textures/ICONS/Spell_Nature_BloodLust.PNG'
        case 'heroism': case 'hero':
          return 'https://media.wago.io/wow-ui-textures/ICONS/Ability_Shaman_Heroism.PNG'
        case 'healthstone': case 'hs':
          return 'https://media.wago.io/wow-ui-textures/ICONS/INV_Stone_04.PNG'

        case 'wow':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/Battlenet-WoWicon.PNG'
        case 'd3':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/Battlenet-D3icon.PNG'
        case 'sc2':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/Battlenet-Sc2icon.PNG'
        case 'bnet':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/Battlenet-Portrait.PNG'
        case 'alliance':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/PlusManz-Alliance.PNG'
        case 'horde':
          return 'https://media.wago.io/wow-ui-textures/FriendsFrame/PlusManz-Horde.PNG'

        case 'loading':
          return 'https://media.wago.io/iconsUI/inlineSpinner.svg'
        case 'question':
          return 'https://media.wago.io/wow-ui-textures/ICONS/INV_Misc_QuestionMark.PNG'
      }
    },
    parseNotes (update) {
      const quill = this.$refs.quillContent.quill
      this.$nextTick(() => {
        var position = quill.getSelection(true).index
        var delta = {ops: []}
        var content = quill.getContents().ops
        var changeDiff = 0
        if (typeof update === 'object') {
          changeDiff = update.text.length - this.noteLength
          this.noteLength = update.text.length
        }
        // parse out any {icons}
        const regex = new RegExp('\\{(' +
          'rt[12345678]{1}|star|circle|diamond|triangle|moon|square|cross|x|skull' +                                                              // EN raid markers
          '|sz[12345678]{1}|stern|kreis|diamant|dreieck|mond|quadrat|kreuz|totenschädel' +                                                        // DE raid markers
          '|cr[12345678]{1}|étoile|cercle|losange|triangle|lune|carré|croix|crâne' +                                                              // FR raid markers
          '|si[12345678]{1}|stella|cerchio|rombo|triangolo|luna|quadrato|croce|teschio' +                                                         // IT raid markers
          '|цр[12345678]{1}|звезда|круг|ромб|треугольник|полумесяц|квадрат|крест|череп' +                                                         // RU raid markers
          '|Warrior|Paladin|Hunter|Rogue|Priest|Death\\s?knight|Shaman|Mage|Warlock|Monk|Druid|Demon\\s?Hunter' +                                 // EN classes
          '|Krieger|Paladín|Jäger|Schurke|Priester|Todesritter|Schamane|Magier|Hexenmeister|Mönch|Druide|Dämonenjäger' +                          // DE classes
          '|Guerrero|Paladín|Cazador|Pícaro|Sacerdote|Caballero\\s?de\\s?la\\s?Muerte|Chamán|Mago|Brujo|Monje|Druida|Cazador\\s?de\\s?demonios' + // ES classes
          '|Guerrier|Chasseur|Voleur|Prêtre|Cavaliere\\s?della\\s?Morte|Chaman|Démoniste|Moine|Chasseur\\s?de\\s?Démon' +                         // FR classes
          '|Guerreiro|Paladino|Cacciatore|Ladro|Chevalier\\s?de\\s?la\\s?Morte|Sciamano|Mago|Stregone|Monaco|druido|Cacciatore\\s?di\\s?Demoni' + // IT classes
          '|Ladino|Caçador|Cavaleiro\\s?da\\s?Morte|Xamã|Маг|Bruxo|Monge|Caçador\\s?de\\s?Demônios' +                                             // PT classes
          '|전사|성기사|사냥꾼|도적|사제|죽음의\\s?기사|주술사|마법사|흑마법사|수도사|드루이드|악마사냥꾼' +                                             // KR classes
          '|Воин|Паладин|Охотник|Разбойник|Жрец|Рыцарь\\s?смерти|Шаман|Маг|Чернокнижник|Монах|Друид|Охотник\\s?на\\s?демонов' +                   // RU classes
          '|战士|圣骑士|猎人|盗贼|牧师|死亡骑士|萨满祭司|法师|术士|武僧|德鲁伊|恶魔猎手' +                                                              // CN classes
          // remaining is not localized in either addon
          '|tank|healer|damage|dps' +                                           // Raid roles
          '|bl|bloodlust|hero|heroism|hs|healthstone' +                         // Common spells
          '|wow|d3|sc2|bnet|alliance|horde' +                                   // Community icons
          '|icon:?\\s?\\w+|spell:?\\s?\\d+|boss:?\\s?\\d+|journal:?\\s?\\d+' +  // Custom icon and links
          ')\\}' +
          // check for escape codes
          '|(\\|c([\\dabcdef]{8}|blue|green|red|yellow|orange|pink|purple|deathknight|demonhunter|druid|hunter|mage|monk|paladin|priest|rogue|shaman|warlock|warrior))' + // set color
          '|\\|r' +                                                                                                                                                       // reset color
          // check for wowhead URLs
          '|https://www.wowhead.com/spell=\\d+[^\\s]*' +
          '', 'ig')
        var runAgain = false
        var useColor = null
        for (let i = 0; i < content.length; i++) {
          let split
          // if we deleted something then skip it this iteration
          if (!content[i] || !content[i].insert) {
            // skip
          }
          // if found {code} or |escapes to replace
          else if (content[i] && content[i].insert && typeof content[i].insert === 'string' && content[i].insert.match(regex)) {
            let m
            while ((m = regex.exec(content[i].insert)) !== null) {
              if (m.index === regex.lastIndex) {
                regex.lastIndex++
              }
              if (split) {
                split = split[1].split(m[0])
                delta.ops.pop()
              }
              else {
                split = content[i].insert.split(m[0])
              }

              if (content[i] && content[i].attributes && content[i].attributes.color) {
                useColor = content[i].attributes.color
              }
              delta.ops.push({insert: split[0], attributes: {color: useColor}})

              // what are we matching?
              let icon = m[0].match(/^{icon:?\s?(\d+)}$/)
              let iconText = m[0].match(/^{icon:?\s?(\w+)}$/)
              let spell = m[0].match(/^{spell:?\s?(\d+)}$/)
              let colorStart = m[0].match(/^\|c([\\dabcdef]{8}|blue|green|red|yellow|orange|pink|purple|deathknight|demonhunter|druid|hunter|mage|monk|paladin|priest|rogue|shaman|warlock|warrior)$/i)
              let colorEnd = m[0].match(/^\|r$/)
              let wowheadSpell = m[0].match(/^https:\/\/www.wowhead.com\/spell=(\d+)[^\s]*/)
              if (icon) {
                let spellID = icon[1]
                if (this.blizzData.spells[spellID]) {
                  delta.ops.push({insert: {image: `https://media.wago.io/wow-ui-textures/ICONS/${this.blizzData.spells[spellID].iconFile}`}})
                }
                else {
                  delta.ops.push({insert: {image: this.imageURL('loading')}, attributes: {alt: spellID}})
                  this.http.get('/lookup/blizzard/spell', {id: spellID}).then((spell) => {
                    if (spell && spell.id) {
                      this.blizzData.spells[spellID] = spell
                    }
                    else {
                      this.blizzData.spells[spellID] = {error: true}
                    }
                    this.parseNotes(spellID)
                  }).catch((e) => {
                    this.blizzData.spells[spellID] = {error: true}
                    this.parseNotes(spellID)
                  })
                }
              }
              else if (iconText) {
                let filename = iconText[1]
                if (this.blizzData.spells[filename]) {
                  delta.ops.push({insert: {image: `https://media.wago.io/wow-ui-textures/ICONS/${this.blizzData.spells[filename].iconFile}`}})
                }
                else {
                  delta.ops.push({insert: {image: this.imageURL('loading')}, attributes: {alt: filename}})
                  this.http.get('/lookup/blizzard/spell', {text: filename}).then((spell) => {
                    if (spell && spell.id) {
                      this.blizzData.spells[filename] = spell
                    }
                    else {
                      this.blizzData.spells[filename] = {error: true}
                    }
                    this.parseNotes(filename)
                  }).catch((e) => {
                    this.blizzData.spells[filename] = {error: true}
                    this.parseNotes(filename)
                  })
                }
              }
              else if (spell) {
                let spellID = spell[1]
                if (this.blizzData.spells[spellID]) {
                  delta.ops.push({insert: {image: `https://media.wago.io/wow-ui-textures/ICONS/${this.blizzData.spells[spellID].iconFile}`}})
                  delta.ops.push({insert: ' ' + this.blizzData.spells[spellID].name, attributes: {wowhead: `spell=${spellID}`, link: '#'}})
                  position += this.blizzData.spells[spellID].name.length + 1
                }
                else {
                  delta.ops.push({insert: {image: this.imageURL('loading')}, attributes: {alt: spellID}})
                  delta.ops.push({insert: '...', attributes: {wowhead: `spell=${spellID}`, link: '#'}})
                  position += 3
                  this.http.get('/lookup/blizzard/spell', {id: spellID}).then((spell) => {
                    if (spell && spell.id) {
                      this.blizzData.spells[spellID] = spell
                    }
                    else {
                      this.blizzData.spells[spellID] = {error: true}
                    }
                    this.parseNotes(spellID)
                  }).catch((e) => {
                    this.blizzData.spells[spellID] = {error: true}
                    this.parseNotes(spellID)
                  })
                }
              }
              else if (wowheadSpell) {
                delta.ops.push({insert: `{spell ${wowheadSpell[1]}}`})
                position += ('' + wowheadSpell[1]).length + 8
                runAgain = true
              }
              else if (colorStart) {
                useColor = this.parseColor(colorStart[1])
                if (changeDiff <= 1) {
                  setTimeout(() => {
                    quill.format('color', useColor)
                  }, 50)
                }
                else {
                  delta.ops.push({insert: split[1], attributes: {color: useColor}})
                  position = position - m[0].length + 1
                  continue
                }
              }
              else if (colorEnd) {
                useColor = '#FFFFFF'
                if (changeDiff <= 1) {
                  setTimeout(() => {
                    quill.format('color', useColor)
                  }, 50)
                }
                else {
                  delta.ops.push({insert: split[1], attributes: {color: useColor}})
                  position = position - m[0].length + 1
                  continue
                }
              }
              else {
                delta.ops.push({insert: {image: this.imageURL(m[1])}})
              }
              delta.ops.push({insert: split[1], attributes: {color: useColor}})
              position = position - m[0].length + 1
            }
          }
          // if content is an image pending on an ajax update
          else if (content[i].insert.image && content[i].insert.image === this.imageURL('loading') && (typeof update === 'number' || typeof update === 'string') && content[i].attributes && content[i].attributes.alt === update && this.blizzData.spells[update]) {
            if (this.blizzData.spells[update].iconFile) {
              content[i] = {insert: {image: `https://media.wago.io/wow-ui-textures/ICONS/${this.blizzData.spells[update].iconFile}`}}
              delta.ops.push(content[i])
              // is there an accompanying text string?
              if (content[i + 1] && content[i + 1].insert === '...' && content[i + 1].attributes && content[i + 1].attributes.wowhead === `spell=${update}`) {
                delta.ops.push({insert: ' ' + this.blizzData.spells[update].name, attributes: content[i + 1].attributes})
                content[i + 1].insert = ''
                position += this.blizzData.spells[update].name.length - 1
              }
            }
            else {
              content[i] = {insert: {image: this.imageURL('question')}}
              delta.ops.push(content[i])
            }
          }
          // if content is a valid image
          else if (content[i].insert.image && content[i].insert.image.match(/^https:\/\/media.wago.io\/(wow-ui-textures|iconsUI)\//) && !content[i].insert.image.match(/\/..\//)) {
            delta.ops.push(content[i])
          }
          // if content is an invalid image
          else if (content[i].insert.image) {
            console.log('invalid img', content[i].insert.image)
            // do not add to delta
          }
          // check valid attributes
          else if (content[i].attributes && (content[i].attributes.color || content[i].attributes.alt || content[i].attributes.link || content[i].attributes.wowhead)) {
            if (useColor && !content[i].attributes.color) {
              content[i].attributes.color = useColor
            }
            else if (!useColor && content[i].attributes.color) {
              useColor = content[i].attributes.color
            }
            if (content[i].attributes.link) {
              content[i].attributes = {color: content[i].attributes.color, alt: content[i].attributes.alt, link: '#', wowhead: content[i].attributes.wowhead}
            }
            else {
              content[i].attributes = {color: content[i].attributes.color, alt: content[i].attributes.alt, wowhead: content[i].attributes.wowhead}
            }
            delta.ops.push(content[i])
          }
          // remove other attributes
          else if (content[i].attributes) {
            delete content[i].attributes
            delta.ops.push(content[i])
          }
          else {
            delta.ops.push(content[i])
          }
        }
        async.setImmediate(() => {
          quill.setContents(delta, 'silent')
          quill.setSelection(position, 0, 'silent')
        })
        if (runAgain) {
          setTimeout(() => {
            this.parseNotes()
          }, 10)
        }
      })
    },

    parseColor (color) {
      switch (color.toLowerCase()) {
        case 'blue':
          return '#00cbf4'
        case 'green':
          return '#0adc00'
        case 'red':
          return '#eb310c'
        case 'yellow':
          return '#faf318'
        case 'orange':
          return '#ff9d00'
        case 'pink':
          return '#f64c97'
        case 'purple':
          return '#dc44eb'
        case 'deathknight':
          return '#c41f3b'
        case 'demonhunter':
          return '#a330c9'
        case 'druid':
          return '#ff7d0a'
        case 'hunter':
          return '#abd473'
        case 'mage':
          return '#40C7eb'
        case 'monk':
          return '#00ff96'
        case 'paladin':
          return '#f58cba'
        case 'priest':
          return '#ffffff'
        case 'rogue':
          return '#fff569'
        case 'shaman':
          return '#0070de'
        case 'warlock':
          return '#8787ed'
        case 'warrior':
          return '#c79c6e'
        default:
          if (color.toLowerCase().slice(0, 2) === 'ff') {
            return color.slice(2, 8)
          }
          else {
            const rbga = {
              alpha: parseInt(color.slice(0, 2), 16),
              red: parseInt(color.slice(2, 4), 16),
              green: parseInt(color.slice(4, 6), 16),
              blue: parseInt(color.slice(6, 8), 16)
            }
            return `rgba(${rbga.red}, ${rbga.green}, ${rbga.blue}, ${rbga.alpha}`
          }
      }
    },

    saveFromScratch: function () {
      console.log('saving..')
    },

    saveChanges: function () {
      this.$refs['saveChangesDialog'].close()
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.json = this.aceEditor.getValue()
      post.newVersion = this.newImportVersion.semver
      post.changelog = this.newChangelog.text
      post.changelogFormat = this.newChangelog.format
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
            this.$set(this.wago.code, 'changelog', {text: post.changelog, format: post.changelogFormat})
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
    setHasUnsavedChanges: function (bool) {
      this.$emit('set-has-unsaved-changes', bool)
    },
    exportChanges: function () {
      this.tableString = this.aceEditor.getValue()
      this.showExport = true
    },
    hideExport: function () {
      this.showExport = false
    },
    focusFieldByRef (ref) {
      setTimeout(() => {
        this.$refs[ref].$el.focus()
      }, 150)
    },
    generateNextVersionData () {
      this.newChangelog = { text: '', format: this.$store.state.user.defaultEditorSyntax }
      this.$set(this.newImportVersion, 'semver', semver.inc(this.latestVersion.semver, 'patch'))
      this.$set(this.newImportVersion, 'major', semver.major(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'minor', semver.minor(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'patch', semver.patch(this.newImportVersion.semver))
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
#edit-notes .md-select-content { max-height: calc(70vh); margin-bottom: 32px }
#edit-notes .md-select { width: auto }
#edit-notes .md-input-container { margin-bottom: 10px}
#edit-notes .md-input-container:after { content: none }
#edit-notes .flex-container { display: flex; flex-direction: row; flex-wrap: nowrap; align-items: flex-end}
#edit-notes .flex-left { order: 0; flex: 0 1 auto}
#edit-notes .flex-left .md-input-container label { white-space: nowrap}
#edit-notes .flex-right { order: 1; flex: 1 1 auto; text-align: right}
#editarea { margin: 0 16px; min-height: 400px; box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2), 0 2px 2px rgba(0, 0, 0, 0.14), 0 3px 1px -2px rgba(0, 0, 0, 0.12); background: #333333; color: #DDD; }
#editarea img { width: 18px; height: 18px; }
#copy-import-button.md-button { border: 2px solid #c1272d; border-radius: 25px; margin: 16px 16px 0 0; display: inline-block }
#wago-importstring {width:2em;height:2em;padding:0;border:0;outline:none;boxShadow:none;background:transparent;color:transparent;cursor:default;overflow:hidden;resize:none}
#saveChangesDialog .md-dialog { min-width: 40% }
#wago-note-editor { margin: 16px }

.ql-container { min-height: 450px }
.ql-editor { outline: none; padding: 8px; }
.ql-editor img { max-width: 18px; max-height: 18px }
.ql-toolbar { border: 1px solid #777; padding: 4px }
.ql-toolbar.ql-snow button, .ql-toolbar button { width: 24px; height: 24px; background: none; background-position: center; background-repeat: no-repeat; background-size: 18px 18px; border: 0; cursor: pointer; margin: 0 2px }
.ql-toolbar button:hover { background-color: rgba(127, 127, 127, .5); }
.ql-toolbar button.ql-rt1 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt1.png') }
.ql-toolbar button.ql-rt2 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt2.png') }
.ql-toolbar button.ql-rt3 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt3.png') }
.ql-toolbar button.ql-rt4 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt4.png') }
.ql-toolbar button.ql-rt5 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt5.png') }
.ql-toolbar button.ql-rt6 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt6.png') }
.ql-toolbar button.ql-rt7 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt7.png') }
.ql-toolbar button.ql-rt8 { background-image: url('//media.wago.io/iconsUI/raidmarker-rt8.png') }
.ql-toolbar button.ql-tank { background-image: url('//media.wago.io/iconsUI/role-icon-tank.png') }
.ql-toolbar button.ql-healer { background-image: url('//media.wago.io/iconsUI/role-icon-healer.png') }
.ql-toolbar button.ql-damage { background-image: url('//media.wago.io/iconsUI/role-icon-damage.png') }
.ql-toolbar button.ql-mage { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Mage.PNG') }
.ql-toolbar button.ql-priest { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Priest.PNG') }
.ql-toolbar button.ql-warlock { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Warlock.PNG') }
.ql-toolbar button.ql-demonhunter { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_DemonHunter.PNG') }
.ql-toolbar button.ql-druid { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Druid.PNG') }
.ql-toolbar button.ql-monk { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Monk.PNG') }
.ql-toolbar button.ql-rogue { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Rogue.PNG') }
.ql-toolbar button.ql-hunter { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Hunter.PNG') }
.ql-toolbar button.ql-shaman { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Shaman.PNG') }
.ql-toolbar button.ql-deathknight { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_DeathKnight.PNG') }
.ql-toolbar button.ql-paladin { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Paladin.PNG') }
.ql-toolbar button.ql-warrior { background-image: url('//media.wago.io/wow-ui-textures/ICONS/ClassIcon_Warrior.PNG') }
.ql-toolbar button.ql-bloodlust { background-image: url('//media.wago.io/wow-ui-textures/ICONS/Spell_Nature_BloodLust.PNG') }
.ql-toolbar button.ql-heroism { background-image: url('//media.wago.io/wow-ui-textures/ICONS/Ability_Shaman_Heroism.PNG') }
.ql-toolbar button.ql-healthstone { background-image: url('//media.wago.io/wow-ui-textures/ICONS/INV_Stone_04.PNG') }
.quill-editor .ql-container { border: 0 }
.ql-toolbar polyline.ql-stroke, .ql-toolbar line.ql-stroke { stroke: #CCC!important }
.ql-editor.ql-blank::before { color: inherit }
#content .ql-editor a:not(.md-button) { color: #9adbfe; text-decoration: none; cursor: default }
.ql-tooltip { display: none!important }
</style>
