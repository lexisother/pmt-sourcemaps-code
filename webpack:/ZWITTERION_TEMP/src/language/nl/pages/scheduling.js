const translations = {
    topBar: {
        publicHoliday: 'Let op: feestdag ({0})',
    },
    printSettings: {
        title: 'Afdrukinstellingen',
        showDayRemarks: 'Toon dagopmerkingen',
        showDayTotals: 'Toon dagtotalen',
        showDepartmentTotalsTotals: 'Toon afdelingstotalen',
        showProductive: 'Toon productief',
        showNonProductive: 'Toon niet productief',
        showIndirectTasks: 'Toon indirecte taken',
        showRdos: 'Toon goedgekeurde verlofaanvragen',
        showNotScheduledEmployees: 'Toon medewerkers zonder dienst',
        printTable: {
            productive: 'Productief',
            nonProductive: 'Niet productief',
            indirectTasks: 'Indirecte taken',
            absent: 'Afwezig',
            remark: 'Opmerking',
            showNotPlanned: 'Niet gepland',
            dayTotal: 'Dag totaal',
        },
        printOptions: 'Afdrukopties',
    },
    pageSettings: {
        settings: {
            title: 'Instellingen',
            items: {
                weekStatus: 'Week status',
                toggleGrouping: 'Groepeer op afdeling / medewerker',
            },
        },
        extraWindows: {
            title: 'Extra vensters',
            items: {
                steerInformation: 'Stuurinformatie',
                steerInformationExtended: 'Uitgebreide stuurinformatie',
                workloadChart: 'Bezettingsinformatie',
                analyse: 'Analyse',
                weekNotReleased: 'Niet beschikbaar omdat week niet is vrijgegeven',
            },
        },
        gridDisplay: {
            title: 'Roosterweergave',
            items: {
                breaks: 'Pauzes',
                pendingRdo: 'Verlofaanvraag',
                approvedRdo: 'Goedgekeurde verlofaanvraag',
                approvedSubstituteRequests: 'Goedgekeurde vervangingsaanvraag',
                totals: 'Totalen',
                availabilities: 'Beschikbaarheid',
                nonAvailabilities: 'Onbeschikbaar',
                employeeTotals: 'Dagtotaal + niet-productief zonder start/eindtijd',
                employeeTotalsWeek: 'Weektotalen',
                wabWarnings: 'WAB Waarschuwingen',
                hideUnrelatedDepartmentShifts: 'Verberg diensten niet-gerelateerd aan afdeling',
                alwaysShowAvailabilityWeekViewEmployeeClick: 'Toon beschikbaarheid bij selecteren medewerker',
                alwaysShowRemarksWeekViewEmployeeClick: 'Toon dagopmerkingen bij selecteren medewerker',
                alwaysShowAllRemarks: 'Toon dagopmerkingen altijd voor elke medewerker',
                showNormPlannedHours: 'Norm | Gepland | Afwijking',
                expandMultipleCheckHoursEmployees: 'Meerdere medewerkers openklappen',
                compactView: 'Compacte weergave',
            },
        },
    },
    publishPopUp: {
        publish: 'Publiceren',
        disabled: 'Dit rooster publiceren is niet mogelijk',
        noChanges: 'Selecteer minimaal 1 afdeling',
        blockingNotifications: 'Er zijn meldingen die het sturen van dit rooster blokkeren. Los deze eerst op',
        overlapingShifts: 'Er zijn overlappende diensten die het sturen van dit rooster blokkeren. Los deze eerst op',
        title: {
            finalize: 'Rooster publiceren',
            publish: 'Rooster publiceren',
            close: 'Afdeling(en) sluiten',
            reopen: 'Afdeling(en) heropenen',
        },
        saveNotification: 'Weet je zeker dat je deze popup wilt sluiten? Alle ingevoerde data gaat verloren.',
        saveButtons: {
            finalize: 'Publiceren',
            publish: 'Publiceren',
            close: 'Sluiten',
            reopen: 'Heropenen',
            publishDisabled: 'Je kan geen roosters publiceren in weken die in het verleden liggen',
            closeDisabled: 'Het sluiten van de afdelingen wordt beschikbaar op zaterdag',
        },
        allDepartments: 'Alle afdelingen',
        publishDayRemarks: 'Dagopmerkingen mee publiceren',
        publishExchangeShifts: 'Publiceer uitgeleende diensten',
        noExchangePublishableShiftsFound: 'Er zijn geen uitgeleende diensten die nog gepubliceerd moeten worden',
        extraLabels: {
            reopened: 'heropend',
            emailNotSent: 'niet verzonden',
        },
        overruleWarnings: 'Je staat op het punt om de roosters te publiceren met blokkerende waarschuwingen. Weet je zeker dat je verder wilt gaan?',
        apiActions: {
            finalized: 'De geselecteerde afdeling(en) zijn gepubliceerd',
            closed: 'De geselecteerde afdeling(en) zijn gesloten',
            reopened: 'De geselecteerde afdeling(en) zijn heropend',
        },
    },
    weekStatus: {
        title: 'Week status',
        statusTooltip: 'Laatst gewijzigd op:',
        notificationPanel: 'Er zijn 9 melding die het publiceren van dit rooster blokkeren',
        notificationPanelShowNotifications: 'Toon meldingen',
        statuses: {
            released: 'Vrijgegeven',
            draft: 'Niet vrijgegeven',
            undefined: 'Niet vrijgegeven',
            closed: 'Gesloten',
        },
        departmentStatuses: {
            finalized: 'Gepubliceerd',
            changed: 'Gewijzigd',
            concept: 'Concept',
            closed: 'Gesloten',
        },
        openAll: 'Open alle',
        closeAll: 'Sluit alle',
        weekIs: 'Deze week is {status}',
        info: {
            closed: 'Je kan de diensten in deze week niet bewerken of publiceren',
            released: 'Je kan diensten in deze week aanmaken, bewerken en publiceren',
            draft: 'Je kan de diensten in deze week bewerken, maar je kan nog niet publiceren',
        },
    },
    steerInformation: {
        showMore: 'Toon meer',
        showLess: 'Toon minder data',
        data: {
            productive_hours: 'Uren',
            productive_costs: 'Kosten',
            average_hourly_wage: 'Uurloon gemiddeld',
            productivity: 'Productiviteit / u',
            turnover: 'Omzet',
            expected: 'Verwacht',
            realized: 'Gerealiseerd',
        },
        dataType: {
            norm: 'Norm',
            planned: 'Gepland',
            expected: 'Verwacht',
            deviation: 'Afwijking',
        },
        allDepartments: 'Alle afdelingen',
        departmentTypes: {
            turnover: 'Omzet afdelingen',
            cost: 'Kosten afdelingen',
            external: 'Externe afdelingen',
        },
        costDepartmentTotalsHidden: 'Je hebt minimaal 1 kostenafdeling gecombineerd in je selectie. Productiviteits- en omzetinformatie hebben in dit geval geen betekenis. Selecteer 1 individuele kostenafdeling om deze informatie te zien.',
    },
    workload: {
        title: 'Bezetting',
        legend: {
            productive_hours: 'Geplande uren',
            workload: 'Werklast',
            difference: 'Verschil',
            productive_hours_tooltip: 'Productieve uren',
        },
        competenceTooltip: 'Er zijn {amount} medewerker(s) beschikbaar voor {name} op {date}',
        allDepartments: 'Alle afdelingen',
    },
    emptyState: {
        storeIsClosed: 'Winkel gesloten',
        noShiftsForFilters: {
            title: 'Geen resultaten gevonden',
            subTitle: 'Je gebruikt enkele filters. Verander de filters om resultaten te zien.',
        },
        noEmployeeSelected: {
            title: 'Er is geen medewerker geselecteerd',
            subTitle: 'Selecteer een medewerker om hun diensten te zien',
        },
        notImplementedOnMobile: {
            title: 'Deze pagina werkt niet op mobiel.',
            subTitle: 'Open deze pagina op desktop.',
        },
    },
    resourceColumns: {
        name: {
            label: '-',
            labelShort: 'Naam',
        },
        personnel_number: {
            label: 'Nummer',
            labelShort: 'Nr.',
        },
        lpgu: {
            label: 'Loonkosten per gewerkt uur',
            labelShort: 'LPGU',
        },
        age: {
            label: 'Leeftijd',
            labelShort: 'Lftd',
        },
        contractType: {
            label: 'Contracttype',
            labelShort: 'Type',
        },
        contractHours: {
            label: 'Contracturen',
            labelShort: 'Contr.',
        },
        plannedHours: {
            label: 'Geplande uren',
            labelShort: 'Gepland',
        },
        deviation: {
            label: 'Verschil tussen contract- en geplande uren',
            labelShort: 'Afw.',
        },
        wab: {
            label: 'Max uren | Geplande uren | Percentage gepland',
            labelShort: 'WAB',
            period: 'Periode',
        },
        cao: {
            label: 'CAO-meldingen',
            labelShort: 'CAO',
        },
        remark: {
            label: 'Opmerkingen',
            labelShort: 'Opmerkingen',
        },
        departments: {
            label: 'Sorteer op aantal afdelingen',
            labelShort: 'Afdelingen',
        },
        vak: {
            label: 'Huidige verlof balans (einde week)',
            labelShort: 'Verlof',
        },
        atv: {
            label: 'Huidige ATV balans (einde week)',
            labelShort: 'ATV',
        },
        tvt: {
            label: 'Huidige TVT balans (einde week)',
            labelShort: 'TVT',
        },
        competences: {
            label: 'Autorisaties en competenties',
            labelShort: 'Autorisaties',
        },
        startTime: {
            label: '-',
            labelShort: 'Starttijd dienst',
        },
        employee_first_name: {
            label: '-',
            labelShort: 'Voornaam',
        },
        employee_last_name: {
            label: '-',
            labelShort: 'Achternaam',
        },
        nonProductive: {
            label: 'Niet-productieve',
            labelShort: 'NP',
        },
        productiveHours: {
            labelShort: 'PU',
            label: 'Productieve uren',
        },
        nonProductiveHours: {
            labelShort: 'NPU',
            label: 'Niet-productieve uren',
        },
        surcharges: {
            labelShort: 'Toes.',
            label: 'Toeslagen',
        },
        compensation: {
            labelShort: 'Comp.',
            label: 'Compensatie',
        },
        employeeChecked: {
            labelShort: 'Check',
            label: 'Gecontroleerd',
        },
        correction: {
            labelShort: 'CR',
            label: 'Correctie',
        },
        status: {
            label: 'Toestand',
        },
        employee_cell_phone: {
            labelShort: 'Telefoon',
            label: 'Mobiele telefoon',
        },
    },
    resources: {
        unassigned: 'Niet toegewezen diensten',
    },
    tooltips: {
        chooseVisibleColumns: 'Toon/verberg kolommen',
        chooseSortColumn: 'Sorteer op',
        searchEmployees: 'Zoek medewerker',
        expander: 'Toon {0} kolommen',
        readOnlyShift: 'Je kan deze dienst niet bewerken',
        readOnlyNoSSRAccess: 'Je kan deze dienst niet bewerken omdat je geen vervangingsaanvragen mag bewerken',
        lentOutToStore: 'Uitgeleend aan: {name}',
        lentInFromStore: 'Geleend van: {name}',
        rdo: {
            pending: 'Verlofaanvraag',
            approved: 'Goedgekeurd verlof',
        },
        approvedSubstituteRequest: 'Goedgekeurde vervanging',
        available: 'Beschikbaar: {availabilityType}',
        notAvailable: 'Niet beschikbaar: {availabilityType}',
        availableSimple: 'Beschikbaar',
        notAvailableSimple: 'Niet beschikbaar',
        hasSubstituteRequests: 'Vervangingsaanvraag',
        substituteRequestsCount: 'Aanvraag is naar {0} medewerkers verstuurd',
        cannotEditCurrentBreaks: 'Je kan geen pauze wijzigen in het verleden of heden',
        cannotEditFutureBreaks: 'Je kan geen pauze wijzigen in de toekomst',
        substituteShiftAssignedTo: 'De vervangende dienst is toegewezen aan {name}',
        weeklyRemarks: 'Wekelijkse opmerkingen',
        everyWeek: 'Frequentie: elke week',
        everyXWeeks: 'Frequentie: elke {weeks} weken',
        recurringTitle: 'Deze dienst is deel van een terugkerend patroon (standaard schema).',
        startsPreviousWeek: 'Dienst begint in de voorgaande week',
        startsPreviousDay: 'Dienst begint in de voorgaande dag',
        endsNextWeek: 'Dienst eindigt in de volgende week',
        endsNextDay: 'Dienst eindigt in de volgende dag',
        showSentSchedules: 'Toon verzonden roosters voor deze afdeling',
        backToSchedulingPage: 'Terug naar planningspagina',
        availability: 'Beschikbaarheid',
    },
    grouping: 'Groeperen',
    groupByDepartment: 'Groeperen op Afdeling',
    shiftPopover: {
        titles: {
            newSchedule: 'Nieuwe dienst',
            newNonProductive: 'Nieuwe niet-productieve uren',
            editSchedule: 'Wijzig dienst',
            editNonProductive: 'Wijzig niet-productieve uren',
            viewSchedule: 'Dienst',
            viewNonProductive: 'Niet-productieve uren',
            notAssigned: 'Lege dienst',
            newNotAssigned: 'Nieuwe niet-toegewezen dienst',
            editNotAssignedShift: 'Wijzig niet-toegewezen dienst',
        },
        startTime: 'Starttijd',
        endTime: 'Eindtijd',
        duration: 'Alleen totaalduur',
        productiveHours: 'Productieve uren',
        nonProductiveHours: 'Niet-productieve uren',
        startEndTimes: 'Met start- en eindtijd',
        break: 'Pauzeduur',
        deleteRemark: 'Opmerking wissen',
        shiftSaved: 'Wijzigingen opgeslagen',
        isNotIncludedInFiltersTitle: 'Geen onderdeel van de toegepaste filters',
        isNotIncludedInFilters: 'Deze afdeling is geen onderdeel van de toegepaste filters.',
        nonEditableInfo: {
            time: 'Tijd',
            shift: 'Deze dienst is niet bewerkbaar. Je hebt geen toegang tot deze afdeling.',
        },
        enableOverTheNightShift: 'Dienst loopt tot volgende dag',
        overTheNightShift: 'Nachtdienst',
        shiftAssignedTo: 'Dienst is toegewezen aan {0}',
        shiftUnAssignedFrom: '{0} van dienst verwijderd',
        substituteRequestRejected: 'Vervangingsaanvraag afgewezen.',
        clearStore: 'Stop uitlenen',
        clearInput: 'Veld legen',
        shiftTabs: {
            productive: 'Productieve dienst',
            indirectTasks: 'Indirecte taken',
        },
        indirectTasks: {
            title: 'Indirecte taken',
            taskType: 'Type taak',
            selectTask: 'Selecteer taak',
            duration: 'Duur',
            addAnother: 'Indirecte taak toevoegen',
            allTasksAlreadyAdded: 'Je kan geen taken meer toevoegen. Alle beschikbare indirecte taken zijn al toegevoegd.',
            noLongerThanShiftDuration: 'Je kan geen indirect taken toevoegen die de lengte van de dienst ({0}) overschrijden. Bewerk de start/eind tijden om de duur van de indirecte uren aan te passen.',
            created: 'Indirecte taken aangemaakt',
            saved: 'Indirecte taken gewijzigd',
            deleted: 'Indirecte taken verwijderd',
        },
        nonProductive: {
            bookableHourType: 'PMT Code',
            bookableHourTypeForeignOption: 'Looncode',
            onlyAvailableWithDuration: '(alleen beschikbaar met totaalduur)',
        },
        outsideEmployeeDepartments: 'Behoort niet tot afdelingen van {name}',
        outsideEmployeeDepartmentsStandard: 'Dit is een toekomstige afdeling voor {name}',
        storeNumber: 'Winkelnummer',
        storeNotAvailableForExchange: 'Winkel niet meer beschikbaar om te ruilen.',
        cannotBeTransferredToDate: 'Dienst kan niet naar deze datum overgezet worden, omdat medewerker dan uit dienst is of geen contract heeft',
        cannotAssignShiftToReadOnlyEmployee: 'Het is niet toegestaan om het rooster van {name} aan te passen',
    },
    editCreateRemarkForm: {
        title: 'Opmerking op de dag',
        recurringRemark: 'Deze dagopmerking is onderdeel van een standaardrooster. Wijzigingen worden alleen opgeslagen voor de geselecteerde dag',
    },
    deleteShift: {
        shiftDeleted: 'Dienst verwijderd',
        cancelShiftDeleted: 'Ongedaan maken',
    },
    shortcutsMenu: {
        weekView: 'Weekoverzicht',
        dayView: 'Dagweergave',
        nextDay: 'Volgende dag',
        previousDay: 'Vorige dag',
        nextWeek: 'Volgende week',
        previousWeek: 'Vorige week',
        filters: 'Filters',
        publish: 'Publiceren',
        addNew: 'Nieuwe toevoegen',
        selectDay: 'Selecteer dag',
        navigation: 'Navigatie',
        view: 'Weergave',
        grid: '', // empty tranlsation for DE and NL by design
        selectPreviousEmployee: 'Selecteer vorige medewerker',
        selectNextEmployee: 'Selecteer volgende medewerker',
        closeOrUnselectEmployee: 'Sluit alles wat open staat of deselecteer een medewerker',
        copyShift: 'Kopieër geselecteerde dienst',
        pasteShift: 'Plak dienst (hover of selecteer een cell)',
        deleteShift: 'Verwijder geselecteerde dienst',
    },
    contextMenu: {
        editSchedule: 'Wijzig dienst',
        assignEmployee: 'Medewerker toewijzen',
        removeEmployee: 'Verwijder medewerker van dienst',
        changeEmployee: 'Wissel medewerker',
        otherEmployees: 'Andere medewerkers',
        allEmployees: 'Toon alle medewerkers',
        lessEmployees: 'Toon minder medewerkers',
        addEmployeeRemark: 'Opmerking op de dag toevoegen',
        editEmployeeRemark: 'Opmerking op de dag bijwerken',
        deleteEmployeeRemark: 'Opmerking op de dag verwijderen',
        lendOutEmployee: 'Medewerker uitlenen',
        lendOutShift: 'Dienst uitlenen',
        lentInEmployee: 'Geleende medewerker',
        addIndirectTask: 'Indirecte taken',
        assessSubstituteRequest: 'Beoordeel vervangingsaanvraag',
        rejectSubstituteRequest: 'Vervangingsaanvraag afwijzen',
        noSuggestionsForShift: 'Er zijn geen suggesties beschikbaar voor deze dienst',
        isFullyAvailable: 'Valt binnen de voorkeursbeschikbaarheid van de medewerker',
    },
    otherEmployeeSelector: {
        title: 'Medewerker aan dienst toewijzen',
    },
    substituteRequests: {
        overrideExisting: 'Er is een nog niet beoordeeld vervangingsaanvraag voor deze dienst. Als je deze dienst bewerkt, wijs je dit verzoek automatisch af. Wil je doorgaan?',
        substituteRequest: 'Vervangingaanvraag',
    },
    rdos: {
        allDay: 'Hele dag',
        rdo: 'VERLOFAANVRAAG',
    },
    placeholders: {
        selectStoreFirst: 'Selecteer eerst een winkel',
        selectStore: 'Selecteer een winkel',
        selectDepartment: 'Selecteer een afdeling',
        selectEmployee: 'Selecteer een medewerker',
        selectBookableHourType: 'Selecteer PMT Code',
        selectBookableHourTypeForeignOption: 'Selecteer Looncode',
    },
    overlap: {
        businessTimes: 'Bedrijfstijden',
        startEndsBusinessTimes: 'De dienst {payload} buiten de winkel bedrijfstijden',
        starts: 'begint',
        ends: 'eindigt',
        startsEnds: 'begint en eindigt',
        employeeNotAvailableForTimes: 'Deze medewerker is niet (volledig) beschikbaar',
        notAvailableForTimes: 'Niet (volledig) beschikbaar',
        schoolTimes: 'Schooltijden',
        sportTimes: 'Sporttijden',
        otherTimes: 'Andere tijden',
        shift: 'Deze medewerker heeft een andere dienst op het opgegeven tijdstip',
        dayIsClosed: 'Dag is gesloten',
    },
    warnings: {
        extraPayout: 'Het bewerken van de dienst kan resulteren in extra uitbetaling.',
        extraPayoutInfo: 'Deze situatie is van toepassing',
        cannotOverlap: 'Kan niet overlappen met een andere dienst',
        cannotDecreaseCurrentBreaks: 'Je kan geen pauze tijden verminderen voor diensten in het verleden en heden.',
        cannotDecreaseFutureBreaks: 'Je kan geen pauze tijden verminderen voor diensten in de toekomst.',
        cannotDecreaseBreaks: 'Je kan geen pauze toepassen voor deze dienst die lager ligt dan {breakTime}',
        cannotBeLongerThan24Hours: 'Een dienst mag niet langer zijn dan 24 uur.',
        cannotAssignShiftToEmployee: 'Kan {department} dienst niet toewijzen aan {employee}',
        notificationsFor: 'Meldingen voor',
        employmentDateWarning: 'Dienstverband begint op',
        unemploymentDateWarning: 'Dienstverband eindigt op',
        contractEndWarning: 'Contract eindigt op',
        selectValidWeekday: 'Je kan diensten niet buiten de weekweergave plaatsen',
        allDepartmentsAreClosed: 'Alle afdelingen zijn gesloten',
        weekNotReleased: 'Niet beschikbaar. Week niet is vrijgegeven.',
        previousWeekNotClosed: 'Niet beschikbaar. Voorgaande week is nog niet gesloten.',
        cannotExchangeWithIndirectTasks: 'Je kan een dienst met indirecte taken niet ruilen',
    },
    schedulingNotifications: {
        generalBlocking: 'Er zijn {0} blokkerende meldingen',
        rm1: '{0} medewerker(s) halen hun contracturen niet',
        pendingAvailabilityRequests: '{0} medewerker(s) hebben openstaande beschikbaarheidsaanvragen.',
        pendingRdoRequests: '{0} medewerker(s) hebben openstaande verlofaanvragen.',
        pendingSubstituteRequests: '{0} medewerker(s) hebben openstaande vervangingsverzoeken.',
        co80: '{0} medewerker(s) hebben ten minste 1 dienst gepland op zondag of een feestdag',
        wab2: '{0} medewerker(s) waar de WAB 100% is overschreden',
        wab3: '{0} medewerker(s) waar de WAB 130% is overschreden',
        cla: '{0} medewerker(s) blokkerende CAO waarschuwingen',
        blockingAtw: '{0} medewerker(s) blokkerende ATW waarschuwingen',
        overlapNonPlannable: '{0} medewerker(s) hebben blokkerende overlap',
        scheduleExceedsNorm: '{0} medewerker(s) hebben overlappende diensten gebaseerd op norm uren',
        rm30: '{0} medewerkers hebben een ATW- of CAO-overtreding die om je aandacht vraagt',
        rm40: '{0} medewerker(s) hebben diensten die starten of eindigen buiten de bedrijfstijden',
        rm50: 'Er zijn {0} overlappende productieve en/of niet-productieve diensten in de geselecteerde week',
        rm60: 'De geplande uren overschrijden de uren norm op afdelingsniveau voor {0} afdelingen',
        rm70: 'De geplande uren overschrijden de uren norm op winkelniveau',
        rm80: 'De loonkosten overschrijden de norm op winkelniveau',
        claWarnings: '{0} medewerkers hebben een ATW- of CLA-overtreding die om je aandacht vraagt',
        links: {
            general: 'Je kan dit beoordelen via',
            'pending-substitutes': 'de Planning pagina',
            'leave-and-absence-page': 'de Verlof/Afwezig pagina',
            'availability-overview-init': 'het Beschikbaarheid overzicht',
        },
        blockingIcon: 'Er is ten minste één openstaande waarschuwing voor deze afdeling. Controleer de rode meldingen',
    },
    assessSubtituteRequest: {
        title: 'Beoordeel vervangingsaanvraag',
        requestedBy: 'Door',
        requestedOn: 'Op',
        shiftDate: 'Datum',
        shiftTimes: 'Tijden',
        shiftDepartment: 'Afdeling',
        shiftRemark: 'Opmerking',
        selectEmployeeToAssign: 'Selecteer een medewerker om toe te wijzen',
        assignShiftTo: 'Wijs dienst toe aan {name}',
        ssrReply: 'Reageer',
        ssrReplyStatus: {
            '-1': 'Niet geïnteresseerd',
            0: '(geen reactie)',
            1: 'Geïnteresseerd',
        },
        shift: 'Dienst',
        request: 'Verzoek',
    },
    employment: {
        title: 'Medewerker is niet in dienst',
        from: 'In dienst: {date}',
        to: 'Uit dienst: {date}',
        contractEndTitle: 'Contract is beëindigd',
        contractEnd: 'Einde contract: {date}',
        unemployed: 'Niet in dienst',
        expiredContract: 'Contract beëindigd',
    },
    weekDetails: {
        title: 'Week {weekYear} details',
        characteristic: 'Karakteristiek',
        description: 'Omschrijving',
        empty: 'Er is geen karakteristiek of omschrijving ingesteld voor deze week.',
    },
    standardShifts: {
        titles: {
            shifts: 'Standaard diensten',
            remarks: 'Standaard dagopmerkingen',
            addNewShiftsFrequency: 'Nieuw standaard dienstenrooster',
            editShiftsFrequency: 'Bewerk standaard dienstenrooster',
            addNewRemarksFrequency: 'Nieuw standaard dagopmerkingenrooster',
            editRemarksFrequency: 'Bewerk standaard dagopmerkingenrooster',
        },
        frequencyModal: {
            frequency: 'Frequentie',
            startWeek: 'Startweek',
            endWeek: 'Eindweek',
            selectStartWeek: 'Selecteer startweek',
            selectEndWeek: 'Selecteer eindweek',
            bothWeeks: 'start- en eindweek',
            noneOfSchedules: 'geen van de roosters',
            firstPossibleWeek: 'eerstmogelijke startweek',
            firstPossibleEndWeek: 'eerstmogelijke eindweek',
        },
        tooltips: {
            cannotDeleteEmptyRow: 'Rij zonder diensten kan niet verwijderd worden',
            cannotEditPastFrequency: 'Je kan standaardroosters met een einddatum in het verleden niet bewerken of verwijderen',
            noEndDate: 'Dit standaardrooster wordt oneindig herhaald.',
            noEndDateRemarks: 'Dit standaard opmerking wordt oneindig herhaald.',
            cannotEditFrequency: 'Je kan de frequentie van dit standaardrooster niet meer aanpassen. Maak een nieuw standaardrooster aan.',
            cannotEditStartWeek: 'Je kan de startweek van dit standaardrooster niet meer aanpassen. Maak een nieuw standaardrooster aan.',
            copyToNewRow: 'Maak een nieuw standaardrooster aan op basis van deze terugkerende diensten',
            newRowAlreadyExists: 'Er is al een nieuwe rij toegevoegd voor {employeeName}',
            noPermissionToEditRemarks: 'Je hebt geen toestemming om standaard opmerkingen te bewerken.',
            noPermissionToEditStandardShifts: 'Je hebt geen toestemming om standaardroosters te bewerken',
            claValidationOutcomes: 'CLA Validations',
            caorules: 'CAO Rules',
        },
        info: {
            unEmployementDate: 'Uitdienst datum: {date}',
            employementDate: 'In dienst datum: {date}',
            overlap: 'Deze medewerker heeft een andere dienst op het opgegeven tijdstip. Controleer alle standaardroosters van deze medewerker',
        },
        warnings: {
            cannotOverlapWithOtherStandardSchedules: 'Deze medewerker heeft al een standaardrooster met dezelfde startweek en frequentie',
            changeResultsInOverlappingShifts: 'De nieuwe frequentie of start week die je hebt geselecteerd zorgt ervoor dat dit standaardrooster overlapt met een ander standaardrooster van dezelfde medewerker. Controleer alle standaardroosters van deze medewerker',
        },
        frequencyHeader: {
            title: 'Frequentie - Periode',
            frequency: 'Frequentie',
            startWeek: 'Start week',
            endWeek: 'Eind week',
            actions: 'Acties',
        },
    },
    apiErrors: {
        base: 'We konden de volgende informatie niet ophalen:',
        availabilities: 'Beschikbaarheden',
        availabilityWeeksets: 'Beschikbaarheid weeksets',
        requestsDayOff: 'Verlof aanvragen',
        weekDetails: 'Week details',
        breaks: 'Pauze tijden suggesties',
        wagePerHour: 'Loonkosten',
        wabCounters: 'WAB-tellers',
        balances: 'Verlofstanden',
        contracts: 'Contracten',
        indirectTasks: 'Indirecte taken',
        indirectHours: 'Indirecte uren',
        storeGroups: 'Winkelgroepen',
        claSettings: 'CAO Instellingen',
        bookableHourTypes: 'PMT codes',
        times: 'Bedrijfstijden',
        scheduleSubstituteRequests: 'Vervangings aanvragen',
        dayRemarks: 'Dagopmerkingen',
        finalizeDepartments: 'Rooster notificaties',
        publicHolidays: 'Feestdagen',
        periods: 'Periode tabellen',
        steerInformation: 'Stuurinformatie',
        claValidationOutcomes: 'CLA Validations',
        timeDistribution: 'Werklast informatie',
        remarks: 'Dagopmerkingen',
        standardRemarks: 'Standaard diensten',
        standardShifts: 'Standaard dagopmerkingen',

        // Critical ones, customers will probably never see these translations but on the off chance they do I put them in here
        employees: 'Medewerkers',
        departments: 'Afdelingen',
        shifts: 'Diensten',
        weekStatus: 'Week status',
        weekDepartmentStatus: 'Afdelingen status',

        // messages
        pageFailedLoading: 'Het is niet gelukt om de pagina te laden. Probeer het opnieuw.',
        problemKeepsOccuring: 'Blijft het probleem bestaan?',
        contactUs: 'Neem dan contact met ons op',
    },
    articleHelperTitle: 'Korte introductie voor nieuwe pagina: Planning maken',
    checkHours: {
        planningPageLabel: 'Planning maken',
        someOpenDepartments: 'Er zijn {departments-count} {departments-pluralization} die nog niet gesloten zijn.',
        gotToPlanningPage: 'Ga naar de pagina {action} om deze afdelingen te sluiten.',
        departmentNotClosed: 'Deze afdeling is nog niet gesloten. Ga naar de pagina Planning maken om deze afdeling te sluiten.',
    },
    copyPaste: {
        errors: {
            notCopied: 'Er is nog geen dienst gekopieërd',
            weekClosed: 'Week is gesloten',
            departmentClosed: 'Afdeling voor gekopieërde dienst is gesloten',
            readOnly: 'Medewerker kan niet bewerkt worden',
            lentOut: 'Uitgeleende diensten kunnen niet gekopieërd worden',
            lentIn: 'Ingeleende diensten kunnen niet gekopieërd worden',
        },
    },
    employeeDetails: 'Medewerkergegevens',
    nothingPlanned: 'Niets gepland',
    productive: 'Productief',
    nonProductive: 'Niet productief',
    shifts: 'diensten',
    weekCloseNotifications: {
        balance_limits: 'De verlofsaldo\'s voor {employeeCount} medewerker overschrijden de vastgestelde limiet.',
        week_surcharges: 'Er zijn overwerktoeslagen van het type OTG voor {employeeCount} medewerkers. Pas deze aan naar type OTT.',
        employee_contract_hours: 'Voor {employeeCount} medewerkers zijn er te weinig uren geboekt ten opzichte van het contract. Vul de uren aan met verlof, ATV of indien er voor beide geen saldo is, onbetaald verlof.',
        employee_agreed_hours: 'Voor {employeeCount} medewerkers is het totaal aan gewerkte- en verlofuren meer dan is afgesproken.',
        employee_special_hours: '.', // This rule has no notification (only an automatic action on week close, without notifying the user).
        profit_retail_sync_conditions: 'Er zijn uren geboekt na de contract einddatum voor {employeeCount} medewerkers. Verwijder de uren in Controle uren, of verleng het contract in Profit Retail en voer een medewerkersynchronisatie uit.',
        period_totals: 'Voor {employeeCount} medewerkers zijn er meer dan 142 uren geboekt voor deze periode. Corrigeer deze uren.',
        violations_for_rule_hv40: 'Er zijn {employeeCount} medewerkers voor wie te weinig of te veel uren zijn geboekt ten opzichte van hun contract. Vul de uren aan met verlof, ATV of indien er voor beide geen saldo is, onbetaald verlof.',
        excess_payout_hours: 'Er zijn {employeeCount} medewerkers waarvoor het totaal aan uit te betalen uren de contracturen overschrijdt. Pas de TVTM uren aan voor deze medewerkers.',
        to1_contract_hours: 'De geboekte uren zijn niet gelijk aan de contracturen voor {employeeCount} medewerkers.',
        unpaid_leave_hours: 'Er zijn {employeeCount} medewerkers voor wie er onbetaalde verlofuren zijn geboekt.',
        v_hours: '.', // This rule has no notification (only an automatic action on week close, without notifying the user).
        holiday_schedules: 'Er zijn {employeeCount} medewerkers voor wie een dienst is gepland op een zon- of feestdag, maar waarvoor dat niet toegestaan is. Pas het rooster aan of neem contact op met Loonkostenbeheer Coop.',
        tts_rule: 'Er zijn {employeeCount} medewerkers waarvoor TTS uren zijn geboekt, terwijl ze daar geen recht op hebben. Verwijder deze uren om de week te kunnen sluiten.',
        cla_violations: 'Er zijn {employeeCount} medewerkers waarvan het rooster niet aan de CAO- en/of ATW-regels voldoet.',
        to30_non_productive_hours: 'Er zijn {employeeCount} medewerkers met vaste contracturen, voor wie er meer niet-productieve uren zijn geboekt dan volgens hun contract is toegestaan.',
        to40_non_productive_hours: 'Er zijn {employeeCount} oproepkrachten waarvoor er meer niet-productieve uren zijn geboekt dan het maximaal aantal uren zoals vastgelegd in hun contract.',
    },
    closeWeek: 'Week sluiten',
    reopenWeek: 'Week opnieuw openen',
}

export default translations
