<template>
    <div id="search-weakaura">
      <md-layout md-row class="addon-name nowrap">
        <div class="grow">
          <md-layout md-row>
            <md-avatar class='square'><category-image :group="'t-weakaura'"></category-image></md-avatar>
            <h2 id="addon-name">WeakAuras -
              <span>{{ $t('The War Within') }}</span>
            </h2>
          </md-layout>
          <addon-info game="wow" addon="weakaura" expansion="tww"></addon-info>
        </div>
      </md-layout>
      <md-layout>
        <md-layout>
          <md-subheader>{{ $t("Classes") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a :href="'/the-war-within-weakauras/' + cls.slug" @click.prevent="searchRoute(cls)">{{ cls.text }}</a>
                <span>
                  <a v-for="spec in cls.specs" v-bind:key="spec.id" :href="'/the-war-within-weakauras/' + spec.slug"
                    @click.prevent="searchRoute(spec)">{{ spec.text.replace(cls.text, '').trim() }}</a>
                </span>
              </div>
            </md-list-item>
          </md-list>
        </md-layout>
        <md-layout>
          <md-subheader>{{ $t("The War Within PvE") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item v-for="raid in raids" v-bind:key="raid.id" :class="raid.id + ' md-inset'">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a :href="'/the-war-within-weakauras/' + raid.slug" @click.prevent="searchRoute(raid)">{{ raid.text }}</a>
                <span>
                  <template v-for="boss in raid.bosses">
                    <a v-if="boss.slug" v-bind:key="boss.id" :href="'/the-war-within-weakauras/' + boss.slug"
                      @click.prevent="searchRoute(boss)">{{ boss.text }}</a>
                    <span v-else-if="boss.subheader" v-bind:key="'header'+boss.id" class="subsection">{{ boss.text }}</span>
                  </template>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
          <md-subheader>{{ $t("PvP") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset pvp">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/pvp" @click.prevent="searchRoute('pvp')">{{ $t("PvP") }}</a>
                <span>
                  <a v-for="item in pvp" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
        </md-layout>
        <md-layout>
          <advert ad="video-sidebar" />
          <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset role0">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/class-roles" @click.prevent="searchRoute('role0')">{{ $t("Class Roles")
                }}</a>
                <span>
                  <a v-for="item in roles" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
  
            <md-list-item class="md-inset mech">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/combat-mechanics" @click.prevent="searchRoute('mech')">{{ $t("Combat Mechanics") }}</a>
                <span>
                  <a v-for="item in mechanics" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
  
            <md-list-item class="md-inset equip">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/equipment" @click.prevent="searchRoute('equip')">{{ $t("Equipment") }}</a>
                <span>
                  <a v-for="item in equip" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
  
            <md-list-item class="md-inset accessibility">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/accessibility" @click.prevent="searchRoute('accessibility')">{{
                  $t("Accessibility") }}</a>
                <span>
                  <a v-for="item in accessibility" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
  
            <md-list-item class="md-inset gen0">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/general" @click.prevent="searchRoute('gen0')">{{ $t("General") }}</a>
                <span>
                  <a v-for="item in misc" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
          <md-subheader>{{ $t("Professions") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.id + ' md-inset'">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a :href="'/the-war-within-weakauras/' + prof.slug" @click.prevent="searchRoute(prof)">{{ prof.text }}</a>
                <span>
                  <a v-for="spec in prof.specs" v-bind:key="spec.id" :href="'/the-war-within-weakauras/' + spec.slug"
                    @click.prevent="searchRoute(spec)">{{ spec.text }}</a>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
          <md-subheader>{{ $t("Custom Code") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item class="md-inset gen5">
              <div class="menu-image"></div>
              <div class="md-list-text-container">
                <a href="/the-war-within-weakauras/development" @click.prevent="searchRoute('gen5')">{{ $t("Development")
                }}</a>
                <span>
                  <a v-for="item in development" v-bind:key="item.id" :href="'/the-war-within-weakauras/' + item.slug"
                    @click.prevent="searchRoute(item)">{{ item.text }}</a>
                </span>
              </div>
            </md-list-item>
          </md-list>
  
          <md-subheader>{{ $t("Other Expansions") }}</md-subheader>
          <md-list class="md-double-line md-dense">
            <md-list-item class="raidaberrus md-inset'">
              <div class="menu-image" style="align-self:center"></div>
              <div class="md-list-text-container">
                <router-link to="/dragonflight-weakauras/">{{ $t('Dragonflight') }}</router-link>
              </div>
            </md-list-item>
            <md-list-item class="torghast md-inset'">
              <div class="menu-image" style="align-self:center"></div>
              <div class="md-list-text-container">
                <router-link to="/shadowlands-weakauras/">{{ $t('Shadowlands') }}</router-link>
              </div>
            </md-list-item>
            <md-list-item class="raidnyalotha md-inset'">
              <div class="menu-image" style="align-self:center"></div>
              <div class="md-list-text-container">
                <router-link to="/bfa-weakauras/">{{ $t('Battle for Azeroth') }}</router-link>
              </div>
            </md-list-item>
            <md-list-item class="raidantorus md-inset'">
              <div class="menu-image" style="align-self:center"></div>
              <div class="md-list-text-container">
                <router-link to="/legion-weakauras/">{{ $t('Legion') }}</router-link>
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
    props: ['contextGame'],
    methods: {
      runSearch: function () {
        this.$store.commit('userSearchOption', { field: 'expansion', value: 'sl' })
        this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
      },
      searchRoute: function (item) {
        this.$store.commit('userSearchOption', { field: 'expansion', value: 'sl' })
        if (typeof item === 'string') {
          item = window.Categories.match(item)
        }
        this.$store.commit('setSearchText', `category:${item.id}`)
        this.$router.push('/the-war-within-weakauras/' + item.slug)
      }
    },
    data: function () {
      return {
        searchString: 'Type: WeakAura ',
        isBeta: true
      }
    },
    watch: {
      isBeta: function (val) {
        // little hack to show switch animation
        if (!val) {
          var router = this.$router
          setTimeout(function () {
            router.push('/shadowlands-weakauras')
          }, 150)
        }
      }
    },
    computed: {
      classes: function () {
        return window.Categories.classCategories('WEAKAURA', 'tww')
      },
      raids: function () {
        return window.Categories.raidCategories(['manaforgeomega', 'liberationofundermine', 'raidnerubarpalace', 'twwdungeon'])
      },
      misc: function () {
        return window.Categories.getCategories(['gen1', 'gen7', 'gen2', 'gen6', 'gen9', 'gen10', 'gen11', 'gen12', 'gen13', 'gen8', 'gen15', 'gen19', 'gen20', 'gen21'], null)
      },
      roles: function () {
        return window.Categories.getCategories(['role4', 'role1', 'role2', 'role3'])
      },
      pvp: function () {
        return window.Categories.getCategories([/^(arena|bg|wpvp1?)$/], null)
      },
      mechanics: function () {
        return window.Categories.getCategories([/^mech[\d]+/], null)
      },
      equip: function () {
        return window.Categories.getCategories([/^equip[12]+/, 'legen'], null)
      },
      accessibility: function () {
        return window.Categories.getCategories([/^accessibility[\d]+/], null)
      },
      professions: function () {
        return window.Categories.professionCategories('WEAKAURA', 'tww')
      },
      development: function () {
        return window.Categories.getCategories(['gen5', 'gen3', 'gen4'])
      },
      snippets: function () {
        return window.Categories.getCategories(['snip1', 'snip2'])
      }
    },
    mounted: function () {
      this.$store.commit('setPageInfo', {
        title: 'WeakAuras',
        description: this.$t('Browse WeakAura imports')
      })
      if (this.contextGame) {
        this.game = this.contextGame
      }
      else if (this.$store.state.user && this.$store.state.user.config && this.$store.state.user.config.searchOptions.expansion === 'classic') {
        this.game = 'classic'
      }
      else {
        this.game = 'sl'
      }
      this.http.get('/search/menu', { view: 'WeakAuras-TWW' })
    }
  }
  </script>
  
  <style scoped lang="scss">
  .addon-name {
    .md-avatar {
      margin: 16px;
      border-radius: 4px;
    }
  
    h2 {
      margin: 16px 0 0 0;
      line-height: 40px
    }
  }
  
  .nowrap {
    flex-wrap: nowrap
  }
  
  h2 .faded {
    opacity: .3
  }
  
  h2 span {
    font-size: 80%;
    cursor: pointer
  }
  
  #searchForm {
    padding: 16px;
    flex: 1
  }
  
  #searchForm button {
    margin-top: -3px
  }
  
  #addon-name .md-theme-default.md-switch {
    margin: 0 8px;
    zoom: 0.8
  }
  
  #addon-name .md-theme-default.md-switch.md-checked .md-switch-container {
    background-color: rgba(0, 0, 0, 0.38);
  }
  
  #addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {
    background-color: #fafafa;
  }
  
  #search-weakaura .md-list-item img {
    height: 48px;
    padding-right: 16px;
    vertical-align: top
  }
  
  #search-weakaura a {
    margin-right: 12px
  }
  
  #search-weakaura li.md-list-item.md-inset {
    padding-left: 24px;
    flex-wrap: wrap;
    padding-bottom: 16px
  }
  
  #search-weakaura .md-list-text-container a {
    white-space: nowrap;
    display: inline-block
  }
  
  #search-weakaura .md-list-text-container>a,
  #search-weakaura .md-list-text-container>.parent-category {
    font-size: 18px;
    font-weight: bold;
    line-height: 19px;
  }
  
  #search-weakaura .md-list-text-container span {
    white-space: normal;
    line-height: 22px
  }
  
  #search-weakaura .md-layout {
    align-items: flex-start
  }
  
  #search-weakaura .md-subheader {
    width: 100%
  }
  
  #search-weakaura .md-subheader+.md-list {
    width: 100%
  }
  
  span.subsection {
    display: block
  }
  
  .md-list:after {
    background-color: transparent !important
  }
  
  #search-weakaura .wago-ad-container {
    max-width: 260px;
    background: none;
    box-shadow: none;
    min-height: 160px;
    #video-sidebar {
      min-height: auto
    }
  }
  </style>
  