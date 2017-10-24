<template>
  <div>
    <div id="admin" v-if="User && User.access.admin">
      <!-- FRAME TOGGLES -->
      <md-button-toggle class="md-accent" md-single>
        <md-button class="md-toggle" @click="toggleFrame('blogpost')">Blog Posts</md-button>
      </md-button-toggle>
    
      <!-- BLOG FRAME -->
      <md-layout id="admin-blog-container" v-if="showPanel=='blogpost'">
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
              <md-textarea v-model="blogContent"></md-textarea>
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
      <md-dialog ref="blogPreviewFrame">
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
      blogID: ''
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
        vue.blogTitle = ''
        vue.blogContent = ''
        vue.blogPublishStatus = 'draft'
        vue.blogSelected = index
        vue.blogID = false
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
      this.http.get('/admin/blogs').then((res) => {
        if (res.blogs) {
          res.blogs.forEach((b) => {
            vue.blogs.push(b)
          })
        }
      })
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
</style>
