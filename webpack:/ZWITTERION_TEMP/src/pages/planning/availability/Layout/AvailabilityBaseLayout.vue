<template>
    <div
        id="availability-scroll"
        :key="$route.name"
        class="availability-layout"
    >
        <router-view />
        <new-weekset
            v-if="$route.name === 'create-weekset' || $route.name === 'manager-create-weekset' || isAccountActivation"
            :opening-times="openingTimes"
            :direction="getNavigationDirection"
        />

        <template v-if="!hideAvailabilityTopbar">
            <AvailabilityTopBar
                v-if="IS_MOBILE && displayTopBar"
                ref="topBarMobile"
                :show="{
                    employeeSelector: true,
                    weeklyOverview: true
                }"
                :mode="$route.meta.mode"
                @weekly-overview="toggleWeeklySidePanel"
            />
            <AvailabilityTopBar
                v-if="displayTopBar"
                ref="topBar"
                :show="{
                    viewSelector: true,
                    datepicker: true,
                    goBack: true,
                    employeeSelector: !IS_MOBILE,
                    weeklyOverview: !IS_MOBILE,
                }"
                :mode="$route.meta.mode"
                :loading="isWeekLoading || loadingStoreTimes"
                @on-date-change="onDatePickerChange"
                @on-toggle-grid="toggleGrid"
                @weekly-overview="toggleWeeklySidePanel"
            />
        </template>

        <pmt-layout
            v-if="!hideAvailabilityTopbar && availabilityEmployeeId"
            ref="layout"
            fixed-height
            :show-right-side="isSidePanelVisible()"
            @on-right-side-show="onSidePanelShow"
            @on-right-side-hide="$emit( 'on-right-side-hide' )"
        >
            <template v-if="checkWeekAvailabilityRoute && showGrid">
                <pmt-transition
                    name="slide"
                    mode="in-out"
                    :direction="getNavigationDirection"
                    :loading="isWeekLoading || loadingStoreTimes"
                >
                    <week-time-grid
                        :key="$route.fullPath"
                        ref="weekTimeGrid"
                        :loading="isWeekLoading || loadingStoreTimes"
                        :start-time="openingTimes.from"
                        :end-time="openingTimes.to"
                        @swipe="navigate($event)"
                    />
                </pmt-transition>
            </template>
            <div :key="monthGridKey">
                <template v-if="checkMonthAvailabilityRoute && $route.name != 'activate-account-finalize'">
                    <pmt-transition
                        name="slide"
                        mode="in-out"
                        :direction="getNavigationDirection"
                        :loading="!showGrid || isMonthLoading"
                    >
                        <month-time-grid
                            v-if="showGrid && !isMonthLoading"
                            :key="$route.fullPath"
                            ref="monthTimeGrid"
                            :scroll="getScrollPosition"
                            @swipe="navigate($event)"
                        />
                    </pmt-transition>
                </template>
            </div>

            <template
                v-if="!$cfg.specialAvailabilityRoutes.includes($route.name)"
                slot="right"
            >
                <pmt-availability-weekly-overview-side-panel
                    v-show="isWeeklyOverviewPanelActive()"
                    :key="$route.name + availabilityEmployeeId"
                    @open="toggleWeeklySidePanel"
                    @close="toggleWeeklySidePanel"
                    @start-fresh="startNewFreshWeekset()"
                    @start-import-recurring="startFromCurrentRecurring()"
                />
            </template>
        </pmt-layout>
        <empty-state
            :show="!hideAvailabilityTopbar && !availabilityEmployeeId"
            component="empty-employee-selection"
            :title="$t('ui.emptyState.availability.noEmployeeSelectedTitle')"
            :sub-title="$t('ui.emptyState.availability.noEmployeeSelectedSubTitle')"
            :size="IS_MOBILE ? 250 : 500"
        />
        <choose-availability-type-form
            v-if="chooseAvailabilityTypePopoverVisible"
            @one-time="openPopover"
            @start-fresh="startNewFreshWeekset()"
            @start-import-recurring="startFromCurrentRecurring()"
        />
        <transition name="slide-fade">
            <availability-entry-form
                v-if="availabilityPopoverVisible"
                @modified="entryFormClosed"
            />
        </transition>
    </div>
</template>

<script>
import AvailabilityWeeklyOverviewSidePanel from '../SidePanels/AvailabilityWeeklyOverviewSidePanel.vue'
import WeekTimeGrid from '@/components/ui/time-grid/WeekTimeGrid.vue'
import NewWeekset from '../Views/NewWeekset.vue'
import MonthTimeGrid from '@/components/ui/time-grid/MonthTimeGrid.vue'
import PmtTransition from '@/components/ui/Transition.vue'
import AvailabilityEntryForm from '../Forms/AvailabilityEntryForm.vue'
import ChooseAvailabilityTypeForm from '../Forms/ChooseAvailabilityTypeForm.vue'
import AvailabilityTopBar from '../TopBar/AvailabilityTopBar.vue'
import { mapGetters, mapState, mapMutations, mapActions } from 'vuex'
export default {
    name: 'AvailabilityBaseLayout',
    components: {
        WeekTimeGrid,
        MonthTimeGrid,
        PmtTransition,
        AvailabilityEntryForm,
        ChooseAvailabilityTypeForm,
        NewWeekset,
        'pmt-availability-weekly-overview-side-panel': AvailabilityWeeklyOverviewSidePanel,
        AvailabilityTopBar,
    },
    data () {
        return {
            isLoading: false,
            selectedDate: null,
            isCreating: false,
            rightSideWidth: 300,
            newTimeBlock: null,
            markedForDeletion: null,
            prevDate: null,
            showRightSidePanel: false,
            activeSidePanel: '',
            direction: 'right',
            showGrid: false,
            monthGridKey: 0,
            displayTopBar: false,
        }
    },
    computed: {
        ...mapGetters('auth', ['user', 'canYou']),
        ...mapGetters('stores', ['getWeekBusinessTimes']),
        ...mapGetters('availability', { getNavigationDirection: 'getNavigationDirection' }),
        ...mapState('availability', {
            availabilityPopoverVisible: 'availabilityPopoverVisible',
            chooseAvailabilityTypePopoverVisible: 'chooseAvailabilityTypePopoverVisible',
            isWeekLoading: 'isWeekLoading',
            isMonthLoading: 'isMonthLoading',
            sidePanels: 'sidePanels',
            availabilityEmployeeId: 'availabilityEmployeeId',
        }),
        ...mapGetters({
            getScrollPosition: 'GET_SCROLL_POSITION',
        }),
        ...mapState('account', {
            employees: 'STORE_EMPLOYEES',
        }),
        ...mapState('stores', {
            loadingStoreTimes: state => state.loading.storeTimes,
        }),
        ...mapGetters({ IS_MOBILE: 'IS_MOBILE' }),
        checkWeekAvailabilityRoute () {
            return this.$route.name === 'my-week-availability' || this.$route.name === 'availabilitysso' || this.$route.name === 'availabilityWeekSso' || this.$route.name === 'week-availability' || this.$route.name === 'week-availability-accountid'
        },
        checkMonthAvailabilityRoute () {
            return this.$route.name === 'my-month-availability' || this.$route.name === 'availabilityMonthSso' || this.$route.name === 'month-availability' || this.$route.name === 'month-availability-accountid'
        },
        canViewSelector () {
            let checker = null
            if (this.$route.meta.mode === 'week') {
                checker = 'my-week-availability'
            }
            if (this.$route.meta.mode === 'month') {
                checker = 'my-month-availability'
            }

            return this.canYou('planning', 'availability_others_view') && this.$route.name !== checker
        },
        openingTimes () {
            const openingTimes = this.getWeekBusinessTimes
            const originalTimes = {
                from: this.$moment().setTime(openingTimes.from),
                to: this.$moment().setTime(openingTimes.to),
            }
            const startsDifferentThanSharp = originalTimes.from.minute() > 0
            const endsDifferentThanSharp = originalTimes.to.minute() > 0
            if (startsDifferentThanSharp) {
                openingTimes.from = this.$moment().set({ hour: originalTimes.from.hour(), minute: 0 }).shortTime()
            }
            if (endsDifferentThanSharp) {
                openingTimes.to = this.$moment().set({ hour: originalTimes.to.hour() + 1, minute: 0 }).shortTime()
            }
            return openingTimes
        },
        hideAvailabilityTopbar () {
            return this.$cfg.specialAvailabilityRoutes.includes(this.$route.name)
        },
        isAccountActivation () {
            return this.$route.name === 'activate-account-finalize'
        },
    },
    async created () {
        await this.setAvailabilityEmployee(!this.canViewSelector || this.isAccountActivation ? this.user.accountId : this.availabilityEmployeeId)
        if (!this.employees) {
            this.getStoreEmployees({ active: true })
                .finally(() => {
                    this.displayTopBar = true
                })
        } else {
            this.displayTopBar = true
        }
    },
    methods: {
        ...mapMutations('availability', {
            setActiveSidePanel: 'setActiveSidePanel',
            openPopover: 'openPopover',
            emptyAvailability: 'emptyAvailability',
            clearSingleAvailabilities: 'clearSingleAvailabilities',
            setAvailabilityEmployee: 'setAvailabilityEmployee',
        }),
        ...mapActions('account', {
            getStoreEmployees: 'getStoreEmployees',
            getEmployees: 'getEmployees',
        }),
        entryFormClosed () {
            if (this.$route.meta.mode === 'month') {
                this.monthGridKey += 1
            }
        },
        navigate (direction) {
            this.$refs.topBar.$refs.datePicker.navigate(direction === 'right' ? -1 : 1)
        },
        startNewFreshWeekset () {
            this.emptyAvailability()
            const routeName = `${this.$route.meta.manager ? 'manager-' : ''}create-weekset`
            this.$router.push({
                name: routeName,
                params: {
                    account_id: this.availabilityEmployeeId,
                    start_date: this.$route.params,
                },
            })
        },
        startFromCurrentRecurring () {
            this.clearSingleAvailabilities()
            const routeName = `${this.$route.meta.manager ? 'manager-' : ''}create-weekset`
            this.$router.push({
                name: routeName,
                params: {
                    account_id: this.availabilityEmployeeId,
                    start_date: this.$route.params,
                },
            })
        },
        toggleGrid (event) {
            this.showGrid = event
        },
        /**
             * Sets the given date as the selected one.
             *
             * @param {Date} date
             * @param {function|null} callback
             * @returns {void}
             */
        setDateAsSelected (date, callback) {
            this.prevDate = this.selectedDate ? new Date(this.selectedDate.getTime()) : null
            this.selectedDate = date
        },
        updateActiveSidePanel (sidePanel) {
            this.setActiveSidePanel(sidePanel)
            this.activeSidePanel = sidePanel
            this.showRightSidePanel = true
        },
        sameAsCurrentDate (date) {
            if (typeof this.sameAsCurrentDateCheck === 'function') {
                return this.sameAsCurrentDateCheck(date)
            }

            return this.selectedDate.sameDateAs(date)
        },
        isSidePanelVisible () {
            return this.showRightSidePanel
        },
        isWeeklyOverviewPanelActive () {
            return this.isSidePanelWithNameActive(this.sidePanels.WEEKLY_OVERVIEW)
        },
        isSidePanelWithNameActive (sidePanelName) {
            return this.activeSidePanel === sidePanelName
        },
        isSidePanelWithNameVisible (sidePanelName) {
            return this.isSidePanelWithNameActive(sidePanelName) && this.isSidePanelVisible()
        },
        onDatePickerChange (date) {
            if (!this.selectedDate || this.sameAsCurrentDate(date)) {
                return
            }
            if (!this.sameAsCurrentDate(date)) {
                this.hideSidePanel()
            }
            this.setDateAsSelected(date)
            this.setScheduleEmployee(!this.canViewSelector ? this.user.accountId : this.availabilityEmployeeId)
        },
        onSidePanelShow () {
            // do something if needed
        },
        hideSidePanel () {
            this.showRightSidePanel = false
        },
        toggleWeeklySidePanel () {
            this.toggleSidePanel(this.sidePanels.WEEKLY_OVERVIEW)
        },
        sameDateAsRoute (weekYear) {
            return this.$route.params.week === weekYear.week && this.$route.params.year === weekYear.year
        },
        toggleSidePanel (sidePanelName) {
            if (this.isSidePanelWithNameActive(sidePanelName) && this.isSidePanelVisible()) {
                this.hideSidePanel()
            } else {
                this.updateActiveSidePanel(sidePanelName)
            }
        },
    },
}
</script>

<style lang="scss" scoped>
    $width-name: max-width;
    $target-width: 450px;

    .slide-fade-enter-active {
            transition: all 0s ease;
        }
    .slide-fade-leave-active {
        transition: all 0s ease;
    }

    @media only screen and ($width-name : $target-width) {
        .slide-fade-enter-active {
            transition: all .4s ease;
        }
        .slide-fade-leave-active {
            transition: all .4s ease;
        }
        .slide-fade-enter, .slide-fade-leave-to {
            transform: translateY(300px);
            opacity: 0;
        }
    }
</style>
