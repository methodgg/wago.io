<template>
  <div>
    <form novalidate @submit.stop.prevent="runSearch()" id="searchForm">
      <md-input-container>
        <label>{{ $t("Search") }}</label>
        <md-input v-model.trim="searchString" ref="searchInput"></md-input>
        <md-button @click="runSearch()" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
      </md-input-container>
    </form>
    <md-layout id="searchLayout">
      <md-layout>
        <ui-loading v-if="isSearching"></ui-loading>
        <div v-else-if="!isSearching && results.total > 0">
          <div class="searchResult" template v-for="(result, index) in results.results" v-bind:key="index" v-if="result">
            <div class="searchImg">
              <md-image :md-src="result.thumbnail" v-if="result.thumbnail"></md-image>
            </div>
            <div class="searchText">
              <router-link :to="'/' + result.slug">{{ result.name }}</router-link> 
              <span class="hidden-status" v-if="result.visibility.private">- Private -</span>
              <span class="hidden-status" v-if="result.visibility.hidden">- Hidden -</span>
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
        </div>        
        <div class="searchResult" v-else-if="!isSearching && results.total === 0">{{ $t("No results found") }}</div>
      </md-layout>   
    
      <md-layout id="searchMeta" v-if="results && results.query">
        <search-meta :meta="results.query.context" :tagMap="tagMap" :textSearch="results.query.textSearch" :sort="sortVal" @setSort="setSort" :catRelevance="catRelevance" @setCategoryRelevance="setCategoryRelevance" :filterExpansion="filterExpansion" @setExpansion="setExpansion"></search-meta>
      </md-layout>
    </md-layout>
    <p v-if="isSearchingMore">{{ $t("Loading more") }}</p>
  </div>
</template>

<script>
import Categories from '../libs/categories'
export default {
  data: function () {
    return {
      results: {
        total: 0
      },
      searchString: '',
      searchOptions: 'sort: Date',
      tagContext: [],
      tagMap: {},
      isSearching: false,
      isSearchingMore: false,
      sortVal: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.sort || 'bestmatch',
      uiSearchValue: false,
      catRelevance: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.relevance || 'standard',
      uiRelevanceValue: false,
      filterExpansion: this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion || 'all',
      uiExpansionValue: false,
      contextSearchData: this.contextSearch
    }
  },
  props: ['contextSearch'],
  components: {
    'search-meta': require('../UI/SearchMeta.vue'),
    'formatted-text': require('../UI/FormattedText.vue')
  },
  watch: {
    '$route' (to, from) {
      this.searchString = ''
      if (to.path.match(/^\/p\//) && to.params.profile) {
        this.contextSearchData = 'User: ' + to.fullPath.replace(/^\/p\//, '')
      }
      else {
        this.contextSearchData = this.contextSearch
      }
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
      var opt = ''
      // if loaded via category menu
      if (this.contextSearchData && !query) {
        this.contextSearchData = this.contextSearchData.replace(this.searchOptions, '').trim()
        this.searchString = this.contextSearchData.trim()
        query = this.contextSearchData
      }
      // if loaded direct
      else if (!query && this.$route.params.query) {
        query = this.$route.params.query.replace(/\+/g, ' ').replace(this.searchOptions, '').trim()
        this.searchString = query.trim()
      }
      // if loaded as component from other file
      else if (typeof query === 'string' && query) {
        query = query.replace(this.searchOptions, '').trim()
        // this.$router.push('/search/' + query.replace(/\s+/g, '+'))
        this.searchString = query.trim()
      }
      // if navigating forward/back
      else if (this.$route.params.query) {
        query = this.$route.params.query.replace('+', ' ').replace(this.searchOptions, '').trim()
      }
      // something broke, no query found (empty string?)
      else {
        return
      }

      this.isSearching = true

      // check if sort value needs to be added to query
      if (this.uiSearchValue) {
        opt = opt + ' Sort: ' + this.sortVal
      }

      if (this.uiExpansionValue) {
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
            var tagStrMatch
            if (tagMatch[1]) {
              tagStrMatch = tagMatch[1]
            }
            else {
              // if i8n code found instead of translated text, then translate it
              if (tagMatch[2].match(/\./)) {
                var s = Categories.search(tagMatch[2])
                if (s && s.text) {
                  tagMatch[2] = s.text
                  if (tagMatch[2].match(/\s/)) {
                    this.searchString = this.searchString.replace(tagMatch[0], `tag: "${tagMatch[2]}"`).trim()
                  }
                  else {
                    this.searchString = this.searchString.replace(tagMatch[0], `tag: ${tagMatch[2]}`).trim()
                  }
                }
              }
              tagStrMatch = tagMatch[2]
            }

            var tags = tagStrMatch.split(/;|,/g)
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

        vue.$set(vue.results, 'total', res.total)
        vue.$set(vue.results, 'query', res.query)
        vue.$set(vue.results, 'results', res.results)
        vue.$set(vue.results, 'context', res.query.context)
        vue.$set(vue.results, 'meta', res.meta)
        // put text search at the end of the query
        if (res.query && res.query.textSearch) {
          this.searchString = (this.searchString.replace(res.query.textSearch, '').replace(/\s+/g, ' ').trim() + ' ' + res.query.textSearch).trim()
        }

        this.isSearching = false

        if (vue.results.total < 20 && vue.results.meta.forceNextPage) {
          this.searchMore()
        }
      })
    },
    setSort: function (val) {
      if (val !== this.sortVal) {
        this.sortVal = val
        this.uiSearchValue = true
        this.runSearch()

        this.$store.commit('userSearchOption', {field: 'sort', value: val})
      }
    },
    setCategoryRelevance: function (val) {
      if (val !== this.catRelevance) {
        this.catRelevance = val
        this.uiRelevanceValue = true
        this.runSearch()

        this.$store.commit('userSearchOption', {field: 'relevance', value: val})
      }
    },
    setExpansion: function (val) {
      if (val !== this.filterExpansion) {
        this.filterExpansion = val
        this.uiExpansionValue = true
        this.runSearch()

        this.$store.commit('userSearchOption', {field: 'expansion', value: val})
      }
    },
    searchMore: function () {
      var vue = this
      vue.isSearchingMore = true

      // setup query
      var params = { q: vue.results.query.q, sort: vue.results.query.sort, page: vue.results.query.page + 1 }
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

        vue.isSearchingMore = false
      })
    }
  },
  mounted: function () {
    // wait for i18n then run search
    var vue = this
    this.$i18n.i18next.init(() => {
      vue.runSearch()
    })
    this.$store.commit('setPageInfo', {
      title: 'Search'
    })

    document.addEventListener('scroll', function (event) {
      if (!document.getElementById('searchLayout')) {
        return
      }
      if (vue.results && vue.results.total && ((vue.results.results && vue.results.total > vue.results.results.length) || (vue.results.meta && vue.results.meta.forceNextPage)) && !vue.isSearching && !vue.isSearchingMore) {
        if (document.body.scrollHeight - 600 <= document.body.scrollTop + window.innerHeight || document.body.scrollHeight - 600 <= document.documentElement.scrollTop + window.innerHeight) {
          vue.searchMore()
        }
      }
    })
  }
}
</script>

<style>

#searchForm { padding: 16px; width: 100% }
#searchForm button { margin-top: -3px }

.searchResult { display: flex; padding: 0 8px; margin-bottom: 8px; max-width: 850px; min-width: 30% }
.searchResult .searchImg { min-width: 120px; max-width: 120px; text-align: center }
.searchResult .searchImg img { max-width: 100%; max-height: 6em; }
.searchResult .searchText {  }
.searchResult .hidden-status { font-weight: bold; margin-left: 8px; opacity: .7 }

.searchText { padding: 0 8px 8px 8px; margin: 0 8px 8px 8px }
.searchText > a { font-weight: bold; text-decoration: underline!important }
.searchText .md-subheader { padding: 0; min-height: 0}
.searchText .md-subheader span, .searchText .md-subheader a { padding: 0 16px 0 0}
.searchTags .md-chip { height: auto; padding: 4px 6px 4px 20px; background-size: 18px 18px; background-position: 2px 2px }

#searchMeta .md-whiteframe { padding: 8px;}

@media (min-width: 601px) {
  #searchLayout { flex-wrap: nowrap; }
  #searchLayout > .md-layout { flex: initial }
  #searchMeta { margin-right: 16px }
}


@media (max-width: 600px) {
  #searchLayout { flex-direction: column-reverse }
  #searchForm { padding: 16px 16px 0 }
  #searchMeta { order: 1; width: 100%; }
  #searchMeta .md-whiteframe { margin: 0 16px 16px }
  #searchMeta > div { width: 100%; }
  #searchResults { order: 2 }
  .searchResult { flex-direction: column; }
  .searchResult .searchImg { max-width: 100%; text-align: left; padding-left: 16px }
}

</style>
