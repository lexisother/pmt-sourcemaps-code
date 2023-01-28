<template>
    <ul class="time-blocks-list">
        <pmt-time-block
            v-for="timeBlock in timeBlocks"
            :key="timeBlock.id + timeBlock.accountId + timeBlock.timeFrom + timeBlock.timeTo + timeBlock.type + timeBlock.travel.before + timeBlock.travel.after + $route.path"
            ref="timeBlock"
            :cy-id="`${timeBlock.accountId}-${$moment(timeBlock.date).format('DD-MM-YYYY')}-${timeBlock.timeFrom}`"
            :time-block="timeBlock"
            :travel-before-style="getTravelBeforeStyle"
            :travel-after-style="getTravelAfterStyle"
            :time-block-classes="getTimeBlockClassList"
            :time-block-style="getTimeBlockStyle"
            :is-new-weekset="isNewWeekset"
            :overlaps-with-timeblock="isStartOverlapping(timeBlock)"
            @on-click="$emit('on-click', {timeBlock, event: $event})"
            @block-hover="$emit('block-hover', {startTime: timeBlock.timeFrom, endTime: timeBlock.timeTo, date: $moment(timeBlock.date)})"
        />
    </ul>
</template>

<script>
import timeBlockHelper from '@/libraries/timeBlockHelper'
import timeHelper from '@/libraries/timeHelper'
import TimeBlock from './TimeBlock.vue'
export default {
    components: {
        'pmt-time-block': TimeBlock,
    },
    props: {
        timeBlocks: {
            type: Array,
            required: true,
        },
        startTime: {
            type: String,
            required: true,
        },
        endTime: {
            type: String,
            required: true,
        },
        rowHeight: {
            type: Number,
            required: true,
        },
        step: {
            type: Number,
            required: true,
        },
        width: {
            type: Number,
        },
        marginFunction: {
            type: Function,
        },
        isNewWeekset: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        isStartOverlapping (timeBlock) {
            const result = this.timeBlocks.find(element => element.id !== timeBlock.id ? element.timeFrom === timeBlock.timeFrom && element.repeat : false)
            return typeof result === 'object'
        },
        getClippedTimeBlock (timeBlock) {
            const newTimeBlock = timeBlockHelper.cloneTimeBlock(timeBlock, timeBlock.date)

            // make sure that travel times aren't overflowing the range
            if (timeBlock.travel) {
                const timeBlockTimes = timeBlockHelper.getTimeBlockStartStopTimes(newTimeBlock)
                const moment = this.$moment()
                if (moment.clone().setTime(timeBlockTimes.start).isBefore(moment.clone().setTime(this.startTime))) {
                    newTimeBlock.travel.before = timeHelper.subtractTimeStrings(newTimeBlock.timeFrom, this.startTime)
                }
                if (moment.clone().setTime(timeBlockTimes.end).isAfter(moment.clone().setTime(this.endTime))) {
                    newTimeBlock.travel.before = timeHelper.subtractTimeStrings(newTimeBlock.timeFrom, this.startTime)
                }
            }
            return newTimeBlock
        },
        getTravelBeforeStyle (timeBlock) {
            return timeBlockHelper.getTravelBeforeStyle(this.getClippedTimeBlock(timeBlock), this.rowHeight, this.step)
        },
        getTravelAfterStyle (timeBlock) {
            return timeBlockHelper.getTravelAfterStyle(this.getClippedTimeBlock(timeBlock), this.rowHeight, this.step)
        },
        getTimeBlockClassList (timeBlock) {
            const timeBlockTimes = timeBlockHelper.getTimeBlockStartStopTimes(timeBlock)
            const duration = timeHelper.getDuration(timeBlock.timeFrom, timeBlock.timeTo)
            const classList = {
                'start-out-of-range': !this.$moment().isTimeInRange(timeBlock.timeFrom, this.startTime, this.endTime),
                'end-out-of-range': !this.$moment().isTimeInRange(timeBlock.timeTo, this.startTime, this.endTime),
                'quarter-for': duration <= 45 && duration > 30,
                'half-hour': duration <= 30 && duration > 15,
                quarter: duration <= 15,
                'travel-before-out-of-range': !this.$moment().isTimeInRange(timeBlockTimes.start, this.startTime, this.endTime),
                'travel-after-out-of-range': !this.$moment().isTimeInRange(timeBlockTimes.end, this.startTime, this.endTime),
                editing: !typeof timeBlock !== undefined ? timeBlock.editing : false,
            }
            return classList
        },
        getTimeBlockStyle (timeBlock) {
            if (!timeBlockHelper.isTimeBlockInRange(timeBlock, this.startTime, this.endTime)) {
                timeBlock = timeBlockHelper.convertToMaxRangeTimeBlock(timeBlock, this.startTime, this.endTime)
            }
            const style = {
                height: timeBlockHelper.getTimeBlockHeight(timeBlock.timeFrom, timeBlock.timeTo, this.rowHeight, this.step) - 6 + 'px', // added -5px in order to have the same margin as on top
                top: timeBlockHelper.getTimeBlockCssTopPosition(timeBlock.timeFrom, this.startTime, this.rowHeight, this.step),
            }
            if (this.width > 0) {
                style.width = this.width + 'px'
            }
            if (timeBlock.editable) {
                style.zIndex = 2
            }
            if (timeBlock.editing) {
                style.boxShaddow = '0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12), 0 3px 5px -1px rgba(0, 0, 0, 0.2)'
            }
            return style
        },
    },
}
</script>

<style lang="scss" scoped>
    .time-blocks .time-block {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1;
    }
</style>

<style lang="scss">
    .time-blocks {
        .time-block.half-hour {
            .time-block-info {
                margin-top: -3px;
            }

            time {
                display: none !important;
            }

            .time-block-options {
                bottom: 6px;
            }
        }

        .time-block.quarter {
            .time-block-info {
                display: block;
                margin-top: -6px;
            }

            time {
                display: none !important;
            }

            .time-block-options {
                bottom: 6px;
            }

            .time-block-edit-icon {
                top: 1px;
            }
        }

        .time-block.quarter-for {
            .time-block-info {
                display: block;
                margin-top: -4px;
            }
        }
    }
</style>
