<template>
    <header ref="navigationHeader">
        <div
            v-if="datepicker.showMonthNavigation && datepicker.selection !== 'month'"
            :class="datepicker.showYearNavigation ? 'float-left' : 'd-flex justify-space-around'"
        >
            <DatepickerNavigation
                ref="monthNavigation"
                mode="month"
                v-bind="$props"
                @navigate="navigate($event, 'M')"
                @click="updateSelection('month')"
            >
                <slot name="month">
                    {{ datepicker.navigationDay.format('MMMM') }}
                </slot>
            </DatepickerNavigation>
        </div>
        <div
            v-if="datepicker.showYearNavigation && datepicker.selection !== 'year'"
            :class="datepicker.showMonthNavigation && datepicker.selection !== 'month' ? 'float-right' : 'd-flex justify-space-around'"
        >
            <DatepickerNavigation
                ref="yearNavigation"
                mode="year"
                v-bind="$props"
                @navigate="navigate($event, 'y')"
                @click="updateSelection('year')"
            >
                <slot name="year">
                    {{ navigationYear }}
                </slot>
            </DatepickerNavigation>
        </div>
        <div v-if="!isLandscape && datepicker.showPredefinedRanges && datepicker.selection !== 'predefined'">
            <PmtButton
                id="predefined-ranges"
                ref="predefinedRangesNavigation"
                v-ripple
                class="animated"
                default
                @click="updateSelection('predefined')"
            >
                {{ $t('components.datepicker.range.predefineRanges.titleAlt') }}
            </PmtButton>
        </div>
    </header>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {
    name: 'DatepickerNavigationBar',

    components: {
        DatepickerNavigation: () => import(/* webpackChunkName: "datepicker" */'@/components/ui/pickers/components/DatepickerNavigation'),
    },

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    methods: {
        updateSelection (selection) {
            this.update({ selection: selection })
        },
        navigate (step, stepMode) {
            this.update({
                navigationDay: this.datepicker.navigationDay.clone().add(step, stepMode),
                direction: step === -1 ? 'left' : 'right',
            })
        },
    },
}
</script>
