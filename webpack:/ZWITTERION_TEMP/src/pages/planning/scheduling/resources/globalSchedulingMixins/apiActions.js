import schedulingHelper from '@/libraries/schedulingHelper'
import PlanningShift from '@/libraries/planningShift'

export default {
    methods: {
        async shiftHasErrors ({ shift, backupShift }) {
            const skipOverlapCheck = shift.nonProductiveSimple || (shift.nonProductive && !this.CAN_ADD_NON_PRODUCTIVES_WITH_TIMES)
            if (shift.overlaps.shift && !skipOverlapCheck) {
                const message = this.baseTranslate('warnings.cannotOverlap')
                this.setError({ message }, backupShift)
                return message
            }
            // check if shift is dragged to date where employee is not employed anymore or his contract has expired
            const { employed, overlap } = this.canBeTransferredToDate(shift)
            if (!employed) {
                const message = this.baseTranslate('shiftPopover.cannotBeTransferredToDate')
                this.setError({ message }, backupShift)
                return message
            }
            if (overlap && !skipOverlapCheck) {
                const message = this.baseTranslate('warnings.cannotOverlap')
                this.setError({ message }, backupShift)
                return message
            }
            return null
        },
        shiftProperties (shift) {
            return {
                virtual: !shift.isNew && !shift.shift_instance_id && !shift.notAssigned,
                recurring: Boolean(shift.shift_instance_id) && Boolean(shift.frequency),
                assigned: Boolean(shift.account_id) && shift.account_id !== 'not_assigned',
                new: shift.isNew,
                standard: Boolean(shift.frequencyId),
                hasInstances: !shift.notAssigned && shift.instances && shift.instances.length,
                notAssigned: shift.notAssigned,
                assignNotAssignedShiftToEmployee: shift.assignNotAssignedShiftToEmployee,
            }
        },
        /**
         * Returns a api payload mapping from the provided event
         * @param {Object} event // shift event
         * @returns {Object} Object
         */
        eventSavePayload ({ shift, updateParent = false, status = 'plan' }) {
            const fixEndMidnight = (endTime) => {
                const end = this.$moment(endTime)
                const endsAtMidnight = end.shortTime() === '00:00' || end.shortTime() === '24:00'
                if (endsAtMidnight) {
                    return end.setTime('23:59:59').longApiFormat()
                }
                return end.longApiFormat()
            }
            let from = shift.start_datetime
            let to = fixEndMidnight(shift.end_datetime)
            let duration
            let breaks = !shift.nonProductive ? shift.breaks : undefined
            if (shift.nonProductive || status === 'deleted') {
                from = this.$moment(shift.start_datetime).setTime('00:00').longApiFormat()
                to = this.$moment(shift.start_datetime).setTime('00:00').longApiFormat()
                duration = shift.duration
            }
            if (status === 'deleted') {
                duration = '00:00'
                breaks = [{ duration: '00:00' }]
            }
            return {
                account_id: !shift.notAssigned ? shift.account_id : undefined,
                department_id: !shift.nonProductive ? shift.department_id : undefined,
                start_datetime: from,
                end_datetime: to,
                breaks,
                type: shift.type,
                foreign_type: shift.nonProductive ? shift.foreign_type : undefined,
                remark: shift.remark,
                status,
                duration,
                exchange_store_id: shift.exchange_store_id || null,
                update_parent: updateParent || undefined,
                frequency: this.isStandard ? shift.frequency : undefined,
                last_occurrence: this.isStandard ? shift.last_occurrence : undefined,
                store_id: shift.store_id || undefined,
                guid: shift.guid,
            }
        },

        async deleteRecurringInstance (shift) {
            // delete recurring instance
            // so that it will not longer appear in the selected week
            return this.deleteShiftInstance({ shift, date: this.SELECTED_DATE }).catch(error => {
                this.setError(error)
                throw error
            })
        },

        async createDeletedInstanceForRecurringShift (shift) {
            // create recurring instance with status 'deleted'
            // so that it will not longer appear in the selected week
            return this.createShiftInstance({
                shift_id: shift.shift_id,
                guid: shift.guid,
                instance: { ...this.eventSavePayload({ shift, status: 'deleted' }) },
            }).then(result => {
                return true
            }).catch(err => {
                throw err
            })
        },

        /**
         * Saves Create / Edit actions based on provided params
         * @param {Object} shift
         * @returns {Shift} Object
         */
        async saveShift ({ shift, backupShift, employee, newEmployee }) {
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const props = this.shiftProperties(shift)
            if (props.standard) return this.saveStandardShift(shift, backupShift, employee)
            if (props.assignNotAssignedShiftToEmployee || props.notAssigned) return this.saveNotAssignedShift(shift, backupShift, employee, newEmployee)
            const payload = this.eventSavePayload({ shift })
            if (props.new) {
                delete payload.frequency
                return this.createShiftWithInstance(payload).then(async result => {
                    const resultShift = this.NEW_SHIFT({ ...shift, ...result, ...result.instances[0], instances: result.instances })
                    resultShift.isNew = false
                    this.setDirty(resultShift)
                    return resultShift
                }).catch(error => {
                    if (shift.copied) {
                        employee.removeShift(shift)
                    }
                    this.setError(error, backupShift || shift, true, false)
                    return { error: true }
                })
            } else {
                if (props.hasInstances) {
                    if (props.virtual) {
                        // we need to create a non recurring
                        // instance on the recurring parent
                        delete payload.frequency
                        if (backupShift.lentOut && !shift.lentOut) {
                            // when stopping lent out shift for a virtual recurring instance
                            // create a new shift and instance for the same dat/time
                            // create recurring instance with status 'deleted' for old recurring shift parent
                            return this.createShiftWithInstance(payload).then(async result => {
                                this.createDeletedInstanceForRecurringShift(backupShift)
                                const resultShift = this.NEW_SHIFT({ ...shift, ...result, ...result.instances[0], instances: result.instances })
                                resultShift.isNew = false
                                employee.removeShift(shift)
                                employee.addShift(resultShift)
                                this.setDirty(resultShift)
                                return resultShift
                            }).catch(error => {
                                this.setError(error, backupShift, true, false)
                                return { error: true }
                            })
                        }
                        return this.createShiftInstance({
                            shift_id: shift.shift_id,
                            guid: shift.guid,
                            instance: payload,
                        }).then(async result => {
                            const resultShift = this.NEW_SHIFT({
                                ...shift,
                                shift_instance_id: result.shift_instance_id,
                                instances: [result],
                            })
                            resultShift.isNew = false
                            employee.updateShift(resultShift)
                            this.setDirty(resultShift)
                            return resultShift
                        }).catch(error => {
                            this.setError(error, backupShift, true, false)
                            return { error: true }
                        })
                    } else {
                        if (props.recurring) {
                            payload.frequency = null
                            if (backupShift.lentOut !== shift.lentOut) {
                                // when stopping lent out shift for a recurring instance
                                // create a new shift and instance for the same dat/time
                                // update existing recurring instance with status 'deleted' for old recurring shift parent
                                return this.deleteRecurringInstance(backupShift).then(() => {
                                    return this.createShiftWithInstance(payload).then(async result => {
                                        const resultShift = this.NEW_SHIFT({ ...shift, ...result, ...result.instances[0], instances: result.instances })
                                        resultShift.isNew = false
                                        employee.removeShift(shift)
                                        employee.addShift(resultShift)
                                        this.setDirty(resultShift)
                                        return resultShift
                                    }).catch(error => {
                                        this.setError(error, backupShift, true, false)
                                        return { error: true }
                                    })
                                }).catch(error => {
                                    this.setError(error, backupShift, true, false)
                                    return { error: true }
                                })
                            }
                        }
                        return this.updateShiftInstance({
                            shift_id: shift.shift_id,
                            shift_instance_id: shift.shift_instance_id,
                            guid: shift.guid,
                            instance: { ...payload, update_parent: !props.recurring },
                        }).then(async result => {
                            const resultShift = this.NEW_SHIFT({
                                ...shift,
                                ...result,
                                shift_instance_id: result.shift_instance_id,
                                instances: [result],
                            })
                            resultShift.isNew = false
                            employee.updateShift(resultShift)
                            this.setDirty(shift)
                            return resultShift
                        }).catch(error => {
                            this.setError(error, backupShift, true, false)
                            return { error: true }
                        })
                    }
                }
            }
        },

        async saveStandardShift (shift, backupShift, employee) {
            const props = this.shiftProperties(shift)
            const payload = this.eventSavePayload({ shift })
            if (props.new) {
                return this.createShift(payload).then(async result => {
                    const resultShift = { ...shift, ...result }
                    resultShift.instances = []
                    resultShift.isNew = false
                    resultShift.frequencyId = shift.frequencyId
                    resultShift.nonProductive = shift.nonProductive
                    resultShift.nonProductiveSimple = shift.nonProductiveSimple
                    return resultShift
                }).catch(error => {
                    if (shift.copied) {
                        employee.removeShift(shift)
                    }
                    this.setError(error, backupShift || shift)
                    return { error: true }
                })
            } else {
                return this.updateShift({
                    shift_id: shift.shift_id,
                    shift: payload,
                    guid: shift.guid,
                }).then(result => {
                    return { ...shift, ...result }
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            }
        },

        async saveNotAssignedShift (shift, backupShift, employee, newEmployee) {
            const props = this.shiftProperties(shift)
            const payload = this.eventSavePayload({ shift })
            if (props.new) {
                return this.createShift(payload).then(async result => {
                    const resultShift = this.NEW_SHIFT(result)
                    resultShift.isNew = false
                    if (shift.assignNotAssignedShiftToEmployee) {
                        return this.dragNotAssignedShiftToEmployee({ shift: resultShift, backupShift, employee, newEmployee })
                    } else {
                        resultShift.instances = []
                        resultShift.notAssigned = true
                        resultShift.account_id = 'not_assigned'
                    }
                    return resultShift
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            } else {
                /** UPDATE AN EXISTING NOT-ASSIGNED SHIFT (form edit form) **/
                if (shift.assignNotAssignedShiftToEmployee) {
                    return this.dragNotAssignedShiftToEmployee({ shift, backupShift, employee, newEmployee })
                } else {
                    delete payload.account_id
                    return this.updateShift({
                        shift_id: shift.shift_id,
                        shift: payload,
                        guid: shift.guid,
                    }).then(result => {
                        return { ...shift, ...result }
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                }
            }
        },

        /**
         * Delete an shift by it's id
         * @param {Object} shift
         * @param {Boolean} confirmation if true, method will also open a snackbar to confirm success
         */
        async deleteShiftBlock (shift, employee) {
            const props = this.shiftProperties(shift)
            if (props.standard) {
                return this.deleteStandardShift(shift).then(result => {
                    employee.removeShift(shift)
                    this.RESET_LAST_MODIFIED_STANDARD_SHIFT()
                    return result
                }).catch(error => {
                    this.setError(error)
                    return { error: true }
                })
            } else {
                const date = this.SELECTED_DATE
                let result
                if (props.virtual) {
                    result = await this.createDeletedInstanceForRecurringShift(shift).catch(error => {
                        this.setError(error)
                        return { error: true }
                    })
                } else if (props.recurring) {
                    result = await this.deleteShiftInstance({ shift, date }).catch(error => {
                        this.setError(error)
                        return { error: true }
                    })
                } else {
                    const action = props.assigned ? 'deleteShiftInstance' : 'deleteShift'
                    result = await this[action]({ shift, date }).catch(error => {
                        this.setError(error)
                        return { error: true }
                    })
                }
                employee.removeShift(shift)
                if (props.assigned) {
                    this.setDirty(shift)
                }
                this.SET_SNACKBAR({ message: this.baseTranslate('deleteShift.shiftDeleted') })
                return result
            }
        },

        /**
         * When an assigned shift is dragged on the same row
         * @param {Object} payload
         */
        async dragAssignedShiftOnSameRow ({ shift, backupShift, shiftStartAndEndsAnotherDay }) {
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const props = this.shiftProperties(shift)
            if (props.standard) return this.dragStandardShiftOnTheSameRow(shift, backupShift)
            const payload = this.eventSavePayload({ shift })
            /**
             * shiftStartAndEndsAnotherDay: The shift was dragged entirely to another day
             */
            if (shiftStartAndEndsAnotherDay) {
                if (props.virtual || props.recurring) {
                    return this.createShiftWithInstance(payload).then(async result => {
                        if (props.virtual) {
                            this.createDeletedInstanceForRecurringShift(backupShift).catch(() => { })
                        } else {
                            this.deleteRecurringInstance(backupShift)
                        }
                        const resultShift = this.NEW_SHIFT({ ...shift, ...result, ...result.instances[0], instances: result.instances })
                        resultShift.isNew = false
                        this.setDirty(resultShift)
                        return resultShift
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                } else {
                    return this.updateShiftInstance({
                        shift_id: shift.shift_id,
                        shift_instance_id: shift.shift_instance_id,
                        guid: shift.guid,
                        instance: { ...payload, update_parent: true },
                    }).then(result => {
                        this.setDirty(shift)
                        return { ...shift, ...result }
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                }
            } else {
                if (props.virtual) {
                    delete payload.frequency
                    return this.createShiftInstance({
                        shift_id: shift.shift_id,
                        guid: shift.guid,
                        instance: payload,
                    }).then(async result => {
                        const resultShift = this.NEW_SHIFT({
                            ...shift,
                            shift_instance_id: result.shift_instance_id,
                            instances: [result],
                        })
                        resultShift.isNew = false
                        this.setDirty(resultShift)
                        return resultShift
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                } else if (props.recurring) {
                    delete payload.frequency
                    return this.updateShiftInstance({
                        shift_id: shift.shift_id,
                        shift_instance_id: shift.shift_instance_id,
                        guid: shift.guid,
                        instance: payload,
                    }).then(result => {
                        this.setDirty(shift)
                        return { ...shift, ...result }
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                }
            }
            return this.updateShiftInstance({
                shift_id: shift.shift_id,
                shift_instance_id: shift.shift_instance_id,
                guid: shift.guid,
                instance: { ...payload, update_parent: true },
            }).then(result => {
                this.setDirty(shift)
                return { ...shift, ...result }
            }).catch(error => {
                this.setError(error, backupShift)
                return { error: true }
            })
        },

        async dragStandardShiftOnTheSameRow (shift, backupShift) {
            // only update shift in case of standard shifts
            const apiPayload = this.eventSavePayload({ shift })
            return this.updateShift({
                shift_id: shift.shift_id,
                shift: apiPayload,
                guid: shift.guid,
            }).then(async (result) => {
                return { ...shift, ...result }
            }).catch(error => {
                this.setError(error, backupShift)
                return { error: true }
            })
        },

        /**
         * When a not assigned shift is dragged on the same row
         * @param {Object} payload
         */
        async dragNotAssignedShiftOnSameRow ({ shift, backupShift }) {
            const apiPayload = this.eventSavePayload({ shift })
            delete apiPayload.account_id
            return this.updateShift({
                shift_id: shift.shift_id,
                shift: apiPayload,
                guid: shift.guid,
            }).then(result => {
                return { ...shift, ...result }
            }).catch(error => {
                this.setError(error, backupShift)
                return { error: true }
            })
        },

        /**
         * When a not assigned shift is dragged to an employee row
         * ASSIGN A NOT-ASSIGNED SHIFT TO AN EMPLOYEE
         * @param {Object} payload
         */
        async dragNotAssignedShiftToEmployee ({ shift, backupShift, newEmployee }) {
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const employeeHasDepartment = this.currentEmployeeDepartments.find(d => d.department_id === shift.department_id)
            if (newEmployee.lentIn || !employeeHasDepartment) {
                // revert changes if the current user does not have the shift
                // department or the new employee is a lent in employee
                const message = this.baseTranslate('warnings.cannotAssignShiftToEmployee', {
                    employee: newEmployee.name,
                    department: this.departmentById(shift.department_id).department_name,
                })
                this.setError({ message }, backupShift)
                return { error: true }
            }
            shift.account_id = newEmployee.account_id
            shift.notAssigned = false
            const instancePayload = {
                shift_id: shift.shift_id,
                guid: shift.guid,
                instance: this.eventSavePayload({ shift, updateParent: !shift.frequency }),
            }
            // post new shift instance for the provided shift,
            // because existing not-assigned shifts do not have instances
            return this.createShiftInstance(instancePayload).then(async instanceResult => {
                shift.instances = [instanceResult]
                shift = { ...shift, ...instanceResult }
                this.setDirty(shift)
                this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftAssignedTo', [newEmployee.name]) })
                return shift
            }).catch(error => {
                this.setError(error)
                return { error: true }
            })
        },

        /**
         * When an assigned shift is dragged to another employee row
         * ASSIGN AN ASSIGNED SHIFT TO ANOTHER EMPLOYEE
         * @param {Object} payload
         */
        async assignShiftToAnotherEmployee ({ employee, newEmployee, shift, backupShift }) {
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const props = this.shiftProperties(shift)
            const employeeHasDepartment = this.currentEmployeeDepartments.find(d => d.department_id === shift.department_id)
            if (newEmployee.lentIn || !employeeHasDepartment) {
                // revert changes if the current user does not have the shift
                // department or the new employee is a lent in employee
                const message = this.baseTranslate('warnings.cannotAssignShiftToEmployee', {
                    employee: newEmployee.name,
                    department: this.departmentById(shift.department_id).department_name,
                })
                this.setError({ message }, backupShift)
                return { error: true }
            }
            shift.account_id = newEmployee.account_id
            shift.notAssigned = false
            const payload = this.eventSavePayload({ shift })
            // post new shift instance for the provided shift, because existing not-assigned shifts do not have instances
            const instancePayload = {
                shift_id: shift.shift_id,
                shift_instance_id: shift.shift_instance_id,
                instance: payload,
                guid: shift.guid,
            }
            if (props.virtual || props.recurring) {
                return this.createShiftWithInstance(payload).then(async result => {
                    if (props.virtual) {
                        this.createDeletedInstanceForRecurringShift(backupShift).catch(() => { })
                    } else if (props.recurring) {
                        this.deleteRecurringInstance(backupShift)
                    }
                    const resultShift = this.NEW_SHIFT({ ...result, ...result.instances[0], instances: result.instances })
                    resultShift.isNew = false
                    resultShift.recurring = false
                    resultShift.frequency = null
                    resultShift.showRecurringIcon = false
                    this.setDirty(resultShift)
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftAssignedTo', [newEmployee.name]) })
                    return resultShift
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            } else {
                instancePayload.instance.update_parent = true
                return this.updateShiftInstance(instancePayload).then(instanceResult => {
                    shift.instances = [instanceResult]
                    shift = { ...shift, ...instanceResult }
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftAssignedTo', [newEmployee.name]) })
                    this.setDirty(shift)
                    return shift
                }).catch(error => {
                    this.setError(error)
                    return { error: true }
                })
            }
        },
        /**
         * When an assigned shift is dragged to a not assigned row
         * Removes an employee assignment from a shift
         * @param {Object} payload
         */
        async dragAssignedShiftToNotAssignedRow (payload) {
            return this.removeEmployeeFromAssignedShift(payload)
        },

        /**
         * Determines the action to take when timeblock was resized based on the shift assignment
         * @param {Object} payload
         */
        async saveResized ({ shift, backupShift }) {
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const props = this.shiftProperties(shift)
            if (props.notAssigned) {
                return this.resizeNotAssignedShift({ shift, backupShift })
            } else {
                return this.resizeAssignedShift({ shift, backupShift })
            }
        },

        /**
         * Called when an assigned shift is resized
         * @param {Object} shift
         * @param {Object} backupShift
         */
        async resizeAssignedShift ({ shift, backupShift }) {
            const props = this.shiftProperties(shift)
            const payload = this.eventSavePayload({ shift, updateParent: !shift.frequency })
            this.setEmployeeShiftsOverlapScenarios(shift.account_id)
            if (props.virtual || props.recurring) {
                // remove frequency for virtual and recurring instances
                // as, in the end, we need to have a non recurring instance
                // for the selected week
                delete payload.frequency
            }
            if (props.virtual) {
                // we need to create a non recurring
                // instance on the recurring parent
                return this.createShiftInstance({
                    shift_id: shift.shift_id,
                    guid: shift.guid,
                    instance: payload,
                }).then(async result => {
                    const resultShift = this.NEW_SHIFT({
                        ...shift,
                        ...result,
                        shift_instance_id: result.shift_instance_id,
                        instances: [result],
                    })
                    resultShift.isNew = false
                    this.setDirty(resultShift)
                    return resultShift
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            }
            return this.updateShiftInstance({
                shift_id: shift.shift_id,
                shift_instance_id: shift.shift_instance_id,
                guid: shift.guid,
                instance: payload,
            }).then(async result => {
                const resultShift = this.NEW_SHIFT({
                    ...shift,
                    ...result,
                    shift_instance_id: result.shift_instance_id,
                    instances: [result],
                })
                resultShift.isNew = false
                this.setDirty(resultShift)
                return resultShift
            }).catch(error => {
                this.setError(error, backupShift)
                return { error: true }
            })
        },

        /**
         * Called when a not assigned shift is resized
         * @param {Object} payload
         */
        async resizeNotAssignedShift (payload) {
            const shift = { ...payload.shift }
            delete shift.account_id
            const apiPayload = this.eventSavePayload({ shift: { ...shift, account_id: 'not_assigned' } })
            const resultShift = await this.updateShift({
                shift_id: shift.shift_id,
                shift: apiPayload,
                guid: shift.guid,
            }).catch(error => {
                this.setError(error, payload.backupShift)
            })
            this.setDirty(payload.shift)
            return { ...resultShift, ...shift, account_id: 'not_assigned' }
        },

        /**
         * Called when the Remove Employee from Shift option is clicked on a shift context menu
         * @param {Object} shift
         */
        async removeEmployeeFromAssignedShift ({ shift, backupShift }) {
            if (!backupShift) {
                backupShift = { ...shift }
            }
            const hasErrors = await this.shiftHasErrors({ shift, backupShift })
            if (hasErrors) return { error: hasErrors }
            const props = this.shiftProperties(shift)
            const oldAssignedEmployeeName = this.weekPlanningData[shift.account_id]?.name
            const apiPayload = this.eventSavePayload({ shift })
            if (props.virtual || props.recurring) {
                delete apiPayload.account_id
                delete apiPayload.frequency
                return this.createShift(apiPayload).then(async result => {
                    if (props.virtual) {
                        this.createDeletedInstanceForRecurringShift(backupShift).catch(() => { })
                    } else if (props.recurring) {
                        this.deleteRecurringInstance(backupShift)
                    }
                    const resultShift = this.NEW_SHIFT(result)
                    resultShift.notAssigned = true
                    resultShift.account_id = 'not_assigned'
                    resultShift.frequency = null
                    resultShift.isNew = false
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftUnAssignedFrom', [oldAssignedEmployeeName]) })
                    this.setDirty(backupShift)
                    return resultShift
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            } else {
                return this.deleteShiftInstance({ shift, date: this.SELECTED_DATE }).then(() => {
                    return this.updateShift({
                        shift_id: shift.shift_id,
                        guid: shift.guid,
                        shift: { ...apiPayload, account_id: null },
                    }).then(result => {
                        const newShift = {
                            ...shift,
                            ...result,
                            overlaps: schedulingHelper.newOverlapScenario(),
                            account_id: 'not_assigned',
                            instances: [],
                            notAssigned: true,
                        }
                        this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftUnAssignedFrom', [oldAssignedEmployeeName]) })
                        this.setDirty(backupShift)
                        return newShift
                    }).catch(error => {
                        this.setError(error, backupShift)
                        return { error: true }
                    })
                }).catch(error => {
                    this.setError(error, backupShift)
                    return { error: true }
                })
            }
        },

        /**
         * Saves a day remark for an employee
         * @param {Object} event => employee day remark object
         */
        saveDayRemark (event, employee) {
            return this.saveEmployeeDayRemark(event).then(result => {
                if (result.apiCall === 'deleteDayRemark' || !event.id) {
                    employee.removeDayRemark(event)
                }
                if (result.apiCall === 'createDayRemark') {
                    employee.addDayRemark(result.remark)
                }
                if (result.apiCall === 'updateDayRemark') {
                    employee.updateDayRemark(result.remark)
                }
                this.SET_ACTIVE_CONTEXT_MENU(null)
                return result
            }).catch(error => {
                this.SET_SNACKBAR({ message: error.message, error: true })
                throw error
            })
        },

        /**
         * Saves the substitute request
         * @param {Object} payload: {
                status, 'approved' or 'rejected' {String} mandatory
                shift, // the parent shift of the substitute request {Object}
                approving, {Boolean}
                rejecting, {Boolean}
                employee,
                newEmployee,
            }
         */
        async saveSubstituteRequest (payload) {
            if (!payload.status) {
                throw new Error({ message: 'Substitute request status was not provided' })
            }
            if (!payload.shift) {
                throw new Error({ message: 'Parent Substitute request shift was not provided' })
            }
            // Quote from API:
            // if one SSR is approved, all others are rejected
            // if one SSR is rejected, all others are also rejected (as the intention is then to reject for all in one go)
            const ssr = Object.freeze(payload.shift.pending_substitute_request)
            const requestId = ssr?.sent_to?.[0]?.substitute_request_id
            if (!requestId) return
            const apiPayload = {
                id: requestId,
                status: payload.status,
            }
            await this.SET_SAVING_SHIFT(payload.shift.guid)
            return this.assessSubstituteRequest(apiPayload).then(async () => {
                if (payload.rejecting) {
                    payload.shift.pending_substitute_request = null
                    payload.employee.updateShift(payload.shift)
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.substituteRequestRejected') })
                } else if (payload.approving) {
                    // db shift will be updated by the approve API action on the substitute request
                    // remove the shift from the requester employee
                    payload.employee.removeShift(payload.shift)
                    payload.employee.addApprovedSubstituteRequest({
                        id: ssr.sent_to[0]?.substitute_request_id,
                        department_id: payload.shift.department_id,
                        shift_instance_id: payload.shift.shift_instance_id,
                        requester_id: payload.employee.account_id,
                        requester_name: payload.employee.name,
                        substitute_id: payload.newEmployee.account_id,
                        substitute_name: payload.newEmployee.name,
                        schedule_time_from: payload.shift.start_datetime,
                        schedule_time_to: payload.shift.end_datetime,
                        remark: ssr.remark,
                        status: 'approved',
                        created_on: this.$moment().longApiFormat(),
                    })
                    payload.employee.setNonPlannableMoments(this.SELECTED_DATE)
                    // add the shift to the substitute employee
                    payload.shift.pending_substitute_request = null
                    payload.newEmployee.addShift({ ...payload.shift, account_id: payload.newEmployee.account_id })
                    payload.newEmployee.setNonPlannableMoments(this.SELECTED_DATE)
                    this.SET_SNACKBAR({ message: this.baseTranslate('shiftPopover.shiftAssignedTo', [payload.newEmployee.name]) })
                }
            }).catch(err => {
                console.error(err)
                throw err
            }).finally(() => {
                this.SET_SAVING_SHIFT(null)
            })
        },

        setDirty (shift) {
            if (!this.isStandardShifts && !this.$route.meta.standard_shifts_account_id) {
                this.SET_DIRTY_GRID({
                    account_id: shift.account_id,
                    department_id: shift.department_id,
                    shift_id: shift.shift_id,
                })
            }
        },

        /**
         * Assigns an employee to a shift
         * @param {Object} employee
         * @param {Object} event // shift event
         */
        assignEmployeeToShift ({ employee, newEmployee, shift, backupShift }) {
            if (!backupShift) {
                backupShift = { ...shift }
            }
            const employeeHasDepartment = this.currentEmployeeDepartments.find(d => d.department_id === shift.department_id)
            if (newEmployee.lentIn || !employeeHasDepartment) {
                // do not assign if the new employee does not have the shift department
                const message = this.baseTranslate('warnings.cannotAssignShiftToEmployee', {
                    employee: newEmployee.name,
                    department: this.departmentById(shift.department_id).department_name,
                })
                this.setError({ message })
                return { error: true }
            }
            shift.account_id = newEmployee.account_id
            if (shift.notAssigned) {
                return this.dragNotAssignedShiftToEmployee({ employee, newEmployee, shift, backupShift })
            } else {
                return this.assignShiftToAnotherEmployee({ employee, newEmployee, shift, backupShift })
            }
        },

        async getPlanningData () {
            this.TOGGLE_LOADING('planning/week')
            this.TOGGLE_LOADING('planning/contractData')
            // Gets all the week statuses.
            if (this.isCheckHours) {
                // redirect to initial total overview (current week)
                // if the accessed date is after the last finalized date
                await this.getWeekStatus({ latest_status: true })
                    .then(async () => {
                        if (this.SELECTED_DATE.isAfter(this.lastWeekStatusDate, 'week')) {
                            await this.$router.push({ name: 'check-hours-init' })
                            return true
                        }
                    })
                    .catch(() => {
                        this.TOGGLE_LOADING('planning/week')
                        this.TOGGLE_LOADING('planning/contractData')
                        return true
                    })
            } else {
                if (!this.isStandardShifts) {
                    this.getWeekStatus({ latest_status: true }).catch(() => { })
                }
            }
            const date = this.SELECTED_DATE
            if (!this.isStandardShifts) {
                this.getPublicHolidays()
                if (this.CAN_PLAN_OTHERS && this.CAN_READ_CLA) {
                    this.getClaSettings(date)
                }
                if (this.CAN_READ_CAO_RULES) {
                    // make a check to see if they exist first
                    this.getCaoRules(false).catch((error) => { this.setSchedulingApiError('caorules', error) })
                }
                if (this.CAN_READ_DEPARTMENT_STATUS) {
                    this.getLastFinalizedDepartmentStatus()
                }
            }
            this.getShiftBreakSuggestions()
            if (this.CAN_READ_BOOKABLE_HOUR_TYPES) {
                this.getWeeklyBookableHourTypes(date)
            }
            if (this.isCheckHours && this.weekStatus.status !== 'closed') {
                this.getCloseWeekNotifications(this.SELECTED_DATE)
            }
            await this.getPlanningEmployees({ date, standard: this.isStandardShifts }).then(async result => {
                if (this.CAN_READ_CLA_VALIDATIONS) {
                    this.getClaValidationOutcomes(date).catch((error) => { this.setSchedulingApiError('claValidationOutcomes', error) })
                }
                if (!this.isStandardShifts) {
                    this.getCurrentWeekStatus(date)
                    this.getBusinessTimes(date)
                }
                if (this.isCheckHours && this.currentEmployeeOpenDepartments.length) {
                    // no need for other api calls if there are
                    // open departments in Total Overview page
                    this.TOGGLE_LOADING('planning/week')
                    this.TOGGLE_LOADING('planning/contractData')
                    return
                }
                this.TOGGLE_LOADING('planning/week')
                this.setAccountSearch()
                const { existing } = result[1]
                if (existing) {
                    this.TOGGLE_LOADING('planning/contractData')
                } else if (!existing) {
                    if (!this.isStandardShifts) {
                        if (this.isCheckHours) {
                            this.getShiftSurcharges(date)
                        }
                        await this.getEmployeesRequests(date)
                        this.getWeekShifts({ date }).then(result => {
                            this.getEmployeeContractAndFinancialData(date)
                            this.setNonPlannableMoments(date)
                            this.getWeekDayRemarks({ date })
                            if (this.CAN_ADD_INDIRECT_TASKS) {
                                this.getIndirectTaskTypes()
                                this.getIndirectTasks(date)
                            }
                            this.getWeekDetails(date)
                        })
                    } else {
                        if (this.CAN_READ_STANDARD_REMARKS) {
                            this.getStandardDayRemarks({ date }).catch((error) => { this.setSchedulingApiError('standardRemarks', error) })
                        }
                        this.getStandardShifts({ date }).then(() => {
                            this.getEmployeeContractAndFinancialData(date)
                            this.setNonPlannableMoments(date)
                        }).catch((error) => { this.setSchedulingApiError('standardShifts', error) })
                    }
                }
            }).catch(err => this.setError(err))
            this.$nextTick(() => {
                if (this.isCheckHours && this.currentEmployeeOpenDepartments.length) {
                    if (!this.weekIsDraft) {
                        this.changeSetting({ setting: 'weekStatus', value: true })
                    }
                }
            })
        },
        async getEmployeesRequests (date) {
            const nonPlannableMomentsApiCalls = []
            if (this.CAN_VIEW_OTHERS_AVAILABILITIES && this.HAS_AVAILABILITY_MODULE) {
                nonPlannableMomentsApiCalls.push(this.getAvailabilities(date))
                nonPlannableMomentsApiCalls.push(this.getAvailabilityWeeksets(date))
            }
            if (this.CAN_READ_RDO) {
                nonPlannableMomentsApiCalls.push(this.getRdoRequests(date))
            }
            if (this.CAN_READ_SUBSTITUTE_REQUESTS && this.canFindSubstitutes) {
                nonPlannableMomentsApiCalls.push(this.getSubstituteRequests(date))
            }
            return Promise.all(nonPlannableMomentsApiCalls)
                .catch(err => { this.setError(err) })
        },

        async setNonPlannableMoments (date) {
            return this.employees.forEach(employee => {
                employee.setNonPlannableMoments(date)
                employee.setMaxNonPlannableCount(date)
            })
        },

        async getEmployeeContractAndFinancialData (date) {
            try {
                const apiCalls = []
                if (this.canViewOthersContractData) {
                    await this.getContracts(date)
                }
                if (!this.isStandardShifts) {
                    if (this.CAN_READ_WAB && this.CAN_READ_PERIODS) {
                        apiCalls.push(this.getWabCounters({ date }))
                    }
                    apiCalls.push(this.getWeekBalances({ date }))
                }
                if (this.WAGE_PER_HOUR_READ) {
                    apiCalls.push(this.getWageInfo(date.startOf('isoWeek')))
                }
                await Promise.all(apiCalls).catch(err => { this.setError(err) })
                this.TOGGLE_LOADING('planning/contractData')
            } catch (error) {
                console.error(error)
                this.TOGGLE_LOADING('planning/contractData')
            }
        },

        /**
         * Loads sent schedules and sent day remarks if on track schedules page
         */
        loadSentSchedulesAndDayRemarks () {
            const hasSentShifts = this.HAS_SENT_SHIFTS_HISTORY(this.DEPARTMENT_STATUS_HISTORY_ID)
            const hasSentDayRemarks = this.HAS_SENT_DAY_REMARKS_HISTORY(this.DEPARTMENT_STATUS_HISTORY_ID)
            const departmentStatusHistoryId = this.DEPARTMENT_STATUS_HISTORY_ID
            const date = this.SELECTED_DATE
            this.changeSetting({ setting: 'weekStatus', value: true })
            if (!hasSentShifts) {
                this.getSentShiftInstances({ departmentStatusHistoryId, date }).catch(error => {
                    this.SET_SNACKBAR({ message: error.message, error: true })
                })
            }
            if (!hasSentDayRemarks) {
                this.getSentDayRemarks({ departmentStatusHistoryId, date }).catch(error => {
                    this.SET_SNACKBAR({ message: error.message, error: true })
                })
            }
        },

        async getSteerInfo ({ force = false } = {}) {
            if (!this.CAN_READ_STEER_INFORMATION) return
            if (this.employees.length) {
                this.error = ''
                await this.getWeekSteerInfo({
                    date: this.SELECTED_DATE.startOf('isoWeek'),
                    force,
                }).catch(err => {
                    this.error = err.message
                })
            }
        },

        getCurrentWeekStatus (date) {
            this.getWeekStatus({ date, latest_status: true }).then(() => {
                this.checkWeekStatus()
                if (!this.weekIsDraft && !this.isStandardShifts && this.CAN_FINALIZE_SCHEDULE && this.currentEmployeeDepartments.length) {
                    this.getSchedulingNotifications({
                        department_ids: this.currentEmployeeDepartments.map(d => d.department_id),
                        date,
                    }).catch(error => {
                        this.setError(error)
                    })
                }
            })
        },

        /**
         * Called when save button is clicked
         * @returns Boolean
         */
        async saveFromForm ({ shift, backupShift, employee, rejectSubstitute = false, originalIndirectHours = [], newEmployee } = {}, fromTopBar = false) {
            if (rejectSubstitute) {
                const pendingSSRs = employee.pendingSubstituteRequests(backupShift.shift_instance_id)
                await this.saveSubstituteRequest({
                    request: pendingSSRs[0],
                    shift,
                    status: 'rejected',
                    rejecting: true,
                    employee,
                }).catch(err => {
                    this.setError(err)
                })
            }
            return this.saveShift({ shift, backupShift, employee, newEmployee }).then(async result => {
                const indirectHours = Object.freeze(shift.indirect_hours)
                if (!this.isStandard && backupShift?.isNew) {
                    // after saving the new shift, check for existing indirect hours
                    // on the new shift and update the shift_instance_id
                    await this.updateShiftIndirectHoursInstanceId({
                        shift: backupShift,
                        employee,
                        newInstanceId: result.shift_instance_id,
                    })
                }
                const frequencyId = shift.frequencyId
                const resultShift = { ...shift, ...result, frequencyId }
                resultShift.isNew = false
                if (frequencyId) {
                    employee.updateFrequencyRow({
                        id: frequencyId,
                        account_id: shift.account_id,
                        isNew: false,
                    })
                }
                resultShift.indirect_hours = indirectHours
                if (!this.isStandard) {
                    this.saveAllIndirectHours({ shift: resultShift, employee, originalIndirectHours })
                }
                if (fromTopBar) {
                    await this.addEmployeeShift(new PlanningShift(resultShift))
                }
                return resultShift
            }).catch(async (err) => {
                this.setError(err)
                return { error: true }
            })
        },

        async deleteSurchargeItem (surcharge, employee) {
            if (surcharge.isNew) {
                await employee.deleteSurcharge(surcharge)
                return
            }
            return this.deleteSurcharge(surcharge).then(r => {
                employee.deleteSurcharge(surcharge)
            }).catch(err => {
                this.SET_SNACKBAR({ message: err.message, error: true })
            })
        },

        async saveSurchargeItem ({ surcharge, surchargeBackup, employee }) {
            let action = 'updateSurcharge'
            if (surcharge.isNew) {
                action = 'createSurcharge'
            }
            return this[action](surcharge)
                .then(result => {
                    result.isNew = false
                    employee.deleteSurcharge(surcharge)
                    employee.addSurcharge(result)
                })
                .catch(err => {
                    this.SET_SNACKBAR({ message: err.message, error: true })
                    if (!surcharge.shift_surcharge_id) {
                        employee.deleteSurcharge(surcharge)
                    } else {
                        employee.deleteSurcharge(surcharge)
                        employee.addSurcharge(surchargeBackup)
                    }
                })
        },
    },
}
