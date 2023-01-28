const translations = {
    emptyState: {
        noRoutesAvailable: 'No routes available',
    },
    grantAccessToAllModuleRoutes: 'Grant access to all routes',
    active: 'Active',
    saveButton: {
        save: 'Save',
        yes: 'Yes',
        no: 'No',
        on: 'On',
        off: 'Off',
        warningMessage: 'You will change the following routes, are you sure you want to change this?',
        savedSuccessMessage: 'Routes successfully saved',
        savedErrorMessage: 'Routes not saved successfully',
    },
    labels: {
        name: 'Name',
        token: 'Token',
        ssoToken: 'SSO Token',
        ssoIps: 'IP Whitelist addresses (comma sepparated)',
        lifeTime: 'Lifetime',
        firebaseApiKey: 'Firebase API Key',

    },
    warnings: {
        name: 'Name must be between {0} and {1} characters',
        token: 'Token cannot be more than {0} characters',
        ssoToken: 'SSO Token cannot be more than {0} characters',
        ssoIps: 'IP Whitelist addresses cannot be more than {0} characters',
        lifeTime: 'Lifetime must be between {0} and {1} minutes',
        firebaseApiKey: 'Firebase API KEY cannot be more than {0} characters',
        invalidIpDetected: 'Invalid IP or IP range detected',
    },
    duplicate: 'A context with the same {0} already exists',
    required: '{0} is required',
    generateToken: 'Generate token',
    saved: 'Context saved successfully',
}

export default translations
