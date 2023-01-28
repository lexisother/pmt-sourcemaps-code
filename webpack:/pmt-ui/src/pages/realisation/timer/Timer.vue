<template>
    <div>
        <TimerTopBar
            v-if="IS_MOBILE"
            ref="mobileTopbar"
            :show="mobileTopbarItems"
        />
        <TimerTopBar
            ref="desktopTopbar"
            :show="desktopTopbarItems"
            :all-collapsed="allCollapsed"
            :all-expanded="allExpanded"
            @collapse-all="collapseAll"
            @expand-all="expandAll"
            @collapse-or-expand-all="collapseOrExpandAll"
        />
        <PmtLayout fixed-height>
            <PmtContent>
                <VContainer>
                    <VRow>
                        <VCol
                            v-if="IS_LOADING"
                            class="col-12"
                        >
                            <RoundSpinner
                                loading
                                :size="24"
                            />
                        </VCol>
                    </VRow>
                    <VRow v-if="TIMERS_DATA && dataDepth === 0">
                        <VCol class="col-12 expansion-panels-container">
                            <VExpansionPanels
                                v-model="expandedPanels"
                                multiple
                                class="timer-card-panels"
                            >
                                <VExpansionPanel
                                    v-for="(item, i) in TIMERS_DATA"
                                    :key="i"
                                    :style="[departmentBorderColor(item)]"
                                    class="timer-card timer-card-expansion-panel"
                                >
                                    <TimerHeader
                                        :permissions="currentUserPermissions"
                                        :timer-data="item"
                                    />
                                    <VExpansionPanelContent
                                        class="group-panel-content"
                                        :class="item.timerStatus"
                                    >
                                        <TimerSchedule :timer-data="item" />
                                        <TimerEventSummary
                                            v-if="PAGE_WIDTH < 600"
                                            :timer-data="item"
                                        />
                                    </VExpansionPanelContent>
                                </VExpansionPanel>
                            </VExpansionPanels>
                        </VCol>
                    </VRow>
                    <VRow v-if="TIMERS_DATA && dataDepth > 0">
                        <PmtGrouping
                            :groups="TIMERS_DATA"
                            :data-depth="dataDepth"
                            :departments="GROUP_ON[0] === 'department' ? departments : null"
                        >
                            <template #header="{ identifier }">
                                <ChevronRight :size="12" />
                                <h3>{{ translateState(identifier) }}</h3>
                                <VBadge
                                    :color="`var(--grey-80)`"
                                    :content="groupItemsAmount(identifier)"
                                    inline
                                    class="ml-3"
                                />
                            </template>
                            <template #items="{ items, identifier }">
                                <template v-if="dataDepth === 2">
                                    <PmtGrouping
                                        :groups="items"
                                        sub
                                        :data-depth="dataDepth"
                                        :departments="GROUP_ON.includes('department') ? departments : null"
                                    >
                                        <template #header="{ subIdentifier }">
                                            <ChevronRight :size="12" />
                                            <h4>{{ translateState(subIdentifier) }}</h4>
                                            <VBadge
                                                :color="`var(--grey-60)`"
                                                :content="TIMERS_DATA[identifier][subIdentifier].length"
                                                inline
                                                class="ml-3 small"
                                            />
                                        </template>
                                        <template #items="{ subItems, subIdentifier }">
                                            <VExpansionPanels
                                                v-model="expandedGroupPanels[`${identifier}-${subIdentifier}`]"
                                                multiple
                                                class="timer-card-panels"
                                            >
                                                <VExpansionPanel
                                                    v-for="(item, index) in subItems"
                                                    :key="index"
                                                    class="timer-card"
                                                >
                                                    <TimerHeader
                                                        :permissions="currentUserPermissions"
                                                        :timer-data="item"
                                                    />
                                                    <VExpansionPanelContent
                                                        class="group-panel-content"
                                                        :class="item.timerStatus"
                                                    >
                                                        <TimerSchedule :timer-data="item" />
                                                        <TimerEventSummary
                                                            v-if="PAGE_WIDTH < 600"
                                                            :timer-data="item"
                                                        />
                                                    </VExpansionPanelContent>
                                                </VExpansionPanel>
                                            </VExpansionPanels>
                                        </template>
                                    </PmtGrouping>
                                </template>
                                <template v-else>
                                    <VExpansionPanels
                                        v-model="expandedGroupPanels[identifier]"
                                        multiple
                                        class="timer-card-panels"
                                    >
                                        <VExpansionPanel
                                            v-for="(item, index) in items"
                                            :key="index"
                                            class="timer-card"
                                        >
                                            <TimerHeader
                                                :permissions="currentUserPermissions"
                                                :timer-data="item"
                                            />
                                            <VExpansionPanelContent
                                                class="group-panel-content"
                                                :class="item.timerStatus"
                                            >
                                                <TimerSchedule :timer-data="item" />
                                                <TimerEventSummary
                                                    v-if="PAGE_WIDTH < 600"
                                                    :timer-data="item"
                                                />
                                            </VExpansionPanelContent>
                                        </VExpansionPanel>
                                    </VExpansionPanels>
                                </template>
                            </template>
                        </PmtGrouping>
                    </VRow>
                </VContainer>
            </PmtContent>
        </PmtLayout>
        <ArticleHelper
            v-if="!IS_LOADING && $route.meta.settingsRoute === 'timer' && !IS_SUPER_ADMIN"
            label="timer_intro"
            :route="'timer'"
            page="timerPage"
        />
    </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'
import { timerEnums } from './constants/timerConstants'

export default {
    name: 'Timer',
    components: {
        TimerHeader: () => import('./components/TimerHeader'),
        TimerSchedule: () => import('./components/schedule/TimerSchedule'),
        TimerTopBar: () => import('./components/TimerTopBar'),
        PmtGrouping: () => import('@/components/ui/cards/PmtGrouping'),
        TimerEventSummary: () => import('./components/TimerEventSummary.vue'),
    },
    data () {
        return {
            expandedPanels: [],
            expandedGroupPanels: {},
            globalCardStateExpanded: false,
            showRemoveRealisationDialog: false,
            removeRealisationPayload: null,
            showShiftPopover: false,
            shift: null,
            initGroupOn: 'status',
            mobileTopbarItems: {
                filters: true,
                search: true,
                timerNoSchedule: false,
                groupingAndSorting: false,
                collapseAndExpand: false,
            },
        }
    },
    computed: {
        ...mapGetters('auth', ['permissions', 'user', 'IS_SUPER_ADMIN']),
        ...mapState('account', ['userSettings']),
        ...mapGetters('stores', ['currentStore']),
        ...mapState('realisation/timer', ['groupOn', 'loading']),
        ...mapGetters('departments', { departments: 'all' }),
        ...mapGetters([
            'IS_MOBILE',
            'PAGE_WIDTH',
            'COLLAPSED_SECTIONS',
            'APPLIED_FILTERS_COUNT',
        ]),
        ...mapGetters('realisation/timer', ['TIMERS_DATA', 'GROUP_ON', 'IS_LOADING']),

        dataDepth () {
            return this.GROUP_ON.length
        },

        currentUserPermissions () {
            return {
                currentUserId: this.user?.accountId,
                timerAssesment: this.permissions?.planning.clocktimes.modules.timer_assessment,
                assessment: this.permissions?.user.assessment.modules.assessment,
                assesmentsOthersEdit: this.permissions?.user.assessment.rights.assessment_others_edit,
                assesmentsYoursEdit: this.permissions?.user.assessment.rights.assessment_yours_edit,
            }
        },

        desktopTopbarItems () {
            return {
                filters: !this.IS_MOBILE,
                search: !this.IS_MOBILE,
                timerNoSchedule: true,
                loading: false,
                groupingAndSorting: true,
                collapseAndExpand: true,
            }
        },
        allCollapsed () {
            let output = false
            if (this.GROUP_ON.length) {
                output = this.expandedGroupPanelsCounter === 0
            } else {
                output = this.expandedPanels.length === 0
            }
            return output
        },
        allExpanded () {
            let output = false
            if (this.GROUP_ON.length) {
                output = this.expandedGroupPanelsCounter === this.timersCounter
            } else {
                output = this.expandedPanels.length === this.timersCounter
            }
            return output
        },
        expandedGroupPanelsCounter () {
            let counter = 0
            Object.keys(this.expandedGroupPanels).forEach(key => {
                counter += this.expandedGroupPanels[key].length
            })
            return counter
        },
        timersCounter () {
            let counter = 0
            if (this.dataDepth > 0) {
                for (const key of Object.keys(this.TIMERS_DATA)) {
                    if (this.dataDepth === 2) {
                        for (const subKey of Object.keys(this.TIMERS_DATA[key])) {
                            counter += this.TIMERS_DATA[key][subKey].length
                        }
                    } else {
                        counter += this.TIMERS_DATA[key].length
                    }
                }
            } else {
                counter = this.TIMERS_DATA.length
            }
            return counter
        },
    },
    watch: {
        dataDepth () {
            this.$nextTick(() => {
                this.collapseOrExpandAll()
            })
        },
        APPLIED_FILTERS_COUNT () {
            this.$nextTick(() => {
                this.collapseOrExpandAll()
            })
        },
    },
    async mounted () {
        await this.getTimersToday()
        await this.updateFilters()
        this.setGrouping()
        this.setSorting()
        this.setSortAscending()
    },
    methods: {
        ...mapActions('realisation/timer', ['getTimersToday']),
        ...mapMutations(['UPDATE_ENABLED_FILTERS']),
        ...mapMutations('realisation/timer', ['SET_GROUP_ON', 'SET_SORT_ON', 'SET_SORT_ASCENDING']),
        translateState (value) {
            switch (value) {
                case timerEnums.SCHEDULED:
                    return this.$t('pages.timerPage.scheduled')
                case timerEnums.WORKING:
                    return this.$t('pages.timerPage.working')
                case timerEnums.IN_LATE:
                    return this.$t('pages.timerPage.inLate')
                case timerEnums.PAUSED:
                    return this.$t('pages.timerPage.paused')
                case timerEnums.READY:
                    return this.$t('pages.timerPage.ready')
                default:
                    return value
            }
        },

        departmentBorderColor (value) {
            if (this.groupOn.includes('department')) {
                return {
                    borderLeft: `4px solid ${Object.values(value).flat()?.find(item => item).departmentColor}`,
                }
            }
        },
        updateFilters () {
            this.UPDATE_ENABLED_FILTERS({
                timerPlanned: true,
                timerTooLate: true,
                timerWorking: true,
                timerPaused: true,
                timerReady: true,
                age: true,
                timerAge: true,
                departments: true,
                status: true,
            })
        },
        collapseOrExpandAll () {
            if (this.globalCardStateExpanded) {
                this.expandAll()
            } else {
                this.collapseAll()
            }
        },
        collapseAll () {
            this.expandedPanels = []
            this.expandedGroupPanels = {}
            this.globalCardStateExpanded = false
        },
        expandAll () {
            if (this.dataDepth === 0) {
                this.expandedPanels = Array.from({ length: Object.keys(this.TIMERS_DATA).length }, (v, k) => k)
            } else {
                const expanded = {}
                for (const key of Object.keys(this.TIMERS_DATA)) {
                    if (this.dataDepth === 2) {
                        for (const subKey of Object.keys(this.TIMERS_DATA[key])) {
                            expanded[`${key}-${subKey}`] = Array.from({ length: this.TIMERS_DATA[key][subKey].length }, (v, k) => k)
                        }
                    } else {
                        expanded[key] = Array.from({ length: this.TIMERS_DATA[key].length }, (v, k) => k)
                    }
                }
                this.expandedGroupPanels = expanded
            }
            this.globalCardStateExpanded = true
        },
        /**
         * Set grouping settings if saved in user preferences (or default if not available)
         */
        setGrouping () {
            const timerSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            if (timerSettings?.settings?.settings?.timerGroupOn) {
                // grouping option has been stored previously, load into vuex
                this.SET_GROUP_ON(timerSettings?.settings?.settings?.timerGroupOn)
            } else {
                this.SET_GROUP_ON(['status'])
            }
        },
        /**
         * Set sorting settings if saved in user preferences (or default if not available)
         */
        setSorting () {
            const timerSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            if (timerSettings?.settings?.settings?.timerSortOn) {
                // sorting options have been stored previously, load into vuex
                this.SET_SORT_ON(timerSettings.settings.settings.timerSortOn)
            } else {
                // no stored sorting options, select default
                this.SET_SORT_ON('startTime')
            }
        },
        /**
         * Set sorting direction if saved in user preferences (or default if not available)
         */
        setSortAscending () {
            const timerSettings = this.userSettings.find(o => o.screen === this.$route.meta.settingsRoute)
            if (timerSettings?.settings?.settings?.timerSortAscending !== undefined) {
                // sorting options have been stored previously, load into vuex
                this.SET_SORT_ASCENDING(timerSettings.settings.settings.timerSortAscending)
            } else {
                // no stored sorting options, select default
                this.SET_SORT_ASCENDING(true)
            }
        },
        groupItemsAmount (identifier) {
            if (this.dataDepth === 2) {
                let counter = 0
                for (const [key, value] of Object.entries(this.TIMERS_DATA[identifier])) {
                    counter += this.TIMERS_DATA[identifier][key].length
                }
                return counter
            }
            return this.TIMERS_DATA[identifier].length
        },
    },
}
</script>
<style lang="scss" scoped>
@import '@/assets/scss/_colors.scss';
@import '@/assets/scss/mixins/_breakpoints.scss';

.container {
    max-width: 100vw !important;
    margin: 0 !important;

    @include bp-xl {
        max-width: 1904px !important;
        margin: 0 auto !important;
    }

    .expansion-panels-container {
        margin: 0;
        padding: 0;
    }
}

:deep() .v-expansion-panel-content__wrap {
    padding: 0;
}

:deep()
    .v-expansion-panel--active
    > .v-expansion-panel-header--active
    .v-expansion-panel-header__icon:not(.v-expansion-panel-header__icon--disable-rotate)
    .v-icon {
    transform: rotate(90deg);
}

.v-expansion-panel--active + .v-expansion-panel, .v-expansion-panel--active:not(:first-child) {
    margin-top: 8px;
}

.timer-card {
    border-top: 1px solid var(--grey-30);
    color: #667780;

    .header-parent {
        background-color: var(--grey-20);
        padding-left: 5px;

        .icon {
            font-weight: 400;
        }
    }

    .header-parent-second-value {
        h5 {
            font-style: normal;
            font-weight: normal;
            font-size: 11px;
            line-height: 15px;
        }
    }

    .header-parent-third-value {
        .left {
            h5 {
                font-style: normal;
                font-weight: normal;
                font-size: 11px;
                line-height: 15px;
            }
        }
    }

    &-green {
        border-left: 5px solid var(--green-100);
    }

    &-grey {
        border-left: 5px solid var(--blue-80);
    }

    &-red {
        border-left: 5px solid var(--red-80);
    }

    &-blue {
        border-left: 5px solid var(--blue-80);
    }

    .group-panel-content {
        border-left: 32px solid var(--grey-20);

        :deep() .v-expansion-panel-content__wrap {
            box-shadow: none !important;
        }

        &.late {
            border-left-color: var(--red-20);
        }

        &.working, &.paused {
            border-left-color: var(--green-20);
        }

        &.ready {
            border-left-color: var(--blue-20);
        }
    }
}

:deep(.v-badge) {

    .v-badge__wrapper {
        font-weight: 700;

        & > * {
            font-size: 12px;
        }
    }

    &.small .v-badge__wrapper {
        & > * {
            min-width: 16px;
            height: 16px;
            padding: 0;
            margin-top: 2px;
            font-size: 10px;
            line-height: 16px;
        }
    }
}
</style>
