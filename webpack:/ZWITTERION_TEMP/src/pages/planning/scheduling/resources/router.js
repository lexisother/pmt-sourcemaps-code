import Vue from 'vue'
import routerHelper from '@/config/router-helper'
import PlanningLayout from '@/pages/planning/scheduling/PlanningLayout'
import PlanningGridView from '@/pages/planning/scheduling/views/PlanningGridView'
import MobilePlanning from '@/pages/planning/scheduling/views/MobilePlanning'
import * as moment from '@/config/moment'
Vue.use(moment)
export default [
    {
        name: 'create-planning',
        path: '/planning/create',
        beforeEnter: routerHelper.authRoute,
        component: PlanningLayout,
        redirect: to => {
            return {
                name: 'week-planning',
                params: Vue.moment().weekYearObject(true),
                meta: {
                    mode: 'week',
                    settingsRoute: 'create-planning',
                    subTitleType: 'week',
                },
            }
        },
        children: [
            {
                name: 'mobile-planning',
                path: '/planning/create/mobile/:year/:week',
                component: MobilePlanning,
                beforeEnter: routerHelper.authRoute,
                params: Vue.moment().weekYearObject(),
                meta: {
                    mode: 'week',
                    settingsRoute: 'create-planning',
                    standard_shifts_account_id: null,
                    subTitleType: 'week',
                },
            },
            {
                name: 'day-planning',
                path: '/planning/create/:year/:week/:day',
                component: PlanningGridView,
                beforeEnter: routerHelper.authRoute,
                params: Vue.moment().dayWeekYearObject(true),
                meta: {
                    mode: 'week',
                    settingsRoute: 'create-planning',
                    subTitleType: 'day',
                },
            },
            {
                name: 'week-planning',
                path: '/planning/create/:year/:week',
                component: PlanningGridView,
                beforeEnter: routerHelper.authRoute,
                params: Vue.moment().weekYearObject(),
                meta: {
                    mode: 'week',
                    settingsRoute: 'create-planning',
                    standard_shifts_account_id: null,
                    subTitleType: 'week',
                },
            },
            {
                name: 'standard-shifts',
                path: '/planning/standard-shifts',
                component: PlanningGridView,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    settingsRoute: 'standard-shifts',
                },
            },
            {
                name: 'track-schedules',
                path: '/planning/track-schedules',
                component: PlanningGridView,
                beforeEnter: routerHelper.authRoute,
                redirect: to => {
                    return {
                        name: 'week-track-schedules',
                        params: Vue.moment().dayWeekYearObject(true),
                        meta: {
                            mode: 'week',
                            settingsRoute: 'track-schedules',
                        },
                    }
                },
                children: [
                    {
                        name: 'day-track-schedules',
                        path: '/planning/track-schedules/:year/:week/:day/:departmentStatusHistoryId/:departmentId',
                        beforeEnter: routerHelper.authRoute,
                        params: Vue.moment().dayWeekYearObject(true),
                        meta: {
                            mode: 'week',
                            settingsRoute: 'track-schedules',
                        },
                    },
                    {
                        name: 'week-track-schedules',
                        path: '/planning/track-schedules/:year/:week/:departmentStatusHistoryId/:departmentId',
                        beforeEnter: routerHelper.authRoute,
                        params: Vue.moment().weekYearObject(),
                        meta: {
                            mode: 'week',
                            settingsRoute: 'track-schedules',
                        },
                    },
                ],
            },
        ],
    },
]
