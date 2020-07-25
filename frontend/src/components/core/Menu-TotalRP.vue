<template>
  <div id="search-totalrp"> 
    <h2 id="addon-name">Total RP 3</h2>
    <md-layout>
      <addon-info addon="totalrp3"></addon-info>
      <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
        <md-input-container>
          <label>{{ $t("Search") }}</label>
          <md-input v-model="searchString" ref="searchInput"></md-input>
          <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
        </md-input-container>
      </form>
    </md-layout>
    <md-subheader>Total RP 3</md-subheader>
    <md-layout>
      <md-list class="md-double-line md-dense">          
        <md-list-item class="md-inset rpcampaign">
          <category-image group="t-totalrp"></category-image>
          <div class="md-list-text-container">
            <router-link to="/totalrp/campaigns">Campaigns</router-link>
            <span>
              <router-link v-for="(item, index) in campaigns" :to="item.slug" v-bind:key="index">{{ item.text }}</router-link>
            </span>
          </div>
        </md-list-item>
      </md-list>
      
      <md-list class="md-double-line md-dense">          
        <md-list-item class="md-inset equip">
          <category-image group="equip"></category-image>
          <div class="md-list-text-container">
            <router-link to="/totalrp/items">Items</router-link>
            <span>
              <router-link v-for="(item, index) in items" :to="item.slug" v-bind:key="index">{{ item.text }}</router-link>
            </span>
          </div>
        </md-list-item>
      </md-list>
      
      <md-list class="md-double-line md-dense">          
        <md-list-item class="md-inset rplang">
          <category-image group="rplang"></category-image>
          <div class="md-list-text-container">
            <router-link to="/totalrp">Languages</router-link>
            <span>
              <router-link v-for="(item, index) in languages" :to="item.slug" v-bind:key="index">{{ item.text }}</router-link>
            </span>
          </div>
        </md-list-item>
      </md-list>

      <md-list></md-list>

    </md-layout>
    <advert ad="wago728x90" fixed="bottom" />
    <div></div>
  </div>
</template>

<script>
import categories from '../libs/categories'
export default {
  components: {
    'category-image': require('../UI/CategoryImage.vue'),
    'addon-info': require('../UI/AddonInfoBox.vue')
  },
  methods: {
    runSearch: function () {
      this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    }
  },
  data: function () {
    return {
      searchString: 'Type: TotalRP '
    }
  },
  computed: {
    campaigns: function () {
      return categories.getCategories(['totalrp2', 'totalrp3'], this.$t)
    },
    items: function () {
      return categories.getCategories(['totalrp5', 'totalrp6', 'totalrp7', 'totalrp8', 'totalrp9', 'totalrp10', 'totalrp11', 'totalrp12'], this.$t)
    },
    languages: function () {
      return categories.getCategories(['rplang1', 'rplang2', 'rplang3', 'rplang4'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'TotalRP',
      description: this.$t('Browse TotalRP imports')
    })
    this.http.get('/search/menu', {view: 'TotalRP'})
  }
}
</script>

<style>
h2#addon-name {margin: 16px 0 0 16px;}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#search-totalrp .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-totalrp a { margin-right: 12px }
#search-totalrp .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-totalrp .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-totalrp .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-totalrp .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-totalrp .md-layout { align-items: flex-start}
#search-totalrp .md-subheader + .md-list:after { background-color: transparent }
.md-list:after { background-color: transparent!important }
</style>
