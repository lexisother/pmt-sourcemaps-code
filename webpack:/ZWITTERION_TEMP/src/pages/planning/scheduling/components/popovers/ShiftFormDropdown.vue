<template>
    <div class="form-field">
        <PmtDropdown
            :ref="type"
            :label="label"
            :options="options"
            :readonly="readonly"
            :offset-y="true"
            :searchable="searchable"
            :search-icon="searchIcon"
            :filter-by="filterBy"
            :selected="selectedItemModel"
            :max-menu-width="385"
            @item-selected="itemSelected($event)"
        >
            <template #activator="{ on, value }">
                <slot
                    name="activator"
                    :on="on"
                    :value="value"
                    :selected="options.find(o => o.selected)"
                >
                    <PmtButton
                        :id="`${type}_activator`"
                        ref="activator"
                        default-grey
                        block
                        no-margin
                        class="form-dropdown"
                        :icon="value ? 'chevron-up' : 'chevron-down'"
                        right-icon
                        :icon-size="15"
                        :disabled="disabled"
                        :readonly="readonly"
                        :active="value"
                        style="margin-top: 2px !important;"
                        v-on="on"
                    >
                        <slot
                            name="selected-text"
                            :selected="options.find(o => o.selected)"
                        >
                            <span :class="{placeholder: placeholder && !inputValue}">{{ inputValue || placeholder }}</span>
                        </slot>
                    </PmtButton>
                </slot>
            </template>
            <template #dropdown>
                <slot name="dropdown" />
            </template>
        </PmtDropdown>
        <a
            v-if="showClear"
            ref="clearSelection"
            class="cancel-lend-out"
            tabindex="0"
            @click="clearInput"
        >
            {{ clearText }}
        </a>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'ShiftFormDropdown',
    mixins: [mixins],
    props: {
        type: {
            type: String,
            default: '',
        },
        options: {
            type: Array,
            default: () => [],
        },
        placeholder: {
            type: String,
            default: '',
        },
        disabled: Boolean,
        searchable: Boolean,
        readonly: Boolean,
        filled: {
            type: Boolean,
            default: true,
        },
        showClear: Boolean,
        selected: {
            type: Object,
            default: () => {},
        },
        hideLabel: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            selectedItem: {},
        }
    },
    computed: {
        filterBy () {
            if (this.type === 'store') {
                return ['store_name', 'store_id', 'retail_store_number', 'store_slug']
            }
            if (this.type === 'bookableHour') {
                return ['type', 'local_description']
            }
            if (this.type === 'bookableHourForeignType') {
                return ['foreign_type', 'foreign_description']
            }
            return []
        },
        clearText () {
            if (this.type === 'store') {
                return this.baseTranslate('shiftPopover.clearStore')
            }
            if (this.type === 'bookableHour' || this.type === 'bookableHourForeignType') {
                return this.baseTranslate('shiftPopover.clearInput')
            }
            return ''
        },
        searchIcon () {
            if (this.type === 'store') {
                return 'store'
            }
            if (this.type === 'bookableHour') {
                return 'timetable'
            }
            if (this.type === 'bookableHourForeignType') {
                return 'euro-icon'
            }
            return ''
        },
        label () {
            if (this.hideLabel) return ''
            if (this.type === 'employee') {
                return this.$t('ui.singles.employee')
            }
            if (this.type === 'store') {
                return this.$t('ui.singles.store')
            }
            if (this.type === 'department') {
                return this.$t('ui.singles.department')
            }
            if (this.type === 'bookableHour') {
                return this.baseTranslate('shiftPopover.nonProductive.bookableHourType')
            }
            if (this.type === 'bookableHourForeignType') {
                return this.baseTranslate('shiftPopover.nonProductive.bookableHourTypeForeignOption')
            }
            return ''
        },
        inputValue () {
            if (this.type === 'employee') {
                return this.selectedItem.name
            }
            if (this.type === 'store') {
                return this.selectedItem.store_name
            }
            if (this.type === 'department') {
                return this.selectedItem.department_name
            }
            if (this.type === 'bookableHour') {
                return this.selectedItem.type ? `${this.selectedItem.type} - ${this.selectedItem.local_description}` : ''
            }
            if (this.type === 'bookableHourForeignType') {
                return this.selectedItem.foreign_type ? `${this.selectedItem.foreign_type} - ${this.selectedItem.foreign_description}` : ''
            }
            return ''
        },
        selectedItemModel () {
            const key = 'id'
            return {
                label: this.label,
                key,
                selected: this.selected,
                value: this.selected,
                disabled: false,
                hidden: false,
                simple: true,
            }
        },
    },
    watch: {
        selected: {
            handler (val) {
                this.selectedItem = val
            },
            deep: true,
        },
    },
    mounted () {
        this.selectedItem = this.selected
    },
    methods: {
        itemSelected (event) {
            if (!event.disabled) {
                this.selectedItem = event.value
                this.$emit('item-selected', event.value)
            }
        },
        clearInput () {
            this.selectedItem = {}
            this.$emit('clear')
        },
        focus () {
            this.$refs.activator.$el.focus()
        },
    },
}
</script>

<style lang="scss" scoped>
@import './styling/scheduling-grid-form.scss';
.placeholder {
    text-transform: none;
    color: var(--grey-80);
}
.form-dropdown {
    display: flex;
    justify-content: space-between;
    align-items: center;
    :deep() .btn-text div {
        float: none !important;
    }
    :deep() .btn-text {
        line-height: 1.2rem;
    }
}
</style>
