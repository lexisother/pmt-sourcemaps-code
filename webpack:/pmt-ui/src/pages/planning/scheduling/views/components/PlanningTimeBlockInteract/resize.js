import interact from 'interactjs' // https://interactjs.io/docs
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    computed: {
        /**
         * Checks if an element can be resized
         */
        isResizable () {
            if (!this.isActionable) return false
            if (!this.isDayView) return false
            return !this.localShift.nonProductiveSimple
        },
        /**
         * Resize options
         */
        resiableModifiers () {
            return interact.modifiers.snap({
                actions: ['resizex', 'resizey', 'resizexy', 'resize'],
                mode: 'grid',
                targets: [
                    interact.snappers.grid({ x: this.snapAmount.x, y: this.snapAmount.y }),
                ],
                offset: 'startCoords',
            })
        },
        resizableOptions () {
            return {
                edges: { left: true, right: true },
                invert: 'reposition',
                listeners: {
                    start: (event) => this.onResizeStart(event),
                    move: (event) => this.onResizeMove(event),
                    end: (event) => this.onResizeEnd(event),
                },
                inertia: this.inertiaEnabled,
                modifiers: [this.resiableModifiers],
            }
        },
    },
    methods: {
        /**
         * Runs whenever a resize action is started on a timeblock
         * @param {Interact.ResizeEvent} event
         */
        onResizeStart (event) {
            this.addClone()
        },

        /**
         * Handles the resize left and right logic
         * @param {Interact.ResizeEvent} event
         */
        onResizeMove (event) {
            this.isResizing = true
            let { x } = event.target.dataset
            x = (parseFloat(x) || 0) + event.deltaRect.left
            Object.assign(event.target.style, {
                width: `${event.rect.width}px`,
                transform: `translateX(${x}px)`,
            })
            Object.assign(event.target.dataset, { x })
            if (event.edges.left) {
                this.onLeftResize(event)
            } else if (event.edges.right) {
                this.onRightResize(event)
            }
        },

        /**
         * Handles the left resize logic
         * @param {Interact.ResizeEvent} event
         */
        onLeftResize (event) {
            const targetRect = event.target.getBoundingClientRect()
            const realLeft = (targetRect.x - this.employeeDetailsWidth())
            const newLeftMinutes = this.roundNearest(((realLeft + this.mainEl().scrollLeft) / this.timeBoxWidth) * 60, 15)
            this.initialTimes.from = this.$moment.duration({ minutes: newLeftMinutes }).format('HH:mm')
            const newTimeFrom = this.SELECTED_DATE.startOf('day').setTime(this.initialTimes.from)
            const suggestedBreak = this.suggestedBreak(newTimeFrom, this.$moment(this.localShift.end_datetime), this.employee.age)
            if (suggestedBreak && (suggestedBreak.duration !== this.localShift.breaks[0].duration)) {
                this.initialTimes.break = suggestedBreak.duration
            }
            this.setResizeOverlaps(newTimeFrom, null)
            this.$emit('resizing', event)
            this.setShiftWarningSnackbar(newTimeFrom, this.localShift.end_datetime)
        },

        /**
         * Handles the right resize logic
         * @param {Interact.ResizeEvent} event
         */
        onRightResize (event) {
            const targetWidth = event.rect.width
            const newMinutes = this.roundNearest((targetWidth / this.timeBoxWidth) * 60, 15)
            const newTimeTo = this.$moment(this.localShift.start_datetime).add(newMinutes, 'minutes')
            this.initialTimes.to = newTimeTo.format('HH:mm')
            const suggestedBreak = this.suggestedBreak(this.$moment(this.localShift.start_datetime), newTimeTo, this.employee.age)
            if (suggestedBreak && (suggestedBreak.duration !== this.localShift.breaks[0].duration)) {
                this.initialTimes.break = suggestedBreak.duration
            }
            this.setResizeOverlaps(null, newTimeTo)
            this.$emit('resizing', event)
            this.setShiftWarningSnackbar(this.localShift.start_datetime, newTimeTo)
        },

        /**
         * Handles what happens after the resize action is finished
         * @param {Interact.ResizeEvent} event
         */
        onResizeEnd (event) {
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
            this.confirmResize(event)
        },

        /**
         * This is actually running logic for the resized event
         */
        confirmResize (event) {
            this.isResizing = false
            if (event.edges.left) {
                this.handleLeftResize(event)
            } else if (event.edges.right) {
                this.handleRightResize(event)
            }
        },

        /**
         * Handles the logic for when the timeblock is being resized on the left
         * Calculates and sets the times needed for display, while being resized
         * Emits 'resized' when resize action is finished
         */
        async handleLeftResize (event) {
            event.shift = this.localShift
            event.backupShift = this.backupShift
            const newTimeFrom = this.SELECTED_DATE.startOf('day').setTime(this.initialTimes.from)
            if (newTimeFrom.longApiFormat() !== event.shift.start_datetime && !this.isActive) {
                event.shift.start_datetime = newTimeFrom.longApiFormat()
                if (!event.shift.nonProductive && !event.shift.nonProductiveSimple) {
                    event.shift = this.setBreak(newTimeFrom, this.$moment(event.shift.end_datetime), event.shift)
                }
                this.afterResized(event)
            }
        },
        /**
         * Handles the logic for when the timeblock is being resized on the right
         * Calculates and sets the times needed for display, while being resized
         * Emits 'resized' when resize action is finished
         */
        async handleRightResize (event) {
            event.shift = this.localShift
            event.backupShift = this.backupShift
            const newTimeTo = this.SELECTED_DATE.startOf('day').setTime(this.initialTimes.to)
            if (newTimeTo.longApiFormat() !== event.shift.end_datetime && !this.isActive) {
                event.shift.end_datetime = newTimeTo.longApiFormat()
                if (!event.shift.nonProductive && !event.shift.nonProductiveSimple) {
                    event.shift = this.setBreak(this.$moment(event.shift.start_datetime), newTimeTo, event.shift)
                }
                this.afterResized(event)
            }
        },

        async afterResized (event) {
            const { shift, backupShift } = event
            this.employee.updateShift(shift)
            const result = await this.saveResized({ shift, backupShift })
            const update = async (s, e) => {
                this.employee.updateShift(s)
                this.localShift = { ...s }
                this.$emit('resized', e)
                this.resetInteractable()
                this.updated++
                this.resetBlockCoordinates()
                this.setInitialTimes()
            }
            if (result.error) {
                await update(backupShift, event)
                this.animate({ error: true })
                return
            }
            this.backupShift = { ...shift, ...result }
            await update({ ...shift, ...result }, event)
            this.animate()
        },

        setResizeOverlaps (from, to) {
            const employee = this.selectedGridAccount()
            this.localShift.overlaps = schedulingHelper.shiftOverlapsNonPlannableMoments({
                ...this.localShift,
                start_datetime: from?.longApiFormat() || this.localShift.start_datetime,
                end_datetime: to?.longApiFormat() || this.localShift.end_datetime,
            }, {
                rdos: employee.rdoRequests,
                availabilities: employee.availabilities,
                storeAvailability: employee.storeAvailability,
                substituteRequests: employee.approvedSubstituteRequests(from || this.$moment(this.localShift.start_datetime)),
            })
        },
    },
}
