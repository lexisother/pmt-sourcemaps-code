const translations = {
    nonEditableProcess: 'non-editable',
    notEditableWhileFetchingNorms: 'Processes cannot be edited while fetching WLP norms.',
    notEditableWhileFetchingNormsPatterns: 'Patterns cannot be edited while fetching WLP norms.',
    noTimeframesForProcess: 'There are no timeframes to edit for this process',
    processTable: {
        headers: {
            department: 'Department',
            process: 'Activity',
            actions: 'Actions',
            total: 'Total',
        },
        tooltips: {
            goToDay: 'Got to {0} processes',
        },
    },
    dayProcessTable: {
        headers: {
            department: 'Department',
            process: 'Process',
            startEndTime: 'From -To',
            duration: 'Hours',
            actions: 'Actions',
        },
    },
    distributionTable: {
        headers: {
            department: 'Department',
            pattern: 'Pattern',
            actions: 'Actions',
            total: 'Total',
        },
        errors: {
            totalsNeedToBe100: 'All totals need to be 100%',
        },
        tooltips: {
            calculatedDistributionPattern: 'Calculated - {0}',
            missingProfile: 'Pattern not known in PMT. The WLP2 configurations are not up to date.',
            normTotalHours: 'Norm total hours',
            noProcessesUseThisPattern: 'No processes are using this pattern.',
        },
        normHours: 'Norm hours',
        saved: 'Saved',
        linkedProcesses: 'Linked processes',
    },
    totalProcessRows: '{0} activities',
    totalPatternRows: '{0} patterns',
    totalBudgetedHours: 'Total Budgeted Hours',
    workloadNeedsSync: 'The data is outdated. Fetch norms to update.',
    fetchNorms: 'Fetch norms from WLP',
    wlpPatterns: 'WLP Patterns',
    normsFetchSuccessfully: 'Norms fetched successfully !',
    timeframesSaves: 'Timeframes saved !',
    discardChangesConfirmationMessage: 'Are you sure you want to discard the changes?',
    applyProfileToDistributionConfirmationMessage: 'Are you sure you want to use the profile values as the patern distribution for this week? All values will be overwritten.',
    chooseSaveOptionMessage: 'Choose how you want to save. You can choose both options.',
    chooseAtLeastOneSaveOption: 'Choose at least one option.',
    showAll: 'Show all',
    hideAll: 'Hide all',
    timeframes: {
        form: {
            duplicateStartTimes: 'Duplicate start times detected',
        },
    },
    backToWorkload: 'Back to Workload',
    applyProfile: 'Apply profile values to patterns',
    applyProfileShort: 'Apply profile',
    saveAsProfile: 'Save as profile',
    saveAndSaveAsProfile: 'Save and Save as profile',
    profile: 'Profile',
    emptyState: {
        weekNotReleasedTitle: 'Nothing to do here !',
        weekNotReleasedSubTitle: 'This week has not yet been released.',
    },
    weekStatuses: {
        closed: 'Closed',
        draft: 'Draft',
        released: 'Released',
    },
    statusInfoTable: {
        weekStatus: 'Week Status',
        changedBy: 'Changed by',
        changedOn: 'Changed on',
    },
    timeframesInfo: {
        aboutButton: 'About timeframes',
        header: 'About editing timeframes',
        clickToClose: 'Click anywhere to close',
        saving: {
            title: 'Adding timeframes',
            body: 'Within each process you can use up to 3 timeframes per day of the week, each with its own percentage of the workload for that day. You can add a timeframe with the +-button. The percentage distribution you choose will also be applied in future weeks, until you decide to change it.',
        },
        adding: {
            title: 'Setting a timeframe',
            body: 'Each timeframe contains a percentage and number of hours. The percentage indicates which part of the total workload for that day belongs to that timeframe. This percentage results in a number of hours. These hours are only stored for the week in which the adjustment was made. The percentages are stored for each future week.',
        },
    },
}
export default translations
