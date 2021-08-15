<template>
  <div id="search-totalrp">
    <md-layout md-row class="addon-name">
      <md-avatar class='square'><category-image :group="'t-totalrp'"></category-image></md-avatar>
      <h2 id="addon-name">Total RP 3
      </h2>
    </md-layout>
    <md-layout>
      <addon-info addon="totalrp3"></addon-info>
    </md-layout>
    <md-subheader>Total RP 3</md-subheader>
    <md-layout>
      <md-list class="md-double-line md-dense">
        <md-list-item class="md-inset totalrp1">
          <div class="menu-image"></div>
          <div class="md-list-text-container">
            <router-link to="/totalrp/campaigns">Campaigns</router-link>
            <span>
              <a v-for="(item, index) in campaigns" v-bind:key="item.id" :href="'/totalrp/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
            </span>
          </div>
        </md-list-item>
      </md-list>

      <md-list class="md-double-line md-dense">
        <md-list-item class="md-inset totalrp4">
            <div class="menu-image"></div>
          <div class="md-list-text-container">
            <router-link to="/totalrp/items">Items</router-link>
            <span>
              <router-link v-for="(item, index) in items" :to="'/totalrp/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
            </span>
          </div>
        </md-list-item>
      </md-list>

      <md-list class="md-double-line md-dense">
        <md-list-item class="md-inset rplang1">
            <div class="menu-image"></div>
          <div class="md-list-text-container">
            <router-link to="/totalrp">Languages</router-link>
            <span>
              <router-link v-for="(item, index) in languages" :to="'/totalrp/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
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
      console.log(item)
      if (typeof item === 'string') {
        item = window.Categories.match(item)
      }
      this.$store.commit('setSearchText', `type:TOTALRP3 category:${item.id}`)
      this.$router.push('/totalrp/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: TotalRP '
    }
  },
  computed: {
    campaigns: function () {
      return window.Categories.getCategories(['totalrp2', 'totalrp3'])
    },
    items: function () {
      return window.Categories.getCategories(['totalrp5', 'totalrp6', 'totalrp7', 'totalrp8', 'totalrp9', 'totalrp10', 'totalrp11', 'totalrp12'])
    },
    languages: function () {
      return window.Categories.getCategories(['rplang1', 'rplang2', 'rplang3', 'rplang4'])
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'TotalRP',
      description: this.$t('Browse TotalRP imports')
    })
    this.http.get('/search/menu', {view: 'TotalRP'})
  }
}
</script>

<style lang="scss">
.addon-name {
  .md-avatar {margin: 16px; border-radius: 4px;}
  h2 {margin: 16px 0 0 0; line-height: 40px}
}
h2 .faded {opacity: .3}
h2 span {font-size:80%; cursor: pointer}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#addon-name .md-theme-default.md-switch {margin: 0 8px; zoom:0.8}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-container {background-color: rgba(0, 0, 0, 0.38);}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {background-color: #fafafa;}

#search-totalrp .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-totalrp a { margin-right: 12px }
#search-totalrp .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-totalrp .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-totalrp .md-list-text-container > a, #search-totalrp .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-totalrp .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-totalrp .md-layout { align-items: flex-start}

#search-totalrp .md-subheader { width: 100% }
#search-totalrp .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
