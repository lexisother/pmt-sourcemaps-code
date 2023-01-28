import service from '../../../services/WorkloadService'
const actions = {
    GET_WEEK_WORKLOAD(context, date) {
        context.commit('TOGGLE_LOADING', 'workload/workload', { root: true })
        const payload = {
            week: date.isoWeek(),
            year: date.isoWeekYear(),
        }
        return service.getWeekWorkload(payload).then(result => {
            context.commit('SET_WEEK_WORKLOAD', { week: payload.week, year: payload.year, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/workload', { root: true })
        })
    },

    GET_WEEK_DISTRUTION_PATTERNS(context, date) {
        context.commit('TOGGLE_LOADING', 'workload/patterns', { root: true })
        const payload = {
            week: date.isoWeek(),
            year: date.isoWeekYear(),
        }
        return service.getWeekDistributionPatterns(payload).then(result => {
            context.commit('SET_WEEK_DISTRIBUTION_PATTERNS', { week: payload.week, year: payload.year, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/patterns', { root: true })
        })
    },

    GET_WEEK_DISTRUTION_PROFILES(context, date) {
        context.commit('TOGGLE_LOADING', 'workload/profiles', { root: true })
        const payload = {
            week: date.isoWeek(),
            year: date.isoWeekYear(),
        }
        return service.getWeekDistributionProfiles(payload).then(result => {
            context.commit('SET_WEEK_DISTRIBUTION_PROFILES', { week: payload.week, year: payload.year, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/profiles', { root: true })
        })
    },

    GET_PROCESSES(context) {
        context.commit('TOGGLE_LOADING', 'workload/processes', { root: true })
        return service.getProcesses().then(result => {
            context.commit('SET_PROCESSES', result)
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/processes', { root: true })
        })
    },

    GET_TIMEFRAMES(context, payload) {
        context.commit('TOGGLE_LOADING', 'workload/timeframes', { root: true })
        return service.getTimeframes(payload).then(result => {
            context.commit('SET_TIMEFRAMES', { week: payload.week, year: payload.year, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/timeframes', { root: true })
        })
    },

    /**
     * 1. can send in per department
     * 2. all 7 days must be sent per department/process: wlp does not support sending in an incomplete week
     * 3. per day, a max of three and minimum of one timeframes can be sent in. Timeframes per process/day are always overwritten, so any timeframes not sent are removed
     * @param {VUEX} context
     * @param {Object} payload {week: 1, year: 2020, frames: {...}}
     */
    SAVE_WORKLOAD(context, payload) {
        context.commit('TOGGLE_SAVING', 'workload/workload', { root: true })
        return service.saveWorkload(payload).then(result => {
            context.commit('SET_PROCESS_TIMEFRAMES', { week: payload.week, year: payload.year, result })
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_SAVING', 'workload/workload', { root: true })
        })
    },

    /**
     * Can save patterns and profiles (payload.what)
     * After api call success we also save the data
     * in local vuex state (replacing original)
     * @param {VUEX} context
     * @param {Object} payload
     */
    SAVE_DISTRIBUTION(context, payload) {
        context.commit('TOGGLE_SAVING', 'workload/distribution', { root: true })
        return service.saveDistribution(payload).then(result => {
            const mutationPayload = { week: payload.week, year: payload.year }
            mutationPayload[`${payload.what}`] = payload.body[`${payload.what}`]
            context.commit(`SAVE_${payload.what.toUpperCase()}_LOCALLY`, mutationPayload)
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_SAVING', 'workload/distribution', { root: true })
        })
    },

    FETCH_WLP_NORMS(context, payload) {
        context.commit('TOGGLE_LOADING', 'workload/wlp', { root: true })
        return service.fetchNorms(payload).then(result => {
            return result
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'workload/wlp', { root: true })
        })
    },

}

export default actions
