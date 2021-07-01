<template>
  <multiselect v-model="multiSelectValue" :options="categoryOptions" label="text" :multiple="true" trackBy="id" :max="maxSelections" :close-on-select="false" :clear-on-select="false" :hide-selected="true" :placeholder="selectText || ''" :searchable="false" select-label="" open-direction="bottom">
    <template slot="tag" slot-scope="{ option, remove }">
      <span :class="'custom__tag ' + option.id"><span>{{ option.text }}</span><span class="multiselect_remove" @click="remove(option)" v-if="(!option.parent && multiSelectValue.length === 1) || !option.root">❌</span><span v-else style='padding-right:4px'>:</span>
      </span>
    </template>
    <template slot="option" slot-scope="props">
      <div :class="'md-chip ' + props.option.id"><div class="option__title">{{ props.option.text }}</div></div>
    </template>
    <template slot="maxElements" slot-scope="props">
      {{ $t('No additional categories can be added') }}
    </template>
  </multiselect>
</template>

<script>
import Multiselect from 'vue-multiselect'

export default {
  components: {
    Multiselect
  },
  props: ['selectedCategories', 'type', 'game'],
  computed: {
    multiSelectValue: {
      get: function () {
        if (!this.categoryOptions) {
          this.setOptions(this.selectedCategories)
        }
        return this.selectedCategories
      },
      set: function (newValue) {
        this.setOptions(newValue)
        this.$emit('update', newValue)
        return newValue
      }
    }
  },
  data: function () {
    return {
      categoryOptions: [],
      maxSelections: 2,
      selectText: ''
    }
  },
  methods: {
    setOptions (values) {
      if (!values) {
        values = []
      }
      else if (!values[0]) {
        // values = [values]
      }
      let game = this.game
      let type = this.type
      if (this.type === 'COLLECTION') {
        game = game.replace(/legion|bfa/, 'sl')
      }
      else if (!this.type.match(/WEAKAURA/)) {
        game = null
      }
      else {
        type = 'WEAKAURA'
      }

      this.selectText = this.$t('Select')
      if (values && values.length > 0) {
        this.selectText = ''
        if (values[0].root) {
          var children = window.Categories.matchChildren(values[0].id, type, game)
          this.categoryOptions = []
          // remove already selected categories
          for (var i = 0; i < children.length; i++) {
            var valid = true
            for (var j = 0; j < values.length; j++) {
              if (children[i].id === values[j].id) {
                valid = false
                break
              }
            }
            if (valid) {
              this.categoryOptions.push(children[i])
            }
          }
        }
        else if (!values[0].systemtag && !values[0].noselect) {
          this.categoryOptions = window.Categories.matchChildren(values[values.length - 1].id, type, game)
        }
      }
      else {
        this.categoryOptions = window.Categories.rootCategories(type, game)
      }

      // change max selections so the multiselect knows when to put up the no categories error
      if (this.categoryOptions.length > 0) {
        this.maxSelections = values.length + 1
      }
      else {
        this.maxSelections = values.length
      }
    }
  },
  mounted: function () {
    this.setOptions(this.selectedCategories)
  }
}
</script>

<style>
.multiselect { min-height: 0; cursor: pointer; margin-bottom: 16px }
.multiselect__tags { padding-top: 14px}
.multiselect__tags, .multiselect__single { border-width: 0 0 1px 0; border: 0; background: none; color: #B6B6B6;}
.multiselect__single:empty { display: none }
.multiselect_remove { cursor: pointer }
ul.multiselect__content { display: flex!important; flex-wrap: wrap }
ul.multiselect__content .multiselect__element { flex: 1 1 25%; z-index:3;}
ul.multiselect__content .multiselect__element .multiselect__option { padding: 0; min-height: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip { border-radius: 0; display: block; font-size: 13.5px; text-outline: none; box-shadow: none; position: relative; padding: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip .option__title { display: block; padding: 8px 12px }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip .option__title:hover { background: rgba(255, 255, 255, .2); }
ul:not(.md-list) > li.multiselect__element + li { margin-top: 0 }
</style>

