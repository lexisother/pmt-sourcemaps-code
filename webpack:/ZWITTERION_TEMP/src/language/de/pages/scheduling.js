const translations = {
    topBar: {
        publicHoliday: 'Achtung: Feiertag ({0})',
    },
    printSettings: {
        title: 'Druckeinstellungen',
        showDayRemarks: 'Bemerkungen zum Showtag',
        showDayTotals: 'Tagessummen anzeigen',
        showDepartmentTotalsTotals: 'Abteilungssummen anzeigen',
        showProductive: 'Produktiv anzeigen',
        showNonProductive: 'Nicht produktiv anzeigen',
        showIndirectTasks: 'Indirekte Aufgaben anzeigen',
        showRdos: 'Genehmigte Urlaubsanträge anzeigen',
        showNotScheduledEmployees: 'Mitarbeiter ohne Zeitplan zeigen',
        printTable: {
            productive: 'Produktiv',
            nonProductive: 'Nicht produktiv',
            indirectTasks: 'Indirekte Aufgaben',
            absent: 'Abwesend',
            remark: 'Anmerkung',
            showNotPlanned: 'Nicht geplant',
            dayTotal: 'Tag insgesamt',
        },
        printOptions: 'Druckoptionen',
    },
    pageSettings: {
        settings: {
            title: 'Einstellungen',
            items: {
                weekStatus: 'Wochenstatus',
                toggleGrouping: 'Gruppieren nach Abteilung/Mitarbeiter',
            },
        },
        extraWindows: {
            title: 'Zusätzliche Fenster',
            items: {
                steerInformation: 'Steuerinformationen',
                steerInformationExtended: 'Umfangreiche Steuerinformationen',
                workloadChart: 'Berufsbezogene Informationen',
                analyse: 'Analysieren',
                weekNotReleased: 'Nicht verfügbar, da Woche noch nicht veröffentlicht',
            },
        },
        gridDisplay: {
            title: 'Rasteranzeige',
            items: {
                breaks: 'Pausen',
                pendingRdo: 'Urlaubsantrag',
                approvedRdo: 'Genehmigter Urlaub',
                approvedSubstituteRequests: 'Genehmigter Ersatzanfragen',
                totals: 'Totals',
                availabilities: 'Verfügbarkeit',
                nonAvailabilities: 'Non-Beschikbaarheid',
                employeeTotals: 'Tagesgesamt + unproduktiv ohne Start/Endzeit',
                employeeTotalsWeek: 'Wochensummen',
                wabWarnings: 'WAB Warnungen',
                hideUnrelatedDepartmentShifts: 'Dienste ohne Bezug zur Abteilung ausblenden',
                alwaysShowAvailabilityWeekViewEmployeeClick: 'Verfügbarkeit bei Auswahl anzeigen',
                alwaysShowRemarksWeekViewEmployeeClick: 'Tageskommentare bei Auswahl anzeigen',
                alwaysShowAllRemarks: 'Tageskommentare immer für jeden Mitarbeiter anzeigen',
                showNormPlannedHours: 'Norm | Geplant | Abweichung',
                expandMultipleCheckHoursEmployees: 'Expand multiple employees',
                compactView: 'Kompakte Ansicht',
            },
        },
    },
    publishPopUp: {
        publish: 'Publizieren',
        disabled: 'Eine Veröffentlichung dieses Fahrplans ist nicht möglich',
        noChanges: 'Wählen Sie mindestens 1 Abteilung aus',
        blockingNotifications: 'Es gibt Benachrichtigungen, die das Senden dieses Zeitplans blockieren. Bitte sprechen Sie diese zuerst an',
        overlapingShifts: 'Es gibt überschneidende Schichten, die das Senden dieses Zeitplans blockieren. Bitte sprechen Sie diese zuerst an',
        title: {
            finalize: 'Zeitplan publizieren',
            publish: 'Zeitplan publizieren',
            close: 'Abteilung(en) schließen',
            reopen: 'Abteilung(en) wieder öffnen',
        },
        saveNotification: 'Möchten Sie dieses Popup wirklich schließen? Alle eingegebenen Daten gehen verloren.',
        saveButtons: {
            finalize: 'Publizieren',
            publish: 'Publizieren',
            close: 'Schließen',
            reopen: 'Wieder öffnen',
            publishDisabled: 'Sie können keine Zeitpläne in Wochen veröffentlichen, die in der Vergangenheit liegen',
            closeDisabled: 'Der Abteilungenschluss wird am Samstag verfügbar',
        },
        allDepartments: 'Alle Abteilungen',
        publishDayRemarks: 'Tägliche Kommentare veröffentlichen',
        publishExchangeShifts: 'Ausgeliehene Dienste Veröffentlichen',
        noExchangePublishableShiftsFound: 'Es sind noch keine ausgeliehenen Dienste zu Publizieren',
        extraLabels: {
            reopened: 'wiedereröffnet',
            emailNotSent: 'nicht gesendet',
        },
        overruleWarnings: 'Sie sind dabei, die Zeitpläne zu veröffentlichen, während Sie Sperrbenachrichtigungen erhalten. Sind Sie sicher, dass Sie fortfahren wollen?',
        apiActions: {
            finalized: 'Die ausgewählten Abteilung(en) wurden veröffentlicht',
            closed: 'Die ausgewählten Abteilung(en) werden geschlossen',
            reopened: 'Die ausgewählten Abteilungen wurden wiedereröffnet',
        },
    },
    weekStatus: {
        title: 'Wochenstatus',
        statusTooltip: 'Zuletzt geändert am:',
        notificationPanel: 'Es gibt 9 Benachrichtigungen, die die Veröffentlichung dieses Zeitplans blockieren',
        notificationPanelShowNotifications: 'Zeige Benachrichtigungen',
        statuses: {
            released: 'Freigegeben',
            draft: 'Nicht freigegeben',
            undefined: 'Nicht freigegeben',
            closed: 'Abgeschlossen',
        },
        departmentStatuses: {
            finalized: 'Veröffentlicht',
            changed: 'Geändert',
            concept: 'Konzept',
            closed: 'Geschlossen',
        },
        openAll: 'Öffne alle',
        closeAll: 'Schließen alle',
        weekIs: 'Diese Woche ist {status}',
        info: {
            closed: 'Sie können die Dienste in dieser Woche nicht bearbeiten oder veröffentlichen',
            released: 'In dieser Woche können Sie Dienste erstellen, bearbeiten und veröffentlichen',
            draft: 'Sie können die Dienste in dieser Woche bearbeiten, aber noch nicht veröffentlichen',
        },
    },
    steerInformation: {
        showMore: 'Show more',
        showLess: 'Show less data',
        data: {
            productive_hours: 'Stunden',
            productive_costs: 'Kosten',
            average_hourly_wage: 'Durchschnittslohn / h',
            productivity: 'Produktivität / h',
            turnover: 'Umsatz',
            expected: 'Erwarteter',
            realized: 'Realisierter',
        },
        dataType: {
            norm: 'Norm',
            planned: 'Geplant',
            expected: 'Erwarteter',
            deviation: 'Abweichung',
        },
        allDepartments: 'Alle Abteilungen',
        departmentTypes: {
            turnover: 'Turnover departments',
            cost: 'Cost departments',
            external: 'External departments',
        },
        costDepartmentTotalsHidden: 'Sie haben mindestens 1 Kostenstelle in Ihrer Auswahl zusammengefasst. Produktivitäts- und Umsatzinformationen haben in diesem Fall keine Bedeutung. Um diese Informationen anzuzeigen, wählen Sie 1 einzelne Kostenabteilung aus',
    },
    workload: {
        title: 'Beruf',
        legend: {
            productive_hours: 'Produktive Stunden',
            workload: 'Arbeitsbelastung',
            difference: 'Unterschied',
            productive_hours_tooltip: 'Produktive Stunden',
        },
        competenceTooltip: 'Es sind {amount} Mitarbeiter für {name} am {date} verfügbar',
        allDepartments: 'Alle Abteilungen',
    },
    emptyState: {
        storeIsClosed: 'Laden geschlossen',
        noShiftsForFilters: {
            title: 'Keine dienst gefunden',
            subTitle: 'Sie verwenden einige Filter. Ändern Sie die Filter, um Ergebnisse zu sehen.',
        },
        noEmployeeSelected: {
            title: 'Es ist kein Mitarbeiter ausgewählt',
            subTitle: 'Wählen Sie einen Mitarbeiter aus, um seine Dienste anzuzeigen',
        },
        notImplementedOnMobile: {
            title: 'Diese Seite funktioniert nicht auf Mobilgeräten.',
            subTitle: 'Bitte öffnen Sie diese Seite auf dem Desktop.',
        },
    },
    resourceColumns: {
        name: {
            label: '-',
            labelShort: 'Name',
        },
        personnel_number: {
            label: '-',
            labelShort: 'Nr.',
        },
        lpgu: {
            label: 'Lohnkosten pro Arbeitsstunde',
            labelShort: 'LPA',
        },
        age: {
            label: 'Alter',
            labelShort: 'Alter',
        },
        contractType: {
            label: 'Kontrakttyp',
            labelShort: 'Typ',
        },
        contractHours: {
            label: 'Kontrakturen',
            labelShort: 'Kontr.',
        },
        plannedHours: {
            label: 'Geplante Stunden',
            labelShort: 'Geplant',
        },
        deviation: {
            label: 'Abweichung zwischen Kontrakt- und geplanten Stunden',
            labelShort: 'Abw.',
        },
        wab: {
            label: 'Maximale Stunden | Geplante Stunden | Prozentsatz geplant',
            labelShort: 'WAB',
            period: 'Zeitraum',
        },
        cao: {
            label: 'Tarifvertragauth',
            labelShort: 'TV',
        },
        remark: {
            label: 'Bemerkungen',
            labelShort: 'Bem.',
        },
        departments: {
            label: 'Sortieren nach Anzahl der Abteilungen',
            labelShort: 'Abt.',
        },
        vak: {
            label: 'Aktueller Urlaubssaldo (Ende der Woche)',
            labelShort: 'Urlaub',
        },
        atv: {
            label: 'Aktueller ATV saldo (Ende der Woche)',
            labelShort: 'ATV',
        },
        tvt: {
            label: 'Aktueller TVT saldo (Ende der Woche)',
            labelShort: 'TVT',
        },
        competences: {
            label: 'Berechtigungen und Kompetenzen',
            labelShort: 'Berechtigungen',
        },
        startTime: {
            label: '-',
            labelShort: 'Startzeit des Dienstes',
        },
        employee_first_name: {
            label: '-',
            labelShort: 'Vorname',
        },
        employee_last_name: {
            label: '-',
            labelShort: 'Nachname',
        },
        nonProductive: {
            label: 'Nicht produktiv',
            labelShort: 'NP',
        },
        productiveHours: {
            labelShort: 'PS',
            label: 'Produktiv Stunden',
        },
        nonProductiveHours: {
            labelShort: 'NPS',
            label: 'Nicht produktive Stunden',
        },
        surcharges: {
            labelShort: 'Zu',
            label: 'Zuschläge',
        },
        compensation: {
            labelShort: 'Komp',
            label: 'Kompensation',
        },
        employeeChecked: {
            labelShort: 'checked',
            label: 'Gecheckt',
        },
        correction: {
            labelShort: 'KR',
            label: 'Korrektur',
        },
        status: {
            label: 'Status',
        },
        employee_cell_phone: {
            labelShort: 'Telefon',
            label: 'Mobiltelefon',
        },
    },
    resources: {
        unassigned: 'Nicht zugewiesene Dienste',
    },
    tooltips: {
        chooseVisibleColumns: 'Spalten ein- oder ausblenden',
        chooseSortColumn: 'Sortieren nach',
        searchEmployees: 'Mitarbeiter suchen',
        expander: '{0} Spalten anzeigen',
        readOnlyShift: 'Sie können diesen Dienst nicht bearbeiten',
        readOnlyNoSSRAccess: 'Sie können diese Schicht nicht bearbeiten, da Sie keinen Zugriff zum Bearbeiten von Vertretungsanträgen haben',
        lentOutToStore: 'Verliehen an: {name}',
        lentInFromStore: 'Geliehen von: {name}',
        rdo: {
            pending: 'Urlaubsantrag',
            approved: 'Genehmigter Urlaub',
        },
        approvedSubstituteRequest: 'Genehmigter Ersatz',
        available: 'Verfügbar: {availabilityType}',
        notAvailable: 'Nicht verfügbar: {availabilityType}',
        availableSimple: 'Verfügbar',
        notAvailableSimple: 'Nicht verfügbar',
        hasSubstituteRequests: 'Vertretung anfrage',
        substituteRequestsCount: 'anfrage wurde an {0} Mitarbeiter gesendet',
        cannotEditCurrentBreaks: 'Sie können keine Pausen in der Vergangenheit oder Gegenwart bearbeiten',
        cannotEditFutureBreaks: 'Sie können in Zukunft keine Pausen mehr bearbeiten',
        substituteShiftAssignedTo: 'De vervangende dienst is toegewezen aan {name}',
        weeklyRemarks: 'Wöchentliche Bemerkungen',
        everyWeek: 'Frequenz: jede Woche',
        everyXWeeks: 'Frequenz: alle {weeks} Wochen',
        recurringTitle: 'Diese Schicht ist Teil eines wiederkehrenden Musters (Standardplan).',
        startsPreviousWeek: 'Dienst beginnt in der Vorwoche',
        startsPreviousDay: 'Dienst beginnt in der Tag',
        endsNextWeek: 'Dienst endet nächste Woche',
        endsNextDay: 'Dienst endet nächste Tag',
        showSentSchedules: 'Gesendete Pläne für diese Abteilung anzeigen',
        backToSchedulingPage: 'Zurück zur Planungsseite',
        availability: 'Verfügbarkeit',
    },
    grouping: 'Gruppierung',
    groupByDepartment: 'Gruppieren auf Abteilung',
    shiftPopover: {
        titles: {
            newSchedule: 'Neuer Zeitplan',
            newNonProductive: 'Neuer Non-Produktive Stunden',
            editSchedule: 'Zeitplan bearbeiten',
            editNonProductive: 'Non-Produktive Stunden bearbeiten',
            viewSchedule: 'Zeitplan',
            viewNonProductive: 'Non-Produktive Stunden',
            notAssigned: 'Nicht zugewiesene Änderungen',
            newNotAssigned: 'Neuer nicht zugewiesen Schicht',
            editNotAssignedShift: 'Nicht zugewiesenen Dienst ändern',
        },
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        duration: 'Nur Gesamtdauer',
        productiveHours: 'Produktive Stunden',
        nonProductiveHours: 'Non-Produktive Stunden',
        startEndTimes: 'Mit Start- und Endzeit',
        break: 'Pausenzeit',
        deleteRemark: 'Anmerkung Löschen',
        shiftSaved: 'Änderungen gespeichert',
        isNotIncludedInFiltersTitle: 'Nicht in den angewendeten Filtern enthalten',
        isNotIncludedInFilters: 'Abteilung ist nicht in den angewendeten Filtern enthalten.',
        nonEditableInfo: {
            time: 'Zeit',
            shift: 'Dieser Dienst kann nicht bearbeitet werden. Sie haben keinen Zugriff auf diese Abteilung.',
        },
        enableOverTheNightShift: 'Zeitplan spannen bis zum nächsten Tag',
        overTheNightShift: 'Nachtdienst',
        shiftAssignedTo: 'Dienst an {0} zugeordnet',
        shiftUnAssignedFrom: '{0} von dem Dienst entfernt',
        substituteRequestRejected: 'Ersatzanforderung abgelehnt.',
        clearStore: 'Verleihen aufhalten',
        clearInput: 'leere',
        shiftTabs: {
            productive: 'Produktive Dienst',
            indirectTasks: 'Indirekte Aufgabe',
        },
        indirectTasks: {
            title: 'Indirekte Aufgaben',
            taskType: 'Aufgabentyp',
            selectTask: 'Aufgabe auswählen',
            duration: 'Dauer',
            addAnother: 'Indirekte Aufgabe hinzufügen',
            allTasksAlreadyAdded: 'Sie können keine weiteren Aufgaben hinzufügen. Alle verfügbaren indirekten Aufgaben sind bereits hinzugefügt.',
            noLongerThanShiftDuration: 'Sie können keine indirekten Aufgaben hinzufügen, die die Dauer der Schicht ({0}) überschreiten. Aktualisieren Sie die Anfangs-/Endzeiten der Schicht, um die Dauer der indirekten Stunden erhöhen zu können.',
            created: 'Indirekte Aufgaben erstellt',
            saved: 'Indirekte Aufgaben geändert',
            deleted: 'Indirekte Aufgaben gelöscht.',
        },
        nonProductive: {
            bookableHourType: 'PMT Code',
            bookableHourTypeForeignOption: 'Lohncode',
            onlyAvailableWithDuration: '(nur mit Gesamtdauer verfügbar)',
        },
        outsideEmployeeDepartments: 'Gehört nicht zu den Abteilungen von {name}',
        outsideEmployeeDepartmentsStandard: 'Dies ist ein zukünftiger Abschnitt für {name}',
        storeNumber: 'Filialnummer',
        storeNotAvailableForExchange: 'Store nicht mehr zum Umtausch verfügbar',
        cannotBeTransferredToDate: 'Schicht kann nicht auf dieses Datum übertragen werden, da der Mitarbeiter dann arbeitslos oder ohne Vertrag ist',
        cannotAssignShiftToReadOnlyEmployee: 'Es ist nicht erlaubt, den Zeitplan für {name} anzupassen.',
    },
    editCreateRemarkForm: {
        title: 'Tag Bemerkung',
        recurringRemark: 'Dieser Tag Bemerkung ist Teil eines Standardzeitplan. Änderungen werden nur für den ausgewählten Tag gespeichert',
    },
    deleteShift: {
        shiftDeleted: 'Dienst entfernt',
        cancelShiftDeleted: 'Rückgängig machen',
    },
    shortcutsMenu: {
        weekView: 'Wochenansicht',
        dayView: 'Tagesansicht',
        nextDay: 'Nächster Tag',
        previousDay: 'Vorheriger tag',
        nextWeek: 'Nächste Woche',
        previousWeek: 'Letzte Woche',
        filters: 'Filter',
        publish: 'Pulblicieren',
        addNew: 'Neue hinzufügen',
        selectDay: 'Tag auswählen',
        navigation: 'Navigation',
        view: 'Anzeige',
        grid: ' ', // empty tranlsation for DE and NL by design
        selectPreviousEmployee: 'Vorherigen Mitarbeiter auswählen',
        selectNextEmployee: 'Nächsten Mitarbeiter auswählen',
        closeOrUnselectEmployee: 'Schließen Sie alles was offen ist, oder abwähl einen Mitarbeiter',
        copyShift: 'Schicht kopieren (zuerst eine Schicht auswählen)',
        pasteShift: 'Verschiebung einfügen (bewegen oder eine Zelle auswählen)',
        deleteShift: 'Schicht löschen (zuerst eine Schicht auswählen)',
    },
    contextMenu: {
        editSchedule: 'Zeitplan bearbeiten',
        assignEmployee: 'Mitarbeiter zuweisen',
        removeEmployee: 'Mitarbeiter von dem Dienst entfernen',
        changeEmployee: 'Mitarbeiter wechseln',
        otherEmployees: 'Andere Mitarbeiter',
        allEmployees: 'Alle Mitarbeiter anzeigen',
        lessEmployees: 'Weniger Mitarbeiter anzeigen',
        addEmployeeRemark: 'Anmerkung zum Mitarbeitertag hinzufügen',
        editEmployeeRemark: 'Anmerkung zum Mitarbeitertag bearbeiten',
        deleteEmployeeRemark: 'Anmerkung zum Mitarbeitertag löschen',
        lendOutEmployee: 'Mitarbeiter anpassen',
        lendOutShift: 'Dienst anpassen',
        lentInEmployee: 'Geliehener Mitarbeiter',
        addIndirectTask: 'Indirekte Aufgaben',
        assessSubstituteRequest: 'Bewerten Ersatzanforderung',
        rejectSubstituteRequest: 'Ablehnen Ersatzanforderung',
        noSuggestionsForShift: 'Für diesen Dienst sind keine Vorschläge verfügbar',
        isFullyAvailable: 'Fallt in die bevorzugte Verfügbarkeit des Mitarbeiter',
    },
    otherEmployeeSelector: {
        title: 'Mitarbeider am Dienst zuweisen',
    },
    substituteRequests: {
        overrideExisting: 'Für dieser Dienst liegt eine unbewertete Ersatzanforderung vor. Wenn Sie dieser Dienst bearbeiten, lehnen Sie diese Anfrage automatisch ab. Möchtest du fortfahren?',
        substituteRequest: 'Ersatzanfrage',
    },
    rdos: {
        allDay: 'Den ganzen tag',
        rdo: 'ANFRAGE HINTERLASSEN',
    },
    placeholders: {
        selectStoreFirst: 'Wählen Sie ein Geschäft aus',
        selectStore: 'Wählen Sie ein Geschäft aus',
        selectDepartment: 'Wählen Sie ein Abteilung aus',
        selectEmployee: 'Wählen Sie einen Mitarbeiter aus',
        selectBookableHourType: 'PMT Code auswählen',
        selectBookableHourTypeForeignOption: 'Lohn Code auswählen',
    },
    overlap: {
        businessTimes: 'Betriebszeiten',
        startEndsBusinessTimes: 'Schicht {payload} außerhalb der geschäft betriebszeiten',
        starts: 'beginnt',
        ends: 'endet',
        startsEnds: 'beginnt und eindigt',
        employeeNotAvailableForTimes: 'Dieser Mitarbeiter ist nicht (vollständig) verfügbar',
        notAvailableForTimes: 'Nicht (vollständig) verfügbar',
        schoolTimes: 'Schulzeiten',
        sportTimes: 'Sportzeiten',
        otherTimes: 'Anderen zeiten',
        shift: 'Dieser Mitarbeiter ist zur angegebenen Zeit in einer anderen Dienst',
        dayIsClosed: 'Tag ist geschlossen',
    },
    warnings: {
        extraPayout: 'Das Bearbeiten der Änderungen kann zu einer zusätzlichen Auszahlung führen.',
        extraPayoutInfo: 'Diese Situation gilt',
        cannotOverlap: 'Kann sich nicht mit einer anderen Schicht überschneiden',
        cannotDecreaseCurrentBreaks: 'Sie können die Pausenzeiten für vergangene und gegenwärtige Dienstes nicht verringern.',
        cannotDecreaseFutureBreaks: 'Sie können die Pausenzeiten für zukünftige Dienstes nicht verkürzen.',
        cannotDecreaseBreaks: 'You cannot set a break time lower than {breakTime} to this shift',
        cannotBeLongerThan24Hours: 'Eine Schicht darf nicht länger als 24 Stunden dauern.',
        cannotAssignShiftToEmployee: '{department} Dienst kann nicht zugewiesen werden an {employee}',
        notificationsFor: 'Benachrichtigungen für',
        employmentDateWarning: 'Arbeitsverhältnis beginnt am',
        unemploymentDateWarning: 'Arbeitsverhältnis endet am',
        contractEndWarning: 'Vertrag endet am',
        selectValidWeekday: 'Sie können keine Schichten außerhalb der Wochenansicht platzieren',
        allDepartmentsAreClosed: 'Alle Abteilungen sind geschlossen',
        weekNotReleased: 'Nicht verfügbar, da Woche noch nicht veröffentlicht',
        previousWeekNotClosed: 'Nicht verfügbar. Vorwoche ist derzeit nicht geschlossen.',
        cannotExchangeWithIndirectTasks: 'Sie können eine Dienst nicht mit Indirekte Stunden ausgeliehenen',
    },
    schedulingNotifications: {
        generalBlocking: 'Es gibt {0} blockierende Benachrichtigungen',
        rm1: '{0} Mitarbeiter halten ihre Vertragsstunden nicht ein',
        pendingAvailabilityRequests: '{0} Mitarbeiter haben ausstehende Verfügbarkeitsanfragen.',
        pendingRdoRequests: '{0} Mitarbeiter haben sich ausstehende Urlaubsanträge.',
        pendingSubstituteRequests: '{0} Mitarbeiter haben sich ausstehende Ersatzanfragen.',
        co80: '{0} Mitarbeiter haben mindestens 1 Schicht an einem Sonn- oder Feiertag geplant',
        wab2: '{0} Mitarbeiter mit WAB-Überschreitung 100%',
        wab3: '{0} Mitarbeiter mit WAB-Überschreitung 130%',
        cla: '{0} Mitarbeiter blockieren CAO-Abmahnungen',
        blockingAtw: '{0} Mitarbeiter blockieren ATW-Warnungen',
        overlapNonPlannable: '{0} Mitarbeiter haben Sperrüberschneidungen',
        scheduleExceedsNorm: '{0} Mitarbeiter haben sich überschneidende Schichten basierend auf Standardarbeitszeiten',
        rm30: '{0} Mitarbeiter haben einen ATW- oder CLA-Verstoß, der Ihre Aufmerksamkeit erfordert',
        rm40: '{0} Mitarbeiter haben Schichten, die außerhalb der Geschäftszeiten beginnen oder enden',
        rm50: 'In der ausgewählten Woche gibt es {0} sich überschneidende produktive und/oder nicht produktive Schichten',
        rm60: 'Geplante Stunden überschreiten die stündliche Norm auf Abteilungsebene für {0} Abteilung(en)',
        rm70: 'Die geplanten Stunden überschreiten die Stundennorm auf Filialebene',
        rm80: 'Die Lohnkosten übersteigen die Lohnkostennorm auf Filialebene',
        claWarnings: '{0} Mitarbeiter haben einen ATW- oder CLA-Verstoß, der Ihre Aufmerksamkeit erfordert',
        links: {
            general: 'Diese können Sie über die auswerten',
            'pending-substitutes': 'aktuelle Seite',
            'leave-and-absence-page': 'Urlaub/Abwesenheit',
            'availability-overview-init': 'Verfügbarkeitsübersicht',
        },
        blockingIcon: 'Mitarbeiter mit einem ATW- oder CLA-Verstoß, der nicht zulässig ist',
    },
    assessSubtituteRequest: {
        title: 'Ersatzanfrage bewerten',
        requestedBy: 'Von',
        requestedOn: 'Am',
        shiftDate: 'Datum',
        shiftTimes: 'Zeiten',
        shiftDepartment: 'Abteilung',
        shiftRemark: 'Bemerkung',
        selectEmployeeToAssign: 'Wählen Sie einen Mitarbeiter zum Zuweisen aus',
        assignShiftTo: 'Dienst {name} zuweisen',
        ssrReply: 'Antwort',
        ssrReplyStatus: {
            '-1': 'Nicht interessiert',
            0: '(keine Reaktion)',
            1: 'Interessiert',
        },
        shift: 'Dienst',
        request: 'Anfrage',
    },
    employment: {
        title: 'Mitarbeiter ist nicht im Dienst',
        from: 'Beschäftigt: {date}',
        to: 'Aus Dienst: {date}',
        contractEndTitle: 'Vertrag ist beendet',
        contractEnd: 'Vertragsende: {date}',
        unemployed: 'Arbeitslos',
        expiredContract: 'Vertrag beendet',
    },
    weekDetails: {
        title: 'Woche {weekYear} Details',
        characteristic: 'Charakteristik',
        description: 'Beschreibung',
        empty: 'Für diese Woche sind keine Charakteristiken oder Beschreibungen festgelegt.',
    },
    standardShifts: {
        titles: {
            shifts: 'Wiederkehrende Dienste',
            remarks: 'Wiederkehrende Tageskommentare',
            addNewShiftsFrequency: 'Neuer Standarddienstplan',
            editShiftsFrequency: 'Standarddienstplan bearbeiten',
            addNewRemarksFrequency: 'Neuer Standard-Tageskommentarplan',
            editRemarksFrequency: 'Standard-Tageskommentarplan bearbeiten',
        },
        frequencyModal: {
            frequency: 'Frequenz',
            startWeek: 'Startwoche',
            endWeek: 'Endwoche',
            selectStartWeek: 'Startwoche auswählen',
            selectEndWeek: 'Endwoche auswählen',
            bothWeeks: 'Start- und Endwoche',
            noneOfSchedules: 'keiner der Abteilungen',
            firstPossibleWeek: 'erstmögliche Startwoche',
            firstPossibleEndWeek: 'erstmögliche Eindwoche',
        },
        tooltips: {
            cannotDeleteEmptyRow: 'Zeile kann nicht ohne Diensten gelöscht werden',
            cannotEditPastFrequency: 'Standardzeitpläne mit einem Enddatum in der Vergangenheit können nicht bearbeitet oder gelöscht werden',
            noEndDate: 'Dieser Standardzeitplan wird unbegrenzt wiederholt.',
            noEndDateRemarks: 'Dieser Standard-Bemerkung wird unbegrenzt wiederholt.',
            cannotEditFrequency: 'Sie können die Häufigkeit dieses Standardzeitpläne nicht mehr bearbeiten. Bitte erstellen Sie eine neue.',
            cannotEditStartWeek: 'Sie können die Startwoche dieses Standardzeitpläne nicht mehr bearbeiten. Bitte erstellen Sie eine neue.',
            copyToNewRow: 'Erstellen Sie basierend auf diesen wiederkehrenden Diensten einen neuen Standardzeitplan.',
            newRowAlreadyExists: 'Es wurde bereits eine neue Zeile für {employeeName} hinzugefügt',
            noPermissionToEditRemarks: 'Sie sind nicht berechtigt, Standardbemerkungen zu bearbeiten.',
            noPermissionToEditStandardShifts: 'Sie sind nicht berechtigt, Standardschichten zu bearbeiten.',
            claValidationOutcomes: 'CLA Validierungen',
            caorules: 'CAO Regeln',
        },
        info: {
            unEmployementDate: 'Datum der Arbeitslosigkeit: {date}',
            employementDate: 'Beschäftigungsdatum: {date}',
            overlap: 'Dieser Mitarbeiter ist zur angegebenen Zeit in einer anderen Dienst. Überprüfen Sie alle Standardpläne dieses Mitarbeiter',
        },
        warnings: {
            cannotOverlapWithOtherStandardSchedules: 'Dieser Mitarbeiter hat bereits einen Standardplan mit derselben Startwoche und Häufigkeit',
            changeResultsInOverlappingShifts: 'Die neue Häufigkeit oder Startwoche, die Sie ausgewählt haben, führt dazu, dass sich dieser Standarddienstplan mit einem anderen Standarddienstplan desselben Mitarbeiters überschneidet. Überprüfen Sie alle Standardpläne dieses Mitarbeiters',
        },
        frequencyHeader: {
            title: 'Frequenz - Zeitspanne',
            frequency: 'Frequenz',
            startWeek: 'Startwoche',
            endWeek: 'Endwoche',
            actions: 'Aktionen',
        },
    },
    apiErrors: {
        base: 'Wir konnten die folgenden Informationen nicht für Sie abrufen:',
        availabilities: 'Verfügbarkeit',
        availabilityWeeksets: 'Verfügbarkeit Wochensets',
        requestsDayOff: 'RDO-Anforderungen',
        weekDetails: 'Wochendetails',
        breaks: 'Vorschläge für Pausenzeiten',
        wagePerHour: 'Arbeitskosten',
        wabCounters: 'WAB-Zähler',
        balances: 'RDO-Salden',
        contracts: 'Verträge',
        indirectTasks: 'Indirekte Aufgaben',
        indirectHours: 'Indirekte Stunden',
        storeGroups: 'Gruppen speichern',
        claSettings: 'CLA-Einstellungen',
        bookableHourTypes: 'PMT-Codes',
        times: 'Geschäftszeiten',
        scheduleSubstituteRequests: 'Ersatzwünsche',
        dayRemarks: 'Tagesbemerkungen',
        finalizeDepartments: 'Benachrichtigungen planen',
        publicHolidays: 'Feiertage',
        periods: 'Periodentabellen',
        steerInformation: 'Informationen steuern',
        timeDistribution: 'Informationen zur Arbeitsbelastung',
        claValidationOutcomes: 'CLA Validierungen',
        caorules: 'CAO Regeln',
        remarks: 'Tagesbemerkungen',
        standardRemarks: 'Wiederkehrende Tageskommentare',
        standardShifts: 'Wiederkehrende Dienste',

        // Critical ones, customers will probably never see these translations but on the off chance they do I put them in here
        employees: 'Angestellte',
        departments: 'Abteilungen',
        shifts: 'Verschiebungen',
        weekStatus: 'Wochenstand',
        weekDepartmentStatus: 'Abteilungsstatus',

        // messages
        pageFailedLoading: 'Das Laden der Seite ist fehlgeschlagen. Bitte versuche es erneut.',
        problemKeepsOccuring: 'Tritt das Problem immer wieder auf?',
        contactUs: 'Dann kontaktieren Sie uns',
    },
    articleHelperTitle: 'Kurzvorstellung für neue Seite: Planung erstellen',
    checkHours: {
        planningPageLabel: 'Seite Planung',
        someOpenDepartments: 'Es gibt {departments-count} {departments-pluralization}, die noch nicht geschlossen sind.',
        gotToPlanningPage: 'Gehen Sie zur {action} erstellen, um diese Abteilungen zu schließen.',
        departmentNotClosed: 'Diese Abteilung ist noch nicht geschlossen. Gehen Sie zur Seite Planung erstellen, um diese Abteilung zu schließen.',
    },
    copyPaste: {
        errors: {
            notCopied: 'Es wurde noch keine Schicht kopiert',
            weekClosed: 'Woche ist geschlossen',
            departmentClosed: 'Abteilung für kopierte Schicht ist geschlossen',
            readOnly: 'Mitarbeiter ist schreibgeschützt',
            lentOut: 'Ausgeliehene Schichten können nicht kopiert werden',
            lentIn: 'Lent in Schichten kann nicht kopiert werden',
        },
    },
    employeeDetails: 'Mitarbeiterdetails',
    nothingPlanned: 'Nichts geplant',
    productive: 'Produktiv',
    nonProductive: 'Nicht produktiv',
    shifts: 'Dienste',
    weekCloseNotifications: {
        balance_limits: 'Urlaubsguthaben für Mitarbeiter von {employeeCount} überschreiten das festgelegte Limit.',
        week_surcharges: 'Für {employeeCount} Mitarbeiter gibt es Überstundenzuschläge vom Typ OTG. Ändern Sie es in OTT.',
        employee_contract_hours: 'Für {employeeCount} Mitarbeiter wurden im Vergleich zum Vertrag zu wenige Stunden gebucht. Ergänzen Sie die Stunden mit Urlaub, ATV oder, wenn beides nicht ausgeglichen ist, unbezahltem Urlaub.',
        employee_agreed_hours: 'Bei {employeeCount} Mitarbeitern übersteigt die Summe der geleisteten Arbeitsstunden und des Urlaubs den Arbeitsvertrag.',
        employee_special_hours: '.', // This rule has no notification (only an automatic action on week close, without notifying the user).
        profit_retail_sync_conditions: 'Stunden wurden nach dem Vertragsende für {employeeCount} Mitarbeiter gebucht. Löschen Sie die Stunden in Kontrollstunden oder verlängern Sie den Vertrag in Profit Retail und führen Sie eine Mitarbeitersynchronisierung durch.',
        period_totals: 'Für {employeeCount} Mitarbeiter wurden für diesen Zeitraum mehr als 152 Stunden gebucht. Korrigieren Sie diese Stunden.',
        violations_for_rule_hv40: 'Es gibt {employeeCount} Mitarbeiter, für die in Bezug auf den Vertrag zu wenige oder zu viele Stunden gebucht wurden. Ergänze die Stunden mit Urlaub, ATV oder, wenn beides nicht ausgeglichen ist, mit unbezahltem Urlaub.',
        excess_payout_hours: 'Es gibt {employeeCount} Mitarbeiter, bei denen die auszuzahlenden Gesamtstunden die Vertragsstunden überschreiten. Passen Sie die TVTM-Stunden für diese Mitarbeiter an.',
        to1_contract_hours: 'Die gebuchten Stunden entsprechen nicht den Vertragsstunden für {employeeCount} Mitarbeiter.',
        unpaid_leave_hours: 'Es gibt {employeeCount} Mitarbeiter, für die unbezahlte Urlaubsstunden gebucht wurden.',
        v_hours: '.', // This rule has no notification (only an automatic action on week close, without notifying the user).
        holiday_schedules: 'Es gibt {employeeCount} Mitarbeiter, für die an einem Sonn- oder Feiertag eine Schicht vorgesehen ist, dies aber nicht erlaubt ist. Passen Sie den Zeitplan an oder wenden Sie sich an Loonkostenbeheer Coop.',
        tts_rule: 'Es gibt {employeeCount} Mitarbeiter, für die TTS-Stunden gebucht wurden, obwohl sie keinen Anspruch darauf haben. Entfernen Sie diese Stunden, um die Woche abzuschließen.',
        cla_violations: 'Es gibt {employeeCount} Mitarbeiter, deren Dienstplan nicht dem Tarifvertrag und/oder den ATW-Regeln entspricht.',
        to30_non_productive_hours: 'Es gibt {employeeCount} Mitarbeiter mit festen Vertragsstunden, für die mehr unproduktive Stunden gebucht wurden, als ihr Vertrag zulässt.',
        to40_non_productive_hours: 'Es gibt {employeeCount} Bereitschaftsarbeiter, für die mehr nicht produktive Stunden gebucht wurden, als die vertraglich festgelegte maximale Stundenzahl',
    },
    closeWeek: 'Woche schließen',
    reopenWeek: 'Woche wieder öffnen',
}

export default translations
