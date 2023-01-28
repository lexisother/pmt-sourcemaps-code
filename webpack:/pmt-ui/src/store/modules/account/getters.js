import accountHelper from '../../../libraries/accountHelper'
import vuexHelper from '../../../libraries/vuexHelper'
const getters = {
    assessments(state) {
        return state.assessments
    },
    assessmentHistory: (state) => {
        return state.assessmentHistory
    },

    balances: (state) => {
        return state.balances
    },
    conditionalPasswordValidation: (state) => (password) => {
        const testStrength = function (validation) {
            return new RegExp(validation).test(password)
        }
        if (!(password && password.length >= state.validations.password.minLength)) {
            return false
        }

        let criteria = 0

        const strength = state.validations.password.strength
        if (testStrength(state.validations.password.lowerCase)) {
            criteria += 1
        }
        if (testStrength(state.validations.password.upperCase)) {
            criteria += 1
        }
        if (testStrength(state.validations.password.numbers)) {
            criteria += 1
        }
        if (testStrength(state.validations.password.specialChars)) {
            criteria += 1
        }
        if (strength === state.PASSWORD_STRENGTHS.HIGH) {
            return criteria >= 3
        }
        if (strength === state.PASSWORD_STRENGTHS.MEDIUM) {
            return criteria >= 2
        }
        if (strength === state.PASSWORD_STRENGTHS.NONE) {
            return criteria >= 1
        }
        return criteria <= 1
    },

    strengthRequirementCount(state) {
        const strength = state.validations.password.strength
        if (strength === state.PASSWORD_STRENGTHS.HIGH) {
            return 3
        }
        if (strength === state.PASSWORD_STRENGTHS.MEDIUM) {
            return 2
        }
        return 1
    },

    getEmployeeById: (state) => (id) => {
        let user = state.employees.find(item => parseInt(item.account_id) === parseInt(id))
        if (!user) {
            user = state.storeEmployees.find(item => parseInt(item.account_id) === parseInt(id))
        }
        return user || { name: 'Admin' }
    },

    ORGANISATIONAL_ACCOUNTS: (state) => {
        return state.organisationalAccounts
    },

    ORGANISATIONAL_ACCOUNT_BY_ID: (state) => (id) => {
        return state.organisationalAccounts.find(item => parseInt(item.account_id) === parseInt(id))
    },

    myCalendarSettings: (state) => {
        return state.calendarSettings
    },

    employees(state) {
        return state.employees.map(employee => {
            return accountHelper.mapEmployee(employee)
        }).filter(e => e.role_priority > 1)
    },

    STORE_EMPLOYEES(state) {
        return state.storeEmployees.map(employee => {
            return accountHelper.mapEmployee(employee)
        }).filter(e => e.role_priority > 1)
    },

    MY_WEEK_COLLEAGUES: (state, getters, rootState, rootGetters) => (date) => {
        return getters.WEEK_EMPLOYEES(date).filter(e => e.role_priority > 1)
    },

    /**
     * Returns true if the current application user has the provided department
     * @returns {Boolean}
     */
    APP_USER_HAS_DEPARTMENT: (state, getters, rootState, rootGetters) => (departmentId, date) => {
        const isOrganisationalUser = rootGetters['auth/isOrganisationalUser']
        const allDepartmentsAccess = rootGetters['auth/HAS_ALL_DEPARTMENTS_ACCESS']
        const appUser = rootGetters['auth/user']
        if (isOrganisationalUser || allDepartmentsAccess) {
            return true
        }
        const weekEmployees = rootGetters['account/WEEK_EMPLOYEES'](date)
        const currentUser = weekEmployees.find(e => e.account_id === appUser.accountId)
        const currentEmployeeDepartmentIds = currentUser.departments.map(d => d.department_id)
        return currentEmployeeDepartmentIds.includes(departmentId)
    },

    /**
     * Returns the employees for the given week
     * @returns {Boolean}
     */
    WEEK_EMPLOYEES: (state, getters, rootState, rootGetters) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.weekEmployees, { year, week }) || []
    },

    /**
     * Returns current store employees per given week
     * @returns {Boolean}
     */
    WEEK_STORE_EMPLOYEES: (state, getters, rootState, rootGetters) => (year, week) => {
        return vuexHelper.getYearWeekStateData(state.weekStoreEmployees, { year, week })
    },

    /**
     * Returns the exchange employees for the given week
     * @returns {Boolean}
     */
    WEEK_EXCHANGE_EMPLOYEES: (state, getters, rootState, rootGetters) => (year, week) => {
        return vuexHelper.getYearWeekStateData(state.weekExchangeEmployees, { year, week })
    },

    /**
     * Returns the employees wage per hour in a week
     * @returns {Boolean}
     */
    WEEK_EMPLOYEES_WAGE_INFO: (state) => (date) => {
        const { year, week } = date.weekYearObject()
        return vuexHelper.getYearWeekStateData(state.weeklyWageInfo, { year, week })
    },

    CURRENT_EMPLOYEE(state) {
        return state.currentEmployee
    },

    COMPETENCES(state) {
        return state.competences
    },
}
export default getters
