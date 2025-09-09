<template>
    <div id="search-mdt">
      <md-layout md-row class="addon-name nowrap">
        <div class="grow">
          <md-layout md-row>
            <md-avatar class='square'><category-image :group="'t-mdt'"></category-image></md-avatar>
            <h2 id="addon-name">Mythic Dungeon Tools -
              <span>{{ $t('The War Within') }}</span>
            </h2>
          </md-layout>
          <addon-info game="wow" addon="mdt" expansion="df"></addon-info>
        </div>
      </md-layout>
      <md-layout>
        <md-layout md-column>
          <md-subheader>{{ $t("The War Within Mythic+") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item v-for="dungeon in dungeons" v-bind:key="dungeon.id" :class="dungeon.id + ' md-inset'">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <span>
                  <a :href="'/the-war-within-mdt/' + dungeon.slug" @click.prevent="searchRoute(dungeon)" class="subheader">{{ dungeon.text }}</a>
                  <template v-for="boss in dungeon.bosses">
                    <a v-if="boss.subheader" v-bind:key="'header'+boss.id" :href="'/the-war-within-mdt/' + dungeon.slug" @click.prevent="searchRoute(dungeon)" class="subheader">{{ boss.text }}</a>
  
                    <a v-else-if="boss.slug" v-bind:key="boss.id" :href="'/the-war-within-mdt/' + boss.slug"
                      @click.prevent="searchRoute(boss)">{{ boss.text }}</a>
                      
                  </template>
                </span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        
        <md-layout md-column class="col2">        
          <md-whiteframe id="create-mdt" class="">
            <strong>{{ $t("Build a new MDT route") }}</strong>
            <div class="field-group">
              <md-input-container>
                <label for="dungeon">{{ $t("Select Dungeon") }}</label>
                <md-select name="dungeon" id="dungeon" v-model="newDungeon">
                  <md-option v-for="(dun, k) in dungeons[0].bosses" :key="k" :value="dun.id" v-if="dun.mdtID">{{ $t(dun.text) }}</md-option>
                </md-select>
              </md-input-container>
              <!--<md-input-container>
                <label for="affixes">{{ $t("Select Affixes") }}</label>
                <md-select name="affixes" id="affixes" v-model="newAffix">
                  <md-option v-for="(item, index) in affixesS1" :value="item.id" :key="index">{{ $t('Week [-num-] [-affixes-]', {num: index + 1, affixes: item.text}) }}</md-option>
                </md-select>
              </md-input-container>-->
            </div>
            <md-button @click="createMDT()" class="md-raised" :disabled="!newAffix || !newDungeon">{{ $t("Build") }}</md-button>
          </md-whiteframe>          
        </md-layout>
      </md-layout>
    </div>
  </template>
  
  <script>
  import categories from '../libs/categories2'
  import CategoryImage from '../UI/CategoryImage.vue'
  import AddonInfoBox from '../UI/AddonInfoBox.vue'
  export default {
    components: {
      'category-image': CategoryImage,
      'addon-info': AddonInfoBox
    },
    methods: {
      runSearch: function () {
        this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
      },
      searchRoute: function (item) {
        this.$store.commit('userSearchOption', { field: 'expansion', value: 'df' })
        if (typeof item === 'string') {
          item = window.Categories.match(item)
        }
        this.$store.commit('setSearchText', `category:${item.id}`)
        this.$router.push('/the-war-within-mdt/' + item.slug)
      },
      createMDT: function () {
        try {
          var dungeon = categories.match(this.newDungeon).slug.split(/\//).pop()
          this.$router.push('/build-new-mdt/' + dungeon)
        }
        catch (e) {
          console.error(e.message)
        }
      },
      importWCL: function () {
        this.wclLoading = true
        this.http.get('/lookup/wcl/mdt-events', {
          log: this.wclURL,
          dungeon: this.wclDungeonIndex
        }).then((pulls) => {
          this.wclLoading = false
          const dungeon = categories.search(this.wclDungeons[this.wclDungeonIndex].name, 'mdt').slug.split(/\//).pop()
          const week = 1 // categories.match(this.newAffix).slug.split(/\//).pop()
          this.$router.push({name: 'create-mdt', params: {dungeon, week, pulls}})
        })
        .catch((e) => {
          console.error(e.message)
        })
      }
    },
    data: function () {
      return {
        searchString: 'Type: MDT ',
        newDungeon: '',
        newAffix: 'mdtaffix-sl-s1-w' + this.$store.state.MDTWeek,
        wclURL: '',
        wclDungeons: [],
        wclDungeonIndex: -1,
        wclLoading: false,
        isBeta: true
      }
    },
    watch: {
      isBeta: function (val) {
        if (!val) {
          var router = this.$router
          setTimeout(function () {
            router.push('/mdt')
          }, 150)
        }
      },
      currentWeek: function (val) {
        this.newAffix = 'mdtaffix-sl-s1-w' + val
      },
      wclURL: function (val) {
        this.wclDungeonIndex = -1
        this.wclDungeons.splice(0, this.wclDungeons.length)
        var m = val.match(/(https:\/\/)?[\w]?\.?warcraftlogs.com\/reports\/([\w\d]+)/)
        if (m && m[2]) {
          this.wclURL = m[2]
          return
        }
        if (val.match(/^[\w\d]+$/)) {
          this.wclLoading = true
          // id found
          this.http.get('/lookup/wcl/dungeons', {
            log: val
          }).then((data) => {
            this.wclLoading = false
            this.wclDungeons = data.dungeons
            if (this.wclDungeons.length) {
              this.wclDungeonIndex = 0
            }
          })
        }
      }
    },
    computed: {
      dungeons: function () {
        return categories.raidCategories(['tww-mdt-s3', 'tww-mdt-s2', 'tww-mdt-s1'], 'MDT')
      },
      affixesS3: function () {
        return categories.getCategories([/^mdtaffix-df-s3-/], true)// also in Create-MDT and data.newAffix
      },
      affixes: function () {
        return categories.getCategories([/^mdtaffix\d/])
      },
      speed: function () {
        return categories.getCategories([/^mdtspeed[\d]+/])
      },
      classes: function () {
        return categories.classCategories()
      },
      currentWeek: function () {
        return this.$store.state.MDTWeek
      }
    },
    mounted: async function () {
    //   this.$refs.searchInput.$el.focus()
      this.$store.commit('setPageInfo', {
        title: 'MDT',
        description: this.$t('Browse MDT imports')
      })
  
      if (!this.$store.state.addons[0]) {
        var vue = this
        await this.http.get('/lookup/index').then((res) => {
          if (res.addons) {
            vue.addonReleases = JSON.parse(JSON.stringify(res.addons))
            vue.$store.commit('setAddons', vue.addonReleases)
          }
        })
      }
  
      if (this.$store.state.addons[0]) {
        this.$store.state.addons.forEach((addon) => {
          if (addon.addon === 'MDT' && addon.phase === 'Release') {
            this.addonData = addon
            this.addonData.version = this.addonData.version.replace(/^v/, '')
          }
        })
      }
      this.http.get('/search/menu', {view: 'MDT-Shadowlands'})
    }
  }
  </script>
  
  <style scoped>
  .addon-name {
    .md-avatar {
      margin: 16px;
      border-radius: 4px;
    }
  
    h2 {
      margin: 16px 0 0 0;
      line-height: 40px
    }
  }
  
  .nowrap {
    flex-wrap: nowrap
  }
  
  h2 .faded {
    opacity: .3
  }
  
  h2 span {
    font-size: 80%;
    cursor: pointer
  }
  
  #searchForm {
    padding: 16px;
    flex: 1
  }
  
  #searchForm button {
    margin-top: -3px
  }
  
  #addon-name .md-theme-default.md-switch {
    margin: 0 8px;
    zoom: 0.8
  }
  
  #addon-name .md-theme-default.md-switch.md-checked .md-switch-container {
    background-color: rgba(0, 0, 0, 0.38);
  }
  
  #addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {
    background-color: #fafafa;
  }
  
  #search-mdt .md-list-item img {
    height: 48px;
    padding-right: 16px;
    vertical-align: top
  }
  
  #search-mdt a {
    margin-right: 12px
  }
  
  #search-mdt li.md-list-item.md-inset {
    padding-left: 24px;
    flex-wrap: wrap;
    padding-bottom: 16px
  }
  
  #search-mdt .md-list-text-container a {
    white-space: nowrap;
    display: inline-block
  }
  
  #search-mdt .md-list-text-container>a,
  #search-mdt .md-list-text-container>.parent-category,
  #search-mdt .md-list-text-container a.subheader {
    font-size: 18px;
    font-weight: bold;
    line-height: 19px;
    display: block;
  }
  
  #search-mdt .md-list-text-container span {
    white-space: normal;
    line-height: 22px
  }
  
  #search-mdt .md-layout.col2 {
    align-items: flex-end
  }
  
  #search-mdt .md-subheader {
    width: 100%
  }
  
  #search-mdt .md-subheader+.md-list {
    width: 100%
  }
  
  span.subsection {
    display: block
  }
  
  .md-list:after {
    background-color: transparent !important
  }
  
  #search-mdt .wago-ad-container {
    max-width: 260px;
    background: none;
    box-shadow: none;
    min-height: 160px;
    #video-sidebar {
      min-height: auto
    }
  }
  
  #create-mdt {
    width: 100%;
    padding: 16px;
  }
  </style>