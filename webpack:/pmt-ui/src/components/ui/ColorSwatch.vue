<template>
    <div
        class="color-swatch-outer"
        :class="{ selected, selectable }"
        @click="$emit('change', color)"
    >
        <div
            class="color-swatch-inner"
            :style="{ background: color }"
        />
    </div>
</template>

<script>
export default {
    props: {
        color: {
            type: String,
            default: null,
        },
        selected: {
            type: Boolean,
            default: false,
        },
        selectable: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';

    .color-swatch-outer {
        width: 24px;
        height: 24px;
        border: 1px solid transparent;
        border-radius: 50%;

        &.selectable {
            cursor: pointer;

            &:hover {
                border-color: rgba($dark-gray, 0.25);
                transition: all 0.25s;
            }
        }

        &.selected, &.selected:hover {
            border-color: $dark-gray;
        }

        .color-swatch-inner {
            width: 16px;
            height: 16px;
            margin: 3px;
            border-radius: 50%;
            background: $disabled-background-color;
        }
    }
</style>
