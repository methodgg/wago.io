<template>
  <div>
    <md-layout id="searchLayout">
      <md-layout>
        <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
          <md-input-container>
            <label>{{ $t("Search") }}</label>
            <md-input v-model="searchString" ref="searchInput"></md-input>
            <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
          </md-input-container>
        </form>

        <ui-loading v-if="isSearching"></ui-loading>
        <div v-else-if="!isSearching && results.total > 0">
          <div class="searchResult" template v-for="(result, index) in results.results" v-bind:key="index">
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
      </md-layout>   
    
      <md-layout id="searchMeta" v-if="results && results.query">
        <search-meta :meta="results.query.context" :tagMap="tagMap" :textSearch="results.query.textSearch" :sort="sortVal" @setSearch="setSearch" :catRelevance="catRelevance" @setCategoryRelevance="setCategoryRelevance"></search-meta>
      </md-layout>
    </md-layout>
    <p v-if="!isSearching && results.total === 0">{{ $t("No results found") }}</p>
    <p v-else-if="isSearchingMore">{{ $t("Loading more") }}</p>
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
      sortVal: '',
      uiSearchValue: false,
      catRelevance: 'standard',
      uiRelevanceValue: false
    }
  },
  props: ['contextSearch'],
  components: {
    'search-meta': require('../UI/SearchMeta.vue'),
    'formatted-text': require('../UI/FormattedText.vue')
  },
  watch: {
    '$route' (to, from) {
      this.runSearch(false)
    }
  },
  methods: {
    runSearch: function (query) {
      var opt = ''
      // if loaded via category menu
      if (this.contextSearch && !query) {
        this.contextSearch = this.contextSearch.replace(this.searchOptions, '').trim()
        this.searchString = this.contextSearch
        query = this.contextSearch
      }
      // if loaded direct
      else if (!query && this.$route.params.query) {
        query = this.$route.params.query.replace(/\+/g, ' ').replace(this.searchOptions, '').trim()
        this.searchString = query
      }
      // if loaded as component from other file
      else if (typeof query === 'string' && query) {
        query = query.replace(this.searchOptions, '').trim()
        this.$router.push('/search/' + query.replace(/\s+/g, '+'))
        this.searchString = query
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
      var sort = opt.match(/sort:\s?(-?\w+)/i)
      if (sort && sort[1] && !this.uiSearchValue) {
        sort[1] = sort[1].toLowerCase()
        if (sort[1] === 'date' || sort[1] === 'date' || sort[1] === 'stars' || sort[1] === 'stars' || sort[1] === 'views' || sort[1] === 'views') {
          this.sortVal = sort[1]
          opt = opt.replace(/sort:\s?(-?\w+)/i, 'Sort: ' + this.sortVal)
        }
        else {
          this.sortVal = 'standard'
          opt = opt.replace(/sort:\s?(-?\w+)/i, 'Sort: ' + this.sortVal)
        }
      }
      else {
        if (!this.sortVal) {
          this.sortVal = 'date'
        }
        opt = opt.replace(/sort:\s?(-?\w+)/i, '')
        opt = opt.trim() + ' sort: ' + this.sortVal
      }
      this.uiSearchValue = false

      var relevance = opt.match(/relevance:\s?(\w+)/i)
      if (relevance && relevance[1] && !this.uiRelevanceValue) {
        relevance[1] = relevance[1].toLowerCase()
        if (relevance[1] === 'strict' || relevance[1] === 'relaxed') {
          this.catRelevance = relevance[1]
          opt = opt.replace(/relevance:\s?(-?\w+)/i, 'Relevance: ' + this.catRelevance)
        }
        else {
          this.catRelevance = 'standard'
          opt = opt.replace(/relevance:\s?(-?\w+)/i, 'Relevance: ' + this.catRelevance)
        }
      }
      else {
        opt = opt.replace(/relevance:\s?(\w+)/i, '')
        if (this.catRelevance !== 'standard') {
          opt = opt.trim() + ' Relevance: ' + this.catRelevance
        }
      }
      this.uiRelevanceValue = false

      this.searchOptions = opt.trim() + ' '

      // check if we're searching for any localized tags
      const regex = /\btag:\s*"([^"]+)"|\btag:\s*([^\s]+)/ig
      var tagSearch = query.match(regex)
      if (tagSearch && tagSearch.length > 0) {
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
              tagStrMatch = tagMatch[2]
            }

            var tags = tagStrMatch.split(';')
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

      this.$refs.searchInput.$el.focus()

      var vue = this
      var params = { q: query + ' ' + opt }

      vue.http.get('/search', params).then((res) => {
        for (var i = 0; i < res.results.length; i++) {
          res.results[i].categories = res.results[i].categories.map((cat) => {
            return Categories.match(cat, vue.$t)
          })
        }

        vue.$set(vue.results, 'total', res.total)
        vue.$set(vue.results, 'query', res.query)
        vue.$set(vue.results, 'results', res.results)
        vue.$set(vue.results, 'context', res.query.context)
        // put text search at the end of the query
        if (res.query && res.query.textSearch) {
          this.searchString = this.searchString.replace(res.query.textSearch, '').replace(/\s+/g, ' ').trim() + ' ' + res.query.textSearch
        }

        this.isSearching = false
      })
    },
    setSearch: function (val) {
      this.sortVal = val
      this.uiSearchValue = true
      this.runSearch()
    },
    setCategoryRelevance: function (val) {
      this.catRelevance = val
      this.uiRelevanceValue = true
      this.runSearch()
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
      if (vue.results && vue.results.total && vue.results.results && vue.results.total > vue.results.results.length && !vue.isSearching && !vue.isSearchingMore) {
        if (document.body.scrollHeight - 600 <= document.body.scrollTop + window.innerHeight || document.body.scrollHeight - 600 <= document.documentElement.scrollTop + window.innerHeight) {
          vue.isSearchingMore = true

          // setup query
          var params = { q: vue.results.query.q, sort: vue.results.query.sort, page: vue.results.query.page + 1 }
          // run search
          vue.http.get('/search', params).then((res) => {
            for (var i = 0; i < res.results.length; i++) {
              res.results[i].categories = res.results[i].categories.map((cat) => {
                return Categories.match(cat, vue.$t)
              })
            }

            // merge data
            var merged = vue.results.results.concat(res.results)
            vue.$set(vue.results, 'query', res.query)
            vue.$set(vue.results, 'results', merged)

            vue.isSearchingMore = false
          })
        }
      }
    })
  }
}
</script>

<style>
@media (max-width: 600px) {
  #searchLayout { flex-direction: column }
  #searchMeta { order: 1 }
  #searchResults { order: 2 }
}

#searchForm { padding: 16px; width: 100% }
#searchForm button { margin-top: -3px }

.searchResult { display: flex; padding: 0 8px; margin-bottom: 8px }
.searchResult .searchImg { min-width: 120px; max-width: 120px; text-align: center }
.searchResult .searchImg img { max-width: 100%; max-height: 6em; }
.searchResult .searchText {  }
.searchResult .hidden-status { font-weight: bold; margin-left: 8px; opacity: .7 }

.searchText { padding: 0 8px 8px 8px; margin: 0 8px 8px 8px }
.searchText > a { font-weight: bold; text-decoration: underline!important }
.searchText .md-subheader { padding: 0; min-height: 0}
.searchText .md-subheader span, .searchText .md-subheader a { padding: 0 16px 0 0}
.searchTags .md-chip { height: auto; padding: 4px 6px 4px 20px; background-size: 18px 18px; background-position: 2px 2px }

#searchMeta .md-whiteframe { padding: 8px; margin-top: 1.5em}

</style>
