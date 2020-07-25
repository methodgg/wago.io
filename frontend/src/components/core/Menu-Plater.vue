<template>
  <div id="search-plater">
    <h2 id="addon-name">Plater Nameplates</h2>
    <md-layout>
      <addon-info addon="plater"></addon-info>
      <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
        <md-input-container>
          <label>{{ $t("Search") }}</label>
          <md-input v-model="searchString" ref="searchInput"></md-input>
          <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
        </md-input-container>
      </form>
    </md-layout>
    <md-layout>
      <md-layout>
        <md-subheader>Plater</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset plater">
            <category-image group="plater"></category-image>
            <div class="md-list-text-container">
              <router-link to="/plater">Plater</router-link>
              <span>
                <router-link v-for="(item, index) in plater" :to="'/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset snippets">
            <category-image group="snippets"></category-image>
            <div class="md-list-text-container">
              <router-link to="/plater">{{ $t("Content") }}</router-link>
              <span>
                <router-link v-for="(item, index) in content" :to="'/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Class Roles") }}</md-subheader>
        <md-list class="md-double-line md-dense">

          <md-list-item class="md-inset roles">
            <category-image group="role"></category-image>
            <div class="md-list-text-container">
              <router-link to="/plater/roles">{{ $t("Class Roles") }}</router-link>
              <span>
                <router-link v-for="(item, index) in roles" :to="'/plater/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout v-for="(classes, index) in aClasses" v-bind:key="index">
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/plater/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/plater/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
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
      searchString: 'Type: Plater '
    }
  },
  computed: {
    aClasses: function () {
      var cats = categories.classCategories(this.$t)
      return [[cats[0], cats[1], cats[2], cats[3]], [cats[4], cats[5], cats[6], cats[7]], [cats[8], cats[9], cats[10], cats[11]]]
    },
    roles: function () {
      return categories.getCategories(['role1', 'role2', 'role3'], this.$t)
    },
    plater: function () {
      return categories.getCategories(['plater1', 'plater2', 'plater3', 'plater4', 'plater5'], this.$t)
    },
    content: function () {
      return categories.getCategories(['platerpvp', 'platerdungeons', 'platerraidzuldazar', 'platerraidcrucible', 'platerraideternalpalace', 'platerraidnyalotha', 'platerraiduldir', 'platerutilities'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'Plater',
      description: this.$t('Browse Plater imports')
    })
    this.http.get('/search/menu', {view: 'Plater'})
  }
}
</script>

<style>
h2#addon-name {margin: 16px 0 0 16px;}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#search-plater .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-plater a { margin-right: 12px }
#search-plater .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-plater .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-plater .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-plater .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-plater .md-layout { align-items: flex-start}
.md-list:after { background-color: transparent!important }
</style>
