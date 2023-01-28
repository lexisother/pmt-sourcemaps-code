import moment from 'moment'
import vuexHelper from '../../../libraries/vuexHelper'

const getters = {
    all(state) {
        return state.departments
    },
    current(state) {
        return state.currentDepartments
    },

    /**
     * Returns department by id from a store structure at given date.
     *
     * @param state
     * @returns {function(*): (*|undefined)}
     */
    getByIdAtDate: (state) => (payload) => {
        const date = moment(payload.date)
        const weekDepartments = state.weekDepartments[`"${date.isoWeek()}-${date.isoWeekYear()}"`]
        if (weekDepartments) {
            return weekDepartments.find(department => { return department.department_id === payload.id })
        }

        return undefined
    },

    getById: (state) => (id) => {
        const departments = state.departments.find(department => {
            return department.department_id === id
        })
        if (!departments) {
            return state.currentDepartments.find(department => {
                return department.department_id === id
            })
        } else {
            return departments
        }
    },

    getByIdCurrentDepartmentSet: (state) => (id) => {
        return state.currentDepartments.find(department => {
            return department.department_id === id
        })
    },

    /**
     * Returns employee departments for provided week.
     *
     * @param state
     * @returns {function({year: *, week: *}): *|undefined}
     */
    employeeWeekDepartments: (state) => ({ accountId, year, week }) => {
        if (!accountId || !year || !week) {
            return {}
        }
        return vuexHelper.getYearWeekStateDataForAccount(state.employeeWeekDepartments, { year, week, accountId })
    },

    WEEK_DEPARTMENTS: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return state.weekDepartments[`"${week}-${year}"`] || []
    },
}
export default getters
