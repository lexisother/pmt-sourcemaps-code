<template>
    <footer v-if="(nowButtonText && (canClickNow || datepicker.overrideReset)) || datepicker.isRangePicker">
        <slot name="actions">
            <PmtButton
                v-if="nowButtonText && canClickNow"
                id="current-date"
                ref="currentDate"
                v-ripple
                primary
                outline
                medium
                cy_id="current-date"
                @click="nowButtonClick"
            >
                {{ nowButtonText }}
            </PmtButton>
            <PmtButton
                v-if="!datepicker.isRangePicker && datepicker.isSelected && datepicker.showResetFilter"
                ref="resetFilterBtn"
                v-ripple
                danger
                outline
                medium
                cy_id="reset-filters"
                @click="emitDeselect()"
            >
                {{ datepicker.resetLabel }}
            </PmtButton>
            <!-- Range picker buttons-->
            <PmtButton
                v-if="datepicker.isRangePicker"
                ref="ok"
                v-ripple
                primary
                outline
                medium
                :disabled="datepicker.firstSelected"
                cy_id="ok"
                @click="emitOk()"
            >
                <!-- Will be disabled until the selected range is complete -->
                OK
            </PmtButton>
            <PmtButton
                v-if="datepicker.isRangePicker && localMaxDate"
                ref="resetRange"
                v-ripple
                danger
                outline
                medium
                cy_id="reset-range"
                @click="resetRange()"
            >
                {{ $t('components.datepicker.resetFilter') }}
            </PmtButton>
        </slot>
    </footer>
    <footer v-else>
        <slot name="other-actions" />
    </footer>
</template>

<script>
import mixins from '@/components/ui/pickers/mixins'
export default {
    name: 'DatepickerActions',

    mixins: [mixins],

    props: {
        options: {
            type: Object,
            required: true,
        },
    },

    computed: {
        /**
             * The now button text, in regards to the selected mode
             */
        nowButtonText () {
            if (!this.datepicker.isRangePicker) {
                const isMinDate = this.datepicker.minDate ? !this.$moment().isBefore(this.$moment(this.datepicker.minDate, 'isoWeek')) : true
                if (this.datepicker.mode === 'day' && isMinDate && this.datepicker.selection === 'week') {
                    return this.$t('components.datepicker.todayBtn.label')
                }
                if (this.datepicker.mode === 'week' && isMinDate && this.datepicker.selection === 'week') {
                    return this.$t('components.datepicker.currentWeekBtn.label')
                }
                if (this.datepicker.selection === 'month') {
                    return this.$t('components.datepicker.currentMonthBtn.label')
                }
                if (this.datepicker.selection === 'year') {
                    return this.$t('components.datepicker.currentYearBtn.label')
                }
            }
            return ''
        },
        /**
             * The rule to be able to click now button is
             * for the minDate to be after or same day as today.
             */
        canClickNow () {
            return this.datepicker.minDate ? this.$moment().isAfterOrSameDayAs(this.$moment(this.datepicker.minDate)) : true
        },
    },
    methods: {
        /**
             * Depending oin the selected mode this will
             * week: select the week and close the menu
             * month: update datepicker internal navigation to the current month and select the week internal view
             * year: update datepicker internal navigation to the current year and select the month internal view
             */
        nowButtonClick () {
            if (this.datepicker.selection === 'week') {
                let selected
                let options = {
                    show: false, // always close the datepicker on week click
                }
                if (this.datepicker.mode === 'week') {
                    selected = this.$moment().startOf('isoWeek')
                } else {
                    selected = this.$moment()
                }
                if (!this.datepicker.selectedDate || selected.apiFormat() !== this.datepicker.selectedDate.apiFormat()) {
                    options = {
                        ...options,
                        selectedDate: selected,
                        navigationDay: selected.clone(),
                        localSelectedDate: selected.clone(),
                    }
                    this.emitSelect(selected)
                }
                this.update(options)
                if (this.datepicker.handleRoute) {
                    this.updateBrowserPath(selected)
                }
            }
            if (this.datepicker.selection === 'month') {
                if (this.datepicker.handleRoute && this.datepicker.mode === 'month') {
                    this.updateBrowserPath(this.$moment())
                } else {
                    this.selectMonth(this.$moment())
                }
            }
            if (this.datepicker.selection === 'year') {
                this.selectYear(this.datepicker.mode === 'week' ? this.$moment().isoWeekYear() : this.$moment().year())
            }
        },

        /**
             * Resets the selected range to the datepicker's minDate
             */
        resetRangeToMinDate () {
            this.update({
                navigationDay: this.datepicker.minDate,
                selectedDateFrom: this.datepicker.minDate,
                selectedDateTo: this.datepicker.minDate,
                firstSelected: false,
                hoveredRangeDay: this.datepicker.minDate,
            })
            this.$emit('reset-to-min-date', this.datepicker.selectedDateTo)
        },
    },
}
</script>
