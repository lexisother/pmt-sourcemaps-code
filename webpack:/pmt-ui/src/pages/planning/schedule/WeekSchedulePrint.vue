<template>
    <div class="container">
        <div style="font-size: 20px; font-weight: 700; margin-bottom: 10px; text-align: center;">
            <p>{{ employeeName }}</p>
            <span>{{ $t('ui.singles.week') }} {{ selectedDate.isoWeek() }} {{ selectedDate.isoWeekYear() }}</span>
        </div>
        <table
            id="daygrid"
            class="time-table sticky-header-table"
        >
            <thead>
                <tr class="time-grid-header">
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="day + index"
                        style="min-width: 70px; margin: 0px 5px"
                        colspan="1"
                        class="schedule-header-cells"
                    >
                        <div class="schedule-header-cells-day">
                            <b>{{ $moment(day).format('D, ddd') }}</b>
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid black;">
                    <td
                        colspan="7"
                        style="text-align: center"
                    >
                        <b>{{ $t( 'pages.mySchedule.print.prod' ) }}</b>
                    </td>
                </tr>
                <tr colspan="1">
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="index"
                    >
                        <div
                            v-if="daySchedules(day, accountId) || dayRemark(day, accountId)"
                            style="margin: 5px;"
                        >
                            <ul
                                v-for="(schedules, schedulesIndex) in daySchedules(day, accountId)"
                                :key="schedulesIndex"
                            >
                                <li><b>{{ schedules.department ? schedules.department.department_shortname : schedules.type.name }}</b></li>
                                <li>{{ schedules.startTime }} - {{ schedules.endTime }}</li>
                                <li v-if="schedules.break !== '00:00' && schedules.shiftType !== 'rdo'">
                                    <Coffee
                                        :size="14"
                                        class="break-icon"
                                    /> {{ schedules.break }}
                                </li>
                                <li>{{ schedules.remark }}</li>
                            </ul>
                            <template v-if="dayRemark(day, accountId)">
                                <hr>
                                <ul>
                                    <li>{{ dayRemark(day, accountId).remark }}</li>
                                </ul>
                            </template>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        <table
            id="daygrid"
            class="time-table sticky-header-table"
        >
            <thead>
                <tr class="time-grid-header">
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="day + index"
                        style="min-width: 70px; margin: 0px 5px"
                        colspan="1"
                        class="schedule-header-cells"
                    >
                        <div class="schedule-header-cells-day">
                            <b>{{ $moment(day).format('D, ddd') }}</b>
                        </div>
                    </td>
                </tr>
            </thead>
            <tbody>
                <tr style="border-bottom: 1px solid black; border-top: 1px solid black;">
                    <td
                        colspan="7"
                        style="text-align: center"
                    >
                        <b>{{ $t( 'pages.mySchedule.print.nonProdIndirect' ) }}</b>
                    </td>
                </tr>
                <tr colspan="1">
                    <td
                        v-for="(day, index) in currentWeekDays"
                        :key="index"
                    >
                        <div
                            v-if="accountDayPayrollDetails({ day, accountId })"
                            style="margin: 5px;"
                        >
                            <ul
                                v-for="(nonSchedules, schedulesIndex) in accountDayPayrollDetails({day, accountId})"
                                :key="schedulesIndex"
                            >
                                <li>{{ nonSchedules.hours_type }} - {{ nonSchedules.hours }}</li>
                            </ul>
                        </div>
                        <div
                            v-if="dayIndirectHours({ day, accountId })"
                            style="margin: 5px;"
                        >
                            <ul
                                v-for="(indirect, schedulesIndex) in dayIndirectHours({ day, accountId })"
                                :key="schedulesIndex"
                            >
                                <li>{{ indirect.indirect_taks_code }} - {{ indirect.duration }}</li>
                            </ul>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import scheduleMixin from '@/pages/planning/schedule/resources/scheduleMixin'
import { mapGetters } from 'vuex'
export default {
    name: 'WeekSchedulePrint',
    mixins: [scheduleMixin],
    props: {
        selectedDate: {
            type: Object,
            required: true,
        },
        accountId: {
            type: Number,
            required: true,
        },
        employeeName: {
            type: String,
            required: true,
        },
    },
    computed: {
        ...mapGetters('schedules', {
            dayIndirectHours: 'dayIndirectHours',
            accountDayPayrollDetails: 'accountDayPayrollDetails',
        }),
        currentWeekDays () {
            return this.selectedDate.toCalendarArray('week')
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .container {
        margin: 1em auto;
        max-width: inherit !important;
        .week-schedule-title {
            margin-bottom: 1em;
            text-align: center;
        }
        .week-schedule-current-user {
            display: none;
            text-align: center;
        }
    }
    .info{
        margin: 20px;
        background-color: $shift-bg-color !important;
        border: 1px solid $shift-border-color !important;
        color: #006699 !important;
        .no-result {
            text-align: center;
        }
    }
    table {
        width: 100%;
        thead {
            border-bottom: 1px solid black;
        }
    }
</style>
