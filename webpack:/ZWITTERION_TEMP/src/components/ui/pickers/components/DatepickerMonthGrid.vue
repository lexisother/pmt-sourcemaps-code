<template>
    <div
        id="month-picker"
        class="month-picker"
    >
        <table
            :key="datepicker.navigationDay.year()"
            class="animated"
            :class="{
                'slideInLeft': datepicker.direction === 'left',
                'slideInRight': datepicker.direction === 'right'
            }"
        >
            <tbody>
                <tr
                    v-for="(rowMonths, index) in months"
                    :key="index"
                >
                    <td
                        v-for="(month, monthIndex) in rowMonths"
                        :key="monthIndex + month.year"
                        class="pa-2"
                    >
                        <PmtButton
                            ref="month"
                            v-ripple
                            style="min-width: 90px;"
                            :default="!sameMonth(month)"
                            :primary="sameMonth(month)"
                            :outline="sameMonth(month)"
                            :disabled="isDisabled(month)"
                            :cy_id="`month-${month.month() + 1}`"
                            @click="selectMonth(month)"
                        >
                            <slot
                                name="month-selection"
                                :month="month"
                            >
                                {{ month.format('MMMM') }}
                            </slot>
                        </PmtButton>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {

    name: 'DatepickerMonthGrid',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        /**
         * Array of months from the current internal navigation year year
         */
        months () {
            return this.$moment().quartelyMonths(this.datepicker.navigationDay.year())
        },
    },

    methods: {
        /**
         * Returns if the month/year is the same as the navigation month/year
         * This is needed for the visual representation of the selected month
         * in the month selection view
         * @param {Object|Moment} month
         */
        sameMonth (month) {
            const sameMonth = month.format('MMMM') === this.datepicker.selectedDate.format('MMMM')
            const sameYear = month.year() === this.datepicker.selectedDate.year()
            // console.log(month.format('MMMM'), sameMonth, sameYear)
            return sameMonth && sameYear
        },
        /**
         * Method for when the month is selected.
         * Depening on the mode and options it will set the current selection or
         * select the month, emit on-select event and update the route
         * Ex: options: {mode: 'month', monthPicker: true, handleRoute: true}
         *      - updates the selected month
         *      - updates the route
         *      - emit on-select
         * Ex: options: {mode: 'week'}
         *      - updates the current datepicker view (selection) to week in order to select a week in that month
         * @param {Object|Moment} month
         */
        selectMonth (month) {
            if (this.datepicker.monthPicker) {
                this.setDateAsSelected(month)
                if (this.datepicker.handleRoute) {
                    this.updateBrowserPath(month)
                }
            } else {
                this.update({
                    navigationDay: month,
                    selection: 'week',
                })
            }
        },
        /**
         * Check if the provided month should be
         * disabled by the minDate or maxDate
         * @param {Object|Moment} month
         * @returns Boolean
         */
        isDisabled (month) {
            if (this.datepicker.minDate) {
                const isBefore = month.isBefore(this.datepicker.minDate.startOf('month'), 'month') && month.year() === this.datepicker.minDate.year()
                const isBeforeYear = month.isBefore(this.datepicker.minDate, 'year')
                return isBefore || isBeforeYear
            }

            if (this.datepicker.maxDate) {
                const isAfter = month.isAfter(this.datepicker.maxDate.startOf('month'), 'month') && month.year() === this.datepicker.maxDate.year()
                const isAfterYear = month.isAfter(this.datepicker.maxDate, 'year')
                return isAfter || isAfterYear
            }
            return false
        },
    },
}
</script>
