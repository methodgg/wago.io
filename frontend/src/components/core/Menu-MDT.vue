<template>
  <div id="search-mdt"> 
    <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
      <md-input-container>
        <label>{{ $t("Search") }}</label>
        <md-input v-model="searchString" ref="searchInput"></md-input>
        <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
      </md-input-container>
    </form>
    <md-subheader>Method Dungeon Tools</md-subheader>
    <md-layout>
      <md-layout>
        <md-subheader>{{ $t("Requires Class") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/mdt/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/mdt/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>        
        <md-subheader>{{ $t("BFA Season 1 Affix Weeks") }}</md-subheader>
        <md-list class="md-double-line md-dense">          
          <md-list-item class="md-inset affixWeek">
            <category-image group="affixWeek"></category-image>
            <div class="md-list-text-container">
              <span>
                <router-link v-for="(item, index) in affixesS1" :to="'/mdt/' + item.slug" v-bind:key="index">{{ $t('Week [-num-] [-affixes-]', {num: index + 1, affixes: item.text}) }}</router-link>
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
                <router-link v-for="(item, index) in affixes" :to="'/mdt/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>      
      </md-layout>
      <md-layout>      
        <md-subheader>{{ $t("BFA Dungeons") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="dun in dungeons" v-bind:key="dun.id" :class="dun.cls + ' md-inset'">
            <category-image :group="dun.cls"></category-image>
            <div class="md-list-text-container">
              <span>
                <router-link v-for="boss in dun.bosses" v-bind:key="boss.id" :to="'/mdt/' + boss.slug">{{ boss.text }}</router-link>
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
                <router-link v-for="(item, index) in speed" :to="'/mdt/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>  
      </md-layout>
    </md-layout>
  </div>
</template>

<script>
import categories from '../libs/categories'
export default {
  components: {
    'category-image': require('../UI/CategoryImage.vue')
  },
  methods: {
    runSearch: function () {
      this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    }
  },
  data: function () {
    return {
      searchString: 'Type: MDT '
    }
  },
  computed: {
    dungeons: function () {
      return categories.raidCategories(['mdtdun'], this.$t)
    },
    affixesS1: function () {
      return categories.getCategories([/^mdtaffix-bfa-s1-/], this.$t, true)
    },
    affixes: function () {
      return categories.getCategories([/^mdtaffix\d/], this.$t)
    },
    speed: function () {
      return categories.getCategories([/^mdtspeed[\d]+/], this.$t)
    },
    classes: function () {
      return categories.classCategories(this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'MDT',
      description: this.$t('Browse MDT imports')
    })
  }
}
</script>

<style>
#searchForm { padding: 16px }
#searchForm button { margin-top: -3px }

#search-mdt .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-mdt a { margin-right: 12px }
#search-mdt .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-mdt .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-mdt .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-mdt .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-mdt .md-layout { align-items: flex-start}
.md-list:after { background-color: transparent!important }
</style>
