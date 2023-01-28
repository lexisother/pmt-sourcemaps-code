const translations = {
    topbar: {
        sendAccountActivation: 'Verstuur account activatie',
        resetPassword: 'Stel wachtwoord opnieuw in',
        createAccount: 'Account maken',
    },
    fields: {
        name: 'Naam',
        username: 'Gebruikersnaam',
        storeGroups: 'Winkelgroepen',
        role: 'Rol',
        personnelNumber: 'Personeelsnummer',
        blockedContexts: 'Geblokkeerde contexten',
    },
    allStoreGroups: 'Alle winkelgroepen',
    noStoreGroupsAssigned: 'Geen winkelgroep toegewezen',
    tabHeaders: {
        accountInfo: 'Account informatie',
    },
    tableActions: {
        delete: 'Verwijder',
        cancel: 'Annuleer',
        deleteConfirmation: 'Weet je zeker dat je dit account wilt verwijderen?',
    },
    filters: {
        active: 'Actief',
        inactive: 'Inactief',
        all: 'Alle',
    },
    modal: {
        create: 'Account aanmaken',
        edit: 'Account bewerken',
    },
    form: {
        validations: {
            required: 'Verplicht',
            invalidEmail: 'Ongeldig mailadres',
            invalidUsername: 'Gebruikersnaam kan alleen bestaan uit letters, nummers, @, +, ., _ en -',
            invalidUsernameLength: 'Gebruikersnaam moet minstens 5 tekens lang zijn',
        },
    },
    messages: {
        success: {
            accountCreated: 'Account aangemaakt',
            accountUpdated: 'Account bijgewerkt',
            accountDeleted: 'Account verwijderd',
            passwordReset: 'Wachtwoord is opnieuw ingesteld',
            accountActivationSent: 'Account activatie is verstuurd',
        },
        error: {
            invalidUnemploymentDate: 'Datum uit dienst kan niet vóór datum in dienst liggen',
            accountNotFound: 'Account niet gevonden',
            emptyRoles: 'Selecteer een winkelgroep alvorens het selecteren van een rol',
            passwordResetFailed: 'Opnieuw instellen van wachtwoord is mislukt',
            sendingAccountActivationFailed: 'Versturen van account activatie is mislukt',
        },
    },
}

export default translations
