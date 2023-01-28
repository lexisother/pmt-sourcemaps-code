const translations = {
    titles: {
        new: 'Nieuwe beschikbaarheid',
        edit: 'Beschikbaarheid bewerken',
        newWeekset: 'Nieuwe weekset',
    },

    createdBy: 'gemaakt door ',
    modifiedBy: 'gewijzigd door ',
    you: 'Jij',

    typeField: {
        label: 'Type',
    },
    dateField: {
        label: 'Datum',
    },
    travelBeforeField: {
        label: 'Reistijd naar',
    },
    travelAfterField: {
        label: 'Reistijd van',
    },
    lessonHoursField: {
        label: 'Lesuren',
    },

    submitBtn: {
        label: 'Opslaan',
    },
    cancelBtn: {
        label: 'Annuleren',
    },
    deleteBtn: {
        label: 'Verwijderen',
    },

    school: {
        notBeforeSeven: 'School kan niet starten voor {0}',
        notAfterNineteen: 'School kan niet eindigen na {0}',
        notBeforeSevenShort: ' (alleen tussen {0} - {1})',
        onlyBetween: 'School is alleen toegestaan tussen {0} - {1}',
        noLongerThanTwelveHours: 'Lesuren mogen niet meer dan {0} bedragen',
        notAllowedOnWeekends: ' (niet toegestaan in het weekend)',
    },

    validationMsg: {
        travelBeforeNotOnSameDay: 'De start van de reis naar school moet op dezelfde datum starten.',
        travelAfterNotOnSameDay: 'De terugkomst van school moet op dezelfde dag vallen.',
        timesOverlap: 'De eindtijd is aangepast naar {0}, omdat overlappende tijden zijn gevonden.',
        notShorterThanFiveteenMinutes: 'Beschikbaarheid kan niet korter zijn dan 15 minuten',
        overlapDetected: 'Tijd is overlappend met een ander.',
        outsideBusinessTimes: 'Tijd valt buiten bedrijfstijden.',
    },

    newAvailability: {
        oneTime: 'Eenmalig',
        recurring: 'Terugkerend',
        freshStart: 'Frisse Start',
        freshStartTooltip: 'Begin met een lege weekset',
        fromCurrent: 'Vanaf huidige',
        fromCurrentTooltip: 'Selecteer dit om je huidige beschikbaarheden te gebruiken',
        aboutWeeksetsPrimary: 'Weeksets helpen je met het organiseren van je werk en persoonlijke activiteiten zoals jij het wilt. Dit houdt in dat een terugkerende beschikbaarheid vanaf nu wordt toegevoegd voor elke week, tot dat je een nieuwe weekset aanmaakt.',
        aboutWeeksetsSecondary: 'De nieuwe weekset moet goedgekeurd worden door een manager voordat je het kan gebruiken',
    },
    delete: 'Verwijderen',
    notEditableTitle: 'Niet bewerkbaar',
    notEditable: 'Deze beschikbaarheid is onderdeel van set met wekelijkse beschikbaarheid. Als je dit wilt wijzigen kun je een nieuwe set aanmaken.',
    singleWeekEdit: 'Wijzigingen worden alleen opgeslagen voor deze week. Wil je deze wijziging ook voor toekomstige weken doorvoeren? Maak dan een nieuwe weekset aan.',
    singleWeekMsg: {
        changeFailed: 'Er is iets misgegaan. Het is niet gelukt om deze beschikbaarheid aan te passen. Probeer het opnieuw.',
        changeSaved: 'De wijzigingen zijn opgeslagen',
    },
}

export default translations
