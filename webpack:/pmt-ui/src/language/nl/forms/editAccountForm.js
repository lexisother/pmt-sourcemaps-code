const translations = {
    changePasswordLabel: 'Klik om ook je wachtwoord te wijzigen',
    cancelPasswordChangeLabel: 'Klik om je wachtwoord niet te wijzigen',

    changePasswordLegend: 'Wachtwoord wijzigen',
    resetPasswordLegend: 'Stel een wachtwoord in',

    usernameField: {
        label: 'Gebruikersnaam',
        placeholder: 'Typ een gebruikersnaam',
    },

    newPasswordField: {
        label: 'Nieuw wachtwoord',
        placeholder: 'Typ nieuw wachtwoord',
    },

    retypeNewPasswordField: {
        label: 'Bevestig wachtwoord',
        placeholder: 'Bevestig nieuw wachtwoord',
    },

    currentPasswordField: {
        label: 'Huidig wachtwoord ter controle',
        placeholder: 'Jouw huidige wachtwoord',
    },

    submitBtn: {
        label: 'Aanpassen',
    },

    create: 'Aanmaken',

    cancelBtn: {
        label: 'Annuleren',
    },
    // passwordComplexityHint: 'Sterke wachtwoorden hebben een kleine letter, een hoofdletter, een nummer en speciaal karakter nodig. Ze moeten ook langer dan 6 karakters zijn.',
    passwordComplexityHint: {
        title: 'Je wachtwoord tenminste aan {0} van de volgende eisen voldoen:',
        lowerCase: 'een kleine letter',
        upperCase: 'een hoofdletter',
        number: 'een nummer',
        specialChar: 'een speciaal karakter',
        minLength: 'ook langer dan {0} karakters zijn',
    },
    success: {
        usernameIsAvailable: 'beschikbaar',
        finish: 'Goed gedaan! Je bent nu klaar om de applicatie te gebruiken! Klik {action} om te starten',
        here: 'hier',
    },
    errors: {
        usernameTooShort: 'minimum {0} karakters',
        passwordTooShort: 'minimum {0} karakters',
        passwordsDoNotMatch: 'Wachtwoord zijn niet gelijk aan elkaar',
        passwordDoesNotMeetComplexity: 'Wachtwoord voldoet niet aan de eisen',
        passwordDoesNotMeetComplexityShort: 'Is niet sterk genoeg',
        usernameIsUnAvailable: 'Gebruikersnaam is niet beschikbaar. Probeer een andere gebruikersnaam.',
        usernameIsUnAvailableShort: 'niet beschikbaar',
        invalidActivationCode: 'Ongeldige activatiecode. Vraag een nieuwe activeringscode op.',
        invalidActivationCodeExtendedTitle: 'Ongeldige activatie code',
        invalidActivationCodeExtendedBody: 'Je hebt een ongeldige activatie code gebruikt. Klik opnieuw op de link die je ontvangen hebt in je email. Als deze code daarna aanhoudt, neem dan contact op met je bedrijfsleiders.',
        usernameCharactersValidation: 'Gebruikersnaam kan alleen bestaan ​​uit letters, cijfers, @, +, ., _ en -',
        passwordNotSameAsUsername: 'Het wachtwoord kan niet hetzelfde zijn als de gebruikersnaam of delen van de gebruikersnaam bevatten.',
        notSameAsCurrent: 'Je nieuwe gebruikersnaam kan niet hetzelfde zijn als je huidige gebruikersnaam',
        incorrectPassword: 'Huidige wachtwoord is onjuist',
    },
    info: {
        passwordExpired: 'Uw wachtwoord is verlopen. Wijzig nu uw wachtwoord.',
    },
    activate: {
        usernameAndPassword: 'Kies een gebruikersnaam en wachtwoord',
        welcome: 'Welkom bij PMT',
        beforeContinue: 'Voordat we doorgaan, hebben we wat informatie over jou en je planning nodig',
        complete: 'Afronden',
        weeksetCreatedTitle: 'Geweldig !',
        weeksetCreated: 'Je manager moet je nieuwe weekset goedkeuren voordat je het kan gebruiken. Je kan naar de volgende stap gaan, of direct naar de laatste stap om je activatie af te ronden.',
        createFirstWeekset: 'Maak je eerste beschikbaarheid aan.',
        steps: {
            welcome: {
                title: 'Welkom bij {0}',
                text: 'Wij willen dat jij alles rondom jouw werk eenvoudig online kan regelen. Hiervoor maken wij gebruik van PMT. Hiermee kan je jouw wekelijkse rooster inzien, maar bijvoorbeeld ook een verlofverzoek indienen.',
                button: 'Account aanmaken',
            },
            create: {
                modalTitle: 'Account activatie',
                title: 'Hier kunt u uw gebruikersnaam en wachtwoord aanmaken',
            },
            created: {
                title: 'Geweldig!',
                text: 'Jouw account is succesvol aangemaakt! Een bevestiging hiervan ontvang je per e-mail.',
                button: 'Volgende',
            },
            availability: {
                title: 'Beschikbaarheid',
                text: 'Voordat wij een werkrooster voor jou kunnen maken, willen wij graag weten wanneer jij beschikbaar bent.',
                button: 'Beschikbaarheid opgeven',
                next: 'Volgende',
                addAtLeastOne: 'Voeg eerst ten minste één beschikbaarheid toe.',
            },
            availabilityCreated: {
                title: 'Super !',
                text: 'We hebben je aanvraag succesvol ontvangen. Je beschikbaarheid is definitief zodra je manager deze heeft goedgekeurd. Je ontvangt hierover per e-mail bericht.',
                next: 'Volgende',
            },
            rdo: {
                title: 'Verlof',
                text: 'Heb je vakantieplannen, of wil je om een andere reden een vrije dag? Dan regel je dat eenvoudig met een verlofaanvraag.',
                button: 'Verlof aanvragen',
                buttonAnother: 'Nog één toevoegen',
                successSnackbar: 'Succes. Je kan er nog één toevoegen.',
                next: 'Klaar!',
            },
            done: {
                title: 'Fantastisch!!',
                text: 'Jouw account is klaar voor gebruik.',
                button: 'Start',
            },
        },
    },
}

export default translations
