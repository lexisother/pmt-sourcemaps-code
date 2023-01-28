import Vue from 'vue'
import stringHelper from '../../../libraries/stringHelper'
const mutations = {
    storeContract(state, contract) {
        state.contract = contract
        localStorage.setItem('contract', JSON.stringify(state.contract))
    },

    /**
     * Stores employee contracts for a date
     *
     * @param state
     * @param payload
     */
    setEmployeeContracts(state, payload) {
        // TODO: deprecate this from other pages
        state.employeeContracts = payload.contracts
        // new version of contracts state
        state.employeeIndexedContracts = stringHelper.groupBy(payload.contracts, 'account_id')

        // loop through all contracts and only set the types
        const contractTypes = []
        for (const item of payload.contracts) {
            if (!contractTypes.includes(item.contract_type)) {
                contractTypes.push(item.contract_type)
            }
        }
        state.distinctEmployeeContractTypes = contractTypes
    },

    setCurrentEmployeeContract(state, payload) {
        if (!payload.contract.account_id) {
            return
        }
        // check if account_id allready has a contract object set
        if (!state.currentEmployeeContracts[payload.contract.account_id]) {
            Vue.set(
                state.currentEmployeeContracts,
                payload.contract.account_id,
                {},
            )
        }
        // check if account_id allready has a contract object set on the provided date
        if (!state.currentEmployeeContracts[payload.contract.account_id][payload.date]) {
            Vue.set(
                state.currentEmployeeContracts[payload.contract.account_id],
                payload.date,
                {},
            )
        }
        // ste the employee contract on the provided date
        Vue.set(
            state.currentEmployeeContracts[payload.contract.account_id],
            payload.date,
            payload.contract,
        )
    },
}
export default mutations
