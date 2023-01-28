import interact from 'interactjs' // https://interactjs.io/docs
import mixins from '@/pages/planning/scheduling/resources/mixins'
import drag from './drag'
import resize from './resize'
import htmlHelper from '@/libraries/htmlHelper'
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    mixins: [mixins, drag, resize],

    data () {
        return {
            el: null, // original timeblock elements
            isDragging: false,
            draggingKey: 0,
            isResizing: false,
            interactPosition: {
                x: 0,
                y: 0,
            },
            // enables inertia for the actionable elements
            // see interactable.js docs for more
            inertiaEnabled: true,
            initialRect: null,
            interactable: null,
        }
    },

    computed: {
        /**
         * Returns the snap amount in week and day view conditions
         */
        snapAmount () {
            if (!this.isDayView) {
                return {
                    x: this.timeBoxWidth,
                    y: 1,
                }
            }
            return {
                x: this.timeBoxWidth / 4,
                y: 61,
            }
        },

        /**
         * Checks if a timeblock can be resized or dragged
         */
        isActionable () {
            if (this.localShift.nonProductive && this.isDayView) return false
            if (this.localShift.readOnly) return false
            if (this.weekIsClosed) return false
            if (this.SHOW_SENT_SCHEDULES) return false
            if (this.isCheckHours) return false
            return true
        },
    },

    mounted () {
        this.$nextTick(() => {
            this.setInteractable()
        })
    },

    beforeDestroy () {
        this.destroyIntractable()
    },

    watch: {
        timeBoxWidth: {
            handler (newVal) {
                if (!this.interactable) return
                const x = this.isDayView ? newVal / 4 : newVal
                const y = this.isDayView ? 61 : 1
                this.interactable.options.drag.snap.targets = [
                    interact.createSnapGrid({ x, y }),
                ]
            },
        },
    },

    methods: {
        mainEl () {
            return document.querySelector('#main')
        },

        async setInteractable () {
            let query = `.planning-shift[data-shift-guid="${this.localShift.guid}"]`
            if (this.filters.groupByDepartment && !this.$route.meta.standard_shifts_account_id) {
                query += `[data-group-department-id="${this.$el.dataset.groupDepartmentId}"]`
            }
            const queryElement = await htmlHelper.waitForElement(query)
            this.el = queryElement
            if (this.el && (this.isDraggable || this.isResizable)) {
                this.initialRect = this.el.getBoundingClientRect()
                this.interactable = interact(this.el)
                if (this.isDraggable && !this.isResizable) {
                    this.interactable.draggable(this.draggableOptions)
                } else if (!this.isDraggable && this.isResizable) {
                    this.interactable.resizable(this.resizableOptions)
                } else if (this.isDraggable && this.isResizable) {
                    this.interactable
                        .draggable(this.draggableOptions)
                        .resizable(this.resizableOptions)
                }
            }
        },

        /**
         * Re-sets the interactable properties of the time block
         */
        resetInteractable () {
            this.$nextTick(() => {
                this.setInteractable()
            })
        },

        destroyIntractable () {
            const el = this.$el
            if (interact.isSet(el)) {
                setTimeout(() => {
                    interact(el).unset()
                }, 0)
            }
        },

        /**
         * Adds a clone node to the DOM when resizing or dragging.
         * This is just for a visual representation of the original element
         * This will be an absolutely positioned cloned shift element
         * to the main grid in order to not mess up the positioning
         * of the original shift elements in the grid.
         */
        addClone () {
            const originalRect = this.el.getBoundingClientRect()
            const clone = this.el.cloneNode(true)
            clone.style.width = originalRect.width + 'px'
            clone.style.top = originalRect.y + 'px'
            clone.style.left = originalRect.x + 'px'
            clone.style.position = 'fixed'
            clone.classList.add('clone')
            const mainGrid = document.querySelector('.main-grid')
            mainGrid.prepend(clone)
        },

        /**
         * Removes the added clone from the DOM
         */
        removeClone () {
            const clone = document.querySelector('.clone')
            clone?.remove()
        },

        roundNearest (number, increment) {
            return Math.round(number / increment) * increment
        },

        suggestedBreak (from, to, age) {
            return this.BREAK_SUGGESTION(from, to, age) || this.localShift.breaks[0]
        },

        setBreak (from, to, shift) {
            const suggestedBreak = this.suggestedBreak(from, to, this.employee.age)
            if (suggestedBreak && shift.breaks.length && (suggestedBreak.duration !== shift.breaks[0].duration)) {
                this.initialTimes.break = suggestedBreak.duration
                const { breaks, duration } = schedulingHelper.updateShiftBreaksAndDuration(shift, [suggestedBreak])
                return {
                    ...shift,
                    breaks,
                    duration,
                }
            } else {
                return shift
            }
        },

        employeeDetailsWidth () {
            return Number(getComputedStyle(document.documentElement).getPropertyValue('--scheduler-resources-width').replace('px', ''))
        },

        employeeTotalsWidth () {
            const gridElement = document.querySelector('.planning-grid')
            const prop = '--employee-totals-width'
            return Number(getComputedStyle(gridElement).getPropertyValue(prop, true).replace('px', ''))
        },

        employeeFrequencyWidth () {
            const gridElement = document.querySelector('.planning-grid')
            const prop = '--employee-standard-shifts-frequency-width'
            return Number(getComputedStyle(gridElement).getPropertyValue(prop, true).replace('px', ''))
        },

        async animate ({ error = false } = {}) {
            this.$el.classList.add('animated')
            this.$el.classList.add(error ? 'headShake' : 'pulse')
            await this.$sleep(350)
            this.$el.classList.remove('animated')
            this.$el.classList.remove(error ? 'headShake' : 'pulse')
        },

    },

}
