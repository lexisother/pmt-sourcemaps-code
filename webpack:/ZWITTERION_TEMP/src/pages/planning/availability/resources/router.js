import routerHelper from '@/config/router-helper'
import Availability from '@/pages/planning/availability/Layout/AvailabilityBaseLayout.vue'
import AvailabilityOverview from '@/pages/planning/availability/Views/AvailabilityOverview'
import ViewWeekset from '@/pages/planning/availability/Views/ViewWeekset.vue'
import Vue from 'vue'
import moment from '@/config/moment'
Vue.use(moment)

export default [
    {
        name: 'availabilitysso',
        path: '/availabilitysso/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('week'),
    },
    {
        path: '/availabilitysso',
        redirect: to => {
            return {
                name: 'availabilitysso',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'availabilityWeekSso',
        path: '/availabilityWeekSso/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('week'),
    },
    {
        path: '/availabilityWeekSso',
        redirect: to => {
            return {
                name: 'availabilityWeekSso',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'availabilityMonthSso',
        path: '/availabilityMonthSso/:month-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('month'),
    },
    {
        path: '/availabilityMonthSso',
        redirect: to => {
            return {
                name: 'availabilityMonthSso',
                params: getDefaultMonthParams(),
            }
        },
    },
    {
        name: 'my-availability',
        path: '/my-overview/availability',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'my-week-availability',
        path: '/my-overview/availability/week/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('week'),
            subTitleType: 'week',
        },
        children: [
            {
                name: 'view-weekset',
                path: '/my-overview/availability/weekset/view/:id',
                component: ViewWeekset,
                beforeEnter: routerHelper.authRoute,
                meta: getMetaParams('week'),
            },
            {
                name: 'edit-weekset',
                path: '/my-overview/availability/weekset/edit/:id',
                component: ViewWeekset,
                beforeEnter: routerHelper.authRoute,
                meta: getMetaParams('week', false, 'edit-weekset'),
            },
        ],
    },
    {
        path: '/my-overview/availability/weekset/edit',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/my-overview/availability/weekset/view',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'create-weekset',
        path: '/my-overview/availability/weekset/create/:account_id',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('week'),
    },
    {
        path: '/my-overview/availability/weekset/create',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/my-overview/availability/weekset',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/my-overview/availability/week',
        redirect: to => {
            return {
                name: 'my-week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'my-month-availability',
        path: '/my-overview/availability/month/:month-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('month'),
            subTitleType: 'month',
        },
    },
    {
        path: '/my-overview/availability/month',
        redirect: to => {
            return {
                name: 'my-month-availability',
                params: getDefaultMonthParams(),
            }
        },
    },
    {
        name: 'my-weekly-availability',
        path: '/my-overview/availability/weekly/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('week'),
            subTitleType: 'week',
        },
        params: getDefaultWeekParams(),
    },
    {
        path: '/my-overview/availability/weekly',
        redirect: to => {
            return {
                name: 'my-weekly-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'availability',
        path: '/planning/availability',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
                meta: getMetaParams('week', true),
            }
        },
    },
    {
        name: 'week-availability',
        path: '/planning/availability/week/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('week', true),
            subTitleType: 'week',
        },
        children: [
            {
                name: 'manager-view-weekset',
                path: '/planning/availability/weekset/view/:id',
                component: ViewWeekset,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    ...getMetaParams('week', true),
                    subTitleType: 'week',
                },
            },
            {
                name: 'manager-edit-weekset',
                path: '/planning/availability/weekset/edit/:id',
                component: ViewWeekset,
                beforeEnter: routerHelper.authRoute,
                meta: getMetaParams('week', true, 'manager-edit-weekset'),
            },
        ],
    },
    {
        path: '/planning/availability/weekset/edit',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/planning/availability/weekset/view',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'manager-create-weekset',
        path: '/planning/availability/weekset/create/:account_id',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('week', true),
    },
    {
        path: '/planning/availability/weekset/create',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/planning/availability/weekset',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        path: '/planning/availability/week',
        redirect: to => {
            return {
                name: 'week-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'availability-overview-init',
        path: '/planning/availability/overview',
        redirect: to => {
            return {
                name: 'availability-overview',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'availability-overview',
        path: '/planning/availability/overview/:week-:year',
        component: AvailabilityOverview,
        beforeEnter: routerHelper.authRoute,
        params: getDefaultWeekParams(),
        meta: {
            mode: 'week',
            manager: true,
            settingsRoute: 'availability-overview',
            subTitleType: 'week',
        },
    },
    {
        name: 'month-availability',
        path: '/planning/availability/month/:month-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('month', true),
            subTitleType: 'month',
        },
    },
    {
        path: '/planning/availability/month',
        redirect: to => {
            return {
                name: 'month-availability',
                params: getDefaultMonthParams(),
            }
        },
    },
    {
        name: 'weekly-availability',
        path: '/planning/availability/weekly/:week-:year',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: {
            ...getMetaParams('week', true),
            subTitleType: 'week',
        },
        params: getDefaultWeekParams(),
    },
    {
        path: '/planning/availability/weekly',
        redirect: to => {
            return {
                name: 'weekly-availability',
                params: getDefaultWeekParams(),
            }
        },
    },
    {
        name: 'week-availability-accountid',
        path: '/planning/availability/week/:week-:year/:account_id',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('week', true),
    },
    {
        name: 'month-availability-accountid',
        path: '/planning/availability/month/:month-:year/:account_id',
        component: Availability,
        beforeEnter: routerHelper.authRoute,
        meta: getMetaParams('month', true),
    },
]

/**
 * Returns default week parameters for availability routes.
 *
 * @returns {{week: number, year: number}}
 */
function getDefaultWeekParams () {
    return {
        week: Vue.moment().isoWeek(),
        year: Vue.moment().isoWeekYear(),
    }
}

/**
 * Returns default month parameters for availability routes.
 *
 * @returns {{week: number, year: number}}
 */
function getDefaultMonthParams () {
    return {
        month: (Vue.moment().month() + 1),
        year: Vue.moment().year(),
    }
}

/**
 * Returns meta parametesr
 *
 * @param { string }  mode    Can be month/week
 * @param { boolean } manager
 * @param { string }  name
 */
function getMetaParams (mode, manager, name) {
    const meta = {
        mode: mode,
    }
    if (manager) {
        meta.manager = true
    }
    if (name) {
        meta.name = name
    }

    return meta
}
