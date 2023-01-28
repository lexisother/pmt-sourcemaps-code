const translations = {
    changePasswordLabel: 'Klicken Sie hier um ebenfalls Ihr Passwort zu ändern',
    cancelPasswordChangeLabel: 'Klicken Sie hier um Ihr Passwort nicht zu ändern',

    changePasswordLegend: 'Passwort ändern',
    resetPasswordLegend: 'Legen Sie ein Passwort fest',

    usernameField: {
        label: 'Benutzername',
        placeholder: 'Gib einen Benutzernamen ein',
    },

    newPasswordField: {
        label: 'Neues Passwort',
        placeholder: 'Gib ein neues Passwort ein',
    },

    retypeNewPasswordField: {
        label: 'Passwort bestätigen',
        placeholder: 'Neues Passwort bestätigen',
    },

    currentPasswordField: {
        label: 'Aktuelles Passwort kontrollieren',
        placeholder: 'Dein aktuelles Passwort',
    },

    submitBtn: {
        label: 'Ändern',
    },

    create: 'Erstellen',

    cancelBtn: {
        label: 'Abbrechen',
    },
    // passwordComplexityHint: 'Ein starkes Passwort beinhaltet Kleinbuchstaben, Großbuchstaben, Zahlen und Sonderzeichen und sollte mindestens aus 6 Zeichen bestehen.',
    passwordComplexityHint: {
        title: 'Dein Passwort muβ mindestens {0} der folgenden Anforderungen erfüllen:',
        lowerCase: 'ein Kleinbuchstabe',
        upperCase: 'ein Großbuchstabe',
        number: 'eine Zahl',
        specialChar: 'ein Sonderzeichen',
        minLength: 'auch aus mehr als {0} Zeichen bestehen',
    },
    success: {
        usernameIsAvailable: 'beschikbaar',
        finish: 'Goed gedaan! Je bent nu klaar om de applicatie te gebruiken! Klik {action} om te starten',
        here: 'hier',
    },
    errors: {
        usernameTooShort: 'mindestens {0} Zeichen',
        passwordTooShort: 'mindestens {0} Zeichen',
        passwordsDoNotMatch: 'Passwörter stimmen nicht überein',
        passwordDoesNotMeetComplexity: 'Passwort entspricht nicht den Anforderungen',
        passwordDoesNotMeetComplexityShort: 'ist zu schwach',
        usernameIsUnAvailable: 'Benutzername ist nicht verfügbar. Wähle einen anderen Benutzernamen.',
        usernameIsUnAvailableShort: 'Nicht verfügbar',
        invalidActivationCode: 'Ungültiger Aktivierungscode. Frage einen neuen Aktivierungscode an.',
        invalidActivationCodeExtendedTitle: 'Ungültiger Aktivierungscode',
        invalidActivationCodeExtendedBody: 'Du hast einen ungültigen Aktivierungscode verwendet. Klicke erneut auf den Link, den du in deiner E-Mail erhalten hast. Wenn dieser Code danach derselbe bleibt, wenden dich bitte an deinen Vorgesetzten.',
        usernameCharactersValidation: 'Benutzername kann nur aus Buchstaben, Ziffern, @, +, ., _ und - bestehen',
        passwordNotSameAsUsername: 'Das Passwort kann nicht dasselbe sein wie der Benutzername oder Teile des Benutzernamens enthalten.',
        notSameAsCurrent: 'Dein neuer Benuztername kann nicht derselbe sein wie dein aktueller Benutzername',
        incorrectPassword: 'Aktuelles Passwort ist nicht korrekt',
    },
    info: {
        passwordExpired: 'Dein Passwort ist abgelaufen. Ändere jetzt dein Passwort.',
    },
    activate: {
        usernameAndPassword: 'Wähle einen Benutzernamen und ein Passwort',
        welcome: 'Willkommen bei PMT',
        beforeContinue: 'Bevor wir fortfahren, benötigen wir einige Informationen über dich und deine Planung',
        complete: 'Abschliessen',
        weeksetCreatedTitle: 'Super !',
        weeksetCreated: 'Dein Vorgesetzter muss deinen neuen Wochensatz genehmigen bevor du diesen nutzen kannst. Du kannst zum nächsten Schritt gehen oder direkt zum letzten Schritt um deine Aktivierung abzuschliessen.',
        createFirstWeekset: 'Erstelle deine erste Verfügbarkeit.',
        steps: {
            welcome: {
                title: 'Willkommen bei {0}',
                text: 'Wir möchten, dass du alles rundum deine Arbeit einfach online regeln kannst. Dafür verwenden wir PMT. Damit kannst du deinen Wochenplan anzeigen, aber auch beispielsweise einen Urlaubsantrag stellen.',
                button: 'Benutzerkonto einrichten',
            },
            create: {
                modalTitle: 'Aktivierung Benutzerkonto',
                title: 'Hier kannst du deinen Benutzernamen und dein Passwort erstellen',
            },
            created: {
                title: 'Super !',
                text: 'Dein Benutzerkonto wurde erfolgreich eingerichtet ! Du erhältst eine Bestätigung per E-Mail.',
                button: 'Weiter',
            },
            availability: {
                title: 'Verfügbarkeit',
                text: 'Bevor wir einen Arbeitsplan für dich erstellen können, möchten wir wissen wann du verfügbar bist.',
                button: 'Verfügbarkeit angeben',
                next: 'Weiter',
                addAtLeastOne: 'Gib mindestens eine Verfügbarkeit ein.',
            },
            availabilityCreated: {
                title: 'Super !',
                text: 'Wir haben deine Anfrage erhalten. Deine Verfügbarkeit ist definitiv sobald dein Vorgesetzter die Anfrage genehmigt hat. Du erhältst hierüber Antwort per E-Mail.',
                next: 'Weiter',
            },
            rdo: {
                title: 'Urlaub',
                text: 'Hast du Urlaubspläne oder möchtest du aus einem anderen Grund einen Tag frei haben ? Dann regelst du dies einfach mit einem Urlaubsantrag.',
                button: 'Urlaubsantrag einreichen',
                buttonAnother: 'Einen weiteren Antrag einreichen',
                successSnackbar: 'Viel Erfolg. Du kannst noch einen Antrag einreichen.',
                next: 'Fertig !',
            },
            done: {
                title: 'Fantastisch !!',
                text: 'Dein Benutzerkonto ist einsatzbereit.',
                button: 'Start',
            },
        },
    },
}

export default translations
