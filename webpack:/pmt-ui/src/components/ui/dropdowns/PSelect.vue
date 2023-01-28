<template>
    <div class="select">
        <VMenu
            v-model="menuIsDisplayed"
            offset-y
            :max-height="maxHeight"
            :close-on-content-click="multiselect || searchable ? false : true"
            :max-width="menuWidth"
        >
            <template #activator="{ on, attrs }">
                <slot
                    name="label"
                    :label="label"
                >
                    <label
                        v-if="label"
                        :class="{ disabled: disabled || loading, required }"
                    >
                        {{ label }}
                    </label>
                </slot>
                <div
                    class="button-container"
                    :class="{ disabled: disabled || loading, dense }"
                >
                    <slot
                        name="activator"
                        :selected="selected"
                        :menu-is-displayed="menuIsDisplayed"
                        :on="on"
                    >
                        <button
                            ref="activatorButton"
                            type="button"
                            :readonly="readonly"
                            :disabled="disabled || loading"
                            :class="activatorClasses"
                            :style="`width: ${width}${typeof(width) == 'number' ? 'px' : ''}`"
                            :tab-index="tabIndex"
                            v-bind="attrs"
                            v-on="on"
                        >
                            <div
                                class="left"
                                :class="{ chips: chips && multiselect }"
                            >
                                <template v-if="chips && multiselect && selected && selected.length">
                                    <VChip
                                        v-for="(item, index) in selected"
                                        :key="index"
                                        :small="!dense"
                                        :x-small="dense"
                                        :close="!disabled && !loading && !readonly && !item[itemDisabled]"
                                        @click:close="toggleSelect(item)"
                                    >
                                        {{ item[itemLabel] }}
                                    </VChip>
                                </template>
                                <template v-else>
                                    <slot
                                        name="selected-label"
                                        :selected="selected"
                                    >
                                        <div
                                            v-if="selectedLabel"
                                            class="selected-label"
                                        >
                                            {{ selectedLabel }}
                                        </div>
                                        <div
                                            v-else-if="placeholder"
                                            class="placeholder"
                                        >
                                            {{ placeholder }}
                                        </div>
                                    </slot>
                                </template>
                            </div>
                            <div class="right">
                                <div class="icons">
                                    <VBadge
                                        v-if="multiselect && counter && badgeNumber"
                                        :content="badgeNumber"
                                        color="grey lighten-1"
                                        inline
                                    />
                                    <PmtButton
                                        v-if="isClearable"
                                        v-ripple
                                        default
                                        round
                                        mini
                                        :icon="clearIcon"
                                        icon-size="16"
                                        class="clearable"
                                        tab-index="0"
                                        @click="emptySelection()"
                                    />
                                    <component
                                        :is="appendIcon"
                                        ref="appendIcon"
                                        :size="16"
                                        :class="iconClasses"
                                    />
                                </div>
                            </div>
                        </button>
                        <VProgressLinear
                            v-if="loading"
                            ref="loadingIndicator"
                            :active="loading"
                            :indeterminate="loading"
                            absolute
                            height="2"
                        />
                    </slot>
                </div>
            </template>
            <slot
                name="items"
                :items="items"
            >
                <VList
                    v-if="!disabled && !readonly"
                    :class="{ dense }"
                >
                    <VListItem
                        v-if="searchable"
                        class="search"
                    >
                        <input
                            ref="searchInput"
                            v-model="searchString"
                            :placeholder="$t ? $t('ui.singles.search') : 'Search'"
                            type="text"
                        >
                        <PmtButton
                            v-if="searchString"
                            v-ripple
                            default
                            round
                            mini
                            :icon="clearIcon"
                            icon-size="16"
                            tab-index="-1"
                            @click="searchString = ''"
                        />
                        <Magnify
                            :size="16"
                        />
                    </VListItem>
                    <VListItem
                        v-if="multiselect && selectAll"
                        class="select-all"
                        @click="toggleSelectAll"
                    >
                        <VListItemContent>
                            <PmtCheckbox
                                :value="allItemsSelected"
                                :indeterminate="indeterminateSelection"
                                :text="$t ? $t('ui.singles.selectAll') : 'Select all'"
                                :size="14"
                            />
                        </VListItemContent>
                    </VListItem>
                    <VListItem
                        v-for="(item, index) in filteredItems"
                        :id="optionId(item)"
                        :key="index"
                        v-ripple="{ class: 'ripple' }"
                        :cy_id="optionId(item)"
                        :class="{ selected: alreadySelected(item) }"
                        :disabled="item[itemDisabled] || loading"
                        @click="toggleSelect(item)"
                    >
                        <VListItemContent>
                            <slot
                                name="item"
                                :item="displayedItem(item)"
                            >
                                <VListItemTitle>
                                    <PmtCheckbox
                                        v-if="multiselect"
                                        :value="alreadySelected(item)"
                                        :text="displayedItem(item)[itemLabel]"
                                        :size="14"
                                        :disabled="item[itemDisabled] || loading"
                                    />
                                    <span
                                        v-else
                                        class="list-label"
                                        v-html="displayedItem(item)[itemLabel]"
                                    />
                                </VListItemTitle>
                            </slot>
                        </VListItemContent>
                    </VListItem>
                    <VListItem v-if="searchString.length && !filteredItems.length">
                        {{ $t ? $t('ui.singles.noResultsFound') : 'No results found' }}
                    </VListItem>
                </VList>
                <VProgressLinear
                    v-if="loading"
                    ref="loadingIndicator"
                    :active="loading"
                    :indeterminate="loading"
                    absolute
                    height="2"
                />
            </slot>
        </VMenu>
        <div
            v-if="hint && hint.length"
            class="hint"
            :class="{ success, danger }"
        >
            <slot name="hint">
                {{ hint }}
            </slot>
        </div>
    </div>
</template>

<script>
import stringHelper from '@/libraries/stringHelper'
import scrollHelper from '@/libraries/scrollHelper'

export default {
    name: 'PSelect',
    props: {
        value: {
            type: [Object, Array, String, Number],
            default () { return {} },
        },
        label: {
            type: String,
            default: '',
        },
        items: {
            type: Array,
            default () { return [] },
        },
        required: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        placeholder: {
            type: String,
            default: '',
        },
        itemLabel: {
            type: String,
            default: 'label',
        },
        itemValue: {
            type: String,
            default: 'value',
        },
        itemDisabled: {
            type: String,
            default: 'disabled',
        },
        emitValue: {
            type: Boolean,
            default: false,
        },
        multiselect: {
            type: Boolean,
            default: false,
        },
        verticalGrow: {
            type: Boolean,
            default: true,
        },
        selectAll: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        clearable: {
            type: Boolean,
            default: false,
        },
        clearIcon: {
            type: String,
            default: 'close',
        },
        searchable: {
            type: Boolean,
            default: false,
        },
        active: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        success: {
            type: Boolean,
            default: false,
        },
        counter: {
            type: Boolean,
            default: false,
        },
        fullBorder: {
            type: Boolean,
            default: false,
        },
        dense: {
            type: Boolean,
            default: false,
        },
        selectedFirst: {
            type: Boolean,
            default: false,
        },
        tabIndex: {
            type: Number,
            default: 0,
        },
        appendIcon: {
            type: String,
            default: 'chevron-down',
        },
        chips: {
            type: Boolean,
            default: false,
        },
        width: {
            type: [String, Number],
            default () { return '100%' },
        },
        menuWidth: {
            type: [String, Number],
            default () { return 'auto' },
        },
        hint: {
            type: String,
            default: null,
        },
        scrollToSelected: {
            type: Boolean,
            default: true,
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            menuIsDisplayed: false,
            searchString: '',
            selected: null,
            allItemsSelected: false,
        }
    },
    computed: {
        hasValue () {
            if (!this.selected) return false

            if (this.multiselect && Array.isArray(this.selected) && this.selected.length) {
                return true // value is array and has entries
            } else if (this.emitValue && !this.multiselect && this.selected?.length) {
                return true // value is string
            } else if (this.selected && typeof this.selected === 'object' && Boolean(this.selected[this.itemValue])) {
                return true // value is object with properties
            }
            return false
        },
        activatorClasses () {
            return {
                activator: true,
                'full-border': this.fullBorder,
                dense: this.dense,
                placeholder: this.placeholder && !this.selected,
                readonly: this.readonly,
                clearable: this.clearable,
                success: this.success,
                danger: this.danger,
                counter: this.counter,
                multiselect: this.multiselect,
                'vertical-grow': this.verticalGrow && this.multiselect,
            }
        },
        iconClasses () {
            return {
                rotate: this.menuIsDisplayed && !this.disabled && !this.readonly,
                disabled: this.disabled || this.readonly,
            }
        },
        isClearable () {
            return this.clearable && this.hasValue
        },
        filteredItems () {
            let output = JSON.parse(JSON.stringify(this.items))
            if (this.selectedFirst) {
                output = this.sortBySelected(output)
            }
            if (this.searchString) {
                output = this.filterOnSearchString(output)
            }
            return output
        },
        selectedLabel () {
            let output = ''

            if (this.multiselect && this.hasValue && Array.isArray(this.selected)) {
                output = this.selected.map(o => o[this.itemLabel]).join(', ')
            } else if (this.hasValue) {
                output = this.selected[this.itemLabel]
            }
            return output
        },
        badgeNumber () {
            if (this.multiselect && this.selected && this.selected.length) {
                return this.selected.length
            }
            return null
        },
        /**
         * max height of pulldown menu depends on available screen heigth and dense prop setting
         */
        maxHeight () {
            const grid = this.dense ? 32 : 40
            const maxHeight = window.innerHeight * 0.5
            return Math.floor(maxHeight / grid) * grid
        },
        indeterminateSelection () {
            if (this.selected?.length && this.selected?.length < this.items.length) {
                return true
            }
            return false
        },
    },
    watch: {
        value (newValue) {
            this.setSelected(newValue)
        },
        menuIsDisplayed (newValue) {
            if (newValue) {
                setTimeout(() => {
                    if (this.searchable) this.$refs.searchInput.focus()
                    this.scrollToSelectedItem()
                }, 250)
            }
        },
        allItemsSelected (newValue) {
            if (newValue) {
                this.selected = JSON.parse(JSON.stringify(this.items))
            } else {
                this.selected = []
            }
            this.emit()
        },
    },
    mounted () {
        this.setSelected(JSON.parse(JSON.stringify(this.value)))
    },
    methods: {
        /**
        * Set selection based on value and emitValue prop value
        */
        setSelected (value) {
            if (this.emitValue) {
                if (this.multiselect) {
                    this.selected = []
                    this.items.forEach(item => {
                        if (value.includes(item[this.itemValue])) this.selected.push(item)
                    })
                } else {
                    this.selected = this.items.find(o => o[this.itemValue] === value)
                }
            } else {
                this.selected = value || (this.multiselect ? [] : {})
            }
        },
        displayedItem (item) {
            if (typeof item === 'object') {
                const displayed = JSON.parse(JSON.stringify(item))
                const needle = this.searchString.toLowerCase()
                if (needle.length > 2) {
                    Object.keys(displayed).forEach(key => {
                        if (key !== 'value' && displayed[key] !== null && displayed[key].toString().toLowerCase().includes(needle)) {
                            displayed[key] = displayed[key].toString().replace(new RegExp(this.searchString, 'gi'), (match) => `<span class="highlighted">${match}</span>`)
                        }
                    })
                }
                return displayed
            } else {
                return ''
            }
        },
        /**
        * Determine if item should have a 'selected' state based on selection
        */
        alreadySelected (item) {
            if ((this.multiselect && Array.isArray(this.selected) && this.selected.find(o => o[this.itemValue] === item[this.itemValue])) ||
                (!this.multiselect && this.selected && this.selected[this.itemValue] === item[this.itemValue])) {
                return true
            }
            return false
        },
        emptySelection () {
            if (this.multiselect) {
                this.selected = []
            } else {
                if (this.emitValue) {
                    this.selected = null
                } else {
                    this.selected = {}
                }
            }
            this.$emit('input', this.selected)
        },
        /**
        * Add or remove item from selection
        */
        toggleSelect (item) {
            item[this.itemLabel] = stringHelper.stripHtmlTags(item[this.itemLabel])
            if (this.multiselect) {
                if (this.alreadySelected(item)) {
                    const index = this.selected.findIndex(o => o[this.itemValue] === item[this.itemValue])
                    if (index > -1) {
                        this.selected.splice(index, 1)
                    }
                } else {
                    this.selected.push(item)
                }
            } else {
                this.selected = item
                this.searchString = ''
            }

            if (!this.hasValue && this.required) {
                return
            }

            if (!this.multiselect) {
                this.menuIsDisplayed = false
            }

            this.emit()
        },
        emit () {
            if (this.emitValue) {
                if (this.multiselect) {
                    this.$emit('input', this.selected.map(o => o[this.itemValue]))
                } else {
                    this.$emit('input', this.selected[this.itemValue])
                }
                return
            }

            this.$emit('input', this.selected)
        },
        /**
         * Display selected items first in list if prop selectedFirst is true
         */
        sortBySelected (list) {
            const sortedList = []

            if (this.hasValue) {
                // fill array with selected items first...
                list.forEach(item => {
                    if ((this.multiselect && this.selected.findIndex(o => o[this.itemValue].toString() === item[this.itemValue].toString()) > -1) ||
                        (!this.multiselect && this.selected[this.itemValue].toString() === item[this.itemValue].toString())) {
                        sortedList.push(item)
                    }
                })
                // ... the fill up with unselected ones
                list.forEach(item => {
                    if ((this.multiselect && this.selected.findIndex(o => o[this.itemValue].toString() === item[this.itemValue].toString()) < 0) ||
                        (!this.multiselect && this.selected[this.itemValue].toString() !== item[this.itemValue].toString())) {
                        sortedList.push(item)
                    }
                })
            } else {
                return list
            }
            return sortedList
        },
        filterOnSearchString (items) {
            const filteredList = []
            const needle = this.searchString.toLowerCase()

            items.forEach(item => {
                let match = 0
                Object.keys(item).forEach(key => {
                    if (item[key] !== null && item[key].toString().toLowerCase().includes(needle)) {
                        match++
                    }
                })
                if (match > 0) {
                    filteredList.push(item)
                }
            })

            return filteredList
        },
        toggleSelectAll () {
            this.allItemsSelected = !this.allItemsSelected
        },
        scrollToSelectedItem () {
            if (this.selectedFirst || !this.scrollToSelected) return
            const selectedItem = document.querySelector('.selected')
            if (!scrollHelper.isInViewport(selectedItem) && selectedItem) {
                const itemsList = document.querySelector('.v-menu__content')
                const selectedItemRect = selectedItem.getBoundingClientRect()
                itemsList.scrollTo({
                    top: selectedItemRect.top - itemsList.getBoundingClientRect().height,
                    behavior: 'smooth',
                })
            }
        },
        setFocus () {
            this.$refs.activatorButton.focus()
        },
        optionId (item) {
            return stringHelper.camelCase((stringHelper.stripHtmlTags(this.displayedItem(item)[this.itemLabel]) || '').toString())
        },
    },
}
</script>

<style lang="scss" scoped>
    @import 'PSelect.scss';
</style>
