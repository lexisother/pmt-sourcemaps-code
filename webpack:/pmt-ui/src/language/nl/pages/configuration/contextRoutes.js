const translations = {
    emptyState: {
        noRoutesAvailable: 'Geen routes beschikbaar',
    },
    grantAccessToAllModuleRoutes: 'Verleen toegang tot alle routes',
    active: 'Actief',
    saveButton: {
        save: 'Opslaan',
        yes: 'Ja',
        no: 'Nee',
        on: 'Aan',
        off: 'Uit',
        warningMessage: 'Je gaat de volgende routes aanpassen, weet je zeker dat je dit wilt veranderen?',
        savedSuccessMessage: 'Routes succesvol opgeslagen',
        savedErrorMessage: 'Routes niet sussesvol opgeslagen',
    },
    labels: {
        name: 'Naam',
        token: 'Token',
        ssoToken: 'SSO Token',
        ssoIps: 'IP Whitelist adressen (kommagescheiden)',
        lifeTime: 'Lifetime',
        firebaseApiKey: 'Firebase API Key',

    },
    warnings: {
        name: 'Naam moet tussen de {0} en {1} karakters bevatten',
        token: 'Token kan niet meer dan {0} karakters bevatten',
        ssoToken: 'SSO token kan niet meer dan {0} karakters bevatten',
        ssoIps: 'IP Whitelist adressen kunnen niet meer dan {0} karakters bevatten',
        lifeTime: 'Lifetime moet tussen de {0} en {1} minuten bevatten',
        firebaseApiKey: 'Firebase API Key kan niet meer dan {0} karakters bevatten',
        invalidIpDetected: 'Er is een verkeerd IP adres/reeks ingevoerd',
    },
    duplicate: 'Context met {0} bestaat al',
    required: '{0} is vereist',
    generateToken: 'Genereer token',
    saved: 'Context is succesvol opgeslagen',
}

export default translations
