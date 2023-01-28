import interact from 'interactjs' // https://interactjs.io/docs
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    computed: {
        /**
         * Checks if an element can be dragged
         */
        isDraggable () {
            if (!this.isActionable) return false
            return !this.isDayView || (this.isDayView && !this.localShift.nonProductive)
        },
        /**
         * Drag options
         */
        draggableModifiers () {
            return interact.modifiers.snap({
                actions: ['dragx', 'dragy', 'dragxy', 'drag'],
                mode: 'grid',
                targets: [
                    interact.snappers.grid({ x: this.snapAmount.x, y: this.snapAmount.y }),
                ],
                offset: 'startCoords',
            })
        },
        draggableOptions () {
            return {
                autoScroll: true,
                listeners: {
                    start: (event) => this.onDragStart(event),
                    move: (event) => this.onDragMove(event),
                    end: (event) => this.onDragEnd(event),
                },
                inertia: this.inertiaEnabled,
                modifiers: [this.draggableModifiers],
            }
        },
    },
    methods: {
        /**
         * Runs when a drag event is started
         * @param {Interact.DragEvent} event
         */
        onDragStart (event) {
            event.interactable.detailsWidth = this.employeeDetailsWidth() - 1
            event.interactable.totalsWidth = this.employeeTotalsWidth()
            event.interactable.employeeFrequencyWidth = this.isStandardShifts ? this.employeeFrequencyWidth() : 0
            this.addClone()
        },

        /**
         * Handles the draggging logic
         * @param {Interact.DragEvent} event
         */
        onDragMove (event) {
            const { detailsWidth, totalsWidth, employeeFrequencyWidth } = event.interactable
            this.isDragging = true
            this.interactPosition.x += event.dx
            this.interactPosition.y += event.dy
            const positionTranslate = () => {
                if (this.isDayView) {
                    return `translate(${this.interactPosition.x}px, ${this.interactPosition.y}px)`
                }
                return `translateX(${this.interactPosition.x}px)`
            }
            if (event.rect.left >= detailsWidth && (event.rect.left + event.rect.width) <= (window.innerWidth - totalsWidth - employeeFrequencyWidth)) {
                event.target.style.transform = positionTranslate()
            }
            this.$emit('dragging', true)
            const targetRect = event.target.getBoundingClientRect()
            if (this.isDayView) {
                const realLeft = (targetRect.x - detailsWidth) + this.mainEl().scrollLeft
                const newLeftMinutes = this.roundNearest((realLeft / this.timeBoxWidth) * 60, 15)
                this.initialTimes.from = this.$moment.duration({ minutes: newLeftMinutes }).format('HH:mm')
                const shiftDuration = this.$moment.duration(this.$moment(this.localShift.end_datetime).diff(this.$moment(this.localShift.start_datetime))).asMinutes()
                const from = this.$moment(this.localShift.start_datetime).setTime(this.initialTimes.from)
                const to = from.clone().add(shiftDuration, 'minutes')
                this.initialTimes.to = to.shortTime()
                const suggestedBreak = this.suggestedBreak(from, to, this.employee.age)
                if (suggestedBreak && this.localShift.breaks.length && (suggestedBreak.duration !== this.localShift.breaks[0].duration)) {
                    this.initialTimes.break = suggestedBreak.duration
                }
                this.setShiftWarningSnackbar(from, to)
                this.setDraggingOverlaps(from, to, this.selectedGridAccount())
            } else {
                const dayOfWeek = this.draggedIsoWeekday(event)
                const from = this.$moment(event.target.dataset.startDateTime)
                this.dragToDay = from
                if (dayOfWeek !== from.isoWeekday()) {
                    this.dragToDay = from.isoWeekday(dayOfWeek)
                }
                const newFrom = this.dragToDay.clone().setTime(this.initialTimes.from)
                const newTo = this.dragToDay.clone().setTime(this.initialTimes.to)
                this.setShiftWarningSnackbar(newFrom, newTo)
                this.setDraggingOverlaps(newFrom, newTo, this.selectedGridAccount())
            }
        },

        /**
         * Handles what happens after the drag action is finished
         * @param {Interact.DragEvent} event
         */
        onDragEnd (event) {
            this.removeClone()
            if (this.shiftPendingSubstituteRequest(this.localShift) && !this.isActive) {
                this.shiftConfirmation = {
                    show: true,
                    event,
                    shift: this.localShift,
                    text: this.$t('pages.scheduling.substituteRequests.overrideExisting'),
                }
                return
            }
            this.handleDragged(event)
        },

        draggedIsoWeekday (event) {
            const floor = (val) => {
                return Math.floor(val)
            }
            const targetRect = event.target.getBoundingClientRect()
            const employeesLeft = event.interactable.detailsWidth
            const padding = 5
            const dayOfWeek = floor((floor(targetRect.left) + floor(this.mainEl().scrollLeft) - employeesLeft - padding) / floor(this.timeBoxWidth)) + 1
            return dayOfWeek
        },

        /**
         * Handles the logic for drag event.
         * Calculates and sets the times needed for display, while being dragged around
         * Emits 'dragged' when drag action is finished
         */
        async handleDragged (event) {
            this.$emit('dragging', false)
            this.isDragging = false
            event.shift = this.localShift
            event.backupShift = this.backupShift
            event.rowIndex = this.rowIndex + event.steps
            const newEmployee = this.selectedGridAccount()
            let from = this.$moment(this.localShift.start_datetime)
            let to = this.$moment(this.localShift.end_datetime)
            let shiftStartAndEndsAnotherDay = false
            let insideWeekGrid = true
            if (this.isDayView) {
                from = from.clone().setTime(this.initialTimes.from)
                to = to.clone().setTime(this.initialTimes.to)
            } else {
                const dayOfWeek = this.draggedIsoWeekday(event)
                if (dayOfWeek !== from.isoWeekday()) {
                    from = from.isoWeekday(dayOfWeek)
                    to = to.isoWeekday(dayOfWeek)
                    shiftStartAndEndsAnotherDay = true
                }
                if (dayOfWeek < 1 || dayOfWeek > 7) {
                    insideWeekGrid = false
                }
            }
            const differentEmployeeAssignment = newEmployee.account_id !== this.employee.account_id
            if (insideWeekGrid && (from.longApiFormat() !== this.localShift.start_datetime || differentEmployeeAssignment)) {
                event.shift.start_datetime = from.longApiFormat()
                event.shift.end_datetime = to.longApiFormat()
                if (!event.shift.nonProductive) {
                    event.shift = this.setBreak(this.$moment(from.longApiFormat()), this.$moment(to.longApiFormat()), event.shift)
                }
                if (shiftStartAndEndsAnotherDay && event.shift.frequencyId) {
                    const frequencyRow = this.employee.frequencyRows.find(r => r.id === event.shift.frequencyId)
                    if (frequencyRow.to) {
                        event.shift.last_occurrence = frequencyRow.to.isoWeekday(to.isoWeekday()).apiFormat()
                    }
                }
                await this.setShiftOverlapsShift(event.shift)
                await this.updateLocalShiftInstance(event.shift)
                await this.saveDraggedAction({ ...event, shiftStartAndEndsAnotherDay }, newEmployee)
                this.$emit('dragged', event)
            } else {
                // this is when we do not need to move or resize the shift
                // so we update to the original again with key, in order to re-mount on the original position
                await this.softUpdate({ ...this.backupShift })
                setTimeout(() => {
                    this.resetInteractable()
                }, 0)
                if (!insideWeekGrid) {
                    this.employee.removeShift(event.shift)
                    this.employee.addShift(event.backupShift)
                    this.updated++
                    this.SET_SNACKBAR({ message: this.baseTranslate('warnings.selectValidWeekday'), warning: true })
                }
            }
        },

        async saveDraggedAction (event, newEmployee) {
            const employee = this.employee
            const { shift, backupShift } = event
            const newAccountId = newEmployee.account_id
            const oldAccountId = shift.notAssigned ? 'not_assigned' : shift.account_id
            const virtualInstance = !shift.shift_instance_id && !shift.notAssigned
            const recurring = Boolean(shift.frequency)

            const dragNotAssignedOnSameRow = oldAccountId === 'not_assigned' && newEmployee.notAssigned
            const dragNotAssignedToAnotherEmployeeRow = oldAccountId === 'not_assigned' && !newEmployee.notAssigned
            const dragAssignedOnSameRow = !newEmployee.notAssigned && newAccountId === oldAccountId
            const dragAssignedToNotAssignedRow = newEmployee.notAssigned && oldAccountId !== 'not_assigned'
            const dragAssignedOnAnotherEmployeeRow = !newEmployee.notAssigned && newAccountId !== oldAccountId

            const dragPayload = { oldAccountId, newAccountId, shift, backupShift, employee, newEmployee }

            const update = async (result) => {
                const resultShift = result.error ? backupShift : result
                this.localShift = { ...resultShift }
                employee.updateShift(resultShift)
                newEmployee.updateShift(resultShift)
                this.resetBlockCoordinates()
                this.setInitialTimes()
                this.updated++
                this.animate({ error: result.error })
                if (!result.error) {
                    this.backupShift = { ...shift }
                    this.updated++
                }
            }

            if (recurring || !virtualInstance) {
                if (dragNotAssignedOnSameRow) {
                    await employee.removeShift(backupShift)
                    employee.addShift(shift)
                    const result = await this.dragNotAssignedShiftOnSameRow(dragPayload)
                    if (result.error) {
                        await employee.removeShift(shift)
                        employee.addShift(backupShift)
                    }
                    await update(result)
                    this.updated++
                } else if (dragNotAssignedToAnotherEmployeeRow) {
                    if (newEmployee.readOnly) {
                        const message = this.baseTranslate('shiftPopover.cannotAssignShiftToReadOnlyEmployee', { name: newEmployee.name })
                        this.setError({ message }, this.backupShift)
                        await update({ error: true })
                        this.resetBlockCoordinates()
                        return
                    }
                    // immediately update the grid to reflect the changes that are about to happen:
                    //      - remove not assigned shift from not-assigned row
                    //      - add employee row shift
                    await employee.removeShift(backupShift)
                    newEmployee.addShift(shift)
                    const result = await this.dragNotAssignedShiftToEmployee(dragPayload)
                    if (!result.error) {
                        // update the shifts with info from the api to add instances as well
                        newEmployee.updateShift(result)
                        this.backupShift = { ...result }
                        update(result)
                    } else {
                        // revert grid changes when error occurs
                        await newEmployee.removeShift(shift)
                        employee.addShift(backupShift)
                        update({ error: true })
                    }
                } else if (dragAssignedOnSameRow) {
                    await employee.removeShift(backupShift)
                    employee.addShift(shift)
                    const result = await this.dragAssignedShiftOnSameRow(dragPayload)
                    if (result.error) {
                        await employee.removeShift(shift)
                        employee.addShift(backupShift)
                    }
                    await update(result)
                    this.updated++
                } else if (dragAssignedToNotAssignedRow) {
                    await employee.removeShift(backupShift)
                    newEmployee.addShift(shift)
                    const result = await this.dragAssignedShiftToNotAssignedRow(dragPayload)
                    if (result.error) {
                        await newEmployee.removeShift(shift)
                        employee.addShift(backupShift)
                    }
                    await update(result)
                    this.updated++
                } else if (dragAssignedOnAnotherEmployeeRow) {
                    if (newEmployee.readOnly) {
                        const message = this.baseTranslate('shiftPopover.cannotAssignShiftToReadOnlyEmployee', { name: newEmployee.name })
                        this.setError({ message }, this.backupShift)
                        update({ error: true })
                        return
                    }
                    shift.account_id = newAccountId
                    await employee.removeShift(backupShift)
                    newEmployee.addShift(shift)
                    const result = await this.assignShiftToAnotherEmployee(dragPayload)
                    if (result.error) {
                        await newEmployee.removeShift(shift)
                        employee.addShift(backupShift)
                    } else {
                        result.recurring = false
                        result.showRecurringIcon = false
                        newEmployee.removeShift(shift)
                        newEmployee.addShift(result)
                    }
                    update(result)
                }
            }
            return true
        },

        setDraggingOverlaps (from, to, employee) {
            this.localShift.overlaps = schedulingHelper.shiftOverlapsNonPlannableMoments({
                ...this.localShift,
                start_datetime: from.longApiFormat(),
                end_datetime: to.longApiFormat(),
            }, {
                rdos: employee.rdoRequests || [],
                availabilities: employee.availabilities || [],
                storeAvailability: employee.storeAvailability || [],
                substituteRequests: employee.approvedSubstituteRequests(from) || [],
            })
        },
    },
}
