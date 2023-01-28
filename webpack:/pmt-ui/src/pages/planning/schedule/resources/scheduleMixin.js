import { mapGetters } from 'vuex'
export default {
    computed: {
        ...mapGetters('rdoRequests', {
            fullDayEmployeeRdoRequest: 'fullDayEmployeeRdoRequest',
        }),
        ...mapGetters('schedules', {
            daySchedule: 'daySchedule',
            getDayRemark: 'dayRemarksForEmployee',
        }),
    },
    methods: {
        daySchedules (day, accountId) {
            return this.daySchedule({
                ...day.dayWeekYearObject(),
                accountId: accountId,
            })
        },
        dayRemark (date, accountId) {
            return this.getDayRemark({ date, accountId })
        },
    },
}
