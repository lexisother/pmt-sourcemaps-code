<template>
    <header
        v-if="!datepicker.isRangePicker"
        :class="{'selected-date-header': true, col: isLandscape}"
    >
        <div class="selected-year">
            {{ selectedYearText }}
        </div>
        <div class="selected-day">
            {{ selectedDayText }}
        </div>
    </header>
    <header
        v-else
        :class="{'selected-date-header': true, col: isLandscape}"
    >
        <div class="selected-year">
            <span v-if="!datepicker.showDistinctiveRangeText || IS_MOBILE">{{ rangeText(false) }}</span>
            <table
                v-else
                class="w-100"
            >
                <tr>
                    <td>{{ $t('components.datepicker.from') }}</td>
                    <td align="right">
                        <Chip
                            :key="datepicker.selectedDateFrom.apiFormat()"
                            ref="from"
                            class="text-normal-darker w-100"
                            style="overflow: hidden;"
                        >
                            <div class="animated slideInLeft">
                                {{ datepicker.selectedDateFrom.format('DD MMM, YYYY') }}
                            </div>
                        </Chip>
                    </td>
                </tr>
                <tr>
                    <td>{{ $t('components.datepicker.to') }}</td>
                    <td align="right">
                        <Chip
                            :key="datepicker.selectedDateTo.apiFormat()"
                            ref="to"
                            class="text-normal-darker w-100"
                            style="overflow: hidden;"
                        >
                            <div class="animated slideInRight">
                                {{ datepicker.firstSelected ? '-' : datepicker.selectedDateTo.format('DD MMM, YYYY') }}
                            </div>
                        </Chip>
                    </td>
                </tr>
            </table>
        </div>
        <div class="selected-day">
            <span ref="rangeDaysCount">{{ rangeDaysCount }}</span>
            <PmtButton
                v-if="datepicker.showResetFilter"
                ref="resetCustomRange"
                v-ripple
                small
                primary
                cy_id="reset-custom-range"
                @click="resetRange(false)"
            >
                {{ $t('components.datepicker.reset') }}
            </PmtButton>
        </div>
        <template v-if="isLandscape && datepicker.showPredefinedRanges">
            <br>
            <ContentDivider>{{ $t('components.datepicker.range.predefineRanges.title') }}</ContentDivider>
            <!-- PREDEFINED RANGE SELECTOR -->
            <DatepickerPredefinedRangeSelector
                ref="rangeSelector"
                v-bind="$props"
            >
                <template #range-selection="{ item }">
                    <slot
                        name="range-selection"
                        :item="item"
                    />
                </template>
            </DatepickerPredefinedRangeSelector>
        </template>
    </header>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {
    name: 'DatepickerSidebar',

    components: {
        DatepickerPredefinedRangeSelector: () => import(/* webpackChunkName: "datepicker" */'./DatepickerPredefinedRangeSelector.vue'),
    },

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        /**
         * Returns the formatted date for the selected year
         */
        selectedYearText () {
            const headerYear = this.datepicker.localSelectedDate.clone().isoWeekYear()
            let headerDayWeek = ''
            if (this.datepicker.mode === 'week') {
                if (this.datepicker.localSelectedDate.startOf('isoWeek').year() !== headerYear) {
                    headerDayWeek = this.datepicker.localSelectedDate.clone().startOf('year').format('dddd, DD MMMM')
                } else {
                    headerDayWeek = this.datepicker.localSelectedDate.clone().startOf('isoWeek').format('dddd, DD MMMM')
                }
            } else {
                headerDayWeek = `${this.$t('ui.singles.week')} ${this.datepicker.localSelectedDate.clone().isoWeek()}`
            }
            return `${headerYear}, ${headerDayWeek}`
        },
        /**
         * Returns the formatted date for the selected day
         */
        selectedDayText () {
            if (this.datepicker.mode === 'week') {
                return `${this.$t('ui.singles.week')} ${this.datepicker.localSelectedDate.isoWeek()}`
            } else {
                return this.datepicker.localSelectedDate.format('dddd, DD MMMM')
            }
        },
    },
}
</script>
