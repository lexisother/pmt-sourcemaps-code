import moment from 'moment'
import Vue from 'vue'
import vuexHelper from '../../../libraries/vuexHelper'

const mutations = {
    set(state, departments) {
        state.departments = departments
    },

    setCurrentDepartmentSet(state, departments) {
        state.currentDepartments = departments
    },

    setWeekDepartments(state, payload) {
        const date = moment(payload.date)
        Vue.set(state.weekDepartments, `"${date.isoWeek()}-${date.isoWeekYear()}"`, payload.departments)
    },

    /**
     * Stores employee departments for a week in state keyed by year-week-accountId
     *
     * @param state
     * @param accountId
     * @param year
     * @param week
     * @param departments
     */
    setEmployeeWeekDepartments(state, { accountId, year, week, departments }) {
        vuexHelper.setYearWeekAccountIdData(state, 'employeeWeekDepartments', departments, year, week, accountId)
    },

    /**
     * Sets final status for a week.
     * @param state
     * @param payload
     */
    setFinalWeek(state, payload) {
        if (!state.isFinal[payload.year]) {
            state.isFinal[payload.year] = {}
        }
        state.isFinal[payload.year][payload.week] = payload.final
    },
}
export default mutations
