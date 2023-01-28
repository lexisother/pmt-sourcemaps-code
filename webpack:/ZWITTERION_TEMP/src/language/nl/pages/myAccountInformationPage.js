const translations = {
    header: 'Mijn account informatie',

    accountSectionHeading: 'Account',
    personalSectionHeading: 'Persoonlijk',
    contactSectionHeading: 'Contact',
    contractSectionHeading: 'Contract',
    settingsSectionHeading: 'Instellingen',
    assessmentsSectionHeading: 'Beoordelingen',

    editAccountModal: {
        title: 'Account informatie bewerken',
    },

    changeUsernameModal: {
        title: 'Wijzig je gebruikersnaam',
    },

    changePasswordModal: {
        title: 'Wijzig je wachtwoord',
    },

    editAccountSuccessModal: {
        title: 'Account informatie aangepast',
        message: 'Je account gegevens zijn aangepast',
    },

    editBtn: {
        label: 'Wijzig',
    },
    settingsOptions: {
        google: 'Google Calendar',
        ical: 'Outlook/iCalendar',
        icalMobile: 'Outlook (mobiel)',
        title: {
            enabled: 'Kalender geactiveerd',
            disabled: 'Kalender gedeactiveerd',
        },
        calendarHeader: 'Kalender',
        activeOrNot: 'Activeer/deactiveer kalender integratie',
        enabled: 'Je hebt de module geactiveerd. Je rooster kan nu worden gekoppeld aan een agenda applicatie naar keuze. Het synchroniseren van roosterwijzigingen kan maximaal 24 uur duren.<br><br> <b>Let op:</b> Door het inschakelen van deze module kan je rooster bereikt worden zonder in te loggen. PMT heeft uiteraard veiligheidsmaatregelen genomen om onbevoegden af te schermen van je rooster.',
        disabled: 'Je hebt de module gedeactiveerd. Wijzigingen in je rooster worden niet meer gesynchroniseerd naar je gekozen kalender applicatie. <br><br> Bij heractivatie moet de agenda opnieuw worden gekoppeld.',
        notActivatedMessage: '<b>Let op:<br></b>Door het activeren van deze module wordt je rooster beschikbaar zonder in te loggen.<br> PMT heeft de nodige maatregelen getroffen om te zorgen dat niet-geautoriseerde personen niet bij je rooster kunnen komen.<br>Veranderingen in roosters worden momenteel niet gesynchroniseerd.',
        languageHeader: 'Taal',
        languageDescription: 'Klik op de vlag om de taal aan te passen.',

        optional: 'Optioneel:',
        explanation: [
            'Hoe voeg ik mijn PMT kalender toe aan google op mijn mobiel?',
            'Klik de link voor de google kalender, of kopieër de volgende link: ',
            'Open de link in een nieuw tabblad',
            'Klik accepteer in de popup in Google Kalender die vraagt of je de agenda wilt toevoegen',
            'Wacht een paar minuten',
            'Open de Google Kalender applicatie',
            'Open het menu linksbovenin met het icoon: ',
            'Scroll naar beneden en klik de knop instellingen',
            'Zoek naar de kalender voor jouw winkel en klik er op',
            'Na het klikken op de kalender, zet de knop voor \'Synchronizeren\' aan',
            'Je kalender is nu gesynchroniseerd, gefeliciteerd! 😃',
        ],
    },
}

export default translations
