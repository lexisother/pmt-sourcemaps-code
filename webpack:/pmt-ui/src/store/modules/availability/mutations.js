import moment from 'moment'
import stringHelper from '../../../libraries/stringHelper'
import Vue from 'vue'

const mutations = {

    setAvailability(state, data) {
        state.availabilityTimeBlocks = data
    },

    setMonthAvailability(state, data) {
        state.availabilityTimeBlocks.push(data)
    },

    emptyAvailability(state) {
        state.availabilityTimeBlocks = []
    },

    setActiveTimeBlock(state, timeBlock) {
        state.activeTimeblock = timeBlock
    },

    resetEditingTimeblockType(state) {
        state.activeTimeblock.type = 'preferred'
    },

    /**
     * Sets all availabilities for Availability Overview grouped by [week-year] and account_id
     * @param {VUEX} state
     * @param {Object} data
     */
    setEmployeesWeekAvailabilities(state, data) {
        Vue.set(state.employeesWeekAvailabilities, `"${data.week}-${data.year}"`, stringHelper.groupBy(data.availabilities, 'account_id'))
    },

    /**
     * Updates an existing availability for an employee for a week
     * @param {VUEX} state
     * @param {Object} data
     */
    UPDATE_EMPLOYEE_WEEK_AVAILABILITY(state, data) {
        const employeeWeekAvailabilities = state.employeesWeekAvailabilities[`"${data.week}-${data.year}"`][data.newTimeBlock.account_id]
        const currentAvailabilityIndex = employeeWeekAvailabilities.findIndex(a => a.availability_id === data.newTimeBlock.availability_id)
        Vue.set(state.employeesWeekAvailabilities[`"${data.week}-${data.year}"`][data.newTimeBlock.account_id], currentAvailabilityIndex, data.newTimeBlock)
    },

    INSERT_EMPLOYEE_WEEK_AVAILABILITY(state, data) {
        const employeeWeekAvailabilities = state.employeesWeekAvailabilities[`"${data.week}-${data.year}"`][data.newTimeBlock.account_id]
        const currentAvailabilityIndex = employeeWeekAvailabilities.findIndex(a => a.availability_id === data.newTimeBlock.availability_id)
        Vue.set(state.employeesWeekAvailabilities[`"${data.week}-${data.year}"`][data.newTimeBlock.account_id], currentAvailabilityIndex, data.newTimeBlock)
    },

    /**
     * Deletes an availability for an employee for a week
     * @param {VUEX} state
     * @param {Object} data
     */
    DELETE_EMPLOYEE_WEEK_AVAILABILITY(state, payload) {
        //
    },

    /**
     * Sets the weekset that should be compared with the grid in Availability Overview
     * @param {VUEX} state
     * @param {Object} weekset
     */
    setComparingWeekset(state, weekset) {
        state.comparingWeekset = weekset
    },

    /**
     * Updates a weekset status from all employees weeksets
     */
    updateEmployeesWeeksetStatus(state, payload) {
        const weeksetIndex = state.employeesWeeksets.findIndex(weekset => {
            return weekset.id === payload.id
        })
        if (weeksetIndex > -1) {
            state.employeesWeeksets[weeksetIndex].status = payload.status
            state.employeesWeeksets[weeksetIndex].employee_comment = payload.employee_comment || state.employeesWeeksets[weeksetIndex].employee_comment
            state.employeesWeeksets[weeksetIndex].manager_comment = payload.manager_comment || state.employeesWeeksets[weeksetIndex].manager_comment
        }
    },

    updateWeeksetStatus(state, payload) {
        const weeksetIndex = state.weeksets.findIndex(weekset => {
            return weekset.id === payload.id
        })
        if (weeksetIndex > -1) state.weeksets[weeksetIndex].status = payload.status
    },

    clearSingleAvailabilities(state) {
        for (let i = 0; i < state.availabilityTimeBlocks.length; i++) {
            if (!state.availabilityTimeBlocks[i].repeat) {
                state.availabilityTimeBlocks.splice(i, 1)
                i--
            } else {
                const created = JSON.parse(JSON.stringify(state.availabilityTimeBlocks[i]))
                created.action = 'imported'
                state.weeksetChanges.unshift(created)
            }
        }
    },

    deleteSingleLocalAvailability(state, payload) {
        for (let i = 0; i < state.availabilityTimeBlocks.length; i++) {
            if (state.availabilityTimeBlocks[i].id === payload.id) {
                const deleted = JSON.parse(JSON.stringify(state.availabilityTimeBlocks[i]))
                if (payload.changeHistory) {
                    deleted.action = 'deleted'
                    state.weeksetChanges.unshift(deleted)
                }
                state.availabilityTimeBlocks.splice(i, 1)
            }
        }
    },

    createSingleLocalAvailability(state, timeBlock) {
        const created = JSON.parse(JSON.stringify(timeBlock))
        created.action = 'created'
        state.weeksetChanges.unshift(created)
    },

    updateSingleLocalAvailability(state, timeBlock) {
        const updated = JSON.parse(JSON.stringify(timeBlock))
        updated.action = 'modified'
        state.weeksetChanges.unshift(updated)
    },

    // TODO: refine this method and enable undo button in edit weekset component
    undoWeeksetChange(state, availability) {
        for (let i = 0; i < state.weeksetChanges.length; i++) {
            if (state.weeksetChanges[i].id === availability.id) {
                if (availability.action === 'created' || availability.id instanceof String) {
                    state.weeksetChanges.splice(i, 1)
                    const createdIndex = state.availabilityTimeBlocks.findIndex(item => item.id === availability.id)
                    state.availabilityTimeBlocks.splice(createdIndex, 1)
                    break
                }
                state.availabilityTimeBlocks.push(availability)
                state.weeksetChanges.splice(i, 1)
            }
        }
    },

    restoreAllAvailabilities(state, payload) {
        if (payload.weeksetId) {
            const weeksetIndex = state.weeksets.findIndex(w => w.id === payload.weeksetId)
            if (weeksetIndex > -1) {
                state.weeksets[weeksetIndex].availabilities = payload.availabilities
            }
            const employeeWeeksetIndex = state.employeesWeeksets.findIndex(w => w.id === payload.weeksetId)
            if (employeeWeeksetIndex > -1) {
                state.employeesWeeksets[employeeWeeksetIndex].availabilities = payload.availabilities
            }
        }
        state.availabilityTimeBlocks = payload.availabilities
        state.weeksetChanges = []
    },

    setWeekSets(state, data) {
        state.weeksets = data
    },

    setEmployeesWeekSets(state, data) {
        state.employeesWeeksets = data
    },

    addEmployeesWeekSets(state, data) {
        state.employeesWeeksets = [...state.employeesWeeksets, ...data]
    },

    setWeekSetsLoading(state, data) {
        state.weeksetsLoading = data
    },

    insertNewWeekSet(state, data) {
        state.weeksets.push(data)
        state.employeesWeeksets.push(data)
    },

    setWeekSet(state, data) {
        state.weekset = data
    },

    setWeeksetAvailability(state, availabilities) {
        state.availabilityWeeksetTimeBlocks = availabilities
    },

    updateEditingWeeksetStartDate(state, date) {
        if (date) {
            date = moment(date)
            state.editingWeekset.start_date = date.apiFormat()
            state.newWeekset.start_date = date.apiFormat()
            state.availabilityTimeBlocks.forEach(availability => {
                const dayOfWeek = moment(availability.date).isoWeekday()
                availability.date = date.set('isoWeekDay', dayOfWeek).toDate()
            })
        }
    },

    updateEmployeeWeeksetStartDate(state, weekset) {
        const weeksetIndex = state.employeesWeeksets.findIndex(w => {
            return w.id === weekset.id
        })
        if (weeksetIndex > -1) {
            state.employeesWeeksets[weeksetIndex].start_date = weekset.start_date
        }
    },

    loadingWeek(state, loading) {
        state.isWeekLoading = loading
    },

    /**
     * Sets loading month variable.
     *
     * @param {bool} state
     * @param loading
     */
    setLoadingMonth(state, loading) {
        state.isMonthLoading = loading
    },

    setEditingWeekSet(state, data) {
        state.editingWeekset = data
    },

    /**
     * @todo move this to DatePicker mutations
     * @param state
     * @param date
     */
    setAvailabilityDatePickerDate(state, date) {
        if (state.availabilityDate === date) {
            return
        }
        state.previousDate = state.availabilityDate
        state.availabilityDate = date
    },

    openPopover(state) {
        state.chooseAvailabilityTypePopoverVisible = false
        state.availabilityPopoverVisible = true
    },

    /**
     * Opens the Popup to choose single or recurring availability
     * @param {VUEX} state
     * @param {Object} payload
     */
    openPopoverChoose(state, payload) {
        state.chooseAvailabilityTypePopoverVisible = true
        state.newWeeksetWeekYear = payload
    },

    /**
     * Closes the opened popover and cleans up
     * @param {VUEX} state
     */
    closePopover(state) {
        state.activeTimeblock = {}
        state.availabilityPopoverVisible = false
        state.chooseAvailabilityTypePopoverVisible = false
        state.availabilityTimeBlocks.forEach(item => {
            item.editing = false
        })
    },

    /**
     * Saves or Deletes the Time Block from VUEX and
     * reinitializes the availability timeblocks from VUEX
     * @param {VUEX} state
     * @param {Object} payload
     */
    availabilityFormReset(state, payload) {
        const placeholderIndex = state.availabilityTimeBlocks.findIndex(item => item.placeholder)
        const existingIndex = state.availabilityTimeBlocks.findIndex(item => item.editing)
        payload = JSON.parse(JSON.stringify(payload))
        if (placeholderIndex > -1) {
            if (payload.saved) {
                if (!payload.isWeekset) {
                    setTimeout(() => {
                        // wait for the animation finish then remove and re-add timeblock
                        state.availabilityTimeBlocks.splice(placeholderIndex, 1)
                        payload.newTimeBlock.placeholder = false
                        payload.newTimeBlock.date = moment(payload.newTimeBlock.date)
                        state.availabilityTimeBlocks.push(payload.newTimeBlock)
                    }, 1000)
                } else {
                    state.availabilityTimeBlocks.splice(placeholderIndex, 1)
                    payload.newTimeBlock.placeholder = false
                    payload.newTimeBlock.editable = false
                    payload.newTimeBlock.id = newId()
                    payload.newTimeBlock.date = moment(payload.newTimeBlock.date)
                    state.availabilityTimeBlocks.push(payload.newTimeBlock)
                }
            } else {
                state.availabilityTimeBlocks[placeholderIndex].type = 'preferred'
                state.availabilityTimeBlocks.splice(placeholderIndex, 1)
            }
        } else if (existingIndex > -1) {
            if (payload.saved) {
                payload.newTimeBlock.date = moment(payload.newTimeBlock.date)
                state.availabilityTimeBlocks[existingIndex] = payload.newTimeBlock
                state.availabilityTimeBlocks[existingIndex].editing = false
            } else if (payload.deleted) {
                return
            } else {
                payload.oldTimeBlock.date = moment(payload.oldTimeBlock.date)
                state.availabilityTimeBlocks[existingIndex] = payload.oldTimeBlock
                state.availabilityTimeBlocks[existingIndex].editing = false
            }
        }
        state.activeTimeblock = {}
    },

    /**
     * Sets globally the employee to be used for availability oprations
     * @param {VUEX} state
     * @param {Number} employeeId
     */
    setAvailabilityEmployee(state, employeeId) {
        state.availabilityEmployeeId = employeeId
    },

    /**
     * Inserts a new timeblock into the grid
     * after checking and setting some props
     * @param {VUEX} state
     * @param {Object} payload
     */
    insertNewTimeBlock(state, payload) {
        if (typeof payload.date !== 'undefined') {
            payload.timeBlock.date = moment(payload.date)
        }
        if (typeof payload.time !== 'undefined') {
            const isDST = typeof moment().detectDaylightSavingsSwitch !== 'undefined' ? moment().detectDaylightSavingsSwitch() : false
            payload.timeBlock.timeFrom = moment(payload.time, 'HH:mm').subtract(1, 'hours').format('HH:mm')
            if (isDST && payload.timeBlock.timeFrom === '02:00') {
                payload.timeBlock.timeTo = '03:00'
            } else {
                payload.timeBlock.timeTo = moment(payload.timeBlock.timeFrom, 'HH:mm').add(1, 'hours').format('HH:mm')
            }
            if (payload.timeBlock.timeTo === '00:00') {
                payload.timeBlock.timeTo = '23:59'
            }
        }
        if (typeof payload.time === 'undefined' && payload.timeBlock.placeholder) {
            /**
             * Adds the new timeblock with the last detected time for day
             * as start time. This is useful for Month Grid, where grid
             * click does not produce a time object
             */
            const timeBlocks = state.availabilityTimeBlocks.filter(item => { return item.repeat === false })
            if (timeBlocks.length) {
                const sortedTimeBlocks = timeBlocks.sort((a, b) => {
                    const a_time = parseInt(a.timeFrom)
                    const b_time = parseInt(b.timeFrom)
                    return a_time > b_time ? 1 : b_time > a_time ? -1 : 0
                })
                payload.timeBlock.timeFrom = sortedTimeBlocks[timeBlocks.length - 1].timeTo
                payload.timeBlock.timeTo = moment().setTime(payload.timeBlock.timeFrom).add(1, 'hours').format('HH:mm')
            }
        }
        if (payload.timeBlock.id > 0) {
            state.availabilityTimeBlocks.find(item => item.id === payload.timeBlock.id).editing = true
        } else {
            payload.timeBlock.repeat = payload.isWeekset
            state.availabilityTimeBlocks.push(payload.timeBlock)
        }
        state.activeTimeblock = payload.timeBlock
    },

    updateActiveTimeBlockTimes(state, time) {
        state.activeTimeblock.timeFrom = time.from
        state.activeTimeblock.timeTo = time.to
    },

    updateNewAvailabilityTimes(state, time) {
        const index = state.availabilityTimeBlocks.findIndex(item => item.placeholder || item.editing)
        if (index > -1) {
            state.availabilityTimeBlocks[index].timeFrom = state.activeTimeblock.timeFrom = time.from
            state.availabilityTimeBlocks[index].timeTo = state.activeTimeblock.timeTo = time.to
        }
    },

    /**
     * Sets the clicked HTML timeblock rectangle into VUEX
     * @param {VUEX} state
     * @param {Object} clickedElementRect
     */
    setNewTimeBlockPosition(state, clickedElementRect) {
        state.newTimeBlockPosition = clickedElementRect // JSON.parse(JSON.stringify(clickedElementRect));
    },

    /**
     * Sets the sidepanel that should be open
     * @param {VUEX} state
     * @param {String} sidePanel
     */
    setActiveSidePanel(state, sidePanel) {
        state.activeSidePanel = sidePanel
    },

    /**
     * Clears availabilities and weeksets,
     * to prepare for another employee filter
     * @param {VUEX} state
     */
    clearAvailabilities(state) {
        state.availabilityTimeBlocks = []
        state.weeksets = []
    },

    /**
     *
     * @param {Vuex} state
     * @param {Object} payload {week: Number, year: Number}
     */
    setNewWeeksetWeekYear(state, payload) {
        state.newWeeksetWeekYear = payload
    },

    /**
     * Clears all Availability State.
     * @param {VUEX} state
     */
    reset(state) {
        // add any other resets needed here
        state.availabilityEmployeeId = 0
        state.availabilityTimeBlocks = []
        state.weeksets = []
    },

    /**
     * Closes all opened popovers
     * @param {VUEX} state
     */
    resetPopovers(state) {
        state.availabilityPopoverVisible = false
        state.chooseAvailabilityTypePopoverVisible = false
    },

}
export default mutations

const newId = () => Math.floor(Math.random() * 100000)
