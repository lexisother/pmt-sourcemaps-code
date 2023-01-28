const translations = {
    pageTitle: 'Beurteilungen',
    emptyStates: {
        noSearchResults: {
            title: 'Deine Suche hat keine Ergebnisse',
            subTitle: 'Ändere deine Suchkriterien um Ergebnisse zu sehen',
        },
        noAssessments: {
            title: 'Alles durchsucht',
            subTitle: 'Für diese Woche ist nichts zu beurteilen',
        },
        noAssessmentHistory: {
            title: 'Keine Historie',
            subTitle: '{0} hat keine Historie für die letzte(n) {1} Woche(n)',
        },
        noSchedulesToAsses: {
            title: 'Kein Einsatzplan',
            subTitle: '{0} hat keine Einsatzpläne zur Beurteilung',
        },
    },
    employeesAssessmentsTable: {
        columns: {
            employee: 'Mitarbeiter',
            total: 'Gesamt',
        },
    },
    assessmentTabs: {
        assessment: 'Beurteilung',
        history: 'Historie',
        save: 'Speichern',
        saved: 'Beurteilung gespeichert.',
        chartTitle: '{0} Beurteilung(en) für die letze(n) {1} Woche(n)',
        remove: 'Entfernen',
        removed: 'Beurteilung entfernt',
    },
    assessmentTypes: {
        productivity: 'Produktivität',
        quality: 'Qualität',
        attitude: 'Verhalten',
        remark: 'Anmerkung',
        chartTitle: '{0} Beurteilung(en) der letze(n) {0} Woche(n)',
    },
    tooltips: {
        employeesThatNeedAssessment: 'Beurteilte Mitarbeiter / Gesamt Mitarbeiter',
        emptyAssessmentNotValid: 'Null, wenn Beurteilung beim Einsenden ignoriert wird',
        noScheduleDayTab: 'Kein Einsatzplan',
        dayCanBeAssessed: 'Tag kann beurteilt werden',
        dayCannotBeAssessed: 'In der Zukunft liegende Tage können nicht beurteilt werden',
        showOnlyWithSchedules: 'Nur mit Einsatzplan anzeigen',
    },
}

export default translations
