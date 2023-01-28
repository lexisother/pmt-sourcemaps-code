const translations = {
    general: {
        title: 'Nieuwsoverzicht',
        sticky: 'Uitgelicht nieuws',
        create: 'Creëer',
        unreadMessages: '{0} ongelezen berichten',
        hiddenMessages: 'Nieuwsberichten zijn tijdelijk verborgen. Creëer of annuleer het aanmaken van het bericht om ze weer te tonen.',
        loadingEditor: 'Editor laden ...',
    },
    info: {
        title: 'Filters',
        departments: 'Afdelingen',
        all: 'Alle',
        allDepartments: 'Alle afdelingen',
        categories: 'Categorieën',
        uncategorized: 'Ongecategoriseerd',
        unread: 'Ongelezen',
        markAsRead: 'Markeren als gelezen',
        new: 'Nieuw!',
        infoTitle: 'Informatie',
        deleteFilters: 'Verwijder filters',
        organisationalNews: 'Organisatie nieuws',
        activeNews: 'Actief nieuws',
        inactiveNews: 'Inactief nieuws',
        activeNewsInfo: 'Toon nieuwsberichten die voor iedereen zichtbaar zijn op het nieuwsoverzicht',
        inactiveNewsInfo: 'Toon nieuwsberichten die nog niet/niet meer voor iedereen zichtbaar zijn op het nieuwsoverzicht (\'Toon vanaf\' datum is nog niet behaald of \'Toon tot\' datum is verstreken)',

    },
    noNews: {
        title: 'Geen nieuws',
        text: 'Er is geen nieuws om te lezen',
        textFilters: 'Er is geen nieuws om te lezen met de huidige filters',
        leftText: 'Geen berichten om te tonen, klik',
        hrefText: 'hier',
        rightText: 'om eventueel de filters te resetten',
        afterScroll: 'Er zijn geen oudere berichten om te lezen',
    },
    newsBody: {
        noNews: 'Er is niet meer nieuws te tonen...',
        readMore: 'Toon meer...',
        readLess: 'Verberg',
        isLoading: 'Er worden meer nieuwsberichten ingeladen...',
    },
    newsInfo: {
        createdAt: 'Geplaatst door:',
        lastEdited: 'Laatst bewerkt door:',
        cog: 'Open/sluit nieuwsbericht instellingen',
        edit: 'Bewerk',
        newspaper: 'Nieuwsbrief',
        eye: 'Nieuwslog',
        trash: 'Verwijder',
        sticky: 'Uitgelicht nieuws',
        invisible: 'Onzichtbaar nieuws. Dit bericht heeft een verschijndatum in de toekomst/het verleden. Daarom wordt het alleen voor personen met rechten tot \'nieuws bewerken\` getoond.',
    },
    actions: {
        news_created: 'Bericht toegevoegd',
        news_edited: 'Bericht opgeslagen',
        news_deleted: 'Nieuwsbericht verwijderd',
        newsletter_sent: 'Nieuwsbrief is verstuurd',
        news_delete: 'Weet je zeker dat je dit nieuwsbericht wilt verwijderen?',
        news_delete_confirm: 'Nieuwsbericht succesvol verwijderd',
    },
    createEdit: {
        // Titles
        newNewsMessage: 'Nieuw nieuwsbericht',
        editNewsMessage: 'Bewerk nieuwsbericht',

        // Options
        enterTitle: 'Voer een titel in...',
        enterBody: 'Voer een bericht in...',

        // Visibility
        visibilityOptions: 'Zichtbaarheid opties',
        departments: 'Afdeling(en) *',
        departmentHint: 'afdeling(en) geselecteerd',
        category: 'Categorie',
        roles: 'Zichtbaar voor *',
        rolesHint: 'rol(len) geselecteerd',
        storegroups: 'Winkelgroepen / Organisatie',
        storegroupsHint: 'Winkelgroep(en) geselecteerd',
        showFrom: 'Toon vanaf',
        showUntil: 'Toon tot',

        // Public
        publicOptions: 'Openbare opties',
        publicNews: 'Openbaar nieuws (extern)',
        publicWarning: 'Dit artikel wordt openbaar op het internet',
        homepageNews: 'Homepagina nieuws (intern)',
        publicInfo: 'Wees geadviseerd dat afbeeldingen en bijlagen publiekelijk getoond worden als de optie openbaar nieuws is geactiveerd',

        // Sticky options
        stickyOptions: 'Uitgelicht opties',
        stickyNews: 'Uitgelicht nieuws',
        stickyUntil: 'Uitgelicht tot',
        stickyInfo: 'Uitgelicht nieuws’ getoond. Hierdoor blijft het nieuwsbericht altijd bovenin het nieuwsoverzicht staan',

        // Buttons
        cancel: 'Annuleer',
        save: 'Opslaan',
        create: 'Creëer',

        // Info
        selectAll: 'Selecteer alles',
        others: 'anderen',
        characters: 'Karakters: ',
        intro: 'Voorbeeld van introductie tekst',
        introMax: 'Karakters over voor intro: ',
        introInfo: 'Er zijn geen aparte secties meer voor de introductie en het volledige bericht. In plaats daarvan wordt het eerste deel van het nieuwsbericht automatisch gesplitst na ongeveer {0} karakters, en als introductie gebruikt. Hierbij worden er geen woorden afgebroken.',
        mandatoryInfo: 'Acties met * zijn verplicht om ingevuld te worden',

        // Snackbar messages
        savedSuccess: 'Nieuws bericht succesvol opgeslagen',
        error: 'Er is iets verkeerd gegaan, probeer het opnieuw of neem contact op met support als dit blijft gebeuren',
        unenteredData: 'Je moet data invullen om het nieuws bericht op te slaan',
        checkRedOutLinedItems: 'Controleer de rood omlijnde blokken',
    },
    newsTrack: {
        employee: 'Medewerker',
        dateSent: 'Datum verstuurd',
        dateRead: 'Datum gelezen',
        info: 'Nieuwslog',
        toNewsletter: 'Verstuur als nieuwsbrief',
        seenBy: 'Bekeken door',
    },
}

export default translations
