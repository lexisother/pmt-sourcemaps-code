const translations = {
    general: {
        title: 'Nachrichtenübersicht',
        sticky: 'Hervorgehobene Neuigkeiten',
        create: 'Entwerfen',
        unreadMessages: '{0} ungelesene Nachrichten',
        hiddenMessages: 'Nachrichten sind vorübergehend verborgen. Entwerfe oder annuliere die Erstellung des Berichts um diese wieder anzuzeigen.',
        loadingEditor: 'Editor laden ...',
    },
    info: {
        title: 'Filter',
        departments: 'Abteilungen',
        all: 'Alle',
        allDepartments: 'Alle Abteilungen',
        categories: 'Kategorien',
        uncategorized: 'Unkategorisiert',
        unread: 'Ungelesen',
        markAsRead: 'Als gelesen markieren',
        new: 'Neu !',
        infoTitle: 'Information',
        deleteFilters: 'Filter löschen',
        organisationalNews: 'Neuigkeiten Unternehmen',
        activeNews: 'Aktive Neuigkeiten',
        inactiveNews: 'Inaktive Neuigkeiten',
        activeNewsInfo: 'Zeige Nachrichten an, die in der Nachrichtenübersicht für jeden sichtbar sind',
        inactiveNewsInfo: 'Zeige Nachrichten an, die in der Nachrichtenübersicht  noch nicht/nicht mehr für jeden sichtbar sind (\'Toon vanaf\' datum is nog niet behaald of \'Toon tot\' datum is verstreken)',

    },
    noNews: {
        title: 'Keine Neuigkeiten',
        text: 'Es gibt keine Neuigkeiten zu lesen',
        textFilters: 'Mit den verwendeten Filtern gibt keine Neuigkeiten zu lesen',
        leftText: 'Keine Nachrichten um anzuzeigen, klicke',
        hrefText: 'hier',
        rightText: 'um die Filter eventuell zurückzusetzen',
        afterScroll: 'Es gibt keine älteren Nachrichten zu lesen',
    },
    newsBody: {
        noNews: 'Es gibt nicht mehr Neuigkeiten um anzuzeigen...',
        readMore: 'Zeige mehr an...',
        readLess: 'Ausblenden',
        isLoading: 'Es werden mehr Neuigkeiten geladen...',
    },
    newsInfo: {
        createdAt: 'Gepostet von:',
        lastEdited: 'Zuletzt bearbeitet von:',
        cog: 'Öffne/schlieβe Nachrichtenbericht Einstellungen',
        edit: 'Bearbeiten',
        newspaper: 'Newsletter',
        eye: 'Newslog',
        trash: 'Löschen',
        sticky: 'Hervorgehobene Neuigkeiten',
        invisible: 'Unsichtbare Neuigkeiten. Dieser Bericht hat ein Erscheiningsdatum in der Zukunft/der Vergangenheit. Darum wird dieser Bericht nur Personen angezeigt, die die Berechtigung zum \'Neuigkeiten bearbeiten\'besitzen.',
    },
    actions: {
        news_created: 'Bericht zugefügt',
        news_edited: 'Bericht gespeichert',
        news_deleted: 'Nachrichtenbericht gelöscht',
        newsletter_sent: 'Newsletter ist versendet',
        news_delete: 'Bist du dir sicher, dass du diesen Bericht löschen möchtest ?',
        news_delete_confirm: 'Nachrichtenbericht erfolgreich gelöscht',
    },
    createEdit: {
        // Titles
        newNewsMessage: 'Neuer Nachrichtenbericht',
        editNewsMessage: 'Nachrichtenbericht bearbeiten',

        // Options
        enterTitle: 'Gib einen Titel ein...',
        enterBody: 'Gib einen Nachrichtentext ein...',

        // Visibility
        visibilityOptions: ' Optionen Sichtbarkeit',
        departments: 'Abteilung(en) *',
        departmentHint: 'Abteilung(en) ausgewählt',
        category: 'Kategorie',
        roles: 'sichtbar für *',
        rolesHint: 'Position(en) ausgewählt',
        storegroups: 'Filialgruppen / Unternehmen',
        storegroupsHint: 'Filialgruppe(n) ausgewählt',
        showFrom: 'Anzeigen ab',
        showUntil: 'Anzeigen bis',

        // Public
        publicOptions: 'Optionen Öffentlichkeit',
        publicNews: 'Öffentliche Neuigkeiten (extern)',
        publicWarning: 'Dieser Artikel wird im Internet veröffentlicht',
        homepageNews: 'Homepage Neuigkeiten (intern)',
        publicInfo: 'Denke daran, dass Abbildungen und Beilagen öffentlich angezeigt werden, wenn die Option "Öffentliche Neuigkeiten" aktiviert ist',

        // Sticky options
        stickyOptions: 'Optionen Hervorgehoben',
        stickyNews: 'Hervorgehobene Neuigkeiten',
        stickyUntil: 'Hervorgehoben bis',
        stickyInfo: 'Hervorgehobene Neuigkeiten’ angezeigt. Dadurch bleibt der Nachrichtenbericht immer obenan in der Nachrichtenübersicht stehen',

        // Buttons
        cancel: 'Abbrechen',
        save: 'Speichern',
        create: 'Entwerfen',

        // Info
        selectAll: 'Wähle alles aus',
        others: 'Andere',
        characters: 'Zeichen: ',
        intro: 'Beispiel für einleitenden Text',
        introMax: 'Noch verfügbare Zeichen für Einleitung: ',
        introInfo: 'Es gibt keine separaten Abschnitte mehr für die Einleitung und den vollständigen Nachrichtentext. Stattdessen wird der erste Teil der Nachricht automatisch nach ungefähr {0} Zeichen geteilt und als Einleitung verwendet. Es werden keine Worte abgebrochen.',
        mandatoryInfo: 'Aktionen mit * sind Pflichtfelder',

        // Snackbar messages
        savedSuccess: 'Nachrichtentext erfolgreich gespeichert',
        error: 'Es ist ein Fehler aufgetreten. Versuche es erneut oder wende dich an den Support, wenn der Fehler weiterhin  auftritt',
        unenteredData: 'Du musst Daten eingeben um den Nachrichtenbericht zu speichern',
        checkRedOutLinedItems: 'Überprüfe die rot umrandeten Blöcke',
    },
    newsTrack: {
        employee: 'Mitarbeiter',
        dateSent: 'Datum gesendet',
        dateRead: 'Datum gelesen',
        info: 'Newslog',
        toNewsletter: 'Versende als Newsletter',
        seenBy: 'Gesehen von',
    },
}

export default translations
