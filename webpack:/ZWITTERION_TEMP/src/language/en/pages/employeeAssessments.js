const translations = {
    pageTitle: 'Assessments',
    emptyStates: {
        noSearchResults: {
            title: 'Your search returned nothing',
            subTitle: 'Please refine your search criteria to return results',
        },
        noAssessments: {
            title: 'Searched everywhere',
            subTitle: 'There is nothing to assess for the selected week',
        },
        noAssessmentHistory: {
            title: 'No history',
            subTitle: '{0} has no history for the last {1} weeks',
        },
        noSchedulesToAsses: {
            title: 'No schedule',
            subTitle: '{0} has no schedules that can be assessed',
        },
    },
    employeesAssessmentsTable: {
        columns: {
            employee: 'Employee',
            total: 'Total',
        },
    },
    assessmentTabs: {
        assessment: 'Assessment',
        history: 'History',
        save: 'Save',
        saved: 'Assessment saved.',
        chartTitle: '{0} assessments for the last {1} weeks',
        remove: 'Remove',
        removed: 'Assessment removed',
    },
    assessmentTypes: {
        productivity: 'Productivity',
        quality: 'Quality',
        attitude: 'Attitude',
        remark: 'Remark',
        chartTitle: '{0} assessments for the last {0} weeks',
    },
    tooltips: {
        employeesThatNeedAssessment: 'Assessed employees / Total employees',
        emptyAssessmentNotValid: 'Zero as assessment will be ignored',
        noScheduleDayTab: 'No schedule',
        dayCanBeAssessed: 'Day can be assessed',
        dayCannotBeAssessed: 'Future days cannot be assessed',
        showOnlyWithSchedules: 'Show only with schedules',
    },
}

export default translations
