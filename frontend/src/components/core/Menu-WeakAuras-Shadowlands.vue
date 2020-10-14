<template>
  <div id="search-weakaura">
    <md-layout md-row>
      <h2 id="addon-name">WeakAuras -
        <span>{{ $t('Shadowlands') }}</span>
      </h2>
    </md-layout>
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
        <md-subheader>{{ $t("Shadowlands PvE") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in raids" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(raid.slug)">{{ raid.text }}</a>
              <span>
                <a  v-for="boss in raid.bosses" v-bind:key="boss.id" href="#" @click.prevent="searchRoute(boss.slug)">{{ boss.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PvP") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset pvp">
            <category-image group="pvp-arena"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('pvp')">{{ $t("PvP") }}</a>
              <span>
                <a v-for="item in pvp" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <!--<md-subheader>{{ $t("PTR") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in ptr" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute(raid.slug)">{{ raid.text }}</a>
              <span>
                <a v-for="boss in raid.bosses" v-bind:key="boss.id" href="#" @click.prevent="searchRoute(boss.slug)">{{ boss.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
        -->

      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset roles">
            <category-image group="role"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('class-roles')">{{ $t("Class Roles") }}</a>
              <span>
                <a v-for="item in roles" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset mechanics">
            <category-image group="mechanics"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('combat-mechanics')">{{ $t("Combat Mechanics") }}</a>
              <span>
                <a v-for="item in mechanics" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset equip">
            <category-image group="equip"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('equipment')">{{ $t("Equipment") }}</a>
              <span>
                <a v-for="item in equip" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset misc">
            <category-image group="misc"></category-image>
            <div class="md-list-text-container">
              <a href="#" @click.prevent="searchRoute('general')">{{ $t("General") }}</a>
              <span>
                <a v-for="item in misc" v-bind:key="item.id" href="#" @click.prevent="searchRoute(item.slug)">{{ item.text }}</a>
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
          <md-list-item class="nyalotha md-inset'">
            <category-image group="nyalotha"></category-image>
            <div class="md-list-text-container">
              <router-link to="/bfa-weakauras/">{{ $t('Battle for Azeroth') }}</router-link>
            </div>
          </md-list-item>
          <md-list-item class="antorus md-inset'">
            <category-image group="antorus"></category-image>
            <div class="md-list-text-container">
              <router-link to="/legion-weakauras/">{{ $t('Legion') }}</router-link>
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
  props: ['contextGame'],
  methods: {
    runSearch: function () {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'sl'})
      this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    },
    searchRoute: function (slug) {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'sl'})
      this.$router.push('/shadowlands-weakauras/' + slug)
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
          router.push('/bfa-weakauras')
        }, 150)
      }
    }
  },
  computed: {
    categories: function () {
      return categories.categories(this.$t)
    },
    classes: function () {
      return categories.classCategories(this.$t, 'WEAKAURA', 'sl')
    },
    raids: function () {
      return categories.raidCategories(['raidnathria', 'torghast', 'sldungeon'], this.$t)
    },
    misc: function () {
      return categories.getCategories(['gen1', 'gen7', 'gen2', 'gen6', 'gen9', 'gen10', 'gen11', 'gen12', 'gen13', 'gen8', 'gen15', 'gen18'], this.$t, null)
    },
    roles: function () {
      return categories.getCategories(['role4', 'role1', 'role2', 'role3'], this.$t)
    },
    pvp: function () {
      return categories.getCategories([/^(arena|bg|wpvp1?)$/], this.$t, null)
    },
    mechanics: function () {
      return categories.getCategories([/^mech[\d]+/], this.$t, null)
    },
    equip: function () {
      return categories.getCategories([/^equip[12]+/, 'legen'], this.$t, null)
    },
    professions: function () {
      return categories.professionCategories(this.$t, 'WEAKAURA', 'shadowlands')
    },
    development: function () {
      return categories.getCategories(['gen5', 'gen3', 'gen4'], this.$t)
    },
    snippets: function () {
      return categories.getCategories(['snip1', 'snip2'], this.$t)
    }
  },
  mounted: function () {
    this.$refs.searchInput.$el.focus()
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
    this.http.get('/search/menu', {view: 'WeakAuras-Shadowlands'})
  }
}
</script>

<style>
h2#addon-name {margin: 16px 0 0 16px;}
h2 .faded {opacity: .3}
h2 span {font-size:80%; cursor: pointer}
#searchForm { padding: 16px; flex: 1 }
#searchForm button { margin-top: -3px }

#addon-name .md-theme-default.md-switch {margin: 0 8px; zoom:0.8}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-container {background-color: rgba(0, 0, 0, 0.38);}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {background-color: #fafafa;}

#search-weakaura .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-weakaura a { margin-right: 12px }
#search-weakaura .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-weakaura .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-weakaura .md-list-text-container > a, #search-weakaura .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-weakaura .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-weakaura .md-layout { align-items: flex-start}
#search-weakaura .md-layout > .md-layout {max-width:450px}

#search-weakaura .md-subheader { width: 100% }
#search-weakaura .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
