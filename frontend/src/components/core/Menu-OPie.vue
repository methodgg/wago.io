<template>
  <div id="search-opie">
    <md-layout md-row class="addon-name nowrap">
      <div class="grow">
        <md-layout md-row>
          <md-avatar class='square'><category-image :group="'t-opie'"></category-image></md-avatar>
          <h2 id="addon-name">OPie</h2>
        </md-layout>
        <addon-info addon="opie"></addon-info>
      </div>
    </md-layout>
    <md-layout>
      <md-layout>
        <md-subheader>OPie</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/opie/' + prof.slug">{{ prof.text }}</router-link>
              <span>
                <router-link  v-for="spec in prof.specs" v-bind:key="spec.id" :to="'/opie/' + spec.slug">{{ spec.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset opie1">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/opie">{{ $t("Content") }}</router-link>
              <span>
                <a v-for="item in content" v-bind:key="item.id" :href="'/opie/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

      </md-layout>
      <md-layout v-for="(classes, index) in aClasses" v-bind:key="index">
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
            <div class="menu-image"></div>
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
      if (typeof item === 'string') {
        item = window.Categories.match(item)
      }
      this.$store.commit('setSearchText', `type:OPIE category:${item.id}`)
      this.$router.push('/opie/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: OPie '
    }
  },
  computed: {
    aClasses: function () {
      const cats = window.Categories.classCategories()
      const n = cats.length / 3
      return [[...cats.splice(0, Math.ceil(n))], [...cats.splice(0, Math.round(n))], [...cats]]
    },
    professions: function () {
      var cats = window.Categories.professionCategories()
      cats.splice(1, 1)
      return cats
    },
    content: function () {
      return window.Categories.getCategories(['opie1', 'opie2', 'opie3', 'opie4', 'opie5'])
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'OPie',
      description: this.$t('Browse OPie imports')
    })
    this.http.get('/search/menu', {view: 'OPie'})
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

#search-opie .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-opie a { margin-right: 12px }
#search-opie .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-opie .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-opie .md-list-text-container > a, #search-opie .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-opie .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-opie .md-layout { align-items: flex-start}

#search-opie .md-subheader { width: 100% }
#search-opie .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
