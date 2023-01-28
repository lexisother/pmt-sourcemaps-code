
import Vue from 'vue'

import TimeRegistrations from '@/pages/realisation/time-registrations/TimeRegistrations.vue'
import routerHelper from '@/config/router-helper'

import * as moment from '@/config/moment'
Vue.use(moment)

export default [
    {
        name: 'time-registrations',
        path: '/realisation/time-registrations',
        component: TimeRegistrations,
        beforeEnter: routerHelper.authRoute,
        redirect: to => {
            return {
                name: 'time-registrations-page',
                params: {
                    // yesterday should be displayed on page load by default
                    date: Vue.moment().subtract(1, 'day').apiFormat(),
                },
            }
        },
    },
    {
        name: 'time-registrations-page',
        path: '/realisation/time-registrations/:date',
        component: TimeRegistrations,
        beforeEnter: routerHelper.authRoute,
        params: {
            date: Vue.moment().apiFormat(),
        },
        meta: {
            settingsRoute: 'time-registrations',
            subTitleType: 'day',
        },
    },
]
