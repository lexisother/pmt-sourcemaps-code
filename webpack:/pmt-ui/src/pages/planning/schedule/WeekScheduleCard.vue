<template>
    <Card
        :key="day.isoWeek()"
        ref="card"
        :header-class="{highlight: day.isToday()}"
        :body-style="{minHeight: '150px'}"
        class="day-schedule"
        :flipable="isFlippable"
        :flipable-text-open="openBackCoverTooltipText"
        :flipable-text-close="$t('pageTitles.mySchedule')"
    >
        <div slot="header">
            <div
                class="day-number"
                :class="{'day-number--small': parseInt(day.format('D')) < 10}"
            >
                {{ day.format('D') }}
            </div>
            <div class="calendar-day px-2">
                <h2 class="date">
                    <span class="day-name">{{ day.format('dddd') }}</span>
                    <span class="month-name">{{ day.format('MMMM') }}, {{ day.format('YYYY') }}</span>
                </h2>
            </div>
        </div>
        <div
            v-if="!dayShifts || !dayShifts.length"
            slot="empty-body"
        >
            <EmptyState
                ref="emptyState"
                :show="true"
                no-padding
                component="no-schedule"
                style="opacity: 0.8"
                :title="$t('entities.shift.noShift')"
                size="100"
            />
        </div>
        <div
            v-else
            slot="body"
            class="pa-1"
        >
            <Shifts
                :day="day"
                :shifts="dayShifts"
            />
        </div>
        <div
            v-if="dayRemark(day, scheduleEmployeeId)"
            slot="actions"
        >
            <ul class="remarks">
                <li class="remark">
                    <div>
                        <MessageTextOutline :size="16" />
                        {{ dayRemark(day, scheduleEmployeeId).remark }}
                    </div>
                </li>
            </ul>
        </div>
        <div
            v-show="payroll || indirectHours.length > 0"
            slot="back"
        >
            <ul class="non-shifts">
                <li
                    v-if="filteredPayroll('surcharge').length"
                    class="tags"
                >
                    <div class="header">
                        {{ $t('entities.shift.surcharge') }}
                    </div>
                    <Chip
                        v-for="(tag, index) in filteredPayroll('surcharge')"
                        :key="index"
                        v-tooltip="tag.description"
                        :text="tagText(tag, true)"
                        raised
                        success
                        outline
                    />
                </li>
                <li
                    v-if="filteredPayroll('non_productive').length"
                    class="tags"
                >
                    <div class="header">
                        {{ $t('entities.shift.nonProductive') }}
                    </div>
                    <Chip
                        v-for="(tag, index) in filteredPayroll('non_productive')"
                        :key="index"
                        v-tooltip="tag.description"
                        :text="tagText(tag, false)"
                        raised
                        simple
                    />
                </li>
                <li
                    v-if="indirectHours.length"
                    class="tags"
                >
                    <div class="header">
                        {{ $t('entities.shift.indirectHours') }}
                    </div>
                    <Chip
                        v-for="(tag, index) in indirectHours"
                        :key="index"
                        v-tooltip="tag.indirect_taks_description"
                        :text="`${tag.indirect_taks_code}: ${tag.duration}`"
                        raised
                        simple
                    />
                </li>
                <li
                    v-if="payrollTotals"
                    class="tags"
                >
                    <div class="header">
                        {{ $t('entities.shift.productive') }}
                    </div>
                    <Chip
                        v-tooltip="'total-booked'"
                        :text="payrollTotals.productive"
                        raised
                        simple
                    />
                </li>
            </ul>
        </div>
    </card>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import scheduleMixin from '@/pages/planning/schedule/resources/scheduleMixin'
export default {
    name: 'WeekScheduleCard',

    components: {
        Shifts: () => import(/* webpackChunkName: "week-schedule" */'./Shifts.vue'),
    },

    mixins: [scheduleMixin],

    props: {
        day: {
            type: Object,
            required: true,
        },
    },

    computed: {
        ...mapState('schedules', {
            scheduleEmployeeId: 'scheduleEmployeeId',
        }),
        ...mapGetters('schedules', {
            daySchedule: 'daySchedule',
            accountPayrollDetailsDayTotals: 'accountPayrollDetailsDayTotals',
            dayIndirectHours: 'dayIndirectHours',
            accountDayPayrollDetails: 'accountDayPayrollDetails',
        }),
        ...mapGetters('departments', {
            employeeWeekDepartments: 'employeeWeekDepartments',
        }),

        /**
         * Returns the shifts for current card date
         *
         * @returns {[*]|*}
         */
        dayShifts () {
            return this.daySchedules(this.day, this.scheduleEmployeeId)
        },

        /**
         * Returns week departments of current user.
         */
        weekDepartments () {
            const { year, week } = this.day.weekYearObject()
            const accountId = this.scheduleEmployeeId
            return this.employeeWeekDepartments({ accountId, year, week })
        },

        payroll () {
            return this.accountDayPayrollDetails({
                day: this.day,
                accountId: this.scheduleEmployeeId,
            })
        },
        indirectHours () {
            return this.dayIndirectHours({ day: this.day, accountId: this.scheduleEmployeeId })
        },
        payrollTotals () {
            return this.accountPayrollDetailsDayTotals({
                accountId: this.scheduleEmployeeId,
                day: this.day,
            })
        },
        openBackCoverTooltipText () {
            const result = []
            this.payroll.forEach(tag => {
                if (tag.categories.find(elem => { return elem === 'surcharge' })) {
                    if (!result.includes(this.$t('entities.shift.surcharge'))) {
                        result.push(this.$t('entities.shift.surcharge'))
                    }
                }
                if (tag.categories.find(elem => { return elem === 'non_productive' })) {
                    if (!result.includes(this.$t('entities.shift.nonProductive'))) {
                        result.push(this.$t('entities.shift.nonProductive'))
                    }
                }
            })
            if (this.indirectHours.length) {
                if (!result.includes(this.$t('entities.shift.indirectHours'))) {
                    result.push(this.$t('entities.shift.indirectHours'))
                }
            }
            if (this.payrollTotals) {
                if (this.payrollTotals.productive !== '00:00' && !result.includes(this.$t('entities.shift.productive'))) {
                    result.push(this.$t('entities.shift.productive'))
                }
            }
            return result.join(', ')
        },

        isFlippable () {
            const hasProductiveDetails = this.dayShifts ? (this.openBackCoverTooltipText.includes(this.$t('entities.shift.productive')) ? this.dayShifts.length > 0 : true) : false
            return (this.payroll.length > 0 || this.indirectHours.length > 0 || !!this.payrollTotals) && hasProductiveDetails
        },
    },

    async mounted () {
        await this.getWeekDepartmentsForEmployee({
            date: this.day,
            accountId: this.scheduleEmployeeId,
        })
    },

    methods: {
        ...mapActions('departments', {
            getWeekDepartmentsForEmployee: 'getWeekDepartmentsForEmployee',
        }),

        /**
         * Returns the text to be rendered in non-productive / surcharge chip.
         * Format is "hours_type: hours_amount [department_short_name]"
         * where department_short_name is displayed only for surcharges if hours are linked to a department.
         *
         * @param tag
         * @param surcharge
         * @returns {string}
         */
        tagText (tag, surcharge) {
            let depName = ''
            if (surcharge && tag.department_id && this.weekDepartments) {
                const department = this.weekDepartments.find(dep => {
                    return parseInt(dep.department_id) === parseInt(tag.department_id)
                })
                depName = department ? department.department_shortname : ''
            }
            return `${tag.hours_type}: ${tag.hours} ${depName}`
        },

        filteredPayroll (filter) {
            return this.payroll
                ? this.payroll.filter(tag => {
                    return tag.categories.find(elem => { return elem === filter })
                })
                : []
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    @import '@/assets/scss/mixins/shift.scss';
    @import '@/assets/scss/mixins/remark.scss';
    @import '@/assets/scss/shaddows.scss';

    .day-number, .calendar-day {
        display: inline-block;
        vertical-align: middle;
    }
    .day-number {
        padding: 5px;
        font-size: 1.8em;
        font-weight: 700;
        height: 100%;
        &--small {
            padding: 5px 12px !important;
        }
    }
    .month-name {
        display: block;
        font-size: 70%;
    }
    .today {
        background-color: $shift-bg-color;
    }
    .date {
        font-size: 1.3rem;
        font-weight: 400;
        line-height: 1em;
        margin: 0;
    }
    .remarks {
        padding: 0;
    }

    .remark {
        h3 {
            margin-bottom: .3em;
            font-size: 1rem;
            font-weight: 400;
        }
        line-height: 1.5em;
    }

    .surcharges{
        margin-top: 0;
    }

    .remark {
        @include remark;
    }
    @media screen and (min-width: 800px) {
        .cards .card {
            .date {
                font-size: 1.2rem;
                font-weight: 600;
            }
            .day-name {
                display: block;
                margin-bottom: .2em;
                font-size: 1rem;
                font-weight: 400;
            }
            .shift .department {
                width: 100%;
                font-size: .9rem;
            }
        }
    }
    @media print and (orientation: landscape) {
        .cards {
            display: flex;
            justify-content: space-between;
            .card {
                flex-basis: 6cm;
            }
        }
    }
    .non-shifts {
        padding: 0 10px!important;
    }
</style>
