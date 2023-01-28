import routerHelper from '@/config/router-helper'
import Vue from 'vue'
import * as moment from '@/config/moment'
import SteerInformationIntersectionsPage from '@/pages/planning/steerInformation/intersections/SteerInformationIntersectionsPage.vue'
import SteerInformationLayout from '@/pages/planning/steerInformation/SteerInformationLayout.vue'

Vue.use(moment)
export default [
    {
        name: 'steerinformation',
        path: '/realisation/steerinformation',
        redirect: to => {
            return {
                name: 'steerinformation-page',
                params: Vue.moment().weekYearObject(),
                meta: {
                    mode: 'week',
                    settingsRoute: 'steerinformation',
                },
            }
        },
    },
    {
        name: 'steerinformation-page',
        path: '/realisation/steerinformation/:year/:week',
        component: SteerInformationLayout,
        beforeEnter: routerHelper.authRoute,
        params: Vue.moment().weekYearObject(),
        meta: {
            mode: 'week',
            settingsRoute: 'steerinformation',
            subTitleType: 'week',
        },
    },
    {
        name: 'steerinformation-intersections-page',
        path: '/realisation/steerinformation-intersections/:year/:week',
        component: SteerInformationIntersectionsPage,
        beforeEnter: routerHelper.authRoute,
        params: Vue.moment().weekYearObject(),
        meta: {
            mode: 'week',
            settingsRoute: 'steerinformation',
        },
    },
]
