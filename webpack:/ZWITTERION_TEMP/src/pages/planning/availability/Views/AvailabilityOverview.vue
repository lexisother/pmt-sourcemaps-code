<template>
    <div>
        <div v-if="CAN_VIEW_OTHERS_AVAILABILITIES">
            <!-- The following top bar will be visible on mobile only.
             It will handle the sidepanels and the sorting -->
            <AvailabilityOverviewTopbar
                v-if="IS_MOBILE"
                ref="filtersTopbar"
                :show-filter-buttons="!comparingWeekset"
                :departments="departments"
                :show-search="false"
                :show-weekly-overview="IS_MOBILE && !showRightSidePanel"
                :show-date-picker="false"
                @sort-employees="setSortEmployeesData($event)"
                @weekly-overview="showRightSidePanel = true"
            />
            <!-- The following top bar will be visible both on mobile and desktop.
             On mobile it will handle only date picker and search option.
             On desktop it will handle all options as it is the only visible topbar -->
            <AvailabilityOverviewTopbar
                v-if="!IS_MOBILE || (IS_MOBILE && !comparingWeekset)"
                ref="overviewTopBar"
                :loading="isLoading"
                :selected-date="selectedDate"
                :departments="departments"
                :show-weekly-overview="!IS_MOBILE && !showRightSidePanel"
                :right-side-open="showRightSidePanel"
                :search="search"
                :show-filter-buttons="!IS_MOBILE"
                :show-settings="!IS_MOBILE"
                :show-search="!comparingWeekset"
                :show-date-picker="!comparingWeekset"
                @on-date-select="loadOverview"
                @sort-employees="setSortEmployeesData($event)"
                @search="search = $event"
                @weekly-overview="showRightSidePanel = true"
            />
            <PmtLayout
                ref="layout"
                v-touch="{left: () => navigate('left'), right: () => navigate('right')}"
                :show-right-side="showRightSidePanel"
                fixed-height
                :loading="isLoading"
                @on-right-side-show="showRightSidePanel = true;"
                @on-right-side-hide="showRightSidePanel = false"
            >
                <PmtContent :narrow="PAGE_WIDTH > 1200">
                    <div
                        v-if="filteredRows.length"
                        class="pt-5 pb-5"
                        :class="{'pl-3 pr-3': !IS_MOBILE}"
                    >
                        <component
                            :is="!IS_MOBILE ? 'h2' : 'h4'"
                            ref="overviewHeader"
                            :key="!!comparingWeekset"
                            class="pl-3 pr-3 animated slideInRight"
                        >
                            <template v-if="!comparingWeekset">
                                <strong>Week {{ selectedDate.format('w MMMM YYYY') }}</strong>
                            </template>
                            <template v-else>
                                <strong>{{ getEmployeeById(comparingWeekset.account_id).employee_first_name + ' ' +getEmployeeById(comparingWeekset.account_id).employee_last_name }}</strong> - {{ $t('pages.availabilityOverview.tooltips.comparingWithSelectedWeekset') }}
                                <PmtButton
                                    class="remove-comparison"
                                    danger
                                    inverted
                                    medium
                                    icon="close"
                                    :icon-size="18"
                                    @click="removeComparison()"
                                >
                                    {{ $t(`sidePanels.availabilityWeeklyOverview.tooltips.uncompare`) }}
                                </PmtButton>
                            </template>
                        </component>
                        <PmtTransition
                            v-if="sortedFilteredRows.length && !isLoading && departmentsWithTotals.length"
                            name="slide"
                            appear
                            mode="in-out"
                            :direction="datepicker.direction"
                            fullscreenloading
                        >
                            <AvailabilityOverviewContent
                                :key="$route.params.week"
                                ref="overviewContent"
                                :selected-date="selectedDate"
                                :departments="departmentsWithTotals"
                                :rows="sortedFilteredRows"
                                :comparing="!!comparingWeekset"
                                :show-day-totals="filters.showDayTotals"
                                :group-by-employees="filters.groupByEmployees"
                                :employee-total-times="employeeTotalTimes"
                                :has-search="search !== ''"
                                :search="search"
                            />
                        </PmtTransition>
                    </div>
                    <EmptyState
                        v-if="!sortedFilteredRows.length && !isLoading"
                        ref="noResults"
                        :title="$t('ui.emptyState.nothingAvailableForFiltersTitle')"
                        :sub-title="$t('ui.emptyState.nothingAvailableForFiltersSubTitle')"
                        component="four-o-four"
                        empty-search-result
                        show
                        :size="IS_MOBILE ? 250 : 500"
                        no-padding
                    />
                </PmtContent>
                <template #right>
                    <AvailabilityWeeklyOverviewSidePanel
                        v-show="showRightSidePanel"
                        ref="weeksetsSidePanel"
                        :key="$route.params.week"
                        @close="showRightSidePanel = false"
                        @compare="prepareToCompareWeekset($event)"
                        @approve-all="getAllWeeksets"
                    />
                </template>
            </PmtLayout>
        </div>
        <EmptyState
            v-else
            ref="noAccess"
            :title="$t('ui.singles.noAccess')"
            :component="'four-o-four'"
            :show="true"
            :is-error="true"
            no-padding
        />
    </div>
</template>

<script>
import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
import stringHelper from '@/libraries/stringHelper'
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    name: 'AvailabilityOveview',
    components: {
        AvailabilityWeeklyOverviewSidePanel: () => import('../SidePanels/AvailabilityWeeklyOverviewSidePanel'),
        AvailabilityOverviewContent: () => import('./Components/AvailabilityOverviewContent'),
        AvailabilityOverviewTopbar: () => import('@/pages/planning/availability/Views/Components/AvailabilityOverviewTopbar'),
    },
    data () {
        return {
            direction: 'right',
            showRightSidePanel: false,
            search: '',
            isLoading: false,
            sortDirection: 'asc',
            sortBy: '',
            rows: [],
            selectedDate: this.$moment().fromRouteParams(this.$route.params, 'week', true),
        }
    },
    computed: {
        ...mapGetters(['IS_MOBILE', 'PAGE_WIDTH', 'FITS_FILTERS_ON']),
        ...mapGetters('auth', {
            canViewOthersContractData: 'canViewOthersContractData',
            canYou: 'canYou',
        }),
        ...mapGetters('auth', ['CAN_VIEW_OTHERS_AVAILABILITIES']),
        ...mapState('account', {
            employees: 'employees',
        }),
        ...mapGetters('account', ['getEmployeeById']),
        ...mapState('departments', {
            weekDepartments: 'weekDepartments',
        }),
        ...mapState('availability', {
            employeesWeeksets: 'employeesWeeksets',
            comparingWeekset: 'comparingWeekset',
        }),
        ...mapGetters('availability', ['groupedEmployeesWeeksets', 'employeesWeekAvailabilities']),
        ...mapGetters('contracts', {
            contracts: 'employeeContracts',
        }),
        ...mapState({ filters: 'pageFilters' }),
        ...mapGetters('datepicker', ['DATEPICKER_BY_ID']),
        datepicker () {
            return this.DATEPICKER_BY_ID('availability-overview-datepicker')
        },

        departments () {
            return this.weekDepartments[`"${this.selectedDate.isoWeek()}-${this.selectedDate.isoWeekYear()}"`] || []
        },

        availabilities () {
            const params = this.$route.params
            return this.employeesWeekAvailabilities(params.week, params.year)
        },

        /**
             * Return an array of Moment days in the current week.
             * @returns {Array}
             */
        currentWeekDays () {
            return this.selectedDate ? this.selectedDate.toCalendarArray('week') : this.$moment().toCalendarArray('week')
        },

        /**
             * Gets all the departments and totals for repsective employees availabilities
             */
        departmentsWithTotals () {
            return this.departments.map(department => {
                return {
                    department,
                    totals: this.departmentTotals(department.department_id),
                }
            })
        },

        /**
             * Returns the employees sorted and filtered based on selected filters/sorting options.
             */
        sortedFilteredRows () {
            if (!this.filteredRows.length) {
                return []
            }

            // Sort ony if sort option is selected and if different than departments because the departments sorting
            // is done in another place.
            if (this.sortBy !== '' && this.sortBy !== 'department_name') {
                if (this.sortDirection === 'desc') {
                    return this.filteredRows.slice().sort((a, b) => this.compare(a, b)).reverse()
                } else {
                    return this.filteredRows.slice().sort((a, b) => this.compare(a, b))
                }
            }
            return this.filteredRows
        },

        /**
             * Filters employees.
             */
        filteredRows () {
            return this.rows.filter(row => {
                const fitsFilter = this.FITS_FILTERS_ON({
                    department_ids: [row.department_id],
                    age_filter_key: row.age_filter_key,
                    contract_type: row.contract ? row.contract.contract_type : '',
                    competences: row.employee.competences,
                    weeksets: row.weeksets,
                    availability_types: row.availability_types,
                })
                let fitsSearch = true
                let notComparing = true
                // Filters based on the search bar text
                if (this.search !== '' && !this.fitsSearchParam(row)) {
                    fitsSearch = false
                }
                // check if comparing is selected and filter by account_id
                if (this.comparingWeekset && parseInt(row.employee.account_id) !== parseInt(this.comparingWeekset.account_id)) {
                    notComparing = false
                }
                if (fitsFilter && fitsSearch && notComparing) {
                    return row
                }
                return false
            })
        },
        groupedDepartmentRows () {
            return stringHelper.groupBy(this.sortedFilteredRows, 'department_id')
        },
        searchFields () {
            return ['first_name', 'middle_name', 'last_name', 'full_name', 'age', 'department_id', 'personnel_number', 'account_id']
        },
    },

    created () {
        this.UPDATE_ENABLED_FILTERS({
            // Filters
            contractTypes: true,
            weeksetStatuses: true,
            availabilityTypes: true,
            departments: true,
            age: true,
            competences: true,
            // Settings
            dayTotals: true,
            // GroupBys
            groupByEmployees: true,
        })
    },

    async mounted () {
        if (this.$route.params.fetchWeeksets) {
            this.getAllWeeksets()
        }
        if (this.canViewOthersContractData && !this.contracts.length) {
            // get contracts if permissions allows it and not already fetched
            this.getContracts({ date: this.$moment().apiFormat() })
        }
    },

    async destroyed () {
        // remove existing comparison, before moving to another page
        this.setComparingWeekset(null)
    },

    methods: {
        ...mapMutations(['CLEAR_PAGE_FILTERS', 'UPDATE_ENABLED_FILTERS']),
        ...mapActions('account', {
            getEmployees: 'getEmployees',
        }),
        ...mapActions('departments', {
            getDepartments: 'getWeekDepartments',
        }),
        ...mapActions('availability', {
            getAvailabilities: 'getEmployeesAvailabilitiesForWeek',
            getWeeksets: 'getEmployeesWeeksets',
        }),
        ...mapActions('contracts', {
            getContracts: 'getContracts',
        }),
        ...mapMutations('availability', {
            removeAllCompareAvailabilities: 'removeAllCompareAvailabilities',
            setComparingWeekset: 'setComparingWeekset',
        }),

        setDefaultFilters () {
            this.CLEAR_PAGE_FILTERS()
        },
        /**
             * Cleans up the filters and search to prepare the comparing
             * The actual comparing is done from the sidepanel
             * see ../SidePanels/AvailabilityWeeklyOverviewSidePanel.vue
             */
        async prepareToCompareWeekset (event) {
            await this.CLEAR_PAGE_FILTERS()
            this.search = ''
            if (this.IS_MOBILE) {
                // hides the sidepanel on mobile
                this.showRightSidePanel = false
            }
        },

        /**
             * A set of items to search against the saerch item
             * @param {Object} row
             * @returns Boolean
             */
        fitsSearchParam (row) {
            const search = this.search.trim().toLowerCase()
            let result = false
            for (let i = 0; i < this.searchFields.length; i++) {
                const field = row[this.searchFields[i]]
                if (field && field.toString().toLowerCase().includes(search)) {
                    result = true
                    break
                }
            }
            return result
        },

        /**
             * Used for mobile swipe navigation
             */
        navigate (direction) {
            // do not allow navigation when comparing weeksets
            if (!this.comparingWeekset) {
                this.$refs.overviewTopBar.$refs.datepicker.navigate(direction === 'right' ? -1 : 1)
            }
        },

        /**
             * Initial load of the data used to show on the page
             */
        async loadOverview (date) {
            if (!this.isLoading) {
                this.isLoading = true
                this.selectedDate = date
                await this.setComparingWeekset(null)
                if (!this.departments.length) {
                    await this.getDepartments({ date: date.apiFormat(), allDepartments: this.canYou('planning', 'all_departments') })
                }
                if (!this.employees.length) {
                    await this.getEmployees({ active: true })
                }
                await this.getAvailabilities(date)
                await this.getAllWeeksets()
                await this.setRows()
                this.isLoading = false
            }
        },

        /**
             * Calculates the availability totals for the individual department rows
             */
        departmentTotals (departmentId) {
            const result = {}
            const totals = []
            let school = 0
            let available = 0
            let unavailable = 0
            const departmentRows = this.groupedDepartmentRows[departmentId]
            if (departmentRows) {
                departmentRows.forEach(row => {
                    if (row.department_id === departmentId) {
                        if (row.totalTimes && Object.keys(row.totalTimes).length) {
                            totals.push(row.totalTimes)
                        }
                    }
                })
            }
            totals.forEach(item => {
                if (item.school) {
                    school += this.$moment.duration(item.school.value, 'HH:mm').asMilliseconds()
                }
                if (item.available) {
                    available += this.$moment.duration(item.available.value, 'HH:mm').asMilliseconds()
                }
                if (item.unavailable) {
                    unavailable += this.$moment.duration(item.unavailable.value, 'HH:mm').asMilliseconds()
                }
            })
            if (school) {
                result.school = this.totalTime('school', school)
            }
            if (available) {
                result.available = this.totalTime('available', available)
            }
            if (unavailable) {
                result.unavailable = this.totalTime('unavailable', unavailable)
            }
            return result
        },

        /**
             * Calculates the availability totals for the individual employees and availability type
             */
        employeeTotalTimes (availabilities) {
            const result = {}
            let school = 0
            let available = 0
            let unavailable = 0
            if (availabilities) {
                availabilities.forEach(availability => {
                    const { from, to } = schedulingHelper.availabilityTimes(availability)
                    const difference = to.diff(from)
                    if (availability.type === 'school') {
                        school += difference
                    }
                    if (availability.type === 'agreed' || availability.type === 'preferred') {
                        available += difference
                    }
                    if (availability.type === 'sport' || availability.type === 'other') {
                        unavailable += difference
                    }
                })
            }
            if (school) {
                result.school = this.totalTime('school', school)
            }
            if (available) {
                result.available = this.totalTime('available', available)
            }
            if (unavailable) {
                result.unavailable = this.totalTime('unavailable', unavailable)
            }
            return result
        },

        /**
             * Calculates total hours for an individual availability
             * @param {String} type the availability type name
             * @param {Number} milliseconds calculated miliseconds
             * @returns {Object}
             */
        totalTime (type, milliseconds) {
            const icon = type === 'school' ? 'school' : type === 'available' ? 'check' : 'cancel'
            const duration = this.$moment.duration(milliseconds)
            const hours = Math.floor(duration.asHours())
            return { class: type, value: (hours < 10 ? `0${hours}` : hours) + this.$moment.utc(milliseconds).format(':mm'), icon: icon }
        },

        /**
             * Updates sorting options to current component based on selected sorting options in the topbar
             */
        setSortEmployeesData (payload) {
            this.sortDirection = payload.sortDirection
            this.sortBy = payload.sortBy
        },

        /**
             * Returns the id of the filter option based on age.
             *
             * @param { number } age
             *
             * @returns {string}
             */
        mapAgeToFilters (age) {
            if (age <= 14) {
                return '13_14_year'
            }
            if (age === 15) {
                return '15_year'
            }

            if (age >= 18) {
                return '18_year_up'
            }

            // Else the employee is 16/17.
            return '16_17_year'
        },

        /**
             * Returns employee data to be used for filtering rows.
             *
             * @param employeeData
             * @returns {{age_filter_key: string, competences: [], availability_types: (string[]|*[])}}
             */
        addFilterDataForEmployee (employeeData) {
            const employeeAvailabilities = this.availabilities[employeeData.account_id] || []
            const availabilityTypes = [...new Set(employeeAvailabilities.map(item => { return item.type }))]
            const department = employeeData.departments.find(dep => (dep.is_default))
            return {
                age: employeeData.age,
                personnel_number: employeeData.personnel_number,
                age_filter_key: employeeData.age_filter_key,
                availability_types: availabilityTypes.length === 0 ? ['none'] : availabilityTypes,
                competences: employeeData.competences,
                department_id: department ? department.id : 0,
                first_name: employeeData.employee_first_name,
                middle_name: employeeData.employee_middle_name,
                last_name: employeeData.employee_last_name,
                full_name: this.employeeFullname(employeeData),
            }
        },

        /**
             * Comparing method used for sorting.
             *
             * @param {Array} a
             * @param {Array} b
             * @returns {number}
             */
        compare (a, b) {
            if (a[this.sortBy] === b[this.sortBy]) {
                return 0
            }
            return a[this.sortBy] < b[this.sortBy] ? -1 : 1
        },

        setRows () {
            this.rows = this.employees.filter(employee => {
                // inlclude only active employees of employees that start in the future
                const activeInFuture = employee.date_of_employment && this.$moment(employee.date_of_employment).isAfterOrSameDayAs(this.$moment())
                return employee.active || activeInFuture
            }).map(employee => {
                const employeeAvailabilities = this.availabilities[employee.account_id] || []
                const days = []
                this.currentWeekDays.forEach(day => {
                    const dayAvailabilities = employeeAvailabilities.filter(item => item.date === day.apiFormat())
                    days.push({ availabilities: dayAvailabilities, moment: day })
                })
                if (this.departments.length) {
                    employee.departments.forEach(department => {
                        const found = this.departments.find(dep => dep.department_id === department.id)
                        department.color = found ? found.color : ''
                        department.status = found ? found.status : {}
                        department.last_finalized_date = found ? found.last_finalized_date : ''
                        department.last_closed_date = found ? found.last_closed_date : ''
                    })
                }
                const weeksets = this.groupedEmployeesWeeksets('account_id')[employee.account_id] // this.employeesWeeksets.filter(weekset => weekset.account_id === employee.account_id),
                return {
                    ...this.addFilterDataForEmployee(employee),
                    ...{
                        account_id: employee.account_id,
                        employee,
                        days: days,
                        totalTimes: this.employeeTotalTimes(employeeAvailabilities),
                        weeksets: weeksets || [],
                        hasAvailabilities: !!days.find(day => { return day.availabilities.length > 0 }),
                        contract: this.contracts.find(contract => contract.account_id === employee.account_id),
                    },
                }
            })
        },
        async getAllWeeksets () {
            if (!this.employeesWeeksets.length) {
                // pending is not called with a date filter to get all future pending
                await this.getWeeksets({ status: 'pending' })
                // the rest are fetched with the date filter to reduce load
                await this.getWeeksets({ status: 'rejected' })
                await this.getWeeksets({ status: 'approved' }).then(result => {
                    if (!this.IS_MOBILE) {
                        this.showRightSidePanel = true
                    }
                })
            }
        },

        /**
         * Actions performed when comparison is dismissed.
         */
        removeComparison () {
            this.$refs.overviewContent.temporaryGroupByEmployees = false
            this.setComparingWeekset(null)
        },

        employeeFullname (details) {
            if (details.employee_middle_name !== '') {
                return `${details.employee_first_name} ${details.employee_middle_name} ${details.employee_last_name}`
            } else {
                return `${details.employee_first_name} ${details.employee_last_name}`
            }
        },
    },

}
</script>
<style lang="scss" scoped>
    .filters-container {
        padding: 10px;
    }
    .scroller {
        height: 100%;
    }
    .user {
        height: 32%;
        padding: 0 12px;
        display: flex;
        align-items: center;
    }
    .remove-comparison {
        top: -2px;
        position: relative;
    }
</style>
