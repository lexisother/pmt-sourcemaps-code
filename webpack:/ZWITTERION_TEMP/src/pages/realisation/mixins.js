import { mapState, mapMutations } from 'vuex'
import schedulingHelper from '@/libraries/schedulingHelper'
import timeRegistrationsHelper from '@/pages/realisation/time-registrations/resources/timeRegistrationsHelper'
import _ from 'lodash'

export default {
    computed: {
        ...mapState('realisation/timeRegistrations', ['timeRegistrations']),
    },
    methods: {
        ...mapMutations('realisation/timeRegistrations', [
            'UPDATE_REALISATION',
            'UPDATE_EMPLOYEE_TIME_REGISTRATION',
        ]),
        departmentNameAbbreviation (department) {
            return schedulingHelper.departmentAbbreviation(department)
        },
        shiftInfo (shift) {
            let output = `<strong>
                ${shift?.start_datetime ? this.$moment(shift.start_datetime).format('HH:mm') : '...'} -
                ${shift?.end_datetime ? this.$moment(shift.end_datetime).format('HH:mm') : '...'}
            </strong>`
            if (shift?.break_length) {
                output += `| ${shift.break_length}`
            }
            if (shift?.department_shortname) {
                output += ` <span class="department">${shift.department_shortname}</span>`
            }
            return output
        },
        shiftIsLongerThanBreak (realisation) {
            if (!realisation) return false
            const from = this.$moment(realisation.time_from)
            const to = this.$moment(realisation.time_to)
            const shiftDuration = this.$moment.duration(to.diff(from))
            const breakDuration = this.$moment.duration(realisation.break, 'HH:mm')
            if (breakDuration.asMinutes() < shiftDuration.asMinutes()) {
                return true
            }
            return false
        },
        handleInlineInput (event, localRealisation, realisationIndex) {
            const orgRealisation = JSON.parse(JSON.stringify(localRealisation))
            let realisation = JSON.parse(JSON.stringify(localRealisation))
            // update realisation
            realisation[event.identifier] = event.value
            // set new total time
            const from = this.$moment(realisation.time_from)
            const to = this.$moment(realisation.time_to)
            realisation.total_time = this.realisationTotalTime(from, to, realisation.break)

            this.UPDATE_REALISATION({ accountId: this.accountId, realisationIndex, realisation })

            if (from.isBefore(to)) {
                // from and to times are correct
                if (this.realisationHasOverlap(realisation, realisationIndex)) {
                    // overlap found
                    // show danger and headshake animation for one second to indicate something was not correct
                    this.inputErrorField = `${event.identifier}-${realisationIndex}`
                    // change start or end time in order to eliminate overlap
                    this.$nextTick(() => {
                        const correctedRealisation = this.adjustRealisationIfOverlaps(orgRealisation, realisation, realisationIndex)
                        this.validateRealisation(correctedRealisation, realisationIndex)
                    })
                } else if (this.indirectTasksDurationExceedsTotalTime(realisation)) {
                    // indirect tasks or break exceed realisation total time
                    // show danger and headshake animation for one second to indicate something was not correct
                    this.inputErrorField = `${event.identifier}-${realisationIndex}`
                    // revert to original realisation
                    this.$nextTick(() => {
                        this.validateRealisation(orgRealisation, realisationIndex)
                    })
                } else {
                    this.$nextTick(() => {
                        this.validateRealisation(realisation, realisationIndex)
                    })
                }
            } else {
                // from and to times are not correct
                // show danger and headshake animation for one second to indicate something was not correct
                this.inputErrorField = `${event.identifier}-${realisationIndex}`
                // revert to original realisation
                this.$nextTick(() => {
                    this.validateRealisation(orgRealisation, realisationIndex)
                })
            }

            setTimeout(() => {
                // remove danger state
                this.inputErrorField = null
            }, 1000)
        },
        handleDepartmentSelection (department, item, index) {
            const realisation = JSON.parse(JSON.stringify(item))
            realisation.department_id = department.department_id
            this.validateRealisation(realisation, index)
        },
        adjustRealisationIfOverlaps (orgRealisation, realisation, realisationIndex) {
            let timeFromHasChanged = true
            if (this.$moment(orgRealisation?.time_to).diff(this.$moment(realisation?.time_to), 'minute')) {
                timeFromHasChanged = false
            }
            const employeeRealisations = this.timeRegistrations.find(o => o.account_id === this.accountId).realisation
            if (employeeRealisations.length) {
                for (let n = 0; n < employeeRealisations.length; n++) {
                    if (n !== realisationIndex) {
                        if (this.isOverlapping(realisation, employeeRealisations[n])) {
                            const otherFrom = this.$moment(employeeRealisations[n].time_from)
                            const otherTo = this.$moment(employeeRealisations[n].time_to)

                            if (this.$moment(realisation?.time_from).isBefore(otherTo) && otherFrom.isBefore(this.$moment(realisation?.time_to))) {
                                // adjust realisation in order to make it consecutive
                                if ((this.$moment(realisation.time_from).isSameOrAfter(otherFrom, 'minute') && timeFromHasChanged) ||
                                    (this.$moment(realisation.time_to).isSameOrAfter(otherTo, 'minute') && !timeFromHasChanged)) {
                                    // place realisation after existing
                                    realisation.time_from = otherTo.format('YYYY-MM-DD HH:mm')
                                } else {
                                    // place realisation after before
                                    realisation.time_to = otherFrom.format('YYYY-MM-DD HH:mm')
                                }
                            }
                        }
                    }
                }
            }
            return realisation
        },
        isOverlapping (shift, compareShift) {
            if (!shift || !compareShift) return false
            const shiftFrom = this.$moment(shift.time_from)
            const shiftTo = this.$moment(shift.time_to)
            const compareShiftFrom = this.$moment(compareShift.time_from)
            const compareShiftTo = this.$moment(compareShift.time_to)
            if ((shiftFrom.isSameOrAfter(compareShiftFrom, 'minute') && shiftFrom.isBefore(compareShiftTo, 'minute')) ||
                (shiftTo.isAfter(compareShiftFrom, 'minute') && shiftTo.isSameOrBefore(compareShiftTo, 'minute')) ||
                (shiftFrom.isSameOrBefore(compareShiftFrom, 'minute') && shiftTo.isSameOrAfter(compareShiftTo, 'minute'))) {
                return true
            }
            return false
        },
        validateRealisation (realisation, realisationIndex) {
            realisation = timeRegistrationsHelper.updateTotalTime(realisation)
            this.UPDATE_REALISATION({ accountId: this.accountId, realisationIndex, realisation })
        },
        realisationHasOverlap (realisation, realisationIndex) {
            const employeeRealisations = this.timeRegistrations.find(o => o.account_id === this.accountId).realisation
            if (employeeRealisations.length) {
                for (let n = 0; n < employeeRealisations.length; n++) {
                    if (n !== realisationIndex) {
                        if (this.isOverlapping(realisation, employeeRealisations[n])) {
                            return true
                        }
                    }
                }
            }
            return false
        },
        breakAndTotalTimeDeviation (employeeTimeRegistration) {
            const schedulesTotalTime = this.$moment.duration(timeRegistrationsHelper.sumTimes(employeeTimeRegistration.schedules, 'total_time')).asMinutes()
            const realisationTotalTime = this.$moment.duration(timeRegistrationsHelper.sumTimes(employeeTimeRegistration.realisation, 'total_time')).asMinutes()
            const schedulesTotalBreak = this.$moment.duration(timeRegistrationsHelper.sumTimes(employeeTimeRegistration.schedules, 'break')).asMinutes()
            const realisationTotalBreak = this.$moment.duration(timeRegistrationsHelper.sumTimes(employeeTimeRegistration.realisation, 'break')).asMinutes()

            const totalTimeDeviation = Math.abs(realisationTotalTime - schedulesTotalTime)
            const totalBreakDeviation = Math.abs(realisationTotalBreak - schedulesTotalBreak)

            const totalTimePrefix = realisationTotalTime === schedulesTotalTime ? '' : realisationTotalTime > schedulesTotalTime ? '+' : '-'
            const totalBreakPrefix = realisationTotalBreak === schedulesTotalBreak ? '' : realisationTotalBreak > schedulesTotalBreak ? '+' : '-'

            return {
                totalTime: `${totalTimePrefix}${this.$moment.duration(totalTimeDeviation, 'minutes').format('HH:mm')}`,
                break: `${totalBreakPrefix}${this.$moment.duration(totalBreakDeviation, 'minutes').format('HH:mm')}`,
            }
        },
        realisationTotalTime (from, to, brk) {
            const shiftSpread = this.$moment.duration(to.diff(from))
            const breakDuration = this.$moment.duration(brk, 'HH:mm')

            return this.$moment.duration({ minutes: shiftSpread.asMinutes() - breakDuration.asMinutes() }).format('HH:mm')
        },
        indirectTasksDuration (indirectTasks) {
            let duration = 0
            indirectTasks?.forEach(task => {
                duration += this.$moment.duration(task.duration).asMinutes()
            })
            return duration
        },
        indirectTasksDurationExceedsTotalTime (realisation) {
            const from = this.$moment(realisation.time_from)
            const to = this.$moment(realisation.time_to)
            const totalTime = this.realisationTotalTime(from, to, realisation.break)
            const totalTimeAsMinutes = this.$moment.duration(totalTime).asMinutes()

            if (this.indirectTasksDuration(realisation.indirect_hours) > totalTimeAsMinutes) {
                return true
            }
            return false
        },
        /**
         * Check if all mentioned unused indirect hours are assigned to realisations now
         * And if so, clear unused_indirect_hours property
         */
        updateUnusedIndirectHours (employeeTimeRegistration, realisation) {
            const unusedIndirectHours = employeeTimeRegistration.unused_indirect_hours
            if (!unusedIndirectHours) return
            if (_.isEqual(realisation.indirect_hours, unusedIndirectHours.indirect_hours)) {
                // indirect hours assigned realisation are same as unused indirect hours
                employeeTimeRegistration.unused_indirect_hours = null
            } else {
                // more unused indirect hours than assigned to realisation
                const realisationIndirectHourIds = realisation.indirect_hours.map(ih => ih.indirect_task_id)
                const leftIndirectHours = unusedIndirectHours.indirect_hours.filter(ih => !realisationIndirectHourIds.includes(ih.indirect_task_id))
                // non-assigned indirect task must stay in unused_indirect_task property
                employeeTimeRegistration.unused_indirect_hours.indirect_hours = leftIndirectHours
            }
            this.UPDATE_EMPLOYEE_TIME_REGISTRATION(employeeTimeRegistration)
        },
    },
}
