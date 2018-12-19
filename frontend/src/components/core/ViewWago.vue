<template>
  <div id="view-wago">
    <ui-warning v-if="wago.error === 'page_not_found'" mode="alert">
      404 {{ $t("No results found") }}
    </ui-warning>
    <ui-warning v-else-if="(wago.type === 'MDT' && (!User || !User.access || !User.access.beta))" mode="alert">
      Error: Wago beta access is required to view this page.
    </ui-warning>
    <ui-warning v-else-if="wago.error" mode="alert">
      Error: {{ wago.error }}
    </ui-warning>
    <ui-loading v-else-if="!wagoExists"></ui-loading>
    <div v-else>
      <md-card id="wago-header" ref="header">
        <md-layout>
          <div class="floating-header">
            <h3>{{ wago.name }}</h3>
            <md-subheader>{{ wago.type }}</md-subheader>
          </div>          
          <!-- ACTIONS -->
          <md-card-actions id="wago-actions" ref="action-buttons">
            <md-button v-if="User.UID" @click="toggleFavorite">
              <md-icon v-if="wago.myfave">star</md-icon>
              <md-icon v-else>star_border</md-icon> {{ $t("Favorite") }}
            </md-button>
            <md-button v-if="wago.user && User && wago.UID && wago.UID === User.UID && wago.code && wago.code.encoded" @click="$refs['newImportDialog'].open()" id="newImportButton"><md-icon>input</md-icon> {{ $t("Import new string") }}</md-button>
            <md-button v-if="hasUnsavedChanges && wago.code && wago.code.encoded && !wago.alerts.blacklist" @click="copyEncoded" class="copy-import-button">
              <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
              <md-tooltip md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("You have unsaved changes") }}</strong><br>{{ $t("Be sure to save or fork to generate a new string with your modifications") }}</md-tooltip>
            </md-button>
            <md-button v-else-if="wago.code && wago.code.encoded && !wago.alerts.blacklist" @click="copyEncoded" class="copy-import-button">
              <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
            </md-button>
            <md-button v-if="wago.image && wago.image.files.tga" :href="wago.image.files.tga" class="copy-import-button"><md-icon>file_download</md-icon> {{ $t("Download tga file") }}</md-button>
          </md-card-actions>
          <md-dialog v-if="wago.user && User && wago.UID && wago.UID === User.UID" md-open-from="#newImportButton" md-close-to="#newImportButton" ref="newImportDialog" id="newImportDialog">
            <md-dialog-title>{{ $t("Import new string") }}</md-dialog-title>

            <md-dialog-content>
              <md-input-container :class="{ 'md-input-invalid': newImportString && newImportStringStatus.indexOf('Invalid') >= 0, 'md-input-status': newImportStringStatus }">
                <label>{{ $t("Paste a new [-type-] string to update this Wago", {type: wago.type.toLowerCase() }) }}</label>
                <md-input v-model="newImportString"></md-input>
                <span class="md-error" v-if="newImportStringStatus.length>0">{{ newImportStringStatus }}</span>
              </md-input-container>
            </md-dialog-content>

            <md-dialog-actions>
              <md-button class="md-primary" @click="onUpdateImportString()" :disabled="!newImportString || newImportStringStatus.indexOf('Invalid') >= 0">{{ $t("Update") }}</md-button>
              <md-button class="md-primary" @click="$refs['newImportDialog'].close()">{{ $t("Cancel") }}</md-button>
            </md-dialog-actions>
          </md-dialog>
        </md-layout>
        <md-card-header>
          <md-avatar>
            <ui-image :img="wago.user.avatar"></ui-image>
          </md-avatar>
          <div class="item">
            <div class="md-title" v-if="wago.type === 'COLLECTION' && wago.UID && wago.user.searchable" v-html="$t('Collected by [-name-]', {name: `<a href='/p/${encodeURIComponent(wago.user.name)}' class='${wago.user.roleClass}'>${wago.user.name}</a>`, 'interpolation': {'escapeValue': false}})"></div>
            <div class="md-title" v-else-if="wago.type === 'COLLECTION' && wago.UID" v-html="$t('Imported by [-name-]', {name: `<span class='${wago.user.roleClass}'>${wago.user.name}</span>`, 'interpolation': {'escapeValue': false}})"></div>
            <div class="md-title" v-else-if="wago.UID && wago.user.searchable" v-html="$t('Imported by [-name-]', {name: `<a href='/p/${encodeURIComponent(wago.user.name)}' class='${wago.user.roleClass}'>${wago.user.name}</a>`, 'interpolation': {'escapeValue': false}})"></div>
            <div class="md-title" v-else-if="wago.UID" v-html="$t('Imported by [-name-]', {name: `<span class='${wago.user.roleClass}'>${wago.user.name}</span>`, 'interpolation': {'escapeValue': false}})"></div>
            <div class="md-title" v-else>{{ $t("Imported by guest") }}</div>
            <div class="md-subhead">{{ wago.date.modified | moment('MMM Do YYYY') }} [{{ wago.patch }}]</div>
          </div>
          <div class="item">
            <div class="md-title">{{ $t("[-count-] star", { count: wago.favoriteCount }) }}</div>
            <div class="md-subhead">{{ $t("[-count-] view", { count: wago.viewCount }) }}</div>
          </div>
          <div class="item">
            <div class="md-title">{{ $t("Permalink") }}</div>
            <div class="md-subhead has-link"><a :href="wago.url" @click.prevent="copyURL">{{ wago.url }}</a></div>
          </div>
          <div class="item" style="float:right" v-if="wago.type === 'WEAKAURA' && companionRTC && wago.code && wago.code.encoded && !wago.alerts.blacklist">
            <md-button @click="sendToCompanionApp" class="copy-import-button">
              <md-icon>airplay</md-icon> {{ $t("Send to WeakAura Companion App") }}
            </md-button>
          </div>
          <div id="tags">
            <md-chip v-for="(cat, n) in wago.categories" :key="n" :class="cat.cls" disabled v-if="cat.text && (n<5 || showMoreCategories)">{{ cat.text }}</md-chip>
            <span @click="viewAllCategories()"><md-chip v-if="wago.categories.length > 5 && !showMoreCategories" class="show_more">{{ $t("[-count-] more", {count: wago.categories.length - 5}) }}</md-chip></span>
          </div>
          <md-layout id="thumbnails">
            <template v-for="video in wago.videos">
              <a class="showvid" :href="video.url" @click.prevent="showVideo(video.embed)"><md-icon>play_circle_outline</md-icon><md-image :md-src="video.thumb"></md-image></a>
            </template>
            <lightbox id="mylightbox" :images="wago.screens"></lightbox>
          </md-layout>
        </md-card-header>
      </md-card>

      <md-card id="wago-floating-header" v-if="showFloatingHeader">
        <div class="floating-header">
          <div>
            <h3>{{ wago.name }}</h3>
            <md-subheader>{{ wago.type }}</md-subheader>
          </div>
          <div>
            <md-button @click="toTop"><md-icon>arrow_upward</md-icon> {{ $t("To top") }}</md-button>
          </div>
          <md-button v-if="hasUnsavedChanges && wago.code && wago.code.encoded && !wago.alerts.blacklist" @click="copyEncoded" class="copy-import-button">
            <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
            <md-tooltip md-direction="bottom" class="CopyWarningTooltip"><strong>{{ $t("You have unsaved changes") }}</strong><br>{{ $t("Be sure to save or fork to generate a new string with your modifications") }}</md-tooltip>
          </md-button>          
          <md-button v-else-if="wago.code && wago.code.encoded && !wago.alerts.blacklist" @click="copyEncoded" class="copy-import-button">
            <md-icon>assignment</md-icon> {{ $t("Copy [-type-] import string", {type: wago.type}) }}
          </md-button>
        </div>
      </md-card>

      <div id="wago-flex-container">
        <div id="wago-col-main">
          <md-layout>
            <md-layout id="wago-tabs">
              <!-- FRAME TOGGLES -->
              <md-button-toggle class="md-accent" md-single>
                <md-button v-bind:class="{'md-toggle': showPanel === 'config'}" v-if="wago.user && User && wago.UID && wago.UID === User.UID" @click="toggleFrame('config')">{{ $t("Config") }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'description'}" @click="toggleFrame('description')">{{ $t("Description") }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'comments'}" @click="toggleFrame('comments')"><span v-if="hasUnreadComments && showPanel !== 'comments'" class="commentAttn">{{$t("NEW")}}!! </span>{{ $t("[-count-] comment", {count: wago.commentCount }) }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'versions'}" v-if="wago.versions && wago.versions.total > 1" @click="toggleFrame('versions')" ref="versionsButton">{{ $t("[-count-] version", { count: wago.versions.total }) }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'collections'}" v-if="wago.type !== 'COLLECTION'" @click="toggleFrame('collections')">{{ $t("[-count-] collection", {count:  wago.collectionCount}) }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'embed'}" v-if="!wago.alerts.blacklist && wago.code && wago.code.encoded" @click="toggleFrame('embed')">{{ $t("Embed") }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'builder'}" v-if="wago.type === 'MDT'" @click="toggleFrame('builder')">{{ $t("Builder") }}</md-button>
                <md-button v-bind:class="{'md-toggle': showPanel === 'editor'}" v-if="wago.code" @click="toggleFrame('editor')">{{ $t("Editor") }}</md-button>
                <!--<md-button v-bind:class="{'md-toggle': showPanel === 'codereview'}" v-if="(User && User.access && (User.access.beta)) && wago.type === 'WEAKAURA' && wago.code" @click="toggleFrame('codereview')">{{ $t("Code Review") }}</md-button>-->
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
              <ui-warning v-if="wago.expires" mode="info">
                {{ $t("This import will expire in [-time-]", {time: this.$moment(wago.expires).fromNow() }) }}<br>
              </ui-warning>

              <ui-warning v-if="wago.fork && wago.fork._id" mode="info" :html="$t('This is a fork of [-id-][-name-]', {id: wago.fork._id, name: wago.fork.name})"></ui-warning>

              <ui-warning v-if="wago.visibility && wago.visibility.private">
                {{ $t("This import is private only you may view it") }}
              </ui-warning>
              <ui-warning v-else-if="wago.visibility && wago.visibility.hidden">
                {{ $t("This import is hidden only those with the URL may view it") }}
              </ui-warning>

              <ui-warning v-if="wago.alerts.blacklist" mode="alert">
                {{ $t("Blacklisted code detected") }}<br>
                <div v-for="func in wago.alerts.blacklist">{{ func }}</div>
              </ui-warning>
              <ui-warning v-else-if="wago.alerts.malicious" mode="alert">
                {{ $t("Possible malicious code detected") }}<br>
                <div v-for="func in wago.alerts.malicious">{{ func }}</div>
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
                  <md-input-container>
                    <label for="visibilty">{{ $t("Visibility") }}</label>
                    <md-select name="visibilty" id="visibilty" v-model="editVisibility" @selected="onUpdateVisibility()">
                      <md-option value="Public" selected>{{ $t("Public") }}</md-option>
                      <md-option value="Hidden">{{ $t("Hidden (only viewable with link)") }}</md-option>
                      <md-option value="Private">{{ $t("Private (only you may view)") }}</md-option>
                    </md-select>
                  </md-input-container>
                  <div v-if="!wago.image && !wago.audio">
                    <div>
                      <label id="categoryLabel">{{ $t("Categories") }}</label>
                      <md-button class="md-icon-button md-raised" @click="numCategorySets++">
                        <md-icon>add</md-icon>
                      </md-button>
                      <div v-for="n in numCategorySets">
                        <div class="has-category-select">
                          <category-select :selectedCategories="editCategories[n-1]" @update="cat => {editCategories[n-1] = cat; onUpdateCategories()}" :type="wago.type.toUpperCase()"></category-select>
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
                      <vddl-list :list="wago.screens" :horizontal="true" :drop="onVideoMoved">
                        <vddl-draggable v-for="(item, index) in wago.videos" :key="item._id" :draggable="item" :index="index" effect-allowed="move" :moved="onVideoMoveOut">
                          <span class="vddl-delete" @click="onVideoDelete(index)">❌</span>
                          <md-image :md-src="item.thumb"></md-image>
                        </vddl-draggable>
                      </vddl-list>
                    </div>
                    <div v-if="wago.screens.length > 0" class="config-screenshots">
                      <strong>{{ $t("Screenshots") }}</strong>
                      <vddl-list :list="wago.screens" :horizontal="true" :drop="onScreenshotMoved">
                        <vddl-draggable v-for="(item, index) in wago.screens" :key="item._id" :draggable="item" :index="index" effect-allowed="move" :moved="onScreenMoveOut">
                          <span class="vddl-delete" @click="onScreenDelete(index)">❌</span>
                          <md-image :md-src="item.src"></md-image>
                        </vddl-draggable>
                      </vddl-list>
                    </div>
                  </div>

                  <md-card-actions>
                    <md-button id="deleteWago" @click="$refs['deleteWago'].open()">Delete</md-button>
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
                  <formatted-text :text="wago.description.text && wago.description.text.length ? wago.description : {text: $t('No description for this import has been provided')}"></Formatted-text>
                </div>
              </div>

              <div id="wago-comments-container" class="wago-container" v-if="showPanel=='comments'">
                <div id="wago-comments">
                  <view-comments :comments="wago.comments" :commentTotal="wago.commentCount" :wagoID="wago._id"></view-comments>
                </div>
              </div>

              <!-- VERSIONS FRAME -->
              <div id="wago-versions-container" class="wago-container" v-if="showPanel=='versions'">
                <h2>{{ $t("Previous versions") }}</h2>
                <md-card id="wago-versions">
                  <md-table @select="selectVersion">
                    <md-table-header>
                      <md-table-row>
                        <md-table-head>{{ $t("Import Date") }}</md-table-head>
                        <md-table-head md-numeric>{{ $t("Iteration") }}</md-table-head>
                        <md-table-head md-numeric>{{ $t("Size") }}</md-table-head>
                      </md-table-row>
                    </md-table-header>

                    <md-table-body>
                      <md-table-row v-for="(ver, key) in wago.versions.versions" v-bind:key="key" :md-item="ver" md-auto-select md-selection>
                        <md-table-cell>
                          {{ ver.date | moment("dddd, MMMM Do YYYY, h:mm a") }}
                          <md-chip v-if="key===0">{{ $t("Latest version") }}</md-chip>
                          <md-chip v-if="ver.version===version || (!version && key===0)">{{ $t("Viewing this version") }}</md-chip>
                        </md-table-cell>
                        <md-table-cell md-numeric>
                          {{ ver.version }}
                        </md-table-cell>
                        <md-table-cell md-numeric>
                          {{ ver.size }}
                        </md-table-cell>
                      </md-table-row>
                    </md-table-body>
                  </md-table>
                  <md-button v-if="showMoreVersions" @click="loadMoreVersions"><md-icon>list</md-icon> {{ $t("Load more versions" )}}</md-button>
                </md-card>
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
                    <md-table @select="selectVersion">
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
                            <router-link :to="coll.slug">{{ coll.name }}</router-link>
                          </md-table-cell>
                          <md-table-cell>
                            {{ coll.modified | moment("dddd, MMMM Do YYYY, h:mm a") }}
                          </md-table-cell>
                          <md-table-cell class="userlink">
                            <md-avatar><ui-image :md-src="coll.user.avatar" alt="Avatar"></ui-image></md-avatar> 
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
                      <md-subheader>{{ $t("Preview") }}</md-subheader>
                      <div id="embed-preview">
                        <span :id="'wago-'+wago._id" class="wagoEmbed">
                          <a :href="wago.url" class='vr'><img src="https://media.wago.io/logo-57x57.png"></a>
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
                  <build-mdt v-if="wago.type=='MDT'" @set-has-unsaved-changes="setHasUnsavedChanges" @update-encoded="updateEncoded"></build-mdt>
                </div>
              </div>

              <!-- EDITOR FRAME -->
              <div id="wago-editor-container" class="wago-container" v-if="showPanel=='editor'">
                <div id="wago-editor">
                  <edit-weakaura v-if="wago.type=='WEAKAURA'" @set-has-unsaved-changes="setHasUnsavedChanges" :unsavedTable="hasUnsavedChanges" @update-encoded="updateEncoded"></edit-weakaura>
                  <edit-snippet v-else-if="wago.type=='SNIPPET'"></edit-snippet>
                  <edit-common v-else @set-has-unsaved-changes="setHasUnsavedChanges" @update-encoded="updateEncoded"></edit-common>
                </div>
              </div>

              <!-- CODE REVIEW FRAME -->
              <div id="wago-codereview-container" class="wago-container" v-if="showPanel=='codereview'">
                <div v-if="wago && wago.codeReview">
                  Global variables defined: {{ wago.codeReview.countGlobals }}.<br>
                  Profile runtime: {{ (parseFloat(wago.codeReview.profileRunTime) * 1000).toFixed(2) }}ms.<br>
                  <div v-for="(errors, aura) in wago.codeReview.errors" :key="aura">Error in {{aura}}: 
                    <div v-for="(err, index) in errors" :key="index" style="margin-left:12px">{{ err.block }}: {{err.message}}</div>
                  </div>
                  <md-table>
                    <md-table-header>
                      <md-table-row>
                        <md-table-head>WeakAura</md-table-head>
                        <md-table-head>Code Block</md-table-head>
                        <md-table-head>Function</md-table-head>
                        <md-table-head md-numeric>Called # Times</md-table-head>
                        <md-table-head md-numeric>Processing Time</md-table-head>
                      </md-table-row>
                    </md-table-header>

                    <md-table-body>
                      <template v-for="(row, aura) in wago.codeReview.profile">
                        <md-table-row v-for="(code, index) in row" :key="index" v-if="!code.func">
                          <md-table-cell>{{ aura }}</md-table-cell>
                          <md-table-cell>{{ code.block }}</md-table-cell>
                          <md-table-cell></md-table-cell>
                          <md-table-cell md-numeric></md-table-cell>
                          <md-table-cell md-numeric>{{ (parseFloat(code.time) * 1000).toFixed(2) }}ms</md-table-cell>
                        </md-table-row>
                        <md-table-row v-for="(code, index) in row" :key="index" v-if="code.func">
                          <md-table-cell>{{ aura }}</md-table-cell>
                          <md-table-cell>{{ code.block }}</md-table-cell>
                          <md-table-cell>{{ code.func }}()</md-table-cell>
                          <md-table-cell md-numeric>{{ code.calls }}</md-table-cell>
                          <md-table-cell md-numeric>{{ (parseFloat(code.time) * 1000).toFixed(2) }}ms</md-table-cell>
                        </md-table-row>
                      </template>
                    </md-table-body>
                  </md-table>

                </div>
                <div v-else>Loading...</div>
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

function setupPasteImage (vue) {
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
}

import Categories from '../libs/categories'
import Lightbox from 'vue-simple-lightbox'
import Multiselect from 'vue-multiselect'
import CategorySelect from '../UI/SelectCategory.vue'
import Search from '../core/Search.vue'

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}

export default {
  components: {
    'view-comments': require('../UI/ViewComments.vue'),
    'formatted-text': require('../UI/FormattedText.vue'),
    Lightbox,
    'edit-common': require('../UI/EditCommon.vue'),
    'edit-snippet': require('../UI/EditSnippet.vue'),
    'edit-weakaura': require('../UI/EditWeakAura.vue'),
    'build-mdt': require('../UI/MDTBuilder.vue'),
    editor: require('vue2-ace-editor'),
    Multiselect,
    CategorySelect,
    Search
  },
  created: function () {
    this.fetchWago()
    window.addEventListener('scroll', this.watchScroll)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
  },
  data: function () {
    return {
      companionRTC: false,
      videoEmbedHTML: '',
      scanID: '',
      isScanning: false,
      showDescription: true,
      showComments: true,
      showPanel: 'description',
      showEditor: (window.innerWidth > 800),
      showConfig: false,
      showVersions: (parseInt(this.$route.params.version) > 0),
      showMoreVersions: true,
      showCollections: false,
      showMoreCollections: true,
      showEmbed: false,
      embedStyle: 'dark',
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
      editVisibility: 'Public',
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
      newImportString: '',
      newImportStringStatus: '',
      addCollectionName: '',
      numCategorySets: 1,
      gameMode: '',
      hasUnsavedChanges: false
    }
  },
  watch: {
    '$route': 'fetchWago',
    pasteURL: 'onUpdatePasteURL',
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
      return (parseInt(this.$route.params.version) > 0)
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
          embedTheme = {buttonBG: '#FFF', buttonHover: '#F4F4F4', textColor: 'rgba(0,0,0,.87)', logo: 'https://media.wago.io/logo-57x57.png'}
        }
        else {
          embedTheme = {buttonBG: '#000', buttonHover: '#040404', textColor: 'rgba(255,255,255,.87)', logo: 'https://media.wago.io/logo-57x57.png'}
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
    editorTheme: function () {
      if (!this.$store.state.user || !this.$store.state.user.config || !this.$store.state.user.config.editor) {
        return 'tomorrow'
      }
      else {
        return this.$store.state.user.config.editor || 'tomorrow'
      }
    }
  },
  methods: {
    loadCodeReview () {
      var vue = this
      vue.http.get('/lookup/codereview', {wagoID: this.wago._id}).then((res) => {
        if (res) {
          vue.$set(vue.wago, 'codeReview', res)
          vue.$store.commit('setWago', vue.wago)
        }
      }).catch(e => {
        console.error(e)
      })
    },
    fetchWago () {
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
      this.showVersions = (parseInt(this.$route.params.version) > 0)
      this.showMoreVersions = true
      this.showCollections = false
      this.showMoreCollections = true
      this.showEmbed = false
      this.newImportString = ''
      this.newImportStringStatus = ''
      this.numCategorySets = 1
      this.showMoreCategories = false

      var params = {}
      params.id = wagoID
      this.version = parseInt(this.$route.params.version)
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
        if (res.code && res.code.json) {
          res.code.obj = JSON.parse(res.code.json)
          res.code.json = JSON.stringify(res.code.obj, null, 2)
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

        if (!res.description.text) {
          res.description.text = this.MakeDefaultDescription(res)
        }

        vue.$store.commit('setWago', res)
        // initial config
        this.editName = res.name
        this.editSlug = res.slug
        this.editDesc = res.description.text

        if (!this.wago.description.text && this.wago.type === 'WEAKAURA') {
          this.showPanel = 'editor'
        }
        else if (!this.wago.description.text && this.wago.type === 'MDT') {
          this.showPanel = 'builder'
        }
        else {
          this.showPanel = 'description'
        }

        vue.doNotReloadWago = true
        window.preventScroll = true
        // make sure we're using custom url
        if (vue.isLatestVersion()) {
          vue.$router.replace('/' + res.slug)
        }
        else {
          vue.$router.replace('/' + res.slug + '/' + vue.version)
        }
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
        else {
          this.editVisibility = 'Public'
        }
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
          unlisted: (res.visibility.hidden || res.visibility.private)
        })
      })
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
      console.log(this.hasUnsavedChanges)
    },
    updateEncoded (str) {
      if (str) {
        this.$set(this.wago.code, 'encoded', str)
      }
    },
    MakeDefaultDescription (wago) {
      var desc = ''
      switch (wago.type) {
        case 'WEAKAURA':
          if (wago.code && wago.code.json) {
            var json = JSON.parse(wago.code.json)
            if (json.c) {
              for (var k in json.c) {
                var caura = json.c[k]
                if (caura.id && caura.regionType) {
                  desc = desc + caura.id + ' (' + caura.regionType + ')\n'
                }
              }
            }
            else if (json.d) {
              desc = desc + json.d.id + ' (' + json.d.regionType + ')\n'
              if (json.d.desc) {
                desc = desc + '\n\n' + json.d.desc
              }
            }
          }
          return desc

        case 'ELVUI':
        case 'VUHDO':
        case 'COLLECTION':
        case 'SNIPPET':
          return ''
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
        document.querySelector('.copy-import-button:not([hidden])').focus()
        return copied
      }
      catch (e) {
        console.log(e)
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
      if (frame === 'config') {
        this.$nextTick(function () {
          setupPasteImage(this)
        })
      }
      else if (frame === 'codereview') {
        this.loadCodeReview()
      }
    },
    toTop () {
      this.$scrollTo('#app')
    },
    watchScroll () {
      var header = this.$refs['action-buttons']
      if (!header) {
        this.showFloatingHeader = false
      }
      else {
        var rect = header.$el.getBoundingClientRect()
        var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight)
        this.showFloatingHeader = !!(rect.bottom < 0 || rect.top - viewHeight >= 0)
      }
    },
    selectVersion (v) {
      this.$router.push('/' + this.$store.state.wago.slug + '/' + v[0].version)
    },
    isLatestVersion () {
      return (!this.version || this.version === this.wago.versions.total)
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
          desc: this.editDesc.trim()
          // format: 'bbcode'
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
      this.http.post('/wago/update/visibility', {
        wagoID: vue.wago._id,
        visibility: this.editVisibility
      }).then((res) => {
        vue.wago.visibility.private = res.private
        vue.wago.visibility.hidden = res.hidden
      }).catch((err) => {
        console.log(err)
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
            console.log('Error uploading image', err)
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

    onScreenshotMoved (draggable) {
      // insert video into dragged location
      this.wago.screens.splice(draggable.index, 0, draggable.item)

      // build sort list and send to server
      var sort = []
      this.wago.screens.forEach((screen) => {
        if (sort.indexOf(screen._id) === -1) {
          sort.push(screen._id)
        }
      })
      var vue = this
      this.http.post('/wago/update/sort/screenshots', {
        wagoID: vue.wago._id,
        screens: sort.join(',')
      }).then((res) => {
        // success, render is already up to date.
      }).catch((err) => {
        console.log(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
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

    onVideoMoved (draggable) {
      // insert video into dragged location
      this.wago.videos.splice(draggable.index, 0, draggable.item)

      // build sort list and send to server
      var sort = []
      this.wago.videos.forEach((video) => {
        if (sort.indexOf(video._id) === -1) {
          sort.push(video._id)
        }
      })
      var vue = this
      this.http.post('/wago/update/sort/videos', {
        wagoID: vue.wago._id,
        videos: sort.join(',')
      }).then((res) => {
        // success, render is already up to date.
      }).catch((err) => {
        console.log(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Error could not save'))
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
      var vue = this
      this.http.post('/import/update', post).then((res) => {
        if (res.error) {
          window.eventHub.$emit('showSnackBar', res.error)
        }
        else {
          window.eventHub.$emit('showSnackBar', vue.$t('Wago saved successfully'))
          location.reload()
        }
      }).catch((err) => {
        console.log(err)
        window.eventHub.$emit('showSnackBar', vue.$t('Unknown error could not save'))
      })
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
        console.log(err)
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
    }
  }
}
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style>
#copyFail textarea { max-height: 110px; min-height:110px }
#copyFail .md-input-container { display: inline-block; position: relative}

#view-wago > div { position: relative }
#wago-header.md-card { padding-bottom:0!important; }
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
#wago-floating-header .floating-header div { flex: 0 1 auto; vertical-align:top; margin-right: 24px}
#wago-floating-header button { margin-top: 0 }
@media (max-width: 600px) {
  #wago-floating-header { display: none!important}
}

#wago-tabs { flex: 0 1 auto; flex-direction: column }
#wago-tabs .md-button-toggle { flex-direction: column }
#wago-tabs .md-button-toggle button { text-align:left }

#wago-content { flex: 1; flex-direction: column }
#wago-content > div { margin: 0 8px 16px 0; width: 100%; }
#addCollectionButton, #newCommentButton { margin-top: 0 }

#wago-actions { flex: 1; padding: 0 }
#wago-actions button { margin-top: 0 }
.copy-import-button { border: 2px solid #c1272d; border-radius: 25px; margin: 4px 28px; display: inline-block }
#wago-collections-container button { margin-left: -2px }
#wago-floating-header .copy-import-button { margin: -2px 0 0 auto }

#thumbnails img { max-width: 190px; max-height: 107px; width: auto; height: auto; margin: 8px 0 0 8px }

#tags { display: block; clear: both; padding-top: 16px}
.wago-media { width: 160px; text-align: center  }
.wago-media img, .wago-media a img { padding: 8px 16px; width: 100%; max-height: 120px; display: block; float: none }
a.showvid { position: relative; display: block; cursor: pointer }
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
#wago-col-main > .md-layout { flex-direction: row }
#wago-col-side { flex: 1 0 0 }

#wago-versions .md-table .md-table-cell .md-table-cell-container { display: block }
#wago-versions .md-table-row { cursor: pointer}
#wago-versions .md-table-selection { display: none } /* hack to make md-table-row clickable */

#embed-content { display: flex }
#embed-inputs { flex: 2 1 auto }
#embed-preview { flex: 1.5 1 auto }
#embed-inputs .md-select { max-width: 200px}
#embed-inputs .md-has-select.md-input-container {margin-bottom:0}
#embed-inputs .md-has-select.md-input-container:after {height:0}


#wago-collections .md-avatar { margin: 0 16px 0 0 }
#wago-collections .userlink .md-table-cell-container { display: inline }

@media (max-width: 600px) {
  #wago-header.md-card { margin: 0}
  #wago-flex-container { flex-direction: column; }
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

.wago-importstring { width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:transparent;color:transparent;overflow:hidden;resize:none }
.wago-importstring::selection { color:transparent;background:transparent }
.wago-importstring::-moz-selection { color:transparent;background:transparent }
.wago-importstring::-webkit-selection { color:transparent;background:transparent }

.customSlug .root { font-size:16px; line-height: 32px }
.md-input-container.md-input-status .md-error { opacity: 1; transform: translate3d(0, 0, 0);}

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

.vddl-draggable { display: inline-block; cursor: move; position: relative; }
.vddl-draggable img { max-height:120px; max-width: 150px; margin: 0 4px 4px 0 }
.vddl-draggable .vddl-delete { position: absolute; top: 2px; right: 2px; z-index: 3; opacity: .2; cursor: pointer}
.vddl-draggable:hover .vddl-delete { opacity: 1}

.my-gallery a img { border-color: transparent }

#newImportDialog > div { min-width: 30% }

.CopyWarningTooltip { padding: 8px; border:5px solid #c1272d; font-size: 14px; height: auto; max-width: 450px; white-space:normal; background: black; right: -84px  }

</style>
