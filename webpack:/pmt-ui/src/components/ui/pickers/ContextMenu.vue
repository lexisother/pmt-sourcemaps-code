<template>
    <div
        ref="floatPanel"
        :style="{maxHeight: maxHeight + 'px', overflow: 'hidden'}"
    >
        <div
            v-if="searchable && items.length > 7"
            class="menu-item-search"
        >
            <PInput
                ref="searchItemsInput"
                v-model.trim="search"
                :placeholder="searchPlaceholder || $t('ui.singles.search')"
                append-icon="Magnify"
                autofocus
                clearable
                sticky
                @focused="searchFocused = true"
                @blur="searchFocused = false"
            />
        </div>
        <ul
            v-if="!loading"
            id="context-menu"
            class="context-menu context-menu-main"
            :class="{small: filteredItems.length < 10}"
            :style="`max-height: ${maxHeight - 40}px`/** search input height */"
        >
            <li
                v-if="!filteredItems.length"
                class="no-results"
            >
                {{ $t( 'components.contextMenu.noResults' ) }}
            </li>
            <template v-for="(item, index) in filteredItems">
                <li
                    v-if="hideDefaultItem ? item.key !== '-' : true"
                    :key="index"
                    :cy_id="item.label.toLowerCase()"
                    :class="getClassList( item )"
                    :style="borderColor(item.departmentColor)"
                >
                    <span
                        v-if="multiple && (hideDefaultItem ? item.key !== '-' : true)"
                        class="menu-item-check"
                    >
                        <PmtCheckbox
                            :value="selectedItems.includes(item.label)"
                            :size="18"
                            @add="selectedItems.push(item.label); $emit('add', {item, selectedItems})"
                            @remove="selectedItems.splice(selectedItems.indexOf(item.label), 1); $emit('remove', {item, selectedItems})"
                        />
                    </span>
                    <component
                        :is="item.icon"
                        v-if="item.showIcon"
                        class="list-icon"
                    />
                    <!-- eslint-disable vue/no-v-html -->
                    <router-link
                        v-if="!item.hidden && !item.simple && (hideDefaultItem ? item.key !== '-' : true)"
                        :to="item.url || ''"
                        :tag="item.inactive ? 'span' : 'a'"
                        @click.native="onClick( item.action || null, item )"
                        @keyup.enter="onClick( item.action || null, item )"
                        v-html="searchedLabel(item)"
                    />
                    <Chip
                        v-if="item.inactive"
                        :text="$t('components.contextMenu.inactive')"
                        simple
                        normal
                        outline
                        small
                        class="inactive-tag"
                    />
                    <a
                        v-if="!item.hidden && item.simple && (hideDefaultItem ? item.key !== '-' : true)"
                        href="#"
                        @click.prevent="onClickSimple(item)"
                        @keyup.enter="onClickSimple(item)"
                    >
                        <component
                            :is="item.icon"
                            :size="15"
                        />
                        <!-- eslint-disable vue/no-v-html -->
                        <span
                            class="searched-label"
                            v-html="searchedLabel(item)"
                        />
                        <div
                            v-if="item.subTitle"
                            class="sub-title"
                        >
                            {{ item.subTitle }}
                        </div>
                    </a>
                </li>
            </template>
        </ul>
        <RoundSpinner
            v-else
            :loading="true"
            :size="45"
        />
    </div>
</template>

<script>
import departmentHelper from '@/libraries/departmentHelper'
export default {
    name: 'ContextMenu',
    props: {
        items: {
            type: Array,
            required: true,
        },
        maxHeight: {
            type: [Number, String],
            default: 400,
        },
        searchable: {
            type: Boolean,
            default: false,
        },
        searchIcon: {
            type: String,
            default: 'account-search',
        },
        multiple: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        // Array of properties to filter by
        filterBy: {
            type: Array,
            default: () => ([]),
        },
        hideDefaultItem: {
            type: Boolean,
            default: false,
        },
        searchPlaceholder: {
            type: String,
            default: '',
        },
    },
    data () {
        return {
            selectedItem: null,
            search: '',
            searchFocused: false,
            selectedItems: [],
            tabIndex: -1,
            selectedListItem: null,
        }
    },
    computed: {
        filteredItems () {
            const items = this.items.filter(item => !item.hidden)
            if (this.search !== '') {
                const filtered = items.filter(item => {
                    if (item.key !== '-') {
                        for (let i = 0; i < this.filterBy.length; i++) {
                            if (item.value[this.filterBy[i]] && item.value[this.filterBy[i]].toString().toLowerCase().includes(this.search.trim().toLowerCase())) {
                                return true
                            }
                        }
                        return false
                    } else {
                        return false
                    }
                })
                return filtered
            } else {
                return items
            }
        },
    },
    mounted () {
        if (this.searchable) {
            setTimeout(() => {
                // focus on the search input on mounted
                this.$refs.searchItemsInput.focus()
            }, 200)
        }
        document.addEventListener('keyup', this.navigateListWithKeyboard)
        document.addEventListener('keydown', this.otherEvents)
        const selectedItemIndex = this.items.findIndex(i => i.selected)
        this.tabIndex = selectedItemIndex
        // save the main list menu element
        this.menuElement = document.querySelector('.context-menu-main')
        // save the current selected item as DOM element
        this.selectedListItem = this.menuElement.getElementsByTagName('li')[this.tabIndex]
    },
    destroyed () {
        document.removeEventListener('keyup', this.navigateListWithKeyboard)
        document.removeEventListener('keydown', this.otherEvents)
    },
    methods: {
        /**
         * Other keyboard events outside of menu items navigation
         */
        otherEvents (event) {
            if (this.searchable && event.key === 'f' && event.ctrlKey) {
                // focus back on the search input
                // and select all the text that is already present
                event.preventDefault()
                if (this.$refs.searchItemsInput) {
                    this.$refs.searchItemsInput.focus()
                    this.$refs.searchItemsInput.select()
                }
            }
            // overide any default behavior when clicking Escape key
            // and run the local close() method
            if (event.code === 'Escape') {
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()
                this.close()
            }
        },
        /**
         * User can navigate through the list items using Up/Down arrow keys
         * or when using conventional tabbing
         */
        navigateListWithKeyboard (event) {
            if (!this.menuElement || !this.filteredItems.length) return
            const listLength = this.items.length - 1
            // when pressing arrow DOWN or Tab without SHIFT key pressed
            // start focusing on list elements (one by one) starting from the already selected one
            // or if none is selected from the first one
            if (event.code === 'ArrowDown' || (event.code === 'Tab' && !event.shiftKey)) {
                this.tabIndex++
                if (this.selectedListItem) {
                    this.selectedListItem.querySelector('a').blur()
                    const next = this.menuElement.getElementsByTagName('li')[this.tabIndex]
                    if (typeof next !== 'undefined' && this.tabIndex <= listLength) {
                        this.selectedListItem = next
                    } else {
                        this.tabIndex = 0
                        this.selectedListItem = this.menuElement.getElementsByTagName('li')[0]
                    }
                    this.selectedListItem.querySelector('a').focus()
                } else {
                    this.tabIndex = 0
                    this.selectedListItem = this.menuElement.getElementsByTagName('li')[0]
                    this.selectedListItem.querySelector('a').focus()
                }
            // when pressing arrow UP or Tab with SHIFT key pressed
            // start focusing on list elements (one by one) starting from the already selected one
            // or if none is selected from the first one
            } else if (event.code === 'ArrowUp' || (event.code === 'Tab' && event.shiftKey)) {
                if (this.selectedListItem) {
                    this.tabIndex--
                    this.selectedListItem.querySelector('a').blur()
                    const next = this.menuElement.getElementsByTagName('li')[this.tabIndex]
                    if (typeof next !== 'undefined' && this.tabIndex >= 0) {
                        this.selectedListItem = next
                    } else {
                        this.tabIndex = listLength
                        this.selectedListItem = this.menuElement.getElementsByTagName('li')[listLength]
                    }
                    this.selectedListItem.querySelector('a').focus()
                } else {
                    this.tabIndex = 0
                    this.selectedListItem = this.menuElement.getElementsByTagName('li')[listLength]
                    this.selectedListItem.querySelector('a').focus()
                }
            }
        },
        borderColor (color) {
            departmentHelper.getBorderColor(color)
        },
        searchedLabel (item) {
            if (this.search !== '' && item.label.toLowerCase().includes(this.search.toLowerCase())) {
                return item.label.replace(new RegExp(this.search, 'gi'), (match) => `<span class="found">${match}</span>`)
            }
            return item.label
        },
        getClassList (item) {
            let classList = [
                'menu-item',
                {
                    selected: this.isSelectedItem(item),
                    disabled: item.disabled,
                    'has-subtitle': item.subTitle,
                },
            ]

            if (!item.classes) {
                classList = classList.concat(item.classes)
            }

            return classList
        },

        isSelectedItem (item) {
            return this.selectedItem === item || (this.selectedItem === null && item.key === '-') || item.selected
        },
        getItemWithKey (key) {
            return this.items.filter(item => item.key === key)[0]
        },
        setSelectedItem (key) {
            this.selectedItem = this.getItemWithKey(key)
        },
        onClick (action, item) {
            this.setSelectedItem(item.key)
            this.search = ''
            if (typeof action !== 'function') {
                this.$emit('item-clicked', item)
                this.$emit('item-selected', item)
                return
            }
            this.close(item)
            action(item)
        },
        onClickSimple (item) {
            this.setSelectedItem(item.key)
            this.search = ''
            this.$emit('item-clicked', item.action)
            this.$emit('item-selected', item)
            if (typeof item.otherAction === 'function') {
                item.otherAction()
            }
            this.close()
        },
        close (item) {
            this.$emit('close', item)
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/shaddows.scss';
    @import '@/assets/scss/_colors.scss';
    .context-menu {
        overflow: auto;
        background: $white;
        .menu-item {
            &:hover, a:focus, a:focus-visible {
                outline: none;
                background-color: var(--grey-20);
            }
            &:active {
                background-color: var(--blue-80);
                transition: background-color .1s ease-out;
            }
            &.selected {
                background-color: lighten($primary-color, 35%);
            }
            &.selected a, &.selected span {
                font-weight: 700;
                color: $primary-color;
                .sub-title {
                    font-weight: 600;
                }
            }
            &.disabled {
                cursor: not-allowed;
                background-color: var(--grey-30);
                > * {
                    pointer-events: none;
                    color: var(--grey-80);
                }
            }
            &-search {
                padding: 2px 7px;
                position: sticky;
                top: 0;
                margin-top: 0;
                background-color: white;
            }
            &-check {
                padding: 5px;
                cursor: pointer;
            }
            .list-icon {
                display: inline-block;
                margin: 0 10px;
            }
            .sub-title {
                color: var(--grey-80) !important;
            }
        }

        .menu-item a, .menu-item span:not(.material-design-icon):not(.searched-label),
        .no-results {
            width: 100%;
            padding: 16px 18px;
            font-size: .8rem;
            line-height: 1rem;
            text-decoration: none;
            color: $dark-gray;
            white-space: nowrap;
            display:block;
            &:hover {
                cursor: pointer;
            }
        }
        .menu-item {
            display: grid;
            grid-auto-flow: column;
            align-items: baseline;
            &.has-subtitle {
                a {
                    padding: 9px 18px;
                }
            }
        }
        &.search-menu {
            border-bottom: 1px solid $border-color;
        }
    }
    .inactive-tag {
        float: right;
        margin-top: -22px !important;
    }
</style>

<style lang="scss">
    @import '@/assets/scss/_colors.scss';
    .context-menu {
        .found {
            color:$primary-color;
            font-weight: 700;
            text-decoration: underline;
        }
        .menu-item-search {
            .material-design-icon {
                right: 0;
                top: 0;
                bottom: 0;
                margin: 0;
                display: flex;
                align-items: center;
            }
        }
    }
</style>
