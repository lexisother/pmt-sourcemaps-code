import _ from 'lodash'
import Vue from 'vue'
import pmtApi from '../libraries/pmtApi'
import availabilityHelper from '../libraries/availabilityHelper'
import stringHelper from '../libraries/stringHelper'
import moment from 'moment'

class AvailabilityService {
    /**
     * Returns all the availabilities of the given user/store for the given date.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} date
     * @returns {Promise}
     */
    getAvailabilitiesOfDate(storeId, accountId, date) {
        return pmtApi.get('/availabilities/date/' + date.apiFormat(), {
            params: {
                store_id: storeId,
                account_id: accountId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityEntries(response.data.result)
            })
    }

    /**
     * Returns the result of the given user's availability of the given date.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} date
     * @returns {Promise}
     */
    getAvailabilitiesResultOfDate(storeId, accountId, date) {
        return pmtApi.get('/availabilities/results/date/' + date.apiFormat(), {
            params: {
                store_id: storeId,
                account_id: accountId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityEntries(response.data.result)
            })
    }

    /**
     * Returns all availabilities of the given week and year.
     *
     * @param {int} week
     * @param {int} year
     * @returns {Promise}
     */
    getAllWeekAvailabilities(week, year) {
        return pmtApi.get(`/availabilities/results/week/${stringHelper.getYearWeekString(year, week)}?limit=3000`).then((response) => {
            return response.data.result
        })
    }

    /**
     * Returns the overview of the given user's availability of the given week.
     *
     * @param {int} accountId
     * @param {int} week
     * @param {int} year
     * @returns {Promise}
     */
    getAvailabilitiesOfWeek(accountId, week, year) {
        return pmtApi.get('/availabilities/week/' + stringHelper.getYearWeekString(year, week), {
            params: {
                account_id: accountId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityEntries(response.data.result, { nr: week, year })
            })
    }

    /**
     * Returns the result of the given user's availability of the given week.
     *
     * @param {int} accountId
     * @param {int} week
     * @param {int} year
     * @returns {Promise}
     */
    getAvailabilitiesResultOfWeek(accountId, week, year) {
        return pmtApi.get('/availabilities/results/week/' + stringHelper.getYearWeekString(year, week), {
            params: {
                account_id: accountId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityEntries(response.data.result)
            })
    }

    /**
     * Returns the result of the given user's availability of the given date range.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} from
     * @param {Date} to
     * @returns {Promise}
     */
    getAvailabilitiesResultOfDateRange(storeId, accountId, from, to) {
        return pmtApi.get('/availabilities/results/from_date/' + from.toApiFormat() + '/to_date/' + to.toApiFormat(), {
            params: {
                store_id: storeId,
                account_id: accountId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityEntries(response.data.result)
            })
    }

    /**
     * @todo: Temporary method to combine the weeks data into one array of time blocks
     * to simulate a date range normal availability call.
     *
     * This missing data should be fetched by one call or the missing data should
     * be included in the results call (for single events).
     */
    getAvailabilitiesForMonth(accountId, date) {
        const weeks = Vue.moment(date).toCalendarArray()
        const calls = []
        for (let n = 0; n < weeks.length; n++) {
            calls.push(this.getAvailabilitiesOfWeek(accountId, weeks[n][0].isoWeek(), weeks[n][0].isoWeekYear()))
        }
        return Promise.all(calls)
            .then(values => {
                const availabilityData = []
                for (let callNr = 0; callNr < values.length; callNr++) {
                    const callData = values[callNr]
                    for (let n = 0; n < callData.length; n++) {
                        const timeBlock = callData[n]
                        const found = availabilityData.filter(item => item.id === timeBlock.id)
                        if (!found.length) {
                            availabilityData.push(timeBlock)
                        }
                    }
                }
                return availabilityData
            })
    }

    /**
     * Creates a new availability entry.
     *
     * @param {payload} object
     * @returns {Promise} Resolves returns the newly created availability as a time block.
     */
    createAvailabilityEntry(payload) {
        return pmtApi.post('/availabilities', payload).then(response => {
            return availabilityHelper.mapApiAvailabilityEntries([response.data.result], {
                nr: moment(payload.start_date).isoWeek(),
                date: moment(payload.start_date).isoWeekYear(),
            })[0]
        })
    }

    /**
     * Updates an exisiting availability entry.
     *
     * @param {payload} Object
     */
    updateAvailabilityEntry(payload) {
        return pmtApi.put('/availabilities/' + payload.availabilityId, payload).then((response) => {
            return availabilityHelper.mapApiAvailabilityEntries(response.data.result, {
                nr: moment(payload.start_date).isoWeek(),
                date: moment(payload.start_date).isoWeekYear(),
            })[0]
        })
    }

    /**
     * Delete the given availability entry with the given ID, date and store.
     *
     * @param {int} storeId
     * @param {int} availabilityId
     * @param {date} date
     * @returns {Promise}
     */
    deleteAvailabilityEntry(payload) {
        const apiLoad = {
            store_id: payload.storeId,
            date: payload.date.apiFormat(),
            single_instance: true,
        }
        return pmtApi.delete('/availabilities/' + payload.availabilityId, { data: apiLoad }).then((response) => {
            return null
        })
    }

    /**
     * Returns all the availability weeksets of the current user for the given store.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {object|null} params
     * @returns {Promise}
     */
    getAvailabilityWeeksets(storeId, accountId, params) {
        return pmtApi.get('/availabilityWeeksets', {
            params: _.merge({
                store_id: storeId,
                account_id: accountId,
            }, params),
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityWeeksets(response.data.result)
            })
    }

    /**
     * Returns the weekset from the preffered strore.
     *
     * @param {int} storeId
     * @param {int} weeksetId
     * @returns {object}
     */
    getAvailabilityWeekset(storeId, weeksetId) {
        return pmtApi.get('/availabilityWeeksets/' + weeksetId, {
            params: {
                store_id: storeId,
            },
        })
            .then((response) => {
                return availabilityHelper.mapApiAvailabilityWeeksets([response.data.result])[0]
            })
    }

    /**
     * Returns the active weekset for the given date.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} date
     * @return {object}
     */
    getAvailabilityWeeksetByDate(storeId, accountId, date) {
        return this.getAvailabilityWeeksets(storeId, accountId, { date: date.toApiFormat() })
            .then(weeksets => {
                return weeksets[0]
            })
    }

    /**
     * Returns all the active weeksets for the given date.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} date
     * @return {object}
     */
    getWeeklyWeeksets(date) {
        return pmtApi.get('/availabilityWeeksets?limit=10000', {
            params: { date },
        }).then((response) => {
            return availabilityHelper.mapApiAvailabilityWeeksets(response.data.result)
        })
    }

    /**
     * Saves weekset.
     *
     * @param {Object} payload
     * @return {object}
     */
    saveExistingWeekset(payload) {
        return new Promise((resolve, reject) => {
            pmtApi.put(`/availabilityWeeksets/${payload.id}`, payload).then((response) => {
                resolve(response.data.result)
            }).catch(error => {
                reject(error)
            })
        })
    }

    /**
     * creates the weekset.
     *
     * @param {object} payload
     * @return {object}
     */
    createWeekset(payload) {
        return pmtApi.post('/availabilityWeeksets', payload).then((response) => {
            return response.data.result
        }).catch(error => {
            return error
        })
    }

    /**
     * Saves a week set for a single week.
     *
     * @param {object} payload
     */
    saveOneTimeChangeInSet(payload) {
        payload.save_for_one_week = true
        return pmtApi.post('/availabilityWeeksets', payload).then((response) => {
            return response.data.result
        })
    }
}

export default new AvailabilityService()
