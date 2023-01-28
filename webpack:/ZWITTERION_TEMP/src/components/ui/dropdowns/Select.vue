<template>
    <div
        class="select"
    >
        <VMenu
            v-model="menuIsDisplayed"
            offset-y
            max-height="240"
            :close-on-content-click="multiselect ? false : true"
        >
            <template #activator="{ on, attrs }">
                <label
                    v-if="label"
                    :class="{ disabled: disabled, danger: danger, required: required }"
                >
                    {{ label }}
                </label>
                <div
                    class="text-input"
                    :class="{ disabled: disabled, danger: danger, dense: dense }"
                    v-bind="attrs"
                    v-on="on"
                >
                    <input
                        v-model="searchString"
                        type="text"
                        :readonly="!searchable || readonly"
                        :disabled="disabled"
                        :placeholder="displayedPlaceholder"
                        :class="{ 'is-crud-input': isCrudInput, 'full-border': fullBorder, dense, 'no-margin': !label }"
                        @clear="searchString = ''"
                    >
                    <span
                        v-if="searchString && searchString.length"
                        class="show-clear"
                        tabIndex="-1"
                    >
                        <PmtButton
                            v-ripple
                            danger
                            round
                            inverted
                            icon="close"
                            icon-size="16"
                            @click="searchString = ''"
                        />
                    </span>
                    <ChevronDown
                        v-if="!searchString && !readonly"
                        :size="24"
                        :class="{ rotate: menuIsDisplayed && !disabled }"
                    />
                    <VBadge
                        v-if="multiselect && showBadge && badgeNumber"
                        :content="badgeNumber"
                        color="grey lighten-1"
                    />
                </div>
            </template>
            <VList v-if="!disabled && !readonly">
                <VListItem
                    v-for="item in filteredItems"
                    :key="item[valueIdentifier]"
                    :class="{ selected: alreadySelected(item) }"
                    :disabled="item.disabled"
                    @click="toggleSelect(item)"
                >
                    <span
                        class="label"
                        v-html="item[labelIdentifier]"
                    />
                    <DeleteForever
                        v-if="alreadySelected(item) && multiselect"
                        :size="20"
                    />
                    <Plus
                        v-else-if="multiselect"
                        :size="20"
                    />
                </VListItem>
                <VListItem
                    v-if="searchString.length && !filteredItems.length"
                >
                    {{ $t('ui.singles.noResultsFound') }}
                </VListItem>
            </VList>
        </VMenu>
    </div>
</template>

<script>
import stringHelper from '@/libraries/stringHelper'
import objectHelper from '@/libraries/objectHelper'

export default {
    name: 'Select',
    props: {
        label: {
            type: String,
            default: '',
        },
        value: {
            type: [Array, Number],
            default () { return [] },
        },
        items: {
            type: Array,
            default () { return [] },
        },
        placeholder: {
            type: String,
            default: '',
        },
        required: {
            type: Boolean,
            default: false,
        },
        valueIdentifier: {
            type: String,
            default: 'value',
        },
        labelIdentifier: {
            type: String,
            default: 'label',
        },
        multiselect: {
            type: Boolean,
            default: false,
        },
        searchable: {
            type: Boolean,
            default: false,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        showBadge: {
            type: Boolean,
            default: true,
        },
        isCrudInput: {
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
        displaySelectedFirst: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            menuIsDisplayed: false,
            searchString: '',
            selected: JSON.parse(JSON.stringify(this.value)),
        }
    },
    computed: {
        filteredItems () {
            let output = this.items
            if (this.displaySelectedFirst) {
                output = this.sortBySelected(output)
            }
            if (this.searchString && this.searchString.length > 1) {
                const fields = [this.labelIdentifier]
                return objectHelper.filterOnSearchString(JSON.parse(JSON.stringify(output)), this.searchString, fields, 2)
            }
            return output
        },
        displayedPlaceholder () {
            let output = this.placeholder

            if (this.selected && this.selected[0] && this.selected[0][this.labelIdentifier]) {
                output = this.selected.map(o => o[this.labelIdentifier]).join(', ')
            }
            return output
        },
        badgeNumber () {
            if (this.selected && this.selected.length) {
                return this.selected.length
            }
            return null
        },
    },
    watch: {
        value (newValue) {
            this.selected = newValue
        },
    },
    methods: {
        alreadySelected (item) {
            if (!this.selected) {
                return false
            }
            if (this.selected[0] && this.selected[0][this.labelIdentifier] && this.selected.find(o => o[this.valueIdentifier] === item[this.valueIdentifier])) {
                return true
            }
            return false
        },
        /**
        * Add or remove item from selection
        */
        toggleSelect (item) {
            item[this.labelIdentifier] = stringHelper.stripHtmlTags(item[this.labelIdentifier])

            if (this.multiselect) {
                if (this.alreadySelected(item)) {
                    const index = this.selected.findIndex(o => o[this.valueIdentifier] === item[this.valueIdentifier])
                    if (index > -1) {
                        this.selected.splice(index, 1)
                    }
                } else {
                    this.selected.push(item)
                }
            } else {
                this.selected = []
                this.selected.push(item)
                this.searchString = ''
            }

            if (!this.selected.length && this.required) {
                return
            }
            this.$emit('input', this.selected)
        },
        /**
         * Display selected items first in list if prop displaySelectedFirst is true
         */
        sortBySelected (list) {
            const sortedList = []

            // fill array with selected items first...
            list.forEach(item => {
                if (this.selected.findIndex(o => o[this.valueIdentifier].toString() === item[this.valueIdentifier].toString()) > -1) {
                    sortedList.push(item)
                }
            })
            // ... the fill up with unselected ones
            list.forEach(item => {
                if (this.selected.findIndex(o => o[this.valueIdentifier].toString() === item[this.valueIdentifier].toString()) < 0) {
                    sortedList.push(item)
                }
            })
            return sortedList
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';
    @import '@/assets/scss/mixins/_ellipsis.scss';
    @import '@/assets/scss/_colors.scss';

    .select {
        position: relative;
        width: 100%;
        display: block;

        label {
            margin-bottom: -3px;

            &.disabled {
                color: var(--grey-80);
            }

            &.danger {
                color: $fail-color;
            }
        }

        .text-input {
            cursor: pointer;

            input {
                box-sizing: border-box;
                width: 100%;
                height: 40px;
                margin-top: 4px;
                padding: 7px 32px 7px 8px;
                font-size: 12px;
                font-weight: 400;
                line-height: 24px !important;
                transition: all .2s ease-in;
                border: 1px solid var(--grey-10);
                border-radius: 3px;
                background-color: var(--grey-10);
                cursor: pointer;
                @include ellipsis;

                &.is-crud-input, &.no-margin {
                    margin-top: 0;
                }

                &:hover {
                    border-color: $grey-100;
                }

                &:focus {
                    border-color: $primary-color;
                }

                &:disabled {
                    cursor: not-allowed;
                    background-color: $disabled-background-color;
                    border-color: $disabled-background-color;
                }

                &.full-border {
                    border: 1px solid var(--grey-80);
                }

                &.dense {
                    height: 32px;
                    min-height: 32px;
                    padding: 3px 8px;
                }
            }

            ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
                color: $grey-140;
                opacity: 1;
            }

            ::-moz-placeholder { /* Firefox 19+ */
                color: $grey-140;
                opacity: 1;
            }

            :-ms-input-placeholder { /* IE 10+ */
                color: $grey-140;
                opacity: 1;
            }

            :-moz-placeholder { /* Firefox 18- */
                color: $grey-140;
                opacity: 1;
            }

            input:focus::-webkit-input-placeholder { /* Chrome/Opera/Safari */
                color: $grey-80;
                opacity: 1;
            }
            input:focus::-moz-placeholder { /* Firefox 19+ */
                color: $grey-80;
                opacity: 1;
            }
            input:focus:-ms-input-placeholder { /* IE 10+ */
                color: $grey-80;
                opacity: 1;
            }
            input:focus:-moz-placeholder { /* Firefox 18- */
                color: $grey-80;
                opacity: 1;
            }

            .show-clear{
                position: absolute;
                height: 34px;
                bottom: 3px;
                right: 2px;
            }

            .material-design-icon {
                position: absolute;
                height: 24px;
                bottom: 8px;
                right: 8px;
                color: $grey-100;

                .material-design-icon__svg {
                    vertical-align: top;
                    transition: all 0.3s;
                }

                &.rotate .material-design-icon__svg {
                    transform: rotate(180deg);
                }
            }

            input.dense + .material-design-icon {
                bottom: 4px;
            }

            .v-badge {
                right: 52px;
                top: 2px;
            }

            &.disabled {
                ::-webkit-input-placeholder { /* Chrome/Opera/Safari */
                    color: $grey-80;
                    opacity: 1;
                }

                ::-moz-placeholder { /* Firefox 19+ */
                    color: $grey-80;
                    opacity: 1;
                }

                :-ms-input-placeholder { /* IE 10+ */
                    color: $grey-80;
                    opacity: 1;
                }

                :-moz-placeholder { /* Firefox 18- */
                    color: $grey-80;
                    opacity: 1;
                }

                .material-design-icon {
                    color: $grey-80;
                }
            }

            &.danger {
                input {
                    border-bottom: 1px solid $fail-color;
                }
            }

            &.dense {
                input {
                    height: 28px;
                    padding: 1px 32px 1px 8px;
                }

                .material-design-icon {
                    bottom: 2px;
                }

                .v-badge {
                    top: 0;
                }
            }
        }
    }

    :deep() .v-badge__badge {
        font-size: 10px !important;
        font-weight: 700 !important;
    }

    :deep() .v-menu__content {
        width: 100%;
    }

    :deep() .v-list-item {
        width: 100%;
        display: flex;
        justify-content: space-between;
        line-height: 24px;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: 400;
        cursor: pointer;

        strong {
            font-weight: 700;
        }

        &::after {
            display: none;
        }

        &:hover {
            background: var(--grey-10);
        }

        .label {
            max-width: calc(100% - 48px);
            @include ellipsis();
        }

        &.selected {
            background: rgba($primary-color, 0.1);

            &:hover {
                background: rgba($primary-color, 0.2);
            }

            span {
                color: $primary-color;
            }
        }

        &.v-list-item--disabled {
            color: $grey-60;
            background: $grey-10;
        }
    }
</style>
