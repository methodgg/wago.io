<template>
  <div>
    <md-whiteframe id="queryInfo">
      <strong>{{ $t("Options") }}</strong>
      <div class="meta-items">
        <md-input-container>
          <label for="sort">{{ $t("Sort") }}</label>
          <md-select name="sort" id="sort" v-model="sortVal">
            <md-option value="bestmatchv2">{{ $t("Best Match") }}</md-option>
            <md-option value="stars">{{ $t("Stars") }}</md-option>
            <md-option value="views">{{ $t("Views") }}</md-option>
            <md-option value="date">{{ $t("Date") }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container>
          <label for="type">{{ $t("Import Type") }}</label>
          <md-select name="type" id="type" v-model="typeVal">
            <md-option value="*"><em>All Imports</em></md-option>
            <md-option value="ELVUI">ElvUI</md-option>
            <md-option value="TOTALRP3">Total RP</md-option>
            <md-option value="MDT">Mythic Dungeon Tools</md-option>
            <md-option value="OPIE">OPie</md-option>
            <md-option value="PLATER">Plater</md-option>
            <md-option value="VUHDO">VuhDo</md-option>
            <md-option value="WEAKAURAS2">WeakAura</md-option>
            <md-option value="COLLECTION">Collection</md-option>
            <md-option value="SNIPPET">Snippet</md-option>
            <md-option value="ERROR">Error Log</md-option>
          </md-select>
        </md-input-container>

        <md-input-container v-if="hasCategories">
          <label for="relevancy">{{ $t("Category Relevancy") }}</label>
          <md-select name="relevancy" id="relevancy" v-model="relevanceVal">
            <md-option value="relaxed">{{ $t("Relaxed") }}</md-option>
            <md-option value="standard">{{ $t("Standard") }}</md-option>
            <md-option value="strict">{{ $t("Strict") }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container v-if="hasExpansions">
          <label for="expansion">{{ $t("Expansion Filter") }}</label>
          <md-select name="expansion" id="expansion" v-model="expansionVal">
            <md-option value="all">{{ $t("Search All") }}</md-option>
            <md-option value="sl">{{ $t("Shadowlands") }}</md-option>
            <md-option value="bfa">{{ $t("Battle for Azeroth") }}</md-option>
            <md-option value="legion">{{ $t("Legion") }}</md-option>
            <md-option value="tbc">{{ $t("The Burning Crusade") }}</md-option>
            <md-option value="classic">{{ $t("Classic") }}</md-option>
          </md-select>
        </md-input-container>

        <md-input-container v-if="hasMentions">
          <label for="expansion">{{ $t("Filter By Mentions") }}</label>
          <md-select v-model="includeReadMentionsVal">
            <md-option value="">{{ $t("Unread") }}</md-option>
            <md-option value="1">{{ $t("All") }}</md-option>
          </md-select>
        </md-input-container>
      </div>

      <strong>{{ $t("Query information") }}</strong>
      <md-list class="meta-items">
        <template v-for="(context, index) in meta">
          <md-list-item v-if="context.type === 'type'" v-bind:key="index">
            <md-avatar class='square'><category-image :group="'t-' + context.wagoType.toLowerCase()"></category-image></md-avatar>
            <div class="md-list-text-container">
              <span>{{ getLabel(context.wagoType) }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-if="context.type === 'tag'" v-bind:key="index">
            <md-avatar class='square'><category-image :group="getCategory(context.tag).cls"></category-image></md-avatar>
            <div class="md-list-text-container">
              <strong :class="getCategory(context.tag).cls">{{ getCategory(context.tag).text }}</strong>
              <md-subheader>{{ tagMap[context.tag] }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-else-if="context.type === 'date'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>date_range</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span>{{ context.range }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-if="context.type === 'user'" v-bind:key="index">
            <md-avatar><ui-image :img="context.image"></ui-image></md-avatar>
            <div class="md-list-text-container">
              <router-link v-if="context.user.url" :class="context.user.roleClass" :to="context.user.url">{{ context.user.name }}</router-link>
              <span v-else :class="context.user.roleClass">{{ context.user.name }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-else-if="context.type === 'option' && context.option.name==='anon'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>person</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("Anonymous imports enabled") }}</span>
              <span v-else-if="context.option.force">{{ $t("Anonymous imports only") }}</span>
              <span v-else>{{ $t("Anonymous imports disabled") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-else-if="context.type === 'option' && context.option.name==='starred'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>star</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("My favorites") }}</span>
              <span v-else>{{ $t("Not my favorites") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>

          <md-list-item v-else-if="context.type === 'option' && context.option.name==='alert'" v-bind:key="index">
            <md-avatar class="md-avatar-icon"><md-icon>chat</md-icon></md-avatar>
            <div class="md-list-text-container">
              <span v-if="context.option.enabled">{{ $t("My mentions") }}</span>
              <span v-else>{{ $t("Not my unread mentions") }}</span>
              <md-subheader>{{ context.query }}</md-subheader>
            </div>
          </md-list-item>
        </template>

        <md-list-item v-if="textSearch">
          <md-avatar class="md-avatar-icon"><md-icon>search</md-icon></md-avatar>
          <div class="md-list-text-container">
            <span>{{ textSearch }}</span>
            <md-subheader>{{ $t("Text search") }}</md-subheader>
          </div>
        </md-list-item>
      </md-list>
    </md-whiteframe>
  </div>
</template>

<style>
#queryInfo .md-avatar.square {border-radius:0}
#queryInfo .md-subheader { min-height: 0; padding: 0}
</style>

<script>
import Categories from '../libs/categories2'
import CategoryImage from '../UI/CategoryImage.vue'
export default {
  components: {
    'category-image': CategoryImage
  },
  props: ['meta', 'textSearch', 'tagMap', 'sort', 'catRelevance', 'filterExpansion', 'includeReadMentions'],
  computed: {
    sortVal: {
      get: function () {
        if (this.sort === 'bestmatch') {
          return 'bestmatchv2'
        }
        return this.sort
      },
      set: function (v) {
        this.$emit('setSort', v, this.runSearch)
      }
    },
    relevanceVal: {
      get: function () {
        return this.catRelevance
      },
      set: function (v) {
        this.$emit('setCategoryRelevance', v, this.runSearch)
      }
    },
    expansionVal: {
      get: function () {
        return this.filterExpansion
      },
      set: function (v) {
        this.$emit('setExpansion', v, this.runSearch)
      }
    },
    includeReadMentionsVal: {
      get: function () {
        return this.includeReadMentions
      },
      set: function (v) {
        this.$emit('setReadMentions', v, this.runSearch)
      }
    },
    hasCategories: function () {
      for (var i = 0; i < this.meta.length; i++) {
        if (this.meta[i].type === 'tag') {
          return true
        }
      }
      return false
    },
    hasMentions: function () {
      for (var i = 0; i < this.meta.length; i++) {
        if (this.meta[i].type === 'option' && this.meta[i].option.name === 'alert') {
          return true
        }
      }
      return false
    },
    hasExpansions: function () {
      for (var i = 0; i < this.meta.length; i++) {
        if (this.meta[i].type === 'type' && this.meta[i].wagoType.match(/WEAKAURA|MDT/)) {
          return true
        }
      }
      return false
    }
  },
  data: () => {
    return {
      typeVal: '',
      runSearch: true
    }
  },
  mounted: function () {
    for (var i = 0; i < this.meta.length; i++) {
      if (this.meta[i].type === 'type') {
        this.typeVal = this.meta[i].wagoType
      }
    }
    setTimeout(() => {
      this.runSearch = false
    }, 2000)
    return ''
  },
  watch: {
    typeVal (val) {
      if (!val) {
        return
      }
      const types = {
        ELVUI: 'ElvUI',
        TOTALRP3: 'TotalRP',
        MDT: 'MDT',
        OPIE: 'OPIE',
        PLATER: 'Plater',
        VUHDO: 'VuhDo',
        WEAKAURAS2: 'WeakAura',
        'CLASSIC-WEAKAURA': 'WeakAura',
        COLLECTION: 'Collection',
        SNIPPET: 'Snippet',
        ERROR: 'Error'
      }
      if (val === 'WEAKAURA') {
        this.typeVal = 'WEAKAURAS2'
        return
      }
      this.$emit('setImportType', types[val] || '')
    }
  },
  methods: {
    getCategory: function (catID) {
      return Categories.match(catID)
    },
    getLabel: function (v) {
      switch (v) {
        case 'MDT': return 'Mythic Dungeon Tools'
        default: return v
      }
    }
  }
}
</script>
