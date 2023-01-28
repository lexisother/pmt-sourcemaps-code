const translate = {
    title: 'Vertretung suchen',

    selectShiftStep: {
        info: 'Wähle die Schicht, die du übernehmen lassen möchten',
        tableHeader: {
            date: 'Datum',
            department: 'Abteilung',
            shift: 'Schicht',
            break: 'Pause',
        },
        lockIconInfo: 'Für die Schichten mit einem {0} steht bereits ein Vertretungsgesuch aus.',
        cancelBtn: {
            label: 'Abbrechen',
        },
        noSchedulesTitle: 'Du hast keine Einsatzpläne.',
        noSchedulesText: 'Wir konnten keine Einsatzpläne finden für die eine Vertretung gesucht werden kann.',
    },

    selectColleagueStep: {
        info: 'Wähle den/die Kollegen aus, an welche du das Vertretungsgesuch senden möchtest',
        tableHeader: {
            name: 'Name',
            department: 'Abteilung',
        },
        otherColleagueSection: {
            info: 'Hast du bereits mit jemandem gesprochen, der die Vertretung übernimmt, aber ist dieser nicht aufgeführt ? Füge ihn/sie über untenstehende Auswahl hinzu.',
            selectField: {
                label: 'Wähle einen Kollegen/eine Kollegin um hinzuzufügen',
                placeholder: 'Gib ein oder wähle Kollegen',
            },
        },
        noColleaguesAvailableForShift: 'Für diese Schicht steht kein Kollege zur Verfügung',
    },

    overviewStep: {
        info: 'Überprüfe dein Gesuch',
        shiftLabel: 'Schicht, für welche du eine Vertretung suchst',
        colleaguesLabel: 'Kollege(n) an den/die du das Vertretungsgesuch senden möchtest',
        remarkField: {
            minChars: 'mindestens 10 Zeichen',
            label: 'Was ist der Grund, warum du nicht arbeiten kannst ? {0}',
            placeholder: 'Sweet marshmallow marzipan danish halvah. Jujubes fruitcake chocolate bar tiramisu pudding donut halvah gummies.',
        },

        changeShiftBtn: {
            label: 'Ändern',
        },
        sendBtn: {
            label: 'Gesuch versenden',
        },
    },

    prevBtn: {
        label: 'Vorherige',
    },
    nextBtn: {
        label: 'Nächste',
    },

    success: {
        title: 'Gesuch versandt',
        message: 'Dein Vertretungsgesuch ist versandt.',
    },
    error: {
        existingRequest: {
            title: 'Gesuch bereits versendet',
        },
        unknown: {
            title: 'Etwas ist schiefgegangen',
        },
    },
}

export default translate
