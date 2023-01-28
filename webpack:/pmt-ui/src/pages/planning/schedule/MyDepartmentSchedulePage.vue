<template>
    <div :class="{'full-screen-schedules': fullScreen, 'printing': print}">
        <DepartmentScheduleTopBar
            ref="topbar"
            :show-filters="currentEmployeeDepartments.length > 1"
            :sort-by="sortBy"
            :sort-direction="sortDirection"
            :sort-items="sortItems"
            :selected-date="getSelectedDate"
            :loading="loading"
            :search="search"
            :datepicker-id="datepickerId"
            :departments="currentEmployeeDepartments"
            @print="print = !print"
            @search="search = $event"
            @date-selected="onDatePickerChange($event)"
            @on-sort-select="sortSchedules($event)"
            @sort="sortDirection === 'asc' ? sortDirection = 'desc' : sortDirection = 'asc'"
        />
        <PmtLayout
            fixed-height
            :loading="loading"
            :main-style="'background-color: white'"
        >
            <PmtContent v-if="sortedFilteredRows && sortedFilteredRows.length && weekFinalized">
                <DepartmentSchedulesGrid
                    ref="timeGrid"
                    v-touch="{left: () => swipe(1), right: () => swipe(-1)}"
                    :rows="sortedFilteredRows"
                    :direction="direction"
                    :print="print"
                    :start-time="$moment().clone().setTime(weekBusinessTimes.from).format('HH:00')"
                    :end-time="weekBusinessTimes.to < '23:30' ? $moment().clone().setTime(weekBusinessTimes.to).add(30, 'minutes').format('HH:00') : weekBusinessTimes.to"
                    :current-date="currentDate"
                />
            </PmtContent>
            <PmtContent
                v-else
                class="empty-state"
            >
                <EmptyState
                    v-if="emptyStateData"
                    ref="emptyState"
                    :title="emptyStateData.title"
                    :sub-title="emptyStateData.subtitle"
                    :component="emptyStateData.component"
                    empty-search-result
                    :show="true"
                    :size="IS_MOBILE ? 300 : 500"
                    :is-error="emptyStateData.isError"
                    :action-text="emptyStateData.actionText"
                    no-padding
                    @action-click="emptyStateData.actionClick"
                />
            </PmtContent>
        </PmtLayout>
    </div>
</template>

<script>
import objectHelper from '@/libraries/objectHelper'
import { mapGetters, mapActions, mapMutations, mapState } from 'vuex'

export default {
    name: 'MyDepartmentSchedulePage',
    components: {
        DepartmentSchedulesGrid: () => import('@/pages/planning/schedule/DepartmentSchedulesGrid.vue'),
        DepartmentScheduleTopBar: () => import('@/pages/planning/schedule/DepartmentScheduleTopBar'),
    },
    data () {
        return {
            rows: [],
            error: false,
            errorText: '',
            loading: true,
            sortBy: 'Start Time',
            sortDirection: 'asc',
            currentDate: this.$moment(),
            datepickerId: 'department-schedules-datepicker',
            search: '',
            print: false,
            direction: 'left',
        }
    },
    computed: {
        ...mapGetters('auth', {
            canViewOthersContractData: 'canViewOthersContractData',
            user: 'user',
        }),
        ...mapGetters('stores', {
            weekBusinessTimes: 'getWeekBusinessTimes',
        }),
        ...mapGetters('auth', {
            canFetchStoreSchedules: 'canFetchStoreSchedules',
            isOrganisationalUser: 'isOrganisationalUser',
            allDepartmentsAccess: 'allDepartmentsAccess',
        }),
        ...mapGetters('departments', {
            getDepartmentById: 'getById',
            employeeWeekDepartments: 'employeeWeekDepartments',
        }),
        ...mapState('account', {
            employees: 'employees',
            storeEmployees: 'storeEmployees',
        }),
        ...mapGetters('account', ['getEmployeeById']),
        ...mapGetters({
            IS_MOBILE: 'IS_MOBILE',
            FITS_FILTERS_ON: 'FITS_FILTERS_ON',
            HAS_FILTERS: 'HAS_FILTERS',
        }),
        ...mapState({
            filters: 'pageFilters',
        }),
        ...mapGetters('contracts', {
            contracts: 'employeeContracts',
        }),
        ...mapState('schedules', ['weekSchedule']),
        ...mapGetters('schedules', {
            employeeWeekStatus: 'employeeWeekStatus',
        }),
        ...mapGetters('datepicker', ['DATEPICKER_BY_ID']),
        ...mapGetters('auth', ['user', 'canPlanOthers', 'canPrintDepartmentSchedules']),
        ...mapGetters('planning', {
            DEPARTMENTS: 'DEPARTMENTS',
        }),

        datepicker () {
            return this.DATEPICKER_BY_ID(this.datepickerId)
        },
        sortItems () {
            return [
                {
                    label: this.$t('ui.barButton.sortBy.name'),
                    value: 'Employee',
                    key: 'employee',
                },
                {
                    label: this.$t('ui.barButton.sortBy.startTime'),
                    value: 'Start Time',
                    key: 'starttime',
                },
            ]
        },
        emptyStateData () {
            if (this.error) {
                return {
                    title: this.errorText,
                    subtitle: this.$t('pages.myDepartmentSchedule.error', { date: this.currentDateLocaleStr }),
                    component: 'five-hundred',
                    isError: true,
                    actionText: this.$t('pages.myDepartmentSchedule.tryAgain'),
                    actionClick: this.updateDepartmentSchedule,
                }
            }
            if (!this.weekFinalized) {
                return {
                    title: this.$t('pages.mySchedule.weeksNotFinalizedTitle'),
                    subtitle: this.$t('pages.mySchedule.weeksNotFinalizedText'),
                    component: 'schedules-not-finalized',
                    actionText: '',
                    actionClick: false,
                }
            }
            if (!this.HAS_FILTERS && !this.sortedFilteredRows.length && this.weekFinalized) {
                return {
                    title: this.$t('pages.mySchedule.weeksNotFinalizedTitle'),
                    subtitle: this.$t('pages.myDepartmentSchedule.noItemsFoundForDepartment', { date: this.currentDateLocaleStr, department: this.filteredEmployeeDepartmentNames }),
                    component: 'four-o-four',
                    actionText: '',
                    actionClick: false,
                }
            }
            if (this.HAS_FILTERS && !this.sortedFilteredRows.length && this.weekFinalized) {
                return {
                    title: this.$t('ui.emptyState.nothingAvailableForFiltersTitle'),
                    subtitle: this.$t('ui.emptyState.nothingAvailableForFiltersSubTitle'),
                    component: 'four-o-four',
                    actionText: '',
                    actionClick: false,
                }
            }
            return false
        },
        filteredEmployeeDepartmentNames () {
            return this.filters.departments.map(dep => {
                const foundDepartment = this.DEPARTMENTS(this.currentDate).find(empDep => {
                    return empDep.department_id === dep
                })
                if (foundDepartment) {
                    return ' ' + foundDepartment.department_name
                }
                return ''
            })
        },
        routeDate () {
            return this.$moment({ year: this.$route.params.year, month: this.$route.params.month - 1, day: this.$route.params.day })
        },
        currentDateLocaleStr () {
            return this.getSelectedDate.shortDayFormat()
        },
        sortedFilteredRows () {
            const filtered = this.departmentFilteredRows
            if (!filtered.length) {
                return []
            }
            if (this.sortBy !== '' && this.sortDirection !== 'none') {
                switch (this.sortBy) {
                    case 'Employee':
                        if (this.sortDirection === 'desc') {
                            return filtered.slice().sort(this.$helpers.compare('name')).reverse()
                        } else {
                            return filtered.slice().sort(this.$helpers.compare('name'))
                        }
                    case 'Start Time':
                        if (this.sortDirection === 'desc') {
                            return filtered.slice().sort(this.compareStartTime).reverse()
                        } else {
                            return filtered.slice().sort(this.compareStartTime)
                        }
                }
            } else {
                return filtered.slice().sort(this.compareStartTime)
            }
            return []
        },
        departmentFilteredRows () {
            if (this.DEPARTMENTS(this.currentDate).length > 1) {
                return this.rows.filter(row => {
                    if (this.filters.departments.length) {
                        const shiftsDepartmentIds = []
                        row.shifts.forEach(shift => {
                            if (!shiftsDepartmentIds.includes(shift.department.department_id)) {
                                shiftsDepartmentIds.push(parseInt(shift.department.department_id))
                            }
                        })
                        const hasShiftOnFilter = shiftsDepartmentIds.find(dep => {
                            return this.filters.departments.includes(dep)
                        })
                        if (!hasShiftOnFilter) {
                            return false
                        }
                    }
                    const filterOptions = {}
                    if (row.employee.age) filterOptions.age_filter_key = row.employee.age_filter_key
                    if (row.contract) filterOptions.contract_type = row.contract.contract_type
                    if (row.employee.competences) filterOptions.competences = row.employee.competences
                    const itFits = this.FITS_FILTERS_ON(filterOptions) && this.fitsSearch(row)
                    if (itFits) {
                        if (row.shifts.length > 1) {
                            row.shifts = row.shifts.sort(objectHelper.compareStartTime)
                        }
                        return row
                    }
                    return false
                })
            }
            return this.rows
        },
        fullScreen () {
            return this.$route.query.full_screen
        },
        getSelectedDate () {
            if (this.$route.name === 'my-department-schedule' || this.$route.name === 'department-schedule') {
                if (this.datepicker) {
                    return this.datepicker.selectedDate
                }
                return this.$moment(this.$moment().fromRouteParams(this.$route.params, 'day'))
            }
            return this.$moment()
        },
        weekStatus () {
            return this.employeeWeekStatus({
                year: this.getSelectedDate.isoWeekYear(),
                week: this.getSelectedDate.isoWeek(),
                accountId: this.user.accountId,
            })
        },
        weekFinalized () {
            return this.weekStatus ? this.weekStatus.week_finalized : null
        },
        currentEmployeeDepartments () {
            if (!this.employees.length) return []
            const departments = this.DEPARTMENTS(this.currentDate)
            if (this.isOrganisationalUser || this.canFetchStoreSchedules) return departments
            const employees = this.employees.filter(e => !e.notAssigned)
            if (employees.length) {
                const currentWeekEmployee = employees.find(e => e.account_id === this.user.accountId)
                const currentWeekEmployeeDepartmentIds = currentWeekEmployee?.departments.map(d => d.department_id)
                // current user employee departments in the selected week
                const currentWeekEmployeeDepartments = departments?.filter(d => currentWeekEmployeeDepartmentIds?.includes(d.department_id))
                const currentEmployee = this.CURRENT_EMPLOYEE
                if (currentEmployee && this.SELECTED_DATE.isBefore(this.$moment(), 'week')) {
                    // for historic weeks push all the departments that
                    // the current user has access to now (currentEmployee.departments)
                    // and that are missing from the current selected week departments (currentWeekEmployeeDepartments)
                    currentEmployee.departments.forEach(d => {
                        // check if department is already in the week departments
                        const existingWeekDepartment = currentWeekEmployeeDepartments.find(dep => dep.department_id === d.department_id)
                        if (!existingWeekDepartment) {
                            // if the department is noty already in the selected week departments
                            // push department to current week departments
                            currentWeekEmployeeDepartments.push(d)
                        }
                    })
                }
                return currentWeekEmployeeDepartments.sort(this.compare)
            }
            return []
        },
    },

    async mounted () {
        if (this.canViewOthersContractData && !this.contracts.length) {
            // get contracts if permissions allows it and not already fetched
            await this.getContracts({ date: this.$moment().apiFormat() })
        }
    },
    created () {
        this.UPDATE_ENABLED_FILTERS({
            // Settings
            showDayRemarkAsColumn: true,
            showNonProductivesColumn: false,
            showBreakColumn: true,
            showWorkedColumn: true,
            // Filters
            contractTypes: true,
            departments: true,
            age: true,
            competences: true,
        })
    },
    destroyed () {
        this.CLEAR_PAGE_FILTERS()
    },

    methods: {
        ...mapMutations(['CLEAR_PAGE_FILTERS', 'UPDATE_ENABLED_FILTERS']),

        ...mapActions('departments', {
            getWeekDepartmentsForEmployee: 'getWeekDepartmentsForEmployee',
        }),
        ...mapActions('schedules', {
            getDaySchedules: 'getDayDepartmentSchedules',
            getDayRemarks: 'getDayRemarks',
            getEmployeeWeekStatus: 'getEmployeeWeekStatus',
        }),
        ...mapActions('contracts', {
            getContracts: 'getContracts',
        }),
        ...mapActions('account', {
            getStoreEmployees: 'getStoreEmployees',
            getEmployees: 'getEmployees',
        }),
        ...mapActions('planning', {
            getStoreGroups: 'getStoreGroups',
            getDepartments: 'getDepartments',
        }),

        fitsSearch (row) {
            const search = this.search.trim().toLowerCase()
            const employeeFirstName = row.employee.employee_first_name ? row.employee.employee_first_name.toString().toLowerCase() : ''
            const employeeLastName = row.employee.employee_last_name ? row.employee.employee_last_name.toString().toLowerCase() : ''
            const employeeName = row.name ? row.name.toLowerCase() : ''
            return employeeFirstName.includes(search) || employeeLastName.includes(search) || employeeName.includes(search)
        },
        sortSchedules ($event) {
            this.sort($event.value, 'asc')
        },
        sort (sort, event) {
            if (event !== 'none') {
                this.sortBy = sort
            }
            this.sortDirection = event
        },
        // this take in account only the first shift
        // this must be used as custom sorting option for this exact feature.
        // (shifts are originally sorted by start time asc)
        compareStartTime (a, b) {
            const startA = a.earliestStartTime
            const startB = b.earliestStartTime

            let comparison = 0
            if (startA > startB) {
                comparison = 1
            } else if (startA < startB) {
                comparison = -1
            }
            return comparison
        },

        /**
         * Fetches department schedules for selected date.
         */
        async updateDepartmentSchedule () {
            if (!this.weekFinalized) {
                this.loading = false
                return
            }
            const employees = (this.canPlanOthers && !this.canFetchStoreSchedules) ? this.employees : this.storeEmployees
            this.getDaySchedules({ date: this.getSelectedDate, user: this.user, departments: this.currentEmployeeDepartments, employees }).then((scheduleData) => {
                this.rows = scheduleData.filter(s => {
                    // skip or add based on if s.shifts is longer than 0
                    if (s.shifts.length) {
                        return true // skip
                    }
                    return false // add
                }).map(schedule => {
                    schedule.employee = this.getEmployeeById(schedule.accountId)
                    schedule.name = schedule.name || schedule.employee.name
                    schedule.contract = this.contracts.find(contract => contract.account_id === schedule.accountId)
                    schedule.shifts = schedule.shifts.map(shift => {
                        // timeRange prop is added to have an overview of all minutes (15 min increment)
                        // occupied by a certain shift
                        // this is used to fill cells with shift department color
                        // if a shift ends at 16:00 we need the timerange to end at 15:45
                        // because 16:00 is included in the shift that starts at 16:00
                        shift.timeRange = this.$moment().timeRange(shift.startTime, this.$moment().setTime(shift.endTime).subtract(15, 'minutes').format('HH:mm'), '15', 'minutes')
                        shift.department = shift.department || this.getDepartmentById(shift.departmentId)
                        return shift
                    })
                    return schedule
                })
                this.rows = this.rows.sort(objectHelper.compareName)
                this.loading = false
            }).catch((error) => {
                this.handleException(error)
            })
        },
        swipe (direction) {
            this.$refs.topbar.$refs.datepicker.navigate(direction)
        },
        async onDatePickerChange (date) {
            this.currentDate.isBefore(date, 'day') ? this.direction = 'right' : this.direction = 'left'
            this.currentDate = date
            await this.getDepartments(date)
            this.error = false
            if (!this.employees.length) {
                if (this.canPlanOthers && !this.canFetchStoreSchedules) {
                    await this.getEmployees({ active: true })
                } else {
                    await this.getStoreEmployees({ exchange: true })
                    await this.getEmployees({ active: true })
                }
            }
            this.error = false
            this.loading = true
            await this.getEmployeeWeekStatus({
                year: this.getSelectedDate.isoWeekYear(),
                week: this.getSelectedDate.isoWeek(),
                accountId: this.user.accountId,
            }).catch(error => {
                this.handleException(error)
            })
            await this.getWeekDepartmentsForEmployee({ date: this.getSelectedDate, accountId: this.user.accountId })
            await this.updateDepartmentSchedule()
            await this.getDayRemarks({ date: this.getSelectedDate })
                .catch((err) => {
                    this.handleException(err)
                })
            await this.getStoreGroups(this.getSelectedDate)
        },

        /**
         * Handles an api exception.
         */
        handleException (error) {
            this.error = true
            this.errorText = error.message
            this.loading = false
            this.rows = []
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    $shift-bg-color: #B3E7FF;

    .horizontal-time-grid {
        float: left;
        width: 85%;
        border-left: 1px solid $border-color;
        box-sizing: border-box;
    }

    .side-panel .employees.list > li {
        height: 25px;
        padding-top: 0;
        padding-bottom: 0;
        line-height: 25px;
        box-sizing: border-box;
        &.current-user {
            font-weight: 600;
        }
    }

    .info.center {
        text-align: center;
    }

    .full-screen-schedules {
        position: absolute;
        margin:0;
        top: 0;
        left: 0;
        max-height: 100%;
        width: 100%;
        .shifts-table {
            height: 100% !important;
        }
        #layout {
            height: auto !important;
        }
    }
    ::-webkit-scrollbar-track {
        background: white;
    }

    @media print {
        .printing {
            position: absolute;
            margin:0;
            top: 0;
            left: 0;
            max-height: 100%;
            width: 100%;
            .shifts-table {
                height: 100% !important;
            }
            #layout {
                height: auto !important;
            }
        }
    }
</style>
