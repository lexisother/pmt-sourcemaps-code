const translations = {
    header: 'My account information',

    accountSectionHeading: 'Account',
    personalSectionHeading: 'Personal',
    contactSectionHeading: 'Contact',
    contractSectionHeading: 'Contract',
    settingsSectionHeading: 'Settings',
    assessmentsSectionHeading: 'Assessments',

    editAccountModal: {
        title: 'Edit account information',
    },

    changeUsernameModal: {
        title: 'Change your username',
    },

    changePasswordModal: {
        title: 'Change your password',
    },

    editAccountSuccessModal: {
        title: 'Account information saved',
        message: 'Your account information changes are saved',
    },

    editBtn: {
        label: 'Change',
    },
    settingsOptions: {
        google: 'Google Calendar',
        ical: 'Outlook/iCalendar',
        icalMobile: 'Outlook (mobile)',
        title: {
            enabled: 'Calendar integration activated',
            disabled: 'Calendar integration disabled',
        },
        calendarHeader: 'Calendar',
        activeOrNot: 'Activate/deactivate calendar integration',
        enabled: 'Calendar integration module is active. <br>Your schedule can now be linked to a calendar application by choice. The synchronizing of schedule changes can take up to 24 hours.<br><b>Your schedule is now accessible without logging in. PMT took the necessary steps to make sure that unauthorized persons can\'t access your schedule.',
        disabled: 'You deactivated the module. Changes in schedules are not synchronized to your chosen calendar application anymore. <br><br>Upon reactivation you need to link the calendar again.',
        notActivatedMessage: '<b>Please note:<br></b>By activating this module your schedule will be accessible without logging in.<br> PMT took the necessary steps to make sure that unauthorized persons can\'t access your schedule.<br>Changes in schedules are not currently synchronized.',
        languageHeader: 'Language',
        languageDescription: 'Click on the flag to change the language.',

        optional: 'Optional: ',
        explanation: [
            'How to add my PMT calendar to google on my phone?',
            'Click the link for the google calendar, or copy this link: ',
            'Open the link in a new tab',
            'Click accept on the prompt in Google Calendar asking if you want to add the calendar',
            'Wait a few minutes',
            'Open the Google Calendar application',
            'On the top left click the icon: ',
            'Scroll down and click the button settings button',
            'Search for the calendar for your store and click on it',
            'After clicking on it switch the button \'Synchronize\' to on',
            'Your calendar is now synchronized, congratulations! 😃',
        ],

    },
}

export default translations
