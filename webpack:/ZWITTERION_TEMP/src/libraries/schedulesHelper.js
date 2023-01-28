import * as moment from '../config/moment'
import timeHelper from '../libraries/timeHelper'
import Vue from 'vue'
import { store } from '../store'
Vue.use(moment)

class ScheduleHelper {
    visibleShiftStatuses = ['final', 'realized', 'plan']
    visibleShiftStatusesEmployee = ['final', 'realized', 'undetermined', 'plan']
    /**
     * Returns the mapped schedule items.
     *
     * @param {Array} schedules
     * @returns {Object}
     */
    mapScheduleResponse(shifts, departments = [], date) {
        const newShifts = []
        shifts.forEach(shift => {
            if (shift.instances?.length) {
                shift.instances.forEach(instance => {
                    let shiftDepartment = departments.find(d => d.department_id === instance.department_id)

                    let exStoreId = null
                    let exStoreName = null
                    if (shift.exchange_store_id) {
                        const exStore = store.getters['planning/EXCHANGE_STORES'](date).find(store => store.store_id === shift.exchange_store_id)
                        exStoreId = exStore.retail_store_number
                        exStoreName = exStore.store_name
                        shiftDepartment = exStore.departments.find(d => d.department_id === instance.department_id)
                    }

                    let isProductive = false
                    if ((instance.type === 'G' || instance.type === 'EXCH')) {
                        isProductive = true
                    }

                    let shiftDuration = null
                    if (!isProductive) {
                        shiftDuration = instance.duration
                    }

                    if (!isProductive) {
                        if (!store.getters['auth/showOnlyWorkHoursWeekschedule']) {
                            newShifts.push({
                                accountId: instance.account_id,
                                scheduleId: instance.shift_id,
                                employeeName: instance.fullname,
                                department: shiftDepartment,
                                departmentId: instance.department_id,
                                duration: shiftDuration,
                                exchStoreId: exStoreId,
                                exchStoreName: exStoreName,
                                isExchangeSchedule: shift.exchange_store_id,
                                status: instance.status,
                                remark: instance.remark,
                                type: instance.type,
                                isProductive: isProductive,
                                ...this.mapScheduleTimes(instance),
                            })
                        }
                    } else {
                        newShifts.push({
                            accountId: instance.account_id,
                            scheduleId: instance.shift_id,
                            employeeName: instance.fullname,
                            department: shiftDepartment,
                            departmentId: instance.department_id,
                            duration: shiftDuration,
                            exchStoreId: exStoreId,
                            exchStoreName: exStoreName,
                            isExchangeSchedule: shift.exchange_store_id,
                            status: instance.status,
                            remark: instance.remark,
                            type: instance.type,
                            isProductive: isProductive,
                            ...this.mapScheduleTimes(instance),
                        })
                    }
                })
            }
        })
        return newShifts
    }

    /**
     * Processes the response of /employeeSearchSchedules and returns the mapped items.
     *
     * @param {Array} schedules
     * @returns {Object}
     */
    mapColleagueSchedulesResponse(schedules) {
        return schedules.map(item => {
            return {
                accountId: item.account_id,
                employeeName: item.employee_name,
                departmentId: item.department_id,
                ...this.mapScheduleTimes(item),
            }
        })
    }

    /**
     * Calculates and formats the dates, times and break of a schedule.
     *
     * @param {Object} item
     *
     * @returns {{break, from, startTime, to, endTime}}
     */
    mapScheduleTimes(item) {
        const from = item ? Vue.moment(item.start_datetime) : null
        const to = item ? Vue.moment(item.end_datetime) : null
        return {
            from: from?.apiFormat(),
            to: to?.apiFormat(),
            startTime: from?.shortTime(),
            endTime: to?.shortTime(),
            break: item?.breaks?.[0]?.duration,
        }
    }

    /**
     * Makes various needed calculations for payroll details
     * @param {Object} {item, payload}
     * @returns {Object}
     */
    mapPayrollDetails({ item, payload }) {
        if (!item || !item[0] || !payload) {
            return {
                details: {},
                days: [],
            }
        }
        const weekPayrollDetails = item[0].period_totals
        const weekPayrollDetailsDays = item[0].day_totals
        // Check what the totals should be, based on the payload.showOnlyWorkHoursWeekschedule permission
        if (payload.showOnlyWorkHoursWeekschedule) {
            weekPayrollDetails.totalBooked = weekPayrollDetails.productive
        } else {
            weekPayrollDetails.totalBooked = weekPayrollDetails.total_booked
        }
        // Check on what the times should be set to, based on payload.minMax
        if (!payload.minMax) {
            weekPayrollDetails.difference = timeHelper.subtractTimes(weekPayrollDetails.totalBooked, payload.contractHours)
        } else {
            if (weekPayrollDetails.totalBooked < payload.contractHours) {
                weekPayrollDetails.difference = timeHelper.subtractTimes(weekPayrollDetails.totalBooked, payload.contractHours)
            }
            if (weekPayrollDetails.totalBooked >= payload.contractHours && weekPayrollDetails.totalBooked <= payload.maxContractHours) {
                weekPayrollDetails.difference = '00:00'
            }
            if (weekPayrollDetails.totalBooked > payload.maxContractHours) {
                weekPayrollDetails.difference = timeHelper.subtractTimes(weekPayrollDetails.totalBooked, payload.maxContractHours)
            }
        }
        return {
            account_id: item[0].account_id,
            details: weekPayrollDetails,
            days: weekPayrollDetailsDays,
        }
    }

    /**
     * Merges and processes current user's schedules and schedules of his/her colleagues.
     *
     * @param {Array} shifts
     * @returns {Object}
     */
    combineDayScheduleData(shifts, departments = [], myShifts, employees) {
        const allShifts = []
        const shiftsNew = shifts.concat(myShifts)

        shiftsNew.forEach(shift => {
            if (shift.instances.length) {
                shift.instances.forEach((instance, i) => {
                    let employeeShifts = allShifts.find(item => item.accountId === instance.account_id)
                    if (!employeeShifts && (employees.find(e => e.account_id === shift.account_id))) {
                        employeeShifts = {
                            accountId: instance.account_id,
                            name: instance.employeeName,
                            shifts: [],
                            earliestStartTime: '23:59',
                        }
                        allShifts.push(employeeShifts)
                    }
                    let isProductive = false
                    if ((instance.type === 'G' || instance.type === 'EXCH')) {
                        isProductive = true
                    } else {
                        shift.instances.splice(i, 1)
                        return
                    }

                    let shiftDuration = null
                    if (!isProductive) {
                        shiftDuration = instance.duration
                    }

                    const shiftDepartment = departments.find(d => d.department_id === instance.department_id) || {}
                    const exStore = {
                        retail_store_number: null,
                        store_name: null,
                        icon: null,
                    }
                    if (shift.exchange_store_id) {
                        // Lending logic
                        const currentStore = store.getters['stores/currentStore']
                        if (shift.exchange_store_id === currentStore.id) {
                            // lent in
                            exStore.retail_store_number = currentStore.storeNumber
                            exStore.store_name = currentStore.name
                            exStore.icon = 'lentInIcon'
                        } else {
                            // lent out
                            return
                        }
                    }

                    if (employees.find(e => e.account_id === shift.account_id)) {
                        const from = Vue.moment(instance.start_datetime).shortTime()
                        let to = Vue.moment(instance.end_datetime).shortTime()

                        if (to === '00:00') {
                            to = '23:59'
                        }
                        if (this.visibleShiftStatuses.includes(instance.status)) {
                            employeeShifts.shifts.push({
                                departmentId: instance.department_id,
                                department: shiftDepartment,
                                startTime: from,
                                endTime: to,
                                break: instance.breaks.length ? instance.breaks[0].duration : null,
                                duration: shiftDuration,
                                isProductive,
                                type: instance.type,
                                status: instance.status,
                                remark: instance.remark,
                                exStore,
                                exchange_store_id: shift.exchange_store_id,
                            })
                        }
                    }

                    if (isProductive && employeeShifts) {
                        if (Vue.moment(instance.start_datetime).shortTime() < employeeShifts.earliestStartTime) {
                            employeeShifts.earliestStartTime = Vue.moment(instance.start_datetime).shortTime()
                        }
                    }
                })
            }
        })
        return allShifts
    }
}

export default new ScheduleHelper()
