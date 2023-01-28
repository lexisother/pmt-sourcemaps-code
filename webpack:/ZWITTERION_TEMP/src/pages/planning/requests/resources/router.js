import routerHelper from '@/config/router-helper'
import MyRequests from '@/pages/planning/requests/MyRequests.vue'
import { store } from '@/store'

export default [
    {
        name: 'rdosso',
        path: '/rdosso',
        query: {
            active: 'rdo_requests_tab',
        },
        component: MyRequests,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'my-requests',
        path: '/my-overview/requests',
        query: {
            active: 'substitute_requests',
        },
        component: MyRequests,
        beforeEnter: routerHelper.authRoute,
        children: [
            {
                name: 'approve-deny-substitute-request-status',
                path: '/my-overview/requests/set-status/:id/:type',
                beforeEnter (to, from, next) {
                    if (Object.keys(to.params).length > 0) {
                        store.dispatch('substituteRequests/interestedFromEmail', { ...to.params }, { root: true })
                    }
                    next({ name: 'my-requests' })
                },
            },
        ],
    },
]
