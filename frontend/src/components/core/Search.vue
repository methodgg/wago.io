<template>
  <md-card id="searchPage" :class="collection ? 'collection' : ''">
    <md-layout id="searchLayout">
      <md-layout id="searchMeta">
        <div id="searchData">
          <slot></slot>
          <md-layout md-row>
            <p id="searchQuery">
              <small v-if="queryOptions && !collection" v-html="queryOptions"></small>
              <em v-if="queryHTML && !collection" v-html="queryHTML"></em>
              <strong v-html="$t('Found [-count-] results', {count: new Intl.NumberFormat().format(results.total)})"></strong>
            </p>
            <md-layout v-if="results && !collection" id="searchOptions">
              <div v-if="$store.state.gameDomain === 0 && (searchType === 'all' || searchType === 'weakaura') && searchMode !== 'comments'">
                <div>
                  <label>{{ $t('Expansion') }}</label>
                  <small id="selected-expansion">{{
                    searchExpansion === 'classic' && $t('Classic') ||
                    searchExpansion === 'titan-wotlk' && $t('Titan Reforged Classic WotLK') ||
                    searchExpansion === 'cata' && $t('Cataclysm') ||
                    searchExpansion === 'mop' && $t('Mists of Pandaria') ||
                    searchExpansion === 'df' && $t('Dragonflight') ||
                    searchExpansion === 'tww' && $t('The War Within') ||
                    (!searchExpansion || searchExpansion === 'all') && $t('All') ||
                    $t('Legacy')
                    }}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn select-search-mode">
                  <md-button :class="{ 'md-toggle': !searchExpansion || searchExpansion === 'all' }" class="md-icon-button" @click="setExpansion('all')">
                    <img src="../../assets/game-wow.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("All") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchExpansion === 'tww' }" class="md-icon-button" @click="setExpansion('tww')">
                    <img src="../../assets/tww-toggle.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("The War Within") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchExpansion === 'mop' }" class="md-icon-button" @click="setExpansion('mop')">
                    <img src="../../assets/mop-toggle.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("Mists of Pandaria") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchExpansion === 'classic' }" class="md-icon-button" @click="setExpansion('classic')">
                    <img src="../../assets/classic-toggle.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("Classic") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchExpansion === 'titan-wotlk' }" class="md-icon-button" @click="setExpansion('titan-wotlk')">
                    <img src="../../assets/wotlk-toggle.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("Titan Reforged Classic WotLK") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchExpansion && !searchExpansion.match(/tww|mop|classic|titan-wotlk/) }" class="md-icon-button" @click="setExpansion('legacy')">
                    <img src="../../assets/legacy-toggle.svg">
                    <md-tooltip md-direction="bottom" class="">{{ $t("Legacy") }}</md-tooltip>
                  </md-button>
                  <div class="md-button md-icon-button md-theme-default">
                    <md-icon>help</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Note that the expansion filter is only applied to WeakAura imports") }}</md-tooltip>
                  </div>
                </md-button-toggle>
              </div>
              <div v-if="$store.state.gameDomain === 0 && searchMode !== 'comments'">
                <div>
                  <label>{{ $t('Addon') }}</label>
                  <small id="selected-addon">{{
                    searchType === 'weakaura' &&'WeakAuras' ||
                    searchType === 'elvui' && 'ElvUI' ||
                    searchType === 'plater' && 'Plater Nameplates' ||
                    searchType === 'blizzhud' && 'Blizzard Edit Mode' ||
                    searchType === 'cooldown-manager' && 'Blizzard Cooldown Manager' ||
                    searchType === 'cell' && 'Cell' ||
                    searchType === 'gse' && 'GSE' ||
                    searchType === 'opie' && 'OPie' ||
                    searchType === 'totalrp3' && 'TotalRP' ||
                    searchType === 'vuhdo' && 'VuhDo' ||
                    searchType === 'baganator' && 'Baganator' ||
                    searchType === 'platynator' && 'Platynator' ||
                    searchType === 'dbm' && 'DBM' ||
                    searchType === 'bigwigs' && 'BigWigs' ||
                    searchType === 'mdt' && 'MDT' ||
                    searchType === 'macro' && 'MACRO' ||
                    searchType === 'shippets' && 'Snippets' ||
                    searchType === 'collection' && 'Collections' ||
                    $t('All')
                    }}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn select-search-mode">
                    <md-button :class="{ 'md-toggle': !searchType || searchType === 'all' }" class="md-icon-button" @click="setType('all')">
                      <img src="../../assets/wagoio-logo.png">
                      <md-tooltip md-direction="bottom" class="">{{ $t("All") }}</md-tooltip>
                    </md-button>
                  <md-button :class="{ 'md-toggle': searchType === 'weakaura' }" class="md-icon-button" @click="setType('weakaura')">
                    <category-image :group="'t-weakaura-nobg'"></category-image>
                    <md-tooltip md-direction="bottom" class="">{{ $t("WeakAuras") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchType === 'elvui' }" class="md-icon-button" @click="setType('elvui')">
                    <category-image :group="'t-elvui'"></category-image>
                    <md-tooltip md-direction="bottom" class="">{{ $t("ElvUI") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchType === 'plater' }" class="md-icon-button" @click="setType('plater')">
                    <category-image :group="'t-plater'"></category-image>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Plater") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchType === 'macro' }" class="md-icon-button" @click="setType('macro')">
                    <category-image :group="searchType === 'macro' ? 't-macro-search' : 't-macro'"></category-image>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Macro") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchType === 'mdt' }" class="md-icon-button" @click="setType('mdt')">
                    <category-image :group="'t-mdt'"></category-image>
                    <md-tooltip md-direction="bottom" class="">{{ $t("MDT") }}</md-tooltip>
                  </md-button>
                  <div id="addon-button" :class="{ 'md-toggle': searchType && !searchType.match(/^(all|weakaura|elvui|plater|mdt|macro)$/) }" class="md-button md-icon-button md-theme-default">
                    <img src="../../assets/misc-addons.svg" style="margin-top:2px">
                  </div>
                  <div id="addon-dropdown">
                    <div @click="setType('baganator')"><span class="addon-icon"><img src="../../assets/menu-baginator.png"></span> Baganator</div>
                    <div @click="setType('bigwigs')"><span class="addon-icon"><img src="../../assets/menu-bigwigs.png"></span> BigWigs</div>
                    <div @click="setType('blizzhud')"><span class="addon-icon"><img src="../../assets/menu-blizzhud.png"></span> Blizzard Edit Mode</div>
                    <div @click="setType('cooldown-manager')"><span class="addon-icon"><img src="../../assets/menu-blizzhud.png"></span> Blizzard Cooldown Manager</div>
                    <div @click="setType('cell')"><span class="addon-icon"><img src="../../assets/menu-cell.png"></span> Cell</div>
                    <div @click="setType('dbm')"><span class="addon-icon"><img src="../../assets/menu-dbm.png"></span> Deadly Boss Mods</div>
                    <div @click="setType('gse')"><span class="addon-icon"><img src="../../assets/menu-gse.png"></span> GSE</div>
                    <div @click="setType('opie')"><span class="addon-icon"><img src="../../assets/menu-opie.png"></span> OPie</div>
                    <div @click="setType('platynator')"><span class="addon-icon"><img src="../../assets/menu-platynator.png"></span> Platynator</div>
                    <div @click="setType('totalrp3')"><span class="addon-icon"><img src="../../assets/menu-trpcamp.png"></span> Total RP</div>
                    <div @click="setType('vuhdo')"><span class="addon-icon"><img src="../../assets/menu-vuhdo.png"></span>VuhDo</div>
                    <div @click="setType('collection')"><span class="addon-icon"><img src="../../assets/menu-collection.png"></span> Collection</div>
                  </div>
                </md-button-toggle>
              </div>
              
              <div v-if="searchGame === 'wow' && searchMode !== 'comments'" id="toggle-spacer"></div>
              <div>
                <div>
                  <label>{{ $t('Mode') }}</label>
                  <small id="selected-mode">{{
                    searchMode === 'imports' && $t('Imports') ||
                    searchMode === 'starred' && $t('Favorites') ||
                    searchMode === 'comments' && $t('Comments') ||
                    searchMode === 'code' && $t('Lua Code')
                    }}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn select-search-mode">
                  <md-button :class="{ 'md-toggle': searchMode === 'imports' }" class="md-icon-button" @click="setMode('imports')">
                    <md-icon>description</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("All imports") }}</md-tooltip>
                  </md-button>
                  <md-button v-if="$store.state.user && $store.state.user.UID" :class="{ 'md-toggle': searchMode === 'starred' }" class="md-icon-button" @click="setMode('starred')">
                    <md-icon>star</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("My starred imports") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchMode === 'comments' }" class="md-icon-button" @click="setMode('comments')">
                    <md-icon>comment</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Comments") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchMode === 'code' }" class="md-icon-button" @click="setMode('code')" :disabled="disableCode">
                    <md-icon>code</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Lua Code") }}</md-tooltip>
                  </md-button>
                </md-button-toggle>
              </div>
              <div>
                <div>
                  <label>{{ $t('Sort') }}</label>
                  <small>{{
                    searchSort === 'tstest' && $t('Typesense Test') ||
                    searchSort === 'date' && $t('Date') ||
                    searchSort === 'stars' && $t('Stars') ||
                    searchSort === 'views' && $t('Views') ||
                    searchSort === 'installs' && $t('Installs') ||
                    $t('Best Match')}}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn">
                    <!-- <md-button :class="{ 'md-toggle': searchSort === 'tstest' }" class="md-icon-button" @click="searchSort='tstest'">
                      <md-icon>search</md-icon>
                      <md-tooltip md-direction="bottom" class="">Typesense Test</md-tooltip>
                    </md-button> -->
                  <md-button :class="{ 'md-toggle': searchSort === 'bestmatchv3' }" class="md-icon-button" @click="searchSort='bestmatchv3'">
                    <md-icon>check_circle</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Best Match") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'stars' }" class="md-icon-button" @click="searchSort='stars'" :disabled="disableMetrics">
                    <md-icon>star</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Stars") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'views' }" class="md-icon-button" @click="searchSort='views'" :disabled="disableMetrics">
                    <md-icon>visibility</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Views") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'installs' }" class="md-icon-button" @click="searchSort='installs'" :disabled="disableInstalls">
                    <md-icon>file_download</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Installs") }}</md-tooltip>
                  </md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'date' }" class="md-icon-button" @click="searchSort='date'">
                    <md-icon>calendar_today</md-icon>
                    <md-tooltip md-direction="bottom" class="">{{ $t("Date") }}</md-tooltip>
                  </md-button>
                </md-button-toggle>
              </div>
            </md-layout>
          </md-layout>
          <p v-if="!results.total">{{ $t('No results found, try changing the search mode or query') }}</p>
        </div>
      </md-layout>

      <div id="searchResults">
        <ui-loading v-if="isSearching"></ui-loading>
        <md-layout md-column v-else-if="!isSearching && results.results && results.results.length">
          
          <template v-for="(result, index) in results.results">
            <div v-if="index && index % 9 === 0 && $store.state.advertSetup" v-bind:key="`ad${index}`" class="wago-in-article-ad-container ad-in-search">
              <span class="wago-advert-text" v-if="!$store.state.advertBlocked">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wago" target="_blank" rel="noopener" class="wago-advert-patreon">{{ $t('Hide Ads with Patreon') }}</a></span>
              <advert :ad="'leaderboard-search-' + Math.round(index / 9)" v-if="results.results.length > 9" :container="$store.state.advertBlocked" />
              <div :id="'leaderboard-search-' + Math.round(index / 9)"></div>
              <advert :ad="'mobile-search-' + Math.round(index / 9)" v-if="results.results.length > 9" :container="$store.state.advertBlocked" />
              <div :id="'mobile-search-' + Math.round(index / 9)"></div>
            </div>
            <div v-if="result && searchMode === 'code'" v-bind:key="index">              
              <router-link :to="'/' + (result.id || result.slug)"  class="searchResult codeResult">
                <div class="searchText">
                  <md-layout>
                    <div>
                      <strong>{{ result.name || result.type }}</strong>
                      <span class="hidden-status" v-if="result.hidden"><md-icon>visibility_off</md-icon></span>
                    </div>
                    <md-layout>
                      <span>{{ displayExpansion(result) }}{{ result.wagolib && result.wagolib.addon || result.type }}</span>
                      <span>{{ result.timestamp | moment('LLL') }}</span>
                      <span class="result-user" :class="result.userClass"><md-icon>person</md-icon><span>{{ result.userName }}</span></span>
                      <span>{{ $t("[-count-] view", { count: result.views }) }}</span>
                      <span>{{ $t("[-count-] star", { count: result.stars }) }}</span>
                    </md-layout>
                  </md-layout>
                  <template v-for="(code, cid) in parseCodeResult(result.customCode)">
                    <span class="code-name">{{code.name}}</span>
                    <editor v-model="code.lua" @init="codeViewInit" lang="lua" :theme="$store.state.user.config.editor || 'terminal'" width="100%" height="50"></editor>
                  </template>
                </div>
              </router-link>
            </div>
            <div v-else-if="result && results.index === 'comments'" v-bind:key="index">
              <router-link :to="'/' + result.importID" class="searchResult commentResult">
                <div class="searchImgContainer">
                  <placeholder-img class="searchImg" :text="$t('Comment').toUpperCase()" :icon="result.userAvatar"></placeholder-img>
                </div>
                <div class="searchText">
                  <strong>{{ result.importName }}
                    <span class="hidden-status" v-if="result.hidden"><md-icon>visibility_off</md-icon></span>
                  </strong>
                  <div>
                    <div class="col-3">
                      <span class="result-user"><md-icon>person</md-icon><span :class="result.userClass">{{ result.userName }}</span></span>
                      <span>{{ result.timestamp | moment('LLL') }}</span>
                      <span><template v-if="unreadMentions.includes(result.id)">
                        <span class="red">{{ $t('Alert!!') }}</span>
                        <span class="clear-button" @click="clearAlert($event, result.id)">{{ $t('Clear alert') }}</span>
                      </template></span>
                    </div>
                  </div>
                  <formatted-text :text="{text: result.text, format: 'bbcode'}" :plaintext="true" :hideLinks="true" :truncate="1000"></formatted-text>
                </div>
              </router-link>
            </div>
            <div v-else-if="result" v-bind:key="index">
              <router-link :to="'/' + (result.id || result.slug)" class="searchResult">
                <div class="searchImgContainer">
                  <template v-if="result.thumbnail">
                    <div class="searchImg searchStatic" :ref="'img-' + result.id" v-if="result.thumbnailStatic && result.thumbnail" :style="`background-image: url(${result.thumbnailStatic})`"></div>
                    <div class="searchImg" v-if="result.thumbnail" :style="`background-image: url(${result.thumbnail})`"></div>
                  </template>
                  <placeholder-img class="searchImg" :text="result.type" v-else></placeholder-img>
                </div>
                <div class="searchText">
                  <strong :to="'/' + (result.id || result.slug)">{{ result.name || result.type }}</strong>
                  <span class="hidden-status" v-if="result.hidden"><md-icon>visibility_off</md-icon></span>
                  <div>
                    <div class="row">
                      <span class="result-user" :class="result.userClass"><md-icon>person</md-icon><span>{{ result.userName }}</span></span>
                      <span>{{ result.timestamp | moment('LLL') }}</span>
                    </div>
                    <div class="row">
                      <span>{{ $t("[-count-] view", { count: result.views }) }}</span>
                      <span>{{ $t("[-count-] star", { count: result.stars }) }}</span>
                      <span v-if="result.installs">{{ $t("[-count-] install", { count: result.installs }) }}</span>
                      <span>{{ $t("[-count-] comment", { count: result.comments }) }}</span>
                    </div>
                  </div>
                  <formatted-text v-if="typeof result.description === 'string'" :text="{text: result.description, format: 'plaintext'}" :plaintext="true" :hideLinks="true" :truncate="250"></formatted-text>
                  <formatted-text v-else :text="result.description" :plaintext="true" :hideLinks="true" :truncate="250"></formatted-text>
                  <div class="searchTags">
                    <span>{{ displayExpansion(result) }}{{ result.wagolib && result.wagolib.addon || result.type }}</span>
                    <md-chip v-for="(cat, n) in result.categories" v-bind:key="cat.id" :class="cat.id" disabled v-if="cat && cat.text && n<4">{{ cat.text }}</md-chip>
                  </div>
                </div>
              </router-link>
            </div>
          </template>
          <!--<advert ad="leaderboard_atf" :patreonLink="true" :frame="false" v-if="!isCollection && (index %9 === 2 || (results.total < 3 && index === results.total - 1))" />-->
        </md-layout>
      </div>
    </md-layout>
    <p v-if="isSearchingMore">{{ $t("Loading more") }}</p>
  </md-card>
</template>

<script>
import SearchMeta from '../UI/SearchMeta.vue'
import FormattedText from '../UI/FormattedText.vue'
import PlaceHolderImage from '../UI/PlaceHolderImage.vue'
import CategoryImage from '../UI/CategoryImage.vue'

export default {
  data: function () {
    return {
      results: {
        total: 0
      },
      searchSort: window.localStorage.getItem('searchSort') || 'bestmatchv3',
      searchMode: '',
      searchGame: '',
      searchExpansion: '',
      searchType: '',
      searchString: '',
      searchParams: {q: ''},
      searchOptions: 'sort: Date',
      floatSideBar: false,
      tagContext: [],
      searchTime: 0,
      tagMap: {},
      isSearching: true,
      isSearchingMore: false,
      sortVal: this.contextSort || this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.sort || 'bestmatch',
      uiSearchValue: false,
      catRelevance: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.relevance || 'standard',
      uiRelevanceValue: false,
      filterExpansion: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion || '',
      uiExpansionValue: false,
      contextSearchData: this.contextSearch,
      isCollection: false,
      includeReadMentions: '',
      disableInstalls: false,
      disableMetrics: false,
      disableCode: false,
      searchOnce: null,
      queryHTML: '',
      queryOptions: ''
    }
  },
  props: ['context', 'collection'],
  components: {
    'search-meta': SearchMeta,
    'formatted-text': FormattedText,
    'placeholder-img': PlaceHolderImage,
    'category-image': CategoryImage,
    editor: require('vue2-ace-editor'),
  },
  watch: {
    '$route' (to, from) {
      this.searchMode = to.params.mode || window.localStorage.getItem(`search.mode`) || 'imports'
      this.searchGame = to.params.game || window.localStorage.getItem(`search.game`) || 'wow'

      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
      })
      this.searchString = (params.q || '').trim()
      if (this.context) {
        this.parseContext()
      }

      this.$store.commit('setSearchText', this.searchString, true)
      this.execSearch()

      if (to.path === '/search') {
        this.updateRoute()
      }
    },
    execSearch (to, from) {
      // setup watcher to exec on demand
    },
    searchSort (val) {
      this.execSearch()
    },
    searchMode (val) {
      this.execSearch()
    },
    searchGame (val) {
      this.execSearch()
    },
    searchExpansion (val) {
      this.execSearch()
    },
    searchType (val) {
      this.execSearch()
    },
  },
  computed: {
    unreadMentions() {
      return this.$store.state.user && this.$store.state.user.unreadMentions && this.$store.state.user.unreadMentions.map(x => x._id)
    }
  },
  methods: {
    execSearch: function () {
      clearTimeout(this.searchOnce)
      this.searchOnce = setTimeout(() => {
        this.runSearch()
      }, 10)
    },

    updateRoute: function (replace=false) {
      console.log('update route')
      if (this.searchExpansion === 'undefined') this.searchExpansion = ''
      let expansionType = this.searchExpansion || this.searchType
      if (this.searchExpansion && this.searchExpansion !== 'undefined' && this.searchType === 'weakaura') {
        expansionType = `${this.searchExpansion}-${this.searchType}`
      }
      else if (this.searchType) {
        expansionType = this.searchType
      }
      if (!this.searchString || this.searchString === 'undefined') {
        this.searchString = ''
      }
      this.searchString = this.searchString.trim()
      let path = `/search/${this.searchMode}?q=${encodeURIComponent(this.searchString)}`
      if (expansionType && this.searchGame === 'wow') {
        path = `/search/${this.searchMode}/${this.searchGame}/${expansionType}?q=${encodeURIComponent(this.searchString)}`
      }
      else if (this.searchGame) {
        path = `/search/${this.searchMode}/${this.searchGame}?q=${encodeURIComponent(this.searchString)}`
      }      

      if (!replace) {
        this.$router.push({ path })
      }
      else {
        this.$router.replace({ path })
        window.localStorage.setItem(`search.game`, this.searchGame)
        window.localStorage.setItem(`search.expansion.${this.searchGame}`, this.searchExpansion)
        window.localStorage.setItem(`search.type.${this.searchGame}`, this.searchType)
      }
    },

    setGame: function (game) {
      this.searchGame = game
      this.$store.commit('setSearchGame', {game})
      this.searchExpansion = window.localStorage.getItem(`search.expansion.${this.searchGame}`) || ''
      this.searchType = window.localStorage.getItem(`search.type.${this.searchGame}`) || ''

      this.disableCode = game !== 'wow'
      if (this.disableCode && this.searchMode === 'code') {
        this.setMode('imports')
        this.disableCode = true
      }
      this.updateRoute()
    },

    setExpansion: function (exp) {
      this.searchExpansion = exp
      window.localStorage.setItem(`search.expansion.${this.searchGame}`, exp)
      this.updateRoute()
    },

    setType: function (type) {
      this.searchType = type
      window.localStorage.setItem(`search.type.${this.searchGame}`, type)

      this.disableCode = this.searchType && this.searchType.match(/(weakaura|plater)/) === null
      if (this.disableCode && this.searchMode === 'code') {
        this.setMode('imports')
        this.disableCode = true
      }
      this.updateRoute()
    },

    setMode: function (mode) {
      this.searchMode = mode
      this.$store.commit('setSearchMode', {mode})
      window.localStorage.setItem(`search.mode`, mode)
      this.updateRoute()
    },
    
    codeViewInit: function (editor) {
      window.braceRequires()
      editor.setOptions({
        scrollPastEnd: false,
        printMargin: false,
        maxLines: 6,
        readOnly: true,
        useWorker: false,
        showLineNumbers: true,
        showGutter: true,
        wrap: true,
        highlightActiveLine: false
      })
      editor.container.style.pointerEvents="none"
      this.$nextTick(() => {
        editor.$search.setOptions({
          needle: new RegExp(this.results.query.replace(/[^\w]/g, ' ').replace(/\s+/g, '|'), 'ig'),
          regExp: false,
        })
        let ranges = editor.$search.findAll(editor.session)
        ranges.forEach(range => {
          editor.session.addMarker(range, "found-text", "text", true)
        })
        if (ranges && ranges[0]) {
          editor.scrollToRow(Math.max(0, ranges[0].start.row - 2))
        }
      })
    },

    parseCodeResult: function (code) {
      const parsed = []
      const re = new RegExp(this.results.query.replace(/[^\w]/g, ' ').replace(/\s+/g, '|'), 'ig')
      for (const fn of code) {
        const [key, ...main] = fn.split('\n')
        const name = key.replace(/^-- wagokey: /, '')
        const lua = main.join('\n') + '\n'
        if (lua.match(re) || name.match(re)) {
          parsed.push({name, lua})
        }
        if (parsed.length === 2) {
          return parsed
        }
      }
      return parsed
    },

    displayExpansion: function (item) {
      if (item.type !== 'WEAKAURA') {
        return ''
      }
      else if (item.expansion === 0) {
        return 'CLASSIC-'
      }
      else if (item.expansion === 1) {
        return 'TBC-'
      }
      else if (item.expansion === 2) {
        return 'WOTLK-'
      }
      else if (item.expansion === 3) {
        return 'CATA-'
      }
      else if (item.expansion === 4) {
        return 'MOP-'
      }
      else if (item.expansion === 5) {
        return 'WOD-'
      }
      else if (item.expansion === 6) {
        return 'LEGION-'
      }
      else if (item.expansion === 7) {
        return 'BFA-'
      }
      else if (item.expansion === 8) {
        return 'SL-'
      }
      else if (item.expansion === 9) {
        return 'DF-'
      }

      return ''
    },
    runSearch: function (sid, force) {
      let query = this.$store.state.siteSearch.trim().replace(/\s{2,}/g, ' ').replace(/#/g, '%23')
      this.disableInstalls = this.searchType.match(/(weakaura|plater)/) === null
      this.disableCode = (this.searchType && this.searchType.match(/(weakaura|plater)/) === null) || this.searchGame !== 'wow'
      this.disableMetrics = this.$store.state.searchMode.match(/starred|comments/) !== null

      if (this.searchSort === 'bestmatchv2') {
        this.searchSort = 'bestmatchv3'
      }

      if (this.disableInstalls && this.searchSort.match(/installs/)) {
        this.searchSort = ''
      }
      else if (this.disableMetrics && this.searchSort.match(/stars|views|installs/)) {
        this.searchSort = ''
      }

      this.isSearching = true
      if (this.searchMode === 'comments') {
        this.searchParams = {q: query, mode: this.searchMode, page: 0, sort: this.searchSort}
      }
      else {
        this.searchParams = {
            q: query, 
            mode: this.collection ? 'all' :(this.searchMode ?? '').trim(), 
            game: this.collection ? 'all' :(this.searchGame ?? '').trim(), 
            expansion: this.collection ? 'all' :(this.searchExpansion ?? '').trim(), 
            type: this.collection ? 'all' :(this.searchType ?? '').trim(), 
            page: 0, 
            sort: this.collection ? 'bestmatchv3' :this.searchSort
        }
      }

      if (query.match(/\b(?:alerts?|mentioned):\s*(1|true)\b/i)) {
        this.searchParams.includeRead = this.includeReadMentions
      }
      let searchURL = '/search/es'
      if (!this.context) {
        this.updateRoute(true)
      }
      this.http.get(searchURL, this.searchParams).then((res) => {
        let hits = res.hits || res.results
        const fieldText = []
        if (document.getElementById('selected-expansion')) {
          fieldText.push(document.getElementById('selected-expansion').innerText)
        }
        else if (document.getElementById('selected-game')) {
          fieldText.push(document.getElementById('selected-game').innerText)
        }
        if (document.getElementById('selected-addon')) {
          fieldText.push(document.getElementById('selected-addon').innerText)
        }
        if (document.getElementById('selected-mode')) {
          fieldText.push(document.getElementById('selected-mode').innerText)
        }

        this.queryOptions = fieldText.join(' - ')
        
        const qlSearchBox = document.querySelector('.ql-editor p')
        if (qlSearchBox) {
            this.queryHTML = qlSearchBox.innerHTML
            this.queryHTML = this.queryHTML.replace(/<button.*?<\/button>/g, '').replace(/<br\/?\s*>/, '')
        }
        else {
            this.queryHTML = ''
            document.querySelectorAll('#inputWrapper li').forEach((li) => {
                if (li.innerHTML.match(/<input/)) {
                    this.queryHTML += li.children[0].value
                }
                else {
                    this.queryHTML += `<span class="${li.className}">${li.innerHTML}</span>` + ' '
                }
            })
        }


        for (var i = 0; i < hits.length; i++) {
          if (hits[i] && typeof hits[i] === 'object' && hits[i].categories) {
            hits[i].categories = hits[i].categories.map((cat) => {
              return window.Categories.categories[cat]
            })
          }
          // if (hits[i] && typeof hits[i] === 'object' && hits[i].code) {
          //   hits[i].code = hits[i].categories.map((cat) => {
          //     return window.Categories.categories[cat]
          //   })
          // }
        }

        if (query.match(/collection:/i)) {
          this.isCollection = true
        }
        else {
          this.isCollection = false
        }

        this.$set(this.results, 'total', res.nbHits || res.total)
        this.$set(this.results, 'query', res.query)
        this.$set(this.results, 'index', res.index)
        this.$set(this.results, 'results', hits)
        this.isSearching = false
          
        if (window.ramp?.pageReprocess) {
          window.ramp.pageReprocess()
        }
      })
    },
    watchScroll () {
      try {
        var content = document.getElementById('searchLayout')
        var rect = content.getBoundingClientRect()
        if (rect.y < 0) {
          this.floatSideBar = true
        }
        else {
          this.floatSideBar = false
        }
      }
      catch (e) {
        this.floatSideBar = false
      }

      // infinite search
      if (this.results && this.results.total && (this.results.results && this.results.total > this.results.results.length) && !this.isSearching && !this.isSearchingMore) {
        if (document.body.scrollHeight - 600 <= document.body.scrollTop + window.innerHeight || document.body.scrollHeight - 600 <= document.documentElement.scrollTop + window.innerHeight) {
          this.searchMore()
        }
      }
    },
    searchMore: function () {
      this.isSearchingMore = true
      let searchURL = '/search/es'
      this.$set(this.searchParams, 'page', this.searchParams.page + 1)
      this.http.get(searchURL, this.searchParams).then((res) => {
        let hits = res.hits || res.results
        for (var i = 0; i < hits.length; i++) {
          if (hits[i] && typeof hits[i] === 'object') {
            hits[i].categories = hits[i].categories.map((cat) => {
              return window.Categories.categories[cat]
            })
          }
        }

        let merged = this.results.results.concat(hits)
        this.$set(this.results, 'results', merged)

        this.isSearchingMore = false

        this.$nextTick(() => {
          if (window.tyche?.displayUnits) {
            window.tyche.displayUnits()
          }
          
          if (window.ramp?.pageReprocess) {
              window.ramp.pageReprocess()
          }
        })
      })
    },

    clearAlert(e, id) {
      e.preventDefault()
      this.http.post('/comments/clear', {comment: id}).then(res => {
        this.$store.commit('userClearMention', id)
      })
    },

    parseContext() {
      this.searchMode = this.context.mode || this.$store.state.searchMode || window.localStorage.getItem(`search.mode`) || 'imports'
      this.searchGame = this.context.game || this.$store.state.searchGame || window.localStorage.getItem(`search.game`) || 'wow'
      if (this.$store.state.gameDomain) {
        this.searchExpansion = 'fellowship'
        this.searchType = 'fellowship-ui'
      }
      else if (this.context.expansion || this.context.type) {
        this.searchExpansion = this.context.expansion || this.$store.state.searchExpansion || window.localStorage.getItem(`search.expansion.${this.searchGame}`) || 'all'        
        this.searchType = this.context.type || this.$store.state.searchType || window.localStorage.getItem(`search.type.${this.searchGame}`) || 'all'
      }
      else if (!this.context.expansionType) {
        this.searchExpansion = window.localStorage.getItem(`search.expansion.${this.searchGame}`) || 'all'
        this.searchType = window.localStorage.getItem(`search.type.${this.searchGame}`) || 'all'
      }
      else if (this.context.expansionType.match(/(classic|tbc|wotlk|cata|mop|wod|legion|bfa|sl|df|tww)-/)) {
        let s = this.context.expansionType.split('-')
        if (s[2]) {
          this.searchExpansion = `${s[0]}-${s[1]}`
          this.searchType = s[2]
        }
        else {
          this.searchExpansion = s[0]
          this.searchType = s[1]
        }
      }
      else if (this.context.expansionType.match(/^(classic|tbc|wotlk|cata|mop|wod|legion|bfa|sl|df|tww)$/)) {
        this.searchExpansion = this.context.expansionType
        this.searchType = ''
      }
      else {
        this.searchExpansion = ''
        this.searchType = this.context.expansionType
      }
 
      if (this.context.query) {
        this.searchString = this.context.query.trim()
      }
       
      window.localStorage.setItem(`search.mode`, this.searchMode)
      window.localStorage.setItem(`search.game`, this.searchGame)
      window.localStorage.setItem(`search.expansion.${this.searchGame}`, this.searchExpansion)
      window.localStorage.setItem(`search.type.${this.searchGame}`, this.searchType)
    }
  },
  created: function () {
    this.initTime = new Date
    window.addEventListener('scroll', this.watchScroll)
      
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    })
    this.searchString = (params.q || '').trim()

    if (this.context) {
      this.parseContext()
    }    
    else {
      this.searchMode = this.$store.state.searchMode || window.localStorage.getItem(`search.mode`) || 'imports'
      this.searchGame = this.$store.state.searchGame || window.localStorage.getItem(`search.game`) || 'wow'
      this.searchExpansion = this.$store.state.searchExpansion || window.localStorage.getItem(`search.expansion.${this.searchGame}`) || ''
      this.searchType = this.$store.state.searchType || window.localStorage.getItem(`search.type.${this.searchGame}`) || ''
    }
    this.$store.commit('setSearchText', this.searchString, true)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
  },
  mounted: function () {
    if (this.$route.name === 'searchredirect') {
      this.updateRoute()
    }
  }
}
</script>

<style lang="scss" scoped>
.md-card.collection {
  background: none!important;
  box-shadow: none!important;
  margin: 0!important;
  padding: 0!important;
}
#searchForm { padding: 16px; width: 100% }
#searchForm button { margin-top: -3px }
#searchOptions {
  align-items: center;
  flex-grow: 1;
  .md-layout {
    align-items: center;
    justify-items: flex-end;
  }
  label {
    opacity: .9;
    margin: 0 16px 0 0;
  }
  small {
    min-width: 70px;
    font-weight: bold;
  }
  .md-button-toggle {
    border: 1px solid #444;
    border-radius: 8px;
    padding: 0;
    width: auto;
    display: inline-flex;
    overflow: hidden;
    .md-button {
      height: 24px;
      width: 24px;
      padding: 4px;
      &.md-toggle:hover {
        background: #C1272D;
      }
      .material-icons {
        font-size: 16px;
        top: 8px;
      }
      .category-image {
        max-height:85%;
        max-width: 85%;
        margin: -2px auto 0;
      }
    }
    &.select-search-mode img {
      max-width: 32px;
      max-height: 24px;
    }

    & > #addon-dropdown {
      display: none;
      flex-direction: column;
      box-shadow: 5px 5px 30px #00000066;
      min-width: 170px;
      z-index: 99!important;
      .addon-icon {
        width: 20px;
        margin-right: 8px;
        margin-left: -4px;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        img {
          max-width: 100%;
          max-height: 16px;
        }
      }
      & > * {
        padding: 8px 16px;
        color: white;
        background: #3A3A3A;
        cursor: pointer;
        display: flex;
        align-items: center;
        &:hover {
          background: #444444;
          text-decoration: none;
        }
      }
      :last-child {
        border-radius: 0 0 2px 2px;
      }
    }
  }
  #addon-button:hover ~ #addon-dropdown, #addon-dropdown:hover {
    display: flex;
    position: absolute;
    top: 58px;
    right: 0;
  }
}
#searchData { width: 100%}
#searchData .md-button-toggle { flex-wrap: wrap;}
#queried {margin-bottom: 8px; display: inline-block;}

#searchPage {
  overflow: initial
}
#content #searchPage {
  padding: 0;
  background: none;
  box-shadow: none;

  #searchMeta {
    flex: 0
  }

  #searchLayout {
    flex-direction: column;
  }
  > div > div {
    max-width: 100%;
  }
  #toggle-spacer {
    flex-basis: 100%;
  }
  .ad-in-search {
    text-align: center;
    padding: 0;
    .wago-advert-text {
      font-size: 80%;
      z-index: 99999;
    }
    & > div {
      padding: 0 0 0 0;
    }
    .ad-box {
    }
  }
  .searchResult {
    width: 100%;
    position: relative;
    margin: 0 0 16px 0;
    border-radius: 4px;
    border: 3px solid #333333;
    cursor: pointer;
    display: flex;
    background: #333333;
    color: #EEE;
    &:hover {
      text-decoration: none;
      border-color: #444444;
      .searchStatic {
        display: none;
        & + .searchImg {
          display: block;
        }
      }
    }
    .searchImgContainer {
      width: 300px; min-width: 300px; max-width: 300px;
      background-color: #222222;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='16' viewBox='0 0 12 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 .99C4 .445 4.444 0 5 0c.552 0 1 .45 1 .99v4.02C6 5.555 5.556 6 5 6c-.552 0-1-.45-1-.99V.99zm6 8c0-.546.444-.99 1-.99.552 0 1 .45 1 .99v4.02c0 .546-.444.99-1 .99-.552 0-1-.45-1-.99V8.99z' fill='%23221111' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
      background-position: center;
      .searchImg {
        background-position: center;
        background-size: contain;
        background-repeat: no-repeat;
        width: 300px; min-width: 300px; max-width: 300px;
        height: 175px;
        border-radius: 4px;
      }
    }
    .searchStatic + .searchImg {
      display: none;
    }
    .searchText {
      color: inherit;
      z-index: 2;
      position: relative;
      width: 100%;
      height: 175px;
      overflow: hidden;
      text-shadow: 1px 1px 2px #000;
      padding: 8px;
      display: flex;
      flex-direction: column;
      pointer-events: none;
      strong {
        display: block;
        font-weight: bold;
        font-size: 120%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        width: 100%;
        margin-top: 4px;
      }
      .col-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        *:last-child {
          text-align: right;
        }
      }
      .result-user i {
        font-size: 20px;
      }
      .usertext {
        margin-top: 2px;
        margin-bottom: 27px;
        padding-top: 2px;
        flex-grow: 1;
        line-height: 170%;
        border-top: 1px solid #55555599;
        color: #CCC;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      .searchTags {
        margin: -8px;
        max-height: 24px;
        overflow: hidden;
        span {
          font-weight: bold;
          padding: 4px 4px 4px 8px;
        }
        .md-chip {
          height: auto;
          margin: 0 0 0 4px;
          padding: 4px 8px 4px 22px;
          background-size: 18px 18px;
          background-position: 2px 2px;
        }
      }
      .red {
        color: #B80000;
        font-weight: bold;
      }
      .clear-button {
        padding: 2px 4px;
        background: #444;
        border-radius: 2px;
        pointer-events: all;
        color: #EED;
        &:hover {
          background: #555;
        }
      }
    }
  }
  .trendi_video {
    width: 300px;
    margin: 0;
  }
  .med_rect_btf {
    height: 250px;
    width: 300px;
    margin: 0 8px 0 0;
    padding: 0;
    div {
      margin: 0
    }
  }
}

#searchOptions {
  flex: 1;
  justify-content: flex-end;
  gap: 16px;
}
#content #searchPage .searchResult.commentResult .searchText .usertext {
  margin-bottom: -4px;
}
.searchResult .hidden-status { font-weight: bold; margin-left: 8px; opacity: .7 }

#searchSide {display: flex; justify-content: space-between; flex-wrap: nowrap;}

#searchMeta, #search-ad-container {transition: margin 200ms ease; max-width: 408px}
#searchMeta {max-width: 300px; }
#searchMeta .md-whiteframe { padding: 8px;}

.codeResult .searchText {width: 100%; height: auto!important}
.codeResult .searchText .code-name {width: 100%; font-size: small; margin-top: 4px; padding: 0 4px; background: #555; border: 1px solid #666; border-bottom: 0;}
.codeResult .searchText > .md-layout { width: 100%; justify-content: space-between}
.codeResult .searchText > .md-layout > .md-layout { gap: 16px; flex-wrap: wrap; flex: initial}
.codeResult .searchText .ace_editor {border: 1px solid #77777733;}
.codeResult .searchText .ace_scrollbar {display: none}
.codeResult .searchText .ace_content .found-text {position: absolute; background: #FFFF0044}

#searchResults {
  width: 100%;
  margin-top: 16px;
  flex: 1;
  & > .md-layout > div {
    max-width: 100%;
  }
  .wago-ad-container {
    margin: 0 auto 16px auto;
    padding: 16px 8px 8px 8px;
  }
}

@media (max-width: 600px) {
  #content #searchPage {
    margin: 0;
    background: none;


    .searchResult {
      width: 100vw;
      height: auto;
      min-height: 180px;
      flex-direction: column;
      .searchImg {
        width: 100%;
        max-width: 100%;
        max-height: 120px;
      }
      .searchText {
        height: auto;
        strong {
          overflow: visible;
        }
        .col-3 {
          grid-template-columns: 1fr;
        }
        .usertext {
          margin-bottom: 10px;
        }
      }
    }
  }
}



</style>

<style>
#searchQuery {
    line-height:180%;
    > * {
      display: block;
    }    
    .x-button {
        display: none;
    }
    .search-tag {
        padding-left: 20px;
        background-size: 16px;
        background-repeat: no-repeat;
        
        &.imptype {
          border-color: #fff0fd;
          color: #fff0fd;
        }
        &.expansion {
          border-color: #d8652e;
          color: #d8652e;
        }
        &.tag-collection {
          color: #CAA27E;
          border-color: #CAA27E;
        }
        &.tag-mentions {
          color: #ED7032;
          border-color: #ED7032;
        }
        &.tag-user {
          color: #FFC83D;
          border-color: #FFC83D;
        }
        &.exp-tww {
          border-color: #27eab0;
          color: #27eab0;
        }
        &.exp-df {
          border-color: #27eab0;
          color: #27eab0;
        }
        &.exp-sl {
          border-color: #eaae27;
          color: #eaae27;
        }
        &.exp-tbc {
          border-color: #BED82E;
          color: #BED82E;
        }
        &.exp-wotlk {
          border-color: #5764da;
          color: #5764da;
        }
        &.filter-date {
          border-color: #e2fffa;
          color: #e2fffa;
        }
        &.filter-metric {
          border-color: #9fecd0;
          color: #9fecd0;
        }
    }
}
</style>