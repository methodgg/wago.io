<template>
  <div id="view-wago">
    <!-- BUILDER FRAME -->
    <div id="wago-builder-container" class="wago-container">
      <div id="wago-builder">
        <build-mdt v-if="ready" :scratch="true" :affixes="affixes"></build-mdt>
        <ui-loading v-else-if="loading"></ui-loading>
        <div v-else>{{ $t("Error unknown dungeon or week" )}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import categories from '../libs/categories2'
import MDTBuilder from '../UI/MDTBuilder.vue'
export default {
  components: {
    'build-mdt': MDTBuilder
  },
  props: ['pulls', 'game', 'season'],
  data: function () {
    return {
      ready: false,
      loading: true,
      mapID: -1,
      dungeonName: '',
      affixes: []
    }
  },
  methods: {
    createMDT (dungeonTable) {
      let week = 1
      let game = this.game || 'midnight'
      let season = this.season
      // try {
      //   week = parseInt(this.$route.params.week.replace(/[^\d]/g, ''))
      //   if (!season && game === 'df') {
      //     season = 4
      //   }
      //   var category = categories.match(`mdtaffix-${game}-s${season}-w${week}`)
      //   if (!category) {
      //     this.loading = false
      //     return
      //   }
      //   this.affixes = category.contains
      // }
      // catch (e) {
      //   console.error(e)
      // }

      if (this.mapID < 0 || !week) {
        this.loading = false
        return
      }
      const table = {
        text: this.dungeonName,
        objects: [],
        value: {
          currentSublevel: 1,
          currentPull: 1,
          teeming: this.affixes.indexOf(5) >= 0,
          currentDungeonIdx: this.mapID,
          pulls: this.pulls || [{
            color: "ff3eff"
          }]
        },
        week: week
      }
      this.ready = true
      this.loading = false
      this.$store.commit('setWago', {
        code: {
          json: JSON.stringify(table),
          changelog: {}
        },
        versions: {
          versions: [{versionString: '0.0.1'}]
        }
      })
    }
  },
  created () {
    // const dungeons = categories.raidCategories(['tww-mdt-s3', 'tww-mdt-s2', 'tww-mdt-s1'], 'MDT')[0].bosses
    const dungeons = categories.raidCategories(['midnight-mdt-s1'], 'MDT')[0].bosses
    console.log(dungeons)
    for (let i = 0; i < dungeons.length; i++) {
      if (dungeons[i].mdtID && dungeons[i].slug.match(this.$route.params.dungeon)) {
        this.mapID = dungeons[i].mdtID
        this.dungeonName = this.$t(dungeons[i].text)
        break
      }
    }
    this.http.get('/data/mdtDungeonTable-' + (this.mapID-1)).then((res) => {
      if (res && res.value) {
        this.$store.commit('setPageInfo', {
          layout: 'MDT',
        })
        this.createMDT(res.value)
      }
    })
  }
}
</script>

<style>
#view-wago > div { position: relative }
#wago-header.md-card { padding-bottom:0!important; }
#wago-header.md-card, #wago-floating-header.md-card { padding: 16px; margin: 16px }
#wago-header.md-card h3, #wago-floating-header.md-card h3 { margin: 0 }
#wago-header.md-card h3 + .md-subheader, #wago-floating-header.md-card h3 + .md-subheader { padding:0; min-height:0 }

#wago-header .md-card-header, #wago-floating-header .md-card-header { padding-left: 0; padding-right: 4px }
#wago-header .md-card-header .item, #wago-floating-header .md-card-header .item { padding-left: 0!important; float: left; display: inline; margin-right: 16px; vertical-align: middle }
@media (min-width: 601px) {
  #wago-header .md-card-header .item+.item { margin-left: 16px; margin-right: 0 }
}
#wago-header .md-card-header .item .md-title { font-weight: 500; line-height: 20px; font-size: 14px }
#wago-header .md-card-header .item .md-subhead { font-weight: 500; line-height: 20px; font-size: 14px; opacity: .54 }
#wago-header .md-card-header .item .md-subhead.has-link { opacity: 1 }

#wago-floating-header { position: fixed; top:-16px; right:0; left: 260px; z-index: 9; opacity: .95 }
#wago-floating-header .floating-header { display: flex; justify-content: flex-start; align-content: stretch; align-items: flex-start}
#wago-floating-header .floating-header div { flex: 0 1 auto; vertical-align:top; margin-right: 24px}
#wago-floating-header button { margin-top: 0 }
.version-number { padding-left: 8px; opacity: .54; font-size: 14px }
@media (max-width: 600px) {
  #wago-floating-header { display: none!important}
}

#wago-tabs { flex: 0 1 auto; flex-direction: column }
#wago-tabs .md-button-toggle { flex-direction: column }
#wago-tabs .md-button-toggle button { text-align:left }

#wago-content { flex: 1; flex-direction: column }
#wago-content > div { margin: 0 8px 16px 0; width: 100%; }
#addCollectionButton, #newCommentButton { margin-top: 0 }

#wago-actions { flex: 1; padding: 0 }
#wago-actions button { margin-top: 0 }
.copy-import-button { border: 2px solid #c1272d; border-radius: 25px; margin: 4px 28px; display: inline-block }
#wago-collections-container button { margin-left: -2px }
#wago-floating-header .copy-import-button { margin: -2px 0 0 auto }

#thumbnails img { max-width: 190px; max-height: 107px; width: auto; height: auto; margin: 8px 8px 0 0 }

#tags { display: block; clear: both; padding-top: 16px}
.wago-media { width: 160px; text-align: center  }
.wago-media img, .wago-media a img { padding: 8px 16px; width: 100%; max-height: 120px; display: block; float: none }
a.showvid { position: relative; display: block; cursor: pointer }
a.showvid:hover img { transform: scale(1.05); }
a.showvid .md-icon { width:50px; height: 50px; position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); -webkit-transform: translate(-50%, -50%); opacity: .7; font-size: 50px; color: #fff; text-shadow: 0px 0px 30px rgba(0, 0, 0, 0.8); z-index: 9  }
a.showvid:hover:before  .md-icon { opacity:1 }
.sl-overlay { background-color: rgba(0, 0, 0, 0.54) }

#wago-config { padding-bottom: 10em!important}

#video-modal { width: 70vw; height: 39.375vw; z-index:999; margin: auto; background: none; outline: none}
#video-modal > .md-dialog {width: 100%; height: 100%; background: none; position: relative }
.video-wrapper { position: relative; }
.video-wrapper:before { display: block; content:""; width: 100%; padding-top: 56.25%}
.video-wrapper iframe { position: absolute; top: 0;	left: 0; bottom: 0; right: 0; width:100%; height: 100% }

.md-button-toggle { padding: 0 16px 16px; flex-wrap: wrap; }
.md-button .commentAttn { color: #c2272e !important; -webkit-text-fill-color: #c2272e }

.wago-container { padding: 0 16px; }
.wago-container > h2 { padding: 0 16px; margin: 8px 0 16px }
.wago-container > div { margin: 0; }
.wago-container .border { border-bottom: 1px solid rgba(128, 128, 128, 0.5) }
#wago-config, #wago-embed { background: rgba(128, 128, 128, 0.1); padding: 16px;}

#wago-flex-container { display: flex; flex-direction: row; }
#wago-col-main { flex: 1.5 0 0 }
#wago-col-main > .md-layout { flex-direction: row; flex-wrap: nowrap }
#wago-col-side { flex: 1 0 0 }

#wago-includedauras div { font-weight: bold }
#wago-includedauras div + div { font-weight: normal; padding-left: 24px }
#wago-includedauras div + div:before { content: '• ' }

#wago-versions .md-table .md-table-cell .md-table-cell-container { display: block }
#wago-versions .md-table-row { }
#wago-versions .md-table-selection { display: none } /* hack to make md-table-row clickable */
#wago-versions .chip-button { background-color: rgba(0, 0, 0, .12); text-transform: none; width: auto; min-width: auto; height: auto; min-height: auto; font-size: 13px; line-height: 16px; padding: 8px 12px; margin: 0 6px 6px 0}
#wago-versions .chip-button:hover, #wago-versions .chip-button.md-toggle { background-color: #c2272e; cursor: pointer }
#wago-versions .version-num { min-width: 55px; display: inline-block; }
#wago-versions .version-num + .usertext { display: inline-block; padding-left: 12px }

.changelog-notes { margin-top: 0 }
.changelog-text { border-bottom: 1px solid #555; margin-bottom: 8px; }
.md-table tbody .md-table-row.changelog-row { border-top-color: #555;}

#embed-content { display: flex }
#embed-inputs { flex: 2 1 auto }
#embed-preview { flex: 1.5 1 auto }
#embed-inputs .md-select { max-width: 200px}
#embed-inputs .md-has-select.md-input-container {margin-bottom:0}
#embed-inputs .md-has-select.md-input-container:after {height:0}


#wago-collections .md-avatar { margin: 0 16px 0 0 }
#wago-collections .userlink .md-table-cell-container { display: inline }

@media (max-width: 600px) {
  #wago-header.md-card { margin: 0}
  #wago-flex-container { flex-direction: column; }
}

/* embed preview */
#embed-preview-container a{display:inline;padding:0 2px;margin:0;border:0}
#embed-preview-container img{display:inline;padding:0;margin:0;border:0;height:42px}
#embed-preview-container .clickToCopyWago{display:block;padding:0;margin:0;font-size:10px}
#embed-preview-container .wagoName{display:block;padding:0;margin:4px 0;font-weight:bold;font-size:13px}

#embed-preview-container{padding: 0 4px}
#embed-preview-container.dark{background: white}
#embed-preview-container.light .md-subheader{color:black}
#embed-preview-container.dark button{display:inline;padding:4px 16px;min-width: 130px;background-color:#000;cursor:pointer;color:rgba(255,255,255,.87);border:0;text-align:center;vertical-align:top;border-radius:6px}
#embed-preview-container.dark button:hover{background-color:#040404}
#embed-preview-container.light{background: black}
#embed-preview-container.light .md-subheader{color:white}
#embed-preview-container.light button{display:inline;padding:4px 16px;min-width: 130px;background-color:#FFF;cursor:pointer;color:rgba(0,0,0,.87);border:0;text-align:center;vertical-align:top;border-radius:6px}
#embed-preview-container.light button:hover{background-color:#F4F4F4}
#embed-preview-container.none img {display: none}

.wago-importstring { width:2em;height:2em;padding:0;margin:0;border:0;outline:none;box-shadow:none;background:transparent;color:transparent;overflow:hidden;resize:none }
.wago-importstring::selection { color:transparent;background:transparent }
.wago-importstring::-moz-selection { color:transparent;background:transparent }
.wago-importstring::-webkit-selection { color:transparent;background:transparent }

.customSlug .root { font-size:16px; line-height: 32px }
.md-input-container.md-input-status .md-error { opacity: 1; transform: translate3d(0, 0, 0); }

.has-category-select { position: relative}
.has-category-select:after {
    height: 1px;
    position: absolute;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: #B6B6B6;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
    content: " ";
}
#categoryLabel { margin-top: 10px; display: inline-block}
#tags .md-chip { padding-left:26px }


.multiselect { min-height: 0}
.multiselect__tags { border-width: 0 0 1px 0; padding:5px 0; min-height: 16px; border: 0; background: none}
.multiselect_remove { cursor: pointer }
.md-input-container input.multiselect__input { display: inline }
ul.multiselect__content { display: flex!important; flex-wrap: wrap }
ul.multiselect__content .multiselect__element { flex: 1 1 25% }
ul.multiselect__content .multiselect__element .multiselect__option { padding: 0; min-height: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip { border-radius: 0; display: block; font-size: 13.5px; text-outline: none; box-shadow: none }
ul:not(.md-list) > li.multiselect__element + li { margin-top: 0 }

.vddl-draggable { display: inline-block; cursor: move; position: relative; }
.vddl-draggable img { max-height:120px; max-width: 150px; margin: 0 4px 4px 0 }
.vddl-draggable .vddl-delete { position: absolute; top: 2px; right: 2px; z-index: 3; opacity: .2; cursor: pointer}
.vddl-draggable:hover .vddl-delete { opacity: 1}

.my-gallery a img { border-color: transparent }

#newImportDialog > div { min-width: 30% }
#newImportDialog .md-input-container { margin-bottom: 0 }
#newVersionFlexArea { flex: 1 }

.CopyWarningTooltip { padding: 8px; border:5px solid #c1272d; font-size: 14px; height: auto; max-width: 450px; white-space:normal; background: black; right: -84px  }

.usertext.markdown hr { opacity: .5 }

</style>
