import Vue from 'vue'
import routerHelper from '@/config/router-helper'
import PlanningLayout from '@/pages/planning/scheduling/PlanningLayout'
import PlanningGridView from '@/pages/planning/scheduling/views/PlanningGridView'
import * as moment from '@/config/moment'
Vue.use(moment)
export default [
    {
        name: 'check-hours-init',
        path: '/realisation/check-hours',
        component: PlanningLayout,
        beforeEnter: routerHelper.authRoute,
        redirect: to => {
            return {
                name: 'check-hours',
                params: Vue.moment().dayWeekYearObject(true),
                meta: {
                    mode: 'week',
                    settingsRoute: 'check-hours',
                },
            }
        },
        children: [
            {
                name: 'check-hours',
                path: '/realisation/check-hours/:year/:week',
                component: PlanningGridView,
                beforeEnter: routerHelper.authRoute,
                params: Vue.moment().dayWeekYearObject(true),
                meta: {
                    mode: 'week',
                    settingsRoute: 'check-hours',
                },
            },
        ],
    },
]
