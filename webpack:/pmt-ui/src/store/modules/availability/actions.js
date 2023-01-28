import service from '../../../services/AvailabilityService'
import _ from 'lodash'
import pmtApi from '../../../libraries/pmtApi'
import timeBlockHelper from '../../../libraries/timeBlockHelper'
import dateHelper from '../../../libraries/dateHelper'
import timeHelper from '../../../libraries/timeHelper'
import availabilityHelper from '../../../libraries/availabilityHelper'
import moment from 'moment'
import language from '../../../config/language'
import ApiError from '../../../models/ApiError'
import { store } from '../../../store'

let fetchingAvailability = false

const actions = {

    getEmployeesAvailabilitiesForWeek(context, payload) {
        const week = payload.isoWeek()
        const year = payload.isoWeekYear()
        const existingWeek = context.state.employeesWeekAvailabilities[`"${week}-${year}"`]
        if (!existingWeek) {
            return service.getAllWeekAvailabilities(week, year).then(async (result) => {
                const availabilities = result.map(item => {
                    item.icon = timeBlockHelper.getTimeBlockTypeIcon(item)
                    return item
                })
                await context.commit('setEmployeesWeekAvailabilities', { week, year, availabilities })
                return context.state.employeesWeekAvailabilities[`"${week}-${year}"`]
            }).catch(error => {
                throw error
            })
        } else {
            return existingWeek
        }
    },

    /**
     * Gets availability for a week, combining results from availability and availability results call.
     *
     * @returns {Promise}
     */
    getWeekAvailability(context, accountId) {
        if ((accountId || context.rootState.availability.availabilityEmployeeId) && !fetchingAvailability) {
            context.commit('loadingWeek', true)
            fetchingAvailability = true
            accountId = accountId || context.rootState.availability.availabilityEmployeeId
            const selectedDate = moment(context.getters.getSelectedAvailabilityDate)
            service.getAvailabilitiesOfWeek(accountId, selectedDate.isoWeek(), selectedDate.isoWeekYear()).then(values => {
                const timeBlocks = values.map(item => {
                    timeBlockHelper.injectMissingFields(item, values)
                    item.editable = timeBlockHelper.isBlockEditable(item)
                    return item
                })
                context.commit('loadingWeek', false)
                context.commit('setAvailability', timeBlocks)
                fetchingAvailability = false
                return timeBlocks
            }).catch(error => {
                context.commit('loadingWeek', false)
                fetchingAvailability = false
                throw error
            })
        }
    },

    /**
     * Fetches availability results for a month.
     *
     * @returns Promise
     */
    getAvailabilityForMonth(context, selectedDate) {
        if (context.rootState.availability.availabilityEmployeeId) {
            context.commit('setLoadingMonth', true)
            context.commit('emptyAvailability')
            const accountId = context.rootState.availability.availabilityEmployeeId
            const weeks = selectedDate.toCalendarArray('month')
            const calls = []
            for (let n = 0; n < weeks.length; n++) {
                calls.push(service.getAvailabilitiesOfWeek(accountId, weeks[n][0].isoWeek(), weeks[n][0].isoWeekYear()))
            }
            return Promise.all(calls).then(values => {
                const availabilityData = []
                for (let callNr = 0; callNr < values.length; callNr++) {
                    const callData = values[callNr]
                    for (let n = 0; n < callData.length; n++) {
                        const timeBlock = callData[n]
                        const found = availabilityData.filter(item => item.id === timeBlock.id)
                        if (!found.length) {
                            timeBlock.editable = timeBlockHelper.isBlockEditable(timeBlock)
                            context.commit('setMonthAvailability', timeBlock)
                        }
                    }
                }
            }).finally(() => {
                context.commit('setLoadingMonth', false)
            })
        }
    },

    /**
     * Updates an existing availability entry.
     *
     * @param {int} entryId
     * @param {int} storeId
     * @param {date} date
     * @param {string} timeFrom
     * @param {string} timeTo
     * @param {string} type
     * @param {string|null} travelBefore
     * @param {string|null} travelAfter
     */
    update({ commit }, { entryId, storeId, date, timeFrom, timeTo, type, travelBefore = null, travelAfter = null }) {
        const week = dateHelper.getWeekNumber(date)

        // TODO these can be collected directly from the store if updated correctly from components
        const apiLoad = {
            store_id: storeId,
            date: date.toApiFormat(),
            time_from: timeFrom,
            time_to: timeTo,
            type: type,
            single_instance: true,
        }

        if (!!travelAfter || !!travelBefore) {
            apiLoad.travel_before = travelBefore
            apiLoad.travel_after = travelAfter
        }

        if (type === 'school') {
            apiLoad.lesson_hours = timeHelper.subtractTimeStrings(timeTo, timeFrom)
        }

        return new Promise((resolve, reject) => {
            pmtApi.put('/availabilities/' + entryId, apiLoad).then((response) => {
                const result = availabilityHelper.mapApiAvailabilityEntries([response.data.result], { nr: week.nr, year: week.year })[0]
                // commit('setOnDateRange', result); TODO ... update local availability?
                resolve(result)
            }, error => {
                reject(error)
            })
        })
    },

    /**
     * Delete the given availability entry with the given ID, date and store.
     *
     * @param {int} storeId
     * @param {int} availabilityId
     * @param {date} date
     * @returns {Promise}
     */
    delete({ commit }, { storeId, availabilityId, date }) {
        const apiLoad = {
            store_id: storeId,
            date: date.toApiFormat(),
            single_instance: true,
        }
        return new Promise((resolve, reject) => {
            pmtApi.delete('/availabilities/' + availabilityId, { data: apiLoad }).then((response) => {
                const result = response.data.result
                // commit('setOnDateRange', result); TODO ... delete local availability?
                resolve(result)
            }, error => {
                reject(error)
            })
        })
    },

    /**
     * Returns all the availability weeksets of the current user for the given store.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {object|null} params
     * @returns {Promise}
     */
    getWeeksets(context, employeeId) {
        if (context.rootState.availability.availabilityEmployeeId || employeeId) {
            context.commit('setWeekSetsLoading', true)
            return pmtApi.get('/availabilityWeeksets', {
                params: {
                    account_id: context.rootState.availability.availabilityEmployeeId || employeeId,
                },
            }).then((response) => {
                let result = availabilityHelper.mapApiAvailabilityWeeksets(response.data.result)
                result = _.orderBy(result, 'account_id', 'desc')
                context.commit('setWeekSets', result)
                context.commit('setWeekSetsLoading', false)
                return result
            }, error => {
                context.commit('setWeekSetsLoading', false)
                context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
            })
        }
    },

    /**
     * Returns all the availability weeksets of the current user for the given store.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {object|null} params
     * @returns {Promise}
     */
    getWeeksetsByStatus(context, employeeId) {
        if (context.rootState.availability.availabilityEmployeeId || employeeId) {
            context.commit('setWeekSetsLoading', true)
            return pmtApi.get('/availabilityWeeksets', {
                params: {
                    account_id: context.rootState.availability.availabilityEmployeeId || employeeId,
                },
            }).then((response) => {
                let result = availabilityHelper.mapApiAvailabilityWeeksets(response.data.result)
                result = _.orderBy(result, 'account_id', 'desc')
                context.commit('setWeekSets', result)
                context.commit('setWeekSetsLoading', false)
                return result
            }, error => {
                context.commit('setWeekSetsLoading', false)
                context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
            })
        }
    },

    getEmployeesWeeksets(context, payload) {
        const params = {
            status: payload.status,
        }
        if (payload.status === 'pending') {
            context.commit('setWeekSetsLoading', true)
        } else {
            // only call api with date param on denied and approved requests to limit the response
            params.date = moment().apiFormat()
        }
        return pmtApi.get('/availabilityWeeksets', { params }).then((response) => {
            let result = availabilityHelper.mapApiAvailabilityWeeksets(response.data.result)
            result = _.orderBy(result, 'start_date', 'desc')
            if (payload.status === 'pending') {
                context.commit('setEmployeesWeekSets', result)
                context.commit('setWeekSetsLoading', false)
            } else if (payload.status !== 'pending') {
                context.commit('addEmployeesWeekSets', result)
            }
            return result
        }, error => {
            context.commit('setWeekSetsLoading', false)
            context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
        })
    },

    /**
     * Fills grid with blocks from week set.
     *
     * @param context
     * @param data
     */
    updateEditingWeekSet(context, data) {
        const timeBlocks = data.availabilities.map(item => {
            timeBlockHelper.injectMissingFields(item, data.availabilities)
            if ((!!item.editable && (!item.date ? item.date.setTimeFromString(item.timeFrom) : item.start_date < new Date())) ||
                (!!item.editable && !!item.repeat)) {
                item.editable = false
            }
            return item
        })
        context.commit('setEditingWeekSet', { ...data })
        context.commit('setAvailability', timeBlocks)
    },

    /**
     * Returns the weekset by id.
     *
     * @param {int} weeksetId
     * @returns {object}
     */
    getWeekset(context, weeksetId) {
        return pmtApi.get('/availabilityWeeksets/' + weeksetId).then((response) => {
            const result = availabilityHelper.mapApiAvailabilityWeeksets([response.data.result])[0]
            context.commit('setEditingWeekSet', result)
            context.commit('setAvailability', result.availabilities)
            return response.data.result
        })
    },

    /**
     * Returns the active weekset for the given date.
     *
     * @param {int} storeId
     * @param {int} accountId
     * @param {Date} date
     * @return {object}
     */
    getWeeksetByDate(context, account_id) {
        return new Promise((resolve, reject) => {
            pmtApi.get('/availabilityWeeksets', {
                params: {
                    account_id: account_id,
                    status: 'pending',
                },
            }).then((response) => {
                resolve(response.data.result)
            }, error => {
                reject(error)
            })
        })
    },

    async submitAvailabilityForm(context, payload) {
        const timeBlock = payload.timeBlock
        let availabilityEntryPromise
        let employee_id = 0
        if (context.state.availabilityEmployeeId) {
            employee_id = context.state.availabilityEmployeeId
        } else {
            employee_id = context.rootState.auth.user.account_id
        }
        const result = {}
        const apiLoad = {
            account_id: employee_id,
            start_date: timeBlock.date.apiFormat(),
            time_from: timeBlock.timeFrom,
            time_to: timeBlock.timeTo,
            type: timeBlock.type.toLowerCase(),
            day: timeBlock.date.isoWeekday(),
            repeat: 0,
            pattern: 'single',
        }
        if (timeBlock.type === 'school') {
            apiLoad.travel_before = timeBlock.travel.before
            apiLoad.travel_after = timeBlock.travel.after
            apiLoad.lesson_hours = payload.duration
        }
        if (!timeBlock.placeholder) {
            apiLoad.availabilityId = timeBlock.id
            availabilityEntryPromise = service.updateAvailabilityEntry(apiLoad)
            result.action = 'update'
        } else {
            availabilityEntryPromise = service.createAvailabilityEntry(apiLoad)
            result.action = 'create'
        }
        await availabilityEntryPromise.then((newTimeBlock) => {
            result.newTimeBlock = newTimeBlock
            const { year, week } = timeBlock.date.weekYearObject()
            const existingWeekAvailabilities = context.state.employeesWeekAvailabilities[`"${week}-${year}"`]
            if (existingWeekAvailabilities) {
                // force another api fetch for the timeblocks week and year if going to availability overview, when creating a single availability
                // this is valid only in cases when availability overview was already visited for the same week in the current session
                delete context.state.employeesWeekAvailabilities[`"${week}-${year}"`]
            }
            try {
                // added try / catch to not break current availability functionality,
                // but this should not break any existing feature.
                // used to automatically update the VUEX store availabilities
                // so that they are automatically displayed on other pages as well (ex: new planning page)
                if (result.action === 'update') {
                    context.commit('UPDATE_EMPLOYEE_WEEK_AVAILABILITY', { ...result, ...week, ...year })
                } else if (result.action === 'created') {
                    context.commit('INSERT_EMPLOYEE_WEEK_AVAILABILITY', { ...result, ...week, ...year })
                }
            } catch (error) {
                console.warn(error)
            }
        }).catch((error) => {
            throw error
        })
        return result
    },

    /**
     * Gathers data for set we are changing with the modified block
     * and then saves the set for only selected week.
     *
     * @param context
     * @param payload
     */
    saveOneTimeChangeInSet(context, payload) {
        const timeBlock = payload.time_block
        // Get set from which this takes part.
        let set = context.getters.getWeeksetById(timeBlock.availability_weekset_id)
        if (!set) {
            context.commit('SET_SNACKBAR', { message: language.t('forms.availabilityEntry.singleWeekMsg.changeFailed'), error: true }, { root: true })
            return
        }
        set = availabilityHelper.processPayloadForOneTimeSet(set, timeBlock)
        return service.saveOneTimeChangeInSet(set).then(() => {
            if (payload.mode === 'month') {
                context.dispatch('getAvailabilityForMonth', moment(payload.time_block.date))
            } else {
                context.dispatch('getWeekAvailability', set.account_id)
            }
            context.dispatch('getWeeksets', set.account_id)
            context.commit('SET_SNACKBAR', { message: language.t('forms.availabilityEntry.singleWeekMsg.changeSaved'), success: true }, { root: true })
        }).catch((error) => {
            context.commit('SET_SNACKBAR', { message: error.message, error: true }, { root: true })
            throw error
        })
    },

    deleteAvailabilityEntry(context, payload) {
        return service.deleteAvailabilityEntry(payload).then((result) => {
            context.commit('DELETE_EMPLOYEE_WEEK_AVAILABILITY', { availabilityId: payload.availabilityId, ...payload.date.weekYearObject() })
            context.commit('SET_SNACKBAR', {
                message: language.t('pages.baseAvailability.confirmTimeBlockDeletion.deleted'),
                success: true,
            }, { root: true })
        }).catch((error) => {
            throw error
        })
    },

    saveExistingWeekset(context, payload) {
        return new Promise((resolve, reject) => {
            const newPayload = {
                id: payload.id,
                start_date: payload.start_date,
                weekset_name: payload.weekset_name,
                employee_comment: payload.employee_comment,
                status: payload.status,
                availabilities: payload.availabilities,
            }
            if (store.getters['auth/canEditOthersAvailabilities']) {
                newPayload.manager_comment = payload.manager_comment
            }

            service.saveExistingWeekset(newPayload).then((response) => {
                if (response instanceof ApiError) {
                    context.commit('SET_SNACKBAR', { message: response.message, error: true }, { root: true })
                    reject(response)
                }
                if (payload.approveAll) {
                    resolve(response)
                }
                let result
                if (response.length) {
                    result = availabilityHelper.mapApiAvailabilityWeeksets(response)
                    context.commit('setWeekSets', result)
                } else {
                    result = availabilityHelper.mapApiAvailabilityWeeksets([response])[0]
                    if (!payload.approveRejectDeny) {
                        context.commit('setEditingWeekSet', result)
                        context.commit('setAvailability', result.availabilities)
                    }
                }
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    createWeekset(context, payload) {
        return new Promise((resolve, reject) => {
            service.createWeekset(payload).then((response) => {
                if (response instanceof ApiError) {
                    context.commit('SET_SNACKBAR', { message: response.message, error: true }, { root: true })
                    reject(response)
                }
                const result = availabilityHelper.mapApiAvailabilityWeeksets([response])[0]
                context.commit('insertNewWeekSet', result)
                resolve(result)
            }).catch((error) => {
                reject(error)
            })
        })
    },

    /* This api call is not used in the employee part of vue anymore. Will leave it here for manager part where we will use this api call */
    /**
     * Updates all pending weeksets statuses as approved
     * @param {VUEX} context
     */
    approveAll(context) {
        const pendingWeeksets = context.state.employeesWeeksets.filter(item => item.status === 'pending')
        const ids = []
        pendingWeeksets.forEach(item => {
            ids.push(item.id)
        })
        return context.dispatch('saveExistingWeekset', {
            id: ids.join(','),
            status: 'approved',
            approveRejectDeny: true,
            approveAll: true,
        }).then(result => {
            context.state.employeesWeeksets.forEach(item => {
                if (item.status === 'pending') {
                    item.status = 'approved'
                }
            })
            return result
        })
    },
}

export default actions
