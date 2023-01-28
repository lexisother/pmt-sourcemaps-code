<template>
    <div
        id="top-bar"
        :class="getClassList()"
    >
        <div
            v-if="isLeftSlotFilled()"
            class="left"
            :class="leftClass"
            :style="leftStyle"
        >
            <FiltersFlyOut
                v-if="showFlyOutFilters"
                ref="filtersFlyOut"
                :departments="departments"
                :selected-date="selectedDate"
            >
                <template #departments="{item}">
                    <slot
                        name="departemnt-filter"
                        :item="item"
                    />
                </template>
                <template #age="{item}">
                    <slot
                        name="age"
                        :item="item"
                    />
                </template>
                <template #contractTypes="{item}">
                    <slot
                        name="contract-types"
                        :item="item"
                    />
                </template>
                <template #competences="{item}">
                    <slot
                        name="competences"
                        :item="item"
                    />
                </template>
                <template #pendingRequests="{item}">
                    <slot
                        name="pending-requests"
                        :item="item"
                    />
                </template>
            </FiltersFlyOut>
            <!-- DEFAULT SLOT -->
            <slot />
            <div
                v-if="showSearch"
                class="search-input-container"
            >
                <PInput
                    id="pageSearchInput"
                    ref="pageSearchInput"
                    v-model.trim="searchModel"
                    cy_id="pageSearchInput"
                    name="Search"
                    :placeholder="$t('ui.singles.search')"
                    append-icon="magnify"
                    clearable
                    dense
                    input-style="background: 'white'; border-color: var(--grey-30)"
                    class="my-2"
                    :disabled="disabledSearch"
                    has-value
                />
            </div>
        </div>
        <div
            class="right"
            :class="rightClass"
            :style="rightStyle"
        >
            <TopbarRightMenuItems
                ref="topbar_right"
                v-bind="$props"
                @info="$emit('info')"
                @show-birthdays="$emit('show-birthdays')"
                @find-substitutes="$emit('find-substitutes')"
                @request-time-off="$emit('request-time-off')"
                @full-screen="$emit('full-screen')"
                @print="$emit('print', $event)"
            />
        </div>
        <div
            v-if="$slots.right"
            class="right right-slot"
            :class="rightClass"
            :style="rightStyle"
        >
            <slot name="right" />
        </div>
        <VProgressLinear
            v-if="loading"
            ref="loadingIndicator"
            :active="loading"
            :indeterminate="loading"
            absolute
            bottom
            height="2"
        />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'TopBar',
    components: {
        TopbarRightMenuItems: () => import('@/components/ui/top-bar/TopBarRightMenuItems.vue'),
        FiltersFlyOut: () => import('@/components/ui/fly-out/FiltersFlyOut'),
    },
    props: {
        narrow: {
            type: Boolean,
            default: false,
        },
        // This will be deprecated when all pages will use fly-out filters. Should be replaced by showFilters
        showFlyOutFilters: {
            type: Boolean,
            default: false,
        },
        showInfo: {
            type: Boolean,
            default: false,
        },
        showBirthdays: {
            type: Boolean,
            default: false,
        },
        showFindSubstitutes: {
            type: Boolean,
            default: false,
        },
        showRequestTimeOff: {
            type: Boolean,
            default: false,
        },
        showPrint: {
            type: Boolean,
            default: false,
        },
        openPrint: {
            type: Boolean,
            default: true,
        },
        printOrientationLandscape: {
            type: Boolean,
            default: false,
        },
        showFullScreenButton: {
            type: Boolean,
            default: false,
        },
        showPrintExcelDepartmentSchedule: {
            type: Boolean,
            default: false,
        },
        showEmailScheduleButton: {
            type: Boolean,
            default: false,
        },
        showSearch: {
            type: Boolean,
            default: false,
        },
        searchOffset: {
            type: Boolean,
            default: false,
        },
        search: {
            type: String,
            default: '',
        },
        disabledSearch: {
            type: Boolean,
            default: false,
        },
        useSearchDebounce: {
            type: Boolean,
            default: true,
        },
        disabledFilters: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        leftSideOpen: {
            type: Boolean,
            default: false,
        },
        rightSideOpen: {
            type: Boolean,
            default: false,
        },
        leftClass: {
            type: [Object, Array, String],
            default: undefined,
        },
        rightClass: {
            type: [Object, Array, String],
            default: undefined,
        },
        leftStyle: {
            type: [Object, Array, String],
            default: undefined,
        },
        rightStyle: {
            type: [Object, Array, String],
            default: undefined,
        },
        departments: {
            type: Array,
            default: () => ([]),
        },
        selectedDate: {
            type: Object,
            default: () => (undefined),
        },
        shadow: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            search_timeout: null,
        }
    },
    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
            HAS_FILTERS: 'HAS_FILTERS',
        }),
        searchModel: {
            get () {
                return this.search
            },
            set (newVal) {
                if (this.useSearchDebounce) {
                    if (this.search_timeout) clearTimeout(this.search_timeout)
                    this.search_timeout = setTimeout(() => {
                        this.$emit('search', newVal)
                    }, 300)
                } else {
                    this.$emit('search', newVal)
                }
            },
        },
    },
    methods: {
        getClassList () {
            return {
                'top-bar': true,
                narrow: this.narrow,
                'top-bar-mobile': this.IS_MOBILE,
                'open-left-side': this.leftSideOpen,
                'open-right-side': this.rightSideOpen,
                shadow: this.shadow,
            }
        },
        isLeftSlotFilled () {
            return !!this.$slots.default || this.showSearch || this.showFlyOutFilters
        },
        isRightSlotFilled () {
            return !!this.$slots.right
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/main.scss';
    @import '@/assets/scss/layout.scss';

    #top-bar {
        height: 48px; /* IE <= 11 fallback */
        height: var(--top-bar-height);
        border-bottom-width: var(--top-bar-border-width);
        border-bottom-style: solid;
        border-bottom-color: $border-color;
        background-color: $white;
        position: sticky;
        top: 0;
        z-index: 3;
        box-shadow: var(--top-bar-shadow);
        padding: 0 8px;
        transition: margin $side-bar-speed;
        display: flex;
        justify-content: space-between;
        align-items: center;
        align-content: center;
        &.shadow {
            --top-bar-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        .left, .right, .right-slot {
            height: 100%;
            display: flex;
            justify-content: space-evenly;
            align-items: center;
            align-content: center;
        }
        .right, .right-slot {
            margin-left: auto;
        }
        &.narrow .container {
            margin: 0 auto;
            max-width: 900px;
        }
        &.center .container {
            text-align: center;
        }

        .search-input-container {
            width: 224px;
            padding: 0 16px;
        }
    }

    .bar-search {
        width: inherit !important;
        margin: 4px 0;
    }

    @media screen and #{$min-media-query-medium} {
        #top-bar {
            padding: 0 16px;
        }
        .left, .right, .right-slot {
            gap: 5px;
        }
        .open-right-side {
            margin-right: $right-side-bar-width;
            margin-right: var(--right-side-bar-width);
        }
        .open-left-side {
            margin-left: $left-side-bar-width;
            margin-left: var(--left-side-bar-width);
        }
    }

    .top-bar-mobile {
        .bar-search {
            max-width: 100px;
        }
    }

    @media print {
        #top-bar {
            display: none;
        }
    }
</style>

<style lang="scss">
    @import '@/assets/scss/main.scss';
    @import '@/assets/scss/mixins/_breakpoints.scss';

    :root {
        --topbar-border-bottom-width: 0;
    }
    #top-bar {
        .search-offset {
            margin-left: -6px;

            @include bp-sm {
                margin-left: calc((100vw - 720px)/2);
            }

            @include bp-md {
                margin-left: calc((100vw - 976px)/2);
            }

            @include bp-lg {
                margin-left: calc((100vw - 1148px)/2);
            }
        }
    }
</style>
