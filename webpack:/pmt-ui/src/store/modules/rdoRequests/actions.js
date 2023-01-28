import service from '../../../services/RdoService'
import storeService from '../../../services/StoreService'
import Vue from 'vue'
import * as moment from '../../../config/moment'
Vue.use(moment)

const actions = {

    getRdoRequests(context) {
        return service.getRequests(context.rootState.auth.user.accountId).then(result => {
            const response = result.map(item => {
                let type = null
                if (item.type) {
                    type = {
                        id: item.type.id,
                        name: item.type.name,
                        shortName: item.type.short_name,
                    }
                }

                return {
                    id: item.id,
                    type: type,
                    start: Vue.moment(`${item.start_date} ${item.start_time}`),
                    end: Vue.moment(`${item.end_date} ${item.end_time}`),
                    reason: item.reason,
                    remark: item.remark,
                    status: item.status,
                    created: Vue.moment(item.date_of_request),
                    last_changed_by: item.last_changed_by,
                    last_changed_on: item.last_changed_on,
                    // one could grow very un-fond of this ad-hoc custom mappings
                }
            })
            context.commit('set', response)
        })
    },

    getRdoRequestsFromDate({ commit }, payload) {
        return service.getRequestsByDate(payload).then(result => {
            const response = result.map(item => {
                let type = null
                if (item.type) {
                    type = {
                        id: item.type.id,
                        name: item.type.name,
                        shortName: item.type.short_name,
                    }
                }

                return {
                    id: item.id,
                    type: type,
                    start: Vue.moment(`${item.start_date} ${item.start_time}`),
                    end: Vue.moment(`${item.end_date} ${item.end_time}`),
                    reason: item.reason,
                    remark: item.remark,
                    status: item.status,
                    created: Vue.moment(item.date_of_request),
                    last_changed_by: item.last_changed_by,
                    last_changed_on: item.last_changed_on,
                }
            })
            commit('set', response)
        })
    },

    /**
     * Gets employee RDO requests for whole year
     * This will run only once / year, when the
     * selected date year change is detetected
     * @param {VUEX}
     * @param {Object} payload
     */
    getEmployeeYearRequests({ commit, getters }, payload) {
        const year = payload.date.isoWeekYear()
        const existingYearRequests = getters.byYear(year, payload.accountId)
        if (existingYearRequests) {
            // return existing requests
            return new Promise((resolve) => { resolve(existingYearRequests) })
        }
        // else make the call to get year requests
        return service.getEmployeeYearRequests(payload).then(result => {
            commit('setYearRequests', {
                year: year,
                accountId: payload.accountId,
                requests: result,
            })
            return result
        }).catch(error => {
            throw error
        })
    },

    getAllRdoRequests(context, payload) {
        const existingRdoRequests = context.getters.WEEK_EMPLOYEES_RDO_REQUESTS(Vue.moment(payload.from_date))
        if (existingRdoRequests) {
            // return existing requests
            return new Promise((resolve) => { resolve(existingRdoRequests) })
        }
        return service.getAllRequests(payload).then(result => {
            context.commit('SET_WEEKLY_RDO_REQUESTS', { date: Vue.moment(payload.from_date), result })
        }).catch(error => {
            throw error
        })
    },

    getRdoRequestsWithinPeriod(context, payload) {
        context.commit('SET_LOAD_RDO_REQUESTS', true)
        if (context.state.rdoRequestsWithinPeriod.length && !payload.account_id) {
            // return existing requests
            context.commit('SET_LOAD_RDO_REQUESTS', false)
            return new Promise((resolve) => { resolve(context.state.rdoRequestsWithinPeriod) })
        }
        return service.getAllRequests(payload)
            .then(result => {
                if (payload.account_id) {
                    context.commit('SET_RDO_REQUESTS_FOR_EMPLOYEE', { rdoRequests: result, accountId: payload.account_id })
                } else {
                    context.commit('SET_RDO_REQUESTS_WITHIN_PERIOD', {
                        rdoRequests: result,
                        employees: context.rootState.account.employees,
                        contracts: context.rootState.contracts.employeeContracts,
                    })
                }
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                context.commit('SET_LOAD_RDO_REQUESTS', false)
            })
    },

    revokeRdoRequest({ commit }, payload) {
        return service.revokeRequest(payload.id, payload.storeId).then(result => {
            commit('delete', payload.id)
        }).catch(error => {
            throw error
        })
    },

    /**
     * Sends an RDO request, then saves it to vuex.
     * @param {VUEX} context default, cannot be received
     * @param {Object} payload
     * @returns {Object} RDO Request
     */
    sendRdoRequest(context, payload) {
        return service.sendRdoRequest(payload).then(item => {
            if (payload.cache) {
                // caching should only be done while on the rdo requests list page, where the rdo requests are loaded if the state.rdoRequests.length === 0
                let type = null
                if (item.type) {
                    type = {
                        id: item.type.id,
                        name: item.type.name,
                        shortName: item.type.short_name,
                    }
                }
                const result = {
                    id: item.id,
                    type: type,
                    start: Vue.moment(`${item.start_date} ${item.start_time}`),
                    end: Vue.moment(`${item.end_date} ${item.end_time}`),
                    reason: item.reason,
                    remark: item.remark,
                    status: item.status,
                    created: Vue.moment(item.date_of_request),
                }
                // adding the result to the state, so the RDO requests table is dynamically populated
                context.commit('add', result)
            } else {
                // reseting the rdo list to make sure that when navigating to rdo requests page, the whole list is fetched again
                context.commit('reset')
            }
            return item
        }).catch(error => {
            throw error
        })
    },

    getRequestTypes(context) {
        if (context.state.requestTypes.length) {
            // return existing request types
            return new Promise((resolve) => { resolve(context.state.requestTypes) })
        }
        if (!context.rootState.stores.currentStore.id) return

        return service.getRequestTypes(context.rootState.stores.currentStore.id).then(response => {
            context.commit('SET_REQUEST_TYPES', response.data.result)
        }).catch(error => {
            throw error
        })
    },

    getEmployeeLeaveBalance(context, payload) {
        context.commit('SET_LOAD_LEAVE_BALANCE', true)
        return service.getEmployeeLeaveBalance(payload.params)
            .then(response => {
                context.commit('SET_LEAVE_BALANCE', { type: payload.type, response })
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                context.commit('SET_LOAD_LEAVE_BALANCE', false)
            })
    },

    getWeekStatus(context, payload) {
        // check if it was fetched before
        if (context.state.lastClosedWeek) {
            return
        }

        return storeService.getWeekStatuses(payload).then(result => {
            context.commit('SET_LAST_CLOSED_WEEK', result)
            return result
        }).catch(err => {
            throw err
        })
    },

    saveRdoRequest(context, payload) {
        return service.saveRdoRequest(payload)
            .then(result => {
                return result
            }).catch(err => {
                throw err
            })
    },

    cancelRdoRequest(context, payload) {
        return service.cancelRdoRequest(payload)
            .then(() => {
                context.commit('REMOVE_RDO_REQUEST', payload.params.id)
            })
            .catch(error => {
                throw error
            })
    },

}
export default actions
