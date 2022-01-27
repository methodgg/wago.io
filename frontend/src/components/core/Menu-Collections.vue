<template>
  <div id="search-collections">
    <md-layout md-row class="addon-name nowrap">
      <div class="grow">
        <md-layout md-row>
          <md-avatar class='square'><category-image :group="'t-collection'"></category-image></md-avatar>
          <h2 id="addon-name">Collections</h2>
        </md-layout>
        <addon-info addon="collection"></addon-info>
      </div>
    </md-layout>
    <md-layout>
      <md-layout>
        <md-subheader>{{ $t("Classes") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="cls in classes" v-bind:key="cls.id" :class="cls.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + cls.slug">{{ cls.text }}</router-link>
              <span>
                <router-link v-for="spec in cls.specs" v-bind:key="spec.id" :to="'/collections/' + spec.slug">{{ spec.text.replace(cls.text, '').trim() }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>{{ $t("PvE Content") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-bind:key="shadowlandsRaids[0].id" :class="shadowlandsRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + shadowlandsRaids[0].slug">{{ $t('Shadowlands') }}</router-link>
              <span>
                <router-link v-for="item in shadowlandsRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
          <md-list-item v-bind:key="tbcRaids[0].id" :class="tbcRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + tbcRaids[0].slug">{{ $t('Burning Crusade Classic') }}</router-link>
              <span>
                <router-link v-for="item in tbcRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
          <md-list-item v-bind:key="classicRaids[0].id" :class="classicRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + classicRaids[0].slug">{{ $t('Classic') }}</router-link>
              <span>
                <router-link v-for="item in classicRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Legacy Content") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-bind:key="bfaRaids[0].id" :class="bfaRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + bfaRaids[0].slug">{{ $t('Battle for Azeroth') }}</router-link>
              <span>
                <router-link v-for="item in bfaRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
          <md-list-item v-bind:key="legionRaids[0].id" :class="legionRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + legionRaids[0].slug">{{ $t('Legion') }}</router-link>
              <span>
                <router-link v-for="item in legionRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
          <md-list-item v-bind:key="wodRaids[0].id" :class="wodRaids[0].id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + wodRaids[0].slug">{{ $t('Legion') }}</router-link>
              <span>
                <router-link v-for="item in wodRaids" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("PvP") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset pvp">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/collections/pvp">{{ $t("PvP") }}</router-link>
              <span>
                <router-link v-for="item in pvp" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>

      <md-layout>
        <md-subheader>{{ $t("Miscellaneous") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset role0">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to='/collections/class-roles'>{{ $t("Class Roles") }}</router-link>
              <span>
                <router-link v-for="item in roles" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset mech">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to='/collections/combat-mechanics'>{{ $t("Combat Mechanics") }}</router-link>
            </div>
          </md-list-item>

          <md-list-item class="md-inset equip">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to='/collections/equipment'>{{ $t("Equipment") }}</router-link>
              <span>
                <router-link v-for="item in equip" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset gen0">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to='/collections/other'>{{ $t("General") }}</router-link>
              <span>
                <router-link v-for="item in misc" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Professions") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="prof in professions" v-bind:key="prof.id" :class="prof.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/collections/' + prof.slug">{{ prof.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>

        <md-subheader>{{ $t("Custom Code") }}</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item class="md-inset gen5">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/collections/development">{{ $t("Development") }}</router-link>
              <span>
                <router-link v-for="item in development" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>

          <md-list-item class="md-inset snip0">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link to="/collections/snippets">{{ $t("Code Snippets") }}</router-link>
              <span>
                <router-link v-for="item in snippets" v-bind:key="item.id" :to="'/collections/' + item.slug">{{ item.text }}</router-link>
              </span>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
    </md-layout>
    <div></div>
  </div>
</template>

<script>
import AddonInfoBox from '../UI/AddonInfoBox.vue'
import CategoryImage from '../UI/CategoryImage.vue'
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
      this.$store.commit('setSearchText', `type:COLLECTION category:${item.id}`)
      this.$router.push('/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: Collection '
    }
  },
  computed: {
    classes: function () {
      return window.Categories.classCategories()
    },
    shadowlandsRaids: function () {
      return window.Categories.raidCategories(['raidsepulcherfirst', 'raidsantumdom', 'raidnathria', 'sldungeon'])
    },
    bfaRaids: function () {
      return window.Categories.raidCategories(['raideternalpalace', 'raidcrucible', 'raidzuldazar', 'raiduldir', 'bfadungeon'])
    },
    legionRaids: function () {
      return window.Categories.raidCategories(['raidantorus', 'raidtomb', 'raidnh', 'dungeon'])
    },
    tbcRaids: function () {
      return window.Categories.raidCategories(['raidbt', 'raidsw', 'raidmthyjal', 'raidssc', 'raidtk', 'raidgruul', 'raidkarazhan', 'tbcdungeon'])
    },
    classicRaids: function () {
      return window.Categories.raidCategories(['raidnaxxramas', 'raidtempleaq', 'raidruinsaq', 'raidzulgurub', 'raidblackwinglair', 'raidmoltencore', 'classicdungeon'])
    },
    wodRaids: function () {
      return window.Categories.raidCategories(['raidtov', 'raiden', 'raidhfc'])
    },
    misc: function () {
      return window.Categories.getCategories(['gen1', 'gen7', 'gen2', 'gen6', 'gen9', 'gen10', 'gen11', 'gen12', 'gen14', 'gen13', 'gen8'])
    },
    roles: function () {
      return window.Categories.getCategories(['role4', 'role1', 'role2', 'role3'])
    },
    pvp: function () {
      return window.Categories.getCategories([/^(arena|bg|wpvp1?)$/], null)
    },
    mechanics: function () {
      return window.Categories.getCategories([/^mech[\d]+/])
    },
    equip: function () {
      return window.Categories.getCategories([/^equip[\d]+/, 'legen'])
    },
    professions: function () {
      return window.Categories.professionCategories()
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
      title: 'Collections',
      description: this.$t('Browse Collections')
    })
    this.http.get('/search/menu', {view: 'Collections'})
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

#search-collections .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-collections a { margin-right: 12px }
#search-collections .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-collections .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-collections .md-list-text-container > a, #search-collections .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-collections .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-collections .md-layout { align-items: flex-start}

#search-collections .md-subheader { width: 100% }
#search-collections .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
