<template>
    <VMenu
        ref="tooltipMenu"
        :value="show"
        :origin="origin"
        :transition="transition"
        :position-x="x"
        :position-y="y"
        :nudge-top="nudgeTop"
        :nudge-bottom="nudgeBottom"
        :nudge-width="nudgeWidth"
        :max-width="maxWidth"
        :content-class="contentClass"
        :attach="attach"
        :offset-y="offsetY"
        :offset-x="offsetX"
        offset-overflow
        :close-on-click="closeOnClick"
        :close-on-content-click="closeOnContentClick"
        :absolute="absolute"
        @input="$emit('input', $event)"
    >
        <slot name="default" />
    </VMenu>
</template>

<script>
export default {
    name: 'MenuTooltip',
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        x: {
            type: [String, Number],
            default: 0,
        },
        y: {
            type: [String, Number],
            default: 0,
        },
        nudgeWidth: {
            type: [String, Number],
            default: 100,
        },
        nudgeTop: {
            type: [String, Number],
            default: 0,
        },
        nudgeBottom: {
            type: [String, Number],
            default: 0,
        },
        maxWidth: {
            type: [String, Number],
            default: 450,
        },
        origin: {
            type: String,
            default: 'bottom left',
        },
        contentClass: {
            type: String,
            default: 'elevation-2',
        },
        transition: {
            type: String,
            default: 'scale-transition',
        },
        attach: {
            type: String,
            default: undefined,
        },
        offsetX: Boolean,
        offsetY: Boolean,
        closeOnClick: {
            type: Boolean,
            default: true,
        },
        closeOnContentClick: {
            type: Boolean,
            default: true,
        },
        absolute: Boolean,
    },
}
</script>
