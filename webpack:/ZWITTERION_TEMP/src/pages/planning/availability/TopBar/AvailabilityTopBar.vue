<template>
    <PmtTopBar
        class="availability-top-bar"
        :loading="loading"
    >
        <div class="d-none" /><!-- fix for displaying #right slot on mobile -->
        <DatePicker
            v-if="show.datepicker"
            ref="datePicker"
            :options="datepickerOptions"
            @on-select="dateChange($event)"
        />
        <PSelect
            v-if="show.viewSelector && $route.name != 'activate-account-finalize'"
            ref="viewOptionSelect"
            v-model="selectedViewOption"
            cy_id="viewOptionSelect"
            :items="viewOptions"
            item-value="key"
            width="auto"
            dense
            @input="changeSelection"
        >
            <template #selected-label>
                <div class="selected-label">
                    <EyeOutline
                        :size="16"
                        class="mr-2"
                    />
                    {{ selectedViewOption.label }}
                </div>
            </template>
        </PSelect>
        <EmployeeSelect
            v-if="displayEmployeeSelector"
            ref="employeeSelectContainer"
            v-model="selectedEmployee"
            @input="setSelectedEmployee($event)"
        />
        <template #right>
            <PmtBarButton
                v-if="show.goBack && $route.params.fromOverview"
                id="go-back"
                :text="!IS_MOBILE ? $t('sidePanels.availabilityWeeklyOverview.backToOverview') : ''"
                icon="arrow-left"
                :left-icon="true"
                icon-size="18"
                @click="goBack"
            />
            <PmtBarButton
                v-if="show.weeklyOverview && !weekly && availabilityEmployeeId > 0"
                id="weekly-overview"
                :text="$t(`sidePanels.availabilityWeeklyOverview.title${IS_MOBILE ? 'Short' : ''}`)"
                icon-size="20"
                icon="clock-check-outline"
                :show-badge="pendingWeeksets > 0"
                :show-count-badge="pendingWeeksets"
                @click="$emit('weekly-overview')"
            />
        </template>
    </PmtTopBar>
</template>

<script>
import { mapGetters, mapMutations, mapActions, mapState } from 'vuex'
export default {
    name: 'AvailabilityTopBar',
    components: {
        PmtTopBar: () => import('@/components/ui/top-bar/TopBar.vue'),
        PmtBarButton: () => import('@/components/ui/top-bar/BarButton'),
        DatePicker: () => import('@/components/ui/pickers/DatePicker'),
        EmployeeSelect: () => import('@/components/ui/top-bar/EmployeeSelect.vue'),
    },
    props: {
        mode: {
            type: String,
            default: 'week',
        },
        weekly: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        show: {
            type: Object,
            default () { return {} },
        },
    },
    data () {
        return {
            datepickerId: 'availabilty-datepicker',
            selectedViewMode: 'week',
            selectedEmployee: null,
            selectedViewOption: { label: null, key: null },
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('availability', {
            selectedDate: 'getSelectedAvailabilityDate',
            pendingWeeksets: 'pendingWeeksets',
        }),
        ...mapState('availability', {
            sidePanels: 'sidePanels',
            activeSidePanel: 'activeSidePanel',
            availabilityEmployeeId: 'availabilityEmployeeId',
            availabilityTimeBlocks: 'availabilityTimeBlocks',
        }),
        ...mapState('account', ['employees', 'storeEmployees', 'employeesLoading']),
        ...mapGetters('auth', ['user', 'canYou', 'canFetchStoreSchedules']),
        datepickerTooltip () {
            let output = null
            if (this.availabilityEmployeeId === 0) {
                output = { content: this.$t('topBars.availability.selectEmployee'), placement: 'bottom' }
            }
            return output
        },
        datepickerOptions () {
            return {
                id: this.datepickerId,
                selectedDate: this.$moment(this.getDateFromRoute),
                mode: this.mode,
                selection: this.mode,
                monthPicker: this.mode === 'month',
                showMonthNavigation: this.mode !== 'month',
                showNavigation: true,
                showSidebar: this.mode !== 'month',
                handleRoute: true,
                disabled: this.loading || this.availabilityEmployeeId === 0,
                tooltip: this.datepickerTooltip,
            }
        },
        isManagerRoute () {
            return this.$route.meta.manager
        },
        getDateFromRoute () {
            return this.$moment().fromRouteParams(this.$route.params, this.mode)
        },
        /**
         * Returns the options for the view selector.
         *
         * @returns {Array}
         */
        viewOptions () {
            const employeeRoutes = {
                week: 'my-week-availability',
                month: 'my-month-availability',
            }
            const managerRoutes = {
                week: 'week-availability',
                weekAccountId: 'week-availability-accountid',
                month: 'month-availability',
                monthAccountId: 'month-availability-accountid',
            }
            const short = this.IS_MOBILE ? 'Short' : ''
            return [
                {
                    key: 'week',
                    label: this.$t(`topBars.availability.viewSelectOptions.week${short}`),
                    route: this.isManagerRoute ? (this.$route.params.account_id ? managerRoutes.weekAccountId : managerRoutes.week) : employeeRoutes.week,
                },
                {
                    key: 'month',
                    label: this.$t(`topBars.availability.viewSelectOptions.month${short}`),
                    route: this.isManagerRoute ? (this.$route.params.account_id ? managerRoutes.monthAccountId : managerRoutes.month) : employeeRoutes.month,
                },
            ]
        },
        employeesList () {
            const useStoreEmployees = this.$route.name.indexOf('week-schedule') > -1 && this.canFetchStoreSchedules
            const employeesListToUse = useStoreEmployees ? 'storeEmployees' : 'employees'
            return this[employeesListToUse] ? this[employeesListToUse] : []
        },
        displayEmployeeSelector () {
            return this.show.employeeSelector &&
                this.canYou('planning', 'availability_others_view') &&
                this.$route.name !== 'activate-account-finalize' &&
                this.isManagerRoute
        },
    },
    async mounted () {
        await this.setNewAvailabilityDate(this.getDateFromRoute)
        this.selectedViewMode = this.$route.meta.mode
        this.selectedViewOption = this.viewOptions.find(o => o.key === this.selectedViewMode)
        if (this.$route.params.account_id) {
            this.setSelectedEmployee(this.$route.params)
        }
    },
    async created () {
        await this.setNewAvailabilityDate(this.getDateFromRoute)
    },
    methods: {
        ...mapMutations('availability', {
            setNewAvailabilityDate: 'setAvailabilityDatePickerDate',
            setAvailabilityEmployee: 'setAvailabilityEmployee',
            clearAvailabilities: 'clearAvailabilities',
        }),
        ...mapActions('availability', {
            getWeekAvailability: 'getWeekAvailability',
            getWeekset: 'getWeekset',
            getAvailabilityForDay: 'getAvailabilityForDay',
            getAvailabilityForMonth: 'getAvailabilityForMonth',
            getWeeksets: 'getWeeksets',
        }),
        ...mapActions('stores', ['getCurrentStoreWeekBusinessTimes']),
        ...mapMutations('datepicker', ['UPDATE_DATEPICKER']),
        ...mapMutations(['SET_SNACKBAR']),
        changeSelection (data) {
            let params = {}
            if (data.key === 'week') {
                params = {
                    week: this.$moment().startOf('isoWeek').isoWeek(),
                    year: this.$moment().startOf('isoWeek').isoWeekYear(),
                }
            } else if (data.key === 'month') {
                params = {
                    month: this.$moment(this.getDateFromRoute).month() + 1,
                    year: this.$moment(this.getDateFromRoute).year(),
                }
            }
            this.$router.push({ name: data.route, params: params })
        },
        goBack () {
            if (window.history.length > 2) {
                this.$router.go(-1)
            }
        },
        setSelectedEmployee (event) {
            if (event.account_id) {
                const accountId = parseInt(event.account_id)
                this.selectedEmployee = this.employeesList.find(o => o.account_id === accountId)
                this.setAvailabilityEmployee(accountId)
                this.switchAccountIdRoute(accountId)
                this.getAvailability()
            } else {
                this.setAvailabilityEmployee(0)
                this.clearAvailabilities()
                this.getAvailability()
            }
        },
        /**
         * Create a route list for the manager when they select an employee based on the accountId
         *
         * @param {Number} accountId
         */
        switchAccountIdRoute (accountId) {
            let routeName = null
            let params = {}
            let sameParams = false
            // Check the mode of the current page
            switch (this.mode) {
                case 'week':
                    routeName = 'week-availability-accountid'
                    params = {
                        week: this.$moment(this.selectedDate).startOf('isoWeek').isoWeek(),
                        year: this.$moment(this.selectedDate).startOf('isoWeek').isoWeekYear(),
                        account_id: accountId,
                    }
                    sameParams = parseInt(this.$route.params.week) === params.week &&
                        parseInt(this.$route.params.year) === params.year &&
                        parseInt(this.$route.params.account_id) === params.account_id
                    break
                case 'month':
                    routeName = 'month-availability-accountid'
                    params = {
                        month: this.$moment(this.selectedDate).format('M'),
                        year: this.$moment(this.selectedDate).format('YYYY'),
                        account_id: accountId,
                    }
                    sameParams = parseInt(this.$route.params.month) === params.month &&
                        parseInt(this.$route.params.year) === params.year &&
                        parseInt(this.$route.params.account_id) === params.account_id
            }
            if (!sameParams && this.$route.name !== 'activate-account-finalize') {
                this.$router.push({ name: routeName, params: params }).catch(() => {})
            }
        },
        async changeEmployeeID () {
            !this.isManagerRoute
                ? await this.setAvailabilityEmployee(this.user.accountId)
                : await this.setAvailabilityEmployee((this.$route.params.account_id || 0))
        },
        async dateChange (selectedDate) {
            await this.changeEmployeeID()
            await this.setNewAvailabilityDate(selectedDate.format('YYYY-MM-DD'))
            if (this.$route.name !== 'activate-account-finalize') {
                this.$emit('on-toggle-grid', false)
                if (this.availabilityEmployeeId > 0) {
                    this.getAvailability()
                    await this.getCurrentStoreWeekBusinessTimes(selectedDate)
                }
            }
        },
        getAvailability (accountId) {
            if (this.mode === 'week') {
                this.getWeekAvailability(accountId).catch(err => {
                    this.$emit('on-toggle-grid', true)
                    this.SET_SNACKBAR({ message: err.message, error: true })
                }).finally(() => {
                    this.$emit('on-toggle-grid', true)
                })
            } else if (this.show.datepicker) {
                if (!this.$refs.datePicker) return
                const date = this.$refs.datePicker.datepicker.selectedDate
                this.getAvailabilityForMonth(date).catch(err => {
                    this.$emit('on-toggle-grid', true)
                    this.SET_SNACKBAR({ message: err.message, error: true })
                }).finally(() => {
                    this.$emit('month-view', true)
                    this.$emit('on-toggle-grid', true)
                })
            }
        },
    },
}
</script>

<style lang="scss">
    .availability-top-bar {
        .weekly-overview-btn {
            .icon {
                display: none;
            }
        }

        .bar-actions-mobile {
            display: none;
        }
    }

    @media screen and (max-width: 700px) {
        .availability-top-bar {
            .weekly-overview-btn {
                .icon {
                    display: initial;
                }

                .text {
                    display: none;
                }
            }
        }
    }

    @media screen and (max-width: 500px) {
        .availability-top-bar {
            .bar-actions-desktop {
                display: none;
            }

            .bar-actions-mobile {
                display: inherit;
            }
        }
    }

    .selected-label {
        flex-direction: row;

        .material-design-icon {
            vertical-align: 2px;
        }
    }
</style>
