import Vue from 'vue'
import Vuetify, {
    VApp,
    VTimePicker,
    VDataTable,
    VCardTitle,
    VSpacer,
    VTextField,
    VRow,
    VContainer,
    VCol,
    VIcon,
    VCard,
    VToolbar,
    VBtn,
    VChip,
    VList,
    VListItemGroup,
    VListItemContent,
    VBottomSheet,
    VMenu,
    VDialog,
    VExpansionPanel,

} from 'vuetify/lib'

import { Touch, Ripple, Scroll } from 'vuetify/lib/directives'
import browserHelper from '../libraries/browserHelper'

import en from 'vuetify/es5/locale/en'
import nl from 'vuetify/es5/locale/nl'
import de from 'vuetify/es5/locale/de'

const locale = localStorage.getItem('language')

Vue.use(Vuetify, {
    components: {
        VApp,
        VTimePicker,
        VDataTable,
        VCardTitle,
        VSpacer,
        VTextField,
        VRow,
        VContainer,
        VCol,
        VIcon,
        VCard,
        VToolbar,
        VBtn,
        VChip,
        VList,
        VListItemGroup,
        VListItemContent,
        VBottomSheet,
        VExpansionPanel,
        VMenu,
        VDialog,
    },
    directives: {
        Touch,
        Ripple,
        Scroll,
    },
})

let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color')
let secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')
let successColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color')
let infoColor = getComputedStyle(document.documentElement).getPropertyValue('--info-color')
let failColor = getComputedStyle(document.documentElement).getPropertyValue('--danger')
let warningColor = getComputedStyle(document.documentElement).getPropertyValue('--warning-color')

if (browserHelper.isInternetExplorer()) {
    primaryColor = '#47a6d8'
    secondaryColor = '#005480'
    successColor = '#009432'
    infoColor = '#17a2b8'
    failColor = '#ED4C67'
    warningColor = '#fdcb6e'
}

export default new Vuetify({
    lang: {
        locales: { en, nl, de },
        current: locale,
    },
    global: {
        ripples: false,
    },
    theme: {
        themes: {
            light: {
                primary: primaryColor,
                secondary: secondaryColor,
                accent: primaryColor,
                error: failColor,
                info: infoColor,
                success: successColor,
                warning: warningColor,
            },
        },
    },
})
