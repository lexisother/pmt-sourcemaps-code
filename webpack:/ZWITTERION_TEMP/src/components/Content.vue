<template>
    <div
        class="content"
        :class="{ 'narrow': narrow, 'narrow-wide': narrowWide, 'narrow-side': narrowSide, custom: customClass }"
    >
        <slot />
    </div>
</template>

<script>
export default {
    name: 'PmtContent',
    props: {
        narrow: {
            type: Boolean,
            default: false,
        },
        narrowWide: {
            type: Boolean,
            default: false,
        },
        narrowSide: {
            type: Boolean,
            default: false,
        },
        customClass: {
            type: Boolean,
            default: false,
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '../assets/scss/_colors.scss';

    .content {
        margin-left: auto;
        margin-right: auto;
        width: 100%;
        box-sizing: border-box;
        &.narrow {
            margin: 0 auto;
            max-width: 1280px;
        }
        &.narrow-wide {
            margin: 0 auto;
            max-width: 1400px;
        }
        &.narrow-side {
            padding: 0px 25px;
            margin: 0 auto;
            max-width: 900px;
        }

        .panel:not(:last-child) {
            margin-bottom: 2rem;
        }

        .panel {
            padding: 25px;
        }

        .line-heading {
            margin:  0 0 30px;
            padding-bottom: .3em;

            text-transform: uppercase;
            font-weight: 400;
            font-size: 1.3rem;

            border-bottom: 1px solid $heading-border-color;

            &:not(:first-child) {
                margin-top: 40px;
            }

            .button.small {
                float: right;

                margin-top: 4px;
            }
        }
        &.custom {
            max-width: 90% !important;
        }
    }
</style>
