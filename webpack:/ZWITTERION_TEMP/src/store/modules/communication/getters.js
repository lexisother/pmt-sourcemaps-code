import objectHelper from '../../../libraries/objectHelper'

const getters = {
    SELECTED_EMPLOYEES(state) {
        return state.selectedEmployees
    },

    SMS_MESSAGES(state) {
        return objectHelper.sortByKey(state.smsMessages, 'date', false)
    },

    SMS_HISTORY_EMPLOYEES(state) {
        return state.smsHistoryEmployees
    },
}
export default getters
