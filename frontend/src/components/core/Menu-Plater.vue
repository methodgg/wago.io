<template>
  <div id="search-plater">
    <md-layout md-row class="addon-name nowrap">
      <div class="grow">
        <md-layout md-row>
          <md-avatar class='square'><category-image :group="'t-plater'"></category-image></md-avatar>
          <h2 id="addon-name">Plater Nameplates</h2>
        </md-layout>
        <addon-info addon="plater"></addon-info>
      </div>
    </md-layout>
    <md-layout>
      <md-layout>
        <md-subheader>Plater</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset plater1">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/plater">Plater</router-link>
              <span>
                <router-link v-for="(item, index) in plater" :to="'/plater/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset platerutilities">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/plater">{{ $t("Content") }}</router-link>
              <span>
                <a v-for="item in content" v-bind:key="item.id" :href="'/plater/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Class Roles") }}</md-subheader>
        <md-list class="md-double-line md-dense">

          <md-list-item class="md-inset role0">
            <div class="menu-image"></div>
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
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
            <div class="menu-image"></div>
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
      this.$store.commit('setSearchText', `type:PLATER category:${item.id}`)
      this.$router.push('/plater/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: Plater '
    }
  },
  computed: {
    aClasses: function () {
      const cats = window.Categories.classCategories()
      const n = cats.length / 3
      return [[...cats.splice(0, Math.ceil(n))], [...cats.splice(0, Math.round(n))], [...cats]]
    },
    roles: function () {
      return window.Categories.getCategories(['role1', 'role2', 'role3'])
    },
    plater: function () {
      return window.Categories.getCategories(['plater1', 'plater2', 'plater3', 'plater4', 'plater5', 'plater6'])
    },
    content: function () {
      return window.Categories.getCategories(['platerpvp', 'platerdungeons', 'platerraidzuldazar', 'platerraidcrucible', 'platerraideternalpalace', 'platerraidnyalotha', 'platerraiduldir', 'platerutilities'])
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'Plater',
      description: this.$t('Browse Plater imports')
    })
    this.http.get('/search/menu', {view: 'Plater'})
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

#search-plater .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-plater a { margin-right: 12px }
#search-plater .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-plater .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-plater .md-list-text-container > a, #search-plater .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-plater .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-plater .md-layout { align-items: flex-start}

#search-plater .md-subheader { width: 100% }
#search-plater .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
