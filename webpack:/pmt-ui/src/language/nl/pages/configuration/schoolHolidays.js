const translations = {
    add: 'Voeg schoolvakantie toe',
    edit: 'Bewerk schoolvakantie',
    manageRegion: 'Beheer regio\'s',
    tableHeaderLabels: {
        description: 'Omschrijving',
        from: 'Van',
        to: 'Tot',
        regionName: 'Regio naam',
        actions: {
            deleteConfirm: 'Weet je zeker dat je deze schoolvakantie wilt verwijderen?',
        },
    },
    modal: {
        description: 'Omschrijving',
        from: 'Van',
        to: 'Tot',
        regionName: 'Regio naam',
        mandatory: '* veld is verplicht',
        typeText: 'Tekst',
        typeDate: 'Datum',
        fromDateInvalid: 'De begindatum is niet correct. Deze moet op een maandag vallen voor de einddatum. ',
        toDateInvalid: 'De einddatum is niet correct. Deze moet op een zondag vallen na de begindatum. ',
        holidayOverlapsExisting: 'De ingestelde periode valt samen met een reeds bestaande vakantie.',
    },
    cancel: 'Annuleren',
    save: 'Opslaan',
    dataHaveBeenUpdated: 'De gegevens zijn opgeslagen',
    dataUpdateFailed: 'Het aanpassen van de gegevens is mislukt',
    dataHaveBeenDeleted: 'Schoolvakantie is verwijderd',
    dataDeletionFailed: 'Verwijderen van de schoolvakantie is mislukt',

    manageSchoolHolidayRegions: 'Beheer vakantie regio\'s',
    regionsModal: {
        description: 'Omschrijving',
        deleteConfirm: 'Weet je zeker dat je deze vakantie regio wilt verwijderen?',
        addConfirmation: 'School regio is aangemaakt',
        editConfirmation: 'School regio is aangepast',
        deleteConfirmation: 'School regio is verwijderd',
        addFailConfirmation: 'Het aanmaken van de school regio is mislukt',
        editFailConfirmation: 'Het aanpassen van de school regio is mislukt',
        deleteFailConfirmation: 'Het verwijderen van de school regio is mislukt',
    },
}

export default translations
