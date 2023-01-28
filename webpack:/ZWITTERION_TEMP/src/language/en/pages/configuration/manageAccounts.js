const translations = {
    topbar: {
        sendAccountActivation: 'Send account activation',
        resetPassword: 'Reset password',
        createAccount: 'Create account',
    },
    fields: {
        name: 'Name',
        username: 'Username',
        storeGroups: 'Store groups',
        role: 'Role',
        personnelNumber: 'Personnel Number',
        blockedContexts: 'Blocked contexts',
    },
    allStoreGroups: 'All store groups',
    noStoreGroupsAssigned: 'No store groups assigned',
    tabHeaders: {
        accountInfo: 'Account information',
    },
    tableActions: {
        delete: 'Delete',
        cancel: 'Cancel',
        deleteConfirmation: 'Are you sure you want to delete this user?',
    },
    filters: {
        active: 'Active',
        inactive: 'Inactive',
        all: 'All',
    },
    modal: {
        create: 'Create account',
        edit: 'Edit account',
    },
    form: {
        validations: {
            required: 'Required',
            invalidEmail: 'Invalid e-mail',
            invalidUsername: 'Username can only consist out of letters, numbers, @, +, ., _ and -',
            invalidUsernameLength: 'Username must be at least 5 chars of length',
        },
    },
    messages: {
        success: {
            accountCreated: 'Account created',
            accountUpdated: 'Account updated',
            accountDeleted: 'Account deleted',
            passwordReset: 'Password has been reset',
            accountActivationSent: 'Account activation has been sent',
        },
        error: {
            invalidUnemploymentDate: 'Unemployment date cannot be before employment date',
            accountNotFound: 'Account not found',
            emptyRoles: 'Select a store group before selecting a role',
            passwordResetFailed: 'Password reset failed',
            sendingAccountActivationFailed: 'Sending account activation failed',
        },
    },
}

export default translations
