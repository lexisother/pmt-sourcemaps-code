
import Vue from 'vue'

import Timer from '@/pages/realisation/timer/Timer.vue'
import routerHelper from '@/config/router-helper'

import * as moment from '@/config/moment'
Vue.use(moment)

export default [
    {
        name: 'timer-page',
        path: '/realisation/timer',
        component: Timer,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'timer',
        },
    },
]
