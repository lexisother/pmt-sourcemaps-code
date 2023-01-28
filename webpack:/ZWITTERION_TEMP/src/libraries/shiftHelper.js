import Vue from 'vue'
import globalSettings from '../config/global-settings'
import * as moment from '../config/moment'
import schedulingHelper from './schedulingHelper'
import stringHelper from './stringHelper'
import PlanningShift from './planningShift'
Vue.use(moment)
export default {

    variableToHexcode(variable) {
        return getComputedStyle(document.body).getPropertyValue(variable).trim()
    },

    shiftColor(shift, department) {
        const grey = this.variableToHexcode('--grey-80')
        if (shift.lentIn || shift.exchange_store_id || shift.nonProductive) return grey
        if (department) {
            return department.color || department.department_color
        }
        return grey
    },

    shiftStyle(shift, department) {
        const helpers = globalSettings.helpers
        const color = this.shiftColor(shift, department)
        const contrastColor = helpers.getContrastColorFromHex(color, this.variableToHexcode('--grey-140'))
        const nonProductiveBackground = helpers.transparentize(this.variableToHexcode('--grey-100'), 10)
        return {
            '--department-color': color,
            '--secondary-department-color': helpers.transparentize(color, 7),
            '--ternary-department-color': helpers.transparentize(color, 10),
            '--text-color': shift.lentIn || shift.lentOut || shift.nonProductive ? 'white' : contrastColor,
            '--non-productive-background-color': `${nonProductiveBackground}`,
            '--shift-border': helpers.transparentize(color, 35),
        }
    },

    mapShifts(shifts, date, currentStoreId, departments, isShiftReadOnly, exchangeStore, frequencyId) {
        try {
            const fixEndMidnight = (endTime) => {
                const end = Vue.moment(endTime)
                const endsAtMidnight = end.shortTime() === '00:00' || end.shortTime() === '24:00'
                if (endsAtMidnight) {
                    return end.setTime('23:59:59').longApiFormat()
                }
                return end.longApiFormat()
            }
            const shiftsResult = []
            // first we find the not assigned shifts => shifts with no instances
            shifts.forEach((shift, index) => {
                const department = departments.find(d => d.department_id === shift.department_id)
                shift.frequencyId = frequencyId
                shift.from = Vue.moment(shift.start_datetime)
                shift.to = Vue.moment(shift.end_datetime)
                if (!shift.instances?.length && !shift.account_id) {
                    shift.department = department
                    // not assigned shifts
                    shift.key = index
                    shift.end_datetime = fixEndMidnight(shift.end_datetime)
                    shift.guid = stringHelper.newIdShort()
                    shift.readOnly = isShiftReadOnly(shift, date)
                    shift.notAssigned = true
                    shift.account_id = 'not_assigned'
                    shift.indirect_hours = []
                    shiftsResult.push(new PlanningShift(shift))
                } else {
                    if (shift.instances?.length) {
                        shift.notAssigned = false
                        if (shift.store_id !== currentStoreId) {
                            // assigned, lent in shifts
                            shift.department = exchangeStore?.departments?.find(d => d.department_id === shift.department_id) || {}
                            shift.lentIn = true
                            shift.readOnly = true
                        } else {
                            // assigned, current store shifts
                            shift.department = department
                            shift.original = { ...shift }
                            shift.lentOut = Boolean(shift.exchange_store_id)
                        }
                        shift.instances?.forEach((instance, instanceIndex) => {
                            instance.key = index + instanceIndex
                            instance.end_datetime = fixEndMidnight(instance.end_datetime)
                            instance.from = Vue.moment(instance.start_datetime)
                            instance.to = Vue.moment(instance.end_datetime)
                            instance.recurring = Boolean(shift.frequency)
                            instance.calculated = instance.average_calculation || instance.type === 'F'
                            instance.guid = stringHelper.newIdShort()
                            instance.readOnly = isShiftReadOnly(instance, date)
                            instance.nonProductive = shift.type !== 'G' && shift.type !== 'EXCH'
                            instance.nonProductiveSimple = shift.nonProductive && shift.start_datetime === shift.end_datetime
                            instance.overlaps = schedulingHelper.newOverlapScenario()
                            if (instance.recurring) {
                                instance.showRecurringIcon = true
                                const differentStartTime = shift.from.shortTime() !== instance.from.shortTime()
                                const differentEndTime = shift.to.shortTime() !== instance.to.shortTime()
                                if (differentStartTime || differentEndTime) {
                                    instance.showRecurringIcon = false
                                }
                            }
                            shiftsResult.push(new PlanningShift({ ...shift, ...instance }))
                        })
                    } else {
                        shift.department = department
                        shift.key = index
                        shift.end_datetime = fixEndMidnight(shift.end_datetime)
                        shift.from = Vue.moment(shift.start_datetime)
                        shift.to = Vue.moment(shift.end_datetime)
                        shift.recurring = Boolean(shift.frequency)
                        shift.calculated = shift.average_calculation || shift.type === 'F'
                        shift.guid = stringHelper.newIdShort()
                        shift.readOnly = isShiftReadOnly(shift, date)
                        shift.nonProductive = shift.type !== 'G' && shift.type !== 'EXCH'
                        shift.nonProductiveSimple = shift.nonProductive && shift.start_datetime === shift.end_datetime
                        shift.overlaps = schedulingHelper.newOverlapScenario()
                        shift.style = this.shiftStyle(shift, department)
                        if (shift.recurring) {
                            shift.showRecurringIcon = true
                        }
                        shiftsResult.push(new PlanningShift(shift))
                    }
                }
            })
            return shiftsResult.sort((a, b) => {
                let comparison = 0
                if (a.start_datetime > b.start_datetime) {
                    comparison = 1
                } else if (a.start_datetime < b.start_datetime) {
                    comparison = -1
                }
                return comparison
            })
        } catch (error) {
            console.error(error)
            return shifts
        }
    },
}
