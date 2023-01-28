<template>
    <VCard v-if="localFrequencyRow">
        <VCardTitle>{{ title }}</VCardTitle>
        <VCardText>
            <div class="frequency-form">
                <div class="label">
                    {{ baseTranslate('standardShifts.frequencyModal.frequency') }}
                </div>
                <div class="label">
                    {{ baseTranslate('standardShifts.frequencyModal.startWeek') }}
                </div>
                <div class="label">
                    {{ baseTranslate('standardShifts.frequencyModal.endWeek') }}
                </div>
                <div v-tooltip="cannotEditFrequencyTooltip">
                    <PSelect
                        ref="standardShiftRowFrequency"
                        :items="frequencyOptions"
                        dense
                        @input="changeFrequency($event)"
                    >
                        <template #selected-label>
                            {{ frequencyLabel(localFrequencyRow.frequency) }}
                        </template>
                    </PSelect>
                </div>
                <div
                    v-tooltip="cannotEditStartWeekTooltip"
                    class="start"
                >
                    <DatePicker
                        :options="datepickerOptionsStart"
                        cy_id="standardShiftRowStart"
                        @on-select="changeFrom($event)"
                    >
                        <template #activator="{ on, value }">
                            <PmtButton
                                id="from-week-activator"
                                ref="fromWeekActivator"
                                default-grey
                                block
                                no-margin
                                :icon="value ? 'chevron-up' : 'chevron-down'"
                                right-icon
                                :icon-size="15"
                                :active="value"
                                :disabled="!canEditFromWeek"
                                v-on="on"
                            >
                                <span>{{ from ? from.weekYearFormat() : baseTranslate('standardShifts.frequencyModal.selectStartWeek') }}</span>
                            </PmtButton>
                        </template>
                    </DatePicker>
                </div>
                <div class="end">
                    <DatePicker
                        :options="datepickerOptionsEnd"
                        cy_id="standardShiftRowEnd"
                        @on-select="changeTo($event)"
                    >
                        <template #activator="{ on, value }">
                            <PmtButton
                                id="to-week-activator"
                                ref="toWeekActivator"
                                default-grey
                                block
                                no-margin
                                :icon="value ? 'chevron-up' : 'chevron-down'"
                                right-icon
                                :icon-size="15"
                                :active="value"
                                :disabled="!from"
                                v-on="on"
                            >
                                <span>{{ to ? to.weekYearFormat() : baseTranslate('standardShifts.frequencyModal.selectEndWeek') }}</span>
                            </PmtButton>
                        </template>
                        <template #other-actions>
                            <PmtButton
                                ref="resetFilterBtn"
                                v-ripple
                                danger
                                outline
                                medium
                                cy_id="reset-filters"
                                @click="resetTo()"
                            >
                                {{ $t('ui.singles.reset') }}
                            </PmtButton>
                        </template>
                    </DatePicker>
                </div>
                <div
                    v-if="overlappingError"
                    class="form-info"
                >
                    <PmtInfo
                        warning
                        inverted
                        rounded
                        class="mt-2"
                        info-style="padding: 5px 10px;"
                    >
                        <i18n
                            :path="`pages.scheduling.standardShifts.warnings.${overlappingErrorType === 'cannotOverlap' ? 'cannotOverlapWithOtherStandardSchedules' : 'changeResultsInOverlappingShifts'}`"
                            tag="p"
                        />
                    </PmtInfo>
                </div>
                <div class="form-info">
                    <EmploymentInfo
                        :employee="employee"
                    />
                </div>
            </div>
        </VCardText>
        <VCardActions class="justify-content-end">
            <PmtButton
                ref="cancel"
                default
                @click="cancel()"
            >
                {{ $t('ui.singles.cancel') }}
            </PmtButton>
            <PmtButton
                ref="save"
                primary
                type="submit"
                :disabled="!hasChanges || overlappingError"
                @click="save()"
            >
                {{ $t('ui.singles.save') }}
            </PmtButton>
        </VCardActions>
    </VCard>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import stringHelper from '@/libraries/stringHelper'
export default {
    name: 'FrequencyForm',
    components: {
        EmploymentInfo: () => import('@/pages/planning/scheduling/components/EmploymentInfo'),
    },
    mixins: [mixins],
    props: {
        employee: {
            type: Object,
            required: true,
        },
        frequencyRow: {
            type: Object,
            default: () => (undefined),
        },
        addNew: {
            type: Boolean,
            default: false,
        },
        isRemarks: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            localFrequencyRow: null,
            overlappingError: false,
            overlappingErrorType: '',
        }
    },
    computed: {
        title () {
            return this.baseTranslate(`standardShifts.titles.${this.addNew ? 'addNew' : 'edit'}${this.isRemarks ? 'Remarks' : 'Shifts'}Frequency`)
        },
        isNew () {
            return this.localFrequencyRow.isNew
        },
        from () {
            return this.localFrequencyRow.from
        },
        to () {
            return this.localFrequencyRow.to
        },
        frequency () {
            return this.localFrequencyRow.frequency
        },
        minDate () {
            return (this.localFrequencyRow.minDate)
        },
        frequencyShifts () {
            return this.localFrequencyRow.shifts || []
        },
        employmentDate () {
            return this.$moment(this.employee.details.date_of_employment)
        },
        unemploymentDate () {
            if (!this.employee.details.date_of_unemployment) return null
            return this.$moment(this.employee.details.date_of_unemployment).endOf('isoWeek')
        },
        minFrequencyDate () {
            const employedInTheFuture = this.employmentDate.isAfter(this.minDate, 'week')
            if (employedInTheFuture) {
                return this.employmentDate
            }
            return this.minDate
        },
        maxFrequencyDate () {
            if (!this.unemploymentDate) return null
            if (this.unemploymentDate.apiFormat() < this.minDate.apiFormat()) {
                return this.minDate.endOf('isoWeek')
            }
            return this.$moment(this.employee.details.date_of_unemployment).endOf('isoWeek')
        },
        frequencyOptions () {
            return [1, 2, 3, 4, 5, 6, 8].map(frequency => {
                return {
                    label: this.frequencyLabel(frequency),
                    key: frequency,
                    value: frequency,
                    selected: this.frequency === frequency,
                    simple: true,
                }
            })
        },
        datepickerOptionsStart () {
            return {
                ...this.defaultDatepickerOptions('start'),
                selectedDate: this.from,
                minDate: this.minFrequencyDate,
            }
        },
        datepickerOptionsEnd () {
            return {
                ...this.defaultDatepickerOptions('end'),
                selectedDate: this.to || this.from,
                minDate: this.minDate.isAfter(this.from, 'week') ? this.minDate : this.from ? this.from : this.minDate,
            }
        },
        canEditFromWeek () {
            if (this.employedInThePast) return false
            return this.isNew
        },
        employedInThePastTooltip () {
            return this.baseTranslate('standardShifts.info.unEmployementDate', {
                date: this.$moment(this.employee.details.date_of_unemployment).fullReadableDateFormat(),
            })
        },
        cannotEditFrequencyTooltip () {
            if (this.canEditFromWeek) return
            if (this.employedInThePast) {
                return this.employedInThePastTooltip
            }
            return this.baseTranslate('standardShifts.tooltips.cannotEditFrequency')
        },
        cannotEditStartWeekTooltip () {
            if (this.canEditFromWeek) return
            if (this.employedInThePast) {
                return this.employedInThePastTooltip
            }
            return this.baseTranslate('standardShifts.tooltips.cannotEditStartWeek')
        },
        hasChanges () {
            if (this.isNew) return this.from
            const differentFrequency = this.frequencyRow.frequency !== this.frequency
            const differentStart = this.frequencyRow.from.apiFormat() !== this.from.apiFormat()
            const differentEnd = (!this.frequencyRow.to && this.to) || (this.frequencyRow.to && !this.to) || (this.frequencyRow.to && this.frequencyRow.to.apiFormat() !== this.to.apiFormat())
            return !this.isNew && (differentFrequency || differentStart || differentEnd)
        },
        newFrequencyRowModel () {
            const minDate = this.firstSelectableStandardShiftsDate
            const model = {
                frequency: 1,
                from: undefined,
                to: undefined,
                account_id: this.employee.account_id,
                id: stringHelper.newIdShort(),
                isNew: true,
                minDate,
                shifts: undefined,
                remark: undefined,
                label: this.frequencyLabel(1),
            }
            if (this.isRemarks) {
                model.remark = {
                    account_id: this.employee.account_id,
                    days: [...Array(7).keys()].map(d => { return { day_number: d + 1, remark: '' } }),
                    end_week: null,
                    end_year: null,
                    frequency: 1,
                    frequencyId: model.id,
                    readOnly: null,
                    standard_remark_id: undefined,
                    start_week: minDate.isoWeek(),
                    start_year: minDate.isoWeekYear(),
                    year_week: `${minDate.isoWeekYear()}-${minDate.isoWeek()}`,
                    isNew: true,
                }
            } else {
                model.shifts = []
            }
            if (this.unemploymentDate) {
                model.to = this.unemploymentDate
            }
            return model
        },
        employedInThePast () {
            if (!this.employee.details.date_of_unemployment) return false
            const employmentDate = this.$moment(this.employee.details.date_of_unemployment)
            return employmentDate.isBefore(this.minDate, 'week')
        },
    },
    mounted () {
        if (this.frequencyRow) {
            this.localFrequencyRow = { ...this.frequencyRow }
        } else {
            this.localFrequencyRow = this.newFrequencyRowModel
        }
    },
    methods: {
        hasOverlap (date) {
            const overlapingFrequency = this.employee[this.isRemarks ? 'frequencyRowsRemarks' : 'frequencyRows'].find(r => {
                const sameId = r.id === this.localFrequencyRow.id
                const sameFreqeuncy = r.frequency === this.localFrequencyRow.frequency
                const sameStartWeek = r.from.isoWeek() === date.isoWeek()
                const sameStartYear = r.from.year() === date.year()
                return !sameId && sameFreqeuncy && (sameStartWeek && sameStartYear)
            })
            if (overlapingFrequency) {
                this.overlappingError = true
                this.overlappingErrorType = 'cannotOverlap'
                return true
            } else {
                this.overlappingError = false
                this.overlappingErrorType = ''
                return false
            }
        },
        defaultDatepickerOptions (id) {
            return {
                id: `standard-shift-row-${id}-${this.employee.account_id}`,
                emitSelectOnMounted: false,
                mode: 'week',
                isSelected: true,
                showSidebar: false,
                forceSelect: true,
                transitionOrigin: 'top left',
                maxDate: this.maxFrequencyDate,
            }
        },
        frequencyLabel (frequency) {
            if (frequency === 1) {
                return `${this.$t('ui.singles.every')} ${this.$t('ui.singles.week')}`
            }
            return `${this.$t('ui.singles.every')} ${frequency || this.frequency} ${this.$t('ui.singles.weeks')}`
        },
        async save () {
            if (!this.addNew) {
                this.$emit('save', this.localFrequencyRow)
            } else {
                if (this.isRemarks) {
                    this.employee.addFrequencyRemarkRow(this.localFrequencyRow)
                } else {
                    this.employee.addFrequencyRow(this.localFrequencyRow)
                }
                this.SET_GRID_SELECTED_STANDARD_SHIFTS_ROW(this.localFrequencyRow.id)
            }
            this.$emit('close')
        },
        cancel () {
            this.$emit('close')
        },
        changeFrequency (event) {
            this.UPDATE_DATEPICKER({
                id: this.datepickerOptionsEnd.id,
            })
            this.localFrequencyRow.frequency = event.value
            this.localFrequencyRow.label = event.label
            const date = this.localFrequencyRow.from
                ? this.localFrequencyRow.from
                : this.firstSelectableStandardShiftsDate
            this.hasOverlap(date)
            this.recheckOverlap(this.localFrequencyRow)
        },
        changeFrom (date) {
            // Update end for setting the new basedOnDate
            this.UPDATE_DATEPICKER({
                id: this.datepickerOptionsEnd.id,
            })
            this.UPDATE_DATEPICKER({
                id: this.datepickerOptionsStart.id,
                selectedDate: date,
            })
            this.localFrequencyRow.from = date
            if (this.hasOverlap(date)) return
            if (this.to && this.from.isAfter(this.to, 'week')) {
                this.localFrequencyRow.to = this.from
                this.localFrequencyRow.toWeekYear = this.from.weekYearObject()
            }
            if (this.isRemarks) {
                this.localFrequencyRow.remark.start_week = date.isoWeek()
                this.localFrequencyRow.remark.start_year = date.isoWeekYear()
                this.localFrequencyRow.remark.year_week = `${date.isoWeekYear()}-${date.isoWeek()}`
            }
            this.recheckOverlap(this.localFrequencyRow)
        },
        changeTo (date) {
            this.localFrequencyRow.to = date
            this.localFrequencyRow.toWeekYear = date ? date.weekYearObject() : null
            if (this.isRemarks) {
                this.localFrequencyRow.remark.end_week = date ? date.isoWeek() : null
                this.localFrequencyRow.remark.end_year = date ? date.isoWeekYear() : null
            }
            this.recheckOverlap(this.localFrequencyRow)
        },
        resetTo () {
            this.UPDATE_DATEPICKER({
                id: this.datepickerOptionsEnd.id,
                show: false,
            })
            // when no un-employment date is available
            // this will be called with null
            this.changeTo(this.unemploymentDate)
        },
        async recheckOverlap ({ from, to, frequency, minDate }) {
            if (this.frequencyRow && this.frequencyRow.shifts) {
                // check all shifts overlaps
                for (let s = 0; s < this.frequencyRow.shifts.length; s++) {
                    const checkShift = this.frequencyRow.shifts[s]
                    const shift = { ...this.frequencyRow.shifts[s], frequency, start_datetime: this.$moment(checkShift.start_datetime).longApiFormat(), end_datetime: this.$moment(checkShift.end_datetime).longApiFormat() }
                    const overlap = this.shiftOverlaps(shift)
                    if (overlap.before || overlap.during || overlap.after) {
                        // warn and do not save if there are overlaps
                        this.overlappingError = true
                        this.overlappingErrorType = 'changeResults'
                        return
                    } else {
                        this.overlappingError = false
                        this.overlappingErrorType = ''
                    }
                }
            }
        },
    },
}
</script>
<style lang="scss" scoped>
.frequency-form {
    display: grid;
    grid-template-columns: repeat(3, 170px);
    grid-column-gap: 15px;
    grid-gap: 5px;
    .label {
        font-weight: bold;
    }
    .form-info {
        grid-column: 1 /span 3;
        :deep() .pmt-info {
            font-size: 12px;
        }
    }
}
</style>
