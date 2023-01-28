<template>
    <div class="hours-switch">
        <button
            v-ripple
            :class="{active: !value}"
            @click="$emit('switch', false)"
        >
            {{ $t('ui.singles.days').toLowerCase() }}
        </button>
        <button
            v-ripple
            :class="{active: value}"
            @click="$emit('switch', true)"
        >
            {{ $t('ui.singles.hours').toLowerCase() }}
        </button>
    </div>
</template>

<script>
export default {
    name: 'LeaveSplitHoursButtonGroup',
    props: {
        value: Boolean,
    },
}
</script>

<style lang="scss" scoped>
.hours-switch {
    display: inline-grid;
    grid-auto-flow: column;
    align-items: center;
    justify-content: start;
    font-size: 11px;
    color: currentColor;

    button {
        padding: 5px;
        border: 1px solid var(--grey-40);
        min-width: 50px;
        transition: all .1s ease-in-out;

        &:first-of-type {
            border-right-color: transparent;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
        }

        &:last-of-type {
            border-left-color: transparent;
            border-top-right-radius: 3px;
            border-bottom-right-radius: 3px;
        }

        &.active {
            border-color: var(--primary-color);
            background-color: var(--primary-color);
            color: white;
        }

        &:active:not(.active) {
            background-color: var(--grey-20);
        }
    }
}
</style>
