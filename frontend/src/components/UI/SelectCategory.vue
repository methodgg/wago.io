<template>
  <multiselect v-model="multiSelectValue" :options="categoryOptions" label="text" :multiple="true" :max="maxSelections" :close-on-select="false" :clear-on-select="false" :hide-selected="true" :placeholder="$t('Select')" select-label="" open-direction="top">
    <template slot="tag" scope="props"><span :class="'custom__tag ' + props.option.cls">
      <span>{{ props.option.text }}</span><span class="multiselect_remove" @click="props.remove(props.option)">❌</span></span>
    </template>
    <template slot="option" scope="props">
      <div :class="'md-chip ' + props.option.cls"><div class="option__title">{{ props.option.text }}</div></div>
    </template>
    <template slot="maxElements" scope="props">
      {{ $t('No additional categories can be added') }}
    </template>
  </multiselect>
</template>

<script>
import Categories from '../libs/categories'
import Multiselect from 'vue-multiselect'

export default {
  components: {
    Categories,
    Multiselect
  },
  props: ['selectedCategories', 'type'],
  computed: {
    multiSelectValue: {
      get: function () {
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
      maxSelections: 2
    }
  },
  methods: {
    setOptions (values) {
      if (values && values.length > 0) {
        this.categoryOptions = Categories.getChildren(values[values.length - 1], this.$t)
      }
      else {
        this.categoryOptions = Categories.rootCategories(this.$t)
      }
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
.multiselect { min-height: 0}
.multiselect--above { z-index: 8}
.multiselect__tags { border-width: 0 0 1px 0; padding:5px 0; min-height: 16px; border: 0; background: none}
.multiselect_remove { cursor: pointer }
ul.multiselect__content { display: flex!important; flex-wrap: wrap }
ul.multiselect__content .multiselect__element { flex: 1 1 25%; z-index:3;}
ul.multiselect__content .multiselect__element .multiselect__option { padding: 0; min-height: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip { border-radius: 0; display: block; font-size: 13.5px; text-outline: none; box-shadow: none; position: relative; padding: 0 }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip .option__title { display: block; padding: 8px 12px }
ul.multiselect__content .multiselect__element .multiselect__option .md-chip .option__title:hover { background: rgba(255, 255, 255, .2); }
ul:not(.md-list) > li.multiselect__element + li { margin-top: 0 }
</style>

