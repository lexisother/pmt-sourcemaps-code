export default {
    methods: {
        shiftsOnDay (day) {
            return this.employee.allShifts()
                .filter(s => this.$moment(s.start_datetime).apiFormat() === day.apiFormat())
        },
    },
}
