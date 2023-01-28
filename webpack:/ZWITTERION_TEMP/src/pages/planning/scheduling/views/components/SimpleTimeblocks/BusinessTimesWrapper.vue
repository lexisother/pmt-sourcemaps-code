<template>
    <div
        v-if="showBusinessTimes"
        class="business-times-container"
    >
        <div
            class="planning-grid-row"
            :class="{'has-totals': settings.employeeTotals }"
            style="min-height: 100%;"
        >
            <div class="left-side" />
            <div class="center">
                <div class="business-times">
                    <div
                        class="from"
                        :style="startStyle"
                    />
                    <div
                        class="to"
                        :style="endStyle"
                    />
                </div>
            </div>
            <div class="right-side" />
        </div>
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
export default {
    name: 'BusinessTimesWrapper',
    mixins: [mixins],
    props: {
        timeBoxWidth: {
            type: Number,
            default: 50,
        },
        timeIntervalStep: {
            type: Number,
            default: 60,
        },
    },
    computed: {
        showBusinessTimes () {
            return this.businessTimes.start.to.shortTime() !== '00:00' && this.businessTimes.end.from.shortTime() !== '00:00'
        },
        currentDate () {
            return this.SELECTED_DATE.clone()
        },
        times () {
            return this.weekBusinessTimes.store_availability[Number(this.currentDate.isoWeekday() - 1)]
        },
        businessTimes () {
            if (this.weekBusinessTimes && this.weekBusinessTimes.store_availability) {
                return {
                    start: {
                        from: this.currentDate.clone().startOf('day'),
                        to: this.currentDate.clone().setTime(this.times.business_from_time),
                    },
                    end: {
                        from: this.currentDate.clone().setTime(this.times.business_to_time),
                        to: this.currentDate.clone().setTime('23:59:59'),
                    },
                }
            }
            return null
        },
        startStyle () {
            return {
                left: '0',
                width: this.startWidth + 'px',
                backgroundColor: this.$helpers.transparentize(this.variableToHexcode('--grey-20'), 70),
            }
        },
        endStyle () {
            return {
                left: this.endLeftPosition + 'px',
                width: this.endWidth + 'px',
                backgroundColor: this.$helpers.transparentize(this.variableToHexcode('--grey-20'), 70),
            }
        },
        endLeftPosition () {
            if (!this.businessTimes || !this.businessTimes.end) return 0
            return this.timeBlockLeftPosition({ from: this.businessTimes.end.from, timeIntervalStep: this.timeIntervalStep, timeBoxWidth: this.timeBoxWidth })
        },
        startWidth () {
            if (!this.businessTimes || !this.businessTimes.start) return 0
            return this.timeBlockWidth({
                from: this.businessTimes.start.from,
                to: this.businessTimes.start.to,
                timeBoxWidth: this.timeBoxWidth,
                timeIntervalStep: this.timeIntervalStep,
            })
        },
        endWidth () {
            if (!this.businessTimes || !this.businessTimes.start) return 0
            return this.timeBlockWidth({
                from: this.businessTimes.end.from,
                to: this.businessTimes.end.to,
                timeBoxWidth: this.timeBoxWidth,
                timeIntervalStep: this.timeIntervalStep,
            })
        },
    },
}
</script>

<style lang="scss" scoped>
.business-times-container {
    position: absolute;
    width: 100%;
    height: 100%;
    .business-times {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        .from, .to {
            position: absolute;
            top: 0;
            bottom: 0;
            &.to {
                right: var(--employee-totals-width);
            }
        }
    }
}
</style>
