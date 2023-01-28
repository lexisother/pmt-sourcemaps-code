import columns from '../../../store/modules/scheduling/data/resourceColumns'
const state = {
    employeeGroupedShifts: {},
    employeeStandardShiftsByAccountId: {},
    employeesFrequencyRows: {},
    weekSchedulingEmployees: {},
    weekSteerInfo: {},
    settings: {
        steerInformation: false,
        steerInformationExtended: false,
        workloadChart: false,
        pendingRdo: false,
        approvedRdo: false,
        approvedSubstituteRequests: false,
        availabilities: false,
        nonAvailabilities: false,
        weekStatus: false,
        employeeTotals: true,
        publishShifts: false,
        wabWarnings: false,
        weekPublishWarnings: false,
        hideUnrelatedDepartmentShifts: false,
        alwaysShowAvailabilityWeekViewEmployeeClick: false,
        alwaysShowRemarksWeekViewEmployeeClick: false,
        alwaysShowAllRemarks: false,
        showNormPlannedHours: true,
        expandMultipleCheckHoursEmployees: false,
        allExpanded: false,
        compactView: false,
    },
    printSettings: {
        showDayRemarks: false,
        showDayTotals: true,
        showDepartmentTotalsTotals: true,
        showProductive: true,
        showNonProductive: true,
        showRdos: true,
        showIndirectTasks: true,
        showNotScheduledEmployees: true,
        hideUnrelatedDepartmentShifts: false,
    },
    weekPublishWarningsFilterAmount: 0,
    employeesPayrollDetailsTotals: {},
    activeContextMenu: null,
    activeEvent: null,
    activeTimeBlock: {
        id: 0,
        x: 0,
        y: 0,
        selected: false,
        showMenu: false,
        event: {},
        animateOrigin: 'top',
        animateTo: 'left',
        nudgeBottom: 0,
        width: 435,
        transition: 'scale-transition',
    },
    newEvent: null,
    expander: {
        expanded: false,
        defaultResourcesWidth: 320,
    },
    defaultTotalsWidth: 195,
    resourceColumns: columns,
    resourceSearch: '',
    mainBackgroundColor: '#C9CED1', // TODO move to more global state and replace by color variable
    selectedEvent: null,
    selectedEmployee: null,
    layoutScroll: {
        top: 0,
        left: 0,
    },
    savingShiftId: null,
    savingShiftError: null,
    storeGroups: [],
    exchangeStores: [],
    groupedExchangeStores: {},
    shiftTypes: {
        NORMAL: 'G',
        EXCHANGE: 'EXCH',
    },
    bookableHourTypes: {},
    bookableHourTypeForeignOptions: {},
    hoveredTimeblock: null,
    weeklyDayRemarks: {},
    weeklyPeriods: {},
    wabCounters: {},
    weekStatuses: {},
    allWeekStatuses: [],
    claSettings: {},
    departmentsWeekStatuses: {},
    lastFinalizedDepartmentWeek: {},
    publishMode: '',
    weekIsLoading: false,
    assessSubstituteRequestShift: {
        show: false,
        shift: {},
    },
    weekIndirectHours: {},
    indirectTaskTypes: [],
    schedulingNotifications: {},
    schedulingWorkloadData: {},
    schedulingWorkloadCompetences: [],
    workloadGraphHeight: 350,
    workloadGraphCanvasHeight: 300,
    workloadGraphCompetencesHeight: 300,
    schedulingWorkloadViews: {
        productive_hours: true,
        workload: true,
    },
    dirtyGrid: null,
    weekDetails: {},
    expandedPanels: [0],
    employeesMaxShiftsCount: {},
    employeesMaxStandardShiftsCount: {},
    todayShifts: {},
    selectedGridStandardShiftsRow: null,
    lastModifiedStandardSchedules: {},
    printDate: null,
    printView: 'week',
    claValidationOutcomes: {},
    claWarningPopover: { x: 0, y: 0, show: false, employee: {} },
    employeesStandardRemarksFrequencyRows: {},
    plannableEmployeesLoadingForShift: null,
    shiftPlannableEmployees: [],
}
export default state