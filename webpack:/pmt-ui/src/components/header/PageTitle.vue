<template>
    <div
        class="page-title-bar"
        :style="{ 'background-color': theme.secondaryBackgroundColor }"
    >
        <h1
            v-if="pageTitle"
            :style="{ 'color': theme.secondaryColor }"
        >
            {{ pageTitle }}
        </h1>
        <h2 :style="{ 'color': theme.secondaryColor }">
            {{ pageSubTitle }}
            <portal-target name="page-subtitle" />
        </h2>
    </div>
</template>

<script>
import stringHelper from '@/libraries/stringHelper'
import { mapGetters } from 'vuex'

export default {
    name: 'PageTitle',
    props: {
        theme: {
            type: Object,
            default: () => {},
        },
    },
    computed: {
        ...mapGetters(['IS_MOBILE']),
        ...mapGetters('planning', ['EMPLOYEES', 'LAST_MODIFIED_STANDARD_SHIFT']),
        headerMenu () {
            return this.menu.headerMenu
        },
        pageTitle () {
            if (this.$route.name) {
                const translationProp = `pageTitles.${stringHelper.camelCaseHyphenString(this.$route.name)}`
                return this.$t(translationProp)
            }
            // if on Pmt1 page
            return this.headTitle
        },
        pageSubTitle () {
            const subTitle = null
            if (this.$route.meta?.subTitleType === 'day') {
                if (this.$route.name === 'day-planning') {
                    return this.$moment().fromWeekDayRouteParams(this.$route).format('dddd D MMMM YYYY')
                } else if (this.$route.name === 'time-registrations-page') {
                    return this.$moment(this.$route.params.date).format('dddd D MMMM YYYY')
                } else {
                    const date = this.$moment(`${this.$route.params.year}-${this.$route.params.month}-${this.$route.params.day}`)
                    return date.format('dddd D MMMM YYYY')
                }
            }
            if (this.$route.meta?.subTitleType === 'week') {
                const date = this.$moment().fromWeekDayRouteParams(this.$route)
                const from = date.clone().startOf('isoWeek')
                const to = date.clone().endOf('isoWeek')
                let fromToPeriod = `${from.format('DD MMM')} - ${to.format('DD MMM')}`
                if (from.year() < to.year()) {
                    fromToPeriod = `${from.format('DD MMM YYYY')} - ${to.format('DD MMM YYYY')}`
                }
                return `${this.$t('ui.singles.week')} ${date.isoWeek()} ${date.isoWeekYear()} (${fromToPeriod})`
            }
            if (this.$route.meta?.subTitleType === 'month') {
                return `${this.$moment(this.$route.params.month, 'M').format('MMMM')} ${this.$route.params.year}`
            }
            return subTitle
        },
        headTitle () {
            const titleSegments = document.title.split('|')
            return titleSegments.length ? titleSegments[titleSegments.length - 1] : ''
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/mixins/_breakpoints.scss';

    .page-title-bar {
        display: flex;
        height: 20px;
        padding: 0 16px;

        @include bp-sm {
            height: 24px;
        }

        h1, h2 {
            margin: 0;
            line-height: 20px;
            font-weight: 400;
            letter-spacing: 1px;
            text-transform: uppercase;

            @include bp-sm {
                line-height: 24px;
            }
        }

        h1 {
            font-size: 11px;

            @include bp-sm {
                font-size: 12px;
            }
        }

        h2 {
            display: none;
            margin-left: 24px;
            font-size: 9px;
            opacity: 0.67;

            @include bp-sm {
                display: inline;
                font-size: 10px;
            }
        }

    }
</style>
