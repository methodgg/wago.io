<template>
  <div id="edit-notes">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <div class="flex-col flex-right">
        <md-button @click="copyMRT" id="copy-import-button">
          <md-icon>assignment</md-icon> {{ $t("Copy MRT Note") }}
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
      <div id="limited-content-menu" v-if="limitedContentMenu" :class="`limit-${limitedContentMenu.type.replace(/!/, '0')}`" :style="`top: ${limitedContentMenu.lineY}px`">
        {{ $t('Limited display') }}
        <select v-model="limitedContentMenu.type" @change="updateLimited">
          <option value="P" class="name-option">{{ $t('By character name(s)') }}</option>
          <option value="!P" class="name-option">{{ $t('By NOT character name(s)') }}</option>
          <option value="D" class="role-option">{{ $t('By role') }}: {{charToName('D') }}</option>
          <option value="H" class="role-option">{{ $t('By role') }}: {{charToName('H') }}</option>
          <option value="T" class="role-option">{{ $t('By role') }}: {{charToName('T') }}</option>
          <option value="C" class="class-option">{{ $t('By character class(es)') }}</option>
          <option value="!C" class="class-option">{{ $t('By NOT character class(es)') }}</option>
          <option value="G" class="group-option">{{ $t('By raid group(s)') }}</option>
          <option value="!G" class="group-option">{{ $t('By NOT raid group(s)') }}</option>
        </select>
        <template v-if="limitedContentMenu.type === 'P' || limitedContentMenu.type === '!P'">
          <input v-model="limitedContentMenu.value" placeholder="Name1,Name2,Name3..." :style="`width: ${limitedContentMenu.value.length}ch`" @input="updateLimited">
        </template>
        <template v-if="limitedContentMenu.type === 'C' || limitedContentMenu.type === '!C'">
          <img @click="toggleLimitedValue('DeathKnight')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Death\s?Knight/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_deathknight.png"/>
          <img @click="toggleLimitedValue('DemonHunter')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Demon\s?Hunter/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_demonhunter.png"/>
          <img @click="toggleLimitedValue('Druid')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Druid/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_druid.png"/>
          <img @click="toggleLimitedValue('Hunter')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/\bHunter/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_hunter.png"/>
          <img @click="toggleLimitedValue('Mage')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Mage/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_mage.png"/>
          <img @click="toggleLimitedValue('Monk')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Monk/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_monk.png"/>
          <img @click="toggleLimitedValue('Paladin')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Paladin/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_paladin.png"/>
          <img @click="toggleLimitedValue('Priest')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Priest/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_priest.png"/>
          <img @click="toggleLimitedValue('Rogue')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Rogue/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_rogue.png"/>
          <img @click="toggleLimitedValue('Shaman')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Shaman/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_shaman.png"/>
          <img @click="toggleLimitedValue('Warlock')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Warlock/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_warlock.png"/>
          <img @click="toggleLimitedValue('Warrior')" class="select-limited-class" :class="{selected: limitedContentMenu.value.match(/Warrior/i)}" src="https://media.wago.io/wow-interface-export/icons/classicon_warrior.png"/>
        </template>
        <template v-if="limitedContentMenu.type === 'G' || limitedContentMenu.type === '!G'">
          <span @click="toggleLimitedValue('1')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/1/)}">1</span>
          <span @click="toggleLimitedValue('2')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/2/)}">2</span>
          <span @click="toggleLimitedValue('3')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/3/)}">3</span>
          <span @click="toggleLimitedValue('4')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/4/)}">4</span>
          <span @click="toggleLimitedValue('5')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/5/)}">5</span>
          <span @click="toggleLimitedValue('6')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/6/)}">6</span>
          <span @click="toggleLimitedValue('7')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/7/)}">7</span>
          <span @click="toggleLimitedValue('8')" class="select-limited-group" :class="{selected: limitedContentMenu.value.match(/8/)}">8</span>
        </template>
      </div>
      <div id="note-content" ref="noteContent" @copy="copyMRT"></div>
      <template v-if="false">
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
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Achievement_brewery_2.png" /></md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Achievement_brewery_2.png" /></md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell>Icons by icon name</md-table-cell>
              <md-table-cell>{icon name} or {icon:name}</md-table-cell>
              <md-table-cell>{icon:spell_holy_summonlightwell}</md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Spell_Holy_SummonLightwell.png" /></md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Spell_Holy_SummonLightwell.png" /></md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell>Shortcut icons</md-table-cell>
              <md-table-cell>{class name} or {raid target}</md-table-cell>
              <md-table-cell>{star} {mage}</md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_1.png" /> <img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/ClassIcon_Mage.png" /></md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_1.png" /> <img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/ClassIcon_Mage.png" /></md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell>Spell link by ID</md-table-cell>
              <md-table-cell>{spell spellID}</md-table-cell>
              <md-table-cell>{spell 282098}</md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Ability_Racial_PterrordaxSwoop.png"> <a style="color:#9adbfe" data-wowhead="spell=282098">Gift of Wind</a></md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Ability_Racial_PterrordaxSwoop.png"> <span style="color:#9adbfe">Gift of Wind</span><br><small>Not linked</small></md-table-cell>
            </md-table-row>
            <md-table-row>
              <md-table-cell>Spell link by Wowhead URL</md-table-cell>
              <md-table-cell>Just paste the URL</md-table-cell>
              <md-table-cell>https://www.wowhead.com/spell=284360/sea-storm</md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Spell_Frost_IceStorm.png"> <a style="color:#9adbfe" data-wowhead="spell=284360">Sea Storm</a></md-table-cell>
              <md-table-cell><img style="height:16px" src="https://media.wago.io/wow-interface-export/ICONS/Spell_Frost_IceStorm.png"> <span style="color:#9adbfe">Sea Storm</span><br><small>Not linked</small></md-table-cell>
            </md-table-row>
          </md-table-body>
        </md-table>
      </template>
    </md-whiteframe>
    <textarea id="wago-importstring" readonly="true"></textarea>
  </div>
</template>

<script>
const async = require('async')
const semver = require('semver')

import Quill from 'quill'
const Delta = Quill.import('delta')
const Parchment = Quill.import('parchment')
const Clipboard = Quill.import('modules/clipboard')

import InputSemver from '../UI/Input-Semver.vue'

export default {
  props: ['scratch', 'cipherKey'],
  name: 'edit-notes',
  data: function () {
    return {
      showExport: false,
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
      initNoteContent: `Welcome to the early stages of the Encounter Notes section on Wago.io.\n\nThis is a WYSIWYG editor for Angry Assignments and Exorsus Notes.\n\nThere is no saving to Wago yet, but many features of both addons work here.\n\nBoth addons have their own unique features but most are compatible with each other.`,
      parsedNotes: '',
      noteLength: 0,
      activeTimer: null,
      caret: {},
      previousFocus: null,
      reqID: 0,
      limitedContentMenu: null,

      // quill
      quillConfig: {
        // formats: ['color'], // only allow pasted color
        theme: 'snow', // no theme, styling below
        modules: {
          toolbar: {
            container: [
              [{'color': ['#FFFFFF', '#888888', '#000000', '#c41f3b', '#a330c9', '#ff7d0a', '#abd473', '#40C7eb', '#00ff96', '#f58cba', '#fff569', '#0070de', '#8787ed', '#c79c6e']}],
              ['rt1', 'rt2', 'rt3', 'rt4', 'rt5', 'rt6', 'rt7', 'rt8'],
              ['deathknight', 'demonhunter', 'druid', 'hunter', 'mage', 'monk', 'paladin', 'priest', 'rogue', 'shaman', 'warlock', 'warrior'],
              ['tank', 'healer', 'damage'],
              ['bloodlust', 'heroism', 'timewarp', 'healthstone'],
              ['limitedContent']
            ],
            handlers: {
              rt1: () => {
                this.quillInsertImage(this.makeIconBlot('star'))
              },
              rt2: () => {
                this.quillInsertImage(this.makeIconBlot('circle'))
              },
              rt3: () => {
                this.quillInsertImage(this.makeIconBlot('diamond'))
              },
              rt4: () => {
                this.quillInsertImage(this.makeIconBlot('triangle'))
              },
              rt5: () => {
                this.quillInsertImage(this.makeIconBlot('moon'))
              },
              rt6: () => {
                this.quillInsertImage(this.makeIconBlot('square'))
              },
              rt7: () => {
                this.quillInsertImage(this.makeIconBlot('cross'))
              },
              rt8: () => {
                this.quillInsertImage(this.makeIconBlot('skull'))
              },
              mage: () => {
                this.quillInsertImage(this.makeIconBlot('mage'))
              },
              priest: () => {
                this.quillInsertImage(this.makeIconBlot('priest'))
              },
              warlock: () => {
                this.quillInsertImage(this.makeIconBlot('warlock'))
              },
              demonhunter: () => {
                this.quillInsertImage(this.makeIconBlot('demonhunter'))
              },
              druid: () => {
                this.quillInsertImage(this.makeIconBlot('druid'))
              },
              monk: () => {
                this.quillInsertImage(this.makeIconBlot('monk'))
              },
              rogue: () => {
                this.quillInsertImage(this.makeIconBlot('rogue'))
              },
              hunter: () => {
                this.quillInsertImage(this.makeIconBlot('hunter'))
              },
              shaman: () => {
                this.quillInsertImage(this.makeIconBlot('shaman'))
              },
              deathknight: () => {
                this.quillInsertImage(this.makeIconBlot('deathknight'))
              },
              paladin: () => {
                this.quillInsertImage(this.makeIconBlot('paladin'))
              },
              warrior: () => {
                this.quillInsertImage(this.makeIconBlot('warrior'))
              },
              tank: () => {
                this.quillInsertImage(this.makeIconBlot('tank'))
              },
              healer: () => {
                this.quillInsertImage(this.makeIconBlot('healer'))
              },
              damage: () => {
                this.quillInsertImage(this.makeIconBlot('damage'))
              },
              bloodlust: () => {
                this.quillInsertImage(this.makeIconBlot('bloodlust'))
              },
              heroism: () => {
                this.quillInsertImage(this.makeIconBlot('heroism'))
              },
              timewarp: () => {
                this.quillInsertImage(this.makeIconBlot('timewarp'))
              },
              healthstone: () => {
                this.quillInsertImage(this.makeIconBlot('healthstone'))
              }
            }
          }
        }
      }
    }
  },
  components: {
    'input-semver': InputSemver,
    quill: null
  },
  created: function () {
    const _this = this
    class PasteContent extends Clipboard {
      onPaste (e) {
        e.preventDefault()
        const range = this.quill.getSelection()
        const text = e.clipboardData.getData('text/plain')
        const delta = new Delta()
        .retain(range.index)
        .delete(range.length)
        .insert(text.replace(/\n{2,}/g, '\n\n'))
        const index = text.length + range.index
        const length = 0
        this.quill.updateContents(delta, 'silent')
        this.quill.setSelection(index, length, 'silent')
        this.quill.scrollIntoView()
        _this.parseNotes(text)
      }
    }
    Quill.register('modules/clipboard', PasteContent, true)

    const attr = [
      {title: 'title'},
      {class: 'class'},
      {limited: 'data-limited'},
      {value: 'data-value'},
      {type: 'data-type'},
    ]
    for (const [name, field] of Object.entries(attr)) {
      let attributor = new Parchment.Attributor.Attribute(name, field, {scope: Parchment.Scope.ANY})
      Quill.register(attributor)
    }

    const Break = Quill.import('blots/break')
    const Block = Quill.import('blots/block')
    const Embed = Quill.import('blots/embed')
    const Inline = Quill.import('blots/inline')

    class IconBlot extends Embed {
      static create(data) {
        const node = super.create(data)
        node.setAttribute('src', data.src)
        node.setAttribute('title', data.title.replace(/[{}]/g, ''))
        if (data.id) {
          node.setAttribute('id', data.id)
        }
        return node
      }
      static value(domNode) {
        return domNode
      }
    }
    IconBlot.blotName = 'iconBlot'
    IconBlot.className = 'icon-blot'
    IconBlot.tagName = 'img'
    Quill.register({ 'formats/iconBlot': IconBlot })

    class LimitedContent extends Block {
      static create(data) {
        let node = super.create()
        if (node === true) {
          this.$nextTick(() => {
            this.cursorSyntax(this.quill.getSelection(true))
          })
        }
        node.title = data.title || ''
        console.log('limited', data)
        node.setAttribute('data-limited', data.limited || '')
        node.setAttribute('data-type', data.type || 'P')
        node.setAttribute('data-value', data.value || '')
        node.setAttribute('class', 'limited limit-' + (data.type || '').replace(/!/, '0'))
        return node
      }
      static formats(node) {
        return {
          title: node.title || '',
          limited: node.getAttribute('data-limited') || '',
          type: node.getAttribute('data-type') || '',
          value: node.getAttribute('data-value') || '',
        }
      }
    }
    LimitedContent.blotName = 'limitedContent'
    LimitedContent.tagName = 'blockquote'
    Quill.register(LimitedContent)
  },
  mounted: function () {
    this.quill = new Quill(`#note-content`, this.quillConfig)
    this.quill.on('text-change', this.parseNotes)
    this.quill.on('selection-change', this.cursorSyntax)

    this.$nextTick(() => {
      this.quill.root.setAttribute('spellcheck', false)

      if (this.initNoteContent) {
        let delta = new Delta()
        delta.insert(this.initNoteContent)
        this.quill.setContents(delta)
      }

      // document.querySelector('#wago-note-editor .ql-container').addEventListener('click', () => {
      //   if (!quill.getSelection()) {
      //     quill.setSelection(42949672946)
      //   }
      // })
      this.parseNotes()
    })
  },
  methods: {
    copyMRT () {
      const content = this.quill.getContents().ops
      var copyStr = ''
      content.forEach((op) => {
        console.log(op)
        try {
          if (typeof op.insert === 'object' && op.insert.iconBlot) {
            copyStr += `{${op.insert.iconBlot.title}}`
          }

          else if (typeof op.insert === 'string' && op.attributes && op.attributes.color) {
            let color = op.attributes.color.substr(1)
            let alpha = 'ff'
            if (color.match(/gba\(/)) {
              let rgba = color.replace(/\s/g, '').match(/^gba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i)
              alpha = (rgba && rgba[4] || "1").trim()
              alpha = ((alpha * 255) | 1 << 8).toString(16).slice(1)
              color = (rgba[1] | 1 << 8).toString(16).slice(1) + (rgba[2] | 1 << 8).toString(16).slice(1) + (rgba[3] | 1 << 8).toString(16).slice(1)
            }
            else if (color.length === 8) {
              alpha = color.substr(-2)
              color = color.substr(0, 6)
            }
            copyStr += `|c${alpha}${color}${op.insert}|r`
          }

          else if (typeof op.insert === 'string' && op.attributes && op.attributes.limitedContent) {
            let i = copyStr.lastIndexOf('\n')
            if (i >= 0) {
              copyStr = `\r\n${copyStr.substr(0, i)}\r\n{${op.attributes.limitedContent.title}}${copyStr.substr(i).trim()}{/${op.attributes.limitedContent.type}}\r\n`
            }
            else {
              copyStr = `\r\n{${op.attributes.limitedContent.title}}${copyStr.trim()}{/${op.attributes.limitedContent.type}}\r\n`
            }
          }

          else if (typeof op.insert === 'string') {
            copyStr += op.insert
          }
        }
        catch (e) {
          console.log('Could not copy fragment', op, e)
        }
      })

// :gsub("(\n{!?[CcPpGg]:?[^}]+})\n","%1")
// 				:gsub("\n({/[CcPpGg]}\n)","%1")
// 				:gsub("{(!?)[Pp]:([^}]+)}(.-){/[Pp]}",GSUB_Player)
// 				:gsub("{(!?)[Cc]:([^}]+)}(.-){/[Cc]}",GSUB_Class)
// 				:gsub("{[Cc][Ll][Aa][Ss][Ss][Uu][Nn][Ii][Qq][Uu][Ee]:([^}]+)}(.-){/[Cc][Ll][Aa][Ss][Ss][Uu][Nn][Ii][Qq][Uu][Ee]}",GSUB_ClassUnique)
// 				:gsub("{(!?)[Gg](%d+)}(.-){/[Gg]}",GSUB_Group)
// 				:gsub("{(!?)[Rr][Aa][Cc][Ee]:([^}]+)}(.-){/[Rr][Aa][Cc][Ee]}",GSUB_Race)
// 				:gsub("{[Ee]:([^}]+)}(.-){/[Ee]}",GSUB_Encounter)
// 				:gsub("{(!?)[Pp]([^}:][^}]*)}(.-){/[Pp]}",GSUB_Phase)
// 				:gsub("{icon:([^}]+)}","|T%1:16|t")
// 				:gsub("{spell:(%d+):?(%d*)}",GSUB_Icon)
// 				:gsub("%b{}",GSUB_RaidIcon)
// 				:gsub("||([cr])","|%1")
// 				:gsub("[^ \n,]+",GSUB_AutoColor)
// 				:gsub("\n+$", "")





      document.getElementById('wago-importstring').value = copyStr.trim()
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
    quillInsertImage (image) {
      const position = this.quill.getSelection(true).index
      this.quill.insertEmbed(position, 'iconBlot', image, 'user')
      this.quill.setSelection(position + 1, 0, 'silent')
    },
    makeIconBlot (image) {
      switch (image.toLowerCase().replace(/\s/g, '')) {
        case 'rt1': case 'sz1': case 'cr1': case 'si1': case 'цр1':
        case 'star': case 'stern': case 'étoile': case 'stella': case 'звезда':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_1.png', title: 'rt1'}
        case 'rt2': case 'sz2': case 'cr2': case 'si2': case 'цр2':
        case 'circle': case 'kreis': case 'cercle': case 'cerchio': case 'круг':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_2.png', title: 'rt2'}
        case 'rt3': case 'sz3': case 'cr3': case 'si3': case 'цр3':
        case 'diamond': case 'diamant': case 'losange': case 'rombo': case 'ромб':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_3.png', title: 'rt3'}
        case 'rt4': case 'sz4': case 'cr4': case 'si4': case 'цр4':
        case 'triangle': case 'dreieck': case 'triangolo': case 'треугольник':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_4.png', title: 'rt4'}
        case 'rt5': case 'sz5': case 'cr5': case 'si5': case 'цр5':
        case 'moon': case 'mond': case 'lune': case 'luna': case 'полумесяц':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_5.png', title: 'rt5'}
        case 'rt6': case 'sz6': case 'cr6': case 'si6': case 'цр6':
        case 'square': case 'quadrat': case 'carré': case 'quadrato': case 'квадрат':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_6.png', title: 'rt6'}
        case 'rt7': case 'sz7': case 'cr7': case 'si7': case 'цр7': case 'x':
        case 'cross': case 'kreuz': case 'croix': case 'croce': case 'крест':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_7.png', title: 'rt7'}
        case 'rt8': case 'sz8': case 'cr8': case 'si8': case 'цр8':
        case 'skull': case 'totenschädel': case 'crâne': case 'teschio': case 'череп':
          return {src: 'https://media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_8.png', title: 'rt8'}

        case 'warrior': case 'krieger': case 'guerrero': case 'guerrier': case 'guerreiro':
        case '전사': case 'Воин': case '战士':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_warrior.png', title: 'icon:Interface\\ICONS\\ClassIcon_Warrior'}
        case 'paladin': case 'paladín': case 'Paladino':
        case '성기사': case 'Паладин': case '圣骑士':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_paladin.png', title: 'icon:Interface\\ICONS\\ClassIcon_Paladin'}
        case 'hunter': case 'jäger': case 'cazador': case 'chasseur': case 'cacciatore':
        case 'caçador': case '사냥꾼': case 'Охотник': case '猎人':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_hunter.png', title: 'icon:Interface\\ICONS\\ClassIcon_Hunter'}
        case 'rogue': case 'schurke': case 'pícaro': case 'voleur': case 'ladro':
        case 'ladino': case '도적': case 'разбойник': case '盗贼':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_rogue.png', title: 'icon:Interface\\ICONS\\ClassIcon_Rogue'}
        case 'priest': case 'priester': case 'sacerdote': case 'prêtre':
        case '사제': case 'жрец': case '牧师':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_priest.png', title: 'icon:Interface\\ICONS\\ClassIcon_Priest'}
        case 'deathknight': case 'todesritter': case 'caballerodelamuerte': case 'cavalieredellamorte': case 'chevalierdelamorte':
        case 'cavaleirodamorte': case '죽음의기사': case 'рыцарьсмерти': case '死亡骑士':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_deathknight.png', title: 'icon:Interface\\ICONS\\ClassIcon_DeathKnight'}
        case 'shaman': case 'schamane': case 'chamán': case 'chaman': case 'sciamano':
        case 'xamã': case '주술사': case 'шаман': case '萨满祭司':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_shaman.png', title: 'icon:Interface\\ICONS\\ClassIcon_Shaman'}
        case 'mage': case 'magier': case 'mago':
        case '마법사': case 'маг': case '法师':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_mage.png', title: 'icon:Interface\\ICONS\\ClassIcon_Mage'}
        case 'warlock': case 'hexenmeister': case 'brujo': case 'démoniste': case 'stregone':
        case 'bruxo': case '흑마법사': case 'чернокнижник': case '术士':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_warlock.png', title: 'icon:Interface\\ICONS\\ClassIcon_Warlock'}
        case 'monk': case 'mönch': case 'monje': case 'moine': case 'monaco':
        case 'monge': case '수도사': case 'монах': case '武僧':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_monk.png', title: 'icon:Interface\\ICONS\\ClassIcon_Monk'}
        case 'druid': case 'druide': case 'druida': case 'druido':
        case '드루이드': case 'друид': case '德鲁伊':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_druid.png', title: 'icon:Interface\\ICONS\\ClassIcon_Druid'}
        case 'demonhunter': case 'dämonenjäger': case 'cazadordedemonios': case 'chasseurdedémon': case 'cacciatoredidemoni':
        case 'caçadordedemônios': case '악마사냥꾼': case 'охотникнадемонов': case '恶魔猎手':
          return {src: 'https://media.wago.io/wow-interface-export/icons/classicon_demonhunter.png', title: 'icon:Interface\\ICONS\\ClassIcon_DemonHunter'}

        case 'tank':
          return {src: 'https://media.wago.io/site/role-icon-tank.png', title: 'tank'}
        case 'healer':
          return {src: 'https://media.wago.io/site/role-icon-healer.png', title: 'healer'}
        case 'damage': case 'dps':
          return {src: 'https://media.wago.io/site/role-icon-damage.png', title: 'dps'}

        case 'bloodlust': case 'bl':
          return {src: 'https://media.wago.io/wow-interface-export/icons/spell_nature_bloodLust.png', title: 'spell:2825'}
        case 'heroism': case 'hero':
          return {src: 'https://media.wago.io/wow-interface-export/icons/ability_shaman_heroism.png', title: 'spell:32182'}
        case 'timewarp': case 'tw':
          return {src: 'https://media.wago.io/wow-interface-export/icons/ability_mage_timeWarp.png', title: 'spell:80353'}
        case 'healthstone': case 'hs':
          return {src: 'https://media.wago.io/wow-interface-export/icons/inv_stone_04.png', title: 'spell:6262'}

        case 'wow':
          return 'https://media.wago.io/wow-interface-export/friendsframe/battlenet-wowicon.png'
        case 'd3':
          return 'https://media.wago.io/wow-interface-export/friendsframe/battlenet-d3icon.png'
        case 'sc2':
          return 'https://media.wago.io/wow-interface-export/friendsframe/battlenet-sc2icon.png'
        case 'bnet':
          return 'https://media.wago.io/wow-interface-export/friendsframe/battlenet-portrait.png'
        case 'alliance':
          return 'https://media.wago.io/wow-interface-export/friendsframe/plusmanz-alliance.png'
        case 'horde':
          return 'https://media.wago.io/wow-interface-export/friendsframe/plusmanz-horde.png'

        case 'loading':
          return 'https://media.wago.io/site/icon-waiting.gif'
        case 'question':
          return 'https://media.wago.io/wow-interface-export/icons/inv_misc_questionmark.png'

        return null
      }
    },
    parseNotes (pasteText, o, source) {
      if (source === 'api') {
        return
      }
      let startNewBlock = true
      this.$nextTick(async () => {
        const contents = this.quill.getContents().ops
        // ensure non-blockquote content at start and end
        if (contents.length > 1) {
          if (typeof contents[0].insert === 'string' && !contents[0].insert.trim() && contents[1].attributes && contents[1].attributes.limitedContent) {
            contents.splice(0, 2)
          }
          else if (typeof contents[0].insert === 'string' && (contents[0].insert.match(/\n/g) || []).length < 1 && contents[1].attributes && contents[1].attributes.limitedContent) {
            contents[0].insert = '\n' + contents[0].insert.trim()
          }
          if (contents[contents.length - 1].attributes && contents[contents.length - 1].attributes.limitedContent) {
            contents.push({insert: '\n'})
          }
        }
        let hasChanges = false
        var position = this.quill.getSelection(true).index
        var changeDiff = 0

        // parse out any {icons}
        const regexStandardIcon = new RegExp('([\\s\\S]*)(\\{(' +
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
          '|전사|성기사|사냥꾼|도적|사제|죽음의\\s?기사|주술사|마법사|흑마법사|수도사|드루이드|악마사냥꾼' +                                                   // KR classes
          '|Воин|Паладин|Охотник|Разбойник|Жрец|Рыцарь\\s?смерти|Шаман|Маг|Чернокнижник|Монах|Друид|Охотник\\s?на\\s?демонов' +                   // RU classes
          '|战士|圣骑士|猎人|盗贼|牧师|死亡骑士|萨满祭司|法师|术士|武僧|德鲁伊|恶魔猎手' +                                                                   // CN classes
          // remaining is not localized
          '|tank|healer|damage|dps' +                                                // Raid roles
          '|bl|bloodlust|hero|heroism|hs|healthstone' +                              // Common spells
          '|wow|d3|sc2|bnet|alliance|horde' +                                        // Community icons
          ')\\})([\\s\\S]*)', 'i')

          // '|icon:?\\s?[\\w\\/]+|spell:?\\s?\\d+|boss:?\\s?\\d+|journal:?\\s?\\d+' +  // Custom icon and links
          // ')\\}' +
          // // check for escape codes
          // '|(\\|c([\\dabcdef]{8}|blue|green|red|yellow|orange|pink|purple|deathknight|demonhunter|druid|hunter|mage|monk|paladin|priest|rogue|shaman|warlock|warrior))' + // set color
          // '|\\|r' +
          // ')(.*)', 'i')
        const regexColor = /([\s\S]*)\|c([abcdef\d]{2})([abcdef\d]{6})([\s\S]*)/
        const regexLimitedPlayers = /([\s\S]*)\{(!)?P:([^\}]+)\}([\s\S]*)/i
        const regexTexturePath = /([\s\S]*)(\{icon:(Interface[/\\]+([^}]+))\})([\s\S]*)/i
        const regexTextureID = /([\s\S]*)(\{icon:(\d+)\})([\s\S]*)/i
        const regexSpellID = /([\s\S]*)(\{spell:(\d+)\})([\s\S]*)/i
        const regexWowhead = /([\s\S]*)(https:\/\/(\w+\.)?wowhead\.com\/(spell)=(\d+).*?)(\s[\s\S]*)/i
        var runAgain = false
        var useColor = null

        /*
time formats:
{time:75}
{time:1:15}
{time:2:30,p2}	--start on phase 2, works only with bigwigs
{time:0:30,SCC:17:2}	--start on combat log event. format "event:spellID:counter", events: SCC (SPELL_CAST_SUCCESS), SCS (SPELL_CAST_START), SAA (SPELL_AURA_APPLIED), SAR (SPELL_AURA_REMOVED)
{time:0:30,e,customevent}	--start on MRT.F.Note_Timer(customevent) function or "/rt note starttimer customevent"
{time:2:30,wa:nzoth_hs1}	--run weakauras custom event MRT_NOTE_TIME_EVENT with arg1 = nzoth_hs1, arg2 = time left (event runs every second when timer has 5 second
        */

        let delta = []
        let promiseLookups = []
        let eof = true
        for (let i = 0; i < contents.length; i++) {
          if (typeof contents[i].insert === 'string') {
            let str = contents[i].insert
            eof = !!str.match(/\n$/)

            if (str.match(regexColor)) {
              let m = str.match(regexColor)
              contents[i].insert = m[1]
              delta.push(contents[i])
              let [matchText, resetText] = m[4].split(/\|r/)
              if (resetText) {
                delta.push({insert: matchText, attributes: {color: `#${m[3]+m[2]}`}})
                delta.push({insert: resetText})
              }
              else {
                this.$nextTick(() => {
                  this.quill.insertText(position - 1, '\u200b', {color: `#${m[3]+m[2]}`})
                })
                position = position - 10
                delta.push({insert: matchText})
              }
              hasChanges = true
            }

            else if (str.match(regexLimitedPlayers)) {
              let m = str.match(regexLimitedPlayers)
              contents[i].insert = m[1].replace(/\n*$/, '')
              delta.push(contents[i])
              let structure = m[4].split(/\{\/P\}/i)
              let nested = m[1].match(/\{!?P:([^\}]+)\}/i) || []
              let matchText, resetText
              let limitedText, limitedField
              if (m[2]) {
                limitedText = `displayed for players: ${m[3]}`
                limitedField = `!P:${m[3]}`
              }
              else {
                limitedText = `displayed for players: ${m[3]}`
                limitedField = `P:${m[3]}`
              }
              if (structure.length <= 2) {
                matchText = structure[0]
                resetText = (structure[1] || '').trim()
              }
              else if (nested.length) {
                matchText = ''
                let part1 = structure.splice(structure.length - nested.length, nested.length)
                for (let i = 0; i < structure.length; i++) {
                  matchText += `${structure[i]}${nested[i]}`
                }
                resetText = structure.join('{/P}').trim()
              }
              let newline = ''
              if (!resetText.trim()) {
                newline = '\n'
              }

              delta.push({insert: (startNewBlock ? '\n' : '') + matchText.replace(/\n*$/, '')})
              delta.push({insert: '\n', attributes: {limitedContent: {type: 'P', limited: limitedText, title: limitedField, value: m[3]}, class: `limited`}})
              delta.push({insert: newline + resetText.replace(/^\n/, '')})

              hasChanges = true
              // contents[i].insert = m[1]
              // let display = {content: m[4], title: `P:${m[3]}`, id: 'limit-' + (this.reqID++)}
              // if (m[2]) {
              //   display.not = true
              //   display.limited = `Limited to players NOT: ${m[3]}`
              // }
              // else {
              //   display.limited = `Limited to players: ${m[3]}`
              //   m[2] = ''
              // }
              // delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
              // delta.push({insert: {limitedDisplayBlot: display}})
              // delta.push(Object.assign(Object.create(contents[i]), {insert: m[5]}))
              // position += 1 - m[2].length - m[3].length - m[4].length - 7
              // hasChanges = true
              // console.log(delta)
            }

            // {warrior}; {skull}; {healer}; etc
            else if (str.match(regexStandardIcon)) {
              let m = str.match(regexStandardIcon)
              let image = this.makeIconBlot(m[3])
              if (image) {
                delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
                delta.push({insert: {iconBlot: image}})
                delta.push(Object.assign(Object.create(contents[i]), {insert: m[4]}))
                position += 1 - m[2].length
                hasChanges = true
              }
            }

            // {icon:path/to/texture}
            else if (str.match(regexTexturePath)) {
              let m = str.match(regexTexturePath)
              let image = {src: `https://media.wago.io/wow-interface-export/${m[4].toLowerCase().replace(/\//g, '\\').replace(/\.{2,}/g, '.')}.png`, title: m[3].replace(/\\/g, '\\\\')}
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
              delta.push({insert: {iconBlot: image}})
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[5]}))
              position += 1 - m[2].length
              hasChanges = true
            }

            // {icon:12345} (texture ID)
            else if (str.match(regexTextureID)) {
              let m = str.match(regexTextureID)
              let imageID = 'texture-' + (this.reqID++)
              this.$DBC.lookup({id: `texture:${m[3]}`, done: res => {
                document.getElementById(imageID).src = `https://media.wago.io/wow-interface-export/${res.filePath}.png`
              }})
              let image = {src: 'https://media.wago.io/site/icon-waiting.svg', id: imageID, title: m[2]}
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
              delta.push({insert: {iconBlot: image}})
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[4]}))
              position += 1 - m[2].length
              hasChanges = true
            }

            // {spell:12345} (spell ID)
            else if (str.match(regexSpellID)) {
              let m = str.match(regexSpellID)
              let imageID = 'texture-' + (this.reqID++)
              this.$DBC.lookup({id: `spell:${m[3]}`, done: res => {
                document.getElementById(imageID).src = `https://media.wago.io/wow-interface-export/${res.filePath}.png`
              }})
              let image = {src: 'https://media.wago.io/site/icon-waiting.svg', id: imageID, title: m[2]}
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
              delta.push({insert: {iconBlot: image}})
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[4]}))
              position += 1 - m[2].length
              hasChanges = true
            }

            // https://www.wowhead.com/spell=123456/test wowhead link
            else if (str.match(regexWowhead)) {
              let m = str.match(regexWowhead)
              if (typeof pasteText === 'string' && m[2].length !== pasteText.length && m[2].indexOf(pasteText) === 0) {
                m[6] = m[2].replace(pasteText, '') + m[6]
                m[2] = pasteText
              }
              let imageID = 'texture-' + (this.reqID++)
              let textPos = position + 1 - m[2].length
              this.$DBC.lookup({id: `spell:${m[5]}`, done: res => {
                document.getElementById(imageID).src = `https://media.wago.io/wow-interface-export/${res.filePath}.png`
                this.quill.insertText(textPos, ' ' + res.enUS + ' ', {color: '#3AC7D4'})
                this.quill.removeFormat(textPos + res.enUS.length + 1, 1)
                this.quill.setSelection(textPos + res.enUS.length + 2, 0, 'silent')
              }})
              let image = {src: 'https://media.wago.io/site/icon-waiting.svg', id: imageID, title: `${m[4]}:${m[5]}`}
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[1]}))
              delta.push({insert: {iconBlot: image}})
              delta.push(Object.assign(Object.create(contents[i]), {insert: m[6]}))
              position += 1 - m[2].length
              hasChanges = true
            }

            else {
              contents[i].insert = str
              delta.push(contents[i])
            }
          }
          else {
            eof = false
            delta.push(contents[i])
          }

          startNewBlock = !(typeof delta[delta.length - 1].insert === 'string' && delta[delta.length - 1].insert.match(/\s$/))
        }


        //   else if (typeof contents[i].insert === 'string' && contents[i].insert.match(regexWowhead)) {
        //     let m = contents[i].insert.match(regexWowhead)
        //     let image
        //     let textObj = {}
        //     if (this.blizzData[m[3]]) {
        //       image = {src: this.blizzData[m[3]].icon, title: `spell:${m[4]}`}
        //       textObj = {text: this.blizzData[m[3]].enUS, color: 'cyan'}
        //     }
        //     else {
        //       let iconID = 'icon-' + (this.reqID++)
        //       let textID = 'text-' + (this.reqID++)
        //       image = {src: 'https://media.wago.io/site/icon-waiting.svg', title: `${m[3]}:${m[4]}`, id: iconID}
        //       textObj = {text: '?', color: '#21e0f3', id: textID}
        //       promiseLookups.push({type: 'spell', iconID, textPos: position - m[2].length + 1, req: this.http.get('/lookup/dbc', {id: `spell:${m[4]}`})})
        //     }


        console.log('set contents', delta)
        await this.quill.setContents(delta)
        await this.quill.setSelection(position, 0, 'silent')

        await this.$DBC.process()

        if (hasChanges) {
          return this.parseNotes()
        }
        return

        if (delta.ops.length) {
          this.quill.setContents(delta)
          this.quill.setSelection(position, 0, 'silent')
        }

        if (hasChanges) {
          this.parseNotes()
        }
      })
    },

    cursorSyntax (range) {
      if (!range) {
        return
      }
      let cursorPos = range.index
      let trackingPos = 0
      let lineY = 45
      const contents = this.quill.getContents().ops
      for (let i = 0; i < contents.length; i++) {
        if (typeof contents[i].insert !== 'string') {
          trackingPos++
        }
        else if (contents[i].insert.match(/\n$/)) {
          trackingPos += contents[i].insert.length
          lineY += (contents[i].insert.match(/\n/g) || []).length * 20
        }
        else if (contents[i].insert.match(/\n/) && cursorPos >= trackingPos + contents[i].insert.lastIndexOf('\n') + 1 && cursorPos <= trackingPos + contents[i].insert.length) {
          trackingPos += contents[i].insert.length
          lineY += (contents[i].insert.match(/\n/g) || []).length * 20

          if (contents[i + 1] && contents[i + 1].attributes && contents[i + 1].attributes.limitedContent) {
            console.log(contents[i + 1].attributes.limitedContent)
            this.limitedContentMenu = Object.assign({op: i + 1, lineY, value: contents[i + 1].attributes.limitedContent.value}, contents[i + 1].attributes.limitedContent)
            return
          }
        }
        else {
          trackingPos += contents[i].insert.length
          lineY += (contents[i].insert.match(/\n/g) || []).length * 20
        }

        if (contents[i] && contents[i].attributes && contents[i].attributes.limitedContent) {
          lineY += 40
        }
      }
      this.limitedContentMenu = null
    },

    charToName (char) {
      char = char.toUpperCase()
      if (char === 'D') {
        return this.$t('Damage Dealers')
      }
      else if (char === 'H') {
        return this.$t('Healers')
      }
      else if (char === 'T') {
        return this.$t('Tanks')
      }
      return char
    },

    toggleLimitedValue (str) {
      let values = (this.limitedContentMenu.value || '').replace(/undefined/g, '').replace(/\s/g).split(/,/g)
      let x = values.indexOf(str)
      console.log((this.limitedContentMenu.value || ''), values, x)
      if (x >= 0) {
        values.splice(x, 1)
      }
      else {
        values.push(str)
      }
      this.$set(this.limitedContentMenu, 'value', values.join(',').replace(/^[\s,]*|[\s,]*^/g, ''))
      this.updateLimited()
    },

    updateLimited () {
      if (this.limitedContentMenu.type.match(/^!?P/i)) {
        this.limitedContentMenu.value = this.limitedContentMenu.value.replace(/\s*/g, '')
        this.limitedContentMenu.title = this.limitedContentMenu.type + ':' + this.limitedContentMenu.value
        this.limitedContentMenu.limited = `displayed for players: ${this.limitedContentMenu.value}`
      }
      else if (this.limitedContentMenu.type.match(/^(D|H|T)$/i)) {
        this.limitedContentMenu.title = this.limitedContentMenu.value
        this.limitedContentMenu.limited = `displayed for role: ${this.charToName(this.limitedContentMenu.type)}`
      }
      else if (this.limitedContentMenu.type.match(/^!?C/i)) {
        this.limitedContentMenu.value = this.limitedContentMenu.value.replace(/\s*/g, '').replace(/undefined/g, '') // not sure where undefined is getting added
        this.limitedContentMenu.title = this.limitedContentMenu.type + ':' + this.limitedContentMenu.value
        this.limitedContentMenu.limited = `displayed for classes: ${this.limitedContentMenu.value.replace(/,/g, ', ')}`
      }
      else if (this.limitedContentMenu.type.match(/^!?G/i)) {
        this.limitedContentMenu.value = this.limitedContentMenu.value.replace(/\s*/g, '').replace(/undefined/g, '')
        this.limitedContentMenu.title = this.limitedContentMenu.type + ':' + this.limitedContentMenu.value.replace(/\D*/g, '')
        this.limitedContentMenu.limited = `displayed for raid groups: ${this.limitedContentMenu.value.replace(/\D*/g, '').replace(/(\w)/g, '$1, ').replace(/,\s*$/, '')}`
      }
      const content = this.quill.getContents().ops
      content[this.limitedContentMenu.op].attributes.limitedContent = this.limitedContentMenu
      this.quill.setContents(content)
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
      post.cipherKey = this.cipherKey
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

<style lang="scss">
#note-content {
  .ql-editor {
    outline: none;
    padding: 16px;
    min-height: 450px;
    img { max-width: 18px; max-height: 18px }
    p {
      margin: 0;
    }
  }
  .ql-hidden {display: none}
  .limited {
    display: block;
    padding: 18px 8px 4px 8px;
    border: 1px solid #777;
    border-radius: 4px;
    margin: 8px 0;
    background: #222;
    position: relative;
    width: auto;
    color: #ddd;
    &:before {
      position: absolute;
      top: -8px;
      left: 2px;
      color: blue;
      background: #222;
      border: inherit;
      border-width: 1px 0 1px 1px;
      border-radius: 4px 0 0 4px;
      padding: 0 4px;
    }
    &:after {
      position: absolute;
      top: -8px;
      padding: 0 4px;
      background: #222;
      border: inherit;
      border-width: 1px 1px 1px 0;
      border-radius: 0 4px 4px 0;
      content: attr(data-limited);
    }
    &.limit-P:before, &.limit-C:before, &.limit-G:before {
      color: #ffbc00;
      content: 'ONLY';
    }
    &.limit-0P:before, &.limit-0C:before, &.limit-0G:before {
      color: #d85000;
      content: 'NOT';
    }
    &.limit-P:after, &.limit-C:after, &.limit-D:after, &.limit-H:after, &.limit-T:after, &.limit-G:after {
      left: 41px;
    }
    &.limit-0P:after, &.limit-0C:after, &.limit-0G:after {
      left: 35px;
    }

    &.limit-P, &.limit-0P {
      border-color: #834002;
      &:after {
        color: #A36012;
      }
    }
    &.limit-D, &.limit-H, &.limit-T {
      border-color: #007e94;
      &:after {
        color: #209ec4;
      }
    }
    &.limit-D:before, &.limit-H:before, &.limit-T:before {
      color: #ffbc00;
      content: 'ONLY';
    }

    &.limit-C, &.limit-0C {
      border-color: #740061;
      &:after {
        color: #A43091;
      }
    }

    &.limit-G, &.limit-0G {
      border-color: #679A41;
      &:after {
        color: #97BA71;
      }
    }
  }
}

#edit-notes {
  position: relative;
  #limited-content-menu {
    position: absolute;
    border-radius: 4px;
    left: 19px;
    border: 1px solid #777;
    background: #252525;
    z-index: 99;
    min-width: 240px;
    padding: 4px;

    &.limit-P, &.limit-0P, .name-option {
      border-color: #A36022;
      color: #A36022;
      select , input{
        color: #A36022;
      }
    }
    &.limit-D, &.limit-H, &.limit-T, .role-option {
      border-color: #209eb4;
      color: #209eb4;
      select, input{
        color: #209eb4;
      }
    }
    &.limit-C, &.limit-0C, .class-option {
      border-color: #A43091;
      color: #A43091;
      select , input{
        color: #A43091;
      }
      .select-limited-class {
        cursor: pointer;
        border: 1px solid #222;
        &.selected {
          border-color: gold;
        }
      }
    }
    &.limit-G, &.limit-0G, .group-option {
      border-color: #679A41;
      color: #679A41;
      select , input{
        color: #679A41;
      }
      .select-limited-group {
        cursor: pointer;
        border: 1px solid #222;
        font-size: 15px;
        line-height: 18px;
        width: 18px;
        display: inline-block;
        text-align: center;
        &.selected {
          border-color: gold;
        }
      }
    }

    img {
      width: 20px;
      height: 20px;
    }
  }
  select, input {
    background: #222;
    border: 1px solid #444;
    padding: 2px;
    border-radius: 4px;
    z-index: 5;
    outline: 0;
  }
  input {
    padding: 3px 2px;
    min-width: 200px;
    max-width: 100%;
  }
}


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

.ql-toolbar {
  border: 1px solid #777;
  padding: 4px;
  .ql-formats {
    display: inline-block;
    vertical-align: middle;
    margin-right: 2px;
    padding-right: 2px;
    border-right: 1px solid #555;
    &:last-child {
      border-right: 0;
    }
  }
  button, .ql-picker {
    width: 24px; height: 24px;
    border: 0;
    cursor: pointer;
    margin: 0 2px;
    background: none;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 22px 22px;
    position: relative;

    .ql-picker-label {
      padding: 4px 2px 2px 2px;
    }

    &:hover, &:hover  .ql-picker-label, &.ql-expanded .ql-picker-label {
      background-color: #585858;
    }

    &.ql-expanded .ql-picker-options {
      position: absolute;
      margin-top: -1px;
      top: 100%;
      left: 0;
      z-index: 1;
      box-shadow: rgb(0 0 0 / 20%) 0 2px 8px;
      background: #333;
      border: 1px solid #555;
      width: 168px;

      .ql-picker-item {
        border: 1px solid transparent;
        float: left;
        height: 16px;
        margin: 2px;
        padding: 0px;
        width: 16px;
      }
    }

    svg {
      width: 20px; height: 20px;
    }
  }
  button {
    border-top: 1px solid #333;
  }
}

.ql-toolbar button:hover { background-color: rgba(127, 127, 127, .5); }
.ql-toolbar button.ql-rt1 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_1.png') }
.ql-toolbar button.ql-rt2 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_2.png') }
.ql-toolbar button.ql-rt3 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_3.png') }
.ql-toolbar button.ql-rt4 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_4.png') }
.ql-toolbar button.ql-rt5 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_5.png') }
.ql-toolbar button.ql-rt6 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_6.png') }
.ql-toolbar button.ql-rt7 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_7.png') }
.ql-toolbar button.ql-rt8 { background-image: url('//media.wago.io/wow-interface-export/targetingframe/ui-raidtargetingicon_8.png') }
.ql-toolbar button.ql-tank { background-image: url('//media.wago.io/site/role-icon-tank.png') }
.ql-toolbar button.ql-healer { background-image: url('//media.wago.io/site/role-icon-healer.png') }
.ql-toolbar button.ql-damage { background-image: url('//media.wago.io/site/role-icon-damage.png') }
.ql-toolbar button.ql-mage { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_mage.png') }
.ql-toolbar button.ql-priest { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_priest.png') }
.ql-toolbar button.ql-warlock { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_warlock.png') }
.ql-toolbar button.ql-demonhunter { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_demonhunter.png') }
.ql-toolbar button.ql-druid { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_druid.png') }
.ql-toolbar button.ql-monk { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_monk.png') }
.ql-toolbar button.ql-rogue { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_rogue.png') }
.ql-toolbar button.ql-hunter { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_hunter.png') }
.ql-toolbar button.ql-shaman { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_shaman.png') }
.ql-toolbar button.ql-deathknight { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_deathknight.png') }
.ql-toolbar button.ql-paladin { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_paladin.png') }
.ql-toolbar button.ql-warrior { background-image: url('//media.wago.io/wow-interface-export/icons/classicon_warrior.png') }
.ql-toolbar button.ql-bloodlust { background-image: url('//media.wago.io/wow-interface-export/icons/spell_nature_bloodlust.png') }
.ql-toolbar button.ql-heroism { background-image: url('//media.wago.io/wow-interface-export/icons/ability_shaman_heroism.png') }
.ql-toolbar button.ql-timewarp { background-image: url('//media.wago.io/wow-interface-export/icons/ability_mage_timewarp.png') }
.ql-toolbar button.ql-healthstone { background-image: url('//media.wago.io/wow-interface-export/icons/inv_stone_04.png') }
.ql-toolbar polyline.ql-stroke, .ql-toolbar line.ql-stroke { stroke: #CCC!important }

</style>
