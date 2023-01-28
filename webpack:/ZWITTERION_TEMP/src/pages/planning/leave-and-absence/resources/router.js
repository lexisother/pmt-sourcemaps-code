import routerHelper from '@/config/router-helper'
import RdoOverview from '@/pages/planning/leave-and-absence/RdoOverview'

export default [
    {
        name: 'leave-and-absence-page',
        path: '/planning/leave-and-absence',
        component: RdoOverview,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'leave-and-absence',
        },
    },
]
