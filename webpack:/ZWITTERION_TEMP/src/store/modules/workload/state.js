const state = {
    weekWorkload: [],
    weekWorkloadAggregation: [],
    weekDistributionPatterns: [],
    orinalWeekDistributionPatterns: [],
    weekDistributionProfiles: [],
    orinalWeekDistributionProfiles: [],
    processes: {},
    timeframes: [],
    timeframesAggregation: [],
    profilesApplied: false,
    loading: {
        workload: false,
        patterns: false,
        profiles: false,
        processes: false,
        timeframes: false,
        wlp: false,
    },
    saving: {
        workload: false,
        distribution: false,
    },
}
export default state
