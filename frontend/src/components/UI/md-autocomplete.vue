<template lang="html">
  <!-- original part of vue-material; modified for wago -->
  <div class="md-autocomplete"
    @focus="onFocus"
    @blur="onBlur">
    <md-menu
      md-align-trigger
      md-auto-width
      md-fixed
      md-no-focus
      md-manual-toggle
      :md-max-height="maxHeight"
      :md-close-on-select="false"
      ref="menu"
      class="md-autocomplete-menu" md-align-trigger>

      <input class="md-input"
        ref="input"
        type="text"
        v-model="query"
        :disabled="disabled"
        :required="required"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :name="name"
        @focus="onFocus"
        @blur="onBlur"
        @input="debounceUpdate"
        @keydown.up.prevent="contentHighlightItem('up')"
        @keydown.down.prevent="contentHighlightItem('down')"
        @keydown.enter.prevent="contentFireClick()"
        @keydown.tab="closeMenu()"
        md-menu-trigger/>

      <md-menu-content class="md-autocomplete-content">
        <md-menu-item v-if="items.length"
          v-for="(item, index) in filterItemsByResLength"
          :key="index"
          :listIndex="index"
          manual-highlight
          @click="setItemSelected(item)">
          <div v-html="item['html']" class="auto-complete-result"><md-ink-ripple /></div>
        </md-menu-item>
      </md-menu-content>
    </md-menu>
    <md-backdrop class="md-menu-backdrop md-transparent md-active autocomplete-backdrop" ref="backdrop" @close="closeMenu"></md-backdrop>
  </div>
</template>

<script>
  /* eslint-disable */
  import autocompleteCommon from 'vue-material/src/core/utils/autocomplete-common';
  import common from 'vue-material/src/components/mdInputContainer/common';
  import getClosestVueParent from 'vue-material/src/core/utils/getClosestVueParent';

  export default {
    mixins: [common, autocompleteCommon],
    data() {
      return {
        items: [],
        loading: false,
        query: '',
        selected: null,
        isItemSelected: 0,
        timeout: 0,
        parentContainer: null,
        searchButton: null
      };
    },
    computed: {
      listIsEmpty() {
        return this.list.length === 0;
      },
      itemsEmpty() {
        return this.items.length === 0;
      },
      filterItemsByResLength() {
        if (this.maxRes === 0) {
          return this.items;
        }
        return this.items.slice(0, this.maxRes);
      }
    },
    watch: {
      list(value) {
        this.items = Object.assign([], value);
      },
      query(value) {
        this.$refs.input.value = value;
        this.setParentUpdateValue(value);
      },
      value(value) {
        this.query = value;
        this.setParentUpdateValue(value);
      }
    },
    methods: {
      debounceUpdate() {
        this.onInput();

        if (this.timeout) {
          window.clearTimeout(this.timeout);
        }

        this.timeout = window.setTimeout(() => {
          if (!this.listIsEmpty) {
            this.renderFilteredList();
            return;
          }
          this.update();
        }, this.debounce);
      },
      hit(item) {
        this.query = item[this.printAttribute];
        this.$refs.input.value = item['name'];
        this.selected = item;
        this.onInput();
        this.$emit('selected', this.selected, this.$refs.input.value);

        this.closeMenu();
      },
      makeFetchRequest(queryObject) {
        return this.fetch(queryObject)
          .then((response) => {
            let data = response || response.data || response.body;

            data = this.prepareResponseData ?
            this.prepareResponseData(data) :
            data;
            this.items = this.limit ?
            data.slice(0, this.limit) :
            data;

            this.loading = false;

            if (!this.itemsEmpty && !this.isItemSelected) {
              this.openMenu();
            } else {
              this.closeMenu();
            }
          });
      },
      onFocus() {
        this.isItemSelected = 0;

        if (this.parentContainer) {
          this.parentContainer.isFocused = true;
        }

        this.$refs.input.focus();

        if (this.query.length >= this.minChars) {
          this.renderFilteredList();
          this.openMenu();
        }
      },
      onInput() {
        this.updateValues();
        this.$emit('change', this.$refs.input.value);
        this.$emit('input', this.$refs.input.value);
      },
      renderFilteredList() {
        if (this.filterList && this.query.length >= this.minChars) {
          this.items = this.filterList(Object.assign([], this.list), this.query);
        }

        if (this.query.length < this.minChars || this.itemsEmpty) {
          this.closeMenu();
        }

        if (!this.itemsEmpty && this.isItemSelected === 0) {
          this.openMenu();
        } else if (this.isItemSelected === 1) {
          this.isItemSelected = 0;
        }
      },
      reset() {
        this.items = [];
        this.query = '';
        this.loading = false;
      },
      setParentValue(value) {
        // In some cases parentContainer would be null and value would be present
        if (this.parentContainer === null) {
          return;
        }
        this.parentContainer.setValue(value || this.$refs.input.value);
      },
      setParentDisabled() {
        this.parentContainer.isDisabled = this.disabled;
      },
      setParentRequired() {
        this.parentContainer.isRequired = this.required;
      },
      setParentPlaceholder() {
        this.parentContainer.hasPlaceholder = !!this.placeholder;
      },
      setParentUpdateValue(value) {
        this.setParentValue(value);
        this.updateValues(value);
      },
      setSearchButton() {
        this.searchButton = this.parentContainer.$el.querySelector('[md-autocomplete-search]');

        if (this.searchButton) {
          this.searchButton.addEventListener('click', this.makeFetchRequest);
        }
      },
      update() {
        if (!this.query && !this.list.length) {
          return this.reset();
        }

        if (this.minChars && this.query.length < this.minChars) {
          return;
        }

        this.loading = true;

        const queryObject = { [this.queryParam]: this.query };

        return this.makeFetchRequest(queryObject);
      },
      toggleMenu() {
        if (this.items.length) {
          this.$refs.menu.toggle();
        }
      },
      openMenu() {
        if (this.items.length && !this.itemsEmpty) {
          this.$refs.menu.open();
          this.$refs.input.focus();
          document.body.appendChild(this.backdropElement);
        }
      },
      closeMenu() {
        this.$refs.menu.close();
        if (document.body.contains(this.backdropElement)) {
          document.body.removeChild(this.backdropElement);
        }
      },
      updateValues(value) {
        const newValue = value || this.$refs.input.value || this.value;

        this.setParentValue(newValue);
        // In some cases parentContainer would be null and value would be present
        if (this.parentContainer === null) {
          return;
        }
        this.parentContainer.inputLength = newValue ? newValue.length : 0;
      },
      contentHighlightItem(direction) {
        this.menuContent = document.body.querySelector('.md-autocomplete-content');

        if (this.menuContent === null) {
          return false;
        }

        this.menuContent.__vue__.highlightItem(direction);

        return true;
      },
      contentFireClick() {
        this.menuContent = document.body.querySelector('.md-autocomplete-content');

        if (this.menuContent === null ||
            this.menuContent.__vue__.highlighted === false ||
            this.menuContent.__vue__.highlighted < 1) {

          this.closeMenu();

          return false;
        }

        let index = this.menuContent.__vue__.$children[0].$children[
          this.menuContent.__vue__.highlighted - 1].index;

        this.isItemSelected = 1;

        this.hit(this.items[index - 1]);
        this.closeMenu();

        return true;
      },
      setItemSelected(item) {
        this.isItemSelected = 2;
        this.hit(item);

        this.closeMenu();

        return true;
      }
    },
    beforeDestroy() {
      if (this.searchButton) {
        this.searchButton.removeEventListener('click', this.makeFetchRequest);
      }
      document.body.removeChild(this.backdropElement);
    },
    mounted() {
      this.$nextTick(() => {
        this.parentContainer = getClosestVueParent(this.$parent, 'md-input-container');
        this.menuContent = document.body.querySelector('.md-autocomplete-content');

        if (!this.listIsEmpty) {
          this.items = Object.assign([], this.list);
        }

        this.backdropElement = this.$refs.backdrop.$el;
        this.$el.removeChild(this.$refs.backdrop.$el);

        this.verifyProps();
        this.setSearchButton();

        this.setParentDisabled();
        this.setParentRequired();
        this.setParentPlaceholder();
        this.handleMaxLength();
        this.updateValues();
      });
    }
  };
</script>

<style>
.auto-complete-result .md-avatar { width: 24px; min-width: 24px; height: 24px; min-height: 24px; }
.autocomplete-backdrop { z-index: 140 }
.md-autocomplete-content { z-index: 141 }
</style>