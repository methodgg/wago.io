<template>
  <div id="search-opie">
    <h2 id="addon-name">OPie</h2>
    <md-layout>
      <addon-info addon="opie"></addon-info>
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
        <md-subheader>OPie</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.cls + ' md-inset'">
            <category-image :group="prof.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/opie/' + prof.slug">{{ prof.text }}</router-link>
              <span>
                <router-link  v-for="spec in prof.specs" v-bind:key="spec.id" :to="'/opie/' + spec.slug">{{ spec.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
        
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset opie">
            <category-image group="opie"></category-image>
            <div class="md-list-text-container">
              <router-link to="/opie">{{ $t("Content") }}</router-link>
              <span>
                <router-link v-for="(item, index) in content" :to="'/opie/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
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
              <router-link :to="'/opie/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/opie/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
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
      searchString: 'Type: OPie '
    }
  },
  computed: {
    aClasses: function () {
      var cats = categories.classCategories(this.$t)
      return [[cats[0], cats[1], cats[2], cats[3]], [cats[4], cats[5], cats[6], cats[7]], [cats[8], cats[9], cats[10], cats[11]]]
    },
    professions: function () {
      var cats = categories.professionCategories(this.$t)
      cats.splice(1, 1)
      return cats
    },
    content: function () {
      return categories.getCategories(['opie1', 'opie2', 'opie3', 'opie4', 'opie5'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'OPie',
      description: this.$t('Browse OPie imports')
    })
  }
}
</script>

<style>
h2#addon-name {margin: 16px 0 0 16px;}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#search-opie .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-opie a { margin-right: 12px }
#search-opie .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-opie .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-opie .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-opie .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-opie .md-layout { align-items: flex-start}
.md-list:after { background-color: transparent!important }
</style>
