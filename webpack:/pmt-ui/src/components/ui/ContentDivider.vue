<template>
    <div
        class="content-divider"
        :class="$attrs"
        v-bind="$attrs"
    >
        {{ text }}
        <slot />
    </div>
</template>

<script>
export default {
    name: 'ContentDivider',
    props: {
        text: {
            type: String,
            default: '',
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    $dividers: (
        primary-divider: ($primary-color),
        secondary-divider: ($secondary-color),
        success-divider: ($success-color),
        warning-divider: ($pending-color),
        danger-divider: ($fail-color),
        default-divider: ($default-gray)
    );
    $divider-gaps: (
        small-gap: (1),
        normal-gap: (2),
        big-gap: (4),
        huge-gap: (8)
    );
    .content-divider {
        display: flex;
        align-items: center;
        --content-divider-gap: 1rem;
        font-weight: 600;
        @each $gap, $sizes in $divider-gaps {
            $size: nth($sizes, 1);
            &.#{$gap} {
                --content-divider-gap: #{$size}rem;
            }
        }
        @each $name, $colors in $dividers {
            $fontcolor: nth($colors, 1);
            &.#{$name} {
                color: $fontcolor;
                &::after, &::before {
                    background-color: $fontcolor;
                }
            }
        }
        &::before, &::after {
            content: '';
            height: 1px;
            background-color: silver;
            flex-grow: 1;
        }
        &::before {
            margin-right: var(--content-divider-gap);
        }
        &::after {
            margin-left: var(--content-divider-gap);
        }
    }
</style>
