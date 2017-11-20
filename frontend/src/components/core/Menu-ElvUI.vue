<template>
  <div id="search-elvui"> 
    <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
      <md-input-container>
        <label>{{ $t("Search") }}</label>
        <md-input v-model="searchString" ref="searchInput"></md-input>
        <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
      </md-input-container>
    </form>
    <md-subheader>{{ $t("Classes") }}</md-subheader>
    <md-layout>
      <md-layout v-for="(classes, index) in aClasses" v-bind:key="index">
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/elvui/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/elvui/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Class Roles") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          
          <md-list-item class="md-inset roles">
            <category-image group="role"></category-image>
            <div class="md-list-text-container">
              <router-link to="/elvui/roles">{{ $t("Class Roles") }}</router-link>
              <span>
                <router-link v-for="(item, index) in roles" :to="'/elvui/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
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
      searchString: 'Type: Elvui '
    }
  },
  computed: {
    aClasses: function () {
      var cats = categories.classCategories(this.$t)
      return [[cats[0], cats[1], cats[2], cats[3]], [cats[4], cats[5], cats[6], cats[7]], [cats[8], cats[9], cats[10], cats[11]]]
    },
    roles: function () {
      return categories.getCategories(['role4', 'role1', 'role2', 'role3'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'ElvUI',
      description: this.$t('Browse ElvUI imports')
    })
  }
}
</script>

<style>
#searchForm { padding: 16px }
#searchForm button { margin-top: -3px }

#search-elvui .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-elvui a { margin-right: 12px }
#search-elvui .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-elvui .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-elvui .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-elvui .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-elvui .md-layout { align-items: flex-start}
</style>
