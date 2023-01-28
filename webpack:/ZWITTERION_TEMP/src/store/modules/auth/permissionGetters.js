import stringHelper from '../../../libraries/stringHelper'
export default {

    /**
     * Description.
     * Returns whether a user can access resources based their permissions
     * This can be access like canYou('planning', 'someRightOrModule')
     *
     * @returns Object or String or Boolean
     */
    canYou: (state) => (moduleName, permission) => {
        return state.permissions ? stringHelper.getObjectPropertyValue(permission, state.permissions[moduleName]) : false
    },

    CAN_READ_SHIFTS(state, getters) {
        if (typeof getters.canYou('planning', 'shifts_read') === 'boolean') {
            return getters.canYou('planning', 'shifts_read')
        } else {
            return false
        }
    },

    /**
     * Returns whether the user ca modify their own planning.
     *
     * @returns {*}
     */
    CAN_EDIT_OWN_PLANNING(state, getters) {
        return getters.canYou('planning', 'planning_edit')
    },

    /**
     * Returns whether the user ca plan other employees.
     *
     * @returns {*}
     */
    canPlanOthers(state, getters) {
        return getters.canYou('planning', 'planning_others')
    },

    /**
     * Returns true if the user has access to schedules for all store, not only from his/her departments.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    canFetchStoreSchedules(state, getters) {
        return getters.canYou('planning', 'schedules_all_departments_view') || getters.canYou('planning', 'all_departments')
    },

    HAS_ALL_DEPARTMENTS_ACCESS(state, getters) {
        return getters.canYou('planning', 'all_departments')
    },

    /**
     * Returns whether the user can see Time Off totals
     * @returns {Boolean}
     */
    hasVak(state, getters) {
        return getters.canYou('planning', 'show_vak')
    },

    /**
     * Returns whether the user can see Time for Time totals
     * @returns {Boolean}
     */
    hasTvt(state, getters) {
        return getters.canYou('planning', 'show_tvt')
    },

    /**
     * Returns whether the user can see ATV totals
     * @returns {Boolean}
     */
    hasAtv(state, getters) {
        return getters.canYou('planning', 'show_atv')
    },

    /**
     * Returns true if current user has rights to fetch balances: if has access to rdo and has one of the balances right: atv, tvt or vak.
     *
     * @param state
     * @param getters
     * @returns {Boolean}
     */
    canFetchRDOBalances(state, getters) {
        return getters.hasTimeOffAccess && (getters.hasTvt || getters.hasTvt || getters.hasVak)
    },

    /**
     * Returns whether the user can request time off
     * @returns {Boolean}
     */
    hasRole: (state, getters) => (role) => {
        const id = role === 'employee' ? 25 : 0
        return getters.canYou('employee', 'role').id === id
    },

    /**
     * Returns whether the user can edit other users availabilities. This includes creating and approving
     * @returns {Boolean}
     */
    canEditOthersAvailabilities(state, getters) {
        return getters.canYou('planning', 'availability_others_edit')
    },

    /**
     * Returns whether the user will save single or weekset availabilities in availability step for activation flow
     * @returns {Boolean}
     */
    hasWeeksetInActivationFlow(state, getters) {
        return getters.canYou('planning', 'availability_weeksets_activation_flow')
    },

    /**
     * Returns whether the user can view other users availabilities.
     * @returns {Boolean}
     */
    CAN_VIEW_OTHERS_AVAILABILITIES(state, getters) {
        return getters.canYou('planning', 'availability_others_view')
    },

    /**
     * Returns whether the user can view other users availabilities.
     * @returns {Boolean}
     */
    HAS_AVAILABILITY_MODULE(state, getters) {
        return getters.canYou('planning', 'availability').modules.availability
    },

    /**
     * Returns whether the user can add availability for him\her self or for others
     * @returns {Boolean}
     */
    canAddAvailability(state, getters, rootState) {
        return (rootState.availabilityEmployeeId && rootState.availabilityEmployeeId !== state.user.accountId) ? getters.canYou('planning', 'availability_others_edit') : true
    },

    /**
     * Returns whether the user can request substitutes
     * @returns {Boolean}
     */
    canFindSubstitutes(state, getters, rootState) {
        return getters.canYou('planning', 'find_substitutes')
    },

    canManageSubstituteRequests(state, getters) {
        return getters.canYou('planning', 'substitute_request_manage')
    },

    CAN_READ_SUBSTITUTE_REQUESTS(state, getters) {
        return getters.canYou('planning', 'substitute_request_read')
    },

    CAN_MANAGE_SUBSTITUTE_REQUESTS(state, getters) {
        return getters.canYou('planning', 'process_substitute_request_manage')
    },

    /**
     * Returns whether the user can request time off
     * @returns {Boolean}
     */
    canRequestTimeOff(state, getters, rootState) {
        const rdoAccess = getters.canYou('planning', 'request_access') === 'no_hours' // this is used to not make the RDO API call if user does not have access to RDP Page
        const rdoAccessWithHours = getters.canYou('planning', 'request_access') === 'with_hours' && rootState.contracts.contract.contract_hours > 0
        return rdoAccess || rdoAccessWithHours
    },

    /**
     * Returns whether the user can access RDO page
     * @returns {Boolean}
     */
    hasTimeOffAccess(state, getters, rootState) {
        return getters.canYou('planning', 'rdo_page_access')
    },

    /**
     * Returns the minimum date the user can request a day off.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    minRdoDate(state, getters) {
        return getters.canYou('planning', 'new_rdo_min_date')
    },

    /**
     * Returns whether the user is an employee or not
     * @returns {Boolean}
     */
    isUserEmployee(state, getters, rootState) {
        return getters.canYou('user', 'employee') &&
            !getters.canYou('user', 'admin_rights') &&
            !getters.canYou('user', 'assistant_manager') &&
            !getters.canYou('user', 'department_manager') &&
            !getters.canYou('user', 'organization') &&
            !getters.canYou('user', 'store_manager')
    },

    /**
     * Returns true if the user has organisational or admin rights
     * @param state
     * @param getters
     * @param rootState
     * @returns {*}
     */
    isOrganisationalUser(state, getters, rootState) {
        return getters.canYou('user', 'organization') || getters.canYou('user', 'admin_rights')
    },

    isUserAdmin(state, getters, rootState) {
        return getters.canYou('user', 'admin_rights')
    },

    /**
     * Returns true if current user can manage organisational accounts.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    canManageOrgUser(state, getters) {
        return getters.canYou('user', 'org_user_manage')
    },

    /**
     * Returns true if current user can manage super admin accounts.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    canManageSAUser(state, getters) {
        return getters.canYou('user', 'sa_user_manage')
    },

    /**
     * Returns true if current user can manage contexts.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    canManageContexts(state, getters) {
        return getters.canYou('organisation', 'context_manage')
    },

    /**
     * Returns whether the user can view own assessments
     * @returns {Boolean}
     */
    canViewAssessments(state, getters, rootState) {
        return getters.canYou('user', 'assessment') &&
            getters.canYou('user', 'own_assessment') &&
            getters.canYou('user', 'assessment_page') &&
            getters.canYou('user', 'assessments_yours_view')
    },

    /**
     * Returns whether the user can view own basic contract information
     * @returns {Boolean}
     */
    canViewBasicContractInfo(state, getters, rootState) {
        return getters.canYou('legal', 'contract_information_basic_view')
    },

    /**
     * Returns true if current user has access to contract information for other employees.
     *
     * @returns {Boolean}
     */
    canViewOthersContractData(state, getters, rootState) {
        return getters.canYou('legal', 'contract_information_basic_view') && getters.canYou('legal', 'contract_information_others_view')
    },

    canViewContactInformation(state, getters, rootState) {
        return getters.canYou('legal', 'contact_information_read')
    },

    canViewPersonalInformation(state, getters, rootState) {
        return getters.canYou('user', 'personal_information_read')
    },

    hasAvailabilityModule(state, getters, rootState) {
        const hasPermissions = getters.canYou('planning', 'availability')
        return hasPermissions ? hasPermissions.modules.availability : false
    },

    hasNewsModule(state, getters) {
        return getters.canYou('communication', 'news').modules.news
    },

    hasOrgNewsAccess(state, getters) {
        return getters.canYou('communication', 'store_group_news')
    },

    hasPublicNewsAccess(state, getters) {
        return getters.canYou('communication', 'public_news')
    },

    hasBalances(state, getters) {
        return getters.canYou('finance', 'balances').modules.balances
    },

    hasBalancesHistory(state, getters) {
        return getters.canYou('finance', 'balances_history_for_employees')
    },

    canPrintDepartmentSchedules(state, getters) {
        const printDepartment = getters.canYou('planning', 'employee_print_department_schedule')
        const departmentExcel = getters.canYou('planning', 'department_excel_schedule')
        return printDepartment && departmentExcel
    },

    canViewZendeskWidget(state, getters) {
        return getters.canYou('system', 'enable_support_button') && getters.canYou('thirdparties', 'show_help_button')
    },

    canUseTimePicker(state, getters) {
        return getters.canYou('planning', 'availability').modules.use_time_picker
    },

    showOnlyWorkHoursWeekschedule(state, getters) {
        return getters.canYou('planning', 'show_only_work_hours_in_weekschedule')
    },

    /**
     * Returns true if current user has "news_others" user right, which gives him/her the access to "other" actions for
     * news like sending newsletter or fetching news track information.
     *
     * @param state
     * @param getters
     * @returns {*}
     */
    hasNewsLetterAccess(state, getters) {
        return getters.canYou('communication', 'news_others')
    },

    /**
     * Returns whether the user is able to edit department mapping settings on store level
     * @returns {Boolean}
     */
    DEPARTMENT_MAPPING_SETTINGS(state, getters) {
        return getters.canYou('organisation', 'department_mapping_settings')
    },
    /**
     * Returns whether the user is able to edit department mapping settings on store level
     * @returns {Boolean}
     */
    DEPARTMENTS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'departments_manage')
    },
    /**
     * Returns whether the user is able to edit store group configuration and assign stores to store group
     * @returns {Boolean}
     */
    STORE_GROUPS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'store_groups_manage')
    },
    /**
     * Returns whether the user is able to assign users to store groups
     * @returns {Boolean}
     */
    ORG_USER_MANAGE(state, getters) {
        return getters.canYou('user', 'org_user_manage')
    },
    /**
     * Returns whether the user is able change type and description in cao rules
     * @returns {Boolean}
     */
    EDIT_CAO_ENV_CONFIG(state, getters) {
        return getters.canYou('organisation', 'edit_cao_env_config')
    },

    STORE_CAO_EDIT(state, getters) {
        return getters.canYou('legal', 'edit_cao_settings')
    },

    ORG_CAO_EDIT(state, getters) {
        return getters.canYou('legal', 'organisation_cao_edit')
    },

    RECALCULATE(state, getters) {
        return getters.canYou('system', 'recalculate_hours')
    },

    /**
     * Returns whether the user is able to edit (public) holidays
     * @returns {Boolean}
     */
    HOLIDAYS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'holidays_manage')
    },

    SCHOOL_HOLIDAYS_READ(state, getters) {
        return getters.canYou('organisation', 'schoolholidays_read')
    },
    SCHOOL_HOLIDAYS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'schoolholidays_manage')
    },

    SCHOOL_HOLIDAY_REGIONS_READ(state, getters) {
        return getters.canYou('organisation', 'schoolholidayregions_read')
    },
    SCHOOL_HOLIDAY_REGIONS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'schoolholidayregions_manage')
    },

    SUBDEPARTMENTGROUPS_READ(state, getters) {
        return getters.canYou('organisation', 'subdepartmentgroups_read')
    },
    SUBDEPARTMENTGROUPS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'subdepartmentgroups_manage')
    },

    SUBDEPARTMENTS_READ(state, getters) {
        return getters.canYou('organisation', 'subdepartments_read')
    },
    SUBDEPARTMENTS_MANAGE(state, getters) {
        return getters.canYou('organisation', 'subdepartments_manage')
    },

    CAN_EXCHANGE_TO_OTHER_STORES(state, getters) {
        return getters.canYou('organisation', 'can_exchange_to_other_stores') && getters.canYou('planning', 'exchange_employees')
    },
    CAN_ADD_INDIRECT_TASKS(state, getters) {
        return getters.CAN_MANAGE_INDIRECT_HOURS
    },
    CAN_READ_INDIRECT_HOURS_OR_TASKS(state, getters) {
        return getters.HAS_INDIRECT_TASKS_MODULE && getters.CAN_READ_INDIRECT_HOURS && getters.CAN_READ_INDIRECT_TASKS
    },
    CAN_READ_INDIRECT_HOURS(state, getters) {
        return getters.canYou('planning', 'indirect_hours_read') || getters.CAN_READ_OWN_INDIRECT_HOURS
    },
    CAN_READ_OWN_INDIRECT_HOURS(state, getters) {
        return getters.canYou('planning', 'own_indirect_hours_read')
    },
    CAN_READ_INDIRECT_TASKS(state, getters) {
        return getters.HAS_INDIRECT_TASKS_MODULE && getters.canYou('planning', 'indirect_tasks_read')
    },
    CAN_MANAGE_INDIRECT_HOURS(state, getters) {
        return getters.HAS_INDIRECT_TASKS_MODULE && getters.canYou('planning', 'indirect_hours_manage')
    },
    HAS_INDIRECT_TASKS_MODULE(state, getters) {
        return getters.canYou('planning', 'indirect_tasks')
    },

    HOLIDAY_RULES_READ(state, getters) {
        return getters.canYou('organisation', 'holidayrules_read')
    },

    HOLIDAY_RULES_MANAGE(state, getters) {
        return getters.canYou('organisation', 'holidayrules_manage')
    },

    CAN_EDIT_NON_PRODUCTIVE(state, getters) {
        /**
         * for now "edit_non_productive_cb" has been deprecated:
         * See documentation.
         * https://rwretailsolutions.sharepoint.com/:w:/r/sites/RetailSolutionstotaal/_layouts/15/Doc.aspx?action=edit&sourcedoc=%7B4114c728-fdab-4265-a462-2dfea1918d38%7D&cid=12cc1925-e1c5-4454-8e47-f3e01c4c95aa
         * Replacing with planning_others for now, as specified.
         */
        return getters.canYou('planning', 'planning_others')
    },

    /**
     * Returns whether the user is able to access the standard times page
     * @returns {Boolean}
     */
    STANDARDTIMES_ACCESS(state, getters) {
        return getters.canYou('organisation', 'standardtimes_access')
    },

    /**
     * Returns whether the user is able to manage standard times
     * @returns {Boolean}
     */
    STANDARDTIMES_MANAGE(state, getters) {
        return getters.canYou('organisation', 'standardtimes_manage')
    },

    CAN_MANAGE_REMARKS(state, getters) {
        return getters.canYou('organisation', 'remarks_manage')
    },

    CAN_READ_REMARKS(state, getters) {
        return getters.canYou('organisation', 'remarks_read')
    },

    CAN_VIEW_REMARKS(state, getters) {
        return getters.canYou('organisation', 'remarks_read')
    },

    CAN_EDIT_PAST_PRESENT_BREAKS(state, getters) {
        return getters.canYou('planning', 'edit_past_and_present_breaks')
    },

    CAN_EDIT_FUTURE_BREAKS(state, getters) {
        return getters.canYou('planning', 'edit_future_breaks')
    },

    CAN_EDIT_SHIFT_BREAKS(state, getters) {
        const pastPresent = getters.CAN_EDIT_PAST_PRESENT_BREAKS
        const future = getters.CAN_EDIT_FUTURE_BREAKS
        return {
            current: {
                none: pastPresent === 'no',
                only_increase: pastPresent === 'up',
                all: pastPresent === 'both',
            },
            future: {
                none: future === 'no',
                only_increase: future === 'up',
                all: future === 'both',
            },
        }
    },

    RESET_ACCOUNT(state, getters) {
        return getters.canYou('organisation', 'account_reset_account')
    },

    ACTIVATE_ACCOUNT(state, getters) {
        return getters.canYou('organisation', 'account_activate_account')
    },

    SMS_MESSAGES_READ(state, getters) {
        return getters.canYou('communication', 'sms_messages_read')
    },

    SMS_MESSAGES_MANAGE(state, getters) {
        return getters.canYou('communication', 'sms_messages_manage')
    },

    TIME_REGISTRATION_READ(state, getters) {
        return getters.canYou('finance', 'timeregistration_read')
    },

    TIME_REGISTRATION_MANAGE(state, getters) {
        return getters.canYou('finance', 'timeregistration_manage')
    },

    TIMER_READ(state, getters) {
        return getters.canYou('organisation', 'timer_read')
    },

    TIMER_WRITE(state, getters) {
        return getters.canYou('organisation', 'timer_write')
    },

    HAS_LABOR_COST_ACCESS(state, getters) {
        return getters.canYou('organisation', 'user_labor_access')
    },

    WAGE_PER_HOUR_READ(state, getters) {
        return getters.canYou('planning', 'wage_per_hour_read')
    },

    RDO_OTHERS_READ(state, getters) {
        return getters.canYou('planning', 'rdo_others_view')
    },

    RDO_OTHERS_MANAGE(state, getters) {
        return getters.canYou('planning', 'rdo_others_edit') && getters.canYou('planning', 'rdo_page_access')
    },

    RDO_IMPORT(state, getters) {
        return getters.canYou('planning', 'import_rdo_from_file')
    },

    CAN_READ_RDO(state, getters) {
        return getters.canYou('planning', 'requests_day_off_read')
    },

    CAN_OVERRULE_FINALIZE_WARNINGS(state, getters) {
        return getters.canYou('finance', 'overrule_warning_at_finalize_week')
    },

    HAS_PLANNING_PAGE_ACCESS(state, getters) {
        return getters.canYou('planning', 'planning_page_access') && getters.canYou('planning', 'planning_page_new')
    },
    HAS_STANDARD_SHIFTS_PAGE_ACCESS(state, getters) {
        return getters.canYou('planning', 'standard_shifts_page_new')
    },
    CAN_FINALIZE_SCHEDULE(state, getters) {
        return getters.canYou('planning', 'finalize_schedule')
    },
    CAN_CLOSE_DEPARTMENT(state, getters) {
        return getters.canYou('planning', 'close_department')
    },

    CAN_READ_TIME_DISTRIBUTION(state, getters) {
        return getters.canYou('finance', 'time_distribution_read')
    },

    CAN_ACCESS_STEER_INFORMATION(state, getters) {
        return getters.canYou('finance', 'steerinformation_access')
    },
    CAN_READ_STEER_INFORMATION(state, getters) {
        return getters.canYou('finance', 'steerinformation_read')
    },
    CAN_READ_STEER_INFORMATION_DASHBOARD(state, getters) {
        return getters.canYou('finance', 'steerinformation_dashboard_read')
    },

    CAN_READ_WEEK_DETAILS(state, getters) {
        return getters.canYou('planning', 'week_details_read')
    },

    CAN_READ_COSTS(state, getters) {
        return getters.canYou('planning', 'show_costs_in_CB')
    },

    CAN_READ_DEPARTMENT_STATUS(state, getters) {
        return getters.canYou('planning', 'department_status_read')
    },

    CAN_READ_PERIODS(state, getters) {
        return getters.canYou('organisation', 'period_read')
    },

    CAN_READ_WAB(state, getters) {
        return getters.canYou('planning', 'wab_read')
    },

    CAN_READ_CLA(state, getters) {
        return getters.canYou('organisation', 'cla_settings_read')
    },

    CAN_READ_CLA_VALIDATIONS(state, getters) {
        return getters.canYou('organisation', 'cla_validations_read')
    },

    CAN_READ_CAO_RULES(state, getters) {
        return getters.canYou('planning', 'cao_rules_read')
    },

    CAN_EDIT_CAO_RULES(state, getters) {
        return getters.canYou('planning', 'cao_rules_manage')
    },

    CAN_READ_BOOKABLE_HOUR_TYPES(state, getters) {
        return getters.canYou('planning', 'bookable_hour_types_read')
    },

    CAN_MANAGE_STANDARD_SCHEDULES(state, getters) {
        return getters.canYou('planning', 'edit_standard_schedule')
    },

    CAN_READ_STANDARD_REMARKS(state, getters) {
        return getters.canYou('planning', 'standard_remarks_read')
    },

    CAN_MANAGE_STANDARD_REMARKS(state, getters) {
        return getters.canYou('planning', 'standard_remarks_manage')
    },

    CAN_READ_PLANNABLE_EMPLOYEES(state, getters) {
        return getters.canYou('organisation', 'plannable_employees_read')
    },

    /**
     * "Fake" permission that does not yet exist in the permissions call.
     * This can be added at a later stage in the permissions call,
     * to enable adding non-productive shifts with start/end times
     * in the front end, without having to modify the front end.
     * @returns Boolean
     */
    CAN_ADD_NON_PRODUCTIVES_WITH_TIMES(state, getters) {
        // inexiting permission for now. Feature also un-availble
        // return getters.canYou('planning', 'can_add_non_productives_with_times') || false
        return false
    },

    /**
     * "Fake" permission that does not yet exist in the permissions call.
     * This can be added at a later stage in the permissions call,
     * to enable overnight shifts in the front end,
     * without having to modify the front end.
     * @returns Boolean
     */
    CAN_ADD_OVERNIGHT_SHIFTS(state, getters) {
        return getters.canYou('planning', 'can_add_overnight_shifts') || false
    },

    /**
     * "Fake" permission that does not yet exist in the permissions call.
     * This can be added at a later stage in the permissions call,
     * to enable overnight shifts in the front end,
     * without having to modify the front end.
     * @returns Boolean
     */
    ALLOW_SCHEDULING_AFTER_CONTRACT_ENDING(state, getters) {
        return getters.canYou('planning', 'allow_scheduling_after_contract_end_date') || false
    },

    CONTRACT_ENDING_SIGNAL_PERIOD(state, getters) {
        return getters.canYou('planning', 'period_weeks_signal_contract_ending') || null
    },

    CAN_EDIT_EXTERNAL_TURNOVER(state, getters) {
        return getters.canYou('finance', 'edit_external_department_turnover')
    },
    CAN_PROCESS_TURNOVER_API_DATA(state, getters) {
        return getters.canYou('finance', 'process_turnover_api_data')
    },
    CAN_EDIT_TURNOVERS(state, getters) {
        return getters.canYou('planning', 'edit_turnovers')
    },

    IS_SUPER_ADMIN(state, getters) {
        return getters.canYou('employee', 'role').name === 'super_admin'
    },

    PLANNING_BASED_ON_WLP(state, getters) {
        return getters.canYou('thirdparties', 'planning_based_on_wlp')
    },

    HAS_MODULE_CHECK_HOURS(state, getters) {
        return getters.canYou('planning', 'check_hours_page_new')
    },

    CAN_ACCESS_CHECK_HOURS_PAGE(state, getters) {
        return getters.canYou('planning', 'check_hours_page_access')
    },

    CAN_REOPEN_WEEK(state, getters) {
        return getters.canYou('finance', 'reopen_weeks')
    },

    HAS_STORE_VALUES(state, getters) {
        return getters.canYou('planning', 'store_values')
    },

    /** CHECK HOURS / TOTAL OVERVIEW */

    CAN_CLOSE_WEEK(state, getters) {
        return getters.canYou('finance', 'close_week')
    },

    CAN_CLOSE_WEEK_WITH_VIOLATIONS(state, getters) {
        return getters.canYou('finance', 'close_week_with_violations')
    },

    CAN_EDIT_SURCHARGE_VALUE(state, getters) {
        return getters.canYou('finance', 'edit_surcharge_value')
    },

    CAN_MANAGE_SURCHARGES(state, getters) {
        return getters.canYou('finance', 'shift_surcharges_manage')
    },

    CAN_READ_SURCHARGES(state, getters) {
        return getters.canYou('finance', 'shift_surcharges_read')
    },

    CAN_VIEW_KPU(state, getters) {
        return getters.canYou('finance', 'show_kpu_total_overview')
    },

    CAN_VIEW_RELEASED_WEEKS(state, getters) {
        return getters.canYou('finance', 'view_released_weeks')
    },

    CAN_CHANGE_SURCHARGE_TYPE(state, getters) {
        return getters.canYou('planning', 'change_surcharge_type')
    },

    ALLOW_CO_SPLIT(state, getters) {
        return getters.canYou('planning', 'allow_co_split')
    },

    /** BALANCES */

    BALANCES_EXPIRATION(state, getters) {
        return getters.canYou('finance', 'balances_expiration')
    },

    SHOW_INDICATIVE_BALANCES(state, getters) {
        return getters.canYou('planning', 'show_indicative_balances_on_page_verlof_aanvragen')
    },

    SHOW_INDICATIVE_TVT_BALANCES(state, getters) {
        return getters.canYou('planning', 'show_indicative_tvt_balances_on_page_verlof_aanvragen')
    },

    CAN_READ_COMPETENCES(state, getters) {
        return getters.canYou('organisation', 'competences_read')
    },

    CAN_ADD_INDIRECT_HOURS_ON_EXCHANGE_SHIFT() {
        // The functionality to add indirect hours on an exchange shift
        // or to exchange a shift with indirect hours is disabled for now,
        // until PMT1 supports it. Setting this to true will enable the
        // functionality. We should use a backend permission for this
        return false
    },

    MANAGE_OPEN_DEPARTMENTS_CHECK_HOURS(state, getters) {
        return getters.canYou('finance', 'manage_open_departments_in_to')
    },
}
