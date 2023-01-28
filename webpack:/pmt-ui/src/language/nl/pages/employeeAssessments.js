const translations = {
    pageTitle: 'Beoordelingen',
    emptyStates: {
        noSearchResults: {
            title: 'Je zoekopdracht heeft geen resultaten',
            subTitle: 'Bewerk je zoekopdracht criteria om resultaten te zien',
        },
        noAssessments: {
            title: 'Overal gezocht',
            subTitle: 'Er is niks om te beoordelen voor deze week',
        },
        noAssessmentHistory: {
            title: 'Geen historie',
            subTitle: '{0} heeft geen geschiedenis voor de laatste {1} weken',
        },
        noSchedulesToAsses: {
            title: 'Geen rooster',
            subTitle: '{0} heeft geen roosters die beoordeeld kunnen worden',
        },
    },
    employeesAssessmentsTable: {
        columns: {
            employee: 'Medewerker',
            total: 'Totaal',
        },
    },
    assessmentTabs: {
        assessment: 'Beoordeling',
        history: 'Historie',
        save: 'Opslaan',
        saved: 'Beoordeling opgeslagen.',
        chartTitle: '{0} beoordelingen voor de laatste {1} weken',
        remove: 'Verwijderen',
        removed: 'Beoordeling verwijderd',
    },
    assessmentTypes: {
        productivity: 'Productiviteit',
        quality: 'Kwaliteit',
        attitude: 'Gedrag',
        remark: 'Opmerking',
        chartTitle: '{0} beoordelingen van de laatste {0} weken',
    },
    tooltips: {
        employeesThatNeedAssessment: 'Beoordeelde medewerkers / Totale medewerkers',
        emptyAssessmentNotValid: 'Nul als beoordeling wordt genegeerd bij het inzenden',
        noScheduleDayTab: 'Geen rooster',
        dayCanBeAssessed: 'Dag kan worden beoordeeld',
        dayCannotBeAssessed: 'Toekomstige dagen kunnen niet worden beoordeeld',
        showOnlyWithSchedules: 'Toon alleen met rooster',
    },
}

export default translations
