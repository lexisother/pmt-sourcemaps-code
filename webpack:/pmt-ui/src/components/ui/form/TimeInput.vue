<template>
    <div
        v-tooltip="tooltip"
        :class="{ 'form-field': formField, ...elementClass }"
    >
        <PInput
            :id="`${id}-time-input`"
            ref="input"
            v-model="time"
            :cy_id="`${id}-time-input`"
            :name="name"
            :label="label"
            :placeholder="$t( 'components.timeRangeInput.fromField.placeholder' )"
            :disabled="disabled"
            :autofocus="autofocus"
            :autoselect="autoSelect"
            :center="center"
            :readonly="readonly"
            :input-style="inputStyle"
            class="time-input"
            :danger="isInvalid || danger"
            @blur="onBlur($event)"
            @input="onInput($event)"
            @enter-click="$emit('enter', $event)"
            @focus="$emit('focus', $event)"
            @esc-click="$emit('esc-click', $event)"
        />
    </div>
</template>

<script>
import timeHelper from '@/libraries/timeHelper'

export default {
    props: {
        id: {
            type: [String, Number],
            default: null,
        },
        name: {
            type: String,
            default: 'time-input',
        },
        label: {
            type: String,
            default: '',
        },
        rounding: {
            type: Number,
            default: 15,
        },
        value: {
            type: String,
            default: '00:00',
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        readonly: {
            type: Boolean,
            default: false,
        },
        danger: {
            type: Boolean,
            default: false,
        },
        autofocus: {
            type: Boolean,
            default: false,
        },
        autoSelect: {
            type: Boolean,
            default: false,
        },
        filled: {
            type: Boolean,
            default: true,
        },
        center: {
            type: Boolean,
            default: true,
        },
        elementClass: {
            type: [Object, Array, String],
            default: '',
        },
        inputStyle: {
            type: [Object, Array, String],
            default: '',
        },
        minValue: {
            type: String,
            default: '00:00',
        },
        isInvalid: {
            type: Boolean,
            dfeault: false,
        },
        inline: {
            type: Boolean,
            default: false,
        },
        paddingAmount: {
            type: Number,
            default: 1,
        },
        formField: {
            type: Boolean,
            default: true,
        },
        tooltip: {
            type: [String, Object],
            default: '',
        },
    },
    data () {
        return {
            time: '00:00',
        }
    },
    computed: {
        containerClass () {
            const cClass = {
                'd-inline-block': this.inline,
            }
            if (this.paddingAmount > 0) {
                cClass[`pa-${this.paddingAmount}`] = true
            }
            return cClass
        },
    },
    watch: {
        value: {
            async handler (newVal) {
                await this.setTime(newVal)
            },
        },
    },
    created () {
        if (this.value) {
            this.setTime(this.value)
        }
    },
    methods: {
        async onBlur () {
            await this.setTime(this.time)
            this.$emit('blur', this.time)
        },
        onInput (time) {
            this.time = timeHelper.formatTimeFromString(time, false)
            this.$emit('input', this.time)
        },
        async setTime (timeStr) {
            if (timeStr.length < 3) {
                timeStr = this.$moment().set({ hour: Number(timeStr), minute: 0 }).shortTime()
            }
            const rounded = this.$moment().setTime(timeStr).nearestMinutes(this.rounding)
            this.time = rounded.shortTime()
            await this.checkMinValue()
            this.$emit('input', this.time)
        },
        async checkMinValue () {
            if (this.time < this.minValue) {
                this.time = this.minValue
                this.$emit('min-value-error')
            } else {
                this.$emit('min-value-valid')
            }
        },
    },
}
</script>
