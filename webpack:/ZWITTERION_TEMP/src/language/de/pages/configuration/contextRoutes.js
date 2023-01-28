const translations = {
    emptyState: {
        noRoutesAvailable: 'Keine Routen verfügbar',
    },
    grantAccessToAllModuleRoutes: 'Gewähre Zugang zu allen Routen',
    active: 'Active',
    saveButton: {
        save: 'Speichern',
        yes: 'Ja',
        no: 'Nein',
        on: 'An',
        off: 'Aus',
        warningMessage: 'Je gaat de volgende routes aanpassen, weet je zeker dat je dit wilt veranderen?',
        savedSuccessMessage: 'Routen erfolgreich gespeichert',
        savedErrorMessage: 'Routen nicht erfolgreich gespeichert',
    },
    labels: {
        name: 'Name',
        token: 'Token',
        ssoToken: 'SSO Token',
        ssoIps: 'IP-Whitelist Adressen (durch Kommas getrennt)',
        lifeTime: 'Lebenszeit',
        firebaseApiKey: 'Firebase API Key',

    },
    warnings: {
        name: 'Der Name muss zwischen {0} und {1} zeichen liegen',
        token: 'Token darf nicht mehr als {0} zeichen enthalten',
        ssoToken: 'SSO-Token darf nicht mehr als {0} zeichen enthalten',
        ssoIps: 'IP-Whitelist Adressen dürfen nicht länger als {0} zeichen sein',
        lifeTime: 'Die Lebenszeit muss zwischen {0} und {1} minuten liegen',
        firebaseApiKey: 'Firebase API KEY darf nicht mehr als {0} zeichen enthalten',
        invalidIpDetected: 'Ungültige IP oder IP Range erkannt',
    },
    duplicate: 'Ein Kontext mit derselben {0} ist bereits vorhanden',
    required: '{0} ist erforderlich',
    generateToken: 'Token generieren',
    saved: 'Kontext erfolgreich gespeichert',
}

export default translations
