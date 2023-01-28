import * as momentLib from '../../../config/moment'
import Vue from 'vue'
Vue.use(momentLib)
const getters = {
    /**
     * @returns {Object}
     */
    currentStore: (state) => {
        return state.currentStore
    },

    getAllStores: (state) => {
        if (state.stores && state.stores.length > 0) {
            return state.stores
        }

        const storedStores = JSON.parse(localStorage.getItem('stores'))
        if (storedStores && storedStores.length > 0) {
            return storedStores
        }

        return []
    },

    /**
     * Returns the business times of current store. Defaults to 00:00 - 23:59.
     *
     * @returns {Object}
     */
    getWeekBusinessTimes: (state) => {
        const defaultTimes = {
            from: '00:00',
            to: '23:59',
        }
        if (state.currentStore === null || !state.currentStore.openingTimes) {
            return defaultTimes
        }
        const startTimes = []
        const endTimes = []
        // eslint-disable-next-line no-unused-vars
        for (const n in state.currentStore.openingTimes) {
            startTimes.push(state.currentStore.openingTimes[n].businessTimes.from)
            endTimes.push(state.currentStore.openingTimes[n].businessTimes.to)
        }
        // get the smallest and the highest times from the store business times
        if (startTimes.length) {
            const start = startTimes.sort(function (a, b) {
                return a === b ? 0 : a < b ? -1 : 1
            })[0]
            const end = endTimes.sort(function (a, b) {
                return a === b ? 0 : a > b ? -1 : 1
            })[0]
            return {
                from: start,
                to: end,
            }
        }
        return defaultTimes
    },

    /**
     * Returns current store week (calculated from the provided date) business times
     * @param {Object} day Moment
     */
    storeWeekBusinessTimes: (state) => (day) => {
        const storeId = state.currentStore.id
        const { year, week } = day.weekYearObject()
        const storeData = state.weekBusinessTimes[storeId]
        const yearStoreData = storeData ? storeData[year] : false
        return yearStoreData ? yearStoreData[week] : undefined
    },

    weekdaysBusinessTimes: (state) => (date) => {
        const storeId = state.currentStore.id
        const { year, week } = date.weekYearObject()
        const storeData = state.weekBusinessTimes[storeId]
        const yearStoreData = storeData ? storeData[year] : false
        const storeTimes = yearStoreData ? yearStoreData[week] : undefined
        if (storeTimes) {
            const result = []
            let currentDay = 0
            // eslint-disable-next-line no-unused-vars
            for (const times of storeTimes.store_availability) {
                const from = date.clone().startOf('isoWeek').add(currentDay, 'days').setTime(times.business_from_time).longApiFormat()
                const to = date.clone().startOf('isoWeek').add(currentDay, 'days').setTime(times.business_to_time).longApiFormat()
                const closed = times.closed
                currentDay++
                result.push({ from, to, closed })
            }
            return result
        }
    },

    /**
     * Returns the business times of certain day for the current store. Defaults to 00:00 - 23:59.
     * @param {Object} day Moment
     * @returns {Object}
     */
    storeDayBusinessTimes: (state, getters) => (day, isWeekset = false) => {
        const defaultTimes = {
            from: '00:00',
            to: '23:59',
        }
        if (isWeekset) {
            return defaultTimes
        }
        const weekStoreData = getters.storeWeekBusinessTimes(day)
        if (state.currentStore === null || !weekStoreData) {
            return defaultTimes
        }
        const dayTimes = weekStoreData.store_availability.find(time => {
            return time.week_day === day.isoWeekday()
        })
        if (dayTimes && dayTimes.business_to_time < '23:30') {
            // Round up business times 'TO' to make sure people can add all the availabilities they need
            const newBusinessTimeTo = Vue.moment().nearestFutureMinutes(30, Vue.moment(`${Vue.moment().apiFormat()} ${dayTimes.business_to_time}`)).format('HH:mm')
            dayTimes.business_to_time = newBusinessTimeTo
        }
        return dayTimes
            ? {
                from: dayTimes.business_from_time,
                to: dayTimes.business_to_time,
            }
            : defaultTimes
    },

    getDefaultTheme(state) {
        return state.defaultTheme
    },

    theme(state) {
        return state.currentStore ? state.currentStore.theme : state.defaultTheme
    },

    /**
     * Returns week status for a week-year.
     *
     * @param {String} week
     */
    weekStatus: (state) => (week) => {
        return state.weekStatuses[`"${week}"`]
    },
}
export default getters
