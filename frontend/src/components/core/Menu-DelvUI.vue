<template>
  <div id="search-delvui">
    <md-layout md-row class="addon-name nowrap">
      <div class="grow">
        <md-layout md-row>
          <md-avatar class='square'><category-image :group="'t-delvui'"></category-image></md-avatar>
          <h2 id="addon-name">DelvUI</h2>
        </md-layout>
        <addon-info game="xiv" addon="delvui"></addon-info>
      </div>
    </md-layout>
    <md-layout md-row>
      <md-layout>
        <md-subheader><router-link to="/delvui/tank/">{{ $t("Tanks") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in tanks" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <img v-if="job.svg" class="menu-image" :src="'/static/image/menu' + job.svg">
            <div v-else class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader><router-link to="/delvui/healer/">{{ $t("Healers") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in healers" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader>DelvUI</md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="sys in delvuisys" v-bind:key="sys.id" :class="sys.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + sys.slug">{{ sys.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
    </md-layout>
    <md-layout md-row>
      <md-layout>
        <md-subheader><router-link to="/delvui/melee/">{{ $t("Melee DPS") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in melee" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader><router-link to="/delvui/magic/">{{ $t("Ranged Magical DPS") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in casters" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader><router-link to="/delvui/ranged/">{{ $t("Ranged Physical DPS") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in ranged" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <div class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
    </md-layout>
    <md-layout md-row>
      <md-layout>
        <md-subheader><router-link to="/delvui/crafting/">{{ $t("Crafting") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in crafters" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <img v-if="job.svg" class="menu-image" :src="'/static/image/menu' + job.svg">
            <div v-else class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader><router-link to="/delvui/gathering/">{{ $t("Gathering") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in gatherers" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <img v-if="job.svg" class="menu-image" :src="'/static/image/menu' + job.svg">
            <div v-else class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
            </div>
          </md-list-item>
        </md-list>
      </md-layout>
      <md-layout>
        <md-subheader><router-link to="/delvui/miscellaneous/">{{ $t("Miscellaneous") }}</router-link></md-subheader>
        <md-list class="md-double-line md-dense">
          <md-list-item v-for="job in misc" v-bind:key="job.id" :class="job.id + ' md-inset'">
            <img v-if="job.svg" class="menu-image" :src="'/static/image/menu' + job.svg">
            <div v-else class="menu-image"></div>
            <div class="md-list-text-container">
              <router-link :to="'/delvui/' + job.slug">{{ job.text }}</router-link>
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
      this.$router.push('/delvui/' + item.slug)
    }
  },
  data: function () {
    return {
      searchString: 'Type: DelvUI '
    }
  },
  computed: {
    tanks: function () {
      return window.Categories.getCategories(['job-pld', 'job-war', 'job-drk', 'job-gnb'])
    },
    healers: function () {
      return window.Categories.getCategories(['job-sch', 'job-whm', 'job-ast', 'job-sge'])
    },
    melee: function () {
      return window.Categories.getCategories(['job-mnk', 'job-drg', 'job-nin', 'job-sam', 'job-rpr'])
    },
    casters: function () {
      return window.Categories.getCategories(['job-blm', 'job-smn', 'job-rdm', 'job-blu'])
    },
    ranged: function () {
      return window.Categories.getCategories(['job-brd', 'job-mch', 'job-dnc'])
    },
    crafters: function () {
      return window.Categories.getCategories(['job-alc', 'job-arm', 'job-bsm', 'job-crp', 'job-cul', 'job-gsm', 'job-ltw', 'job-wvr'])
    },
    gatherers: function () {
      return window.Categories.getCategories(['job-btn', 'job-fsh', 'job-min'])
    },
    misc: function () {
      return window.Categories.getCategories(['xiv-rp'])
    },
    delvuisys: function () {
      return window.Categories.getCategories(['delvui1', 'delvui2', 'delvui3', 'delvui4'])
    }
  },
  mounted: function () {
    this.$store.commit('setPageInfo', {
      title: 'DelvUI',
      description: this.$t('Browse DelvUI imports')
    })
    this.http.get('/search/menu', {view: 'DelvUI'})
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
#content .md-subheader > a {
  color: inherit;
}

#addon-name .md-theme-default.md-switch {margin: 0 8px; zoom:0.8}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-container {background-color: rgba(0, 0, 0, 0.38);}
#addon-name .md-theme-default.md-switch.md-checked .md-switch-thumb {background-color: #fafafa;}

#search-delvui .md-list-item img { height: 48px; padding-right: 16px; vertical-align:top}
#search-delvui a { margin-right: 12px }
#search-delvui .md-list-item.md-inset .md-list-item-container { padding-left: 24px; flex-wrap: wrap; padding-bottom: 16px }
#search-delvui .md-list-text-container a { white-space: nowrap; display: inline-block }
#search-delvui .md-list-text-container > a, #search-elvui .md-list-text-container > .parent-category { font-size: 18px; font-weight: bold; line-height: 19px; }
#search-delvui .md-list-text-container span{ white-space: normal; line-height: 22px}
#search-delvui .md-layout { align-items: flex-start}

#search-delvui .md-subheader { width: 100% }
#search-delvui .md-subheader + .md-list { width: 100% }
.md-list:after { background-color: transparent!important }
</style>
