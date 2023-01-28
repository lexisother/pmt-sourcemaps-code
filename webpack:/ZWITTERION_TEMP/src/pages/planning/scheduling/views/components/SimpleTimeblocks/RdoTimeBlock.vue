<template>
    <div
        v-if="showRdo"
        :id="id"
        ref="rdoRequest"
        :style="rdoStyle"
        class="rdo"
        :class="timeBlockClass"
        @mouseenter="hovered = $event"
        @mouseleave="hovered = null"
    >
        <template v-if="isDayView && !IS_MOBILE">
            <div class="start elevation-1">
                <span v-if="duration.asMinutes() > 1440">
                    {{ actualRdoTimes.from.euFormat() }}
                    <span class="">{{ actualRdoTimes.from.shortTime() }}</span>
                </span>
                <span v-else>
                    {{ actualRdoTimes.from.shortTime() }}
                </span>
            </div>
            <div class="end elevation-1">
                <span v-if="duration.asMinutes() > 1440">
                    {{ actualRdoTimes.to.euFormat() }}
                    <span class="">{{ actualRdoTimes.to.shortTime() }}</span>
                </span>
                <span v-else>
                    {{ actualRdoTimes.to.shortTime() }}
                </span>
            </div>
        </template>
        <template v-else>
            <span
                class="icon"
            >
                <UmbrellaBeachOutline
                    :size="16"
                    :class="rdoRequest.status === 'pending' ? 'text-warning' : ''"
                />
            </span>
            <div class="times">
                <div
                    v-if="!settings.compactView"
                    class="times-header"
                >
                    <strong>{{ baseTranslate(`tooltips.rdo.${rdoRequest.status}`) }}</strong>
                </div>
                <span>{{ actualRdoTimes.from.shortTime() }}</span> - <span>{{ actualRdoTimes.to.shortTime() }}</span>
            </div>
        </template>
        <ShiftTooltip
            v-if="hovered"
            ref="shiftTooltip"
            :rdo="rdoRequest"
            :employee="weekPlanningData[rdoRequest.account_id]"
            :event="hovered"
        />
    </div>
</template>

<script>
import mixins from '@/pages/planning/scheduling/resources/mixins'
import schedulingHelper from '@/libraries/schedulingHelper'
import ShiftTooltip from '@/pages/planning/scheduling/components/popovers/ShiftTooltip'
export default {
    name: 'RdoTimeBlock',
    components: { ShiftTooltip },
    mixins: [mixins],
    props: {
        rdoRequest: {
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
        index: {
            type: Number,
            default: 0,
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
            return `rdo_${this.rdoRequest.id}_${this.index}_container`
        },
        rdoStyle () {
            return {
                left: this.rdoLeftPosition + 'px',
                width: this.rdoWidth + 'px',
            }
        },
        rdoLeftPosition () {
            if (!this.isDayView) return 0
            return this.timeBlockLeftPosition({ from: this.rdoTimes.from, timeIntervalStep: this.timeIntervalStep, timeBoxWidth: this.timeBoxWidth })
        },
        rdoWidth () {
            if (!this.isDayView) return '100%'
            let from = this.rdoTimes.from
            let to = this.rdoTimes.to
            if (this.outsideWeek.before) {
                from = this.SELECTED_DATE.clone().startOf('isoWeek')
            }
            if (this.outsideWeek.after) {
                to = this.SELECTED_DATE.clone().endOf('isoWeek').endOf('day')
            }
            if (this.isDayView && this.rdoTimes.from.isBefore(this.SELECTED_DATE.clone(), 'day')) {
                from = this.SELECTED_DATE.clone().startOf('day')
            }
            if (this.isDayView && this.rdoTimes.to.isAfter(this.SELECTED_DATE.clone(), 'day')) {
                to = this.SELECTED_DATE.clone().endOf('day')
            }
            return this.timeBlockWidth({ from, to, timeBoxWidth: this.timeBoxWidth, timeIntervalStep: this.timeIntervalStep })
        },
        rdoTimes () {
            let from = this.actualRdoTimes.from
            let to = this.actualRdoTimes.to
            if (from.apiFormat() < this.SELECTED_DATE.apiFormat()) {
                from = this.SELECTED_DATE.clone().clone()
            }
            if (to.apiFormat() > this.SELECTED_DATE.apiFormat()) {
                to = this.SELECTED_DATE.clone().endOf('isoWeek').setTime(this.rdoRequest.end_time)
            }
            return { from, to }
        },
        actualRdoTimes () {
            const from = this.$moment(this.rdoRequest.start_date).setTime(this.rdoRequest.start_time)
            const to = this.$moment(this.rdoRequest.end_date).setTime(this.rdoRequest.end_time)
            return { from, to }
        },
        showRdo () {
            const pending = this.settings.pendingRdo && this.rdoRequest.status === 'pending'
            const approved = this.settings.approvedRdo && this.rdoRequest.status === 'approved'
            return pending || approved || this.rowSelected
        },
        duration () {
            return schedulingHelper.rdoDuration(this.rdoRequest)
        },
        timeBlockClass () {
            const result = [
                this.rdoRequest.status,
            ]
            if (!this.isDayView) {
                result.push('week-block')
            }
            if (this.settings.compactView) {
                result.push('compact')
            }
            return result
        },
        outsideWeek () {
            const currentWeek = this.SELECTED_DATE.clone().isoWeek()
            return {
                before: this.rdoTimes.from.isoWeek() < currentWeek,
                after: this.rdoTimes.to.isoWeek() > currentWeek,
            }
        },
    },
}
</script>

<style lang="scss" scoped>
@import './style.scss';
</style>
