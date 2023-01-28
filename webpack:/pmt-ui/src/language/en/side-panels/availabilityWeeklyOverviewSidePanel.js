const translations = {
    title: 'Weekly availablity',
    titleShort: 'W. availability',
    backToOverview: 'Back to Overview',
    sections: {
        pending: 'Pending',
        assessed: 'Assessed',
        rejected: 'Rejected',
        comparing: 'comparing',
    },
    actions: {
        approve: 'Approve',
        approveAll: 'Approve all',
        approveSome: 'Approve some',
        createNew: 'Create new',
        reject: 'Reject',
        revoke: 'Delete',
        approveWeeksetInThePast: 'You cannot approve a request with a start date in the past. Edit the request to modify the start date.',
        approveWeeksetInThePastShort: 'Weekset is in the past.',
        yes: 'Yes',
        no: 'No',
        cancel: 'Cancel',
        edit: 'Edit',
        view: 'View',
    },
    tooltips: {
        compare: 'Compare with grid',
        uncompare: 'Remove grid comparison',
        comparing: 'Comparing this weekset availabilities with the grid availabilities.',
    },
    rejectQuestion: 'Are you sure you want to reject the application? Write below why and click send?',
    rejectLabel: 'Remark',
    approveAllQuestionOne: 'All pending requests will be approved.',
    approveAllQuestionTwo: 'Are you sure you want to continue?',
    approveAllSuccess: 'All weeksets were successfuly approved.',
    noWeeksetsFound: 'No requests found',
    emptyWeekset: 'empty',
    emptyWeeksetTooltip: {
        main: 'No availabilities are added for this weekset.',
        editable: 'Edit the weekset to add availabilities.',
    },
    newAvailability: 'New availability',
    createdAt: 'From {0}',
    hasApprovedSet: 'There is already an approved weekset for the chosen week',
}
export default translations
