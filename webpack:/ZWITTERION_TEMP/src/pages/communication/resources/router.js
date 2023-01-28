
import Vue from 'vue'
import momentLib from '../../../config/moment'

import NewsOverview from '../../../pages/communication/NewsOverview.vue'
import NewsTrack from '../../../pages/communication/NewsTrack.vue'
import NewsLetterSend from '../../../pages/communication/NewsLetterSend.vue'
import BirthdayPage from '../../../pages/communication/BirthdayPage.vue'
import Sms from '../../../pages/communication/Sms.vue'
import routerHelper from '../../../config/router-helper'
import RouterComponent from '../../../pages/RouterComponent'
import Suggestions from '../../../pages/Suggestions.vue'
Vue.use(momentLib)

export default [
    {
        path: '/news/news-overview',
        component: RouterComponent,
        beforeEnter: routerHelper.authRoute,
        children: [
            {
                name: 'news-item-view',
                path: '/news/news-overview/:id',
                component: NewsOverview,
                beforeEnter: routerHelper.authRoute,
                params: {
                    id: null,
                },
            },
            {
                name: 'news-overview',
                path: '',
                component: NewsOverview,
                beforeEnter: routerHelper.authRoute,
                meta: {
                    settingsRoute: 'news-overview',
                },
            },
            {
                name: 'news-letter-send',
                path: '/news/send-newsletter/:id',
                component: NewsLetterSend,
                beforeEnter: routerHelper.authRoute,
                params: {
                    id: null,
                },
            },
        ],
    },
    {
        name: 'news-track',
        path: '/news/news-track',
        component: NewsTrack,
        beforeEnter: routerHelper.authRoute,
        meta: {
            settingsRoute: 'news-track',
        },
    },
    {
        name: 'suggestions',
        path: '/suggestions',
        component: Suggestions,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'birthdays',
        path: '/birthdays',
        component: BirthdayPage,
        beforeEnter: routerHelper.authRoute,
        redirect: to => {
            return {
                name: 'birthdays-page',
                params: getDefaultMonthParams(),
            }
        },
        children: [
            {
                name: 'birthdays-page',
                path: '/birthdays/:month-:year',
                meta: {
                    settingsRoute: 'birthdays-page',
                },
            },
        ],
    },
    {
        name: 'sms-page',
        path: '/communication/sms',
        component: Sms,
        beforeEnter: routerHelper.authRoute,
    },
]

/**
 * Returns default month parameters for availability routes.
 *
 * @returns {{month: number, year: number}}
 */
function getDefaultMonthParams() {
    return {
        month: (Vue.moment().month() + 1),
        year: Vue.moment().isoWeekYear(),
    }
}
