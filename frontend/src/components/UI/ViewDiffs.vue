<template>
  <div>
    <ui-loading v-if="loading"></ui-loading>
    <div v-else>
      <md-layout md-row>
        <md-input-container>
          <label for="compareA">{{ $t('Compare') }}</label>
          <md-select name="compareA" id="compareA" v-model="compareA">
            <md-option v-for="(v, k) in allVersions" :value="v" :key="k">{{ v }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="compareB">{{ $t('Compare') }}</label>
          <md-select name="compareB" id="compareB" v-model="compareB">
            <md-option v-for="(v, k) in allVersions" :value="v" :key="k">{{ v }}</md-option>
          </md-select>
        </md-input-container>
      </md-layout>
      <template v-for="html in diffHTML">
        <div v-html="html"></div>
      </template>
      <div v-if="!diffHTML.length">{{ $t("There are no code differences between the selected versions" )}} {{ diffHTML[0] }}</div>
    </div>
  </div>
</template>

<script>
const Diff2Html = require('diff2html')
import 'diff2html/bundles/css/diff2html.min.css'
import semver from 'semver'

export default {
  props: ['leftVersion', 'rightVersion', 'allVersions'],
  methods: {
    doDiff () {
      this.diffHTML = []
      if (this.compareA === this.compareB) {
        return
      }

      // ensure the greater version on the left
      if (semver.gt(this.compareB, this.compareA)) {
        this.lock = true
        var tmp = this.compareB
        this.compareB = this.compareA
        this.compareA = tmp
        this.$nextTick(() => {
          this.lock = false
        })
      }
      this.loading = true
      this.http.get('/lookup/wago/diffs', {
        id: this.$store.state.wago._id,
        left: this.compareA,
        right: this.compareB
      }).then((res) => {
        res.forEach((diff) => {
          this.diffHTML.push(Diff2Html.html(diff, {
            inputFormat: 'diff',
            showFiles: false,
            matching: 'lines'
          }))
        })
        this.loading = false
      })
    }
  },
  data: function () {
    return {
      loading: true,
      diffHTML: [],
      compareA: this.leftVersion,
      compareB: this.rightVersion,
      lock: false
    }
  },
  watch: {
    'compareA': function () {
      if (!this.lock) {
        this.doDiff()
      }
    },
    'compareB': function () {
      if (!this.lock) {
        this.doDiff()
      }
    }
  },
  created: function () {
    this.doDiff()
  }
}
</script>

<style>
#wago-diff .md-layout.md-row { flex-wrap: nowrap }
#wago-diff .md-input-container { margin-right: 16px; max-width: 220px }
#wago-diff .d2h-file-diff { overflow-x: auto }
#wago-diff .d2h-tag, .d2h-file-list-title, .d2h-file-header { display: none }
#wago-diff .d2h-diff-tbody>tr>td { height: auto }
#wago-diff .d2h-code-line-ctn {white-space: pre-wrap}
#wago-diff .d2h-file-list-wrapper {margin-bottom:0}
#wago-diff .d2h-file-name-wrapper a.d2h-file-name {pointer-events: none; color: black}
body.theme-dark #wago-diff .d2h-file-name-wrapper a.d2h-file-name {color: white}
body.theme-dark .d2h-file-stats .d2h-lines-added {border-color: #2b722b}
body.theme-dark .d2h-file-stats .d2h-lines-deleted {border-color: #7f1e1e}
body.theme-dark .d2h-file-wrapper { border: 0 }
body.theme-dark .d2h-file-list { border: 0; background: #333333 }
body.theme-dark .d2h-info, body.theme-dark .d2h-code-linenumber { background: #333333; color: rgba(255, 255, 255, .6); border: 0 }
body.theme-dark .d2h-ins.d2h-change, body.theme-dark .d2h-ins { background-color: #004100; border-color: #212121 }
body.theme-dark .d2h-code-line ins { background-color: #007c00; }
body.theme-dark .d2h-del.d2h-change, body.theme-dark .d2h-del { background-color: #410000; border-color: #212121 }
body.theme-dark .d2h-code-line del { background-color: #7c0000; }
body.theme-dark .d2h-info { background-color: black }
td.d2h-code-linenumber, td .d2h-code-line-prefix { -webkit-touch-callout: none; -webkit-user-select: none; -khtml-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }


</style>

