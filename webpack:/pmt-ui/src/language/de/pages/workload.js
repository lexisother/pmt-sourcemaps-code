const translations = {
    nonEditableProcess: 'nicht änderbar',
    notEditableWhileFetchingNorms: 'Prozesse können während des Abrufens von WLP-Standards nicht aktualisiert werden.',
    notEditableWhileFetchingNormsPatterns: 'Schablonen können während des Abrufens von WLP-Standards nicht aktualisiert werden.',
    noTimeframesForProcess: 'Für diesen Prozess gibt es keine Zeitblöcke, die aktualisiert werden',
    processTable: {
        headers: {
            department: 'Abteilung',
            process: 'Aktivität',
            actions: 'Aktionen',
            total: 'Gesamt',
        },
        tooltips: {
            goToDay: 'Gehe zu {0} Prozessen',
        },
    },
    dayProcessTable: {
        headers: {
            department: 'Abteilung',
            process: 'Aktivität',
            startEndTime: 'Von - bis',
            duration: 'Stunden',
            actions: 'Aktionen',
        },
    },
    distributionTable: {
        headers: {
            department: 'Abteilung',
            pattern: 'Schablone',
            actions: 'Aktionen',
            total: 'Gesamt',
        },
        errors: {
            totalsNeedToBe100: 'Alle Summen müssen 100 % sein',
        },
        tooltips: {
            calculatedDistributionPattern: 'Berechnet - {0}',
            missingProfile: 'Schablone nicht bekannt in PMT. Die WLP2 Konfiguration ist nicht aktuell.',
            normTotalHours: 'Standard Gesamtstunden',
            noProcessesUseThisPattern: 'Kein Prozess für diese Schablone',
        },
        normHours: 'Standard Stunden',
        saved: 'Gespeichert',
        linkedProcesses: 'Verknüpfte Prozesse',
    },
    totalProcessRows: '{0} Prozesse',
    totalPatternRows: '{0} Schablonen',
    totalBudgetedHours: 'Gesamt kalkulierte Stunden',
    workloadNeedsSync: 'Die Daten sind veraltet. Lade den Standard zur Aktualisierung.',
    fetchNorms: 'Lade Standard aus WLP',
    wlpPatterns: 'WLP Schablonen',
    normsFetchSuccessfully: 'Standard wurde erfolgreich geladen !',
    timeframesSaves: 'Erfolgreich gespeichert !',
    discardChangesConfirmationMessage: 'Möchtest du die Änderungen wirklich rückgängig machen ?',
    applyProfileToDistributionConfirmationMessage: 'Bist du dir sicher, dass du das Profil als Wochenschblone für diese Woche verwenden möchtest ? Alle Werte werden überschrieben.',
    chooseSaveOptionMessage: 'Wähle die Speichermethode. Beide Optionen sind möglich.',
    chooseAtLeastOneSaveOption: 'Wähle mindestens eine Option',
    showAll: 'Alles anzeigen',
    hideAll: 'Alles verbergen',
    timeframes: {
        form: {
            duplicateStartTimes: 'Doppelte Anfangszeiten erkannt',
        },
    },
    backToWorkload: 'Zurück zum Arbeitsaufwand',
    applyProfile: 'Verwende Profil als Wochenschablone',
    applyProfileShort: 'Verwende Profil',
    saveAsProfile: 'Speichern als Profil',
    saveAndSaveAsProfile: 'Speichern und speichern als Profil',
    profile: 'Profil',
    emptyState: {
        weekNotReleasedTitle: 'Nix nada !',
        weekNotReleasedSubTitle: 'Diese Woche ist noch nicht freigegeben.',
    },
    weekStatuses: {
        closed: 'Geschlossen',
        draft: 'Konzept',
        released: 'Freigegeben',
    },
    statusInfoTable: {
        weekStatus: 'Wochenstatus',
        changedBy: 'Geändert von',
        changedOn: 'Geändert am',
    },
    timeframesInfo: {
        aboutButton: 'Über die Zeitfenster',
        header: 'Über das Aktualisieren von Zeitfenstern',
        clickToClose: 'Klicke an einer beliebige Stelle um abzuschlieβen',
        saving: {
            title: 'Zeitfenster zufügen',
            body: 'Innerhalb jedes Prozesses kannst du maximal 3 Zeitfenster für jeden Wochentag verwenden, von denen jedes seinen eigenen Prozentsatz der Arbeitslast für diesen Tag hat. Mit dem Button + kannst du ein Zeitfenster hinzufügen. Die von dir gewählte prozentuale Verteilung wird auch in den kommenden Wochen angewendet bis du diese änderst.',
        },
        adding: {
            title: 'Zeitfenster einstellen',
            body: 'Jedes Zeitfenster enthält einen Prozentsatz und eine Anzahl von Stunden. Der Prozentsatz gibt an welcher Teil der Gesamtauslastung für diesen Tag zu diesem Zeitfenster gehört. Dieser Prozentsatz ergibt eine Anzahl von Stunden. Diese Stunden werden nur für die Woche gespeichert, in der die Anpassung vorgenommen wurde. Die Prozentsätze werden für jede zukünftige Woche gespeichert.',
        },
    },
}
export default translations
