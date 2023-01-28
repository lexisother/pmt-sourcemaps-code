const translations = {
    header: 'Meine Benutzerkontoinformationen',

    accountSectionHeading: 'Benutzerkonto',
    personalSectionHeading: 'Persönlich',
    contactSectionHeading: 'Kontakt',
    contractSectionHeading: 'Vertrag',
    settingsSectionHeading: 'Einstellungen',
    assessmentsSectionHeading: 'Beurteilungen',

    editAccountModal: {
        title: 'Benutzerkontodaten bearbeiten',
    },

    changeUsernameModal: {
        title: 'Benutzernamen ändern',
    },

    changePasswordModal: {
        title: 'Passwort ändern',
    },

    editAccountSuccessModal: {
        title: 'Benutzerkontodaten geändert',
        message: 'Deine Benutzerkontodaten sind geändert',
    },

    editBtn: {
        label: 'ändern',
    },
    settingsOptions: {
        google: 'Google Calendar',
        ical: 'Outlook/iCalendar',
        icalMobile: 'Outlook (mobil)',
        title: {
            enabled: 'Kalender aktiviert',
            disabled: 'Kalender deaktiviert',
        },
        calendarHeader: 'Kalender',
        activeOrNot: 'Aktiviere / deaktiviere Kalenderintegration',
        enabled: 'Du hast das Modul aktiviert. Dein Einsatzplan kann jetzt an eine Kalenderapplikation deiner Wahl gekoppelt werden. Die Sychronisation von Einsatzplanänderungen kann maximal 24 Stunden dauern.<br><br> <b>Achtung:</b> Durch die Aktivierung dieses Moduls kann dein Einsatzplan eingesehen werden ohne Anmeldung. PMT hat selbstverstänlich Sicherheitsvorkehrungen getroffen um Unbefugte von deinen Einsatzplan fernzuhalten.',
        disabled: 'Du hast das Modul deaktiviert. Änderungen in deinem Einsatzplan werden nicht weiter mit deiner ausgewählten Kalenderapplikation synchronisiert. <br><br> Bei Wiederaktivierung muβ der Kalender wieder gekoppelt werden.',
        notActivatedMessage: '<b>Achtung:<br></b>Durch die Aktivierung dieses Moduls wird dein Einsatzplan ohne Anmeldung einsehbar.<br> PMT hat die erforderlichen Vorkehrungen getroffen um dafür zu sorgen, dass nichtautorisierte Personen deinen Einsatzplan nicht einsehen können.<br>Änderungen in Einsatzplänen werden zur Zeit nicht synchronisiert.',
        languageHeader: 'Sprache',
        languageDescription: 'Klicke auf die Fahne um die Sprache anzupassen.',

        optional: 'Optional:',
        explanation: [
            'Wie koppel ich auf meinem Handy  meinen PMT Kalender an Google ?',
            'Klicke auf den Link für den Google Kalender oder kopiere den folgenden Link: ',
            'Öffne den Link in einem neuen Tabblatt',
            'Klicke "akzeptieren" im Popup in Google Kalender, mit dem du gefragt wirst ob du den Kalender zufügen/koppeln möchtest',
            'Warte einige Minuten',
            'Öffne die Google Kalenderapplikation',
            'Öffne das Menü links oben mit dem Icon: ',
            'Scrolle nach unten und klicke auf den Button  Einstellungen',
            'Suche nach dem Kalender für deine Filiale und klicke darauf',
            'Nach dem Klicken auf den Kalender, stelle den Button für \'Synchronisieren\' auf an',
            'Dein Kalender ist jetzt synchronisiert, Glückwunsch ! 😃',
        ],
    },
}

export default translations
