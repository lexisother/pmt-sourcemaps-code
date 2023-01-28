import Vue from 'vue'
import * as moment from '../../../config/moment'
import vuexHelper from '../../../libraries/vuexHelper'
import schedulesHelper from '../../../libraries/schedulesHelper'
import stringHelper from '../../../libraries/stringHelper'
import columns from '../../../store/modules/scheduling/data/resourceColumns'
Vue.use(moment)

const mutations = {

    SET_WEEK_STEER_INFO(state, { date, result }) {
        const { year, week } = date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'weekSteerInfo', result, year, week)
    },

    /**
     * Updates a setting value.
     *
     * @param state
     * @param setting
     * @param value
     */
    changeSetting(state, { setting, value }) {
        state.settings[setting] = value
    },

    CHANGE_PRINT_SETTING(state, { setting, value }) {
        Vue.set(state.printSettings, setting, value)
    },

    /**
     * Sets the week payroll details totals for all employees
     * @param {Array} result api call result
     * @param {Object} api call payload object that contains api call params
     */
    SET_WEEK_EMPLOYEES_PAYROLL_DETAILS_TOTALS(state, { result, payload }) {
        if (!result || !payload) {
            return
        }
        const mappedPayroll = result.map(item => {
            return schedulesHelper.mapPayrollDetails({ item: [item], payload })
        })
        const { week, year } = Vue.moment(payload.from).weekYearObject()
        vuexHelper.setYearWeekData(state, 'employeesPayrollDetailsTotals', stringHelper.groupBy(mappedPayroll, 'account_id'), year, week)
    },

    SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(state, index) {
        state.selectedGridStandardShiftsRow = index
    },

    SET_ACTIVE_CONTEXT_MENU(state, payload) {
        if (!payload) {
            state.activeContextMenu = null
            return
        }
        state.activeContextMenu = payload
    },
    SET_ACTIVE_TIME_BLOCK(state, payload) {
        if (!payload) {
            state.activeTimeBlock = { id: 0, selected: false, showMenu: false, shift: {}, x: 0, y: 0 }
            return
        }
        Object.keys(payload).forEach(key => {
            Vue.set(state.activeTimeBlock, key, payload[key])
        })
    },
    SET_NEW_EVENT(state, payload) {
        if (!payload) {
            state.newEvent = null
            return
        }
        state.newEvent = {
            data: payload.data,
            x: payload.x,
            y: payload.y,
        }
    },
    TOGGLE_EXPANDED_RESOURCES(state, value) {
        if (typeof value !== 'undefined') {
            state.expander.expanded = value
        } else {
            state.expander.expanded = !state.expander.expanded
        }
    },
    SET_DEFAULT_RESOURCE_WIDTH(state, width) {
        state.expander.defaultResourcesWidth = width
    },
    /**
     * Toggles displayed column visibility
     * @param {String} column
     */
    TOGGLE_VISIBLE_COLUMN(state, column) {
        const columnIndex = state.resourceColumns.findIndex(c => c.name === column)
        state.resourceColumns[columnIndex].visible = !state.resourceColumns[columnIndex].visible
    },

    SET_COLUMN_AS_VISIBLE(state, column) {
        const columnIndex = state.resourceColumns.findIndex(c => c.name === column)
        state.resourceColumns[columnIndex].visible = true
    },

    SET_COLUMN_VISIBILITY(state, payload) {
        const columnIndex = state.resourceColumns.findIndex(c => c.name === payload.column)
        state.resourceColumns[columnIndex].visible = payload.visible
    },

    TOGGLE_COLUMN_SORT(state, column) {
        // un-sort all other columns
        state.resourceColumns.forEach(c => {
            if (c.name !== column) {
                c.sortBy = false
                c.sortAscending = false
            }
        })
        // find the column and enable sort
        const columnIndex = state.resourceColumns.findIndex(c => c.name === column)
        // if the column was not sorted before we set the sort ascending to true
        // as it is the first column storting default
        if (!state.resourceColumns[columnIndex].sortBy) {
            state.resourceColumns[columnIndex].sortBy = true
            state.resourceColumns[columnIndex].sortAscending = true
        } else {
            // else we just toggle the sortAscending property
            state.resourceColumns[columnIndex].sortAscending = !state.resourceColumns[columnIndex].sortAscending
        }
    },
    SET_RESOURCES_SEARCH(state, text) {
        state.resourceSearch = text
    },

    SET_LAYOUT_SCROLL(state, payload) {
        state.layoutScroll = payload
    },
    SET_SAVING_SHIFT(state, payload) {
        state.savingShiftId = payload
    },

    SET_SAVING_SHIFT_ERROR(state, payload) {
        state.savingShiftError = payload
        setTimeout(() => {
            state.savingShiftError = null
        }, 1000)
    },

    SET_STORE_GROUPS(state, storeGroups) {
        state.storeGroups = storeGroups
    },
    SET_EXCHANGE_STORES(state, stores) {
        state.exchangeStores = stores
        state.groupedExchangeStores = stringHelper.groupBy(stores, 'store_id')
    },

    REMOVE_DAY_REMARK_FOR_EMPLOYEE(state, payload) {
        const { year, week } = Vue.moment(payload.date).weekYearObject()
        const existingIndex = state.weeklyDayRemarks[year][week][payload.account_id].findIndex(r => r.id === payload.id)
        state.weeklyDayRemarks[year][week][payload.account_id].splice(existingIndex, 1)
    },

    SET_DAY_REMARK_FOR_EMPLOYEE(state, payload) {
        const { year, week } = Vue.moment(payload.date).weekYearObject()
        if (!state.weeklyDayRemarks[year][week][payload.account_id]) {
            Vue.set(state.weeklyDayRemarks[year][week], payload.account_id, [payload])
        }
        const existingIndex = state.weeklyDayRemarks[year][week][payload.account_id].findIndex(r => r.date === payload.date)
        if (existingIndex !== -1) {
            Vue.set(state.weeklyDayRemarks[year][week][payload.account_id], existingIndex, payload)
        } else {
            Vue.set(state.weeklyDayRemarks[year][week][payload.account_id], state.weeklyDayRemarks[year][week][payload.account_id].length, payload)
        }
    },

    SET_WEEK_BOOKABLE_HOUR_TYPES(state, payload) {
        const { week, year } = payload.date.weekYearObject()
        const result = {}
        payload.result.forEach(item => {
            result[item.type] = item
        })
        vuexHelper.setYearWeekData(state, 'bookableHourTypes', result, year, week)
        const foreignOptions = {}
        Object.keys(result).forEach(bookableHourType => {
            result[bookableHourType].foreign_options.forEach(option => {
                // add only unique options
                if (!foreignOptions[option.foreign_type]) {
                    option.bookable_hour_type = result[bookableHourType].type
                    option.category = result[bookableHourType].category
                    foreignOptions[option.foreign_type] = option
                }
            })
        })
        vuexHelper.setYearWeekData(state, 'bookableHourTypeForeignOptions', foreignOptions, year, week)
    },

    SET_HOVERED_TIMEBLOCK(state, payload) {
        if (payload.event) {
            state.hoveredTimeblock = payload.shift || payload.availability || payload.rdo || payload.substituteRequest
            state.hoveredTimeblock.isShift = !!payload.shift
            state.hoveredTimeblock.isAvailability = !!payload.availability
            state.hoveredTimeblock.isRdo = !!payload.rdo
            state.hoveredTimeblock.isSubstituteRequest = !!payload.substituteRequest
            state.hoveredTimeblock.filteredOut = payload.filteredOut
            if (payload.shift) {
                state.hoveredTimeblock.isLentIn = payload.isLentIn
                state.hoveredTimeblock.isLentOut = payload.isLentOut
                state.hoveredTimeblock.currentStore = payload.currentStore
                state.hoveredTimeblock.exchangeStore = payload.exchangeStore
            }
            if (payload.availability) {
                state.hoveredTimeblock.availabilityTimes = payload.availabilityTimes
            }
            if (payload.rdo) {
                state.hoveredTimeblock.rdoDuration = payload.rdoDuration
            }
            state.hoveredTimeblock.x = payload.event.x
            state.hoveredTimeblock.y = payload.event.y
            state.hoveredTimeblock.h = payload.event.height || 0
        } else {
            state.hoveredTimeblock = null
        }
    },

    SET_WEEKLY_PERIODS(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'weeklyPeriods', payload.result, year, week)
    },

    /**
     * Sets week status for a week.
     *
     * @param state
     * @param payload
     * @constructor
     */
    SET_WEEK_STATUS(state, payload) {
        if (payload.date) {
            const { year, week } = payload.date.weekYearObject()
            vuexHelper.setYearWeekData(state, 'weekStatuses', (payload.statuses[0] || { status: 'draft' }), year, week)
        } else {
            state.allWeekStatuses = payload.statuses.sort((a, b) => {
                const first = Vue.moment().isoWeekYear(a.year).isoWeek(a.week).apiFormat()
                const second = Vue.moment().isoWeekYear(b.year).isoWeek(b.week).apiFormat()
                return first > second ? 1 : second > first ? -1 : 0
            })
        }
    },

    SET_LAST_FINALIZED_DEPARTMENT_DATE(state, payload) {
        const departmentStatuses = stringHelper.groupBy(payload, 'department_id')
        const departmentFinalizedDates = {}
        Object.keys(departmentStatuses).forEach(departmentId => {
            departmentStatuses[departmentId].forEach(status => {
                const date = Vue.moment().year(status.year).isoWeek(status.week)
                if (!departmentFinalizedDates[departmentId]) {
                    departmentFinalizedDates[departmentId] = date
                } else if (date.isAfter(departmentFinalizedDates[departmentId], 'isoWeek')) {
                    departmentFinalizedDates[departmentId] = date
                }
            })
        })
        state.lastFinalizedDepartmentWeek = departmentFinalizedDates
    },

    SET_CLA_SETTINGS(state, payload) {
        const result = {}
        payload.forEach(setting => {
            result[setting.cla_id] = setting
        })
        state.claSettings = result
    },

    /**
     * Sets departments week status for a week.
     *
     * @param state
     * @param payload
     * @constructor
     */
    SET_DEPARTMENTS_WEEK_STATUS(state, { date, result }) {
        const storeData = this.getters['planning/WEEK_STORE_DATA'](date)
        storeData.department_status = result
    },

    SET_PUBLISH_MODE(state, mode) {
        state.publishMode = mode
    },

    SET_WEEK_IS_LOADING(state, loading) {
        state.weekIsLoading = loading
    },

    SET_SHIFT_TO_ASSESS_SSR(state, payload) {
        state.assessSubstituteRequestShift = payload
    },

    SET_CAROUSEL_SNACKBAR_FILTER_AMOUNT(state, amount) {
        state.weekPublishWarningsFilterAmount = amount
    },

    SET_INDIRECT_TASK_TYPES(state, payload) {
        state.indirectTaskTypes = payload
    },

    SET_SCHEDULING_NOTIFICATIONS(state, payload) {
        const blocking = payload.rule_validations ? payload.rule_validations.filter(notification => notification.type === 'blocking') : []
        const nonBlocking = payload.rule_validations ? payload.rule_validations.filter(notification => notification.type === 'non-blocking') : []

        const claValidationWarnings = []
        const claWarnings = {}

        const employees = this.getters['planning/WEEK_PLANNING_DATA'](payload.date)
        const claIds = []
        Object.keys(employees).forEach(account_id => {
            const employee = employees[account_id]
            if (!claWarnings[employee.account_id] && employee.validations.filter(v => v.warn).length) {
                claWarnings[employee.account_id] = employee.validations
                claIds.push(employee.account_id)
            }
        })
        if (claIds.length) {
            claValidationWarnings.push({
                can_be_overruled: true,
                claIds,
                idsType: 'account_ids',
                reference: 'claWarnings',
                type: 'non-blocking',
            })
        }
        const notifications = blocking.concat(nonBlocking).concat(claValidationWarnings)
        vuexHelper.setYearWeekData(state, 'schedulingNotifications', notifications, payload.year, payload.week)
    },

    SET_SCHEDULING_WORKLOAD_DATA(state, payload) {
        vuexHelper.setYearWeekData(state, 'schedulingWorkloadData', payload.result.days, payload.year, payload.week)
        state.schedulingWorkloadCompetences = payload.aggregation.competences

        state.schedulingWorkloadCompetences.forEach(competence => {
            if (typeof state.schedulingWorkloadViews[competence.name] === 'undefined') {
                Vue.set(state.schedulingWorkloadViews, competence.name, true)
            }
        })
    },

    SET_SCHEDULING_DEPARTMENT_WORKLOAD_DATA(state, payload) {
        for (let i = 0; i < state.schedulingWorkloadData[payload.year][payload.week].length; i++) {
            const element = state.schedulingWorkloadData[payload.year][payload.week][i].departments
            const departmentIndex = element.findIndex(department => department.department_id === payload.department_ids[0])
            Vue.set(state.schedulingWorkloadData[payload.year][payload.week][i].departments, departmentIndex, payload.days[i].departments[0])
        }
    },

    SET_WORKLOAD_GRAPH_HEIGHT(state, height = -1) {
        const topbarHeight = 50
        const actionsHeight = 25
        if (!state.settings.workloadChart) {
            state.workloadGraphCompetencesHeight = 0
            state.workloadGraphHeight = 0
            state.workloadGraphCanvasHeight = 0
            return
        }
        if (height > -1) {
            state.workloadGraphHeight = height + 50
        }
        state.workloadGraphHeight = state.workloadGraphHeight - actionsHeight + state.workloadGraphCompetencesHeight - actionsHeight
        state.workloadGraphCanvasHeight = state.workloadGraphHeight - topbarHeight - actionsHeight - state.workloadGraphCompetencesHeight - actionsHeight + 15
    },

    SET_WORKLOAD_VIEW(state, { view, index }) {
        Vue.set(state.schedulingWorkloadViews, index, !view)
    },
    SET_DIRTY_GRID(state, value) {
        state.dirtyGrid = value
    },

    SET_WEEK_DETAILS(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'weekDetails', payload.result[0], year, week)
    },

    SET_EXPANDED_PANELS(state, panels) {
        state.expandedPanels = panels
    },

    SET_TODAY_SHIFTS(state, result) {
        state.todayShifts = result.flatMap(shift => {
            const nonProductive =
                shift.type !== this.state.scheduling.shiftTypes.NORMAL &&
                shift.type !== this.state.scheduling.shiftTypes.EXCHANGE
            const nonProductiveSimple =
                nonProductive &&
                shift.start_datetime === shift.end_datetime

            if (nonProductive && nonProductiveSimple) return {}

            return shift.instances.flatMap(instance => {
                instance.recurring = !instance.shift_instance_id || Boolean(shift.frequency)
                return instance
            })
        }).filter(e => e)
    },

    SET_PRINT_DATE(state, date) {
        state.printDate = Vue.moment(date)
    },

    SET_PRINT_VIEW(state, view) {
        state.printView = view
    },

    SET_CLA_WARNING_POPOVER(state, payload) {
        if (payload) {
            state.claWarningPopover = payload
        } else {
            state.claWarningPopover.show = false
            state.claWarningPopover.employee = undefined
        }
    },

    RESET(state) {
        state.employeeGroupedShifts = {}
        state.employeeStandardShiftsByAccountId = {}
        state.employeesFrequencyRows = {}
        state.weekSchedulingEmployees = {}
        state.weekSteerInfo = {}
        state.settings = {
            steerInformation: false,
            steerInformationExtended: false,
            workloadChart: false,
            pendingRdo: false,
            approvedRdo: false,
            approvedSubstituteRequests: false,
            availabilities: false,
            nonAvailabilities: false,
            weekStatus: false,
            employeeTotals: true,
            publishShifts: false,
            wabWarnings: false,
            weekPublishWarnings: false,
            hideUnrelatedDepartmentShifts: false,
            alwaysShowAvailabilityWeekViewEmployeeClick: false,
            alwaysShowRemarksWeekViewEmployeeClick: false,
            alwaysShowAllRemarks: false,
            showNormPlannedHours: true,
            compactView: false,
        }
        state.printSettings = {
            showDayRemarks: false,
            showDayTotals: true,
            showDepartmentTotalsTotals: true,
            showProductive: true,
            showNonProductive: true,
            showRdos: true,
            showIndirectTasks: true,
            showNotScheduledEmployees: true,
            hideUnrelatedDepartmentShifts: false,
        }
        state.weekPublishWarningsFilterAmount = 0
        state.employeesPayrollDetailsTotals = {}
        state.activeContextMenu = null
        state.activeEvent = null
        state.activeTimeBlock = {
            id: 0,
            x: 0,
            y: 0,
            selected: false,
            showMenu: false,
            event: {},
            animateOrigin: 'top',
            animateTo: 'left',
            nudgeBottom: 0,
            width: 435,
            transition: 'scale-transition',
        }
        state.newEvent = null
        state.expander = {
            expanded: false,
            defaultResourcesWidth: 320,
        }
        state.defaultTotalsWidth = 195
        state.resourceColumns = columns
        state.resourceSearch = ''
        state.mainBackgroundColor = '#C9CED1' // TODO move to more global state and replace by color variable
        state.selectedEvent = null
        state.selectedEmployee = null
        state.layoutScroll = {
            top: 0,
            left: 0,
        }
        state.savingShiftId = null
        state.savingShiftError = null
        state.storeGroups = []
        state.exchangeStores = []
        state.groupedExchangeStores = {}
        state.shiftTypes = {
            NORMAL: 'G',
            EXCHANGE: 'EXCH',
        }
        state.bookableHourTypes = {}
        state.bookableHourTypeForeignOptions = {}
        state.hoveredTimeblock = null
        state.weeklyDayRemarks = {}
        state.weeklyPeriods = {}
        state.wabCounters = {}
        state.weekStatuses = {}
        state.allWeekStatuses = []
        state.claSettings = {}
        state.departmentsWeekStatuses = {}
        state.lastFinalizedDepartmentWeek = {}
        state.publishMode = ''
        state.weekIsLoading = false
        state.assessSubstituteRequestShift = {
            show: false,
            shift: {},
        }
        state.weekIndirectHours = {}
        state.indirectTaskTypes = []
        state.schedulingNotifications = {}
        state.schedulingWorkloadData = {}
        state.schedulingWorkloadCompetences = []
        state.workloadGraphHeight = 350
        state.workloadGraphCanvasHeight = 300
        state.workloadGraphCompetencesHeight = 300
        state.schedulingWorkloadViews = {
            productive_hours: true,
            workload: true,
        }
        state.dirtyGrid = null
        state.weekDetails = {}
        state.expandedPanels = [0]
        state.employeesMaxShiftsCount = {}
        state.employeesMaxStandardShiftsCount = {}
        state.todayShifts = {}
        state.selectedGridStandardShiftsRow = null
        state.lastModifiedStandardSchedules = {}
        state.printDate = null
        state.printView = 'week'
        state.claValidationOutcomes = {}
        state.claWarningPopover = { x: 0, y: 0, show: false, employee: {} }
        state.employeesStandardRemarksFrequencyRows = {}
        state.plannableEmployeesLoadingForShift = null
        state.shiftPlannableEmployees = []
    },
}

export default mutations
