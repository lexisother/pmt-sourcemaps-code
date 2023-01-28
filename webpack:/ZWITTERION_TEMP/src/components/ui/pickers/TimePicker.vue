<template>
    <VMenu
        ref="dropdownMenu"
        v-model="menu"
        :close-on-click="true"
        :close-on-content-click="false"
        @click="menu = !menu"
    >
        <template #activator="{ on }">
            <PmtButton
                v-ripple
                default
                v-bind="$attrs"
                block
                no-margin
                outline
                :disabled="disabled"
                v-on="on"
            >
                <clock-outline
                    v-if="showClockIcon"
                    class="mr-1 float-left text-primary"
                    :size="19"
                />
                <span class="label float-left">{{ time }} </span>
                <component
                    :is="menu ? 'chevron-up' : 'chevron-down'"
                    :size="18"
                    class="arrow-icon float-right"
                />
            </PmtButton>
        </template>
        <VTimePicker
            id="timepicker"
            :key="menu"
            ref="vuetifyTimePicker"
            v-model="time"
            format="24hr"
            :disabled="disabled"
            :allowed-hours="allowedHours"
            :allowed-minutes="allowedMinutes"
            @click:hour="hourClick"
            @click:minute="minuteClick"
        />
    </VMenu>
</template>

<script>
export default {
    name: 'TimePicker',
    props: {
        allowedHours: {
            type: Array,
            default: () => ([]),
        },
        allowedMinutes: {
            type: Array,
            default: () => ([]),
        },
        selectedTime: {
            type: String,
            default: '',
        },
        showClockIcon: Boolean,
        label: {
            type: String,
            default: '',
        },
        disabled: {
            type: Boolean,
            default: true,
        },
    },
    data () {
        return {
            menu: false,
        }
    },
    computed: {
        time: {
            get () {
                return this.selectedTime
            },
            set (newValue) {
                this.$emit('save', newValue)
            },
        },
        isOpen () {
            return this.menu
        },
    },
    methods: {
        hourClick (event) {
            this.$emit('hour-click', event)
        },
        minuteClick (event) {
            this.$emit('minute-click', event)
            this.close()
        },
        open () {
            this.menu = true
        },
        close (event) {
            this.menu = false
        },
    },
}
</script>
