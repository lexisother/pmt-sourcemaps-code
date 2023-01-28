<template>
    <transition
        v-if="show"
        name="error"
    >
        <div
            class="error"
            :class="colorClass"
        >
            <slot />
        </div>
    </transition>
</template>

<script>
export default {
    name: 'Error',
    props: {
        show: {
            type: Boolean,
            default: false,
        },
        colorClass: {
            type: String,
            default: 'text-error',
        },
    },
}
</script>

<style lang="scss" scoped>
    @import '@/assets/scss/_colors.scss';
    .error {
        padding: 5px 10px;
        background-color: transparent !important;
        border: 1px solid $fail-color !important;
        border-radius: 3px;
        + .error {
            margin-top: 10px;
        }
    }

    .error-enter {
        opacity: 0;
    }

    .error-enter-active {
        transition: opacity .5s;
    }

    .error-leave-active {
        transition: opacity .5s;
        opacity: 0;
    }
</style>
