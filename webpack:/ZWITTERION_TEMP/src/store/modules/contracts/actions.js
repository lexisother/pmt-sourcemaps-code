import service from '../../../services/ContractService'

const actions = {
    /**
     * This function is meant to GET the current contract for the employee.
     *
     * @param {object} payload
     * @returns {Promise}
     */
    getMyContract({ commit }, payload) {
        service.getEmployeeContractInfoOnDate(payload).then(item => {
            commit('storeContract', item)
        })
    },

    /**
     * Fetches contracts current user has access to for a date.
     *
     * @returns {Promise<unknown>}
     */
    getContracts(context, payload) {
        return service.getAllContracts(payload.date).then(result => {
            if (result.length) {
                context.commit('setEmployeeContracts', { date: payload.date, contracts: result })
                return context.getters.ALL_EMPLOYEES_CONTRACTS
            }
        })
    },

    getEmployeeContractInfoOnDate(context, payload) {
        if (context.getters.canCallContractApiForAccount(payload.account_id)) {
            return service.getEmployeeContractInfoOnDate(payload).then((response) => {
                context.commit('setCurrentEmployeeContract', { date: payload.date, contract: response })
                return response
            }).catch(err => {
                throw err
            })
        }
    },
}
export default actions
