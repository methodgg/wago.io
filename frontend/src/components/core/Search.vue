<template>
  <md-card id="searchPage" :class="collection ? 'collection' : ''">
    <md-layout id="searchLayout">
      <md-layout>
        <div id="searchData">
          <slot></slot>
          <md-layout md-row>
            <p><strong v-html="$t('Found [-count-] results', {count: new Intl.NumberFormat().format(results.total)})"></strong></p>
            <span class="spacer"></span>
            <template v-if="results">
              <div>
                <div>
                  <label>{{ $t('Mode') }}</label>
                  <small>{{
                    searchMode === 'wow' && $t('WoW') ||
                    searchMode === 'xiv' && $t('FF XIV') ||
                    searchMode === 'starred' && $t('My favorites') ||
                    searchMode === 'comments' && $t('Comments') ||
                    searchMode === 'code' && $t('Lua Code')
                    }}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn select-search-mode">
                  <md-button :class="{ 'md-toggle': searchMode === 'wow' }" class="md-icon-button" @click="searchMode='wow'"><img src="../../assets/game-wow.svg"></md-button>
                  <md-button :class="{ 'md-toggle': searchMode === 'xiv' }" class="md-icon-button" @click="searchMode='xiv'"><img src="../../assets/game-ffxiv.svg"></md-button>
                  <md-button v-if="$store.state.user && $store.state.user.UID" :class="{ 'md-toggle': searchMode === 'starred' }" class="md-icon-button" @click="searchMode='starred'"><md-icon>star</md-icon></md-button>
                  <md-button :class="{ 'md-toggle': searchMode === 'comments' }" class="md-icon-button" @click="searchMode='comments'"><md-icon>comment</md-icon></md-button>
                </md-button-toggle>
              </div>
            </template>
            <template v-if="results">
              <div>
                <div>
                  <label>{{ $t('Sort') }}</label>
                  <small>{{
                    searchSort === 'date' && $t('Date') ||
                    searchSort === 'stars' && $t('Stars') ||
                    searchSort === 'views' && $t('Views') ||
                    searchSort === 'installs' && $t('Installs') ||
                    $t('Best Match')}}</small>
                </div>
                <md-button-toggle md-single class="md-accent md-warn">
                  <md-button :class="{ 'md-toggle': searchSort === '' }" class="md-icon-button" @click="searchSort=''"><md-icon>check_circle</md-icon></md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'stars' }" class="md-icon-button" @click="searchSort='stars'" :disabled="disableMetrics"><md-icon>star</md-icon></md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'views' }" class="md-icon-button" @click="searchSort='views'" :disabled="disableMetrics"><md-icon>visibility</md-icon></md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'installs' }" class="md-icon-button" @click="searchSort='installs'" :disabled="disableInstalls"><md-icon>file_download</md-icon></md-button>
                  <md-button :class="{ 'md-toggle': searchSort === 'date' }" class="md-icon-button" @click="searchSort='date'"><md-icon>calendar_today</md-icon></md-button>
                </md-button-toggle>
              </div>
            </template>
          </md-layout>
          <p v-if="!results.total">{{ $t('No results found, try changing the search mode or query') }}</p>
        </div>
      </md-layout>

      <div id="searchResults">
        <ui-loading v-if="isSearching"></ui-loading>
        <md-layout md-column v-else-if="!isSearching && results.results && results.results.length">
          <advert ad="desktop_in_article" v-if="results.results.length > 9" :container="false" />
          <template v-for="(result, index) in results.results">
            <div v-if="index && index % 9 === 0 && $store.state.advertSetup" class="wago-in-article-ad-container ad-in-search">
              <span class="wago-advert-text">{{ $t('Advertisement') }} - <a href="https://www.patreon.com/wago" target="_blank" rel="noopener" class="wago-advert-patreon">{{ $t('Hide Ads with Patreon') }}</a></span>
              <div class="ad-box">
              </div>
            </div>
            <div class="searchResult codeResult" v-if="result && results.index === 'code'" v-bind:key="index">
              <div class="searchText">
                <router-link :to="'/' + (result.id || result.slug)">{{ result.name || result.type }}</router-link>
                <span class="hidden-status" v-if="result.hidden"><md-icon>visibility_off</md-icon></span>
                <md-subheader>
                  <span>{{ displayExpansion(result) }}{{ result.wagolib && result.wagolib.addon || result.type }}</span>
                  <span>{{ result.timestamp | moment('LLL') }}</span>
                  <router-link v-if="result.userLinked" :class="result.userClass" :to="'/p/' + result.userName">{{ result.userName }}</router-link>
                  <span v-else-if="result.userName" :class="result.userClass">{{ result.userName }}</span>
                  <router-link v-else-if="result.user && result.user.searchable" :class="result.user.roleClass" :to="'/p/' + result.user.name">{{ result.user.name }}</router-link>
                  <span v-else-if="result.user" :class="result.user.roleClass">{{ result.user.name }}</span>
                  <span>{{ $t("[-count-] view", { count: result.views }) }}</span>
                  <span>{{ $t("[-count-] star", { count: result.stars }) }}</span>
                </md-subheader>
                <editor v-model="result.code" @init="codeViewInit" lang="lua" :theme="$store.state.user.config.editor || 'terminal'" width="100%" height="50"></editor>
              </div>
            </div>
            <div v-else-if="result && results.index === 'comment'" v-bind:key="index">
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

export default {
  data: function () {
    return {
      results: {
        total: 0
      },
      searchSort: window.localStorage.getItem('searchSort') || '',
      searchMode: '',
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
      filterExpansion: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion || 'all',
      uiExpansionValue: false,
      contextSearchData: this.contextSearch,
      isCollection: false,
      includeReadMentions: '',
      disableInstalls: false,
      disableMetrics: false
    }
  },
  props: ['contextSearch', 'contextGame', 'contextSort', 'contextDomain', 'collection'],
  components: {
    'search-meta': SearchMeta,
    'formatted-text': FormattedText,
    'placeholder-img': PlaceHolderImage,
    editor: require('vue2-ace-editor'),
  },
  watch: {
    '$route' (to, from) {
      this.searchString = ''
      if (this.contextGame) {
          this.searchString += `expansion:${this.contextGame} `
        }
      if (this.contextSearch) {
        this.searchString += this.contextSearch
      }
      this.searchString = this.contextSearch.replace(/\s+/g, ' ').trim()

      if (this.searchString) {
        this.$store.commit('setSearchText', this.searchString, true)
      }
    },
    execSearch (to, from) {
      // setup watcher to exec on demand
    },
    searchSort (val) {
      window.localStorage.setItem('searchSort', val)
      this.runSearch(this.$store.state.execSearch, true)
    },
    searchMode (val) {
      let q = this.$store.state.siteSearch
      if (val == 'wow') {
        q = q.replace(/mentions:\w+/ig, '')
      }
      else if (val == 'xiv') {
        q = q.replace(/(mentions|expansion):\w+/ig, '')
      }
      else if (val == 'starred') {
        q = q.replace(/(mentions|expansion):\w+/ig, '')
      }
      else if (val == 'comments') {
        q = q.replace(/(type|expansion|metric|tag):[\w-]+/ig, '')
      }
      this.$store.commit('setSearchOpts', {mode: val, query: q})
    },
    contextSearch (val) {
      const mode = (val.match(/^!(\w+)!/) || [])[1]
      if (mode) {
        this.searchMode = mode
      }
    }
  },
  computed: {
    execSearch () {
      this.runSearch(this.$store.state.execSearch)
      return this.$store.state.execSearch
    },

    unreadMentions() {
      return this.$store.state.user && this.$store.state.user.unreadMentions && this.$store.state.user.unreadMentions.map(x => x._id)
    }
  },
  methods: {
    codeViewInit: function (editor) {
      window.braceRequires()
      editor.setOptions({
        scrollPastEnd: false,
        printMargin: false,
        maxLines: 6,
        readOnly: true,
        useWorker: false,
        showLineNumbers: false,
        showGutter: false,
        wrap: true
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
          editor.scrollToRow(Math.max(0, ranges[0].start.row - 1))
        }
      })
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

      return ''
    },
    runSearch: function (sid, force) {
      this.$nextTick(() => {
        let query = this.$store.state.siteSearch.trim().replace(/\s{2,}/g, ' ')
        if (!force && (!query || (!force && (sid !== this.$store.state.execSearch || (this.searchParams.q.toLowerCase() === query.toLowerCase() && this.searchParams.mode === this.$store.state.searchMode))))) {
          return
        }

        this.disableInstalls = query.match(/type:(weakaura|plater)/) === null
        this.disableMetrics = this.$store.state.searchMode.match(/starred|comments/) !== null

        if (this.disableInstalls && this.searchSort.match(/installs/)) {
          this.searchSort = ''
        }
        else if (this.disableMetrics && this.searchSort.match(/stars|views|installs/)) {
          this.searchSort = ''
        }

        this.isSearching = true
        this.searchParams = {q: query, mode: this.$store.state.searchMode, page: 0, sort: this.searchSort}

        if (query.match(/\b(?:alerts?|mentioned):\s*(1|true)\b/i)) {
          this.searchParams.includeRead = this.includeReadMentions
        }
        let searchURL = '/search/es'
        this.http.get(searchURL, this.searchParams).then((res) => {
          let hits = res.hits || res.results
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
        })
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

        if (window.tyche) {
          window.tyche.displayUnits()
        }
      })
    },

    clearAlert(e, id) {
      e.preventDefault()
      this.http.post('/comments/clear', {comment: id}).then(res => {
        this.$store.commit('userClearMention', id)
      })
    }
  },
  created: function () {
    window.addEventListener('scroll', this.watchScroll)
  },
  destroyed: function () {
    window.removeEventListener('scroll', this.watchScroll)
  },
  mounted: function () {
    let mode
    if (typeof this.contextDomain !== 'undefined') {
      this.$store.commit('setDomain', this.contextDomain)
      if (this.contextDomain === 0) {
        mode = 'wow'
      }
      else if (this.contextDomain === 1) {
        mode = 'xiv'
      }
    }
    let initialSearch = ''
    if (this.contextGame) {
      initialSearch += `expansion:${this.contextGame} `
    }
    if (this.contextSearch) {
      initialSearch += this.contextSearch
      console.log('init search', initialSearch)
      if (this.contextSearch.match(/!comments!/) && !mode) {
        mode = 'comments'
      }
    }

    if (!mode) {
      mode = window.localStorage.getItem('searchMode') || 'wow'
    }

    this.searchMode = mode

    if (initialSearch) {
      this.$store.commit('setSearchText', initialSearch.trim(), true)
    }
  }
}
</script>

<style lang="scss">
.md-card.collection {
  background: none!important;
  box-shadow: none!important;
  margin: 0!important;
  padding: 0!important;
}
#searchForm { padding: 16px; width: 100% }
#searchForm button { margin-top: -3px }
#searchData {
  align-items: center;
  flex-grow: 1;
  .md-layout {
    align-items: center;
    justify-items: flex-end;
    > * {
      margin-right: 32px;
    }
    > *:last-child {
      margin-right: 0;
    }
    .spacer {
      flex-grow: 1;
    }
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
    }
    &.select-search-mode img {
      max-width: 24px;
      max-height: 24px;
    }
  }
}
#searchData .md-button-toggle { flex-wrap: wrap}
#queried {margin-bottom: 8px; display: inline-block;}

#content #searchPage {
  padding: 0;
  background: none;
  box-shadow: none;

  #searchLayout {
    flex-direction: column;
  }
  > div > div {
    max-width: 100%;
  }
  .md-button-toggle {
    margin-bottom: 16px;
  }
  .ad-in-search {
    text-align: center;
    padding: 16px 0 32px 0;
    .wago-advert-text {
      font-size: 80%;
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
#content #searchPage .searchResult.commentResult .searchText .usertext {
  margin-bottom: -4px;
}
.searchResult .hidden-status { font-weight: bold; margin-left: 8px; opacity: .7 }

#searchSide {display: flex; justify-content: space-between; flex-wrap: nowrap;}

#searchMeta, #search-ad-container {transition: margin 200ms ease; max-width: 408px}
#searchMeta {max-width: 300px; }
#searchMeta .md-whiteframe { padding: 8px;}

.codeResult .searchText {width: 100%}
.codeResult .searchText .ace_editor {border: 1px solid #77777733;}
.codeResult .searchText .ace_scrollbar {display: none}
.codeResult .searchText .ace_content .found-text {position: absolute; background: #FFFF0044}

#searchResults {
  width: 100%;
  & > .md-layout > div {
    max-width: 100%;
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
