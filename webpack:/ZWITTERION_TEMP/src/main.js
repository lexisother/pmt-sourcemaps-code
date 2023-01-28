import Vue from 'vue'
const App = require('./App.vue')
import Vuelidate from 'vuelidate'
import PortalVue from 'portal-vue'
import smoothscroll from 'smoothscroll-polyfill'
import { VTooltip, VPopover, VClosePopover } from 'v-tooltip'
import MaterialDesignIcons from './config/material-design-icons'
import language from './config/language'
import { store } from './store'
import momentLib from './config/moment'
import router from './config/router'
import globalComponents from './config/global-components'
import globalDirectives from './config/global-directives'
import globalSettings from './config/global-settings'
import vuetify from './plugins/vuetify'
import VueGtag from 'vue-gtag'
import VueCookies from 'vue-cookies'
import CKEditor from 'ckeditor4-vue/dist/legacy.js'
import { RecycleScroller } from 'vue-virtual-scroller' // https://github.com/Akryum/vue-virtual-scroller
import Hotjar from 'vue-hotjar'

require('vue-virtual-scroller/dist/vue-virtual-scroller.css')
Vue.config.productionTip = false
require('./config/bus')
require('../src/assets/scss/main.scss')
Vue.use(VueCookies)

smoothscroll.polyfill()

// Configuration VueGtag
Vue.use(VueGtag, {
    config: { id: 'UA-26894375-4' },
}, router)

Vue.use(momentLib)
Vue.use(Vuelidate)
Vue.use(PortalVue)
Vue.use(CKEditor)

Vue.use(Hotjar, {
    id: '2478260',
    isProduction: process.env.NODE_ENV === 'production',
})

VTooltip.options.autoHide = false
VTooltip.options.defaultTrigger = 'click hover focus'
Vue.directive('tooltip', VTooltip)
Vue.directive('close-popover', VClosePopover)
Vue.component('VPopover', VPopover)

// load global material design icons
Object.keys(MaterialDesignIcons).forEach((key) => {
    Vue.component(key, MaterialDesignIcons[key])
})

// load global components
Object.keys(globalComponents).forEach((key) => {
    Vue.component(key, globalComponents[key])
})

Vue.component('RecycleScroller', RecycleScroller)

// load global directives
Object.keys(globalDirectives).forEach((key) => {
    Vue.directive(key, globalDirectives[key])
})

store.dispatch('locale/initLocale')
// store.dispatch('auth/loginFromLocalStorage');
Vue.moment().locale(store.getters['locale/getLocale'])
Vue.moment.weekdays(true)

Vue.prototype.$cfg = globalSettings.settings
Vue.prototype.$helpers = globalSettings.helpers
Vue.prototype.$store_theme = store.getters['stores/theme']
Vue.prototype.$app_theme = store.getters['stores/getDefaultTheme']
Vue.prototype.$sleep = async (time = 0) => {
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, time)
    })
}
// uncomment bellow to debug all vuex actions and their respective durations
// could get quite some insightfull data out of this
// store.subscribeAction({
//     before: (action, state, error) => {
//         console.time('DURATION: ' + action.type)
//     },
//     after: (action, state, error) => {
//         console.timeEnd('DURATION: ' + action.type)
//     },
//     error: (action, state, error) => {
//         console.timeEnd('DURATION: ' + action.type)
//     }
// })

// eslint-disable-next-line no-new
new Vue({
    el: '#app',
    store,
    router,
    i18n: language,
    vuetify,
    render: h => h(App),
})

/* eslint no-extend-native: ["error", { "exceptions": ["Promise"] }] */
Promise.prototype.finally = Promise.prototype.finally || {
    finally (fn) {
        const onFinally = callback => Promise.resolve(fn()).then(callback)
        return this.then(
            result => onFinally(() => result),
            reason => onFinally(() => Promise.reject(reason)),
        )
    },
}.finally
