const translations = {
    add: 'Add school holiday',
    edit: 'Edit school holiday',
    manageRegion: 'Manage regions',
    tableHeaderLabels: {
        description: 'Description',
        from: 'From',
        to: 'To',
        regionName: 'Region name',
        actions: {
            deleteConfirm: 'Are you sure you want to delete this school holiday?',
        },
    },
    modal: {
        description: 'Description',
        from: 'From',
        to: 'To',
        regionName: 'Region name',
        mandatory: '* field is mandatory',
        typeText: 'Text',
        typeDate: 'Date',
        fromDateInvalid: 'The start date is not set correctly. It must be a Monday before the end date. ',
        toDateInvalid: 'The end date is not set correctly. It must be a Sunday after the start date. ',
        holidayOverlapsExisting: 'The set period coincides with an existing school holiday.',
    },
    cancel: 'Cancel',
    save: 'Save',
    dataHaveBeenUpdated: 'Data has been updated',
    dataUpdateFailed: 'Data update failed',
    dataHaveBeenDeleted: 'School holiday has been deleted',
    dataDeletionFailed: 'School holiday deletion failed',

    manageSchoolHolidayRegions: 'Manage school holiday regions',
    regionsModal: {
        description: 'Description',
        deleteConfirm: 'Are you sure you want to delete this school holiday region?',
        addConfirmation: 'School holiday region has been created',
        editConfirmation: 'School holiday region has been updated',
        deleteConfirmation: 'School holiday region has been deleted',
        addFailConfirmation: 'School holiday region creation has failed',
        editFailConfirmation: 'School holiday region update has failed',
        deleteFailConfirmation: 'School holiday region removal has failed',
    },
}

export default translations
