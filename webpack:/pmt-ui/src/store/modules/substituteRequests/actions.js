import service from '../../../services/SubstituteService'
import language from '../../../config/language'
import pmtApi from '../../../libraries/pmtApi'
const actions = {

    getSubstituteRequests({ commit }, payload) {
        return service.getSubstituteRequests(payload).then(result => {
            const resultPayload = {
                result: result,
                account_id: payload.account_id,
            }
            commit('SET_ALL', resultPayload)
        })
    },

    getWeeklySubstituteRequests(context, payload) {
        const existingSubstituteRequests = context.getters.WEEKLY_SUBSTITUTE_REQUESTS(payload.date)
        if (Object.keys(existingSubstituteRequests).length) {
            return new Promise((resolve) => { resolve(existingSubstituteRequests) })
        }
        return service.getSubstituteRequests(payload.filters).then(result => {
            context.commit('SET_WEEKLY_SUBSTITUTE_REQUESTS', { date: payload.date, result })
        })
    },

    interested(context, payload) {
        return service.putSubstituteRequests(payload).then(result => {
            if (result) {
                if (result.reply === 1) {
                    context.commit('SET_ONE', result)
                    context.commit('SET_SNACKBAR', {
                        message: language.t('entities.requests.substitutes.shiftExchangeRequestSent', [result.requester_name]),
                        success: true,
                    }, { root: true })
                } else {
                    context.commit('SET_ONE', result)
                    context.commit('SET_SNACKBAR', {
                        message: language.t('entities.requests.substitutes.shiftExchangeRequestSentFalse', [result.requester_name]),
                    }, { root: true })
                }
            };
        }).catch(error => {
            context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
        })
    },

    send(context, payload) {
        return service.sendSubstituteRequests(payload).then(results => {
            if (payload.cache) {
                context.commit('INSERT_REQUESTS', results)
            } else {
                context.commit('RESET')
            }
            context.commit('SET_SNACKBAR', { message: language.t('modals.substituteRequest.success.message'), success: true }, { root: true })
            context.dispatch('getScheduledRequests', true)
            return true
        }).catch(error => {
            context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
            throw error
        })
    },

    interestedFromEmail(context, payload) {
        const body = {
            reply: payload.type === 'confirm',
        }
        pmtApi.put('/scheduleSubstituteRequests/' + payload.id, body).then(response => {
            context.commit('SET_SNACKBAR', { message: language.t('modals.substituteRequest.success.message'), success: true }, { root: true })
        }).catch(error => {
            context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
        })
    },

    getAvailableColleaguesForShift(context, shiftInstanceId) {
        const existingShiftColleagues = context.state.shiftColleagues[shiftInstanceId]
        if (existingShiftColleagues) {
            return new Promise((resolve) => { resolve(existingShiftColleagues) })
        }
        return service.getAvailableColleaguesForShift(shiftInstanceId)
            .then(colleagues => {
                context.commit('SET_AVAILABLE_COLLEAGUES_FOR_SHIFT', { shiftInstanceId, colleagues })
                return colleagues
            })
            .catch(error => {
                throw error
            })
    },

    getScheduledRequests(context, override = false) {
        const scheduledRequests = context.state.scheduledRequests
        if (scheduledRequests.length && !override) {
            return new Promise((resolve) => { resolve(scheduledRequests) })
        }
        return service.getScheduledRequests().then(result => {
            context.commit('SET_SCHEDULED_REQUESTS', result)
        })
    },
}
export default actions
