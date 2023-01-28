const translations = {
    changePasswordLabel: 'Click here to change your password',
    cancelPasswordChangeLabel: 'Click here to cancel password change',

    changePasswordLegend: 'Change password',

    resetPasswordLegend: 'Set password',

    usernameField: {
        label: 'Username',
        placeholder: 'Type your new username',
    },

    newPasswordField: {
        label: 'Password',
        placeholder: 'Type your password',
    },

    retypeNewPasswordField: {
        label: 'Confirm password',
        placeholder: 'Confirm your password',
    },

    currentPasswordField: {
        label: 'As a security measure, please fill in your current password',
        placeholder: 'Your current password',
    },

    submitBtn: {
        label: 'Save',
    },

    create: 'Create',

    cancelBtn: {
        label: 'Cancel',
    },

    // passwordComplexityHint: 'Strong passwords need to have a lowercase letter, an uppercase letter, a number, a special character and be more than 6 characters long.',
    passwordComplexityHint: {
        title: 'Your password must contain at least {0} of the following: ',
        lowerCase: 'a lower case character',
        upperCase: 'an upper case case character',
        number: 'a number',
        specialChar: 'a special character',
        minLength: 'be more than {0} characters long',
    },
    success: {
        usernameIsAvailable: 'available',
        finish: 'Great job ! Your are now ready to use the application ! Click {action} to start',
        here: 'here',
    },

    errors: {
        usernameTooShort: 'minimum {0} characters',
        passwordTooShort: 'minimum {0} characters',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordDoesNotMeetComplexity: 'Password does not meet the complexity requirements',
        passwordDoesNotMeetComplexityShort: 'Not strong enough',
        usernameIsUnAvailable: 'Username is not available. Try a different username.',
        usernameIsUnAvailableShort: 'not available',
        invalidActivationCode: 'Invalid activation code. Please request a new activation code.',
        invalidActivationCodeExtendedTitle: 'Invalid activation code.',
        invalidActivationCodeExtendedBody: 'You have accessed an invalid activation code. Please click the link you received by email again. If you still receive this error contact your store manager.',
        usernameCharactersValidation: 'Username can only consist out of letters, numbers, @, +, ., _ and -',
        passwordNotSameAsUsername: 'Password connot be the same as the username or contain the username.',
        notSameAsCurrent: 'New username cannot be the same as your current username',
        incorrectPassword: 'Your current password is incorrect',
    },
    info: {
        passwordExpired: 'Your password has expired. Please enter a new password.',
    },
    activate: {
        usernameAndPassword: 'Choose a username and password',
        welcome: 'Welcome to PMT',
        beforeContinue: 'Before we continue we just need some information about you and your schedule',
        complete: 'Finalize',
        weeksetCreatedTitle: 'Great !',
        weeksetCreated: 'Your manager will have to approve the new weekset before you can use it. You can go to the next step or go directly to the last step to finalize your activation.',
        createFirstWeekset: 'Create your first availability.',
        steps: {
            welcome: {
                title: 'Welcome to {0}',
                text: 'We want you to be able to manage your work with ease. For this we use the online platform PMT. Here you can view your week schedule, submit a leave request and more.',
                button: 'Create account',
            },
            create: {
                modalTitle: 'Activate account',
                title: 'Here you can create your username and password',
            },
            created: {
                title: 'Great!',
                text: 'Your account has been successfully created! We have sent you an e-mail to confirm this.',
                button: 'Continue',
            },
            availability: {
                title: 'Availability',
                text: 'In order to create your work schedule, your manager needs to know your weekly availability',
                button: 'Enter availability',
                next: 'Continue',
                addAtLeastOne: 'Add at least one availability first.',
            },
            availabilityCreated: {
                title: 'Super!',
                text: 'Your request was successful. Your weekly availability is final after approval by your manager. You will receive a status update by e-mail.',
                button: 'Enter availability',
                next: 'Continue',
            },
            rdo: {
                title: 'Planned Leave',
                text: 'Do you have any plans for vacation, or do you want a day of for some other reason? You can easily manage this by submitting a leave request.',
                button: 'Request day off',
                buttonAnother: 'Add another',
                successSnackbar: 'Successful. You can add another.',
                next: 'Finish!',
            },
            done: {
                title: 'Awesome!',
                text: 'Your account is ready to use.',
                button: 'Start',
            },
        },
    },
}

export default translations
