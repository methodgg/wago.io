<template>
  <div id="search-weakaura">
    <form novalidate @submit.stop.prevent="runSearch(searchString)" id="searchForm">
      <md-input-container>
        <label>{{ $t("Search") }}</label>
        <md-input v-model="searchString" ref="searchInput"></md-input>
        <md-button @click="runSearch(searchString)" :disabled="searchString.length<3">{{ $t("Search") }}</md-button>
      </md-input-container>
    </form>
    <md-layout>
      <md-layout>
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.cls + ' md-inset'">
            <category-image :group="cls.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link  v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/weakauras/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Battle for Azeroth PvE") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in raids" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + raid.slug">{{ raid.text }}</router-link>
              <span>
                <router-link  v-for="boss in raid.bosses" v-bind:key="boss.id" :to="'/weakauras/' + boss.slug">{{ boss.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PvP") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="item in pvp" v-bind:key="item.id" :class="item.cls + ' md-inset'">
            <category-image :group="item.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              <span>
                <router-link v-for="zone in item.bosses" v-bind:key="zone.id" :to="'/weakauras/' + zone.slug">{{ zone.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PTR") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in ptr" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + raid.slug">{{ raid.text }}</router-link>
              <span>
                <router-link  v-for="boss in raid.bosses" v-bind:key="boss.id" :to="'/weakauras/' + boss.slug">{{ boss.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset roles">
            <category-image group="role"></category-image>
            <div class="md-list-text-container">
              <router-link to='/weakauras/class-roles'>{{ $t("Class Roles") }}</router-link>
              <span>
                <router-link v-for="item in roles" v-bind:key="item.id" :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset mechanics">
            <category-image group="mechanics"></category-image>
            <div class="md-list-text-container">
              <router-link to='/weakauras/combat-mechanics'>{{ $t("Combat Mechanics") }}</router-link>
              <span>
                <router-link v-for="item in mechanics" v-bind:key="item.id" :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset equip">
            <category-image group="equip"></category-image>
            <div class="md-list-text-container">
              <router-link to='/weakauras/equipment'>{{ $t("Equipment") }}</router-link>
              <span>
                <router-link v-for="item in equip" v-bind:key="item.id" :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset misc">
            <category-image group="misc"></category-image>
            <div class="md-list-text-container">
              <router-link to='/weakauras/other'>{{ $t("General") }}</router-link>
              <span>
                <router-link v-for="item in misc" v-bind:key="item.id" :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Professions") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.cls + ' md-inset'">
            <category-image :group="prof.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + prof.slug">{{ prof.text }}</router-link>
              <span>
                <router-link  v-for="spec in prof.specs" v-bind:key="spec.id" :to="'/weakauras/' + spec.slug">{{ spec.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("Custom Code") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset development">
            <category-image group="development"></category-image>
            <div class="md-list-text-container">
              <router-link to="/weakauras/development">{{ $t("Development") }}</router-link>
              <span>
                <router-link v-for="item in development" v-bind:key="item.id" :to="'/weakauras/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset snippets">
            <category-image group="snippets"></category-image>
            <div class="md-list-text-container">
              <router-link to="/snippets">{{ $t("Code Snippets") }}</router-link>
              <span>
                <router-link v-for="item in snippets" v-bind:key="item.id" :to="'/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Legacy Content") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in legacy" v-bind:key="raid.id" :class="raid.cls + ' md-inset'">
            <category-image :group="raid.cls"></category-image>
            <div class="md-list-text-container">
              <router-link :to="'/weakauras/' + raid.slug">{{ raid.text }}</router-link>
              <span>
                <router-link v-for="boss in raid.bosses" v-bind:key="boss.id" :to="'/weakauras/' + boss.slug">{{ boss.text }}</router-link>
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
      searchString: 'Type: WeakAura '
    }
  },
  computed: {
    categories: function () {
      return categories.categories(this.$t)
    },
    classes: function () {
      return categories.classCategories(this.$t)
    },
    raids: function () {
      return categories.raidCategories(['raidcrucible', 'raidzuldazar', 'bfadungeon'], this.$t)
    },
    ptr: function () {
      return categories.raidCategories(['raideternalpalace'], this.$t)
    },
    misc: function () {
      return categories.getCategories(['gen1', 'gen7', 'gen2', 'gen6', 'gen9', 'gen10', 'gen11', 'gen12', 'gen14', 'gen13', 'gen8', 'gen15', 'gen16', 'gen17'], this.$t)
    },
    roles: function () {
      return categories.getCategories(['role4', 'role1', 'role2', 'role3'], this.$t)
    },
    pvp: function () {
      return categories.raidCategories(['arena', 'bg', 'wpvp'], this.$t)
    },
    mechanics: function () {
      return categories.getCategories([/^mech[\d]+/], this.$t)
    },
    equip: function () {
      return categories.getCategories([/^equip[\d]+/, 'legen'], this.$t)
    },
    professions: function () {
      return categories.professionCategories(this.$t)
    },
    development: function () {
      return categories.getCategories(['gen5', 'gen3', 'gen4'], this.$t)
    },
    snippets: function () {
      return categories.getCategories(['snip1', 'snip2'], this.$t)
    },
    legacy: function () {
      return categories.getCategories(['raiduldir', 'raidantorus', 'raidtomb', 'raidnh', 'raidtov', 'raiden', 'dungeon', 'raidhfc'], this.$t, true)
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
#searchForm { padding: 16px }
#searchForm button { margin-top: -3px }

#search-weakaura .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-weakaura a { margin-right: 12px }
#search-weakaura .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-weakaura .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-weakaura .md-list-text-container > a, #search-weakaura .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-weakaura .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-weakaura .md-layout { align-items: flex-start}

#search-weakaura .md-subheader { width: 100% }
#search-weakaura .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
