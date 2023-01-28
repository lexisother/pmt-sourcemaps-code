import { mapGetters, mapActions, mapState, mapMutations } from 'vuex'
export default {

    computed: {
        ...mapGetters(['IS_MOBILE', 'PAGE_WIDTH', 'PAGE_SIZE', 'HAS_FILTERS', 'FITS_FILTERS_ON']),
        ...mapState('departments', {
            weekDepartments: 'weekDepartments',
            loadingDepartments: 'loading',
        }),
        ...mapState('workload', {
            weekWorkload: 'weekWorkload',
            processes: 'processes',
            weekTimeframes: 'timeframes',
            weekDistributionPatterns: 'weekDistributionPatterns',
            weekDistributionProfiles: 'weekDistributionProfiles',
            loading: 'loading',
            saving: 'saving',
            profilesApplied: 'profilesApplied',
        }),
        ...mapGetters('workload', ['HAS_TIMEFRAMES', 'GET_WEEK_TIMEFRAMES', 'GET_PATTERN_WORKLOAD_PROCESS_LINK']),
        ...mapState({ filters: 'pageFilters' }),
        ...mapGetters('auth', ['user', 'canYou']),
        ...mapGetters('stores', {
            businessTimes: 'getWeekBusinessTimes',
            currentStore: 'currentStore',
        }),
        ...mapState('stores', {
            loadingStoreData: 'loading',
            weekStatuses: 'weekStatuses',
        }),

        isDistributionRoute () {
            return this.$route.name === 'workload-distribution'
        },
        selectedDate () {
            return this.$moment().fromRouteParams(this.$route.params, 'week', true)
        },
        /**
         * Return an array of Moment days in the current week.
         * @returns {Array}
         */
        currentWeekDays () {
            return this.selectedDate ? this.selectedDate.toCalendarArray('week') : this.$moment().toCalendarArray('week')
        },
        isFullScreen () {
            return this.$route.query.full_screen === 'true' || this.$route.query.full_screen
        },
        filtered () {
            return this.HAS_FILTERS || this.filters.hideNonEditableProcesses
        },
    },

    methods: {
        ...mapMutations(['UPDATE_PAGE_FILTER', 'UPDATE_ENABLED_FILTERS']),
        ...mapActions('departments', {
            GET_DEPARTMENTS: 'getWeekDepartments',
        }),
        ...mapMutations('workload', ['APPLY_PROFILE_TO_DISTRIBUTION', 'REVERT_DISTRIBUTION_CHANGES', 'SET_PROFILES_APPLIED']),
        ...mapActions('workload', [
            'GET_WEEK_WORKLOAD',
            'GET_WEEK_DISTRUTION_PATTERNS',
            'GET_WEEK_DISTRUTION_PROFILES',
            'GET_PROCESSES',
            'GET_TIMEFRAMES',
            'FETCH_WLP_NORMS',
            'SAVE_DISTRIBUTION',
            'SAVE_WORKLOAD']),
        ...mapMutations(['UPDATE_PAGE_FILTER', 'CLEAR_PARTICULAR_PAGE_FILTERS', 'CLEAR_PAGE_FILTERS', 'SET_SNACKBAR']),
        ...mapActions(['PRINT', 'EXPORT_EXCEL']),
        ...mapActions('stores', {
            GET_WEEK_STATUS: 'getWeekStatus',
        }),

        departmentById (id) {
            return this.departments.find(department => department.department_id === id)
        },
        propFormat (day) {
            return day.clone().locale('en').format('dddd').toLowerCase()
        },
    },

}
