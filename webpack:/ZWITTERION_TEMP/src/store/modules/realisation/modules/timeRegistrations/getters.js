import objectHelper from '../../../../../libraries/objectHelper'
import Vue from 'vue'
import * as moment from '../../../../../config/moment'
import _ from 'lodash'
Vue.use(moment)

const getters = {
    TIME_REGISTRATIONS(state, getters, rootState) {
        let timeRegistrations = JSON.parse(JSON.stringify(state.timeRegistrations))

        // filter on search string
        if (state.searchString && state.searchString.length > 1) {
            const fields = ['fullName']
            timeRegistrations = objectHelper.filterOnSearchString(timeRegistrations, state.searchString, fields, 2)
        }

        // filter on department
        if (rootState.pageFilters.departments.length) {
            timeRegistrations = filterOnDepartment(timeRegistrations, rootState.pageFilters.departments)
        }

        // filter on status
        if (rootState.pageFilters.pendingRealisation || rootState.pageFilters.readyRealisation || rootState.pageFilters.approvedRealisation) {
            timeRegistrations = filterOnStatus(timeRegistrations, rootState.pageFilters)
        }

        // sort
        if (state.sortOn) {
            timeRegistrations = objectHelper.sortByKey(timeRegistrations, state.sortOn, state.sortAscending)
        }

        // group
        if (state.groupOn.length) {
            timeRegistrations = groupTimeRegistrations(timeRegistrations, state.groupOn, rootState.departments.departments, rootState.pageFilters)
        }

        return timeRegistrations
    },
    TIME_REGISTRATIONS_LOADING(state) {
        return state.timeRegistrationsLoading
    },
    GROUP_ON(state) {
        return state.groupOn
    },
    SORT_ON(state) {
        return state.sortOn
    },
    SEARCH_STRING(state) {
        return state.searchString
    },
    SCHEDULES_CONTAINER_WIDTH(state, getters, rootState) {
        const pageWidth = rootState.pageWidth
        if (pageWidth < 1200) {
            return pageWidth - 70
        }
        if (pageWidth < 1904) {
            return pageWidth - 70
        }
        return 1184
    },
    LOG_SCHEDULES_CONTAINER_WIDTH(state, getters, rootState) {
        const pageWidth = rootState.pageWidth
        if (pageWidth < 1200) {
            return pageWidth - 48
        }
        return 1152
    },
    ACCOUNT_ID(state) {
        return state.accountId
    },
    REALISATION_INDEX(state) {
        return state.realisationIndex
    },
    INITIAL_REALISATION(state) {
        return state.initialRealisation
    },
    CREATING(state) {
        return state.creating
    },
    DIRTY_TIME_REGISTRATIONS(state) {
        const dirtyTimeRegistrations = []
        if (state.timeRegistrations.length) {
            for (let n = 0; n < state.timeRegistrations.length; n++) {
                if (!_.isEqual(state.timeRegistrations[n]?.realisation, state.untouchedTimeRegistrations[n]?.realisation)) {
                    dirtyTimeRegistrations.push(state.timeRegistrations[n].account_id)
                }
            }
        }
        return dirtyTimeRegistrations
    },
    ACCESSIBLE_DEPARTMENTS(state) {
        return state.accessibleDepartments
    },
    UNTOUCHED_TIME_REGISTRATIONS(state) {
        return state.untouchedTimeRegistrations
    },
    WEEK_IS_CLOSED(state) {
        const year = Number(Vue.moment(state.timeRegistrationsDate).format('YYYY'))
        const week = Vue.moment(state.timeRegistrationsDate).isoWeek()
        const weekStatus = state.weekStatuses.find(o => o.year === year && o.week === week)
        return weekStatus ? weekStatus.status === 'closed' : false
    },
    GLOBAL_TIME_REGISTRATIONS_CARD_STATE(state) {
        return state.globalTimeRegistrationsCardState
    },
    EDIT_IN_MODAL(state) {
        return state.editInModal
    },
    EXPANDED_EMPLOYEE_CARDS(state) {
        return state.expandedEmployeeCards
    },
    WEEK_STORES: (state) => (yearWeek) => {
        return state.weekStores[yearWeek]
    },
}

export default getters

function filterOnDepartment(timeRegistrations, departments) {
    const filteredTimeRegistrations = []
    timeRegistrations.forEach(employee => {
        if (employee.schedules.find(o => departments.includes(o.department_id)) ||
            employee.realisation.find(o => departments.includes(o.department_id))) {
            filteredTimeRegistrations.push(employee)
        }
    })
    return filteredTimeRegistrations
}

function filterOnStatus(timeRegistrations, pageFilters) {
    const filteredTimeRegistrations = []
    const activeStatusFilters = pageFilters.pendingRealisation ? ['pending'] : []
    if (pageFilters.readyRealisation) activeStatusFilters.push('ready')
    if (pageFilters.approvedRealisation) activeStatusFilters.push('approved')

    timeRegistrations.forEach(employee => {
        if (activeStatusFilters.includes(employee.displayStatus)) {
            filteredTimeRegistrations.push(employee)
        }
    })
    return filteredTimeRegistrations
}

/**
 * Create alternative output with grouping
 */
function groupTimeRegistrations(timeRegistrations, groupOn, departments, filters) {
    let groupedTimeRegistrations = {}
    if (groupOn.includes('status')) {
        groupedTimeRegistrations = groupOnStatus(timeRegistrations, filters)

        if (groupOn.includes('department')) {
            for (const key of Object.keys(groupedTimeRegistrations)) {
                groupedTimeRegistrations[key] = groupOnDepartment(groupedTimeRegistrations[key], departments, filters)
            }
        }
    } else {
        groupedTimeRegistrations = groupOnDepartment(timeRegistrations, departments, filters)
    }

    return groupedTimeRegistrations
}

function groupOnStatus(timeRegistrations, filters) {
    const groupedTimeRegistrations = {}
    const statuses = ['pending', 'ready', 'approved']
    const statusFilterSet = filters.pendingRealisation || filters.readyRealisation || filters.approvedRealisation
    statuses.forEach((status, index) => {
        if (!statusFilterSet || filters[`${status}Realisation`]) {
            const statusTimeRegistrations = timeRegistrations.filter(o => o.displayStatus === status)
            groupedTimeRegistrations[status] = statusTimeRegistrations
        }
    })
    return groupedTimeRegistrations
}

function groupOnDepartment(timeRegistrations, departments, filters) {
    const groupedTimeRegistrations = {}
    departments.forEach(department => {
        if (!filters.departments.length || filters.departments.includes(department.department_id)) {
            const departmentTimeRegistrations = []
            timeRegistrations.forEach(employee => {
                const hasDepartment = (prop) => {
                    return employee[prop].filter(o => o.department_id === department.department_id).length
                }
                if (hasDepartment('realisation') || hasDepartment('schedules')) {
                    departmentTimeRegistrations.push(employee)
                }
            })
            if (departmentTimeRegistrations.length) {
                groupedTimeRegistrations[department.department_id] = departmentTimeRegistrations
            }
        }
    })
    return groupedTimeRegistrations
}
