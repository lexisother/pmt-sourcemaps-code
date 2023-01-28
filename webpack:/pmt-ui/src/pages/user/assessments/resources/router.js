import routerHelper from '@/config/router-helper'
import MyAssessments from '@/pages/user/assessments/MyAssessments.vue'
import EmployeeAssessments from '@/pages/user/assessments/EmployeeAssessments.vue'
import * as moment from '@/config/moment'
import Vue from 'vue'
Vue.use(moment)

export default [
    {
        path: '/my-overview/assessments',
        name: 'my-assessments',
        component: MyAssessments,
        beforeEnter: routerHelper.authRoute,
    },
    {
        name: 'employee-assessments',
        path: '/manage/assessments',
        redirect: to => {
            return {
                name: 'manage-employee-assessments',
                params: {
                    week: Vue.moment().isoWeek(),
                    year: Vue.moment().isoWeekYear(),
                },
            }
        },
    },
    {
        name: 'manage-employee-assessments',
        path: '/manage/assessments/:week-:year',
        component: EmployeeAssessments,
        beforeEnter: routerHelper.authRoute,
        meta: {
            mode: 'week',
            manager: true,
        },
        params: {
            week: Vue.moment().isoWeek(),
            year: Vue.moment().isoWeekYear(),
        },
    },
]
