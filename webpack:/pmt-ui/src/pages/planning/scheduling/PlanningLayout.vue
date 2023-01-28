<template>
    <div class="planning-layout">
        <template v-if="pageAccess">
            <SchedulingTopBar
                v-if="IS_MOBILE"
                ref="mobileTopbar"
                :show="showMobileTopbarItems"
                :employee-list="employeeList"
                @date-change="getData()"
            />
            <SchedulingTopBar
                v-if="!isStandardShifts || (isStandardShifts && !IS_MOBILE)"
                ref="topbar"
                :loading-data="hasAnyLoading"
                :show="showDesktopTobarItems"
                :employee-list="employeeList"
                @date-change="getData()"
            />
            <PmtLayout
                ref="layout"
                :main-style="mainStyle"
                fixed-height
                full-scroll-event
                :show-right-side="settings.weekStatus && !loading.planningData"
                :right-side-width="isCheckHours ? 350 : 500"
                right-side-topbar-height
                :show-scroll-top="false"
                @scroll="updateScroll"
            >
                <template #default>
                    <router-view
                        v-if="showMainView"
                        :employee-list="employeeList"
                        @swipe="navigateSwipe($event)"
                    />
                    <RoundSpinner
                        v-else-if="hasMainLoading"
                        ref="loading"
                        default-loading-text
                        full-screen
                        :loading="true"
                    />
                    <ArticleHelper
                        v-if="showArticleHelper"
                        label="planning_intro"
                        :route="'create-planning'"
                        page="scheduling"
                    />
                    <EmptyState
                        v-if="CRITICAL_API_FAILS"
                        ref="fiveHundred"
                        component="five-hundred"
                        :title="baseTranslate('apiErrors.pageFailedLoading')"
                        :show="true"
                        :is-error="true"
                        :size="500"
                        :title-font-size="20"
                        no-padding
                    >
                        <template #custom-action>
                            {{ baseTranslate('apiErrors.problemKeepsOccuring') }}
                            <a
                                href="https://klant.retailsolutions.nl/"
                                target="_blank"
                            >{{ baseTranslate('apiErrors.contactUs') }}</a>
                        </template>
                    </EmptyState>
                </template>
                <template #right>
                    <WeekStatusSidepanel
                        v-if="!loading.planningData && settings.weekStatus"
                        ref="weeksetsSidePanel"
                        :employee-list="employeeList"
                    />
                </template>
            </PmtLayout>
        </template>
        <EmptyState
            v-else
            ref="noAccess"
            :title="$t('ui.singles.noAccess')"
            :component="'four-o-four'"
            :size="IS_MOBILE ? 300 : 500"
            :show="true"
            :is-error="true"
            empty-search-result
            no-padding
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'PlanningLayout',
    components: {
        SchedulingTopBar: () => import(/* webpackChunkName: "scheduling" */'@/pages/planning/scheduling/components/SchedulingTopBar'),
        WeekStatusSidepanel: () => import(/* webpackChunkName: "scheduling" */'@/pages/planning/scheduling/components/WeekStatusSidepanel'),
    },
    mixins: [mixins],
    data () {
        return {
            employeeList: [],
        }
    },
    computed: {
        hasMainLoading () {
            const { planningData, sentSchedules, sentDayRemarks } = this.loading
            return planningData || sentSchedules || sentDayRemarks
        },
        showMainView () {
            if (!this.CAN_READ_SHIFTS) return false
            if (this.CRITICAL_API_FAILS) return false
            return !this.hasMainLoading
        },
        showArticleHelper () {
            if (this.IS_SUPER_ADMIN) return false
            if (this.$route.meta.settingsRoute !== 'create-planning') return false
            const { week, planningData } = this.loading
            return !week && !planningData
        },
        pageAccess () {
            if (this.isCheckHours) {
                return this.HAS_MODULE_CHECK_HOURS && this.CAN_ACCESS_CHECK_HOURS_PAGE
            } else if (this.isStandardShifts) {
                return this.HAS_STANDARD_SHIFTS_PAGE_ACCESS
            } else {
                return this.HAS_PLANNING_PAGE_ACCESS
            }
        },
        mainStyle () {
            if (!this.isCheckHours) {
                return {
                    backgroundColor: 'white',
                }
            }
            return {}
        },
    },

    watch: {
        SORTED_COLUMN: {
            async handler () {
                if (this.loading.planningData) return
                this.sortRows()
            },
            deep: true,
        },
        DEPARTMENT_STATUS_HISTORY_ID: {
            handler (newVal) {
                if (!newVal) return
                this.filterPlanningRows(false)
                this.loadSentSchedulesAndDayRemarks()
            },
        },
        '$route.name': {
            async handler (newVal, oldVal) {
                // re-fetch data when swicthing between standard and normal shifts and check-hours
                if ((newVal === 'standard-shifts' || newVal === 'check-hours') || ((newVal === 'day-planning' || newVal === 'week-planning') && (oldVal === 'standard-shifts' || oldVal === 'check-hours'))) {
                    if (this.pageAccess) {
                        this.employeeList = []
                        this.getData()
                    }
                    if (newVal === 'day-planning' || newVal === 'week-planning') {
                        this.showShiftsColumns()
                        this.SET_RESOURCES_SEARCH('')
                    } else if (newVal === 'standard-shifts') {
                        await this.hideStandardShiftsColumns()
                    }
                    this.STORE_COPIED_SHIFT(null)
                    this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
                    this.setAccountSearch()
                }
            },
        },
        DIRTY_GRID: {
            handler (newVal) {
                if (!newVal) return
                if (!this.CAN_FINALIZE_SCHEDULE) return
                if (this.isStandardShifts) return
                if (newVal.account_id === 'not_assigned') return
                setTimeout(() => {
                    this.getSchedulingNotifications({
                        department_ids: this.currentEmployeeDepartments.map(d => d.department_id),
                        ...this.SELECTED_DATE.weekYearObject(),
                        date: this.SELECTED_DATE,
                        force: true,
                    })
                    if (this.CAN_READ_DEPARTMENT_STATUS) {
                        this.getDepartmentsWeekStatus({ date: this.SELECTED_DATE, override: true })
                    }
                }, 1000)
            },
        },
        isDayView: {
            handler () {
                this.sortRows()
            },
        },
        SELECTED_DATE: {
            handler () {
                this.sortRows()
            },
            deep: true,
        },
    },
    async created () {
        await this.hideStandardShiftsColumns()
        await this.SET_INITIAL_RESOURCES_WIDTH()
        const transparentMainBackgroundColor = this.$helpers.transparentize(this.mainBackgroundColor, 50)
        document.documentElement.style.setProperty('--selected-shift-background', this.mainBackgroundColor)
        document.documentElement.style.setProperty('--not-selected-shift-background', transparentMainBackgroundColor)
        // sets the current available page filters for the filters flyout
        await this.UPDATE_ENABLED_FILTERS(this.enabledFilters)
        await this.SET_PRINT_DATE(this.SELECTED_DATE.apiFormat())
        await this.SET_PRINT_VIEW(this.isDayView ? 'day' : 'week')
        this.redirectToMobile()
    },
    async mounted () {
        window.addEventListener('keydown', this.mainPlanningEvents)
        if (this.pageAccess) {
            await this.getData()
        }
        this.UPDATE_SCROLL_POSITION()
    },
    destroyed () {
        this.HIDE_SNACKBAR()
        window.removeEventListener('keydown', this.mainPlanningEvents)
        this.employeeList = []
    },

    methods: {
        async getData () {
            const date = this.SELECTED_DATE
            const force = !this.employeeList.length
            if (this.isStandardShifts) {
                this.getAllStructuresDepartments(this.$moment().startOf('isoWeek'))
            }
            const weekPlanningData = await this.getPlanningEmployeeData({ date, force, standard: this.isStandardShifts })
                .catch(err => this.setSchedulingApiError('shifts', err))
            if (this.isCheckHours) {
                this.getShiftSurcharges(date)
            }
            if (this.DEPARTMENT_STATUS_HISTORY_ID) {
                await this.loadSentSchedulesAndDayRemarks()
            }
            if (!this.weekIsDraft && !this.isStandardShifts && this.CAN_FINALIZE_SCHEDULE && this.currentEmployeeDepartments.length) {
                this.getSchedulingNotifications({
                    department_ids: this.currentEmployeeDepartments.map(d => d.department_id),
                    date,
                }).catch(error => {
                    this.setError(error)
                })
            }
            await this.setPlanningEmployees(weekPlanningData)
            this.setAccountSearch()
        },

        async setPlanningEmployees (weekPlanningData) {
            const result = await this.sortedEmployees(weekPlanningData)
            this.employeeList = result
            this.setEmployeeCLAValidations()
            this.setCurrentEmployeeDepartments()
            let interval = null
            interval = setInterval(() => {
                const firstRowElement = document.querySelector('.planning-grid-row:not(.header)')
                if (firstRowElement) {
                    clearInterval(interval)
                    return this.filterPlanningRows()
                }
            }, 1000)
        },

        async sortedEmployees (weekPlanningData) {
            if (!weekPlanningData) return
            const employees = Object.keys(weekPlanningData).map(account_id => weekPlanningData[account_id])
            const { name, sortBy, sortAscending } = this.SORTED_COLUMN
            if (sortBy) {
                const actualEmployees = employees.filter(e => !e.notAssigned && !e.lentIn)
                const lentIn = employees.filter(e => e.lentIn)
                const sortedLentInEmployees = this.customEmployeesSorting(name, lentIn, sortAscending)
                const notAssignedOrLentInEmployees = employees.filter(e => e.notAssigned)
                const result = this.customEmployeesSorting(name, actualEmployees, sortAscending)
                return notAssignedOrLentInEmployees.concat(sortedLentInEmployees, result)
            }
            if (this.isStandardShifts) {
                return employees.filter(e => !e.notAssigned && !e.lentIn)
            }
            return employees
        },

        async sortRows () {
            const sortedEmployees = await this.sortedEmployees(this.weekPlanningData)
            this.employeeList = sortedEmployees
            this.filterPlanningRows()
        },

        async navigateSwipe (direction) {
            if (this.IS_MOBILE) {
                await this.$refs.mobileTopbar.$refs.datePicker.navigate(direction === 'right' ? -1 : 1)
                this.SET_MOBILE_PLANNING_SWIPE_DIRECTION(direction)
            }
        },

        redirectToMobile () {
            if (this.IS_MOBILE && (!this.$route.query.mobile || !this.$route.query.selected_account) && (this.$route.name === 'day-planning' || this.$route.name === 'week-planning')) {
                const query = Object.assign({}, this.$route.query)
                const selectedRouteAccount = this.$route.query.selected_account
                if (selectedRouteAccount) {
                    query.selected_account = selectedRouteAccount
                }
                const { year, week } = this.$route.params
                this.$router.push({ name: 'mobile-planning', params: { year, week }, query }).catch(() => {})
            }
        },

        setEmployeeCLAValidations () {
            if (!this.isStandardShifts) {
                const mapClaRuleValidationStatus = (rule) => {
                    rule.error = rule.cla_rule_validation_status === 'obly'
                    rule.warn = rule.cla_rule_validation_status === 'warn'
                    rule.info = rule.cla_rule_validation_status !== 'obly' && rule.cla_rule_validation_status !== 'warn'
                    return rule
                }
                this.employeeList?.forEach(employee => {
                    const outcomes = employee.cla_validation_outcomes.map(mapClaRuleValidationStatus)
                    employee.setClaValidations(outcomes)
                })
            }
        },

        setCurrentEmployeeDepartments () {
            const departments = this.departments.map(d => {
                return {
                    ...d,
                    isClosed: this.departmentClosed(d.department_id),
                }
            })
            this.SET_CURRENT_EMPLOYEE_DEPARTMENTS({ date: this.SELECTED_DATE, departments })
        },
    },
}
</script>
