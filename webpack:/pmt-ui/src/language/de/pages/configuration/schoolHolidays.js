const translations = {
    add: 'Schulferien hinzufügen',
    edit: 'Schulferien bearbeiten',
    manageRegion: 'Regionen verwalten',
    tableHeaderLabels: {
        description: 'Beschreibung',
        from: 'Von',
        to: 'Bis',
        regionName: 'Regionsname',
        actions: {
            deleteConfirm: 'Möchten Sie diese Schulferien wirklich löschen?',
        },
    },
    modal: {
        description: 'Beschreibung',
        from: 'Ab',
        to: 'Bis',
        regionName: 'Regionen nahme',
        mandatory: '* Feld ist Pflichtfeld',
        typeText: 'Text',
        typeDate: 'Datum',
        fromDateInvalid: 'Das Startdatum ist nicht richtig eingestellt. Es muss ein Montag vor dem Enddatum sein.',
        toDateInvalid: 'Das Enddatum ist nicht richtig eingestellt. Es muss ein Sonntag nach dem Startdatum sein.',
        holidayOverlapsExisting: 'Der festgelegte Zeitraum fällt mit einem bestehenden Schulurlaub zusammen.',
    },
    cancel: 'Stornieren',
    save: 'speichern',
    dataHaveBeenUpdated: 'Daten wurden aktualisiert',
    dataUpdateFailed: 'Datenaktualisierung fehlgeschlagen',
    dataHaveBeenDeleted: 'Schulferien wurden gelöscht',
    dataDeletionFailed: 'Löschen in den Schulferien fehlgeschlagen',

    manageSchoolHolidayRegions: 'Schulferienregionen verwalten',
    regionsModal: {
        description: 'Beschreibung',
        deleteConfirm: 'Möchten Sie diese Schulferienregion wirklich löschen?',
        addConfirmation: 'Schulferienregion wurde erstellt',
        editConfirmation: 'Schulferienregion wurde aktualisiert',
        deleteConfirmation: 'Schulferienregion wurde gelöscht',
        addFailConfirmation: 'Die Erstellung der Schulferienregion ist fehlgeschlagen',
        editFailConfirmation: 'Das Update der Schulferienregion ist fehlgeschlagen',
        deleteFailConfirmation: 'Das Entfernen der Schulferienregion ist fehlgeschlagen',
    },
}

export default translations
