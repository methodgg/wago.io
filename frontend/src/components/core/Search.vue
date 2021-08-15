<template>
  <div>
    <md-layout id="searchLayout">
      <md-layout id="searchResults">
        <ui-loading v-if="isSearching"></ui-loading>
        <div v-else-if="!isSearching && results.results && results.results.length">
          <md-layout id="searchData">
            <!--<strong v-html="$t('Found [-count-] results', {count: new Intl.NumberFormat().format(results.total)})"></strong>-->
            <template v-if="results">
              <strong>{{ $t('Sort Options') }}</strong>
              <md-button-toggle md-single class="md-accent md-warn">
                <md-button :class="{ 'md-toggle': searchSort === '' }" @click="searchSort=''">{{ $t('Best Match') }}</md-button>
                <md-button :class="{ 'md-toggle': searchSort === 'stars' }"@click="searchSort='stars'">{{ $t('Stars') }}</md-button>
                <md-button :class="{ 'md-toggle': searchSort === 'date' }"@click="searchSort='date'">{{ $t('Date') }}</md-button>
              </md-button-toggle>
            </template>
          </md-layout>
          <template v-for="(result, index) in results.results">
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
            <div class="searchResult" v-else-if="result" v-bind:key="index">
              <div class="searchImg">
                <router-link :to="'/' + (result.id || result.slug)">
                  <md-image :md-src="result.thumbnail" v-if="result.thumbnail"></md-image>
                  <placeholder-img :text="result.type" v-else></placeholder-img>
                </router-link>
              </div>
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
                  <span>{{ $t("[-count-] comment", { count: result.comments }) }}</span>
                </md-subheader>
                <formatted-text v-if="typeof result.description === 'string'" :text="{text: result.description, format: 'plaintext'}" truncate="180" :plaintext="true"></formatted-text>
                <formatted-text v-else :text="result.description" truncate="180" :plaintext="true"></formatted-text>
                <div class="searchTags">
                  <md-chip v-for="(cat, n) in result.categories" v-bind:key="cat.id" :class="cat.id" disabled v-if="cat && cat.text && n<5">{{ cat.text }}</md-chip>
                </div>
              </div>
            </div>
            <advert ad="wago-in-article-ad-container" :belowTheFold="index > 10" v-if="!isCollection && (index %9 === 2 || (results.total < 3 && index === results.total - 1))" />
          </template>
        </div>
        <div class="searchResult" v-else-if="!isSearching && results.total === 0">
          <p id="searchData">
            <strong v-html="$t('No results found')"></strong>
          </p>
        </div>
      </md-layout>
    </md-layout>
    <p v-if="isSearchingMore">{{ $t("Loading more") }}</p>
  </div>
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
      includeReadMentions: ''
    }
  },
  props: ['contextSearch', 'contextGame', 'contextSort'],
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
    }
  },
  computed: {
    execSearch () {
      this.runSearch(this.$store.state.execSearch)
      return this.$store.state.execSearch
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
        if (!query || (!force && (sid !== this.$store.state.execSearch || this.searchParams.q.toLowerCase() === query.toLowerCase()))) {
          return
        }

        this.isSearching = true
        this.searchParams = {q: query, page: 0, sort: this.searchSort}

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
    let initialSearch = ''
    if (this.contextGame) {
      initialSearch += `expansion:${this.contextGame} `
      // this.uiExpansionValue = true
      // this.filterExpansion = this.contextGame
    }
    else if (this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion) {
      // this.uiExpansionValue = true
      // this.filterExpansion = this.$store.state.user.config.searchOptions.expansion
    }
    if (this.contextSearch) {
      initialSearch += this.contextSearch
    }

    if (initialSearch) {
      this.$store.commit('setSearchText', initialSearch.trim(), true)
    }

    // wait for i18n then run search
    // this.$i18n.i18next.init(() => {
    //   this.runSearch()
    // })
    // if (!this.$router.currentRoute.params.profile) {
    //   if (this.$router.currentRoute.params.query) {
    //     this.$store.commit('setPageInfo', {
    //       title: 'Search | ' + this.$router.currentRoute.params.query.replace(/\+/g, ' ')
    //     })
    //   }
    //   else {
    //     this.$store.commit('setPageInfo', {
    //       title: 'Search'
    //     })
    //   }
    // }
    // document.addEventListener('scroll', function (event) {
    //   if (!document.getElementById('searchLayout')) {
    //     return
    //   }
    //   if (vue.results && vue.results.total && ((vue.results.results && vue.results.total > vue.results.results.length) || (vue.results.meta && vue.results.meta.forceNextPage)) && !vue.isSearching && !vue.isSearchingMore) {
    //     if (document.body.scrollHeight - 600 <= document.body.scrollTop + window.innerHeight || document.body.scrollHeight - 600 <= document.documentElement.scrollTop + window.innerHeight) {
    //       vue.searchMore()
    //     }
    //   }
    // })
  }
}
</script>

<style>

#searchForm { padding: 16px; width: 100% }
#searchForm button { margin-top: -3px }
#searchData { margin: 16px; padding: 16px; align-items: center}
#searchData * { margin-right: 16px}
#searchData .md-button-toggle { flex-wrap: wrap}
#queried {margin-bottom: 8px; display: inline-block;}

.searchResult { display: flex; padding: 0 16px; margin-bottom: 8px; max-width: 850px; width: 100%;}
.searchResult .searchImg { min-width: 120px; max-width: 120px; text-align: center }
.searchResult .searchImg img { max-width: 100%; max-height: 6em; }
.searchResult .searchText {  }
.searchResult .hidden-status { font-weight: bold; margin-left: 8px; opacity: .7 }

.searchText { padding: 0 8px 8px 8px; margin: 0 8px 8px 8px }
.searchText > a { font-weight: bold; text-decoration: underline!important }
.searchText .md-subheader { padding: 0; min-height: 0}
.searchText .md-subheader span, .searchText .md-subheader a { padding: 0 16px 0 0}
.searchTags .md-chip { height: auto; padding: 4px 6px 4px 20px; background-size: 18px 18px; background-position: 2px 2px }

#searchSide {display: flex; justify-content: space-between; flex-wrap: nowrap;}

#searchMeta, #search-ad-container {transition: margin 200ms ease; max-width: 408px}
#searchMeta {max-width: 300px; }
#searchMeta .md-whiteframe { padding: 8px;}

.codeResult .searchText {width: 100%}
.codeResult .searchText .ace_editor {border: 1px solid #77777733;}
.codeResult .searchText .ace_scrollbar {display: none}
.codeResult .searchText .ace_content .found-text {position: absolute; background: #FFFF0044}

@media (max-width: 600px) {
  #searchForm { padding: 16px 16px 0; max-width: 100% }
  #searchSide { order: 2; max-width: 100%; }
  #searchMeta .md-whiteframe { margin: 0 16px 16px }
  #searchMeta > div { width: 100%; }
  #searchResults { order: 1;}
  .searchResult { flex-direction: column; max-width:100%; min-width: initial }
  .searchResult .searchImg { max-width: 100%; min-width: auto; text-align: left; padding-left: 16px; max-width: calc(100vw - 32px); }
  .searchResult .searchText {max-width: calc(100vw - 32px);}
}
@media (max-width: 1650px) {
  #searchResults { order: 2 }
  #searchSide { order: 1; display: block }
  #searchMeta { max-width: 100%; margin: 0 16px 16px 16px; display: block; }
  #searchMeta .meta-items {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  #searchMeta .meta-items .md-input-container {
    width: auto;
    min-width: 32%;
    margin-right: 1%;
  }
}
@media (min-width: 1651px) {
  .floatSideBar #searchSide {position: fixed; left: 1110px; top: 4px; width: calc(100% - 1110px);}
}


</style>
