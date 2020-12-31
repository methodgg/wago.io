<template>
  <div id="search-mdt">
    <h2 id="addon-name">Mythic Dungeon Tools -
      <span>{{ $t('Shadowlands') }}</span>
    </h2>
    <md-layout>
      <addon-info addon="mdt"></addon-info>
      <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
        <md-input-container>
          <label>{{ $t("Search") }}</label>
          <md-input v-model="searchString" ref="searchInput"></md-input>
          <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
        </md-input-container>
      </form>
    </md-layout>
    <md-layout>
      <md-layout md-column>
        <md-whiteframe id="create-mdt">
          <strong>{{ $t("Build a new MDT route") }}</strong>
          <div class="field-group">
            <md-input-container>
              <label for="dungeon">{{ $t("Select Dungeon") }}</label>
              <md-select name="dungeon" id="dungeon" v-model="newDungeon">
                <md-option v-for="(dun, k) in dungeons[0].bosses" :key="k" :value="dun.id" v-if="dun.slug.match(/\//g).length <= 2">{{ $t(dun.text) }}</md-option>
              </md-select>
            </md-input-container>
            <md-input-container>
              <label for="affixes">{{ $t("Select Affixes") }}</label>
              <md-select name="affixes" id="affixes" v-model="newAffix">
                <md-option v-for="(item, index) in affixesS1" :value="item.id" :key="index">{{ $t('Week [-num-] [-affixes-]', {num: index + 1, affixes: item.text}) }}</md-option>
              </md-select>
            </md-input-container>
          </div>
          <md-button @click="createMDT()" class="md-raised" :disabled="!newAffix || !newDungeon">{{ $t("Build") }}</md-button>
        </md-whiteframe>

        <!--<md-whiteframe id="import-wcl" v-if="$store.state.user && $store.state.user.access && $store.state.user.access.beta">
          <strong>{{ $t("Import route from WarcraftLogs") }} [Beta]</strong>
          <p>* Highly experimental *<br>I need logs and accompanying video please!</p>
          <div class="field-group">
            <md-input-container>
              <label for="wclURL">{{ $t("Log URL or ID") }}</label>
              <md-input v-model="wclURL"></md-input>
            </md-input-container>
            <md-input-container v-if="wclDungeons.length">
              <label for="wclDungeonIndex">{{ $t("Select Run") }}</label>
              <md-select name="wclDungeonIndex" id="wclDungeonIndex" v-model="wclDungeonIndex">
                <md-option v-for="(item, index) in wclDungeons" :value="index" :key="index">{{ `${item.name} +${item.level}` }}</md-option>
              </md-select>
            </md-input-container>
            <md-button @click="importWCL()" class="md-raised" :disabled="wclDungeonIndex === -1 || wclLoading">{{ $t("Import") }}</md-button>
            <md-avatar v-if="wclLoading">
              <ui-image img="loading"></ui-image>
            </md-avatar>
          </div>
        </md-whiteframe>-->
        
        <md-subheader>{{ $t("Shadowlands Season 1 Affix Weeks") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset affixWeek">
            <category-image group="affixWeek"></category-image>
            <div class="md-list-text-container">
              <span>
                <a href="#" v-for="(item, index) in affixesS1" :key="index" @click.prevent="searchRoute(item.slug)">
                  <span v-if="index + 1 === currentWeek" class="currentWeek">&#xab;</span>
                  <span v-bind:class="{currentWeek: index + 1 === currentWeek}">{{ $t('Week [-num-] [-affixes-]', {num: index + 1, affixes: item.text}) }}</span>
                  <span v-if="index + 1 === currentWeek" class="currentWeek">&#xbb;</span>
                </a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout md-column>
        <md-subheader>{{ $t("Shadowlands Dungeons") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="dun in dungeons" v-bind:key="dun.id" :class="dun.cls + ' md-inset'">
            <category-image :group="dun.cls"></category-image>
            <div class="md-list-text-container">
              <span>
                <div v-for="boss in dun.bosses" v-bind:key="boss.id" v-bind:class="{'inline-dungeon-link': boss.slug.match(/\//g).length > 2}">
                  <a href="#" @click.prevent="searchRoute(boss.slug)">{{ boss.text }}</a>
                </div>
              </span>
            </div>
          </md-list-item>
        </md-list>
        <md-subheader>{{ $t("Speed Goals") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset speed">
            <category-image group="speed"></category-image>
            <div class="md-list-text-container">
              <span>
                <a href="#" v-for="(item, index) in speed" @click.prevent="searchRoute(item.slug)" v-bind:key="index">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
        <md-subheader>{{ $t("Individual Affixes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset affixes">
            <category-image group="affixes"></category-image>
            <div class="md-list-text-container">
              <span>
                <a href="#" v-for="(item, index) in affixes" @click.prevent="searchRoute(item.slug)" v-bind:key="index">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout md-column>
        <md-subheader>{{ $t("Requires Class") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(cls.slug)">{{ cls.text }}</a>
              <span>
                <a href="#" v-for="spec in cls.specs" @click.prevent="searchRoute(spec.slug)" v-bind:key="spec.id">{{ spec.text.replace(cls.text, '').trim() }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
    </md-layout>
    <advert ad="wago728x90" fixed="bottom" />
    <div></div>
  </div>
</template>

<script>
import categories from '../libs/categories'
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
    searchRoute: function (slug) {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'sl'})
      this.$router.push('/shadowlands-mdt/' + slug)
    },
    createMDT: function () {
      try {
        var dungeon = categories.match(this.newDungeon).slug.split(/\//).pop()
        var week = categories.match(this.newAffix).slug.split(/\//).pop()
        this.$router.push('/build-new-mdt/shadowlands-s1/' + dungeon + '/' + week)
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
        const dungeon = categories.search(this.wclDungeons[this.wclDungeonIndex].name, false, 'mdt').slug.split(/\//).pop()
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
      return categories.raidCategories(['mdt-sldun'], this.$t)
    },
    affixesS1: function () {
      return categories.getCategories([/^mdtaffix-sl-s1-/], this.$t, true)// also in Create-MDT and data.newAffix
    },
    affixes: function () {
      return categories.getCategories([/^mdtaffix\d/], this.$t)
    },
    speed: function () {
      return categories.getCategories([/^mdtspeed[\d]+/], this.$t)
    },
    classes: function () {
      return categories.classCategories(this.$t)
    },
    currentWeek: function () {
      return this.$store.state.MDTWeek
    }
  },
  mounted: async function () {
    this.$refs.searchInput.$el.focus()
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

<style>
h2#addon-name {margin: 16px 0 0 16px;}
h2 .faded {opacity: .3}
h2 span {font-size:80%; cursor: pointer}
#create-mdt, #import-wcl, #addon-meta .md-whiteframe { padding: 16px; margin: 16px; width:calc(100% - 16px); margin-right: 16px; flex-grow: 1; flex-basis: 0;}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#addon-name .md-theme-default.md-switch {margin: 0 8px; zoom:0.8}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-container {background-color: rgba(0, 0, 0, 0.38);}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {background-color: #fafafa;}

#search-mdt .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-mdt a { margin-right: 12px }
#search-mdt .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-mdt .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-mdt .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-mdt .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-mdt .md-layout { align-items: flex-start}
#search-mdt .md-layout > .md-layout {max-width:450px}
.md-list:after { background-color: transparent!important }
.currentWeek { color: #55b955 }
.inline-dungeon-link { display: inline-block; margin-left: 16px }
.inline-dungeon-link a { margin-right:0 }
</style>
