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
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'chrome'}" @click="setEditorTheme('chrome')">Chrome</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'clouds'}" @click="setEditorTheme('clouds')">Clouds</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'crimson_editor'}" @click="setEditorTheme('crimson_editor')">Crimson</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'dawn'}" @click="setEditorTheme('dawn')">Dawn</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'dreamweaver'}" @click="setEditorTheme('dreamweaver')">Dreamweaver</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'eclipse'}" @click="setEditorTheme('eclipse')">Eclipse</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'github'}" @click="setEditorTheme('github')">GitHub</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'iplastic'}" @click="setEditorTheme('iplastic')">IPlastic</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'solarized_light'}" @click="setEditorTheme('solarized_light')">Solarized Light</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'textmate'}" @click="setEditorTheme('textmate')">TextMate</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow'}" @click="setEditorTheme('tomorrow')">Tomorrow</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'xcode'}" @click="setEditorTheme('xcode')">XCode</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'kuroir'}" @click="setEditorTheme('kuroir')">Kuroir</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'katzenmilch'}" @click="setEditorTheme('katzenmilch')">KatzenMilch</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'sqlserver'}" @click="setEditorTheme('sqlserver')">SQL Server</md-button>
            </md-button-toggle>      
          </div>
          <div></div>
          <div v-if="selectTheme === 'dark'">
            <md-button-toggle md-single class="md-primary">
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'ambiance'}" @click="setEditorTheme('ambiance')">Ambiance</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'chaos'}" @click="setEditorTheme('chaos')">Chaos</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'clouds_midnight'}" @click="setEditorTheme('clouds_midnight')">Clouds Midnight</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'cobalt'}" @click="setEditorTheme('cobalt')">Cobalt</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'idle_fingers'}" @click="setEditorTheme('idle_fingers')">Idle Fingers</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'kr_theme'}" @click="setEditorTheme('kr_theme')">krTheme</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'merbivore'}" @click="setEditorTheme('merbivore')">Merbivore</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'merbivore_soft'}" @click="setEditorTheme('merbivore_soft')">Merbivore Soft</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'mono_industrial'}" @click="setEditorTheme('mono_industrial')">Mono Industrial</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'monokai'}" @click="setEditorTheme('monokai')">Monokai</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'pastel_on_dark'}" @click="setEditorTheme('pastel_on_dark')">Pastel on Dark</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'solarized_dark'}" @click="setEditorTheme('solarized_dark')">Solarized Dark</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'terminal'}" @click="setEditorTheme('terminal')">Terminal</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night'}" @click="setEditorTheme('tomorrow_night')">Tomorrow Night</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_blue'}" @click="setEditorTheme('tomorrow_night_blue')">Tomorrow Night Blue</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_bright'}" @click="setEditorTheme('tomorrow_night_bright')">Tomorrow Night Bright</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'tomorrow_night_eighties'}" @click="setEditorTheme('tomorrow_night_eighties')">Tomorrow Night Eighties</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'twilight'}" @click="setEditorTheme('twilight')">Twilight</md-button>
              <md-button v-bind:class="{'md-toggle': selectEditorTheme === 'vibrant_ink'}" @click="setEditorTheme('vibrant_ink')">Vibrant Ink</md-button>
            </md-button-toggle>
          </div>
          <br>
          <editor v-model="demoEditorContent" @init="editorInit" lang="lua" :theme="selectEditorTheme" width="100%" height="115"></editor>
          <hr>
          <p v-if="$store.state.user.localAcct">{{ $t("Change password") }}</p>
          <p v-else><strong>{{ $t("Create password") }}</strong></p>
          <p>{{ $t("Wago does not store emails or any other way of contacting users, and therefore has no password recovery system") }}</p>

          <md-input-container v-if="$store.state.user.localAcct" :class="{ 'md-input-invalid': currentPasswordError.length > 0 }">
            <label>{{ $t("Current password") }}</label>
            <md-input v-model="currentPassword" type="password"></md-input>
            <span class="md-error" v-if="currentPasswordError.length>0">{{ currentPasswordError }}</span>
          </md-input-container>

          <md-input-container :class="{ 'md-input-invalid': (newPassword.length>0 && newPassword.length < 6) }">
            <label>{{ $t("New password") }}</label>
            <md-input v-model="newPassword" type="password"></md-input>
            <span class="md-error" v-if="newPassword.length>0 && newPassword.length < 6">{{ $t("Password must have at least 6 characters") }}</span>
          </md-input-container>

          <md-input-container :class="{ 'md-input-invalid': (newPassword.length>0 && newPassword.length < 6) }">
            <label>{{ $t("Confirm password") }}</label>
            <md-input v-model="confirmPassword" type="password"></md-input>
            <span class="md-error" v-if="confirmPassword.length>0 && newPassword.length > 0 && confirmPassword !== newPassword">{{ $t("Password does not match") }}</span>
          </md-input-container>

          <md-button @click="onChangePassword">{{ $t("Submit") }}</md-button>

        </md-card-content>
      </md-card>
    </md-layout>
    <md-layout md-column>
      <md-card>
        <h2>{{ $t("Account Status") }}</h2>
        <md-card-content>
          <ui-warning v-if="User && User.access && User.access.human" mode="ok">
            {{ $t("Anti-spam") }}<br>
            {{ $t("Your account is verified as belonging to a human, hyperlinks are allowed in your descriptions") }}
          </ui-warning>
          <ui-warning v-else mode="alert">
            {{ $t("Anti-spam") }}<br>
            {{ $t("To enable hyperlinks in your descriptions, connect or update your Wago account with a Battlenet account with a max level character, or with a Patreon subscription") }}
          </ui-warning>
          <br>
          <ui-warning v-if="User.access.goldSub || User.access.ambassador || User.access.translator || User.access.admin" mode="gold">
            <span v-if="User.access.admin">Wago.io Admin</span>
            <span v-else-if="User.access.ambassador">Wago.io Ambassador</span>
            <span v-else-if="User.access.translator">Wago.io Translator</span>
            <span v-else-if="User.access.goldSub">{{ $t("Gold Subscriber") }}</span>
            <br>{{ $t("Custom URLs are enabled") }}
            <br>{{ $t("Animated avatars are enabled") }}
            <br>{{ $t("Access to Wago beta server") }} <a href="https://t1000.wago.io/">https://t1000.wago.io/</a>
          </ui-warning>
          <ui-warning v-else-if="User.access.sub" mode="ok">
            <span>{{ $t("Subscriber") }}</span>
            <br>{{ $t("Animated avatars are enabled") }}
            <br>{{ $t("Access to Wago beta server") }} <a href="https://t1000.wago.io/">https://t1000.wago.io/</a>
          </ui-warning>
        </md-card-content>
        <div v-if="User.discord && User.discord.id">  
          <h2>Discord</h2>
          <md-card-content>
            <md-checkbox v-model="discordOptionFaveUpdateMsg" @change="onChangeDiscordOptions">{{ $t("Recieve a private message on Discord whenever a Wago you have starred is updated") }}</md-checkbox><br>
            <md-checkbox v-model="discordOptionCommentMsg" @change="onChangeDiscordOptions">{{ $t("Recieve a private message on Discord whenever you recieve a comment") }}</md-checkbox><br>
            <p>{{ $t("Have your own Discord server? Enter a webhook to broadcast to your selected channel whenever you create or update a Wago") }}</p>
            <md-input-container>
              <label>{{ $t("Webhook URL") }}</label>
              <md-input v-model="discordOptionCreateWebhook" @change="onChangeDiscordOptions" :debounce="600"></md-input>
              <span class="md-error" v-if="discordOptionCreateWebhookStatus.length > 0">{{ discordOptionCreateWebhookStatus }}</span>
            </md-input-container>
          </md-card-content>
        </div>
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
end`,
      currentPasswordError: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      discordOptionFaveUpdateMsg: this.$store.state.user.discord && this.$store.state.user.discord.options && this.$store.state.user.discord.options.messageOnFaveUpdate,
      discordOptionCommentMsg: this.$store.state.user.discord && this.$store.state.user.discord.options && this.$store.state.user.discord.options.messageOnComment,
      discordOptionCreateWebhook: this.$store.state.user.discord && this.$store.state.user.discord.webhooks && this.$store.state.user.discord.options.onCreate,
      discordOptionCreateWebhookStatus: ''
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
    },
    User () {
      return this.$store.state.user
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
        if (this.editName.match(/[%/\\<>]/)) {
          this.updateNameStatus = this.$t('Usernames can not contain the following characters %/\\<>')
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
      var user = this.$store.state.user
      vue.uploadAvatarProgress = vue.$t('Uploading')
      vue.http.upload('/account/upload/avatar', files[0])
        .then((res) => {
          user.avatar = res.avatar
          vue.$store.commit('setUser', user)
          vue.uploadAvatarProgress = vue.$t('Saved')
          setTimeout(() => {
            vue.uploadAvatarProgress = ''
          }, 1000)
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
          setTimeout(() => {
            vue.uploadAvatarProgress = ''
          }, 1000)
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
    },

    onChangePassword () {
      if (this.$store.state.user.localAcct && !this.currentPassword) {
        this.currentPasswordError = this.$t('Enter your current password')
        return
      }

      if (this.newPassword.length >= 6 && this.confirmPassword.length >= 6 && this.newPassword === this.confirmPassword) {
        console.log('changing')
        var vue = this
        this.http.post('/auth/changepass', {
          newPass: this.newPassword,
          password: this.currentPassword
        }).then((res) => {
          if (res.success) {
            window.eventHub.$emit('showSnackBar', vue.$t('Password is saved'))
            vue.currentPasswordError = ''
            vue.currentPassword = ''
            vue.newPassword = ''
            vue.confirmPassword = ''
          }
          else {
            this.currentPasswordError = vue.$t('Incorrect password')
            window.eventHub.$emit('showSnackBar', vue.$t('Current password is incorrect'))
          }
        }).catch((err) => {
          console.log(err)
          window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
        })
      }
      else {
        window.eventHub.$emit('showSnackBar', this.$t('New password does not match confirmation or is too short'))
      }
    },

    onChangeDiscordOptions () {
      var vue = this
      this.$nextTick(function () {
        var params = {
          msgOnFaveUpdate: this.discordOptionFaveUpdateMsg,
          msgOnComment: this.discordOptionCommentMsg,
          createWebhook: this.discordOptionCreateWebhook
        }
        this.http.post('/account/discord/options', params).then((res) => {
          if (res.error) {
            window.eventHub.$emit('showSnackBar', res.error)
          }
        }).catch((err) => {
          console.log(err)
          window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
        })
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
