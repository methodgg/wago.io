<template>
  <div>
    <div id="admin" v-if="User && User.access.admin">
      <!-- FRAME TOGGLES -->
      <md-button-toggle class="md-accent" md-single>
        <md-button v-if="User.access.admin.blog || User.access.admin.super" :class="{'md-toggle': showPanel === 'blogpost'}" @click="toggleFrame('blogpost')">Blog Posts</md-button>
        <md-button v-if="User.access.admin.super" :class="{'md-toggle': showPanel === 'status'}" @click="toggleFrame('status')">Status</md-button>
      </md-button-toggle>
    
      <!-- BLOG FRAME -->
      <md-layout id="admin-blog-container" v-if="(User.access.admin.blog || User.access.admin.super) && showPanel=='blogpost'">
        <md-layout class="md-left" ref="blogSidebar" id="blog-sidebar" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadBlog(-1)" v-bind:class="{selected: (blogSelected === -1)}">
              <div class="md-list-text-container">
                <span>New post</span>
              </div>
            </md-list-item>
            <md-list-item v-if="blogs.length > 0" v-for="(blog, index) in blogs" :key="index" @click="LoadBlog(index)" v-bind:class="{selected: (blogSelected === index)}">
              <div class="md-list-text-container">
                <span>{{ blog.title }}  <em v-if="blog.publishStatus === 'draft'">Draft</em></span>
                <span v-if="blog._userId">{{ blog._userId.account.username }}</span>
                <span>{{ blog.date | moment('MMM Do YYYY LT') }}</span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <md-card>
            <md-input-container>
              <label>Title</label>
              <md-input v-model="blogTitle"></md-input>
            </md-input-container>
            <md-input-container>
              <label>Content</label>
              <md-textarea v-model="blogContent" id="blogEditor"></md-textarea>
            </md-input-container>
            <div>
              <md-radio v-model="blogPublishStatus" id="blogPublish1" name="blogPublish" md-value="publish">Publish</md-radio>
              <md-radio v-model="blogPublishStatus" id="blogPublish2" name="blogPublish" md-value="draft">Save as draft</md-radio>
            </div>
            <md-card-actions>
              <md-button class="md-raised" @click="$refs.blogPreviewFrame.open()">Preview</md-button>
              <md-button @click="onSubmitBlog()">Submit</md-button>
            </md-card-actions>
          </md-card>
        </md-layout>
      </md-layout>

      <!-- STATUS FRAME -->
      <md-layout id="admin-blog-container" v-if="(User.access.admin.super) && showPanel=='status'">
        <md-layout class="md-left" ref="blogSidebar" id="blog-sidebar" md-flex="15">
          <md-list class="md-double-line">
            <md-list-item @click="LoadStatus('requests')" v-bind:class="{selected: (statusSelected === 'requests')}">
              <div class="md-list-text-container">
                <span>Requests</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('dataservers')" v-bind:class="{selected: (statusSelected === 'dataservers')}">
              <div class="md-list-text-container">
                <span>Data Servers Ping</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('redis')" v-bind:class="{selected: (statusSelected === 'redis')}">
              <div class="md-list-text-container">
                <span>Redis</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('waiting')" v-bind:class="{selected: (statusSelected === 'waiting')}">
              <div class="md-list-text-container">
                <span>Waiting Tasks</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('active')" v-bind:class="{selected: (statusSelected === 'active')}">
              <div class="md-list-text-container">
                <span>Active Tasks</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('completed')" v-bind:class="{selected: (statusSelected === 'completed')}">
              <div class="md-list-text-container">
                <span>Completed Tasks</span>
              </div>
            </md-list-item>
            <md-list-item @click="LoadStatus('ratelimit')" v-bind:class="{selected: (statusSelected === 'ratelimit')}">
              <div class="md-list-text-container">
                <span>Rate Limits</span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <form novalidate @submit.stop.prevent="submitRateLimit" v-if="statusSelected === 'ratelimit'" style="width:300px">
            <md-input-container>
              <label>IP Search</label>
              <md-input v-model="rateLimitSearch"></md-input>
            </md-input-container>
          </form>
          <editor v-if="statusSelected.match(/redis|waiting|active|completed|ratelimit/)" v-model="statusJSON" @init="editorInit" :theme="$store.state.user.config.editor" lang="json" width="100%" height="500"></editor>
          <md-table-card v-else-if="statusSelected === 'requests'">
            <md-table md-sort="timestamp" md-sort-type="desc" @sort="sortRequests">
              <md-table-header>
                <md-table-row>
                  <md-table-head md-sort-by="timestamp">Time</md-table-head>
                  <md-table-head md-sort-by="status">Status</md-table-head>
                  <md-table-head md-sort-by="method">Method</md-table-head>
                  <md-table-head md-sort-by="host">Host</md-table-head>
                  <md-table-head md-sort-by="path">Path</md-table-head>
                  <md-table-head md-sort-by="elapsed" md-numeric>Elapsed</md-table-head>
                </md-table-row>
              </md-table-header>

              <md-table-body>
                <md-table-row v-for="(row, rowIndex) in requestTable[requestPage]" :key="rowIndex" :md-item="row">
                  <md-table-cell>{{ row.timestamp | moment('HH:mm.SSS MMM Do YYYY') }}</md-table-cell>
                  <md-table-cell>{{ row.statusCode || 'Processing' }}</md-table-cell>
                  <md-table-cell>{{ row.method }}</md-table-cell>
                  <md-table-cell>{{ row.host }}</md-table-cell>
                  <md-table-cell>{{ row.route }}</md-table-cell>
                  <md-table-cell md-numeric>{{ row.elapsed }}ms</md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>

            <md-table-pagination
              md-size="100"
              md-total="1000"
              md-page="1"
              md-label="Rows"
              md-separator="of"
              @page="setPage"></md-table-pagination>
          </md-table-card>
          <md-table-card v-else-if="statusSelected === 'dataservers'">
            <md-table>
              <md-table-header>
                <md-table-row>
                  <md-table-head>Server</md-table-head>
                  <md-table-head md-numeric>Ping Time</md-table-head>
                </md-table-row>
              </md-table-header>

              <md-table-body>
                <md-table-row v-for="(ping, server) in pingRequests" :key="server">
                  <md-table-cell>{{ server.replace('https://', '') }}</md-table-cell>
                  <md-table-cell md-numeric>{{ ping }}</md-table-cell>
                </md-table-row>
              </md-table-body>
            </md-table>
          </md-table-card>
        </md-layout>
      </md-layout>


      <md-dialog ref="blogPreviewFrame" id="adminPreviewFrame">
        <md-dialog-title>Preview Content</md-dialog-title>
        <md-dialog-content>
          <vue-markdown :source="blogContent"></vue-markdown>
        </md-dialog-content>
        <md-dialog-actions>
          <md-button class="md-primary" @click="$refs.blogPreviewFrame.close()">Ok</md-button>
        </md-dialog-actions>
      </md-dialog>
    </div>
    <ui-warning v-else mode="alert">No access to this page.</ui-warning>
  </div>
</template>

<script>
import VueMarkdown from 'vue-markdown'

export default {
  components: {
    editor: require('vue2-ace-editor'),
    'vue-markdown': VueMarkdown
  },
  data: function () {
    return {
      showPanel: 'blogpost',
      blogs: [],
      blogTitle: '',
      blogContent: '',
      blogPublishStatus: 'draft',
      blogSelected: -1,
      blogID: '',
      statusSelected: 'requests',
      status: {redis: ''},
      statusJSON: '',
      requestTable: [],
      requestPage: 0,
      pingRequests: {},
      rateLimitSearch: ''
    }
  },
  mounted: function () {
    this.toggleFrame('blogpost')
  },
  computed: {
    User () {
      return this.$store.state.user
    }
  },
  methods: {
    LoadBlog (index) {
      if (index === -1) {
        this.blogTitle = ''
        this.blogContent = ''
        this.blogPublishStatus = 'draft'
        this.blogSelected = index
        this.blogID = false
      }
      else {
        var vue = this
        vue.http.get('/lookup/blog', {
          id: vue.blogs[index]._id
        }).then((res) => {
          if (res._id) {
            vue.blogTitle = res.title
            vue.blogContent = res.content
            vue.blogPublishStatus = res.publishStatus
            vue.blogSelected = index
            vue.blogID = res._id
          }
        })
      }
    },

    editorInit: function (editor) {
      window.braceRequires()
      editor.setOptions({
        autoScrollEditorIntoView: true,
        scrollPastEnd: true,
        printMargin: false,
        minLines: 80,
        maxLines: 1000
      })
    },

    LoadStatus: async function (frame) {
      this.statusSelected = frame
      if (frame === 'dataservers') {
        window.dataServers.forEach(async (server) => {
          this.$set(this.pingRequests, server, 'Waiting')
          let t = Date.now()
          await this.http.get(server + '/ping')
          this.$set(this.pingRequests, server, (Date.now() - t) + 'ms')
        })
      }
      else if (frame === 'ratelimit') {
        this.status.ratelimit = await this.http.get('/admin/ratelimit')
      }
      this.statusJSON = JSON.stringify(this.status[frame], null, 2)
    },

    onSubmitBlog () {
      var blog = {
        title: this.blogTitle,
        publishStatus: this.blogPublishStatus,
        content: this.blogContent,
        id: this.blogID
      }
      var vue = this
      this.http.post('/admin/blog', blog).then((res) => {
        if (res.success && vue.blogSelected > -1) {
          vue.blogs.splice(vue.blogSelected, 1, res.blog)
        }
        else {
          vue.blogs.unshift(res.blog)
          vue.blogSelected = 0
        }
      })
    },

    async submitRateLimit () {
      this.status.ratelimit = await this.http.get('/admin/ratelimit', {q: this.rateLimitSearch})
      this.statusJSON = JSON.stringify(this.status.ratelimit, null, 2)
    },

    toggleFrame (frame) {
      this.showPanel = frame
      var vue = this
      if (frame === 'blogpost') {
        this.http.get('/admin/blogs').then((res) => {
          if (res.blogs) {
            res.blogs.forEach((b) => {
              vue.blogs.push(b)
            })
          }
        })
      }
      else if (frame === 'status') {
        this.http.get('/admin/status').then((res) => {
          this.statusJSON = JSON.stringify(res.redis, null, 2)
          vue.status = res
          vue.requestTable = []
          vue.requestTable[0] = res.profiler.slice(1, 100)
          vue.requestTable[1] = res.profiler.slice(100, 200)
          vue.requestTable[2] = res.profiler.slice(200, 300)
          vue.requestTable[3] = res.profiler.slice(300, 400)
          vue.requestTable[4] = res.profiler.slice(400, 500)
          vue.requestTable[5] = res.profiler.slice(500, 600)
          vue.requestTable[6] = res.profiler.slice(600, 700)
          vue.requestTable[7] = res.profiler.slice(700, 800)
          vue.requestTable[8] = res.profiler.slice(800, 900)
          vue.requestTable[9] = res.profiler.slice(900, 1000)
        })
      }
    },
    sortRequests (sort) {
      console.log(sort)
    },
    setPage (page) {
      this.requestPage = page - 1
    }
  }
}
</script>

<style>
#admin .md-button-toggle { padding: 16px}
#admin .md-card {width: 100%}
#admin .md-list-item.selected { background: rgba(0, 0, 0, .7)}
#admin #blog-sidebar ul { width: 100% }
#admin #blog-sidebar ul em { font-size: 80%; opacity: .8 }
#adminPreviewFrame .md-dialog p { margin: 12px 0}
#blogEditor { min-height: 600px }
.md-table-cell-container {max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;}
</style>
