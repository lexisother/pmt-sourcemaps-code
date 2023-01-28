<template>
    <table
        :key="datepicker.navigationDay.month() + datepicker.navigationDay.year()"
        v-touch="{left: () => navigate(1), right: () => navigate(-1)}"
        class="date-table animated"
        style="animation-duration: 0.2s; min-height: 225px; min-width: 325px;"
        :class="{
            'slideInLeft': datepicker.direction === 'left',
            'slideInRight': datepicker.direction === 'right'
        }"
    >
        <thead class="date-table-header">
            <tr>
                <th>W</th>
                <th
                    v-for="weekDay in monthWeeks[0]"
                    :key="weekDay.format('dd')"
                >
                    <span
                        ref="dayHeaderText"
                        class="day-header-text"
                    >
                        {{ weekDay.shortDayName() }}
                    </span>
                </th>
            </tr>
        </thead>
        <tbody>
            <template v-for="(week, index) in monthWeeks">
                <DatepickerWeekRow
                    :key="index"
                    ref="weekRow"
                    :options="options"
                    :week="week"
                    v-on="$listeners"
                >
                    <template #week-number="{ date }">
                        <DatepickerWeekNumber
                            :ref="`weekNumber${date.isoWeek()}`"
                            :date="date"
                        >
                            <template #week-number>
                                <slot
                                    name="week-number"
                                    :week="date.isoWeek()"
                                    :date="date"
                                />
                            </template>
                        </DatepickerWeekNumber>
                    </template>
                    <template #day="{ day }">
                        <DatepickerWeekDay
                            :key="day.day()"
                            ref="weekDay"
                            :day="day"
                            :options="options"
                            v-on="$listeners"
                        >
                            <template #day>
                                <slot
                                    name="day"
                                    :day="day"
                                />
                            </template>
                        </DatepickerWeekDay>
                    </template>
                </DatepickerWeekRow>
            </template>
        </tbody>
    </table>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {

    name: 'DatepickerDaysGrid',

    components: {
        DatepickerWeekRow: () => import(/* webpackChunkName: "datepicker" */'./DatepickerWeekRow.vue'),
        DatepickerWeekNumber: () => import(/* webpackChunkName: "datepicker" */'./DatepickerWeekNumber.vue'),
        DatepickerWeekDay: () => import(/* webpackChunkName: "datepicker" */'./DatepickerWeekDay.vue'),
    },

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        monthWeeks () {
            return this.datepicker.navigationDay.toCalendarArray()
        },
    },

    methods: {
        /**
         * Changes the internal datepicker navigation to the next or previous month
         * This is reachable only on mobile swipe
         * @param {Number} step back or forward represented by -1 and 1
         */
        navigate (step) {
            this.update({
                navigationDay: this.datepicker.navigationDay.clone().add(step, 'M'),
                direction: step === -1 ? 'left' : 'right',
            })
        },
    },
}
</script>
