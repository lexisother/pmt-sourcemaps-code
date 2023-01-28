/**
 * see documentation about which columns to show
 * https://rwretailsolutions.sharepoint.com/:w:/s/RetailSolutionstotaal/ESjHFEGr_WVCpGIt_qGRjTgBw1pJTrSvBOXAIb9uaJ91WA?e=rlZoC5
 */
// TODO: label translations
export default [
    /**
     * First Name + Last Name
     */
    {
        name: 'name',
        label: 'Name',
        labelShort: 'Name',
        alwaysVisible: true,
        visible: true,
        width: 320,
        align: 'left',
        sortBy: true,
        sortAscending: true,
    },
    /**
     * Employee FirstName. This column will not be visible in the list of employee details
     */
    {
        name: 'startTime',
        label: '',
        labelShort: 'Start time',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Employee FirstName. This column will not be visible in the list of employee details
     */
    {
        name: 'employee_first_name',
        label: '',
        labelShort: 'First Name',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Employee FirstName. This column will not be visible in the list of employee details
     */
    {
        name: 'employee_last_name',
        label: '',
        labelShort: 'Last Name',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Employee Number
     */
    {
        name: 'personnel_number',
        label: 'Number',
        labelShort: 'Nr.',
        alwaysVisible: false,
        visible: false,
        width: 75,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Employee LPGU
     */
    {
        name: 'lpgu',
        label: 'LPGU',
        labelShort: 'LPGU',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 62,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Employee age, calculated from date_of_birth
     */
    {
        name: 'age',
        label: 'Age',
        labelShort: 'Age',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 52,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Contract type of the employee (FT, PT, HK etc.)
     */
    {
        name: 'contractType',
        label: 'Contract Type',
        labelShort: 'CT',
        alwaysVisible: false,
        visible: true,
        width: 56,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Total amount of contract hours for a week (0, fixed or min-max)
     */
    {
        name: 'contractHours',
        label: 'Contract Hours',
        labelShort: 'CH',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 63,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Planned productive hours for a week
     */
    {
        name: 'productiveHours',
        label: 'Planned Productive Hours',
        labelShort: 'PRH',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Planned productive hours for a week
     */
    {
        name: 'nonProductiveHours',
        label: 'Planned Non Productive Hours',
        labelShort: 'NPRH',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Total amount of planned hours for that week
     * This can be a calculated column from total shift instances
     */
    {
        name: 'plannedHours',
        label: 'Planned Hours',
        labelShort: 'PH',
        alwaysVisible: false,
        visible: false,
        width: 77,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },

    /**
     * Employee correction hours
     */
    {
        name: 'correction',
        label: 'Correction',
        labelShort: 'CR',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Deviation between contract hours and scheduled hours for a week.
     * A red indicator is displayed when the result of (contract hours – planned hours) is a positive value
     */
    {
        name: 'deviation',
        label: 'Deviation',
        labelShort: 'DEV',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 67,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Showing per user, per week:
     *      Period
     *      Max hours
     *      Hours planned
     *      Percentage planned
     * ex: 48:00 - 51:00 - 03:00 - 106%
     */
    {
        name: 'wab',
        label: 'WAB',
        labelShort: 'WAB',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 100,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Notifying on CAO violations for a week:
     *      A red indicator is displayed to notify the user about violations that cannot be ignored
     *      An orange indicator is displayed to warn the user about violations that can be ignored
     *      The CAO notification itself is displayed when hovering the icon
     */
    {
        name: 'cao',
        label: 'CAO',
        labelShort: 'CAO',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 60,
        align: 'left',
        sortBy: false,
        sortAscending: false,
    },
    /**
     * If there is a comment for a user on a specific day, it is displayed here.
     *      Per comments a maximum of [determine maximum] characters is displayed.
     *      If a comment is longer than that, it is truncated
     *      When truncated, the full comment can be read by hovering the comment.
     */
    {
        name: 'remark',
        label: 'Comments',
        labelShort: 'Comments',
        alwaysVisible: false,
        alwaysHidden: true,
        visible: false,
        width: 110,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Showing all the departments that the user is related to. No department colors are displayed.
     */
    {
        name: 'departments',
        label: 'Departments',
        labelShort: 'Departments',
        resourceName: 'department_name',
        alwaysVisible: false,
        visible: true,
        width: 110,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Current status, whereby leave that you book in the week itself is processed immediately.
     */
    {
        name: 'vak',
        label: 'Leave Balances',
        labelShort: 'VAK',
        alwaysVisible: false,
        visible: true,
        width: 63,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Current status, whereby TVT that you book in the week itself is processed immediately
     */
    {
        name: 'tvt',
        label: 'TVT Balances',
        labelShort: 'TVT',
        alwaysVisible: false,
        visible: true,
        width: 53,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * Current status, whereby ATV that you book in the week itself is processed immediately
     */
    {
        name: 'atv',
        label: 'ATV Balances',
        labelShort: 'ATV',
        alwaysVisible: false,
        visible: true,
        width: 53,
        align: 'center',
        sortBy: false,
        sortAscending: true,
    },
    /**
     * List of all competences
     */
    {
        name: 'competences',
        label: 'Competences',
        labelShort: 'Competences',
        alwaysVisible: false,
        visible: false,
        width: 130,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    {
        name: 'surcharges',
        label: 'Surcharges',
        labelShort: 'Surcharges',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    {
        name: 'compensation',
        label: 'Compensation',
        labelShort: 'Compensation',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
    {
        name: 'employeeChecked',
        label: 'Checked',
        labelShort: 'Checked',
        alwaysVisible: false,
        visible: false,
        width: 0,
        align: 'left',
        sortBy: false,
        sortAscending: true,
    },
]
