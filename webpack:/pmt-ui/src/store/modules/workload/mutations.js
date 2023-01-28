import Vue from 'vue'
const mutations = {

    SET_WEEK_WORKLOAD (state, payload) {
        Vue.set(state.weekWorkload, `"${payload.year}-${payload.week}"`, payload.result.workload)
        Vue.set(state.weekWorkloadAggregation, `"${payload.year}-${payload.week}"`, payload.result.aggregation)
    },

    async SET_WEEK_DISTRIBUTION_PATTERNS (state, payload) {
        Vue.set(state.weekDistributionPatterns, `"${payload.year}-${payload.week}"`, payload.result)
        Vue.set(state.orinalWeekDistributionPatterns, `"${payload.year}-${payload.week}"`, JSON.parse(JSON.stringify(payload.result)))
    },

    SET_WEEK_DISTRIBUTION_PROFILES (state, payload) {
        Vue.set(state.weekDistributionProfiles, `"${payload.year}-${payload.week}"`, payload.result)
        Vue.set(state.orinalWeekDistributionProfiles, `"${payload.year}-${payload.week}"`, JSON.parse(JSON.stringify(payload.result)))
    },

    async APPLY_PROFILE_TO_DISTRIBUTION (state, { date, department_id }) {
        const week = date.isoWeek()
        const year = date.isoWeekYear()
        const departmentProfiles = state.weekDistributionProfiles[`"${year}-${week}"`].filter(dep => {
            if (department_id) return dep.department_id === department_id
            return true
        })
        const departmentPatterns = state.weekDistributionPatterns[`"${year}-${week}"`].filter(dep => {
            if (department_id) return dep.department_id === department_id
            return true
        })
        await departmentPatterns.forEach(departmentPattern => {
            departmentPattern.patterns.forEach(pattern => {
                const departmentProfile = departmentProfiles.find(departmentProfile => {
                    return departmentProfile.department_id === departmentPattern.department_id && departmentProfile.patterns.find(profile => profile.pattern_id === pattern.pattern_id)
                })
                if (departmentProfile) {
                    const profile = departmentProfile.patterns.find(profile => profile.pattern_id === pattern.pattern_id)
                    if (profile) {
                        pattern.days = profile.days
                    }
                }
            })
        })
        state.profilesApplied = department_id || true
    },

    SET_PROFILES_APPLIED (state, payload) {
        state.profilesApplied = payload
    },

    REVERT_DISTRIBUTION_CHANGES (state, date) {
        const week = date.isoWeek()
        const year = date.isoWeekYear()
        Vue.set(state.weekDistributionPatterns, `"${year}-${week}"`, JSON.parse(JSON.stringify(state.orinalWeekDistributionPatterns[`"${year}-${week}"`])))
        state.profilesApplied = false
    },

    SAVE_PATTERNS_LOCALLY (state, payload) {
        payload.patterns.forEach(pattern => {
            const departmentPatternsIndex = state.weekDistributionPatterns[`"${payload.year}-${payload.week}"`].findIndex(dep => {
                return dep.department_id === pattern.department_id
            })
            const patternIndex = state.weekDistributionPatterns[`"${payload.year}-${payload.week}"`][departmentPatternsIndex].patterns.findIndex(pat => {
                return pat.pattern_id === pattern.pattern_id
            })
            state.weekDistributionPatterns[`"${payload.year}-${payload.week}"`][departmentPatternsIndex].patterns[patternIndex].days = pattern.days
        })
    },

    SAVE_PROFILES_LOCALLY (state, payload) {
        payload.profiles.forEach(profile => {
            const departmentPatternsIndex = state.weekDistributionProfiles[`"${payload.year}-${payload.week}"`].findIndex(dep => {
                return dep.department_id === profile.department_id
            })
            const patternIndex = state.weekDistributionProfiles[`"${payload.year}-${payload.week}"`][departmentPatternsIndex].patterns.findIndex(pat => {
                return pat.pattern_id === profile.pattern_id
            })
            state.weekDistributionProfiles[`"${payload.year}-${payload.week}"`][departmentPatternsIndex].patterns[patternIndex].days = profile.days
        })
    },

    SET_PROCESSES (state, payload) {
        payload.forEach(load => {
            Vue.set(state.processes, parseInt(load.id), load)
        })
    },

    SET_TIMEFRAMES (state, payload) {
        Vue.set(state.timeframes, `"${payload.week}-${payload.year}"`, payload.result.timeframes)
        Vue.set(state.timeframesAggregation, `"${payload.week}-${payload.year}"`, payload.result.aggregation)
    },

    SET_WORKLOAD_IS_SAVING (state, payload) {
        state.savingWorkload = payload
    },

    SET_DISTRIBUTION_IS_SAVING (state, payload) {
        state.savingDistribution = payload
    },

    SET_FETCHING_NORMS (state, payload) {
        state.fetchingNorms = payload
    },

    SET_PROCESS_TIMEFRAMES (state, payload) {
        const weekTimeFrames = state.timeframes[`"${payload.week}-${payload.year}"`]
        for (let i = 0; i < weekTimeFrames.length; i++) {
            if (weekTimeFrames[i].department_id === payload.result[0].department_id) {
                const process = weekTimeFrames[i].work_processes.find(proc => {
                    return parseInt(proc.work_process_id) === parseInt(payload.result[0].work_processes[0].work_process_id)
                })
                process.days = payload.result[0].work_processes[0].days
                break
            }
        }
    },

}
export default mutations
