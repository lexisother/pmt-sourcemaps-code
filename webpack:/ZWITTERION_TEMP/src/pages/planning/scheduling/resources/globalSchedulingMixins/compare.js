export default {
    computed: {
        compare () {
            return (a, b) => {
                let comparison = 0
                if (a > b) {
                    comparison = 1
                } else if (a < b) {
                    comparison = -1
                }
                return comparison
            }
        },

        compareName () {
            return (a, b) => {
                const aName = a.name || ''
                const bName = b.name || ''
                return aName.localeCompare(bName, this.$i18n.locale, { sensitivity: 'base' })
            }
        },

        compareFirstName () {
            return (a, b) => {
                const aName = a.details?.employee_first_name || ''
                const bName = b.details?.employee_first_name || ''
                return aName.localeCompare(bName, this.$i18n.locale, { sensitivity: 'base' })
            }
        },

        compareLastName () {
            return (a, b) => {
                const aName = a.details?.employee_last_name || ''
                const bName = b.details?.employee_last_name || ''
                return aName.localeCompare(bName, this.$i18n.locale, { sensitivity: 'base' })
            }
        },

        compareStartTime () {
            return (a, b) => {
                if (a.shifts?.[0]?.isNew || b.shifts?.[0]?.isNew) return 0
                const dayShift = (shift) => {
                    return !this.isDayView || this.$moment(shift.start_datetime).apiFormat() === this.SELECTED_DATE.apiFormat()
                }
                const firstShifts = a.shifts.filter(s => !s.nonProductive)
                const secondShifts = b.shifts.filter(s => !s.nonProductive)
                const firstDayOrWeekShift = firstShifts.find(s => dayShift(s)) || {}
                const secondDayOrWeekShift = secondShifts.find(s => dayShift(s)) || {}
                const startA = firstDayOrWeekShift.start_datetime
                const startB = secondDayOrWeekShift.start_datetime
                return this.compare(startA, startB)
            }
        },
        compareLpgu () {
            return (a, b) => {
                const lpguA = a.details?.labor_cost || 0
                const lpguB = b.details?.labor_cost || 0
                return this.compare(lpguA, lpguB)
            }
        },

        compareOtherColumns () {
            return (a, b, sortBy) => {
                const hasSortProp = (employee) => {
                    return typeof employee.getSort !== 'undefined' && typeof employee.getSort(sortBy) !== 'undefined'
                }
                const first = hasSortProp(a) ? a.getSort(sortBy) : a[sortBy]
                const second = hasSortProp(b) ? b.getSort(sortBy) : b[sortBy]
                return this.compare(first, second)
            }
        },

        compareRemarks () {
            return (a, b) => {
                const remarks = (employee) => {
                    if (this.isDayView) {
                        return employee.dayRemark(this.SELECTED_DATE, this.DEPARTMENT_STATUS_HISTORY_ID) ? 1 : 0
                    } else {
                        return employee.allRemarks(this.DEPARTMENT_STATUS_HISTORY_ID).length
                    }
                }
                return this.compare(remarks(a), remarks(b))
            }
        },

        compareContractType () {
            return (a, b) => {
                const ctA = a.contract?.contract_type || 0
                const ctB = b.contract?.contract_type || 0
                return this.compare(ctA, ctB)
            }
        },

        compareContractHours () {
            return (a, b) => {
                const ctA = a.contract?.contractHours || 0
                const ctB = b.contract?.contractHours || 0
                return this.compare(ctA, ctB)
            }
        },

        comparePlannedHours () {
            return (a, b) => {
                const plannedA = a.plannedMinutes + a.plannedMinutesNonProductive
                const plannedB = b.plannedMinutes + b.plannedMinutesNonProductive
                return this.compare(plannedA, plannedB)
            }
        },

        compareProductiveHours () {
            return (a, b) => {
                const plannedA = a.plannedMinutes
                const plannedB = b.plannedMinutes
                return this.compare(plannedA, plannedB)
            }
        },

        compareNonProductiveHours () {
            return (a, b) => {
                const plannedA = a.plannedMinutesNonProductive
                const plannedB = b.plannedMinutesNonProductive
                return this.compare(plannedA, plannedB)
            }
        },

        compareContractDeviation () {
            return (a, b) => {
                const identifier = this.SHOW_SENT_SCHEDULES ? 'deviationSentShifts' : 'deviation'
                const devA = a[identifier]
                const devB = b[identifier]
                return this.compare(devA, devB)
            }
        },

        compareCao () {
            return (a, b) => {
                const caoA = a.rank
                const caoB = b.rank
                return this.compare(caoA, caoB)
            }
        },

        compareCheckedEmployee () {
            return (a, b) => {
                const plannedA = a.getIsChecked()
                const plannedB = b.getIsChecked()
                return this.compare(plannedA, plannedB)
            }
        },
    },
}
