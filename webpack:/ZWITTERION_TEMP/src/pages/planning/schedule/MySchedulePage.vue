<template>
    <PmtContent
        :key="$route.meta.manager"
        class="page"
    >
        <TopBar
            ref="topbar"
            show-birthdays
            :show-find-substitutes="!$route.meta.manager"
            :show-request-time-off="!$route.meta.manager"
            show-print
            :show-print-excel-department-schedule="showPrintExcelDepartmentSchedule"
            :show-email-schedule-button="showEmailScheduleButton"
            :loading="loading && !IS_MOBILE"
            @print="print = $event"
        >
            <DatePicker
                ref="datepicker"
                :options="datepickerOptions"
                @on-select="loadWeekSchedule"
            />
            <EmployeeSelect
                v-if="canViewSelector && !IS_MOBILE"
                ref="employeeSelect"
                v-model="selectedEmployee"
                cy_id="employeeSelect"
                @input="setSelectedEmployee($event)"
            />
        </TopBar>
        <TopBar
            v-if="IS_MOBILE"
            ref="secondTopbar"
            :loading="loading"
        >
            <EmployeeSelect
                v-if="canViewSelector"
                ref="employeeSelect"
                v-model="selectedEmployee"
                cy_id="employeeSelect"
                @input="setSelectedEmployee($event)"
            />
        </TopBar>
        <PmtLayout
            v-touch="{left: () => navigate(1), right: () => navigate(-1)}"
            fixed-height
        >
            <template v-if="showSchedulesAndBalances">
                <WeekSchedule
                    ref="weekSchedule"
                    :key="`${$route.fullPath}_week_schedule`"
                    :print="print"
                    :direction="navigationDirection"
                    :selected-date="selectedDate"
                    :account-id="Number(scheduleEmployeeId)"
                    @loading="loading = $event"
                />
                <EmployeeBalances
                    ref="employeeBalances"
                    :key="`${$route.fullPath}_employee_balances`"
                    :class="{'d-none': loading, 'd-print employee-balances': true}"
                    :account-id="Number(scheduleEmployeeId)"
                    :selected-date="selectedDate"
                />
            </template>
            <EmptyState
                v-else-if="!loading && !loadingWeekStatus && scheduleEmployeeId"
                :title="$t('pages.mySchedule.weeksNotFinalizedTitle')"
                :sub-title="$t('pages.mySchedule.weeksNotFinalizedText')"
                component="schedules-not-finalized"
                :show="true"
                :size="IS_MOBILE ? 250 : 400"
                no-padding
            />
            <RoundSpinner
                v-if="loading || loadingWeekStatus"
                full-screen
                loading
            />
            <EmptyState
                v-if="!scheduleEmployeeId && $route.meta.manager"
                :show="true"
                component="empty-employee-selection"
                :title="$t('ui.emptyState.availability.noEmployeeSelectedTitle')"
                :sub-title="$t('ui.emptyState.availability.noEmployeeSelectedSubTitle')"
                size="300"
            />
        </PmtLayout>
    </PmtContent>
</template>

<script>
import { mapMutations, mapGetters, mapActions, mapState } from 'vuex'

export default {
    name: 'MySchedulePage',

    components: {
        WeekSchedule: () => import(/* webpackChunkName: "week-schedule" */'./WeekSchedule.vue'),
        EmployeeBalances: () => import(/* webpackChunkName: "week-schedule" */'./EmployeeBalances.vue'),
        EmployeeSelect: () => import(/* webpackChunkName: "week-schedule" */'@/components/ui/top-bar/EmployeeSelect.vue'),
    },

    data () {
        return {
            currentDate: this.$moment(),
            print: false,
            loading: false,
            showPrintExcelDepartmentSchedule: false,
            loadingWeekStatus: false,
            selectedEmployee: null,
        }
    },

    computed: {
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
        }),
        ...mapGetters('auth', ['user', 'canPlanOthers', 'canPrintDepartmentSchedules', 'canFetchStoreSchedules']),
        ...mapGetters('schedules', {
            employeeWeekStatus: 'employeeWeekStatus',
        }),
        ...mapState('account', {
            employees: 'employees',
            storeEmployees: 'storeEmployees',
        }),
        ...mapState('schedules', {
            scheduleEmployeeId: 'scheduleEmployeeId',
        }),
        ...mapState('departments', {
            isFinal: 'isFinal',
        }),
        ...mapGetters('contracts', ['CONTRACT_ON_DATE']),
        ...mapGetters('datepicker', ['DATEPICKER_BY_ID']),
        datepickerTooltip () {
            if (this.currentAccountId === 0) {
                return { content: this.$t('topBars.availability.selectEmployee'), placement: 'bottom' }
            }
            return ''
        },
        datepickerOptions () {
            return {
                id: 'week-schedule-picker',
                selectedDate: this.selectedDate,
                showNavigation: true,
                handleRoute: true,
                disabled: this.loading || this.currentAccountId === 0,
                tooltip: this.datepickerTooltip,
            }
        },

        /**
         * Returns the employees list used on current page.
         */
        getEmployeeList () {
            return !this.canFetchStoreSchedules ? this.employees : this.storeEmployees
        },

        employeeName () {
            const employee = this.getEmployeeList.find(item => item.account_id === this.scheduleEmployeeId)
            if (employee) {
                return employee.name
            }
            return ''
        },
        /**
         * Returns true if current user can see the employee selector.
         */
        canViewSelector () {
            return this.canPlanOthers && Boolean(this.$route.meta?.manager)
        },

        /**
         * Returns the id of the user for whom we are showing the schedule.
         */
        currentAccountId () {
            if (this.$route.meta.manager) {
                if (this.$route.params.account_id) {
                    return this.$route.params.account_id
                }
                return 0
            } else {
                return this.user ? this.user.accountId : 0
            }
        },

        /**
         * Returns true if the id of the employee in the url exists in the current employee selector.
         */
        routeEmployeeExists () {
            // if it's week schedule page for current employee always return true
            if (!this.$route.meta.manager) {
                return true
            }
            return !!this.getEmployeeList.find(employee => { return parseInt(employee.account_id) === parseInt(this.currentAccountId) })
        },
        selectedDate () {
            return this.$moment().fromRouteParams(this.$route.params, 'week', true)
        },

        employeeContract () {
            return this.CONTRACT_ON_DATE({
                accountId: this.scheduleEmployeeId,
                date: this.selectedDate.startOf('isoWeek').apiFormat(),
            })
        },

        isEmployeeWeekFinal () {
            const weekStatus = this.employeeWeekStatus({
                year: this.$route.params.year,
                week: this.$route.params.week,
                accountId: this.scheduleEmployeeId,
            })
            return weekStatus ? weekStatus.week_finalized : null
        },

        /**
         * Shows or hides the email schedules button
         * @returns {Boolean}
         */
        showEmailScheduleButton () {
            if (!this.isEmployeeWeekFinal || !this.user) {
                return false
            }
            const sameEmployee = parseInt(this.user.accountId) === parseInt(this.scheduleEmployeeId)
            const canPlanOthers = this.canPlanOthers
            /**
             * Rules for this if:
             * - selected schedule user is different than current app user
             * - current app user has canPlanOthers
             * - selected schedule employee has a contract on the selected date
             */
            if (!sameEmployee && canPlanOthers && this.employeeContract && Object.keys(this.employeeContract).length > 0) {
                return true
            }
            /**
             * Rules:
             * - selected schedule user is the same as current app user
             * - current app user has a contract on the selected date
             */
            return sameEmployee && this.employeeContract && Object.keys(this.employeeContract).length > 0
        },
        /**
         * Gets the datepicker navigation direction
         * @returns {String} 'left' or 'right'
         */
        navigationDirection () {
            const datepicker = this.DATEPICKER_BY_ID(this.datepickerOptions.id)
            return datepicker ? datepicker.direction : 'right'
        },
        /**
         * Determines if the schedules and balances should be visible
         * @returns {Boolean}
         */
        showSchedulesAndBalances () {
            const hasEmployee = this.scheduleEmployeeId || (this.$route.meta.manager && this.routeEmployeeExists)
            return hasEmployee && !this.loadingWeekStatus && this.isEmployeeWeekFinal
        },
    },

    watch: {
        $route (to, from) {
            const differentName = to.name !== from.name
            const differentEmployee = to.params.account_id && (to.params.account_id !== from.params.account_id)
            if (differentName || differentEmployee) {
                this.loadWeekSchedule()
            }
        },
    },

    async mounted () {
        await this.setScheduleEmployee(this.currentAccountId)
        const from404 = this.$route.query.error404
        if (from404) {
            this.$router.push(this.$route.path)
            this.SET_SNACKBAR({ message: this.$t('generalMessages.errors.pageNotFound'), error: true })
        }

        if (!this.getEmployeeList.length) {
            if (this.canPlanOthers && !this.canFetchStoreSchedules) {
                await this.getEmployees({ active: true })
            } else {
                await this.getStoreEmployees()
            }
            // if the route employee does not exist in the employees call redirect to main week-schedule page for manager,
            // even if the employee in current route is the current employee
            if (!this.routeEmployeeExists && this.$route.params.account_id && this.$route.name !== 'week-schedule') {
                await this.$router.push({
                    name: 'week-schedule',
                    params: {
                        ...this.selectedDate.startOf('isoWeek').weekYearObject(),
                    },
                })
            }
        }

        this.selectedEmployee = this.getEmployeeList.find(o => o.account_id === parseInt(this.scheduleEmployeeId))
    },

    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('account', {
            getStoreEmployees: 'getStoreEmployees',
            getEmployees: 'getEmployees',
        }),
        ...mapActions('departments', {
            isWeekFinal: 'isWeekFinal',
        }),
        ...mapActions('schedules', {
            getEmployeeWeekStatus: 'getEmployeeWeekStatus',
        }),
        ...mapMutations('schedules', {
            setScheduleEmployee: 'setScheduleEmployee',
        }),
        ...mapActions('stores', {
            getWeekStatus: 'getWeekStatus',
        }),

        navigate (direction) {
            if (this.scheduleEmployeeId) {
                this.$refs.datepicker.navigate(direction)
            }
        },
        /**
         * Actions performed on week change.
         */
        async loadWeekSchedule () {
            await this.setScheduleEmployee(this.currentAccountId)
            this.checkPrintExcelDepartmentButton()
            await this.checkWeekStatus()

            // Week status info if needed only if week is finalized for current employee -
            // that's when we actually display schedules
            if (this.isEmployeeWeekFinal) {
                const payload = { week: this.selectedDate.yearWeekApiFilter(), latest_status: true }
                await this.getWeekStatus(payload).catch(() => {})
            }
        },
        /**
         * Toggles the "Print excel department" button depending on the selected week.
         */
        checkPrintExcelDepartmentButton () {
            if (!this.canPrintDepartmentSchedules) {
                this.showPrintExcelDepartmentSchedule = false
                return
            }
            const fetchedFinalForWeek = this.isFinal[this.$route.params.year] && this.isFinal[this.$route.params.year][this.$route.params.week]
            // Check if it was already fetched and it's in state
            if (typeof fetchedFinalForWeek !== 'undefined') {
                this.showPrintExcelDepartmentSchedule = this.isFinal[this.$route.params.year][this.$route.params.week]
                return
            }

            this.isWeekFinal({
                week: this.$route.params.week,
                year: this.$route.params.year,
            }).then(response => {
                this.showPrintExcelDepartmentSchedule = response
            })
        },

        /**
         * Checks and fetches the selected employee week status
         */
        async checkWeekStatus () {
            if (this.scheduleEmployeeId !== 0) {
                this.loadingWeekStatus = true
                await this.getEmployeeWeekStatus({
                    week: this.$route.params.week,
                    year: this.$route.params.year,
                    accountId: this.scheduleEmployeeId,
                }).catch(error => {
                    // A message for this error is already displayed generically in pmtApi.js
                    if (!(error.code === 'general.forbidden')) {
                        this.SET_SNACKBAR({ message: error.message, error: true })
                    }
                }).finally(() => {
                    this.loadingWeekStatus = false
                })
            }
        },
        async updateBrowserPath (name) {
            const sameAccountId = this.$route.meta.manager ? parseInt(this.$route.params.account_id) === parseInt(this.scheduleEmployeeId) : true
            if (!sameAccountId) {
                await this.$router.push({
                    name: name,
                    params: {
                        week: this.$route.params.week,
                        year: this.$route.params.year,
                        account_id: this.scheduleEmployeeId,
                    },
                    query: this.$route.query,
                }).catch(() => {})
                this.currentPath = this.$router.currentRoute.path
            }
        },
        employeeSelected (event) {
            if (event.key !== '-') {
                this.setScheduleEmployee(event.key)
                this.updateBrowserPath('week-schedule-accountid')
            } else {
                this.setScheduleEmployee(0)
            }
        },
        setSelectedEmployee (event) {
            if (event.account_id) {
                this.selectedEmployee = this.getEmployeeList.find(o => o.account_id === event.account_id)
                this.setScheduleEmployee(event.account_id)
                this.updateBrowserPath('week-schedule-accountid')
            } else {
                this.setScheduleEmployee(0)
            }
        },
    },
}
</script>
<style lang="scss" scoped>
    @media print {
        .employee-balances{
            position: unset !important;
        }
    }
</style>
