import routerHelper from '@/config/router-helper'
import LoginPage from '@/pages/user/LoginPage.vue'
import LogoutPage from '@/pages/user/LogoutPage.vue'
import ResetPassword from '@/pages/user/ResetPassword.vue'
import ForgotPassword from '@/pages/user/ForgotPassword.vue'
import MyAccountPage from '@/pages/user/MyAccountInformationPage.vue'
import ActivateAccount from '@/pages/user/Activate.vue'

export default [
    {
        name: 'login',
        path: '/login',
        component: LoginPage,
        beforeEnter: routerHelper.guestRoute,
    },
    {
        name: 'activate-account',
        path: '/activation/:hash',
        component: ActivateAccount,
        beforeEnter: routerHelper.guestRoute,
    },
    {
        name: 'activate-account-finalize',
        path: '/activation/:hash/finalize',
        component: ActivateAccount,
        beforeEnter: routerHelper.authRoute,
        meta: {
            finalize: true,
        },
    },
    {
        name: 'password-recovery',
        path: '/recovery/:hash',
        component: ResetPassword,
        beforeEnter: routerHelper.guestRoute,
    },
    {
        name: 'forgot-password',
        path: '/account/forgot-password',
        component: ForgotPassword,
        beforeEnter: routerHelper.guestRoute,
    },
    {
        name: 'logout',
        path: '/logout',
        component: LogoutPage,
    },
    {
        path: '/my-account/information',
        name: 'my-account-information',
        query: {
            path: 'account_information',
        },
        component: MyAccountPage,
        beforeEnter: routerHelper.authRoute,
    },
    {
        path: '/my-account/information',
        name: 'my-information',
        redirect: to => {
            return {
                name: 'my-account-information',
                query: {
                    path: 'account_information',
                },
            }
        },
        beforeEnter: routerHelper.authRoute,
    },
]
