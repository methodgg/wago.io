<template>
    <div id="search-cell">
      <md-layout md-row class="addon-name nowrap">
        <div class="grow">
          <md-layout md-row>
            <md-avatar class='square'><category-image :group="'t-cell'"></category-image></md-avatar>
            <h2 id="addon-name">Cell</h2>
          </md-layout>
          <addon-info game="wow" addon="cell"></addon-info>
        </div>
      </md-layout>
      <md-layout>
        <md-layout>
          <md-subheader>Cell</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset cell1">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <router-link to="/cell">Cell</router-link>
                <span>
                  <router-link v-for="(item, index) in cell" :to="'/cell/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
          <md-subheader>{{ $t("Class Roles") }}</md-subheader>
          <md-list class="md-double-line md-dense">
  
            <md-list-item class="md-inset role0">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <router-link to="/cell/roles">{{ $t("Class Roles") }}</router-link>
                <span>
                  <router-link v-for="(item, index) in roles" :to="'/cell/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
                </span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout v-for="(classes, index) in aClasses" v-bind:key="index">
          <advert ad="video-sidebar" v-if="index===2"/>
          <md-subheader>{{ $t("Classes") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <router-link :to="'/cell/' + cls.slug">{{ cls.text }}</router-link>
                <span>
                  <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/cell/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
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
        this.$store.commit('setSearchText', `category:${item.id}`)
        this.$router.push('/cell/' + item.slug)
      }
    },
    data: function () {
      return {
        searchString: 'Type: Cell '
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
      cell: function () {
        return window.Categories.getCategories(['cell1', 'cell2', 'cell3', 'cell4', 'cell5', 'cell6', 'cell7'])
      }
    },
    mounted: function () {
      this.$store.commit('setPageInfo', {
        title: 'Cell',
        description: this.$t('Browse Cell imports')
      })
      this.http.get('/search/menu', {view: 'Cell'})
    }
  }
  </script>
  
  <style scoped lang="scss">
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
  
  #search-cell .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
  #search-cell a { margin-right: 12px }
  #search-cell li.md-list-item.md-inset { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
  #search-cell .md-list-text-container a { white-space: nowrap; display: inline-block }
  #search-cell .md-list-text-container > a, #search-cell .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
  #search-cell .md-list-text-container span{ white-space: normal; line-height: 22px}
  #search-cell .md-layout { align-items: flex-start}
  
  #search-cell .md-subheader { width: 100% }
  #search-cell .md-subheader + .md-list { width: 100% }
  .md-list:after { background-color: transparent!important }
  #search-cell .wago-ad-container {
    max-width: 260px; background: none; box-shadow: none; min-height: 160px;
    #video-sidebar {min-height: 160px}
  }
  </style>
  