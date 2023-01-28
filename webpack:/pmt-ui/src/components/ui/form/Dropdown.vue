<template>
    <div
        :id="dropDownId"
        :class="getClassList()"
    >
        <label
            v-if="label"
            class="dropdown-label"
        >
            {{ label }}
        </label>
        <VMenu
            ref="dropdownMenu"
            v-model="showMenu"
            :offset-y="offsetY"
            :max-height="maxMenuHeight"
            :max-width="maxMenuWidth"
            :close-on-content-click="closeOnContentClick && !searchable"
            :close-on-click="true"
            :absolute="absolute"
            :origin="transitionOrigin"
            :transition="transition"
        >
            <template #activator="{ on, value }">
                <slot
                    name="activator"
                    :on="on"
                    :value="value"
                >
                    <PmtButton
                        :id="id"
                        ref="dropdownButton"
                        v-ripple
                        default
                        outline
                        no-margin
                        block
                        :disabled="disabled"
                        v-bind="$attrs"
                        v-on="on"
                    >
                        <span class="label">{{ currentMenuItem.label }}</span>
                        <component
                            :is="value ? 'chevron-up' : 'chevron-down'"
                            :class="{'arrow-icon': true, open: value}"
                            :size="18"
                        />
                    </PmtButton>
                </slot>
            </template>
            <slot
                name="dropdown"
                :items="menuItems"
            >
                <ContextMenu
                    v-if="showMenu"
                    ref="contextMenu"
                    :search-placeholder="searchPlaceholder"
                    :items="menuItems"
                    :searchable="searchable"
                    :search-icon="searchIcon"
                    :filter-by="filterBy"
                    :max-height="maxMenuHeight"
                    @item-selected="itemSelected($event)"
                />
            </slot>
        </VMenu>
    </div>
</template>

<script>
import ContextMenu from '../pickers/ContextMenu.vue'
export default {
    name: 'Dropdown',
    components: {
        ContextMenu,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        searchable: {
            type: Boolean,
            default: false,
        },
        searchIcon: {
            type: String,
            default: '',
        },
        options: {
            type: Array,
            required: true,
        },
        label: {
            type: String,
            default: '',
        },
        placeholder: {
            type: String,
            default: '',
        },
        searchPlaceholder: {
            type: String,
            default: '',
        },
        maxMenuHeight: {
            type: [String, Number],
            default: 400,
        },
        maxMenuWidth: {
            type: [String, Number],
            default: undefined,
        },
        selected: {
            type: Object,
            default: () => (undefined),
        },
        dropDownId: {
            type: String,
            default: '',
        },
        id: {
            type: String,
            default: 'dropdownBtn',
        },
        autoOpen: {
            type: Boolean,
            default: false,
        },
        closeOnContentClick: {
            type: Boolean,
            default: true,
        },
        filterBy: {
            type: Array,
            default: () => ([]),
        },
        offsetY: {
            type: Boolean,
            default: true,
        },
        absolute: Boolean,
        transitionOrigin: {
            type: String,
            default: () => ('top left'),
        },
        transition: {
            type: String,
            default: () => ('scale-transition'),
        },
    },
    data () {
        return {
            currentMenuItem: '',
            showMenu: false,
            menuItems: [],
        }
    },
    watch: {
        options () {
            this.updateMenuItems()
        },
    },
    mounted () {
        this.updateMenuItems()
        this.currentMenuItem = typeof this.selected !== 'undefined' ? this.selected : this.menuItems[0]
        if (this.autoOpen) {
            this.open()
        }
    },
    methods: {
        itemSelected (event) {
            this.$emit('item-selected', event)
            this.$emit('input', event)
            this.currentMenuItem = event
            // close menu after item select
            this.close()
        },
        getClassList () {
            return [
                'dropdown',
                {
                    searchable: this.searchable,
                    open: this.showMenu,
                },
            ]
        },
        toggleMenu (event) {
            this.showMenu = !this.showMenu
        },
        typing () {
            if (!this.showMenu) {
                this.open()
            }
        },
        setAsActiveMenuItem (key) {
            const item = this.menuItems.find(item => item.key === key)
            if (!item) {
                console.error('Error; can\'t find the item with key "' + key + '".')
                return
            }
            this.currentMenuItem = item
            this.$refs.contextMenu.setSelectedItem(item.key)
            this.$emit('input', item)
        },
        updateMenuItems () {
            this.menuItems = this.mapMenuOptions(this.options)
        },
        filterMenuItems () {
            this.menuItems = this.mapMenuOptions(this.options)
        },
        /**
             * Retuns a the given options mapped to menu items objects.
             *
             * @param {Array} options
             * @returns {Array}
             */
        mapMenuOptions (options) {
            const menu = []
            // eslint-disable-next-line no-unused-vars
            for (const n in options) {
                const item = options[n]

                menu.push({
                    ...item,
                    action: this.onClick,
                    otherAction: item.action,
                })
            }
            if (!this.searchable && !!this.placeholder) {
                menu.unshift({
                    key: '-',
                    label: this.placeholder,
                    action: this.onClick,
                })
            }
            return menu
        },
        onClick (item) {
            this.currentMenuItem = item
            if (item && typeof item.otherAction === 'function') {
                item.otherAction()
            }
            this.close()
            this.$emit('on-select', item)
            this.$emit('input', item)
        },
        open () {
            if (this.disabled) {
                return
            }
            this.showMenu = true
        },
        close () {
            this.showMenu = false
        },
    },
}
</script>

<style lang="scss" scoped>
    @import './resources/Dropdown.scss';
</style>
