<template>
    <div
        v-if="showCards"
        class="container"
    >
        <h2 class="d-print-none schedule-title">
            <component
                :is="IS_MOBILE ? 'div' : 'span'"
                v-if="$route.meta.manager"
                ref="employeeName"
            >
                <strong>{{ employeeName }}</strong>
                <span v-if="!IS_MOBILE"> - </span>
            </component>
            {{ $t('pages.mySchedule.schedulesFor', {date: selectedDate.weekIntervalReadableFormat()}) }}
        </h2>
        <div :class="cardsClasses">
            <template v-for="day in $moment(selectedDate).toCalendarArray('week')">
                <WeekScheduleCard
                    :key="day.toString()"
                    :day="day"
                />
            </template>
        </div>
        <WeekSchedulePrint
            v-if="print"
            :selected-date="selectedDate"
            :account-id="scheduleEmployeeId"
            :employee-name="employeeName"
            class="d-none d-print-block"
        />
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
export default {
    name: 'WeekSchedule',

    components: {
        WeekScheduleCard: () => import(/* webpackChunkName: "week-schedule" */'./WeekScheduleCard.vue'),
        WeekSchedulePrint: () => import(/* webpackChunkName: "week-schedule" */'./WeekSchedulePrint.vue'),
    },

    props: {
        direction: {
            type: String,
            default: 'right',
        },
        selectedDate: {
            type: Object,
            required: true,
        },
        print: Boolean,
        accountId: {
            type: Number,
            required: true,
        },
    },

    data () {
        return {
            // property used for animation
            showCards: false,
        }
    },

    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('auth', {
            canRequestTimeOff: 'canRequestTimeOff',
            hasTimeOffAccess: 'hasTimeOffAccess',
            showOnlyWorkHoursWeekschedule: 'showOnlyWorkHoursWeekschedule',
        }),
        ...mapGetters('schedules', {
            weekSchedule: 'weekSchedule',
        }),
        ...mapGetters('account', {
            getEmployeeById: 'getEmployeeById',
        }),
        ...mapState('schedules', {
            scheduleEmployeeId: 'scheduleEmployeeId',
        }),
        cardsClasses () {
            return {
                'cards animated d-print-none': true,
                slideInLeft: this.direction === 'left',
                slideInRight: this.direction === 'right',
            }
        },
        employeeName () {
            return this.getEmployeeById(this.scheduleEmployeeId).name
        },
    },

    created () {
        this.fetchDataForWeek()
    },

    methods: {
        ...mapMutations(['SET_SNACKBAR']),
        ...mapActions('schedules', {
            getWeekSchedule: 'getWeekSchedule',
            getPayrollDetails: 'getPayrollDetails',
            getWeekIndirectHours: 'getWeekIndirectHoursForEmployee',
            getWeekRemarks: 'getEmployeeWeekRemarks',
        }),
        ...mapActions('rdoRequests', {
            getYearRdoRequests: 'getEmployeeYearRequests',
        }),
        ...mapActions('departments', {
            getWeekDepartmentsForEmployee: 'getWeekDepartmentsForEmployee',
        }),
        ...mapActions('planning', {
            getStoreGroups: 'getStoreGroups',
        }),

        getSchedules () {
            // only when this is done is the page considered loaded
            this.getWeekSchedule({
                ...this.selectedDate.weekYearObject(),
                start: this.selectedDate.startOf('isoWeek').apiFormat(),
                end: this.selectedDate.endOf('isoWeek').apiFormat(),
                accountId: this.scheduleEmployeeId,
                date: this.selectedDate,
            })
        },

        /**
         * Gets the selected employee RDOs for whole selectedDate year
         * See VUEX action => this should run once per selected year
         */
        getRdos () {
            if (this.hasTimeOffAccess && this.canRequestTimeOff) {
                this.getYearRdoRequests({
                    date: this.selectedDate.startOf('isoWeek').clone(),
                    accountId: this.scheduleEmployeeId,
                    status: 'approved',
                })
            }
        },

        /**
         * Fetches data for current week depending on its status.
         *
         * @returns {Promise<void>}
         */
        async fetchDataForWeek () {
            const calls = []
            const payload = {
                from: this.selectedDate.startOf('isoWeek').apiFormat(),
                to: this.selectedDate.endOf('isoWeek').apiFormat(),
                accountId: this.accountId,
                category: 'non_productive,surcharge',
            }
            this.showCards = false
            this.$emit('loading', true)

            await this.getStoreGroups(this.selectedDate.startOf('isoWeek'))

            if (this.showOnlyWorkHoursWeekschedule) {
                payload.category = 'productive,worked'
            }

            const dateAccountPayload = { date: this.selectedDate, accountId: this.accountId }
            await this.getWeekDepartmentsForEmployee(dateAccountPayload)
            calls.push(this.getRdos())
            calls.push(this.getSchedules())
            calls.push(this.getWeekRemarks(dateAccountPayload))
            calls.push(this.getPayrollDetails(payload))
            calls.push(this.getWeekIndirectHours(dateAccountPayload))
            await Promise.all(calls).then(values => {
                // some other actions if needed with result [values]
            }).catch(error => {
                this.SET_SNACKBAR({ message: error.message, error: true })
                console.error(error)
            }).finally(() => {
                this.showCards = true
                this.$emit('loading', false)
            })
        },
    },
}
</script>

<style lang="scss" scoped>
    .container {
        margin: 1em auto;
        max-width: inherit !important;
    }
</style>
