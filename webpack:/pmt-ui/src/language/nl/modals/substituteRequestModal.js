const translate = {
    title: 'Vervanger zoeken',

    selectShiftStep: {
        info: 'Selecteer de dienst die je wilt laten overnemen',
        tableHeader: {
            date: 'Datum',
            department: 'Afdeling',
            shift: 'Dienst',
            break: 'Pauze',
        },
        lockIconInfo: 'Voor de diensten met een {0} staat al een vervangingsaanvraag open.',
        cancelBtn: {
            label: 'Annuleren',
        },
        noSchedulesTitle: 'Je hebt geen roosters.',
        noSchedulesText: 'We konden geen roosters vinden om een vervanging voor aan te vragen.',
    },

    selectColleagueStep: {
        info: 'Selecteer de collega(s) naar wie je het verzoek voor overname wilt sturen',
        tableHeader: {
            name: 'Naam',
            department: 'Afdeling',
        },
        otherColleagueSection: {
            info: 'Heb je al met iemand gepraat om over te nemen en staat deze niet in de lijst? Voeg hem/haar via onderstaande selectie toe.',
            selectField: {
                label: 'Selecteer collega om deze toe te voegen',
                placeholder: 'Typ of selecteer collega',
            },
        },
        noColleaguesAvailableForShift: 'Er is geen collega beschikbaar voor deze dienst',
    },

    overviewStep: {
        info: 'Controleer je aanvraag',
        shiftLabel: 'Dienst die je wilt laten overnemen',
        colleaguesLabel: 'Collega(s) naar wie je het verzoek voor overname wilt sturen',
        remarkField: {
            minChars: 'minimaal 10 karakters',
            label: 'Wat is de reden dat je niet kan werken? {0}',
            placeholder: 'Sweet marshmallow marzipan danish halvah. Jujubes fruitcake chocolate bar tiramisu pudding donut halvah gummies.',
        },

        changeShiftBtn: {
            label: 'Wijzigen',
        },
        sendBtn: {
            label: 'Verzoek versturen',
        },
    },

    prevBtn: {
        label: 'Vorige',
    },
    nextBtn: {
        label: 'Volgende',
    },

    success: {
        title: 'Aanvraag verstuurd',
        message: 'Jouw aanvraag voor vervanging is verstuurd.',
    },
    error: {
        existingRequest: {
            title: 'Aanvraag reeds verstuurd',
        },
        unknown: {
            title: 'Er is iets fout gegaan',
        },
    },
}

export default translate
