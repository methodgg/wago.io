<template>
  <div>
    <form novalidate @submit.stop.prevent="runSearch()" id="searchForm">
      <md-input-container>
        <label>{{ $t("Search") }}</label>
        <md-input v-model="searchString" ref="searchInput"></md-input>
        <md-button @click="runSearch()" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
      </md-input-container>
    </form>
    <md-layout id="searchLayout" :class="{floatSideBar: floatSideBar}">
      <md-layout id="searchResults">
        <ui-loading v-if="isSearching"></ui-loading>
        <div v-else-if="!isSearching && results.results && results.results.length">
          <template v-for="(result, index) in results.results">
            <div class="searchResult" v-if="result" v-bind:key="index">
              <div class="searchImg">
                <router-link :to="'/' + result.slug">
                  <md-image :md-src="result.thumbnail" v-if="result.thumbnail"></md-image>
                  <placeholder-img :text="result.type" v-else></placeholder-img>
                </router-link>
              </div>
              <div class="searchText">
                <router-link :to="'/' + result.slug">{{ result.name || result.type }}</router-link>
                <span class="hidden-status" v-if="result.visibility.private">- Private -</span>
                <span class="hidden-status" v-if="result.visibility.hidden">- Hidden -</span>
                <span class="hidden-status" v-if="result.visibility.encrypted">- Encrypted -</span>
                <span class="hidden-status" v-if="result.visibility.restricted">- Restricted -</span>
                <md-subheader>
                  <span>{{ result.type }}</span>
                  <span>{{ result.date.modified || result.date.created | moment('LLL') }}</span>
                  <router-link v-if="result.user.searchable" :class="result.user.roleClass" :to="'/p/' + result.user.name">{{ result.user.name }}</router-link>
                  <span v-else :class="result.user.roleClass">{{ result.user.name }}</span>
                  <span>{{ $t("[-count-] view", { count: result.viewCount }) }}</span>
                  <span>{{ $t("[-count-] star", { count: result.favoriteCount }) }}</span>
                  <span>{{ $t("[-count-] comment", { count: result.commentCount }) }}</span>
                </md-subheader>
                <formatted-text :text="result.description" truncate="180" :plaintext="true"></Formatted-text>
                <div class="searchTags">
                  <md-chip v-for="cat in result.categories" v-bind:key="cat.id" :class="cat.cls" disabled v-if="cat.text">{{ cat.text }}</md-chip>
                </div>        
              </div>      
            </div>
            <advert :ad="'wago728x90-' + Math.ceil(index / 9)" :belowTheFold="index > 10" v-if="!isCollection && (index %9 === 2 || (results.total < 3 && index === results.total - 1))" />
          </template>
        </div>
        <div class="searchResult" v-else-if="!isSearching && results.total === 0">{{ $t("No results found") }}</div>
      </md-layout>

      <md-layout id="searchSide" v-if="results && results.query">
        <md-layout id="searchMeta" v-if="results && results.query">
          <search-meta :meta="results.query.context" :tagMap="tagMap" :textSearch="results.query.textSearch" :sort="sortVal" @setSort="setSort" @setImportType="setImportType" :catRelevance="catRelevance" @setCategoryRelevance="setCategoryRelevance" :filterExpansion="filterExpansion" @setExpansion="setExpansion" :includeReadMentions="includeReadMentions" @setReadMentions="setReadMentions"></search-meta>
        </md-layout>
      </md-layout>
    </md-layout>
    <p v-if="isSearchingMore">{{ $t("Loading more") }}</p>
  </div>
</template>

<script>
import Categories from '../libs/categories'
import SearchMeta from '../UI/SearchMeta.vue'
import FormattedText from '../UI/FormattedText.vue'
import PlaceHolderImage from '../UI/PlaceHolderImage.vue'
export default {
  data: function () {
    return {
      results: {
        total: 0
      },
      searchString: '',
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
    'placeholder-img': PlaceHolderImage
  },
  watch: {
    '$route' (to, from) {
      this.searchString = ''
      this.runSearch(false)
    }
  },
  methods: {
    runSearch: function (query) {
      if (!query && this.searchString) {
        var _this = this
        // super hacky but vue.nextTick isn't updating the input value if form is submitted too quickly after typing, so just wait
        return setTimeout(function () {
          if (!_this.searchString) {
            return
          }
          _this.runSearch(_this.searchString)
        }, 100)
      }
      // throttle searches
      if (this.searchTime < +new Date() - 500) {
        this.searchTime = +new Date()
      }
      else {
        return
      }
      var opt = ''
      // if loaded via category menu
      if (this.contextSearchData && !query) {
        this.contextSearchData = this.contextSearchData.replace(this.searchOptions, '')
        this.searchString = this.contextSearchData
        query = this.contextSearchData
      }
      // if loaded direct
      else if (!query && this.$route.params.query) {
        query = this.$route.params.query.replace(/\+/g, ' ').replace(this.searchOptions, '')
        this.searchString = query
      }
      // if loaded as component from other file
      else if (typeof query === 'string' && query) {
        query = query.replace(this.searchOptions.trim(), '')
        // this.$router.push('/search/' + query.replace(/\s+/g, '+'))
        this.searchString = query
      }
      // if navigating forward/back
      else if (this.$route.params.query) {
        query = this.$route.params.query.replace('+', ' ').replace(this.searchOptions, '')
      }
      // something broke, no query found (empty string?)
      else {
        return
      }

      this.isSearching = true

      // check if sort value needs to be added to query
      if (this.uiSearchValue || this.contextSort) {
        opt = opt + ' Sort: ' + this.sortVal
      }

      if (this.uiExpansionValue && this.filterExpansion && this.filterExpansion.match(/all|classic|tbc|legion|bfa|sl/)) {
        opt = opt + ' Expansion: ' + this.filterExpansion
      }

      // check if we're searching for any localized tags
      const regex = /\btag:\s*"([^"]+)"|\btag:\s*([^\s]+)/ig
      var tagSearch = query.match(regex)
      if (tagSearch && tagSearch.length > 0) {
        // check for relevance if tags are found
        if (this.uiRelevanceValue) {
          opt = opt + ' Relevance: ' + this.catRelevance
        }

        this.tagContext = []
        this.tagMap = {}
        tagSearch.forEach((tagQuery) => {
          var tagMatch
          if ((tagMatch = regex.exec(tagSearch)) !== null) {
            // valid tag syntax found
            query = query.replace(tagMatch[0], '').trim()
            var tags = []
            if (tagMatch[1]) {
              tags.push(tagMatch[1])
            }
            else {
              // if i8n code found instead of translated text, then translate it
              if (tagMatch[2].match(/\./)) {
                var s = Categories.search(tagMatch[2])
                if (s && s.text) {
                  tagMatch[2] = s.text
                  if (tagMatch[2].match(/\s/)) {
                    this.searchString = this.searchString.replace(tagMatch[0], `tag: "${tagMatch[2]}"`)
                  }
                  else {
                    this.searchString = this.searchString.replace(tagMatch[0], `tag: ${tagMatch[2]}`)
                  }
                }
              }
              tags.push(tagMatch[2])
            }

            tags.forEach((thisTag) => {
              var category = Categories.search(thisTag, this.$t)
              if (category) {
                this.tagContext.push(category)
                this.tagMap[category.id] = tagMatch[0]
                query = query + ' tag: ' + category.id
              }
            })
          }
        })
      }

      this.searchOptions = opt.trim() + ' '
      this.$refs.searchInput.$el.focus()

      var vue = this
      var params = { q: query + ' ' + opt }
      this.searchString = this.searchString.trim().replace(/\s{2,}/, ' ')

      if (!this.$store.state.user || !this.$store.state.user.name) {
        params.cc = 1 // use cached results if we dont need to worry about auth
      }

      if (query.match(/\b(?:alerts?|mentioned):\s*(1|true)\b/i)) {
        params.includeRead = this.includeReadMentions
      }

      vue.http.get('/search', params).then((res) => {
        for (var i = 0; i < res.results.length; i++) {
          if (res.results[i] && typeof res.results[i] === 'object') {
            res.results[i].categories = res.results[i].categories.map((cat) => {
              return Categories.match(cat, vue.$t)
            })
          }
        }

        if (res.query.sort) {
          vue.sortVal = res.query.sort
        }
        if (res.query.expansion) {
          vue.filterExpansion = res.query.expansion
        }
        if (res.query.relevance) {
          vue.catRelevance = res.query.relevance
        }

        if (res.query.q.match(/collection:/i)) {
          vue.isCollection = true
        }
        else {
          vue.isCollection = false
        }

        if (res.total) {
          vue.$set(vue.results, 'total', res.total)
        }
        else if (res.results && res.results.length) {
          vue.$set(vue.results, 'total', res.total + 1)
        }
        vue.$set(vue.results, 'query', res.query)
        vue.$set(vue.results, 'results', res.results)
        vue.$set(vue.results, 'context', res.query.context)
        vue.$set(vue.results, 'meta', res.meta)
        this.floatSideBar = false
        // put text search at the end of the query
        if (res.query && res.query.textSearch) {
          this.searchString = (this.searchString.replace(res.query.textSearch, '').replace(/\s+/g, ' ') + ' ' + res.query.textSearch).trim()
        }

        this.isSearching = false

        if (vue.results.total < 20 && vue.results.meta.forceNextPage) {
          this.searchMore()
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
      if (!document.getElementById('searchLayout')) {
        return
      }
      if (this.results && this.results.total && ((this.results.results && this.results.total > this.results.results.length) || (this.results.meta && this.results.meta.forceNextPage)) && !this.isSearching && !this.isSearchingMore) {
        if (document.body.scrollHeight - 600 <= document.body.scrollTop + window.innerHeight || document.body.scrollHeight - 600 <= document.documentElement.scrollTop + window.innerHeight) {
          this.searchMore()
        }
      }
    },
    setSort: function (val) {
      if (val !== this.sortVal) {
        this.sortVal = val
        this.uiSearchValue = true
        this.runSearch()

        this.$store.commit('userSearchOption', {field: 'sort', value: val})
      }
    },
    setImportType: function (val) {
      const re = new RegExp('type:\\s' + val, 'i')
      if (val && this.searchString.match(re)) {
        return
      }
      var s = this.searchString.replace(/type:\s[\w-]+/i, '')
      if (val) {
        s = 'Type: ' + val + ' ' + s
      }
      this.searchString = s
      this.runSearch()
    },
    setCategoryRelevance: function (val) {
      if (val !== this.catRelevance) {
        this.catRelevance = val
        this.uiRelevanceValue = true
        this.runSearch()

        this.$store.commit('userSearchOption', {field: 'relevance', value: val})
      }
    },
    setExpansion: function (val, noSearch) {
      if (val !== this.filterExpansion) {
        this.filterExpansion = val
        this.uiExpansionValue = true
        this.$store.commit('userSearchOption', {field: 'expansion', value: val})

        if (!noSearch) {
          this.runSearch()
        }
      }
    },
    setReadMentions: function (val, noSearch) {
      this.includeReadMentions = val

      if (!noSearch) {
        this.runSearch()
      }
    },
    searchMore: function () {
      var vue = this
      vue.isSearchingMore = true

      // setup query
      var params = { q: vue.results.query.q, sort: vue.results.query.sort, page: vue.results.query.page + 1 }
      if (vue.results.query.q.match(/\b(?:alerts?|mentioned):\s*(1|true)\b/i)) {
        params.includeRead = this.includeReadMentions
      }
      // run search
      vue.http.get('/search', params).then((res) => {
        for (var i = 0; i < res.results.length; i++) {
          if (res.results[i] && typeof res.results[i] === 'object') {
            res.results[i].categories = res.results[i].categories.map((cat) => {
              return Categories.match(cat, vue.$t)
            })
          }
        }
        // merge data
        var merged = vue.results.results.concat(res.results)
        vue.$set(vue.results, 'query', res.query)
        vue.$set(vue.results, 'results', merged)
        vue.$set(vue.results, 'meta', res.meta)

        if (!res.results.length) {
          vue.$set(vue.results, 'total', vue.results.results.length)
        }

        vue.isSearchingMore = false
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
    if (this.contextGame) {
      this.uiExpansionValue = true
      this.filterExpansion = this.contextGame
    }
    else if (this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion) {
      this.uiExpansionValue = true
      this.filterExpansion = this.$store.state.user.config.searchOptions.expansion
    }

    // wait for i18n then run search
    this.$i18n.i18next.init(() => {
      this.runSearch()
    })
    if (!this.$router.currentRoute.params.profile) {
      if (this.$router.currentRoute.params.query) {
        this.$store.commit('setPageInfo', {
          title: 'Search | ' + this.$router.currentRoute.params.query.replace(/\+/g, ' ')
        })
      }
      else {
        this.$store.commit('setPageInfo', {
          title: 'Search'
        })
      }
    }
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

#search-ad-container {flex: auto!important; height: 0%; }
#search-ad-container > div { margin-top: 0}


@media (min-width: 601px) {
  #searchLayout { flex-wrap: nowrap; align-items: flex-start; }
  #searchMeta { margin-right: 16px }
  #searchResults { max-width: 850px; width:100%; flex: initial }
  .floatSideBar #searchSide {position: fixed; left: 1110px; top: 4px; width: calc(100% - 1110px);}
}


@media (max-width: 1700px) {
  #search-ad-container {display: none}
  
}
@media (max-width: 600px) {
  #searchLayout { flex-direction: column-reverse }
  #searchForm { padding: 16px 16px 0; max-width: 100% }
  #searchSide { order: 2; width: 100%; }
  #searchMeta .md-whiteframe { margin: 0 16px 16px }
  #searchMeta > div { width: 100%; }
  #searchResults { order: 1;}
  .searchResult { flex-direction: column; max-width:100%; min-width: initial }
  .searchResult .searchImg { max-width: 100%; min-width: auto; text-align: left; padding-left: 16px }
}

</style>
