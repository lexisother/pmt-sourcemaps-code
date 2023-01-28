export default {
    methods: {
        async initPage (full = true) {
            const payload = { week: this.selectedDate.yearWeekApiFilter(), latest_status: true }
            const weekStatus = await this.getWeekStatus(payload)
            const currentWeeek = weekStatus.find(ws => ws.week === this.selectedDate.isoWeek() && ws.year === this.selectedDate.isoWeekYear())
            if (!currentWeeek || (currentWeeek?.status !== 'closed' && currentWeeek?.status !== 'released')) {
                this.$router.push({ name: 'steerinformation' }).catch(() => { })
            }
            return this.initForeCast({ date: this.selectedDate, full }).then(() => {
                if (!this.steerInformationLoading) {
                    this.updateDefaultDrivers(this.forecastData)
                    this.setEditableFlag(this.forecastData)
                    this.updateRatio(this.forecastData)
                    this.updateSubdepartmentsRatioStore(this.forecastData)
                    this.$moment.locale(this.lang)
                }
            })
        },
    },
}
