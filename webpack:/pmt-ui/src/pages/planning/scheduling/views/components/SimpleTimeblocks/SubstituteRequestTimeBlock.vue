<template>
    <div
        v-if="showApprovedSubstituteRequests"
        :id="`substitute-request_${substituteRequest.id}_container`"
        ref="substituteRequest"
        :style="substituteRequestStyle"
        class="approved-substitute-request"
        :class="timeBlockClass"
        @mouseenter="hovered = $event"
        @mouseleave="hovered = null"
    >
        <template v-if="isDayView && !IS_MOBILE">
            <div class="start elevation-1">
                <span>{{ substituteRequestTimes.from.shortTime() }}</span>
            </div>
            <div class="end elevation-1">
                <span>{{ substituteRequestTimes.to.shortTime() }}</span>
            </div>
        </template>
        <template v-else>
            <span
                class="icon"
            >
                <AccountSwitch
                    :size="16"
                />
            </span>
            <div class="times">
                <div
                    v-if="!settings.compactView"
                    class="times-header"
                >
                    <strong v-if="substituteRequest.status === 'approved'">
                        {{ baseTranslate(`tooltips.approvedSubstituteRequest`) }}
                    </strong>
                    <strong v-else>
                        {{ baseTranslate('substituteRequests.substituteRequest') }}
                    </strong>
                </div>
                <span>{{ substituteRequestTimes.from.shortTime() }}</span> - <span>{{ substituteRequestTimes.to.shortTime() }}</span>
            </div>
        </template>
        <ShiftTooltip
            v-if="hovered"
            ref="shiftTooltip"
            :ssr="substituteRequest"
            :employee="weekPlanningData[substituteRequest.requester_id]"
            :event="hovered"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import ShiftTooltip from '@/pages/planning/scheduling/components/popovers/ShiftTooltip'
export default {
    name: 'SubstituteRequestTimeBlock',
    components: { ShiftTooltip },
    mixins: [mixins],
    props: {
        substituteRequest: {
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
        startDate () {
            return this.SELECTED_DATE.clone().startOf('isoWeek')
        },
        substituteRequestStyle () {
            return {
                left: this.substituteRequestLeftPosition + 'px',
                width: this.substituteRequestWidth + 'px',
            }
        },
        substituteRequestLeftPosition () {
            if (!this.isDayView) return 0
            return this.timeBlockLeftPosition({ from: this.substituteRequestTimes.from, timeIntervalStep: this.timeIntervalStep, timeBoxWidth: this.timeBoxWidth })
        },
        substituteRequestWidth () {
            if (!this.isDayView) return '100%'
            return this.timeBlockWidth({
                from: this.substituteRequestTimes.from,
                to: this.substituteRequestTimes.to,
                timeBoxWidth: this.timeBoxWidth,
                timeIntervalStep: this.timeIntervalStep,
            })
        },
        substituteRequestTimes () {
            const from = this.$moment(this.substituteRequest.schedule_time_from)
            const to = this.$moment(this.substituteRequest.schedule_time_to)
            return { from, to }
        },
        showApprovedSubstituteRequests () {
            return this.settings.approvedSubstituteRequests || this.rowSelected
        },
        timeBlockClass () {
            const result = [
                this.substituteRequest.status,
            ]
            if (!this.isDayView) {
                result.push('week-block')
            }
            if (this.settings.compactView) {
                result.push('compact')
            }
            return result
        },
    },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
