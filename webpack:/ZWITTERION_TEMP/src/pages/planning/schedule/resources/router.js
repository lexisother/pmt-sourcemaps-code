import Vue from 'vue'
import routerHelper from '@/config/router-helper'
import MyOverviewPage from '@/pages/planning/schedule/MyOverviewPage.vue'
import MySchedulePage from '@/pages/planning/schedule/MySchedulePage.vue'
import MySchedulePagePrint from '@/pages/planning/schedule/WeekSchedulePrint'
import MyDepartmentSchedulePage from '@/pages/planning/schedule/MyDepartmentSchedulePage.vue'
import moment from '@/config/moment'
Vue.use(moment)
export default [
    {
        path: '/my-overview/week-schedule',
        component: MyOverviewPage,
        beforeEnter: routerHelper.authRoute,
        children: [
            {
                name: 'my-schedule',
                path: '/my-overview/my-schedule/:week-:year',
                component: MySchedulePage,
                beforeEnter: routerHelper.authRoute,
            },
            {
                name: 'my-schedule-init',
                path: '',
                redirect: to => {
                    return {
                        name: 'my-schedule',
                        params: Vue.moment().weekYearObject(),
                    }
                },
            },
            {
                name: 'my-schedule-print',
                path: '/my-overview/print-week-schedule',
                component: MySchedulePagePrint,
                beforeEnter: routerHelper.authRoute,
            },
            {
                name: 'my-department-schedule',
                path: '/my-overview/department-schedule/:day-:month-:year',
                component: MyDepartmentSchedulePage,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    settingsRoute: 'my-department-schedule',
                    subTitleType: 'day',
                },
            },
            {
                name: 'my-department-schedule-init',
                path: '/my-overview/department-schedule',
                redirect: to => {
                    return {
                        name: 'my-department-schedule',
                        params: Vue.moment().dayMonthYearObject(),
                    }
                },
            },
        ],
    },
    {
        path: '/planning/week-schedule',
        component: MyOverviewPage,
        beforeEnter: routerHelper.authRoute,
        children: [
            {
                name: 'week-schedule',
                path: '/planning/week-schedule/:week-:year',
                component: MySchedulePage,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    manager: true,
                },
            },
            {
                name: 'week-schedule-init',
                path: '',
                redirect: to => {
                    return {
                        name: 'week-schedule',
                        params: Vue.moment().weekYearObject(),
                    }
                },
            },
            {
                name: 'week-schedule-accountid',
                path: '/planning/week-schedule/:week-:year/:account_id',
                component: MySchedulePage,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    manager: true,
                },
            },
            {
                name: 'department-schedule',
                path: '/planning/department-schedule/:day-:month-:year',
                component: MyDepartmentSchedulePage,
                beforeEnter: routerHelper.authRoute,
                params: Vue.moment().dayMonthYearObject(),
                meta: {
                    manager: true,
                    settingsRoute: 'my-department-schedule',
                    subTitleType: 'day',
                },
            },
            {
                name: 'department-schedule-init',
                path: '/planning/department-schedule',
                redirect: to => {
                    return {
                        name: 'department-schedule',
                        params: Vue.moment().dayMonthYearObject(),
                    }
                },
            },
        ],
    },
    {
        name: 'employeeweekschedulesso',
        path: '/employeeweekschedulesso',
        component: MySchedulePage,
        beforeEnter: routerHelper.authRoute,
    },
]
