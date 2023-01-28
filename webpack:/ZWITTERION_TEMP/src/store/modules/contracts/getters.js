import language from '../../../config/language'
import timeHelper from '../../../libraries/timeHelper'
import moment from 'moment'

const getters = {

    /**
     * Returns current contract for current employee after formatting contract hours.
     *
     * @param state
     * @returns {{}|state.contract}
     */
    myContract(state) {
        state.contract.calculated_contract_hours = timeHelper.floatToHoursAndMinutes(
            moment.duration(state.contract.contract_hours, 'hours'),
        )
        if (state.contract.max_contract_hours) {
            state.contract.calculated_max_contract_hours = timeHelper.floatToHoursAndMinutes(
                moment.duration(state.contract.max_contract_hours, 'hours'),
            )
            state.contract.use_min_max = true
        }
        return state.contract
    },
    contractInfo: state => {
        return {
            contract_type: {
                label: language.t('entities.user.contract.type'),
                value: state.contract.contract_type,
                id: 'contract-type',
            },
            contract_hours: {
                label: language.t('entities.user.contract.hours'),
                value: state.contract.visual_contract_hours,
                id: 'contract-hours',
            },
        }
    },

    employeeContracts: state => {
        return state.employeeContracts
    },

    DISTINCT_CONTRACT_TYPES: (state) => {
        return state.distinctEmployeeContractTypes
    },

    CONTRACT_ON_DATE: (state) => ({ date, accountId }) => {
        const employeeContracts = state.currentEmployeeContracts[accountId]
        if (employeeContracts) {
            return employeeContracts[date]
        }
        return undefined
    },

    /**
     * Checks if a user can call the GET /contracts api call,
     * based on permissions.
     * @param {Number} accountId
     * @returns {Boolean}
     */
    canCallContractApiForAccount: (state, getters, rootState, rootGetters) => (accountId) => {
        const canViewOtherContracts = rootGetters['auth/canViewOthersContractData']
        const canViewOwnContracts = rootGetters['auth/canViewBasicContractInfo']
        const currentAccountId = rootState.auth.user.accountId
        const sameUserAndRights = currentAccountId === accountId && canViewOwnContracts
        const differentUserAndRights = currentAccountId !== accountId && canViewOtherContracts
        return sameUserAndRights || differentUserAndRights
    },
    ALL_EMPLOYEES_CONTRACTS(state) {
        return state.employeeIndexedContracts
    },
}
export default getters
