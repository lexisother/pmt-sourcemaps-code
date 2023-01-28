import objectHelper from '../../../../../libraries/objectHelper'
import { store } from '../../../../../store'

const mutations = {
    SET_STANDARD_TIMES(state, payload) {
        const currentStore = store.getters['stores/currentStore']
        const currentStoreId = currentStore ? currentStore.id : undefined

        const refactoredPayload = createFullArray(payload, currentStoreId)
        state.standardTimes = refactoredPayload
    },
    ADD_STANDARD_TIMES(state, payload) {
        let standardTimes = JSON.parse(JSON.stringify(state.standardTimes))
        standardTimes.push(payload)
        standardTimes = objectHelper.sortByKey(standardTimes, 'week_day')
        state.standardTimes = standardTimes
    },
    UPDATE_STANDARD_TIMES(state, payload) {
        const standardTimes = JSON.parse(JSON.stringify(state.standardTimes))
        const standardTimesIndex = standardTimes.findIndex(o => o.id === payload.id)
        standardTimes[standardTimesIndex] = payload
        state.standardTimes = standardTimes
    },
    SET_STANDARD_TIMES_API_ERROR(state, payload) {
        state.standardTimesApiError = payload
    },
}
export default mutations

/**
 * If not all days for a week are set with opening times, missing days must be added with an 'empty' object
 */
function createFullArray(payload, storeId) {
    const refactoredPayload = []
    const emptyDay = {
        store_id: storeId,
        week_day: null,
        business_from_time: null,
        business_to_time: null,
        opening_from_time: null,
        opening_to_time: null,
        closed: false,
        toggle_disabled: true,
    }

    if (payload && payload.length) {
        for (let n = 1; n < 8; n++) {
            if (payload.find(o => o.week_day === n)) {
                refactoredPayload.push(payload.find(o => o.week_day === n))
            } else {
                const newDay = JSON.parse(JSON.stringify(emptyDay))
                newDay.week_day = n
                refactoredPayload.push(newDay)
            }
        }
    }

    return refactoredPayload
}
