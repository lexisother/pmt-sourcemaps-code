<template>
    <table
        :key="datepicker.selectedDate.isoWeekYear()"
        class="animated"
        :class="{'slideInLeft': datepicker.direction === 'left', 'slideInRight': datepicker.direction === 'right'}"
        style="animation-duration: 0.2s;"
    >
        <tbody>
            <tr
                v-for="(weekRow, index) in weeksRows"
                :key="index"
            >
                <template v-for="(week, weekIndex) in weekRow">
                    <td
                        v-if="week.startOf('isoWeek').isoWeekYear() === datepicker.navigationDay.isoWeekYear()"
                        :key="weekIndex"
                        v-tooltip="{
                            content: `${$t('ui.singles.week')} ${week.isoWeek()}, ${week.format('MMMM')} ${week.isoWeekYear()}`,
                            placement: 'top',
                            trigger: 'focus hover click'
                        }"
                    >
                        <PmtButton
                            ref="week"
                            :default="!sameWeek(week)"
                            :primary="sameWeek(week)"
                            :outline="sameWeek(week)"
                            :small="IS_MOBILE"
                            style="min-width: 40px;"
                            :cy_id="`week-${week.isoWeek()}`"
                            @click="onWeekClick(week)"
                        >
                            <slot
                                name="simple-week"
                                :week="week"
                            >
                                {{ week.isoWeek() }}
                            </slot>
                        </PmtButton>
                    </td>
                </template>
            </tr>
        </tbody>
    </table>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {
    name: 'DatepickerWeekGrid',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        weeksRows () {
            return this.datepicker.navigationDay.weeksRange(this.IS_MOBILE)
        },
    },

    methods: {
        sameWeek (week) {
            const selected = this.datepicker.selectedDate
            return week.isoWeek() === selected.isoWeek() && week.isoWeekYear() === selected.isoWeekYear()
        },
        onWeekClick (week) {
            this.setDateAsSelected(week, true)
            if (this.datepicker.handleRoute) {
                this.updateBrowserPath(week)
            }
        },
    },
}
</script>
