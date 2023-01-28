const translations = {
    nonEditableProcess: 'niet-aanpasbaar',
    notEditableWhileFetchingNorms: 'Processen kunnen niet bijgewerkt worden tijdens het ophalen van WLP normen.',
    notEditableWhileFetchingNormsPatterns: 'Patronen kunnen niet bijgewerkt worden tijdens het ophalen van WLP normen.',
    noTimeframesForProcess: 'Er zijn geen tijdsblokken om bij te werken voor dit proces',
    processTable: {
        headers: {
            department: 'Afdeling',
            process: 'Activiteit',
            actions: 'Acties',
            total: 'Totaal',
        },
        tooltips: {
            goToDay: 'Ga naar de {0} processen',
        },
    },
    dayProcessTable: {
        headers: {
            department: 'Afdeling',
            process: 'Activiteit',
            startEndTime: 'Van - tot',
            duration: 'Uren',
            actions: 'Acties',
        },
    },
    distributionTable: {
        headers: {
            department: 'Afdeling',
            pattern: 'Patroon',
            actions: 'Acties',
            total: 'Totaal',
        },
        errors: {
            totalsNeedToBe100: 'Alle totalen moeten 100% zijn',
        },
        tooltips: {
            calculatedDistributionPattern: 'Berekend - {0}',
            missingProfile: 'Patroon niet bekend in PMT. De WLP2 configuratie is niet up to date.',
            normTotalHours: 'Norm totaal uren',
            noProcessesUseThisPattern: 'Geen proces voor dit patroon',
        },
        normHours: 'Norm uren',
        saved: 'Opgeslagen',
        linkedProcesses: 'Gekoppelde processen',
    },
    totalProcessRows: '{0} processen',
    totalPatternRows: '{0} patronen',
    totalBudgetedHours: 'Totaal gebudgetteerde uren',
    workloadNeedsSync: 'De data is verouderd. Haal de norm op om bij te werken.',
    fetchNorms: 'Haal norm op uit WLP',
    wlpPatterns: 'WLP Patronen',
    normsFetchSuccessfully: 'Normen zijn succesvol opgehaald !',
    timeframesSaves: 'Succesvol opgeslagen !',
    discardChangesConfirmationMessage: 'Weet je zeker dat je de veranderingen ongedaan wilt maken?',
    applyProfileToDistributionConfirmationMessage: 'Weet je zeker dat je het profiel als weekpatroon wilt gebruiken voor deze week? Alle waarden worden overschreven.',
    chooseSaveOptionMessage: 'Kies hoe je wilt opslaan. U kunt beide opties kiezen.',
    chooseAtLeastOneSaveOption: 'Kies minimaal één optie',
    showAll: 'Toon alle',
    hideAll: 'Verberg alle',
    timeframes: {
        form: {
            duplicateStartTimes: 'Dubbele start tijden gedetecteerd',
        },
    },
    backToWorkload: 'Terug naar werklast',
    applyProfile: 'Gebruik profiel als weekpatroon',
    applyProfileShort: 'Gebruik profiel',
    saveAsProfile: 'Opslaan als profiel',
    saveAndSaveAsProfile: 'Opslaan en opslaan als profiel',
    profile: 'Profiel',
    emptyState: {
        weekNotReleasedTitle: 'Niks nada noppes !',
        weekNotReleasedSubTitle: 'Deze week is nog niet vrijgegeven.',
    },
    weekStatuses: {
        closed: 'Gesloten',
        draft: 'Concept',
        released: 'Vrijgegeven',
    },
    statusInfoTable: {
        weekStatus: 'Week Status',
        changedBy: 'Veranderd door',
        changedOn: 'Veranderd op',
    },
    timeframesInfo: {
        aboutButton: 'Over de tijdvensters',
        header: 'Over het bijwerken van tijdvensters',
        clickToClose: 'Klik ergens om te sluiten',
        saving: {
            title: 'Tijdvenster toevoegen',
            body: 'Binnen ieder proces kan je voor iedere dag van de week maximaal 3 tijdvensters gebruiken, ieder met een eigen percentage van de werklast voor die dag. Je kan een tijdvenster toevoegen met de + knop. De percentuele verdeling die je kiest wordt ook toegepast in toekomstige weken, totdat je besluit om deze te wijzigen.',
        },
        adding: {
            title: 'Tijdvenster instellen',
            body: 'Ieder tijdvenster bevat een percentage en een aantal uur. Het percentage geeft aan welk deel van de totale werklast voor die dag hoort bij dat tijdvenster. Dit percentage resulteert in een aantal uur. Deze uren worden alleen opgeslagen voor de week waarin de aanpassing is gedaan. De percentages worden opgeslagen voor iedere toekomstige week.',
        },
    },
}
export default translations
