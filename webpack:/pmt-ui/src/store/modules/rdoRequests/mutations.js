import Vue from 'vue'
import vuexHelper from '../../../libraries/vuexHelper'
import stringHelper from '../../../libraries/stringHelper'
const mutations = {
    /**
     * Sets all the RDO Requests
     * @param {VUEX.module.state} state cannot be received
     * @param {Array} result RDO Requests array
     */
    set(state, result) {
        state.rdoRequests = result
    },

    /**
     * Sets year: { accountId: requests} object for RDO requests
     * @param {VUEX} state
     * @param {Object} payload
     */
    setYearRequests(state, payload) {
        const { year } = payload
        if (!state.yearRequests[year]) {
            Vue.set(
                state.yearRequests,
                year,
                {},
            )
        }
        Vue.set(
            state.yearRequests[year],
            payload.accountId,
            payload.requests,
        )
    },

    /**
     * Deletes a request based on its id
     * @param {VUEX.module.state} state cannot be received
     * @param {Number} id
     */
    delete(state, id) {
        const existingIndex = state.rdoRequests.findIndex(request => request.id === id)
        if (existingIndex !== -1) {
            state.rdoRequests.splice(existingIndex, 1)
        };
    },

    /**
     * Resets the state RDO Requests List
     * @param {VUEX.module.state} state cannot be received
     */
    reset(state) {
        state.rdoRequests = []
    },

    /**
     * Inserts an RDO Request to the list
     * @param {VUEX.module.state} state cannot be received
     * @param {Object} request RDO Request
     */
    add(state, request) {
        state.rdoRequests.push(request)
    },

    SET_WEEKLY_RDO_REQUESTS(state, payload) {
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'allEmployeesRdoRequests', stringHelper.groupBy(payload.result, 'account_id'), year, week)
    },

    SET_RDO_REQUESTS_WITHIN_PERIOD(state, payload) {
        const rdoRequests = payload.rdoRequests.filter(o => o.status !== 'cancelled')
        const reworkedRdoRequests = []

        rdoRequests.forEach(request => {
            reworkedRdoRequests.push(employeeMappedRequest(request, payload.employees, payload.contracts))
        })

        state.rdoRequestsWithinPeriod = reworkedRdoRequests
    },

    SET_RDO_REQUESTS_FOR_EMPLOYEE(state, payload) {
        const rdoRequests = payload.rdoRequests.filter(o => o.status !== 'cancelled')
        state.rdoRequestsForEmployee.requests = rdoRequests
        state.rdoRequestsForEmployee.accountId = payload.accountId
    },

    CLEAR_RDO_REQUESTS_FOR_EMPLOYEE(state) {
        state.rdoRequestsForEmployee = { accountId: null, requests: [] }
    },

    SET_SEARCH_STRING(state, payload) {
        state.searchString = payload
    },

    SET_REQUEST_TYPES(state, payload) {
        state.requestTypes = payload
    },

    SET_LEAVE_BALANCE(state, payload) {
        state.leaveBalance[payload.type] = payload.response.data.result[0]
    },

    CLEAR_LEAVE_BALANCE(state) {
        state.leaveBalance = { indicative: null, definitive: null }
    },

    SET_LAST_CLOSED_WEEK(state, weeks) {
        const closedWeekIndex = weeks.findIndex(o => o.status === 'closed') || -1
        if (closedWeekIndex > -1 && weeks[closedWeekIndex].year && weeks[closedWeekIndex].week) {
            state.lastClosedWeek = `${weeks[closedWeekIndex].year}-${weeks[closedWeekIndex].week}`
        }
    },

    SET_EMPLOYEE(state, employee) {
        state.employee = employee
    },

    REMOVE_RDO_REQUEST(state, id) {
        const rdoRequests = JSON.parse(JSON.stringify(state.rdoRequestsWithinPeriod))
        const rdoRequestIndex = rdoRequests.findIndex(o => o.id === id)
        rdoRequests.splice(rdoRequestIndex, 1)
        state.rdoRequestsWithinPeriod = rdoRequests
    },

    UPDATE_RDO_REQUEST(state, payload) {
        const rdoRequests = JSON.parse(JSON.stringify(state.rdoRequestsWithinPeriod))
        payload.result.forEach(item => {
            const rdoRequestIndex = rdoRequests.findIndex(o => o.id === item.id)
            if (item.end_time === '24:00') item.end_time = '23:59'
            if (rdoRequestIndex >= 0) {
                // update existing rdo request
                rdoRequests[rdoRequestIndex] = employeeMappedRequest(item, payload.employees, payload.contracts)
            } else {
                // post a new rdo request
                rdoRequests.push(employeeMappedRequest(item, payload.employees, payload.contracts))
            }
        })
        state.rdoRequestsWithinPeriod = rdoRequests
    },

    SET_IS_SAVING_RDO(state, payload) {
        state.isSavingRdo = payload
    },

    SET_RELOAD_RDO_REQUESTS(state, payload) {
        state.reloadRdoRequests = payload
    },

    SET_LOAD_LEAVE_BALANCE(state, payload) {
        state.loadLeaveBalance = payload
    },

    SET_LOAD_RDO_REQUESTS(state, payload) {
        state.loadRdoRequests = payload
    },

    EMPTY_RDO_REQUESTS_WITHIN_PERIOD(state) {
        state.rdoRequestsWithinPeriod = []
    },

    SET_RDO_LIST_VIEW_SORTING(state, payload) {
        if (!payload.by.length) {
            // if no parameter is selected, select status automatically
            payload.by = ['firstName']
        }
        state.rdoListViewSorting = payload
    },

    SET_RDO_TIMELINE_VIEW_SORTING(state, payload) {
        if (!payload.by.length) {
            // if no parameter is selected, select status automatically
            payload.by = ['firstName']
        }
        state.rdoTimelineViewSorting = payload
    },

    SET_GROUP_ON(state, payload) {
        if (Array.isArray(payload)) {
            state.groupOn = payload
            return
        }

        const groupOn = JSON.parse(JSON.stringify(state.groupOn))
        if (groupOn.includes(payload)) {
            const index = groupOn.findIndex(o => o === payload)
            groupOn.splice(index, 1)
        } else {
            groupOn.push(payload)
        }
        state.groupOn = groupOn
    },

    SET_VIEW_TYPE(state, payload) {
        state.viewType = payload
    },
}
export default mutations

function employeeMappedRequest(request, employees, contracts) {
    const employee = employees.find(o => o.account_id === request.account_id)
    const contract = contracts.find(o => o.account_id === request.account_id)
    return {
        ...request,
        name: employee ? employee.name : null,
        departments: employee ? employee.departments : [],
        contractHours: contract ? contract.contract_hours : null,
        contractType: contract ? contract.contract_type : null,
        contractTimeOffBuildupType: contract ? contract.time_off_buildup_type : null,
        contractAtvBuildupType: contract ? contract.atv_buildup_type : null,
        contractTvtBuildup: contract ? contract.tvt_buildup : false,
        typeName: request.type ? request.type.name : null,
    }
}
