import Vue from 'vue'

const mutations = {
    SET_PUBLIC_HOLIDAYS (state, payload) {
        state.publicHolidays = payload
    },
    SET_HOLIDAYS_API_ERROR (state, payload) {
        state.holidaysApiError = payload
    },
    ADD_PUBLIC_HOLIDAY (state, value) {
        state.publicHolidays.push(value)
    },
    EDIT_PUBLIC_HOLIDAY (state, value) {
        const pos = state.publicHolidays.map(function (hol) { return hol.id }).indexOf(value.id)
        Vue.set(state.publicHolidays, pos, value)
    },
    DELETE_PUBLIC_HOLIDAY (state, id) {
        const pos = state.publicHolidays.map(function (hol) { return hol.id }).indexOf(id)
        state.publicHolidays.splice(pos, 1)
    },
    SET_HOLIDAY_RULES (state, payload) {
        state.holidayRules = payload
    },
    ADD_HOLIDAY_RULE (state, payload) {
        state.holidayRules.push(payload)
    },
    EDIT_HOLIDAY_RULE (state, payload) {
        const holidayRuleIndex = state.holidayRules.findIndex(o => o.id === payload.id)
        Vue.set(state.holidayRules, holidayRuleIndex, payload)
    },
    DELETE_HOLIDAY_RULE (state, id) {
        const holidayRuleIndex = state.holidayRules.findIndex(o => o.id === id)
        state.holidayRules.splice(holidayRuleIndex, 1)
    },
    SET_SCHOOL_HOLIDAYS (state, payload) {
        state.schoolHolidays = payload
    },
    ADD_SCHOOL_HOLIDAY (state, value) {
        state.schoolHolidays.push(value)
    },
    EDIT_SCHOOL_HOLIDAY (state, value) {
        const pos = state.schoolHolidays.map(function (hol) { return hol.id }).indexOf(value.id)
        Vue.set(state.schoolHolidays, pos, value)
    },
    DELETE_SCHOOL_HOLIDAY (state, id) {
        const pos = state.schoolHolidays.map(function (hol) { return hol.id }).indexOf(id)
        state.schoolHolidays.splice(pos, 1)
    },
    SET_SCHOOL_HOLIDAY_REGIONS (state, payload) {
        state.schoolHolidayRegions = payload
    },
    ADD_SCHOOL_HOLIDAY_REGION (state, payload) {
        state.schoolHolidayRegions.push(payload)
    },
    EDIT_SCHOOL_HOLIDAY_REGION (state, payload) {
        const regionIndex = state.schoolHolidayRegions.findIndex(o => o.id === payload.id)
        state.schoolHolidayRegions[regionIndex].name = payload.name
    },
    DELETE_SCHOOL_HOLIDAY_REGION (state, id) {
        const regionIndex = state.schoolHolidayRegions.findIndex(o => o.id === id)
        state.schoolHolidayRegions.splice(regionIndex, 1)
    },
    UPDATE_SCHOOL_HOLIDAYS_WITH_REGIONS (state, payload) {
        const schoolHolidaysClone = JSON.parse(JSON.stringify(state.schoolHolidays))
        schoolHolidaysClone.forEach((holiday) => {
            if (holiday.region_id === payload.id) {
                holiday.region_name = payload.name
            }
        })
        state.schoolHolidays = schoolHolidaysClone
    },
    SET_SEARCH_STRING (state, payload) {
        state.searchString = payload
    },
}
export default mutations
