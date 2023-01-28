<template>
    <v-popover
        :trigger="trigger"
        :open="isOpen"
        :offset="offset.toString()"
        :auto-hide="autohide"
        @apply-hide="$emit('hide')"
    >
        <pmt-button
            ref="activator"
            custom-class="tooltip-target b1"
            v-bind="$attrs"
            :icon="icon"
            :loading="loading"
            :icon-size="iconSize"
            :disabled="disabled"
            @mouseover="$emit('mouseover')"
            @mouseout="$emit('mouseout')"
            @click="$emit('click')"
        >
            <span v-if="text !== ''">
                {{ text }}
            </span>
        </pmt-button>
        <template slot="popover">
            <slot name="popover-content" />
        </template>
    </v-popover>
</template>

<script>
export default {
    name: 'PopoverButton',
    props: {
        buttonClass: {
            type: String,
            default: '',
        },
        trigger: {
            type: String,
            default: 'manual',
        },
        isOpen: {
            type: Boolean,
            default: false,
        },
        offset: {
            type: [String, Number],
            default: '16',
        },
        autohide: {
            type: Boolean,
            default: true,
        },
        disabled: {
            type: Boolean,
            default: false,
        },
        loading: {
            type: Boolean,
            default: false,
        },
        text: {
            type: String,
            default: '',
        },
        icon: {
            type: String,
            default: '',
        },
        iconSize: {
            type: [String, Number],
            default: 15,
        },
        iconFillColor: {
            type: String,
        },
    },
}
</script>
