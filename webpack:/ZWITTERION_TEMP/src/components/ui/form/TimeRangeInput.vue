<template>
    <div class="time-range">
        <div>
            <PInput
                :id="`${id}-time-from-input`"
                ref="from"
                v-model="fromModel"
                :cy_id="`${id}-time-from-input`"
                :label="showLabels ? labelFromText || $t('components.timeRangeInput.fromField.label') : ''"
                class="from"
                name="from"
                :placeholder="$t( 'components.timeRangeInput.fromField.placeholder' )"
                :disabled="disabled"
                :autofocus="autofocus"
                :autoselect="autoSelect"
                :center="center"
                :readonly="$attrs.readonly"
                :required="fromRequired"
                :danger="!times.from.valid || overlapping || overlappingFrom"
                @blur="blur($event, 'from')"
                @focus="$refs.from.select()"
                @enter-click="blur($event, 'from', 'enter')"
                @esc-click="$emit('esc-click', $event)"
            />
            <div>
                <slot name="sub-label-from" />
            </div>
            <Chip
                v-if="showErrorLabels && (error.from || overlapping || overlappingFrom || overlappingTo)"
                :text="error.from || $t('forms.availabilityEntry.validationMsg.overlapDetected')"
                absolute
                error
                inverted
                small
            />
        </div>
        <div v-if="separator">
            -
        </div>
        <div>
            <PInput
                :id="`${id}-time-to-input`"
                ref="to"
                v-model="toModel"
                :cy_id="`${id}-time-to-input`"
                :label="showLabels ? labelToText || $t('components.timeRangeInput.toField.label') : ''"
                class="to"
                name="to"
                :placeholder="$t( 'components.timeRangeInput.toField.placeholder' )"
                :disabled="disabled"
                :center="center"
                :readonly="$attrs.readonly"
                :required="toRequired"
                :danger="!times.to.valid || overlapping || overlappingTo"
                @blur="blur($event, 'to')"
                @focus="$refs.to.select()"
                @enter-click="blur($event, 'to', 'enter')"
                @esc-click="$emit('esc-click', $event)"
            />
            <div>
                <slot name="sub-label-to" />
            </div>
            <Chip
                v-if="showErrorLabels && (error.to || overlapping || overlappingTo || overlappingFrom)"
                :text="error.to || $t('forms.availabilityEntry.validationMsg.overlapDetected')"
                absolute
                error
                inverted
                small
            />
        </div>
    </div>
</template>

<script>
import timeHelper from '@/libraries/timeHelper'

export default {
    name: 'TimeRangeInput',
    props: {
        time: {
            type: Object,
            required: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        rounding: {
            type: Number,
            default: 15,
        },
        notNull: {
            type: Boolean,
            default: false,
        },
        isSchool: {
            type: Boolean,
            default: false,
        },
        fromRequired: {
            type: Boolean,
            default: false,
        },
        allowedHoursFrom: {
            type: Array,
            default: () => [...Array(24).keys()],
        },
        toRequired: {
            type: Boolean,
            default: false,
        },
        allowedHoursTo: {
            type: Array,
            default: () => [...Array(24).keys()],
        },
        allowedMinutesFrom: {
            type: Array,
            default: () => [0, 15, 30, 45],
        },
        allowedMinutesTo: {
            type: Array,
            default: () => [0, 15, 30, 45, 59],
        },
        id: {
            type: String,
            default: 'time-range-input',
        },
        overlapping: Boolean,
        overlappingFrom: Boolean,
        overlappingTo: Boolean,
        autofocus: {
            type: Boolean,
            default: false,
        },
        autoSelect: {
            type: Boolean,
            default: false,
        },
        filled: Boolean,
        labelFromText: {
            type: String,
            default: '',
        },
        labelToText: {
            type: String,
            default: '',
        },
        center: Boolean,
        overTheNight: Boolean,
        showErrorLabels: {
            type: Boolean,
            default: true,
        },
        showLabels: {
            type: Boolean,
            default: true,
        },
        updateWhileTyping: {
            type: Boolean,
            default: true,
        },
        separator: {
            type: Boolean,
            default: false,
        },
        showInvalidIcon: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            from: '',
            to: '',
            times: {
                from: {
                    hour: '',
                    minutes: '',
                    valid: true,
                },
                to: {
                    hour: '',
                    minutes: '',
                    valid: true,
                },
            },
            error: {
                from: '',
                to: '',
            },
        }
    },
    computed: {
        fromModel: {
            get () {
                return this.from
            },
            set (newVal) {
                this.from = newVal
            },
        },
        toModel: {
            get () {
                return this.to
            },
            set (newVal) {
                this.to = newVal
            },
        },
    },
    watch: {
        time: {
            handler (val) {
                this.from = val.from
                this.to = val.to
            },
            deep: true,
        },
    },
    mounted () {
        this.from = this.time.from
        this.to = this.time.to
        this.validateInput('to')
        if (this.autofocus) {
            setTimeout(() => {
                if (this.$refs.from) {
                    this.$refs.from.focus()
                    if (this.autoSelect) {
                        this.$refs.from.select()
                    }
                }
            }, 100)
        }
    },
    methods: {
        /**
         * Called each time a character is inputed in one of the inputs
         * Cleans and formats the time input before validation
         */
        async onInput (event, which) {
            this[which] = timeHelper.validateTime(this[which])
        },
        /**
         * Validates the input time against the bussiness and logical rules
         */
        async onBlurFrom ($event) {
            await this.onInput($event, 'from')
            await this.updateTimeFromInputFields()
            await this.validateInput($event.name)
            if (!this.isSchoolValid()) return
            if (this.isFromValid()) {
                this.$emit('time-from-input', this.from)
                this.$emit('time-input', { from: this.from, to: this.to })
                this.$emit('times-valid', this.error)
            }
        },

        async onBlurTo ($event) {
            await this.onInput($event, 'to')
            await this.updateTimeFromInputFields()
            await this.validateInput($event.name)
            if (!this.isSchoolValid()) return
            if (this.isToValid()) {
                this.$emit('time-to-input', this.to)
                this.$emit('time-input', { from: this.from, to: this.to })
                this.$emit('times-valid', this.error)
            }
        },

        /**
         * Checks whether the from time is allowed
         */
        isFromValid () {
            const isHourAllowed = this.allowedHoursFrom.includes(this.times.from.hour)
            const areMinuteAllowed = this.allowedMinutesFrom.includes(this.times.from.minutes)
            if (!isHourAllowed || (isHourAllowed && !areMinuteAllowed)) {
                if (this.times.from.hour < this.allowedHoursFrom[0]) {
                    this.error.from = this.$t('forms.availabilityEntry.validationMsg.outsideBusinessTimes')
                } else if (this.isSchool) {
                    this.error.from = this.$t('forms.availabilityEntry.school.notBeforeSeven', [this.$cfg.school.minStartTime])
                } else {
                    this.error.from = this.$t('forms.availabilityEntry.validationMsg.overlapDetected')
                }
                this.times.from.valid = false
                this.$emit('times-not-valid', this.error)
                return false
            } else {
                this.error.from = ''
                this.times.from.valid = true
                this.$emit('times-valid', this.error)
                return true
            }
        },

        /**
         * Checks wheater the to time is allowed
         */
        isToValid () {
            const isHourAllowed = this.allowedHoursTo.includes(this.times.to.hour)
            const areMinuteAllowed = this.allowedMinutesTo.includes(this.times.to.minutes)
            if (!isHourAllowed || (isHourAllowed && !areMinuteAllowed)) {
                if (this.times.to.hour > this.allowedHoursTo[this.allowedHoursTo.length - 1] && this.allowedHoursTo[this.allowedHoursTo.length - 1] !== 0) {
                    this.error.to = this.$t('forms.availabilityEntry.validationMsg.outsideBusinessTimes')
                    this.times.to.valid = false
                    return false
                } else if (this.isSchool) {
                    this.error.to = this.$t('forms.availabilityEntry.school.notAfterNineteen', [this.$cfg.school.maxEndTime])
                } else {
                    this.error.to = this.$t('forms.availabilityEntry.validationMsg.overlapDetected')
                }
                this.times.to.valid = false
                this.$emit('times-not-valid', this.error)
                return false
            } else {
                this.error.to = ''
                this.times.to.valid = true
                this.$emit('times-valid', this.error)
                return true
            }
        },

        /**
         * Checks if the school times are valid
         */
        isSchoolValid () {
            if (this.isSchool && this.from < this.$cfg.school.minStartTime) {
                this.error.from = this.$t('forms.availabilityEntry.school.notBeforeSeven', [this.$cfg.school.minStartTime])
                this.times.from.valid = false
                this.$emit('times-not-valid', this.error)
                return false
            } else if (this.isSchool && this.to > this.$cfg.school.maxEndTime) {
                this.error.to = this.$t('forms.availabilityEntry.school.notAfterNineteen', [this.$cfg.school.maxEndTime])
                this.times.to.valid = false
                this.$emit('times-not-valid', this.error)
                return false
            } else {
                this.error.from = ''
                this.error.to = ''
                this.times.from.valid = true
                this.times.to.valid = true
                this.$emit('ok')
                return true
            }
        },

        /**
         * Updates the rounding of the inputs minutes to the nearest interval of 15 minutes (deafult)
         * Use this.rounding prop to change the rounding interval
         */
        updateTimeFromInputFields () {
            if (this.from && this.from.length < 3) {
                this.from = this.$moment().set({ hour: parseInt(this.from), minute: 0 }).shortTime()
            }
            if (this.to && this.to.length < 3) {
                this.to = this.$moment().set({ hour: parseInt(this.to), minute: 0 }).shortTime()
            }
            const roundedFrom = this.$moment().setTime(this.from).nearestMinutes(this.rounding)
            const roundedTo = this.to !== '23:59' ? this.$moment().setTime(this.to).nearestMinutes(this.rounding) : this.$moment().setTime(this.to)
            this.from = roundedFrom.shortTime()
            this.to = roundedTo.shortTime()
            if (this.to === '00:00') {
                this.to = '23:59'
                if (this.overTheNight) this.$emit('equalize-dates')
            } else if (this.from > '23:00' && this.to < this.from && !this.overTheNight) {
                this.to = '23:59'
            }
            this.times.from.hour = roundedFrom.hour()
            this.times.from.minutes = roundedFrom.minute()
            this.times.to.hour = roundedTo.hour()
            this.times.to.minutes = roundedTo.minute()
            if (this.to === '00:00') {
                this.times.to.hour = 23
                this.times.to.minutes = 59
            } else if (this.from > '23:00' && this.to < this.from && !this.overTheNight) {
                this.times.to.hour = 23
                this.times.to.minutes = 59
            }
        },
        /**
         * Updates the inputs so that the time between from and to is logical
         * @param {String} which
         */
        validateInput (which) {
            const from = this.$moment().setTime(this.from)
            let to = this.$moment().setTime(this.to)
            if (this.to === '00:00' || this.to === '24:00') {
                this.to = '23:59'
                to = this.$moment().setTime(this.to)
            }
            if ((which === 'from' && to.isBeforeOrSameTimeAs(from) && !this.overTheNight) || (this.notNull && !this.to && this.from)) {
                // adds 60 minutes to 'this.to' so that the interval is logical
                this.to = from.add(60, 'minutes').shortTime()
            }
            if ((which === 'to' && from.isAfterOrSameTimeAs(to) && !this.overTheNight) || (this.notNull && this.to && !this.from)) {
                // subtracts 60 minutes from 'this.to' and updates the 'this.from' so that the interval is logical
                this.from = to.subtract(60, 'minutes').shortTime()
            }
        },

        async blur (event, which, emitAction) {
            if (which === 'from' && this.times.to.valid) {
                await this.onBlurFrom(event)
            } else if (which === 'to' && this.times.from.valid) {
                await this.onBlurTo(event)
            }
            if (emitAction) {
                if (emitAction !== 'blur') {
                    await this.$refs[which].blur(event)
                }
                this.$emit(emitAction, event)
            }
        },

        focus (e, which) {
            this.$refs[which].select()
            this.$emit('focus', e)
        },
    },
}
</script>

<style lang="scss" scoped>
.time-range {
    display: grid;
    grid-auto-flow: column;
    align-items: center;
    grid-gap: 10px;
}
</style>
