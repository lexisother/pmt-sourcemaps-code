import service from '../../../../../services/realisation/TimerService'
import * as moment from '../../../../../config/moment'
import Vue from 'vue'
Vue.use(moment)

const actions = {
    async getTimersToday(context) {
        context.commit('SET_LOADING', true)
        const dependencies = []
        if (!context.rootState.scheduling.todayShifts.length) {
            dependencies.push(context.dispatch('scheduling/getTodaysShifts', Vue.moment(), { root: true }))
        }
        if (!context.rootState.departments.departments.length) {
            dependencies.push(context.dispatch('departments/get', { date: Vue.moment(), allDepartments: true }, { root: true }))
        }
        if (!context.rootState.account.employees.length) {
            dependencies.push(context.dispatch('account/getEmployees', { active: true }, { root: true }))
        }

        await Promise.all(dependencies)
            .catch((error) => {
                context.commit('SET_LOADING_ACCOUNT_ID', null)
                throw error
            })

        const request = await service.getTimers()
        const employees = context.rootState.account.employees
        const schedules = context.rootState.scheduling.todayShifts
        const departments = context.rootState.departments.departments
        const currentStoreId = context.rootState.stores.currentStore.id

        await context.commit('SET_TIMERS', {
            timers: request,
            employees,
            schedules,
            departments,
        })

        await context.commit('SET_USERS_WITHOUT_DEPARTMENT_AND_TIMER', {
            timers: request,
            employees,
            schedules,
            currentStoreId,
        })

        context.commit('SET_LOADING_ACCOUNT_ID', null)
        context.commit('SET_LOADING', false)
    },

    async setTimer(context, payload) {
        context.commit('SET_LOADING_ACCOUNT_ID', payload.account_id)
        const today = new Date()
        await service.setTimer({
            date: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`,
            time: `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`,
            ...payload,
        }).then((response) => {
            context.dispatch('getTimersToday')
        }).catch((error) => {
            throw error
        })
    },
}

export default actions
