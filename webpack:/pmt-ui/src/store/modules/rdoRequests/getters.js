import objectHelper from '../../../libraries/objectHelper'
import language from '../../../config/language'
import vuexHelper from '../../../libraries/vuexHelper'
import Vue from 'vue'
import * as moment from '../../../config/moment'
Vue.use(moment)

const getters = {
    all: (state) => {
        return state.rdoRequests
    },
    byYear: (state) => (year, accountId) => {
        const yearData = state.yearRequests[year]
        return yearData ? yearData[accountId] : undefined
    },
    /**
     * Fetches all the provided year RDO requests
     * @param {VUEX} state
     * @param {VUEX} getters
     */
    approvedWholeDayRequests: (state, getters) => (day, accountId) => {
        const yearRequests = getters.byYear(day.isoWeekYear(), accountId)
        if (yearRequests && yearRequests.length) {
            return yearRequests.find(rdo => {
                const start = Vue.moment(rdo.start_date)
                const end = Vue.moment(rdo.end_date)
                const sameDate = day.isAfterOrSameDayAs(start) && day.isBeforeOrSameDayAs(end)
                const approved = rdo.status === 'approved'
                const wholeDay = rdo.start_time === '00:00' && rdo.end_time === '23:59'
                return sameDate && approved && wholeDay
            })
        }
        return undefined
    },

    /**
     * Checks for an existing full day RDO request.
     * Returns a schedule item mockup.
     * @param {Object} day
     * @param {Number} accountId
     * @returns {Object} a schedule item mockup
     */
    fullDayEmployeeRdoRequest: (state, getters) => (day, accountId) => {
        const existingDayRequest = getters.approvedWholeDayRequests(day, accountId)
        if (existingDayRequest) {
            return {
                startTime: '00:00',
                endTime: '23:59',
                shiftType: 'rdo',
                type: {
                    name: language.t('entities.rdo.types.v'),
                },
            }
        }
        return undefined
    },

    WEEK_EMPLOYEES_RDO_REQUESTS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.allEmployeesRdoRequests, { year, week })
    },

    /**
     * Returns a list of rdo requests for list view - can be filtered on search string, department or status
     */
    RDO_REQUESTS_WITHIN_PERIOD(state, getters, rootState) {
        let rdoRequests = []

        // add first name and last name as extra props
        state.rdoRequestsWithinPeriod.forEach(request => {
            const employee = rootState.account.employees.find(o => o.account_id === request.account_id)
            const statusCanBeChanged = request.start_date >= getters.FIRST_SELECTABLE_DATE
            rdoRequests.push({
                ...request,
                firstName: employee ? employee.employee_first_name : '',
                lastName: employee ? employee.employee_last_name : '',
                statusCanBeChanged,
            })
        })

        // filter on search string
        const fields = ['firstName', 'lastName', 'contractType', 'typeName']
        rdoRequests = filterOnSearchString(rdoRequests, state.searchString, fields)

        // filter on status
        if (rootState.pageFilters.pendingRdo || rootState.pageFilters.approvedRdo || rootState.pageFilters.deniedRdo) {
            rdoRequests = filterWithinPeriodOnStatus(rdoRequests, rootState.pageFilters)
        }

        // filter on department
        if (rootState.pageFilters.departments.length) {
            // eslint-disable-next-line camelcase
            rdoRequests = rdoRequests.filter(o => rootState.pageFilters.departments.includes(o.departments.find(dep => dep.is_default)?.department_id))
        }

        if (state.groupOn.length > 0 && state.viewType === 'list') {
            rdoRequests = groupOn(rdoRequests, 'status')
        }

        return rdoRequests
    },

    RDO_ACTIVE_EMPLOYEES(state, getters, rootState) {
        return rootState.account.employees.filter(o => o.role_priority > 1)
    },

    /*
    * Returns a list of rdo requests per employee for timeline view - can be filtered on search string, department or status
    */
    RDO_REQUESTS_PER_EMPLOYEE(state, getters, rootState) {
        const employees = getters.RDO_ACTIVE_EMPLOYEES.filter(o => o.status !== 'cancelled')

        let activeEmployees = []
        employees.forEach(employee => {
            // get all rdo types applicable to employee
            const employeeRdo = getters.RDO_REQUESTS_WITHIN_PERIOD.filter(o => o.account_id === employee.account_id)
            let employeeRdoTypes = []
            employeeRdo.forEach(rdo => {
                if (rdo.type && rdo.type.name) {
                    employeeRdoTypes.push(rdo.type.name)
                }
            })
            employeeRdoTypes = [...new Set(employeeRdoTypes)]

            // get contract specs
            const contract = rootState.contracts.employeeContracts.find(o => o.account_id === employee.account_id)

            // add rdo types and contract specs to active employees list, in order to make it searchable
            activeEmployees.push({
                ...employee,
                firstName: employee.employee_first_name,
                lastName: employee.employee_last_name,
                contractHours: contract ? contract.contract_hours : 0,
                contractType: contract ? contract.contract_type : '',
                rdoTypes: employeeRdoTypes.join(' '),
            })
        })

        // filter on search string
        const fields = ['firstName', 'lastName', 'contractType', 'rdoTypes']
        activeEmployees = filterOnSearchString(activeEmployees, state.searchString, fields)

        let rdoList = []
        activeEmployees.forEach(employee => {
            const employeeRdo = getters.RDO_REQUESTS_WITHIN_PERIOD.filter(o => o.account_id === employee.account_id)
            const rdoDays = []
            let hasPendingRdo = false
            let hasApprovedRdo = false
            let hasDeniedRdo = false
            const emp = {
                accountId: employee.account_id,
                firstName: employee.employee_first_name,
                lastName: employee.employee_last_name,
                department: employee.departments.find(o => o.is_default),
                contractHours: employee.contractHours,
                contractType: employee.contractType,
            }
            employeeRdo.forEach(rdo => {
                const start = Vue.moment(`${rdo.start_date} ${rdo.start_time}`)
                const endTime = rdo.end_time === '24:00' ? '23:59' : rdo.end_time
                const end = Vue.moment(`${rdo.end_date} ${endTime}`)
                const range = Vue.moment().customRange(start, end, 1, 'days', 'YYYY-MM-DD')
                const statusCanBeChanged = rdo.start_date >= getters.FIRST_SELECTABLE_DATE
                range.forEach(date => {
                    if (rdo.status === 'pending') hasPendingRdo = true
                    if (rdo.status === 'approved') hasApprovedRdo = true
                    if (rdo.status === 'denied') hasDeniedRdo = true
                    rdoDays.push({
                        date,
                        id: rdo.id,
                        status: rdo.status,
                        typeName: rdo.type ? rdo.type.name : null,
                        statusCanBeChanged,
                    })
                })
            })
            rdoList.push({ ...emp, rdoDays, hasPendingRdo, hasApprovedRdo, hasDeniedRdo })
        })

        // filter on status
        if (rootState.pageFilters.pendingRdo || rootState.pageFilters.approvedRdo || rootState.pageFilters.deniedRdo) {
            rdoList = filterPerEmployeeOnStatus(rdoList, rootState.pageFilters)
        }

        // filter on department
        if (rootState.pageFilters.departments.length) {
            // eslint-disable-next-line camelcase
            rdoList = rdoList.filter(o => {
                return rootState.pageFilters.departments.includes(o.department?.department_id)
            })
        }

        // sort
        rdoList = objectHelper.sortByKey(rdoList, state.rdoTimelineViewSorting.by[0], !state.rdoTimelineViewSorting.desc[0])

        return rdoList
    },

    RDO_REQUESTS_FOR_EMPLOYEE(state) {
        return {
            accountId: state.rdoRequestsForEmployee.accountId,
            requests: state.rdoRequestsForEmployee.requests.filter(o => o.status !== 'cancelled'),
        }
    },

    REQUEST_TYPES(state) {
        return state.requestTypes
    },

    LEAVE_BALANCE(state) {
        return state.leaveBalance
    },

    LAST_CLOSED_WEEK(state) {
        return state.lastClosedWeek
    },

    FIRST_SELECTABLE_DATE(state) {
        if (state.lastClosedWeek) {
            const year = state.lastClosedWeek.split('-')[0]
            const week = state.lastClosedWeek.split('-')[1]
            return Vue.moment().isoWeekYear(year).isoWeek(week).endOf('isoWeek').add(1, 'day').apiFormat()
        }
    },

    EMPLOYEE(state) {
        return state.employee
    },

    CONTRACT(state, getters, rootState) {
        if (state.employee) {
            return rootState.contracts.employeeContracts.find(o => o.account_id === state.employee.account_id)
        }
        return null
    },

    LOAD_LEAVE_BALANCE(state) {
        return state.loadLeaveBalance
    },

    LOAD_RDO_REQUESTS(state) {
        return state.loadRdoRequests
    },

    RELOAD_RDO_REQUESTS(state) {
        return state.reloadRdoRequests
    },

    RDO_LIST_VIEW_SORTING(state) {
        return state.rdoListViewSorting
    },

    RDO_TIMELINE_VIEW_SORTING(state) {
        return state.rdoTimelineViewSorting
    },

    IS_SAVING_RDO(state) {
        return state.isSavingRdo
    },

    GROUP_ON(state) {
        return state.groupOn
    },

    VIEW_TYPE(state) {
        return state.viewType
    },

    SEARCH_STRING(state) {
        return state.searchString
    },
}
export default getters

function filterOnSearchString(rdoRequests, searchString, fields) {
    if (searchString && searchString.length > 1) {
        rdoRequests = objectHelper.filterOnSearchString(rdoRequests, searchString, fields, 2)
    }

    return rdoRequests
}

function filterWithinPeriodOnStatus(rdoRequests, pageFilters) {
    const filteredOnStatus = []
    const activeStatusFilters = pageFilters.pendingRdo ? ['pending'] : []
    if (pageFilters.approvedRdo) activeStatusFilters.push('approved')
    if (pageFilters.deniedRdo) activeStatusFilters.push('denied')

    rdoRequests.forEach(request => {
        if (activeStatusFilters.includes(request.status)) {
            filteredOnStatus.push(request)
        }
    })
    return filteredOnStatus
}

function filterPerEmployeeOnStatus(rdoList, pageFilters) {
    const filteredOnStatus = []
    const activeStatusFilters = pageFilters.pendingRdo ? ['hasPendingRdo'] : []
    if (pageFilters.approvedRdo) activeStatusFilters.push('hasApprovedRdo')
    if (pageFilters.deniedRdo) activeStatusFilters.push('hasDeniedRdo')

    rdoList.forEach(rdo => {
        let filterFound = false
        activeStatusFilters.forEach(filter => {
            if (rdo[filter] && !filterFound) {
                filteredOnStatus.push(rdo)
                filterFound = true
            }
        })
    })
    return filteredOnStatus
}

function groupOn(requests, key) {
    let output = requests.reduce(
        (prev, current) => ({
            ...prev,
            [current[key]]: (prev[current[key]] || []).concat(current),
        }),
        {},
    )

    if (key === 'status') {
        output = orderGroupeRequest(output)
    }

    return output
}

function orderGroupeRequest(requests) {
    const keys = ['pending', 'approved', 'denied']
    const output = {}
    keys.forEach(key => {
        if (requests[key]) output[key] = requests[key]
    })
    return output
}
