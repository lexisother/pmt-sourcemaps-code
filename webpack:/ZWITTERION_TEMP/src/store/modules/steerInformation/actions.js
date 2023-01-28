import service from '../../../services/ForecastDataService'
import Vue from 'vue'
import * as moment from '../../../config/moment'
import storeService from '../../../services/StoreService'

Vue.use(moment)
const actions = {
    async getForecastData(context, date) {
        const { year, week } = date.weekYearObject()
        const dataAlreadySet = Object.values(this.getters['steerInformation/FORECAST'](date)).length > 0
        if (dataAlreadySet) return
        service.getForecastData({ year, week })
            .then(result => {
                context.commit('SET_FORECAST_DATA', { result, date })
            })
            .catch(error => {
                throw error
            })
    },

    async getSteerInformationIntersections(context, { date, departments }) {
        context.commit('SET_INTERSECTIONS_LOADING', true)
        departments = departments.sort((a, b) => a - b).toString()
        return service.getSteerInformationIntersections(date, departments)
            .then(async response => {
                await context.commit('SET_STEER_INFORMATION_INTERSECTIONS', response)
            })
            .catch(error => {
                throw error
            })
            .finally(() => {
                context.commit('SET_INTERSECTIONS_LOADING', false)
            })
    },

    async getSteerInformation(context, date) {
        const payload = {
            params: {
                hours_categories: context.state.settings.hoursSelection.join(),
                costs_categories: context.state.settings.costsSelection.join(),
            },
        }

        const { year, week } = date.weekYearObject()
        payload.year = year
        payload.week = week

        const departmentTypes = context.state.departmentTypes
        const steerInformation = await service.getSteerInformationData(payload)
            .then(response => response)
            .catch(error => {
                context.commit('SET_STEER_INFORMATION_LOADING', false)
                throw error
            })
        context.commit('SET_STEER_INFORMATION', steerInformation)
        context.commit('INIT_SCREEN_VIEW', { steerInformation, departmentTypes })
    },
    async getDepartmentTypes({ rootGetters, commit }) {
        const dataAlreadySet = Object.values(this.getters['steerInformation/DEPARTMENT_TYPES']).length > 0
        if (dataAlreadySet) return

        const payload = {
            mondayOfCurrentweek: Vue.moment().startOf('isoweek').apiFormat(),
            storeId: rootGetters['stores/currentStore'].id,
        }
        const departmentTypes = await service.getDepartmentType(payload)
            .then(response =>
                response[0].departments.map(item => ({
                    department_id: item.department_id,
                    department_type: item.department_type,
                })))
            .catch(error => {
                throw error
            })
        commit('SET_DEPARTMENT_TYPES', departmentTypes)
    },
    async saveForeCast(context, date) {
        context.commit('SET_STEER_INFORMATION_LOADING', true)
        const { year, week } = date.weekYearObject()

        const foreCastData = {
            year,
            week,
            data: this.getters['steerInformation/FORECAST'](date),
        }
        service.saveForcastData(foreCastData)
            .then(async () => {
                context.commit('SET_STEER_INFORMATION_LOADING', false)

                if (this.getters['auth/PLANNING_BASED_ON_WLP']) {
                    context.commit('SET_STEER_INFORMATION_WORKLOAD_LOADING', true)
                    await context.dispatch('workload/FETCH_WLP_NORMS', foreCastData, { root: true })
                        .finally(() => {
                            context.commit('SET_STEER_INFORMATION_WORKLOAD_LOADING', false)
                            context.dispatch('initForeCast', {
                                date,
                                full: true,
                            })
                        })
                } else {
                    context.dispatch('initForeCast', {
                        date,
                        full: true,
                    })
                }
            })
            .catch(error => {
                throw error
            })
    },
    checkWeek({ state, commit }, date) {
        const today = Vue.moment()
        const isPast = date.isBefore(today, 'isoWeek')
        const isPresent = date.isSame(today, 'isoWeek')
        const disabledDay = isPresent ? Vue.moment().day() : isPast ? 7 : undefined
        commit('SET_DAYS_DISABLED', disabledDay)
    },
    async setMaxReleasedDate({ state, commit }) {
        if (state.maxReleasedDate) return
        const servicePayload = {
            'week[gte]': Vue.moment().yearWeekApiFilter(),
            latest_status: true,
            status: 'released',
        }
        storeService.getWeekStatuses(servicePayload).then(response => {
            let maxDateItem
            if (response.length) {
                const maxWeek = response[0]
                maxDateItem = Vue.moment().isoWeekYear(maxWeek.year).isoWeek(maxWeek.week)
            } else {
                maxDateItem = Vue.moment()
            }
            commit('SET_MAX_RELEASED_DATE', maxDateItem.startOf('isoWeek'))
            commit('SET_WEEK_STATUSES', response)
        }).catch(error => {
            throw error
        })
    },
    initExportData({ getters }) {
        const exportData = getters['steerInformation/EXPORT_DATA']
        return exportData
    },
    async initForeCast(context, payload) {
        if (payload) {
            context.commit('SET_STEER_INFORMATION_LOADING', true)
            context.commit('SET_CHANGE_TRIGGERED', false)
            const calls = [
                context.dispatch('setMaxReleasedDate'),
                context.dispatch('departments/get', { date: payload.date, allDepartments: true }, { root: true }),
                context.dispatch('getDepartmentTypes'),
                context.dispatch('checkWeek', payload.date),
            ]
            if (payload.full) {
                calls.push(
                    context.dispatch('getForecastData', payload.date),
                    context.dispatch('getSteerInformation', payload.date),
                )
            }
            await Promise.all(calls)
            context.commit('SET_STEER_INFORMATION_LOADING', false)
        }
    },
}
export default actions
