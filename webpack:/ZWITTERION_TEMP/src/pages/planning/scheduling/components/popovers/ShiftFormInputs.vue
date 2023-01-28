<template>
    <div
        v-if="!shift.nonProductive"
        :id="`form-inputs-${shift.guid}`"
        :key="formKey"
        ref="formInputs"
    >
        <div :class="{ 'form-inputs': true,'for-time-block': forBlock }">
            <!-- SHIFT EDITABLE START / EMD TIMES -->
            <PmtTimeRangeInput
                :id="inputId"
                ref="timeRange"
                filled
                :time="timeFields"
                not-null
                center
                :separator="forBlock"
                :overlapping-from="overlappingFrom"
                :overlapping-to="overlappingTo"
                :autofocus="!forBlock"
                :auto-select="false"
                :over-the-night="overTheNight"
                :show-date-label="overTheNight"
                :show-date-label-navigation="!forBlock"
                :label-from-text="baseTranslate('shiftPopover.startTime')"
                :label-to-text="baseTranslate('shiftPopover.endTime')"
                :show-error-labels="false"
                :disabled="saving || disabled"
                :show-labels="!forBlock"
                :show-invalid-icon="!forBlock"
                @time-input="timeFields = $event"
                @enter="inputsEnter"
                @esc-click="cancel"
                @focus="$emit('focus', $event)"
                @blur="$emit('blur', $event)"
            >
                <template
                    v-if="isNewFromTopbar"
                    #sub-label-from
                >
                    <div
                        :key="$moment(shift.start_datetime).apiFormat()"
                        class="animated slideInLeft from-date-label"
                    >
                        <PmtButton
                            ref="fromBack"
                            round
                            primary
                            inverted
                            mini
                            no-margin
                            icon="chevron-left"
                            icon-size="14"
                            disabled-simple
                            :disabled="disabledMiniDateNavigation('from')"
                            tab-index="-1"
                            @click="navigateFromLabelDate(-1)"
                        />
                        <small class="grey-80">{{ !isStandard ? $moment(shift.start_datetime).format('DD MMM YYYY') : $moment(shift.start_datetime).format('dddd') }}</small>
                        <PmtButton
                            ref="fromForward"
                            round
                            primary
                            inverted
                            mini
                            no-margin
                            icon="chevron-right"
                            icon-size="14"
                            disabled-simple
                            :disabled="$moment(shift.start_datetime).isSame(SELECTED_DATE.endOf('isoWeek'), 'day')"
                            tab-index="-1"
                            @click="navigateFromLabelDate(1)"
                        />
                    </div>
                </template>
                <template
                    v-if="isNewFromTopbar"
                    #sub-label-to
                >
                    <div
                        :key="$moment(shift.end_datetime).apiFormat()"
                        class="animated slideInRight to-date-label"
                    >
                        <PmtButton
                            ref="toBack"
                            round
                            primary
                            inverted
                            mini
                            no-margin
                            icon="chevron-left"
                            icon-size="14"
                            disabled-simple
                            :disabled="$moment(shift.end_datetime).isSame(SELECTED_DATE.startOf('isoWeek'), 'day')"
                            tab-index="-1"
                            @click="navigateToLabelDate(-1)"
                        />
                        <small class="grey-80">{{ !isStandard ? $moment(shift.end_datetime).format('DD MMM YYYY') : $moment(shift.end_datetime).format('dddd') }}</small>
                        <PmtButton
                            ref="toForward"
                            round
                            primary
                            inverted
                            mini
                            no-margin
                            icon="chevron-right"
                            icon-size="14"
                            disabled-simple
                            :disabled="disabledMiniDateNavigation('to')"
                            tab-index="-1"
                            @click="navigateToLabelDate(1)"
                        />
                    </div>
                </template>
            </PmtTimeRangeInput>
            <div v-if="forBlock">
                |
            </div>
            <!-- SHIFT EDITABLE BREAK TIME -->
            <PmtTimeInput
                :id="`break-${employee.account_id}${forBlock ? '-block-' : '-'}`"
                ref="shiftBreak"
                :tooltip="breaksTooltip(shift)"
                :value="shift.breaks && shift.breaks[0] ? shift.breaks[0].duration : ''"
                name="break"
                :label="!forBlock ? baseTranslate('shiftPopover.break') : ''"
                :disabled="!canEditBreaks(shift) || saving || disabled"
                :min-value="!disabled && Object.keys(backupShift).length ? minBreaksValue(backupShift) : '00:00'"
                :is-invalid="invalidBreaks"
                :form-field="false"
                center
                filled
                @min-value-error="invalidBreaksUpdate"
                @enter="inputsEnter"
                @esc-click="cancel"
                @focus="$refs.shiftBreak.$refs.input.select(); $emit('focus', $event)"
                @blur="breakBlur($event)"
            />
        </div>
        <div
            v-if="!forBlock"
            class="shift-info"
        >
            <InformationOutline :size="14" />
            <span>{{ $t('ui.singles.duration') }}: <slot name="shift-duration" /></span>
            <small
                v-if="isDifferentDays"
                class="grey-100"
            >
                ({{ baseTranslate('shiftPopover.overTheNightShift') }})
            </small>
        </div>
        <Chip
            v-if="invalidBreaks && !forBlock"
            :key="invalidBreaks"
            error
            inverted
            text-left
            removeable
            @remove="invalidBreaks = null"
        >
            {{ invalidBreaksInfo(shift) }}
            <template #close>
                <PmtButton
                    primary
                    inverted
                    small
                    class="grey-100"
                    tab-index="-1"
                    @click="invalidBreaks = null"
                >
                    {{ $t('ui.singles.ok') }}
                </PmtButton>
            </template>
        </Chip>
        <MenuTooltip
            v-if="showOverlapAndBreaksWarning"
            ref="cellTooltipMenu"
            :show="true"
            :nudge-bottom="23"
            :x="overlapMenuPosition().x"
            :y="overlapMenuPosition().y"
            :close-on-click="false"
            :close-on-content-click="false"
            origin="top left"
            class="tooltip-menu"
        >
            <div class="overlap-message">
                <div class="overlap-message__title">
                    <span v-if="overlappingFrom || overlappingTo">
                        {{ baseTranslate('warnings.cannotOverlap') }}
                    </span>
                    <span v-if="invalidBreaks">
                        {{ invalidBreaksInfo(shift) }}
                    </span>
                    <span v-if="indirectHoursExceedShift(employee, shift)">
                        {{ $t('apiErrors.shifts.indirectHoursExceedsWork') }}
                    </span>
                </div>
                <div class="overlap-message__sub-title">
                    <PmtButton
                        danger
                        small
                        @click="cancel"
                    >
                        {{ $t('ui.singles.cancel') }}
                    </PmtButton>
                </div>
            </div>
        </MenuTooltip>
    </div>
    <div
        v-else
        :class="{ 'form-inputs non-productive-duration': true,'for-time-block': forBlock }"
    >
        <!-- SHIFT EDITABLE DURATION -->
        <PmtTimeInput
            :id="`duration-${employee.account_id}${forBlock ? '-block-' : '-'}`"
            ref="nonProductiveDuration"
            :value="shift.duration"
            name="shift-duration"
            :label="!forBlock ? baseTranslate('shiftPopover.duration') : ''"
            :rounding="1"
            center
            filled
            :form-field="false"
            :disabled="saving || disabled"
            :auto-focus="!forBlock"
            :auto-select="!forBlock"
            @enter="inputsEnter"
            @esc-click="cancel"
            @focus="$refs.nonProductiveDuration.$refs.input.select()"
            @blur="durationBlur($event)"
        />
        <div
            v-if="isCheckHours && shift.calculated && !forBlock"
            ref="calculatedButton"
            class="calculation"
        >
            <CheckHoursCalculatedShiftModal
                :shift="shift"
                :employee="employee"
            />
        </div>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
export default {
    name: 'ShiftFormInputs',
    components: {
        CheckHoursCalculatedShiftModal: () => import('@/pages/realisation/check-hours/components/CheckHoursCalculatedShiftModal'),
    },
    mixins: [mixins],
    props: {
        overTheNight: Boolean,
        shift: {
            type: Object,
            required: true,
        },
        employee: {
            type: Object,
            required: true,
        },
        backupShift: {
            type: Object,
            required: true,
        },
        saving: Boolean,
        // Indicates that the elements visibility and style
        // should adjust for displaying from, to and break in
        // the grid time-block
        forBlock: Boolean,
        disabled: Boolean,
        hasMenu: Boolean,
        isNewFromGrid: {
            type: Boolean,
            default: true,
        },
        isNewFromTopbar: Boolean,
        pendingSubstituteRequests: {
            type: Array,
            default: () => ([]),
        },
    },
    data () {
        return {
            overlappingFrom: false,
            overlappingTo: false,
            localSaving: false,
            formKey: 0,
            invalidBreaks: false,
            inputNavigation: false,
        }
    },
    computed: {
        /**
        * Handles the v-model for the time from and to inputs
        * Complex checking of times validity
        */
        timeFields: {
            get () {
                return {
                    from: this.$moment(this.shift.start_datetime).shortTime(),
                    to: this.$moment(this.shift.end_datetime).shortTime(),
                }
            },
            async set (newVal) {
                const from = this.$moment(this.shift.start_datetime).setTime(newVal.from)
                let to = this.$moment(this.shift.end_datetime).setTime(newVal.to)
                if (to.shortTime() < from.shortTime() && to.isSame(from, 'day')) {
                    // add 1 day to support over the night shift
                    to = to.add(1, 'days')
                } else if (to.shortTime() >= from.shortTime() && to.isAfter(from, 'day')) {
                    // subtract back the 1 added day if shift becomes larger than 24h
                    to = to.subtract(1, 'days')
                }
                const localEvent = {
                    ...this.shift,
                    start_datetime: from.longApiFormat(),
                    end_datetime: to.longApiFormat(),
                }
                if (from.longApiFormat() === to.longApiFormat() || to.longApiFormat() < from.longApiFormat()) {
                    const newEndTime = () => {
                        const newEnd = this.$moment(localEvent.start_datetime).add(1, 'hours')
                        if (newEnd.isoWeekday() !== from.isoWeekday() || newEnd.shortTime === '00:00') {
                            return from.clone().setTime('23:59').longApiFormat()
                        }
                        return newEnd.longApiFormat()
                    }
                    localEvent.end_datetime = newEndTime()
                }
                this.setInputsOverlap(localEvent)
                // update breaks only when times are changed
                if (this.shift.start_datetime !== localEvent.start_datetime || this.shift.end_datetime !== localEvent.end_datetime) {
                    const currentBreak = localEvent.breaks[0] || { duration: '00:00' }
                    // keep original break on copied shift
                    const suggestedBreak = this.shift.copied ? currentBreak : this.BREAK_SUGGESTION(from, to, this.employee.age) || currentBreak
                    const { breaks, duration } = schedulingHelper.updateShiftBreaksAndDuration(this.shift, [suggestedBreak])
                    localEvent.breaks = breaks
                    localEvent.duration = duration
                    localEvent.overlaps = this.setShiftOverlaps(localEvent)
                }
                this.$emit('update', localEvent)
                if (this.forBlock) {
                    this.checkChangesAndSave(localEvent)
                }
            },
        },
        /**
         * Checks if current shift is spanning across different days
         * @returns {Boolean}
         */
        isDifferentDays () {
            return this.$moment(this.shift.end_datetime).isAfter(this.$moment(this.shift.start_datetime), 'day')
        },

        inputId () {
            const main = this.forBlock ? this.employee.account_id : `${this.employee.notAssigned ? 'not-' : ''}assigned`
            return `shift-${main}${this.forBlock ? '-block-' : '-'}`
        },
        showOverlapAndBreaksWarning () {
            const indirectHoursExceedShift = this.indirectHoursExceedShift(this.employee, this.shift)
            const isInvalid = this.overlappingFrom || this.overlappingTo || this.invalidBreaks || indirectHoursExceedShift
            return this.forBlock && !this.hasMenu && isInvalid
        },
    },
    watch: {
        layoutScroll: {
            handler () {
                if (this.overlappingFrom || this.overlappingTo) {
                    this.cancel()
                }
            },
        },
    },
    mounted () {
        if (this.shift.isNew) {
            this.setInputsOverlap(this.shift)
        }
    },
    methods: {
        overlapMenuPosition () {
            const el = document.querySelector(`#form-inputs-${this.shift.guid}`)
            if (el) {
                const { x, y } = el.getBoundingClientRect()
                return { x: x - 10, y }
            }
            return { x: 0, y: 0 }
        },

        setInputsOverlap (shift) {
            if (!shift.notAssigned) {
                const overlaps = this.shiftOverlaps(shift)
                this.overlappingFrom = overlaps.before
                this.overlappingTo = overlaps.after
                this.$emit('overlap', this.overlappingFrom || this.overlappingTo)
            }
        },

        breakBlur (breakDuration) {
            if (this.forBlock) {
                const from = this.$moment(this.shift.start_datetime).setTime(this.$refs.timeRange.from).longApiFormat()
                const to = this.$moment(this.shift.end_datetime).setTime(this.$refs.timeRange.to).longApiFormat()
                const newShift = { ...this.shift, start_datetime: from, end_datetime: to }
                const { breaks, duration } = schedulingHelper.updateShiftBreaksAndDuration(newShift, [{ duration: breakDuration }])
                this.checkChangesAndSave({ ...newShift, breaks, duration })
                this.$emit('break-blur', breakDuration)
            } else {
                this.$emit('break-blur', breakDuration)
            }
        },

        durationBlur (duration) {
            const newShift = { ...this.shift, duration }
            this.$emit('update', newShift)
            if (this.forBlock) {
                this.checkChangesAndSave(newShift)
            }
        },

        checkChangesAndSave (shift) {
            setTimeout(() => {
                const hasChanges = this.shiftHasChanges(shift)
                const activeShiftElement = document.activeElement.closest('.planning-shift')
                const differentActiveShiftElement = shift.guid !== Number(activeShiftElement?.dataset?.shiftGuid)
                const indirectHoursExceedShift = this.indirectHoursExceedShift(this.employee, this.shift)
                if ((!document.activeElement.matches('input') || differentActiveShiftElement) && hasChanges && !indirectHoursExceedShift) {
                    this.$emit('block-update', shift)
                    if (this.employee.pendingSubstituteRequests(shift.shift_instance_id).length) {
                        this.$emit('overlaps-substitute-request', shift)
                    }
                } else if (!document.activeElement.matches('input') && (this.overlappingFrom || this.overlappingTo)) {
                    this.cancel()
                }
            }, 0)
        },

        inputsEnter (e) {
            e.target.blur()
            this.$emit('enter', this.shift)
        },

        shiftHasChanges (shift) {
            if (this.localSaving) return false
            const isModified = this.isShiftModified({
                shift,
                backupShift: this.backupShift,
                skipDepartmentCheck: true,
                skipEmployeeCheck: true,
            })
            if (this.overlappingFrom || this.overlappingTo) {
                this.SET_SNACKBAR({ error: true, message: this.baseTranslate('warnings.cannotOverlap') })
            }
            return isModified && !this.overlappingFrom && !this.overlappingTo && !this.invalidBreaks
        },

        cancel (e) {
            this.$emit('cancel', this.shift)
            this.overlappingFrom = false
            this.overlappingTo = false
            this.invalidBreaks = false
        },

        invalidBreaksUpdate () {
            this.invalidBreaks = true
            setTimeout(() => {
                this.invalidBreaks = false
            }, 8000)
        },

        invalidBreaksInfo (shift) {
            if (this.canEditBreaks(shift) && this.onlyBreakIncreaseAllowed(shift)) {
                return this.baseTranslate('warnings.cannotDecreaseBreaks', { breakTime: this.minBreaksValue(shift) })
            }
            return ''
        },

        disabledMiniDateNavigation (prop) {
            const amount = this.CAN_ADD_OVERNIGHT_SHIFTS ? 1 : 0
            const dateGuide = this.SELECTED_DATE.clone()
            if (prop === 'from') {
                return this.$moment(this.shift.start_datetime)
                    .isSame(dateGuide.startOf('isoWeek').subtract(amount, 'days'), 'day')
            } else {
                return this.$moment(this.shift.end_datetime)
                    .isAfterOrSameDayAs(dateGuide.endOf('isoWeek').add(amount, 'days'))
            }
        },

        /**
         * Changes the date of the "start_datetime" and "end_datetime" (only date, not the time),
         * based on user interaction with the date label navigation.
         * A shift can never span for more than 1 day, and this method ensures  that.
         */
        navigateFromLabelDate (direction) {
            const localEvent = { ...this.shift }
            const from = this.$moment(localEvent.start_datetime)
            const to = this.$moment(localEvent.end_datetime)
            localEvent.start_datetime = from.add(direction, 'days').longApiFormat()
            if (this.CAN_ADD_OVERNIGHT_SHIFTS) {
                const daySpan = this.$moment.duration(to.diff(from)).asDays()
                if (daySpan > 1) {
                    localEvent.end_datetime = from.setTime(to.shortTime()).add(1, 'days').longApiFormat()
                }
                if (daySpan < 0) {
                    localEvent.end_datetime = from.setTime(to.shortTime()).longApiFormat()
                }
            } else {
                localEvent.end_datetime = from.setTime(to.shortTime()).longApiFormat()
            }
            if (this.$moment.duration(to.diff(from)).asMinutes() < 0) {
                localEvent.end_datetime = from.add(1, 'hours').longApiFormat()
            }
            this.$emit('update', localEvent)
            this.formKey++
        },

        /**
         * Changes the date of the "start_datetime" and ""end_datetime (only date, not the time),
         * based on user interaction with the date label navigation.
         * A shift can never span for more than 1 day, and this method ensures  that.
         */
        navigateToLabelDate (direction) {
            const localEvent = { ...this.shift }
            const from = this.$moment(localEvent.start_datetime)
            const to = this.$moment(localEvent.end_datetime)
            localEvent.end_datetime = to.clone().add(direction, 'days').longApiFormat()
            if (this.CAN_ADD_OVERNIGHT_SHIFTS) {
                const daySpan = this.$moment.duration(to.diff(from)).asDays()
                if (daySpan > 1) {
                    localEvent.start_datetime = to.clone().subtract(1, 'days').setTime(from.shortTime()).longApiFormat()
                }
                if (daySpan < 0) {
                    localEvent.start_datetime = to.clone().setTime(from.shortTime()).longApiFormat()
                }
            } else {
                localEvent.start_datetime = to.clone().setTime(from.shortTime()).longApiFormat()
            }
            this.$emit('update', localEvent)
            this.formKey++
        },
    },
}
</script>

<style lang="scss" scoped>
.form-inputs {
    display: flex;
    align-items: flex-start;
    &:not(.for-time-block) {
        // 1fr = time range inputs (2 inputs inside 1 container)
        // 20% = break input (1 input)
        grid-template-columns: 1fr 25%;
        grid-gap: 10px;
        .time-range {
            grid-gap: 10px;
            input {
                font-size: 1rem;
            }
        }
    }
    &.for-time-block {
        grid-gap: 2px;
        align-items: center;
        justify-content: start;
        .time-range {
            grid-gap: 2px;
        }
        :deep() input {
            padding: 1px;
            height: 16px !important;
            background: transparent !important;
            width: 35px;
            font-size: .85rem !important;
            border-radius: 2px;
            pointer-events: all !important;
            &:not(:focus):not(:hover):not(.invalid) {
                border: 1px solid transparent !important;
            }
            &::selection {
                background: var(--primary, inherit);
            }
            &:disabled {
                color: var(--grey-140);
            }
            &:hover {
                border: 1px solid var(--grey-80) !important;
            }
        }
    }
    &.non-productive-duration {
        display: grid;
        grid-template-columns: 40%;
    }
    .calculation {
        align-self: center;
        margin-top: 20px;
    }
    :deep() input {
        &:focus-visible, &:hover, &:focus {
            outline: none !important;
            box-shadow: none !important;
        }
    }
}
.overlap-message {
    background-color: var(--fail);
    color: white;
    padding: 4px !important;
    text-align: left;
    line-height: 1.1rem;
    &__title {
        font-size: .9rem;
        font-weight: 600;
    }
    &__sub-title {
        font-size: .7rem;
    }
}

.shift-info {
    display: flex;
    align-items: center;
    line-height: 1rem;
    margin-top: 5px;
}
</style>
