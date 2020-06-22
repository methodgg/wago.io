<template>
  <div id="search-weakaura">    
    <h2 id="addon-name">WeakAuras - <span>Legion</span></h2>
    <md-layout>
      <addon-info addon="weakaura"></addon-info>
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
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(cls.slug)">{{ cls.text }}</a>
              <span>
                <a v-for="spec in cls.specs" v-bind:key="spec.id" href="#" @click.prevent="searchRoute(spec.slug)">{{ spec.text.replace(cls.text, '').trim() }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Legion PvE") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in raids" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(raid.slug)">{{ raid.text }}</a>
              <span>
                <a v-for="boss in raid.bosses" v-bind:key="boss.id" href="#" @click.prevent="searchRoute(boss.slug)">{{ boss.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset misc">
            <category-image group="misc"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('general')">{{ $t("General") }}</a>
              <span>
                <a v-for="item in misc" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
          
          <md-list-item class="md-inset roles">
            <category-image group="role"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('class-roles')">{{ $t("Class Roles") }}</a>
              <span>
                <a v-for="item in roles" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PvP") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="item in pvp" v-bind:key="item.id" :class="item.cls + ' md-inset'">
            <category-image :group="item.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              <span>
                <a v-for="zone in item.bosses" v-bind:key="zone.id" href="#" @click.prevent="searchRoute(zone.slug)">{{ zone.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Professions") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.cls + ' md-inset'">
            <category-image :group="prof.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(prof.slug)">{{ prof.text }}</a>
              <span>
                <a  v-for="spec in prof.specs" v-bind:key="spec.id" href="#" @click.prevent="searchRoute(spec.slug)">{{ spec.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>      

        <md-subheader>{{ $t("Custom Code") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset development">
            <category-image group="development"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('development')">{{ $t("Development") }}</a>
              <span>
                <a v-for="item in development" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Other Expansions") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <!--<md-list-item class="torghast md-inset'">
            <category-image group="torghast"></category-image>
            <div class="md-list-text-container">
              <router-link to="/shadowlands-weakauras/">{{ $t('Shadowlands') }}</router-link>
            </div>
          </md-list-item>-->
          <md-list-item class="nyalotha md-inset'">
            <category-image group="nyalotha"></category-image>
            <div class="md-list-text-container">
              <router-link to="/bfa-weakauras/">{{ $t('Battle for Azeroth') }}</router-link>
            </div>
          </md-list-item>
        </md-list>  

      </md-layout>
    </md-layout>
    <advert ad="wago728x90" fixed="bottom" />
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
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'legion'})
      this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    },
    searchRoute: function (slug) {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'legion'})
      this.$router.push('/legion-weakauras/' + slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: WeakAura '
    }
  },
  computed: {
    categories: function () {
      return categories.categories(this.$t)
    },
    classes: function () {
      return categories.classCategories(this.$t, 'WEAKAURA', 'legion')
    },
    raids: function () {
      return categories.raidCategories(['raidantorus', 'raidtomb', 'raidnh', 'raidtov', 'raiden', 'dungeon'], this.$t)
    },
    misc: function () {
      return categories.getCategories(['gen1', 'legen', 'gen7', 'gen2', 'gen6'], this.$t)
    },
    roles: function () {
      return categories.getCategories(['role4', 'role1', 'role2', 'role3'], this.$t)
    },
    pvp: function () {
      return categories.raidCategories(['arena', 'bg'], this.$t)
    },
    professions: function () {
      return categories.professionCategories(this.$t, 'WEAKAURA', 'legion')
    },
    development: function () {
      return categories.getCategories(['gen5', 'gen3', 'gen4'], this.$t)
    },
    snippets: function () {
      return categories.getCategories(['snip1', 'snip2'], this.$t)
    },
    legacy: function () {
      return categories.getCategories(['raidhfc'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
    this.$store.commit('setPageInfo', {
      title: 'WeakAuras',
      description: this.$t('Browse WeakAura imports')
    })
  }
}
</script>

<style>
h2#addon-name {margin: 16px 0 0 16px;}
h2#addon-name span {font-size: 80%}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#search-weakaura { margin-bottom: 90px}
#search-weakaura .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-weakaura a { margin-right: 12px }
#search-weakaura .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-weakaura .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-weakaura .md-list-text-container > a { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-weakaura .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-weakaura .md-layout { align-items: flex-start}
#search-weakaura .md-layout > .md-layout {max-width:450px}

#search-weakaura .md-subheader { width: 100% }
#search-weakaura .md-subheader + .md-list { width: 100% }
#search-weakaura .md-subheader + .md-list:after { background-color: transparent }
</style>
