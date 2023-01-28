
const state = {
    mergedInformationAndDepartmentTypes: [],
    dataLoaded: false,
    departmentTypes: [],
    columnsToExport: [],
    steerInformationIntersections: {},
    intersectionsLoading: false,
    steerInformation: [],
    forecastData: {},
    searchString: '',
    turnoverTotal: 0,
    changeTriggered: false,
    steerInformationLoading: false,
    steerInformationWorkloadLoading: false,
    businessTotal: 0,
    storeTotal: 0,
    fieldName: '',
    productiveHoursNormActualTotal: 0,
    realizedTurnoverTotal: 0,
    realizedBusinessTotal: 0,
    realizedStoreTotal: 0,
    wageCostsTotalPlanned: 0,
    wageCostsTotalActual: 0,
    wageCostsTotalDeviation: 0,
    wageHoursTotalPlanned: 0,
    wageHoursTotalActual: 0,
    wageHoursTotalDeviation: 0,
    weekStatus: true,
    weekStatuses: [],
    allSelected: false,
    maxReleasedDate: null,
    settings: {
        showBudgetColumn: false,
        showPercentageColumn: false,
        hoursSelection: ['productive'],
        costsSelection: ['productive'],
    },
    columnItems: [
        {
            name: 'budget',
            checked: false,
        },
        {
            name: 'percentage',
            checked: false,
        },
    ],
    hoursSelection:
        [
            {
                name: 'productive',
                checked: false,
                value: 'Productive',
            },
            {
                name: 'illness',
                checked: false,
                value: 'Illness',
            },
            {
                name: 'non_productive',
                checked: false,
                value: 'Non productive',
            },
        ],
    costsSelection:
        [
            {
                name: 'productive',
                checked: false,
                value: 'productive',
            },
            {
                name: 'illness',
                checked: false,
                value: 'illness',
            },
            {
                name: 'non_productive',
                checked: false,
                value: 'Non productive',
            },
        ],
    daysDisabled: [],

}
export default state
