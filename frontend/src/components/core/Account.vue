<template>
  <md-layout>
    <md-layout md-column>
      <md-card>
        <md-layout>
          <md-layout>
            <h2>{{ $t("Profile Settings") }}</h2>
          </md-layout>
          <md-layout md-align="end">
            <md-avatar class="md-large">
              <ui-image :img="$store.state.user.avatar"></ui-image>
            </md-avatar>
          </md-layout>
        </md-layout>
        <md-card-content>
          <md-input-container :class="{ 'md-input-invalid': updateNameError, 'md-input-status': updateNameHasStatus }">
            <label>{{ $t("Username") }}</label>
            <md-input v-model="editName" @change="onUpdateName()" :debounce="600"></md-input>
            <span class="md-error" v-if="updateNameStatus.length>0">{{ updateNameStatus }}</span>
          </md-input-container>
          
          <md-layout>
            <md-layout>
              <md-input-container :class="{ 'md-input-invalid': uploadAvatarError, 'md-input-status': uploadAvatarProgress }">
                <md-file v-model="uploadAvatar" accept="image/*" :placeholder="$t('Upload avatar image')" @selected="onUploadAvatar($event)"></md-file>
                <span class="md-error" v-if="uploadAvatarProgress.length>0">{{ uploadAvatarProgress }}</span>
              </md-input-container>
            </md-layout>
            <md-layout>
              <md-input-container>
                <label for="selectAvatar">{{ $t("Or select image") }}</label>
                <md-select id="selectAvatar" v-model="selectAvatar" @selected="onSelectAvatar" :disabled="selectAvatar!=''">
                  <md-option value="adorable">{{ $t("Create new random avatar") }}</md-option>
                  <md-option value="battlenet" v-if="$store.state.user.battlenet && $store.state.user.battlenet.avatar && $store.state.user.battlenet.avatar.png">{{ $t("Import from Blizzard Battlenet profile") }}</md-option>
                  <md-option value="discord" v-if="$store.state.user.discord && $store.state.user.discord.avatar && $store.state.user.discord.avatar.png">{{ $t("Import from Discord profile") }}</md-option>
                  <md-option value="facebook" v-if="$store.state.user.facebook && $store.state.user.facebook.avatar && $store.state.user.facebook.avatar.png">{{ $t("Import from Facebook profile") }}</md-option>
                  <md-option value="google" v-if="$store.state.user.google && $store.state.user.google.avatar && $store.state.user.google.avatar.png">{{ $t("Import from Google profile") }}</md-option>
                  <md-option value="patreon" v-if="$store.state.user.patreon && $store.state.user.patreon.avatar && $store.state.user.patreon.avatar.png">{{ $t("Import from Patreon profile") }}</md-option>
                  <md-option value="twitter" v-if="$store.state.user.twitter && $store.state.user.twitter.avatar && $store.state.user.twitter.avatar.png">{{ $t("Import from Twitter profile") }}</md-option>
                </md-select>
              </md-input-container>
            </md-layout>
          </md-layout>

          <md-layout>
            <md-layout>
              <md-input-container class="md-input-status">
                <label for="profileVisibility">{{ $t("My profile") }}</label>
                <md-select id="profileVisibility" v-model="selectProfileVisibility">
                  <md-option value="Public">{{ $t("Public") }}</md-option>
                  <md-option value="Private">{{ $t("Private") }}</md-option>
                </md-select>
                <span class="md-error" v-if="profileVisibilityStatus">{{ profileVisibilityStatus }}</span>
              </md-input-container>
            </md-layout>
            <md-layout>
              <md-input-container class="md-input-status">
                <label for="importDefaultVisibility">{{ $t("Default visibility on new imports") }}</label>
                <md-select id="importDefaultVisibility" v-model="importDefaultVisibility">
                  <md-option value="Public">{{ $t("Public") }}</md-option>
                  <md-option value="Hidden">{{ $t("Hidden") }}</md-option>
                  <md-option value="Private">{{ $t("Private") }}</md-option>
                </md-select>
                <span class="md-error" v-if="importDefaultVisibilityStatus">{{ importDefaultVisibilityStatus }}</span>
              </md-input-container>
            </md-layout>
          </md-layout>
        </md-card-content>
      </md-card>
      <md-card>
        <h2>{{ $t("Website Options") }}</h2>
        <md-card-content>
          <p>{{ $t("Select site theme") }}</p>
          <md-button-toggle md-single class="md-primary">
            <md-button v-bind:class="{'md-toggle': selectTheme === 'classic'}" @click="setTheme('classic')">{{ $t("Classic") }}</md-button>
            <md-button v-bind:class="{'md-toggle': selectTheme === 'dark'}" @click="setTheme('dark')">{{ $t("Dark") }}</md-button>
          </md-button-toggle>
          <p>{{ $t("Select editor theme") }}</p>
          <div v-if="selectTheme === 'classic'">
            <md-button-toggle md-single class="md-primary">
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'chrome'}" @click="setEditorTheme('chrome')">{{ $t("Chrome") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'clouds'}" @click="setEditorTheme('clouds')">{{ $t("Clouds") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'crimson_editor'}" @click="setEditorTheme('crimson_editor')">{{ $t("Crimson") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'dawn'}" @click="setEditorTheme('dawn')">{{ $t("Dawn") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'dreamweaver'}" @click="setEditorTheme('dreamweaver')">{{ $t("Dreamweaver") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'eclipse'}" @click="setEditorTheme('eclipse')">{{ $t("Eclipse") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'github'}" @click="setEditorTheme('github')">{{ $t("GitHub") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'iplastic'}" @click="setEditorTheme('iplastic')">{{ $t("IPlastic") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'solarized_light'}" @click="setEditorTheme('solarized_light')">{{ $t("Solarized Light") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'textmate'}" @click="setEditorTheme('textmate')">{{ $t("TextMate") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow'}" @click="setEditorTheme('tomorrow')">{{ $t("Tomorrow") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'xcode'}" @click="setEditorTheme('xcode')">{{ $t("XCode") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'kuroir'}" @click="setEditorTheme('kuroir')">{{ $t("Kuroir") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'katzenmilch'}" @click="setEditorTheme('katzenmilch')">{{ $t("KatzenMilch") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'sqlserver'}" @click="setEditorTheme('sqlserver')">{{ $t("SQL Server") }}</md-button>
            </md-button-toggle>      
          </div>
          <div></div>
          <div v-if="selectTheme === 'dark'">
            <md-button-toggle md-single class="md-primary">
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'ambiance'}" @click="setEditorTheme('ambiance')">{{ $t("Ambiance") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'chaos'}" @click="setEditorTheme('chaos')">{{ $t("Chaos") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'clouds_midnight'}" @click="setEditorTheme('clouds_midnight')">{{ $t("Clouds Midnight") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'cobalt'}" @click="setEditorTheme('cobalt')">{{ $t("Cobalt") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'idle_fingers'}" @click="setEditorTheme('idle_fingers')">{{ $t("Idle Fingers") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'kr_theme'}" @click="setEditorTheme('kr_theme')">{{ $t("krTheme") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'merbivore'}" @click="setEditorTheme('merbivore')">{{ $t("Merbivore") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'merbivore_soft'}" @click="setEditorTheme('merbivore_soft')">{{ $t("Merbivore Soft") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'mono_industrial'}" @click="setEditorTheme('mono_industrial')">{{ $t("Mono Industrial") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'monokai'}" @click="setEditorTheme('monokai')">{{ $t("Monokai") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'pastel_on_dark'}" @click="setEditorTheme('pastel_on_dark')">{{ $t("Pastel on Dark") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'solarized_dark'}" @click="setEditorTheme('solarized_dark')">{{ $t("Solarized Dark") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'terminal'}" @click="setEditorTheme('terminal')">{{ $t("Terminal") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night'}" @click="setEditorTheme('tomorrow_night')">{{ $t("Tomorrow Night") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_blue'}" @click="setEditorTheme('tomorrow_night_blue')">{{ $t("Tomorrow Night Blue") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_bright'}" @click="setEditorTheme('tomorrow_night_bright')">{{ $t("Tomorrow Night Bright") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_eighties'}" @click="setEditorTheme('tomorrow_night_eighties')">{{ $t("Tomorrow Night Eighties") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'twilight'}" @click="setEditorTheme('twilight')">{{ $t("Twilight") }}</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'vibrant_ink'}" @click="setEditorTheme('vibrant_ink')">{{ $t("Vibrant Ink") }}</md-button>
            </md-button-toggle>
          </div>
          <br>
          <editor v-model="demoEditorContent" @init="editorInit" lang="lua" :theme="selectEditorTheme" width="100%" height="115"></editor>
        </md-card-content>
      </md-card>
    </md-layout>
    <md-layout md-column>
      <md-card>
        <h2>{{ $t("Account Status") }}</h2>
      </md-card>
      <wago-oauth></wago-oauth>
    </md-layout>
  </md-layout>   
</template>

<script>
export default {
  components: {
    'wago-oauth': require('../UI/WagoOauth.vue'),
    editor: require('vue2-ace-editor')
  },
  data: function () {
    return {
      editName: this.$store.state.user.name,
      updateNameHasStatus: false,
      updateNameStatus: '',
      updateNameError: false,
      uploadAvatar: '',
      uploadAvatarProgress: '',
      uploadAvatarError: false,
      selectAvatar: '',
      selectProfileVisibility: this.$store.state.user.profileVisibility || 'Public',
      importDefaultVisibility: this.$store.state.user.defaultImportVisibility || 'Public',
      selectTheme: this.$store.state.theme || 'classic',
      selectEditorTheme: this.$store.state.editorTheme || 'tomorrow',
      demoEditorContent: `-- Example editor
function()
  local who = "${this.$store.state.user.name}"
  print("Hello " .. who)
  
  if wago() then
    return true
  end
end`
    }
  },
  computed: {
    profileVisibilityStatus () {
      if (this.selectProfileVisibility === 'Public') {
        return ' '
      }
      else if (this.selectProfileVisibility === 'Private') {
        return this.$t('Other users can not search imports by your username')
      }
    },
    importDefaultVisibilityStatus () {
      if (this.defaultImportVisibility === 'Public') {
        return ' '
      }
      else if (this.importDefaultVisibility === 'Private') {
        return this.$t('Only you may view')
      }
      else if (this.importDefaultVisibility === 'Hidden') {
        return this.$t('Only viewable with link but will not show in search results')
      }
    }
  },
  watch: {
    selectProfileVisibility: function (val) {
      this.http.post('/account/update/profile-visibility', {
        value: val
      }).catch((err) => {
        console.log(err)
        window.eventHub.$emit('showSnackBar', this.$t('Error could not save'))
      })
    },
    importDefaultVisibility: function (val) {
      this.http.post('/account/update/import-default-visibility', {
        value: val
      }).catch((err) => {
        console.log(err)
        window.eventHub.$emit('showSnackBar', this.$t('Error could not save'))
      })
    }
  },
  mounted: function () {
    // account page requires user to be logged in
    if (!this.$store.state.user.UID) {
      this.$router.replace('/login')
    }
    this.$store.commit('setPageInfo', {
      title: this.$t('Account')
    })
  },
  methods: {
    onUpdateName () {
      this.$nextTick(function () {
        this.editName = this.editName.trim()
        this.updateSlugHasStatus = true
        if (this.editName === '' && this.$store.state.user.name) {
          this.editName = this.$store.state.user.name
        }
        else if (this.edit_name === '') {
          this.editName = 'User-' + this.$store.state.user.UID
        }
        // %#/\\<> are invalid characters.
        if (this.editName.match(/[%#/\\<>]/)) {
          this.updateNameStatus = this.$t('Usernames can not contain the following characters %#/\\<>')
          this.updateNameError = true
          return false
        }

        this.updateNameError = false
        this.updateNameStatus = this.$t('Saving')
        var vue = this
        this.http.post('/account/update/username', {
          name: this.editName
        }).then((res) => {
          if (res.success) {
            var user = this.$store.state.user
            user.name = this.editName
            vue.$store.commit('setUser', user)
            vue.updateNameStatus = vue.$t('Saved')
          }
          else if (res.exists) {
            vue.updateNameStatus = vue.$t('Error this username is already in use')
            this.updateNameError = true
          }
          else {
            this.updateNameStatus = this.$t('Error could not save')
            this.updateNameError = true
          }
        }).catch((e) => {
          this.updateNameStatus = this.$t('Error could not save')
          this.updateNameError = true
        })
      })
    },

    onUploadAvatar (files) {
      var vue = this
      // const reader = new FileReader();
      // vue.uploadFileProgress = '0%'

      // var data = new FormData()
      // data.append('file', file)
      // var config = {
      //   onUploadProgress: (progressEvent) => {
      //     var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      //     vue.uploadAvatarProgress = percentCompleted + '%'
      //   }
      // }
      vue.http.upload('/account/upload/avatar', files[0])
        .then((res) => {
          var user = this.$store.state.user
          user.avatar = res.avatar
          vue.$store.commit('setUser', user)
          vue.uploadAvatarProgress = vue.$t('Saved')
        })
        .catch((err) => {
          console.log('Error uploading image', err)
        })

      this.uploadAvatar = ''
    },

    onSelectAvatar () {
      var vue = this
      vue.http.post('/account/update/avatar', { avatar: this.selectAvatar })
        .then((res) => {
          var user = this.$store.state.user
          user.avatar = res.avatar
          vue.$store.commit('setUser', user)
          vue.uploadAvatarProgress = vue.$t('Saved')
          vue.selectAvatar = ''
        })
        .catch((err) => {
          console.log('Error uploading image', err)
        })
    },

    editorInit (editor) {
      this.aceEditor = editor
      window.braceRequires()
      editor.setOptions({
        autoScrollEditorIntoView: true,
        readOnly: true,
        printMargin: false,
        minLines: 1,
        maxLines: 30
      })
      editor.session.setUseWorker(false)
    },

    setTheme (theme) {
      this.selectTheme = theme
      this.$store.commit('setTheme', theme)
      // set default editor theme
      var defaultEditor
      if (theme === 'classic') {
        defaultEditor = 'tomorrow'
        this.setEditorTheme(defaultEditor)
      }
      else if (theme === 'dark') {
        defaultEditor = 'monokai'
        this.setEditorTheme(defaultEditor)
      }

      this.http.post('/account/update/theme', {
        theme: theme,
        editor: defaultEditor
      })
    },

    setEditorTheme (theme) {
      this.selectEditorTheme = theme
      this.$store.commit('setEditorTheme', theme)
      this.aceEditor.setTheme('ace/theme/' + theme)

      this.http.post('/account/update/theme', {
        theme: this.selectTheme,
        editor: theme
      })
    }
  }
}
</script>

<style>
h2 { margin-left: 16px }
.md-avatar { margin: 0 }
.md-input-container.md-input-status .md-error { opacity: 1; transform: translate3d(0, 0, 0);}
.md-button-toggle { flex-wrap: wrap }
</style>
