import service from '../../../services/DepartmentsService'
import Vue from 'vue'

const actions = {
    get(context, load) {
        const payload = {}
        if (load.date) {
            payload.date = typeof load.date !== 'string' ? load.date.apiFormat() : Vue.moment(load.date).apiFormat()
        }
        if (load.allDepartments) {
            context.commit('TOGGLE_LOADING', 'departments/departments', { root: true })
            return service.getDepartments(payload).then(result => {
                if (result.length) {
                    context.commit('set', result)
                    return result
                }
            }).catch(err => {
                throw err
            }).finally(() => {
                context.commit('TOGGLE_LOADING', 'departments/departments', { root: true })
            })
        } else {
            context.commit('TOGGLE_LOADING', 'departments/departmentSets', { root: true })
            payload.account_id = context.rootGetters['auth/user'].accountId
            return service.getDepartmentSets(payload).then(result => {
                if (result.length) {
                    context.commit('set', result)
                    return result
                }
            }).catch(err => {
                throw err
            }).finally(() => {
                context.commit('TOGGLE_LOADING', 'departments/departmentSets', { root: true })
            })
        }
    },

    getCurrentDepartments(context, payload) {
        context.commit('TOGGLE_LOADING', 'departments/departments', { root: true })
        return service.getDepartments(payload).then(result => {
            if (result.length) {
                context.commit('setCurrentDepartmentSet', result)
                return result
            }
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'departments/departments', { root: true })
        })
    },

    /**
     * Returns the department set for an employee at given date.
     *
     * @param context
     * @param payload
     * @returns {Promise<unknown>|Promise<T | void>}
     */
    getWeekDepartmentsForEmployee(context, payload) {
        const { year, week } = payload.date.weekYearObject()
        const accountId = payload.accountId
        // check if it was fetched before
        const departments = context.getters.employeeWeekDepartments({ accountId, year, week })
        if (departments) {
            return new Promise((resolve) => { resolve(departments) })
        }

        // else make the api call to fetch the balances
        return service.getDepartments({ date: payload.date.apiFormat() }).then(departments => {
            context.commit('setEmployeeWeekDepartments', { accountId, year, week, departments })
        }).catch(error => {
            throw error
        })
    },

    getWeekDepartments(context, payload) {
        context.commit('TOGGLE_LOADING', 'departments/weekDepartments', { root: true })
        const newPayload = {
            date: payload && payload.date ? payload.date : Vue.moment().apiFormat(),
        }
        if (!payload.allDepartments) {
            newPayload.account_id = context.rootGetters['auth/user'].accountId
        }
        const apiCall = payload.allDepartments ? 'getDepartments' : 'getDepartmentSets'
        return service[apiCall](newPayload).then(result => {
            if (result.length) {
                context.commit('setWeekDepartments', { departments: result, date: payload.date || Vue.moment().apiFormat() })
                return result
            }
        }).catch(err => {
            throw err
        }).finally(() => {
            context.commit('TOGGLE_LOADING', 'departments/weekDepartments', { root: true })
        })
    },

    /**
     * Checks if a week is final (if all store departments are finalized).
     *
     * @param context
     * @param load
     * @returns {*}
     */
    isWeekFinal(context, load) {
        const payload = { date: Vue.moment().isoWeek(load.week).isoWeekYear(load.year).startOf('isoWeek').apiFormat() }
        return service.getDepartments(payload).then(departments => {
            let final = true
            departments.forEach(department => {
                if (!!department.status && !department.status.department_finalized) {
                    final = false
                }
            })

            context.commit('setFinalWeek', { week: load.week, year: load.year, final: final })

            return final
        })
    },

    /**
     * Returns unique departments for based on filters provided.
     * Not stored in vuex since any combination of filters is accepted.
     *
     * @param context
     * @param payload
     * @returns {*}
     */
    getFilteredDepartments(context, payload) {
        payload = { ...{ limit: 1000 }, ...payload }
        return service.getDepartments(payload).then(departments => {
            return departments.filter((item, index, arr) => {
                return arr.map(department => department.department_id).indexOf(item.department_id) === index
            })
        })
    },
}
export default actions
