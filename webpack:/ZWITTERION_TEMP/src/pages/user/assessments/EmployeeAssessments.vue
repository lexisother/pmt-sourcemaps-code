<template>
    <div class="employee-assessments-page">
        <TopBar
            ref="topBar"
            :loading="isLoading"
            show-search
            :search="search"
            :right-side-open="activeEmployeeSelection.length > 0 && showRightSide"
            @search="search = $event"
        >
            <DatePicker
                ref="datepicker"
                :key="$route.path"
                :options="datepickerOptions"
                @on-select="onDatePickerChange($event)"
            />
        </TopBar>
        <PmtLayout
            :show-right-side="activeEmployeeSelection.length > 0 && showRightSide"
            :loading="isLoading"
            hide-loading-content
            :right-side-width="500"
            fixed-height
        >
            <PmtContent
                v-if="employeeSchedules && employeeSchedules.length && employees.length"
                ref="content"
                class="container-fluid animated slideInLeft"
            >
                <VRow :justify="'space-between'">
                    <VCol
                        cols="12"
                        xs="12"
                        md="12"
                        sm="12"
                        lg="12"
                    >
                        <DepartmentEmployeeAssessments
                            ref="departmentAssessmentsList"
                            :employee-schedules="employeeSchedules"
                            :selected-date="selectedDate"
                            :selected-department="selectedDepartment"
                            :active-panel="activePanel"
                            :search="search"
                            :loading-employee-assessments="loadingEmployeeAssessments"
                            :assessments="assessments[weekIndex] || []"
                            :selection="activeEmployeeSelection"
                            @active-panel="activePanel = $event"
                            @row-selected="employeeSelected"
                        />
                    </VCol>
                </VRow>
            </PmtContent>
            <EmptyState
                v-else-if="search === ''"
                ref="noSchedulesEmptyState"
                :title="$t('pages.employeeAssessments.emptyStates.noAssessments.title')"
                :sub-title="$t('pages.employeeAssessments.emptyStates.noAssessments.subTitle')"
                component="no-schedule"
                :show="true"
                :size="IS_MOBILE ? 250 : 350"
                no-padding
            />
            <EmptyState
                v-else-if="search !== ''"
                ref="noSearchResultsEmptyState"
                :title="$t('pages.employeeAssessments.emptyStates.noSearchResults.title')"
                :sub-title="$t('pages.employeeAssessments.emptyStates.noSearchResults.subTitle')"
                component="no-schedule"
                :show="true"
                :size="IS_MOBILE ? 250 : 350"
                no-padding
            />
            <template #right>
                <AssessmentSidePanel
                    ref="assessmentsSidePanel"
                    :class="{'d-none': activeEmployeeSelection.length === 0}"
                    style="top: 0"
                    @close="closeRightSide"
                >
                    <AssessmentTabs
                        v-if="showRightSide"
                        ref="assessmentTabs"
                        :active-employee-selection="activeEmployeeSelection[0]"
                        :selected-date="selectedDate"
                        :selected-department="selectedDepartment"
                        :loading-history="assessmentHistoryLoading"
                        :saved="saved"
                        @close="closeRightSide"
                        @reload="reloadAssessments"
                    />
                </AssessmentSidePanel>
            </template>
        </PmtLayout>
    </div>
</template>

<script>
import { mapState, mapMutations, mapGetters, mapActions } from 'vuex'
export default {
    name: 'EmployeeAssessments',
    components: {
        TopBar: () => import(/* webpackChunkName: "layout" */ '@/components/ui/top-bar/TopBar.vue'),
        DatePicker: () => import(/* webpackChunkName: "datepicker" */ '@/components/ui/pickers/DatePicker'),
        DepartmentEmployeeAssessments: () => import(/* webpackChunkName: "assessments" */ '@/pages/user/assessments/DepartmentEmployeeAssessments'),
        AssessmentTabs: () => import(/* webpackChunkName: "assessments" */ '@/pages/user/assessments/AssessmentTabs'),
        AssessmentSidePanel: () => import(/* webpackChunkName: "assessments" */ '@/pages/user/assessments/AssessmentSidePanel'),
    },
    data () {
        return {
            activePanel: [0],
            isLoading: true,
            search: '',
            selectedDate: this.$moment(),
            selectedDepartment: {},
            activeEmployeeSelection: [],
            showRightSide: true,
            originalTopbarHeight: 0,
            originalSidebarWidth: 0,
            assessmentHistoryLoading: false,
            loadingEmployeeAssessments: 0,
            saved: 0,
        }
    },
    computed: {
        ...mapGetters('auth', {
            userCan: 'canYou',
            user: 'user',
        }),
        ...mapState('schedules', {
            allWeekSchedules: 'allWeekSchedules',
        }),
        ...mapState('account', {
            employees: 'employees',
        }),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
            PAGE_WIDTH: 'PAGE_WIDTH',
        }),
        ...mapGetters('account', {
            assessments: 'assessments',
            getEmployeeById: 'getEmployeeById',
            assessmentHistory: 'assessmentHistory',
        }),
        ...mapState('departments', {
            departments: 'departments',
        }),
        datepickerOptions () {
            return {
                id: 'employee-assessments-datepicker',
                maxDate: this.$moment(),
                selectedDate: this.$moment(this.selectedPickerDate),
                showNavigation: true,
                handleRoute: true,
            }
        },
        weekIndex () {
            return `'${this.$route.params.year}-${this.$route.params.week}'`
        },
        weekSchedules () {
            return this.allWeekSchedules[this.weekIndex]
        },
        /**
         * Gets the selected date for the datepicker based on the route params
         * @returns {String, Moment}
         */
        selectedPickerDate () {
            const params = {
                week: this.$route.params.week || this.$moment().isoWeek(),
                year: this.$route.params.year || this.$moment().isoWeekYear(),
            }
            // can return moment if we pass true as third argument (unformatted). See /config/moment.js
            return this.$moment().fromRouteParams(params, 'week')
        },
        /**
         * Gets the department list with employees that have schedules on it.
         * @returns {Array}
         */
        employeeSchedules () {
            const employeesList = []
            // check all the employees
            this.employees.forEach(employee => {
                const employeeSchedules = this.weekSchedules
                    ? this.weekSchedules.filter(schedule => {
                        return parseInt(schedule.account_id) === parseInt(employee.account_id)
                    })
                    : []
                if (employeeSchedules.length > 0) {
                    // employee that has at least one schedule in the week
                    employee.schedules = employeeSchedules
                    employeesList.push(employee)
                }
            })
            let departmentEmployeeSchedules = []
            // check all departments and add employees with schedules
            this.departments.forEach(department => {
                const departmentEmployees = employeesList.filter(employee => {
                    const departementScheculeds = employee.schedules.filter(schedule => {
                        return parseInt(schedule.department.department_id) === parseInt(department.department_id) && schedule.status !== 'draft'
                    })
                    if (departementScheculeds.length > 0) {
                        // employee that has at least on schedule on department
                        return employee
                    } else {
                        return false
                    }
                })
                // if we have employees with schedules on the department, insert them in the main Array
                if (departmentEmployees.length > 0) {
                    departmentEmployeeSchedules.push({
                        department,
                        employees: departmentEmployees,
                    })
                }
            })
            // remove departments that do not corespond to the employee search
            // if search does not find an employee on the department, remove other departments
            if (this.search !== '') {
                departmentEmployeeSchedules = departmentEmployeeSchedules.filter(item => {
                    const foundEmployees = item.employees.filter(employee => {
                        return employee.name.toLowerCase().includes(this.search.toLowerCase())
                    })
                    return foundEmployees.length > 0
                })
            }
            return departmentEmployeeSchedules
        },
    },
    methods: {
        ...mapActions('account', {
            getAssessments: 'getAssessments',
            getAssessmentHistory: 'getAssessmentHistory',
            getEmployees: 'getEmployees',
        }),
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('schedules', {
            getAllWeekSchedules: 'getAllWeekSchedules',
        }),
        ...mapActions('departments', {
            getDepartments: 'get',
        }),

        /**
         * Closes the side panel and updates current selection values
         */
        closeRightSide () {
            this.activeEmployeeSelection = []
            this.selectedDepartment = {}
            this.showRightSide = false
        },

        /**
         * When employee row is selected we update current selection values and make necessary API calls
         */
        async employeeSelected (event) {
            // get history for selected employee only if it disfferent than previous selected employee or is a different department
            if ((this.activeEmployeeSelection[0] && this.activeEmployeeSelection[0].employee !== event.row[0].employee) || parseInt(event.department.department_id) !== parseInt(this.selectedDepartment.department_id)) {
                this.activeEmployeeSelection = event.row
                this.selectedDepartment = event.department
                this.showRightSide = true
                const history = this.assessmentHistory[`'${event.row[0].fullObject.account_id}'`]
                if (!history) {
                    this.assessmentHistoryLoading = true
                    await this.getAssessmentHistory({ account_id: event.row[0].fullObject.account_id })
                    this.assessmentHistoryLoading = false
                }
            } else {
                this.activeEmployeeSelection = []
                this.selectedDepartment = {}
                this.showRightSide = false
            }
        },

        /**
         * When date is selected from the date picker, we make necessary API calls and update current selection details
         */
        async onDatePickerChange (date) {
            this.activePanel = []
            this.activeEmployeeSelection = []
            this.isLoading = true
            if (!this.employees.length) {
                await this.getEmployees({ active: true }).catch((error) => { this.SET_SNACKBAR({ message: error.message, error: true }) })
            }
            if (!this.departments.length) {
                await this.getDepartments({ allDepartments: true }).catch((error) => { this.SET_SNACKBAR({ message: error.message, error: true }) })
            }
            if (!this.assessments[this.weekIndex]) {
                await this.getWeekAssessments(date)
            }
            if (!this.weekSchedules) {
                await this.getWeekschedules(date)
            }
            this.activePanel = [0]
            this.activeEmployeeSelection = []
            this.selectedDate = date
            this.isLoading = false
        },

        /**
         * Called when the child assessment form creates (created === true) or removes (created === false) the assessment.
         * This method is called after the API call from child to save or remove it.
         * Refetches the assessments and history to update main grid with saved values
         */
        async reloadAssessments (created) {
            const accountId = this.activeEmployeeSelection[0].fullObject.account_id
            this.assessmentHistoryLoading = true
            this.getAssessmentHistory({ account_id: accountId })
            this.assessmentHistoryLoading = false
            this.loadingEmployeeAssessments = accountId
            if (created) {
                await this.getWeekAssessments(this.selectedDate, accountId, true)
            } else {
                await this.getWeekAssessments(this.selectedDate, undefined, false)
            }
            this.saved += 1
            this.loadingEmployeeAssessments = 0
        },

        /**
         * Calls the API to fetch the current selected date weekSchedule
         */
        async getWeekschedules (date) {
            const params = {
                week: date.isoWeek(),
                year: date.isoWeekYear(),
            }
            await this.getAllWeekSchedules(params).catch((error) => { this.SET_SNACKBAR({ message: error.message, error: true }) })
        },

        /**
         * Calls the API to fetch the current selected date week assessments
         */
        async getWeekAssessments (date, accountId, update) {
            const week = `${date.isoWeekYear()}-${date.isoWeek()}`
            await this.getAssessments({ week, account_id: accountId, update }).catch((error) => {
                this.SET_SNACKBAR({ message: error.message, error: true })
            })
        },
    },
}
</script>
