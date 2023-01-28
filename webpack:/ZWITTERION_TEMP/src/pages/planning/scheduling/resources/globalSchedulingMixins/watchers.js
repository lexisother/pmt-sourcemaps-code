export default {
    watch: {
        'filters.hideEmployeesWithSchedules': {
            handler (newVal) {
                if (newVal && this.filters.hideEmployeesWithoutSchedules) {
                    // remove hideEmployeesWithoutSchedules filter
                    this.UPDATE_PAGE_FILTER({ filter: 'hideEmployeesWithoutSchedules', value: false })
                }
            },
        },
        'filters.hideEmployeesWithoutSchedules': {
            handler (newVal) {
                if (newVal && this.filters.hideEmployeesWithSchedules) {
                    // remove hideEmployeesWithSchedules filter
                    this.UPDATE_PAGE_FILTER({ filter: 'hideEmployeesWithSchedules', value: false })
                }
            },
        },
        'filters.hideEmployeesWithStandardSchedules': {
            handler (newVal) {
                if (newVal && this.filters.hideEmployeesWithoutStandardSchedules) {
                    // remove hideEmployeesWithoutStandardSchedules filter
                    this.UPDATE_PAGE_FILTER({ filter: 'hideEmployeesWithoutStandardSchedules', value: false })
                }
            },
        },
        'filters.hideEmployeesWithoutStandardSchedules': {
            handler (newVal) {
                if (newVal && this.filters.hideEmployeesWithStandardSchedules) {
                    // remove hideEmployeesWithStandardSchedules filter
                    this.UPDATE_PAGE_FILTER({ filter: 'hideEmployeesWithStandardSchedules', value: false })
                }
            },
        },
    },
}
