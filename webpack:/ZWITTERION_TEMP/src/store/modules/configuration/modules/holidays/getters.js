const getters = {
    /**
     * Returns all environment departments
     * @param {Object} state VUEX
     * @returns {Array}
     */
    PUBLIC_HOLIDAYS (state) {
        return state.publicHolidays
    },
    HOLIDAYS_API_ERROR (state) {
        return state.holidaysApiError
    },
    SEARCH_STRING (state) {
        return state.searchString
    },
    HOLIDAY_RULES (state) {
        return state.holidayRules
    },
    SCHOOL_HOLIDAYS (state) {
        return state.schoolHolidays
    },
    SCHOOL_HOLIDAY_REGIONS (state) {
        return state.schoolHolidayRegions
    },
}
export default getters
