import routerHelper from '@/config/router-helper'
import Workload from '@/pages/planning/workload/views/Workload'
import moment from 'moment'

export default [
    {
        name: 'workload',
        path: '/planning/workload/:week-:year',
        component: Workload,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'workload',
            subTitleType: 'week',
        },
    },
    {
        name: 'workload-distribution',
        path: '/planning/workload/:week-:year/distribution',
        component: Workload,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'workload',
            subTitleType: 'week',
        },
    },
    {
        name: 'workload-init',
        path: '/planning/workload',
        redirect: to => {
            return {
                name: 'workload',
                params: {
                    week: moment().isoWeek().toString(),
                    year: moment().isoWeekYear().toString(),
                },
            }
        },
    },
]
