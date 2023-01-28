import { mapGetters, mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            filters: 'pageFilters',
        }),
        ...mapState('steerInformation', [
            'hoursSelection',
            'costsSelection',
            'settings',
            'forecastData',
            'turnoverTotal',
            'storeTotal',
            'realizedTurnoverTotal',
            'businessTotal',
            'realizedBusinessTotal',
            'realizedStoreTotal',
            'dataLoaded',
            'columnItems',
            'steerInformationLoading',
            'steerInformationWorkloadLoading',
            'changeTriggered',
            'daysDisabled',
            'weekStatus',
            'intersectionsLoading',
        ]),
        ...mapGetters('scheduling', ['WEEK_STATUS']),
        ...mapGetters(['IS_MOBILE', 'APPLIED_FILTERS_COUNT', 'PAGE_WIDTH']),
        ...mapGetters('steerInformation', [
            'FORECAST',
            'STEER_INFO_MERGED_DEPARTMENT_TYPES',
            'STEER_INFORMATION',
            'EXPORT_DATA',
            'SELECTED_DATE',
            'MAX_RELEASED_DATE',
            'EXPORT_INTERSECTIONS',
            'STEER_INFORMATION_INTERSECTIONS',
            'DEPARTMENT_BASED_ON_ID',
        ]),
        ...mapGetters('auth', ['permissions', 'IS_SUPER_ADMIN', 'PLANNING_BASED_ON_WLP', 'CAN_ACCESS_STEER_INFORMATION', 'CAN_READ_STEER_INFORMATION', 'CAN_READ_STEER_INFORMATION_DASHBOARD']),
        ...mapGetters('locale', {
            lang: 'getLocale',
        }),
        ...mapGetters('departments', {
            departments: 'all',
        }),
        ...mapGetters('auth', {
            // PermissionGetters
            CAN_EDIT_TURNOVERS: 'CAN_EDIT_TURNOVERS',
            CAN_PROCESS_TURNOVER_API_DATA: 'CAN_PROCESS_TURNOVER_API_DATA',
            CAN_EDIT_EXTERNAL_TURNOVER: 'CAN_EDIT_EXTERNAL_TURNOVER',
            CAN_ADD_INDIRECT_TASKS: 'CAN_ADD_INDIRECT_TASKS',
        }),
        selectedDate () {
            return this.$moment().fromWeekDayRouteParams(this.$route)
        },
        weekStatus () {
            return this.WEEK_STATUS(this.selectedDate)
        },
        isSelectedDepartment () {
            return this.filters.departments.length > 0
        },
        showBudgetColumn () {
            return this.settings.showBudgetColumn
        },
        showPercentageColumn () {
            return this.settings.showPercentageColumn
        },
        cannotEditRealized () {
            if (this.CAN_EDIT_TURNOVERS) {
                return !this.CAN_PROCESS_TURNOVER_API_DATA
            } else {
                return false
            }
        },
        steerData () {
            return this.STEER_INFORMATION
        },
        forecastData () {
            return this.FORECAST(this.selectedDate).week_forecast_data
        },
        storeIds () {
            return this.getUniqueSubdepartmentsToStore(this.forecastData)
        },
        backupTurnover () {
            return this.forecastData
        },
        showCollapsedMenu () {
            return {
                columnSelector: true,
                sort: false,
                search: false,
            }
        },
        lastDepartmentTypeName () {
            const typesLength = Object.keys(this.steerData.departments).length
            if (typesLength === 3) {
                return 'external'
            }
            if (typesLength === 2) {
                return 'cost'
            }
            return 'turnover'
        },
        headers () {
            return [
                {
                    align: 'start',
                    sortable: false,
                    value: 'name',
                    colspan: 1,
                },
                {
                    text: this.$t('pages.steerInformationPage.headerTurnover'),
                    columnName: '',
                    colspan: 1,
                    subheaders: [
                        { text: this.showBudgetColumn ? this.$t('pages.steerInformationPage.budget') : null, show: this.showBudgetColumn, percentage: false },
                        { text: this.$t('pages.steerInformationPage.expected'), value: 'budget', show: true, percentage: false },
                        { text: this.$t('pages.steerInformationPage.realized'), value: 'realized', show: true, percentage: false },
                        { text: this.$t('pages.steerInformationPage.deviation'), value: 'deviation', show: true, percentage: false },
                    ],
                },
                {
                    text: this.$t('pages.steerInformationPage.headerCosts'),
                    columnName: 'costs',
                    colspan: 1,
                    subheaders: [
                        { text: (this.showBudgetColumn ? `${this.$t('pages.steerInformationPage.budget')}${this.showPercentageColumn ? ' (%)' : ''}` : null), value: 'budget', percentage: false },
                        { text: `${this.$t('pages.steerInformationPage.norm')}${this.showPercentageColumn ? ' (%)' : ''}`, value: 'norm', percentage: false },
                        { text: `${this.$t('pages.steerInformationPage.planned')}${this.showPercentageColumn ? ' (%)' : ''}`, value: 'planned', percentage: false },
                        { text: this.$t('pages.steerInformationPage.deviation'), value: 'deviation', percentage: false },
                    ],
                },
                {
                    text: this.$t('pages.steerInformationPage.hours'),
                    columnName: 'hours',
                    colspan: 1,
                    subheaders: [
                        { text: (this.showBudgetColumn ? this.$t('pages.steerInformationPage.budget') : null), value: 'budget', percentage: false },
                        { text: this.$t('pages.steerInformationPage.norm'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.planned'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.deviation'), value: '', percentage: false },
                    ],
                },
                {
                    text: this.$t('pages.steerInformationPage.headerProductivity'),
                    columnName: '',
                    colspan: 1,
                    subheaders: [
                        { text: (this.showBudgetColumn ? this.$t('pages.steerInformationPage.budget') : null), value: 'budget', percentage: false },
                        { text: this.$t('pages.steerInformationPage.norm'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.planned'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.deviation'), value: '', percentage: false },
                    ],
                },
                {
                    text: this.$t('pages.steerInformationPage.headerKpu'),
                    columnName: '',
                    colspan: 1,
                    subheaders: [
                        { text: (this.showBudgetColumn ? this.$t('pages.steerInformationPage.budget') : null), value: 'budget', percentage: false },
                        { text: this.$t('pages.steerInformationPage.norm'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.planned'), value: '', percentage: false },
                        { text: this.$t('pages.steerInformationPage.deviation'), value: '', percentage: false },
                    ],
                },
            ]
        },
        desktopTopbarItems () {
            return {
                filters: true,
                pastDaysSelector: !this.IS_MOBILE,
                search: true,
                loading: false,
                groupingAndSorting: true,
                collapseAndExpand: true,
            }
        },
    },
}
