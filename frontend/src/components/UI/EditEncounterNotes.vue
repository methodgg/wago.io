<template>
  <div id="edit-notes">
    <div class="flex-container">
      <div class="flex-col flex-left">
      </div>
      <!--<div class="flex-col flex-right">    
        <md-button @click="exportChanges" v-if="showExport"><md-icon>open_in_new</md-icon> {{ $t("Export/Fork changes") }}</md-button>
        <md-button v-if="canEdit" @click="generateNextVersionData(); $refs['saveChangesDialog'].open()" ref="saveChangesButton" :disabled="wago.type === 'ELVUI' || wago.type === 'VUHDO'"><md-icon>save</md-icon> {{ $t("Save changes") }}</md-button>
        <md-button class="md-hide-xsmall" v-if="scratch" @click="saveFromScratch"><md-icon>save</md-icon> {{ $t("Save Notes") }}</md-button>
      </div>-->
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
    
    <div v-if="$store.state.user && $store.state.user.access && $store.state.user.access.beta" id="editarea" contenteditable="true" v-html="parsedNotes" @keydown="resetActiveTimer" @keyup="resetActiveTimer" @blur="parseNotes"></div>
  </div>
</template>

<script>
function isChildOf (node, parentId) {
  while (node !== null) {
    if (node.id === parentId) {
      return true
    }
    node = node.parentNode
  }
  return false
}

const semver = require('semver')

export default {
  props: ['scratch'],
  name: 'edit-notes',
  data: function () {
    return {
      showExport: false,
      latestVersion: {semver: this.$store.state.wago.versions.versions[0].versionString},
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newChangelog: {},
      noteContent: '',
      parsedNotes: '',
      activeTimer: null,
      caretPosition: -1
    }
  },
  components: {
    'input-semver': require('../UI/Input-Semver.vue')
  },
  created: function () {
    // this.activeTimer = setInterval(this.parseNotes, 3000)
  },
  methods: {
    resetActiveTimer () {
      this.caretPosition = this.getCaretPosition()
      // clearInterval(this.activeTimer)
      // this.activeTimer = setInterval(this.parseNotes, 3000)
    },
    parseNotes () {
      let content = document.getElementById('editarea').innerHTML
      // parse raid markers ---------------  need translations here
      content = content.replace(/\{(rt1|star)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt1.png' />`)
      content = content.replace(/\{(rt2|circle)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt2.png' />`)
      content = content.replace(/\{(rt3|diamond)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt3.png' />`)
      content = content.replace(/\{(rt4|triangle)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt4.png' />`)
      content = content.replace(/\{(rt5|moon)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt5.png' />`)
      content = content.replace(/\{(rt6|square)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt6.png' />`)
      content = content.replace(/\{(rt7|cross|x)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt7.png' />`)
      content = content.replace(/\{(rt8|skull)\}/ig, `<img src='//media.wago.io/iconsUI/raidmarker-rt8.png' />`)
      // parse raid roles
      content = content.replace(/\{tank\}/ig, `<img src='//media.wago.io/iconsUI/role-tank.png' />`)
      content = content.replace(/\{healer\}/ig, `<img src='//media.wago.io/iconsUI/role-healer.png' />`)
      content = content.replace(/\{(damage|dps)\}/ig, `<img src='//media.wago.io/iconsUI/role-dps.png' />`)
      content = content.replace(/\{(Warrior|Krieger|Guerrero|Guerrier|Guerriero|전사|Guerreiro|Воин|战士)\}/ig, `<img src='//media.wago.io/iconsUI/class-warrior.png' />`)
      content = content.replace(/\{(Paladin|Paladín|Paladino|성기사|Паладин|圣骑士)\}/ig, `<img src='//media.wago.io/iconsUI/class-paladin.png' />`)
      content = content.replace(/\{(Hunter|Jäger|Cazador|Chasseur|Cacciatore|사냥꾼|Caçador|Охотник|猎人)\}/ig, `<img src='//media.wago.io/iconsUI/class-hunter.png' />`)
      content = content.replace(/\{(Rogue|Schurke|Pícaro|Voleur|Ladro|도적|Ladino|Разбойник|盗贼)\}/ig, `<img src='//media.wago.io/iconsUI/class-rogue.png' />`)
      content = content.replace(/\{(Priest|Priester|Sacerdote|Prêtre|Sacerdote|사제|Жрец|牧师)\}/ig, `<img src='//media.wago.io/iconsUI/class-priest.png' />`)
      content = content.replace(/\{(Death\s?knight|Todesritter|Caballero de la Muerte|Chevalier de la Mort|Cavaliere della Morte|Sciamano|죽음의 기사|Cavaleiro da Morte|Рыцарь смерти|死亡骑士)\}/ig, `<img src='//media.wago.io/iconsUI/class-deathknight.png' />`)
      content = content.replace(/\{(Shaman|Schamane|Chamán|Chaman|주술사|Xamã|Шаман|萨满祭司)\}/ig, `<img src='//media.wago.io/iconsUI/class-shaman.png' />`)
      content = content.replace(/\{(Mage|Magier|Mago|마법사|Маг|法师)\}/ig, `<img src='//media.wago.io/iconsUI/class-mage.png' />`)
      content = content.replace(/\{(Warlock|Hexenmeister|Brujo|Démoniste|Stregone|흑마법사|Bruxo|Чернокнижник|术士)\}/ig, `<img src='//media.wago.io/iconsUI/class-warlock.png' />`)
      content = content.replace(/\{(Monk|Mönch|Monje|Moine|Monaco|수도사|Monge|Монах|武僧)\}/ig, `<img src='//media.wago.io/iconsUI/class-monk.png' />`)
      content = content.replace(/\{(Druid|Druide|Druida|Druido|드루이드|Друид|德鲁伊)\}/ig, `<img src='//media.wago.io/iconsUI/class-druid.png' />`)
      content = content.replace(/\{(Demon\s?hunter|Dämonenjäger|Cazador\s?de\s?demonios|Chasseur\s?de\s?Démon|Cacciatore\s?di\s?Demoni|악마사냥꾼|Caçador\s?de\s?Demônios|Охотник\s?на\s?демонов|恶魔猎手)\}/ig, `<img src='//media.wago.io/iconsUI/class-demonhunter.png' />`)
      // parse social game icons
      content = content.replace(/\{wow\}/ig, `<img src='//media.wago.io/iconsUI/social-wow.png' />`)
      content = content.replace(/\{d3\}/ig, `<img src='//media.wago.io/iconsUI/social-d3.png' />`)
      content = content.replace(/\{sc2\}/ig, `<img src='//media.wago.io/iconsUI/social-sc2.png' />`)
      content = content.replace(/\{bnet\}/ig, `<img src='//media.wago.io/iconsUI/social-bnet.png' />`)
      content = content.replace(/\{alliance\}/ig, `<img src='//media.wago.io/iconsUI/social-alliance.png' />`)
      content = content.replace(/\{horde\}/ig, `<img src='//media.wago.io/iconsUI/social-horde.png' />`)
      // parse spell icons
      content = content.replace(/\{(bl|bloodlust)\}/ig, `<img spell='1234' src='//media.wago.io/icons/bloodlust.png' />`)
      content = content.replace(/\{(hero|heroism)\}/ig, `<img spell='1234' src='//media.wago.io/icons/heroism.png' />`)
      content = content.replace(/\{(hs|healthstone)\}/ig, `<img spell='1234' src='//media.wago.io/icons/healthstone.png' />`)
      let m
      let promises = []
      let regex = /\{icon[:\s]+([^}]+)\}/ig
      while ((m = regex.exec(content)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++
        }
        if (parseInt(m[1]) > 0) {
          let match = m
          promises.push(new Promise((done) => {
            this.http.get('/lookup/blizzard/spell', {id: match[1]}).then((spell) => {
              console.log(match[0], spell)
              if (spell.id) {
                content = content.replace(match[0], `<img spell='${spell.id}' src='//media.wago.io/wow-ui-textures/ICONS/${spell.iconFile}' />`)
              }
              done()
            }).catch((e) => {
              console.error(e.message)
              done()
            })
          }))
        }
        else {
          promises.push(new Promise((done) => {
            let match = m
            this.http.get('/lookup/blizzard/spell', {name: match[1]}).then((spell) => {
              if (spell.id) {
                content = content.replace(match[0], `<img spell='${spell.spellID}' src='//media.wago.io/wow-ui-textures/ICONS/${spell.iconFile}' />`)
              }
              done()
            }).catch((e) => {
              console.error(e.message)
              done()
            })
          }))
        }
      }
      // parse chat links
      // regex = /\{icon[:\s]+([^}]+)\}/ig
      // while ((m = /\{(spell|boss|journal)[:\s]+(\d+)\}/ig.exec(content)) !== null) {
      //   if (m.index === regex.lastIndex) {
      //     regex.lastIndex++
      //   }
      //   if (m[1] === 'spell') {
      //     lookups.push({type: 'link', match: m[0], spellID: parseInt(m[2])})
      //   }
      //   else if (m[1] === 'boss') {
      //     lookups.push({type: 'link', match: m[0], encounterID: m[1]})
      //   }
      //   else if (m[1] === 'journal') {
      //     lookups.push({type: 'link', match: m[0], journalID: m[1]})
      //   }
      // }
      // replace icons and links with html
      Promise.all(promises).then(() => {
        // parse color codes
        let color = false
        let text = '' + content
        let regex = /\|c([\dabcdef]{8}|blue|green|red|yellow|orange|pink|purple)|\|r/ig
        let m
        while ((m = regex.exec(text)) !== null) {
          if (m.index === regex.lastIndex) {
            regex.lastIndex++
          }
          let html = ''
          if (color && m[0] === '|r') {
            content = content.replace(/\|r/, '</span>')
            color = false
            continue
          }
          else if (m[0] === '|r') {
            content = content.replace(/\|r/, '')
            continue
          }
          else if (color) {
            html = '</span>'
          }
          switch (m[1]) {
            case 'blue':
              html = html + '<span hex="ff00cbf4" style="color:#00cbf4">'
              break
            case 'green':
              html = html + '<span hex="ff0adc00" style="color:#0adc00">'
              break
            case 'red':
              html = html + '<span hex="ffeb310c" style="color:#eb310c">'
              break
            case 'yellow':
              html = html + '<span hex="fffaf318" style="color:#faf318">'
              break
            case 'orange':
              html = html + '<span hex="ffff9d00" style="color:#ff9d00">'
              break
            case 'pink':
              html = html + '<span hex="fff64c97" style="color:#f64c97">'
              break
            case 'purple':
              html = html + '<span hex="ffdc44eb" style="color:#dc44eb">'
              break
            case 'deathknight':
              html = html + '<span hex="ffc41f3b" style="color:#c41f3b">'
              break
            case 'demonhunter':
              html = html + '<span hex="ffa330c9" style="color:#a330c9">'
              break
            case 'druid':
              html = html + '<span hex="ffff7d0a" style="color:#ff7d0a">'
              break
            case 'hunter':
              html = html + '<span hex="ffabd473" style="color:#abd473">'
              break
            case 'mage':
              html = html + '<span hex="ff40C7eb" style="color:#40C7eb">'
              break
            case 'monk':
              html = html + '<span hex="ff00ff96" style="color:#00ff96">'
              break
            case 'paladin':
              html = html + '<span hex="fff58cba" style="color:#f58cba">'
              break
            case 'priest':
              html = html + '<span hex="ffffffff" style="color:#ffffff">'
              break
            case 'rogue':
              html = html + '<span hex="fffff569" style="color:#fff569">'
              break
            case 'shaman':
              html = html + '<span hex="ff0070de" style="color:#0070de">'
              break
            case 'warlock':
              html = html + '<span hex="ff8787ed" style="color:#8787ed">'
              break
            case 'warrior':
              html = html + '<span hex="ffc79c6e" style="color:#c79c6e">'
              break
            default:
              if (m[1].slice(0, 2) === 'FF') {
                html = html + `<span hex="${m[1]}" style="color:#${m[1].slice(2, 8)}">`
              }
              else {
                const rbga = {
                  alpha: parseInt(m[1].slice(0, 2), 16),
                  red: parseInt(m[1].slice(2, 4), 16),
                  green: parseInt(m[1].slice(4, 6), 16),
                  blue: parseInt(m[1].slice(6, 8), 16)
                }
                html = html + `<span hex="${m[1]}" style="color:rgba(${rbga.red}, ${rbga.green}, ${rbga.blue}, ${rbga.alpha}">`
              }
          }
          content = content.replace(/\|r/, html)
        }
        // if we have an open tag
        if (color) {
          content = content + '</span>'
        }
        this.parsedNotes = content
      })
    },

    getCaretPosition: function (parentId) {
      if (!parentId) {
        parentId = 'editarea'
      }
      var selection = window.getSelection()
      var charCount = -1
      var node

      if (selection.focusNode) {
        if (isChildOf(selection.focusNode, parentId)) {
          node = selection.focusNode
          charCount = selection.focusOffset

          while (node) {
            if (node.id === parentId) {
              break
            }

            if (node.previousSibling) {
              node = node.previousSibling
              charCount += node.textContent.length
            }
            else {
              node = node.parentNode
              if (node === null) {
                break
              }
            }
          }
        }
      }

      return charCount
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
#saveChangesDialog .md-dialog { min-width: 40% }

</style>
