const translations = {
    titles: {
        new: 'Neue Verfügbarkeit',
        edit: 'Verfügbarkeit bearbeiten',
        newWeekset: 'Neuer Wochensatz',
    },

    createdBy: 'erstellt von ',
    modifiedBy: 'geändert von ',
    you: 'Dir',

    typeField: {
        label: 'Art',
    },
    dateField: {
        label: 'Datum',
    },
    travelBeforeField: {
        label: 'Reisezeit nach',
    },
    travelAfterField: {
        label: 'Reisezeit von',
    },
    lessonHoursField: {
        label: 'Unterrichtsstunden',
    },

    submitBtn: {
        label: 'Speichern',
    },
    cancelBtn: {
        label: 'Abbrechen',
    },
    deleteBtn: {
        label: 'Löschen',
    },

    school: {
        notBeforeSeven: 'Schule kann nicht beginnen vor {0}',
        notAfterNineteen: 'Schule kann nicht enden nach {0}',
        notBeforeSevenShort: ' (nur zwischen {0} - {1})',
        onlyBetween: 'Schule ist nur gestattet zwischen {0} - {1}',
        noLongerThanTwelveHours: 'Unterrichtsstunden dürfen nicht mehr als {0} betragen',
        notAllowedOnWeekends: ' (nicht gestattet am Wochenende)',
    },

    validationMsg: {
        travelBeforeNotOnSameDay: 'Der Anfang der Reise zur Schule muss am gleichen Tag beginnen.',
        travelAfterNotOnSameDay: 'Die Rückreise von der Schule muss auf denselben Tag fallen.',
        timesOverlap: 'Die Endzeit wurde auf {0} angepasst, da überlappende Zeiten gefunden wurden.',
        notShorterThanFiveteenMinutes: 'Verfügbarkeit kann nicht weniger sein als 15 Minuten',
        overlapDetected: 'Tijd is overlappend met een ander.',
        outsideBusinessTimes: 'Zeit befindet sich ausserhalb der Betriebszeiten.',
    },

    newAvailability: {
        oneTime: 'Einmalig',
        recurring: 'Wiederkehrend',
        freshStart: 'Neuanfang',
        freshStartTooltip: 'Beginne mit einem leeren Wochensatz',
        fromCurrent: 'Ab heute',
        fromCurrentTooltip: 'Wähle diese Option um deine aktuellen Verfügbarkeiten zu verwenden',
        aboutWeeksetsPrimary: 'Wochensätze helfen dir um deine  Arbeit und deine persönlichen Aktivitäten nach Ihren Wünschen zu planen. Dies bedeutet, dass ab jetzt für jede Woche eine wiederkehrende Verfügbarkeit hinzugefügt wird bis Sie einen neuen Wochensatz erstellen.',
        aboutWeeksetsSecondary: 'Der neue Wochensatz muβ durch einen Manager genehmigt werden bevor du diesen verwenden kannst',
    },
    delete: 'Löschen',
    notEditableTitle: 'Nicht veränderbar',
    notEditable: 'Diese Verfügbarkeit ist Teil des Wochensatzes. Wenn du diesen ändern möchtest, kannst du einen neuen Satz erstellen.',
    singleWeekEdit: 'Änderungen werden nur für diese Woche gespeichert. Wollen Sie diese Änderung auch für zukünftige Wochen bewerben? Dann erstellen Sie eine neue weekset',
    singleWeekMsg: {
        changeFailed: 'Etwas ist schief gelaufen. Wir waren nicht in der Lage diese Verfügbarkeit zu ändern. Bitte versuche es erneut.',
        changeSaved: 'Änderungen werden gespeichert',
    },
}

export default translations
