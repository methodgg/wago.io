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
          </md-list>
        </md-layout>
        <md-layout md-flex="85">
          <editor v-if="statusSelected !== 'requests'" v-model="statusJSON" @init="editorInit" :theme="$store.state.user.config.editor" lang="json" width="100%" height="500"></editor>
          <md-table-card v-else>
            <md-table md-sort="timestamp" md-sort-type="desc" @sort="onSort">
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
                <md-table-row v-for="(row, rowIndex) in status.profiler" :key="rowIndex" :md-item="row">
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
              @pagination="onPagination"></md-table-pagination>
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
      profiler: []
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

    LoadStatus (frame) {
      this.statusSelected = frame
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
        })
      }
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
</style>
