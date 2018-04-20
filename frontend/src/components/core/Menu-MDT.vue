<template>
  <div id="search-totalrp"> 
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
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="dun in dungeons" v-bind:key="dun.id" :class="dun.cls + ' md-inset'">
            <category-image :group="dun.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/mdt/' + dun.slug">{{ dun.text }}</router-link>
              <span>
                <router-link v-for="boss in dun.bosses" v-bind:key="boss.id" :to="'/mdt/' + boss.slug">{{ boss.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>        
        <md-list class="md-double-line md-dense">          
          <md-list-item class="md-inset affixes">
            <category-image group="affixes"></category-image>
            <div class="md-list-text-container">
              <router-link to="/mdt/affixes">{{ $t("Affixes") }}</router-link>
              <span>
                <router-link v-for="(item, index) in affixes" :to="'/mdt/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>      
      </md-layout>
      <md-layout>      
        <md-list class="md-double-line md-dense">          
          <md-list-item class="md-inset speed">
            <category-image group="speed"></category-image>
            <div class="md-list-text-container">
              <router-link to="/mdt">{{ $t("Speed") }}</router-link>
              <span>
                <router-link v-for="(item, index) in speed" :to="'/mdt/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>  
      </md-layout>
      <md-layout>  
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
    affixes: function () {
      return categories.getCategories([/^mdtaffix[\d]+/], this.$t)
    },
    speed: function () {
      return categories.getCategories([/^mdtspeed[\d]+/], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'TotalRP',
      description: this.$t('Browse TotalRP imports')
    })
  }
}
</script>

<style>
#searchForm { padding: 16px }
#searchForm button { margin-top: -3px }

#search-totalrp .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-totalrp a { margin-right: 12px }
#search-totalrp .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-totalrp .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-totalrp .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-totalrp .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-totalrp .md-layout { align-items: flex-start}
</style>
