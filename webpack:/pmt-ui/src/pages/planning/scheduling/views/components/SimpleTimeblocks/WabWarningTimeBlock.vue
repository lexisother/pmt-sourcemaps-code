<template>
    <div
        v-if="showWab"
        class="wab-warnings"
        :style="wabStyle"
    />
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'WabWarningTimeBlock',
    mixins: [mixins],
    props: {
        warnings: {
            type: Object,
            required: true,
        },
        timeBoxWidth: {
            type: Number,
            default: 50,
        },
        timeIntervalStep: {
            type: Number,
            default: 60,
        },
        rowSelected: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        wabStyle () {
            return {
                left: this.wabLeftPosition + 'px',
                width: this.wabWidth + 'px',
            }
        },
        wabLeftPosition () {
            return this.timeBlockLeftPosition({ from: this.warnings.from, timeIntervalStep: this.timeIntervalStep, timeBoxWidth: this.timeBoxWidth })
        },
        wabWidth () {
            return this.timeBlockWidth({
                from: this.warnings.from,
                to: this.warnings.to,
                timeBoxWidth: this.timeBoxWidth,
                timeIntervalStep: this.timeIntervalStep,
            })
        },
        showWab () {
            return this.warnings && (this.rowSelected || this.settings.wabWarnings)
        },
    },
}
</script>

<style lang="scss" scoped>
.wab-warnings {
    background-color: var(--wab-warning-background);
    height: 100%;
    position: absolute;
    z-index: 0;
    pointer-events: none;
    top: 0;
}
</style>
