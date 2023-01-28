const translate = {
    title: 'Find substitutes',

    selectShiftStep: {
        info: 'Select the shift you want a colleague to take',
        tableHeader: {
            date: 'Date',
            department: 'Department',
            shift: 'Shift',
            break: 'Break',
        },
        lockIconInfo: 'A substitute request is already open for shifts with a {0}.',
        cancelBtn: {
            label: 'Cancel',
        },
        noSchedulesTitle: 'You have no schedules',
        noSchedulesText: 'We didn\'t find any schedules you can request a substitute for.',
    },

    selectColleagueStep: {
        info: 'Select the colleague(s) you want to send the request to',
        tableHeader: {
            name: 'Name',
            department: 'Department',
        },
        otherColleagueSection: {
            info: 'Have you talked to someone and he/she is not on the list as a good substitute? You can add him/her below.',
            selectField: {
                label: 'Select colleague to add',
                placeholder: 'Type or select colleague',
            },
        },
        noColleaguesAvailableForShift: 'No colleagues available for the selected shift.',
    },

    overviewStep: {
        info: 'Check your request',
        shiftLabel: 'The shift you want a colleague to take',
        colleaguesLabel: 'Colleague(s) you want to send the request to',
        remarkField: {
            minChars: 'minimum of 10 characters',
            label: 'What is your reason for not being able to work? {0}',
            placeholder: 'Sweet marshmallow marzipan danish halvah. Jujubes fruitcake chocolate bar tiramisu pudding donut halvah gummies.',
        },

        changeShiftBtn: {
            label: 'Change',
        },
        sendBtn: {
            label: 'Send',
        },
    },

    prevBtn: {
        label: 'Previous',
    },
    nextBtn: {
        label: 'Next',
    },

    success: {
        title: 'Substitute request send',
        message: 'Your substitute request is send',
    },
    error: {
        existingRequest: {
            title: 'Substitute request not send',
        },
        unknown: {
            title: 'Something went wrong',
        },
    },
}

export default translate
