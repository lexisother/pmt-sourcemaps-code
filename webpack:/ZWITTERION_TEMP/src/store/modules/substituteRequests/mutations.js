import Vue from 'vue'
import timeHelper from '../../../libraries/timeHelper'
import stringHelper from '../../../libraries/stringHelper'
import vuexHelper from '../../../libraries/vuexHelper'
import * as moment from '../../../config/moment'
Vue.use(moment)
const mutations = {

    SET_ALL(state, payload) {
        payload.result.map(request => {
            request.is_user_requester = payload.account_id === request.requester_id
            return durationinfy(request)
        })
        state.substituteRequests = payload.result
    },

    SET_WEEKLY_SUBSTITUTE_REQUESTS(state, payload) {
        const result = payload.result.map(request => {
            return { ...request, ...durationinfy(request) }
        })
        const { year, week } = payload.date.weekYearObject()
        vuexHelper.setYearWeekData(state, 'weeklySubstituteRequests', stringHelper.groupBy(result, 'requester_id'), year, week)
    },

    SET_ONE(state, result) {
        const existingIndex = state.substituteRequests.findIndex(request => request.id === result.id)
        if (existingIndex !== -1) {
            state.substituteRequests[existingIndex] = durationinfy(result)
        };
    },

    INSERT_REQUESTS(state, results) {
        results.forEach(element => {
            state.substituteRequests.push(durationinfy(element))
        })
    },

    RESET(state) {
        state.substituteRequests = []
    },

    SET_AVAILABLE_COLLEAGUES_FOR_SHIFT(state, payload) {
        Vue.set(state.shiftColleagues, payload.scheduleId, payload.collegues)
    },

    SET_SCHEDULED_REQUESTS(state, payload) {
        state.scheduledRequests = payload
    },
}
function durationinfy(request) {
    request.time_from = Vue.moment(request.schedule_time_from).format('HH:mm')
    request.time_to = Vue.moment(request.schedule_time_to).format('HH:mm')
    request.duration = timeHelper.duration(request.schedule_time_from, request.schedule_time_to)
    return request
}
export default mutations
