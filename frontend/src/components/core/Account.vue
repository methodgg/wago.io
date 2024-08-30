<template>
  <div>
    <md-layout md-column style="margin-top: 0px;">
      <wago-oauth></wago-oauth>
      <md-card>
        <md-layout>
          <md-layout>
            <h2>{{ $t("Website Options") }}</h2>
          </md-layout>
          <md-layout md-align="end">
            <md-avatar class="md-large">
              <ui-image :img="$store.state.user.avatar"></ui-image>
            </md-avatar>
          </md-layout>
        </md-layout>
        <md-card-content>
          <md-layout style="margin-bottom: 16px">
              <p v-html="$t('To make changes to your user account, please visit your account page on {{LINK}}.').replace('{{LINK}}', '<a href=\'https://accounts.wago.io\'>accounts.wago.io</a>')"></p> 
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
        <md-card-content>
          <p>{{ $t("Select default editor syntax") }}</p>
          <md-button-toggle md-single class="md-primary">
            <md-button v-bind:class="{'md-toggle': selectEditorSyntax === 'bbcode'}" @click="setEditorSyntax('bbcode')">BBCode</md-button>
            <md-button v-bind:class="{'md-toggle': selectEditorSyntax === 'markdown'}" @click="setEditorSyntax('markdown')">Markdown</md-button>
          </md-button-toggle>
        </md-card-content>
      </md-card>
    </md-layout>
    <md-layout md-column>
      <md-card v-if="User">
        <h2>{{ $t("Account Status") }}</h2>
        <md-card-content>
          <ui-warning v-if="User.access && User.access.human" mode="ok">
            {{ $t("Anti-spam") }}<br>
            {{ $t("Your account is verified as belonging to a human, hyperlinks are allowed in your descriptions") }}
          </ui-warning>
          <ui-warning v-else mode="alert">
            {{ $t("Anti-spam") }}<br>
            <span v-html="$t('To enable hyperlinks in your descriptions, update your Wago account with a valid e-mail, or with a Patreon subscription at {{LINK}}').replace('{{LINK}}', '<a href=\'https://accounts.wago.io\'>accounts.wago.io</a>')"></span>
          </ui-warning>
          <br>
          <ui-warning v-if="User.access && (User.access.admin || User.access.goldSub || User.access.guild_subscriber || User.access.ambassador || User.access.contestWinner || User.access.methodRaider || User.access.methodStreamer)" mode="gold">
            <span v-if="User.access.admin" style="padding-right:16px">[Wago.io Admin]</span>
            <span v-else-if="User.access.ambassador" style="padding-right:16px">[Wago.io Ambassador]</span>
            <span v-else-if="User.access.methodRaider" style="padding-right:16px">[Method Raider]</span>
            <span v-else-if="User.access.methodStreamer" style="padding-right:16px">[Method Streamer]</span>
            <span v-else-if="User.access.community_leader" style="padding-right:16px">[Community Leader]</span>
            <span v-else-if="User.access.developer" style="padding-right:16px">[Addon Developer]</span>
            <span v-else-if="User.access.contestWinner" style="padding-right:16px">[{{ $t("Contest Winner") }}]</span>
            <span v-else-if="User.access.guild_subscriber">[{{ $t("Guild Subscriber") }}]</span>
            <span v-else-if="User.access.goldSub">[{{ $t("Gold Subscriber") }}]</span>
            <br>{{ $t("Animated avatars are enabled") }}
            <br>{{ $t("Custom URLs are enabled") }}
            <br>{{ $t("Imports may be restricted by guild") }}
            <br>{{ $t("Access to Wago [Beta] features") }}
          </ui-warning>
          <ui-warning v-else-if="User.access && User.access.sub" mode="ok">
            <span>[{{ $t("Subscriber") }}]</span>
            <br>{{ $t("Animated avatars are enabled") }}
            <br>{{ $t("Access to Wago [Beta] features") }}
          </ui-warning>
        </md-card-content>
        <div v-if="User.access && User.access.api">
          <h2>API</h2>
          <md-card-content>
            <p>{{ $t("You may use an API key to access Wago programmatically, through your own software or a third party app such as the WeakAuras Updater") }}</p>
            <p>{{ $t("Treat this key like your password") }}</p>
            <wago-api-key />
            <p>Documentation and more endpoints soon™</p>
          </md-card-content>

          <h2>{{ $t("Support Key") }}Support Key</h2>
          <md-card-content>
            <p>{{ $t("You may use an Support key to prove account ownership should you need support from the Wago team, as we don't have your email - this is not used anywhere else") }}</p>
            <support-api-key key="support_key"/>
          </md-card-content>
        </div>
        <div v-if="User.discord && User.discord.id">
          <h2>Discord</h2>
          <md-card-content>
            <md-checkbox v-model="discordOptionFaveUpdateMsg" @change="onChangeDiscordOptions">{{ $t("Recieve a private message on Discord whenever a Wago you have starred is updated") }}</md-checkbox><br>
            <md-checkbox v-model="discordOptionCommentMsg" @change="onChangeDiscordOptions">{{ $t("Recieve a private message on Discord whenever you recieve a comment") }}</md-checkbox><br>
          </md-card-content>
        </div>
        
        <div>
          <h2>{{ $t("Webhook") }}</h2>
          <p>{{ $t("Enter a Webhook URL to recieve notifications you create or update an import. Discord Webhooks will be detected and automatically formatted to what Discord expects to post in a channel, otherwise POST data will match the below schema.") }}</p>
          <p>{{ $t("Note that hidden, private, encrypted or restricted auras will not have a webhook sent from this global setting, but individual imports can have their own webhook settings which override this one.") }}</p>
          <md-input-container>
            <label>{{ $t("Webhook URL") }}</label>
            <md-input v-model="webhookURL" @change="onChangeWebhook" :debounce="600"></md-input>
            <span class="md-error" v-if="webhookURLStatus.length > 0">{{ webhookURLStatus }}</span>
          </md-input-container>

          <md-button-toggle class="md-accent" md-single>
            <md-button v-bind:class="{'md-toggle': webhookDisplay === -1}" @click="webhookDisplay=-1">{{ $t("Example") }}</md-button>
            <md-button v-for="(item, index) in $store.state.user.webhookOnImport.history" :key="index" v-bind:class="{'md-toggle': webhookDisplay === index}" @click="webhookDisplay=index">{{ item.date | moment("MMMM Do YYYY, h:mm a") }}</md-button>
          </md-button-toggle>

          <div v-if="webhookDisplay === -1">
            <p>{{ $t('Example POST Data') }}</p>
            <monaco-editor v-model="exampleWebhook" lang="json"></monaco-editor>
          </div>
          <div v-else>
            <p>{{ $t('POST To') }} <strong>{{ $store.state.user.webhookOnImport.history[webhookDisplay].url }}</strong></p>
            <p>{{ $t('Return Status') }} <strong>{{ $store.state.user.webhookOnImport.history[webhookDisplay].status }}</strong></p>
            <p>{{ $t('Response Data') }}</p>
            <monaco-editor v-model="$store.state.user.webhookOnImport.history[webhookDisplay].response" :lang="$store.state.user.webhookOnImport.history[webhookDisplay].responseLang"></monaco-editor>
            <p>{{ $t('POST Data') }}</p>
            <monaco-editor v-model="$store.state.user.webhookOnImport.history[webhookDisplay].data" :lang="$store.state.user.webhookOnImport.history[webhookDisplay].dataLang"></monaco-editor>
          </div>            
        </div>
      </md-card>
    </md-layout>
</div>
</template>

<script>

import WagoOauth from '../UI/WagoOauth.vue'
import WagoAPIKey from '../UI/WagoApiKey.vue'
import WagoSupportKey from '../UI/WagoSupportKey.vue'
import MonacoEditor from '../UI/MonacoEditor.vue'
const openCustomProtocol = require('../libs/customProtocolDetection')

export default {
  components: {
    'wago-oauth': WagoOauth,
    editor: require('vue2-ace-editor'),
    'wago-api-key': WagoAPIKey,
    'support-api-key': WagoSupportKey,
    'monaco-editor': MonacoEditor
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
      disableWagoAppWarning: false,
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
      selectEditorSyntax: this.$store.state.user.defaultEditorSyntax || 'bbcode',
      currentPasswordError: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      discordOptionFaveUpdateMsg: this.$store.state.user.discord && this.$store.state.user.discord.options && this.$store.state.user.discord.options.messageOnFaveUpdate,
      discordOptionCommentMsg: this.$store.state.user.discord && this.$store.state.user.discord.options && this.$store.state.user.discord.options.messageOnComment,
      webhookURL: this.$store.state.user.webhookOnImport?.url ?? this.$store.state.user.discord?.webhooks?.onCreate,
      webhookURLStatus: '',
      webhookDisplay: -1,
    }
  },
  computed: {
    exampleWebhook () {
        return JSON.stringify({
            title: "Some title",
            version: "1.0.2",
            changelog: "Some changes as mentioned",
            url: "https://wago.io/import-url",
            type: "WEAKAURA",
            author: this.$store.state.user.name,
            avatar: "https://media.wago.io/path/to/avatar.png",
            screenshot: "https://media.wago.io/path/to/screenshot.png",
        }, null, 4)
    },

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
    },
  },
  mounted: function () {
        // account page requires user to be logged in
        if (!this.$store.state.user.UID) {
            this.$router.replace('/')
        }
        this.$store.commit('setPageInfo', {
            title: this.$t('Account')
        })
        this.$store.state.user.webhookOnImport.history.reverse()
        for (const item of this.$store.state.user.webhookOnImport.history) {
            if (typeof item.data === 'string') {
                try {
                    let data = JSON.parse(item.data)
                    item.data = JSON.stringify(data, null, 4)
                    item.dataLang = 'json'
                }
                catch {
                    item.dataLang = 'html'
                }
            }
            else {
                item.data = JSON.stringify(item.data, null, 4)
                item.dataLang = 'json'
            }
            
            if (typeof item.response === 'string') {
                try {
                    let data = JSON.parse(item.response)
                    item.response = JSON.stringify(data, null, 4)
                    item.responseLang = 'json'
                }
                catch {
                    item.responseLang = 'html'
                }
            }
            else {
                item.response = JSON.stringify(item.response, null, 4)
                item.responseLang = 'json'
            }
        }
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
      return
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
      else if (theme === 'waluigi') {
        defaultEditor = 'cobalt'
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

    setEditorSyntax (syntax) {
      this.selectEditorSyntax = syntax
      var user = this.$store.state.user
      user.defaultEditorSyntax = syntax
      this.$store.commit('setUser', user)

      this.http.post('/account/update/editorSyntax', {
        syntax: syntax
      })
    },

    onChangePassword () {
      if (this.$store.state.user.localAcct && !this.currentPassword) {
        this.currentPasswordError = this.$t('Enter your current password')
        return
      }

      if (this.newPassword.length >= 6 && this.confirmPassword.length >= 6 && this.newPassword === this.confirmPassword) {
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
          msgOnComment: this.discordOptionCommentMsg
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
    },

    onChangeWebhook () {
      var vue = this
      this.$nextTick(function () {
        var params = {
          webhookURL: this.webhookURL
        }
        this.http.post('/account/webhook', params).then((res) => {
          if (res.error) {
            window.eventHub.$emit('showSnackBar', res.error)
          }
        }).catch((err) => {
          console.log(err)
          window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
        })
      })
    },

    async sendToWagoApp (checkWarning) {
      if (!this.$store.state.user.apiKey) {
        var result = await this.http.post('/account/api-key')
        this.loading = false
        if (result && result.key) {
          var user = this.$store.state.user
          user.apiKey = result.key
          this.$store.commit('setUser', user)
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('An error occurred'))
          return
        }
      }
      if (this.disableWagoAppWarning) {
        window.localStorage.setItem('Wago-App-Warning-Disabled', '1')
      }
      if (checkWarning && !window.localStorage.getItem('Wago-App-Warning-Disabled')) {
        this.$refs.linkWagoAppDialog.open()
        return
      }
      openCustomProtocol(`wago-app://weakauras/link?key=${this.$store.state.user.apiKey}`,
        () => {
          // fail
          // this.$router.push('/wa-companion')
          window.eventHub.$emit('showSnackBar', this.$t('Unable to detect Wago App, please make sure you have it installed and running'))
        },
        () => {
          // success
          window.eventHub.$emit('showSnackBar', this.$t('Successfully linked to Wago App'))
        },
        () => {
          // unsupported
          // this.$router.push('/wa-companion')
          window.eventHub.$emit('showSnackBar', this.$t('Unable to detect Wago App, please make sure you have it installed and running'))
        }
      )
    },
  }
}
</script>

<style scoped>
h2 { margin-left: 16px }
.md-avatar { margin: 0 }
.md-input-container.md-input-status .md-error { opacity: 1; transform: translate3d(0, 0, 0);}
.md-button-toggle { flex-wrap: wrap }
.md-card { margin-top: 0 }
.button-main {background: #a12126;}

@media (min-width: 1281px) {
  .md-column { margin-top: 16px; }
  #col2 { padding: 0; }
  #col2 .md-card { margin-left: 0 }
}
</style>
