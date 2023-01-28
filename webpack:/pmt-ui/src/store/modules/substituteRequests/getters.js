import vuexHelper from '../../../libraries/vuexHelper'
import * as moment from '../../../config/moment'
import Vue from 'vue'
Vue.use(moment)
const getters = {
    all: (state) => {
        /**
        * Filter the substitute requests array based on a function with keys
        *
        * @param {Array} arr
        * @param {Function} key
        * @returns {Object}
        */
        function groupBy(array, f) {
            const groups = {}
            array.forEach(function (o) {
                const group = JSON.stringify(f(o))
                groups[group] = groups[group] || []
                groups[group].push(o)
            })
            return Object.keys(groups).map(function (group) {
                return groups[group]
            })
        }

        const result = groupBy(state.substituteRequests, function (item) {
            return [item.schedule_id, item.status === 'pending' ? item.status : null]
        })

        return result
    },
    WEEKLY_SUBSTITUTE_REQUESTS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.weeklySubstituteRequests, { year, week }) || []
    },

    SCHEDULED_REQUESTS: (state, getters, rootState, rootGetters) => {
        // TODO: Change logic from schedules to shifts
        const schedule = rootGetters['schedules/SCHEDULE_FOR_PERIOD']
        const openRequests = state.scheduledRequests
        const availibleShifts = []
        schedule.map(item => {
            // eslint-disable-next-line no-unused-vars
            for (const n in openRequests) {
                const openRequest = openRequests[n]
                item.hasOpenRequest = false
                if (openRequest.shiftInstanceId === item.shift_instance_id && openRequest.status === 'pending') {
                    item.hasOpenRequest = true
                    break
                }
            }
            return item
        })
        for (let i = 0; i < schedule.length; i++) {
            // remove schedules that are in the pastbundleRenderer.
            // probably this should be done in the api at some point
            // Does not include schedules which startTime are earlier than current time since this pulls an API error anyway.
            const isFuture = Vue.moment(schedule[i].start_datetime).isAfter(Vue.moment(), 'minute')
            if (isFuture && schedule[i].status === 'final') {
                availibleShifts.push(schedule[i])
            }
        }
        return availibleShifts
    },
}

export default getters
