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
      <div class="md-card" id="sticky-header">
        <h1>{{ wago.name }}
          <div>
            <span v-if="currentVersionString && !currentVersionString.match(/undefined/)">v{{ currentVersionString }}</span>
            <span>{{ displayExpansion(wago) }}{{ wago.type }}</span>
          </div>
        </h1>
        <div v-if="wago.type.match(/WEAKAURA|PLATER/) && wago.visibility && !wago.visibility.encrypted" id="sendToDesktopAppBtn" class="md-hide-xsmall md-button copy-import-button" @click="sendToApp()">
          <md-icon>airplay</md-icon> {{ $t("Send to Desktop App") }}
          <md-button @click.stop="sendToApp('ask')" id="helpAppButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
        </div>
        <md-button v-if="wago.code && wago.code.encoded" @click="copyEncoded" class="copy-import-button" id="copyImportBtn">
          <md-icon>assignment</md-icon> <span>{{ $t("Copy import string") }}</span>
          <md-button @click="openHelpDialog" id="helpImportingButton" class="md-icon-button md-raised"><md-icon>help</md-icon></md-button>
          <md-tooltip v-if="hasUnsavedChanges" md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("You have unsaved changes") }}</strong><br>{{ $t("Be sure to save or fork to generate a new string with your modifications") }}</md-tooltip>
          <md-tooltip v-else-if="corruptedData" md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("This import is corrupted and will likely not work as expected") }}</strong></md-tooltip>
          <md-tooltip v-else-if="codeReview && codeReview.alerts" md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("This import has alerts, you are strongly suggested to review the code before installing") }}</strong></md-tooltip>
        </md-button>
      </div>
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

        <md-dialog-content v-else-if="wago.type.match(/DELVUI/)">
          <ol>
            <li>{{ $t('Open the DelvUI configuration window by clicking DelvUI Settings in your system menu') }} <img src="https://media.wago.io/site/delvui-escmenu.png" />
            {{ $t('Alternatively type the "/delvui" command into your chat window') }} <img src="https://media.wago.io/site/delvui-slashcommand.png" /></li>
            <li>{{ $t('At the bottom of the left navigation click the Profiles button to add this import as a new profile, or Import to overwrite your existing profile') }} <img src="https://media.wago.io/site/delvui-importmenu.png" /></li>
            <p><strong>{{ $t('To import a new profile') }}</strong></p>
            <li>{{ $t('Enter a profile name, then click Import from Clipboard') }} <img src="https://media.wago.io/site/delvui-newprofile.png" /></li>
            <p><strong>{{ $t('OR, to import a and overwrite your profile') }}</strong></p>
            <li>{{ $t('Paste the string into the field with ctrl-V and click the Import button') }}</li>
            <li>{{ $t('Toggle the checkboxes to your preference for which config parts to import') }} <img src="https://media.wago.io/site/delvui-importselect.png" /></li>
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

      <md-layout md-row id="import-meta">
        <md-card id="wago-header" ref="header">
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
            <div id="tags">
              <template>
                <router-link v-for="(cat, n) in wago.categories" :key="n" :to="'/' + typeSlug + cat.slug">
                  <md-chip :class="cat.id" disabled v-if="cat.text && (n<5 || showMoreCategories)">{{ cat.text }}</md-chip>
                </router-link>
              </template>
              <span @click="viewAllCategories()"><md-chip v-if="wago.categories.length > 5 && !showMoreCategories" class="show_more">{{ $t("[-count-] more", {count: wago.categories.length - 5}) }}</md-chip></span>
            </div>
          </md-card-header>

          <div id="wago-actions" v-if="User && User.UID">
            <md-button v-if="wago.user && wago.UID && wago.UID === User.UID && wago.code && wago.code.encoded" @click="generateNextVersionData(); $refs['newImportDialog'].open()" id="newImportButton"><md-icon>input</md-icon> {{ $t("Import new string") }}</md-button>
            <md-button v-if="(!wago.UID || wago.UID !== User.UID)" @click="$refs.reportmodal.open()">
              <md-icon>flag</md-icon> {{ $t("Report") }}
            </md-button>
            <span></span>
            <md-button @click="newComment">
              <md-icon>comment</md-icon> {{ $t("Post Comment") }}
            </md-button>
            <md-button @click="toggleFavorite">
              <md-icon v-if="wago.myfave">star</md-icon>
              <md-icon v-else>star_border</md-icon> {{ $t("Favorite") }}
            </md-button>
          </div>
        </md-card>
      </md-layout>

      <md-dialog md-open-from="#sendToDesktopAppBtn" md-close-to="#sendToDesktopAppBtn" ref="sendToAppDialog">
        <md-dialog-title>Send to App</md-dialog-title>

        <md-dialog-content id="app-info">
          <p>{{ $t('The WagoApp and WeakAuras Companion both act as a bridge between Wago and your in-game addons, and allow you to quickly install imports from Wago.') }}</p>
          <p>{{ $t('Select which app you have installed and wish to use.') }}</p>
          <div id="app-choice">
            <div class="select-app" :class="{selected:selectedApp=='WagoApp' || !selectedApp}" @click="selectedApp='WagoApp'">
              <div class="app-logo"><img src="./../../assets/wagoio-logo.png"></div>
              <div class="app-name">WagoApp</div>
              <div class="app-link"><a href="#">Download WagoApp</a></div>
            </div>
            <div class="select-app" :class="{selected:selectedApp=='WeakAurasCompanion'}" @click="selectedApp='WeakAurasCompanion'">
              <div class="app-logo"><img src="./../../assets/weakauralogo.png"></div>
              <div class="app-name">WeakAuras Companion</div>
              <div class="app-link"><a href="https://weakauras.wtf" target="blank">Download WeakAuras Companion</a></div>
            </div>
          </div>
          <p v-if="selectedApp=='WagoApp' || !selectedApp" class="app-info">
            <img src="./../../assets/wagoio-logo.png"> {{$t('WagoApp is your all-in-one tool for managing your World of Warcraft addons and supported imports. Stay up to date and stay in style!') }}
          </pageInfo>
          <p v-else-if="selectedApp=='WeakAurasCompanion'" class="app-info">
            <img src="./../../assets/weakauralogo.png"> {{$t('The WeakAuras Companion automatically fetches updates to the auras you have installed directly from Wago, without having to manually copy-paste import strings all the time. It also makes sure you don\'t miss any updates, always keeping you up to date with the latest versions.') }}
          </p>
        </md-dialog-content>

        <md-dialog-actions>
          <md-checkbox v-model="rememberAppChoice">{{ $t("Remember my choice") }}</md-checkbox>
        </md-dialog-actions>

        <md-dialog-actions>
          <md-button class="md-primary" @click="$refs.sendToAppDialog.close()">{{ $t("Cancel") }}</md-button>
          <md-button class="md-primary" @click="$refs.sendToAppDialog.close(); sendToApp('open')">{{ $t("Install [-type-]", {type: wago.type}) }}</md-button>
        </md-dialog-actions>
      </md-dialog>

      <div id="wago-flex-container">
        <div id="wago-col-main" style="position:relative">
          <md-button id="wago-tabs-toggle" class="md-icon-button md-raised" @click="toggleTabs">
            <md-icon>more_vert</md-icon>
          </md-button>
          <md-layout>
            <md-layout id="wago-tabs" v-bind:class="{'md-hide-xsmall': hideTabs}">
              <!-- FRAME TOGGLES -->
              <md-button-toggle class="md-accent" md-single>
                <md-button v-if="enableModeration" v-bind:class="{'md-toggle': showPanel === 'moderation'}" @click="toggleFrame('moderation')">{{ $t("Moderation") }} <span v-if="moderation.length && moderation[moderation.length-1].action === 'Report'" class="commentAttn">ATTN!</span></md-button>
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
                  <md-button v-if="wago.code && wago.code.customCode && wago.code.customCode[0] && wago.code.customCode[0].luacheck && wago.type !== 'SNIPPET'" v-bind:class="{'md-toggle': showPanel === 'codereview'}" @click="toggleFrame('codereview')">{{ $t("Code Review") }}</md-button>
                  <md-button v-if="wago.type !== 'ERROR' && wago.type !== 'COLLECTION' && wago.visibility && wago.visibility.public" v-bind:class="{'md-toggle': showPanel === 'embed'}" @click="toggleFrame('embed')">{{ $t("Embed") }}</md-button>
                  <md-button v-if="wago.type === 'MDT'" v-bind:class="{'md-toggle': showPanel === 'builder'}" @click="toggleFrame('builder')">{{ $t("Builder") }}</md-button>
                  <md-button v-if="wago.type === 'BLIZZHUD'" v-bind:class="{'md-toggle': showPanel === 'hudsettings'}" @click="toggleFrame('hudsettings')">{{ $t("Hud Settings") }}</md-button>
                  <md-button v-if="wago.type !== 'ERROR' && wago.type !== 'COLLECTION'" v-bind:class="{'md-toggle': showPanel === 'editor'}" @click="toggleFrame('editor')">{{ $t("Editor") }}</md-button>
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

              <template v-else-if="codeReview && codeReview.alerts > 0 && (!wago.code || !wago.code.Q)">
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

              <ui-warning v-if="wago.type === 'BLIZZHUD'" mode="alert">
                Blizzard Hud is still early in development and not fully supported in-game nor on Wago.<br></br>If there are breaking changes in a future Alpha build, existing Blizz Hud imports may be deleted.
              </ui-warning>

              <ui-warning v-if="wago.expires" mode="info">
                {{ $t("This import will expire in [-time-]", {time: $moment(wago.expires).fromNow() }) }}<br>
              </ui-warning>

              <ui-warning v-if="wago.visibility && wago.visibility.private">
                {{ $t("This import is private only you may view it") }}
              </ui-warning>
              <ui-warning v-else-if="wago.visibility && wago.visibility.restricted">
                {{ $t("This import is restricted, you have been granted access to view it") }}
              </ui-warning>
              <ui-warning v-else-if="wago.visibility && wago.visibility.hidden">
                {{ $t("This import is hidden only those with the URL may view it") }}
              </ui-warning>

              <ui-warning v-if="wago.fork && wago.fork._id" mode="info" :html="$t('This is a fork of [-id-][-name-]', {id: wago.fork._id, name: wago.fork.name})"></ui-warning>

              <ui-warning mode="alert" v-if="wago.visibility && wago.visibility.deleted">
                {{ $t("This import has been deleted and can not be accessed") }}
                <div style="width:100%">{{ wago.moderatedComment }}</div>
              </ui-warning>
              <ui-warning mode="alert" v-else-if="wago.visibility && wago.visibility.moderated">
                {{ $t("This import has been moderated and is not publicly accessible") }}
                <div style="width:100%">{{ wago.moderatedComment }}</div>
                <button v-if="wago.user && User && wago.UID && wago.UID === User.UID" class="md-button" @click="$refs.requestReviewModal.open()">{{ $t('Request Review') }}</button>
              </ui-warning>

              <ui-warning v-else-if="wago.code && wago.code.alert && wago.code.alerts.newInternalVersion" mode="alert">
                {{ $t("This WeakAura is made with build \"[-version-]\", which may include breaking changes with the current main addon release", {version: wago.code.alerts.newInternalVersion.build}) }}<br>
                <div v-for="func in wago.code.alerts.malicious">{{ func }}</div>
              </ui-warning>

              <ui-warning v-if="corruptedData" mode="alert">
                {{ $t("This import is corrupted, missing data and can not be repaired, apologies but the author will need to re-import") }}
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
                            <md-autocomplete v-model="rest.value" :fetch="autoCompleteUserName" :debounce="600" @change="onUpdateRestrictionsDebounce(index)"></md-autocomplete>
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
                    <md-layout v-if="wago.restrictions.length <= 40">
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
                          <md-autocomplete v-model="newRestrictionValue" :fetch="autoCompleteUserName" @selected="checkNewRestrictions"></md-autocomplete>
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
                  <div v-if="!wago.image && !wago.audio && wago.type !== 'ERROR' && wago.type !== 'DBM'">
                    <div>
                      <label id="categoryLabel">{{ $t("Categories") }}</label>
                      <md-button class="md-icon-button md-raised" @click="numCategorySets++">
                        <md-icon>add</md-icon>
                      </md-button>
                      <div v-for="n in numCategorySets">
                        <div class="has-category-select">
                          <category-select :selectedCategories="editCategories[n-1]" @update="cat => {editCategories[n-1] = cat; onUpdateCategories()}" :type="wago.type.toUpperCase()" :game="wago.game" :domain="wago.domain"></category-select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-if="!wago.image && !wago.audio && wago.type !== 'ERROR'">
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
                <div id="wago-description" style="padding-top:2px">
                  <div v-if="codeReview.info && wago.type.match(/WEAKAURA|PLATER/)" id="import-info">
                    <template v-if="codeReview.info.dependencies.length">
                      <em>{{ $t('Import Dependencies') }}</em><br>
                      <template v-for="dep of codeReview.info.dependencies">
                        <span><md-icon :class="{warning: dep.warn}">extension</md-icon> {{ dep }}</span><br>
                      </template>
                    </template>
                    <template v-if="codeReview.info.highlights.size">
                      <em>{{ $t('Highlighted Functionality') }}</em><br>
                      <template v-if="codeReview.info.highlights.has('keybind')"><span><md-icon>keyboard</md-icon> {{ $t('Sets keybinds') }}</span></span><br></template>
                      <template v-if="codeReview.info.highlights.has('tts')"><span><md-icon>volume_up</md-icon> {{ $t('Uses text-to-speech') }}</span></span><br></template>
                      <template v-if="codeReview.info.highlights.has('audio')"><span><md-icon>volume_up</md-icon> {{ $t('Plays audio') }}</span></span><br></template>
                      <template v-if="codeReview.info.highlights.has('chat')"><span><md-icon>chat</md-icon> {{ $t('Sends chat messages') }}</span></span><br></template>
                    </template>
                    <em>{{ $t('Code Metrics') }}</em><br>
                    <template v-if="codeReview.info.nloc || codeReview.errors || codeReview.warnings">
                      <template v-if="codeReview.alerts"><span>{{ $t('Code Alerts') }}<span>{{ codeReview.alerts }}</span></span><br></template>
                      <template v-if="codeReview.errors"><span>{{ $t('Luacheck Errors') }}<span>{{ codeReview.errors }}</span></span><br></template>
                      <template v-if="codeReview.warnings"><span>{{ $t('Luacheck Warnings') }}<span>{{ codeReview.warnings }}</span></span><br></template>
                      <span title="Without comments or empty lines">{{ $t('Lines of code') }}<span>{{ codeReview.info.nloc }}</span></span><br>
                      <span>{{ $t('Tokens') }}<span>{{ codeReview.info.tokens }}</span></span><br>
                      <span>{{ $t('Globals') }}<span>{{ codeReview.info.globals.size }}</span></span><br>
                      <span>{{ $t('Cyclomatic complexity') }}<span :class="{
                        metricsOK: typeof codeReview.info.ccn === 'number' && codeReview.info.ccn <= 10,
                        metricsWarn: typeof codeReview.info.ccn === 'number' && codeReview.info.ccn <= 20 && codeReview.info.ccn > 10,
                        metricsAlert: typeof codeReview.info.ccn === 'number' && codeReview.info.ccn > 20}
                      ">{{ codeReview.info.ccn }}</span></span><br>
                      <span>{{ $t('Maintainability Index') }}<span :class="{
                        metricsOK: typeof codeReview.info.maintainability === 'number' && codeReview.info.maintainability >= 20,
                        metricsWarn: typeof codeReview.info.maintainability === 'number' && codeReview.info.maintainability < 20 && codeReview.info.maintainability >= 10,
                        metricsAlert: typeof codeReview.info.maintainability === 'number' && codeReview.info.maintainability < 10 && codeReview.info.maintainability >= 0}
                      ">{{ codeReview.info.maintainability }}</span></span><br>
                      <template v-if="!codeReview.warnings && !codeReview.errors && !codeReview.alerts"><span>{{ $t('Luacheck') }}<span>{{$t('OK')}}</span></span><br></template>
                    </template>
                    <template v-else>{{ $t('No custom code') }}</template>
                  </div>
                  <div v-if="(wago.screens && wago.screens.length) || (wago.videos && wago.videos.length)" class="screenshots">
                    <a  v-for="video in wago.videos" class="showvid" :href="video.url" @click.prevent="showVideo(video.embed)"><md-icon>play_circle_outline</md-icon><md-image :md-src="video.thumb"></md-image></a>
                    <img v-for="(image, k) in wago.screens" v-lazy="image.src || image.thumb" @click="$refs.lightbox.showImage(k)">
                  </div>

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
                        <span v-else>This is a custom texture or otherwise unknown to Wago.</span>
                      </span>
                    </div>
                  </template>
                </div>
              </div>

              <!-- MODERATION FRAME -->
              <div id="wago-moderation-container" class="wago-container" v-if="showPanel=='moderation' && enableModeration">
                <md-button-toggle class="md-accent mod-action-buttons" md-single>
                  <div style="margin-right:16px">Take moderation action:</div>
                  <md-button @click="modAction='Resolved'">Resolve Issue</md-button>
                  <md-button @click="modAction='Lock'">Lock Import</md-button>
                  <md-button @click="modAction='Delete'">Delete Import</md-button>
                  <md-button @click="modAction='Reprocess'">Reprocess Import</md-button>
                </md-button-toggle>

                <div v-if="modAction=='Resolved'" style="padding: 8px; border:1px solid green; display: inline-block">This will clear any reported issues, locks or mod-deletions.</div>
                <div v-else-if="modAction=='Lock'" style="padding: 8px; border:1px solid #a9a900; display: inline-block">This will lock the import so that it can only be accessed by the author and moderators.<br>The user will be able to see your comments so they may make the correct changes.</div>
                <div v-else-if="modAction=='Delete'" style="padding: 8px; border:1px solid #c0272d; display: inline-block">This will soft-delete the import and only moderators can continue to access it.</div>
                <div v-else-if="modAction=='Reprocess'" style="padding: 8px; border:1px solid green; display: inline-block">This will re-process the code review and regenerate the import string.</div>

                <div v-if="modAction" style="margin-bottom: 16px; display: flex;">
                  <md-input-container v-if="modAction!='Reprocess'">
                    <label>{{ $t('Comments') }}</label>
                    <md-textarea v-model="modComments"></md-textarea>
                  </md-input-container>
                  <md-button class="md-primary" @click="submitModReport()" :disabled="reportInProgress">{{ $t('Submit') }}</md-button>
                </div>

                <div id="wago-moderation" v-if="moderation.length">
                  <template v-for="(mod, i) in moderation">
                    <div :class="'moderation-item mod-'+mod.action">
                      <strong>Action: {{ mod.action }} <template v-if="mod.details">- {{ mod.details }}</template></strong><br>
                      <md-avatar>
                        <ui-image :img="mod.authorID.profile.avatar"></ui-image>
                      </md-avatar>
                      By {{ mod.authorID.account.username }}, {{ $moment(mod.date).fromNow() }}<br>
                      {{ mod.comment }}
                    </div>
                  </template>
                </div>
                <div v-else>
                  <p>No moderations or reports found for this import.</p>
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
                  <view-comments :comments="wago.comments" :commentTotal="wago.commentCount" :wagoID="wago._id" :openForm="openCommentForm"></view-comments>
                </div>
              </div>

              <!-- VERSIONS FRAME -->
              <div id="wago-versions-container" class="wago-container" v-if="showPanel=='versions'">
                <h2>{{ $t("Previous versions") }}</h2>
                <md-card id="wago-versions">
                  <md-table>
                    <md-table-header>
                      <md-table-row>
                        <md-table-head>{{ $t("Version") }}</md-table-head>
                        <md-table-head>{{ $t("Import Date") }}</md-table-head>
                      </md-table-row>
                    </md-table-header>

                    <md-table-body>
                      <template v-for="(ver, key) in wago.versions.versions">
                        <md-table-row>
                          <md-table-cell>
                            <span class='version-num'>{{ ver.versionString }}</span>
                            <md-chip v-if="ver.versionString === currentVersionString">{{ $t("Active") }}</md-chip>
                            <md-button v-else class='chip-button' :href="selectVersion([ver])">{{ $t("View") }}</md-button>
                            <md-button v-if="User && wago.UID && wago.UID === User.UID" class='chip-button' @click="modifyVersion(ver)">{{ $t("Modify Version") }}</md-button>
                          </md-table-cell>
                          <md-table-cell>
                            {{ ver.date | moment("dddd, MMMM Do YYYY, h:mm a") }}
                          </md-table-cell>
                        </md-table-row>
                        <md-table-row class='changelog-row' v-if="ver.changelog && ver.changelog.text">
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

              <!-- HUD SETTINGS FRAME -->
              <div id="wago-hudsettings-container" class="wago-container" v-if="showPanel=='hudsettings'">
                <div id="wago-hudsettings">
                  <blizzhud-settings v-if="wago.type=='BLIZZHUD' && wago.code"></blizzhud-settings>
                </div>
              </div>

              <!-- EDITOR FRAME -->
              <div id="wago-editor-container" class="wago-container" v-if="showPanel=='editor'">
                <div id="wago-editor" v-if="wago.code">
                  <edit-weakaura v-if="wago.type.match(/WEAKAURA/) && wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" :unsavedTable="hasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn" :customFn="wago.code.customCode"></edit-weakaura>
                  <edit-plater v-else-if="wago.type=='PLATER' && wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" :unsavedTable="hasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn" :customFn="wago.code.customCode"></edit-plater>
                  <edit-snippet v-else-if="wago.type=='SNIPPET' && wago.code" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn"></edit-snippet>
                  <edit-delvui v-else-if="wago.type=='DELVUI' && wago.code" @update-version="updateVersion" :cipherKey="decryptKey" :loadFn="quickLoadEditorFn"></edit-delvui>
                  <edit-common v-else-if="wago.code" @set-has-unsaved-changes="setHasUnsavedChanges" @update-encoded="updateEncoded" @update-version="updateVersion" :cipherKey="decryptKey"></edit-common>
                </div>
              </div>

              <!-- CODE REVIEW FRAME -->
              <div id="wago-codereview-container" class="wago-container" v-if="showPanel=='codereview'">
                <template v-if="codeReview">
                  <h2>{{ $t('Code Review') }}</h2>
                  <!--<p>{{ $t('Wago checks for common but problematic code.') }}</p>-->
                  <template v-if="codeReview.alerts">
                    <codereview v-if="codeReview.alertContent" :alerts="codeReview.alertContent" :name="$t('Alert!!')" @loadFn="loadEditorFn" @setComment="setCodeReviewComment" :author="wago.user && User && wago.UID && wago.UID === User.UID"></codereview>
                  </template>
                  <codereview v-else name="Review">{{ $t('No problems found.') }}</codereview>
                </template>
                <!--<p v-if="wago.code && wago.code.customCode && wago.code.customCode[0] && wago.code.customCode[0].luacheck">{{ $t('Luacheck detects various issues in lua code and reports warnings and syntax errors.') }}<br>{{ $t('Wago flags some of those warnings as alerts when run within the scope of your custom code and the WoW environment.') }}</p>-->
                <template v-for="code of wago.code.customCode">
                  <br>
                  <codereview v-if="code.luacheck" :name="'Luacheck - ' + code.name" :link="true" @loadFn="loadEditorFn(code.keypath)" :luacheck="true">{{code.luacheck}}</codereview>
                  <codereview v-if="code.metrics" :name="'Code Analysis - ' + code.name" :link="true" @loadFn="loadEditorFn(code.keypath)" :codeInfo="true" :json="code.metrics"></codereview>
                </template>
              </div>

              <div id="wago-importstring-container" class="wago-container" v-if="wago.code && wago.code.encoded">
                <textarea id="wago-importstring" class="wago-importstring" spellcheck="false">{{ wago.code.encoded }}</textarea>
              </div>

            </md-layout>

          </md-layout>
          <search v-if="wago.type === 'COLLECTION'" :contextSearch="'Collection: ' + wago._id" :collection="true"></search>
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

    <md-dialog ref="reportmodal" id="report-modal">
      <md-dialog-title>{{ $t('Thanks for helping to keep the Wago community positive!')}}</md-dialog-title>
      <md-dialog-content>
        <span>{{ $t('Please select the reason for reporting to the Wago moderation team') }}</span>
        <md-list class="report-options">
          <md-list-item @click="reportReason='Inappropriate'" :class="{selected:reportReason=='Inappropriate'}">
            <strong>{{ $t('This import is inappropriate') }}</strong>
            <span>{{ $t('Contains offensive, abusive or otherwise toxic content') }}</span>
          </md-list-item>
          <md-list-item @click="reportReason='Malicious'" :class="{selected:reportReason=='Malicious'}">
            <strong>{{ $t('This import is malicious') }}</strong>
            <span>{{ $t('Contains code designed for mal-intent') }}</span>
          </md-list-item>
          <md-list-item @click="reportReason='Other'" :class="{selected:reportReason=='Other'}">
            <strong>{{ $t('This import has another issue to bring to attention') }}</strong>
            <span>{{ $t('Please provide comments below') }}</span>
          </md-list-item>
        </md-list>
        <md-input-container>
          <label>{{ $t('Additional Information') }}</label>
          <md-textarea v-model="reportComments"></md-textarea>
        </md-input-container>
        <small>
          <md-button class="md-icon-button md-raised md-dense" @click="$refs.reportmodal.close();toggleFrame('comments')"><md-icon>comment</md-icon></md-button>
          {{ $t('If you wish to contact the author about this import, please use the comments section') }}
        </small>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="$refs.reportmodal.close()">{{ $t('Cancel') }}</md-button>
        <md-button class="md-primary" @click="submitReport()" :disabled="!reportReason || reportComments.length < 5 || reportInProgress">{{ $t('Submit Report') }}</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog ref="requestReviewModal" id="request-review-modal">
      <md-dialog-title>{{ $t('Thanks for keeping the Wago community positive!')}}</md-dialog-title>
      <md-dialog-content>
        <span>{{ $t('Please select the reason for submission') }}</span>
        <md-list class="report-options">
          <md-list-item @click="reportReason='Request Review'" :class="{selected:reportReason=='Request Review'}">
            <strong>{{ $t('Review my modifications') }}</strong>
            <span>{{ $t('After my changes I believe this now meets the Wago community standards') }}</span>
          </md-list-item>
          <md-list-item @click="reportReason='False Positive'" :class="{selected:reportReason=='False Positive'}">
            <strong>{{ $t('A second opinion') }}</strong>
            <span>{{ $t('Nothing here is negative and should not be moderated') }}</span>
          </md-list-item>
        </md-list>
        <md-input-container>
          <label>{{ $t('Comments (Optional)') }}</label>
          <md-textarea v-model="reportComments"></md-textarea>
        </md-input-container>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click="$refs.requestReviewModal.close()">{{ $t('Cancel') }}</md-button>
        <md-button class="md-primary" @click="submitReport()" :disabled="!reportReason || reportInProgress">{{ $t('Submit Report') }}</md-button>
      </md-dialog-actions>
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
          document.querySelectorAll('#sorted-screenshots > div').forEach(img => makeSortableScreenshot(img))
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

import Lightbox from 'vue-image-lightbox'
require('vue-image-lightbox/dist/vue-image-lightbox.min.css')
import Multiselect from 'vue-multiselect'
import CategorySelect from '../UI/SelectCategory.vue'
import FormattedText from '../UI/FormattedText.vue'
import ViewComments from '../UI/ViewComments.vue'
import EditCommon from '../UI/EditCommon.vue'
import EditDelvUI from '../UI/EditDelvUI.vue'
import EditSnippet from '../UI/EditSnippet.vue'
import EditPlater from '../UI/EditPlater.vue'
import EditWeakAura from '../UI/EditWeakAura.vue'
import MDTBuilder from '../UI/MDTBuilder.vue'
import BlizzHudSettings from '../UI/BlizzHudSettings.vue'
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
    'edit-delvui': EditDelvUI,
    'build-mdt': MDTBuilder,
    'blizzhud-settings': BlizzHudSettings,
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
      openCommentForm: false,
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
      delayHasUnsavedChanges: false,
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
      corruptedData: false,
      codeQueue: null,
      codeQueueTimeout: null,
      selectedApp: '',
      rememberAppChoice: false,
      reportReason: '',
      reportComments: '',
      reportInProgress: false,
      enableModeration: false,
      moderation: [],
      modAction: '',
      modComments: ''
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
      vue.http.post('/import/scan', { importString: val, type: vue.wago.type, wagolib: vue.wago.wagolib }).then((res) => {
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
      var arr = window.Categories.categories()
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
      this.corruptedData = false

      var params = {}
      params.id = wagoID
      this.version = this.$route.params.version
      if (this.version) {
        params.version = this.version
      }


      // this.$socket.send({do: 'reqWago', _id: wagoID}, (data) => {
      //   console.log('wago recvd', data)
      // })

      vue.http.get('/lookup/wago', params).then((res) => {
        if (res.error) {
          this.$store.commit('setWago', res)
          return
        }
        res.categories = res.categories.map((cat) => {
          return window.Categories.match(cat)
        })
        res.categories = res.categories.filter(c => c)

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
        this.wago.typePrefix = ''

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
          case 'CLASSIC-WEAKAURA':
          case 'TBC-WEAKAURA':
          case 'WOTLK-WEAKAURA':
            this.showPanel = this.wago.description.text ? 'description' : 'editor'
            if (this.wago.game === 'wotlk') {
              this.wago.typePrefix = 'WOTLK'
              this.typeSlug = 'wotlk-weakauras/'
            }
            else if (this.wago.game === 'tbc') {
              this.wago.typePrefix = 'TBC'
              this.typeSlug = 'tbc-weakauras/'
            }
            else if (this.wago.game === 'classic') {
              this.wago.typePrefix = 'CLASSIC'
              this.typeSlug = 'classic-weakauras/'
            }
            else if (this.wago.game === 'legion') {
              this.wago.typePrefix = 'LEGION'
              this.typeSlug = 'legion-weakauras/'
            }
            else if (this.wago.game === 'bfa') {
              this.wago.typePrefix = 'BFA'
              this.typeSlug = 'bfa-weakauras/'
            }
            else {
              this.typeSlug = 'weakauras/'
            }
            break
          case 'BLIZZHUD':
            this.showPanel = this.wago.description.text ? 'description' : 'hudsettings'
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
        this.editCategories = window.Categories.groupSets(res.categories)
        this.numCategorySets = this.editCategories.length

        for (var i = 0; i < res.categories.length; i++) {
          if (res.categories[i].id === 'beta-bfa') {
            this.gameMode = 'beta-bfa'
            break
          }
        }

        if (this.$store.state.user && this.$store.state.user.access && this.$store.state.user.access.admin && (this.$store.state.user.access.admin.moderator || this.$store.state.user.access.admin.super)) {
          this.enableModeration = true
          vue.http.get('/admin/moderation', {id: this.wago._id}).then((res) => {
            this.moderation = res
          })
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
      this.codeReview.alertContent = {}
      this.codeReview.info = {
        nloc: 0,
        ccn: 0,
        tokens: 0,
        maintainability: 100,
        globals: new Set(),
        dependencies: [],
        highlights: new Set()
      }
      if (code.tableMetrics && code.tableMetrics.dependencies) {
        this.codeReview.info.dependencies = code.tableMetrics.dependencies.filter(this.isDependancyRequired)
      }
      const blockedRegex = /^(_G\.)?(getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro|GuildDisband|GuildUninvite|UninviteUnit|SendMailMailButton|SendMailMoneyGold|MailFrameTab2)$/g

      if (code && Array.isArray(code.customCode)) {
        code.customCode.forEach((c, i) => {
          if (c.metrics && c.metrics.nloc) {
            this.codeReview.info.nloc += c.metrics.nloc || 0
            this.codeReview.info.ccn = Math.max(c.metrics.ccn, this.codeReview.info.ccn)
            this.codeReview.info.tokens += c.metrics.tokens || 0
            this.codeReview.info.globals = new Set([...this.codeReview.info.globals, ...c.metrics.globals])
            this.codeReview.info.dependencies = [...new Set([...this.codeReview.info.dependencies, ...c.metrics.dependencies])].filter(this.isDependancyRequired)
            this.codeReview.info.maintainability = Math.round(Math.min(c.metrics.maintainability, this.codeReview.info.maintainability))

            code.customCode[i].metrics.highlights = new Set()
            c.metrics.globals.forEach(g => {
              if (g.match(/^SetBinding(Spell|Item|Macro|Click)?$/)) {
                this.codeReview.info.highlights.add('keybind')
              }
              else if (g.match(/^C_VoiceChat[\.:]+SpeakText/)) {
                this.codeReview.info.highlights.add('tts')
              }
              else if (g.match(/^SendChatMessage$/)) {
                this.codeReview.info.highlights.add('chat')
              }
              else if (g.match(/^PlaySound(File)?$/)) {
                this.codeReview.info.highlights.add('audio')
              }
              else if (g.match(/^_G\[/)) {
                this.codeReview.alerts++
                this.codeReview.alertContent[c.keypath + '_G_Table'] = {name: c.name, display: this.$t('\'[-name-]\' references the _G table with a string or variable key which which could potentially be used to hide malicious intent.', {name: c.name}), keypath: c.keypath}
              }
              else if (g.match(/^getglobal\(/)) {
                this.codeReview.alerts++
                this.codeReview.alertContent[c.keypath + 'getglobal'] = {name: c.name, display: this.$t('\'[-name-]\' calls getglobal() with a string or variable key which which could potentially be used to hide malicious intent.', {name: c.name}), keypath: c.keypath}
              }
            })
          }

          if (c.luacheck) {
            let m = c.luacheck.match(/^(\d+) error/)
            if (m && m[1]) {
              this.codeReview.errors += parseInt(m[1])
            }
            m = c.luacheck.match(/^(\d+) warning/)
            if (m && m[1]) {
              this.codeReview.warnings += parseInt(m[1])
            }
            m = c.luacheck.match(/\((E\d+|W111|W121|W122)\)/)
            if (m && m.length) {
              this.codeReview.alerts += 1
              this.codeReview.alertContent['luacheck' + i] = {name: c.name, display: this.$t('\'[-name-]\' has triggered Luacheck alerts that should be reviewed.', {name: c.name}), keypath: c.keypath}
            }
            let blocked = c.luacheck.match(blockedRegex)
            if (blocked) {
              this.codeReview.securityAlert = true
              blocked = [...new Set(blocked)]
              this.codeReview.alerts += 1
              this.codeReview.alertContent['blocked' + i] = {name: lc, display: this.$t('\'[-name-]\' includes blocked functions. Blocked functions are normally blocked within the addon with normal use, and there is probably no reason you want to include this potential vulnerability.', {name: lc}) + '\n\n0:' + blocked.join('\n0:'), keypath: c.keypath}
            }
          }
        })
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
        var auras = []
        if (code.obj.d) {
          auras = [code.obj.d]
        }
        if (code.obj.c && Array.isArray(code.obj.c)) {
          auras = auras.concat(code.obj.c)
        }
        let i = 0
        for (let item of auras) {
          i++
          let itemID = item.id
          if (itemID.length > 127) {
            this.codeReview.alerts++
            this.codeReview.alertContent['longID' + itemID] = {name: itemID, display: this.$t('\'[-name-]\' id length is needlessly long.', {name: itemID}) + '(0):' + this.$t('This is the name used in the WeakAura interface and may cause an overflow error and crash the game.')}
          }

          if (!item.internalVersion || item.internalVersion < 2) {
            this.codeReview.alerts++
            this.codeReview.alertContent['oldInternalVersion' + itemID] = {name: itemID, display: this.$t('\'[-name-]\' internalVersion is very old and WeakAuras may have trouble importing.', {name: itemID})}
          }

          if (item.actions.start && item.actions.start.do_message && item.actions.start.message && item.actions.start.message_type) {
            this.codeReview.info.highlights.add('chat')
          }
          if (item.actions.finish && item.actions.finish.do_message && item.actions.finish.message && item.actions.finish.message_type) {
            this.codeReview.info.highlights.add('chat')
          }
          if (item.conditions && item.conditions.length) {
            for (let cond of item.conditions) {
              if (cond && cond.property === 'chat' && cond.value && cond.value.message && cond.value.message_type) {
                this.codeReview.info.highlights.add('chat')
              }
            }
          }

          if (item.actions.start && item.actions.start.do_sound && item.actions.start.sound) {
            this.codeReview.info.highlights.add('audio')
          }
          if (item.actions.finish && item.actions.finish.do_sound && item.actions.finish.sound) {
            this.codeReview.info.highlights.add('audio')
          }
          if (item.conditions && item.conditions.length) {
            for (let cond of item.conditions) {
              if (cond && cond.property === 'sound' && cond.value && cond.value.sound && cond.value.sound_type === 'Play') {
                this.codeReview.info.highlights.add('audio')
              }
            }
          }
        }
        var detectedThrottles = {}
        if (this.wago.code.customCode) {
          for (let item of this.wago.code.customCode) {
            if (typeof item !== 'object') {
              continue
            }
            let itemID = item.name.replace(/ - .*?$/, '')
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
              if (!ok && this.wago.codeReviewComments && this.wago.codeReviewComments.EveryFrame && this.wago.codeReviewComments.EveryFrame.falsePositive) {
                ok = 1
                result = this.$t('Author [-author-] has indicated that an undetected throttle is implemented or every-frame processing is necessary for this import.', {author: this.wago.codeReviewComments.EveryFrame.author.name})
              }
              else if (!ok) {
                this.codeReview.alerts++
              }
              this.codeReview.alertContent['textEveryFrameDisplay' + itemID] = {name: itemID, display: this.$t('\'[-name-]\' updates its display text every frame.', {name: item.name}) + `(${ok}):${result}`, keypath: item.keypath}
            }
            else if (item.triggerEveryFrame) {
              let lua = item.lua
              // remove comments and function params
              lua = lua.replace(/--.*?$/g, '').replace(/^[^]*?\)/m, '').trim()
              let result
              let ok
              let trigger = item.name.match(/(\(\d+\))/)
              if (lua.match(/(time|GetTime)\(\)/)) {
                result = this.$t('Timing or throttling code is detected.')
                ok = 1
                trigger = item.name.match(/^Trigger (\(\d+\))/)
                if (trigger && trigger[1]) {
                  detectedThrottles[item.name + trigger[1]] = true
                }
              }
              else if (trigger && trigger[1] && detectedThrottles[item.name + trigger[1]]) {
                result = this.$t('Timing or throttling code is detected in trigger.')
                ok = 1
              }
              else {
                result = this.$t('Triggers that check on every frame should be throttled so that the processing occurs on an interval. No throttle could be detected here.')
                ok = 0
              }
              if (!ok && this.wago.codeReviewComments && this.wago.codeReviewComments.EveryFrame && this.wago.codeReviewComments.EveryFrame.falsePositive) {
                ok = 1
                result = this.$t('Author [-author-] has indicated that an undetected throttle is implemented or every-frame processing is necessary for this import.', {author: this.wago.codeReviewComments.EveryFrame.author.name})
              }
              else if (!ok) {
                this.codeReview.alerts++
              }
              this.codeReview.alertContent['textEveryFrameTrigger' + itemID] = {name: item.name, display: this.$t('\'[-name-]\' is processed every frame.', {name: item.name}) + `(${ok}):${result}`, keypath: item.keypath}
            }
          }
        }
      }
      else if (this.wago.type.match(/PLATER/)) {
        if ((code.obj.type === 'script' && !code.obj['2']) || (code.obj.type === 'hook' && !code.obj['1'])) {
          this.corruptedData = true
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

    isDependancyRequired (dep) {
      if (this.wago.type.match(/WEAKAURA/)) {
        return !dep.match(/^WeakAura|((Ace(Console|Event|GUI|Serializer|Timer)-3\.0)AceGUI-3\.0-SharedMediaWidgets|Archivist|CallbackHandler-1.0|Lib(Compress|CustomGlow-1\.0|DataBroker-1\.1|DBIcon-1\.0|Deflate|GetFrame-1\.0|RangeCheck-2\.0|Serialize|SharedMedia-3\.0|SpellRange-1\.0))$/i)
      }
      else if (this.wago.type.match(/PLATER/)) {
        return !dep.match(/^Plater|((Ace(Addon|Comm|Config|Console|DB|DBOptions|Event|GUI|Locale|Serializer|Timer)-3\.0)|CallbackHandler-1.0|DF|Lib(Compress|CustomGlow-1\.0|DataBroker-1\.1|DBIcon-1\.0|Deflate|RangeCheck-2\.0|SharedMedia-3\.0|Translit-1\.0))$/i)
      }
      return true
    },

    displayExpansion: function (item) {
      if (item.type !== 'WEAKAURA') {
        return ''
      }
      else {
        return item.game.toUpperCase() + '-'
      }

      return ''
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
        console.log(e)
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
        this.delayHasUnsavedChanges = bool
        setTimeout(() => { // hack to fix bug with md lib
          this.hasUnsavedChanges = this.delayHasUnsavedChanges
        })
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
    sendToApp (mode) {
      let app = this.selectedApp || window.localStorage.getItem('Selected-Desktop-App')
      if (!app && mode === 'open') {
        app = 'WagoApp'
      }
      else if (!app || mode === 'ask') {
        if (!this.selectedApp) {
          this.selectedApp = 'WagoApp'
        }
        this.$refs.sendToAppDialog.open()
        return
      }

      if (this.rememberAppChoice) {
        window.localStorage.setItem('Selected-Desktop-App', app)
        this.rememberAppChoice = false
      }
      else {
        this.selectedApp = ''
      }

      if (app == 'WagoApp') {
        window.location = `wago-app://weakauras/${this.wago._id}`
      }
      else if (app == 'WeakAurasCompanion') {
        window.location = `weakauras-companion://wago/push/${this.wago.slug}`
      }

      // if (app == 'WagoApp') {
      //   openCustomProtocol(`wago-app://weakauras/${this.wago._id}`,
      //     () => {
      //       // fail
      //       this.selectedApp = ''
      //       window.localStorage.removeItem('Selected-Desktop-App')
      //       this.$refs.sendToAppDialog.open()
      //       window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WagoApp, please make sure you have it installed and running'))
      //     },
      //     () => {
      //       // success
      //       window.eventHub.$emit('showSnackBar', this.$t('WeakAura sent to WagoApp'))
      //     },
      //     () => {
      //       // unsupported
      //       this.selectedApp = ''
      //       window.localStorage.removeItem('Selected-Desktop-App')
      //       this.$refs.sendToAppDialog.open()
      //       window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WagoApp, please make sure you have it installed and running'))
      //     }
      //   )
      // }
      // else if (app == 'WeakAurasCompanion') {
      //   openCustomProtocol(`weakauras-companion://wago/push/${this.wago.slug}`,
      //     () => {
      //       // fail
      //       this.selectedApp = ''
      //       window.localStorage.removeItem('Selected-Desktop-App')
      //       this.$refs.sendToAppDialog.open()
      //       window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WeakAura Companion app, please make sure you have it installed and running'))
      //     },
      //     () => {
      //       // success
      //       window.eventHub.$emit('showSnackBar', this.$t('WeakAura sent to Companion'))
      //     },
      //     () => {
      //       // unsupported
      //       this.selectedApp = ''
      //       window.localStorage.removeItem('Selected-Desktop-App')
      //       this.$refs.sendToAppDialog.open()
      //       window.eventHub.$emit('showSnackBar', this.$t('Unable to detect WeakAura Companion app, please make sure you have it installed and running'))
      //     }
      //   )
      // }
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
    newComment () {
      this.showPanel = 'comments'
      this.$nextTick(() => this.openCommentForm = true)
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
    setCodeReviewComment (id, flag) {
      let comment = {
        author: this.wago.user,
        date: Date.now(),
        falsePositive: flag,
        format: 'bbcode'
      }
      this.$set(this.wago.codeReviewComments, id, comment)
      this.parseCodeObject(this.wago.code)
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
            vue.$nextTick(function () {
              setupConfigEvents(vue)
            })
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
          vue.$nextTick(function () {
            setupConfigEvents(vue)
          })
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

    autoCompleteUserName: async function (q) {
      return (await this.http.get('/search/username', {name: q.q})).map(x => {x.name = x.name.replace(/\s/g, '_'); x.html = x.html.replace(/\s/g, '_'); return x})
    },

    escapeText: function(str) {
      return (str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")
    },

    submitReport: async function () {
      this.reportInProgress = true
      const res = await this.http.post('/wago/report', {
        wagoID: this.wago._id,
        reason: this.reportReason,
        comments: this.reportComments
      })
      this.reportInProgress = false
      if (res.success) {
        this.reportReason = ''
        this.reportComments = ''
        window.eventHub.$emit('showSnackBar', this.$t('Thank you for your report, we will take appropriate action as soon as possible'))
        this.$refs.reportmodal.close()
        this.$refs.requestReviewModal.close()
      }
    },
    submitModReport: async function () {
      this.reportInProgress = true
      const res = await this.http.post('/admin/moderate', {
        wagoID: this.wago._id,
        action: this.modAction,
        comments: this.modComments
      })
      this.reportInProgress = false
      if (res.success) {
        this.modAction = ''
        this.modComments = ''
        window.eventHub.$emit('showSnackBar', this.$t('Mod action is saved'))
        this.$set(this.wago.visibility, 'moderated', res.moderated)
        this.$set(this.wago, 'moderatedComment', res.moderatedComment)
        this.$set(this.wago.visibility, 'deleted', res.deleted)
        this.moderation.push(res.report)
      }
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
<style lang="scss">
#sticky-header {
  padding: 16px;
  display: flex;
  flex-direction: row;
  background: #333333;
  margin: 0 0 16px 0;
  position: sticky;
  top: 0;
  z-index: 20;
  h1 {
    flex-grow: 1;
    align-self: center;
    font-size: 18px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    margin: 0;
    div {
      font-size: 14px;
      opacity: .7;
      span {margin-right: 16px}
    }
  }
  .md-button {
    margin: 0 4px;
  }
}
#copyFail textarea { max-height: 110px; min-height:110px }
#copyFail .md-input-container { display: inline-block; position: relative}

#view-wago > div { position: relative }
#wago-header.md-card { padding:0 16px!important; flex: 1; margin: 0;}
#wago-header.md-card h3 { margin: 0 }
#wago-header.md-card h3 + .md-subheader { padding:0; min-height:0 }

#wago-header .md-card-header { padding-left: 0; padding-right: 4px; min-height: 160px; }
#wago-header .md-card-header .item { padding-left: 0!important; float: left; display: inline; margin-right: 16px; vertical-align: middle }
@media (min-width: 601px) {
  #wago-header .md-card-header .item+.item { margin-left: 16px; margin-right: 0 }
}
#wago-header .md-card-header .item .md-title { font-weight: 500; line-height: 20px; font-size: 14px }
#wago-header .md-card-header .item .md-subhead { font-weight: 500; line-height: 20px; font-size: 14px; opacity: .54 }
#wago-header .md-card-header .item .md-subhead.has-link { opacity: 1 }

#wago-tabs { flex: 0 1 auto; flex-direction: column; margin: 0; }
#wago-tabs .md-button-toggle { flex-direction: column; padding: 0; }
#wago-tabs .md-button-toggle button { text-align:left }

#wago-content { flex: 1; flex-direction: column }
#wago-content > div { margin: 0 8px 16px 0; width: 100%; }
#addCollectionButton, #newCommentButton { margin-top: 0 }

#import-meta {
  margin-bottom: 16px;
}

#wago-actions {
  margin: 0 -16px;
  display: flex;
  flex: 1;
  padding: 0;
  align-items: flex-start;
  background: #444;
  border-top: 1px solid #222;
  span {
    flex-grow: 1;
  }
  button {
    margin: 0;
    border-left: 1px solid #222;
    &:first-child {
      border-right: 1px solid #222;
      border-left: 0;
    }
  }
}

#wago-description {
  .screenshots {
    padding-bottom: 8px;
    border-bottom: 1px solid #333;
    img {
      max-width: 200px;
      max-height: 80px;
      margin: 0 8px 8px 0;
      cursor: pointer;
    }
  }
}
.copy-import-button { border: 2px solid #c1272d; border-radius: 25px; margin: 4px 28px; display: inline-block }
#wago-collections-container button { margin-left: -2px }

#helpImportingButton, #helpAppButton {position: absolute; right: -3px; top: -3px; margin: 0;}
#helpImportingButton:hover, #helpAppButton:hover {background: rgba(193,39,45,.2)}
#helpImportingButton i.md-icon, #helpAppButton i.md-icon {color:inherit}
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

.wago-container { padding: 0 0 0 16px; }
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
.changelog-text { border-bottom: 1px solid #333; margin-bottom: 8px; }
.md-table tbody .md-table-row.changelog-row { border-top-color: #333;}

#import-info { float: right; padding: 8px; background: #333; margin: 0 0 16px 16px; border: 2px solid #009690; border-radius:2px; box-shadow: 0 1px 5px rgb(0 0 0 / 20%), 0 2px 2px rgb(0 0 0 / 14%), 0 3px 1px -2px rgb(0 0 0 / 12%); }
#import-info em { font-weight: bold; font-style: normal; padding-bottom: 4px; display: inline-block; color: #009690}
#import-info br + em { padding-top: 4px; }
#import-info > span span:before { content: ': '; color: #ddd}
#import-info .metricsOK {font-weight: bold; color: #56f442}
#import-info .metricsWarn {font-weight: bold; color: #cc9700}
#import-info .metricsAlert {font-weight: bold; color: #e6000a}
@media (max-width: 600px) {
  #import-info {
    float: none;
    margin: 0 2px 8px;
  }
  #comments {
    .md-card {
      margin: 0 16px 16px 0;
    }
  }
}


#embed-content { display: flex }
#embed-inputs { flex: 2 1 auto }
#embed-preview { flex: 1.5 1 auto }
#embed-inputs .md-select { max-width: 200px}
#embed-inputs .md-has-select.md-input-container {margin-bottom:0}
#embed-inputs .md-has-select.md-input-container:after {height:0}

.md-table .md-table-head.md-end, .md-table .md-table-cell.md-end .md-table-cell-container { text-align: right; justify-content: flex-end }

#report-modal .md-title, #request-review-modal .md-title {
  color: #c0272d;
  border-bottom: 1px solid #777;
}
#report-modal .md-list:after, #request-review-modal .md-list:after {
  content: none!important;
}
#report-modal .md-list-item, #request-review-modal .md-list-item {
  font-size: 14px;
  padding: 8px;
  border: 4px solid #212121;
}
#report-modal .md-list-item:hover, #request-review-modal .md-list-item:hover {
  border: 4px solid #3a3a3a;
}
#report-modal .md-list-item.selected, #request-review-modal .md-list-item.selected {
  border: 4px solid #96282B;
}
#report-modal .md-list-item .md-list-item-container, #request-review-modal .md-list-item .md-list-item-container {
  flex-direction: column!important;
  align-items: flex-start!important;
  line-height: 18px!important;
  min-height:40px!important;
}
#report-modal .md-list-item strong, #report-modal .md-list-item span, #request-review-modal .md-list-item strong, #request-review-modal .md-list-item span {
  display: block;
}
#report-modal small {
  display: flex;
  align-items: center;
}
#report-modal small button {
  box-shadow: 0 1px 1px #000;
}


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
  #wago-description {
    max-width: calc(100vw - 32px);
    overflow: hidden;
  }
  #sendToDesktopAppBtn {display: none}
  #copyImportBtn {
    padding: 4px;
    min-width: 36px;
    border: 0;
    span, button {display: none}
  }
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
.SmallTooltip { padding: 4px; border:1px solid black; height: auto; max-width: 450px; white-space:normal; background: #222; right: -52px; }

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

#app-info {width: 800px;}
#app-info p {margin-bottom: 16px; line-height: 24px;}
#app-info #app-choice {display: flex; flex-direction: row; justify-content: space-evenly;}
#app-info #app-choice .select-app {width: 240px; max-width: 33%; text-align: center; border: 1px solid #555; display: flex; flex-direction: column;}
#app-info #app-choice .select-app.selected {outline: 6px solid #C0272DBB}
#app-info #app-choice .select-app:hover { cursor: pointer; background: #333}
#app-info #app-choice .app-logo {height: 90px; margin: 16px; justify-content:center; display: flex; align-items: flex-end}
#app-info #app-choice .app-logo img {max-height: 100%; max-width: 100%;}
#app-info #app-choice .app-name {font-size: 120%; font-weight: bold; margin-bottom: 16px}
#app-info #app-choice .app-link {background: #444; border-top: 1px solid #555; padding: 8px 16px; flex:1; display: flex; align-items: center; justify-content: center}
#app-info #app-choice .app-link:hover {background: #555}
#app-info #app-choice .app-link a {font-weight: bold; font-size: 90%; display: block; color: white}
#app-info #app-choice .app-link a:hover {text-decoration: none;}
#app-info .app-info {margin-top: 32px; min-height: 96px; line-height: 32px}
#app-info .app-info img {width: 48px; margin-right: 8px}

.moderation-item {margin-bottom:16px;padding: 8px;background: #333;}
.moderation-item.mod-Report {border: 1px solid #a26900;}
.moderation-item.mod-Report strong {color: #e2a027;}
.moderation-item.mod-Review {border: 1px solid #0075a2;}
.moderation-item.mod-Review strong {color: #00aff3;}
.moderation-item .md-avatar {margin: 8px 8px 8px 0;}
.mod-action-buttons {align-items: center; padding:0; padding-bottom:16px;}

</style>
