<template>
  <div id="search-weakaura">
    <md-layout md-row class="addon-name nowrap">
      <div class="grow">
        <md-layout md-row>
          <md-avatar class='square'><category-image :group="'t-weakaura'"></category-image></md-avatar>
          <h2 id="addon-name">WeakAuras -
            <span>{{ $t('Wrath of the Lich King Classic') }}</span>
          </h2>
        </md-layout>
        <addon-info game="wow" addon="weakaura" expansion="wotlk"></addon-info>
      </div>
    </md-layout>
    <md-layout>
      <md-layout>
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a :href="'/wotlk-weakauras/' + cls.slug" @click.prevent="searchRoute(cls)">{{ cls.text }}</a>
              <span>
                <a v-for="spec in cls.specs" v-bind:key="spec.id" :href="'/wotlk-weakauras/' + spec.slug" @click.prevent="searchRoute(spec)">{{ spec.text.replace(cls.text, '').trim() }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Professions") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a :href="'/wotlk-weakauras/' + prof.slug" @click.prevent="searchRoute(prof)">{{ prof.text }}</a>
              <span>
                <a v-for="spec in prof.specs" v-bind:key="spec.id" :href="'/wotlk-weakauras/' + spec.slug" @click.prevent="searchRoute(spec)">{{ spec.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>

      <md-layout>
        <md-subheader>{{ $t("Wrath of the Lich King PvE") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in wotlkRaids" v-bind:key="raid.id" :class="raid.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a :href="'/wotlk-weakauras/' + raid.slug" @click.prevent="searchRoute(raid)">{{ raid.text }}</a>
              <span>
                <a v-for="boss in raid.bosses" v-bind:key="boss.id" :href="'/wotlk-weakauras/' + boss.slug" @click.prevent="searchRoute(boss)">{{ boss.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
        <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset role0">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/roles" @click.prevent="searchRoute('role0')">{{ $t("Class Roles") }}</a>
              <span>
                <a v-for="item in roles" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset mech">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/mechanics" @click.prevent="searchRoute('mech')">{{ $t("Combat Mechanics") }}</a>
              <span>
                <a v-for="item in mechanics" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset equip">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/equipment" @click.prevent="searchRoute('equipment')">{{ $t("Equipment") }}</a>
              <span>
                <a v-for="item in equip" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset accessibility">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/dragonflight-weakauras/accessibility" @click.prevent="searchRoute('accessibility')">{{ $t("Accessibility") }}</a>
              <span>
                <a v-for="item in accessibility" v-bind:key="item.id" :href="'/dragonflight-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset gen0">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/general" @click.prevent="searchRoute('gen0')">{{ $t("General") }}</a>
              <span>
                <a v-for="item in misc" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="raid in wotlkRaids2" v-bind:key="raid.id" :class="raid.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a :href="'/wotlk-weakauras/' + raid.slug" @click.prevent="searchRoute(raid)">{{ raid.text }}</a>
              <span>
                <a v-for="boss in raid.bosses" v-bind:key="boss.id" :href="'/wotlk-weakauras/' + boss.slug" @click.prevent="searchRoute(boss)">{{ boss.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PvP") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset pvp">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/pvp" @click.prevent="searchRoute('pvp')">{{ $t("PvP") }}</a>
              <span>
                <a v-for="item in pvp" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Custom Code") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset gen5">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <a href="/wotlk-weakauras/development" @click.prevent="searchRoute('gen5')">{{ $t("Development") }}</a>
              <span>
                <a v-for="item in development" v-bind:key="item.id" :href="'/wotlk-weakauras/' + item.slug" @click.prevent="searchRoute(item)">{{ item.text }}</a>
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
  props: ['contextGame'],
  methods: {
    runSearch: function () {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'wotlk'})
      this.$router.push('/search/' + this.searchString.trim().replace(/\s+/g, '+'))
    },
    searchRoute: function (item) {
      this.$store.commit('userSearchOption', {field: 'expansion', value: 'wotlk'})
      if (typeof item === 'string') {
        item = window.Categories.match(item)
      }
      this.$store.commit('setSearchText', `category:${item.id}`)
      this.$router.push('/wotlk-weakauras/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: WeakAura '
    }
  },
  computed: {
    classes: function () {
      return window.Categories.classCategories('WEAKAURA', 'wotlk')
    },
    wotlkRaids: function () {
      return window.Categories.raidCategories(['raidnaxxramas', 'raidulduar', 'raidtoc', 'raidicc'])
    },
    wotlkRaids2: function () {
      return window.Categories.raidCategories(['raidvoa', 'raidsarth', 'raidmalygos', 'raidonyxia', 'raidhalion', 'wotlkdungeon'])
    },
    misc: function () {
      return window.Categories.getCategories(['gen1', 'gen7', 'gen2', 'gen6', 'gen9', 'gen10', 'gen11', 'gen12', 'gen14', 'gen13', 'gen8', 'gen15', 'gen16', 'gen17'], null, 'WEAKAURA', 'wotlk')
    },
    roles: function () {
      return window.Categories.getCategories(['role4', 'role1', 'role2', 'role3'])
    },
    pvp: function () {
      return window.Categories.getCategories([/^(arena|bg|wpvp1?|wintergrasp)$/], null, 'WEAKAURA', 'wotlk')
    },
    mechanics: function () {
      return window.Categories.getCategories([/^mech[\d]+/], null, 'WEAKAURA', 'wotlk')
    },
    equip: function () {
      return window.Categories.getCategories([/^equip[\d]+/, 'legen'], null, 'WEAKAURA', 'wotlk')
    },
    professions: function () {
      return window.Categories.professionCategories('WEAKAURA', 'wotlk')
    },
    accessibility: function () {
      return window.Categories.getCategories([/^accessibility[\d]+/], null)
    },
    development: function () {
      return window.Categories.getCategories(['gen5', 'gen3', 'gen4'])
    },
    snippets: function () {
      return window.Categories.getCategories(['snip1', 'snip2'])
    },
    legacy: function () {
      return window.Categories.getCategories(['raiduldir', 'raidantorus', 'raidtomb', 'raidnh', 'raidtov', 'raiden', 'dungeon', 'raidhfc'], true)
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'WeakAuras',
      description: this.$t('Browse WeakAura imports')
    })
    this.http.get('/search/menu', {view: 'WeakAuras-wotlk'})
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
