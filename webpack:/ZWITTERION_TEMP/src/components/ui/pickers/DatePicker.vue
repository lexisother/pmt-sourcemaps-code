<template>
    <VMenu
        v-if="datepicker"
        ref="activator"
        v-model="datepicker.show"
        offset-y
        min-width="335"
        :close-on-content-click="false"
        close-on-click
        :origin="datepicker.transitionOrigin"
        :transition="datepicker.transition"
        :style="{ display: datepicker.display }"
    >
        <template #activator="{ on, value }">
            <slot
                name="activator"
                :on="on"
                :value="value"
                :date="datepicker.selectedDate"
                :range="{from: datepicker.selectedDateFrom, to: datepicker.selectedDateTo}"
            >
                <DatepickerActivator
                    :on="on"
                    :value="value"
                    v-bind="$props"
                    :style="{ display: datepicker.display + '!important' }"
                    v-on="$listeners"
                >
                    <template #selected-date-text="{ date, placeholder, range}">
                        <slot
                            name="selected-date-text"
                            :date="date"
                            :placeholder="placeholder"
                            :range="range"
                        />
                    </template>
                </DatepickerActivator>
            </slot>
        </template>
        <!-- DATE PICKER -->
        <div
            id="datepicker"
            ref="datePickerMenu"
            :class="`date-picker select-mode-${datepicker.mode} ${isLandscape && datepicker.showSidebar ? 'landscape' : ''}`"
            style="margin-left: 0;"
        >
            <!-- SIDEBAR -->
            <template v-if="datepicker.showSidebar">
                <DatepickerSidebar
                    ref="sidebar"
                    v-bind="$props"
                    v-on="$listeners"
                >
                    <template #range-selection="{ item }">
                        <slot
                            name="range-selection"
                            :item="item"
                        />
                    </template>
                </DatepickerSidebar>
            </template>
            <!-- MAIN -->
            <div>
                <!-- NAVIGATION -->
                <template v-if="datepicker.selection === 'week' || (datepicker.selection === 'month' && (datepicker.showMonthNavigation || datepicker.showYearNavigation))">
                    <DatepickerNavigationBar
                        ref="navigation"
                        v-bind="$props"
                    >
                        <template #month>
                            <slot
                                name="month"
                                :month="datepicker.navigationDay.month()"
                            />
                        </template>
                        <template #year>
                            <slot
                                name="year"
                                :year="datepicker.navigationDay.isoWeekYear()"
                            />
                        </template>
                    </DatepickerNavigationBar>
                </template>
                <!-- DAYS GRID -->
                <template v-if="!datepicker.simpleWeekPicker && datepicker.selection === 'week' && (datepicker.mode === 'day' || datepicker.mode === 'week')">
                    <DatepickerDaysGrid
                        ref="daysGrid"
                        v-bind="$props"
                        v-on="$listeners"
                    >
                        <template #week-number="{ week, date }">
                            <slot
                                name="week-number"
                                :week="week"
                                :date="date"
                            />
                        </template>
                        <template #day="{ day }">
                            <slot
                                name="day"
                                :day="day"
                            />
                        </template>
                    </DatepickerDaysGrid>
                </template>
                <!-- SIMPLE WEEKS GRID -->
                <template v-if="datepicker.selection === 'week' && datepicker.simpleWeekPicker">
                    <DatepickerWeeksGrid
                        ref="simpleWeekPicker"
                        v-bind="$props"
                        v-on="$listeners"
                    >
                        <template #simple-week="{ week }">
                            <slot
                                name="simple-week"
                                :week="week"
                            />
                        </template>
                    </DatepickerWeeksGrid>
                </template>
                <!-- MONTH SELECTOR -->
                <template v-if="datepicker.selection === 'month'">
                    <DatepickerMonthGrid
                        ref="monthGrid"
                        v-bind="$props"
                        v-on="$listeners"
                    >
                        <template #month-selection="{ month }">
                            <slot
                                name="month-selection"
                                :month="month"
                            />
                        </template>
                    </DatepickerMonthGrid>
                </template>
                <!-- YEAR SELECTOR -->
                <template v-if="datepicker.selection === 'year'">
                    <DatepickerYearGrid
                        ref="yearsGrid"
                        v-bind="$props"
                    >
                        <template #year-selection="{ year }">
                            <slot
                                name="year-selection"
                                :year="year"
                            />
                        </template>
                    </DatepickerYearGrid>
                </template>
                <!-- MOBILE PREDEFINED RANGE SELECTOR -->
                <template v-if="datepicker.selection === 'predefined'">
                    <DatepickerPredefinedRangeSelector
                        ref="customRangeSelector"
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
                <!-- DATEPICKER INFO -->
                <slot name="info" />
                <!-- DATEPICKER ACTIONS -->
                <DatepickerActions
                    ref="actions"
                    v-bind="$props"
                    v-on="$listeners"
                >
                    <template #actions>
                        <slot name="actions" />
                    </template>
                    <template #other-actions>
                        <slot name="other-actions" />
                    </template>
                </DatepickerActions>
            </div>
        </div>
    </VMenu>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'

import DatepickerDaysGrid from '@/components/ui/pickers/components/DatepickerDaysGrid.vue'
import DatepickerWeeksGrid from '@/components/ui/pickers/components/DatepickerWeeksGrid.vue'
import DatepickerMonthGrid from '@/components/ui/pickers/components/DatepickerMonthGrid.vue'
import DatepickerYearGrid from '@/components/ui/pickers/components/DatepickerYearGrid.vue'
import DatepickerActions from '@/components/ui/pickers/components/DatepickerActions.vue'
import DatepickerNavigationBar from '@/components/ui/pickers/components/DatepickerNavigationBar.vue'
import DatepickerSidebar from '@/components/ui/pickers/components/DatepickerSidebar.vue'
import DatepickerActivator from '@/components/ui/pickers/components/DatepickerActivator.vue'
import DatepickerPredefinedRangeSelector from '@/components/ui/pickers/components/DatepickerPredefinedRangeSelector.vue'

export default {

    name: 'Datepicker',

    components: {
        DatepickerDaysGrid,
        DatepickerWeeksGrid,
        DatepickerMonthGrid,
        DatepickerYearGrid,
        DatepickerActions,
        DatepickerNavigationBar,
        DatepickerSidebar,
        DatepickerActivator,
        DatepickerPredefinedRangeSelector,
    },

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    async created () {
        await this.INIT_DATEPICKER({
            ...this.defaultDatepickerOptions,
            /**
             * OVERIDE DEFAULT OPTIONS
             */
            ...this.options,
        })
    },

    async mounted () {
        await this.setDateAsSelected(this.options.selectedDate, this.options.emitSelectOnMounted)
        if (this.options.isRangePicker) {
            this.resetRange(false)
        }
    },

    destroyed () {
        this.update({
            firstSelected: false,
        })
    },
}
</script>

<style lang="scss">@import './Datepicker.scss';</style>
