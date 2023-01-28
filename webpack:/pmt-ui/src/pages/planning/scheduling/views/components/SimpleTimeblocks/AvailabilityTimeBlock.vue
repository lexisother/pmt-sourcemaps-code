<template>
    <div
        v-if="showAvailability"
        :id="id"
        ref="availability"
        :style="availabilityStyle"
        class="availability"
        :class="timeBlockClass"
        @mouseenter="hovered = $event"
        @mouseleave="hovered = null"
    >
        <template v-if="isDayView && !IS_MOBILE">
            <!--
                Hide labels when availability is 1 hour or lower.
                The full info will still show up in the tooltip
            -->
            <template v-if="availabilityTimes.duration.asHours() > 1">
                <div class="start elevation-1">
                    <span>{{ availabilityTimes.from.shortTime() }}</span>
                </div>
                <div class="end elevation-1">
                    <span>{{ availabilityTimes.to.shortTime() }}</span>
                </div>
            </template>
        </template>
        <template v-else>
            <span
                class="icon"
            >
                <component
                    :is="iconAndColor.icon"
                    :class="iconAndColor.color"
                    :size="16"
                />
            </span>
            <div class="times">
                <div v-if="!settings.compactView">
                    <strong>{{ $t(`components.timeBlock.types.${availability.type}`) }}</strong>
                </div>
                <span>{{ availabilityTimes.from.shortTime() }}</span> - <span class="">{{ availabilityTimes.to.shortTime() }}</span>
            </div>
        </template>
        <ShiftTooltip
            v-if="hovered"
            ref="shiftTooltip"
            :availability="availability"
            :employee="weekPlanningData[availability.account_id]"
            :event="hovered"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
import availabilityHelper from '@/libraries/availabilityHelper'
import ShiftTooltip from '@/pages/planning/scheduling/components/popovers/ShiftTooltip'
export default {
    name: 'AvailabilityTimeBlock',
    components: { ShiftTooltip },
    mixins: [mixins],
    props: {
        availability: {
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
        tabindex: {
            type: Number,
            default: 0,
        },
        rowSelected: {
            type: Boolean,
            default: false,
        },
    },
    data () {
        return {
            hovered: null,
        }
    },
    computed: {
        id () {
            return `availability_${this.availability.availability_id}_container`
        },
        availabilityStyle () {
            return {
                left: this.availabilityLeftPosition + 'px',
                width: this.availabilityWidth + 'px',
            }
        },
        availabilityLeftPosition () {
            if (!this.isDayView) return 0
            return this.timeBlockLeftPosition({ from: this.availabilityTimes.from, timeIntervalStep: this.timeIntervalStep, timeBoxWidth: this.timeBoxWidth })
        },
        availabilityWidth () {
            if (!this.isDayView) return '100%'
            return this.timeBlockWidth({
                from: this.availabilityTimes.from,
                to: this.availabilityTimes.to,
                timeBoxWidth: this.timeBoxWidth,
                timeIntervalStep: this.timeIntervalStep,
            })
        },
        availabilityTimes () {
            return schedulingHelper.availabilityTimes(this.availability, this.SELECTED_DATE)
        },
        showAvailability () {
            const isAvailable = this.availability.type === 'preferred' || this.availability.type === 'agreed'
            const showAvailable = isAvailable && (this.settings.availabilities || this.rowSelected)
            const showUnavailable = !isAvailable && (this.settings.nonAvailabilities || this.rowSelected)
            return showAvailable || showUnavailable
        },
        timeBlockClass () {
            const result = [
                this.availability.type,
            ]
            if (!this.isDayView) {
                result.push('week-block')
            }
            if (this.settings.compactView) {
                result.push('compact')
            }
            return result
        },
        iconAndColor () {
            return availabilityHelper.availabilityIcon(this.availability)
        },
    },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
