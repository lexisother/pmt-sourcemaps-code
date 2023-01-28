<template>
    <tr
        :id="`week${week[0].isoWeek()}`"
        ref="week"
        :class="classes"
        :cy_id="`week-${week[0].isoWeek()}`"
        @click="click"
    >
        <slot
            name="week-number"
            :date="week[0]"
        />
        <template v-for="day in week">
            <slot
                name="day"
                :day="day"
            />
        </template>
    </tr>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {
    name: 'DatepickerWeekRow',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
        week: {
            type: Array,
            default: () => ([]),
        },
    },

    computed: {
        /**
         * The class list of each week row
         * @returns Object
         */
        classes () {
            const day = this.week[0]
            const sameWeek = this.datepicker.localSelectedDate.isoWeek() === day.isoWeek()
            const sameYear = this.datepicker.localSelectedDate.isoWeekYear() === day.isoWeekYear()
            let disabled = !this.isDateInRange(day)
            if (this.datepicker.enableEvery.value && this.datepicker.enableEvery.weeks && this.datepicker.enableEvery.basedOnDate) {
                const weekDifferences = day.diff(this.datepicker.enableEvery.basedOnDate, 'weeks')
                if (weekDifferences % this.datepicker.enableEvery.value !== 0) {
                    disabled = true
                }
            }
            return {
                'week-row': true,
                selected: !disabled && sameWeek && sameYear && this.datepicker.mode === 'week',
                'current-week': this.$moment().isoWeek() === day.isoWeek() && this.$moment().isoWeekYear() === day.isoWeekYear(),
                disabled: disabled,
            }
        },
    },

    methods: {
        /**
         * Action taken when a week row is clicked
         */
        click () {
            const day = this.week[0]
            const disabled = !this.isDateInRange(day)
            if (disabled) return
            // if it's not in week mode, do nothing
            if (this.datepicker.mode !== 'week') {
                return
            }
            // if day is not in range
            // or if tampering with disabled state of the HTML
            // and clicking on a disabled week
            if (!this.isDateInRange(day)) {
                return
            }
            if (day.apiFormat() !== this.datepicker.selectedDate.apiFormat() || this.datepicker.forceSelect) {
                this.update({
                    selectedDate: day,
                    localSelectedDate: day.clone(),
                    navigationDay: day.clone(),
                    show: false,
                })
                this.emitSelect(day)
                if (this.datepicker.handleRoute) {
                    this.updateBrowserPath(day)
                }
            } else {
                this.update({
                    show: false,
                })
            }
        },
    },
}
</script>
