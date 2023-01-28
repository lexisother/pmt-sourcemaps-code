import service from '../../../../../services/realisation/TimeRegistrationsService'
import departmentsService from '../../../../../services/DepartmentsService'
import SchedulingService from '../../../../../services/SchedulingService'
import storeService from '../../../../../services/StoreService'
import Vue from 'vue'
import * as moment from '../../../../../config/moment'
Vue.use(moment)

const actions = {
    getTimeRegistrations(context, date) {
        if (context.state.timeRegistrations.length > 0 && context.state.timeRegistrationsDate === date) {
            return new Promise((resolve) => { resolve(context.state.timeRegistrations) })
        }
        context.commit('SET_TIME_REGISTRATIONS_LOADING', true)
        // return service.getTimeRegistrations(date) // leave this for future, in case v3 call will be ready
        const allDepartmentsIds = context.rootState.departments.departments.map(dep => { return dep.department_id }).join(',')
        return service.getTimeRegistrationsByDepartment({ date, department_id: allDepartmentsIds })
            .then(response => {
                context.commit('SET_TIME_REGISTRATIONS', { timeRegistrations: response, employees: context.rootState.account.storeEmployees })
                context.commit('SET_TIME_REGISTRATIONS_DATE', date)
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                context.commit('SET_TIME_REGISTRATIONS_LOADING', false)
            })
    },

    getTimeRegistrationsByDepartment(context, date) {
        if (context.state.timeRegistrations.length > 0 && context.state.timeRegistrationsDate === date) {
            return new Promise((resolve) => { resolve(context.state.timeRegistrations) })
        }
        context.commit('SET_TIME_REGISTRATIONS_LOADING', true)
        return service.getTimeRegistrationsByDepartment({ date, department_id: context.state.accessibleDepartments.join(',') })
            .then(response => {
                context.commit('SET_TIME_REGISTRATIONS', { timeRegistrations: response, employees: context.rootState.account.storeEmployees })
                context.commit('SET_TIME_REGISTRATIONS_DATE', date)
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                context.commit('SET_TIME_REGISTRATIONS_LOADING', false)
            })
    },

    postProposedRealisation(context, payload) {
        return service.postProposedRealisation(payload).then(data => {
            return data
        }).catch(error => {
            throw error
        })
    },

    /**
     * Returns accessible deparments for an employee at given date.
     *
     * @param context
     * @param payload
     * @returns {Promise<unknown>|Promise<T | void>}
     */
    getAccessibleDepartments(context, payload) {
        return departmentsService.getDepartmentSets({ date: payload.date.apiFormat(), account_id: payload.accountId })
            .then(departments => {
                const payload = {
                    departments,
                    allDepartmentsAccess: context.rootGetters['auth/HAS_ALL_DEPARTMENTS_ACCESS'],
                    allDepartments: context.rootState.departments.departments,
                }
                context.commit('SET_ACCESSIBLE_DEPARTMENTS', payload)
            })
            .catch(error => {
                throw error
            })
    },

    getWeekStatuses(context, payload) {
        // check if it was fetched before
        if (context.state.weekStatuses.length > 0) {
            return new Promise(resolve => resolve(context.state.weekStatuses))
        }

        return storeService.getWeekStatuses(payload).then(result => {
            context.commit('SET_WEEK_STATUSES', result)
            return result
        }).catch(err => {
            throw err
        })
    },

    getStoreGroupsForWeek(context, { storeId, date }) {
        const yearWeek = `${Vue.moment(date).isoWeekYear()}-${Vue.moment(date).isoWeek()}`
        // check if it was fetched before
        if (context.state.weekStores[yearWeek]?.length > 0) {
            return new Promise(resolve => resolve(context.state.weekStores[yearWeek]))
        }

        return SchedulingService.getStoreGroups({ storeId, yearWeek })
            .then(result => {
                const exchangeStores = mapExchangeStores(result)
                context.commit('SET_WEEK_STORES', { yearWeek, result })
                context.commit('planning/SET_EXCHANGE_STORES', { exchangeStores, date: Vue.moment(date) }, { root: true })
                return result
            })
            .catch(err => {
                throw err
            })
    },
}

function mapExchangeStores(data) {
    const stores = data.aggregation.stores
    const departments = data.aggregation.departments
    const storeGroups = data.result
    const exchangeStores = []
    storeGroups.forEach(sg => {
        if (sg.exchange) {
            sg.stores.forEach(store => {
                const newStore = stores[store.id]
                const newStoreDepartments = store.departments.map(department => {
                    return departments[department]
                })
                newStore.departments = newStoreDepartments
                newStore.store_group = sg
                exchangeStores.push(newStore)
            })
        }
    })
    return exchangeStores
}

export default actions
