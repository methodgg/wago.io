<template>
  <div>
    <md-button href="/news" class="vr" v-if="$route.params.newsID && $route.params.newsID !== '1'">{{ $t("View latest news" )}}</md-button>
    <div v-if="blogs.length > 0" id="news">
      <div v-for="(news, newsIndex) in blogs" :key="newsIndex">
        <md-card>
          <md-card-header-text>
            <a class="md-title vr" :href="'/news/' + news._id + '/' + slugify(news.title)">{{ news.title }}</a>
            <div class="md-subhead"><a :href="'/p/' + news.user.username" :class="'vr ' + news.user.css">{{ news.user.username }}</a>, {{ news.date | moment('MMM Do YYYY') }}</div>
          </md-card-header-text>
          <div v-if="news.format=='markdown'" v-html="news.html"></div>
        </md-card>
      </div>
      <md-button :href="'/news/' + (pageNum - 1)" class="vr" v-if="pageNum > 1 && blogs[0]._id !== newest">{{ $t("View newer articles" )}}</md-button>
      <md-button :href="'/news/' + (pageNum + 1)" class="vr" v-if="blogs[blogs.length - 1]._id !== oldest">{{ $t("View older articles" )}}</md-button>
    </div>
    <ui-loading v-else-if="loading"></ui-loading>
    <ui-warning v-else class="alert">404 {{ $t("No results found") }}</ui-warning>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

import MarkdownIt from 'markdown-it'
import subscript from 'markdown-it-sub'
import superscript from 'markdown-it-sup'
import footnote from 'markdown-it-footnote'
import deflist from 'markdown-it-deflist'
import abbreviation from 'markdown-it-abbr'
import insert from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import katex from 'markdown-it-katex'
import tasklists from 'markdown-it-task-lists'

export default {
  components: {
    'vue-markdown': VueMarkdown
  },
  data: function () {
    return {
      blogs: [],
      loading: true,
      oldest: '',
      newest: false,
      pageNum: 0,
      md: new MarkdownIt()
        .use(subscript)
        .use(superscript)
        .use(footnote)
        .use(deflist)
        .use(abbreviation)
        .use(insert)
        .use(mark)
        .use(katex, { throwOnError: false, errorColor: ' #cc0000' })
        .use(tasklists, { enabled: this.taskLists })
    }
  },
  props: ['posts'],
  watch: {
    '$route': 'fetchNews'
  },
  mounted: function () {
    this.fetchNews()
  },
  computed: {
    User () {
      return this.$store.state.user
    }
  },
  methods: {
    slugify (text) {
      return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/&/g, '-and-')         // Replace & with 'and'
        .replace(/[^\w-]+/g, '')        // Remove all non-word chars
        .replace(/-+/g, '-')            // Replace multiple - with single -
    },
    fetchNews () {
      var newsID = this.$route.params.newsID

      // if loaded from other page
      if (this.posts) {
        this.blogs = JSON.parse(JSON.stringify(this.posts))
        for (let i = 0; i < this.blogs.length; i++) {
          this.blogs[i].html = this.renderMarkDown(this.blogs[i].content)
        }
      }
      // if viewing a specific page
      else if (newsID && newsID.match(/^\d+$/)) {
        this.LoadNewsPage(parseInt(newsID))
      }
      // if viewing a specific article
      else if (newsID && typeof newsID === 'string') {
        this.LoadNewsArticle(newsID)
      }
      // default to page 1
      else {
        this.LoadNewsPage(1)
      }
    },
    LoadNewsArticle (newsID) {
      this.blogs = []
      var vue = this
      vue.loading = true
      vue.oldest = false
      vue.newest = false
      vue.pageNum = 0
      vue.http.get('/lookup/blog', {
        id: newsID
      }).then((res) => {
        if (res._id) {
          vue.$store.commit('setPageInfo', {
            title: res.title,
            description: res.content.substring(0, 120)
          })

          res.html = this.renderMarkDown(res.content)

          vue.blogs.push(res)
          vue.$router.replace('/news/' + newsID + '/' + vue.slugify(res.title))
        }
        vue.loading = false
      })
    },
    LoadNewsPage (pageNum) {
      this.pageNum = pageNum
      this.blogs = []
      var vue = this
      vue.loading = true
      vue.http.get('/lookup/blogs', {
        page: pageNum
      }).then((res) => {
        if (res.news) {
          vue.$store.commit('setPageInfo', {
            title: res.news[0].title,
            description: res.news[0].content.substring(0, 120)
          })
          for (let i = 0; i < res.news.length; i++) {
            res.news[i].html = this.renderMarkDown(res.news[i].content)
          }
          vue.blogs = vue.blogs.concat(res.news)
        }
        vue.oldest = res.oldest
        vue.newest = res.newest
        vue.loading = false
      })
    },
    renderMarkDown (markdown) {
      this.md.set({
        html: true,
        xhtmlOut: true,
        breaks: this.breaks,
        linkify: true,
        typographer: this.typographer
      })
      return this.md.render(markdown)
    }
  }
}
</script>

<style>
#news .md-subhead {opacity: 1}
</style>
