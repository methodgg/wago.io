<template>
    <div id="search-macro">
      <md-layout md-row class="addon-name nowrap">
        <div class="grow">
          <md-layout md-row>
            <md-avatar class='square'><category-image :group="'t-macro'"></category-image></md-avatar>
            <h2 id="addon-name">Macro</h2>
          </md-layout>
          <addon-info game="wow" addon="macro"></addon-info>
        </div>
      </md-layout>
      <md-subheader>{{ $t("Classes") }}</md-subheader>
      <md-layout>        
        <md-layout v-for="(classes, index) in aClasses" v-bind:key="index">
            <advert ad="video-sidebar" v-if="index == 2" />
            <md-list class="md-double-line md-dense">
            <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
                <div class="menu-image"></div>
                <div class="md-list-text-container">
                <router-link :to="'/macros/' + cls.slug">{{ cls.text }}</router-link>
                <span>
                    <router-link v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/macros/' + spec.slug">{{
                    spec.text.replace(cls.text, '').trim() }}</router-link>
                </span>
                </div>
            </md-list-item>
            </md-list>
        </md-layout>
    </md-layout>
    <md-layout>    
        <div>
            <md-subheader>{{ $t("Utility") }}</md-subheader>
            <md-layout>
                <md-list class="md-double-line md-dense">
                    <md-list-item class="md-inset macro0">
                    <div class="menu-image"></div>
                    <div class="md-list-text-container">
                        <router-link to="/macros/utility">{{ $t("Utility") }}</router-link>
                        <span>
                        <router-link v-for="(item, index) in utility" :to="'/macros/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
                        </span>
                    </div>
                    </md-list-item>
                </md-list>
            </md-layout>
        </div>
        <div>
            <md-subheader>{{ $t("Targeting") }}</md-subheader>
            <md-layout>
                <md-list class="md-double-line md-dense">
                    <md-list-item class="md-inset macro4">
                    <div class="menu-image"></div>
                    <div class="md-list-text-container">
                        <router-link to="/macros/targeting">{{ $t("Targeting") }}</router-link>
                        <span>
                        <router-link v-for="(item, index) in targeting" :to="'/macros/' + item.slug" v-bind:key="index">{{ item.text }}</router-link>
                        </span>
                    </div>
                    </md-list-item>
                </md-list>
            </md-layout>
        </div>
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
        this.$router.push('/macros/' + item.slug)
      }
    },
    data: function () {
      return {
        searchString: 'Type: macro '
      }
    },
    computed: {
        aClasses: function () {
            const cats = window.Categories.classCategories('MACRO')
            const n = cats.length / 3
            return [[...cats.splice(0, Math.ceil(n))], [...cats.splice(0, Math.round(n))], [...cats]]
        },
        utility: function () {
            return window.Categories.getCategories(['macro1', 'macro2', 'macro3', 'macro4'])
        },
        targeting: function () {
            return window.Categories.getCategories(['macro5', 'macro6'])
        }
    },
    mounted: function () {
      this.$store.commit('setPageInfo', {
        title: 'Blizz HUD',
        description: this.$t('Browse Blizz HUD imports')
      })
      this.http.get('/search/menu', {view: 'macro'})
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
  
  #search-macro .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
  #search-macro a { margin-right: 12px }
  #search-macro .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
  #search-macro .md-list-text-container a { white-space: nowrap; display: inline-block }
  #search-macro .md-list-text-container > a, #search-macro .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
  #search-macro .md-list-text-container span{ white-space: normal; line-height: 22px}
  #search-macro .md-layout { align-items: flex-start}
  
  #search-macro .md-subheader { width: 100% }
  #search-macro .md-subheader + .md-list { width: 100% }
  .md-list:after { background-color: transparent!important }
  #search-collections .wago-ad-container {
    max-width: 260px;
    background: none;
    box-shadow: none;
    min-height: 160px;
    #video-sidebar {
      min-height: auto
    }
  }
  </style>
  