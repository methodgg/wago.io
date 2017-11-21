<template>
  <div id="comments">
    <md-card-actions v-if="User.UID && replyID != -1">
      <md-button @click="openReply(-1)">
        <md-icon>comment</md-icon> {{ $t("New comment") }}
      </md-button>
    </md-card-actions>
    <md-input-container v-else-if="User.UID">
      <label>{{ $t('Post comment') }}</label>
      <md-textarea :id="'post-comment-new'" v-focus v-model="replyText"></md-textarea><br>
      <md-button @click.once="submitComment()" :disabled="replyText.length<5">{{ $t("Submit") }}</md-button>
    </md-input-container>
    <p v-else v-html="$t('Sign in to post a comment')"></p>
    <div v-if="commentTotal>0">
      <md-card v-for="(comment, index) in comments" v-bind:key="index">
        <md-card-header>
          <ui-warning v-if="User.UID && isUnread(comment)" mode="alert">{{ $t("Attention! New mention") }}</ui-warning>
          <md-avatar>
            <ui-image :img="comment.author.avatar"></ui-image>
          </md-avatar>

          <div class="md-title">
            <router-link v-if="comment.author.profile" :to="comment.author.profile" :class="comment.author.class">{{ comment.author.name }}</router-link>
            <span v-else :class="comment.author.class">{{ comment.author.name }}</span>
          </div>
          <div class="md-subhead">{{ comment.date | moment('LLL') }}</div>
        </md-card-header>

        <md-card-content v-html="parseCommentText(comment)"></md-card-content>
        <div v-if="User.UID" style="margin: 0 0 0 16px">
          <md-card-actions v-if="replyID != index">
            <md-button v-if="isUnread(comment)" @click="clearAlert(index)">{{ $t("Clear alert") }}</md-button>
            <md-button @click="openReply(index)">{{ $t("Reply") }}</md-button>
          </md-card-actions>
          <div v-else>
            <md-input-container>
              <label>{{ $t('Post comment') }}</label>
              <md-textarea :id="'post-comment-' + index" v-focus v-model.trim="replyText"></md-textarea><br>
            </md-input-container>
            <md-button @click.once="submitComment()" :disabled="replyText == '@'+comment.author.name+' ' || replyText.length<5">{{ $t("Submit") }}</md-button>
          </div>
        </div>
      </md-card>
      <md-button v-if="showMoreComments" @click="loadMoreComments"><md-icon>list</md-icon> {{ $t("Load more comments" )}}</md-button>
    </div>
    <div v-else>
      <md-card>
        <p>{{ $t("This Wago has no comments") }}</p>
      </md-card>
    </div>
  </div>
</template>

<script>
import XBBCode from '../libs/xbbcode'

const focus = {
  inserted (el) {
    el.focus()
  }
}

export default {
  name: 'page-loading',
  props: [
    'comments',
    'commentTotal',
    'wagoID'
  ],
  data: function () {
    return {
      page: 1,
      replyID: null,
      replyText: ''
    }
  },
  directives: { focus },
  methods: {
    parseCommentText (comment) {
      if (comment.format === 'bbcode') {
        return XBBCode.process({
          text: comment.text,
          removeMisalignedTags: true,
          addInLineBreaks: true,
          enableURLs: comment.author.enableLinks
        }).html
      }
    },
    loadMoreComments () {
      this.http.get('/lookup/wago/comments', {id: this.wagoID, page: this.page}).then((res) => {
        this.page++
        this.comments = this.comments.concat(res)
      })
    },
    openReply (postID) {
      if (postID >= 0) {
        this.clearAlert(postID)
        this.replyText = '@' + this.comments[postID].author.name + ' '
      }
      else {
        this.replyText = ' '
      }
      this.replyID = postID
    },
    clearAlert (postID) {
      this.http.post('/comments/clear', {comment: this.comments[postID].cid}).then((res) => {
        this.$store.commit('userClearMention', this.comments[postID].cid)
      })
    },
    submitComment () {
      var params = {}
      params.wagoID = this.wagoID
      params.text = this.replyText.trim()
      this.replyID = null

      var vue = this
      this.http.post('/comments/new', params).then(function (res) {
        vue.comments = res.concat(vue.comments)
      })
    },
    isUnread (comment) {
      for (var i = 0; i < this.User.unreadMentions.length; i++) {
        if (this.User.unreadMentions[i]._id === comment.cid) {
          return true
        }
      }
      return false
    }
  },
  computed: {
    User () {
      return this.$store.state.user
    },
    showMoreComments () {
      return (this.commentTotal - this.comments.length > 0)
    }
  }
}
</script>

<style>
#comments .md-card { padding: 0; margin:0 0 16px 0 }
#comments .md-card-actions { justify-content: start}
#comments .md-card > p { padding: 16px}
@media (max-width: 600px) {
  #comments .md-card { margin: 0 }
}
</style>
