<template>
  <div id="index">
    <md-layout md-gutter="32" :md-column-small="true" v-if="!$store.state.isMaintenance">
      <md-whiteframe id="importform">
        <md-layout style="flex-wrap:nowrap">
          <md-input-container style="flex:1;" :class="{ 'md-input-invalid': importError }">
            <label>{{ $t("Paste your import string here") }}</label>
            <div id="inputStringWrapper">
              <md-textarea id="inputStringTextarea" name="importString" placeholder=" " v-model="importString"></md-textarea>
              <div v-if="!importString" v-html="$t('Paste your WeakAura, ElvUI or Vuhdo string here')"></div>
            </div>
            <span class="md-error">{{ importErrorMsg }}</span>
          </md-input-container>

          <!--<div style="width:350px; height:197px; background: purple; margin:0 0 16px 16px" v-if="this.$store.state.user"></div>-->
        </md-layout>

        <div class="field-group">
          <md-input-container>
            <label for="visibilty">{{ $t("Visibility") }}</label>
            <md-select name="visibilty" id="visibilty" v-model="visibility" class="dropdown-select">
              <md-option value="Public" selected>{{ $t("Public") }}</md-option>
              <md-option value="Hidden">{{ $t("Hidden (only viewable with link)") }}</md-option>
              <md-option value="Encrypted">{{ $t("Encrypted (only viewable with password)") }}</md-option>
              <md-option v-if="user.name" value="Restricted">{{ $t("Restricted (viewable for select users)") }}</md-option>
              <md-option v-if="user.name" value="Private">{{ $t("Private (only you may view)") }}</md-option>
            </md-select>
          </md-input-container>

          <md-input-container v-if="user.UID || user.guest">
            <label for="importAs">{{ $t("Import As") }}</label>
            <md-select name="importAs" id="importAs" v-model="importAs">
              <md-option value="User" v-if="user.UID">{{ user.name }}</md-option>
              <md-option value="Guest">{{ $t("Anonymous Guest") }}</md-option>
              <md-subheader v-if="!user.name" id="signinanon" v-html="$t('Sign in to keep track of your imports')"></md-subheader>
            </md-select>
          </md-input-container>

          <md-input-container>
            <label for="expire">{{ $t("Expire After") }}</label>
            <md-select name="expire" id="expire" v-model="expire">
              <md-option value="never">{{ $t("Never") }}</md-option>
              <md-option value="3mo">{{ $t("3 months") }}</md-option>
              <md-option value="1mo">{{ $t("1 month") }}</md-option>
              <md-option value="1wk">{{ $t("1 week") }}</md-option>
              <md-option value="3hr">{{ $t("3 hours") }}</md-option>
              <md-option value="15m">{{ $t("15 minutes") }}</md-option>
            </md-select>
          </md-input-container>
        </div>

        <div v-if="visibility === 'Encrypted'" style="margin: 0 0 8em 1em">
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

        <div v-if="visibility === 'Restricted'" style="margin-left:1em">
          <template v-for="(rest, index) in restrictions">
            <md-layout :key="index">
              <md-layout>
                <md-input-container>
                  <label>{{ $t("Access Granted To") }}</label>
                  <md-select v-model="rest.type" @change="onUpdateRestrictionsDebounce(index)">
                    <md-option value="user">{{ $t("Username") }}</md-option>
                    <md-option value="guild" v-if="user.access.restrictGuild && user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                    <!--<md-option value="twitchsubs" v-if="user.access.restrictSubs && user.twitch && user.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
                    <md-option v-if="index > 0" value="remove">{{ $t("Remove Access") }}</md-option>
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
                    <template v-for="(guild, guildIndex) in user.battlenet.guilds">
                      <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                    </template>
                  </md-select>
                </md-input-container>
                <md-input-container v-if="rest.type === 'guild' && rest.value">
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
          <md-layout v-if="restrictions.length < 20 && restrictions[0].value">
            <md-layout>
              <md-input-container>
                <label>{{ $t("Access Granted New") }}</label>
                <md-select v-model="newRestrictionType" @change="checkNewRestrictions">
                  <md-option value="user">{{ $t("Username") }}</md-option>
                  <md-option value="guild" v-if="user.access.restrictGuild && user.battlenet && user.battlenet.guilds && user.battlenet.guilds.length">{{ $t("Guild") }}</md-option>
                  <!--<md-option value="twitchsubs" v-if="user.access.restrictSubs && user.twitch && user.twitch.id">{{ $t("Twitch Subscribers") }}</md-option>-->
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
                  <template v-for="(guild, guildIndex) in user.battlenet.guilds">
                    <md-option :key="guildIndex" :value="guild" v-if="!guild.match(/\d$/)">{{ guild.replace(/@/, '-').replace(/@/, ' <') + '>' }}</md-option>
                  </template>
                </md-select>
              </md-input-container>
            </md-layout>
          </md-layout>
        </div>

        <div v-if="isScanning"><md-spinner md-indeterminate></md-spinner></div>
        <strong>{{ importType === 'WEAKAURAS2' ? 'WEAKAURA' : importType }}</strong><br>

        <md-layout v-if="scanID">
          <md-layout>
            <md-input-container>
              <label for="name">{{ $t("Name") }}</label>
              <md-input name="name" id="name" v-model="name"></md-input>
            </md-input-container>
          </md-layout>
        </md-layout>

        <div v-if="scanID && importType !== 'Lua Error' && importType !== 'DBM' && importType !== 'BIGWIGS' && importType !== 'MDT'">
          <label id="categoryLabel">{{ $t("Categories") }}</label>
          <md-button class="md-icon-button md-raised" @click="numCategorySets++">
            <md-icon>add</md-icon>
          </md-button>
          <div v-for="n in numCategorySets">
            <div v-if="scanID" class="has-category-select" :style="`z-index: ${100-n}`">
              <category-select :selectedCategories="setCategories[n-1]" @update="cat => {setCategories[n-1] = cat; onUpdateCategories()}" :type="(importType === 'WEAKAURAS2' ? 'WEAKAURA' : importType).toUpperCase()" :game="importGame"></category-select>
            </div>
          </div>
        </div>

        <md-button class="md-raised" :disabled="disableSubmit || (visibility === 'Encrypted' && !cipherKey.length)" @click="submitImport()" style="margin-top:2em">{{ $t('Submit') }}</md-button>
      </md-whiteframe>
    </md-layout>

    <div id="currentcontent">
      <strong>{{ $t('Current WeakAuras') }}</strong>
      <md-layout>
        <advert ad="video-sidebar" />
        <div id="current-wa">
          <router-link :to="'/the-war-within-weakauras/' + currentWA.modern[0].slug" :style="`border-color: ${currentWA.modern[0].color}99; color:${currentWA.modern[0].color}; background-color:${currentWA.modern[0].color}11; background-image:url('/static/image/menu/${currentWA.modern[0].image}')`"><span>{{ currentWA.modern[0].text }}</span></router-link>
          <router-link :to="'/the-war-within-weakauras/' + currentWA.modern[1].slug" :style="`border-color: ${currentWA.modern[1].color}99; color:${currentWA.modern[1].color}; background-color:${currentWA.modern[1].color}11; background-image:url('/static/image/menu/${currentWA.modern[1].image}')`"><span>The War Within {{ currentWA.modern[1].text }}</span></router-link>

          <router-link :to="'/cataclysm-weakauras/' + currentWA.classic[0].slug" :style="`border-color: ${currentWA.classic[0].color}99; color:${currentWA.classic[0].color}; background-color:${currentWA.classic[0].color}11; background-image:url('/static/image/menu/${currentWA.classic[0].image}')`"><span>{{ currentWA.classic[0].text }}</span></router-link>    
          <router-link :to="'/classic-weakauras/' + currentWA.classic[1].slug" :style="`border-color: ${currentWA.classic[1].color}99; color:${currentWA.classic[1].color}; background-color:${currentWA.classic[1].color}11; background-image:url('/static/image/menu/${currentWA.classic[1].image}')`"><span>{{ currentWA.classic[1].text }}</span></router-link>          

          <!-- <a href="https://addons.wago.io/app" style="border-color: #DDDDDD99; color: #DDDDDD; background-color: #DDDDDD11; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23DDDDDD%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4%22/%3E%3C/svg%3E');"><span>{{ $t('Download the Wago App') }}</span></a> -->
          
          <!-- <a href="https://docs.google.com/forms/d/e/1FAIpQLSeTRULzT7KCSoNAzxEel9mNJ8rzyqamrPT-u6dMYveD6QR_fg/viewform?usp=dialog" target="_blank" style="border-color: #DDDDDD99; color: #DDDDDD; background-color: #DDDDDD11; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23DDDDDD%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22%3E%3Cpath d=%22M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12%22/%3E%3C/svg%3E');"><span>{{ $t('We are hiring a Community Manager!') }}</span></a> -->
        </div>
      </md-layout>
    </div>

    <md-layout id="col2" :md-column-medium="true" md-vertical-align="start" v-if="!isTest">
      <div id="topwagos" v-if="topLists && topLists[topID]">
        <md-whiteframe>
          <md-list class="md-dense">
            <md-list-item class="top-list-header">
              <md-menu md-align-trigger md-size="6">
                <md-button class="md-dense" md-menu-trigger>{{ $t(topLists[topID].title) }}</md-button>
                <div class="top-list-note" v-if="topLists[topID].title.match(/Installed/)">{{ $t('Per WeakAuras Companion App') }}</div>
                <md-menu-content class="top-list-menu">
                  <template v-for="(list, index) in topLists">
                    <md-menu-item :key="index" @click="topID = index">{{ $t(list.title) }}</md-menu-item>
                    <md-divider v-if="list.lastOfSection"></md-divider>
                  </template>
                </md-menu-content>
              </md-menu>
            </md-list-item>
            <md-list-item v-for="(item, index) in topLists[topID].imports" :key="index">
              <router-link :to="'/' + item.slug">
                <div class="md-list-text-container">
                  <span>{{ item.name }}</span>
                  <span v-if="item.date">{{ item.display | moment('MMM Do YYYY LT') }}</span>
                  <span v-else>{{ $t(item.display, item) }}</span>
                </div>
              </router-link>
              </router-link>
            </md-list-item>
          </md-list>
        </md-whiteframe>
        <md-whiteframe v-if="$screenWidth >= 1780">
          <md-list class="md-dense">
            <md-list-item class="top-list-header">
              <md-menu md-align-trigger md-size="6">
                <md-button class="md-dense" md-menu-trigger>{{ $t(topLists[topID2].title) }} <span class="down-arrow"></span></md-button>
                <div class="top-list-note" v-if="topLists[topID2].title.match(/Installed/)">{{ $t('Per WeakAuras Companion App') }}</div>
                <md-menu-content class="top-list-menu">
                  <template v-for="(list, index) in topLists">
                    <md-menu-item :key="index" @click="topID2 = index">{{ $t(list.title) }}</md-menu-item>
                    <md-divider v-if="list.lastOfSection"></md-divider>
                  </template>
                </md-menu-content>
              </md-menu>
            </md-list-item>
            <md-list-item v-for="(item, index) in topLists[topID2].imports" :key="index">
              <router-link :to="'/' + item.slug">
                <div class="md-list-text-container">
                  <span>{{ item.name }}</span>
                  <span v-if="item.date">{{ item.display | moment('MMM Do YYYY LT') }}</span>
                  <span v-else>{{ $t(item.display, item) }}</span>
                </div>
              </router-link>
            </md-list-item>
          </md-list>
        </md-whiteframe>
        <md-whiteframe>
          <md-list class="md-dense">
            <md-list-item>
              <strong>{{ $t(topLists[topLists.length - 2].title) }}</strong>
            </md-list-item>
            <md-list-item v-for="(item, index) in topLists[topLists.length - 2].imports" :key="index">
              <router-link :to="'/' + item.slug">
                <div class="md-list-text-container">
                  <span>{{ item.name }}</span>
                  <span>{{ item.display | moment('MMM Do YYYY LT') }}</span>
                </div>
              </router-link>
            </md-list-item>
          </md-list>
        </md-whiteframe>
        <md-whiteframe v-if="$screenWidth >= 1780">
          <md-list class="md-dense" id="newest-imports">
            <md-list-item>
              <strong>{{ $t(topLists[topLists.length - 1].title) }}</strong>
            </md-list-item>
            <md-list-item v-for="(item, index) in topLists[topLists.length - 1].imports" :key="index" v-if="index < 3">
              <router-link :to="'/' + item.slug">
                <div class="md-list-text-container">
                  <span>{{ item.name }}</span>
                  <span>{{ item.display | moment('MMM Do YYYY LT') }}</span>
                </div>
              </router-link>
            </md-list-item>
          </md-list>
        </md-whiteframe>
      </div>

      <!--<md-table v-if="addonReleases.length > 0" id="addonReleases">
        <md-table-header>
          <md-table-row>
            <md-table-head>{{ $t("Latest addons") }}</md-table-head>
            <md-table-head>{{ $t("Version") }}</md-table-head>
          </md-table-row>
        </md-table-header>
        <md-table-body>
          <md-table-row v-for="(addon, addonIndex) in addonReleases" :key="addonIndex" v-if="addon.addon !== 'Grid2'">
            <md-table-cell>{{ addon.addon }}</md-table-cell>
            <md-table-cell><a :href="addon.url" target="_blank" rel="noopener">{{ addon.version }}</a><br><span>{{ addon.date | moment('MMM Do YYYY') }}</span></md-table-cell>
          </md-table-row>
        </md-table-body>
      </md-table>-->
    </md-layout>
  </div>
</template>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style lang="scss">
#index {margin: 16px 0;}
#index .wago-video-ad-container {margin-left: 16px;}

#importform { z-index:5; padding: 16px; width:100%; z-index: 10}
#importform textarea { max-height: 110px; min-height:110px }
#importform .field-group .md-input-container { display: inline-block; max-width: 32%; position: relative}
.field-group2 .md-input-container, .field-group2 strong { display: inline-block; max-width: 49%;}
#signinanon { padding-left: 32px; }


@media (min-width: 1281px) {
  #col1, #col2 { padding-top: 16px }
  #col1 { width: 100%; }
  #col2 { padding-left: 0; width: 100% }
  #topwagos {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }
  #topwagos .md-whiteframe { width: calc(50% - 8px) }
  #topwagos > .md-layout > .md-layout > ul { min-width: 100% }
  #topwagos .md-layout .md-layout .md-list {padding: 0 16px}
}
@media (min-width: 560px) {
  #importform { min-width: 560px;}
}

@media (max-width: 1280px) {
  #importform { display:block }
}

#inputStringWrapper { width: 100%; position: relative; }
#inputStringWrapper div  { position: absolute; top: 0; color: #a5a5a5; padding: 6px 0 0 0; pointer-events: none}

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

#sitenews { width: 100%}
#sitenews .md-card {margin: 16px 0 0; width:100%}
#sitenews .md-card .md-subhead { opacity: 1 }

#currentcontent {
  margin: 16px 0 0; width:100%;
  & > .md-layout {    
    justify-content: space-between;
    div {
      flex: 1
    }
  }
  #current-wa {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: 16px;
    row-gap: 8px;
    a {
      min-width: 33%;
      min-height: 54px;
      display: flex;
      align-items: center;
      padding: 8px 8px 8px 64px;
      font-size: 18px;
      vertical-align: middle;
      border-radius: 4px;
      border-width: 2px;
      border-style: solid;
      margin-bottom: 8px;
      background-repeat: no-repeat;
      background-size: 30px;
      background-position: 16px 50%;
      transition: transform .3s;
      z-index: 5;
      &:hover {
        text-decoration: none;
        transform: scale(1.075);
        z-index: 10;
      }
      & + a { order: 3 }
      & + a+a { order: 2 }
      & + a+a+a { order: 4 }
    }
  }
  .wago-ad-container {
    margin: 0 0 8px 16px;
    padding: 0 8px 10px;
    order: 2;
    & + #current-wa {
      grid-template-columns: repeat(1, minmax(0, 1fr));
      
      a+a { order: 2 }
      a+a+a { order: 3 }
      a+a+a+a { order: 4 }
    }
  }
}


#categoryLabel { margin-top: 10px; display: inline-block}

#importform #inputStringTextarea {
  overflow-x: hidden!important;
  overflow-y: hidden!important;
}
.ads-enabled #importform #inputStringTextarea {
  min-height: 108px;
  max-height: 108px;
}

.resticted-options { flex: 3; flex-wrap: nowrap}

#topwagos {padding: 0; width: 100%}
#topwagos .md-list-item { flex-wrap: wrap }
#topwagos .md-layout .md-layout { justify-content: center; max-width:380px }
#topwagos .md-list:after {background-color: inherit}
.top-list-header .md-list-item-container {justify-content: normal}
.top-list-header .md-list-item-container strong {padding: 0 12px;}
.top-list-header .md-list-item-container a:hover {text-decoration: none}
.top-list-header .md-button {padding: 0 16px 0 0; margin: 0; text-transform: none; font-weight: bold}
.top-list-header .md-button:hover {background-color: inherit!important}
.top-list-header .md-button:after { margin-top: 2px; position: absolute; top: 45%; right: 0; transform: translateY(-50%) scaleY(.45) scaleX(.85); transition: all .15s linear; content: "\25BC";}
.top-list-menu .md-list-item {line-height: 18px;}
.top-list-menu .md-list-item .md-list-item-container {font-size: 14px; min-height: 24px}
.top-list-note {font-size:11px; margin: -12px 0 0}

#addonReleases span { color: #999999}

span.md-note {height: 20px; position: absolute; bottom: -22px; font-size: 12px;}

h3.spotlight-tab {margin:16px 0 8px 0; font-size: 16px; padding-left: 28px; display: inline-block; width: auto; border: 1px solid #333; border-radius: 4px 4px 0 0; cursor: pointer}
h3.spotlight-tab:hover, h3.spotlight-tab.selected {background-color: #333;}
.spotlights > h3 {margin: 16px 0 0}
.spotlights > .md-row {justify-content: space-between;}
.spotlights > .md-row > div {display: flex; width: 100%}
.spotlights .md-card .md-card-content a:not(.md-button) {display: block; color: inherit!important}
.spotlights .md-card .md-card-content a:not(.md-button):hover {text-decoration: none}
.spotlights .md-card {padding: 2px; margin: 0 0 8px; max-width: 33%;}
.spotlights .md-card .md-card-content {padding: 8px}

.spotlights2 > h3 {margin: 16px 0 0; min-width: 100%;}
.spotlights2 {min-width: 100%; display: flex; flex-direction: row}
.spotlights2 a.hotspot {display: flex; flex-direction:row; border: 1px solid #333; background: #333; margin: 0 2px 2px 0; width: calc(33% - 4px)}
.spotlights2 a.hotspot:hover {border: 1px solid #444; background: #444}
.spotlights2 a.hotspot img {height: 84px}
.spotlights2 a.hotspot div {width: 100%; height: 84px; position: relative;}
.spotlights2 a.hotspot div .title {position: absolute; top:4px; left: 4px; font-weight: bold; color: white}

.spotlights3 {min-width: 100%; display: flex; flex-direction: column}
.spotlights3 .md-chip {padding-left: 28px; font-size: 14px}
.spotlights3 a.hotspot {display: flex; flex-direction:row; border: 1px solid #333; background: #333; margin: 0 2px 2px 0;}
.spotlights3 a.hotspot:hover {border: 1px solid #444; background: #444}
.spotlights3 a.hotspot > img {height: 84px; width: 161px}
.spotlights3 a.hotspot > div {width: 100%; height: 84px; position: relative;}
.spotlights3 a.hotspot div .title {position: absolute; top:4px; left: 4px; font-weight: bold; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 97%}
.spotlights3 a.hotspot div .author {display: flex; align-items: center; position: absolute; bottom:4px; left: 4px; font-weight: bold; font-size:90%; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 97%}
.spotlights3 a.hotspot div .author .md-avatar {width: 24px; min-width: 24px; height: 24px; min-height: 24px}
.spotlights3 a.hotspot div .author span {display: block; margin-left: 8px}
.spotlights3 .spotlight-more { padding: 12px; border: 1px solid #333; background: #333; margin: 0 2px 2px 0;}
.spotlights3 .spotlight-more:hover { text-decoration: none!important; background: #444}

@media (max-width: 560px) {
  .spotlights .md-card {max-width: 100%}
}

@media (max-width: 600px) {
  #currentcontent #current-wa a {
    padding-left: 12px;
    background-image: none!important;
  }
}

#browse-addons-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  a:hover {
    filter: brightness(115%);
    text-decoration: none;
  }
}
#addon-imports {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 16px;
  a {
    display: flex;
    flex-direction: column;
    flex-basis: 0;
    flex-grow: 1;
    padding: 4px 0;
    color: white !important;
    background: #333333;
    &:hover {
      background: #3a3a3a;
      text-decoration: none;
    }
    .category-image {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-content: center;
      text-align: center;
      padding: 0 8px;
      img {
        max-width: 80px;
        max-height: 80px;
        margin: 0 auto;
      }
    }
    div {
      margin: 0 0 4px 0;
      a {
        display: inline;
        padding: 4px;
        font-size: 80%;
        &:hover {
          background: #222;
        }
      }
    }
  }
}
</style>

<script>
import Categories from './libs/categories2'
import CategorySelect from './UI/SelectCategory.vue'
import CategoryImage from './UI/CategoryImage.vue'
import CTA_WagoAddons from './UI/CTAWagoAddons.vue'
import WagoNews from './core/News.vue'
import VueMarkdown from 'vue-markdown'
import addonDB from './libs/addons'

import { Sanitizer } from "@esri/arcgis-html-sanitizer"
const sanitizer = new Sanitizer()

function flatten (arr) {
  return arr.reduce(function (flat, toFlatten) {
    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten)
  }, [])
}

export default {
  name: 'app',
  data: () => {
    return {
      importString: '',
      importError: false,
      importErrorMsg: '',
      visibility: 'Public',
      importAs: 'Guest',
      expire: '3mo',
      name: '',
      weakauramode: '',
      setCategories: [],
      categories: [],
      importType: '',
      importGame: '',
      importDomain: 0,
      isScanning: false,
      scanID: '',
      disableSubmit: true,
      top10Lists: {},
      topLists: [],
      spotlight: {},
      topID: 0,
      topID2: 0,
      latestBlogs: [],
      addonReleases: [],
      numCategorySets: 1,
      game: 'bfa',
      restrictions: [{type: 'user', value: ''}],
      newRestrictionType: 'user',
      newRestrictionValue: '',
      cipherKey: '',
      addonDB
    }
  },
  components: {
    CategorySelect,
    'vue-markdown': VueMarkdown,
    'wago-news': WagoNews,
    'category-image': CategoryImage,
    'cta-wago-addons': CTA_WagoAddons
  },
  computed: {
    currentWA () {
      return {
        modern: [
          Categories.getCategories('liberationofundermine')[0],
          Categories.getCategories('twwdungeon')[0],
        ],
        classic: [
          Categories.getCategories('raiddragonsoul')[0],
          {...Categories.getCategories('sod-scarletenclave')[0], image: Categories.getCategories('sod')[0].image, color: Categories.getCategories('sod')[0].color},
        ],
      }
    },
    user () {
      return this.$store.state.user
    },
    mdtWeek () {
      var weeks = categories.getCategories([/^mdtaffix-bfa-s4-/], true)
      if (!this.$store.state.MDTWeek || !weeks[this.$store.state.MDTWeek - 1]) return {}
      return {num: this.$store.state.MDTWeek, affixes: weeks[this.$store.state.MDTWeek - 1].text}
    },
    isTest () {
      return false // this.$env === 'development' || document.getElementById('test-content')
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: this.$t('Import')
    })
    var u = this.$store.state.user
    if (u.UID && u.name) {
      this.importAs = 'User'
      this.visibility = u.defaultImportVisibility
      this.expire = 'never'
    }

    var vue = this
    this.http.get('/lookup/index').then((res) => {
      if (res.topLists) {
        vue.topID = parseInt(window.localStorage.getItem('topID'))
        vue.topID2 = parseInt(window.localStorage.getItem('topID2'))
        if (isNaN(vue.topID)) {
          vue.topID = Math.floor(Math.random() * (vue.topLists.length - 2))
          vue.topID2 = vue.topID
        }
        while (vue.topID2 === vue.topID) {
          vue.topID2 = Math.floor(Math.random() * (vue.topLists.length - 2))
        }
        vue.topLists = JSON.parse(JSON.stringify(res.topLists))
      }
      vue.spotlight = res.spotlight
      if (res.news) {
        vue.latestBlogs = JSON.parse(JSON.stringify(res.news))
      }
      if (res.addons) {
        vue.addonReleases = JSON.parse(JSON.stringify(res.addons))
        vue.$store.commit('setAddons', vue.addonReleases)
      }
    })
  },
  methods: {
    submitImport () {
      var post = {
        scanID: this.scanID,
        visibility: this.visibility,
        importAs: this.importAs,
        expireAfter: this.expire,
        waMode: this.weakauramode,
        name: this.name,
        categories: JSON.stringify(flatten(this.setCategories)),
        categoryIDs: flatten(this.setCategories).map(cat => cat.id),
        game: this.game
      }
      if (this.visibility === 'Encrypted') {
        post.cipherKey = this.cipherKey
      }
      else if (this.visibility === 'Restricted') {
        post.restrictions = JSON.stringify(flatten(this.restrictions))
      }
      var vue = this
      this.http.post('/import/submit', post).then((res) => {
        if (res.success && res.wagoID) {
          vue.$router.push('/' + res.wagoID)
        }
        else {
          window.eventHub.$emit('showSnackBar', vue.$t('Import failed or expired please try again'))
        }
      })
    },

    onUpdateCategories () {
      // force DOM update
      this.numCategorySets++
      this.numCategorySets--
    },

    checkNewRestrictions: function () {
      this.$nextTick(() => {
        if ((this.newRestrictionType && this.newRestrictionValue) || this.newRestrictionType === 'twitchsubs') {
          this.restrictions.push({type: this.newRestrictionType, value: this.newRestrictionValue})
          this.newRestrictionType = 'user'
          this.newRestrictionValue = ''
          // onUpdateRestrictions is called here via reactivity
        }
      })
    },

    onUpdateRestrictions: function (index) {
      if (typeof index === 'undefined' || ((this.restrictions[index] && this.restrictions[index].value) || this.restrictions[index].type === 'twitchsubs' || this.restrictions[index].type === 'remove')) {
        if (typeof index !== 'undefined' && this.restrictions[index].type === 'remove') {
          this.restrictions.splice(index, 1)
        }
        else if (typeof index !== 'undefined' && typeof this.restrictions[index].rank === 'undefined') {
          this.$set(this.restrictions[index], 'rank', '9')
        }
      }
      this.checkNewRestrictions()
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
      return (this.http.get('/search/username', {name: q.q})).map(x => {x.name = x.name.replace(/\s/g, '_')})
    }
  },
  watch: {
    '$store.state.user': function () {
      var u = this.$store.state.user
      if (u.UID && u.name) {
        this.importAs = 'User'
        this.visibility = u.defaultImportVisibility
        this.expire = 'never'
      }
    },
    importString: function (val) {
      val = val.trim()
      if (!val || val.match(/%SCAN%/)) {
        return
      }
      var vue = this
      vue.importError = false
      vue.importErrorMsg = ''
      vue.scanID = ''
      vue.importType = ''
      vue.importGame = ''
      vue.importDomain = 0
      vue.disableSubmit = true

      // ignore short strings (probably unintentional keypress)
      if (val.length < 10) {
        this.importError = true
        return
      }
      // clean up browser overhead
      if (val.length > 500) {
        this.importString = val.substring(0, 500) + '%SCAN%'
        document.getElementById('inputStringTextarea').scrollTop = 0
        document.getElementById('inputStringTextarea').blur()
      }

      // send content to import scan
      vue.isScanning = true
      this.http.post('/import/scan', { importString: val }).then((res) => {
        vue.isScanning = false
        if (res.error) {
          vue.importError = true
          if (res.error === 'invalid_import') {
            vue.importErrorMsg = vue.$t('error:Invalid import')
          }
          else if (res.error === 'invalid_url') {
            vue.importErrorMsg = vue.$t('error:Invalid url')
          }
        }
        else {
          // if no errors setup the default fields
          vue.importError = false
          vue.name = res.name
          vue.importType = res.type
          vue.importGame = res.game
          vue.importDomain = res.domain
          if (res.type.match(/WEAKAURA/)) {
            this.weakauramode = res.type
          }
          vue.disableSubmit = false
          // build category select
          if (res.categories) {
            vue.categories = Categories.getCategories(res.categories, vue.$t)
            vue.numCategorySets = vue.categories.length
            vue.setCategories = vue.categories
          }
          else {
            vue.categories = []
            vue.setCategories = []
          }

          // set scanID after other data is assigned
          vue.scanID = res.scan
        }
      })
    },

    topID: function (val) {
      if (val < 0) {
        this.topID = this.topLists.length - 12
      }
      else if (val > this.topLists.length - 1) {
        this.topID = 0
      }
      while (this.topID2 === this.topID) {
        this.topID2 = Math.floor(Math.random() * (this.topLists.length))
      }
      window.localStorage.setItem('topID', this.topID)
      window.localStorage.setItem('topID2', this.topID2)
    },
    topID2: function (val) {
      if (val < 0) {
        this.topID2 = this.topLists.length - 1
      }
      else if (val > this.topLists.length - 1) {
        this.topID2 = 0
      }
      while (this.topID2 === this.topID) {
        this.topID = Math.floor(Math.random() * (this.topLists.length))
      }
      window.localStorage.setItem('topID', this.topID)
      window.localStorage.setItem('topID2', this.topID2)
    }
  }
}
</script>