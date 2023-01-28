const state = {
    employees: {},
    exchangeEmployees: {},
    employeeStandardShiftsByAccountId: {},
    shiftPlannableEmployees: [],
    departments: {},
    allStructuresDepartments: [],
    loading: {
        employees: false,
        departments: false,
        shifts: false,
        standardShifts: false,
        accountShifts: false,
        accountStandardShifts: false,
        standardRemarks: false,
        accountStandardRemarks: false,
        storeGroups: false,
        availabilities: false,
        rdoRequests: false,
        substituteRequests: false,
        businessTimes: false,
        contractData: false,
        contracts: false,
        weekRemarks: false,
        accountWeekRemarks: false,
        wabCounters: false,
        accountWabCounters: false,
        claSettings: false,
        wageInfo: false,
        balances: false,
        clavalidationOutcomes: false,
        week: false,
        indirectTasks: false,
        plannableEmployees: false,
        sentSchedules: false,
        sentDayRemarks: false,
        weeksets: false,
        steerInfo: false,
        finalizedDepartmentStatus: false,
        shiftCalculation: false,
        closeWeekNotifications: false,
        closingWeek: false,
        weekStatus: false,
        planningData: false,
        employeeData: false,
        storeData: false,
        shiftSurcharges: false,
        saveShiftSurcharge: false,
        excelDownload: false,
        employeeDepartments: false,
    },
    saving: {
        createDayRemark: false,
        updateDayRemark: false,
        deleteDayRemark: false,
        changeIndirectHours: false,
        addIndirectHours: false,
        deleteIndirectHours: false,
    },
    storeGroups: [],
    exchangeStores: [],
    groupedExchangeStores: {},
    showSentSchedules: false,
    departmentStatusHistoryId: null,
    sentShiftInstances: {},
    sentDayRemarks: {},
    claValidationOutcomes: {},
    customTimeFromKeyboard: '',
    showSearch: false,
    dayTotalsSteerType: 'productive_hours',
    shiftCalculation: {},
    copiedShift: null,
    hoveredDay: {
        day: null,
        available: true,
    },
    hoveredTime: {
        time: null,
        available: true,
    },
    additionalSnackbarSetting: null,
    mobilePlanningSwipeDirection: 'right',
    employeesWabWarnings: {},
    weekIndirectHours: {},
    closeWeekNotifications: {},
    closeWeekEmployeesNotifications: {},
    weekCloseNotificationSnackbar: false,
    planningData: {},
    storeData: {},
    employeeDepartments: {},
    shiftBreakSuggestions: [],
    standardShiftEmployee: {},
    lastModifiedStandardShift: null,
    currentWeekEmployeeDepartments: {},
    fetchedDepartmentSentShiftHistory: [],
    fetchedDepartmentSentDayRemarksHistory: [],
}
export default state
