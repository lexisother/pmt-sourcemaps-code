import { mapGetters, mapActions } from 'vuex'

export default {
    data () {
        return {
            deleteError: false,
        }
    },
    computed: {
        ...mapGetters('auth', [
            'CAN_MANAGE_INDIRECT_HOURS',
            'CAN_READ_INDIRECT_HOURS_OR_TASKS',
        ]),
        indirectTaskTypes () {
            return this.weekStoreData.indirect_tasks
        },
        shiftIndirectHours () {
            return shift => {
                if (!shift) return []
                return shift.indirect_hours || []
            }
        },
        shiftIndirectHoursDuration () {
            return shift => {
                let indirectHoursDuration = 0
                const hours = this.shiftIndirectHours(shift).filter(h => !h.toDelete)
                for (let i = 0; i < hours.length; i++) {
                    indirectHoursDuration += this.$moment.duration(hours[i].duration).asMinutes()
                }
                return indirectHoursDuration
            }
        },
        canAddMoreIndirectHoursOnShift () {
            return (employee, shift) => {
                const indirectHoursDuration = this.shiftIndirectHoursDuration(shift)
                return indirectHoursDuration < employee.shiftDuration(shift)
            }
        },

        indirectHoursExceedShift () {
            return (employee, shift) => {
                const indirectHoursDuration = this.shiftIndirectHoursDuration(shift)
                return indirectHoursDuration > employee.shiftDuration(shift)
            }
        },
        indirectHoursToAdd () {
            return shift => {
                const hours = this.shiftIndirectHours(shift).filter(h => !h.toDelete)
                return hours.filter(t => t.isNew && t.indirect_task_id && t.duration && t.duration !== '00:00')
            }
        },
        indirectHoursToChange () {
            return (shift, originalIndirectHours) => {
                const hours = this.shiftIndirectHours(shift)
                return hours.filter(hour => {
                    return originalIndirectHours.find(t => t.id === hour.id && (t.indirect_task_id !== hour.indirect_task_id || t.duration !== hour.duration))
                })
            }
        },
        hasIndirectHoursCountChanges () {
            return (shift, originalIndirectHours) => {
                const hours = this.shiftIndirectHours(shift).filter(h => !h.toDelete)
                let differentHours = false
                if (hours.length !== originalIndirectHours.length) {
                    differentHours = true
                }
                return differentHours
            }
        },
        hasIndirectHoursChanges () {
            return (shift, originalIndirectHours) => {
                const hours = this.shiftIndirectHours(shift).filter(h => !h.toDelete)
                let hasChanges = false
                for (let i = 0; i < hours.length; i++) {
                    const hour = hours[i]
                    const originalHour = originalIndirectHours.find(h => h.guid === hour.guid)
                    if (hour.isNew) {
                        hasChanges = hour.indirect_task_id && hour.duration && hour.duration !== '00:00'
                    } else {
                        if (originalHour) {
                            const differentDuration = originalHour.duration !== hour.duration
                            const differentTaskType = originalHour.indirect_task_id !== hour.indirect_task_id
                            hasChanges = differentDuration || differentTaskType
                        }
                    }
                    if (hasChanges) break
                }
                return hasChanges
            }
        },
    },
    methods: {
        ...mapActions('planning', [
            'getIndirectTasks',
            'addIndirectHours',
            'deleteIndirectHours',
            'changeIndirectHours',
        ]),
        ...mapActions('scheduling', ['getIndirectTaskTypes']),

        async updateShiftIndirectHoursInstanceId ({ shift, employee, newInstanceId }) {
            const hours = shift.indirect_hours
            if (hours) {
                hours.forEach(hour => {
                    hour.shift_instance_id = newInstanceId
                })
            }
            await employee.updateShift(shift)
            return shift
        },

        async removeDeletedIndirectHours (shift, employee) {
            const shiftHours = shift.indirect_hours
            if (shiftHours.length) {
                shiftHours.forEach((h, i) => {
                    if (h.toDelete) {
                        shiftHours.splice(i, 1)
                    }
                })
            }
            await employee.updateShift(shift)
            return shift
        },

        async addLocalIndirectHours (shift, employee, hour) {
            shift.indirect_hours.push(hour)
            await employee.updateShift(shift)
            return shift
        },

        async updateIndirectHour (shift, employee, hour) {
            const existingHourIndex = shift.indirect_hours.findIndex(h => h.guid === hour.guid)
            if (existingHourIndex > -1) {
                if (hour.isNew && hour.toDelete) {
                    shift.indirect_hours.splice(existingHourIndex, 1)
                } else {
                    shift.indirect_hours[existingHourIndex] = hour
                }
            }
            await employee.updateShift(shift)
            return shift
        },

        indirectTaskType (id) {
            return this.indirectTaskTypes.find(it => it.id === id)
        },

        resetEmployeeIndirectHours (shift, employee, hours) {
            if (this.isStandard) return
            shift.indirect_hours = hours
            employee.updateShift(shift)
        },

        /**
         * Saves all changes to the indirect hours
         * - delete
         * - new
         * - existing
         */
        async saveAllIndirectHours ({ shift, employee, originalIndirectHours }) {
            this.SET_SAVING_SHIFT(shift.guid)
            // first handle the delete of any hours available
            await this.deleteEmployeeIndirectHours(shift, employee, originalIndirectHours)
            if (this.deleteError) {
                this.resetEmployeeIndirectHours(shift, employee, originalIndirectHours)
                shift.editIndirectTasks = true
                this.SET_SAVING_SHIFT(null)
                return
            }
            return Promise.all([
                this.updateEmployeeIndirectHours(shift, employee, originalIndirectHours),
                this.addEmployeeIndirectHours(shift, employee),
            ]).then((results) => {
                const hours = results[0].concat(results[1]).map(h => {
                    h.toDelete = false
                    h.isNew = false
                    return h
                })
                this.resetEmployeeIndirectHours(shift, employee, hours)
            }).catch(err => {
                this.resetEmployeeIndirectHours(shift, employee, originalIndirectHours)
                this.SET_SNACKBAR({ message: err.message, error: true })
                shift.editIndirectTasks = true
                throw err
            }).finally(() => {
                this.deleteError = false
                this.SET_SAVING_SHIFT(null)
            })
        },

        /**
         * Deletes all indirect hours set to delete by the user
         */
        async deleteEmployeeIndirectHours (shift, employee) {
            const hoursToDelete = this.shiftIndirectHours(shift).filter(h => h.toDelete)
            let result = []
            if (hoursToDelete.length) {
                const deleteApiCalls = []
                hoursToDelete.forEach(hour => {
                    hour.shift_id = shift.shift_id
                    hour.shift_instance_id = shift.shift_instance_id
                    deleteApiCalls.push(this.deleteIndirectHours(hour))
                })
                result = await Promise.all(deleteApiCalls).then(() => {
                    this.removeDeletedIndirectHours(shift, employee)
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.indirectTasks.deleted') })
                    this.deleteError = false
                    return true
                }).catch(err => {
                    this.deleteError = true
                    throw err
                })
            }
            return result
        },

        /**
         * Updates all indirect hours updated by the user
         */
        async updateEmployeeIndirectHours (shift, employee, originalIndirectHours) {
            // get all existing modified hours
            const hoursToChange = this.indirectHoursToChange(shift, originalIndirectHours)
            let result = []
            if (hoursToChange.length) {
                const changeApiCalls = []
                hoursToChange.forEach(hour => {
                    hour.shift_id = shift.shift_id
                    changeApiCalls.push(this.changeIndirectHours(hour))
                })
                result = await Promise.all(changeApiCalls).then(results => {
                    results.forEach(hour => {
                        hour.isNew = false
                        hour.valid = true
                        this.updateIndirectHour(shift, employee, hour)
                    })
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.indirectTasks.saved') })
                    return results
                }).catch(err => {
                    throw err
                })
            }
            return result
        },

        /**
         * Adds all indirect hours added by the user
         */
        async addEmployeeIndirectHours (shift, employee) {
            const hoursToAdd = this.indirectHoursToAdd(shift)
            let result = []
            if (hoursToAdd.length) {
                const addApiCalls = []
                hoursToAdd.forEach(hour => {
                    hour.shift_instance_id = shift.shift_instance_id
                    hour.shift_id = shift.shift_id
                    addApiCalls.push(this.addIndirectHours(hour))
                })
                result = await Promise.all(addApiCalls).then(results => {
                    results.forEach(hour => {
                        hour.isNew = false
                        hour.valid = true
                        this.updateIndirectHour(shift, employee, hour)
                    })
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.indirectTasks.created') })
                    return results
                }).catch(err => {
                    throw err
                })
            }
            return result
        },
    },
}
