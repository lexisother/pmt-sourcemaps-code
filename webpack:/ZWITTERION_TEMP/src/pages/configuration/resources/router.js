import ContextRoutesManagementPage from '@/pages/configuration/context-routes/ContextRoutesManagementPage.vue'
import ContextRoutesEditCreateContext from '@/pages/configuration/context-routes/ContextRoutesEditCreateContext.vue'
import CaoRulesOverview from '@/pages/configuration/cao/CaoRulesOverview.vue'

import AccountsManagementPage from '@/pages/configuration/organisational-accounts/AccountsManagementPage'

import DepartmentsOverview from '@/pages/configuration/departments/DepartmentsOverview'
import DepartmentMappingOverview from '@/pages/configuration/departments/DepartmentMappingOverview'
import SubDepartmentsOverview from '@/pages/configuration/departments/SubDepartmentsOverview'

import StoreGroupsOverview from '@/pages/configuration/store-groups/StoreGroupsOverview'
import StoreGroupSettings from '@/pages/configuration/store-groups/StoreGroupSettings'
import PublicHolidaysOverview from '@/pages/configuration/holidays/PublicHolidaysOverview'
import HolidayRulesOverview from '@/pages/configuration/holidays/HolidayRulesOverview'
import SchoolHolidaysOverview from '@/pages/configuration/holidays/SchoolHolidaysOverview'

import StandardTimesOverview from '@/pages/configuration/standard-times/StandardTimesOverview'

import routerHelper from '@/config/router-helper'

export default [
    {
        name: 'context-routes-management',
        path: '/configuration/context-routes-management',
        meta: {
            settingsRoute: 'context-routes-management',
        },
        component: ContextRoutesManagementPage,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'add-app-context',
        path: '/configuration/context-routes-management/create',
        component: ContextRoutesEditCreateContext,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'organization-cao',
        path: '/configuration/organization-cao',
        component: CaoRulesOverview,
        beforeEnter: routerHelper.authRoute,
        props: { isEnvironmentCao: true },
    },
    {
        name: 'store-cao',
        path: '/configuration/store-cao',
        component: CaoRulesOverview,
        beforeEnter: routerHelper.authRoute,
        props: { isEnvironmentCao: false },
    },
    {
        name: 'accounts-management',
        path: '/configuration/accounts-management',
        component: AccountsManagementPage,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'accounts-management',
        },
    },
    {
        name: 'departments',
        path: '/configuration/departments',
        component: DepartmentsOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'department-mapping',
        path: '/configuration/department-mapping',
        component: DepartmentMappingOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'sub-departments',
        path: '/configuration/subdepartments',
        component: SubDepartmentsOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'store-groups',
        path: '/configuration/store-groups',
        component: StoreGroupsOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'store-group-settings',
        path: '/configuration/store-group-settings/:id',
        component: StoreGroupSettings,
        beforeEnter: routerHelper.authRoute,
        params: {
            id: null,
        },
    },
    {
        name: 'public-holidays',
        path: '/configuration/public-holidays',
        component: PublicHolidaysOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'holiday-rules',
        path: '/configuration/holiday-rules',
        component: HolidayRulesOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'school-holidays',
        path: '/configuration/school-holidays',
        component: SchoolHolidaysOverview,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'standard-times',
        path: '/configuration/standard-times',
        component: StandardTimesOverview,
        beforeEnter: routerHelper.authRoute,
    },
]
