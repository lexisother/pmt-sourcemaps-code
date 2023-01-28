<template>
    <div class="justify-content-start w-100">
        <div class="pa-1 d-inline-block w-50">
            <div class="form-field w-100">
                <label :class="{required}">{{ $t('components.timeRangeInput.fromField.label') }}</label>
                <TimePicker
                    ref="timePickerFrom"
                    :allowed-hours="allowedHoursFrom"
                    :allowed-minutes="allowedMinutesFrom"
                    :selected-time="time.from"
                    :v-model="time.from"
                    :label="time.from"
                    :show-clock-icon="showClockIcon"
                    :disabled="disabled"
                    v-bind="$attrs"
                    @hour-click="setPickerTime('hour-from', $event)"
                    @minute-click="setPickerTime('minute-from', $event)"
                />
            </div>
        </div>
        <div class="pa-1 d-inline-block w-50">
            <div class="form-field w-100">
                <label :class="{required}">{{ $t('components.timeRangeInput.toField.label') }}</label>
                <TimePicker
                    ref="timePickerTo"
                    :allowed-hours="allowedHoursTo"
                    :allowed-minutes="allowedMinutesTo"
                    :selected-time="time.to"
                    :v-model="time.to"
                    :label="time.to"
                    :show-clock-icon="showClockIcon"
                    :disabled="disabled"
                    v-bind="$attrs"
                    @hour-click="setPickerTime('hour-to', $event)"
                    @minute-click="setPickerTime('minute-to', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script>
import TimePicker from '@/components/ui/pickers/TimePicker.vue'
export default {
    name: 'TimeRangePicker',
    components: {
        TimePicker,
    },
    props: {
        disabled: {
            type: Boolean,
            default: false,
        },
        isSchool: {
            type: Boolean,
            default: false,
        },
        time: {
            type: Object,
            default: () => {
                return {
                    from: this.$moment().shortTime().split(':')[0] + ':00',
                    to: this.$moment().shortTime().split(':')[0] + ':00',
                }
            },
        },
        allowedHoursFrom: {
            type: Array,
            default: () => [...Array(24).keys()],
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
            default: () => [0, 15, 30, 45],
        },
        showClockIcon: {
            type: Boolean,
            default: false,
        },
        id: {
            type: String,
            default: 'time-range-picker',
        },
        required: Boolean,
    },
    computed: {
        isRangeOpen () {
            return this.$refs.timePickerFrom.isOpen || this.$refs.timePickerTo.isOpen
        },
    },
    methods: {
        openTimeFrom (event) {
            this.$refs.timePickerFrom.open(event.target)
        },
        openTimeTo (event) {
            this.$refs.timePickerTo.open(event.target)
        },
        setPickerTime (what, event) {
            let time, result, hours, minutes
            switch (what) {
                case 'hour-from':
                    minutes = this.$moment(this.time.from, 'HH:mm').minutes()
                    time = this.$moment().clone().set({ h: event, m: minutes }).shortTime()
                    result = { from: time, to: this.time.to }
                    break
                case 'minute-from':
                    hours = this.$moment(this.time.from, 'HH:mm').hours()
                    time = this.$moment().clone().set({ h: hours, m: event }).shortTime()
                    result = { from: time, to: this.time.to }
                    break
                case 'hour-to':
                    minutes = this.$moment(this.time.to, 'HH:mm').minutes()
                    time = this.$moment().clone().set({ h: event, m: minutes }).shortTime()
                    result = { from: this.time.from, to: time }
                    break
                case 'minute-to':
                    hours = this.$moment(this.time.to, 'HH:mm').hours()
                    time = this.$moment().clone().set({ h: hours, m: event }).shortTime()
                    result = { from: this.time.from, to: time }
                    break
            }
            this.$emit(`${what}-click`, time)
            this.$emit('time-set', result)
        },
    },
}
</script>
