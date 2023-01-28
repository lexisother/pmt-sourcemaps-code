import vuexHelper from '../../../libraries/vuexHelper'
import * as moment from '../../../config/moment'
import Vue from 'vue'
import stringHelper from '../../../libraries/stringHelper'
import router from '../../../config/router'
Vue.use(moment)

const getters = {

    /**
     * Returns the steer info for a week based on given date.
     *
     * @param {Moment} date
     * @returns {Array}
     */
    WEEK_STEER_INFO: (state) => (date) => {
        const { year, week } = date.weekYearObject()

        return vuexHelper.getYearWeekStateData(state.weekSteerInfo, { year, week })
    },

    /**
     * Returns payroll details totals in the provided year-week for all employees or for just one employee if accountId provided
     * @param {VUEX} state
     * @param {Object} { year, week }
     * @returns {Object} {days: [ ... ], period: { ... }}
     */
    WEEK_PAYROLL_DETAILS_TOTALS: (state) => ({ year, week, accountId }) => {
        if (!year || !week) {
            return {}
        }
        if (accountId) {
            return vuexHelper.getYearWeekStateDataForAccount(state.employeesPayrollDetailsTotals, { year, week, accountId })
        }
        return vuexHelper.getYearWeekStateData(state.employeesPayrollDetailsTotals, { year, week })
    },

    ALWAYS_VISIBLE_COLUMNS(state) {
        return state.resourceColumns.filter(c => c.alwaysVisible)
    },
    VISIBLE_COLUMNS(state) {
        return state.resourceColumns.filter(c => !c.alwaysVisible && c.visible && !c.alwaysHidden)
    },
    ALL_COLUMNS(state) {
        return state.resourceColumns
    },
    SORTED_COLUMN(state) {
        return state.resourceColumns.find(c => c.sortBy)
    },
    EXPANDED_WIDTH_FROM_VISIBLE_COLUMNS(state, getters) {
        let width = 0
        state.resourceColumns.filter(c => !c.alwaysHidden).forEach(column => {
            if (column.visible) {
                width += column.width
            }
        })
        return width
    },
    WIDTH_FROM_ALWAYS_VISIBLE_COLUMNS(state) {
        let width = 0
        state.resourceColumns.forEach(column => {
            if (column.alwaysVisible) {
                width += column.width
            }
        })
        return width
    },
    DEFAULT_RESOURCES_WIDTH(state) {
        return state.expander.defaultResourcesWidth
    },
    DEFAULT_TOTALS_WIDTH(state) {
        return state.defaultTotalsWidth
    },

    ACTIVE_EVENT(state) {
        return state.activeEvent
    },

    ACTIVE_TIME_BLOCK(state) {
        return state.activeTimeBlock
    },

    WEEK_BOOKABLE_HOUR_TYPES: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.bookableHourTypes, { year, week })
    },

    WEEK_BOOKABLE_HOUR_TYPE_FOREIGN_OPTIONS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.bookableHourTypeForeignOptions, { year, week })
    },

    HOVERED_TIMEBLOCK(state) {
        return state.hoveredTimeblock
    },

    WEEKLY_DAY_REMARKS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.weeklyDayRemarks, { year, week })
    },

    STANDARD_DAY_REMARKS(state) {
        return state.employeesStandardRemarksFrequencyRows
    },

    WEEK_PERIOD: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        const result = vuexHelper.getYearWeekStateData(state.weeklyPeriods, { year, week })
        return result ? result[0] : undefined
    },

    /**
     * Returns week status for a week-year.
     *
     * @param {String} week
     */
    WEEK_STATUS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        const yearData = state.weekStatuses[year]
        if (yearData && yearData[week]) {
            return yearData[week]
        }
        return {}
    },

    ALL_WEEK_STATUSES(state) {
        return state.allWeekStatuses
    },

    LAST_FINALIZED_DEPARTMENT_DATE(state) {
        return state.lastFinalizedDepartmentWeek
    },

    CLA_SETTINGS(state) {
        return state.claSettings
    },

    EMPLOYEES_EXPANDED(state) {
        return state.expander.expanded
    },

    WEEK_IS_LOADING(state) {
        return state.weekIsLoading
    },

    ASSESS_SSR_SHIFT(state) {
        return state.assessSubstituteRequestShift
    },

    INDIRECT_TASK_TYPE: (state) => (id) => {
        return state.indirectTaskTypes.find(it => it.id === id)
    },

    SCHEDULING_NOTIFICATIONS: (state, getters, rootState, rootGetters) => (date) => {
        const { year, week } = date.weekYearObject()
        const yearData = state.schedulingNotifications[year]
        if (yearData && yearData[week]) {
            return yearData[week]
        }
        return []
    },

    SCHEDULING_NOTIFICATIONS_TYPES: (state, getters) => (date) => {
        const notificationsObject = []
        const notifications = getters.SCHEDULING_NOTIFICATIONS(date)

        notifications.forEach(notification => {
            if (notification.reference === 'RM.2') {
                for (const [key, value] of Object.entries(notification.extra_data)) {
                    if (value.length) {
                        notificationsObject.push({
                            reference: key,
                            ids: value,
                            type: notification.type,
                        })
                    }
                }
            } else {
                notificationsObject.push(notification)
            }
        })

        notificationsObject.forEach(notification => {
            if (notification.reference.includes('.')) {
                notification.reference = stringHelper.camelize(notification.reference, '.')
            }
        })

        notificationsObject.forEach(notification => {
            notification.idsType = notificationIdsType(notification.reference)
        })

        return notificationsObject
    },

    SCHEDULING_NOTIFICATION: (state, getters) => (payload) => {
        if (getters.SCHEDULING_NOTIFICATIONS(payload.date).filter(notification => notification.reference === payload.reference)[0]) {
            return getters.SCHEDULING_NOTIFICATIONS(payload.date).filter(notification => notification.reference === payload.reference)[0]
        }
        return {
            reference: 'NOT.FOUND',
            ids: [],
            extra_data: {
                pendingAvailabilityRequests: [],
                pendingRdoRequests: [],
                pendingSubstituteRequests: [],
            },
        }
    },
    SCHEDULING_WORKLOAD_DATA: (state, getters, rootState, rootGetters) => ({ date, fullHour = false, departmentId }) => {
        const { year, week } = date.weekYearObject()
        const yearData = state.schedulingWorkloadData[year]
        if (yearData && yearData[week]) {
            const days = yearData[week]
            // For the week view we use this function
            const selectedDay = days[date.isoWeekday() - 1]
            const dayTotals = formatWorkloadDay(selectedDay.departments, state, rootState, departmentId)
            if (!fullHour) {
                return {
                    productive_hours: dayTotals.productive_hours,
                    workload: dayTotals.workload,
                    competences: dayTotals.competences,
                }
            } else {
                return {
                    productive_hours: workloadToFullDay(dayTotals.productive_hours),
                    workload: workloadToFullDay(dayTotals.workload),
                }
            }
        } else {
            return {
                productive_hours: [],
                workload: [],
                competences: {},
            }
        }
    },

    SCHEDULING_WORKLOAD_VIEWS: (state) => {
        return state.schedulingWorkloadViews
    },

    DIRTY_GRID(state) {
        return state.dirtyGrid
    },

    /**
     * Returns the week details for given date
     * @param {Moment} date
     * @returns {Array}
     */
    WEEK_DETAILS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        const yearData = state.weekDetails[year]
        if (yearData && yearData[week]) {
            return yearData[week]
        }
        return undefined
    },

    EXPANDED_PANELS(state) {
        return state.expandedPanels
    },

    IS_STANDARD_SHIFTS: (state) => {
        return router.history.current.name === 'standard-shifts'
    },

    SELECTED_STANDARD_SHIFTS_ROW: (state) => {
        return state.selectedGridStandardShiftsRow
    },

    /**
     * Returns the number of settings applied.
     *
     * @param state
     * @returns {number}
     */
    APPLIED_SETTINGS_COUNT: (state, getters) => (isDayView, checkHours) => {
        let result = 0
        const excludedPlanningSettings = [
            'timeRegistrationsGroupOn',
            'timeRegistrationsSortAscending',
            'timeRegistrationsSortOn',
            'globalTimeRegistrationsCardState',
            'timerGroupOn',
            'timerSortAscending',
            'timerSortOn',
        ]
        const excludedDaySettings = [
            'publishShifts',
            'expandMultipleCheckHoursEmployees',
            'allExpanded',
            'alwaysShowAllRemarks',
            'compactView',
            'alwaysShowAvailabilityWeekViewEmployeeClick',
            'alwaysShowRemarksWeekViewEmployeeClick',
        ]
        const excludedWeekSettings = [
            'publishShifts',
            'expandMultipleCheckHoursEmployees',
            'allExpanded',
            'approvedRdo',
            'approvedSubstituteRequests',
            'availabilities',
            'nonAvailabilities',
            'pendingRdo',
        ]
        const excludedCheckHoursSettings = [
            'publishShifts',
            'costsSelection',
            'allExpanded',
            'alwaysShowAllRemarks',
            'alwaysShowAvailabilityWeekViewEmployeeClick',
            'alwaysShowRemarksWeekViewEmployeeClick',
            'employeeTotals',
            'showNormPlannedHours',
            'approvedRdo',
            'approvedSubstituteRequests',
            'availabilities',
            'nonAvailabilities',
            'pendingRdo',
            'wabWarnings',
            'weekPublishWarnings',
            'workloadChart',
        ]
        for (const setting in state.settings) {
            if (!getters.EXCLUDED_USER_SETTINGS_FOR_SAVING.includes(setting)) {
                if (excludedPlanningSettings.includes(setting)) continue
                if (checkHours && excludedCheckHoursSettings.includes(setting)) continue
                if (isDayView && excludedDaySettings.includes(setting)) continue
                if (!isDayView && excludedWeekSettings.includes(setting)) continue
                if (typeof state.settings[setting] === 'boolean' && state.settings[setting]) {
                    result++
                }
            }
        }

        return result
    },

    EXCLUDED_USER_SETTINGS_FOR_SAVING() {
        return ['publishShifts', 'weekPublishWarnings', 'allExpanded']
    },

    PRINT_DATE(state) {
        return state.printDate
    },

    PRINT_VIEW(state) {
        return state.printView
    },

    CLA_WARNING_POPOVER(state) {
        return state.claWarningPopover
    },

}

/**
 * Returns week values for all the days based on the departments, if a department is filtered out it's data won't be returned.
 * @param {Array} departments
 * @param {Object} state
 * @param {Object} rootState
 * @returns {Object}
 */
function formatWorkloadDay(departments, state, rootState, departmentId) {
    let productiveHours = Array(48).fill(0)
    let workload = Array(48).fill(0)
    const competences = {}
    departments.filter(d => !departmentId || d.department_id === departmentId).forEach(department => {
        if (rootState.pageFilters.departments.length > 0) {
            if (rootState.pageFilters.departments.includes(department.department_id)) {
                productiveHours = formatWorkloadHours(productiveHours, department.statistics.productive_hours, 'productive_hours')
                workload = formatWorkloadHours(workload, department.statistics.workload, 'workload')
                if (state.schedulingWorkloadCompetences.length) {
                    department.statistics.competences.forEach(competence => {
                        const found = state.schedulingWorkloadCompetences.find(function (e) {
                            return e.id === Number(competence.competence_id)
                        })
                        if (!competences[found.name]) {
                            competences[found.name] = Array(48).fill(0)
                        }
                        competences[found.name] = formatWorkloadHours(competences[found.name], competence.time_blocks, 'other')
                    })
                }
            }
        } else {
            productiveHours = formatWorkloadHours(productiveHours, department.statistics.productive_hours, 'productive_hours')
            workload = formatWorkloadHours(workload, department.statistics.workload, 'workload')
            if (state.schedulingWorkloadCompetences.length) {
                department.statistics.competences.forEach(competence => {
                    const found = state.schedulingWorkloadCompetences.find(function (e) {
                        return e.id === Number(competence.competence_id)
                    })
                    if (!competences[found.name]) {
                        competences[found.name] = Array(48).fill(0)
                    }
                    competences[found.name] = formatWorkloadHours(competences[found.name], competence.time_blocks, 'other')
                })
            }
        }
    })
    return {
        productive_hours: productiveHours,
        workload,
        competences,
    }
}

function formatWorkloadHours(formatter, data, type) {
    for (let index = 0; index < data.length; index++) {
        if (type === 'productive_hours') {
            formatter[index] = formatter[index] + data[index].value
        } else if (type === 'workload') {
            formatter[index] = formatter[index] + data[index].value
        } else if (type === 'other') {
            formatter[index] = formatter[index] + data[index].count
        }
    }
    return formatter
}

function workloadToFullDay(array) {
    const even = []
    const odd = []
    const newArray = []
    for (let i = 0; i < array.length; ++i) {
        if (i % 2 === 0) {
            even.push(array[i])
        } else {
            odd.push(array[i])
        }
    }
    for (let index = 0; index < even.length; index++) {
        newArray.push(even[index] + odd[index])
    }
    return newArray
}

function notificationIdsType(reference) {
    switch (reference) {
        case 'rm60':
            return 'department_ids'
        case 'rm80':
            return 'department_ids'
        case 'rm70':
            return 'store_ids'
        default:
            return 'account_ids'
    }
}

export default getters
