import apiErrors from './api-errors'
import generalMessages from './general-messages'
import dates from './dates'
import pageTitles from './page-titles'
import headerMenu from './header-menu'

import dashboardPage from './pages/dashboard'
import loginPage from './pages/loginPage'
import mainPage from './pages/mainPage'
import mySchedulePage from './pages/mySchedulePage'
import myDepartmentSchedulePage from './pages/myDepartmentSchedulePage'
import myAccountInformationPage from './pages/myAccountInformationPage'
import myContractInformationPage from './pages/myContractInformationPage'
import myAssessmentsPage from './pages/myAssessmentsPage'
import employeeAssessmentsPage from './pages/employeeAssessments'
import myWeeklyAvailabilityPage from './pages/myWeeklyAvailabilityPage'
import baseAvailabilityPage from './pages/baseAvailabilityPage'
import rdoOverviewPage from './pages/rdoOverviewPage'
import baseMyAccountPage from './pages/baseMyAccountPage'
import unsupportedBrowserPage from './pages/unsupportedBrowserPage'
import birthdayPage from './pages/birthdayPage'
import newsOverview from './pages/newsOverview'
import newsTrack from './pages/newsTrack'
import smsPage from './pages/communication/smsPage'
import sendNewsletter from './pages/sendNewsletter'
import requestsPage from './pages/requestsPage'
import availabilityOverviewPage from './pages/availabilityOverviewPage'
import workloadPage from './pages/workload'
import schedulingPage from './pages/scheduling'
import checkHours from './pages/checkHours'
import privacyStatement from './pages/privacyStatement'
import steerInformationPage from './pages/steerInformationPage'
import leaveAndAbsencePage from './pages/planning/leaveAndAbsencePage'
import timerPage from './pages/realisation/timerPage'
import timeRegistrationsPage from './pages/realisation/timeRegistrationsPage'

import loginForm from './forms/loginForm'
import forgotPasswordForm from './forms/forgotPasswordForm'
import forgotUsernameForm from './forms/forgotUsernameForm'
import rdoRequestForm from './forms/rdoRequestForm'
import editAccountForm from './forms/editAccountForm'
import availabilityEntryForm from './forms/availabilityEntryForm'
import pmtRepoLinkForm from './forms/pmtRepoLinkForm'
import availabilityWeeklyEntryForm from './forms/availabilityWeeklyEntryForm'
import selectStoreForm from './forms/selectStoreForm'

import whatsNewModal from './modals/whatsNewModal'
import forgotUsernameModal from './modals/forgotUsernameModal'
import forgotPasswordModal from './modals/forgotPasswordModal'
import rdoRequestModal from './modals/rdoRequestModal'
import substituteRequestModal from './modals/substituteRequestModal'
import leaveBalanceModal from './modals/leaveBalanceModal'
import pmtAboutModal from './modals/pmtAboutModal'
import birthdayOverview from './modals/birthdayOverview'

import availabilityInfoSidePanel from './side-panels/availabilityInfoSidePanel'
import availabilityWeeklyOverviewSidePanel from './side-panels/availabilityWeeklyOverviewSidePanel'
import availabilityWeeklyDetailsSidePanel from './side-panels/availabilityWeeklyDetailsSidePanel'
import workload from './side-panels/workload'

import availabilityTopBar from './top-bars/availabilityTopBar'

import textInput from './components/textInput'
import timeRangeInput from './components/timeRangeInput'
import timeInput from './components/timeInput'
import timeBlock from './components/timeBlock'
import modal from './components/modal'
import datepicker from './components/datepicker'
import monthpicker from './components/monthpicker'
import contextMenu from './components/contextMenu'
import spinner from './components/spinner'

import shift from './entities/shift'
import rdo from './entities/rdo'
import dateTime from './entities/dateTime'
import user from './entities/user'
import weekset from './entities/weekset'
import requests from './entities/requests'
import emptyState from './ui/empty-state'
import singles from './ui/singles'
import filtersFlyOut from './ui/filtersFlyOut'

/** CONFIGURATION PAGES */
import contextRoutes from '../../language/en/pages/configuration/contextRoutes'
import cao from '../../language/en/pages/configuration/cao'
import manageAccounts from '../../language/en/pages/configuration/manageAccounts'
import departments from '../../language/en/pages/configuration/departments'
import departmentMapping from '../../language/en/pages/configuration/departmentMapping'
import subDepartments from '../../language/en/pages/configuration/subDepartments'
import storeGroups from '../../language/en/pages/configuration/storeGroups'
import publicHolidays from '../../language/en/pages/configuration/publicHolidays'
import holidayRules from '../../language/en/pages/configuration/holidayRules'
import schoolHolidays from '../../language/en/pages/configuration/schoolHolidays'
import standardTimes from '../../language/en/pages/configuration/standardTimes'

import barButton from './top-bars/barButton'

import common from './entities/common'

const messages = {
    apiErrors,
    generalMessages,
    dates,
    pageTitles,
    headerMenu,
    pages: {
        dashboard: dashboardPage,
        login: loginPage,
        mySchedule: mySchedulePage,
        myDepartmentSchedule: myDepartmentSchedulePage,
        baseMyAccount: baseMyAccountPage,
        myAccountInformation: myAccountInformationPage,
        myContractInformation: myContractInformationPage,
        myAssessments: myAssessmentsPage,
        employeeAssessments: employeeAssessmentsPage,
        myWeeklyAvailability: myWeeklyAvailabilityPage,
        baseAvailability: baseAvailabilityPage,
        availabilityOverview: availabilityOverviewPage,
        rdoOverview: rdoOverviewPage,
        main: mainPage,
        unsupported: unsupportedBrowserPage,
        newsOverview: newsOverview,
        newsTrack: newsTrack,
        birthdayPage: birthdayPage,
        smsPage: smsPage,
        steerInformationPage: steerInformationPage,
        sendNewsletter: sendNewsletter,
        requests: requestsPage,
        workload: workloadPage,
        scheduling: schedulingPage,
        checkHours: checkHours,
        privacyStatement: privacyStatement,
        leaveAndAbsencePage: leaveAndAbsencePage,
        timerPage: timerPage,
        timeRegistrationsPage: timeRegistrationsPage,

        /** CONFIGURATION */
        contextRoutes: contextRoutes,
        cao: cao,
        manageAccounts: manageAccounts,
        departments: departments,
        departmentMapping: departmentMapping,
        subDepartments: subDepartments,
        storeGroups: storeGroups,
        publicHolidays: publicHolidays,
        holidayRules: holidayRules,
        schoolHolidays: schoolHolidays,
        standardTimes: standardTimes,
    },
    forms: {
        login: loginForm,
        forgotPassword: forgotPasswordForm,
        forgotUsername: forgotUsernameForm,
        rdoRequest: rdoRequestForm,
        editAccount: editAccountForm,
        pmtRepoLink: pmtRepoLinkForm,
        availabilityEntry: availabilityEntryForm,
        availabilityWeeklyEntry: availabilityWeeklyEntryForm,
        selectStoreForm: selectStoreForm,
    },
    modals: {
        whatsNew: whatsNewModal,
        forgotUsername: forgotUsernameModal,
        forgotPassword: forgotPasswordModal,
        rdoRequest: rdoRequestModal,
        substituteRequest: substituteRequestModal,
        leaveBalance: leaveBalanceModal,
        pmtAbout: pmtAboutModal,
        birthdayOverview: birthdayOverview,
    },
    sidePanels: {
        availabilityInfo: availabilityInfoSidePanel,
        availabilityWeeklyOverview: availabilityWeeklyOverviewSidePanel,
        availabilityWeeklyDetails: availabilityWeeklyDetailsSidePanel,
        workload: workload,
    },
    topBars: {
        availability: availabilityTopBar,
    },
    components: {
        textInput,
        timeRangeInput,
        timeInput,
        timeBlock,
        modal,
        datepicker,
        monthpicker,
        contextMenu,
        spinner,
    },
    entities: {
        shift,
        rdo,
        dateTime,
        user,
        weekset,
        requests,
        common,
    },
    ui: {
        emptyState,
        singles,
        barButton,
        filtersFlyOut,
    },
}

export default messages
