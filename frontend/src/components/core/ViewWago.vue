<template>
  <div id="view-wago" :class="{hasFloatingBar: showFloatingHeader, enforceTop: showPanel === 'builder'}">
    <ui-warning v-if="wago.error === 'page_not_found'" mode="alert">
      404 {{ $t("No results found") }}
    </ui-warning>
    <ui-warning v-else-if="(wago.type === 'ENCOUNTERNOTES' && (!User || !User.access || !User.access.beta))" mode="alert">
      Error: Wago beta access is required to view this page.
    </ui-warning>
    <ui-warning v-else-if="wago.error" mode="alert">
      Error: {{ wago.error }}
    </ui-warning>
    <ui-loading v-else-if="!wagoExists"></ui-loading>
    <div v-else style="position:relative">
      <lightbox ref="lightbox" v-if="wago.screens && wago.screens.length" :media="wago.screens" :show-light-box="false"></lightbox>
      <md-button id="wago-header-toggle" class="md-icon-button md-raised" @click="toggleMobileHeader">
        <md-icon>view_agenda</md-icon>
      </md-button>
      <div id="wago-mobile-header" class="md-hide-small-and-up" v-bind:class="{'md-hide-xsmall': !hideMobileHeader}">
        <h3>{{ wago.name }}</h3>
        <md-subheader><span v-for="(cat, n) in wago.categories" :key="n" :class="cat.cls" disabled v-if="cat.text">{{ cat.text }}</span></md-subheader>
      </div>
      <md-layout md-row>
        <md-card id="wago-header" ref="header" v-bind:class="{'md-hide-xsmall': hideMobileHeader}">
          <md-layout style="flex:0">
            <div>
              <h3>{{ wago.name }} <span class="version-number" v-if="currentVersionString && !currentVersionString.match(/undefined/)">v{{ currentVersionString }}</span></h3>
              <md-subheader>{{ wago.type }} <span :href="wago.url" @click.prevent="copyURL" style="margin-left: 16px; opacity: .54">{{ wago.url }}</span></md-subheader>
            </div>
            <!-- ACTIONS -->
            <md-card-actions id="wago-actions" ref="action-buttons">
              <md-button v-if="User.UID" @click="toggleFavorite">
                <md-icon v-if="wago.myfave">star</md-icon>
                <md-icon v-else>star_border</md-icon> {{ $t("Favorite") }}
              </md-button>
              <md-button v-if="wago.user && User && wago.UID && wago.UID === User.UID && wago.code && wago.code.encoded" @click="generateNextVersionData(); $refs['newImportDialog'].open()" id="newImportButton"><md-icon>input</md-icon> {{ $t("Import new string") }}</md-button>
              <md-button v-if="hasUnsavedChanges && wago.code && wago.code.encoded" @click="copyEncoded" class="copy-import-button">
                <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
                <md-button @click="openHelpDialog" id="helpImportingButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
                <md-tooltip md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("You have unsaved changes") }}</strong><br>{{ $t("Be sure to save or fork to generate a new string with your modifications") }}</md-tooltip>
              </md-button>
              <md-button v-else-if="wago.code && wago.code.encoded" @click="copyEncoded" class="copy-import-button">
                <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
                <md-button @click="openHelpDialog" id="helpImportingButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
              </md-button>
              <md-button v-if="wago.image && wago.image.files.tga" :href="wago.image.files.tga" class="copy-import-button"><md-icon>file_download</md-icon> {{ $t("Download tga file") }}</md-button>
            </md-card-actions>
            <md-dialog md-open-from="#helpImportingButton" md-close-to="#helpImportingButton" ref="helpDialog" id="helpDialog">
              <md-dialog-title>{{ $t("How do I import this?") }}</md-dialog-title>

              <md-dialog-content v-if="wago.type.match(/WEAKAURA/)">
                <ol>
                  <li>{{ $t('Open the WeakAuras interface by clicking the WA icon by your minimap') }}  <img src="https://media.wago.io/site/wa-minimap-icon.png" />
                  {{ $t('Alternatively type the "/wa" command into your chat window') }} <img src="https://media.wago.io/site/wa-chatcommand.png" /></li>
                  <li>{{ $t('In the upper left area of the WeakAuras interface click the Import button') }} <img src="https://media.wago.io/site/wa-importbutton.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac)') }} <img src="https://media.wago.io/site/wa-encoded.png" /></li>
                  <li>{{ $t('A box will appear showing some basic information about the WeakAura') }}<br>
                    {{ $t('The Show Code button will let you review any custom code before importing') }}<br>
                    {{ $t('The Import button will save the WeakAura to your configuration') }} <img src="https://media.wago.io/site/wa-importinfo.png" style="width:450px" />
                  </li>
                  <li>
                    {{ $t('Once imported, you\'ll find the options panel for this WeakAura on the right of side of the interface') }}<br>
                    {{ $t('For most users, the Display tab and maybe Custom Options tab will have settings to customize what you have just imported') }} <img src="https://media.wago.io/site/wa-tabs.png" />
                  </li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/ELVUI/)">
                <ol>
                  <li>{{ $t('Open the ElvUI configuration window by clicking the ElvUI button in your system menu') }} <img src="https://media.wago.io/site/elvui-escmenu.png" />
                  {{ $t('Alternatively type the "/elvui" command into your chat window') }} <img src="https://media.wago.io/site/elvui-chatcommand.png" /></li>
                  <li>{{ $t('At the bottom of the left navigation click the Profiles button') }} <img src="https://media.wago.io/site/elvui-profiles.png" /></li>
                  <li>{{ $t('Click the Import Profile button') }} <img src="https://media.wago.io/site/elvui-importprofile.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac)') }} <img src="https://media.wago.io/site/elvui-encoded.png" /></li>
                  <li>{{ $t('Click import, and your interface should immediately change') }}<br>
                    {{ $t('Then click close and adjust as necessary through ElvUI\'s options') }} <img src="https://media.wago.io/site/elvui-import.png" />
                  </li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/MDT/)">
                <ol>
                  <li>{{ $t('Open the MDT configuration window by clicking the MDT icon by your mini map') }} <img src="https://media.wago.io/site/mdt-minimapicon.png" />
                  {{ $t('Alternatively type the "/mdt" command into your chat window') }} <img src="https://media.wago.io/site/mdt-chatcmd.png" /></li>
                  <li>{{ $t('In the control panel at the top right of the window click the Import button') }} <img src="https://media.wago.io/site/mdt-importbutton.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac), click OK, then click Import') }} <img src="https://media.wago.io/site/mdt-encoded.png" /></li>
                  <li>{{ $t('The display will update to your newly imported MDT route') }}</li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/OPIE/)">
                <ol>
                  <li>{{ $t('Open the OPie configuration window by opening the Interface Options (in Escape menu), select the Addons tab and selcting OPie') }} <img src="https://media.wago.io/site/opie-menu.png" />
                  {{ $t('Alternatively type the "/opie" command into your chat window') }} <img src="https://media.wago.io/site/opie-chatcmd.png" /></li>
                  <li>{{ $t('Select the Custom Rings submenu, then click the New Ring button') }} <img src="https://media.wago.io/site/opie-newring.png" /></li>
                  <li>{{ $t('Select the Import snapshot option and paste the string into the Snapshot field with ctrl-V (or command-V on a Mac), then click Add Ring') }} <img src="https://media.wago.io/site/opie-encoded.png" /></li>
                  <li>{{ $t('Set a binding and make any adjustments as necessary') }}</li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/PLATER/)">
                <ol>
                  <li>{{ $t('Open the Plater configuration by typing /plater into your chat window') }} <img src="https://media.wago.io/site/plater-chatcmd.png" /></li>
                  <li>{{ $t('Select Scripting, Modding, Profiles or whatever matches what you are importing') }} <img src="https://media.wago.io/site/plater-menu.png" /></li>
                  <li>{{ $t('Click the import button') }} <img src="https://media.wago.io/site/plater-import.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac), then click Okay') }} <img src="https://media.wago.io/site/plater-encoded.png" /></li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/TOTALRP3/)">
                <ol>
                  <li>{{ $t('Open the Total RP3 Extended Objects Database by clicking the button in the TRP3 menu') }} <img src="https://media.wago.io/site/trp3-database.png" /></li>
                  <li>{{ $t('Click the Quick object import button in the lower left area') }} <img src="https://media.wago.io/site/trp3-import.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac), click Import, then Accept to confirm') }} <img src="https://media.wago.io/site/trp3-encoded.png" /></li>
                  <li>{{ $t('It will be listed in your database to view and use as you like') }}</li>
                </ol>
              </md-dialog-content>

              <md-dialog-content v-else-if="wago.type.match(/VUHDO/)">
                <ol>
                  <li>{{ $t('Open the Vuhdo configuration window by clicking the Vuhdo icon by your mini map') }} <img src="https://media.wago.io/site/vuhdo-minimap.png" />
                  {{ $t('Alternatively type the "/vuhdo opt" command into your chat window') }} <img src="https://media.wago.io/site/vuhdo-chatcmd.png" /></li>
                  <li>{{ $t('Click the Import button in the upper left area to import a Bouquet') }} <img src="https://media.wago.io/site/vuhdo-import.png" />
                  {{ $t('Vuhdo Profiles and Key Layouts can be imported from the Tools tab at the bottom') }} <img src="https://media.wago.io/site/vuhdo-tools.png" /></li>
                  <li>{{ $t('Paste the string into the window with ctrl-V (or command-V on a Mac), click Okay, then Yes to confirm') }} <img src="https://media.wago.io/site/vuhdo-encoded.png" /></li>
                </ol>
              </md-dialog-content>
            </md-dialog>

            <md-dialog v-if="wago.user && User && wago.UID && wago.UID === User.UID" md-open-from="#newImportButton" md-close-to="#newImportButton" ref="newImportDialog" id="newImportDialog" @open="focusFieldByRef('importStringField')">
              <md-dialog-title>{{ $t("Import new string") }}</md-dialog-title>

              <md-dialog-content>
                <md-input-container :class="{ 'md-input-invalid': newImportString && newImportStringStatus.indexOf('Invalid') >= 0, 'md-input-status': newImportStringStatus }">
                  <label>{{ $t("Paste a new [-type-] string to update this Wago", {type: wago.type.toLowerCase() }) }}</label>
                  <md-input v-model="newImportString" ref="importStringField"></md-input>
                  <span class="md-error" v-if="newImportStringStatus.length>0">{{ newImportStringStatus }}</span>
                </md-input-container>
              </md-dialog-content>

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
                <md-button class="md-primary" @click="onUpdateImportString()" :disabled="!newImportString || newImportStringStatus.indexOf('Invalid') >= 0 || newImportVersionError.length > 0">{{ $t("Update") }}</md-button>
                <md-button class="md-primary" @click="$refs['newImportDialog'].close()">{{ $t("Cancel") }}</md-button>
              </md-dialog-actions>
            </md-dialog>
          </md-layout>
          <md-card-header>
            <md-avatar>
              <ui-image :img="wago.user.avatar"></ui-image>
            </md-avatar>
            <div class="item">
              <div class="md-title" v-if="wago.type === 'COLLECTION' && wago.UID && wago.user.searchable" v-html="$t('Collected by [-name-]', {name: `<a href='/p/${encodeURIComponent(wago.user.name)}' class='${wago.user.roleClass}'>${escapeText(wago.user.name)}</a>`, 'interpolation': {'escapeValue': false}})"></div>
              <div class="md-title" v-else-if="wago.type === 'COLLECTION' && wago.UID" v-html="$t('Imported by [-name-]', {name: `<span class='${wago.user.roleClass}'>${escapeText(wago.user.name)}</span>`, 'interpolation': {'escapeValue': false}})"></div>
              <div class="md-title" v-else-if="wago.UID && wago.user.searchable" v-html="$t('Imported by [-name-]', {name: `<a href='/p/${encodeURIComponent(wago.user.name)}' class='${wago.user.roleClass}'>${escapeText(wago.user.name)}</a>`, 'interpolation': {'escapeValue': false}})"></div>
              <div class="md-title" v-else-if="wago.UID" v-html="$t('Imported by [-name-]', {name: `<span class='${wago.user.roleClass}'>${escapeText(wago.user.name)}</span>`, 'interpolation': {'escapeValue': false}})"></div>
              <div class="md-title" v-else>{{ $t("Imported by guest") }}</div>
              <div class="md-subhead" v-if="wago.type !== 'COLLECTION'">{{ wago.date.modified | moment('MMM Do YYYY') }} [{{ wago.patch }}]</div>
            </div>
            <div class="item">
              <div class="md-title">{{ $t("[-count-] star", { count: wago.favoriteCount }) }}</div>
              <div class="md-subhead">{{ $t("[-count-] view", { count: wago.viewCount }) }}</div>
            </div>
            <div class="item" v-if="wago.type.match(/WEAKAURA/)">
              <div class="md-title">{{ $t("[-count-] install", { count: wago.installCount }) }}</div>
            </div>
            <div class="item" style="float:right" v-if="enableCompanionBeta && wago.type.match(/WEAKAURA/) && wago.code && wago.code.encoded && !wago.encrypted">
              <div id="sendToCompanionAppBtn" class="md-button copy-import-button" @click="sendToCompanionApp(true)">
                <md-icon>airplay</md-icon> {{ $t("Send to WeakAura Companion App") }}
              </div>
            </div>
            <div id="tags">
              <template>
                <a v-for="(cat, n) in wago.categories" :key="n" :href="'/' + typeSlug + cat.slug">
                  <md-chip :class="cat.cls" disabled v-if="cat.text && (n<5 || showMoreCategories)">{{ cat.text }}</md-chip>
                </a>
              </template>
              <span @click="viewAllCategories()"><md-chip v-if="wago.categories.length > 5 && !showMoreCategories" class="show_more">{{ $t("[-count-] more", {count: wago.categories.length - 5}) }}</md-chip></span>
            </div>
            <div id="thumbnails">
              <template v-for="video in wago.videos">
                <a class="showvid" :href="video.url" @click.prevent="showVideo(video.embed)"><md-icon>play_circle_outline</md-icon><md-image :md-src="video.thumb"></md-image></a>
              </template>
              <img v-for="(image, k) in wago.screens" v-lazy="image.src || image.thumb" @click="$refs.lightbox.showImage(k)">
            </div>
          </md-card-header>
        </md-card>
      </md-layout>

      <md-dialog md-open-from="#sendToCompanionAppBtn" md-close-to="#sendToCompanionAppBtn" ref="sendToCompanionAppDialog">
        <md-dialog-title>WeakAuras Companion</md-dialog-title>

        <md-dialog-content id="companion-info">
          <p>{{ $t('The WeakAuras Companion desktop app acts as a bridge between Wago and your in-game addon, and allows you to keep your imports up to date as authors update their auras') }}</p>
          <p>{{ $t('You must have the app installed for this function to work') }}</p>
          <p v-html="$t('The app can be downloaded from [-url-]', {url: '<a href=\'https://weakauras.wtf/\' target=\'_blank\'>https://weakauras.wtf/</a>', interpolation: {'escapeValue': false}})"></p>
        </md-dialog-content>

        <md-dialog-actions>
          <md-checkbox v-model="disableCompanionWarning">{{ $t("Do not show this warning again") }}</md-checkbox>
        </md-dialog-actions>

        <md-dialog-actions>
          <md-button class="md-primary" @click="$refs.sendToCompanionAppDialog.close()">{{ $t("Cancel") }}</md-button>
          <md-button class="md-primary" @click="$refs.sendToCompanionAppDialog.close(); sendToCompanionApp(false)">{{ $t("Send To Companion") }}</md-button>
        </md-dialog-actions>
      </md-dialog>

      <md-card id="wago-floating-header" v-if="showFloatingHeader">
        <div class="floating-header">
          <div>
            <h3>{{ wago.name }} <span class="version-number" v-if="currentVersionString">v{{ currentVersionString }}</span></h3>
            <md-subheader>{{ wago.type }}</md-subheader>
          </div>
          <div>
            <md-button @click="toTop"><md-icon>arrow_upward</md-icon> {{ $t("To top") }}</md-button>
          </div>
          <md-button v-if="hasUnsavedChanges && wago.code && wago.code.encoded" @click="copyEncoded" class="copy-import-button">
            <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
            <md-button @click="openHelpDialog()" id="helpImportingButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
            <md-tooltip md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("You have unsaved changes") }}</strong><br>{{ $t("Be sure to save or fork to generate a new string with your modifications") }}</md-tooltip>
          </md-button>
          <md-button v-else-if="wago.code && wago.code.encoded" @click="copyEncoded" class="copy-import-button">
            <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
            <md-button @click="openHelpDialog()" id="helpImportingButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
          </md-button>
        </div>
      </md-card>

      <div id="wago-flex-container">
        <div id="wago-col-main" style="position:relative">
          <md-button id="wago-tabs-toggle" class="md-icon-button md-raised" @click="toggleTabs">
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-layout>
            <md-layout id="wago-tabs" v-bind:class="{'md-hide-xsmall': hideTabs}">
              <!-- FRAME TOGGLES -->
              <md-button-toggle class="md-accent" md-single>
                <template v-if="!requireCipherKey">
                  <md-button v-if="wago.user && User && wago.UID && wago.UID === User.UID" v-bind:class="{'md-toggle': showPanel === 'config'}" @click="toggleFrame('config')">{{ $t("Config") }}</md-button>
                  <md-button v-if="wago.type == 'ERROR'" v-bind:class="{'md-toggle': showPanel === 'description'}" @click="toggleFrame('description')">{{ $t("Report") }}</md-button>
                  <md-button v-if="wago.type !== 'ERROR'" v-bind:class="{'md-toggle': showPanel === 'description'}" @click="toggleFrame('description')">{{ $t("Description") }}</md-button>
                  <md-button v-if="wago.referrals && wago.referrals.length" v-bind:class="{'md-toggle': showPanel === 'referrals'}" @click="toggleFrame('referrals')">{{ $t("External Links") }}</md-button>
                  <md-button v-if="(User && User.access && User.access.beta && wago && wago.attachedMedia && wago.attachedMedia.length)" v-bind:class="{'md-toggle': showPanel === 'media'}" @click="toggleFrame('media')">{{ $t("Media") }} [Beta]</md-button>
                  <md-button v-if="wago.type === 'WEAKAURA' || wago.type === 'CLASSIC-WEAKAURA'" v-bind:class="{'md-toggle': showPanel === 'includedauras'}" @click="toggleFrame('includedauras')">{{ $t("Included Auras") }}</md-button>
                  <md-button v-if="wago.translations" v-bind:class="{'md-toggle': showPanel === 'translations'}" @click="toggleFrame('translations')">{{ $t("Translations") }}</md-button>
                  <md-button v-bind:class="{'md-toggle': showPanel === 'comments'}" @click="toggleFrame('comments')"><span v-if="hasUnreadComments && showPanel !== 'comments'" class="commentAttn">{{$t("NEW")}}!! </span>{{ $t("[-count-] comment", {count: wago.commentCount }) }}</md-button>
                  <md-button v-if="wago.type !== 'COLLECTION'" v-bind:class="{'md-toggle': showPanel === 'collections'}" @click="toggleFrame('collections')">{{ $t("[-count-] collection", {count:  wago.collectionCount}) }}</md-button>
                  <md-button v-if="wago.versions && wago.versions.total > 1" v-bind:class="{'md-toggle': showPanel === 'versions'}" @click="toggleFrame('versions')" ref="versionsButton">{{ $t("[-count-] version", { count: wago.versions.total }) }}</md-button>
                  <md-button v-if="wago.code && !wago.code.Q && hasCodeDiffs" v-bind:class="{'md-toggle': showPanel === 'diffs'}" @click="toggleFrame('diffs')" ref="diffsButton">{{ $t("Code Diffs") }}</md-button>
                  <md-button v-if="wago.code && (wago.code.luacheck || wago.code.review) && wago.type !== 'SNIPPET'" v-bind:class="{'md-toggle': showPanel === 'codereview'}" @click="toggleFrame('codereview')">{{ $t("Code Review") }}</md-button>
                  <md-button v-if="wago.type !== 'ERROR' && wago.visibility && wago.visibility.public" v-bind:class="{'md-toggle': showPanel === 'embed'}" @click="toggleFrame('embed')">{{ $t("Embed") }}</md-button>
                  <md-button v-if="wago.type === 'MDT'" v-bind:class="{'md-toggle': showPanel === 'builder'}" @click="toggleFrame('builder')">{{ $t("Builder") }}</md-button>
                  <md-button v-if="wago.type !== 'ERROR'" v-bind:class="{'md-toggle': showPanel === 'editor'}" @click="toggleFrame('editor')">{{ $t("Editor") }}</md-button>
                </template>
                <md-button v-else class="md-toggle">{{ $t("Encrypted") }}</md-button>
              </md-button-toggle>

              <ui-image v-if="wago.image" :img="wago.image.files" class="wago-media"></ui-image>
              <!--<div v-else id="thumbnails" class="wago-media">
                <template v-for="video in wago.videos">
                  <a class="showvid" :href="video.url" @click.prevent="showVideo(video.embed)"><md-icon>play_circle_outline</md-icon><md-image :md-src="video.thumb"></md-image></a>
                </template>
                <lightbox id="mylightbox" :images="wago.screens"></lightbox>
              </div>-->
            </md-layout>

            <md-layout id="wago-content">
              <div v-if="requireCipherKey" class="wago-container">
                <md-card>
                  <ui-warning mode="warn">
                    {{ $t("This import is encrypted") }} {{ $t("You must enter the password or cipher key to decrypt it") }}
                  </ui-warning>
                  <form @submit.stop.prevent="decryptImport()">
                    <md-input-container md-has-password>
                      <label>{{ $t('Password / Cipher Key') }}</label>
                      <md-input v-model="cipherKey" type="password" data-lpignore="true"></md-input>
                    </md-input-container>
                    <md-button class="md-raised" :disabled="!cipherKey.length || decryptLoading" @click="decryptImport()" style="margin-top:1em; max-width: 110px">{{ $t('Decrypt') }}</md-button>
                  </form>
                </md-card>
              </div>
              
              <ui-warning v-if="codeQueue && wago.code && wago.code.Q" mode="warn" :spinner="true" :html="$t('The code in this import is being processed and will automatically update this page once complete Position [-position-]', {position: codeQueue})"></ui-warning>

              <template v-else-if="codeReview.alerts > 0 && (!wago.code || !wago.code.Q)">
                <ui-warning mode="alert" id="code-review-alert" v-if="codeReview.securityAlert">
                  <div><md-icon>error_outline</md-icon> {{ $t('Wago has detected some possible malicious code - please review before installing') }}</div>
                </ui-warning>
                <ui-warning mode="alert" id="code-review-alert">
                  <div><md-icon>error_outline</md-icon> {{ $t('Wago has identified [-count-] alert during automated code review', {count: codeReview.alerts}) }}</div>
                  <md-button v-if="showPanel !== 'codereview' && wago.type !== 'SNIPPET'" @click.prevent="toggleFrame('codereview')">[{{ $t("View Alerts") }}]</md-button>
                  <md-button v-else-if="showPanel !== 'editor' && wago.type === 'SNIPPET'" @click.prevent="toggleFrame('editor')">[{{ $t("View Alerts") }}]</md-button>
                </ui-warning>
                <div class="wago-container" v-if="wago.user && User && wago.UID && wago.UID === User.UID && codeReview.alerts > 0">
                  <span v-if="wago.type.match(/WEAKAURA/)" v-html="$t('Want some help fixing code review alerts? Come have a chat on the [-discord-].', {discord: `<a href='https://discord.gg/weakauras'>WeakAuras Discord</a>`, interpolation: {escapeValue: false}})"></span>
                  <span v-else-if="wago.type.match(/PLATER/)" v-html="$t('Want some help fixing code review alerts? Come have a chat on the [-discord-].', {discord: `<a href='https://discord.com/invite/AGSzAZX'>Plater Discord</a>`, interpolation: {escapeValue: false}})"></span>
                </div>
              </template>

              <ui-warning v-if="wago.expires" mode="info">
                {{ $t("This import will expire in [-time-]", {time: this.$moment(wago.expires).fromNow() }) }}<br>
              </ui-warning>

              <ui-warning v-if="wago.fork && wago.fork._id" mode="info" :html="$t('This is a fork of [-id-][-name-]', {id: wago.fork._id, name: wago.fork.name})"></ui-warning>

              <ui-warning v-if="wago.visibility && wago.visibility.private">
                {{ $t("This import is private only you may view it") }}
              </ui-warning>
              <ui-warning v-else-if="wago.visibility && wago.visibility.restricted">
                {{ $t("This import is restricted, you have been granted access to view it") }}
              </ui-warning>
              <ui-warning v-else-if="wago.visibility && wago.visibility.hidden">
                {{ $t("This import is hidden only those with the URL may view it") }}
              </ui-warning>

              <ui-warning v-else-if="wago.code && wago.code.alert && wago.code.alerts.newInternalVersion" mode="alert">
                {{ $t("This WeakAura is made with build \"[-version-]\", which may include breaking changes with the current main addon release", {version: wago.code.alerts.newInternalVersion.build}) }}<br>
                <div v-for="func in wago.code.alerts.malicious">{{ func }}</div>
              </ui-warning>

              <ui-warning v-if="!isLatestVersion()" mode="info" :html="$t('A more recent version of this import is available view the latest version [-url-]', {url: '/' + $store.state.wago.slug})"></ui-warning>

              <!-- CONFIG FRAME -->
              <div id="wago-config-container" class="wago-container" v-if="showPanel=='config'">
                <md-card id="wago-config">
                  <h3>{{ $t("Text setup")}}</h3>
                  <md-input-container :class="{ 'md-input-invalid': updateNameError, 'md-input-status': updateNameHasStatus }">
                    <label>{{ $t("Title") }}</label>
                    <md-input v-model="editName" @change="onUpdateName()" :debounce="600"></md-input>
                    <span class="md-error" v-if="updateNameStatus.length>0">{{ updateNameStatus }}</span>
                  </md-input-container>
                  <div v-if="User.access.customSlug">
                    <md-input-container :class="{ 'md-input-invalid': updateSlugError, 'md-input-status': updateSlugHasStatus, 'customSlug': true }">
                      <label>{{ $t("Custom URL") }}</label>
                      <span class="root">http://wago.io/</span>
                      <md-input v-model="editSlug" @change="onUpdateSlug()" :debounce="600"></md-input>
                    <span class="md-error" v-if="updateSlugStatus.length>0">{{ updateSlugStatus }}</span>
                    </md-input-container>
                  </div>
                  <md-input-container :class="{ 'md-input-invalid': updateDescError, 'md-input-status': updateDescHasStatus }">
                    <label>{{ $t("Description") }}</label>
                    <md-textarea v-model="editDesc" @change="onUpdateDescription()" :debounce="600"></md-textarea>
                    <span class="md-error" v-if="updateDescStatus.length>0">{{ updateDescStatus }}</span>
                  </md-input-container>
                  <div style="margin-top:-24px">
                    <div class="md-radio md-theme-default"><div class="md-radio-container" style="opacity:0; width:0"></div><label class="md-radio-label">{{ $t("Description Format") }}</label></div>
                    <md-radio v-model="updateDescFormat" @change="onUpdateDescription()" md-value="bbcode">BBCode</md-radio>
                    <md-radio v-model="updateDescFormat" @change="onUpdateDescription()" md-value="markdown">Markdown</md-radio>
                  </div>
                  <md-layout md-row>
                    <md-input-container>
                      <label for="visibilty">{{ $t("Visibility") }}</label>
                      <md-select name="visibilty" id="visibilty" v-model="editVisibility">
                        <md-option value="Public">{{ $t("Public") }}</md-option>
                        <md-option value="Hidden">{{ $t("Hidden (only viewable with link)") }}</md-option>
                        <md-option value="Encrypted" v-if="wago.type !== 'COLLECTION'">{{ $t("Encrypted (only viewable with password)") }}</md-option>
                        <md-option value="Restricted" v-if="!decryptKey">{{ $t("Restricted (viewable for select users)") }}</md-option>
                        <md-option value="Private">{{ $t("Private (only you may view)") }}</md-option>
                      </md-select>
                    </md-input-container>
                  </md-layout>
                  <div v-if="editVisibility === 'Encrypted'" style="margin: 0 0 3em 1em">
                    <md-input-container md-has-password>
                      <label>{{ $t('Password / Cipher Key') }}</label>
                      <md-input v-model="cipherKey" type="password" data-lpignore="true"></md-input>
                      <span class="md-note">
                        {{ $t('Your import will be encrypted before storing on the server') }}<br>
                        {{ $t('Do not lose your key! There is NO WAY to recover encrypted data without it!') }}<br>
                        {{ $t('Note that some features performed by the server will not be available for encrypted imports') }}
                      </span>
                    </md-input-container>
                  </div>
                  <md-button v-if="editVisibility === 'Encrypted' && cipherKey !== decryptKey && decryptKey" class="md-raised" :disabled="!cipherKey.length" @click="saveCipherKey()" style="align-self: flex-start">{{ $t('Save Key') }}</md-button>
                  <md-button v-else-if="editVisibility !== 'Encrypted' && decryptKey" class="md-raised" :disabled="!cipherKey.length" @click="removeCipherKey()" style="align-self: flex-start">{{ $t('Remove Encryption') }}</md-button>
                  <md-button v-else-if="editVisibility == 'Encrypted' && !decryptKey" class="md-raised" :disabled="!cipherKey.length" @click="saveCipherKey()" style="align-self: flex-start">{{ $t('Set Encryption') }}</md-button>
                  <div v-if="editVisibility === 'Restricted'" style="margin-left:1em">
                    <template v-for="(rest, index) in wago.restrictions">
                      <md-layout :key="index">
                        <md-layout>
                          <md-input-container>
                            <label>{{ $t("Restricted Access Granted To") }}</label>
                            <md-select v-model="rest.type" @change="onUpdateRestrictionsDebounce(index)">
                              <md-option value="user">{{ $t("Username") }}</md-option>
                              <md-option value="guild" v-if="User.access.restrictGuild && User.battlenet && User.battlenet.guilds && User.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                              <!--<md-option value="twitchsubs" v-if="User.access.restrictSubs && User.twitch && User.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
                              <md-option value="remove">{{ $t("Remove Access") }}</md-option>
                            </md-select>
                          </md-input-container>
                        </md-layout>
                        <md-layout class="resticted-options">
                          <md-input-container v-if="rest.type === 'user'">
                            <label for="advSearchUserName">{{ $t("Enter Username") }}</label>
                            <md-autocomplete v-model="rest.value" @md-changed="autoCompleteUserName" :debounce="600" @change="onUpdateRestrictionsDebounce(index)"></md-autocomplete>
                          </md-input-container>
                          <md-input-container v-if="rest.type === 'guild'">
                            <label>{{ $t("Select Guild") }}</label>
                            <md-select v-model="rest.value" @change="onUpdateRestrictionsDebounce(index)">
                              <template v-for="(guild, guildIndex) in User.battlenet.guilds">
                                <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                              </template>
                            </md-select>
                          </md-input-container>
                          <md-input-container v-if="rest.type === 'guild'">
                            <label>{{ $t("Select Rank(s)") }} [ <a :href="getGuildLink(rest.value)" target="_blank" rel="noopener">{{ $t("View Members") }}</a> ]</label>
                            <md-select v-model="rest.rank" @change="onUpdateRestrictionsDebounce(index)">
                              <md-option value="9">{{ $t("Everyone (Ranks 1-10)") }}</md-option>
                              <md-option value="8">{{ $t("Ranks 1-9") }}</md-option>
                              <md-option value="7">{{ $t("Ranks 1-8") }}</md-option>
                              <md-option value="6">{{ $t("Ranks 1-7") }}</md-option>
                              <md-option value="5">{{ $t("Ranks 1-6") }}</md-option>
                              <md-option value="4">{{ $t("Ranks 1-5") }}</md-option>
                              <md-option value="3">{{ $t("Ranks 1-4") }}</md-option>
                              <md-option value="2">{{ $t("Ranks 1-3") }}</md-option>
                              <md-option value="1">{{ $t("Ranks 1-2") }}</md-option>
                              <md-option value="0">{{ $t("Guild Leader (Rank 1)") }}</md-option>
                            </md-select>
                          </md-input-container>
                        </md-layout>
                      </md-layout>
                    </template>
                    <md-layout v-if="wago.restrictions.length < 20">
                      <md-layout>
                        <md-input-container>
                          <label>{{ $t("Also Grant Access To") }}</label>
                          <md-select v-model="newRestrictionType" @change="checkNewRestrictions">
                            <md-option value="user">{{ $t("Username") }}</md-option>
                            <md-option value="guild" v-if="User.access.restrictGuild && User.battlenet && User.battlenet.guilds && User.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                            <!--<md-option value="twitchsubs" v-if="User.access.restrictSubs && User.twitch && User.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
                          </md-select>
                        </md-input-container>
                      </md-layout>
                      <md-layout class="resticted-options">
                        <md-input-container v-if="newRestrictionType === 'user'">
                          <label for="advSearchUserName">{{ $t("Enter Username") }}</label>
                          <md-autocomplete v-model="newRestrictionValue" @md-changed="autoCompleteUserName" @blur="checkNewRestrictions"></md-autocomplete>
                        </md-input-container>
                        <md-input-container v-if="newRestrictionType === 'guild'">
                          <label>{{ $t("Select Guild") }}</label>
                          <md-select v-model="newRestrictionValue" @change="checkNewRestrictions">
                            <template v-for="(guild, guildIndex) in User.battlenet.guilds">
                              <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                            </template>
                          </md-select>
                        </md-input-container>
                      </md-layout>
                    </md-layout>
                  </div>
                  <div v-if="!wago.image && !wago.audio && wago.type !== 'ERROR'">
                    <div>
                      <label id="categoryLabel">{{ $t("Categories") }}</label>
                      <md-button class="md-icon-button md-raised" @click="numCategorySets++">
                        <md-icon>add</md-icon>
                      </md-button>
                      <div v-for="n in numCategorySets">
                        <div class="has-category-select">
                          <category-select :selectedCategories="editCategories[n-1]" @update="cat => {editCategories[n-1] = cat; onUpdateCategories()}" :type="wago.type.toUpperCase()" :game="wago.game"></category-select>
                        </div>
                      </div>
                    </div>
                    <!--<div v-if="wago.type=='WEAKAURA'">
                      <label id="betaLabel">{{ $t("Game") }}</label>
                      <md-button-toggle md-single class="md-accent md-warn">
                        <md-button :class="{ 'md-toggle': gameMode === '' }" @click="setGameMode('')">Legion Live</md-button>
                        <md-button :class="{ 'md-toggle': gameMode === 'beta-bfa' }"@click="setGameMode('beta-bfa')">BFA Beta</md-button>
                      </md-button-toggle>
                    </div>-->
                    <h3>{{ $t("Preview setup")}}</h3>
                    <md-layout>
                      <md-layout md-flex="75">
                        <md-input-container :class="{ 'md-input-invalid': pasteURLError, 'md-input-status': pasteURLHasStatus}">
                          <label>{{ $t("Add an image or video by pasting an image directly or input a URL") }}</label>
                          <md-input v-model="pasteURL" id="pasteURL" :readonly="pasteURLUploading"></md-input>
                          <span class="md-error" v-if="pasteURLStatus">{{ pasteURLStatus }}</span>
                        </md-input-container>
                      </md-layout>
                      <md-layout>
                        <md-input-container>
                          <md-file v-model="uploadImages" multiple accept="image/*" :placeholder="$t('Or click to upload image')" @selected="onUploadFile($event)"></md-file>
                        </md-input-container>
                      </md-layout>
                    </md-layout>
                    <div v-if="wago.videos.length > 0">
                      <strong>{{ $t("Videos") }}</strong>
                      <div class="sortable" id="sorted-videos">
                        <div v-for="(item, index) in wago.videos" :key="item._id" :id="'video-'+item._id">
                          <span class="delete" @click="onVideoDelete(index)" :title="$t('Delete video')">❌</span>
                          <md-image :md-src="item.thumb"></md-image>
                        </div>
                      </div>
                    </div>
                    <div v-if="wago.screens && wago.screens.length > 0" class="config-screenshots">
                      <strong>{{ $t("Screenshots") }}</strong>
                      <div class="sortable" id="sorted-screenshots">
                        <div v-for="(item, index) in wago.screens" :key="item._id" :id="'screenshot-'+item._id">
                          <span class="delete" @click="onScreenDelete(index)" :title="$t('Delete image')">❌</span>
                          <md-image :md-src="item.src"></md-image>
                        </div>
                      </div>
                    </div>
                  </div>

                  <md-card-actions>
                    <md-button id="deleteWago" @click="$refs['deleteWago'].open()">Delete Import</md-button>
                    <md-dialog md-open-from="#deleteWago" md-close-to="#deleteWago" ref="deleteWago">
                      <md-dialog-title>{{ $t("Are you sure you want to delete this import?") }}</md-dialog-title>
                      <md-dialog-content>{{ $t("There is no way to undo this action") }}</md-dialog-content>
                      <md-dialog-actions>
                        <md-button class="md-primary" @click="$refs['deleteWago'].close()">Cancel</md-button>
                        <md-button class="md-primary" @click="onDeleteImport()">Delete</md-button>
                      </md-dialog-actions>
                    </md-dialog>
                  </md-card-actions>
                </md-card>
              </div>

              <!-- DESCRIPTIONS FRAME -->
              <div id="wago-description-container" class="wago-container" v-if="showPanel=='description'">
                <div id="wago-description" style="padding-top:6px">
                  <div v-if="wago.code && wago.code.changelog && wago.code.changelog.text" class="changelog-text">
                    <div>v{{ wago.code.versionString }}</div>
                    <formatted-text :text="wago.code.changelog" :enableLinks="wago.user.enableLinks"></formatted-text>
                  </div>
                  <formatted-text v-if="wago.type !== 'ERROR' || wago.description.text" :text="wago.description.text && wago.description.text.length ? wago.description : {text: $t('No description for this import has been provided')}" :enableLinks="wago.user.enableLinks"></formatted-text>
                  <template v-if="wago.type === 'ERROR' && wago.errorReport && wago.errorReport.length > 1">
                    <md-tabs @change="selectError">
                      <md-tab v-for="(error, key) in wago.errorReport" :md-label="key + 1" :key="key" :id="'err' + (key + 1)" :md-active="selectedError === key + 1">
                        <ui-warning v-if="error.text.match(/ADDON_ACTION_BLOCKED/)" mode="alert">
                          {{ $t("ADDON_ACTION_BLOCKED usually refers to addon taint and the stack detailed below is probably not the cause of this error") }}
                        </ui-warning><br>
                        <formatted-text :text="error"></formatted-text>
                      </md-tab>
                    </md-tabs>
                  </template>
                  <template v-else-if="wago.type === 'ERROR' && wago.errorReport && wago.errorReport.length === 1">
                    <ui-warning v-if="wago.errorReport[0].text.match(/ADDON_ACTION_BLOCKED/)" mode="alert">
                      {{ $t("ADDON_ACTION_BLOCKED usually refers to addon taint and the stack detailed below is probably not the cause of this error") }}
                    </ui-warning><br>
                    <formatted-text :text="wago.errorReport[0]"></formatted-text>
                  </template>
                </div>
              </div>

              <!-- REFERRALS FRAME -->
              <div id="wago-versions-container" class="wago-container" v-if="showPanel=='referrals'">
                <p>{{ $t("External sites clicked through to this page") }}</p>
                <md-card id="wago-referrals">
                  <md-table>
                    <md-table-header>
                      <md-table-row>
                        <md-table-head>{{ $t("Linked From") }}</md-table-head>
                        <md-table-head class="md-end">{{ $t("Count") }}</md-table-head>
                      </md-table-row>
                    </md-table-header>

                    <md-table-body>
                      <template v-for="(ref, key) in wago.referrals">
                        <md-table-row>
                          <md-table-cell>
                            <a :href="ref.url" target="_blank" rel="noopener">{{ ref.url }}</a>
                          </md-table-cell>
                          <md-table-cell class="md-end">
                            {{ ref.count  }}
                          </md-table-cell>
                        </md-table-row>
                      </template>
                    </md-table-body>
                  </md-table>
                </md-card>
              </div>

              <!-- INCLUDED MEDIA FRAME -->
              <div id="wago-media-container" class="wago-container" v-if="showPanel=='media'">
                <div id="wago-media" style="padding-top:6px" v-if="wago.attachedMedia && wago.attachedMedia.length">
                  <p>{{ $t("This WeakAura is using the following media files" )}}</p>
                  <template v-for="(item, i) in wago.attachedMedia">
                    <div>
                      <span class="attached-media">
                        {{ item.wowPath }}<br>
                        <img v-if="item.mediaPath" :src="'https://media.wago.io' + item.mediaPath">
                        <span v-else>This is a custom texture or otherwise unknown to Wago. In a future update custom textures can be attached to your imports.</span>
                      </span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- INCLUDED AURAS FRAME -->
              <div id="wago-includedauras-container" class="wago-container" v-if="showPanel=='includedauras'">
                <div id="wago-includedauras" style="padding-top:6px">
                  <template v-for="(item, i) in listIncludedAuras()">
                    <div>{{ item.name }} ({{ item.type }})</div>
                  </template>
                </div>
              </div>

              <!-- TRANSLATIONS FRAME -->
              <div id="wago-localizations-container" class="wago-container" v-if="showPanel=='translations'">
                <p>{{ $t("Wago allows crowd-sourced translations for WeakAuras") }}</p>
                <md-button-toggle md-single>
                  <md-button @click="viewTranslation='de_DE'" :class="{'md-toggle': viewTranslation=='de_DE'}">de_DE</md-button>
                  <md-button @click="viewTranslation='en_GB'" :class="{'md-toggle': viewTranslation=='en_GB'}">en_GB</md-button>
                  <md-button @click="viewTranslation='en_US'" :class="{'md-toggle': viewTranslation=='en_US'}">en_US</md-button>
                  <md-button @click="viewTranslation='es_ES'" :class="{'md-toggle': viewTranslation=='es_ES'}">es_ES</md-button>
                  <md-button @click="viewTranslation='es_MX'" :class="{'md-toggle': viewTranslation=='es_MX'}">es_MX</md-button>
                  <md-button @click="viewTranslation='fr_FR'" :class="{'md-toggle': viewTranslation=='fr_FR'}">fr_FR</md-button>
                  <md-button @click="viewTranslation='it_IT'" :class="{'md-toggle': viewTranslation=='it_IT'}">it_IT</md-button>
                  <md-button @click="viewTranslation='ko_KR'" :class="{'md-toggle': viewTranslation=='ko_KR'}">ko_KR</md-button>
                  <md-button @click="viewTranslation='pt_BR'" :class="{'md-toggle': viewTranslation=='pt_BR'}">pt_BR</md-button>
                  <md-button @click="viewTranslation='zh_CN'" :class="{'md-toggle': viewTranslation=='zh_CN'}">zh_CN</md-button>
                  <md-button @click="viewTranslation='zh_TW'" :class="{'md-toggle': viewTranslation=='zh_TW'}">zh_TW</md-button>
                </md-button-toggle>
                <div class="translate-item translate-header">
                  <div class="key">{{ $t('Key') }}</div>
                  <div class="current">{{ $t('Current Text') }}</div>
                  <div class="submit">
                    <md-button-toggle md-single class="md-accent" id="translationModeButtons">
                      <md-button @click="translationMode='set'" :class="{'md-toggle': translationMode=='set'}">{{ $t('Submit New Text for [-locale-]', {locale: viewTranslation}) }}</md-button>
                      <md-button @click="translationMode='view'" :class="{'md-toggle': translationMode=='view'}">{{ $t('View Submitted Text for [-locale-]', {locale: viewTranslation}) }}</md-button>
                    </md-button-toggle>
                  </div>
                </div>
                <template v-for="(item, key) in wago.translations[viewTranslation.replace(/_/, '')]">
                  <div class="translate-item" :key="key">
                    <strong :title="key" class="key">{{ key }}</strong>
                    <div class="current">
                      <md-input-container>
                        <md-textarea v-model="item.term || '< '+$t('Not translated')+' >'" disabled class="currentLang" :class="{'notLocalized': !item.term}"></md-textarea>
                        <md-textarea v-if="viewMyLocalization !== viewTranslation && wago.translations[viewMyLocalization.replace(/_/, '')][key].term" v-model="viewMyLocalization+': '+wago.translations[viewMyLocalization.replace(/_/, '')][key].term" disabled class="myLang"></md-textarea>
                      </md-input-container>
                    </div>
                    <md-input-container md-inline class="submit">
                      <md-textarea v-model="item.term"></md-textarea>
                    </md-input-container>
                    <md-button class="view" :disabled="!item.submissions || !item.submissions.length">{{ item.submissions && item.submissions.length ? item.submissions.length : 'N/A' }}</md-button>
                  </div>
                </template>
              </div>

              <!-- COMMENTS FRAME -->
              <div id="wago-comments-container" class="wago-container" v-if="showPanel=='comments'">
                <div id="wago-comments">
                  <view-comments :comments="wago.comments" :commentTotal="wago.commentCount" :wagoID="wago._id"></view-comments>
                </div>
              </div>

              <!-- VERSIONS FRAME -->
              <div id="wago-versions-container" class="wago-container" v-if="showPanel=='versions'">
                <h2>{{ $t("Previous versions") }}</h2>
                <md-card id="wago-versions">
                  <md-table>
                    <md-table-header>
                      <md-table-row>
                        <md-table-head md-numeric>{{ $t("Version") }}</md-table-head>
                        <md-table-head md-numeric></md-table-head>
                        <md-table-head>{{ $t("Import Date") }}</md-table-head>
                        <md-table-head md-numeric>{{ $t("Size") }}</md-table-head>
                      </md-table-row>
                    </md-table-header>

                    <md-table-body>
                      <template v-for="(ver, key) in wago.versions.versions">
                        <md-table-row>
                          <md-table-cell md-numeric>
                            <md-chip v-if="ver.versionString === currentVersionString">{{ $t("Active") }}</md-chip>
                            <md-button v-else class='chip-button' :href="selectVersion([ver])">{{ $t("View") }}</md-button>
                            <span class='version-num'>{{ ver.versionString }}</span>
                          </md-table-cell>
                          <md-table-cell>
                            <md-button class='chip-button' v-bind:class="{'md-toggle': ver.version === viewNotes}" v-if="ver.changelog.text" @click="toggleViewNotes(ver.version)">{{ $t("View notes") }}</md-button>
                            <md-button v-if="User && wago.UID && wago.UID === User.UID" class='chip-button' @click="modifyVersion(ver)">{{ $t("Modify Version") }}</md-button>
                          </md-table-cell>
                          <md-table-cell>
                            {{ ver.date | moment("dddd, MMMM Do YYYY, h:mm a") }}
                          </md-table-cell>
                          <md-table-cell md-numeric>
                            {{ ver.size }}
                          </md-table-cell>
                        </md-table-row>
                        <md-table-row v-if="viewNotes === ver.version" class='changelog-row'>
                          <md-table-cell colspan="4"><span class='version-num'></span><formatted-text :text="ver.changelog" :enableLinks="wago.user.enableLinks"></formatted-text></md-table-cell>
                        </md-table-row>
                      </template>
                    </md-table-body>
                  </md-table>
                </md-card>
                <md-dialog ref="modifyVersionDialog" id="modifyVersionDialog" @open="focusFieldByRef('modifiedChangelog')">
                  <md-dialog-title>{{ $t("Modify Version") }}</md-dialog-title>

                  <md-dialog-content>{{ $t("Note that version numbers must be unique when changing the version number, any subsequent versions will be increased if necessary") }}</md-dialog-content>

                  <input-semver v-model="modifiedVersion" :latestVersion="modifiedPreviousVersion"></input-semver>

                  <md-dialog-content>
                    <md-input-container class="changelog-notes">
                      <label>{{ $t("Changelog") }}</label>
                      <md-textarea ref="modifiedChangelog" v-model="newChangelog.text" :placeholder="$t('You may enter any patch notes or updates here')"></md-textarea>
                    </md-input-container>
                    <div>
                      <div class="md-radio md-theme-default"><label class="md-radio-label">{{ $t("Format") }}</label></div>
                      <md-radio v-model="newChangelog.format" md-value="bbcode">BBCode</md-radio>
                      <md-radio v-model="newChangelog.format" md-value="markdown">Markdown</md-radio>
                    </div>
                  </md-dialog-content>

                  <md-dialog-actions>
                    <md-button class="md-primary" @click="saveModifiedVersion()">{{ $t("Update") }}</md-button>
                    <md-button class="md-primary" @click="$refs['modifyVersionDialog'].close()">{{ $t("Cancel") }}</md-button>
                  </md-dialog-actions>
                </md-dialog>
              </div>

              <!-- DIFF FRAME -->
              <div id="wago-diff-container" class="wago-container" v-if="showPanel=='diffs' && !codeQueue">
                <div id="wago-diff">
                  <view-diffs :leftVersion="leftDiff" :rightVersion="rightDiff" :allVersions="listVersions"></view-diffs>
                </div>
              </div>

              <!-- COLLECTIONS FRAME -->
              <div id="wago-collections-container" class="wago-container" v-if="showPanel=='collections'">
                <md-menu md-align-trigger md-size="7" v-if="User.UID">
                  <md-button md-menu-trigger id="addCollectionButton"><md-icon>library_add</md-icon> {{ $t("Add to collection") }}</md-button>

                  <md-menu-content>
                    <md-menu-item v-for="coll in User.collections" :key="coll._id" @click="addToCollection(coll._id)">
                      <md-icon v-if="wago.myCollections.length > 0 && wago.myCollections.indexOf(coll._id) > -1">check</md-icon>
                      <md-icon v-else>add</md-icon>
                      {{ coll.name }}
                    </md-menu-item>
                    <md-menu-item @click="openNewCollectionDialog()"><md-icon>add_box</md-icon>{{ $t("Create new collection") }}</md-menu-item>
                  </md-menu-content>

                  <md-dialog md-open-from="#addCollectionButton" md-close-to="#addCollectionButton" ref="addCollectionDialog">
                    <md-dialog-title>{{ $t("Create new collection") }}</md-dialog-title>

                    <md-dialog-content>
                      <form>
                        <md-input-container>
                          <label>{{ $t("Name") }}</label>
                          <md-input v-model="addCollectionName" ref="addCollectionNameInput"></md-input>
                        </md-input-container>
                      </form>
                    </md-dialog-content>

                    <md-dialog-actions>
                      <md-button @click="$refs.addCollectionDialog.close()">{{ $t("Cancel") }}</md-button>
                      <md-button class="md-primary" @click="CreateCollection()">{{ $t("Create") }}</md-button>
                    </md-dialog-actions>
                  </md-dialog>
                </md-menu>
                <md-card id="wago-collections">
                  <div>{{ $t("Collections are sets of imports curated by users for a variety of purproses")}}</div>
                  <div v-if="wago.collections.length > 0">
                    <strong>{{ $t("This Wago is included in [-count-] collection", {count: wago.collectionCount}) }}</strong>
                    <md-table>
                      <md-table-header>
                        <md-table-row>
                          <md-table-head>{{ $t("Collection") }}</md-table-head>
                          <md-table-head>{{ $t("Last Modified") }}</md-table-head>
                          <md-table-head>{{ $t("User") }}</md-table-head>
                        </md-table-row>
                      </md-table-header>

                      <md-table-body>
                        <md-table-row v-for="(coll, key) in wago.collections" v-bind:key="key">
                          <md-table-cell>
                            <router-link :to="'/' + coll.slug">{{ coll.name }}</router-link>
                          </md-table-cell>
                          <md-table-cell>
                            {{ coll.modified | moment("dddd, MMMM Do YYYY, h:mm a") }}
                          </md-table-cell>
                          <md-table-cell class="userlink">
                            
                            <md-avatar><ui-image :img="coll.user.avatar" alt="Avatar"></ui-image></md-avatar>
                            <router-link v-if="coll.user.profile" :to="coll.user.profile" :class="coll.user.class">{{ coll.user.name }}</router-link>
                            <span v-else :class="coll.user.class">{{ coll.user.name }}</span>
                          </md-table-cell>
                        </md-table-row>
                      </md-table-body>
                    </md-table>
                    <md-button v-if="showMoreCollections" @click="loadMoreCollections"><md-icon>list</md-icon> {{ $t("Load more collections" )}}</md-button>
                  </div>
                  <div v-else><strong>{{ $t("This WeakAura is not included in any public collections") }}</strong></div>
                </md-card>
              </div>

              <!-- EMBED FRAME -->
              <div id="wago-embed-container" class="wago-container" v-if="showPanel=='embed' && wago.code && wago.code.encoded">
                <ui-warning v-if="wago.code.alerts.blacklist" mode="alert">
                  {{ $t("Embeds will not work for imports with blocked functions") }}
                </ui-warning>
                <template v-if="wago.type === 'MDT'">
                  <h2>{{ $t("Embed iframe") }}</h2>
                  <md-card id="wago-embed">
                    <p>{{ $t("Embed a minimimally designed readonly MDT route on your own site") }} {{ $t("The frame is responsive and will look good at most site widths") }}</p>
                    <p>{{ $t("Most of the colors are customizable by including a parameter in the URL") }}</p>
                    <div id="embed-content">
                      <div id="embed-inputs" class="field-group">
                        <md-layout>
                          <div class="iframeColorPickers">
                            <span v-bind:style="{'color': (iframeColorEdit === 'background' ? '#d7373d' : 'inherit')}">{{ $t("Body Background") }}</span>
                            <button class='colorBtn' @click="setCustomizeIframeColor('background')" v-bind:style="{'background-color': iframeBackground}"></button>

                            <span v-bind:style="{'color': (iframeColorEdit === 'menu' ? '#d7373d' : 'inherit')}">{{ $t("Menu Background") }}</span>
                            <button class='colorBtn' @click="setCustomizeIframeColor('menu')" v-bind:style="{'background-color': iframeMenu}"></button>

                            <md-button @click="copyIframe()">{{ $t("Copy code") }}</md-button>
                          </div>
                          <div class="iframeColorPickers">
                            <span v-bind:style="{'color': (iframeColorEdit === 'text1' ? '#d7373d' : 'inherit')}">{{ $t("Text 1") }}</span>
                            <button class='colorBtn' @click="setCustomizeIframeColor('text1')" v-bind:style="{'background-color': iframeText1}"></button>

                            <span v-bind:style="{'color': (iframeColorEdit === 'text2' ? '#d7373d' : 'inherit')}">{{ $t("Text 2") }}</span>
                            <button class='colorBtn' @click="setCustomizeIframeColor('text2')" v-bind:style="{'background-color': iframeText2}"></button>

                            <md-button @click="resetIframe()" v-if="iframeQueryString">{{ $t("Reset") }}</md-button>
                          </div>
                          <div id="color-picker">
                            <color-picker v-if="iframeColorEdit" v-model="customizeIframeColor" :disableAlpha="true" />
                          </div>
                        </md-layout>
                        <md-input-container>
                          <label>{{ $t("Iframe code") }}</label>
                          <md-input readonly :value="'<iframe src=&quot;https://wago.io/' + wago._id + '/embed.html' + iframeQueryString + '&quot; style=&quot;width: 100%; height: 795px;&quot;></iframe>'"></md-input>
                        </md-input-container>
                      </div>
                    </div>
                    <iframe :src="'https://wago.io/' + wago._id + '/embed.html' + _iframeQueryString" style="width: 100%; height: 795px; border: 1px solid #ddd" id="embed-iframe"></iframe>
                  </md-card>
                  <br>
                </template>

                <h2>{{ $t("Embed script") }}</h2>
                <md-card id="wago-embed">
                  <div>{{ $t("Embed this wago on your own site") }}</div>
                  <div id="embed-content">
                    <div id="embed-inputs" class="field-group">
                      <md-input-container>
                        <label for="embedStyle">{{ $t("Button Style") }}</label>
                        <md-select id="embedStyle" v-model="embedStyle">
                          <md-option value="dark">{{ $t("Dark") }}</md-option>
                          <md-option value="light">{{ $t("Light") }}</md-option>
                          <md-option value="none">{{ $t("None") }}</md-option>
                        </md-select>
                        <md-button @click="copyEmbed()">{{ $t("Copy code") }}</md-button>
                      </md-input-container>
                      <md-input-container>
                        <label>{{ $t("Embed code") }}</label>
                        <md-input readonly :value="'<script src=&quot;https://wago.io/' + this.wago._id + '/embed.js?style=' + this.embedStyle + '&quot;></script>'"></md-input>
                      </md-input-container>
                    </div>
                    <div id="embed-preview-container" :class="embedStyle">
                      <md-subheader><span style="color:#777">{{ $t("Preview") }}</span></md-subheader>
                      <div id="embed-preview">
                        <span :id="'wago-'+wago._id" class="wagoEmbed">
                          <a :href="wago.url" class='vr'><img src="https://media.wago.io/logo/57x57.png"></a>
                          <button @click="embedCopy(this, wago.code.encoded)" class="wagoCopyButton">
                            <small class="clickToCopyWago">Click to copy import string from wago.io</small>
                            <div class="wagoName">{{ wago.name }}</div>
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>{{ $t("The following HTML code will be generated when you place the embed script on your site") }}</div>
                  <editor v-model="embedHTML" @init="embedEditorInit" lang="html" :theme="editorTheme" width="100%" height="100" readonly></editor>
                </md-card>
              </div>

              <!-- BUILDER FRAME -->
              <div id="wago-builder-container" class="wago-container" v-if="showPanel=='builder'">
                <div id="wago-builder">
                  <build-mdt v-if="wago.type=='MDT' && wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey" :affixes="wago.mdtAffixes"></build-mdt>
                </div>
              </div>

              <!-- EDITOR FRAME -->
              <div id="wago-editor-container" class="wago-container" v-if="showPanel=='editor'">
                <div id="wago-editor">
                  <edit-weakaura v-if="wago.type.match(/WEAKAURA/) && wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" :unsavedTable="hasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn"></edit-weakaura>
                  <edit-plater v-else-if="wago.type=='PLATER' && wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" :unsavedTable="hasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn"></edit-plater>
                  <edit-snippet v-else-if="wago.type=='SNIPPET' && wago.code" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn"></edit-snippet>
                  <edit-common v-else-if="wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey"></edit-common>
                </div>
              </div>

              <!-- CODE REVIEW FRAME -->
              <div id="wago-codereview-container" class="wago-container" v-if="showPanel=='codereview'">
                <template v-if="codeReview">
                  <h2>{{ $t('Code Review') }}</h2>
                  <p>{{ $t('Wago checks for common but problematic code.') }}</p>
                  <template v-if="codeReview.stabilityChecks && codeReview.stabilityChecks.length">
                    <codereview v-for="(test, k) in codeReview.stabilityChecks" :key="k" :review="test" :link="true" @loadFn="loadEditorFn(test.func)" @setComment="setCodeReviewComment" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>
                  </template>
                  <codereview v-else name="Review">{{ $t('No problems found.') }}</codereview>
                </template>
                <br>
                <template v-if="wago.code.luacheck">
                  <h2>Luacheck</h2>
                  <p>{{ $t('Luacheck detects various issues in lua code and reports warnings and syntax errors.') }}<br>{{ $t('Wago flags some of those warnings as alerts when run within the scope of your custom code and the WoW environment.') }}</p>
                  <codereview v-for="key in luacheckKeys" :key="key" :name="key" :link="true" @loadFn="loadEditorFn(key)" :luacheck="true">{{wago.code.luacheck[key]}}</codereview>
                </template>
              </div>

              <div id="wago-importstring-container" class="wago-container" v-if="wago.code && wago.code.encoded">
                <textarea id="wago-importstring" class="wago-importstring" spellcheck="false">{{ wago.code.encoded }}</textarea>
              </div>

              <search v-if="wago.type === 'COLLECTION'" :contextSearch="'Collection: ' + wago._id"></search>

            </md-layout>
          </md-layout>
        </div>

        <!-- SIDE PANEL COMMENTS -->
        <!--<div id="wago-col-side">
        </div>-->
      </div>
    </div>

    <div id="view-wago" v-if="!wagoExists">
      <md-spinner></md-spinner>
    </div>

    <md-dialog ref="videoplayer" id="video-modal" @close="hideVideo">
      <div class="video-wrapper" v-html="videoEmbedHTML"></div>
    </md-dialog>
  </div>
</template>

<script>
function copyTextToClipboard (text) {
  try {
    var textArea = '<textarea id="copyMe" style="position:fixed;top:0;left:0;width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:white">' + text + '</textarea>'
    document.getElementById('copyContainer').innerHTML = textArea
    document.getElementById('copyMe').select()
    var copied = document.execCommand('copy')
    document.getElementById('copyContainer').innerHTML = ''
    return copied
  }
  catch (err) {
    document.body.removeChild(textArea)
    return false
  }
}

function setupConfigEvents (vue) {
  document.getElementById('pasteURL').onpaste = function (event) {
    // use event.originalEvent.clipboard for newer chrome versions
    var items = (event.clipboardData || event.originalEvent.clipboardData).items
    // find pasted image among pasted items
    var blob = null
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        blob = items[i].getAsFile()
      }
    }
    // load image if there is a pasted image
    if (blob !== null) {
      var reader = new FileReader()
      reader.onload = function (event) {
        vue.http.post('/wago/upload/image/base64', {
          wagoID: vue.wago._id,
          image: event.target.result
        }).then((res) => {
          vue.$set(vue.wago.screens, vue.wago.screens.length, res)
        })
      }
      reader.readAsDataURL(blob)
    }
  }
  document.querySelectorAll('#sorted-screenshots > div').forEach(img => {
    img.setAttribute('draggable', true)
    img.ondrag = (item) => {
      const selectedItem = item.target
      const list = selectedItem.parentNode
      const x = event.clientX
      const y = event.clientY
  
      selectedItem.classList.add('drag-sort-active')
      let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y)
  
      if (list === swapItem.parentNode) {
        swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling
        list.insertBefore(selectedItem, swapItem)
      }
    }
    img.ondragend = (item) => {
      item.target.classList.remove('drag-sort-active')
      vue.saveSortedScreenshots()
    }
  })  
  document.querySelectorAll('#sorted-videos > div').forEach(img => {
    img.setAttribute('draggable', true)
    img.ondrag = (item) => {
      const selectedItem = item.target
      const list = selectedItem.parentNode
      const x = event.clientX
      const y = event.clientY
  
      selectedItem.classList.add('drag-sort-active')
      let swapItem = document.elementFromPoint(x, y) === null ? selectedItem : document.elementFromPoint(x, y)
  
      if (list === swapItem.parentNode) {
        swapItem = swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling
        list.insertBefore(selectedItem, swapItem)
      }
    }
    img.ondragend = (item) => {
      item.target.classList.remove('drag-sort-active')
      vue.saveSortedVideos()
    }
  })
}

import Categories from '../libs/categories'
import Lightbox from 'vue-image-lightbox'
require('vue-image-lightbox/dist/vue-image-lightbox.min.css')
import Multiselect from 'vue-multiselect'
import CategorySelect from '../UI/SelectCategory.vue'
import FormattedText from '../UI/FormattedText.vue'
import ViewComments from '../UI/ViewComments.vue'
import EditCommon from '../UI/EditCommon.vue'
import EditSnippet from '../UI/EditSnippet.vue'
import EditPlater from '../UI/EditPlater.vue'
import EditWeakAura from '../UI/EditWeakAura.vue'
import MDTBuilder from '../UI/MDTBuilder.vue'
import InputSemver from '../UI/Input-Semver.vue'
import ViewDiffs from '../UI/ViewDiffs.vue'
import AddonInfoBox from '../UI/AddonInfoBox.vue'
import Codereview from '../UI/CodeReview.vue'
import Search from '../core/Search.vue'
import semver from 'semver'
import detectCustomCode from '../libs/detectCustomCode'
const openCustomProtocol = require('../libs/customProtocolDetection')

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}
window.enableCompanion = false

export default {
  components: {
    'view-comments': ViewComments,
    'formatted-text': FormattedText,
    Lightbox,
    'edit-common': EditCommon,
    'edit-snippet': EditSnippet,
    'edit-plater': EditPlater,
    'edit-weakaura': EditWeakAura,
    'build-mdt': MDTBuilder,
    'input-semver':InputSemver,
    'view-diffs': ViewDiffs,
    'color-picker': require('vue-color').Chrome,
    'addon-info': AddonInfoBox,
    editor: require('vue2-ace-editor'),
    Multiselect,
    CategorySelect,
    Search,
    Codereview
  },
  created: function () {
    this.fetchWago()
    window.addEventListener('scroll', this.watchScroll)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
    clearTimeout(this.codeQueueTimeout)
  },
  data: function () {
    return {
      videoEmbedHTML: '',
      scanID: '',
      isScanning: false,
      showDescription: true,
      showComments: true,
      hideMobileHeader: true,
      hideTabs: true,
      showPanel: 'description',
      showEditor: (window.innerWidth > 800),
      showConfig: false,
      showVersions: this.$route.params.version,
      showMoreVersions: true,
      showCollections: false,
      showMoreCollections: true,
      showEmbed: false,
      embedStyle: 'dark',
      customizeIframeColor: {},
      iframeColorEdit: '',
      iframeBackground: '#212121',
      iframeMenu: '#333333',
      iframeText1: '#FFFFFF',
      iframeText2: '#B6B6B6',
      version: this.$route.params.version,
      showFloatingHeader: false,
      editName: '',
      updateNameHasStatus: false,
      updateNameStatus: '',
      updateNameError: false,
      editSlug: '',
      updateSlugHasStatus: false,
      updateSlugStatus: '',
      updateSlugError: false,
      editDesc: '',
      updateDescHasStatus: false,
      updateDescStatus: '',
      updateDescError: false,
      updateDescFormat: this.$store.state.user.defaultEditorSyntax,
      editVisibility: 'Public',
      editGame: '',
      showMoreCategories: false,
      editCategories: [],
      invalidCategories: false,
      doNotReloadWago: false,
      pasteURL: '',
      pasteURLStatus: '',
      pasteURLHasStatus: false,
      pasteURLError: false,
      pasteURLUploading: false,
      uploadImages: '',
      uploadFileProgress: [],
      selectedError: 1,
      currentVersionString: '',
      currentVersion: {},
      latestVersion: {},
      modifiedVersionNum: 1,
      modifiedVersion: {},
      modifiedPreviousVersion: {},
      currentBuild: 1,
      newImportString: '',
      newImportStringStatus: '',
      newImportVersion: {major: 1, minor: 0, patch: 1},
      newImportVersionError: '',
      newChangelog: { text: '', format: this.$store.state.user.defaultEditorSyntax },
      viewNotes: -1,
      addCollectionName: '',
      numCategorySets: 1,
      gameMode: '',
      hasUnsavedChanges: false,
      showCompanionHelp: false,
      showCompanionHelpTimer: null,
      enableCompanionBeta: false,
      disableCompanionWarning: false,
      newRestrictionType: 'user',
      newRestrictionValue: '',
      restrictionDebounceTimeout: null,
      viewTranslation: 'en_US',
      viewMyLocalization: 'en_US',
      typeSlug: '',
      cipherKey: '',
      decryptKey: '',
      requireCipherKey: false,
      decryptLoading: false,
      quickLoadEditorFn: null,
      luacheckKeys: [],
      codeReview: {
        warnings: 0,
        errors: 0,
        alerts: 0
      },
      codeQueue: null,
      codeQueueTimeout: null
    }
  },
  watch: {
    '$route': 'fetchWago',
    pasteURL: 'onUpdatePasteURL',
    editVisibility: function (v) {
      // since calling update onchange on the select element seems to call it on display as well, so watch the var instead
      // TODO: refactor this cleaner
      if (this.showPanel === 'config') {
        this.onUpdateVisibility()
      }
    },
    editGame: function (v) {
      if (this.showPanel === 'config') {
        this.onUpdateGame()
      }
    },
    newImportString: function (val) {
      var vue = this

      // if this just a trimmed string
      if (val.length === 100 && (vue.scanID || vue.isScanning)) {
        return
      }
      vue.newImportStringStatus = ''
      vue.scanID = ''
      val = val.trim()

      if (!val) {
        return
      }
      vue.isScanning = true
      this.newImportString = val.substring(0, 100) // reduce browser overhead

      // ignore short strings (probably unintentional keypress)
      if (val.length < 10) {
        vue.newImportStringStatus = vue.$t('Invalid [-type-]', {type: vue.wago.type.toLowerCase()})
        this.importError = true
        return
      }

      // send content to import scan
      vue.newImportStringStatus = 'Verifying'
      vue.http.post('/import/scan', { importString: val, type: vue.wago.type }).then((res) => {
        vue.isScanning = false
        if (res.error) {
          vue.newImportStringStatus = vue.$t('Invalid [-type-]', {type: vue.wago.type.toLowerCase()})
        }
        else {
          vue.newImportStringStatus = vue.$t('Import valid')

          // set scanID after other data is assigned
          vue.scanID = res.scan
        }
      })
    },
    customizeIframeColor: function (val) {
      if (!val || !val.hex || !this.iframeColorEdit) {
        return
      }
      switch (this.iframeColorEdit) {
        case 'background':
          this.iframeBackground = val.hex
          break
        case 'menu':
          this.iframeMenu = val.hex
          break
        case 'text1':
          this.iframeText1 = val.hex
          break
        case 'text2':
          this.iframeText2 = val.hex
          break
      }
      document.getElementById('embed-iframe').contentWindow.setColor(this.iframeColorEdit, val.hex.replace(/#/, ''))
    }
  },
  computed: {
    wago () {
      return this.$store.state.wago
    },
    wagoExists () {
      if (this.$store.state.wago && this.$store.state.wago._id) {
        return true
      }
      return false
    },
    categories () {
      var arr = Categories.categories(this.$t)
      var cats = []
      arr.forEach((cat) => {
        if (cat[this.wago.type] && !cat.noselect) {
          cats.push(cat)
        }
      })
      return cats
    },
    User () {
      return this.$store.state.user
    },
    initShowEditor () {
      return (window.innerWidth > 800) // init state for toggle button
    },
    initShowVersions () {
      return this.$route.params.version
    },
    hasUnreadComments () {
      if (!this.User || !this.User.unreadMentions || this.User.unreadMentions.length === 0 || !this.wago) {
        return false
      }
      for (var i = 0; i < this.User.unreadMentions.length; i++) {
        if (this.User.unreadMentions[i].wagoID === this.wago._id) {
          return true
        }
      }
      return false
    },
    embedHTML () {
      if (this.embedStyle === 'none') {
        return `<span id="wago-${this.wago._id}" class="wagoEmbed">
  <button class="wagoCopyButton">
    <small class="clickToCopyWago">Click to copy import string from wago.io</small>
    <div class="wagoName">${this.wago.name}</div>
  </button>
</span>`
      }
      else {
        var embedTheme = {}
        if (this.embedStyle === 'light') {
          embedTheme = {buttonBG: '#FFF', buttonHover: '#F4F4F4', textColor: 'rgba(0,0,0,.87)', logo: 'https://media.wago.io/logo/57x57.png'}
        }
        else {
          embedTheme = {buttonBG: '#000', buttonHover: '#040404', textColor: 'rgba(255,255,255,.87)', logo: 'https://media.wago.io/logo/57x57.png'}
        }
        return `<span id="wago-${this.wago._id}" class="wagoEmbed">
  <a href="https://wago.io/${this.wago.slug}">
    <img src="${embedTheme.logo}">'
  </a>
  <button class="wagoCopyButton">
    <small class="clickToCopyWago">Click to copy import string from wago.io</small>
    <div class="wagoName">${this.wago.name}</div>
  </button>
</span>
<style>
#wago-${this.wago._id} a {display: inline; padding: 0 2px; margin: 0; border:0}
#wago-${this.wago._id} img {display: inline; padding: 0; margin: 0; border: 0; height: 50px}
#wago-${this.wago._id} button {display: inline; padding: 4px 16px; min-width: 130px; cursor: pointer; background-color: ${embedTheme.buttonBG}; color: ${embedTheme.textColor}; border: 0; text-align: center; vertical-align: top; border-radius: 6px}
#wago-${this.wago._id} button:hover {background-color:${embedTheme.buttonHover}}
#wago-${this.wago._id} .clickToCopy {display: block; padding: 0; margin: 0; font-size: 10px}
#wago-${this.wago._id} .wagoName {display: block; padding: 0; margin: 4px 0; font-weight: bold; font-size: 13px}
</style>`
      }
    },
    iframeQueryString: function () {
      var params = []
      if (this.iframeBackground && this.iframeBackground !== '#212121') {
        params.push(`background=${this.iframeBackground}`)
      }
      if (this.iframeMenu && this.iframeMenu !== '#333333') {
        params.push(`menu=${this.iframeMenu}`)
      }
      if (this.iframeText1 && this.iframeText1 !== '#FFFFFF') {
        params.push(`text1=${this.iframeText1}`)
      }
      if (this.iframeText2 && this.iframeText2 !== '#B6B6B6') {
        params.push(`text2=${this.iframeText2}`)
      }
      if (!params.length) {
        return ''
      }
      return '?' + params.join('&').replace(/#/g, '')
    },
    editorTheme: function () {
      if (!this.$store.state.user || !this.$store.state.user.config || !this.$store.state.user.config.editor) {
        return 'tomorrow'
      }
      else {
        return this.$store.state.user.config.editor || 'tomorrow'
      }
    },
    listVersions: function () {
      var arr = []
      this.wago.versions.versions.forEach((v) => {
        arr.push(semver.valid(semver.coerce(v.versionString)))
      })
      return arr
    },
    hasCodeDiffs: function () {
      if (!this.wago.versions || this.wago.versions.total <= 1) {
        return false
      }
      if (this.wago.type.match(/WEAKAURA/) || this.wago.type === 'SNIPPET') {
        return true
      }
      if (this.wago.type === 'PLATER') {
        for (let i = 0; i < this.wago.categories.length; i++) {
          if (this.wago.categories[i].id === 'plater2' || this.wago.categories[i].id === 'plater3') {
            return true
          }
        }
      }
      return false
    }
  },
  methods: {
    checkCompanionBeta () {
      this.enableCompanionBeta = window.enableCompanion
      if (!this.enableCompanionBeta) {
        setTimeout(() => {
          this.checkCompanionBeta()
        }, 500)
      }
    },
    fetchWago () {
      this.checkCompanionBeta()
      if (this.doNotReloadWago) {
        return false
      }
      var vue = this
      var wagoID = this.$route.params.wagoID
      this.$store.commit('setWago', {})

      // reset sections
      this.showPanel = 'description'
      this.showEditor = (window.innerWidth > 800)
      this.showConfig = false
      this.showVersions = this.$route.params.version
      this.showMoreVersions = true
      this.showCollections = false
      this.showMoreCollections = true
      this.showEmbed = false
      this.newImportString = ''
      this.newImportStringStatus = ''
      this.numCategorySets = 1
      this.showMoreCategories = false
      this._iframeQueryString = this.iframeQueryString

      var params = {}
      params.id = wagoID
      this.version = this.$route.params.version
      if (this.version) {
        params.version = this.version
      }

      vue.http.get('/lookup/wago', params).then((res) => {
        if (res.error) {
          this.$store.commit('setWago', res)
          return
        }
        res.categories = res.categories.map((cat) => {
          return Categories.match(cat, vue.$t)
        })

        if (res.versions && res.versions.total > 0 && res.versions.versions[0].versionString) {
          this.latestVersion.semver = semver.valid(semver.coerce(res.versions.versions[0].versionString || '1.0.0'))
          if (!this.latestVersion.semver) {
            this.latestVersion.semver = '1.0.0'
          }
          this.latestVersion.major = semver.major(this.latestVersion.semver)
          this.latestVersion.minor = semver.minor(this.latestVersion.semver)
          this.latestVersion.patch = semver.patch(this.latestVersion.semver)

          this.generateNextVersionData()
        }

        if (res.versions && res.versions.total > 10) {
          vue.showMoreVersions = true
        }
        else {
          vue.showMoreVersions = false
        }

        if (res.collectionCount > 10) {
          vue.showMoreCollections = true
        }
        else {
          vue.showMoreCollections = false
        }

        vue.$store.commit('setWago', res)
        if (!params.version) {
          params.version = this.latestVersion.semver
        }
        if (res.visibility.encrypted) {
          this.requireCipherKey = true
        }
        if (res.codeURL) {
          this.getCode(res.codeURL)
        }
        // initial config
        this.editName = res.name
        this.editSlug = res.slug
        this.editDesc = res.description.text
        this.updateDescFormat = res.description.format || this.$store.state.user.defaultEditorSyntax

        switch (this.wago.type) {
          case 'COLLECTION':
            this.showPanel = 'description'
            this.typeSlug = 'collections/'
            break
          case 'MDT':
            this.showPanel = 'builder'
            this.typeSlug = 'mdt/'
            this.wago.mdtAffixes = []
            for (let cat of res.categories) {
              if (cat.id && cat.id.match(/^mdtaffix\d+$/)) {
                this.wago.mdtAffixes.push(cat.id)
              }
            }
            break
          case 'OPIE':
            this.showPanel = this.wago.description.text ? 'description' : 'editor'
            this.typeSlug = 'opie/'
            break
          case 'PLATER':
            this.showPanel = this.wago.description.text ? 'description' : 'editor'
            this.typeSlug = 'plater/'
            break
          case 'SNIPPET':
            this.showPanel = 'editor'
            this.typeSlug = 'snippets/'
            break
          case 'TOTALRP3':
            this.showPanel = 'description'
            this.typeSlug = 'totalrp/'
            break
          case 'WEAKAURA':
            this.showPanel = this.wago.description.text ? 'description' : 'editor'
            this.typeSlug = 'weakauras/'
            break
          case 'CLASSIC-WEAKAURA':
            this.showPanel = this.wago.description.text ? 'description' : 'editor'
            this.typeSlug = 'classic-weakauras/'
            break
          default:
            this.showPanel = 'description'
            this.typeSlug = this.wago.type.toLowerCase() + '/'
            break
        }

        vue.doNotReloadWago = true
        window.preventScroll = true
        setTimeout(function () {
          vue.doNotReloadWago = false
          window.preventScroll = undefined
        }, 600)

        if (res.visibility.hidden) {
          this.editVisibility = 'Hidden'
        }
        else if (res.visibility.private) {
          this.editVisibility = 'Private'
        }
        else if (res.visibility.encrypted) {
          this.editVisibility = 'Encrypted'
        }
        else if (res.visibility.restricted) {
          this.editVisibility = 'Restricted'
        }
        else {
          this.editVisibility = 'Public'
        }
        this.editGame = res.game
        this.editCategories = Categories.groupSets(res.categories)
        this.numCategorySets = this.editCategories.length

        for (var i = 0; i < res.categories.length; i++) {
          if (res.categories[i].id === 'beta-bfa') {
            this.gameMode = 'beta-bfa'
            break
          }
        }

        vue.$store.commit('setPageInfo', {
          title: res.name,
          description: res.description.text,
          image: res.screens && res.screens[0] && res.screens[0].src || false,
          unlisted: (res.visibility.hidden || res.visibility.private || res.visibility.restricted)
        })
      })
    },
    getCode (url, update = 0) {
      var getCode
      if (update && this.wago.code.Q) {
        getCode = this.http.get(url + '&qupdate=' + this.wago.code.Q)
      }
      else {
        getCode = this.http.get(url)
      }
      getCode.then((code) => {
        if (this.requireCipherKey) {
          this.encryptedData = code
        }
        else {
          if (!this.wago.code || !code.Q) {
            this.parseCodeObject(code)
          }
          if (code.Q) {
            if (code.position) {
              this.codeQueue = code.position
            }
            var vue = this
            this.codeQueueTimeout = setTimeout(function () {
              vue.getCode(url, update + 1)
            }, Math.min(5, update + 1) * 800)
          }
        }
      })
    },
    parseCodeObject (code) {
      if (code && code.json) {
        code.obj = JSON.parse(code.json)
        code.json = JSON.stringify(code.obj, null, 2)
      }

      if (!code.Q) {
        this.codeQueue = null
      }
      this.codeReview.errors = 0
      this.codeReview.warnings = 0
      this.codeReview.alerts = 0
      this.codeReview.stabilityChecks = []
      const blockedRegex = /getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro|GuildDisband|GuildUninvite|UninviteUnit|SendMailMailButton|SendMailMoneyGold|MailFrameTab2/g
      if (code && code.luacheck && code.luacheck !== '{}') {
        code.luacheck = JSON.parse(code.luacheck)
        this.luacheckKeys = Object.keys(code.luacheck)
        this.luacheckKeys.sort()
        for (let lc of this.luacheckKeys) {
          let c = code.luacheck[lc].match(/^(\d+) error/)
          if (c && c[1]) {
            this.codeReview.errors += parseInt(c[1])
          }
          c = code.luacheck[lc].match(/^(\d+) warning/)
          if (c && c[1]) {
            this.codeReview.warnings += parseInt(c[1])
          }
          c = code.luacheck[lc].match(/\((E\d+|W111|W121)\)/g)
          if (c && c.length) {
            this.codeReview.alerts += c.length
          }
          let blocked = code.luacheck[lc].match(blockedRegex)
          if (blocked) {
            this.codeReview.securityAlert = true
            blocked = [...new Set(blocked)]
            this.codeReview.alerts += blocked.length
            this.codeReview.stabilityChecks.push({id: 'blockedFn', name: lc, display: this.$t('\'[-name-]\' includes blocked functions. Blocked functions are normally blocked within the addon with normal use, and there is probably no reason you want to include this potential vulnerability.', {name: lc}) + '\n\n0:' + blocked.join('\n0:'), func: lc})
          }
        }
      }
      else {
        code.luacheck = null
      }
      this.$set(this.wago, 'code', code)
      this.$store.commit('setWago', this.wago)

      if (this.wago.type === 'ERROR' && this.wago.code.text) {
        this.$set(this.wago, 'errorReport', [{format: 'error', text: this.wago.code.text.trim() + '\n'}])
      }
      else if (this.wago.type === 'ERROR' && this.wago.code.obj) {
        var errs = []
        code.obj.forEach(e => {
          errs.push({format: 'error', text: `${e.message}\nTime:${e.time}\nCount: ${e.counter}\nStack: ${e.stack}\n\nLocals: ${e.locals || '<none>'}\n`})
        })
        errs = errs.reverse()
        this.$set(this.wago, 'errorReport', errs)
      }
      // code review
      else if (this.wago.type.match(/WEAKAURA/)) {
        var customCode = detectCustomCode.WeakAura(code.obj)
        var auras = []
        if (code.obj.d) {
          auras = [code.obj.d]
        }
        if (code.obj.c && Array.isArray(code.obj.c)) {
          auras = auras.concat(code.obj.c)
        }
        for (let item of auras) {
          if (item.id.length > 127) {
            this.codeReview.alerts++
            this.codeReview.stabilityChecks.push({id: 'longID', name: item.id, display: this.$t('\'[-name-]\' id length is needlessly long.', {name: item.id}) + '(0):' + this.$t('This is the name used in the WeakAura interface and may cause an overflow error and crash the game.'), func: 'tabledata'})
          }
        }
        var detectedThrottles = {}
        for (let item of customCode) {
          if (typeof item !== 'object') {
            continue
          }
          if (item.displayEveryFrame) {
            let lua = item.lua
            // remove comments and function params
            lua = lua.replace(/--.*?$/g, '').replace(/^[^]*?\)/m, '').trim()
            let result
            let ok
            if (lua.match(/(time|GetTime)\(\)/)) {
              result = this.$t('Timing or throttling code is detected.')
              ok = 1
            }
            else if (lua.indexOf('return') === 0) {
              result = this.$t('Immediate value return detected.')
              ok = 1
            }
            else {
              result = this.$t('Displays that update every frame can potentially cause slowdown are almost always go against best practices. Every frame updates should be for a) time related displays or b) throttled so that the processing occurs on an interval. Neither are detected here.')
              ok = 0
            }
            if (!ok && (!this.wago.codeReviewComments || !this.wago.codeReviewComments[`textEveryFrameDisplay:${item.id}`] || !this.wago.codeReviewComments[`textEveryFrameDisplay:${item.id}`].falsePositive)) {
              this.codeReview.alerts++
            }
            this.codeReview.stabilityChecks.push({id: 'textEveryFrameDisplay', name: item.id, display: this.$t('\'[-name-]\' updates its display text every frame.', {name: `${item.id} ${item.name}`}) + `(${ok}):${result}`, func: `${item.id}: ${item.name}`})
          }
          else if (item.triggerEveryFrame) {
            let lua = item.lua
            // remove comments and function params
            lua = lua.replace(/--.*?$/g, '').replace(/^[^]*?\)/m, '').trim()
            let result
            let ok
            let trigger = item.name.match(/(\(\d+\))/)
            console.log(trigger, item.id, detectedThrottles)
            if (lua.match(/(time|GetTime)\(\)/)) {
              result = this.$t('Timing or throttling code is detected.')
              ok = 1
              trigger = item.name.match(/^Trigger (\(\d+\))/)
              if (trigger && trigger[1]) {
                detectedThrottles[item.id + trigger[1]] = true
              }
            }
            else if (trigger && trigger[1] && detectedThrottles[item.id + trigger[1]]) {
              result = this.$t('Timing or throttling code is detected in trigger.')
              ok = 1
            }
            else {
              result = this.$t('Triggers that check on every frame should be throttled so that the processing occurs on an interval. No throttle could be detected here.')
              ok = 0
            }
            if (!ok && (!this.wago.codeReviewComments || !this.wago.codeReviewComments[`textEveryFrameTrigger:${item.id}`] || !this.wago.codeReviewComments[`textEveryFrameTrigger:${item.id}`].falsePositive)) {
              this.codeReview.alerts++
            }
            this.codeReview.stabilityChecks.push({id: 'textEveryFrameTrigger', name: item.id, display: this.$t('\'[-name-]\' is processed every frame.', {name: `${item.id} ${item.name}`}) + `(${ok}):${result}`, func: `${item.id}: ${item.name}`})
          }
        }
      }

      this.$set(this.wago, 'codeReview', this.codeReview)

      if (code && code.versionString) {
        this.currentVersionString = code.versionString
        this.currentVersion.semver = semver.valid(semver.coerce(this.currentVersionString || '1.0.0'))
        if (!this.currentVersion.semver) {
          this.currentVersion.semver = '1.0.0'
        }
        this.currentVersion.major = semver.major(this.currentVersion.semver)
        this.currentVersion.minor = semver.minor(this.currentVersion.semver)
        this.currentVersion.patch = semver.patch(this.currentVersion.semver)

        this.leftDiff = this.latestVersion.semver
        if (this.leftDiff !== this.currentVersion.semver) {
          this.rightDiff = this.currentVersion.semver
        }
        else if (this.wago.versions.versions[1]) {
          this.rightDiff = semver.valid(semver.coerce(this.wago.versions.versions[1].versionString))
        }
      }

      // make sure we're using custom url
      if (this.isLatestVersion()) {
        this.$router.replace('/' + this.wago.slug)
      }
      else {
        this.$router.replace('/' + this.wago.slug + '/' + this.version)
      }

      this.requireCipherKey = false

      this.$nextTick(function () {
        this.hasUnsavedChanges = false
      })
    },
    decryptImport () {
      try {
        this.decryptLoading = true
        var code = {}
        code.encoded = this.$CryptoJS.AES.decrypt(this.encryptedData.encoded, this.cipherKey).toString(this.CryptoJS.enc.Utf8)
        code.json = this.$CryptoJS.AES.decrypt(this.encryptedData.json, this.cipherKey).toString(this.CryptoJS.enc.Utf8)
        code.text = this.$CryptoJS.AES.decrypt(this.encryptedData.text, this.cipherKey).toString(this.CryptoJS.enc.Utf8)
        code.lua = this.$CryptoJS.AES.decrypt(this.encryptedData.lua, this.cipherKey).toString(this.CryptoJS.enc.Utf8)
        this.parseCodeObject(code)
        this.decryptKey = this.cipherKey
      }
      catch (e) {
        window.eventHub.$emit('showSnackBar', this.$t('Incorrect password - Could not decrypt'))
      }
      this.decryptLoading = false
    },
    removeCipherKey () {
      var vue = this
      this.http.post('/wago/update/encryption', {
        wagoID: vue.wago._id,
        decrypt: this.decryptKey,
        visibility: this.editVisibility
      }).then((res) => {
        if (res.success) {
          vue.decryptKey = ''
        }
      })
    },
    saveCipherKey () {
      var vue = this
      this.http.post('/wago/update/encryption', {
        wagoID: vue.wago._id,
        decrypt: this.decryptKey,
        cipherKey: this.cipherKey
      }).then((res) => {
        if (res.success) {
          vue.decryptKey = this.cipherKey
        }
      })
    },
    openHelpDialog () {
      this.$refs['helpDialog'].open()
    },
    setGameMode (mode) {
      var vue = this
      this.gameMode = mode
      this.http.post('/wago/update/gameMode', {
        wagoID: vue.wago._id,
        mode: mode
      })
    },
    setHasUnsavedChanges (bool) {
      if (typeof bool === 'boolean') {
        this.hasUnsavedChanges = bool
      }
    },
    updateEncoded (str) {
      if (str) {
        this.$set(this.wago.code, 'encoded', str)
      }
    },
    focusFieldByRef (ref) {
      setTimeout(() => {
        this.$refs[ref].$el.focus()
      }, 150)
    },
    listIncludedAuras () {
      var tbl = JSON.parse(this.wago.code.json)
      let list = [{name: tbl.d.id, type: this.$t('auratype.' + tbl.d.regionType)}]
      if (tbl.c) {
        for (var k in tbl.c) {
          var caura = tbl.c[k]
          if (caura.id && caura.regionType) {
            list.push({name: caura.id, type: this.$t('auratype.' + caura.regionType)})
          }
        }
      }
      return list
    },
    sendToCompanionApp (checkWarning) {
      if (this.disableCompanionWarning) {
        if (this.$store.state.user.UID) {
          this.$set(this.$store.state.user, 'companionHideAlert', true)
          this.http.post('/account/disableCompanionAlert')
        }
        else {
          window.setCookie('disableCompanionAlert', 1, 30)
        }
      }
      if (checkWarning && !this.disableCompanionWarning && !this.$store.state.user.companionHideAlert && !window.readCookie('disableCompanionAlert')) {
        this.$refs.sendToCompanionAppDialog.open()
        return
      }
      openCustomProtocol(`weakauras-companion://wago/push/${this.wago.slug}`,
        () => {
          // fail
          this.$router.push('/wa-companion')
          window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WeakAura Companion app, please make sure you have it installed and running'))
        },
        () => {
          // success
          window.eventHub.$emit('showSnackBar', this.$t('WeakAura sent to Companion'))
        },
        () => {
          // unsupported
          this.$router.push('/wa-companion')
          window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WeakAura Companion app, please make sure you have it installed and running'))
        }
      )
    },
    setCompanionHelpShow (enable, time) {
      clearTimeout(this.showCompanionHelpTimer)
      if (time) {
        var vue = this
        this.showCompanionHelpTimer = setTimeout(() => {
          vue.showCompanionHelp = enable
        }, time)
      }
      else {
        this.showCompanionHelp = enable
      }
    },
    copyEncoded () {
      try {
        document.getElementById('wago-importstring').select()
        var copied = document.execCommand('copy')
        if (copied) {
          window.eventHub.$emit('showSnackBar', this.$t('Import string copied'))
        }
        else {
          window.eventHub.$emit('showSnackBar', this.$t('Import string failed to copy please upgrade to a modern browser'))
        }
      }
      catch (e) {
        console.error(e.message)
        window.eventHub.$emit('showSnackBar', this.$t('Import string failed to copy please upgrade to a modern browser'))
      }
    },
    copyURL () {
      if (copyTextToClipboard(this.$store.state.wago.url, this)) {
        window.eventHub.$emit('showSnackBar', this.$t('URL copied'))
      }
      else {
        window.eventHub.$emit('showSnackBar', this.$t('URL failed to copy please upgrade to a modern browser'))
      }
    },
    copyEmbed () {
      var stopEscaping = '<'
      if (copyTextToClipboard(stopEscaping + 'script src="https://wago.io/' + this.wago._id + '/embed.js?style=' + this.embedStyle + '">' + stopEscaping + '/script>', this)) {
        window.eventHub.$emit('showSnackBar', this.$t('Embed script copied'))
      }
      else {
        window.eventHub.$emit('showSnackBar', this.$t('Embed script failed to copy please upgrade to a modern browser'))
      }
    },
    copyIframe () {
      var stopEscaping = '<'
      if (copyTextToClipboard(stopEscaping + 'iframe src=&quot;https://wago.io/' + this.wago._id + '/embed.html' + this.iframeQueryString + '&quot; style=&quot;width: 100%; height: 795px;&quot;>' + stopEscaping + '/iframe>', this)) {
        window.eventHub.$emit('showSnackBar', this.$t('Iframe script copied'))
      }
      else {
        window.eventHub.$emit('showSnackBar', this.$t('Iframe script failed to copy please upgrade to a modern browser'))
      }
    },
    resetIframe () {
      this.iframeColorEdit = null
      this.iframeBackground = '#212121'
      this.iframeMenu = '#333333'
      this.iframeText1 = '#FFFFFF'
      this.iframeText2 = '#B6B6B6'
      var frame = document.getElementById('embed-iframe')
      frame.contentWindow.setColor('background', this.iframeBackground.replace(/#/, ''))
      frame.contentWindow.setColor('menu', this.iframeMenu.replace(/#/, ''))
      frame.contentWindow.setColor('text1', this.iframeText1.replace(/#/, ''))
      frame.contentWindow.setColor('text2', this.iframeText2.replace(/#/, ''))
    },
    setCustomizeIframeColor (item) {
      this.iframeColorEdit = item
      switch (item) {
        case 'background':
          this.customizeIframeColor = this.iframeBackground
          return
        case 'menu':
          this.customizeIframeColor = this.iframeMenu
          return
        case 'text1':
          this.customizeIframeColor = this.iframeText1
          return
        case 'text2':
          this.customizeIframeColor = this.iframeText2
          return
      }
    },
    toggleMobileHeader () {
      this.hideMobileHeader = !this.hideMobileHeader
    },
    toggleTabs () {
      this.hideTabs = !this.hideTabs
    },
    viewAllCategories () {
      this.showMoreCategories = true
    },
    toggleFavorite () {
      var params = {}
      params.wagoID = this.wago._id
      params.addStar = !(this.wago.myfave)

      var vue = this
      this.http.post('/wago/star', params).then(function (res) {
        vue.$set(vue.wago, 'myfave', params.addStar)
        vue.$set(vue.wago, 'favoriteCount', res.count)
      })
    },
    showVideo (embedHTML) {
      // hack to fix broken youtube embeds
      if (embedHTML.indexOf('&') >= 0 && embedHTML.indexOf('?') < 0) {
        embedHTML = embedHTML.replace(/&/, '?')
      }
      this.videoEmbedHTML = embedHTML
      this.$refs['videoplayer'].open()
    },
    hideVideo () {
      this.videoEmbedHTML = ''
    },
    toggleFrame (frame) {
      this.showPanel = frame
      this.hideTabs = true
      if (frame === 'config') {
        this.$nextTick(function () {
          setupConfigEvents(this)
        })
      }
    },
    toTop () {
      this.$scrollTo('#app')
    },
    watchScroll () {
      var top = document.getElementById('topbar')
      if (top) {
        var rect = top.getBoundingClientRect()
        this.showFloatingHeader = !!(rect.bottom < 0)
      }
    },
    loadEditorFn (fn) {
      this.quickLoadEditorFn = fn
      this.toggleFrame('editor')
      window.scrollTo(0, 0)
      setTimeout(() => {
        this.quickLoadEditorFn = false
      }, 1000)
    },
    setCodeReviewComment (id, text, flag) {
      let comment = {
        author: this.wago.user,
        date: Date.now(),
        falsePositive: flag,
        format: 'bbcode',
        text: text
      }
      this.$set(this.wago.codeReviewComments, id, comment)
    },
    toggleViewNotes (v) {
      if (this.viewNotes === v) {
        this.viewNotes = -1
      }
      else {
        this.viewNotes = v
      }
    },
    selectVersion (v) {
      if (v && v[0] && v[0].versionString) {
        return '/' + this.$store.state.wago.slug + '/' + v[0].versionString.replace(/-.*/, '')
      }
      else if (v && v[0] && v[0].version) {
        return '/' + this.$store.state.wago.slug + '/' + v[0].version
      }
      else {
        return '/' + this.$store.state.wago.slug
      }
    },
    isLatestVersion () {
      if (!this.$route.params.version || !this.wago.versions || this.wago.versions.total <= 1) {
        return true
      }
      return (this.currentVersionString && this.currentVersionString.replace(/-.*/, '') === this.latestVersion.semver)
    },
    loadMoreVersions () {
      this.http.get('/lookup/wago/versions', {id: this.wago._id}).then((res) => {
        var v = this.wago.versions.versions.concat(res)
        this.$set(this.wago.versions, 'versions', v)
        this.showMoreVersions = false
      })
    },
    loadMoreCollections () {
      this.http.get('/lookup/wago/collections', {id: this.wago._id}).then((res) => {
        var c = this.wago.collections.concat(res)
        this.$set(this.wago, 'collections', c)
        this.showMoreCollections = false
      })
    },
    embedEditorInit (editor) {
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
    embedCopy (e, o) {
      var t = document.querySelector('.clickToCopyWago')
      var n = document.createElement('textarea')
      n.style.cssText = 'position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:0;outline:none;boxShadow:none;background:transparent'
      n.value = o
      document.body.appendChild(n)
      n.select()
      try {
        document.execCommand('copy')
        document.body.removeChild(n)
        var label = t.textContent
        t.textContent = 'Copied!'
        setTimeout(function () {
          t.textContent = label
        }, 3e3)
      }
      catch (d) {
        return document.body.removeChild(n)
      }
    },

    selectError (k) {
      this.doNotReloadWago = true
      window.preventScroll = true
      this.selectedError = k + 1
      if (k) {
        this.$router.replace('/' + this.editSlug + '#' + this.selectedError)
      }
      else {
        this.$router.replace('/' + this.editSlug)
      }
      var vue = this
      setTimeout(function () {
        vue.doNotReloadWago = false
        window.preventScroll = undefined
      }, 600)
    },

    onUpdateName () {
      this.$nextTick(function () {
        this.updateNameHasStatus = true
        if (this.editName.length > 0) {
          this.updateNameError = false
          this.updateNameStatus = this.$t('Saving')
          var vue = this
          this.http.post('/wago/update/name', {
            wagoID: vue.wago._id,
            name: this.editName.trim()
          }).then((res) => {
            if (res.success) {
              vue.updateNameStatus = vue.$t('Saved')
              vue.$set(vue.wago, 'name', vue.editName)
              vue.$store.commit('setPageInfo', {
                title: vue.editName
              })
              setTimeout(function () {
                vue.updateNameHasStatus = false
              }, 600)
            }
            else {
              this.updateNameStatus = this.$t('Error could not save')
              this.updateNameError = true
            }
          })
        }
        else {
          this.updateNameStatus = this.$t('Error invalid name')
          this.updateNameError = true
        }
      })
    },

    onUpdateSlug () {
      this.$nextTick(function () {
        this.updateSlugHasStatus = true
        if (this.editSlug === '') {
          this.editSlug = this.wago._id
        }
        // %#/\\<> and white space are invalid characters. String must be 7 letters long or include unicode.
        if (this.editSlug.match(/[\s%#/\\<>]/) || (this.editSlug.length < 7 && !this.editSlug.match(/[^\u0000-\u007F]/))) {
          this.updateSlugStatus = this.$t('Custom URLs can not contain the following characters %#/\\<> or spaces and be at 7 characters long')
          this.updateSlugError = true
          return false
        }

        this.updateSlugError = false
        this.updateSlugStatus = this.$t('Saving')
        var vue = this
        this.http.post('/wago/update/slug', {
          wagoID: vue.wago._id,
          slug: this.editSlug.trim()
        }).then((res) => {
          if (res.success) {
            vue.updateSlugStatus = vue.$t('Saved')
            vue.$set(vue.wago, 'slug', this.editSlug)
            vue.$set(vue.wago, 'url', 'https://wago.io/' + this.editSlug)
            // prevent page load from resetting the view and scrolling to the top
            vue.doNotReloadWago = true
            window.preventScroll = true
            // update url
            vue.$router.replace('/' + this.editSlug)
            setTimeout(function () {
              vue.updateSlugHasStatus = false
              // allow page loads to reset view, once again
              vue.doNotReloadWago = false
              window.preventScroll = undefined
            }, 600)
          }
          else if (res.exists) {
            vue.updateSlugStatus = vue.$t('Error this URL is already in use')
            this.updateSlugError = true
          }
          else {
            this.updateSlugStatus = this.$t('Error could not save')
            this.updateSlugError = true
          }
        }).catch((e) => {
          this.updateSlugStatus = this.$t('Error could not save')
          this.updateSlugError = true
        })
      })
    },

    onUpdateDescription () {
      this.$nextTick(function () {
        this.updateDescHasStatus = true
        this.updateDescError = false
        this.updateDescStatus = this.$t('Saving')
        var vue = this
        this.http.post('/wago/update/desc', {
          wagoID: vue.wago._id,
          desc: this.editDesc.trim(),
          format: this.updateDescFormat
        }).then((res) => {
          if (res.success) {
            vue.updateDescStatus = vue.$t('Saved')
            vue.$set(vue.wago.description, 'text', vue.editDesc)
            vue.$store.commit('setPageInfo', {
              description: vue.editDesc
            })
            setTimeout(function () {
              vue.updateDescHasStatus = false
            }, 600)
          }
          else {
            this.updateDescStatus = this.$t('Error could not save')
            this.updateDescError = true
          }
        })
      })
    },

    onUpdateVisibility () {
      var vue = this
      if (this.editVisibility === 'Encrypted' || this.decryptKey) {
        return
      }
      this.http.post('/wago/update/visibility', {
        wagoID: vue.wago._id,
        visibility: this.editVisibility
      }).then((res) => {
        vue.wago.visibility.private = res.private
        vue.wago.visibility.hidden = res.hidden
        vue.wago.visibility.restricted = res.restricted
      }).catch((err) => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
      })
    },

    onUpdateGame () {
      var vue = this
      this.http.post('/wago/update/game', {
        wagoID: vue.wago._id,
        game: this.editGame
      }).then((res) => {
      }).catch((err) => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
      })
    },

    onUpdateCategories () {
      var cats = flatten(this.editCategories)
      var catIDs = cats.map((item) => {
        return item.id
      })

      this.updateCatHasStatus = true
      this.updateCatError = false
      this.updateCatStatus = this.$t('Saving')
      this.$set(this.wago, 'categories', cats)
      this.http.post('/wago/update/categories', {
        wagoID: this.wago._id,
        cats: catIDs.join(',')
      }).then((res) => {
        if (res.success) {
          this.updateCatStatus = this.$t('Saved')
          setTimeout(function () {
            this.updateDescHasStatus = false
          }, 600)
        }
        else {
          this.updateCatStatus = this.$t('Error could not save')
          this.updateCatError = true
        }
      })
    },

    onUploadFile (files) {
      var vue = this
      /* eslint-disable no-cond-assign */
      for (var i = 0, file; file = files[i]; i++) {
        vue.uploadFileProgress.push(0)
        var uploadIndex = vue.uploadFileProgress.length - 1

        vue.http.upload('/wago/upload/image/base64', file, {wagoID: vue.wago._id})
          .then((res) => {
            vue.uploadFileProgress[uploadIndex] = 100
            vue.$set(vue.wago.screens, vue.wago.screens.length, res)
          })
          .catch((err) => {
            console.error('Error uploading image', err)
          })
      }
      this.uploadImages = ''
    },

    onUpdatePasteURL () {
      this.pasteURL = this.pasteURL.trim().replace(/\s/g, '%20')
      if (this.pasteURL === '') {
        this.pasteURLHasStatus = false
        this.pasteURLError = false
        this.pasteURLUploading = false
        return
      }
      // validate URL
      if (!this.pasteURL.match(/^https?:\/\/[\w.-]+(?:\.[\w.-]+)/i)) {
        this.pasteURLError = true
        this.pasteURLStatus = this.$t('Input is not a valid URL')
        this.pasteURLUploading = false
        return
      }
      var vue = this
      // valid URL, send to server
      this.pasteURLHasStatus = true
      this.pasteURLStatus = this.$t('Processing')
      this.pasteURLUploading = true
      vue.http.post('/wago/upload/image/url', {
        wagoID: vue.wago._id,
        url: this.pasteURL
      }).then((res) => {
        if (res.error) {
          vue.pasteURLError = true
          vue.pasteURLStatus = vue.$t(res.error)
          vue.pasteURLUploading = false
          return
        }
        if (res.type === 'screenshot') {
          vue.$set(vue.wago.screens, vue.wago.screens.length, res)
        }
        else if (res.type === 'video') {
          vue.$set(vue.wago.videos, vue.wago.videos.length, res)
        }
        vue.pasteURLStatus = vue.$t('Saved')
        vue.pasteURLUploading = false
        vue.pasteURL = ''
        setTimeout(function () {
          vue.pasteURLHasStatus = false
        }, 600)
      })
    },

    onScreenMoveOut (index) {
      this.wago.screens.splice(index, 1)
    },

    saveSortedScreenshots () {
      var sort = []
      var screens = []
      document.querySelectorAll('#sorted-screenshots > div').forEach(img => {
        const id = img.id.replace(/^screenshot-/, '')
        sort.push(id)
        this.wago.screens.forEach(screen => {
          if (screen._id === id) {
            screens.push(screen)
          }
        })
      })
      this.$set(this.wago, 'screens', screens)
      
      this.http.post('/wago/update/sort/screenshots', {
        wagoID: this.wago._id,
        screens: sort.join(',')
      }).then(res => {
        // success, render is already up to date.
      }).catch(err => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', this.$t('Error could not save'))
      })
    },

    onScreenDelete (index) {
      this.http.post('/wago/update/delete/screenshot', {
        wagoID: this.wago._id,
        screen: this.wago.screens[index]._id
      })
      this.wago.screens.splice(index, 1)
    },

    onVideoMoveOut (index) {
      this.wago.videos.splice(index, 1)
    },

    saveSortedVideos () {
      var sort = []
      var videos = []
      document.querySelectorAll('#sorted-videos > div').forEach(img => {
        const id = img.id.replace(/^video-/, '')
        sort.push(id)
        this.wago.videos.forEach(video => {
          if (video._id === id) {
            videos.push(video)
          }
        })
      })
      this.$set(this.wago, 'videos', videos)
      
      this.http.post('/wago/update/sort/videos', {
        wagoID: this.wago._id,
        videos: sort.join(',')
      }).then(res => {
        // success, render is already up to date.
      }).catch(err => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', this.$t('Error could not save'))
      })
    },

    onVideoDelete (index) {
      this.http.post('/wago/update/delete/video', {
        wagoID: this.wago._id,
        video: this.wago.videos[index]._id
      })
      this.wago.videos.splice(index, 1)
    },

    onDeleteImport () {
      this.http.post('/wago/update/delete/confirm', {
        wagoID: this.wago._id
      })
      if (this.wago.type === 'COLLECTION') {
        var user = this.$store.state.user
        var i = -1
        user.collections.forEach((collection, index) => {
          if (collection._id === this.wago._id) {
            i = index
          }
        })
        if (i >= 0) {
          user.collections.splice(i, 1)
          this.$store.commit('setUser', user)
        }
      }
      this.$router.replace('/')
    },

    onUpdateImportString () {
      var post = {}
      post.wagoID = this.wago._id
      post.type = this.wago.type
      post.scanID = this.scanID
      post.newVersion = this.newImportVersion.semver
      post.changelog = this.newChangelog.text
      post.changelogFormat = this.newChangelog.format
      post.cipherKey = this.decryptKey
      var vue = this
      this.http.post('/import/update', post).then((res) => {
        this.newChangelog = { text: '', format: this.$store.state.user.defaultEditorSyntax }
        if (res.error) {
          window.eventHub.$emit('showSnackBar', res.error)
        }
        else {
          if (res.latestVersion) {
            this.updateVersion(res.latestVersion)
            this.$set(this.wago.code, 'changelog', {text: post.changelog, format: post.changelogFormat})
          }
          window.eventHub.$emit('showSnackBar', vue.$t('Wago saved successfully'))
          location.reload()
        }
      }).catch((err) => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Unknown error could not save'))
      })
    },

    saveModifiedVersion () {
      this.http.post('/wago/update/version', {
        wagoID: this.wago._id,
        version: this.modifiedVersionNum,
        versionString: this.modifiedVersion.semver,
        changelog: this.newChangelog.text,
        changelogFormat: this.newChangelog.format
      }).then((res) => {
        var ver = this.wago.versions.versions[this.wago.versions.versions.length - this.modifiedVersionNum]
        ver.versionString = this.modifiedVersion.semver
        ver.changelog = this.newChangelog
        this.$set(this.wago.versions.versions, this.wago.versions.versions.length - this.modifiedVersionNum, ver)

        var previous = semver.valid(semver.coerce(this.wago.versions.versions[this.wago.versions.versions.length - 1].versionString))
        for (let i = this.wago.versions.versions.length - 2; i >= 0; i--) {
          let next = semver.valid(semver.coerce(this.wago.versions.versions[i].versionString))
          if (semver.gte(previous, next)) {
            next = semver.inc(previous, 'patch')
            this.$set(this.wago.versions.versions[i], 'versionString', next)
          }
          previous = next
        }
        this.$refs.modifyVersionDialog.close()
      })
    },

    updateVersion (version) {
      this.$set(this.latestVersion, 'semver', semver.valid(semver.coerce(version)))
      this.$set(this.latestVersion, 'major', semver.major(this.latestVersion.semver))
      this.$set(this.latestVersion, 'minor', semver.minor(this.latestVersion.semver))
      this.$set(this.latestVersion, 'patch', semver.patch(this.latestVersion.semver))
      this.currentVersionString = this.latestVersion.semver
    },

    modifyVersion (version) {
      this.modifiedVersionNum = version.version
      this.newChangelog = { text: version.changelog.text, format: version.changelog.format }
      this.$set(this.modifiedVersion, 'semver', semver.valid(semver.coerce(version.versionString)))
      this.$set(this.modifiedVersion, 'major', semver.major(this.modifiedVersion.semver))
      this.$set(this.modifiedVersion, 'minor', semver.minor(this.modifiedVersion.semver))
      this.$set(this.modifiedVersion, 'patch', semver.patch(this.modifiedVersion.semver))

      if (this.wago.versions.versions[version.version - 1]) {
        this.modifiedPreviousVersion = {semver: semver.valid(semver.coerce(this.wago.versions.versions[version.version - 1].versionString))}
      }

      this.$refs.modifyVersionDialog.open()
    },

    generateNextVersionData () {
      this.newChangelog = { text: '', format: this.$store.state.user.defaultEditorSyntax }
      this.$set(this.newImportVersion, 'semver', semver.inc(this.latestVersion.semver, 'patch'))
      this.$set(this.newImportVersion, 'major', semver.major(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'minor', semver.minor(this.newImportVersion.semver))
      this.$set(this.newImportVersion, 'patch', semver.patch(this.newImportVersion.semver))
    },

    // add to or remove from collection
    addToCollection (collectionID) {
      var post = {}
      post.wagoID = this.wago._id
      post.collectionID = collectionID
      var promise
      if (this.wago.myCollections.length > 0 && this.wago.myCollections.indexOf(collectionID) > -1) {
        promise = this.http.post('/wago/collection/remove', post)
      }
      else {
        promise = this.http.post('/wago/collection/add', post)
      }
      var vue = this
      promise.then((res) => {
        if (res.added) {
          vue.wago.myCollections.push(collectionID)
          vue.wago.collections.push({
            modified: Date.now(),
            name: res.name,
            user: {
              profile: (vue.User.profileVisibility === 'Public') ? '/p/' + encodeURIComponent(vue.User.name) : false,
              class: vue.User.css,
              name: vue.User.name,
              avatar: vue.User.avatar},
            slug: res.slug,
            _id: collectionID
          })
          vue.wago.collectionCount++
        }
        else if (res.removed) {
          var i = vue.wago.myCollections.indexOf(collectionID)
          vue.wago.myCollections.splice(i, 1)
          for (i = 0; i < vue.wago.collections.length; i++) {
            if (vue.wago.collections[i]._id === collectionID) {
              vue.wago.collections.splice(i, 1)
              vue.wago.collectionCount--
              break
            }
          }
        }
        else {
          window.eventHub.$emit('showSnackBar', vue.$t('Unknown error could not save'))
        }
      }).catch((err) => {
        console.error(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Unknown error could not save'))
      })
    },

    openNewCollectionDialog () {
      this.$refs.addCollectionDialog.open()
      var vue = this
      setTimeout(() => {
        vue.$refs.addCollectionNameInput.$el.focus()
      }, 370)
    },

    CreateCollection () {
      if (!this.addCollectionName) {
        return
      }
      var vue = this
      this.http.post('/wago/collection/new', {
        name: this.addCollectionName.trim(),
        wagoID: this.wago._id
      }).then((res) => {
        if (res.success && res.collectionID) {
          vue.addCollectionName = ''
          vue.wago.collections.unshift({
            modified: Date.now(),
            name: res.name,
            user: {
              profile: (vue.User.profileVisibility === 'Public') ? '/p/' + encodeURIComponent(vue.User.name) : false,
              class: vue.User.css,
              name: vue.User.name,
              avatar: vue.User.avatar
            },
            slug: res.collectionID,
            _id: res.collectionID
          })
          vue.wago.myCollections.push({
            _id: res.collectionID,
            name: res.name
          })
          vue.$refs.addCollectionDialog.close()
          vue.wago.collectionCount++

          var user = this.$store.state.user
          user.collections.push({_id: res.collectionID, name: res.name})
          vue.$store.commit('setUser', user)
          vue.wago.myCollections.push(res.collectionID)
        }
      })
    },

    checkNewRestrictions: function () {
      this.$nextTick(() => {
        if ((this.newRestrictionType && this.newRestrictionValue) || this.newRestrictionType === 'twitchsubs') {
          this.wago.restrictions.push({type: this.newRestrictionType, value: this.newRestrictionValue})
          this.newRestrictionType = 'user'
          this.newRestrictionValue = ''
          // onUpdateRestrictions is called here via reactivity
        }
      })
    },

    onUpdateRestrictions: function (index) {
      if (typeof index === 'undefined' || ((this.wago.restrictions[index] && this.wago.restrictions[index].value) || this.wago.restrictions[index].type === 'twitchsubs' || this.wago.restrictions[index].type === 'remove')) {
        if (typeof index !== 'undefined' && this.wago.restrictions[index].type === 'remove') {
          this.wago.restrictions.splice(index, 1)
        }
        else if (typeof index !== 'undefined' && typeof this.wago.restrictions[index].rank === 'undefined') {
          this.$set(this.wago.restrictions[index], 'rank', '9')
        }
        this.http.post('/wago/update/restrictions', {
          wagoID: this.wago._id,
          access: this.wago.restrictions
        })
      }
    },

    onUpdateRestrictionsDebounce: function (index) {
      if (this.restrictionDebounceTimeout) {
        window.clearTimeout(this.restrictionDebounceTimeout)
      }

      this.restrictionDebounceTimeout = setTimeout(() => {
        this.onUpdateRestrictions(index)
      }, 600)
    },

    getGuildLink: function (guildKey) {
      const slug = (str) => {
        return str.toLowerCase().replace(/\s/g, '-').replace(/'/g, '')
      }
      const guild = guildKey.split(/@/)
      switch (guild[0]) {
        case 'eu':
          return `https://worldofwarcraft.com/en-gb/guild/eu/${slug(guild[1])}/${slug(guild[2])}`
        case 'us':
          return `https://worldofwarcraft.com/en-us/guild/us/${slug(guild[1])}/${slug(guild[2])}`
        case 'kr':
          return `https://worldofwarcraft.com/ko-kr/guild/kr/${slug(guild[1])}/${slug(guild[2])}`
        case 'cn':
          return `https://worldofwarcraft.com/zh-cn/guild/cn/${slug(guild[1])}/${slug(guild[2])}`
      }
      return '#'
    },

    autoCompleteUserName: function (q) {
      return this.http.get('/search/username', {name: q.q})
    },

    escapeText: function(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
    }
  },
  mounted: function () {
    if (window.location.hash && parseInt(window.location.hash.replace(/#/, ''))) {
      this.selectedError = parseInt(window.location.hash.replace(/#/, ''))
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#copyFail textarea { max-height: 110px; min-height:110px }
#copyFail .md-input-container { display: inline-block; position: relative}

#view-wago > div { position: relative }
#wago-header.md-card { padding-bottom:0!important; flex: 1}
#wago-header.md-card, #wago-floating-header.md-card { padding: 16px; margin: 16px }
#wago-header.md-card h3, #wago-floating-header.md-card h3 { margin: 0 }
#wago-header.md-card h3 + .md-subheader, #wago-floating-header.md-card h3 + .md-subheader { padding:0; min-height:0 }

#wago-header .md-card-header, #wago-floating-header .md-card-header { padding-left: 0; padding-right: 4px }
#wago-header .md-card-header .item, #wago-floating-header .md-card-header .item { padding-left: 0!important; float: left; display: inline; margin-right: 16px; vertical-align: middle }
@media (min-width: 601px) {
  #wago-header .md-card-header .item+.item { margin-left: 16px; margin-right: 0 }
}
#wago-header .md-card-header .item .md-title { font-weight: 500; line-height: 20px; font-size: 14px }
#wago-header .md-card-header .item .md-subhead { font-weight: 500; line-height: 20px; font-size: 14px; opacity: .54 }
#wago-header .md-card-header .item .md-subhead.has-link { opacity: 1 }

#wago-floating-header { position: fixed; top:-16px; right:0; left: 260px; z-index: 9; opacity: .95 }
#wago-floating-header .floating-header { display: flex; justify-content: flex-start; align-content: stretch; align-items: flex-start}
#wago-floating-header .floating-header div:not(.md-ink-ripple) { flex: 0 1 auto; vertical-align:top; margin-right: 24px}
#wago-floating-header button { margin-top: 0 }
.version-number { padding-left: 8px; opacity: .54; font-size: 14px }
@media (max-width: 600px) {
  #wago-floating-header { display: none!important}
}

#wago-tabs { flex: 0 1 auto; flex-direction: column }
#wago-tabs .md-button-toggle { flex-direction: column }
#wago-tabs .md-button-toggle button { text-align:left }

#wago-content { flex: 1; flex-direction: column }
#wago-content > div { margin: 0 8px 16px 0; width: 100%; }
#addCollectionButton, #newCommentButton { margin-top: 0 }

#wago-actions { flex: 1; padding: 0; align-items: flex-start }
#wago-actions button { margin-top: 0 }
.copy-import-button { border: 2px solid #c1272d; border-radius: 25px; margin: 4px 28px; display: inline-block }
#wago-collections-container button { margin-left: -2px }
#wago-floating-header .copy-import-button { margin: -2px 0 0 auto }

#helpImportingButton {position: absolute; right: 0; top: -3px; margin: 0;}
#helpImportingButton:hover {background: rgba(193,39,45,.2)}
#helpImportingButton i.md-icon {color:inherit}
.copy-import-button {position: relative; padding-right: 50px}
#helpDialog .md-dialog {max-width: 750px}
#helpDialog img {margin: 6px; max-width: 80%; display: block}
#helpDialog li {margin-bottom: 16px}

span.md-note {height: 20px; position: absolute; bottom: -22px; font-size: 12px;}

#thumbnails img { max-width: 190px; max-height: 107px; width: auto; height: auto; margin: 8px 8px 0 0; cursor: pointer }

#tags { display: block; clear: both; padding-top: 16px}
.wago-media { width: 160px; text-align: center  }
.wago-media img, .wago-media a img { padding: 8px 16px; width: 100%; max-height: 120px; display: block; float: none }
a.showvid { position: relative; cursor: pointer }
a.showvid:hover img { transform: scale(1.05); }
a.showvid .md-icon { width:50px; height: 50px; position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); -webkit-transform: translate(-50%, -50%); opacity: .7; font-size: 50px; color: #fff; text-shadow: 0px 0px 30px rgba(0, 0, 0, 0.8); z-index: 9  }
a.showvid:hover:before  .md-icon { opacity:1 }
.sl-overlay { background-color: rgba(0, 0, 0, 0.54) }

#wago-config { padding-bottom: 10em!important}

#video-modal { width: 70vw; height: 39.375vw; z-index:999; margin: auto; background: none; outline: none}
#video-modal > .md-dialog {width: 100%; height: 100%; background: none; position: relative }
.video-wrapper { position: relative; }
.video-wrapper:before { display: block; content:""; width: 100%; padding-top: 56.25%}
.video-wrapper iframe { position: absolute; top: 0;	left: 0; bottom: 0; right: 0; width:100%; height: 100% }

.md-button-toggle { padding: 0 16px 16px; flex-wrap: wrap; }
.md-button .commentAttn { color: #c2272e !important; -webkit-text-fill-color: #c2272e }

.wago-container { padding: 0 16px; }
.wago-container > h2 { padding: 0 16px; margin: 8px 0 16px }
.wago-container > div { margin: 0; }
.wago-container .border { border-bottom: 1px solid rgba(128, 128, 128, 0.5) }
#wago-config, #wago-embed { background: rgba(128, 128, 128, 0.1); padding: 16px;}

#wago-flex-container { display: flex; flex-direction: row; }
#wago-col-main { flex: 1.5 0 0 }
#wago-col-main > .md-layout { flex-direction: row; flex-wrap: nowrap }
#wago-col-side { flex: 1 0 0 }

#wago-includedauras div { font-weight: bold }
#wago-includedauras div + div { font-weight: normal; padding-left: 24px }
#wago-includedauras div + div:before { content: '• ' }

#wago-versions .md-table .md-table-cell .md-table-cell-container { display: block }
#wago-versions .md-table-row { }
#wago-versions .md-table-selection { display: none } /* hack to make md-table-row clickable */
#wago-versions .chip-button { background-color: rgba(0, 0, 0, .12); text-transform: none; width: auto; min-width: auto; height: auto; min-height: auto; font-size: 13px; line-height: 16px; padding: 8px 12px; margin: 0 6px 6px 0}
#wago-versions .chip-button:hover, #wago-versions .chip-button.md-toggle { background-color: #c2272e; cursor: pointer }
#wago-versions .version-num { min-width: 55px; display: inline-block; }
#wago-versions .version-num + .usertext { display: inline-block; padding-left: 12px }

.changelog-notes { margin-top: 0 }
.changelog-text { border-bottom: 1px solid #555; margin-bottom: 8px; }
.md-table tbody .md-table-row.changelog-row { border-top-color: #555;}

#embed-content { display: flex }
#embed-inputs { flex: 2 1 auto }
#embed-preview { flex: 1.5 1 auto }
#embed-inputs .md-select { max-width: 200px}
#embed-inputs .md-has-select.md-input-container {margin-bottom:0}
#embed-inputs .md-has-select.md-input-container:after {height:0}

.md-table .md-table-head.md-end, .md-table .md-table-cell.md-end .md-table-cell-container { text-align: right; justify-content: flex-end }


#wago-collections .md-avatar { margin: 0 16px 0 0; width: 28px; min-width: 28px; height: 28px; min-height: 28px; }
#wago-collections .userlink .md-table-cell-container { display: inline }

#wago-header-toggle, #wago-tabs-toggle { display: none }

@media (max-width: 600px) {
  #wago-mobile-header { position: absolute; left: 64px; width: calc(100vw - 128px); }
  #wago-mobile-header h3 { margin: 8px 0 0 0; overflow: hidden; white-space: nowrap }
  #wago-mobile-header .md-subheader { padding: 0; overflow: hidden; white-space: nowrap; display: block }
  #wago-mobile-header .md-subheader span { padding-right: 6px; font-size: 10px }
  #wago-header-toggle { display: block; position: absolute; top: 8px; right: 8px; z-index: 9; background-color: rgba(0, 0, 0, 0.7) }
  #wago-header.md-card { margin: 0}
  #wago-col-main > .md-layout { margin-top: 16px }
  #wago-flex-container, #wago-header .md-layout, #wago-actions { flex-direction: column; align-items: flex-start; }
  #wago-actions button { padding: 0 }
  #wago-actions button.copy-import-button { padding: 0 8px }
  #wago-actions .md-card .md-card-actions .md-button + .md-button { margin-left: 0}
  #wago-tabs-toggle { display: block; position: absolute; top: 8px; left: 8px; z-index: 9; background-color: rgba(0, 0, 0, 0.7) }
  #wago-tabs { position: absolute; top: 48px; z-index: 999}
  #wago-content { padding-top: 40px; }
}

/* embed preview */
#embed-preview-container a{display:inline;padding:0 2px;margin:0;border:0}
#embed-preview-container img{display:inline;padding:0;margin:0;border:0;height:42px}
#embed-preview-container .clickToCopyWago{display:block;padding:0;margin:0;font-size:10px}
#embed-preview-container .wagoName{display:block;padding:0;margin:4px 0;font-weight:bold;font-size:13px}

#embed-preview-container{padding: 0 4px}
#embed-preview-container.dark{background: white}
#embed-preview-container.light .md-subheader{color:black}
#embed-preview-container.dark button{display:inline;padding:4px 16px;min-width: 130px;background-color:#000;cursor:pointer;color:rgba(255,255,255,.87);border:0;text-align:center;vertical-align:top;border-radius:6px}
#embed-preview-container.dark button:hover{background-color:#040404}
#embed-preview-container.light{background: black}
#embed-preview-container.light .md-subheader{color:white}
#embed-preview-container.light button{display:inline;padding:4px 16px;min-width: 130px;background-color:#FFF;cursor:pointer;color:rgba(0,0,0,.87);border:0;text-align:center;vertical-align:top;border-radius:6px}
#embed-preview-container.light button:hover{background-color:#F4F4F4}
#embed-preview-container.none img {display: none}

.iframeColorPickers { margin-right: 16px }
.colorBtn { display: block; margin: 4px 0 16px 0; height: 32px; width: 130px; border: 1px solid white; cursor: pointer }

.wago-importstring { width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:transparent;color:transparent;overflow:hidden;resize:none }
.wago-importstring::selection { color:transparent;background:transparent }
.wago-importstring::-moz-selection { color:transparent;background:transparent }
.wago-importstring::-webkit-selection { color:transparent;background:transparent }

.customSlug .root { font-size:16px; line-height: 32px }
.md-input-container.md-input-status .md-error { opacity: 1; transform: translate3d(0, 0, 0); }

.has-category-select { position: relative}
.has-category-select:after {
    height: 1px;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #B6B6B6;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    content: " ";
}
#categoryLabel { margin-top: 10px; display: inline-block}
#tags .md-chip { padding-left:26px }


.multiselect { min-height: 0}
.multiselect__tags { border-width: 0 0 1px 0; padding:5px 0; min-height: 16px; border: 0; background: none}
.multiselect_remove { cursor: pointer }
.md-input-container input.multiselect__input { display: inline }
ul.multiselect__content { display: flex!important; flex-wrap: wrap }
ul.multiselect__content .multiselect__element { flex: 1 1 25% }
ul.multiselect__content .multiselect__element .multiselect__option { padding: 0; min-height: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip { border-radius: 0; display: block; font-size: 13.5px; text-outline: none; box-shadow: none }
ul:not(.md-list) > li.multiselect__element + li { margin-top: 0 }

#sorted-screenshots > div, #sorted-videos > div {position: relative; display: inline-block; cursor: move}
#sorted-screenshots > div img, #sorted-videos > div img {max-height:120px; max-width: 150px; margin: 4px; pointer-events: none;}
#sorted-screenshots > div .delete, #sorted-videos > div .delete {position: absolute; top: 2px; right: 2px; z-index: 3; opacity: .5; cursor: pointer}
#sorted-screenshots > div .delete:hover, , #sorted-videos > div .delete:hover {opacity: 1}
.drag-sort-active {opacity: .2}

.my-gallery a img { border-color: transparent }

#newImportDialog > div { min-width: 30% }
#newImportDialog .md-input-container { margin-bottom: 0 }
#newVersionFlexArea { flex: 1 }

.CopyWarningTooltip { padding: 8px; border:5px solid #c1272d; font-size: 14px; height: auto; max-width: 450px; white-space:normal; background: black; right: -84px  }

.usertext.markdown hr { opacity: .5 }

#companion-info p { margin-bottom: 14px }

.attached-media { padding: 16px; margin: 8px 0; display: inline-block; background: rgba(0,0,0,.5)}
.attached-media img { max-width: 400px; max-height: 300px}

.resticted-options { flex: 4; flex-wrap: nowrap}

/* translations */
.translate-item { padding: 16px; margin: 0 0 16px!important; display: flex; justify-content: space-between; background: rgba(0,0,0,.5); position: relative }
.translate-item .key { max-width: 100px; min-width: 100px; margin-top: 4px; overflow: hidden; }
.translate-item .current { flex-grow: 1; width: auto; margin: 0; width: 50% }
.translate-item .current .md-input-container { flex-direction: column }
.translate-item .current .md-input-container:after { height: 0}
.translate-item .current .currentLang.notLocalized { font-style: oblique }
.translate-item .current .currentLang { }
.translate-item .current .myLang { font-size: 14px; opacity: .8}
.translate-item .submit { flex-grow: 1; width: auto; margin: 0 0 0 16px!important; width: 50% }
.translate-item .view { position: absolute; right: 16px; min-width: 20px; min-height: 16px; line-height: 24px; padding: 0; margin:0 0 0 8px}
.translate-header > div {font-weight: bold; margin-top: 0!important; line-height:36px; text-transform: uppercase}
.translate-header .current {margin-left: 16px; margin-right: -16px}
.translate-item .md-input-container { padding-top:0; min-height:0;  margin: 0 0 0 16px!important}
.translate-item .md-input-container .md-input { height: 16px; line-height: 16px;}
#translationModeButtons { padding: 0}
#wago-translate-container .md-button-toggle {padding-left:0}
#wago-translate-container .md-button-toggle .md-button {text-transform: none}

#wago-codereview-container h2 {padding-left: 0}
</style>
